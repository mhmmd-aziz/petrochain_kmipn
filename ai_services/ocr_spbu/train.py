import os
import argparse
from ultralytics import YOLO

def train_model(model_name, data_yaml, epochs, imgsz, batch_size, project_name, run_name):
    """
    Fungsi untuk melatih atau fine-tuning YOLOv8.
    """
    print(f"Memulai training menggunakan model awal: {model_name}")
    print(f"Dataset config: {data_yaml}")
    
    # Load model (misal: yolov8n.pt untuk mulai dari awal, atau model custom yang sudah ada)
    model = YOLO(model_name)
    
    import torch
    device_mode = "0" if torch.cuda.is_available() else "cpu"
    print(f"Menggunakan device: {device_mode}")
    
    # Mulai proses training
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        project=project_name,
        name=run_name,
        device=device_mode
    )
    
    print(f"\nTraining Selesai!")
    print(f"Model terbaik disimpan di: {project_name}/{run_name}/weights/best.pt")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script Training YOLOv8 (Kendaraan / Plat Nomor)")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Path ke model awal (default: yolov8n.pt)")
    parser.add_argument("--data", type=str, required=True, help="Path ke file dataset.yaml")
    parser.add_argument("--epochs", type=int, default=50, help="Jumlah epochs (default: 50)")
    parser.add_argument("--imgsz", type=int, default=640, help="Ukuran gambar training (default: 640)")
    parser.add_argument("--batch", type=int, default=16, help="Ukuran batch (default: 16)")
    parser.add_argument("--project", type=str, default="runs", help="Folder output (default: runs)")
    parser.add_argument("--name", type=str, default="train_result", help="Nama run training (default: train_result)")
    
    args = parser.parse_args()
    
    # Cek ketersediaan file data.yaml
    if not os.path.exists(args.data):
        print(f"Error: File dataset '{args.data}' tidak ditemukan!")
        print("Silakan download dataset dari Roboflow dan pastikan path data.yaml benar.")
        exit(1)
        
    train_model(
        model_name=args.model,
        data_yaml=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch_size=args.batch,
        project_name=args.project,
        run_name=args.name
    )
