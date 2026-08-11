"""
============================================================
  FILTER GAMBAR NON-MOTOR (HAPUS MOBIL, BACKGROUND, DLL)
  Menggunakan CLIP (zero-shot image classification) 
  untuk mendeteksi dan hapus gambar yang bukan motor/motorcycle.
  
  Install:
      pip install transformers torch torchvision pillow tqdm
      atau
      pip install open-clip-torch pillow tqdm
============================================================
"""

import sys
import os
from pathlib import Path
from PIL import Image
import shutil
from tqdm import tqdm

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

DATASET_DIR  = Path("dataset_motor")
TRASH_DIR    = Path("dataset_motor_trash")   # gambar yang dihapus dipindah ke sini
CONFIDENCE   = 0.25   # threshold DITURUNKAN: hanya buang yang JELAS bukan motor
                      # (sebelumnya 0.45 terlalu agresif, banyak false positive)
DRY_RUN      = False  # True = hanya print, tidak benar-benar hapus

# ─── LOAD MODEL CLIP ─────────────────────────────────────────
print("Loading CLIP model (pertama kali butuh download ~600 MB)...")
try:
    import torch
    from transformers import CLIPProcessor, CLIPModel

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"  Device: {device}")

    model     = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True)
    USE_CLIP  = True
    print("  CLIP loaded via transformers!")

except ImportError:
    try:
        import open_clip
        import torch

        device  = "cuda" if torch.cuda.is_available() else "cpu"
        model, _, preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained="openai"
        )
        model   = model.to(device).eval()
        tokenizer = open_clip.get_tokenizer("ViT-B-32")
        USE_CLIP  = True
        print("  CLIP loaded via open_clip!")

    except ImportError:
        print("  [!] CLIP tidak tersedia. Gunakan filter heuristik saja.")
        USE_CLIP = False


# ─── LABEL UNTUK KLASIFIKASI ─────────────────────────────────
POSITIVE_LABELS = [
    "a photo of a motorcycle",
    "a photo of a motorbike",
    "a photo of a sport motorcycle",
    "a photo of a cruiser motorcycle",
    "a photo of an adventure motorcycle",
    "a photo of a scooter",
    "a photo of a naked bike",
]

# Hanya label yang SANGAT berbeda dari motor
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


# ─── FUNGSI KLASIFIKASI ───────────────────────────────────────

def is_motorcycle_clip_transformers(img_path: Path) -> tuple[bool, float]:
    """Gunakan CLIP untuk cek apakah gambar adalah motor.
    
    Logika baru (lebih toleran):
    - BUANG hanya jika skor negative JAUH lebih tinggi dari positive
    - Kalau ragu (score mirip), pertahankan gambar
    """
    try:
        image = Image.open(img_path).convert("RGB")
        inputs = processor(
            text=ALL_LABELS,
            images=image,
            return_tensors="pt",
            padding=True
        ).to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            logits  = outputs.logits_per_image[0]
            probs   = logits.softmax(dim=0).cpu().numpy()

        pos_score = float(max(probs[:len(POSITIVE_LABELS)]))
        neg_score = float(max(probs[len(POSITIVE_LABELS):]))

        # Buang HANYA jika:
        # 1. Skor negatif jauh lebih tinggi dari positif (selisih > 0.15)
        # 2. DAN skor positif sangat rendah (< threshold)
        is_motor = not (neg_score > pos_score + 0.15 and pos_score < CONFIDENCE)
        return is_motor, pos_score

    except Exception as e:
        print(f"    [CLIP error] {e}")
        return True, 1.0   # kalau error, anggap valid (jangan hapus)


def is_motorcycle_heuristic(img_path: Path) -> tuple[bool, float]:
    """
    Filter heuristik sederhana (tanpa model AI).
    Cek: ukuran, aspect ratio, dan format valid.
    """
    try:
        img = Image.open(img_path)
        w, h = img.size

        # Terlalu kecil
        if w < 100 or h < 100:
            return False, 0.0

        # Aspect ratio: motor umumnya landscape (lebih lebar dari tinggi)
        # tapi tidak terlalu ekstrem
        ratio = w / h
        if ratio < 0.5 or ratio > 4.0:
            return False, 0.3

        return True, 0.8

    except Exception:
        return False, 0.0


# ─── FUNGSI UTAMA FILTERING ───────────────────────────────────

def filter_class_folder(class_dir: Path) -> dict:
    """Filter satu folder kelas. Return statistik."""
    images = list(class_dir.glob("*.jpg"))
    if not images:
        return {"total": 0, "kept": 0, "removed": 0}

    trash_class = TRASH_DIR / class_dir.name
    if not DRY_RUN:
        trash_class.mkdir(parents=True, exist_ok=True)

    kept    = 0
    removed = 0

    for img_path in images:
        if USE_CLIP:
            is_ok, score = is_motorcycle_clip_transformers(img_path)
        else:
            is_ok, score = is_motorcycle_heuristic(img_path)

        if is_ok:
            kept += 1
        else:
            if not DRY_RUN:
                shutil.move(str(img_path), str(trash_class / img_path.name))
            removed += 1
            if DRY_RUN:
                print(f"    [TRASH] {img_path.name}  (score={score:.2f})")

    return {"total": len(images), "kept": kept, "removed": removed}


def main():
    print("=" * 60)
    print("  MOTOR IMAGE FILTER — Hapus Non-Motor")
    print(f"  Mode: {'DRY RUN (tidak ada yang dihapus)' if DRY_RUN else 'AKTIF (hapus ke trash)'}")
    print(f"  Threshold CLIP: {CONFIDENCE}")
    print("=" * 60)

    if not DATASET_DIR.exists():
        print(f"[!] Folder dataset tidak ditemukan: {DATASET_DIR}")
        return

    class_dirs = sorted([d for d in DATASET_DIR.iterdir() if d.is_dir()])
    print(f"\nTotal kelas: {len(class_dirs)}")

    total_kept    = 0
    total_removed = 0

    for class_dir in tqdm(class_dirs, desc="Memfilter kelas"):
        stats = filter_class_folder(class_dir)
        total_kept    += stats["kept"]
        total_removed += stats["removed"]
        if stats["removed"] > 0:
            tqdm.write(
                f"  {class_dir.name}: "
                f"{stats['kept']}/{stats['total']} OK, "
                f"{stats['removed']} dihapus"
            )

    print("\n" + "=" * 60)
    print(f"  Selesai!")
    print(f"  Total gambar OK  : {total_kept}")
    print(f"  Total dihapus   : {total_removed}")
    print(f"  Trash folder    : {TRASH_DIR.resolve()}")
    print("=" * 60)
    print("\nJika ada yang salah hapus, gambar ada di folder trash/")
    print("Jalankan: python scrape_motor_v2.py  untuk isi ulang yang kurang")


if __name__ == "__main__":
    main()
