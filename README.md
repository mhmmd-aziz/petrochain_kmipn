# PETROCHAIN - Ecosystem Repository 🚀

**PETROCHAIN** adalah Platform Intelligent Verification dan Audit untuk Penguatan Distribusi BBM Bersubsidi, dirancang secara spesifik sebagai ekstensi (layer tambahan) untuk ekosistem **MyPertamina**.

Proyek ini dibangun oleh **TIMBERAPA** dari **Politeknik Negeri Lhokseumawe** (KMIPN 2026).

---

## 📖 Deskripsi Sistem
PETROCHAIN mengatasi masalah penyalahgunaan BBM bersubsidi dengan sistem verifikasi berlapis:
1. **Verifikasi Kendaraan:** AI mengklasifikasikan apakah kendaraan (motor) layak menerima subsidi berdasarkan kapasitas mesin (Under/Over 250cc).
2. **Verifikasi Identitas:** OCR membaca STNK dan plat nomor dari gambar/kamera secara real-time.
3. **Keamanan Transaksi:** Setiap transaksi BBM dicatat ke dalam jaringan **Blockchain (Hyperledger Fabric)** untuk mencegah manipulasi data dan memberikan jejak audit (Audit Trail) yang transparan.

---

## 🛠️ Arsitektur & Teknologi (Tech Stack)

Sistem ini dibangun dengan pendekatan **Microservices**:

### 1. Web Portal & Admin Dashboard (`/web_portal`)
- **Backend:** Laravel 12 (PHP 8.3+)
- **Frontend:** React + Inertia.js + Tailwind CSS
- **Database:** MySQL 8.0
- **Fungsi:** Dashboard admin SPBU, manajemen kuota, verifikasi pendaftaran kendaraan, laporan transaksi.

### 2. AI Services (`/ai_services`)
- **Framework:** Python (Flask/FastAPI)
- **Computer Vision:** YOLO (Object Detection), OpenCV
- **OCR Engine:** Tesseract / PaddleOCR
- **Modul:**
  - `klasifikasi_motor` (Port 5001) - Klasifikasi kapasitas mesin motor.
  - `ocr_mobile` (Port 5002) - Ekstraksi teks STNK pengguna via mobile.
  - `ocr_spbu` (Port 5003) - Deteksi Plat Nomor real-time via CCTV SPBU.

### 3. Mobile App (`/mobile_app`)
- **Teknologi:** Kotlin / Android Native
- **Fungsi:** Aplikasi untuk masyarakat mendaftarkan kendaraan, mengunggah foto STNK, dan mendapatkan QR Code verifikasi.

### 4. Blockchain Network (`/blockchain`)
- **Teknologi:** Hyperledger Fabric
- **Fungsi:** Mencatat hash transaksi sukses yang telah diverifikasi oleh AI untuk audit anti-fraud.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Menjalankan AI Services
Gunakan script PowerShell yang telah disediakan untuk menyalakan ketiga service AI sekaligus:
```bash
cd petrochain
.\start_services.ps1
```

### Menjalankan Web Portal
Pastikan MySQL sudah berjalan (via Laragon/XAMPP).
```bash
cd petrochain/web_portal
composer install
npm install
php artisan migrate
npm run dev
php artisan serve
```

---

## 📄 Catatan Penting untuk Developer
1. **Model AI & Dataset:** File model (`*.pt`) dan *dataset* berukuran besar TIDAK diunggah ke GitHub ini (sudah di-ignore oleh `.gitignore`). Jika Anda baru melakukan clone, pastikan meminta file `best.pt` kepada admin AI dan meletakkannya di folder AI yang sesuai.
2. **Dokumen Referensi:** Anda wajib membaca panduan utama arsitektur dan sistem yang ada di file **`CLAUDE.md`** di root folder ini sebelum melanjutkan pengembangan.
3. **Database:** Struktur lengkap relasi antar tabel bisa dilihat pada migrasi Laravel.

---
*Dibangun dengan ❤️ oleh TIMBERAPA.*
