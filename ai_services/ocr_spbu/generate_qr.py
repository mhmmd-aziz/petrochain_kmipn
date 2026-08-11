import subprocess
import sys

# Instal qrcode secara otomatis jika belum ada
try:
    import qrcode
except ImportError:
    print("Menginstall library qrcode...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "qrcode[pil]"])
    import qrcode

print("Membuat QR Code Dummy...")

# QR 1: Asumsi plat yang akan dicocokkan (misal "B 2602 UZZ")
qr_match_text = "B 2602 UZZ"
img_match = qrcode.make(qr_match_text)
img_match.save("qr_match_dummy.png")
print(f"Berhasil membuat 'qr_match_dummy.png' dengan teks: {qr_match_text}")

# QR 2: Plat yang berbeda untuk test unmatch
qr_unmatch_text = "D 9999 ABC"
img_unmatch = qrcode.make(qr_unmatch_text)
img_unmatch.save("qr_unmatch_dummy.png")
print(f"Berhasil membuat 'qr_unmatch_dummy.png' dengan teks: {qr_unmatch_text}")
