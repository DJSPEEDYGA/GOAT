<h1>GOAT Royalty App - Jetson AGX Orin 64GB Deployment Guide</h1><h2>🚀 Overview</h2><p>The NVIDIA Jetson AGX Orin 64GB Developer Kit is the <strong>ideal deployment platform</strong> for the GOAT Royalty App. With 64GB of unified CPU+GPU memory, it can run large language models (up to 70B parameters) that would require multiple RTX 3090s on a traditional desktop.</p><h3>Hardware Specifications</h3><table class="e-rte-table"> <thead> <tr> <th>Component</th> <th>Specification</th> </tr> </thead> <tbody><tr> <td><strong>GPU</strong></td> <td>2048 CUDA cores, Ampere architecture</td> </tr> <tr> <td><strong>CPU</strong></td> <td>12-core ARM Cortex-A78AE</td> </tr> <tr> <td><strong>Memory</strong></td> <td>64GB unified (CPU + GPU shared)</td> </tr> <tr> <td><strong>Storage</strong></td> <td>NVMe SSD support</td> </tr> <tr> <td><strong>OS</strong></td> <td>Ubuntu Linux (L4T - Linux for Tegra)</td> </tr> <tr> <td><strong>Power</strong></td> <td>15W / 30W / 60W / MAX modes</td> </tr> <tr> <td><strong>Form Factor</strong></td> <td>100mm x 87mm (compact, edge-ready)</td> </tr> </tbody></table><hr><h2>📦 Step 1: Initial Setup</h2><h3>1.1 Install JetPack SDK</h3><pre><code class="language-bash"># Update system
sudo apt update &amp;&amp; sudo apt upgrade -y

# Install NVIDIA JetPack (includes CUDA, cuDNN, TensorRT)
sudo apt install -y nvidia-jetpack
</code></pre><h3>1.2 Configure CUDA Environment</h3><p>Add to <code>~/.profile</code>:</p><pre><code class="language-bash"># CUDA paths
export PATH="/usr/local/cuda/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda/lib64:$LD_LIBRARY_PATH"
</code></pre><p>Then reload:</p><pre><code class="language-bash">source ~/.profile
</code></pre><h3>1.3 Install jtop (GPU Monitor)</h3><pre><code class="language-bash">sudo apt install -y python3-pip
sudo pip3 install -U jetson-stats
sudo reboot
</code></pre><p>After reboot, run <code>jtop</code> to see GPU/CPU/memory stats.</p><h3>1.4 Install Node.js</h3><pre><code class="language-bash">curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x
</code></pre><hr><h2>🤖 Step 2: Install Ollama for LLM Inference</h2><pre><code class="language-bash"># Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &amp;

# Pull recommended model for 64GB memory
ollama pull qwen2.5:32b-instruct-q4

# Test inference
ollama run qwen2.5:32b-instruct-q4 "Hello, how are you?"
</code></pre><hr><h2>🎬 Step 3: Install Video Editing Tools</h2><h3>DaVinci Resolve (ARM64 Version)</h3><pre><code class="language-bash"># Note: DaVinci Resolve has experimental ARM64 support
# For full GPU acceleration, use the official .deb package from Blackmagic

# Alternative: Use FFmpeg with GPU acceleration
sudo apt install -y ffmpeg

# Test GPU-accelerated encoding
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc output.mp4
</code></pre><hr><h2>🔧 Step 4: Optimize Jetson Performance</h2><h3>4.1 Set Maximum Performance Mode</h3><pre><code class="language-bash"># Set power mode to MAX (requires sudo)
sudo nvpmodel -m MAX

# Maximize clock speeds
sudo jetson_clocks

# Verify settings
sudo jetson_clocks --show
</code></pre><h3>4.2 Increase Swap Memory (for large models)</h3><pre><code class="language-bash"># Create 16GB swap file
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
</code></pre><h3>4.3 Configure Memory for AI</h3><pre><code class="language-bash"># Increase shared memory for large models
sudo mount -o remount,size=32G /dev/shm

# Make permanent by adding to /etc/fstab
echo 'tmpfs /dev/shm tmpfs defaults,size=32G 0 0' | sudo tee -a /etc/fstab
</code></pre><hr><h2>📥 Step 5: Deploy GOAT App</h2><h3>5.1 Clone/Copy GOAT App</h3><pre><code class="language-bash"># Create app directory
mkdir -p /opt/goat-app
cd /opt/goat-app

# Copy your GOAT app files here or clone from GitHub
# git clone https://github.com/your-repo/goat-app.git .
</code></pre><h3>5.2 Install Dependencies</h3><pre><code class="language-bash">cd /opt/goat-app
npm install --production
</code></pre><h3>5.3 Configure for Jetson</h3><p>Create <code>/opt/goat-app/jetson-config.json</code>:</p><pre><code class="language-json">{
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
</code></pre><h3>5.4 Create Systemd Service</h3><p>Create <code>/etc/systemd/system/goat-app.service</code>:</p><pre><code class="language-ini">[Unit]
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
</code></pre><p>Enable and start:</p><pre><code class="language-bash">sudo systemctl daemon-reload
sudo systemctl enable goat-app
sudo systemctl start goat-app
sudo systemctl status goat-app
</code></pre><hr><h2>🎮 Step 6: Remote Access</h2><h3>6.1 SSH Access</h3><pre><code class="language-bash"># Enable SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Connect from another machine
ssh username@jetson-ip-address
</code></pre><h3>6.2 Web Interface</h3><p>The GOAT app runs on port 3000:</p><pre><code>http://jetson-ip-address:3000
</code></pre><h3>6.3 Expose to Internet (Optional)</h3><pre><code class="language-bash"># Using ngrok
sudo snap install ngrok
ngrok http 3000
</code></pre><hr><h2>🤖 Recommended Models for Jetson 64GB</h2><table class="e-rte-table"> <thead> <tr> <th>Model</th> <th>Size</th> <th>Use Case</th> <th>Speed</th> </tr> </thead> <tbody><tr> <td><strong>qwen2.5:32b-instruct-q4</strong></td> <td>20GB</td> <td>Best balance of speed/quality</td> <td>~25-35 tok/s</td> </tr> <tr> <td><strong>deepseek-r1:70b-q4</strong></td> <td>42GB</td> <td>Complex reasoning, coding</td> <td>~8-12 tok/s</td> </tr> <tr> <td><strong>llama3:8b-instruct-q8</strong></td> <td>8GB</td> <td>Fast responses</td> <td>~80-100 tok/s</td> </tr> <tr> <td><strong>codestral:22b-q8</strong></td> <td>16GB</td> <td>Code completion</td> <td>~40-50 tok/s</td> </tr> </tbody></table><h3>Pull Models</h3><pre><code class="language-bash"># Recommended default
ollama pull qwen2.5:32b-instruct-q4

# For complex reasoning
ollama pull deepseek-r1:70b

# For fast responses
ollama pull llama3:8b
</code></pre><hr><h2>📊 Monitoring &amp; Maintenance</h2><h3>Check System Status</h3><pre><code class="language-bash"># GPU/CPU/Memory stats
jtop

# Power mode
sudo nvpmodel -q

# Clock speeds
sudo jetson_clocks --show

# Temperature
cat /sys/devices/virtual/thermal/thermal_zone*/temp

# Memory usage
free -h
</code></pre><h3>Ollama Management</h3><pre><code class="language-bash"># List models
ollama list

# Model info
ollama show qwen2.5:32b-instruct-q4

# Delete model
ollama rm model-name
</code></pre><hr><h2>🔥 Performance Tips</h2><ol> <li><strong>Use MAX power mode</strong> for LLM inference</li> <li><strong>Close unnecessary applications</strong> to free memory</li> <li><strong>Use Q4 quantization</strong> for best speed/quality balance</li> <li><strong>Monitor temperature</strong> - Jetson throttles if too hot</li> <li><strong>Use NVMe SSD</strong> for faster model loading</li> </ol><hr><h2>🚨 Troubleshooting</h2><h3>Out of Memory</h3><pre><code class="language-bash"># Check memory
free -h

# Clear caches
sync &amp;&amp; echo 3 | sudo tee /proc/sys/vm/drop_caches

# Use smaller model or quantization
ollama pull llama3:8b
</code></pre><h3>GPU Not Detected</h3><pre><code class="language-bash"># Reinstall JetPack
sudo apt install --reinstall nvidia-jetpack

# Reboot
sudo reboot
</code></pre><h3>Slow Inference</h3><pre><code class="language-bash"># Check power mode
sudo nvpmodel -q

# Set to MAX
sudo nvpmodel -m MAX
sudo jetson_clocks
</code></pre><hr><h2>📋 Quick Reference Commands</h2><pre><code class="language-bash"># Start GOAT App
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
</code></pre><hr><h2>🌐 Network Architecture</h2><pre><code>┌─────────────────────────────────────────────────────────┐
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
</code></pre><hr><h2>🎯 Next Steps</h2><ol> <li>✅ Set up JetPack and CUDA</li> <li>✅ Install Ollama and pull models</li> <li>✅ Deploy GOAT App</li> <li>✅ Configure voice/avatar integration</li> <li>✅ Set up remote access</li> <li>✅ Test LLM inference</li> <li>✅ Integrate with your dual 3090 desktop for hybrid deployment</li> </ol><hr><p><em>Generated for GOAT Royalty App - Jetson AGX Orin 64GB Edition</em></p>