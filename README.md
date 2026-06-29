# GOAT — Master Consolidated Repository

This repository is the **master** consolidation of all GOAT Royalty / Oscar
projects. Each previously-separate repo lives in its own self-contained folder
under [`apps/`](./apps) — nothing was overwritten or merged across projects, so
every source project keeps its full file tree intact.

## Layout

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
