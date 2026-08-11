"""
main.py - FastAPI server: endpoint deteksi, query database, dan serve frontend
"""
import io
import os
import uuid
import logging
import base64
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, List

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from config import (
    UPLOADS_DIR,
    CROPS_DIR,
    STATIC_DIR,
    ALLOWED_EXTENSIONS,
    MAX_UPLOAD_SIZE,
    API_TITLE,
    API_VERSION,
)
from database import (
    init_db, get_db,
    save_detection,
    get_all_detections,
    search_by_plate,
    get_stats,
    delete_detection,
)
from detector import detect_vehicles_and_plates, draw_detections
from ocr_engine import read_plate_from_image

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info(f"[APP] {API_TITLE} v{API_VERSION} siap ✓")
    yield


# ─── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="API untuk deteksi kendaraan (YOLO) dan pembacaan plat nomor (OCR)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve file statis (frontend HTML)
app.mount("/static",  StaticFiles(directory=str(STATIC_DIR)),  name="static")
app.mount("/crops",   StaticFiles(directory=str(CROPS_DIR)),   name="crops")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ─── Utility ───────────────────────────────────────────────────────────────────

def _validate_upload(file: UploadFile, content: bytes) -> None:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format file tidak didukung: {ext}. Gunakan: {ALLOWED_EXTENSIONS}"
        )
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File terlalu besar. Maksimum: {MAX_UPLOAD_SIZE // (1024*1024)} MB"
        )


def _ndarray_to_base64(img: np.ndarray) -> str:
    """Konversi numpy array gambar ke base64 string untuk JSON response."""
    _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return base64.b64encode(buffer).decode("utf-8")


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index():
    """Serve halaman utama frontend."""
    html_path = STATIC_DIR / "index.html"
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Frontend tidak ditemukan. Letakkan index.html di folder static/</h1>")


@app.post("/detect", summary="Upload gambar dan deteksi plat nomor")
async def detect(
    file: UploadFile = File(..., description="Gambar kendaraan (JPG/PNG)"),
    qr_file: Optional[UploadFile] = File(None, description="Gambar QR Code (opsional)"),
    db: Session = Depends(get_db),
):
    """
    Pipeline lengkap:
    1. Simpan gambar upload
    2. Deteksi kendaraan dengan YOLO
    3. Crop area plat & OCR
    4. Simpan hasil ke database
    5. Return hasil + gambar teranotasi (base64)
    """
    content = await file.read()
    _validate_upload(file, content)

    # Simpan file upload
    ext           = Path(file.filename).suffix.lower()
    unique_name   = f"{uuid.uuid4().hex}{ext}"
    image_path    = str(UPLOADS_DIR / unique_name)

    with open(image_path, "wb") as f:
        f.write(content)

    logger.info(f"[API] File diterima: {file.filename} → {unique_name}")

    # ── QR Code Detection ──────────────────────────────────────────────────
    qr_text = None
    if qr_file:
        qr_content = await qr_file.read()
        _validate_upload(qr_file, qr_content)
        
        qr_nparr = np.frombuffer(qr_content, np.uint8)
        qr_img = cv2.imdecode(qr_nparr, cv2.IMREAD_COLOR)
        
        from qr_engine import read_qr_from_image
        qr_text, _ = read_qr_from_image(qr_img)
        logger.info(f"[API] QR File diterima, hasil decode: {qr_text}")

    # ── YOLO Detection ─────────────────────────────────────────────────────
    try:
        detections = detect_vehicles_and_plates(image_path)
    except Exception as e:
        logger.error(f"[API] Detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Error deteksi: {str(e)}")

    if not detections:
        return JSONResponse({
            "status":     "ok",
            "message":    "Tidak ada kendaraan terdeteksi",
            "detections": [],
            "annotated":  None,
        })

    # ── OCR + Simpan ke DB ─────────────────────────────────────────────────
    results      = []
    plate_texts  = []

    for det in detections:
        plate_text  = None
        plate_conf  = 0.0

        if det["crop_image"] is not None:
            plate_text, plate_conf = read_plate_from_image(det["crop_image"])

        plate_texts.append(plate_text)

        # Simpan ke database
        record = save_detection(
            db            = db,
            vehicle_type  = det["vehicle_type"],
            plate_text    = plate_text,
            confidence_det= det["confidence_det"],
            confidence_ocr= plate_conf,
            image_path    = image_path,
            crop_path     = det["crop_path"],
            notes         = None,
        )

        # Bandingkan dengan QR text jika ada
        is_qr_match = False
        if qr_text and plate_text:
            p_clean = plate_text.replace(" ", "").upper()
            q_clean = qr_text.replace(" ", "").upper()
            if p_clean == q_clean or q_clean in p_clean or p_clean in q_clean:
                is_qr_match = True

        results.append({
            "id":             record.id,
            "vehicle_type":   det["vehicle_type"],
            "confidence_det": round(det["confidence_det"], 3),
            "plate_text":     plate_text,
            "confidence_ocr": round(plate_conf, 3),
            "crop_url":       f"/crops/{Path(det['crop_path']).name}" if det["crop_path"] else None,
            "timestamp":      record.timestamp.isoformat(),
            "is_qr_match":    is_qr_match,
        })

        logger.info(
            f"[API] Disimpan ID={record.id} | "
            f"{det['vehicle_type']} | plat='{plate_text}'"
        )

    # ── Gambar Teranotasi ──────────────────────────────────────────────────
    annotated_img = draw_detections(image_path, detections, plate_texts)
    annotated_b64 = _ndarray_to_base64(annotated_img)

    return JSONResponse({
        "status":     "ok",
        "message":    f"{len(results)} kendaraan terdeteksi",
        "qr_text":    qr_text,
        "detections": results,
        "annotated":  f"data:image/jpeg;base64,{annotated_b64}",
    })


@app.get("/results", summary="Ambil semua hasil deteksi")
async def get_results(
    skip:  int = Query(0, ge=0, description="Offset paginasi"),
    limit: int = Query(50, ge=1, le=500, description="Jumlah data per halaman"),
    db: Session = Depends(get_db),
):
    """Ambil semua hasil deteksi dari database dengan paginasi."""
    records = get_all_detections(db, skip=skip, limit=limit)
    return {
        "status": "ok",
        "total":  len(records),
        "skip":   skip,
        "limit":  limit,
        "data":   [r.to_dict() for r in records],
    }


@app.get("/search", summary="Cari berdasarkan plat nomor")
async def search(
    plate: str = Query(..., description="Teks plat yang dicari (partial match)"),
    db: Session = Depends(get_db),
):
    """Cari kendaraan berdasarkan teks plat nomor."""
    if len(plate.strip()) < 1:
        raise HTTPException(status_code=400, detail="Query plat tidak boleh kosong")

    records = search_by_plate(db, plate)
    return {
        "status":  "ok",
        "query":   plate,
        "total":   len(records),
        "data":    [r.to_dict() for r in records],
    }


@app.get("/stats", summary="Statistik deteksi")
async def stats(db: Session = Depends(get_db)):
    """Ringkasan statistik: total deteksi, plat unik, per jenis kendaraan."""
    return {"status": "ok", "data": get_stats(db)}


@app.delete("/detection/{detection_id}", summary="Hapus record deteksi")
async def delete(
    detection_id: int,
    db: Session = Depends(get_db),
):
    """Hapus satu record deteksi berdasarkan ID."""
    success = delete_detection(db, detection_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"ID {detection_id} tidak ditemukan")
    return {"status": "ok", "message": f"Record {detection_id} dihapus"}


@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok", "service": API_TITLE, "version": API_VERSION}


# ─── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=True)
