#!/usr/bin/env bash
# ============================================================
# GOAT Force — Server Room one-shot setup (Ubuntu 22.04/24.04, Debian 12)
#
# Turns a fresh on-prem Linux box into the GOAT Force node:
#   1. Base packages + SSH + UFW firewall + fail2ban
#   2. NVIDIA driver (if an NVIDIA GPU is present and no driver yet)
#   3. Ollama on :11434 (+ :11435 alias, both used by the GOAT code)
#   4. GOAT repo in /opt/goat + Python venv
#   5. systemd services:
#        goat-intel  → http://<server>:5500  (goat_intel.py)
#        goat-web    → http://<server>:8090  (web-app/)
#        goat-oscar  → http://<server>:3333  (chat_server.py)
#   6. Tailscale (remote access without opening router ports)
#   7. goat-status / goat-update helper commands
#
# Run as root on the server:
#   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/main/scripts/goat-server-room-setup.sh | sudo bash
# or:
#   sudo bash scripts/goat-server-room-setup.sh
#
# Optional env overrides:
#   GOAT_DIR=/opt/goat                GOAT_REPO=https://github.com/DJSPEEDYGA/GOAT.git   GOAT_BRANCH=main
#   OLLAMA_MODELS=/mnt/i2i1/Agent-007-GOAT/Shared/models/ollama_data   (use existing USB model store)
#   PULL_MODELS="llama3.1:8b"          (space-separated; "" to skip)   default: llama3.1:8b
#   TAILSCALE_AUTHKEY=tskey-auth-...   (non-interactive Tailscale join; otherwise a login URL is printed)
#   SKIP_NVIDIA=1  SKIP_TAILSCALE=1  SKIP_OLLAMA=1  SKIP_FIREWALL=1
#
# Safe to re-run: every step is idempotent.
# ============================================================

set -euo pipefail

GOAT_DIR="${GOAT_DIR:-/opt/goat}"
GOAT_REPO="${GOAT_REPO:-https://github.com/DJSPEEDYGA/GOAT.git}"
GOAT_BRANCH="${GOAT_BRANCH:-main}"
GOAT_USER="${GOAT_USER:-goat}"
PULL_MODELS="${PULL_MODELS-llama3.1:8b}"
OLLAMA_MODELS="${OLLAMA_MODELS:-}"
TAILSCALE_AUTHKEY="${TAILSCALE_AUTHKEY:-}"
TS_HOSTNAME="${TS_HOSTNAME:-goat-server-room}"

INTEL_PORT=5500
WEB_PORT=8090
OSCAR_PORT=3333
OLLAMA_PORT=11434
OLLAMA_ALIAS_PORT=11435

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; BLU='\033[0;34m'; MAG='\033[0;35m'; RST='\033[0m'
log()  { printf "${BLU}[server-room]${RST} %s\n" "$*"; }
ok()   { printf "${GRN}[server-room] OK  %s${RST}\n" "$*"; }
warn() { printf "${YLW}[server-room] !!  %s${RST}\n" "$*" >&2; }
die()  { printf "${RED}[server-room] XX  %s${RST}\n" "$*" >&2; exit 1; }
sep()  { printf "${MAG}══════════════════════════════════════════════════════${RST}\n"; }

# ── Preflight ─────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || die "Run as root: sudo bash $0"
command -v apt-get >/dev/null 2>&1 || die "Ubuntu/Debian (apt) required"
. /etc/os-release
ARCH="$(uname -m)"
export DEBIAN_FRONTEND=noninteractive

sep
printf "${YLW}        GOAT FORCE — SERVER ROOM SETUP${RST}\n"
sep
log "OS       : $PRETTY_NAME ($ARCH)"
log "Host     : $(hostname)"
log "GOAT dir : $GOAT_DIR  (branch $GOAT_BRANCH)"
log "Ports    : intel $INTEL_PORT · web $WEB_PORT · oscar $OSCAR_PORT · ollama $OLLAMA_PORT/$OLLAMA_ALIAS_PORT"
sep

# ── 1. Base packages, SSH, fail2ban ───────────────────────────
log "Installing base packages..."
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  ca-certificates curl wget git jq socat ufw fail2ban openssh-server \
  python3 python3-venv python3-pip pciutils lm-sensors htop net-tools ethtool \
  >/dev/null
systemctl enable --now ssh >/dev/null 2>&1 || systemctl enable --now sshd >/dev/null 2>&1 || true
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
backend = systemd
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
EOF
systemctl enable --now fail2ban >/dev/null 2>&1 || true
systemctl restart fail2ban >/dev/null 2>&1 || true
ok "Base packages + SSH + fail2ban"

# ── Service user ──────────────────────────────────────────────
if ! id -u "$GOAT_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "/var/lib/$GOAT_USER" --shell /usr/sbin/nologin "$GOAT_USER"
fi
usermod -aG video,render "$GOAT_USER" 2>/dev/null || true
ok "Service user '$GOAT_USER'"

# ── 2. NVIDIA driver ──────────────────────────────────────────
HAS_NVIDIA=0
if [[ "${SKIP_NVIDIA:-0}" != "1" ]]; then
  if lspci 2>/dev/null | grep -qi nvidia; then
    HAS_NVIDIA=1
    if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi >/dev/null 2>&1; then
      ok "NVIDIA driver present: $(nvidia-smi --query-gpu=name --format=csv,noheader | paste -sd ',' -)"
    elif [[ "$ID" == "ubuntu" ]]; then
      log "NVIDIA GPU found, installing driver (ubuntu-drivers)..."
      apt-get install -y -qq ubuntu-drivers-common >/dev/null
      ubuntu-drivers install >/dev/null 2>&1 || warn "ubuntu-drivers install failed — install the driver manually"
      warn "NVIDIA driver installed — REBOOT required before the GPU is usable by Ollama"
    else
      warn "NVIDIA GPU found but no driver; on Debian: apt install nvidia-driver firmware-misc-nonfree"
    fi
  elif [[ -e /etc/nv_tegra_release ]]; then
    HAS_NVIDIA=1
    ok "NVIDIA Jetson (Tegra) detected — using JetPack GPU stack"
  else
    log "No NVIDIA GPU detected — Ollama will run on CPU"
  fi
fi

# ── 3. Ollama ─────────────────────────────────────────────────
if [[ "${SKIP_OLLAMA:-0}" != "1" ]]; then
  if ! command -v ollama >/dev/null 2>&1; then
    log "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh >/dev/null 2>&1 || die "Ollama install failed"
  fi
  mkdir -p /etc/systemd/system/ollama.service.d
  {
    echo "[Service]"
    echo "Environment=OLLAMA_HOST=0.0.0.0:${OLLAMA_PORT}"
    echo "Environment=OLLAMA_KEEP_ALIVE=24h"
    echo "Environment=OLLAMA_ORIGINS=*"
    if [[ -n "$OLLAMA_MODELS" ]]; then echo "Environment=OLLAMA_MODELS=${OLLAMA_MODELS}"; fi
  } > /etc/systemd/system/ollama.service.d/goat.conf
  if [[ -n "$OLLAMA_MODELS" ]]; then
    mkdir -p "$OLLAMA_MODELS"
    chown -R ollama:ollama "$OLLAMA_MODELS" 2>/dev/null || true
  fi

  # :11435 alias — goat_intel.py and goat-config.json talk to 11435, chat_server.py to 11434
  cat > /etc/systemd/system/goat-ollama-alias.service <<EOF
[Unit]
Description=GOAT Ollama alias :${OLLAMA_ALIAS_PORT} -> :${OLLAMA_PORT}
After=network.target ollama.service
Wants=ollama.service

[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:${OLLAMA_ALIAS_PORT},fork,reuseaddr,bind=127.0.0.1 TCP:127.0.0.1:${OLLAMA_PORT}
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now ollama goat-ollama-alias >/dev/null
  systemctl restart ollama
  for _ in $(seq 1 30); do
    curl -fsS --max-time 2 "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null 2>&1 && break
    sleep 1
  done
  curl -fsS --max-time 2 "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null 2>&1 \
    && ok "Ollama online :${OLLAMA_PORT} (+ alias :${OLLAMA_ALIAS_PORT})" \
    || warn "Ollama not answering yet — check: journalctl -u ollama -n 50"

  if [[ -n "$PULL_MODELS" ]]; then
    for m in $PULL_MODELS; do
      if ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$m"; then
        ok "Model present: $m"
      else
        log "Pulling model $m (this can take a while)..."
        ollama pull "$m" >/dev/null 2>&1 && ok "Pulled $m" || warn "Pull failed for $m — retry later: ollama pull $m"
      fi
    done
  fi
fi

# ── 4. GOAT repo + venv ───────────────────────────────────────
if [[ -d "$GOAT_DIR/.git" ]]; then
  log "Updating GOAT repo..."
  git -C "$GOAT_DIR" fetch -q origin "$GOAT_BRANCH"
  git -C "$GOAT_DIR" checkout -q "$GOAT_BRANCH"
  git -C "$GOAT_DIR" pull -q --ff-only origin "$GOAT_BRANCH" || warn "git pull failed (local changes?) — continuing"
else
  log "Cloning GOAT repo (shallow)..."
  git clone -q --depth 1 --branch "$GOAT_BRANCH" "$GOAT_REPO" "$GOAT_DIR"
fi
ok "GOAT repo at $GOAT_DIR ($(git -C "$GOAT_DIR" rev-parse --short HEAD))"

log "Python venv + deps..."
[[ -d "$GOAT_DIR/.venv" ]] || python3 -m venv "$GOAT_DIR/.venv"
"$GOAT_DIR/.venv/bin/pip" install -q --upgrade pip >/dev/null
"$GOAT_DIR/.venv/bin/pip" install -q flask flask-cors requests psutil yt-dlp >/dev/null
mkdir -p "$GOAT_DIR/logs" "$GOAT_DIR/goat-intel-server/chat_data" "$GOAT_DIR/goat-intel-server/generated_images" \
         "$GOAT_DIR/web-app/usb-ai/Shared/chat_data"
chown -R "$GOAT_USER:$GOAT_USER" "$GOAT_DIR"
ok "venv ready"

# ── 5. systemd services ───────────────────────────────────────
PY="$GOAT_DIR/.venv/bin/python"

cat > /etc/systemd/system/goat-intel.service <<EOF
[Unit]
Description=GOAT Intel Server (goat_intel.py) :${INTEL_PORT}
After=network.target ollama.service goat-ollama-alias.service
Wants=ollama.service goat-ollama-alias.service

[Service]
User=${GOAT_USER}
WorkingDirectory=${GOAT_DIR}/goat-intel-server
Environment=PYTHONUNBUFFERED=1
Environment=OSCAR_OLLAMA_HOST=http://127.0.0.1:${OLLAMA_ALIAS_PORT}
Environment=OLLAMA_HOST=http://127.0.0.1:${OLLAMA_PORT}
EnvironmentFile=-${GOAT_DIR}/.env
ExecStart=${PY} goat_intel.py
Restart=always
RestartSec=3
StandardOutput=append:${GOAT_DIR}/logs/intel.log
StandardError=append:${GOAT_DIR}/logs/intel.log

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/goat-web.service <<EOF
[Unit]
Description=GOAT Web App (web-app/) :${WEB_PORT}
After=network.target

[Service]
User=${GOAT_USER}
WorkingDirectory=${GOAT_DIR}/web-app
ExecStart=${PY} -m http.server ${WEB_PORT} --bind 0.0.0.0
Restart=always
RestartSec=3
StandardOutput=append:${GOAT_DIR}/logs/web.log
StandardError=append:${GOAT_DIR}/logs/web.log

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/goat-oscar.service <<EOF
[Unit]
Description=GOAT Oscar Chat Server (chat_server.py) :${OSCAR_PORT}
After=network.target ollama.service
Wants=ollama.service

[Service]
User=${GOAT_USER}
WorkingDirectory=${GOAT_DIR}/web-app/usb-ai/Shared
Environment=PYTHONUNBUFFERED=1
ExecStart=${PY} chat_server.py --no-browser
Restart=always
RestartSec=3
StandardOutput=append:${GOAT_DIR}/logs/oscar.log
StandardError=append:${GOAT_DIR}/logs/oscar.log

[Install]
WantedBy=multi-user.target
EOF

[[ -f "$GOAT_DIR/.env" ]] || { cp "$GOAT_DIR/.env.example" "$GOAT_DIR/.env" 2>/dev/null || touch "$GOAT_DIR/.env"; chmod 600 "$GOAT_DIR/.env"; chown "$GOAT_USER:$GOAT_USER" "$GOAT_DIR/.env"; }

systemctl daemon-reload
systemctl enable --now goat-intel goat-web goat-oscar >/dev/null
systemctl restart goat-intel goat-web goat-oscar
ok "Services enabled: goat-intel goat-web goat-oscar"

# ── 6. Firewall ───────────────────────────────────────────────
if [[ "${SKIP_FIREWALL:-0}" != "1" ]]; then
  LAN_CIDRS="$(ip -4 -o addr show scope global | awk '{print $4}' | grep -v '^100\.' || true)"
  ufw default deny incoming >/dev/null
  ufw default allow outgoing >/dev/null
  ufw allow OpenSSH >/dev/null
  ufw allow in on tailscale0 >/dev/null 2>&1 || true
  for cidr in $LAN_CIDRS; do
    net="$(python3 -c "import ipaddress,sys; print(ipaddress.ip_interface(sys.argv[1]).network)" "$cidr")"
    for p in $INTEL_PORT $WEB_PORT $OSCAR_PORT $OLLAMA_PORT; do
      ufw allow from "$net" to any port "$p" proto tcp >/dev/null
    done
    ok "LAN $net → ports $INTEL_PORT $WEB_PORT $OSCAR_PORT $OLLAMA_PORT"
  done
  ufw --force enable >/dev/null
  ok "UFW enabled (SSH from anywhere; GOAT ports LAN + Tailscale only)"
fi

# ── 7. Tailscale ──────────────────────────────────────────────
if [[ "${SKIP_TAILSCALE:-0}" != "1" ]]; then
  if ! command -v tailscale >/dev/null 2>&1; then
    log "Installing Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh >/dev/null 2>&1 || warn "Tailscale install failed"
  fi
  if command -v tailscale >/dev/null 2>&1; then
    systemctl enable --now tailscaled >/dev/null 2>&1 || true
    if [[ -n "$TAILSCALE_AUTHKEY" ]]; then
      tailscale up --ssh --hostname "$TS_HOSTNAME" --authkey "$TAILSCALE_AUTHKEY" \
        && ok "Tailscale joined as $TS_HOSTNAME" || warn "tailscale up failed"
    elif tailscale status >/dev/null 2>&1; then
      ok "Tailscale already connected: $(tailscale ip -4 2>/dev/null | head -1)"
    else
      warn "Tailscale not logged in. Run:  sudo tailscale up --ssh --hostname $TS_HOSTNAME"
      warn "…then open the printed URL to approve this server in your tailnet."
    fi
  fi
fi

# ── 8. Helper commands ────────────────────────────────────────
cat > /usr/local/bin/goat-status <<'EOF'
#!/usr/bin/env bash
# Proof-first status: curl every endpoint, never assume.
GRN='\033[0;32m'; RED='\033[0;31m'; RST='\033[0m'
check() { if curl -fsS --max-time 4 "$2" >/dev/null 2>&1; then printf "  ${GRN}● ONLINE ${RST} %-8s %s\n" "$1" "$2"; else printf "  ${RED}○ OFFLINE${RST} %-8s %s\n" "$1" "$2"; fi; }
echo "GOAT Force — $(hostname) — $(date)"
check Ollama  http://127.0.0.1:11434/api/tags
check Alias   http://127.0.0.1:11435/api/tags
check Intel   http://127.0.0.1:5500/health
check Web     http://127.0.0.1:8090/
check Oscar   http://127.0.0.1:3333/
echo
echo "Models: $(curl -fsS --max-time 4 http://127.0.0.1:11434/api/tags 2>/dev/null | jq -r '.models|length' 2>/dev/null || echo '?')"
command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi --query-gpu=name,memory.used,memory.total,temperature.gpu --format=csv,noheader
command -v tailscale  >/dev/null 2>&1 && echo "Tailscale: $(tailscale ip -4 2>/dev/null | head -1 || echo 'not connected')"
echo "LAN IP:    $(hostname -I | awk '{print $1}')"
systemctl --no-pager --plain list-units 'goat-*' ollama.service 2>/dev/null | awk 'NR>1 && $1 ~ /service/ {printf "  %-28s %s/%s\n",$1,$3,$4}'
EOF

cat > /usr/local/bin/goat-update <<EOF
#!/usr/bin/env bash
# Pull latest GOAT code and restart services.
set -e
git -C "$GOAT_DIR" pull --ff-only origin "$GOAT_BRANCH"
"$GOAT_DIR/.venv/bin/pip" install -q flask flask-cors requests psutil yt-dlp
chown -R "$GOAT_USER:$GOAT_USER" "$GOAT_DIR"
systemctl restart goat-intel goat-web goat-oscar
goat-status
EOF
chmod +x /usr/local/bin/goat-status /usr/local/bin/goat-update
ok "Installed: goat-status, goat-update"

# ── Summary (with proof) ──────────────────────────────────────
sleep 3
sep
goat-status
sep
LAN_IP="$(hostname -I | awk '{print $1}')"
printf "${GRN}Server room ready.${RST}\n"
echo "  Command center : http://${LAN_IP}:${WEB_PORT}/goat-launcher-hub.html"
echo "  Intel API      : http://${LAN_IP}:${INTEL_PORT}/health"
echo "  Oscar chat     : http://${LAN_IP}:${OSCAR_PORT}/"
echo "  Logs           : ${GOAT_DIR}/logs/   ·  journalctl -u goat-intel -f"
echo "  Secrets        : edit ${GOAT_DIR}/.env then: systemctl restart goat-intel"
[[ "$HAS_NVIDIA" == "1" ]] && ! nvidia-smi >/dev/null 2>&1 && printf "${YLW}  REBOOT NOW to activate the NVIDIA driver, then run: goat-status${RST}\n"
sep
