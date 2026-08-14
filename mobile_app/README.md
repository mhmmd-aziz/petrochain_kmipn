# Mobile App - PETROCHAIN ⛽

Aplikasi Android native (Kotlin) untuk ekosistem PETROCHAIN.

## Dua Role dalam Satu Aplikasi

| Role | Fitur |
|------|-------|
| **Masyarakat** (`public`) | Daftar kendaraan, upload STNK, lihat QR Code |
| **Operator SPBU** (`operator`) | Scan QR pelanggan, validasi plat nomor via AI |

## Tech Stack
- **Language:** Kotlin
- **Min SDK:** 24 (Android 7.0+)
- **Architecture:** MVVM + Repository Pattern
- **Networking:** Retrofit2 + OkHttp3 (Sanctum Token)
- **Image Loading:** Coil
- **QR Code:** ZXing (scan & display)
- **UI:** Material Design 3

## Cara Menjalankan

### 1. Buka di Android Studio
```
File → Open → pilih folder mobile_app/
```
Android Studio akan otomatis sync Gradle dan download dependencies.

### 2. Konfigurasi Base URL
Edit `app/src/main/java/com/petrochain/app/util/Constants.kt`:
```kotlin
// Untuk emulator:
const val BASE_URL = "http://10.0.2.2:8000/api/"

// Untuk HP riil (ganti dengan IP komputer Anda):
const val BASE_URL = "http://192.168.1.5:8000/api/"
```

### 3. Pastikan Backend Berjalan
```bash
cd web_portal
php artisan serve
```

### 4. Run
Pilih device/emulator → klik ▶️ Run.

## Struktur Proyek

```
app/src/main/java/com/petrochain/app/
├── PetrochainApp.kt              # Application class
├── data/
│   ├── api/                      # Retrofit (ApiService, AuthInterceptor)
│   ├── model/                    # Data classes (request/response)
│   └── repository/               # Auth, Vehicle, Spbu repos
├── ui/
│   ├── auth/                     # Login
│   ├── main/                     # MainActivity + Navigation
│   ├── home/                     # Dashboard masyarakat
│   ├── vehicles/                 # Daftar kendaraan + adapter
│   ├── register/                 # Form pendaftaran + upload
│   ├── qrcode/                   # Tampilan QR Code
│   ├── spbu/                     # Dashboard, Scanner, Validasi
│   └── profile/                  # Profil + logout
└── util/                         # TokenManager, Constants, Extensions
```

## API Endpoints yang Digunakan

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/login` | Login, mendapat Sanctum token |
| GET | `/api/user` | Profil user aktif |
| POST | `/api/logout` | Hapus token sesi |
| GET | `/api/my-vehicles` | Daftar kendaraan + status |
| POST | `/api/register-vehicle` | Daftar baru (multipart) |
| POST | `/api/spbu/validate-qr` | Validasi QR pelanggan |
| POST | `/api/spbu/validate-vehicle` | Validasi plat via AI (multipart) |

---
*Dibangun oleh TIMBERAPA — Politeknik Negeri Lhokseumawe*
