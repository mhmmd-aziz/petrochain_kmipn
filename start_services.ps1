# Script untuk menjalankan 3 AI Service secara bersamaan

$baseDir = "e:\KMIPN\AI\petrochain\ai_services"

Write-Host "Menjalankan AI Klasifikasi Motor (Port 5001)..." -ForegroundColor Cyan
Start-Process "python" -ArgumentList "app.py" -WorkingDirectory "$baseDir\klasifikasi_motor" -WindowStyle Normal

Write-Host "Menjalankan AI OCR Mobile (Port 5002)..." -ForegroundColor Green
Start-Process "python" -ArgumentList "app.py" -WorkingDirectory "$baseDir\ocr_mobile" -WindowStyle Normal

Write-Host "Menjalankan AI OCR SPBU (Port 5003)..." -ForegroundColor Yellow
Start-Process "python" -ArgumentList "main.py" -WorkingDirectory "$baseDir\ocr_spbu" -WindowStyle Normal

Write-Host "Semua AI Service telah dihidupkan di jendela terminal terpisah!" -ForegroundColor Magenta
Write-Host "Tutup jendela tersebut secara manual jika ingin mematikan AI." -ForegroundColor Gray
