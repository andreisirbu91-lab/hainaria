FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the u2net model to make the first request faster
RUN python -c "from rembg import remove; import numpy as np; from PIL import Image; remove(Image.new('RGBA', (1,1)))"

COPY . .

EXPOSE 8000

CMD ["python", "app/main.py"]
