"""
qr_engine.py - Modul untuk deteksi dan membaca teks dari QR Code menggunakan OpenCV
"""
import logging
from typing import Optional, Tuple
import cv2
import numpy as np

logger = logging.getLogger(__name__)

_qr_detector = None

def get_qr_detector():
    global _qr_detector
    if _qr_detector is None:
        try:
            _qr_detector = cv2.QRCodeDetector()
            logger.info("[QR] cv2.QRCodeDetector loaded ✓")
        except Exception as e:
            logger.error(f"[QR] Gagal memuat QRCodeDetector: {e}")
    return _qr_detector


def read_qr_from_image(image: np.ndarray) -> Tuple[Optional[str], Optional[np.ndarray]]:
    """
    Baca teks dari gambar QR Code menggunakan OpenCV.
    
    Args:
        image: Gambar BGR (numpy array) hasil upload QR
        
    Returns:
        Tuple (qr_text, qr_bbox):
        - qr_text: teks hasil decode, atau None jika gagal
        - qr_bbox: bounding box dari QR (opsional, untuk debugging)
    """
    if image is None or image.size == 0:
        return None, None

    detector = get_qr_detector()
    if detector is None:
        return None, None
        
    try:
        # Deteksi dan decode
        text, bbox, _ = detector.detectAndDecode(image)
        if text:
            text = text.strip()
            logger.info(f"[QR] Berhasil decode: '{text}'")
            return text, bbox
        else:
            logger.debug("[QR] QR Code terdeteksi tapi teks kosong atau gagal decode")
            return None, bbox
    except Exception as e:
        logger.error(f"[QR] Error saat deteksi/decode: {e}")
        return None, None
