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

# Load Models
_yolo_model = None
_ocr_reader = None

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
            _ocr_reader = easyocr.Reader(OCR_LANGUAGES, gpu=OCR_GPU, download_enabled=False)
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
    2. Crop plate
    3. Run OCR on cropped plate
    """
    model = get_yolo_model()
    if not model:
        return None, 0.0

    results = model.predict(source=image_path, conf=0.25, save=False, verbose=False)
    if not results or len(results[0].boxes) == 0:
        return None, 0.0

    # Get the bounding box with the highest confidence
    boxes = results[0].boxes
    best_box = max(boxes, key=lambda b: b.conf[0].item())
    
    x1, y1, x2, y2 = map(int, best_box.xyxy[0])
    
    img = cv2.imread(image_path)
    if img is None:
        return None, 0.0
        
    plate_crop = img[y1:y2, x1:x2]
    
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

def extract_plate_from_stnk(image_path: str):
    """
    Run OCR directly on STNK and find the first matching Indonesian plate pattern.
    """
    reader = get_ocr_reader()
    if not reader:
        return None, 0.0
        
    img = cv2.imread(image_path)
    if img is None:
        return None, 0.0
        
    ocr_results = reader.readtext(img, detail=1, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ")
    
    best_match = None
    best_conf = 0.0
    
    for (bbox, text, conf) in ocr_results:
        cleaned = clean_plate_text(text)
        match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", cleaned)
        if match:
            # We found a plate-like pattern!
            plate_text = f"{match.group(1)} {match.group(2)} {match.group(3)}"
            if conf > best_conf:
                best_match = plate_text
                best_conf = conf
                
    return best_match, best_conf

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
