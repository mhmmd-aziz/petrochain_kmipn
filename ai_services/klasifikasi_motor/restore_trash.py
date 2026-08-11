"""
Script untuk restore SEMUA gambar dari trash kembali ke dataset,
lalu re-filter dengan threshold yang lebih rendah.
"""
import sys
import shutil
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

TRASH_DIR   = Path("dataset_motor_trash")
DATASET_DIR = Path("dataset_motor")

total = 0
for trash_class in TRASH_DIR.iterdir():
    if not trash_class.is_dir():
        continue
    dest = DATASET_DIR / trash_class.name
    dest.mkdir(exist_ok=True)
    for img in trash_class.glob("*.jpg"):
        shutil.move(str(img), str(dest / img.name))
        total += 1

print(f"Restored {total} gambar dari trash ke dataset.")
