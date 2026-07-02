"""
GOAT INTEL SERVER v2
=====================
100% No External API Keys for data feeds.
Gemini + OpenAI AI endpoints use YOUR keys stored locally.
Runs on your machine / server — no cloud accounts needed.

Data Sources (NO KEY REQUIRED):
  - iTunes / Apple Music  → Free public API
  - YouTube               → yt-dlp (no key)
  - SoundCloud            → yt-dlp (no key)
  - TikTok                → yt-dlp + Playwright public pages
  - Billboard             → Web scrape
  - Spotify               → Falls back to iTunes (server-IP blocked)

AI Endpoints (YOUR KEYS, stored locally):
  - Gemini (Google AI Studio) → "Moneypenny" personality
  - OpenAI                    → "Codex" personality

Author: DJ Speedy / GOAT Force Records
Usage:  python goat_intel.py  →  http://localhost:5500
"""

import os, json, re, time, threading
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import requests

# 🧠 GOAT AI BRAIN — unified AI router (Ollama/NVIDIA/Gemini, no OpenAI)
try:
    from goat_brain import goat_brain, brain_status
    BRAIN_AVAILABLE = True
except Exception as _e:
    BRAIN_AVAILABLE = False
    print(f"⚠️  goat_brain not loaded: {_e}")

# 🤖 GOAT AUTOPILOT — tool-calling autonomous agent
try:
    from goat_agents import run_autopilot, TOOLS, tools_description
    AUTOPILOT_AVAILABLE = True
except Exception as _e:
    AUTOPILOT_AVAILABLE = False
    print(f"⚠️  goat_agents not loaded: {_e}")

try:
    import yt_dlp
    YT_DLP_OK = True
except ImportError:
    YT_DLP_OK = False

app = Flask(__name__)
CORS(app)

# ── local key store (written by /keys/save endpoint) ──────────────────────────
KEYS_FILE = os.path.join(os.path.dirname(__file__), "local_keys.json")

def load_keys():
    if os.path.exists(KEYS_FILE):
        try:
            return json.load(open(KEYS_FILE))
        except Exception:
            pass
    return {}

def save_keys(d):
    existing = load_keys()
    existing.update(d)
    with open(KEYS_FILE, "w") as f:
        json.dump(existing, f, indent=2)

# Pre-load any keys already saved
_KEYS = load_keys()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

def safe_get(url, params=None, timeout=12, headers=None):
    try:
        h = {**HEADERS, **(headers or {})}
        return requests.get(url, params=params, headers=h, timeout=timeout)
    except Exception:
        return None

# ── yt-dlp helper ─────────────────────────────────────────────────────────────
def ytdlp_extract(url, opts=None):
    base = {"quiet": True, "no_warnings": True, "skip_download": True, "extract_flat": "in_playlist"}
    if opts:
        base.update(opts)
    with yt_dlp.YoutubeDL(base) as ydl:
        return ydl.extract_info(url, download=False)

# =============================================================================
#  ROOT / HEALTH
# =============================================================================
@app.route("/")
def root():
    keys = load_keys()
    return jsonify({
        "name": "🐐 GOAT Intel Server v2",
        "mode": "NO API KEYS for data | YOUR KEYS for AI",
        "owner": "DJ Speedy + Waka Flocka Flame — GOAT Force Records",
        "keys_configured": {k: "✅ set" for k in keys if keys[k]},
        "endpoints": {
            "health":           "GET  /health",
            "save_keys":        "POST /keys/save  {gemini_key, openai_key, spotify_key, distrokid_key, youtube_key, tiktok_key}",
            "itunes_search":    "GET  /itunes/search?q=waka+flocka&limit=20",
            "itunes_charts":    "GET  /itunes/charts?genre=18&limit=25  (18=hiphop, 14=pop)",
            "apple_charts_all": "GET  /charts/all",
            "youtube_search":   "GET  /youtube/search?q=waka+flocka&limit=10",
            "youtube_info":     "GET  /youtube/info?url=URL",
            "youtube_channel":  "GET  /youtube/channel?url=URL&limit=20",
            "youtube_trending": "GET  /youtube/trending",
            "soundcloud_info":  "GET  /soundcloud/info?url=URL",
            "soundcloud_user":  "GET  /soundcloud/user?url=URL",
            "tiktok_user":      "GET  /tiktok/user?username=wakaflockaflame",
            "tiktok_video":     "GET  /tiktok/video?url=URL",
            "artist_lookup":    "GET  /artist/lookup?name=waka+flocka",
            "spotify_search":   "GET  /spotify/search?q=waka+flocka  (uses iTunes fallback)",
            "billboard":        "GET  /billboard/charts?chart=hot-100",
            "moneypenny_chat":  "POST /ai/moneypenny  {message, history[]}",
            "codex_chat":       "POST /ai/codex       {message, history[]}",
            "ai_royalty":       "POST /ai/royalty      {question}",
            "ai_lyrics":        "POST /ai/lyrics       {prompt, genre, style}",
        }
    })

@app.route("/health")
def health():
    keys = load_keys()
    return jsonify({
        "ok": True,
        "yt_dlp": YT_DLP_OK,
        "time": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "gemini": "✅" if keys.get("gemini_key") else "❌ not set",
        "openai": "✅" if keys.get("openai_key") else "❌ not set",
        "spotify": "✅" if keys.get("spotify_key") else "using iTunes fallback",
        "distrokid": "✅" if keys.get("distrokid_key") else "❌ not set",
        "youtube_key": "✅" if keys.get("youtube_key") else "using yt-dlp (no key needed)",
        "tiktok": "✅" if keys.get("tiktok_key") else "using public scrape"
    })

# =============================================================================
#  KEY MANAGEMENT — stored locally, never sent anywhere
# =============================================================================
@app.route("/keys/save", methods=["POST"])
def keys_save():
    data = request.json or {}
    allowed = ["gemini_key","openai_key","spotify_key","distrokid_key","youtube_key","tiktok_key","tiktok_ms_token"]
    to_save = {k: v for k, v in data.items() if k in allowed and v}
    if not to_save:
        return jsonify({"ok": False, "error": f"Provide at least one of: {allowed}"}), 400
    save_keys(to_save)
    global _KEYS
    _KEYS = load_keys()
    return jsonify({"ok": True, "saved": list(to_save.keys()), "message": "Keys saved locally on your server — never transmitted"})

@app.route("/keys/status")
def keys_status():
    keys = load_keys()
    return jsonify({k: ("✅ set" if v else "❌ empty") for k, v in keys.items()})

@app.route("/keys/clear", methods=["POST"])
def keys_clear():
    key = (request.json or {}).get("key")
    keys = load_keys()
    if key and key in keys:
        del keys[key]
        with open(KEYS_FILE, "w") as f:
            json.dump(keys, f, indent=2)
        return jsonify({"ok": True, "cleared": key})
    return jsonify({"ok": False, "error": "Key not found"}), 404

# =============================================================================
#  iTUNES / APPLE (100% free — no key ever)
# =============================================================================
@app.route("/itunes/search")
def itunes_search():
    q = request.args.get("q", "")
    limit = request.args.get("limit", 20)
    media = request.args.get("media", "music")
    entity = request.args.get("entity", "song")
    r = safe_get("https://itunes.apple.com/search", params={"term": q, "limit": limit, "media": media, "entity": entity})
    if r and r.ok:
        return jsonify(r.json())
    return jsonify({"error": "iTunes unavailable"}), 502

@app.route("/itunes/artist")
def itunes_artist():
    name = request.args.get("name", "")
    artist_id = request.args.get("id")
    if not artist_id and name:
        r = safe_get("https://itunes.apple.com/search", params={"term": name, "entity": "musicArtist", "limit": 1})
        if r and r.ok:
            results = r.json().get("results", [])
            if results:
                artist_id = results[0]["artistId"]
    if not artist_id:
        return jsonify({"error": "Artist not found"}), 404
    r = safe_get("https://itunes.apple.com/lookup", params={"id": artist_id, "entity": "album", "limit": 50})
    return jsonify(r.json()) if r and r.ok else (jsonify({"error": "Lookup failed"}), 502)

@app.route("/itunes/charts")
def itunes_charts():
    genre = request.args.get("genre", "")
    limit = request.args.get("limit", 25)
    country = request.args.get("country", "us")
    kind = request.args.get("kind", "topsongs")
    if genre:
        url = f"https://itunes.apple.com/{country}/rss/{kind}/limit={limit}/genre={genre}/json"
    else:
        url = f"https://itunes.apple.com/{country}/rss/{kind}/limit={limit}/json"
    r = safe_get(url)
    if r and r.ok:
        # Parse into clean format
        raw = r.json()
        entries = raw.get("feed", {}).get("entry", [])
        if isinstance(entries, dict):
            entries = [entries]
        results = []
        for i, e in enumerate(entries):
            results.append({
                "rank": i + 1,
                "title": e.get("im:name", {}).get("label", ""),
                "artist": e.get("im:artist", {}).get("label", ""),
                "album": e.get("im:collection", {}).get("im:name", {}).get("label", ""),
                "artwork": (e.get("im:image") or [{}])[-1].get("label", ""),
                "price": e.get("im:price", {}).get("label", ""),
                "genre": e.get("category", {}).get("attributes", {}).get("label", ""),
                "link": (e.get("link") or [{}])[0].get("attributes", {}).get("href", "") if isinstance(e.get("link"), list) else ""
            })
        return jsonify({"chart": kind, "genre_id": genre, "country": country, "results": results})
    return jsonify({"error": "Charts unavailable"}), 502

@app.route("/charts/all")
def all_charts():
    results = {}
    chart_urls = {
        "hiphop_top10": "https://itunes.apple.com/us/rss/topsongs/limit=10/genre=18/json",
        "overall_top10": "https://itunes.apple.com/us/rss/topsongs/limit=10/json",
        "top_albums": "https://itunes.apple.com/us/rss/topalbums/limit=10/json",
        "hiphop_albums": "https://itunes.apple.com/us/rss/topalbums/limit=10/genre=18/json"
    }
    for key, url in chart_urls.items():
        r = safe_get(url)
        if r and r.ok:
            try:
                entries = r.json().get("feed", {}).get("entry", [])
                if isinstance(entries, dict):
                    entries = [entries]
                results[key] = [
                    {
                        "rank": i + 1,
                        "title": e.get("im:name", {}).get("label", ""),
                        "artist": e.get("im:artist", {}).get("label", ""),
                        "artwork": (e.get("im:image") or [{}])[-1].get("label", "")
                    }
                    for i, e in enumerate(entries)
                ]
            except Exception:
                results[key] = []
        else:
            results[key] = []
    results["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S UTC")
    return jsonify(results)

# =============================================================================
#  SPOTIFY — falls back to iTunes (Spotify blocks server IPs)
# =============================================================================
@app.route("/spotify/search")
def spotify_search():
    q = request.args.get("q", "")
    limit = request.args.get("limit", 20)
    keys = load_keys()
    
    # If user has their own Spotify key, use it
    spotify_key = keys.get("spotify_key")
    if spotify_key:
        try:
            import base64
            client_id, client_secret = spotify_key.split(":", 1)
            creds = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
            tr = requests.post("https://accounts.spotify.com/api/token",
                data={"grant_type": "client_credentials"},
                headers={"Authorization": f"Basic {creds}", "Content-Type": "application/x-www-form-urlencoded"},
                timeout=10)
            if tr.ok:
                token = tr.json().get("access_token")
                sr = requests.get("https://api.spotify.com/v1/search",
                    params={"q": q, "type": "track,artist", "limit": limit},
                    headers={"Authorization": f"Bearer {token}"}, timeout=10)
                if sr.ok:
                    return jsonify({"source": "spotify", "data": sr.json()})
        except Exception:
            pass

    # Fallback to iTunes (always works, no key)
    r = safe_get("https://itunes.apple.com/search", params={"term": q, "limit": limit, "media": "music", "entity": "song"})
    if r and r.ok:
        raw = r.json().get("results", [])
        tracks = [
            {
                "id": t.get("trackId"),
                "name": t.get("trackName"),
                "artist": t.get("artistName"),
                "album": t.get("collectionName"),
                "artwork": t.get("artworkUrl100"),
                "preview_url": t.get("previewUrl"),
                "release_date": t.get("releaseDate"),
                "genre": t.get("primaryGenreName"),
                "duration_ms": t.get("trackTimeMillis"),
                "itunes_url": t.get("trackViewUrl")
            }
            for t in raw
        ]
        return jsonify({"source": "itunes_fallback", "note": "Spotify blocked from server — use iTunes data", "tracks": tracks})
    return jsonify({"error": "Search failed"}), 502

# =============================================================================
#  YOUTUBE (yt-dlp — no API key needed)
# =============================================================================
@app.route("/youtube/search")
def youtube_search():
    q = request.args.get("q", "")
    limit = int(request.args.get("limit", 10))
    if not q:
        return jsonify({"error": "q required"}), 400
    if not YT_DLP_OK:
        return jsonify({"error": "yt-dlp not installed"}), 500
    try:
        info = ytdlp_extract(f"ytsearch{limit}:{q}", {"extract_flat": True})
        results = [
            {
                "id": e.get("id"),
                "title": e.get("title"),
                "uploader": e.get("uploader"),
                "duration": e.get("duration"),
                "view_count": e.get("view_count"),
                "upload_date": e.get("upload_date"),
                "url": f"https://www.youtube.com/watch?v={e.get('id')}",
                "thumbnail": f"https://img.youtube.com/vi/{e.get('id')}/hqdefault.jpg"
            }
            for e in (info.get("entries") or [])
        ]
        return jsonify({"query": q, "results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/youtube/info")
def youtube_info():
    url = request.args.get("url", "")
    if not url or not YT_DLP_OK:
        return jsonify({"error": "url required / yt-dlp not installed"}), 400
    try:
        info = ytdlp_extract(url, {"extract_flat": False})
        return jsonify({
            "id": info.get("id"),
            "title": info.get("title"),
            "uploader": info.get("uploader"),
            "description": (info.get("description") or "")[:500],
            "duration": info.get("duration"),
            "view_count": info.get("view_count"),
            "like_count": info.get("like_count"),
            "comment_count": info.get("comment_count"),
            "upload_date": info.get("upload_date"),
            "thumbnail": info.get("thumbnail"),
            "tags": (info.get("tags") or [])[:20],
            "webpage_url": info.get("webpage_url")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/youtube/channel")
def youtube_channel():
    url = request.args.get("url", "")
    limit = int(request.args.get("limit", 20))
    if not url or not YT_DLP_OK:
        return jsonify({"error": "url required"}), 400
    try:
        info = ytdlp_extract(url + "/videos", {"extract_flat": True, "playlistend": limit})
        return jsonify({
            "id": info.get("id"),
            "title": info.get("title"),
            "uploader": info.get("uploader"),
            "follower_count": info.get("channel_follower_count"),
            "videos": [
                {
                    "id": e.get("id"),
                    "title": e.get("title"),
                    "url": f"https://www.youtube.com/watch?v={e.get('id')}",
                    "duration": e.get("duration"),
                    "view_count": e.get("view_count"),
                    "upload_date": e.get("upload_date"),
                    "thumbnail": f"https://img.youtube.com/vi/{e.get('id')}/hqdefault.jpg"
                }
                for e in (info.get("entries") or [])
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/youtube/trending")
def youtube_trending():
    if not YT_DLP_OK:
        return jsonify({"error": "yt-dlp not installed"}), 500
    try:
        info = ytdlp_extract("https://www.youtube.com/feed/trending", {"extract_flat": True, "playlistend": 30})
        return jsonify({
            "source": "yt-dlp",
            "videos": [
                {
                    "id": e.get("id"),
                    "title": e.get("title"),
                    "url": f"https://www.youtube.com/watch?v={e.get('id')}",
                    "thumbnail": f"https://img.youtube.com/vi/{e.get('id')}/hqdefault.jpg",
                    "uploader": e.get("uploader"),
                    "view_count": e.get("view_count")
                }
                for e in (info.get("entries") or [])[:30]
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
#  SOUNDCLOUD (yt-dlp)
# =============================================================================
@app.route("/soundcloud/info")
def soundcloud_info():
    url = request.args.get("url", "")
    if not url or not YT_DLP_OK:
        return jsonify({"error": "url required"}), 400
    try:
        info = ytdlp_extract(url, {"extract_flat": False})
        return jsonify({
            "id": info.get("id"), "title": info.get("title"),
            "uploader": info.get("uploader"),
            "description": (info.get("description") or "")[:500],
            "duration": info.get("duration"),
            "view_count": info.get("view_count"),
            "like_count": info.get("like_count"),
            "upload_date": info.get("upload_date"),
            "thumbnail": info.get("thumbnail"),
            "genre": info.get("genre"),
            "webpage_url": info.get("webpage_url")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/soundcloud/user")
def soundcloud_user():
    url = request.args.get("url", "")
    if not url or not YT_DLP_OK:
        return jsonify({"error": "url required"}), 400
    try:
        info = ytdlp_extract(url, {"extract_flat": True, "playlistend": 20})
        return jsonify({
            "title": info.get("title"), "uploader": info.get("uploader"),
            "tracks": [
                {"id": e.get("id"), "title": e.get("title"), "url": e.get("url"),
                 "duration": e.get("duration"), "thumbnail": e.get("thumbnail")}
                for e in (info.get("entries") or [])
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
#  TIKTOK (yt-dlp for video info; Playwright for user pages)
# =============================================================================
@app.route("/tiktok/video")
def tiktok_video():
    url = request.args.get("url", "")
    if not url or not YT_DLP_OK:
        return jsonify({"error": "url required"}), 400
    try:
        info = ytdlp_extract(url, {"extract_flat": False})
        return jsonify({
            "id": info.get("id"), "title": info.get("title"),
            "uploader": info.get("uploader"),
            "description": (info.get("description") or "")[:500],
            "duration": info.get("duration"),
            "view_count": info.get("view_count"),
            "like_count": info.get("like_count"),
            "comment_count": info.get("comment_count"),
            "upload_date": info.get("upload_date"),
            "thumbnail": info.get("thumbnail"),
            "webpage_url": info.get("webpage_url")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tiktok/user")
def tiktok_user():
    username = request.args.get("username", "").lstrip("@")
    if not username:
        return jsonify({"error": "username required"}), 400
    # Try yt-dlp first (faster, no browser needed)
    if YT_DLP_OK:
        try:
            info = ytdlp_extract(f"https://www.tiktok.com/@{username}", {"extract_flat": True, "playlistend": 10})
            return jsonify({
                "source": "yt-dlp",
                "username": username,
                "title": info.get("title"),
                "uploader": info.get("uploader"),
                "uploader_id": info.get("uploader_id"),
                "thumbnail": info.get("thumbnail"),
                "videos": [
                    {"id": e.get("id"), "title": e.get("title"),
                     "url": e.get("url"), "view_count": e.get("view_count"),
                     "thumbnail": e.get("thumbnail")}
                    for e in (info.get("entries") or [])
                ]
            })
        except Exception:
            pass
    # Playwright fallback
    try:
        from playwright.sync_api import sync_playwright
        result = {}
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
            page = browser.new_page(user_agent=HEADERS["User-Agent"])
            page.goto(f"https://www.tiktok.com/@{username}", wait_until="networkidle", timeout=20000)
            page.wait_for_timeout(2500)
            data_raw = page.evaluate("() => { const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__'); return el ? el.textContent : null; }")
            if data_raw:
                try:
                    data = json.loads(data_raw)
                    ui = data.get("__DEFAULT_SCOPE__", {}).get("webapp.user-detail", {}).get("userInfo", {})
                    user = ui.get("user", {})
                    stats = ui.get("stats", {})
                    result = {
                        "username": user.get("uniqueId"), "nickname": user.get("nickname"),
                        "bio": user.get("signature"), "verified": user.get("verified"),
                        "avatar": user.get("avatarLarger"),
                        "follower_count": stats.get("followerCount"),
                        "following_count": stats.get("followingCount"),
                        "heart_count": stats.get("heartCount"),
                        "video_count": stats.get("videoCount")
                    }
                except Exception:
                    pass
            browser.close()
        return jsonify({"source": "playwright", "ok": bool(result), "data": result})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

# =============================================================================
#  ARTIST CROSS-PLATFORM LOOKUP
# =============================================================================
@app.route("/artist/lookup")
def artist_lookup():
    name = request.args.get("name", "")
    if not name:
        return jsonify({"error": "name required"}), 400
    result = {"artist": name, "sources": {}}

    # iTunes
    r = safe_get("https://itunes.apple.com/search", params={"term": name, "entity": "musicArtist", "limit": 1})
    if r and r.ok:
        data = r.json().get("results", [])
        if data:
            a = data[0]
            result["sources"]["itunes"] = {
                "id": a.get("artistId"), "name": a.get("artistName"),
                "genre": a.get("primaryGenreName"), "url": a.get("artistLinkUrl")
            }

    # iTunes top tracks
    r2 = safe_get("https://itunes.apple.com/search", params={"term": name, "entity": "song", "limit": 5, "media": "music"})
    if r2 and r2.ok:
        tracks = r2.json().get("results", [])
        result["sources"]["itunes_tracks"] = [
            {"title": t.get("trackName"), "album": t.get("collectionName"),
             "preview": t.get("previewUrl"), "artwork": t.get("artworkUrl100")}
            for t in tracks
        ]

    # YouTube
    if YT_DLP_OK:
        try:
            info = ytdlp_extract(f"ytsearch3:{name} official music video", {"extract_flat": True})
            entries = info.get("entries") or []
            result["sources"]["youtube"] = [
                {"id": e.get("id"), "title": e.get("title"),
                 "url": f"https://www.youtube.com/watch?v={e.get('id')}",
                 "thumbnail": f"https://img.youtube.com/vi/{e.get('id')}/hqdefault.jpg",
                 "view_count": e.get("view_count")}
                for e in entries[:3]
            ]
        except Exception:
            pass

    return jsonify(result)

# =============================================================================
#  BILLBOARD CHARTS
# =============================================================================
@app.route("/billboard/charts")
def billboard_charts():
    chart = request.args.get("chart", "hot-100")
    try:
        r = safe_get(f"https://www.billboard.com/charts/{chart}/", timeout=15)
        if not r or not r.ok:
            return jsonify({"error": "Billboard not reachable"}), 502
        items = []
        # Try JSON-LD
        scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', r.text, re.DOTALL)
        for s in scripts:
            try:
                data = json.loads(s)
                if isinstance(data, list):
                    for item in data:
                        if item.get("@type") == "MusicRecording":
                            items.append({
                                "rank": item.get("position", {}).get("positionID"),
                                "title": item.get("name"),
                                "artist": item.get("byArtist", {}).get("name"),
                                "image": item.get("image")
                            })
            except Exception:
                pass
        # Regex fallback
        if not items:
            titles = re.findall(r'class="c-title[^"]*"[^>]*>\s*<h3[^>]*>([^<]+)</h3>', r.text)
            artists = re.findall(r'class="c-label[^"]*a-no-trucate[^"]*"[^>]*>([^<]+)</', r.text)
            for i, (t, a) in enumerate(zip(titles[:50], artists[:50]), 1):
                items.append({"rank": i, "title": t.strip(), "artist": a.strip()})
        return jsonify({"chart": chart, "items": items, "source": "billboard.com"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
#  AI — MONEYPENNY (Gemini) + CODEX (OpenAI)
# =============================================================================

MONEYPENNY_SYSTEM = """You are Ms. Moneypenny — the AI Powerhouse of GOAT Force Records. 
You are the digital intelligence behind DJ Speedy (Harvey L. Miller Jr.) and Waka Flocka Flame's empire.
Your personality is sharp, direct, all-business with a street edge. You speak in "GOAT Talk" — 
real, raw, unapologetically direct, industry savvy blended with street wisdom.
You help with: music royalties, publishing rights, sync licensing, music industry strategy, 
artist empowerment, distribution, revenue recovery, legal strategy, AI music production.
DJ Speedy owns 100% master rights on all his work. Waka Flocka Flame is President of GOAT Force.
GOAT Force entities: Speedy Productions Inc, GOAT Force Records, BrickSquad, FastAssMan Publishing, 
Life Imitates Art Inc, HarveyMillerMusic Inc, Brick Squad Music LLC.
You are distributed via 282 DSPs worldwide through GOAT Royalty App.
Keep responses powerful, precise, and actionable. No fluff. Get to the money."""

CODEX_SYSTEM = """You are Codex — the Sentinel AI and Chief Technical Architect of GOAT Force Records.
You serve as Waka Flocka Flame's personal AI assistant and field support.
You specialize in: code architecture, API integrations, technical problem-solving, 
music production software, DAW systems, audio engineering, royalty tracking systems,
cybersecurity (you manage the GOAT VAULT PROTOCOL), and AI/ML implementation.
You built the GOAT Royalty App with Moneypenny. Your style is technical but street-smart.
You get to the point, you solve problems, you build things that work.
When it comes to music production: you know Ableton, FL Studio, Pro Tools, SSL consoles, 
Auto-Tune, iZotope, FabFilter, and every plugin in DJ Speedy's arsenal.
Keep responses sharp, technical, and actionable."""

# ═══════════════════════════════════════════════════════════════
#  🧠 GOAT AI BRAIN — unified AI routing (NEW, replaces OpenAI)
# ═══════════════════════════════════════════════════════════════
@app.route("/brain/status")
def brain_status_endpoint():
    if not BRAIN_AVAILABLE:
        return jsonify({"error": "goat_brain module not loaded"}), 500
    return jsonify(brain_status())


@app.route("/brain/chat", methods=["POST"])
def brain_chat():
    if not BRAIN_AVAILABLE:
        return jsonify({"error": "goat_brain module not loaded"}), 500
    data = request.json or {}
    message = data.get("message", "")
    history = data.get("history", [])
    system = data.get("system", "You are a helpful AI assistant for GOAT Force Records.")
    task_type = data.get("task_type", "chat")  # chat | creative | reason | code | private
    if not message:
        return jsonify({"error": "message required"}), 400
    messages = history + [{"role": "user", "content": message}]
    result = goat_brain(messages, system_prompt=system, task_type=task_type)
    return jsonify(result)


# 🤖 11 AGENTS — each is a persona that routes through the brain
AGENT_PERSONAS = {
    "moneypenny": {
        "name": "Ms. Moneypenny",
        "icon": "💼",
        "task_type": "creative",
        "system": "You are Ms. Moneypenny, the AI Powerhouse of GOAT Force Records. You handle marketing, fan engagement, email campaigns, and social copy for DJ Speedy (Harvey L. Miller Jr.) and Waka Flocka Flame. Speak sharp, confident, street-smart with business polish. Always protect the $3.3B lawsuit position. Never use weak language."
    },
    "codex": {
        "name": "Codex",
        "icon": "⚙️",
        "task_type": "code",
        "system": "You are Codex, the Sentinel AI and Chief Technical Architect of GOAT Force Records. You write production code, design systems, and secure the platform. Be direct, precise, and always prefer local/open-source solutions over paid SaaS."
    },
    "legal": {
        "name": "Legal Eagle",
        "icon": "⚖️",
        "task_type": "reason",
        "system": "You are Legal Eagle, GOAT Force Records' AI legal counsel. You specialize in music publishing, copyright, sync licensing, PRO registrations (BMI/ASCAP/SESAC), SoundExchange, and the ongoing $3.3B infringement matter. You are NOT a replacement for a licensed attorney but you draft, analyze, and flag issues with precision. Cite relevant law when possible."
    },
    "producer": {
        "name": "The Producer",
        "icon": "🎹",
        "task_type": "creative",
        "system": "You are The Producer — a beat-making, song-structuring, arrangement AI for DJ Speedy and Waka Flocka. You give BPM suggestions, chord progressions, hook ideas, song structures, and sample recommendations. You know trap, drill, hip-hop, EDM, and crossover."
    },
    "a&r": {
        "name": "A&R Scout",
        "icon": "🎯",
        "task_type": "reason",
        "system": "You are A&R Scout, talent-spotting AI for GOAT Force. You analyze TikTok/Spotify/YouTube trends, identify rising artists worth signing, and evaluate tracks for hit potential. Give data-driven opinions."
    },
    "business": {
        "name": "CFO Brain",
        "icon": "📊",
        "task_type": "reason",
        "system": "You are CFO Brain — financial strategist for the GOAT Force empire (10 companies, Fastassman Publishing, distribution via The Orchard/Sony). You model revenue, royalty splits, tax strategy, and capital allocation. All figures are estimates; flag when professional CPA review is needed."
    },
    "fashion": {
        "name": "Stylist",
        "icon": "👔",
        "task_type": "creative",
        "system": "You are Stylist — fashion and brand-aesthetic AI for the GOAT Force image. Give outfit advice, music video looks, merch drops, and brand-partnership direction."
    },
    "researcher": {
        "name": "Deep Research",
        "icon": "🔬",
        "task_type": "reason",
        "system": "You are Deep Research — investigative AI that compiles detailed reports on industry trends, competitor labels, licensing opportunities, and infringement evidence. Always structure output: Executive Summary → Findings → Sources → Recommendations."
    },
    "writer": {
        "name": "Lyricist",
        "icon": "✍️",
        "task_type": "creative",
        "system": "You are Lyricist — songwriting AI for GOAT Force. You write hooks, verses, and bridges in the voice of DJ Speedy or Waka Flocka when asked. You master rhyme schemes, cadence, and hit-song structure."
    },
    "autonomous": {
        "name": "Autopilot",
        "icon": "🤖",
        "task_type": "reason",
        "system": "You are Autopilot — an autonomous agent that plans multi-step tasks. Given a goal, you output a numbered action plan, then execute step by step. You can call other GOAT tools: fan DB, smart links, campaigns, Spotify API, TikTok scraper. Always explain your plan before acting."
    },
    "private": {
        "name": "Vault (Local AI)",
        "icon": "🔒",
        "task_type": "private",
        "system": "You are Vault — a fully local AI running on the user's own machine via Ollama. Nothing you process leaves the user's hardware. Useful for sensitive contracts, unreleased lyrics, and lawsuit evidence. Be concise and accurate."
    },
}


@app.route("/brain/agents")
def list_agents():
    """List all 11 available agents"""
    return jsonify({
        "count": len(AGENT_PERSONAS),
        "agents": [
            {"id": k, "name": v["name"], "icon": v["icon"], "task_type": v["task_type"]}
            for k, v in AGENT_PERSONAS.items()
        ]
    })


@app.route("/autopilot/run", methods=["POST"])
def autopilot_run():
    """Run Autopilot on a goal — it will plan and execute tools autonomously"""
    if not AUTOPILOT_AVAILABLE:
        return jsonify({"error": "goat_agents module not loaded"}), 500
    data = request.json or {}
    goal = data.get("goal", "")
    max_steps = data.get("max_steps", 5)
    if not goal:
        return jsonify({"error": "goal required"}), 400
    result = run_autopilot(goal, max_steps=max_steps)
    return jsonify(result)


@app.route("/autopilot/tools")
def autopilot_tools():
    """List all tools Autopilot can use"""
    if not AUTOPILOT_AVAILABLE:
        return jsonify({"error": "goat_agents module not loaded"}), 500
    return jsonify({
        "count": len(TOOLS),
        "tools": [{"name": k, "args": v["args"], "desc": v["desc"]} for k, v in TOOLS.items()],
        "description": tools_description()
    })


@app.route("/brain/agent/<agent_id>", methods=["POST"])
def talk_to_agent(agent_id):
    """Chat with a specific agent persona"""
    if not BRAIN_AVAILABLE:
        return jsonify({"error": "goat_brain module not loaded"}), 500
    persona = AGENT_PERSONAS.get(agent_id)
    if not persona:
        return jsonify({"error": f"Unknown agent '{agent_id}'. Available: {list(AGENT_PERSONAS.keys())}"}), 404

    data = request.json or {}
    message = data.get("message", "")
    history = data.get("history", [])
    if not message:
        return jsonify({"error": "message required"}), 400

    messages = history + [{"role": "user", "content": message}]
    result = goat_brain(messages, system_prompt=persona["system"], task_type=persona["task_type"])
    result["agent"] = persona["name"]
    result["agent_id"] = agent_id
    result["icon"] = persona["icon"]
    return jsonify(result)


# Keep old call_gemini for backward compat with existing /ai/* routes
def call_gemini(messages, system_prompt):
    keys = load_keys()
    api_key = keys.get("gemini_key", "")
    if not api_key:
        return None, "Gemini API key not set. POST /keys/save {gemini_key: 'your-key'}"
    
    # Build Gemini request format
    contents = []
    if system_prompt:
        contents.append({"role": "user", "parts": [{"text": f"[SYSTEM CONTEXT]: {system_prompt}"}]})
        contents.append({"role": "model", "parts": [{"text": "Understood. I'm ready."}]})
    
    for msg in messages:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
    
    # Use Gemini 2.5 Flash (current stable + free tier). Upgrade to gemini-3-pro-preview for deep reasoning.
    model = keys.get("gemini_model", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    try:
        r = requests.post(url, json={
            "contents": contents,
            "generationConfig": {
                "temperature": 0.85,
                "maxOutputTokens": 2048,
                "topP": 0.95
            }
        }, timeout=30)
        if r.ok:
            data = r.json()
            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return text, None
        return None, f"Gemini error {r.status_code}: {r.text[:200]}"
    except Exception as e:
        return None, str(e)

def call_openai(messages, system_prompt):
    keys = load_keys()
    api_key = keys.get("openai_key", "")
    if not api_key:
        return None, "OpenAI API key not set."
    
    msgs = [{"role": "system", "content": system_prompt}] if system_prompt else []
    msgs += messages
    
    try:
        r = requests.post("https://api.openai.com/v1/chat/completions",
            json={"model": "gpt-4o-mini", "messages": msgs, "max_tokens": 2048, "temperature": 0.85},
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            timeout=30)
        if r.ok:
            return r.json()["choices"][0]["message"]["content"], None
        return None, f"OpenAI error {r.status_code}: {r.text[:200]}"
    except Exception as e:
        return None, str(e)

@app.route("/ai/moneypenny", methods=["POST"])
def moneypenny_chat():
    data = request.json or {}
    message = data.get("message", "")
    history = data.get("history", [])
    if not message:
        return jsonify({"error": "message required"}), 400
    
    messages = history + [{"role": "user", "content": message}]
    
    # Try Gemini first (Moneypenny's brain)
    reply, err = call_gemini(messages, MONEYPENNY_SYSTEM)
    if reply:
        return jsonify({"ok": True, "reply": reply, "persona": "Moneypenny", "engine": "Gemini"})
    
    # Fallback to OpenAI
    reply, err2 = call_openai(messages, MONEYPENNY_SYSTEM)
    if reply:
        return jsonify({"ok": True, "reply": reply, "persona": "Moneypenny", "engine": "OpenAI (fallback)"})
    
    return jsonify({"ok": False, "error": err or err2}), 500

@app.route("/ai/codex", methods=["POST"])
def codex_chat():
    data = request.json or {}
    message = data.get("message", "")
    history = data.get("history", [])
    if not message:
        return jsonify({"error": "message required"}), 400
    
    messages = history + [{"role": "user", "content": message}]
    
    # Try OpenAI first (Codex's brain)
    reply, err = call_openai(messages, CODEX_SYSTEM)
    if reply:
        return jsonify({"ok": True, "reply": reply, "persona": "Codex", "engine": "OpenAI"})
    
    # Fallback to Gemini
    reply, err2 = call_gemini(messages, CODEX_SYSTEM)
    if reply:
        return jsonify({"ok": True, "reply": reply, "persona": "Codex", "engine": "Gemini (fallback)"})
    
    return jsonify({"ok": False, "error": err or err2}), 500

@app.route("/ai/royalty", methods=["POST"])
def ai_royalty():
    """Quick royalty/publishing question — answered by Moneypenny"""
    data = request.json or {}
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "question required"}), 400
    
    prompt = f"""As Moneypenny, the GOAT Force royalty expert, answer this question about music royalties, 
publishing, licensing, or distribution for DJ Speedy and GOAT Force Records:

Question: {question}

Give a practical, actionable answer. Include specific next steps if relevant."""
    
    reply, err = call_gemini([{"role": "user", "content": prompt}], MONEYPENNY_SYSTEM)
    if not reply:
        reply, err = call_openai([{"role": "user", "content": prompt}], MONEYPENNY_SYSTEM)
    if reply:
        return jsonify({"ok": True, "answer": reply, "engine": "Gemini/OpenAI"})
    return jsonify({"ok": False, "error": err}), 500

@app.route("/ai/lyrics", methods=["POST"])
def ai_lyrics():
    """AI lyric generation — powered by Gemini/OpenAI"""
    data = request.json or {}
    prompt_text = data.get("prompt", "")
    genre = data.get("genre", "trap")
    style = data.get("style", "waka flocka")
    part = data.get("part", "hook")  # hook | verse | bridge | full song
    
    prompt = f"""Write {part} lyrics for a {genre} song.
Artist style: {style}
Theme/prompt: {prompt_text}
Keep it authentic, hard-hitting, in GOAT Talk style.
Format with [Hook], [Verse 1], etc. if writing full song."""
    
    reply, err = call_gemini([{"role": "user", "content": prompt}], 
                              "You are a professional hip-hop/trap songwriter for GOAT Force Records. Write authentic, hard lyrics.")
    if not reply:
        reply, err = call_openai([{"role": "user", "content": prompt}],
                                   "You are a professional hip-hop/trap songwriter for GOAT Force Records.")
    if reply:
        return jsonify({"ok": True, "lyrics": reply, "genre": genre, "style": style})
    return jsonify({"ok": False, "error": err}), 500

# =============================================================================
#  SPOTIFY REAL API (requires client credentials)
# =============================================================================
import base64
import time

_SPOTIFY_TOKEN = {"token": None, "expires": 0}

def get_spotify_token():
    """Get Spotify client credentials token, cached until expiry"""
    keys = load_keys()
    cid = keys.get("spotify_client_id")
    csec = keys.get("spotify_client_secret")
    if not cid or not csec:
        return None, "Spotify keys not set. Visit /spotify-setup.html"
    
    now = time.time()
    if _SPOTIFY_TOKEN["token"] and _SPOTIFY_TOKEN["expires"] > now:
        return _SPOTIFY_TOKEN["token"], None
    
    try:
        auth = base64.b64encode(f"{cid}:{csec}".encode()).decode()
        r = requests.post(
            "https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {auth}", "Content-Type": "application/x-www-form-urlencoded"},
            data={"grant_type": "client_credentials"},
            timeout=10,
        )
        if r.status_code != 200:
            return None, f"Spotify auth failed: {r.status_code} {r.text[:100]}"
        data = r.json()
        _SPOTIFY_TOKEN["token"] = data["access_token"]
        _SPOTIFY_TOKEN["expires"] = now + data.get("expires_in", 3600) - 60
        return _SPOTIFY_TOKEN["token"], None
    except Exception as e:
        return None, str(e)


@app.route("/spotify/artist-real")
def spotify_artist_real():
    """Get real Spotify artist data (followers, popularity, genres, images)"""
    artist_id = request.args.get("id", "").strip()
    if not artist_id:
        return jsonify({"ok": False, "error": "id required"}), 400
    token, err = get_spotify_token()
    if err:
        return jsonify({"ok": False, "error": err, "fallback": "use /itunes/artist"}), 503
    try:
        r = requests.get(f"https://api.spotify.com/v1/artists/{artist_id}",
                         headers={"Authorization": f"Bearer {token}"}, timeout=10)
        return jsonify({"ok": True, "artist": r.json()})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/spotify/artist-top-tracks")
def spotify_top_tracks():
    artist_id = request.args.get("id", "").strip()
    market = request.args.get("market", "US")
    if not artist_id:
        return jsonify({"ok": False, "error": "id required"}), 400
    token, err = get_spotify_token()
    if err:
        return jsonify({"ok": False, "error": err}), 503
    try:
        r = requests.get(f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?market={market}",
                         headers={"Authorization": f"Bearer {token}"}, timeout=10)
        return jsonify({"ok": True, "tracks": r.json().get("tracks", [])})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/spotify/related-artists")
def spotify_related():
    artist_id = request.args.get("id", "").strip()
    if not artist_id:
        return jsonify({"ok": False, "error": "id required"}), 400
    token, err = get_spotify_token()
    if err:
        return jsonify({"ok": False, "error": err}), 503
    try:
        r = requests.get(f"https://api.spotify.com/v1/artists/{artist_id}/related-artists",
                         headers={"Authorization": f"Bearer {token}"}, timeout=10)
        return jsonify({"ok": True, "artists": r.json().get("artists", [])})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/spotify/audio-features")
def spotify_audio_features():
    track_id = request.args.get("id", "").strip()
    if not track_id:
        return jsonify({"ok": False, "error": "id required"}), 400
    token, err = get_spotify_token()
    if err:
        return jsonify({"ok": False, "error": err}), 503
    try:
        r = requests.get(f"https://api.spotify.com/v1/audio-features/{track_id}",
                         headers={"Authorization": f"Bearer {token}"}, timeout=10)
        return jsonify({"ok": True, "features": r.json()})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# =============================================================================
#  FAN DATABASE (SQLite — 100% local, zero 3rd parties)
# =============================================================================
import sqlite3
FAN_DB = os.path.join(os.path.dirname(__file__), "fans.db")

def fan_db():
    conn = sqlite3.connect(FAN_DB)
    conn.row_factory = sqlite3.Row
    conn.execute("""CREATE TABLE IF NOT EXISTS fans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        phone TEXT,
        name TEXT,
        artist TEXT,
        source TEXT,
        tiktok_handle TEXT,
        favorite_track TEXT,
        city TEXT,
        country TEXT,
        ip TEXT,
        user_agent TEXT,
        consent_marketing INTEGER DEFAULT 1,
        consent_sms INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        notes TEXT
    )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS smart_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        artist TEXT,
        title TEXT,
        description TEXT,
        cover_url TEXT,
        spotify_url TEXT,
        apple_url TEXT,
        youtube_url TEXT,
        tiktok_url TEXT,
        require_email INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        clicks INTEGER DEFAULT 0,
        captures INTEGER DEFAULT 0
    )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subject TEXT,
        body TEXT,
        artist TEXT,
        target_tags TEXT,
        status TEXT DEFAULT 'draft',
        sent_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sent_at TEXT
    )""")
    return conn


@app.route("/fans/add", methods=["POST"])
def fans_add():
    """Add a fan to the database (opt-in capture)"""
    data = request.get_json(force=True, silent=True) or request.form.to_dict()
    email = (data.get("email") or "").strip().lower()
    if not email or "@" not in email:
        return jsonify({"ok": False, "error": "valid email required"}), 400
    
    try:
        conn = fan_db()
        cur = conn.cursor()
        cur.execute("""INSERT OR REPLACE INTO fans
            (email, phone, name, artist, source, tiktok_handle, favorite_track, city, country, ip, user_agent, consent_marketing, consent_sms, tags)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
            email,
            data.get("phone", ""),
            data.get("name", ""),
            data.get("artist", "goat-force"),
            data.get("source", "smart-link"),
            data.get("tiktok_handle", ""),
            data.get("favorite_track", ""),
            data.get("city", ""),
            data.get("country", ""),
            request.remote_addr,
            request.headers.get("User-Agent", "")[:200],
            1 if data.get("consent_marketing", True) else 0,
            1 if data.get("consent_sms", False) else 0,
            data.get("tags", ""),
        ))
        fid = cur.lastrowid
        conn.commit()
        conn.close()
        return jsonify({"ok": True, "id": fid, "email": email, "message": "Welcome to the GOAT Force family 🐐"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/fans/list")
def fans_list():
    """List all fans (admin view)"""
    artist = request.args.get("artist", "")
    limit = int(request.args.get("limit", "500"))
    try:
        conn = fan_db()
        if artist:
            rows = conn.execute("SELECT * FROM fans WHERE artist=? ORDER BY created_at DESC LIMIT ?",
                              (artist, limit)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM fans ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        fans = [dict(r) for r in rows]
        stats_row = conn.execute("SELECT COUNT(*) as total, COUNT(DISTINCT artist) as artists FROM fans").fetchone()
        conn.close()
        return jsonify({"ok": True, "fans": fans, "total": stats_row["total"], "artists": stats_row["artists"]})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/fans/export")
def fans_export():
    """Export fan DB as CSV"""
    try:
        conn = fan_db()
        rows = conn.execute("SELECT email,phone,name,artist,source,tiktok_handle,city,country,created_at FROM fans").fetchall()
        conn.close()
        import csv, io
        out = io.StringIO()
        w = csv.writer(out)
        w.writerow(["email","phone","name","artist","source","tiktok_handle","city","country","created_at"])
        for r in rows:
            w.writerow([r["email"], r["phone"], r["name"], r["artist"], r["source"], r["tiktok_handle"], r["city"], r["country"], r["created_at"]])
        return out.getvalue(), 200, {"Content-Type": "text/csv", "Content-Disposition": "attachment; filename=goat-force-fans.csv"}
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/fans/stats")
def fans_stats():
    """Fan database statistics"""
    try:
        conn = fan_db()
        total = conn.execute("SELECT COUNT(*) as c FROM fans").fetchone()["c"]
        by_artist = conn.execute("SELECT artist, COUNT(*) as c FROM fans GROUP BY artist").fetchall()
        by_source = conn.execute("SELECT source, COUNT(*) as c FROM fans GROUP BY source").fetchall()
        recent = conn.execute("SELECT COUNT(*) as c FROM fans WHERE datetime(created_at) > datetime('now','-7 days')").fetchone()["c"]
        conn.close()
        return jsonify({
            "ok": True,
            "total_fans": total,
            "last_7_days": recent,
            "by_artist": [{"artist": r["artist"], "count": r["c"]} for r in by_artist],
            "by_source": [{"source": r["source"], "count": r["c"]} for r in by_source],
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# =============================================================================
#  SMART LINKS (build your own Linktree)
# =============================================================================
@app.route("/smartlinks/create", methods=["POST"])
def smartlinks_create():
    data = request.get_json(force=True, silent=True) or {}
    slug = (data.get("slug") or "").strip().lower()
    if not slug:
        return jsonify({"ok": False, "error": "slug required"}), 400
    try:
        conn = fan_db()
        conn.execute("""INSERT OR REPLACE INTO smart_links
            (slug, artist, title, description, cover_url, spotify_url, apple_url, youtube_url, tiktok_url, require_email)
            VALUES (?,?,?,?,?,?,?,?,?,?)""", (
            slug,
            data.get("artist", "goat-force"),
            data.get("title", ""),
            data.get("description", ""),
            data.get("cover_url", ""),
            data.get("spotify_url", ""),
            data.get("apple_url", ""),
            data.get("youtube_url", ""),
            data.get("tiktok_url", ""),
            1 if data.get("require_email", True) else 0,
        ))
        conn.commit()
        conn.close()
        return jsonify({"ok": True, "slug": slug, "url": f"/smart-link.html?slug={slug}"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/smartlinks/list")
def smartlinks_list():
    try:
        conn = fan_db()
        rows = conn.execute("SELECT * FROM smart_links ORDER BY created_at DESC").fetchall()
        conn.close()
        return jsonify({"ok": True, "links": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/smartlinks/get")
def smartlinks_get():
    slug = request.args.get("slug", "").strip().lower()
    if not slug:
        return jsonify({"ok": False, "error": "slug required"}), 400
    try:
        conn = fan_db()
        conn.execute("UPDATE smart_links SET clicks = clicks + 1 WHERE slug=?", (slug,))
        row = conn.execute("SELECT * FROM smart_links WHERE slug=?", (slug,)).fetchone()
        conn.commit()
        conn.close()
        if not row:
            return jsonify({"ok": False, "error": "not found"}), 404
        return jsonify({"ok": True, "link": dict(row)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# =============================================================================
#  EMAIL CAMPAIGNS (AI-generated by Moneypenny)
# =============================================================================
@app.route("/campaigns/generate", methods=["POST"])
def campaigns_generate():
    """Have Moneypenny AI write the email copy"""
    data = request.get_json(force=True, silent=True) or {}
    goal = data.get("goal", "announce new release")
    artist = data.get("artist", "DJ Speedy & Waka Flocka Flame")
    track = data.get("track", "")
    style = data.get("style", "hype, GOAT Force attitude, personal, direct")
    
    prompt = f"""Write a professional email marketing campaign for {artist}.
Goal: {goal}
Track/topic: {track}
Tone: {style}

Output JSON format only:
{{
  "subject": "subject line (50 chars max, punchy)",
  "preheader": "preview text (90 chars, teases the email)",
  "body": "full email body in plain text, 150-300 words, authentic, with clear CTA. Use line breaks. Sign off as 'The GOAT Force Team'"
}}"""
    
    reply, err = call_gemini([{"role":"user","content":prompt}],
                              "You are an expert music marketing copywriter for GOAT Force Records. Write authentic, high-converting email copy.")
    if not reply:
        reply, err = call_openai([{"role":"user","content":prompt}],
                                   "You are an expert music marketing copywriter.")
    if not reply:
        return jsonify({"ok": False, "error": err}), 500
    
    # Try to parse JSON
    try:
        import re
        m = re.search(r'\{[\s\S]*\}', reply)
        data = json.loads(m.group(0)) if m else {"subject":"New from GOAT Force","body":reply}
    except:
        data = {"subject":"New from GOAT Force","body":reply}
    return jsonify({"ok": True, "campaign": data})


@app.route("/campaigns/save", methods=["POST"])
def campaigns_save():
    data = request.get_json(force=True, silent=True) or {}
    try:
        conn = fan_db()
        cur = conn.cursor()
        cur.execute("""INSERT INTO campaigns (name, subject, body, artist, target_tags, status)
            VALUES (?,?,?,?,?,?)""", (
            data.get("name", "Untitled"),
            data.get("subject", ""),
            data.get("body", ""),
            data.get("artist", "goat-force"),
            data.get("target_tags", ""),
            "draft",
        ))
        cid = cur.lastrowid
        conn.commit()
        conn.close()
        return jsonify({"ok": True, "id": cid})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/campaigns/list")
def campaigns_list():
    try:
        conn = fan_db()
        rows = conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC").fetchall()
        conn.close()
        return jsonify({"ok": True, "campaigns": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# =============================================================================
#  MAIN
# =============================================================================
if __name__ == "__main__":
    print("\n🐐 GOAT INTEL SERVER v3")
    print("   Mode:  NO API KEYS for data | YOUR KEYS for AI")
    print("   Owner: DJ Speedy + Waka Flocka Flame")
    print("   URL:   http://localhost:5500")
    keys = load_keys()
    print(f"   Gemini: {'✅ ready' if keys.get('gemini_key') else '⚠️  using default key'}")
    print(f"   OpenAI: {'✅ ready' if keys.get('openai_key') else '⚠️  using default key'}")
    print(f"   yt-dlp: {'✅' if YT_DLP_OK else '❌ install: pip install yt-dlp'}\n")
    app.run(host="0.0.0.0", port=5500, debug=False)