# GOAT Royalty App - Jetson AGX Orin 64GB Deployment Guide

## 🚀 Overview

The NVIDIA Jetson AGX Orin 64GB Developer Kit is the **ideal deployment platform** for the GOAT Royalty App. With 64GB of unified CPU+GPU memory, it can run large language models (up to 70B parameters) that would require multiple RTX 3090s on a traditional desktop.

### Hardware Specifications
| Component | Specification |
|-----------|---------------|
| **GPU** | 2048 CUDA cores, Ampere architecture |
| **CPU** | 12-core ARM Cortex-A78AE |
| **Memory** | 64GB unified (CPU + GPU shared) |
| **Storage** | NVMe SSD support |
| **OS** | Ubuntu Linux (L4T - Linux for Tegra) |
| **Power** | 15W / 30W / 60W / MAX modes |
| **Form Factor** | 100mm x 87mm (compact, edge-ready) |

---

## 📦 Step 1: Initial Setup

### 1.1 Install JetPack SDK
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install NVIDIA JetPack (includes CUDA, cuDNN, TensorRT)
sudo apt install -y nvidia-jetpack
```

### 1.2 Configure CUDA Environment
Add to `~/.profile`:
```bash
# CUDA paths
export PATH="/usr/local/cuda/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda/lib64:$LD_LIBRARY_PATH"
```
Then reload:
```bash
source ~/.profile
```

### 1.3 Install jtop (GPU Monitor)
```bash
sudo apt install -y python3-pip
sudo pip3 install -U jetson-stats
sudo reboot
```

After reboot, run `jtop` to see GPU/CPU/memory stats.

### 1.4 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x
```

---

## 🤖 Step 2: Install Ollama for LLM Inference

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &

# Pull recommended model for 64GB memory
ollama pull qwen2.5:32b-instruct-q4

# Test inference
ollama run qwen2.5:32b-instruct-q4 "Hello, how are you?"
```

---

## 🎬 Step 3: Install Video Editing Tools

### DaVinci Resolve (ARM64 Version)
```bash
# Note: DaVinci Resolve has experimental ARM64 support
# For full GPU acceleration, use the official .deb package from Blackmagic

# Alternative: Use FFmpeg with GPU acceleration
sudo apt install -y ffmpeg

# Test GPU-accelerated encoding
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc output.mp4
```

---

## 🔧 Step 4: Optimize Jetson Performance

### 4.1 Set Maximum Performance Mode
```bash
# Set power mode to MAX (requires sudo)
sudo nvpmodel -m MAX

# Maximize clock speeds
sudo jetson_clocks

# Verify settings
sudo jetson_clocks --show
```

### 4.2 Increase Swap Memory (for large models)
```bash
# Create 16GB swap file
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4.3 Configure Memory for AI
```bash
# Increase shared memory for large models
sudo mount -o remount,size=32G /dev/shm

# Make permanent by adding to /etc/fstab
echo 'tmpfs /dev/shm tmpfs defaults,size=32G 0 0' | sudo tee -a /etc/fstab
```

---

## 📥 Step 5: Deploy GOAT App

### 5.1 Clone/Copy GOAT App
```bash
# Create app directory
mkdir -p /opt/goat-app
cd /opt/goat-app

# Copy your GOAT app files here or clone from GitHub
# git clone https://github.com/your-repo/goat-app.git .
```

### 5.2 Install Dependencies
```bash
cd /opt/goat-app
npm install --production
```

### 5.3 Configure for Jetson
Create `/opt/goat-app/jetson-config.json`:
```json
{
  "platform": "jetson-agx-orin-64gb",
  "architecture": "arm64",
  "memory": {
    "unified": 64,
    "recommended_model_usage": 48,
    "reserved_for_system": 16
  },
  "power_mode": "MAX",
  "gpu": {
    "cuda_cores": 2048,
    "architecture": "ampere"
  },
  "llm": {
    "provider": "ollama",
    "default_model": "qwen2.5:32b-instruct-q4",
    "fallback_model": "llama3:8b-instruct-q8"
  },
  "features": {
    "voice_control": true,
    "avatar_integration": true,
    "video_editing": true,
    "desktop_control": false
  }
}
```

### 5.4 Create Systemd Service
Create `/etc/systemd/system/goat-app.service`:
```ini
[Unit]
Description=GOAT Royalty App
After=network.target ollama.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/goat-app
Environment="NODE_ENV=production"
Environment="JETSON_MODE=64GB"
ExecStartPre=/usr/bin/sudo /usr/bin/nvpmodel -m MAX
ExecStartPre=/usr/bin/sudo /usr/bin/jetson_clocks
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable goat-app
sudo systemctl start goat-app
sudo systemctl status goat-app
```

---

## 🎮 Step 6: Remote Access

### 6.1 SSH Access
```bash
# Enable SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Connect from another machine
ssh username@jetson-ip-address
```

### 6.2 Web Interface
The GOAT app runs on port 3000:
```
http://jetson-ip-address:3000
```

### 6.3 Expose to Internet (Optional)
```bash
# Using ngrok
sudo snap install ngrok
ngrok http 3000
```

---

## 🤖 Recommended Models for Jetson 64GB

| Model | Size | Use Case | Speed |
|-------|------|----------|-------|
| **qwen2.5:32b-instruct-q4** | 20GB | Best balance of speed/quality | ~25-35 tok/s |
| **deepseek-r1:70b-q4** | 42GB | Complex reasoning, coding | ~8-12 tok/s |
| **llama3:8b-instruct-q8** | 8GB | Fast responses | ~80-100 tok/s |
| **codestral:22b-q8** | 16GB | Code completion | ~40-50 tok/s |

### Pull Models
```bash
# Recommended default
ollama pull qwen2.5:32b-instruct-q4

# For complex reasoning
ollama pull deepseek-r1:70b

# For fast responses
ollama pull llama3:8b
```

---

## 📊 Monitoring & Maintenance

### Check System Status
```bash
# GPU/CPU/Memory stats
jtop

# Power mode
sudo nvpmodel -q

# Clock speeds
sudo jetson_clocks --show

# Temperature
cat /sys/devices/virtual/thermal/thermal_zone*/temp

# Memory usage
free -h
```

### Ollama Management
```bash
# List models
ollama list

# Model info
ollama show qwen2.5:32b-instruct-q4

# Delete model
ollama rm model-name
```

---

## 🔥 Performance Tips

1. **Use MAX power mode** for LLM inference
2. **Close unnecessary applications** to free memory
3. **Use Q4 quantization** for best speed/quality balance
4. **Monitor temperature** - Jetson throttles if too hot
5. **Use NVMe SSD** for faster model loading

---

## 🚨 Troubleshooting

### Out of Memory
```bash
# Check memory
free -h

# Clear caches
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches

# Use smaller model or quantization
ollama pull llama3:8b
```

### GPU Not Detected
```bash
# Reinstall JetPack
sudo apt install --reinstall nvidia-jetpack

# Reboot
sudo reboot
```

### Slow Inference
```bash
# Check power mode
sudo nvpmodel -q

# Set to MAX
sudo nvpmodel -m MAX
sudo jetson_clocks
```

---

## 📋 Quick Reference Commands

```bash
# Start GOAT App
sudo systemctl start goat-app

# Stop GOAT App
sudo systemctl stop goat-app

# Check status
sudo systemctl status goat-app

# View logs
sudo journalctl -u goat-app -f

# Set power mode
sudo nvpmodel -m MAX  # Options: 15W, 30W, 60W, MAX

# Monitor GPU
jtop

# Run LLM
ollama run qwen2.5:32b-instruct-q4
```

---

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    JETSON AGX ORIN 64GB                 │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   GOAT App  │  │   Ollama    │  │  DaVinci    │     │
│  │  (Node.js)  │  │   (LLM)     │  │  (Video)    │     │
│  │   :3000     │  │   :11434    │  │   (GPU)     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          │                              │
│              ┌───────────┴───────────┐                  │
│              │    64GB Unified Memory    │              │
│              │    (CPU + GPU Shared)  │                  │
│              └───────────────────────┘                  │
│                          │                              │
│              ┌───────────┴───────────┐                  │
│              │   Ampere GPU (2048)   │                  │
│              │   ARM CPU (12 cores)  │                  │
│              └───────────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   Network   │
                    │   (WiFi/Eth)│
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────┴─────┐           ┌──────┴──────┐
        │  Desktop  │           │   Mobile    │
        │  Browser  │           │   Browser   │
        └───────────┘           └─────────────┘
```

---

## 🎯 Next Steps

1. ✅ Set up JetPack and CUDA
2. ✅ Install Ollama and pull models
3. ✅ Deploy GOAT App
4. ✅ Configure voice/avatar integration
5. ✅ Set up remote access
6. ✅ Test LLM inference
7. ✅ Integrate with your dual 3090 desktop for hybrid deployment

---

*Generated for GOAT Royalty App - Jetson AGX Orin 64GB Edition*