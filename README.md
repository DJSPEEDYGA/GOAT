<p align="center">
  <img src="goat-logo.png" alt="GOAT Royalty logo" width="140">
</p>

<h1 align="center">🐐 GOAT Royalty Platform — Master Consolidated Repository</h1>

<p align="center">
  Ms Money Penny Store &bull; Living Investor EPK &bull; Halito Chat &bull; GOAT City RP &bull; Cinema Forge &bull; Agents Brain
</p>

---

This repository is the **master** consolidation of all GOAT Royalty / Oscar
projects. The repo root is the static, dependency-free web platform, and each
previously-separate repo lives in its own self-contained folder under
[`apps/`](./apps) — nothing was overwritten or merged across projects, so
every source project keeps its full file tree intact.

## Web platform (repo root)

Static, dependency-free web platform. Open `index.html` in any browser or serve the folder with any static host (Hostinger, GitHub Pages, `python3 -m http.server`).

| Page | Description |
| --- | --- |
| `goat-launcher.html` | **GOAT Royalty launcher** — cinematic Higgsfield-style hub for every app, agent, and model |
| `index.html` | Ms Money Penny — GOAT Royalty Store & command center |
| `goat-investor-living-epk.html` / `START-HERE-GOAT-Investor-Living-EPK.html` | Living Investor EPK with money breakdown, hardware manifest, and proof media |
| `money-breakdown.html` | Investor money breakdown (backed by `data/goat-money-breakdown.{json,csv}`) |
| `super-goat-royalties.html` | Super GOAT Royalties tracker |
| `goat-apps.html` | Standalone app launcher |
| `agents-brain.html` | GOAT Agents Brain — AI command center |
| `goat-cinema-forge.html` | Hollywood studio router |
| `goat-virtual-world-rp.html` | GOAT City RP (Cfx.re / FiveM) hub |
| `halito-chat.html` | Halito Chat — offline mesh messaging |
| `goat-royalty-force.html` | GOAT Royalty Force — the team, the lore, the series pitch |

```
├── *.html                  # App pages (self-contained)
├── css/                    # Shared GOAT theme, brand, and touch styles
├── js/                     # Runtime, store restore, casino, audio engine, etc.
├── data/                   # Money breakdown, hardware, and RP manifests
├── assets/epk-media/       # EPK proof audio, video, and studio images
└── manifest.json           # PWA manifest
```

Local preview:

```bash
python3 -m http.server 8080
# open http://localhost:8080/
```

See [EVALUATION.md](EVALUATION.md) for the latest full-platform evaluation, page-by-page status, and remaining gaps.

## Consolidated apps layout

| Folder | Source repo | What it is |
|---|---|---|
| [`apps/nextjs-commerce`](./apps/nextjs-commerce) | `DJSPEEDYGA/nextjs-commerce` | **Canonical / newest** GOAT Royalty app (May 2026). Contains the Oscar local-AI runtime at `web-app/usb-ai/Shared/` (`chat_server.py` + `FastChatUI.html`), data, and desktop builds. |
| [`apps/GOAT-Royalty-App`](./apps/GOAT-Royalty-App) | `DJSPEEDYGA/GOAT-Royalty-App` | Earlier full variant of the same app plus the USB bundle and installer scripts. |
| [`apps/GOAT-Royalty-App2`](./apps/GOAT-Royalty-App2) | `DJSPEEDYGA/GOAT-Royalty-App2` | Electron Desktop v3.0.0 build (`GOAT-APP` branch). |
| [`apps/kubiks-next-js-starter`](./apps/kubiks-next-js-starter) | `DJSPEEDYGA/kubiks-next-js-starter` | Next.js + Electron starter with a `goat-royalty-app` subfolder. |

`DJSPEEDYGA/magnificent-marzipan-80384f` contained only a placeholder readme and
the prior `GOAT` repo contained only attachment links (preserved in git history);
neither added source code, so they are not given a folder.

## Canonical app

For active development, **`apps/nextjs-commerce`** is the source of truth — it is
the newest and most complete, and holds the Oscar runtime. The other folders are
retained for reference and history.

## What was excluded during consolidation

To keep the master pushable and lean, the following were dropped from the copies
(all rebuildable or junk — never source):

- `node_modules/` that had been accidentally committed into `GOAT-Royalty-App`
  (~18k files / 205 MB — restore with `npm install`).
- Three 51 MB junk PDFs in `GOAT-Royalty-App2/public/docs/`
  ("credit card payment was unsuccessful" ChatGPT exports).

Only git-tracked files from each source repo were copied (gitignored build
caches and model blobs were never included).

## Per-app setup

Each `apps/<project>` retains its own `package.json`, lockfiles, and READMEs.
`cd` into the one you want and follow its own instructions (typically
`npm install` then `npm run dev` / `npm start`).
