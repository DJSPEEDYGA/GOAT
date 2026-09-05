# GOAT Force — Server Room Setup (on-prem Ubuntu box)

One command turns the local server in the building into the GOAT Force node.

## 1. Get the server on the network

The server needs Ethernet (or Wi-Fi) to the router — a USB-C cable to the Mac
is not a network connection. On the server:

```bash
ip -br addr          # should show an IP like 192.168.x.x on eth0/enpXsY
ping -c 3 1.1.1.1    # internet reachable
```

## 2. Run the setup

On the server (needs sudo/root):

```bash
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/main/scripts/goat-server-room-setup.sh | sudo bash
```

Takes 5–15 min (clones the repo, installs Ollama, pulls `llama3.1:8b`).
Re-running is safe — every step is idempotent.

### Options (prefix the command)

| Env var | Purpose |
|---------|---------|
| `OLLAMA_MODELS=/mnt/i2i1/Agent-007-GOAT/Shared/models/ollama_data` | Use the model store on the i2i 1 / FKD1 USB drive instead of downloading |
| `PULL_MODELS="llama3.1:70b qwen2.5-coder:32b"` | Models to pull (`""` to skip) |
| `TAILSCALE_AUTHKEY=tskey-auth-...` | Join the tailnet without the browser step |
| `SKIP_NVIDIA=1` `SKIP_OLLAMA=1` `SKIP_FIREWALL=1` `SKIP_TAILSCALE=1` | Skip a step |

Example with the USB model drive mounted:

```bash
sudo mkdir -p /mnt/i2i1 && sudo mount /dev/sdb1 /mnt/i2i1   # adjust device (lsblk)
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/main/scripts/goat-server-room-setup.sh \
  | sudo OLLAMA_MODELS=/mnt/i2i1/Agent-007-GOAT/Shared/models/ollama_data PULL_MODELS="" bash
```

## 3. What you get

| Service | Port | URL on the LAN |
|---------|------|----------------|
| Web app / command centers | 8090 | `http://<server-ip>:8090/goat-launcher-hub.html` |
| Intel server (`goat_intel.py`) | 5500 | `http://<server-ip>:5500/health` |
| Oscar chat (`chat_server.py`) | 3333 | `http://<server-ip>:3333/` |
| Ollama | 11434 (+ 11435 alias for the Intel server) | `http://<server-ip>:11434/api/tags` |

- Code lives in `/opt/goat`, runs as the `goat` system user, logs in `/opt/goat/logs/`.
- Secrets go in `/opt/goat/.env` (never committed) — then `sudo systemctl restart goat-intel`.
- UFW: SSH open; GOAT ports only reachable from the LAN subnet and Tailscale.
- fail2ban protects SSH. NVIDIA driver auto-installs if a GPU is detected (reboot once).

## 4. Remote access (so Devin can finish setup)

The script installs Tailscale. If you did not pass `TAILSCALE_AUTHKEY`, run:

```bash
sudo tailscale up --ssh --hostname goat-server-room
```

open the printed URL, approve the machine, then share a Tailscale auth key
(Admin console → Settings → Keys → Generate auth key) with Devin as a session
secret. Devin joins the tailnet and SSHes to `goat-server-room` — no router
port forwarding needed.

## 5. Day-to-day

```bash
goat-status                      # curl-proof of every service + GPU + IPs
goat-update                      # git pull + restart services
sudo journalctl -u goat-intel -f # live Intel server log
sudo systemctl restart goat-intel goat-web goat-oscar
```
