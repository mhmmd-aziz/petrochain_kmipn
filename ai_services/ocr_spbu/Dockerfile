FROM python:3.10-slim

# Skipping apt-get for libgl1-mesa-glx because we use opencv-python-headless

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libglib2.0-0 libgl1 libxcb1 && rm -rf /var/lib/apt/lists/*

# Copy requirement dan install
COPY requirements.txt .
# Install CPU-only PyTorch (Pinned to 2.5.1 to prevent YOLO weights_only bug in 2.6.0)
RUN pip install --no-cache-dir torch==2.5.1 torchvision==0.20.1 --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
RUN pip uninstall -y opencv-python opencv-python-headless || true
RUN pip install --no-cache-dir --force-reinstall opencv-python-headless

# Pre-download EasyOCR models
RUN python -c "import easyocr; easyocr.Reader(['id', 'en'], gpu=False, download_enabled=True)"

# Copy source code
COPY . .

# Ekspos port 5003
EXPOSE 5003

# Set default env
ENV API_HOST=0.0.0.0
ENV API_PORT=5003

# Command untuk menjalankan aplikasi
CMD ["python", "main.py"]
