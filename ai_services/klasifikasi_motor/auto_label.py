import os
from pathlib import Path
from ultralytics import YOLO
import sys
from tqdm import tqdm

def main():
    # Fix encoding for Windows
    if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        
    print("Memuat model YOLOv8n...")
    model = YOLO("yolov8n.pt")  # Akan otomatis mendownload yolov8n.pt jika belum ada

    # Mapping folder ke class_id
    # Class 0: < 250cc
    # Class 1: >= 250cc
    dataset_configs = [
        {"dir": "dataset_motor_under250", "class_id": 0, "name": "< 250cc"},
        {"dir": "dataset_motor", "class_id": 1, "name": ">= 250cc"}
    ]

    for config in dataset_configs:
        dataset_path = Path(config["dir"])
        class_id = config["class_id"]
        
        if not dataset_path.exists():
            print(f"[!] Peringatan: Folder {dataset_path} tidak ditemukan. Melewati...")
            continue
            
        # Ambil semua file jpg
        image_files = list(dataset_path.rglob("*.jpg"))
        
        print(f"\nMemproses {len(image_files)} gambar untuk kelas '{config['name']}' (Class {class_id}) dari folder {dataset_path.name}...")
        
        # Proses per batch (misal: 32) untuk memanfaatkan GPU lebih baik
        batch_size = 32
        for i in tqdm(range(0, len(image_files), batch_size), desc=f"Auto-Labeling {config['name']}"):
            batch_files = image_files[i:i+batch_size]
            
            # Predict
            # verbose=False agar console tidak penuh
            # classes=[3] artinya HANYA mendeteksi kelas 'motorcycle' dari model COCO
            results = model.predict(source=batch_files, classes=[3], verbose=False, device=0)
            
            for result, img_path in zip(results, batch_files):
                # Buat file txt dengan nama yang sama persis dengan gambar
                label_path = img_path.with_suffix('.txt')
                
                boxes = result.boxes
                
                # Kita asumsikan motor utama adalah yang memiliki luas box terbesar
                if len(boxes) > 0:
                    best_idx = -1
                    max_area = 0
                    
                    for idx, box in enumerate(boxes):
                        # box.xywhn memberikan format normalisasi [x_center, y_center, width, height] -> (0 - 1.0)
                        xywhn = box.xywhn[0].tolist()
                        area = xywhn[2] * xywhn[3]
                        if area > max_area:
                            max_area = area
                            best_idx = idx
                            
                    # Ambil box terbaik
                    best_box = boxes[best_idx].xywhn[0].tolist()
                    x_c, y_c, w, h = best_box
                    
                    # Tulis ke label (class_id x_center y_center width height)
                    with open(label_path, "w", encoding="utf-8") as f:
                        f.write(f"{class_id} {x_c:.6f} {y_c:.6f} {w:.6f} {h:.6f}\n")
                else:
                    # Jika YOLO tidak mendeteksi motor sama sekali, buat file kosong
                    # (YOLO akan menganggap ini sebagai background image)
                    open(label_path, "w", encoding="utf-8").close()

    print("\n[V] Auto-Labeling Selesai!")

if __name__ == "__main__":
    main()
