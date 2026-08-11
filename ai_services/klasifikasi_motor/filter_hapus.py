"""
============================================================
  FILTER HAPUS — Hapus gambar berdasarkan hasil score_gambar.py
  
  Jalankan score_gambar.py dulu, review CSV-nya,
  baru jalankan script ini.
  
  Gambar yang dihapus dipindah ke trash (bukan delete langsung).
============================================================
"""

import sys
import csv
import shutil
from pathlib import Path

import argparse

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

parser = argparse.ArgumentParser()
parser.add_argument("--dir", type=str, default="dataset_motor")
parser.add_argument("--auto", action="store_true")
args = parser.parse_args()

DATASET_DIR = Path(args.dir)
TRASH_DIR   = Path(f"{args.dir}_trash")
REPORT_PATH = Path(f"clip_scores_{DATASET_DIR.name}.csv")

# ─── SESUAIKAN THRESHOLD INI ─────────────────────────────────
# Hapus gambar yang:
# 1. pos_score < POS_THRESHOLD  (skor motor rendah)
# 2. neg_score > neg_score + NEG_MARGIN  (skor negatif jauh lebih tinggi)
POS_THRESHOLD = 0.20
NEG_MARGIN    = 0.15
# ─────────────────────────────────────────────────────────────


def main():
    if not REPORT_PATH.exists():
        print(f"[!] File {REPORT_PATH} tidak ditemukan.")
        print(f"    Jalankan dulu: python score_gambar.py")
        return

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    to_remove = [
        r for r in rows
        if float(r["pos_score"]) < POS_THRESHOLD
        and float(r["neg_score"]) > float(r["pos_score"]) + NEG_MARGIN
    ]

    print(f"Total gambar       : {len(rows)}")
    print(f"Akan dihapus       : {len(to_remove)}")
    print(f"Akan dipertahankan : {len(rows) - len(to_remove)}")
    print()

    if not to_remove:
        print("Tidak ada gambar yang perlu dihapus.")
        return

    print("Preview 10 yang akan dihapus:")
    print(f"{'Kelas':<40} {'File':<20} {'Motor':>6} {'Non-Motor':>10}")
    print("-" * 80)
    for r in sorted(to_remove, key=lambda x: float(x["pos_score"]))[:10]:
        print(f"{r['kelas']:<40} {r['file']:<20} {float(r['pos_score']):>6.3f} {float(r['neg_score']):>10.3f}")

    if not args.auto:
        konfirm = input(f"\nLanjutkan hapus {len(to_remove)} gambar? (y/n): ").strip().lower()
        if konfirm != "y":
            print("Dibatalkan.")
            return
    else:
        print(f"\n[AUTO] Menghapus {len(to_remove)} gambar...")

    removed = 0
    for r in to_remove:
        src = DATASET_DIR / r["kelas"] / r["file"]
        if not src.exists():
            continue
        dst_dir = TRASH_DIR / r["kelas"]
        dst_dir.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst_dir / r["file"]))
        removed += 1

    print(f"\nSelesai! {removed} gambar dipindah ke {TRASH_DIR}")
    print("Jika ada yang salah, jalankan: python restore_trash.py")


if __name__ == "__main__":
    main()
