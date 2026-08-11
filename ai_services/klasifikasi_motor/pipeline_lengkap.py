"""
============================================================
  PIPELINE LENGKAP — Filter + Retry Scraping Kelas Kurang
  
  Urutan:
  1. Scoring CLIP semua gambar → simpan clip_scores.csv
  2. Hapus gambar non-motor (pindah ke trash)
  3. Cek kelas yang masih kurang dari MIN_COUNT
  4. Retry scraping hanya kelas yang kurang

  Jalankan:
      python pipeline_lengkap.py

  Install:
      pip install transformers torch torchvision pillow tqdm ddgs requests
============================================================
"""

import sys
import os
import csv
import shutil
import time
import random
import hashlib
import requests
import re
import urllib.parse
import io
from pathlib import Path
from PIL import Image
from tqdm import tqdm

# Fix encoding Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── KONFIGURASI ─────────────────────────────────────────────
DATASET_DIR   = Path("dataset_motor")
TRASH_DIR     = Path("dataset_motor_trash")
REPORT_PATH   = Path("clip_scores.csv")

IMAGES_TARGET = 75       # target gambar per kelas
MIN_COUNT     = 60       # kelas dengan gambar < MIN_COUNT -> retry scraping

# CLIP thresholds (toleran: hanya hapus yang JELAS bukan motor)
POS_THRESHOLD = 0.20
NEG_MARGIN    = 0.15     # hapus jika neg_score > pos_score + NEG_MARGIN

# Scraper config
MIN_SIZE_KB   = 15
IMAGE_SIZE    = (640, 640)
MIN_WIDTH     = 200
MIN_HEIGHT    = 150
DELAY_SEC     = 1.5
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

CATEGORY_KEYWORDS = {
    "Sport":             "sport motorcycle superbike",
    "Naked":             "naked motorcycle streetfighter bike",
    "Adventure":         "adventure motorcycle ADV",
    "Adventure_Touring": "adventure touring motorcycle",
    "Maxi_Scooter":      "maxi scooter",
    "Adventure_Scooter": "adventure scooter",
    "Cruiser":           "cruiser motorcycle",
    "Dual_Purpose":      "dual sport motorcycle enduro",
    "Retro":             "retro classic motorcycle",
    "Touring":           "touring motorcycle",
    "Roadster":          "roadster motorcycle",
    "Scooter":           "scooter",
    "Hyperbike":         "hyperbike superbike",
    "Scrambler":         "scrambler motorcycle",
    "Cafe_Racer":        "cafe racer motorcycle",
}


# ═══════════════════════════════════════════════════════════════
#  TAHAP 1 — CLIP SCORING + FILTER NON-MOTOR
# ═══════════════════════════════════════════════════════════════

POSITIVE_LABELS = [
    "a photo of a motorcycle",
    "a photo of a motorbike",
    "a photo of a sport motorcycle",
    "a photo of a cruiser motorcycle",
    "a photo of an adventure motorcycle",
    "a photo of a scooter",
    "a photo of a naked bike",
]
NEGATIVE_LABELS = [
    "a photo of a car",
    "a photo of a truck",
    "a photo of a bus",
    "a photo of an airplane",
    "a photo of a boat or ship",
    "a plain white background with no vehicle",
    "a photo of text, logo, or advertisement",
]
ALL_LABELS = POSITIVE_LABELS + NEGATIVE_LABELS


def load_clip():
    """Load model CLIP. Return (model, processor, device) atau None jika gagal."""
    print("\n[TAHAP 1] Loading CLIP model...")
    try:
        import torch
        from transformers import CLIPProcessor, CLIPModel
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"  Device: {device}")
        # use_safetensors=True: bypass torch.load restriction (CVE-2025-32434)
        # Tidak perlu upgrade torch ke 2.6+
        model = CLIPModel.from_pretrained(
            "openai/clip-vit-base-patch32",
            use_safetensors=True
        ).to(device)
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print(f"  CLIP loaded -- device: {device}")
        return model, processor, device
    except Exception as e:
        print(f"  [!] CLIP gagal load: {e}")
        return None, None, None


def score_image(img_path, model, processor, device):
    """Hitung skor CLIP untuk satu gambar."""
    import torch
    try:
        image = Image.open(img_path).convert("RGB")
        inputs = processor(
            text=ALL_LABELS, images=image,
            return_tensors="pt", padding=True
        ).to(device)
        with torch.no_grad():
            outputs = model(**inputs)
            probs   = outputs.logits_per_image[0].softmax(dim=0).cpu().numpy()

        pos_score = float(max(probs[:len(POSITIVE_LABELS)]))
        neg_score = float(max(probs[len(POSITIVE_LABELS):]))
        best_neg  = NEGATIVE_LABELS[int(probs[len(POSITIVE_LABELS):].argmax())]
        is_suspect = neg_score > pos_score + NEG_MARGIN and pos_score < POS_THRESHOLD

        return {
            "pos_score":  round(pos_score, 4),
            "neg_score":  round(neg_score, 4),
            "best_neg":   best_neg,
            "is_suspect": is_suspect,
        }
    except Exception:
        return {"pos_score": 1.0, "neg_score": 0.0,
                "best_neg": "", "is_suspect": False}


def run_filter(model, processor, device):
    """
    Tahap 1: score semua gambar, hapus yang non-motor ke trash.
    Return jumlah gambar yang dihapus.
    """
    print(f"\n  Scanning {DATASET_DIR}...")
    class_dirs = sorted([d for d in DATASET_DIR.iterdir() if d.is_dir()])
    print(f"  Total kelas: {len(class_dirs)}")

    all_rows  = []
    total_del = 0

    for class_dir in tqdm(class_dirs, desc="  Filtering kelas"):
        images = list(class_dir.glob("*.jpg"))
        if not images:
            continue

        trash_cls = TRASH_DIR / class_dir.name

        for img_path in images:
            result = score_image(img_path, model, processor, device)
            all_rows.append({
                "kelas":          class_dir.name,
                "file":           img_path.name,
                "pos_score":      result["pos_score"],
                "neg_score":      result["neg_score"],
                "best_neg_label": result["best_neg"],
                "suspect":        "YA" if result["is_suspect"] else "tidak",
            })
            if result["is_suspect"]:
                trash_cls.mkdir(parents=True, exist_ok=True)
                shutil.move(str(img_path), str(trash_cls / img_path.name))
                total_del += 1

    # Simpan laporan CSV
    if all_rows:
        with open(REPORT_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=all_rows[0].keys())
            writer.writeheader()
            writer.writerows(all_rows)

    print(f"\n  Filter selesai:")
    print(f"    Total gambar diproses : {len(all_rows)}")
    print(f"    Dihapus (non-motor)   : {total_del}")
    print(f"    Laporan CSV           : {REPORT_PATH.resolve()}")
    print(f"    Trash folder          : {TRASH_DIR.resolve()}")
    return total_del


# ═══════════════════════════════════════════════════════════════
#  TAHAP 2 — CEK KELAS KURANG + RETRY SCRAPING
# ═══════════════════════════════════════════════════════════════

def make_class_name(brand, model):
    raw   = f"{brand}_{model}"
    clean = raw.replace(" ", "_").replace("-", "_").replace("/", "_")
    clean = "".join(c for c in clean if c.isalnum() or c == "_")
    return clean.lower()


def make_queries(brand, model, category):
    b      = brand.replace("_", " ")
    cat_kw = CATEGORY_KEYWORDS.get(category, "motorcycle")
    return [
        f"{b} {model} motorcycle official photo",
        f"{b} {model} motorbike side view",
        f"{b} {model} {cat_kw} 2024",
        f"{b} {model} motorcycle white background",
        f'"{b} {model}" motorcycle',
        f"{b} {model} bike studio photo",
    ]


def image_hash(data):
    return hashlib.md5(data).hexdigest()


def is_valid_image(data):
    if len(data) < MIN_SIZE_KB * 1024:
        return False, "file terlalu kecil"
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        img = Image.open(io.BytesIO(data))
        w, h = img.size
        if w < MIN_WIDTH or h < MIN_HEIGHT:
            return False, f"resolusi kecil ({w}x{h})"
        ratio = w / h
        if ratio < 0.6 or ratio > 4.5:
            return False, f"aspect ratio tidak wajar ({ratio:.2f})"
        return True, "OK"
    except Exception as e:
        return False, f"gambar rusak: {e}"


def save_image(data, path):
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        img = img.resize(IMAGE_SIZE, Image.LANCZOS)
        img.save(str(path), "JPEG", quality=90)
        return True
    except Exception:
        return False


def scrape_ddgs(query, save_dir, target, hashes):
    try:
        from ddgs import DDGS
    except ImportError:
        return 0

    saved   = 0
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=target + 40))
    except Exception as e:
        print(f"    [DDG error] {e}")
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
            ok, _ = is_valid_image(data)
            if not ok:
                continue
            h = image_hash(data)
            if h in hashes:
                continue
            hashes.add(h)
            fname = save_dir / f"{h[:16]}.jpg"
            if save_image(data, fname):
                saved += 1
            time.sleep(random.uniform(0.3, 0.7))
        except Exception:
            continue
    return saved


def scrape_bing(query, save_dir, target, hashes):
    saved  = 0
    offset = 0
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

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
                    ok, _ = is_valid_image(data)
                    if not ok:
                        continue
                    h = image_hash(data)
                    if h in hashes:
                        continue
                    hashes.add(h)
                    fname = save_dir / f"b_{h[:16]}.jpg"
                    if save_image(data, fname):
                        saved += 1
                    time.sleep(random.uniform(0.3, 0.7))
                except Exception:
                    continue
            offset += 30
            time.sleep(DELAY_SEC)
        except Exception as e:
            print(f"    [Bing error] {e}")
            break
    return saved


def retry_scrape_class(brand, category, model, idx, total):
    class_name = make_class_name(brand, model)
    save_dir   = DATASET_DIR / class_name
    save_dir.mkdir(parents=True, exist_ok=True)

    existing        = list(save_dir.glob("*.jpg"))
    existing_hashes = set()
    for f in existing:
        try:
            existing_hashes.add(image_hash(f.read_bytes()))
        except Exception:
            pass

    already_have = len(existing)
    if already_have >= IMAGES_TARGET:
        print(f"  [{idx}/{total}] SKIP -- {class_name} ({already_have} gambar)")
        return already_have

    need        = IMAGES_TARGET - already_have
    queries     = make_queries(brand, model, category)
    brand_clean = brand.replace("_", " ")

    print(f"\n  [{idx}/{total}] {brand_clean} {model}  ({already_have} ada, butuh +{need})")

    count = already_have
    for q in queries:
        if count >= IMAGES_TARGET:
            break
        still_need = IMAGES_TARGET - count
        got = scrape_ddgs(q, save_dir, still_need, existing_hashes)
        count += got
        if got > 0:
            print(f"    DDG +{got}  (total: {count})")
        time.sleep(random.uniform(0.5, 1.0))

    if count < IMAGES_TARGET:
        still_need = IMAGES_TARGET - count
        bing_q = f"{brand_clean} {model} motorcycle official"
        got2 = scrape_bing(bing_q, save_dir, still_need, existing_hashes)
        count += got2
        if got2 > 0:
            print(f"    Bing +{got2}  (total: {count})")

    status = "OK" if count >= int(IMAGES_TARGET * 0.8) else "MASIH KURANG"
    print(f"    [{status}] {class_name} -> {count} gambar")
    return count


def run_retry():
    """
    Tahap 2: cek semua kelas, retry scraping yang kurang dari MIN_COUNT.
    """
    print(f"\n[TAHAP 2] Cek kelas yang kurang dari {MIN_COUNT} gambar...")

    # Bangun mapping class_name -> (brand, category, model)
    class_map = {}
    for brand, cats in MOTOR_LIST.items():
        for category, models in cats.items():
            for model in models:
                cn = make_class_name(brand, model)
                class_map[cn] = (brand, category, model)

    # Cek jumlah gambar per kelas
    kurang = []
    for class_dir in sorted(DATASET_DIR.iterdir()):
        if not class_dir.is_dir():
            continue
        n = len(list(class_dir.glob("*.jpg")))
        if n < MIN_COUNT and class_dir.name in class_map:
            kurang.append((class_dir.name, n))

    if not kurang:
        print(f"  Semua kelas sudah >= {MIN_COUNT} gambar. Tidak perlu retry.")
        return {}

    print(f"  Kelas yang perlu retry: {len(kurang)}")
    for cn, n in sorted(kurang, key=lambda x: x[1]):
        print(f"    {cn}: {n} gambar")

    results = {}
    total   = len(kurang)
    for idx, (class_name, _) in enumerate(
        sorted(kurang, key=lambda x: x[1]), start=1
    ):
        brand, category, model = class_map[class_name]
        count = retry_scrape_class(brand, category, model, idx, total)
        results[class_name] = count
        time.sleep(DELAY_SEC)

    return results


# ═══════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  PIPELINE LENGKAP -- Filter + Retry Scraping")
    print(f"  Dataset    : {DATASET_DIR.resolve()}")
    print(f"  Target     : {IMAGES_TARGET} gambar/kelas")
    print(f"  Retry jika : < {MIN_COUNT} gambar setelah filter")
    print("=" * 60)

    if not DATASET_DIR.exists():
        print(f"\n[!] Folder dataset tidak ditemukan: {DATASET_DIR}")
        return

    # ── TAHAP 1: Filter ──────────────────────────────────────
    clip_model, clip_proc, clip_dev = load_clip()

    if clip_model is None:
        print("\n[!] CLIP tidak bisa diload. Filter dilewati.")
        print("    Pastikan: pip install transformers torch torchvision")
    else:
        removed = run_filter(clip_model, clip_proc, clip_dev)
        print(f"\n  Total dihapus: {removed} gambar")
        print("  Jika ada yang salah hapus, jalankan: python restore_trash.py")

        # Bebaskan VRAM sebelum scraping
        import torch
        del clip_model
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    # ── TAHAP 2: Retry Scraping ──────────────────────────────
    retry_results = run_retry()

    # ── LAPORAN AKHIR ─────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  SELESAI!")

    all_classes  = sorted([d for d in DATASET_DIR.iterdir() if d.is_dir()])
    total_imgs   = 0
    ok_count     = 0
    still_kurang = []

    for d in all_classes:
        n = len(list(d.glob("*.jpg")))
        total_imgs += n
        if n >= int(IMAGES_TARGET * 0.8):
            ok_count += 1
        else:
            still_kurang.append((d.name, n))

    print(f"  Total kelas       : {len(all_classes)}")
    print(f"  Kelas OK (>={int(IMAGES_TARGET*0.8)}) : {ok_count}")
    print(f"  Total gambar      : {total_imgs:,}")

    if still_kurang:
        print(f"\n  Kelas masih kurang setelah pipeline ({len(still_kurang)}):")
        for cn, n in sorted(still_kurang, key=lambda x: x[1]):
            print(f"    {cn}: {n} gambar")
        print("\n  Tip: Jalankan ulang pipeline_lengkap.py atau tambah")
        print("       query manual di scrape_motor_v2.py")
    else:
        print("\n  Semua kelas sudah memenuhi target!")

    print("=" * 60)


if __name__ == "__main__":
    main()
