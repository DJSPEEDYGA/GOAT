# Live Server Backup — Production GOAT/Oscar

This directory is a **source backup of the code actually running in production**,
pulled from the VPS so the master repo reflects the real, latest deployment.

> **Why this exists:** the live server runs a much newer/larger Oscar than the
> `apps/` copies (live `chat_server.py` is ~9.5k lines vs ~530 in `apps/`). This
> folder captures the production source so it isn't trapped only on the VPS.

## `srv1148455` (production — 72.61.193.184, `srv1148455.hstgr.cloud`)

Ingress is **nginx** (ports 80/443). Apps run as `systemd` services. (A Traefik
container exists but is crash-looping because nginx owns 80/443 — it is not the
active ingress.)

| Path here | On server | Service | Notes |
|---|---|---|---|
| `code/oscar/` | `/opt/goat/oscar` | `goat-oscar.service` (:3333) | Advanced Oscar chat server + UI, voice library, security/library bridges |
| `code/intel/` | `/opt/goat/intel` | `goat-intel.service` | "Money Penny" / agent-crew brain (`goat_intel.py`) |
| `code/royalty-app/` | `/raid0/app` | `goat-royalty.service` (:3000) | GOAT Royalty app (served via `python -m http.server`) |
| `code/halito-chat/` | `/srv/halito-chat` | `halito-chat.service` | Halito chat relay (Node) |
| `code/www-goat/` | `/var/www/goat` | (nginx static) | GOAT web UI, audio/social/background-check JS libs |
| `systemd/` | `/etc/systemd/system/*.service` | — | Unit files for the 4 services above |
| `nginx/goat-royalty` | `/etc/nginx/sites-enabled/goat-royalty` | — | nginx site config for GOAT |

### Excluded from this backup (intentionally)
- **Secrets** — `intel/local_keys.json` held a live xAI API key; replaced with
  `intel/local_keys.json.example`. **That key was exposed and should be rotated.**
- **Data / PII** — `intel/fans.db` (SQLite fan data).
- **Private chat history** — `oscar/chat_data/`.
- **Backups / caches / media** — `BackupVault/`, `__pycache__/`, server tarballs,
  and the 36 MB branding `.mp4` under `www-goat/videos/`.

This is a point-in-time snapshot (pulled 2026-06-29). It is a backup/reference —
deploying changes back to the server is a separate, deliberate step.
