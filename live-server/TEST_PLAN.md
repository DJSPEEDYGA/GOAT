# Test Plan — Live GOAT/Oscar ingress after Traefik stop (PR #1)

## What changed (user-visible)
On production `srv1148455` the crash-looping **Traefik** container was stopped
(`restart=no`). nginx is the real reverse proxy. If stopping Traefik had broken
ingress, the public sites would now be **down** (connection refused / 502 /
timeout). The test proves the public app is still fully served by nginx.

## Environment
- Public, internet-reachable (no SSH needed).
- GOAT site: `http://goat.72.61.193.184.nip.io/`
- Oscar chat UI (nginx → `goat_oscar_backend` 127.0.0.1:3333): `http://goat.72.61.193.184.nip.io/api/oscar/`
- Evidence from nginx config (staging mirror): `srv1782156` `/etc/nginx/sites-available/goat-royalty` lines 20 (server_name), 58-59 (`/api/oscar/` → `goat_oscar_backend`), 98 (`location /`).

## Adversarial check
Would the result look identical if the change were broken? No. A broken ingress
(if Traefik had been load-bearing) would yield connection-refused/502/timeout and
a blank or error page — visibly different from a rendered GOAT store + Oscar UI.

## Tests (browser)

### T1 — GOAT public site loads via nginx
1. Navigate to `http://goat.72.61.193.184.nip.io/`.
- **PASS:** page renders the GOAT Royalty store UI; browser tab/title contains
  "GOAT Royalty Store" (full title: "Ms Money Penny — 🐐 GOAT Royalty Store").
  HTTP 200, real content (~63 KB), not an nginx error / "502 Bad Gateway" /
  "this site can't be reached".
- **FAIL:** connection refused, timeout, 502/504, or blank page.

### T2 — Oscar chat UI loads through the nginx `/api/oscar/` proxy
1. Navigate to `http://goat.72.61.193.184.nip.io/api/oscar/`.
- **PASS:** Oscar UI renders (chat interface); tab/title is "Oscar · GOAT Ops Brain".
  This confirms nginx → :3333 proxy works (Oscar is the changed stack's centerpiece).
- **FAIL:** 502/504, connection error, or unstyled/blank page.

### T3 — Oscar backend is live (stats endpoint through proxy)
1. Navigate to `http://goat.72.61.193.184.nip.io/api/oscar/api/stats`.
- **PASS:** HTTP 200 returning a small JSON stats body (CPU/RAM fields), proving
  the `goat-oscar.service` python backend is actually responding through nginx,
  not just static HTML.
- **FAIL:** 502/504 or error JSON / empty body.

## Out of scope
- Driving an actual LLM chat completion (depends on a local Ollama/GPU model on
  the box that isn't guaranteed running; not part of this change).
- Any write/mutation against production.
