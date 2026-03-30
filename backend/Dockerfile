# Use Python 3.10 Slim to reduce image size and fix build hangs
FROM python:3.10-slim

WORKDIR /app

# Configure libc to prefer IPv4 (Apply FIRST to fix apt-get hangs)
RUN echo "precedence ::ffff:0:0/96 100" >> /etc/gai.conf

# Install system dependencies (Minimal)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    ca-certificates \
    dnsutils \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Create a user to avoid running as root (required by Hugging Face)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Copy the requirements file into the container
COPY --chown=user requirements.txt .

# Install numpy<2 FIRST — torch 2.1.2 was compiled against numpy 1.x and
# will crash with numpy 2.x ("_ARRAY_API not found" → "Numpy is not available").
RUN pip install --no-cache-dir "numpy<2"

# Install CPU-only Torch with PINNED versions for ABI compatibility.
# torch and torchaudio MUST come from the same index and be version-matched.
# Using 2.1.2 — the last version with stable demucs 4.0.1 compatibility.
RUN pip install --no-cache-dir torch==2.1.2 torchaudio==2.1.2 --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies (torch==2.1.2 and torchaudio==2.1.2 are pinned
# in requirements.txt too — pip sees they're already installed and skips them.)
RUN pip install --no-cache-dir -r requirements.txt

# Install madmom separately with --no-build-isolation to use the installed Cython and numpy
# RUN pip install --no-cache-dir --no-build-isolation madmom>=0.16.1

# Copy the rest of the backend code
COPY --chown=user . .

# Hugging Face uses port 7860
ENV PORT=7860
# Preload models at build time (optional - can be done at runtime too)
# This caches the models in the container image
RUN python preload_models.py || true
# Run the application
CMD ["python", "main.py"]
