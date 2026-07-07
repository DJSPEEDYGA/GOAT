# GOAT Royalty API Proxy Server

Server-side proxy for APIs that can't run in the browser due to CORS restrictions or require secret credentials.

**Owner:** DJ Speedy (Harvey L. Miller Jr.) + Waka Flocka Flame — 100% Master Rights

---

## Quick Start

```bash
cd api-server
cp .env.example .env     # then fill in your credentials
npm install
npm start                # or: npm run dev  (auto-reload)
```

Server listens on `PORT` (default `4000`).
Health check: `GET http://localhost:4000/api/health`

---

## Endpoints

### Spotify (Client Credentials — works immediately)
| Method | Path | Description |
|---|---|---|
| GET | `/api/spotify/token` | Get access token |
| GET | `/api/spotify/search?q=...&type=track` | Search |
| GET | `/api/spotify/artist/:id` | Artist info |
| GET | `/api/spotify/artist/:id/albums` | Artist discography |
| GET | `/api/spotify/artist/:id/top-tracks` | Top tracks |

### TikTok for Business
| Method | Path | Description |
|---|---|---|
| POST | `/api/tiktok/oauth/token` | Exchange OAuth code |
| GET  | `/api/tiktok/user/info` | User profile + stats |
| GET  | `/api/tiktok/videos/list` | List videos |
| POST | `/api/tiktok/video/upload` | Upload video (multipart) |

Pass `x-tiktok-token` header with user access token.

### DistroKid (worldwide distribution)
| Method | Path | Description |
|---|---|---|
| GET  | `/api/distrokid/releases` | List releases |
| POST | `/api/distrokid/releases` | Create release |
| GET  | `/api/distrokid/earnings` | Earnings report |
| GET  | `/api/distrokid/stats/:releaseId` | Per-release stats |
| POST | `/api/distrokid/upload-track` | Upload audio file |

> DistroKid has no official public REST. This layer assumes either a DistroGo-style
> bearer token (reverse-engineered) or a direct worldwide API access agreement.
> Set `DISTROKID_API_KEY` and `DISTROKID_API_BASE` in `.env`.

### Apple Music
| Method | Path | Description |
|---|---|---|
| GET | `/api/apple/search?term=...` | Catalog search |
| GET | `/api/apple/artist/:id` | Artist info |

Set `APPLE_DEVELOPER_TOKEN` (JWT signed with your MusicKit key).

### YouTube Data API v3
| Method | Path | Description |
|---|---|---|
| GET  | `/api/youtube/search?q=...` | Search videos |
| GET  | `/api/youtube/channel/:id` | Channel info |
| POST | `/api/youtube/upload` | Upload video (resumable) |

For uploads, pass `x-youtube-token` with OAuth2 user token.

### Multi-Platform Distribution
| Method | Path | Description |
|---|---|---|
| POST | `/api/distribute` | Push release to selected platforms |
| GET  | `/api/distribute/status/:id` | Check release status |

Body:
```json
{
  "release": { "title": "...", "artist": "...", "tracks": [...] },
  "platforms": ["distrokid", "spotify", "apple"]
}
```

---

## Security

- `helmet` for secure HTTP headers
- `express-rate-limit` (100 req/min per IP)
- CORS restricted via `CORS_ORIGIN` env var
- All secrets in `.env` (never committed)
- File uploads capped at 500 MB

---

## Deployment

### PM2 (production)
```bash
npm install -g pm2
pm2 start server.js --name goat-api
pm2 save
pm2 startup
```

### Docker
```bash
docker build -t goat-api .
docker run -p 4000:4000 --env-file .env goat-api
```

### systemd
Create `/etc/systemd/system/goat-api.service`:
```ini
[Unit]
Description=GOAT Royalty API Proxy
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/goat-api
ExecStart=/usr/bin/node server.js
Restart=always
EnvironmentFile=/opt/goat-api/.env

[Install]
WantedBy=multi-user.target
```

---

## Client Usage

From the web-app:
```js
// Browser-safe: Spotify search via proxy
const r = await fetch('/api/spotify/search?q=waka%20flocka');
const data = await r.json();

// Upload a release to DistroKid
await fetch('/api/distribute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    release: { title: 'GOAT', artist: 'DJ Speedy', tracks: [...] },
    platforms: ['distrokid']
  })
});
```