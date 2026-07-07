<h1>🐐 GOAT ROYALTY - 8TB Hard Drive Complete Setup Guide</h1><h2>Cross-Platform Storage for LLMs, Apps, and Data</h2><p>This guide will walk you through setting up your 8TB external hard drive on Ubuntu for:</p><ul> <li>GOAT Royalty App complete storage</li> <li>LLM models (LLaMA, Mistral, Uncensored models, etc.)</li> <li>Cross-platform access (Mac, Windows, Linux)</li> <li>Server integration and network sharing</li> </ul><hr><h2>📋 PREREQUISITES</h2><p>Before starting, ensure you have:</p><ul> <li><input disabled="" type="checkbox"> Ubuntu system with sudo access</li> <li><input disabled="" type="checkbox"> 8TB external hard drive (USB 3.0+ recommended)</li> <li><input disabled="" type="checkbox"> Physical access to the machine</li> <li><input disabled="" type="checkbox"> Internet connection for downloads</li> </ul><hr><h2>PART 1: Connect and Identify the Drive</h2><h3>Step 1.1: Connect the Drive</h3><pre><code class="language-bash"># Connect your 8TB drive via USB
# Wait a few seconds for detection
</code></pre><h3>Step 1.2: Identify the Drive</h3><pre><code class="language-bash"># List all block devices
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,MODEL

# Look for your 8TB drive (should show ~7.3TB or similar)
# It will typically be /dev/sda, /dev/sdb, or /dev/sdc

# Alternative: Check disk details
sudo fdisk -l | grep -i "8TB\|7.3\|8000"
</code></pre><h3>Step 1.3: Verify Drive Information</h3><pre><code class="language-bash"># Replace sdX with your drive letter (e.g., sdb)
sudo smartctl -a /dev/sdX | head -50
</code></pre><hr><h2>PART 2: Format the Drive</h2><h3>⚠️ WARNING: This will ERASE ALL DATA on the drive!</h3><h3>Step 2.1: Unmount if Automatically Mounted</h3><pre><code class="language-bash"># Check if mounted
df -h | grep sdX

# Unmount if mounted
sudo umount /dev/sdX*
</code></pre><h3>Step 2.2: Choose Filesystem</h3><p><strong>For Cross-Platform Compatibility (RECOMMENDED):</strong></p><table class="e-rte-table"> <thead> <tr> <th>Filesystem</th> <th>Linux</th> <th>Mac</th> <th>Windows</th> <th>Files &gt;4GB</th> <th>Recommendation</th> </tr> </thead> <tbody><tr> <td>ext4</td> <td>✅ Full</td> <td>❌ Read-only*</td> <td>❌ Not native</td> <td>✅ Yes</td> <td>Linux-only</td> </tr> <tr> <td>NTFS</td> <td>✅ Full</td> <td>✅ Full</td> <td>✅ Full</td> <td>✅ Yes</td> <td><strong>BEST for cross-platform</strong></td> </tr> <tr> <td>exFAT</td> <td>✅ Full</td> <td>✅ Full</td> <td>✅ Full</td> <td>✅ Yes</td> <td>Good alternative</td> </tr> <tr> <td>HFS+</td> <td>❌ Limited</td> <td>✅ Full</td> <td>❌ Limited</td> <td>✅ Yes</td> <td>Mac-only</td> </tr> <tr> <td>APFS</td> <td>❌ No</td> <td>✅ Full</td> <td>❌ No</td> <td>✅ Yes</td> <td>Mac-only</td> </tr> </tbody></table><p><strong>RECOMMENDATION: Use NTFS for best cross-platform compatibility with Mac and Windows</strong></p><h3>Step 2.3: Format as NTFS (Cross-Platform Recommended)</h3><pre><code class="language-bash"># Install NTFS tools if not present
sudo apt update
sudo apt install -y ntfs-3g

# Create partition table (GPT for large drives)
sudo parted /dev/sdX mklabel gpt

# Create single partition using all space
sudo parted /dev/sdX mkpart primary ntfs 0% 100%

# Format the partition
sudo mkfs.ntfs -f -L "GOAT_STORAGE" /dev/sdX1

# The -f flag makes it faster (quick format)
# -L sets the volume label
</code></pre><h3>Step 2.4: Alternative - Format as ext4 (Linux-optimized)</h3><pre><code class="language-bash"># If you only need Linux access, ext4 is faster and more reliable
sudo parted /dev/sdX mklabel gpt
sudo parted /dev/sdX mkpart primary ext4 0% 100%
sudo mkfs.ext4 -L "GOAT_STORAGE" /dev/sdX1
</code></pre><h3>Step 2.5: Alternative - Format as exFAT</h3><pre><code class="language-bash"># Install exFAT tools
sudo apt install -y exfat-fuse exfat-utils

# Format
sudo mkfs.exfat -n "GOAT_STORAGE" /dev/sdX1
</code></pre><hr><h2>PART 3: Mount and Configure</h2><h3>Step 3.1: Create Mount Point</h3><pre><code class="language-bash"># Create directory for mounting
sudo mkdir -p /mnt/goat-storage

# Set permissions
sudo chown -R $USER:$USER /mnt/goat-storage
</code></pre><h3>Step 3.2: Find Drive UUID</h3><pre><code class="language-bash"># Get the UUID of your drive
sudo blkid /dev/sdX1

# Example output:
# /dev/sdb1: UUID="1234-5678-ABCD" TYPE="ntfs"
</code></pre><h3>Step 3.3: Configure Auto-Mount (fstab)</h3><pre><code class="language-bash"># Backup fstab first
sudo cp /etc/fstab /etc/fstab.backup

# Edit fstab
sudo nano /etc/fstab

# Add one of the following lines based on your filesystem:

# FOR NTFS (replace UUID with your drive's UUID):
UUID=YOUR-UUID-HERE /mnt/goat-storage ntfs-3g defaults,auto,users,rw,nofail,x-gvfs-show 0 0

# FOR ext4:
UUID=YOUR-UUID-HERE /mnt/goat-storage ext4 defaults,noatime 0 2

# FOR exFAT:
UUID=YOUR-UUID-HERE /mnt/goat-storage exfat defaults,auto,nofail,x-gvfs-show 0 0
</code></pre><h3>Step 3.4: Test Mount</h3><pre><code class="language-bash"># Mount all drives
sudo mount -a

# Verify mount
df -h | grep goat-storage

# Should show something like:
# /dev/sdb1       7.3T   72M  7.3T   1% /mnt/goat-storage
</code></pre><hr><h2>PART 4: Create Directory Structure for GOAT Royalty</h2><pre><code class="language-bash"># Create the complete directory structure
mkdir -p /mnt/goat-storage/{GOAT-ROYALTY-APP,LLMs,DATASETS,MODELS,BACKUPS,SERVERS,PROJECTS}

# GOAT App directories
mkdir -p /mnt/goat-storage/GOAT-ROYALTY-APP/{web-app,desktop-app,mobile-pwa,api,assets}
mkdir -p /mnt/goat-storage/GOAT-ROYALTY-APP/assets/{images,videos,audio,documents}

# LLM directories
mkdir -p /mnt/goat-storage/LLMs/{ollama,lmstudio,text-generation-webui,uncensored}
mkdir -p /mnt/goat-storage/LLMs/models/{llama,mistral,codellama,wizardlm,uncensored}

# Dataset directories  
mkdir -p /mnt/goat-storage/DATASETS/{training,fine-tuning,rag-knowledge}

# Server directories
mkdir -p /mnt/goat-storage/SERVERS/{nginx,apache,docker,supabase}

# Backup directories
mkdir -p /mnt/goat-storage/BACKUPS/{daily,weekly,monthly}

# Set permissions
chmod -R 755 /mnt/goat-storage
</code></pre><hr><h2>PART 5: Install and Configure LLM Infrastructure</h2><h3>Step 5.1: Install Ollama (Local LLM Runtime)</h3><pre><code class="language-bash"># Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama to use the external drive
sudo systemctl stop ollama

# Set Ollama models directory to external drive
sudo mkdir -p /mnt/goat-storage/LLMs/ollama
sudo chown -R ollama:ollama /mnt/goat-storage/LLMs/ollama

# Create override for Ollama service
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf &lt;&lt; EOF
[Service]
Environment="OLLAMA_MODELS=/mnt/goat-storage/LLMs/ollama"
EOF

sudo systemctl daemon-reload
sudo systemctl start ollama
</code></pre><h3>Step 5.2: Download Popular LLMs</h3><pre><code class="language-bash"># Wait for Ollama to be ready
sleep 5

# Download models (these are large downloads)
ollama pull llama3:70b              # Meta Llama 3 70B (~40GB)
ollama pull mistral:7b              # Mistral 7B (~4GB)
ollama pull codellama:34b           # Code Llama 34B (~19GB)
ollama pull wizardlm2:8x22b         # WizardLM 2 8x22B (~80GB)
ollama pull llama3-uncensored:70b   # Uncensored variant

# Smaller models for testing
ollama pull llama3:8b               # Llama 3 8B (~4.7GB)
ollama pull phi3:14b                # Phi-3 14B (~8GB)
ollama pull gemma:7b                # Google Gemma 7B (~4GB)
</code></pre><h3>Step 5.3: Install Text-Generation-WebUI (Oobabooga)</h3><pre><code class="language-bash"># Clone to external drive
cd /mnt/goat-storage/LLMs
git clone https://github.com/oobabooga/text-generation-webui.git
cd text-generation-webui

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create start script
cat &gt; /mnt/goat-storage/LLMs/text-generation-webui/start.sh &lt;&lt; 'EOF'
#!/bin/bash
cd /mnt/goat-storage/LLMs/text-generation-webui
source venv/bin/activate
python server.py --listen --model-dir /mnt/goat-storage/LLMs/models --listen-port 7860
EOF

chmod +x /mnt/goat-storage/LLMs/text-generation-webui/start.sh
</code></pre><hr><h2>PART 6: Network Sharing for Cross-Platform Access</h2><h3>Step 6.1: Install Samba (Windows/Mac/Linux Sharing)</h3><pre><code class="language-bash">sudo apt install -y samba samba-common-bin
</code></pre><h3>Step 6.2: Configure Samba</h3><pre><code class="language-bash"># Backup existing config
sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.backup

# Add GOAT storage share
sudo tee -a /etc/samba/smb.conf &lt;&lt; 'EOF'

[GOAT_STORAGE]
   comment = GOAT Royalty 8TB Storage
   path = /mnt/goat-storage
   browseable = yes
   read only = no
   guest ok = no
   create mask = 0755
   directory mask = 0755
   valid users = @users
   force user = YOUR_USERNAME
   follow symlinks = yes
   wide links = yes
EOF

# Set Samba password for your user
sudo smbpasswd -a $USER

# Restart Samba
sudo systemctl restart smbd
sudo systemctl enable smbd
</code></pre><h3>Step 6.3: Configure NFS (For Mac/Linux)</h3><pre><code class="language-bash">sudo apt install -y nfs-kernel-server

# Add export
echo "/mnt/goat-storage *(rw,sync,no_subtree_check,no_root_squash)" | sudo tee -a /etc/exports

# Apply exports
sudo exportfs -a
sudo systemctl restart nfs-kernel-server
</code></pre><hr><h2>PART 7: Connect from Mac</h2><h3>Step 7.1: Connect via Samba (SMB)</h3><pre><code class="language-bash"># On your Mac:
# 1. Open Finder
# 2. Press Cmd+K (Connect to Server)
# 3. Enter: smb://YOUR-UBUNTU-IP/GOAT_STORAGE
# 4. Enter your Ubuntu username and Samba password
# 5. Check "Remember password"
# 6. Click Connect
</code></pre><h3>Step 7.2: Connect via NFS</h3><pre><code class="language-bash"># On your Mac Terminal:
sudo mkdir -p /Volumes/GOAT_STORAGE
sudo mount -t nfs YOUR-UBUNTU-IP:/mnt/goat-storage /Volumes/GOAT_STORAGE
</code></pre><h3>Step 7.3: Auto-mount on Mac</h3><pre><code class="language-bash"># On Mac, add to /etc/fstab (create if needed):
YOUR-UBUNTU-IP:/mnt/goat-storage /Volumes/GOAT_STORAGE nfs rw 0 0
</code></pre><hr><h2>PART 8: Download GOAT Royalty App to External Drive</h2><pre><code class="language-bash"># Clone or copy the GOAT Royalty App
cd /mnt/goat-storage/GOAT-ROYALTY-APP

# Clone from GitHub
gh repo clone DJSPEEDYGA/nextjs-commerce web-app

# Or copy existing workspace
cp -r /workspace/* /mnt/goat-storage/GOAT-ROYALTY-APP/web-app/

# Download any additional assets
mkdir -p assets/images
# Add your images, videos, etc.
</code></pre><hr><h2>PART 9: Server Configuration</h2><h3>Step 9.1: Configure Docker to Use External Drive</h3><pre><code class="language-bash"># Stop Docker
sudo systemctl stop docker

# Move Docker data to external drive
sudo mv /var/lib/docker /mnt/goat-storage/SERVERS/docker

# Create symlink
sudo ln -s /mnt/goat-storage/SERVERS/docker /var/lib/docker

# Start Docker
sudo systemctl start docker
</code></pre><h3>Step 9.2: Install and Configure Supabase</h3><pre><code class="language-bash"># Clone Supabase
cd /mnt/goat-storage/SERVERS
git clone --depth 1 https://github.com/supabase/supabase

# Follow Supabase self-hosting guide
</code></pre><hr><h2>PART 10: Backup Automation</h2><h3>Step 10.1: Create Backup Script</h3><pre><code class="language-bash">cat &gt; /mnt/goat-storage/BACKUPS/backup.sh &lt;&lt; 'EOF'
#!/bin/bash
BACKUP_DIR="/mnt/goat-storage/BACKUPS"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup critical data
tar -czf $BACKUP_DIR/daily/backup_$DATE.tar.gz \
    /mnt/goat-storage/GOAT-ROYALTY-APP \
    --exclude='*.tmp' \
    --exclude='node_modules'

# Keep only last 7 daily backups
find $BACKUP_DIR/daily -name "backup_*.tar.gz" -mtime +7 -delete

# Weekly backup (run on Sunday)
if [ $(date +%u) -eq 7 ]; then
    cp $BACKUP_DIR/daily/backup_$DATE.tar.gz $BACKUP_DIR/weekly/
    find $BACKUP_DIR/weekly -name "backup_*.tar.gz" -mtime +30 -delete
fi

# Monthly backup (run on 1st)
if [ $(date +%d) -eq 01 ]; then
    cp $BACKUP_DIR/daily/backup_$DATE.tar.gz $BACKUP_DIR/monthly/
    find $BACKUP_DIR/monthly -name "backup_*.tar.gz" -mtime +365 -delete
fi
EOF

chmod +x /mnt/goat-storage/BACKUPS/backup.sh
</code></pre><h3>Step 10.2: Schedule Backups</h3><pre><code class="language-bash"># Add to crontab
(crontab -l 2&gt;/dev/null; echo "0 2 * * * /mnt/goat-storage/BACKUPS/backup.sh") | crontab -
</code></pre><hr><h2>PART 11: Security and Monitoring</h2><h3>Step 11.1: Monitor Drive Health</h3><pre><code class="language-bash"># Install smartmontools
sudo apt install -y smartmontools

# Check drive health
sudo smartctl -H /dev/sdX

# Enable regular checks
sudo smartctl -s on /dev/sdX
</code></pre><h3>Step 11.2: Setup Notifications</h3><pre><code class="language-bash"># Install mail utilities for notifications
sudo apt install -y mailutils

# Create monitoring script
cat &gt; /usr/local/bin/drive-monitor.sh &lt;&lt; 'EOF'
#!/bin/bash
USAGE=$(df -h /mnt/goat-storage | tail -1 | awk '{print $5}' | tr -d '%')
if [ $USAGE -gt 80 ]; then
    echo "WARNING: GOAT Storage is ${USAGE}% full" | mail -s "Storage Alert" your@email.com
fi
EOF

chmod +x /usr/local/bin/drive-monitor.sh

# Add to crontab (check every 6 hours)
(crontab -l 2&gt;/dev/null; echo "0 */6 * * * /usr/local/bin/drive-monitor.sh") | crontab -
</code></pre><hr><h2>QUICK REFERENCE COMMANDS</h2><pre><code class="language-bash"># Check drive space
df -h /mnt/goat-storage

# List all mounted drives
lsblk -f

# Mount manually
sudo mount /mnt/goat-storage

# Unmount safely
sudo umount /mnt/goat-storage

# Check Samba status
sudo systemctl status smbd

# Restart services
sudo systemctl restart ollama
sudo systemctl restart smbd
sudo systemctl restart docker

# Check Ollama models
ollama list

# Run a model
ollama run llama3:70b
</code></pre><hr><h2>TROUBLESHOOTING</h2><h3>Drive Not Detected</h3><pre><code class="language-bash"># Check kernel messages
dmesg | tail -20

# Rescan SCSI bus
echo "- - -" | sudo tee /sys/class/scsi_host/host*/scan
</code></pre><h3>Permission Issues</h3><pre><code class="language-bash"># Fix permissions
sudo chown -R $USER:$USER /mnt/goat-storage
chmod -R 755 /mnt/goat-storage
</code></pre><h3>Mount Issues</h3><pre><code class="language-bash"># Check filesystem
sudo fsck /dev/sdX1

# Remount
sudo mount -o remount,rw /mnt/goat-storage
</code></pre><h3>Samba Connection Issues</h3><pre><code class="language-bash"># Test connection
smbclient -L localhost -U $USER

# Check firewall
sudo ufw allow 139/tcp
sudo ufw allow 445/tcp
sudo ufw allow 137/udp
sudo ufw allow 138/udp
</code></pre><hr><h2>CONNECTING FROM OTHER DEVICES</h2><h3>Mac</h3><pre><code>Finder → Cmd+K → smb://YOUR-IP/GOAT_STORAGE
</code></pre><h3>Windows</h3><pre><code>File Explorer → \\YOUR-IP\GOAT_STORAGE
</code></pre><h3>Another Linux</h3><pre><code class="language-bash">sudo mount -t cifs //YOUR-IP/GOAT_STORAGE /mnt/goat -o user=YOUR_USER
</code></pre><hr><h2>STORAGE ALLOCATION SUGGESTION (8TB)</h2><table class="e-rte-table"> <thead> <tr> <th>Category</th> <th>Size</th> <th>Path</th> </tr> </thead> <tbody><tr> <td>GOAT App</td> <td>500GB</td> <td>/mnt/goat-storage/GOAT-ROYALTY-APP</td> </tr> <tr> <td>LLMs</td> <td>3TB</td> <td>/mnt/goat-storage/LLMs</td> </tr> <tr> <td>Datasets</td> <td>1TB</td> <td>/mnt/goat-storage/DATASETS</td> </tr> <tr> <td>Servers</td> <td>1TB</td> <td>/mnt/goat-storage/SERVERS</td> </tr> <tr> <td>Backups</td> <td>1TB</td> <td>/mnt/goat-storage/BACKUPS</td> </tr> <tr> <td>Projects</td> <td>500GB</td> <td>/mnt/goat-storage/PROJECTS</td> </tr> </tbody></table><hr><p><strong>Created by GOAT Royalty Automation System</strong> <em>This guide is part of the GOAT Royalty App project.</em></p>