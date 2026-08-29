# MEMORI SESI PETROCHAIN IOT (Untuk Dilanjutkan Nanti)

## 1. Status Software (Selesai 100%)
- **Laravel API:** Telah dibuat `IotController.php` di VPS (Port 8001). Berfungsi mengirimkan transaksi terbaru (dalam 2 menit terakhir) dan mencocokkan `transaction_id`.
- **ESP32 Code:** Kode `Petrochain_IoT.ino` sudah selesai. WiFi sudah diset (`IMZY` / `ramadhan`).
- Logika program adalah *Time-Based Dispensing* (Flow Sensor tidak dipakai).

## 2. Status Hardware & Wiring
- **OLED (I2C):** Berjalan sempurna (Tampil tulisan "Standby", "Pompa ON", dll).
- **LED & Buzzer:** Indikator berfungsi dengan baik.
- **Relay & Pompa:** 
  - Bypass tes membuktikan Pompa dan Adaptor 12V dalam kondisi SEHAT.
  - Pompa disambungkan ke baut **NC** (Normally Closed).
  - Masalah: Modul Relay 5V tidak mau mati (*de-energize*) saat diberi sinyal HIGH 3.3V dari ESP32 karena perbedaan voltase.

## 3. Tugas Tertunda (Yang Harus Dilakukan Saat User Bangun)
User perlu mempraktikkan **"Trik LED"** untuk menghentikan arus bocor ke relay.
**Langkah-langkah Trik LED:**
1. VCC Relay wajib dikembalikan ke **VIN (5V)** ESP32.
2. Cabut kabel yang menghubungkan pin **IN Relay** ke **D25 ESP32**.
3. Sambungkan kabel **IN Relay** ke **Kaki Panjang (+)** sebuah LED (bisa pinjam LED Merah/Hijau).
4. Tarik kabel dari **Kaki Pendek (-)** LED tersebut, lalu colokkan ke pin **D25 ESP32**.
5. Colok adaptor 12V ke listrik, nyalakan ESP32, lalu lakukan pengetesan transaksi dari HP.

*(Silakan baca file ini saat Anda bangun nanti untuk mengingat persis sampai mana kita berhenti!)*
