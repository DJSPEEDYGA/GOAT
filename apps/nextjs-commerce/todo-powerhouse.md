# GOAT Royalty App — Full Integration Build

## Phase 1 — Keys & Config [DONE]
- [x] Google AI Studio API Key extracted
- [x] OpenAI Key extracted
- [x] Read all concept docs (GOAT Force v6, Moneypenny, Codex, ODT)
- [x] No-key local intel server built (yt-dlp, iTunes, YouTube, TikTok)

## Phase 2 — Fix Intel Server + Platform Feeds
- [ ] Fix Spotify fallback to use iTunes fully
- [ ] Test all endpoints (YouTube search, iTunes charts, TikTok)
- [ ] Add yt-dlp TikTok video info endpoint

## Phase 3 — Intel Dashboard Page
- [ ] Create web-app/intel.html — live charts, YouTube search, artist lookup
- [ ] Wire to goat-intel-server port 5500

## Phase 4 — Moneypenny AI Chat Page
- [ ] Create web-app/moneypenny.html — Gemini + OpenAI powered chat
- [ ] GOAT Talk personality, royalty advice, music industry intel
- [ ] Store keys locally (no external auth required)

## Phase 5 — Wire Keys into API Vault + Server
- [ ] Save Gemini + OpenAI keys to api-server/.env
- [ ] Update goat_intel.py with AI endpoints

## Phase 6 — Commit & Push Everything
- [ ] Commit all new pages to GitHub DJSPEEDYGA/GOAT-Royalty-App
- [ ] Verify all pages live