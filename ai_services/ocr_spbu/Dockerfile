FROM python:3.10-slim

# Skipping apt-get for libgl1-mesa-glx because we use opencv-python-headless

# Set working directory
WORKDIR /app

# Copy requirement dan install
COPY requirements.txt .
# Install CPU-only PyTorch to save space and avoid ENOSPC in GitHub Actions
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Ekspos port 5003
EXPOSE 5003

# Set default env
ENV API_HOST=0.0.0.0
ENV API_PORT=5003

# Command untuk menjalankan aplikasi
CMD ["python", "main.py"]
