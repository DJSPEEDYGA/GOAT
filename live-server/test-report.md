# Test Report — Live GOAT/Oscar ingress after Traefik stop (PR #1)

**How tested:** Loaded the **public production** GOAT/Oscar site over the internet
(no SSH) to prove that stopping the crash-looping Traefik container caused no
downtime and nginx still serves everything. All interaction was via the browser.

## Result: all 3 tests PASSED

| Test | Result |
|---|---|
| T1 — GOAT site loads via nginx | ✅ passed |
| T2 — Oscar chat UI loads via `/api/oscar/` proxy | ✅ passed |
| T3 — Oscar python backend responds via proxy (`/api/oscar/api/stats`) | ✅ passed |

## Escalations / honest notes
- **No production downtime** from the Traefik change — confirmed.
- **Cosmetic, pre-existing (NOT caused by this change):** inside the Oscar UI the
  header shows `CPU--% / RAM--%` and `Engine offline`. Two unrelated reasons:
  (1) the UI fetches `/api/stats` at an **absolute** path, which doesn't resolve
  when Oscar is served under the `/api/oscar/` subpath via nginx (the backend
  itself answers fine — see T3); (2) no LLM model is loaded on this GPU-less VPS,
  so the model engine reads "offline". Neither relates to stopping Traefik.

## Evidence

### T1 — GOAT Royalty store renders (HTTP 200, no 502/timeout)
`http://goat.72.61.193.184.nip.io/` → title "Ms Money Penny — 🐐 GOAT Royalty Store".

![T1 GOAT site renders](https://app.devin.ai/attachments/20daadc1-8c10-4a20-9ab8-196c9ce774a0/ss_8f714582.png)

### T2 — Oscar chat UI loads through the nginx `/api/oscar/` proxy
Full workspace renders: sidebar, model/skill selectors (22 modes), voice controls, chat input.

![T2 Oscar UI](https://app.devin.ai/attachments/07f47cbb-5ac0-4c67-926a-3d69d9233538/ss_be360aff.png)

### T3 — Oscar python backend responds live via the proxy
`/api/oscar/api/stats` → `{"cpu_percent": 1.3, "ram_percent": 24.5, "has_psutil": false}` (HTTP 200).

![T3 backend stats JSON](https://app.devin.ai/attachments/96fe5abe-a13a-4b5d-aa00-5bc719befd39/ss_1cebaba7.png)

## Conclusion
Stopping the dead Traefik container did not affect production. nginx serves the
GOAT store, the Oscar UI, and the live Oscar backend — all healthy and reachable
from the public internet.
