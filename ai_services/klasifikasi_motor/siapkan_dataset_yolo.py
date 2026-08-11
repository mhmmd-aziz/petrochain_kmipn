import os
import shutil
import random
import zipfile
from pathlib import Path
from tqdm import tqdm

def main():
    print("Memulai proses persiapan Dataset YOLO (Split & Zip)...")

    base_dirs = [Path("dataset_motor_under250"), Path("dataset_motor")]
    output_dir = Path("dataset_spbu")
    
    # Konfigurasi split ratio
    train_ratio = 0.8
    val_ratio = 0.2
    
    # Buat struktur direktori YOLO
    for split in ["train", "val"]:
        os.makedirs(output_dir / "images" / split, exist_ok=True)
        os.makedirs(output_dir / "labels" / split, exist_ok=True)
        
    for dataset_dir in base_dirs:
        if not dataset_dir.exists():
            print(f"[!] {dataset_dir} tidak ditemukan.")
            continue
            
        print(f"Memproses {dataset_dir.name}...")
        
        # Cari semua file jpg
        images = list(dataset_dir.rglob("*.jpg"))
        
        # Validasi jika file label (.txt) ada
        valid_pairs = []
        for img in images:
            txt = img.with_suffix('.txt')
            if txt.exists():
                valid_pairs.append((img, txt))
                
        print(f"  Ditemukan {len(valid_pairs)} pasang gambar & label.")
        
        # Acak data
        random.seed(42)
        random.shuffle(valid_pairs)
        
        # Hitung split
        train_count = int(len(valid_pairs) * train_ratio)
        train_pairs = valid_pairs[:train_count]
        val_pairs = valid_pairs[train_count:]
        
        # Fungsi copy
        def copy_files(pairs, split_name):
            for img, txt in tqdm(pairs, desc=f"  Copy ke {split_name}", leave=False):
                # Buat nama unik dengan menggabungkan nama folder parent (kelas) dan nama file
                # Agar tidak terjadi bentrok nama file jika ada file bernama sama
                parent_name = img.parent.name
                new_stem = f"{parent_name}_{img.stem}"
                
                new_img_path = output_dir / "images" / split_name / f"{new_stem}.jpg"
                new_txt_path = output_dir / "labels" / split_name / f"{new_stem}.txt"
                
                shutil.copy2(img, new_img_path)
                shutil.copy2(txt, new_txt_path)
                
        copy_files(train_pairs, "train")
        copy_files(val_pairs, "val")

    # Buat file data.yaml
    print("Membuat data.yaml...")
    yaml_content = f"""train: ../train/images
val: ../val/images

nc: 2
names: ['under_250cc', 'over_250cc']
"""
    with open(output_dir / "data.yaml", "w") as f:
        f.write(yaml_content)

    # Zipping dataset
    print("Mengompres folder ke dataset_spbu.zip (Bisa memakan waktu beberapa menit)...")
    zip_path = "dataset_spbu.zip"
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(output_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, output_dir)
                zipf.write(file_path, arcname)

    print(f"[V] Sukses! Dataset siap: {zip_path}")

if __name__ == "__main__":
    main()
