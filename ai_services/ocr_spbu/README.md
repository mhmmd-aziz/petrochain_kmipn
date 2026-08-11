# PlatScan AI 🔍
## Sistem Deteksi Plat Nomor Kendaraan · YOLO + OCR

Sistem otomatis untuk mendeteksi kendaraan menggunakan **YOLOv8** dan membaca plat nomor dengan **EasyOCR**, lalu menyimpan hasilnya ke database.

---

## 📋 Fitur

- ✅ Deteksi kendaraan (mobil, motor, truk, bus) via YOLOv8
- ✅ Crop otomatis area plat nomor
- ✅ OCR pembacaan teks plat (EasyOCR)
- ✅ Simpan ke SQLite database
- ✅ REST API (FastAPI)
- ✅ Web UI dark-mode premium
- ✅ Pencarian & riwayat deteksi

---

## ⚙️ Instalasi

### 1. Buat virtual environment
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Install dependensi
```bash
pip install -r requirements.txt
```

> 💡 Model YOLOv8 (`yolov8n.pt`) akan **otomatis didownload** saat pertama kali dijalankan.

### 3. Jalankan server
```bash
python main.py
```

Server akan berjalan di: **http://localhost:8000**

---

## 🚀 Penggunaan

### Via Web UI
Buka browser → `http://localhost:8000`

1. Upload gambar kendaraan (JPG/PNG/WEBP)
2. Klik **"Deteksi Plat"**
3. Lihat hasil deteksi + plat nomor
4. Semua hasil tersimpan otomatis ke database

### Via API

**Upload & Deteksi:**
```bash
curl -X POST http://localhost:8000/detect \
  -F "file=@gambar_kendaraan.jpg"
```

**Lihat semua hasil:**
```bash
curl http://localhost:8000/results
```

**Cari berdasarkan plat:**
```bash
curl "http://localhost:8000/search?plate=B1234"
```

**Statistik:**
```bash
curl http://localhost:8000/stats
```

---

## 🗂️ Struktur Proyek

```
yolo-ocr-plate/
├── main.py          # FastAPI server (entry point)
├── detector.py      # YOLO detection + crop logic
├── ocr_engine.py    # EasyOCR pembacaan plat
├── database.py      # SQLAlchemy models & queries
├── config.py        # Konfigurasi global
├── requirements.txt
├── models/          # Folder model YOLO (.pt files)
├── uploads/         # Gambar yang diupload
├── crops/           # Hasil crop plat nomor
├── static/
│   └── index.html   # Web UI
└── database/
    └── plates.db    # SQLite database
```

---

## ⚙️ Konfigurasi (`config.py`)

| Parameter | Default | Keterangan |
|-----------|---------|------------|
| `CONFIDENCE_THRESHOLD` | `0.45` | Min confidence YOLO |
| `OCR_GPU` | `False` | Set `True` jika punya GPU NVIDIA |
| `OCR_LANGUAGES` | `["id","en"]` | Bahasa OCR |
| `PLATE_PATTERN` | Regex plat Indonesia | Validasi format plat |

---

## 🔧 Menggunakan Model Plat Khusus

Jika kamu punya model YOLO khusus untuk deteksi plat:
1. Letakkan file `.pt` di folder `models/plate_detector.pt`
2. Sistem otomatis menggunakannya (prioritas di atas heuristic)

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/detect` | Upload gambar & deteksi |
| `GET`  | `/results` | Semua hasil (paginasi) |
| `GET`  | `/search?plate=XX` | Cari berdasarkan plat |
| `GET`  | `/stats` | Statistik ringkasan |
| `DELETE` | `/detection/{id}` | Hapus record |
| `GET`  | `/health` | Health check |

---

## 📦 Dependensi Utama

- `ultralytics` — YOLOv8
- `easyocr` — Optical Character Recognition
- `fastapi` + `uvicorn` — Web framework
- `sqlalchemy` — ORM database
- `opencv-python` — Image processing
- `Pillow` — Image I/O
