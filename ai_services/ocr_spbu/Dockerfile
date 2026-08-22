FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirement dan install
COPY requirements.txt .
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
