"""
ocr_engine.py - EasyOCR engine untuk pembacaan teks plat nomor
"""
import re
import logging
from typing import Optional, Tuple, List

import numpy as np
import easyocr

from config import OCR_LANGUAGES, OCR_CONFIDENCE_MIN, OCR_GPU, PLATE_PATTERN

logger = logging.getLogger(__name__)


# ─── Singleton OCR Reader ──────────────────────────────────────────────────────
_reader: Optional[easyocr.Reader] = None


def get_reader() -> easyocr.Reader:
    """Load EasyOCR reader (singleton, load sekali saja)."""
    global _reader
    if _reader is None:
        logger.info(f"[OCR] Loading EasyOCR (lang={OCR_LANGUAGES}, gpu={OCR_GPU})...")
        _reader = easyocr.Reader(OCR_LANGUAGES, gpu=OCR_GPU)
        logger.info("[OCR] EasyOCR ready ✓")
    return _reader


# ─── Text Cleaning ─────────────────────────────────────────────────────────────

# Tabel koreksi OCR umum untuk plat Indonesia
_OCR_CORRECTIONS = {
    "0": "O", "O": "0",   # ambigu antara 0 dan O
    "1": "I", "I": "1",
    "8": "B", "B": "8",
    "|": "I",
    "!": "1",
    "(": "",  ")": "",
    "[": "",  "]": "",
    ".": "",  ",": "",
    "-": "",  "_": "",
    "/": "",  "\\": "",
}


def _clean_plate_text(raw: str) -> str:
    """
    Bersihkan dan normalisasi teks plat dari hasil OCR:
    1. Uppercase
    2. Hapus karakter non-alfanumerik (kecuali spasi)
    3. Normalisasi spasi ganda
    4. Pisahkan huruf-angka-huruf dengan spasi
    """
    text = raw.upper().strip()

    # Hapus karakter selain huruf, angka, dan spasi
    text = re.sub(r"[^A-Z0-9\s]", "", text)

    # Normalisasi spasi
    text = re.sub(r"\s+", " ", text).strip()

    # Coba auto-format ke "XX 1234 YYZ"
    # Pattern: 1-2 huruf, 1-4 digit, 1-3 huruf
    match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", text)
    if match:
        text = f"{match.group(1)} {match.group(2)} {match.group(3)}"

    return text


def _validate_plate(text: str) -> bool:
    """
    Validasi apakah teks sesuai format plat Indonesia.
    Contoh valid: 'B 1234 XY', 'AB 123 C', 'D 1 A'
    """
    if not text or len(text) < 4:
        return False
    return bool(re.match(PLATE_PATTERN, text))


# ─── Main OCR Function ─────────────────────────────────────────────────────────

def read_plate_from_image(
    image: np.ndarray,
) -> Tuple[Optional[str], float]:
    """
    Baca teks plat dari gambar numpy array.

    Args:
        image: Gambar BGR (numpy array) hasil crop plat

    Returns:
        Tuple (plate_text, confidence):
        - plate_text: teks plat yang sudah dibersihkan, atau None
        - confidence: nilai confidence 0.0 - 1.0
    """
    if image is None or image.size == 0:
        return None, 0.0

    reader = get_reader()

    try:
        results: List = reader.readtext(
            image,
            detail=1,               # return detail dengan confidence
            paragraph=False,        # baca per baris, bukan per paragraf
            allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
            mag_ratio=1.2,          # sedikit zoom agar angka kecil terbaca, tanpa halusinasi
        )
    except Exception as e:
        logger.error(f"[OCR] Error saat baca gambar: {e}")
        return None, 0.0

    if not results:
        logger.debug("[OCR] Tidak ada teks terdeteksi")
        return None, 0.0

    # ── Gabungkan semua teks: urutkan kiri-ke-kanan berdasarkan posisi X ────
    # Penting: Plat nomor sering terbaca beberapa fragmen terpisah (misal "B" dan "1676 SSU")
    # Strategi: Coba gabungkan semua fragmen terlebih dahulu, baru validasi
    results_sorted = sorted(results, key=lambda r: r[0][0][0])  # urut by X (kiri ke kanan)

    all_fragments = []  # (cleaned_text, conf, original_text)
    for (bbox, text, conf) in results_sorted:
        if conf < OCR_CONFIDENCE_MIN:
            continue
        cleaned = re.sub(r"[^A-Z0-9\s]", "", text.upper().strip())
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        if not cleaned:
            continue
        all_fragments.append((cleaned, conf))
        logger.debug(f"[OCR] Fragment: '{text}' → '{cleaned}' ({conf:.2f})")

    best_text = None
    best_conf = 0.0

    if all_fragments:
        # Prioritas 1: Gabungkan semua fragmen, lalu coba match pola plat
        combined_raw = " ".join(t for t, _ in all_fragments)
        match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", combined_raw)
        if match:
            best_text = f"{match.group(1)} {match.group(2)} {match.group(3)}"
            best_conf = sum(c for _, c in all_fragments) / len(all_fragments)
            logger.debug(f"[OCR] Gabungan fragmen: '{combined_raw}' → '{best_text}'")

        # Prioritas 2: Coba setiap fragmen individual
        if not best_text:
            for cleaned, conf in all_fragments:
                full_match = re.search(r"([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})", cleaned)
                if full_match and conf > best_conf:
                    best_text = f"{full_match.group(1)} {full_match.group(2)} {full_match.group(3)}"
                    best_conf = conf

        # Prioritas 3: Ambil fragmen terpanjang jika tidak ada pola valid
        if not best_text:
            longest = max(all_fragments, key=lambda x: len(x[0]))
            best_text, best_conf = longest

    if best_text:
        logger.info(f"[OCR] Plat terdeteksi: '{best_text}' (conf={best_conf:.2f})")
    else:
        logger.info("[OCR] Tidak ada plat valid terdeteksi")

    return best_text, best_conf


def read_plate_from_path(image_path: str) -> Tuple[Optional[str], float]:
    """
    Baca teks plat dari path file gambar.
    """
    import cv2
    img = cv2.imread(image_path)
    if img is None:
        logger.error(f"[OCR] Gagal membaca file: {image_path}")
        return None, 0.0
    return read_plate_from_image(img)
