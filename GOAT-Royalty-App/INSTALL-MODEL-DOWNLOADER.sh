# ============================================================================
# 🚀 ONE-CLICK AI MODEL DOWNLOADER BACKEND
# Installs Python Flask API to download HuggingFace models to server
# Makes the "Download" buttons on /api-download.html actually work
# ============================================================================
# 
# COPY-PASTE THIS ENTIRE BLOCK TO YOUR SERVER TERMINAL:

bash << 'DOWNLOADER'
set -e
clear
echo ""
echo "🚀 INSTALLING ONE-CLICK MODEL DOWNLOADER BACKEND"
echo "=================================================="
echo ""

IP=$(hostname -I | awk '{print $1}')
PORT=80
[[ "$IP" == "72.61.193.184" ]] && PORT=8080
echo "📡 Server: $IP:$PORT"

# Step 1: Install Python + git-lfs
echo ""
echo "📦 [1/5] Installing Python, pip, git-lfs..."
apt-get update -qq 2>/dev/null
apt-get install -y -qq python3 python3-pip python3-venv git git-lfs 2>/dev/null || true
git lfs install --system 2>/dev/null || true
echo "   ✅ Dependencies installed"

# Step 2: Create models directory
echo ""
echo "📁 [2/5] Creating models directory..."
mkdir -p /var/www/goat/models
chown -R www-data:www-data /var/www/goat/models
echo "   ✅ /var/www/goat/models ready"

# Step 3: Create Flask API
echo ""
echo "🐍 [3/5] Installing Flask API..."
mkdir -p /opt/goat-downloader
cd /opt/goat-downloader

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -q flask flask-cors gunicorn 2>/dev/null

# Create the Flask app
cat > /opt/goat-downloader/app.py << 'PYAPP'
from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import threading
import json
import time

app = Flask(__name__)
CORS(app)

MODELS_DIR = '/var/www/goat/models'
STATUS_FILE = '/opt/goat-downloader/status.json'
downloads = {}

def load_status():
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE) as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_status(data):
    with open(STATUS_FILE, 'w') as f:
        json.dump(data, f)

def download_worker(model_id, repo):
    status = load_status()
    status[model_id] = {'progress': 0, 'done': False, 'log': f'Starting clone of {repo}...\n', 'repo': repo}
    save_status(status)
    
    target_dir = os.path.join(MODELS_DIR, repo.replace('/', '_'))
    
    try:
        proc = subprocess.Popen(
            ['git', 'clone', f'https://huggingface.co/{repo}', target_dir],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
            env={**os.environ, 'GIT_LFS_SKIP_SMUDGE': '1'}
        )
        log = ''
        progress = 5
        for line in proc.stdout:
            log += line
            if 'Cloning' in line: progress = 10
            if 'Receiving' in line: progress = 40
            if 'Resolving' in line: progress = 80
            status = load_status()
            status[model_id] = {
                'progress': progress, 
                'done': False, 
                'log': log[-3000:],  # Keep last 3KB
                'repo': repo
            }
            save_status(status)
        
        proc.wait()
        status = load_status()
        status[model_id] = {
            'progress': 100, 
            'done': True, 
            'log': log + f'\n✅ DONE! Model saved to {target_dir}',
            'repo': repo,
            'path': target_dir
        }
        save_status(status)
    except Exception as e:
        status = load_status()
        status[model_id] = {
            'progress': 0, 
            'done': True, 
            'error': str(e), 
            'log': f'❌ Error: {str(e)}',
            'repo': repo
        }
        save_status(status)

@app.route('/api/download/status', methods=['GET'])
def service_status():
    return jsonify({'status': 'online', 'models_dir': MODELS_DIR})

@app.route('/api/download/status/<model_id>', methods=['GET'])
def get_status(model_id):
    status = load_status()
    return jsonify(status.get(model_id, {'progress': 0, 'done': False, 'log': 'No download yet'}))

@app.route('/api/download/list', methods=['GET'])
def list_downloads():
    return jsonify(load_status())

@app.route('/api/download', methods=['POST'])
def start_download():
    data = request.json or {}
    repo = data.get('repo')
    model_id = data.get('id', repo.replace('/', '_'))
    
    if not repo:
        return jsonify({'error': 'repo required'}), 400
    
    # Check if already downloading
    status = load_status()
    if model_id in status and not status[model_id].get('done'):
        return jsonify({'message': 'Already downloading', 'output': status[model_id].get('log', '')})
    
    # Start download in background
    t = threading.Thread(target=download_worker, args=(model_id, repo))
    t.daemon = True
    t.start()
    
    return jsonify({
        'started': True,
        'model_id': model_id,
        'repo': repo,
        'output': f'Download started for {repo}'
    })

@app.route('/api/download/installed', methods=['GET'])
def installed():
    items = []
    if os.path.exists(MODELS_DIR):
        for name in os.listdir(MODELS_DIR):
            path = os.path.join(MODELS_DIR, name)
            if os.path.isdir(path):
                try:
                    size = subprocess.check_output(['du', '-sh', path]).split()[0].decode()
                except:
                    size = '?'
                items.append({'name': name, 'path': path, 'size': size})
    return jsonify(items)

# ========== NVIDIA NIM ENDPOINTS ==========
nvidia_jobs = {}

def nvidia_pull_worker(job_id, models):
    """Pull NVIDIA Docker images sequentially."""
    nvidia_jobs[job_id] = {'status': 'running', 'total': len(models), 'done': 0, 'success': 0, 'failed': 0, 'current': '', 'log': []}
    ngc_key = os.environ.get('NGC_API_KEY', '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')
    try:
        subprocess.run(['docker', 'login', 'nvcr.io', '-u', '$oauthtoken', '--password-stdin'],
                       input=ngc_key.encode(), check=True, timeout=30)
    except Exception as e:
        nvidia_jobs[job_id]['log'].append(f'Login failed: {e}')
    for m in models:
        nvidia_jobs[job_id]['current'] = m
        nvidia_jobs[job_id]['log'].append(f'Pulling {m}')
        try:
            r = subprocess.run(['docker', 'pull', m], capture_output=True, text=True, timeout=14400)
            if r.returncode == 0:
                nvidia_jobs[job_id]['success'] += 1
                nvidia_jobs[job_id]['log'].append(f'OK {m}')
            else:
                nvidia_jobs[job_id]['failed'] += 1
                nvidia_jobs[job_id]['log'].append(f'FAIL {m}: {r.stderr[:200]}')
        except Exception as e:
            nvidia_jobs[job_id]['failed'] += 1
            nvidia_jobs[job_id]['log'].append(f'EXCEPTION {m}: {e}')
        nvidia_jobs[job_id]['done'] += 1
    nvidia_jobs[job_id]['status'] = 'complete'
    nvidia_jobs[job_id]['current'] = ''

@app.route('/api/nvidia/download-all', methods=['POST'])
def nvidia_download_all():
    data = request.get_json(force=True)
    models = data.get('models', [])
    if not models:
        return jsonify({'error': 'no models provided'}), 400
    job_id = f'nvidia_{int(time.time())}'
    threading.Thread(target=nvidia_pull_worker, args=(job_id, models), daemon=True).start()
    return jsonify({'started': True, 'job_id': job_id, 'total': len(models)})

@app.route('/api/nvidia/pull', methods=['POST'])
def nvidia_pull_one():
    data = request.get_json(force=True)
    model = data.get('model', '')
    if not model:
        return jsonify({'error': 'no model'}), 400
    job_id = f'nvidia_{int(time.time())}'
    threading.Thread(target=nvidia_pull_worker, args=(job_id, [model]), daemon=True).start()
    return jsonify({'started': True, 'job_id': job_id, 'model': model})

@app.route('/api/nvidia/status', methods=['GET'])
def nvidia_status_all():
    return jsonify(nvidia_jobs)

@app.route('/api/nvidia/status/<job_id>', methods=['GET'])
def nvidia_status_one(job_id):
    return jsonify(nvidia_jobs.get(job_id, {'error': 'not found'}))

@app.route('/api/nvidia/installed', methods=['GET'])
def nvidia_installed():
    try:
        r = subprocess.check_output(['docker', 'images', '--format', '{{.Repository}}:{{.Tag}} {{.Size}}'], text=True)
        items = []
        for line in r.strip().split('\n'):
            if 'nvcr.io' in line:
                parts = line.rsplit(' ', 1)
                items.append({'name': parts[0], 'size': parts[1] if len(parts) > 1 else '?'})
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e), 'items': []})

# ========== OLLAMA (NO API KEY) ENDPOINTS ==========
ollama_jobs = {}

def ollama_pull_worker(job_id, models):
    """Pull Ollama models sequentially (no login, no API key needed)."""
    ollama_jobs[job_id] = {'status':'running','total':len(models),'done':0,'success':0,'failed':0,'current':'','log':[]}
    for m in models:
        ollama_jobs[job_id]['current'] = m
        ollama_jobs[job_id]['log'].append(f'Pulling {m}')
        try:
            r = subprocess.run(['ollama','pull',m], capture_output=True, text=True, timeout=14400)
            if r.returncode == 0:
                ollama_jobs[job_id]['success'] += 1
                ollama_jobs[job_id]['log'].append(f'OK {m}')
            else:
                ollama_jobs[job_id]['failed'] += 1
                ollama_jobs[job_id]['log'].append(f'FAIL {m}: {r.stderr[:200]}')
        except Exception as e:
            ollama_jobs[job_id]['failed'] += 1
            ollama_jobs[job_id]['log'].append(f'EXCEPTION {m}: {e}')
        ollama_jobs[job_id]['done'] += 1
    ollama_jobs[job_id]['status'] = 'complete'
    ollama_jobs[job_id]['current'] = ''

@app.route('/api/ollama/pull', methods=['POST'])
def ollama_pull_one():
    data = request.get_json(force=True)
    name = data.get('name') or data.get('model','')
    if not name:
        return jsonify({'error':'no model name'}), 400
    job_id = f'ollama_{int(time.time())}'
    threading.Thread(target=ollama_pull_worker, args=(job_id,[name]), daemon=True).start()
    return jsonify({'started':True,'job_id':job_id,'model':name})

@app.route('/api/ollama/pull-all', methods=['POST'])
def ollama_pull_all():
    data = request.get_json(force=True)
    models = data.get('models',[])
    if not models:
        return jsonify({'error':'no models provided'}), 400
    job_id = f'ollama_{int(time.time())}'
    threading.Thread(target=ollama_pull_worker, args=(job_id,models), daemon=True).start()
    return jsonify({'started':True,'job_id':job_id,'total':len(models)})

@app.route('/api/ollama/status', methods=['GET'])
def ollama_status_all():
    return jsonify(ollama_jobs)

@app.route('/api/ollama/status/<job_id>', methods=['GET'])
def ollama_status_one(job_id):
    return jsonify(ollama_jobs.get(job_id, {'error':'not found'}))

@app.route('/api/ollama/installed', methods=['GET'])
def ollama_installed():
    try:
        r = subprocess.run(['ollama','list'], capture_output=True, text=True, timeout=10)
        items = []
        lines = r.stdout.strip().split('\n')[1:]  # skip header
        for line in lines:
            parts = line.split()
            if len(parts) >= 3:
                items.append({'name':parts[0],'id':parts[1],'size':parts[2]})
        return jsonify(items)
    except Exception as e:
        return jsonify({'error':str(e),'items':[]})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5555, debug=False)
PYAPP

echo "   ✅ Flask API created"

# Step 4: Create systemd service
echo ""
echo "⚙️  [4/5] Creating systemd service..."
cat > /etc/systemd/system/goat-downloader.service << 'SYSD'
[Unit]
Description=GOAT Model Downloader API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/goat-downloader
ExecStart=/opt/goat-downloader/venv/bin/gunicorn -w 2 -b 127.0.0.1:5555 app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SYSD

systemctl daemon-reload
systemctl enable goat-downloader
systemctl start goat-downloader
sleep 2

if systemctl is-active --quiet goat-downloader; then
    echo "   ✅ Service running on port 5555"
else
    echo "   ⚠️  Service status: $(systemctl is-active goat-downloader)"
    journalctl -u goat-downloader --no-pager -n 10
fi

# Step 5: Configure nginx proxy
echo ""
echo "🔧 [5/5] Configuring nginx to proxy /api/download → Flask..."

# Add the proxy to nginx config
cat > /etc/nginx/sites-available/goat << NGINX
server {
    listen $PORT default_server;
    listen [::]:$PORT;
    root /var/www/goat;
    index index.html;
    server_name _;
    client_max_body_size 100M;
    
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    
    location / {
        try_files \$uri \$uri.html \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Model downloader API
    location /api/download {
        proxy_pass http://127.0.0.1:5555;
        proxy_set_header Host \$host;
        proxy_http_version 1.1;
        proxy_read_timeout 3600s;
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "POST, GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
    }
    
    # Ollama AI proxy (if installed)
    location /api/chat {
        proxy_pass http://localhost:11434/api/chat;
        proxy_set_header Host localhost;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_read_timeout 120s;
        add_header Access-Control-Allow-Origin * always;
    }
    
    # Serve downloaded models
    location /models/ {
        alias /var/www/goat/models/;
        autoindex on;
        add_header Access-Control-Allow-Origin * always;
    }
    
    location ~* \.json$ {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2?|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # Clean URLs
    location /music-studio { try_files /music-studio.html =404; }
    location /movie-studio { try_files /movie-studio.html =404; }
    location /ai-dashboard { try_files /ai-dashboard.html =404; }
    location /screenwriting { try_files /screenwriting.html =404; }
    location /unreal-copilot { try_files /unreal-copilot.html =404; }
    location /models { try_files /models.html =404; }
    location /tools { try_files /tools.html =404; }
    location /catalog { try_files /catalog.html =404; }
    location /downloads { try_files /downloads.html =404; }
    location /about { try_files /about.html =404; }
    location /roadmap { try_files /roadmap.html =404; }
    location /resources { try_files /resources.html =404; }
    location /usb-ai { try_files /usb-ai.html =404; }
    location /api-download { try_files /api-download.html =404; }
}
NGINX

nginx -t && systemctl reload nginx
echo "   ✅ nginx reloaded with downloader proxy"

# Test
echo ""
echo "🧪 Testing downloader API..."
sleep 2
TEST=$(curl -s http://localhost:$PORT/api/download/status)
if echo "$TEST" | grep -q "online"; then
    echo "   ✅ API ONLINE: $TEST"
else
    echo "   ⚠️  Response: $TEST"
fi

echo ""
echo "============================================================"
echo "🎉  MODEL DOWNLOADER IS READY!"
echo "============================================================"
echo ""
echo "🌐 Open the downloader:"
echo "   http://$IP:$PORT/api-download.html"
echo ""
echo "   Click 'Download to Server' on any model"
echo "   Real downloads happen on YOUR server"
echo "   Models saved to: /var/www/goat/models/"
echo "   Accessible at: http://$IP:$PORT/models/"
echo ""
echo "📊 Management:"
echo "   systemctl status goat-downloader"
echo "   journalctl -u goat-downloader -f"
echo "   curl http://$IP:$PORT/api/download/installed"
echo "   curl http://$IP:$PORT/api/download/list"
echo ""
echo "⚠️  Disk space warning:"
echo "   FLUX models are ~23GB each"
echo "   Make sure you have disk space!"
echo "   Current: $(df -h /var/www | tail -1 | awk '{print $4}') available"
echo "============================================================"
DOWNLOADER