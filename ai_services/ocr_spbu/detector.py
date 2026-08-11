"""
detector.py - YOLO vehicle detection + license plate crop logic
"""
import os
import uuid
import logging
from pathlib import Path
from typing import List, Dict, Optional, Tuple

import cv2
import numpy as np
from ultralytics import YOLO

from config import (
    YOLO_VEHICLE_MODEL,
    YOLO_PLATE_MODEL,
    USE_PLATE_MODEL,
    VEHICLE_CLASSES,
    CONFIDENCE_THRESHOLD,
    IOU_THRESHOLD,
    MAX_DETECTIONS,
    PLATE_REGION_RATIOS,
    CROPS_DIR,
)

logger = logging.getLogger(__name__)


# ─── Singleton Model Loader ────────────────────────────────────────────────────
_vehicle_model: Optional[YOLO] = None
_plate_model:   Optional[YOLO] = None


def get_vehicle_model() -> YOLO:
    """Load model YOLO kendaraan (singleton)."""
    global _vehicle_model
    if _vehicle_model is None:
        logger.info(f"[YOLO] Loading vehicle model: {YOLO_VEHICLE_MODEL}")
        # ultralytics auto-download jika file belum ada
        _vehicle_model = YOLO(YOLO_VEHICLE_MODEL)
        logger.info("[YOLO] Vehicle model loaded ✓")
    return _vehicle_model


def get_plate_model() -> Optional[YOLO]:
    """Load model YOLO plat (opsional)."""
    global _plate_model
    if USE_PLATE_MODEL and _plate_model is None:
        logger.info(f"[YOLO] Loading plate model: {YOLO_PLATE_MODEL}")
        _plate_model = YOLO(YOLO_PLATE_MODEL)
        logger.info("[YOLO] Plate model loaded ✓")
    return _plate_model


# ─── Image Preprocessing ───────────────────────────────────────────────────────

def preprocess_plate_crop(img: np.ndarray) -> np.ndarray:
    """
    Pre-proses ringan: resize ke tinggi standar agar OCR lebih mudah.
    Seringkali filter agresif seperti CLAHE justru merusak fitur di mata EasyOCR.
    """
    h, w = img.shape[:2]
    if h > 0 and w > 0:
        scale  = max(60 / h, 1.0)
        if scale > 1.0:
            new_h  = int(h * scale)
            new_w  = int(w * scale)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
            
    return img


# ─── Plate Crop via Heuristic ──────────────────────────────────────────────────

def crop_plate_heuristic(
    image: np.ndarray,
    bbox: Tuple[int, int, int, int],
    vehicle_type: str,
) -> Optional[np.ndarray]:
    """
    Fallback: crop estimasi area plat dari bounding box kendaraan
    berdasarkan rasio posisi yang sudah dikonfigurasi.
    """
    ratios = PLATE_REGION_RATIOS.get(vehicle_type, PLATE_REGION_RATIOS["car"])
    x1, y1, x2, y2 = bbox

    veh_w = x2 - x1
    veh_h = y2 - y1

    px1 = int(x1 + ratios["x_ratio"][0] * veh_w)
    px2 = int(x1 + ratios["x_ratio"][1] * veh_w)
    py1 = int(y1 + ratios["y_ratio"][0] * veh_h)
    py2 = int(y1 + ratios["y_ratio"][1] * veh_h)

    # Clamp ke dimensi gambar
    h, w = image.shape[:2]
    px1, py1 = max(0, px1), max(0, py1)
    px2, py2 = min(w, px2), min(h, py2)

    if px2 <= px1 or py2 <= py1:
        return None

    return image[py1:py2, px1:px2]


# ─── Plate Crop via YOLO Model ─────────────────────────────────────────────────

def crop_plate_model(
    image: np.ndarray,
    vehicle_bbox: Tuple[int, int, int, int],
) -> Optional[Tuple[np.ndarray, float]]:
    """
    Gunakan model YOLO khusus plat untuk deteksi yang lebih akurat.
    Hanya deteksi dalam area bounding box kendaraan.
    """
    plate_model = get_plate_model()
    if plate_model is None:
        return None

    x1, y1, x2, y2 = vehicle_bbox
    vehicle_crop = image[y1:y2, x1:x2]

    # Cari class ID untuk plat nomor berdasarkan model yang diload
    plate_class_id = None
    for cls_id, cls_name in plate_model.names.items():
        if "plate" in cls_name.lower():
            plate_class_id = cls_id
            break

    # Prediksi menggunakan model plat
    results = plate_model.predict(
        vehicle_crop,
        conf=0.15,
        classes=[plate_class_id] if plate_class_id is not None else None,
        verbose=False,
    )

    for result in results:
        if result.boxes is None or len(result.boxes) == 0:
            continue
        # Ambil plat dengan confidence tertinggi dari sisa box yang ada
        best_box  = result.boxes[result.boxes.conf.argmax()]
        conf      = float(best_box.conf[0])
        bx1, by1, bx2, by2 = map(int, best_box.xyxy[0])
        plate_crop = vehicle_crop[by1:by2, bx1:bx2]
        if plate_crop.size > 0:
            # Trik jitu: Potong 25% bagian bawah plat untuk membuang teks bulan/tahun pajak (09.27 dsb.)
            # dan baut bagian bawah yang sering terbaca sebagai angka siluman oleh OCR.
            h, w = plate_crop.shape[:2]
            plate_crop_top = plate_crop[:int(h * 0.75), :]
            return plate_crop_top, conf

    return None


# ─── Main Detection Function ───────────────────────────────────────────────────

def detect_vehicles_and_plates(
    image_path: str,
) -> List[Dict]:
    """
    Pipeline utama:
    1. Load gambar
    2. Deteksi kendaraan dengan YOLOv8
    3. Untuk setiap kendaraan → crop area plat
    4. Simpan crop ke disk
    5. Return list hasil deteksi

    Returns:
        List of dicts:
        {
            "vehicle_type":   str,
            "confidence_det": float,
            "bbox":           [x1, y1, x2, y2],
            "crop_path":      str | None,
            "crop_image":     np.ndarray | None,
            "plate_conf":     float | None,
        }
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Gambar tidak ditemukan: {image_path}")

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Gagal membaca gambar: {image_path}")

    model   = get_vehicle_model()
    results = model.predict(
        image,
        conf=CONFIDENCE_THRESHOLD,
        iou=IOU_THRESHOLD,
        max_det=MAX_DETECTIONS,
        classes=list(VEHICLE_CLASSES.keys()),
        verbose=False,
    )

    detections = []

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            cls_id  = int(box.cls[0])
            conf    = float(box.conf[0])
            bbox    = list(map(int, box.xyxy[0]))

            vehicle_type = VEHICLE_CLASSES.get(cls_id, "unknown")
            x1, y1, x2, y2 = bbox

            # ── Crop Plat ──────────────────────────────────────────────────
            crop_img  = None
            plate_conf = None

            # Coba model khusus plat dulu
            if USE_PLATE_MODEL:
                result_plate = crop_plate_model(image, (x1, y1, x2, y2))
                if result_plate:
                    crop_img, plate_conf = result_plate

            # Fallback ke heuristic
            if crop_img is None or crop_img.size == 0:
                crop_img = crop_plate_heuristic(image, (x1, y1, x2, y2), vehicle_type)

            # Pre-proses crop untuk OCR
            crop_processed = None
            crop_path      = None

            if crop_img is not None and crop_img.size > 0:
                crop_processed = preprocess_plate_crop(crop_img)

                # Simpan crop ke disk
                crop_filename = f"{uuid.uuid4().hex[:8]}_{vehicle_type}.jpg"
                crop_path     = str(CROPS_DIR / crop_filename)
                cv2.imwrite(crop_path, crop_processed)

            detections.append({
                "vehicle_type":   vehicle_type,
                "confidence_det": conf,
                "bbox":           bbox,
                "crop_path":      crop_path,
                "crop_image":     crop_processed,
                "plate_conf":     plate_conf,
            })

            logger.info(
                f"[DETECT] {vehicle_type} conf={conf:.2f} | "
                f"crop={'✓' if crop_path else '✗'}"
            )

    return detections


def draw_detections(
    image_path: str,
    detections: List[Dict],
    plate_texts: Optional[List[str]] = None,
) -> np.ndarray:
    """
    Gambar bounding box + label kendaraan + teks plat di atas gambar asli.
    Mengembalikan gambar sebagai numpy array (BGR).
    """
    image = cv2.imread(image_path)
    if image is None:
        return np.zeros((480, 640, 3), dtype=np.uint8)

    COLORS = {
        "car":        (0, 255, 100),
        "motorcycle": (0, 200, 255),
        "truck":      (255, 150, 0),
        "bus":        (255, 50, 200),
        "unknown":    (180, 180, 180),
    }

    for i, det in enumerate(detections):
        x1, y1, x2, y2 = det["bbox"]
        vtype  = det["vehicle_type"]
        conf   = det["confidence_det"]
        color  = COLORS.get(vtype, (200, 200, 200))

        # Kotak kendaraan
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # Label kendaraan
        plate_str = ""
        if plate_texts and i < len(plate_texts) and plate_texts[i]:
            plate_str = f" | {plate_texts[i]}"

        label = f"{vtype} {conf:.0%}{plate_str}"
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(image, (x1, y1 - lh - 8), (x1 + lw + 4, y1), color, -1)
        cv2.putText(
            image, label,
            (x1 + 2, y1 - 4),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6,
            (0, 0, 0), 2, cv2.LINE_AA,
        )

    return image
