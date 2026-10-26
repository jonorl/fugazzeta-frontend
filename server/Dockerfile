FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir "Pillow==10.4.0" --force-reinstall

COPY . .

# The deploy passes the commit being built; /health reports it so the smoke test can tell the new container is live.
# Declared after the installs so a new commit does not invalidate the cached pip layers.
ARG GIT_SHA=dev
ENV GIT_SHA=$GIT_SHA

ENV CUDA_VISIBLE_DEVICES=""
EXPOSE 7861

# Lets `docker ps` show whether the model is serving. The slim image has no curl or wget, so Python makes the request.
# The start period is long because loading the model takes a while on the VPS's CPU.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:7861/health', timeout=4)"

CMD ["python", "app.py"]