FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
# Install CPU-only PyTorch to save space and avoid ENOSPC in GitHub Actions
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Run the app
CMD ["python", "app.py"]
