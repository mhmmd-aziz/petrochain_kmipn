FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y libglib2.0-0 libgl1 libxcb1 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
# Install CPU-only PyTorch (Pinned to 2.5.1 to prevent YOLO weights_only bug in 2.6.0)
RUN pip install --no-cache-dir torch==2.5.1 torchvision==0.20.1 --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
RUN pip uninstall -y opencv-python opencv-python-headless || true
RUN pip install --no-cache-dir --force-reinstall opencv-python-headless

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Run the app
CMD ["python", "app.py"]
