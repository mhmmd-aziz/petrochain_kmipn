# 🏗️ Arsitektur PETROCHAIN (Intelligent Fuel Subsidy Ecosystem)

Dokumen ini menjelaskan secara komprehensif arsitektur sistem, struktur repositori, dan topologi *deployment* (VPS) dari ekosistem **PETROCHAIN**. Sistem ini dirancang untuk kompetisi KMIPN sebagai solusi cerdas berbasis AI dan Blockchain guna mengawal distribusi BBM Bersubsidi secara tepat sasaran dan anti-fraud.

---

## 1. 🧩 Komponen Sistem Utama

PETROCHAIN mengadopsi arsitektur *microservices* terdesentralisasi yang terdiri dari beberapa komponen utama:

### A. Web Portal & Backend (Laravel + React/Inertia)
Berfungsi sebagai *Command Center* bagi BPH Migas, Pertamina, dan Pemilik SPBU, serta API pusat untuk seluruh ekosistem.
- **Framework**: Laravel 11 (PHP 8.3)
- **Frontend**: React.js + Inertia.js + Tailwind CSS
- **Database**: MySQL 8.0
- **Tugas**: Manajemen SPBU, Kuota BBM, Verifikasi STNK (Admin), dan penyedia REST API untuk Mobile App & AI.

### B. Mobile Application (Native Android)
Aplikasi yang digunakan oleh dua aktor utama di lapangan:
- **Teknologi**: Kotlin (Native Android)
- **Aktor Publik**: Mendaftarkan kendaraan, mengunggah foto STNK, dan menampilkan QR Code Subsidi.
- **Aktor Operator SPBU**: Melakukan *scan* QR Code pelanggan dan memvalidasi transaksi pengisian BBM di dispenser.

### C. AI Vision Services (Python)
Layanan kecerdasan buatan berbasis *Edge/Cloud* yang terpisah untuk memastikan latensi rendah:
- **OCR Mobile**: Mengekstrak data STNK (Nomor Plat, Masa Berlaku, CC Kendaraan) saat pendaftaran warga.
- **OCR SPBU**: Membaca plat nomor kendaraan secara *real-time* lewat CCTV/Kamera di dispenser SPBU.
- **YOLO Vehicle Classification**: Mengklasifikasikan jenis motor dan mendeteksi fisik kapasitas mesin (under/over 250cc) untuk memvalidasi kelayakan subsidi secara otomatis saat pengisian.

### D. Blockchain Node (Hyperledger / Hardhat)
- **Teknologi**: Node Blockchain lokal/Hardhat.
- **Fungsi**: Mencatat setiap transaksi sukses (Audit Trail) menggunakan enkripsi *hash* SHA-256. Data yang tercatat bersifat *immutable* (tidak bisa dimanipulasi atau dihapus), menjamin transparansi absolut.

---

## 2. 📂 Struktur Repositori (Monorepo)

Semua layanan di atas disimpan dalam satu repositori terpadu (*monorepo*) dengan struktur pembagian folder sebagai berikut:

```text
petrochain/
├── ai_services/          # Layanan AI (Python, Flask/FastAPI)
│   ├── ocr_mobile/       # Modul ekstraksi teks STNK
│   ├── ocr_spbu/         # Modul deteksi plat nomor SPBU
│   └── klasifikasi_motor/# Model YOLO untuk deteksi CC fisik kendaraan
├── mobile_app/           # Aplikasi Native Android (Kotlin)
├── web_portal/           # Backend & Frontend Web (Laravel + React)
└── ARCHITECTURE.md       # Dokumen arsitektur ini
```

---

## 3. 🌐 Topologi Deployment (VPS & Docker)

Sistem Petrochain menggunakan arsitektur *deployment* modern yang sangat *scalable*, aman, dan terotomatisasi secara penuh melalui **GitHub Actions** dan **Docker**.

### Spesifikasi Server
- **Provider**: Rumahweb Indonesia
- **OS**: AlmaLinux / CentOS (Turunan RedHat)
- **RAM**: 8GB
- **Domain**: `petrochain.my.id`

### Arsitektur Container di VPS
Seluruh aplikasi di- *deploy* dalam wujud **Docker Containers**. VPS memisahkan jalur *traffic* secara cerdas:

1. **Nginx Proxy Manager (Pintu Gerbang - Port 80 & 443)**
   - Menangani *Routing* domain (petrochain.my.id).
   - Menangani SSL/HTTPS dari *Let's Encrypt*.
   - Meneruskan *traffic* ke container aplikasi yang tepat.

2. **Jaringan Internal Petrochain (Docker Bridge Network)**
   Semua container Petrochain saling berkomunikasi di dalam jaringan tertutup dan aman:
   - `petrochain_web`: Web Server (Nginx) khusus menyajikan aplikasi Laravel. Di- *expose* ke port `8001` untuk ditembak oleh Proxy Manager.
   - `petrochain_app`: Container PHP-FPM yang menjalankan logika Laravel. Berbagi *Volume* penyimpanan gambar dengan `petrochain_web`.
   - `petrochain_db`: Database MySQL yang datanya diproteksi dan disimpan permanen di *Docker Volume* host.
   - `petrochain_ai_*`: Container terpisah untuk masing-masing AI (OCR, YOLO) yang berkomunikasi dengan `petrochain_app` secara internal.
   - `petrochain_blockchain`: Node blockchain yang berjalan secara mandiri di dalam sistem.

3. **Multi-Tenant Hosting (Proyek Eksternal: pangankreatif.my.id)**
   VPS ini didesain tangguh untuk menampung lebih dari satu aplikasi (*Multi-Tenant*) tanpa risiko saling bertabrakan. Selain ekosistem Petrochain, VPS ini juga menyediakan *hosting* terisolasi untuk aplikasi kawan (Pangan Kreatif) dengan rincian:
   - **Domain**: `pangankreatif.my.id`
   - **Backend**: Node.js + Express.js + Prisma ORM
   - **Frontend**: Next.js + React + TypeScript + Tailwind CSS
   - **Database**: PostgreSQL (Di-*host* secara eksternal menggunakan **Supabase**).
   - **CI/CD Pipeline**: Menggunakan *GitHub Actions* tersendiri untuk *auto-deploy* yang sepenuhnya terpisah dari repository Petrochain, sehingga proses rilis aplikasi ini sama sekali tidak mengganggu atau mematikan sistem Petrochain.
   - **Routing**: Nginx Proxy Manager mengarahkan *traffic* domain tersebut ke port yang benar-benar berbeda (misal: port `8002`), memastikan isolasi 100% dari *traffic* Petrochain.

### Skema CI/CD (Continuous Integration / Continuous Deployment)
Sistem menggunakan pendekatan **Zero-Downtime Auto Deployment**:
1. **Push Code**: Developer melakukan `git push` ke GitHub.
2. **GitHub Actions (CI)**: GitHub secara otomatis mem- *build* Docker Image terbaru dari kode (baik Web maupun AI) dan mempublikasikannya ke *GitHub Container Registry (GHCR)*.
3. **Watchtower (CD)**: Container `watchtower` yang selalu *standby* di VPS akan mendeteksi adanya image baru di GHCR setiap 5 menit. Jika ada, Watchtower otomatis mengunduhnya dan me- *restart* aplikasi di VPS tanpa intervensi manual (Hands-free deployment).

---

## 4. 🛡️ Keamanan & Alur Data (Data Flow)

1. **Data Transit**: Seluruh komunikasi antara Mobile App warga, Operator SPBU, dan Web API dilindungi enkripsi **HTTPS (SSL)**.
2. **Isolasi Database**: Port database (`3306`) tidak dibuka ke publik internet. Database hanya bisa diakses oleh `petrochain_app` melalui jaringan internal Docker.
3. **Penyimpanan Permanen (Data Persistence)**: Segala data krusial seperti foto STNK, NIK, dan database MySQL tidak disimpan di dalam siklus hidup container, melainkan diikat ( *mount* ) langsung ke *Volume* hardisk VPS. 
4. **Audit Anti-Fraud**: Saat operator selesai men-scan QR, hasil AI YOLO (kamera fisik) dan data kuota DB akan dicocokkan. Apabila lolos, *Smart Contract* akan mencatat log transaksi ke Blockchain.
