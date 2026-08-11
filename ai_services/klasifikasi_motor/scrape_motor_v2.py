"""
============================================================
  MOTOR IMAGE SCRAPER V2 — QUERY LEBIH SPESIFIK
  Fix: gambar mobil masuk karena query terlalu umum.
  
  Perbaikan:
  1. Query selalu include kata "motorcycle" / "motorbike"
  2. Query include brand secara eksplisit
  3. Skip gambar yang aspect ratio tidak masuk akal
  4. Skip gambar yang terlalu kecil
  5. Resume otomatis (skip kelas yang sudah >= target)
  
  Install:
      pip install ddgs requests pillow tqdm
============================================================
"""

import os
import sys
import time
import hashlib
import requests
import random
import re
import urllib.parse
from pathlib import Path
from PIL import Image
import io

# Fix encoding emoji Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ─── KONFIGURASI ────────────────────────────────────────────
OUTPUT_DIR    = "dataset_motor"
IMAGES_TARGET = 75
MIN_SIZE_KB   = 15          # min 15 KB
IMAGE_SIZE    = (640, 640)
DELAY_SEC     = 1.5
MIN_WIDTH     = 200         # lebar minimal piksel
MIN_HEIGHT    = 150         # tinggi minimal piksel
# ─────────────────────────────────────────────────────────────

# ─── DAFTAR MOTOR ────────────────────────────────────────────
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
        "Naked": ["Duke 250", "Duke 390", "Duke 790", "Duke 890",
                  "Duke 990", "Super Duke R 1290"],
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

# ─── KATEGORI → KEYWORD EKSTRA ────────────────────────────────
CATEGORY_KEYWORDS = {
    "Sport":            "sport motorcycle superbike",
    "Naked":            "naked motorcycle streetfighter bike",
    "Adventure":        "adventure motorcycle ADV",
    "Adventure_Touring":"adventure touring motorcycle",
    "Maxi_Scooter":     "maxi scooter",
    "Adventure_Scooter":"adventure scooter",
    "Cruiser":          "cruiser motorcycle",
    "Dual_Purpose":     "dual sport motorcycle enduro",
    "Retro":            "retro classic motorcycle",
    "Touring":          "touring motorcycle",
    "Roadster":         "roadster motorcycle",
    "Scooter":          "scooter",
    "Hyperbike":        "hyperbike superbike",
    "Scrambler":        "scrambler motorcycle",
    "Cafe_Racer":       "cafe racer motorcycle",
}


# ─── FUNGSI HELPER ────────────────────────────────────────────

def make_class_name(brand: str, model: str) -> str:
    raw   = f"{brand}_{model}"
    clean = raw.replace(" ", "_").replace("-", "_").replace("/", "_")
    clean = "".join(c for c in clean if c.isalnum() or c == "_")
    return clean.lower()


def make_queries(brand: str, model: str, category: str) -> list[str]:
    """
    Buat beberapa query yang SANGAT SPESIFIK untuk menghindari gambar mobil.
    Selalu sertakan kata 'motorcycle' / 'motorbike'.
    """
    b = brand.replace("_", " ")
    cat_kw = CATEGORY_KEYWORDS.get(category, "motorcycle")

    return [
        f"{b} {model} motorcycle official photo",
        f"{b} {model} motorbike side view",
        f"{b} {model} {cat_kw} 2024",
        f"{b} {model} motorcycle white background",
        f'"{b} {model}" motorcycle',
        f"{b} {model} bike studio photo",
    ]


def image_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def is_valid_motorcycle_image(data: bytes) -> tuple[bool, str]:
    """
    Validasi gambar:
    - Ukuran file cukup
    - Bisa dibuka sebagai gambar
    - Dimensi minimal
    - Aspect ratio wajar (bukan portrait terlalu sempit)
    """
    if len(data) < MIN_SIZE_KB * 1024:
        return False, "terlalu kecil (file size)"
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()

        # Buka ulang setelah verify (verify menutup stream)
        img = Image.open(io.BytesIO(data))
        w, h = img.size

        if w < MIN_WIDTH or h < MIN_HEIGHT:
            return False, f"resolusi terlalu kecil ({w}x{h})"

        ratio = w / h
        # Motor: umumnya landscape 1.2–3.0, bisa sedikit lebih lebar
        if ratio < 0.6:
            return False, f"aspect ratio terlalu portrait ({ratio:.2f})"
        if ratio > 4.5:
            return False, f"aspect ratio terlalu wide ({ratio:.2f})"

        return True, "OK"
    except Exception as e:
        return False, f"gambar rusak: {e}"


def save_image(data: bytes, save_path: Path) -> bool:
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        img = img.resize(IMAGE_SIZE, Image.LANCZOS)
        img.save(str(save_path), "JPEG", quality=90)
        return True
    except Exception:
        return False


# ─── SCRAPER DUCKDUCKGO ──────────────────────────────────────

def scrape_ddgs(query: str, save_dir: Path,
                target: int, existing_hashes: set) -> int:
    try:
        from ddgs import DDGS
    except ImportError:
        print("  [!] pip install ddgs")
        return 0

    saved = 0
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0 Safari/537.36"}

    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=target + 40))
    except Exception as e:
        print(f"  [DDG error] {e}")
        return 0

    for res in results:
        if saved >= target:
            break
        url = res.get("image", "")
        if not url:
            continue
        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code != 200:
                continue
            data = r.content
            ok, reason = is_valid_motorcycle_image(data)
            if not ok:
                continue
            h = image_hash(data)
            if h in existing_hashes:
                continue
            existing_hashes.add(h)
            fname = save_dir / f"{h[:16]}.jpg"
            if save_image(data, fname):
                saved += 1
            time.sleep(random.uniform(0.3, 0.7))
        except Exception:
            continue

    return saved


# ─── SCRAPER BING ────────────────────────────────────────────

def scrape_bing(query: str, save_dir: Path,
                target: int, existing_hashes: set) -> int:
    saved  = 0
    offset = 0
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0 Safari/537.36"}

    while saved < target and offset < 200:
        enc_q = urllib.parse.quote(query)
        url   = (
            f"https://www.bing.com/images/search"
            f"?q={enc_q}&first={offset}&count=30"
            f"&qft=+filterui:imagesize-medium+filterui:photo-photo"
        )
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code != 200:
                break
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
                    ok, reason = is_valid_motorcycle_image(data)
                    if not ok:
                        continue
                    h = image_hash(data)
                    if h in existing_hashes:
                        continue
                    existing_hashes.add(h)
                    fname = save_dir / f"b_{h[:16]}.jpg"
                    if save_image(data, fname):
                        saved += 1
                    time.sleep(random.uniform(0.3, 0.7))
                except Exception:
                    continue
            offset += 30
            time.sleep(DELAY_SEC)
        except Exception as e:
            print(f"  [Bing error] {e}")
            break

    return saved


# ─── SCRAPE SATU MODEL ───────────────────────────────────────

def scrape_motor(brand: str, category: str, model: str,
                 idx: int, total: int) -> int:
    class_name = make_class_name(brand, model)
    save_dir   = Path(OUTPUT_DIR) / class_name
    save_dir.mkdir(parents=True, exist_ok=True)

    existing       = list(save_dir.glob("*.jpg"))
    existing_hashes: set = set()
    for f in existing:
        try:
            existing_hashes.add(image_hash(f.read_bytes()))
        except Exception:
            pass

    already_have = len(existing)
    if already_have >= IMAGES_TARGET:
        print(f"[{idx}/{total}] SKIP — {class_name} ({already_have} gambar)")
        return already_have

    need        = IMAGES_TARGET - already_have
    brand_clean = brand.replace("_", " ")
    queries     = make_queries(brand, model, category)

    print(f"\n[{idx}/{total}] {brand_clean} {model}  | butuh {need} gambar")

    count = already_have

    # Coba semua query DDG secara bergilir
    for q in queries:
        if count >= IMAGES_TARGET:
            break
        still_need = IMAGES_TARGET - count
        got = scrape_ddgs(q, save_dir, still_need, existing_hashes)
        count += got
        if got > 0:
            print(f"  DDG '{q[:50]}...' : +{got}  (total: {count})")
        time.sleep(random.uniform(0.5, 1.0))

    # Fallback Bing jika masih kurang
    if count < IMAGES_TARGET:
        still_need = IMAGES_TARGET - count
        bing_q = f"{brand_clean} {model} motorcycle official"
        got2 = scrape_bing(bing_q, save_dir, still_need, existing_hashes)
        count += got2
        if got2 > 0:
            print(f"  Bing: +{got2}  (total: {count})")
        time.sleep(DELAY_SEC)

    status = "OK" if count >= IMAGES_TARGET * 0.8 else "KURANG"
    print(f"  [{status}] {class_name} -> {count} gambar")
    return count


# ─── MAIN ────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  MOTOR SCRAPER V2 — QUERY LEBIH SPESIFIK")
    print(f"  Target  : {IMAGES_TARGET} gambar/kelas")
    print(f"  Output  : {Path(OUTPUT_DIR).resolve()}")
    print("=" * 60)

    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    total_classes = sum(
        len(models)
        for cats in MOTOR_LIST.values()
        for models in cats.values()
    )
    print(f"\nTotal kelas: {total_classes}\n")

    results = {}
    idx = 0

    for brand, categories in MOTOR_LIST.items():
        print(f"\n{'─'*50}")
        print(f"Brand: {brand.replace('_', ' ')}")
        print(f"{'─'*50}")

        for category, models in categories.items():
            for model in models:
                idx += 1
                class_name = make_class_name(brand, model)
                count = scrape_motor(brand, category, model, idx, total_classes)
                results[class_name] = count
                time.sleep(DELAY_SEC)

    # Simpan laporan
    report_lines = ["kelas,jumlah,status"]
    ok = 0
    fail = []
    for cls, cnt in sorted(results.items()):
        status = "OK" if cnt >= IMAGES_TARGET * 0.8 else "KURANG"
        if status == "OK":
            ok += 1
        else:
            fail.append((cls, cnt))
        report_lines.append(f"{cls},{cnt},{status}")

    report_path = Path(OUTPUT_DIR) / "scraping_report_v2.csv"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")

    print("\n" + "=" * 60)
    print(f"SELESAI!")
    print(f"  Total kelas OK : {ok}/{len(results)}")
    print(f"  Total gambar   : {sum(results.values()):,}")
    if fail:
        print(f"\n  Kelas yang kurang ({len(fail)}):")
        for n, c in sorted(fail, key=lambda x: x[1]):
            print(f"    - {n}: {c} gambar")
    print(f"\n  Laporan: {report_path}")


if __name__ == "__main__":
    main()
