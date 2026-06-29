# Live Server Backup — Production GOAT/Oscar

This directory is a **source backup of the code actually running in production**,
pulled from the VPS so the master repo reflects the real, latest deployment.

> **Why this exists:** the live server runs a much newer/larger Oscar than the
> `apps/` copies (live `chat_server.py` is ~9.5k lines vs ~530 in `apps/`). This
> folder captures the production source so it isn't trapped only on the VPS.

## `srv1148455` (production — 72.61.193.184, `srv1148455.hstgr.cloud`)

Ingress is **nginx** (ports 80/443). Apps run as `systemd` services.

> **Traefik:** a Traefik container (`docker/traefik/docker-compose.yml`, `network_mode: host`)
> was stuck in a crash loop (66,870 restarts) because it could not bind :80/:443 —
> **nginx** already owns those ports and serves all live sites. On 2026-06-29 it was
> **stopped and its restart policy set to `no`** (it routed no traffic, so this caused
> no downtime). The compose file is preserved here for reference; to ever use Traefik
> as ingress you'd first need to move nginx off 80/443, then `docker compose up -d`.

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

## `srv1782156` (the "staging" box — 2.25.68.216, `srv1782156.hstgr.cloud`)

Despite being called staging, this is a **second live GOAT/Oscar server** running the
**same stack** behind nginx (no Traefik here, so nothing to fix). Same layout under
`srv1782156/code/` (`oscar`, `intel`, `royalty-app`, `halito-chat`, `www-goat`) plus
`systemd/` units and `nginx/` (`goat-royalty`, `halitochat.tech.conf`).

- The Oscar runtime is **byte-identical** to production (`chat_server.py` 9,514 lines,
  `FastChatUI.html` 5,035 lines); all four services healthy (0 error restarts).
- This box has a **more developed Halito chat** (`command-center.html`, `pilot.html`,
  `prototype.html`, `landing-assets/`) than production.
- Same scrubbing applied (xAI key → `.example`, `fans.db`/PII, private `chat_data/`,
  caches/media excluded).

This is a point-in-time snapshot (pulled 2026-06-29). It is a backup/reference —
deploying changes back to either server is a separate, deliberate step.
