"""
============================================================
  SMART FILTER — TOP VIEW / SPBU SELECTION
  
  Script ini menyaring dataset_motor (>250cc) yang berjumlah
  sekitar 21.600 gambar menjadi 15.000 gambar.
  
  Cara kerja:
  1. Menggunakan AI CLIP untuk menilai "Top View / Overhead" score
     vs "Side View / Normal" score.
  2. Mengurutkan seluruh gambar dari skor Top View tertinggi.
  3. Mempertahankan 15.000 gambar terbaik.
  4. Memindahkan sisanya ke folder backup (dataset_motor_backup_sideview).
============================================================
"""

import sys
import shutil
import time
from pathlib import Path
from PIL import Image
import io
import torch
from transformers import CLIPProcessor, CLIPModel
from tqdm import tqdm

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

DATASET_DIR = Path("dataset_motor")
BACKUP_DIR  = Path("dataset_motor_backup_sideview")
TARGET_KEEP = 15000

# ─── LOAD CLIP ───────────────────────────────────────────────
print("Memuat model CLIP... (Mohon tunggu)")
device    = "cuda" if torch.cuda.is_available() else "cpu"
model     = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True)
print(f"  CLIP OK — Device: {device}")

# Prompt untuk memisahkan sudut pandang
LABELS = [
    "a photo of a motorcycle from above, top view, overhead CCTV angle, parking", # Target kita (Index 0)
    "a photo of a motorcycle from the side view, side profile",                   # Bukan target
    "a photo of a motorcycle from the front, eye level photography",              # Bukan target
    "a photo of a motorcycle from the back, rear view",                           # Bukan target
]

def score_image(img_path: Path) -> float:
    """Mengembalikan probabilitas (0-1) bahwa gambar ini adalah Top View."""
    try:
        image = Image.open(img_path).convert("RGB")
        inputs = processor(
            text=LABELS,
            images=image,
            return_tensors="pt",
            padding=True
        ).to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            logits  = outputs.logits_per_image[0]
            probs   = logits.softmax(dim=0).cpu().numpy()
            
        # Skor kemiripan dengan label pertama (Top View)
        return float(probs[0])
    except Exception as e:
        # Jika gambar rusak, kasih skor 0 agar otomatis dibuang
        return 0.0

def main():
    print(f"\nMencari semua gambar di '{DATASET_DIR}'...")
    all_images = list(DATASET_DIR.rglob("*.jpg"))
    total_images = len(all_images)
    print(f"Total gambar ditemukan: {total_images}")

    if total_images <= TARGET_KEEP:
        print(f"Jumlah gambar ({total_images}) sudah <= {TARGET_KEEP}. Tidak ada yang perlu dibuang.")
        return

    print("\nMemulai proses AI Scoring (Bisa memakan waktu 15-30 menit)...")
    results = []
    
    start_time = time.time()
    
    # Progress bar iterasi
    for i, img_path in enumerate(tqdm(all_images, desc="Scoring", unit="img")):
        top_view_score = score_image(img_path)
        results.append({
            "path": img_path,
            "score": top_view_score
        })
        
    print(f"\nScoring selesai dalam {time.time() - start_time:.1f} detik.")
    
    # Urutkan berdasarkan skor Top View tertinggi ke terendah
    print("Mengurutkan gambar berdasarkan skor CCTV/Top-View...")
    results.sort(key=lambda x: x["score"], reverse=True)
    
    # Pisahkan yang dipertahankan dan yang dibuang
    images_to_keep = results[:TARGET_KEEP]
    images_to_move = results[TARGET_KEEP:]
    
    print(f"Mempertahankan {len(images_to_keep)} gambar terbaik.")
    print(f"Memindahkan {len(images_to_move)} gambar ke folder backup...")
    
    # Pindahkan gambar
    for item in tqdm(images_to_move, desc="Memindahkan", unit="img"):
        img_path = item["path"]
        
        # Pertahankan struktur folder kelasnya
        # Contoh: dataset_motor/Yamaha_Nmax/123.jpg -> dataset_motor_backup_sideview/Yamaha_Nmax/123.jpg
        rel_path = img_path.relative_to(DATASET_DIR)
        dest_path = BACKUP_DIR / rel_path
        
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(img_path), str(dest_path))
        
    print("\n========================================================")
    print("SELESAI!")
    print(f"- Dataset '{DATASET_DIR}' sekarang berisi {TARGET_KEEP} gambar (Fokus sudut atas).")
    print(f"- Dataset cadangan (sudut samping) disimpan di '{BACKUP_DIR}'.")
    print("========================================================")

if __name__ == "__main__":
    main()
