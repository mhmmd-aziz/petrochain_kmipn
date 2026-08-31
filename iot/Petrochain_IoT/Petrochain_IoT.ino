#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- KONFIGURASI WIFI ---
const char* ssid = "IMZY HP";
const char* password = "gilagila";

// --- KONFIGURASI API ---
// Ganti IP dengan IP VPS/Server Anda (jika pakai VPS: http://202.155.17.4:8001/api/iot/latest-transaction)
const String apiUrl = "http://202.155.17.4:8001/api/iot/latest-transaction"; 

// --- KONFIGURASI PIN ESP32 ---
#define RELAY_PIN 25
#define LED_GREEN 12
#define LED_RED 13
#define BUZZER_PIN 14

// --- KONFIGURASI RELAY (NC) ---
// Modul relay umumnya Active LOW.
// Karena kita pakai lubang NC (Normally Closed):
// Saat Relay de-energized (IN = HIGH), sirkuit TERSAMBUNG -> Pompa Menyala
// Saat Relay energized (IN = LOW), sirkuit TERPUTUS -> Pompa Mati
#define PUMP_ON HIGH
#define PUMP_OFF LOW

// --- KONFIGURASI OLED ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// --- VARIABEL GLOBAL ---
int lastTxId = -1;
unsigned long lastCheckTime = 0;
const unsigned long checkInterval = 2000; // Cek API setiap 2 detik

// Kalibrasi Pompa (Berapa milidetik untuk 100 ml / 1 Liter di layar?)
// Misal pompa Anda kecepatannya 20 ml per detik. 
// 100 ml = 5000 ms (5 detik).
const int timePerLiter = 5000; 

void setup() {
  Serial.begin(115200);

  // Inisialisasi Pin
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Pastikan pompa mati di awal
  digitalWrite(RELAY_PIN, PUMP_OFF);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, HIGH); // Merah nyala saat standby

  // Inisialisasi OLED
  Wire.begin(21, 22); // SDA = 21, SCL = 22
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("OLED gagal diinisialisasi"));
  }
  
  // Memutar layar 180 derajat untuk menyesuaikan wiring hardware
  display.setRotation(2);
  
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.println("PETROCHAIN IoT");
  display.println("Menghubungkan WiFi...");
  display.display();

  // Koneksi WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Terhubung!");
  
  display.clearDisplay();
  display.setCursor(0, 10);
  display.println("WiFi Connected!");
  display.println("Standby...");
  display.display();
  
  beep(100);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    if (millis() - lastCheckTime > checkInterval) {
      lastCheckTime = millis();
      checkLatestTransaction();
    }
  }
}

void checkLatestTransaction() {
  HTTPClient http;
  http.begin(apiUrl);
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    String payload = http.getString();
    
    // Parsing JSON
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      String status = doc["status"];
      
      if (status == "dispense") {
        int txId = doc["transaction_id"];
        String plateNumber = doc["plate_number"];
        float volumeLiters = doc["volume_liters"];
        
        // Cek apakah ini transaksi baru yang belum kita proses
        if (txId != lastTxId) {
          lastTxId = txId;
          dispenseFuel(plateNumber, volumeLiters);
        }
      }
    }
  }
  http.end();
}

void dispenseFuel(String plate, float liters) {
  // Hitung durasi nyala pompa
  int pumpDurationMs = (int)(liters * timePerLiter);
  int volumeMl = (int)(liters * 100); // 1 Liter = 100 ml di purwarupa

  // Update UI & Indikator
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH);
  beep(200);

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("PENGISIAN BBM");
  
  display.setTextSize(1);
  display.setCursor(0, 16);
  display.print("Plat: ");
  display.println(plate);
  
  display.setCursor(0, 32);
  display.print("Target: ");
  display.print(volumeMl);
  display.println(" ml");
  
  display.setCursor(0, 48);
  display.println("MEMOMPA...");
  display.display();

  // NYALAKAN POMPA
  Serial.println("Pompa ON");
  digitalWrite(RELAY_PIN, PUMP_ON);
  
  // Tunggu sesuai durasi
  delay(pumpDurationMs);
  
  // MATIKAN POMPA
  Serial.println("Pompa OFF");
  digitalWrite(RELAY_PIN, PUMP_OFF);

  // Selesai
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, HIGH);
  
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(10, 20);
  display.println("SELESAI!");
  display.display();
  
  // Bunyikan buzzer tanda selesai
  beep(500);
  delay(200);
  beep(500);
  
  delay(2000); // Tahan layar Selesai sebentar
  
  // Kembali ke Standby
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.println("PETROCHAIN IoT");
  display.println("Standby...");
  display.display();
}

void beep(int duration) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duration);
  digitalWrite(BUZZER_PIN, LOW);
}
