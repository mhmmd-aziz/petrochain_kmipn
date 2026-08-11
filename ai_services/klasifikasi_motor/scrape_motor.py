"""
============================================================
  MOTOR IMAGE SCRAPER FOR YOLO TRAINING
  Scraping 50-100 gambar per kelas motor dari DuckDuckGo & Bing
  
  Install dependencies:
      pip install ddgs requests pillow tqdm
============================================================
"""

import os
import sys
import time
import hashlib
import requests
import shutil
import random
from pathlib import Path
from tqdm import tqdm
from PIL import Image
import io

# Fix encoding emoji untuk Windows terminal
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ─── KONFIGURASI ────────────────────────────────────────────
OUTPUT_DIR    = "dataset_motor"   # folder output
IMAGES_TARGET = 75                # target gambar per kelas (50–100)
MIN_SIZE_KB   = 10                # abaikan gambar < 10 KB
IMAGE_SIZE    = (640, 640)        # resize output untuk YOLO
DELAY_SEC     = 1.5               # delay antar request (jangan terlalu cepat)
# ─────────────────────────────────────────────────────────────

# ─── DAFTAR MOTOR (Brand → Kategori → Model) ─────────────────
MOTOR_LIST = {
    "Yamaha": {
        "Sport": ["YZF-R25", "YZF-R3", "MT-25", "MT-03"],
        "Adventure_Touring": ["Tenere 700", "Tracer 9 GT"],
        "Maxi_Scooter": ["XMAX 250", "TMAX 530", "TMAX 560"],
    },
    "Honda": {
        "Sport": ["CBR250R", "CBR250RR", "CBR500R", "CBR650R",
                  "CBR600RR", "CBR1000RR Fireblade", "CBR1000RR-R Fireblade SP"],
        "Naked": ["CB250R", "CB300R", "CB500F", "CB650R", "CB1000R", "Hornet 750"],
        "Adventure": ["CRF250 Rally", "CRF300 Rally", "CRF250L",
                      "CRF300L", "CRF1100L Africa Twin"],
        "Adventure_Scooter": ["X-ADV 750"],
        "Maxi_Scooter": ["Forza 250", "Forza 350"],
        "Cruiser": ["Rebel 500", "Rebel 1100"],
    },
    "Kawasaki": {
        "Sport": ["Ninja 250", "Ninja 250SL", "Ninja ZX-25R", "Ninja ZX-4RR",
                  "Ninja ZX-4R", "Ninja ZX-6R", "Ninja ZX-10R",
                  "Ninja H2 SX", "Ninja H2", "Ninja H2 Carbon"],
        "Naked": ["Z250", "Z300", "Z400", "Z650", "Z650RS",
                  "Z900", "Z900RS", "Z1000", "Z H2"],
        "Adventure": ["Versys-X 250", "Versys 650", "Versys 1000", "KLR650"],
        "Dual_Purpose": ["KLX230R", "KLX250", "KLX300", "KX250", "KX450"],
        "Cruiser": ["Vulcan S 650"],
        "Retro": ["W800"],
    },
    "Suzuki": {
        "Sport": ["Gixxer 250", "Gixxer SF 250", "GSX250R",
                  "GSX-8R", "GSX-R600", "GSX-R750", "GSX-R1000"],
        "Naked": ["GSX-S250", "GSX-S750", "GSX-S1000", "GSX-8S"],
        "Adventure": ["V-Strom 250 SX", "V-Strom 650",
                      "V-Strom 800DE", "V-Strom 1050"],
        "Cruiser": ["Boulevard M109R"],
        "Hyperbike": ["Hayabusa 1300"],
    },
    "KTM": {
        "Naked": ["Duke 250", "Duke 390", "Duke 790", "Duke 890", "Duke 990",
                  "Super Duke R 1290"],
        "Sport": ["RC 390"],
        "Adventure": ["Adventure 250", "Adventure 390",
                      "Adventure 790", "Adventure 890"],
    },
    "Husqvarna": {
        "Naked": ["Svartpilen 250", "Svartpilen 401",
                  "Vitpilen 250", "Vitpilen 401"],
        "Adventure": ["Norden 901"],
    },
    "BMW_Motorrad": {
        "Sport": ["G310R", "G310GS", "S1000RR", "M1000RR"],
        "Adventure": ["F750GS", "F850GS", "F900GS", "R1250GS", "R1300GS"],
        "Touring": ["R1250RT", "K1600GT", "K1600GTL"],
        "Scooter": ["C400X", "C400GT"],
        "Roadster": ["F900R", "R1250R"],
    },
    "Benelli": {
        "Naked": ["TNT25", "TNT250", "Leoncino 250", "Leoncino 500",
                  "TRK251", "TRK502", "502C", "Imperiale 400", "752S"],
    },
    "CFMOTO": {
        "Naked": ["250 NK", "300 NK", "450 NK", "650 NK", "800 NK"],
        "Sport": ["450 SR"],
        "Adventure": ["450 MT", "650 MT", "800 MT"],
        "Retro": ["700 CL-X"],
        "Touring": ["650 GT"],
    },
    "QJMotor": {
        "Naked": ["Fort 250", "SRV250", "SRV250 Libero", "SRV250 AMT", "SRV600V"],
        "Adventure": ["Fort 250 Adventure"],
        "Sport": ["SRK800RR"],
        "Touring": ["Tourino 700 SX"],
    },
    "Moto_Guzzi": {
        "Retro": ["V7 Stone"],
        "Adventure": ["V85 TT"],
        "Naked": ["V100 Mandello"],
    },
    "Ducati": {
        "Sport": ["Panigale V2", "Panigale V4", "SuperSport 950"],
        "Naked": ["Monster", "Streetfighter V2", "Streetfighter V4"],
        "Adventure": ["Multistrada V2", "Multistrada V4", "DesertX"],
        "Scrambler": ["Scrambler Icon", "Scrambler Full Throttle",
                      "Scrambler Nightshift"],
        "Cruiser": ["Diavel V4", "XDiavel"],
    },
    "Triumph": {
        "Naked": ["Speed 400", "Trident 660",
                  "Street Triple 765", "Speed Triple 1200"],
        "Adventure": ["Tiger Sport 660", "Tiger 900", "Tiger 1200"],
        "Scrambler": ["Scrambler 400 X", "Scrambler 900"],
        "Retro": ["Bonneville T100", "Bonneville T120"],
        "Cruiser": ["Rocket 3"],
    },
    "Royal_Enfield": {
        "Retro": ["Classic 350", "Hunter 350", "Meteor 350", "Bullet 350"],
        "Adventure": ["Himalayan 450", "Guerrilla 450"],
        "Cafe_Racer": ["Interceptor 650", "Continental GT 650",
                       "Super Meteor 650", "Shotgun 650"],
    },
    "Harley_Davidson": {
        "Sport": ["Sportster S", "Nightster"],
        "Cruiser": ["Street Bob", "Fat Bob", "Fat Boy", "Breakout",
                    "Heritage Classic", "Low Rider S", "Low Rider ST"],
        "Adventure": ["Pan America 1250"],
        "Touring": ["Road Glide", "Street Glide", "Road King"],
    },
    "Indian_Motorcycle": {
        "Cruiser": ["Scout", "Scout Bobber", "Chief",
                    "Springfield", "Chieftain"],
        "Touring": ["Challenger", "Pursuit", "Roadmaster"],
        "Naked": ["FTR"],
    },
    "Aprilia": {
        "Sport": ["RS457", "RS660", "RSV4"],
        "Naked": ["Tuono 457", "Tuono 660", "Tuono V4"],
        "Adventure": ["Tuareg 660"],
    },
    "Moto_Morini": {
        "Adventure": ["X-Cape 650"],
        "Retro": ["Seiemmezzo STR", "Seiemmezzo SCR", "Calibro"],
    },
    "MV_Agusta": {
        "Naked": ["Brutale 800", "Dragster 800"],
        "Sport": ["F3 800", "Superveloce"],
        "Touring": ["Turismo Veloce"],
    },
}


# ─── FUNGSI UTILITAS ──────────────────────────────────────────

def make_class_name(brand: str, model: str) -> str:
    """Buat nama kelas YOLO: brand_model (snake_case, tanpa spasi/karakter aneh)."""
    raw = f"{brand}_{model}"
    clean = raw.replace(" ", "_").replace("-", "_").replace("/", "_")
    clean = "".join(c for c in clean if c.isalnum() or c == "_")
    return clean.lower()


def make_search_query(brand: str, model: str) -> str:
    """Buat query pencarian gambar motor."""
    brand_clean = brand.replace("_", " ")
    queries = [
        f"{brand_clean} {model} motorcycle",
        f"{brand_clean} {model} motor",
        f"{brand_clean} {model} side view",
        f"{brand_clean} {model} official",
    ]
    return random.choice(queries)


def image_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def is_valid_image(data: bytes) -> bool:
    """Cek apakah bytes adalah gambar valid dan ukurannya cukup."""
    if len(data) < MIN_SIZE_KB * 1024:
        return False
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        return True
    except Exception:
        return False


def save_image(data: bytes, save_path: Path) -> bool:
    """Simpan gambar, resize ke IMAGE_SIZE, konversi ke RGB JPG."""
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        img = img.resize(IMAGE_SIZE, Image.LANCZOS)
        img.save(str(save_path), "JPEG", quality=90)
        return True
    except Exception:
        return False


# ─── SCRAPER MENGGUNAKAN DUCKDUCKGO ──────────────────────────

def scrape_duckduckgo(query: str, save_dir: Path,
                       target: int, existing_hashes: set) -> int:
    """
    Scraping gambar dari DuckDuckGo Image Search (library: ddgs).
    Return: jumlah gambar yang berhasil disimpan.
    """
    try:
        from ddgs import DDGS
    except ImportError:
        print("  [!] Install: pip install ddgs")
        return 0

    saved = 0
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    }

    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(
                query,
                max_results=target + 30,   # ambil lebih banyak sebagai cadangan
            ))
    except Exception as e:
        print(f"  [!] DDG error: {e}")
        return 0

    for res in results:
        if saved >= target:
            break
        url = res.get("image", "")
        if not url:
            continue
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                continue
            data = resp.content
            if not is_valid_image(data):
                continue
            h = image_hash(data)
            if h in existing_hashes:
                continue
            existing_hashes.add(h)
            fname = save_dir / f"{h[:16]}.jpg"
            if save_image(data, fname):
                saved += 1
            time.sleep(random.uniform(0.3, 0.8))
        except Exception:
            continue

    return saved


def scrape_bing(query: str, save_dir: Path,
                target: int, existing_hashes: set) -> int:
    """
    Fallback scraping dari Bing Image Search (tanpa API).
    Return: jumlah gambar yang berhasil disimpan.
    """
    import urllib.parse
    import re

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    }
    saved = 0
    offset = 0

    while saved < target:
        enc_q = urllib.parse.quote(query)
        url = (
            f"https://www.bing.com/images/search"
            f"?q={enc_q}&first={offset}&count=30"
            f"&qft=+filterui:imagesize-large"
            f"&form=IRFLTR"
        )
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code != 200:
                break
            # Ekstrak URL gambar dari response HTML
            img_urls = re.findall(r'"murl":"(https?://[^"]+)"', resp.text)
            if not img_urls:
                break
            for img_url in img_urls:
                if saved >= target:
                    break
                try:
                    r = requests.get(img_url, headers=headers, timeout=10)
                    if r.status_code != 200:
                        continue
                    data = r.content
                    if not is_valid_image(data):
                        continue
                    h = image_hash(data)
                    if h in existing_hashes:
                        continue
                    existing_hashes.add(h)
                    fname = save_dir / f"bing_{h[:16]}.jpg"
                    if save_image(data, fname):
                        saved += 1
                    time.sleep(random.uniform(0.3, 0.8))
                except Exception:
                    continue
            offset += 30
            time.sleep(DELAY_SEC)
        except Exception as e:
            print(f"  [!] Bing error: {e}")
            break

    return saved


# ─── FUNGSI UTAMA ─────────────────────────────────────────────

def scrape_motor(brand: str, category: str, model: str):
    """Scraping gambar untuk satu model motor."""
    class_name = make_class_name(brand, model)
    save_dir   = Path(OUTPUT_DIR) / class_name
    save_dir.mkdir(parents=True, exist_ok=True)

    # Hitung gambar yang sudah ada
    existing = list(save_dir.glob("*.jpg"))
    existing_hashes: set = set()
    for f in existing:
        try:
            existing_hashes.add(image_hash(f.read_bytes()))
        except Exception:
            pass

    already_have = len(existing)
    if already_have >= IMAGES_TARGET:
        print(f"  ✓ Skip ({already_have} gambar sudah ada): {class_name}")
        return already_have

    need = IMAGES_TARGET - already_have
    print(f"\n  ⟶ [{brand} / {category}] {model}  |  butuh {need} gambar lagi...")

    query  = make_search_query(brand, model)
    total  = already_have

    # Coba DuckDuckGo dulu
    got = scrape_duckduckgo(query, save_dir, need, existing_hashes)
    total += got
    print(f"     DDG: +{got} gambar  (total: {total})")

    # Kalau masih kurang, pakai Bing sebagai fallback
    if total < IMAGES_TARGET:
        still_need = IMAGES_TARGET - total
        print(f"     Bing fallback: butuh {still_need} lagi...")
        # Coba query berbeda untuk variasi
        alt_query = f"{brand.replace('_', ' ')} {model} bike photo"
        got2 = scrape_bing(alt_query, save_dir, still_need, existing_hashes)
        total += got2
        print(f"     Bing: +{got2} gambar  (total: {total})")

    print(f"  ✓ Selesai: {class_name}  →  {total} gambar")
    return total


def generate_class_list():
    """Simpan daftar kelas YOLO ke file classes.txt."""
    classes = []
    for brand, categories in MOTOR_LIST.items():
        for cat, models in categories.items():
            for model in models:
                classes.append(make_class_name(brand, model))
    classes.sort()

    out = Path(OUTPUT_DIR) / "classes.txt"
    out.write_text("\n".join(classes), encoding="utf-8")
    print(f"\n📄 classes.txt disimpan: {len(classes)} kelas")
    return classes


def generate_summary_report(results: dict):
    """Buat laporan ringkasan scraping."""
    report_path = Path(OUTPUT_DIR) / "scraping_report.txt"
    lines = ["=" * 60, "LAPORAN SCRAPING GAMBAR MOTOR UNTUK YOLO", "=" * 60, ""]

    total_images = 0
    ok_classes   = 0
    fail_classes = []

    for class_name, count in sorted(results.items()):
        status = "✓" if count >= IMAGES_TARGET * 0.8 else "⚠"
        lines.append(f"  {status}  {class_name:<50} {count:>4} gambar")
        total_images += count
        if count >= IMAGES_TARGET * 0.8:
            ok_classes += 1
        else:
            fail_classes.append(class_name)

    lines += [
        "",
        "=" * 60,
        f"Total kelas   : {len(results)}",
        f"Kelas OK (≥80%): {ok_classes}",
        f"Kelas kurang  : {len(fail_classes)}",
        f"Total gambar  : {total_images}",
        "=" * 60,
    ]
    if fail_classes:
        lines.append("\nKelas yang kurang gambar:")
        for c in fail_classes:
            lines.append(f"  - {c}: {results[c]} gambar")

    report_path.write_text("\n".join(lines), encoding="utf-8")
    print("\n" + "\n".join(lines[-12:]))
    print(f"\n📊 Laporan lengkap: {report_path}")


def main():
    print("=" * 60)
    print("  MOTOR IMAGE SCRAPER — YOLO DATASET")
    print(f"  Target: {IMAGES_TARGET} gambar/kelas")
    print(f"  Output: {Path(OUTPUT_DIR).resolve()}")
    print("=" * 60)

    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    # Hitung total kelas
    total_classes = sum(
        len(models)
        for categories in MOTOR_LIST.values()
        for models in categories.values()
    )
    print(f"\n📋 Total kelas motor: {total_classes}")
    print(f"📦 Estimasi total gambar: ~{total_classes * IMAGES_TARGET}\n")

    generate_class_list()

    results = {}
    class_idx = 0

    for brand, categories in MOTOR_LIST.items():
        print(f"\n{'─'*50}")
        print(f"🏍  Brand: {brand.replace('_', ' ')}")
        print(f"{'─'*50}")

        for category, models in categories.items():
            for model in models:
                class_idx += 1
                class_name = make_class_name(brand, model)
                print(f"\n[{class_idx}/{total_classes}]", end="")
                count = scrape_motor(brand, category, model)
                results[class_name] = count
                # Delay antar model
                time.sleep(DELAY_SEC)

    generate_summary_report(results)
    print("\n✅ Scraping selesai!")


if __name__ == "__main__":
    main()
