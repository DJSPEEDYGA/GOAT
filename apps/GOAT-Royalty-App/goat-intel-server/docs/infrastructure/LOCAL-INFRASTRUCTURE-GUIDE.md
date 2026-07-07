<h1>GOAT Royalty - Local Infrastructure Guide</h1><h2>Your Personal AI Creator Hub</h2><hr><h2>Overview</h2><p>This guide sets up your local AI infrastructure with:</p><ul> <li><strong>Ubuntu 8TB</strong> as the central storage hub</li> <li><strong>NVIDIA Jetson Thor</strong> as the primary LLM runner</li> <li><strong>NVIDIA Jetson Orin 64GB</strong> for secondary AI tasks</li> <li><strong>NVIDIA Jetson Orin Mini</strong> for edge/lightweight tasks</li> <li><strong>GOAT Royalty App</strong> as the control hub</li> </ul><hr><h2>Part 1: Ubuntu 8TB Storage Hub Setup</h2><h3>Step 1: Drive Mounting and Configuration</h3><pre><code class="language-bash"># Run these commands on your Ubuntu machine

# 1. Identify your 8TB drive
lsblk
# Look for your 8TB drive (likely /dev/sda or /dev/nvme0n1)

# 2. Create mount point
sudo mkdir -p /mnt/goat-storage

# 3. If drive is already formatted, mount it
sudo mount /dev/sdX1 /mnt/goat-storage  # Replace X with your drive letter

# 4. If you need to format (WARNING: erases all data)
# For ext4 (Linux native - recommended for your use case):
sudo mkfs.ext4 -L GOAT-STORAGE /dev/sdX1

# 5. Add to fstab for auto-mount on boot
echo '/dev/sdX1 /mnt/goat-storage ext4 defaults 0 2' | sudo tee -a /etc/fstab

# 6. Set permissions
sudo chown -R $USER:$USER /mnt/goat-storage
chmod -R 755 /mnt/goat-storage
</code></pre><h3>Step 2: Directory Structure</h3><pre><code class="language-bash"># Create the GOAT directory structure
mkdir -p /mnt/goat-storage/{\
llms/models,\
llms/embeddings,\
llms/cache,\
apps/goat-royalty,\
apps/agents,\
data/users,\
data/media,\
data/training,\
data/backups,\
logs,\
config,\
scripts\
}

# Create subdirectories for LLM models
mkdir -p /mnt/goat-storage/llms/models/{\
llama3,\
mistral,\
mixtral,\
phi3,\
whisper,\
other\
}
</code></pre><h3>Step 3: Network Sharing (SMB for cross-platform access)</h3><pre><code class="language-bash"># Install Samba
sudo apt update
sudo apt install samba samba-common-bin -y

# Configure Samba share
sudo tee -a /etc/samba/smb.conf &gt; /dev/null &lt;&lt; 'EOF'

[GOAT-Storage]
   path = /mnt/goat-storage
   browseable = yes
   read only = no
   create mask = 0755
   directory mask = 0755
   valid users = @sudo
   force user = root
   force group = root
EOF

# Set Samba password for your user
sudo smbpasswd -a $USER

# Restart Samba
sudo systemctl restart smbd
sudo systemctl enable smbd
</code></pre><h3>Step 4: NFS for Jetson devices (faster for Linux-to-Linux)</h3><pre><code class="language-bash"># Install NFS server
sudo apt install nfs-kernel-server -y

# Export the storage
echo '/mnt/goat-storage *(rw,sync,no_subtree_check,no_root_squash)' | sudo tee -a /etc/exports

# Apply exports
sudo exportfs -a
sudo systemctl restart nfs-kernel-server
sudo systemctl enable nfs-kernel-server
</code></pre><hr><h2>Part 2: NVIDIA Jetson Setup</h2><h3>Jetson Thor (Primary LLM Runner)</h3><p>The Jetson Thor is your most powerful device. It will run:</p><ul> <li>Large Language Models (Llama 3 70B, Mixtral 8x7B)</li> <li>Money Penny agent (main orchestrator)</li> <li>Primary AI inference</li> </ul><h4>Initial Setup</h4><pre><code class="language-bash"># After flashing JetPack 6.x on Jetson Thor

# 1. Connect to the same network as your Ubuntu server
# 2. Note the IP address
hostname -I

# 3. Mount the 8TB storage from Ubuntu
sudo mkdir -p /mnt/goat-storage
echo 'UBUNTU_IP:/mnt/goat-storage /mnt/goat-storage nfs defaults 0 0' | sudo tee -a /etc/fstab
sudo mount -a

# 4. Install Ollama with external model directory
curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama to use external storage
sudo systemctl stop ollama
sudo mkdir -p /mnt/goat-storage/llms/ollama
sudo tee /etc/systemd/system/ollama.service.d/override.conf &gt; /dev/null &lt;&lt; 'EOF'
[Service]
Environment="OLLAMA_MODELS=/mnt/goat-storage/llms/ollama"
EOF
sudo systemctl daemon-reload
sudo systemctl start ollama
</code></pre><h4>Pull Large Models on Thor</h4><pre><code class="language-bash"># These models will benefit from Thor's power
ollama pull llama3:70b
ollama pull mixtral:8x7b
ollama pull codellama:70b
ollama pull mistral-nemo:12b
</code></pre><h3>Jetson Orin 64GB (Secondary AI)</h3><p>The Orin 64GB is perfect for:</p><ul> <li>Mid-sized models (Llama 3 8B, Mistral 7B)</li> <li>Analytics processing</li> <li>Agent workers</li> </ul><pre><code class="language-bash"># Same initial setup as Thor, but pull smaller models
ollama pull llama3:8b
ollama pull mistral:7b
ollama pull phi3:medium
ollama pull deepseek-coder:6.7b
</code></pre><h3>Jetson Orin Mini (Edge Tasks)</h3><p>The Orin Mini handles:</p><ul> <li>Lightweight models (Phi-3 Mini, TinyLlama)</li> <li>Whisper (speech-to-text)</li> <li>TTS (text-to-speech)</li> <li>Quick response tasks</li> </ul><pre><code class="language-bash"># Lightweight models for Mini
ollama pull phi3:mini
ollama pull tinyllama
ollama pull gemma:2b
</code></pre><hr><h2>Part 3: Agent Crew Deployment</h2><h3>Money Penny - Main Orchestrator</h3><p>Money Penny coordinates all agents and manages tasks.</p><pre><code class="language-bash"># Create agent configuration
mkdir -p /mnt/goat-storage/config/agents

cat &gt; /mnt/goat-storage/config/agents/money-penny.yaml &lt;&lt; 'EOF'
name: Money Penny
role: Main Orchestrator
device: jetson-thor
model: llama3:70b

capabilities:
  - task_management
  - agent_coordination
  - scheduling
  - notifications

personality: |
  You are Money Penny, a sophisticated AI assistant who manages 
  the GOAT Royalty operation. You're efficient, proactive, and 
  always one step ahead. You coordinate with other AI agents 
  to help the creator succeed.

connections:
  - jetson-orin-64gb:analytics_agent
  - jetson-orin-64gb:social_agent
  - jetson-orin-mini:voice_agent

api_endpoint: http://0.0.0.0:11434/api
EOF
</code></pre><h3>Agent Fleet Configuration</h3><pre><code class="language-yaml"># /mnt/goat-storage/config/agents/fleet.yaml

agents:
  money_penny:
    device: jetson-thor
    model: llama3:70b
    role: orchestrator
    port: 11434
    
  analytics_agent:
    device: jetson-orin-64gb
    model: mistral:7b
    role: data_analysis
    port: 11435
    
  social_agent:
    device: jetson-orin-64gb
    model: llama3:8b
    role: content_creation
    port: 11436
    
  voice_agent:
    device: jetson-orin-mini
    model: phi3:mini
    role: voice_interface
    port: 11437
    
  code_agent:
    device: jetson-thor
    model: codellama:70b
    role: development
    port: 11438
</code></pre><hr><h2>Part 4: GOAT Royalty Hub Integration</h2><h3>Local LLM Connection</h3><p>The GOAT Royalty app connects to your local LLMs:</p><pre><code class="language-javascript">// In your GOAT app config
const localLLMConfig = {
  // Primary (Thor)
  primary: {
    host: '192.168.1.100', // Jetson Thor IP
    port: 11434,
    model: 'llama3:70b',
    type: 'ollama'
  },
  
  // Secondary (Orin 64GB)
  secondary: {
    host: '192.168.1.101', // Jetson Orin IP
    port: 11434,
    models: ['llama3:8b', 'mistral:7b'],
    type: 'ollama'
  },
  
  // Edge (Orin Mini)
  edge: {
    host: '192.168.1.102', // Jetson Mini IP
    port: 11434,
    models: ['phi3:mini', 'tinyllama'],
    type: 'ollama'
  },
  
  // Storage Hub
  storage: {
    host: '192.168.1.50', // Ubuntu 8TB IP
    smbShare: '//192.168.1.50/GOAT-Storage',
    nfsMount: '192.168.1.50:/mnt/goat-storage'
  }
};
</code></pre><hr><h2>Part 5: Self-Management System</h2><h3>Health Monitoring Script</h3><pre><code class="language-bash">#!/bin/bash
# /mnt/goat-storage/scripts/health-monitor.sh

LOG_FILE="/mnt/goat-storage/logs/health.log"
ALERT_FILE="/mnt/goat-storage/logs/alerts.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" &gt;&gt; "$LOG_FILE"
}

alert() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT: $1" &gt;&gt; "$ALERT_FILE"
    # Could integrate with notification system
}

# Check disk space
check_disk() {
    USAGE=$(df -h /mnt/goat-storage | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$USAGE" -gt 90 ]; then
        alert "Disk usage at ${USAGE}%"
    else
        log "Disk usage: ${USAGE}%"
    fi
}

# Check Ollama service
check_ollama() {
    if systemctl is-active --quiet ollama; then
        log "Ollama service: RUNNING"
    else
        alert "Ollama service: DOWN - attempting restart"
        sudo systemctl restart ollama
    fi
}

# Check NFS mount
check_nfs() {
    if mountpoint -q /mnt/goat-storage; then
        log "NFS mount: CONNECTED"
    else
        alert "NFS mount: DISCONNECTED - attempting remount"
        sudo mount -a
    fi
}

# Check agent processes
check_agents() {
    AGENTS=("money_penny" "analytics" "social" "voice")
    for agent in "${AGENTS[@]}"; do
        if pgrep -f "$agent" &gt; /dev/null; then
            log "Agent $agent: RUNNING"
        else
            log "Agent $agent: NOT RUNNING"
        fi
    done
}

# Main monitoring loop
log "=== Health Check Started ==="
check_disk
check_ollama
check_nfs
check_agents
log "=== Health Check Complete ==="
</code></pre><h3>Cron Jobs for Automation</h3><pre><code class="language-bash"># Add to crontab (crontab -e)

# Health check every 5 minutes
*/5 * * * * /mnt/goat-storage/scripts/health-monitor.sh

# Backup user data daily at 2 AM
0 2 * * * /mnt/goat-storage/scripts/backup.sh

# Clean old logs weekly
0 0 * * 0 /mnt/goat-storage/scripts/clean-logs.sh

# Update models weekly (optional)
0 3 * * 0 /mnt/goat-storage/scripts/update-models.sh
</code></pre><h3>Auto-Healing Systemd Services</h3><pre><code class="language-bash"># /etc/systemd/system/goat-orchestrator.service
[Unit]
Description=GOAT Orchestrator Service
After=network.target ollama.service
Requires=ollama.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/mnt/goat-storage/apps/agents
ExecStart=/usr/bin/python3 orchestrator.py
Restart=always
RestartSec=10
StartLimitIntervalSec=60
StartLimitBurst=3

[Install]
WantedBy=multi-user.target
</code></pre><hr><h2>Part 6: IP Address Planning</h2><p>Assign static IPs to your devices:</p><table class="e-rte-table"> <thead> <tr> <th>Device</th> <th>IP Address</th> <th>Role</th> </tr> </thead> <tbody><tr> <td>Ubuntu 8TB Server</td> <td>192.168.1.50</td> <td>Storage Hub</td> </tr> <tr> <td>Jetson Thor</td> <td>192.168.1.100</td> <td>Primary LLM</td> </tr> <tr> <td>Jetson Orin 64GB</td> <td>192.168.1.101</td> <td>Secondary AI</td> </tr> <tr> <td>Jetson Orin Mini</td> <td>192.168.1.102</td> <td>Edge Tasks</td> </tr> </tbody></table><h3>Setting Static IP on Ubuntu</h3><pre><code class="language-bash"># Edit netplan
sudo nano /etc/netplan/00-installer-config.yaml

# Example configuration:
network:
  ethernets:
    eth0:
      addresses:
        - 192.168.1.50/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
  version: 2

# Apply
sudo netplan apply
</code></pre><hr><h2>Quick Start Commands</h2><pre><code class="language-bash"># On Ubuntu (after drive setup):
cd /mnt/goat-storage/scripts
chmod +x *.sh
./setup-complete.sh

# On each Jetson:
# 1. Flash JetPack
# 2. Connect to network
# 3. Mount storage
# 4. Install Ollama
# 5. Pull assigned models

# Verify everything is working:
curl http://192.168.1.100:11434/api/tags  # Thor models
curl http://192.168.1.101:11434/api/tags  # Orin models
curl http://192.168.1.102:11434/api/tags  # Mini models
</code></pre><hr><h2>What's Next?</h2><p>Once your infrastructure is set up:</p><ol> <li>Install the GOAT Royalty app on your main workstation</li> <li>Configure it to connect to your local LLMs</li> <li>Deploy Money Penny and the agent crew</li> <li>Start creating!</li> </ol><hr><p><strong>Questions? Let me know where you are in the process!</strong></p>