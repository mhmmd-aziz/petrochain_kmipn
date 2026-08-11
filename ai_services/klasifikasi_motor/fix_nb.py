import json
with open('test_model.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source_str = ''.join(cell['source'])
        if 'video_youtube = "https://youtu.be/kjkf4NvO4f8?si=PWqZZly7aD0CyHhz"' in source_str:
            cell['source'] = [
                'from ultralytics import YOLO\n',
                'from pytubefix import YouTube\n',
                '\n',
                '# Panggil model terbaik yang baru saja selesai di-training\n',
                '# (Pastikan path ini benar sesuai tempat penyimpanannya nanti, biasanya di runs/detect/spbu_model_lokal/weights/best.pt)\n',
                'model = YOLO(\'runs/detect/spbu_model_lokal/weights/best.pt\')\n',
                '\n',
                '# Masukkan Link YouTube CCTV atau Lalu Lintas apa saja di sini\n',
                'video_youtube = "https://youtu.be/kjkf4NvO4f8?si=PWqZZly7aD0CyHhz"\n',
                '\n',
                '# YOLO memiliki bug ketika mencoba membaca link YouTube yang tidak memiliki resolusi 1080p.\n',
                '# Oleh karena itu, kita bypass dengan cara mengekstrak link MP4-nya secara manual menggunakan pytubefix\n',
                'yt = YouTube(video_youtube)\n',
                'stream_url = yt.streams.filter(file_extension="mp4").get_highest_resolution().url\n',
                '\n',
                '# Jalankan deteksi pada stream URL asli. show=True akan memunculkan layar video (pop-up) di Windows-mu\n',
                'results = model.predict(source=stream_url, show=True, conf=0.5)'
            ]

with open('test_model.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)
