"""
============================================================
  SMART FILTER — Scoring tanpa langsung hapus
  
  Script ini HANYA menghitung skor CLIP per gambar
  dan membuat laporan CSV + folder preview.
  TIDAK langsung menghapus gambar.
  
  Setelah lihat laporan, baru jalankan filter_hapus.py
  untuk hapus berdasarkan skor.
============================================================
"""

import sys
import csv
import shutil
from pathlib import Path
from PIL import Image
import io

import argparse

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

parser = argparse.ArgumentParser(description="Score images with CLIP.")
parser.add_argument("--dir", type=str, default="dataset_motor", help="Dataset directory to score")
args = parser.parse_args()

DATASET_DIR  = Path(args.dir)
REPORT_PATH  = Path(f"clip_scores_{DATASET_DIR.name}.csv")
PREVIEW_DIR  = Path(f"{DATASET_DIR.name}_preview_low_score")  # preview gambar skor rendah

# Skor di bawah ini akan masuk laporan untuk diperiksa manual
REVIEW_THRESHOLD = 0.20

# ─── LOAD CLIP ───────────────────────────────────────────────
print("Loading CLIP model...")
import torch
from transformers import CLIPProcessor, CLIPModel

device    = "cuda" if torch.cuda.is_available() else "cpu"
model     = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True)
print(f"  CLIP OK — Device: {device}")

POSITIVE_LABELS = [
    "a photo of a motorcycle",
    "a photo of a motorbike",
    "a photo of a sport motorcycle",
    "a photo of a cruiser motorcycle",
    "a photo of an adventure motorcycle",
    "a photo of a scooter",
]
NEGATIVE_LABELS = [
    "a photo of a car",
    "a photo of a truck",
    "a photo of a bus",
    "a photo of an airplane",
    "a plain white background with no vehicle",
    "a photo of text or logo only",
]
ALL_LABELS = POSITIVE_LABELS + NEGATIVE_LABELS


def score_image(img_path: Path) -> dict:
    """Return skor CLIP untuk satu gambar."""
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
        best_neg_label = NEGATIVE_LABELS[
            int(probs[len(POSITIVE_LABELS):].argmax())
        ]

        return {
            "pos_score": round(pos_score, 4),
            "neg_score": round(neg_score, 4),
            "best_neg": best_neg_label,
            "is_suspect": neg_score > pos_score + 0.15 and pos_score < 0.20,
        }
    except Exception as e:
        return {"pos_score": 1.0, "neg_score": 0.0,
                "best_neg": "", "is_suspect": False}


def main():
    print(f"\nScoring semua gambar di {DATASET_DIR}...")
    class_dirs = sorted([d for d in DATASET_DIR.iterdir() if d.is_dir()])
    
    PREVIEW_DIR.mkdir(exist_ok=True)
    
    rows = []
    suspect_count = 0
    total_count   = 0

    for class_dir in class_dirs:
        images = list(class_dir.glob("*.jpg"))
        if not images:
            continue
        print(f"  Scoring {class_dir.name} ({len(images)} gambar)...", end=" ")
        class_suspects = 0
        
        preview_class = PREVIEW_DIR / class_dir.name
        
        for img_path in images:
            total_count += 1
            result = score_image(img_path)
            rows.append({
                "kelas": class_dir.name,
                "file": img_path.name,
                "pos_score": result["pos_score"],
                "neg_score": result["neg_score"],
                "best_neg_label": result["best_neg"],
                "suspect": "YA" if result["is_suspect"] else "tidak",
            })
            if result["is_suspect"]:
                suspect_count += 1
                class_suspects += 1
                # Salin ke preview folder untuk dicek manual
                preview_class.mkdir(exist_ok=True)
                shutil.copy(str(img_path), str(preview_class / img_path.name))

        print(f"{class_suspects} suspect")

    # Simpan CSV
    with open(REPORT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    # Urutkan suspect
    suspects = [r for r in rows if r["suspect"] == "YA"]
    suspects.sort(key=lambda x: x["pos_score"])

    print(f"\n{'='*60}")
    print(f"SELESAI SCORING")
    print(f"  Total gambar  : {total_count}")
    print(f"  Suspect (non-motor): {suspect_count}")
    print(f"  Laporan CSV   : {REPORT_PATH.resolve()}")
    print(f"  Preview folder: {PREVIEW_DIR.resolve()}")
    print(f"{'='*60}")

    if suspects:
        print(f"\nTop 10 gambar paling mencurigakan:")
        print(f"{'Kelas':<40} {'File':<20} {'Motor':>6} {'Non-Motor':>10} {'Terdeteksi sebagai'}")
        print("-" * 100)
        for r in suspects[:10]:
            print(f"{r['kelas']:<40} {r['file']:<20} {r['pos_score']:>6.3f} {r['neg_score']:>10.3f}  {r['best_neg_label']}")

    print(f"\nCek folder '{PREVIEW_DIR}' untuk review manual gambar mencurigakan.")
    print(f"Jalankan 'python filter_hapus.py' untuk hapus berdasarkan skor.")


if __name__ == "__main__":
    main()
