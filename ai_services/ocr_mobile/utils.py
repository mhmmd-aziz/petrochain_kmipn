import re
import cv2
import easyocr
import logging
from ultralytics import YOLO
import qrcode
import os
import time

logger = logging.getLogger(__name__)

# Constants
OCR_LANGUAGES = ['id', 'en']
OCR_GPU = True
PLATE_PATTERN = r"^[A-Z]{1,2}\s\d{1,4}\s[A-Z]{1,3}$"
YOLO_MODEL_PATH = "models/plate_detector.pt"

# Keywords for STNK document validation — full phrases AND short fragments (for OCR noise tolerance)
STNK_KEYWORDS = [
    # Full phrases
    "SURAT TANDA NOMOR KENDARAAN",
    "KENDARAAN BERMOTOR",
    "KEPOLISIAN NEGARA",
    "NOMOR REGISTRASI",
    "VEHICLE REGISTRATION",
    "BERLAKU SAMPAI",
    "NOMOR RANGKA",
    "NOMOR MESIN",
    # Short OCR-robust fragments commonly found in STNK
    "NO. REGISTRASI",
    "NO RANGKA",
    "NO MESIN",
    "WARNA",
    "TAHUN PEMBUATAN",
    "ISI SILINDER",
    "BAHAN BAKAR",
    "MASA BERLAKU",
    "SAMSAT",
    "POLRI",
]

# Keywords indicating this is a MOTORCYCLE STNK (not car)
# Broad matching: even partial OCR reads like "SEPEDA" or "RODA DUA" should trigger
MOTOR_KEYWORDS = [
    "SEPEDA MOTOR",
    "RODA DUA",
    "SEPEDAMOTOR",  # OCR sometimes omits space
    "SPEDA MOTOR",  # OCR misread
    "SEPEDA MTR",
]

# Short single-word fallback for motor (only used when STNK keywords found but car keywords absent)
MOTOR_SOFT_KEYWORDS = [
    "SEPEDA",       # Strong signal if STNK doc confirmed
    "RODA DUA",
    "SCOOTER",
    "BEBEK",
]

# Keywords indicating this is a CAR STNK
CAR_KEYWORDS = [
    "MOBIL", "SEDAN", "MPV", "SUV", "PICK UP", "PICKUP", "DOUBLE CABIN",
    "MINIBUS", "MICROBUS", "STATION WAGON", "JEEP", "KENDARAAN BERMOTOR RODA",
]

def validate_stnk_document(image_path: str):
    """
    Validate if uploaded image is a genuine car STNK.
    
    Returns:
        dict with keys:
            - is_valid (bool): True if it's a valid car STNK
            - document_type (str): 'car_stnk' | 'motorcycle_stnk' | 'not_stnk'
            - message (str): Human-readable validation message
            - confidence (float): Confidence of validation (0.0 - 1.0)
    """
    reader = get_ocr_reader()
    if not reader:
        # GPU OCR failed — try CPU fallback
        try:
            logger.warning("[VALIDATE] GPU OCR unavailable, trying CPU fallback...")
            import easyocr as _easyocr
            reader = _easyocr.Reader(OCR_LANGUAGES, gpu=False, download_enabled=True)
        except Exception as e:
            logger.error(f"[VALIDATE] CPU OCR also failed: {e}")
            return {"is_valid": True, "document_type": "unknown", "message": "Validasi dilewati", "confidence": 0.0}

    img = cv2.imread(image_path)
    if img is None:
        return {"is_valid": False, "document_type": "not_stnk", "message": "File gambar tidak bisa dibaca", "confidence": 1.0}

    # Quick OCR on the full document (upscale for clarity if small, cap at 1200px)
    h, w = img.shape[:2]
    scale = min(1.5, 1200 / max(w, h))  # allow upscaling small images
    small = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
    
    ocr_results = reader.readtext(small, detail=0)  # Just text, no detail needed
    all_text = " ".join(ocr_results).upper()
    
    logger.info(f"[VALIDATE] Full doc text preview: {all_text[:300]}")

    # Count STNK keyword matches
    stnk_hits = sum(1 for kw in STNK_KEYWORDS if kw in all_text)
    motor_hits = sum(1 for kw in MOTOR_KEYWORDS if kw in all_text)
    # Also check soft single-word motor keywords when STNK doc confirmed
    motor_soft_hits = sum(1 for kw in MOTOR_SOFT_KEYWORDS if kw in all_text)
    car_hits = sum(1 for kw in CAR_KEYWORDS if kw in all_text)
    
    # Count total readable words as a proxy for image clarity
    total_words = len(all_text.split())
    
    logger.info(f"[VALIDATE] stnk_hits={stnk_hits}, motor_hits={motor_hits}, motor_soft_hits={motor_soft_hits}, car_hits={car_hits}, total_words={total_words}")

    # --- Strategy: err on the side of passing through to human admin ---
    # STNK Motor → flag as warning, NOT hard-reject; let human admin decide
    # Use hard keywords OR (soft keywords + confirmed STNK document)
    is_motor = motor_hits >= 1 or (motor_soft_hits >= 1 and stnk_hits >= 1 and car_hits == 0)
    if is_motor and car_hits == 0:
        return {
            "is_valid": True,   # Still pass through to dashboard
            "document_type": "motorcycle_stnk",
            "message": "Dokumen terdeteksi sebagai STNK Motor (bukan Mobil). Harap periksa manual sebelum menyetujui.",
            "confidence": 0.85,
            "is_warning": True  # Flag so backend adds [AI WARNING] note
        }

    # If image has very little text and zero STNK hits → flag as warning only (not hard reject)
    # Reason: blurry STNK still goes through to admin for human review
    if stnk_hits == 0 and total_words < 10:
        # Almost certainly not a document (e.g., selfie, blank image)
        return {
            "is_valid": False,
            "document_type": "not_stnk",
            "message": "Dokumen tidak terdeteksi. Harap upload foto STNK yang jelas dan tidak buram.",
            "confidence": 0.8
        }

    # If OCR found some text but no STNK keywords → possible blurry/tilted STNK
    # Pass through with is_valid=True so admin can review manually
    # The comparison_result will be low_confidence anyway since plate OCR also likely failed
    return {
        "is_valid": True,
        "document_type": "car_stnk" if stnk_hits > 0 else "unverified",
        "message": "Dokumen STNK valid." if stnk_hits > 0 else "Dokumen tidak terverifikasi (kemungkinan buram). Silakan periksa manual.",
        "confidence": min(1.0, stnk_hits * 0.1 + 0.3)
    }

# Load Models
_yolo_model = None       # Plate detector
_yolo_general = None     # General vehicle classifier (YOLOv8 pretrained COCO)
_ocr_reader = None

# COCO class IDs relevant to vehicles
COCO_CAR_CLASSES = {2}           # car
COCO_MOTORCYCLE_CLASSES = {3}    # motorcycle
COCO_VEHICLE_CLASSES = {2, 3, 5, 7}  # car, motorcycle, bus, truck

def get_yolo_general_model():
    """Load YOLOv8n pretrained on COCO for general vehicle detection."""
    global _yolo_general
    if _yolo_general is None:
        try:
            # yolov8n.pt is automatically downloaded by ultralytics if not present
            _yolo_general = YOLO("yolov8n.pt")
            logger.info("YOLOv8n general model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading YOLOv8n general model: {e}")
            _yolo_general = None
    return _yolo_general

def validate_car_photo(image_path: str):
    """
    Validate if the uploaded vehicle photo actually shows a CAR (not motorcycle, bus, truck, etc).
    Uses YOLOv8 pretrained COCO model to classify detected objects.
    
    Returns:
        dict with keys:
            - is_valid (bool): True if image shows a car
            - detected_type (str): 'car' | 'motorcycle' | 'no_vehicle' | 'unknown'
            - message (str): Human-readable message
    """
    model = get_yolo_general_model()
    if not model:
        # If model unavailable, don't block the flow
        return {"is_valid": True, "detected_type": "unknown", "message": "Validasi kendaraan dilewati"}

    try:
        results = model.predict(source=image_path, conf=0.3, save=False, verbose=False)
    except Exception as e:
        logger.error(f"Vehicle validation error: {e}")
        return {"is_valid": True, "detected_type": "unknown", "message": "Validasi kendaraan dilewati"}

    if not results or len(results[0].boxes) == 0:
        # No objects detected at all
        return {
            "is_valid": False,
            "detected_type": "no_vehicle",
            "message": "Tidak ada kendaraan terdeteksi dalam foto. Harap upload foto tampak depan/belakang kendaraan."
        }

    # Tally detected classes
    detected_classes = set()
    class_counts = {}
    for box in results[0].boxes:
        cls_id = int(box.cls[0].item())
        detected_classes.add(cls_id)
        class_counts[cls_id] = class_counts.get(cls_id, 0) + 1

    logger.info(f"[VALIDATE_CAR] Detected COCO classes: {class_counts}")

    has_car = bool(detected_classes & COCO_CAR_CLASSES)
    has_motorcycle = bool(detected_classes & COCO_MOTORCYCLE_CLASSES)
    has_any_vehicle = bool(detected_classes & COCO_VEHICLE_CLASSES)

    if has_motorcycle and not has_car:
        return {
            "is_valid": False,
            "detected_type": "motorcycle",
            "message": "Foto menunjukkan kendaraan roda dua (motor), bukan mobil. Harap upload foto kendaraan roda empat (mobil)."
        }

    if has_car:
        return {
            "is_valid": True,
            "detected_type": "car",
            "message": "Kendaraan roda empat terdeteksi."
        }

    if has_any_vehicle:
        # Bus or truck detected — still a 4-wheel vehicle, allow it
        return {
            "is_valid": True,
            "detected_type": "other_vehicle",
            "message": "Kendaraan terdeteksi."
        }

    # Other objects detected (person, animal, etc.) but no vehicle
    return {
        "is_valid": False,
        "detected_type": "no_vehicle",
        "message": "Foto tidak menunjukkan kendaraan. Harap upload foto tampak depan/belakang mobil Anda."
    }



def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        try:
            _yolo_model = YOLO(YOLO_MODEL_PATH)
        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")
            _yolo_model = None
    return _yolo_model

def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        try:
            _ocr_reader = easyocr.Reader(OCR_LANGUAGES, gpu=OCR_GPU, download_enabled=True)
        except Exception as e:
            logger.error(f"Error loading EasyOCR: {e}")
            _ocr_reader = None
    return _ocr_reader

def clean_plate_text(raw_text: str) -> str:
    """Clean and normalize OCR result for Indonesian plate format."""
    text = raw_text.upper().strip()
    text = re.sub(r"[^A-Z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()

    # Try to auto-format to "XX 1234 YY"
    match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", text)
    if match:
        text = f"{match.group(1)} {match.group(2)} {match.group(3)}"
    return text

def extract_plate_from_car(image_path: str):
    """
    1. Run YOLO to detect plate
    2. Crop plate (pick the most plate-shaped box, not the largest)
    3. Run OCR on cropped plate
    """
    model = get_yolo_model()
    if not model:
        return None, 0.0

    results = model.predict(source=image_path, conf=0.25, save=False, verbose=False)
    if not results or len(results[0].boxes) == 0:
        return None, 0.0

    boxes = results[0].boxes
    
    # Pick the box with the most plate-like aspect ratio (wide, not tall)
    # Indonesian plates are roughly 3:1 to 5:1 width:height
    def plate_score(box):
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        w = x2 - x1
        h = y2 - y1
        if h == 0:
            return 0
        aspect = w / h
        conf = box.conf[0].item()
        # Prefer aspect ratio between 2 and 7, penalize boxes that are too square or too tall
        aspect_score = 1.0 if 2 <= aspect <= 7 else 0.3
        return conf * aspect_score
    
    best_box = max(boxes, key=plate_score)
    
    x1, y1, x2, y2 = map(int, best_box.xyxy[0])
    
    img = cv2.imread(image_path)
    if img is None:
        return None, 0.0
    
    # Add small padding around the crop
    h_img, w_img = img.shape[:2]
    pad = 10
    x1 = max(0, x1 - pad)
    y1 = max(0, y1 - pad)
    x2 = min(w_img, x2 + pad)
    y2 = min(h_img, y2 + pad)
        
    plate_crop = img[y1:y2, x1:x2]
    
    # Upscale crop for better OCR
    crop_h, crop_w = plate_crop.shape[:2]
    if crop_w < 200:
        scale = 200 / crop_w
        plate_crop = cv2.resize(plate_crop, (int(crop_w*scale), int(crop_h*scale)), interpolation=cv2.INTER_CUBIC)
    
    # Run OCR on cropped plate
    reader = get_ocr_reader()
    if not reader:
        return None, 0.0
        
    ocr_results = reader.readtext(plate_crop, detail=1, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ")
    
    if not ocr_results:
        return None, 0.0
        
    # Combine texts
    all_fragments = []
    for (bbox, text, conf) in ocr_results:
        cleaned = re.sub(r"[^A-Z0-9\s]", "", text.upper().strip())
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        if cleaned:
            all_fragments.append((cleaned, conf))
            
    best_text = None
    best_conf = 0.0
    
    if all_fragments:
        combined_raw = " ".join(t for t, _ in all_fragments)
        match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", combined_raw)
        if match:
            best_text = f"{match.group(1)} {match.group(2)} {match.group(3)}"
            best_conf = sum(c for _, c in all_fragments) / len(all_fragments)
        
        if not best_text:
            longest = max(all_fragments, key=lambda x: len(x[0]))
            best_text, best_conf = longest
            best_text = clean_plate_text(best_text)

    return best_text, best_conf

def _get_sorted_ocr_results(ocr_results):
    """Sort OCR results top-to-bottom, left-to-right based on bounding box position."""
    def bbox_center_y(item):
        bbox = item[0]
        ys = [p[1] for p in bbox]
        return sum(ys) / len(ys)
    return sorted(ocr_results, key=bbox_center_y)


def _bbox_center(bbox):
    xs = [p[0] for p in bbox]
    ys = [p[1] for p in bbox]
    return sum(xs) / len(xs), sum(ys) / len(ys)


def _find_value_near_label(ocr_results, label_keywords, value_extractor_fn, max_distance=120):
    """
    Find the value closest to a label keyword in the STNK document.
    Looks for text items that are spatially close (right of or below) a label.
    """
    label_positions = []
    for (bbox, text, conf) in ocr_results:
        text_upper = text.upper().strip()
        if any(kw in text_upper for kw in label_keywords):
            cx, cy = _bbox_center(bbox)
            label_positions.append((cx, cy, bbox))

    if not label_positions:
        return None, 0.0

    best_value = None
    best_conf = 0.0

    for label_cx, label_cy, label_bbox in label_positions:
        for (bbox, text, conf) in ocr_results:
            cx, cy = _bbox_center(bbox)
            # Look for text to the RIGHT of label (same row) or BELOW label (next row)
            dx = cx - label_cx
            dy = cy - label_cy
            is_right = 0 < dx < max_distance * 3 and abs(dy) < 30
            is_below = 0 < dy < 60 and abs(dx) < max_distance * 2

            if is_right or is_below:
                value = value_extractor_fn(text, conf)
                if value is not None:
                    val, c = value
                    if c > best_conf:
                        best_value = val
                        best_conf = c

    return best_value, best_conf


def extract_info_from_stnk(image_path: str):
    """
    Smart context-aware OCR extraction from STNK document.
    Strategy:
    1. Find plate number near NOMOR REGISTRASI / NO POL label
    2. Find CC near ISI SILINDER / CYLINDER label
    3. Fall back to scanning all text if label-based search fails
    """
    reader = get_ocr_reader()
    if not reader:
        return None, 0.0, None, None
        
    img = cv2.imread(image_path)
    if img is None:
        return None, 0.0, None, None

    # Pre-process image for better OCR: upscale and sharpen
    h, w = img.shape[:2]
    if w < 1000:
        img = cv2.resize(img, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
    
    ocr_results = reader.readtext(img, detail=1)

    VALID_PREFIXES = {
        "A", "AA", "AB", "AD", "AE", "AG", "B", "BA", "BB", "BD", "BE", "BG",
        "BH", "BK", "BL", "BM", "BN", "BP", "DA", "DB", "DC", "DD", "DE", "DG",
        "DH", "DK", "DL", "DM", "DN", "DP", "DR", "DT", "DW", "EA", "EB", "ED",
        "EE", "F", "G", "H", "K", "KB", "KH", "KT", "KU", "L", "M", "N", "P",
        "PA", "PB", "R", "S", "T", "W", "Z"
    }
    BLACKLIST_PREFIX = {"KM", "RT", "RW", "NO", "JL", "NI", "VIN"}
    BLACKLIST_SUFFIX = {"KM", "RT", "RW", "CC", "DC", "AC"}

    def plate_extractor(text, conf):
        cleaned = re.sub(r"[^A-Z0-9\s]", "", text.upper().strip())
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", cleaned)
        if match:
            prefix = match.group(1)
            suffix = match.group(3)
            if prefix in VALID_PREFIXES and prefix not in BLACKLIST_PREFIX and suffix not in BLACKLIST_SUFFIX:
                return f"{prefix} {match.group(2)} {suffix}", conf
        return None

    def cc_extractor(text, conf):
        text_upper = text.upper()
        # Normalize OCR misreads: G→C, 0→O etc. in context of CC
        # e.g. "2500 GC" -> "2500 CC", "2500 GG" -> "2500 CC"
        normalized = re.sub(r"(\d)\s*[GQ][CG]", r"\1 CC", text_upper)
        normalized = re.sub(r"(\d)\s*C[CG]", r"\1 CC", normalized)
        
        # Match: "2500 CC", "1496CC", "2500 C"
        m = re.search(r"(\d{3,5})\s*(?:CC|C\.?C\.?)", normalized)
        if m:
            val = int(m.group(1))
            if 50 <= val <= 10000:
                return val, conf
        # Also plain 3-5 digit standalone number in a CC-labeled context
        m2 = re.search(r"^(\d{3,5})$", text_upper.strip())
        if m2:
            val = int(m2.group(1))
            if 100 <= val <= 9999:
                return val, conf
        return None

    # --- Step 1: Smart label-based search for PLATE ---
    plate_labels = ["NOMOR REGISTRASI", "NO. POL", "NO POL", "NOPOL", "NOMOR POLISI", "KENDARAAN BARU"]
    best_plate, plate_conf = _find_value_near_label(ocr_results, plate_labels, plate_extractor)

    # --- Step 2: Smart label-based search for CC ---
    cc_labels = ["SILINDER", "ISI SILINDER", "DAYA", "CC", "CYLINDER", "KAPASITAS"]
    best_cc, _ = _find_value_near_label(ocr_results, cc_labels, cc_extractor)

    # --- Step 3: Fallback — scan all text if label search failed ---
    all_text = " ".join([t.upper() for (_, t, _) in ocr_results])

    if not best_plate:
        logger.info("Label-based plate search failed, falling back to full-document scan")
        best_conf = 0.0
        candidates = []
        for (bbox, text, conf) in ocr_results:
            result = plate_extractor(text, conf)
            if result:
                val, c = result
                candidates.append((val, c, bbox))
        
        if candidates:
            # Pick highest confidence
            candidates.sort(key=lambda x: x[1], reverse=True)
            best_plate, best_conf, _ = candidates[0]
        
        # Last resort: check if any number-only sequence near NOMOR REGISTRASI label
        # The "D" prefix in "D 4409 ACJ" might be read separately
        if not best_plate:
            for i, (bbox, text, conf) in enumerate(ocr_results):
                cleaned = re.sub(r"[^A-Z0-9\s]", "", text.upper().strip())
                # Look for pattern like "4409 ACJ" without prefix
                m = re.search(r"^(\d{1,4})\s+([A-Z]{1,3})$", cleaned.strip())
                if m and conf > 0.5:
                    # Try to find prefix in nearby text (left side)
                    cx = sum(p[0] for p in bbox) / 4
                    cy = sum(p[1] for p in bbox) / 4
                    for (bbox2, text2, conf2) in ocr_results:
                        cx2 = sum(p[0] for p in bbox2) / 4
                        cy2 = sum(p[1] for p in bbox2) / 4
                        if abs(cy2 - cy) < 25 and -60 < cx2 - cx < 0:
                            prefix_candidate = re.sub(r"[^A-Z]", "", text2.upper())
                            if len(prefix_candidate) == 1 and prefix_candidate in VALID_PREFIXES:
                                best_plate = f"{prefix_candidate} {m.group(1)} {m.group(2)}"
                                best_conf = (conf + conf2) / 2
                                break

    if not best_cc:
        logger.info("Label-based CC search failed, falling back to full-document scan")
        # Normalize all_text for CC misreads
        normalized_all = re.sub(r"(\d)\s*[GQ][CG]", r"\1 CC", all_text)
        normalized_all = re.sub(r"(\d)\s*C[CG]", r"\1 CC", normalized_all)
        
        cc_match = re.search(r"(\d{3,5})\s*CC", normalized_all)
        if cc_match:
            val = int(cc_match.group(1))
            if 100 <= val <= 9999:
                best_cc = val

        # Try SILINDER + number pattern in full text
        if not best_cc:
            silinder_match = re.search(r"(?:SILINDER|INDER)\D{0,20}?(\d{3,5})", all_text)
            if silinder_match:
                val = int(silinder_match.group(1))
                if 100 <= val <= 9999:
                    best_cc = val

    # Final fallback CC
    if not best_cc:
        best_cc = None  # Don't fake it — let admin know it wasn't found

    # --- Detect document type from OCR text ---
    # This serves as a fallback when validate_stnk_document misses it
    motor_keywords_in_text = ["SEPEDA MOTOR", "RODA DUA", "SEPEDAMOTOR", "SPEDA MOTOR", "SEPEDA"]
    car_keywords_in_text = ["MOBIL", "SEDAN", "MPV", "SUV", "MINIBUS", "STATION WAGON"]
    detected_doc_type = None
    m_hits = sum(1 for kw in motor_keywords_in_text if kw in all_text)
    c_hits = sum(1 for kw in car_keywords_in_text if kw in all_text)
    if m_hits > 0 and c_hits == 0:
        detected_doc_type = "motorcycle_stnk"
    elif c_hits > 0 and m_hits == 0:
        detected_doc_type = "car_stnk"

    logger.info(f"[EXTRACT] doc_type from text: {detected_doc_type} (motor={m_hits}, car={c_hits})")

    return best_plate, plate_conf, best_cc, detected_doc_type

def generate_qr_code(data: str, save_dir="static/qrcodes"):
    """Generate QR code and return the path."""
    os.makedirs(save_dir, exist_ok=True)
    filename = f"qr_{int(time.time())}.png"
    filepath = os.path.join(save_dir, filename)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filepath)
    
    return filename
