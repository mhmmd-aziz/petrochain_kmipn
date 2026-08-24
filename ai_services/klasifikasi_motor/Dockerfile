FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y libglib2.0-0 libgl1 libxcb1 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
# Install CPU-only PyTorch to save space and avoid ENOSPC in GitHub Actions
RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
RUN pip uninstall -y opencv-python opencv-python-headless || true
RUN pip install --no-cache-dir --force-reinstall opencv-python-headless

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Run the app
CMD ["python", "app.py"]
