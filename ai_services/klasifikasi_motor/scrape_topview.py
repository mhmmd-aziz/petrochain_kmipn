"""
============================================================
  MOTOR IMAGE SCRAPER — TOP-FRONT VIEW (CCTV/SPBU STYLE)
  ============================================================
  Tujuan: Tambah 25 foto per kelas dari sudut atas-depan
          seperti kamera CCTV di SPBU, sehingga total jadi
          100 gambar per kelas.

  Fitur:
  - Target 100 gambar/kelas (skip kalau sudah >= 100)
  - Query khusus sudut top-front/overhead/CCTV view
  - Multi-thread download (paralel per kelas)
  - GPU-accelerated resize dengan PyTorch + torchvision
    (fallback ke CPU Pillow jika GPU tidak ada)
  - Resume otomatis

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

# Fix encoding Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── GPU SETUP ──────────────────────────────────────────────
try:
    import torch
    import torchvision.transforms.functional as TF

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

# ─── KONFIGURASI ────────────────────────────────────────────
OUTPUT_DIR    = "dataset_motor"
IMAGES_TARGET = 100          # target baru: 100 gambar/kelas
MIN_SIZE_KB   = 15
IMAGE_SIZE    = (640, 640)
DELAY_SEC     = 1.0
MIN_WIDTH     = 200
MIN_HEIGHT    = 150
MAX_WORKERS   = 4            # thread paralel untuk download per kelas
PRINT_LOCK    = threading.Lock()

# ─── DAFTAR MOTOR ─────────────────────────────────────────
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


# ─── QUERY KHUSUS TOP-FRONT VIEW ────────────────────────────
def make_topview_queries(brand: str, model: str) -> list:
    """
    Query di-tune untuk sudut atas-depan (overhead/top-front),
    seperti kamera CCTV di SPBU yang melihat motor dari atas depan.
    """
    b = brand.replace("_", " ")
    return [
        f"{b} {model} motorcycle top view overhead",
        f"{b} {model} motorcycle bird eye view front",
        f"{b} {model} motorcycle front top angle photo",
        f"{b} {model} motorcycle aerial front view",
        f"{b} {model} motorcycle CCTV top view",
        f"{b} {model} motorcycle above front angle",
        f"{b} {model} motorcycle overhead front shot",
        f"{b} {model} motorcycle top down front view",
        f"{b} {model} motorcycle high angle front view",
        f"{b} {model} motorbike top view parking lot overhead",
    ]


# ─── HELPER ──────────────────────────────────────────────────

def make_class_name(brand: str, model: str) -> str:
    raw   = f"{brand}_{model}"
    clean = raw.replace(" ", "_").replace("-", "_").replace("/", "_")
    clean = "".join(c for c in clean if c.isalnum() or c == "_")
    return clean.lower()


def image_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def is_valid_image(data: bytes):
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
        if ratio < 0.5 or ratio > 5.0:
            return False, f"aspect ratio aneh ({ratio:.2f})"
        return True, "OK"
    except Exception as e:
        return False, f"rusak: {e}"


def save_image_gpu(data: bytes, save_path: Path) -> bool:
    """
    Resize gambar pakai GPU (torchvision) jika tersedia,
    fallback ke CPU Pillow jika tidak.
    """
    try:
        if USE_GPU and torch is not None:
            import torchvision.transforms.functional as TF_local
            img = Image.open(io.BytesIO(data)).convert("RGB")
            t = TF_local.to_tensor(img).unsqueeze(0).to(DEVICE)
            t = torch.nn.functional.interpolate(
                t, size=IMAGE_SIZE, mode="bilinear", align_corners=False
            )
            t = t.squeeze(0).cpu()
            img_out = TF_local.to_pil_image(t)
            img_out.save(str(save_path), "JPEG", quality=90)
        else:
            img = Image.open(io.BytesIO(data)).convert("RGB")
            img = img.resize(IMAGE_SIZE, Image.LANCZOS)
            img.save(str(save_path), "JPEG", quality=90)
        return True
    except Exception:
        return False


# ─── SCRAPER DUCKDUCKGO ─────────────────────────────────────

def scrape_ddgs(query: str, save_dir: Path,
                target: int, existing_hashes: set,
                prefix: str = "tv") -> int:
    try:
        from ddgs import DDGS
    except ImportError:
        return 0

    saved = 0
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 Chrome/124.0.0 Safari/537.36"
        )
    }

    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=target + 50))
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


# ─── SCRAPER BING ────────────────────────────────────────────

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


# ─── SCRAPE SATU MODEL ───────────────────────────────────────

def scrape_topview_motor(brand: str, model: str,
                         idx: int, total: int):
    class_name = make_class_name(brand, model)
    save_dir   = Path(OUTPUT_DIR) / class_name
    save_dir.mkdir(parents=True, exist_ok=True)

    existing       = list(save_dir.glob("*.jpg"))
    existing_hashes = set()
    for f in existing:
        try:
            existing_hashes.add(image_hash(f.read_bytes()))
        except Exception:
            pass

    already_have = len(existing)

    if already_have >= IMAGES_TARGET:
        with PRINT_LOCK:
            print(f"[{idx:3d}/{total}] SKIP  {class_name:<45} ({already_have} gambar)")
        return class_name, already_have

    need    = IMAGES_TARGET - already_have
    b       = brand.replace("_", " ")
    queries = make_topview_queries(brand, model)

    with PRINT_LOCK:
        print(f"\n[{idx:3d}/{total}] {b} {model}  | sudah={already_have}, butuh={need}")

    count = already_have

    # DDG queries (top-view oriented)
    for i, q in enumerate(queries):
        if count >= IMAGES_TARGET:
            break
        still_need = IMAGES_TARGET - count
        got = scrape_ddgs(q, save_dir, still_need, existing_hashes,
                          prefix=f"tv{i}")
        count += got
        if got > 0:
            with PRINT_LOCK:
                print(f"  DDG q{i} '{q[:55]}' +{got} -> total={count}")
        time.sleep(random.uniform(0.4, 0.9))

    # Fallback Bing jika masih kurang
    if count < IMAGES_TARGET:
        still_need = IMAGES_TARGET - count
        bing_q = f"{b} {model} motorcycle overhead top front angle CCTV"
        got2 = scrape_bing(bing_q, save_dir, still_need, existing_hashes,
                           prefix="btv")
        count += got2
        if got2 > 0:
            with PRINT_LOCK:
                print(f"  Bing +{got2} -> total={count}")

    status = "OK" if count >= IMAGES_TARGET * 0.8 else "KURANG"
    with PRINT_LOCK:
        print(f"  [{status}] {class_name} -> {count} gambar")

    return class_name, count


# ─── MAIN ────────────────────────────────────────────────────

def main():
    print("=" * 65)
    print("  MOTOR SCRAPER — TOP-FRONT VIEW (CCTV/SPBU ANGLE)")
    print(f"  Target     : {IMAGES_TARGET} gambar/kelas")
    print(f"  Sudut      : overhead front (atas-depan, CCTV style)")
    print(f"  Render GPU : {GPU_NAME}")
    print(f"  Workers    : {MAX_WORKERS} thread paralel")
    print(f"  Output     : {Path(OUTPUT_DIR).resolve()}")
    print("=" * 65)

    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    # Kumpulkan semua (brand, model) pair
    all_tasks = []
    for brand, categories in MOTOR_LIST.items():
        for category, models in categories.items():
            for model in models:
                all_tasks.append((brand, model))

    total = len(all_tasks)
    print(f"\nTotal kelas: {total}\n")

    results = {}

    # ThreadPoolExecutor — beberapa kelas di-scrape paralel
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as exe:
        future_map = {
            exe.submit(scrape_topview_motor, brand, model, idx + 1, total): (brand, model)
            for idx, (brand, model) in enumerate(all_tasks)
        }
        for fut in as_completed(future_map):
            try:
                cls, cnt = fut.result()
                results[cls] = cnt
            except Exception as e:
                brand, model = future_map[fut]
                cn = make_class_name(brand, model)
                with PRINT_LOCK:
                    print(f"  [ERROR] {cn}: {e}")
                results[cn] = -1

    # Laporan
    report_lines = ["kelas,jumlah,status"]
    ok_count = 0
    fail_list = []
    for cls, cnt in sorted(results.items()):
        status = "OK" if cnt >= IMAGES_TARGET * 0.8 else "KURANG"
        if status == "OK":
            ok_count += 1
        else:
            fail_list.append((cls, cnt))
        report_lines.append(f"{cls},{cnt},{status}")

    report_path = Path(OUTPUT_DIR) / "scraping_report_topview.csv"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")

    print("\n" + "=" * 65)
    print("SELESAI!")
    print(f"  Kelas OK    : {ok_count}/{len(results)}")
    print(f"  Total gambar: {sum(v for v in results.values() if v > 0):,}")
    if fail_list:
        print(f"\n  Kelas kurang ({len(fail_list)}):")
        for n, c in sorted(fail_list, key=lambda x: x[1]):
            print(f"    - {n}: {c} gambar")
    print(f"\n  Laporan: {report_path}")


if __name__ == "__main__":
    main()
