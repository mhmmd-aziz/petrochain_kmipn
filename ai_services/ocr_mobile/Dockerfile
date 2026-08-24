FROM python:3.10-slim

# Skipping apt-get for libgl1-mesa-glx because we use opencv-python-headless

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libglib2.0-0 libgl1 libxcb1 && rm -rf /var/lib/apt/lists/*

# Copy requirement dan install
COPY requirements.txt .
# Install CPU-only PyTorch to save space and avoid ENOSPC in GitHub Actions
RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Ekspos port 5002
EXPOSE 5002

# Command untuk menjalankan aplikasi
CMD ["python", "app.py"]
