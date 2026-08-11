"""
database.py - Model database & fungsi query SQLite via SQLAlchemy
"""
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    create_engine, Column, Integer, String,
    Float, DateTime, Text, func
)
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import DATABASE_URL


# ─── Engine & Session ──────────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # diperlukan untuk SQLite + FastAPI
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─── Base Model ────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ─── Tabel Detections ──────────────────────────────────────────────────────────
class Detection(Base):
    __tablename__ = "detections"

    id              = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp       = Column(DateTime, default=datetime.utcnow, nullable=False)
    vehicle_type    = Column(String(50), nullable=True)   # car, motorcycle, truck, bus
    plate_text      = Column(String(20), nullable=True)   # teks plat: "B 1234 XYZ"
    confidence_det  = Column(Float, nullable=True)        # confidence YOLO deteksi kendaraan
    confidence_ocr  = Column(Float, nullable=True)        # confidence OCR
    image_path      = Column(Text, nullable=True)         # path gambar original
    crop_path       = Column(Text, nullable=True)         # path hasil crop plat
    notes           = Column(Text, nullable=True)         # catatan tambahan / error

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id":             self.id,
            "timestamp":      self.timestamp.isoformat() if self.timestamp else None,
            "vehicle_type":   self.vehicle_type,
            "plate_text":     self.plate_text,
            "confidence_det": round(self.confidence_det, 3) if self.confidence_det else None,
            "confidence_ocr": round(self.confidence_ocr, 3) if self.confidence_ocr else None,
            "image_path":     self.image_path,
            "crop_path":      self.crop_path,
            "notes":          self.notes,
        }


# ─── Inisialisasi Database ─────────────────────────────────────────────────────
def init_db():
    """Buat semua tabel jika belum ada."""
    Base.metadata.create_all(bind=engine)
    print(f"[DB] Database siap: {DATABASE_URL}")


# ─── Dependency untuk FastAPI ──────────────────────────────────────────────────
def get_db():
    """Generator session database untuk FastAPI Depends()."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── CRUD Functions ────────────────────────────────────────────────────────────

def save_detection(
    db: Session,
    vehicle_type: Optional[str],
    plate_text: Optional[str],
    confidence_det: Optional[float],
    confidence_ocr: Optional[float],
    image_path: Optional[str] = None,
    crop_path: Optional[str] = None,
    notes: Optional[str] = None,
) -> Detection:
    """Simpan hasil deteksi ke database."""
    record = Detection(
        timestamp      = datetime.utcnow(),
        vehicle_type   = vehicle_type,
        plate_text     = plate_text.upper().strip() if plate_text else None,
        confidence_det = confidence_det,
        confidence_ocr = confidence_ocr,
        image_path     = image_path,
        crop_path      = crop_path,
        notes          = notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_all_detections(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> List[Detection]:
    """Ambil semua deteksi dengan paginasi."""
    return (
        db.query(Detection)
        .order_by(Detection.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def search_by_plate(db: Session, plate_query: str) -> List[Detection]:
    """Cari deteksi berdasarkan teks plat (partial match)."""
    query = f"%{plate_query.upper().strip()}%"
    return (
        db.query(Detection)
        .filter(Detection.plate_text.like(query))
        .order_by(Detection.timestamp.desc())
        .all()
    )


def get_stats(db: Session) -> Dict[str, Any]:
    """Statistik ringkasan database."""
    total        = db.query(func.count(Detection.id)).scalar() or 0
    by_vehicle   = (
        db.query(Detection.vehicle_type, func.count(Detection.id))
        .group_by(Detection.vehicle_type)
        .all()
    )
    unique_plates = (
        db.query(func.count(func.distinct(Detection.plate_text))).scalar() or 0
    )
    return {
        "total_detections": total,
        "unique_plates":    unique_plates,
        "by_vehicle_type":  {v: c for v, c in by_vehicle if v},
    }


def delete_detection(db: Session, detection_id: int) -> bool:
    """Hapus record berdasarkan ID."""
    record = db.query(Detection).filter(Detection.id == detection_id).first()
    if record:
        db.delete(record)
        db.commit()
        return True
    return False
