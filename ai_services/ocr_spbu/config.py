"""
config.py - Konfigurasi global sistem YOLO + OCR
"""
import os
from pathlib import Path

# ─── Base Directory ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.resolve()

# ─── Folder Paths ──────────────────────────────────────────────────────────────
MODELS_DIR   = BASE_DIR / "models"
UPLOADS_DIR  = BASE_DIR / "uploads"
CROPS_DIR    = BASE_DIR / "crops"
DB_DIR       = BASE_DIR / "database"
STATIC_DIR   = BASE_DIR / "static"

# Buat folder jika belum ada
for _dir in [MODELS_DIR, UPLOADS_DIR, CROPS_DIR, DB_DIR, STATIC_DIR]:
    _dir.mkdir(parents=True, exist_ok=True)

# ─── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = f"sqlite:///{DB_DIR / 'plates.db'}"

# ─── YOLO Model ────────────────────────────────────────────────────────────────
# Menggunakan model custom untuk deteksi kendaraan agar akurasinya lebih bagus
YOLO_VEHICLE_MODEL = str(MODELS_DIR / "plate_detector.pt")

# Model khusus deteksi plat nomor (menggunakan model yang sama)
# YOLO_PLATE_MODEL adalah path model khusus deteksi plat nomor
YOLO_PLATE_MODEL   = str(MODELS_DIR / "plate_detector.pt")
USE_PLATE_MODEL    = os.path.exists(YOLO_PLATE_MODEL)

# ─── YOLO Detection Settings ───────────────────────────────────────────────────
VEHICLE_CLASSES = {
    0:  "bus",        # Custom model class index untuk bus
    1:  "car",        # Custom model class index untuk mobil (cars)
    3:  "truck",      # Custom model class index untuk truk
}

CONFIDENCE_THRESHOLD  = 0.45   # Minimum confidence untuk deteksi kendaraan
IOU_THRESHOLD         = 0.45   # IoU threshold untuk NMS
MAX_DETECTIONS        = 10     # Maksimum deteksi per frame

# ─── Plate Crop Settings ───────────────────────────────────────────────────────
# Estimasi posisi plat dari bounding box kendaraan (sebagai fallback)
PLATE_REGION_RATIOS = {
    "car": {
        "x_ratio": (0.25, 0.75),   # Persempit ke tengah (hindari watermark di pinggir)
        "y_ratio": (0.75, 0.95),   # Fokus di area bumper bawah
    },
    "motorcycle": {
        "x_ratio": (0.25, 0.75),
        "y_ratio": (0.70, 0.95),
    },
    "truck": {
        "x_ratio": (0.20, 0.80),
        "y_ratio": (0.80, 0.98),
    },
    "bus": {
        "x_ratio": (0.20, 0.80),
        "y_ratio": (0.80, 0.98),
    },
}

# ─── OCR Settings ──────────────────────────────────────────────────────────────
OCR_LANGUAGES         = ["id", "en"]  # Bahasa Indonesia + English
OCR_CONFIDENCE_MIN    = 0.3           # Minimum confidence OCR
OCR_GPU               = True          # GPU NVIDIA terdeteksi (CUDA)

# Regex pattern untuk validasi format plat Indonesia
# Contoh: B 1234 XYZ, AB 1234 CD, dll
PLATE_PATTERN = r"^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$"

# ─── API Settings ──────────────────────────────────────────────────────────────
API_HOST    = "0.0.0.0"
API_PORT    = 5003
API_TITLE   = "YOLO + OCR Plat Nomor API"
API_VERSION = "1.0.0"

# Ukuran file upload maksimum (10 MB)
MAX_UPLOAD_SIZE = 10 * 1024 * 1024

# Format gambar yang diterima
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
