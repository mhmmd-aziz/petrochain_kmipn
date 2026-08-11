"""
============================================================
  MOTOR IMAGE SCRAPER — UNDER 250cc (SEMUA KELAS INDONESIA)
  ============================================================
  Target   : 100 gambar / kelas
             - 50 side view  (landscape, normal photography)
             - 50 top-front view  (overhead / CCTV style)
  GPU      : GPU-accelerated resize (torchvision + CUDA)
             fallback ke CPU Pillow jika GPU tidak tersedia
  Resume   : Otomatis skip kelas yang sudah >= target
  Anti-miss: Setiap query menyertakan nama model EKSPLISIT
             sehingga gambar tidak tertukar antar kelas

  Motor yang di-scrape: semua kelas motor <250cc yang
  dipasarkan / populer di Indonesia:
    - Sport/Naked cc kecil (125–249cc)
    - Matic / Scooter
    - Bebek / Cub
    - Mini Trail / Adventure kecil
    - Underbone

  Install:
      pip install ddgs requests pillow tqdm torch torchvision
============================================================
"""

import os
import sys
import time
import hashlib
import requests
import random
import re
import io
import urllib.parse
import threading
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

# ── Fix encoding Windows ────────────────────────────────────
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── GPU SETUP ───────────────────────────────────────────────
try:
    import torch
    import torchvision.transforms.functional as TF_tv

    if torch.cuda.is_available():
        DEVICE   = torch.device("cuda")
        GPU_NAME = torch.cuda.get_device_name(0)
        USE_GPU  = True
    else:
        DEVICE   = torch.device("cpu")
        GPU_NAME = "CPU (CUDA tidak tersedia)"
        USE_GPU  = False
except ImportError:
    USE_GPU  = False
    GPU_NAME = "CPU (PyTorch tidak terinstall)"
    torch    = None

# ── KONFIGURASI ─────────────────────────────────────────────
OUTPUT_DIR        = "dataset_motor_under250"   # FOLDER TERPISAH dari dataset >250cc
TARGET_TOTAL      = 250   # total gambar per kelas
TARGET_SIDE       = 125    # side/normal view
TARGET_TOPVIEW    = 125    # top-front/overhead view
MIN_SIZE_KB       = 15
IMAGE_SIZE        = (640, 640)
DELAY_SEC         = 1.0
MIN_WIDTH         = 200
MIN_HEIGHT        = 150
MAX_WORKERS       = 3     # paralel antar kelas (jaga rate-limit)
PRINT_LOCK        = threading.Lock()

# ── DAFTAR MOTOR <250cc INDONESIA ──────────────────────────
# Format: { brand: { category: [ model, ... ] } }
# Class name = brand_model (lowercase, spasi & strip → _)
#
# Catatan CC:
#   <125cc  : bebek, matic kecil
#   125cc   : segmen terbesar Indonesia
#   150–160cc: matic premium / sport
#   155–200cc: sport ringan
#   200–249cc: sport mid-entry
#
# Semua SUDAH dicross-check dengan model yang dipasarkan
# di Indonesia (resmi atau CBU populer) per 2024-2025.
# ────────────────────────────────────────────────────────────

MOTOR_LIST_UNDER250 = {

    # ── YAMAHA ──────────────────────────────────────────────
    # Catatan: MT-25, YZF-R25, XMAX 250 sudah ada di dataset_motor (≥250cc)
    "Yamaha": {
        "Maxi_Scooter": [
            "NMax 155",       # 155cc (bestseller)
            "NMax Turbo 155", # 155cc (versi turbo)
        ],
        "Scooter": [
            "Aerox 155",      # 155cc sport scooter
            "Lexi LX 155",    # 155cc
            "Freego 125",     # 125cc connected
            "Mio M3 125",     # 125cc
            "Mio S 125",      # 125cc
        ],
        "Bebek": [
            "Jupiter MX King 150",  # 150cc
            "Jupiter Z1 115",       # 115cc
        ],
        "Adventure_Small": [
            "WR 155 R",       # 155cc adventure trail
        ],
    },

    # ── HONDA ───────────────────────────────────────────────
    # Catatan: CB250R, CBR250R, CBR250RR, Forza 250, CRF250 Rally, CRF250L
    #          sudah ada di dataset_motor (≥250cc)
    "Honda": {
        "Sport_Naked": [
            "CB150R Streetfire", # 150cc
            "CB150X",            # 150cc adventure naked
        ],
        "Sport_Fairing": [
            "CBR150R",        # 150cc
        ],
        "Maxi_Scooter": [
            "PCX 160",        # 160cc premium matic
            "ADV 160",        # 160cc adventure scooter
        ],
        "Scooter": [
            "Vario 160",      # 160cc (flagship matic)
            "Vario 125",      # 125cc
            "BeAT 110",       # 110cc (terlaris)
            "Scoopy 110",     # 110cc retro scooter
            "Genio 110",      # 110cc retro
        ],
        "Bebek": [
            "Supra GTR 150",  # 150cc sport cub
            "Revo 110",       # 110cc economy cub
            "Blade 125",      # 125cc
        ],
        "Adventure_Small": [
            "CRF150L",        # 150cc mini adventure (CRF250L/Rally sudah ada di dataset_motor)
        ],
    },

    # ── KAWASAKI ────────────────────────────────────────────
    # Catatan: Ninja 250, Ninja 250SL, Z250, Versys-X 250, KLX230R
    #          sudah ada di dataset_motor (≥250cc)
    "Kawasaki": {
        "Adventure": [
            "KLX150",         # 150cc trail
        ],
    },

    # ── SUZUKI ──────────────────────────────────────────────
    # Catatan: Gixxer SF 250, GSX250R, Gixxer 250, GSX-S250, V-Strom 250 SX
    #          sudah ada di dataset_motor (≥250cc)
    "Suzuki": {
        "Scooter": [
            "Address 110",    # 110cc
            "Nex II 115",     # 115cc
            "Burgman Street 125", # 125cc
        ],
        "Bebek": [
            "Smash 115",      # 115cc
            "Raider R150",    # 150cc sport cub
        ],
    },

    # ── KTM ─────────────────────────────────────────────────
    # Catatan: Adventure 250, Duke 250 sudah ada di dataset_motor (≥250cc)
    "KTM": {
        "Sport_Naked": [
            "Duke 200",       # 200cc single
            "Duke 125",       # 125cc single
        ],
        "Sport_Fairing": [
            "RC 200",         # 200cc
            "RC 125",         # 125cc
        ],
    },

    # ── HUSQVARNA ───────────────────────────────────────────
    # Catatan: Svartpilen 250, Vitpilen 250 sudah ada di dataset_motor (≥250cc)
    "Husqvarna": {
        "Sport_Naked": [
            "Svartpilen 125", # 125cc
            "Vitpilen 125",   # 125cc
        ],
    },

    # ── BENELLI ─────────────────────────────────────────────
    # Catatan: TNT25/TNT250, TRK251, Leoncino 250 sudah ada di dataset_motor (≥250cc)
    "Benelli": {
        "Sport_Naked": [
            "TNT 150",        # 150cc (lokal Indonesia)
        ],
        "Sport_Fairing": [
            "302R",           # 249cc CBU (belum ada di dataset lama)
        ],
    },

    # ── CFMOTO ──────────────────────────────────────────────
    # Catatan: 250 NK sudah ada di dataset_motor (≥250cc)
    "CFMOTO": {
        "Scooter": [
            "SR 150",         # 150cc scooter (Indonesia)
        ],
    },

    # ── QJMOTOR ─────────────────────────────────────────────
    # Catatan: Fort 250, SRV250, SRV250 Libero, SRV250 AMT, Fort 250 Adventure
    #          sudah ada di dataset_motor (≥250cc)
    # Tidak ada model QJMotor <250cc baru untuk ditambahkan.

    # ── TVS ─────────────────────────────────────────────────
    "TVS": {
        "Sport_Naked": [
            "Apache RTR 200 4V",  # 197cc (populer Indonesia)
            "Apache RTR 160 4V",  # 159cc
        ],
        "Scooter": [
            "Ntorq 125",      # 125cc sport scooter
            "Jupiter Z1 110", # 110cc (JMT collaboration)
        ],
    },

    # ── BAJAJ ───────────────────────────────────────────────
    "Bajaj": {
        "Sport_Naked": [
            "Pulsar NS200",   # 200cc (CBU Indonesia)
            "Pulsar NS160",   # 160cc
            "Pulsar 220F",    # 220cc fairing
        ],
    },

    # ── ROYAL ENFIELD ───────────────────────────────────────
    # Royal Enfield terkecil yang masuk Indo adalah 350cc,
    # tidak ada yang <250cc resmi di Indonesia.
    # Dikecualikan dari daftar ini.

    # ── APRILIA (under 250cc) ────────────────────────────────
    "Aprilia": {
        "Sport_Fairing": [
            "RS 125",         # 125cc (GP replica, CBU)
        ],
        "Sport_Naked": [
            "Tuono 125",      # 125cc
        ],
    },

    # ── KYMCO ───────────────────────────────────────────────
    "Kymco": {
        "Scooter": [
            "Like 125",       # 125cc retro scooter
            "Downtown 200i",  # 200cc (CBU)
            "Xciting 250",    # 250cc (CBU lama, populer)
        ],
        "Sport_Naked": [
            "K-Pipe 125",     # 125cc naked
        ],
    },

    # ── SYM ─────────────────────────────────────────────────
    "SYM": {
        "Scooter": [
            "VF3i 185",       # 185cc (CBU populer)
            "Jet X 125",      # 125cc
        ],
    },

    # ── VIAR ────────────────────────────────────────────────
    "Viar": {
        "Bebek": [
            "Cross X 200",    # 200cc trail (lokal Indonesia)
            "Star MX 200 R",  # 200cc sport bebek
        ],
        "Adventure_Small": [
            "Adventure 150",  # 150cc mini adventure
        ],
    },

    # ── GESITS ──────────────────────────────────────────────
    "Gesits": {
        "Scooter_Electric": [
            "G1",             # motor listrik 5000W (lokal)
            "Raya",           # motor listrik 3000W
        ],
    },

    # ── ALVA (lokal EV) ─────────────────────────────────────
    "Alva": {
        "Scooter_Electric": [
            "One",            # motor listrik (lokal Indonesia)
            "Cervo",          # motor listrik
        ],
    },

    # ── ELECTRUM ────────────────────────────────────────────
    "Electrum": {
        "Scooter_Electric": [
            "H5",             # motor listrik (TDM x Grab)
        ],
    },

    # ── POLYTRON ────────────────────────────────────────────
    "Polytron": {
        "Scooter_Electric": [
            "Fox R",          # motor listrik lokal
            "PEV 30M1",       # motor listrik
        ],
    },

    # ── EXOTIC ──────────────────────────────────────────────
    "Exotic": {
        "Scooter_Electric": [
            "Crosser",        # motor listrik lokal murah
        ],
    },

    # ── HONDA (matic khusus 110–160cc — popularitas tinggi) ─
    # Sudah dimasukkan di Honda section atas.

}

# ── KEYWORD KATEGORI ────────────────────────────────────────
CATEGORY_KEYWORDS = {
    "Sport_Naked":      "naked motorcycle street fighter",
    "Sport_Fairing":    "sport motorcycle fairing supersport",
    "Maxi_Scooter":     "maxi scooter motorcycle",
    "Scooter":          "scooter matic motorcycle Indonesia",
    "Bebek":            "bebek cub motorcycle underbone",
    "Adventure_Small":  "adventure trail motorcycle small",
    "Adventure":        "adventure motorcycle dual sport",
    "Scooter_Electric": "electric scooter motorcycle EV",
}


# ── HELPER: class name ──────────────────────────────────────
def make_class_name(brand: str, model: str) -> str:
    raw   = f"{brand}_{model}"
    clean = raw.replace(" ", "_").replace("-", "_").replace("/", "_")
    clean = "".join(c for c in clean if c.isalnum() or c == "_")
    return clean.lower()


# ── HELPER: hash ────────────────────────────────────────────
def image_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


# ── VALIDASI GAMBAR ─────────────────────────────────────────
def is_valid_image(data: bytes) -> tuple:
    if len(data) < MIN_SIZE_KB * 1024:
        return False, "terlalu kecil"
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        img = Image.open(io.BytesIO(data))
        w, h = img.size
        if w < MIN_WIDTH or h < MIN_HEIGHT:
            return False, f"resolusi kecil ({w}x{h})"
        ratio = w / h
        if ratio < 0.4 or ratio > 5.5:
            return False, f"aspect ratio aneh ({ratio:.2f})"
        return True, "OK"
    except Exception as e:
        return False, f"rusak: {e}"


# ── SIMPAN GAMBAR (GPU RESIZE) ──────────────────────────────
def save_image_gpu(data: bytes, save_path: Path) -> bool:
    try:
        if USE_GPU and torch is not None:
            img = Image.open(io.BytesIO(data)).convert("RGB")
            t = TF_tv.to_tensor(img).unsqueeze(0).to(DEVICE)
            t = torch.nn.functional.interpolate(
                t, size=IMAGE_SIZE, mode="bilinear", align_corners=False
            )
            t = t.squeeze(0).cpu()
            img_out = TF_tv.to_pil_image(t)
            img_out.save(str(save_path), "JPEG", quality=90)
        else:
            img = Image.open(io.BytesIO(data)).convert("RGB")
            img = img.resize(IMAGE_SIZE, Image.LANCZOS)
            img.save(str(save_path), "JPEG", quality=90)
        return True
    except Exception:
        return False


# ── QUERY SIDE VIEW ─────────────────────────────────────────
def make_side_queries(brand: str, model: str, category: str) -> list:
    """
    Query spesifik untuk foto samping / normal motorcycle.
    Selalu sertakan brand + model secara eksplisit agar tidak tertukar.
    """
    b   = brand.replace("_", " ")
    cat = CATEGORY_KEYWORDS.get(category, "motorcycle")
    return [
        f'"{b} {model}" motorcycle official photo',
        f"{b} {model} motorcycle side view studio",
        f"{b} {model} motorbike {cat}",
        f"{b} {model} motorcycle white background",
        f"{b} {model} motorcycle 2024",
        f"{b} {model} motor Indonesia official",
        f"{b} {model} bike press photo",
        f'"{b} {model}" motorbike side',
    ]


# ── QUERY TOP-FRONT VIEW ─────────────────────────────────────
def make_topview_queries(brand: str, model: str) -> list:
    """
    Query spesifik untuk sudut atas-depan (CCTV/overhead).
    Selalu sertakan brand + model secara eksplisit agar tidak tertukar.
    """
    b = brand.replace("_", " ")
    return [
        f'"{b} {model}" motorcycle top view overhead',
        f"{b} {model} motorcycle bird eye view front",
        f"{b} {model} motorcycle front top angle photo",
        f"{b} {model} motorcycle aerial front view",
        f"{b} {model} motorcycle CCTV top view",
        f"{b} {model} motorcycle above front angle",
        f"{b} {model} motorcycle overhead shot parking",
        f"{b} {model} motorcycle top down front view",
        f"{b} {model} motorcycle high angle front view",
        f"{b} {model} motorbike parking overhead CCTV",
    ]


# ── SCRAPER DUCKDUCKGO ──────────────────────────────────────
def scrape_ddgs(query: str, save_dir: Path,
                target: int, existing_hashes: set,
                prefix: str = "d") -> int:
    try:
        from ddgs import DDGS
    except ImportError:
        return 0

    saved   = 0
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 Chrome/124.0.0 Safari/537.36"
        )
    }

    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=target + 60))
    except Exception:
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
            if h in existing_hashes:
                continue
            existing_hashes.add(h)
            fname = save_dir / f"{prefix}_{h[:16]}.jpg"
            if save_image_gpu(data, fname):
                saved += 1
            time.sleep(random.uniform(0.2, 0.6))
        except Exception:
            continue

    return saved


# ── SCRAPER BING ────────────────────────────────────────────
def scrape_bing(query: str, save_dir: Path,
                target: int, existing_hashes: set,
                prefix: str = "b") -> int:
    saved  = 0
    offset = 0
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 Chrome/124.0.0 Safari/537.36"
        )
    }

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
                    if h in existing_hashes:
                        continue
                    existing_hashes.add(h)
                    fname = save_dir / f"{prefix}_{h[:16]}.jpg"
                    if save_image_gpu(data, fname):
                        saved += 1
                    time.sleep(random.uniform(0.2, 0.5))
                except Exception:
                    continue
            offset += 30
            time.sleep(DELAY_SEC)
        except Exception:
            break

    return saved


# ── SCRAPE SATU MODEL ────────────────────────────────────────
def scrape_motor(brand: str, category: str, model: str,
                 idx: int, total: int) -> tuple:
    """
    Scrape satu model motor.
    Pertama kumpulkan 50 side view, lalu 50 top-front view.
    Hasil disimpan di subfolder dataset_motor/<class_name>/
    """
    class_name = make_class_name(brand, model)
    save_dir   = Path(OUTPUT_DIR) / class_name
    save_dir.mkdir(parents=True, exist_ok=True)

    # ── Hitung yang sudah ada ──────────────────────────────
    existing        = list(save_dir.glob("*.jpg"))
    existing_hashes = set()
    for f in existing:
        try:
            existing_hashes.add(image_hash(f.read_bytes()))
        except Exception:
            pass

    # ── Masukkan juga hash dari trash agar tidak didownload ulang ──
    for trash_suffix in ["_trash", "_category_trash"]:
        trash_dir = Path(f"{OUTPUT_DIR}{trash_suffix}") / class_name
        if trash_dir.exists():
            for f in trash_dir.glob("*.jpg"):
                try:
                    existing_hashes.add(image_hash(f.read_bytes()))
                except Exception:
                    pass

    already_have = len(existing)

    if already_have >= TARGET_TOTAL:
        with PRINT_LOCK:
            print(f"[{idx:3d}/{total}] SKIP  {class_name:<50} ({already_have} gambar)")
        return class_name, already_have

    b        = brand.replace("_", " ")
    count_sv = sum(1 for f in existing if not f.stem.startswith("tv"))
    count_tv = sum(1 for f in existing if f.stem.startswith("tv"))

    with PRINT_LOCK:
        print(f"\n[{idx:3d}/{total}] {b} {model}")
        print(f"  sudah={already_have} | side={count_sv} | topview={count_tv}")

    # ── SIDE VIEW (50 gambar) ──────────────────────────────
    if count_sv < TARGET_SIDE:
        need_sv = TARGET_SIDE - count_sv
        with PRINT_LOCK:
            print(f"  → Scrape SIDE VIEW, butuh {need_sv}")

        sv_queries = make_side_queries(brand, model, category)
        for i, q in enumerate(sv_queries):
            if count_sv >= TARGET_SIDE:
                break
            still = TARGET_SIDE - count_sv
            got   = scrape_ddgs(q, save_dir, still, existing_hashes, prefix=f"sv{i}")
            count_sv += got
            if got > 0:
                with PRINT_LOCK:
                    print(f"    DDG-SV q{i} +{got} → side={count_sv}")
            time.sleep(random.uniform(0.4, 0.9))

        # Fallback Bing untuk side view
        if count_sv < TARGET_SIDE:
            still = TARGET_SIDE - count_sv
            bq    = f"{b} {model} motorcycle side view official"
            got2  = scrape_bing(bq, save_dir, still, existing_hashes, prefix="bsv")
            count_sv += got2
            if got2 > 0:
                with PRINT_LOCK:
                    print(f"    Bing-SV +{got2} → side={count_sv}")

    # ── TOP-FRONT VIEW (50 gambar) ─────────────────────────
    if count_tv < TARGET_TOPVIEW:
        need_tv = TARGET_TOPVIEW - count_tv
        with PRINT_LOCK:
            print(f"  → Scrape TOP VIEW, butuh {need_tv}")

        tv_queries = make_topview_queries(brand, model)
        for i, q in enumerate(tv_queries):
            if count_tv >= TARGET_TOPVIEW:
                break
            still = TARGET_TOPVIEW - count_tv
            got   = scrape_ddgs(q, save_dir, still, existing_hashes, prefix=f"tv{i}")
            count_tv += got
            if got > 0:
                with PRINT_LOCK:
                    print(f"    DDG-TV q{i} +{got} → topview={count_tv}")
            time.sleep(random.uniform(0.4, 0.9))

        # Fallback Bing untuk top view
        if count_tv < TARGET_TOPVIEW:
            still = TARGET_TOPVIEW - count_tv
            bq    = f"{b} {model} motorcycle overhead top front CCTV angle"
            got2  = scrape_bing(bq, save_dir, still, existing_hashes, prefix="btv")
            count_tv += got2
            if got2 > 0:
                with PRINT_LOCK:
                    print(f"    Bing-TV +{got2} → topview={count_tv}")

    total_count = count_sv + count_tv
    status      = "OK" if total_count >= TARGET_TOTAL * 0.8 else "KURANG"
    with PRINT_LOCK:
        print(f"  [{status}] {class_name} → side={count_sv}, topview={count_tv}, total={total_count}")

    return class_name, total_count


# ── MAIN ─────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  MOTOR SCRAPER — UNDER 250cc  (SEMUA KELAS INDONESIA)")
    print(f"  Target     : {TARGET_TOTAL} gambar/kelas "
          f"({TARGET_SIDE} side + {TARGET_TOPVIEW} top-front view)")
    print(f"  Render GPU : {GPU_NAME}")
    print(f"  Workers    : {MAX_WORKERS} thread paralel")
    print(f"  Output     : {Path(OUTPUT_DIR).resolve()}")
    print("=" * 70)

    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    # Kumpulkan semua task (brand, category, model)
    all_tasks = []
    for brand, categories in MOTOR_LIST_UNDER250.items():
        for category, models in categories.items():
            for model in models:
                all_tasks.append((brand, category, model))

    total = len(all_tasks)
    print(f"\nTotal kelas: {total}\n")

    # Tampilkan daftar kelas
    print("Daftar kelas yang akan di-scrape:")
    for i, (brand, cat, model) in enumerate(all_tasks, 1):
        cn = make_class_name(brand, model)
        print(f"  {i:3d}. {cn}")
    print()

    results = {}

    # Thread pool: paralel antar kelas
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as exe:
        future_map = {
            exe.submit(scrape_motor, brand, cat, model, idx + 1, total): (brand, cat, model)
            for idx, (brand, cat, model) in enumerate(all_tasks)
        }
        for fut in as_completed(future_map):
            try:
                cls, cnt = fut.result()
                results[cls] = cnt
            except Exception as e:
                brand, cat, model = future_map[fut]
                cn = make_class_name(brand, model)
                with PRINT_LOCK:
                    print(f"  [ERROR] {cn}: {e}")
                results[cn] = -1

    # ── Laporan ────────────────────────────────────────────
    report_lines = ["kelas,jumlah,status"]
    ok_count  = 0
    fail_list = []
    for cls, cnt in sorted(results.items()):
        status = "OK" if cnt >= TARGET_TOTAL * 0.8 else "KURANG"
        if status == "OK":
            ok_count += 1
        else:
            fail_list.append((cls, cnt))
        report_lines.append(f"{cls},{cnt},{status}")

    report_path = Path(OUTPUT_DIR) / "scraping_report_under250cc.csv"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")

    print("\n" + "=" * 70)
    print("SELESAI!")
    print(f"  Kelas OK    : {ok_count}/{len(results)}")
    print(f"  Total gambar: {sum(v for v in results.values() if v > 0):,}")
    if fail_list:
        print(f"\n  Kelas kurang ({len(fail_list)}):")
        for n, c in sorted(fail_list, key=lambda x: x[1]):
            print(f"    - {n}: {c} gambar")
    print(f"\n  Laporan: {report_path}")

    # Update classes.txt
    classes_path = Path(OUTPUT_DIR) / "classes.txt"
    existing_classes = set()
    if classes_path.exists():
        existing_classes = set(
            l.strip() for l in classes_path.read_text(encoding="utf-8").splitlines()
            if l.strip()
        )

    new_classes = sorted(results.keys())
    added = [c for c in new_classes if c not in existing_classes]
    if added:
        all_classes = sorted(existing_classes | set(new_classes))
        classes_path.write_text("\n".join(all_classes), encoding="utf-8")
        print(f"\n  classes.txt diupdate: +{len(added)} kelas baru")
        for c in added:
            print(f"    + {c}")
    else:
        print("\n  classes.txt: tidak ada kelas baru")


if __name__ == "__main__":
    main()
