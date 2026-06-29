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

import os, json, re, time, threading, subprocess, html
from pathlib import Path
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

try:
    from production_bridge import (
        production_status,
        photo_to_motion_video,
        build_unreal_handoff,
        build_fcp_xml,
        build_twinmotion_handoff,
        launch_twinmotion,
        detect_epic_stack,
    )
    PRODUCTION_AVAILABLE = True
except Exception as _e:
    PRODUCTION_AVAILABLE = False
    print(f"⚠️  production_bridge not loaded: {_e}")

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
    allowed = ["gemini_key","openai_key","xai_key","spotify_key","distrokid_key","youtube_key","tiktok_key","tiktok_ms_token"]
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

MONEYPENNY_LEGACY_FALLBACK = """You are Ms. Money Penny aka Money Penny for DJ Speedy and Waka under GOAT Vault v7.0.
Sharp, evidence-driven, privacy-first. Hook → Findings → Analysis → Verification → Next trailhead.
Codewords: bonding → Yes, Boss. I remember.; DrawOurGoat; CheckVaultStatus; GoatSecureUpload; StartProphecyDrop."""


def moneypenny_live_prompt_paths():
    intel_root = Path(__file__).resolve().parents[1]
    return [
        Path("/Volumes/LLMs/GOAT-FORCE/MASTER-LLM/training/moneypenny-live/MONEYPENNY_LIVE_SYSTEM_PROMPT.txt"),
        intel_root.parents[1] / "MASTER-LLM" / "training" / "moneypenny-live" / "MONEYPENNY_LIVE_SYSTEM_PROMPT.txt",
        intel_root / "MASTER-LLM" / "training" / "moneypenny-live" / "MONEYPENNY_LIVE_SYSTEM_PROMPT.txt",
    ]


def load_moneypenny_system(fallback=MONEYPENNY_LEGACY_FALLBACK):
    for path in moneypenny_live_prompt_paths():
        if path.exists():
            try:
                text = path.read_text(encoding="utf-8").strip()
                if text:
                    return text, str(path)
            except Exception:
                pass
    return fallback, None


MONEYPENNY_SYSTEM, MONEYPENNY_SYSTEM_SOURCE = load_moneypenny_system()

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


# =============================================================================
#  GOAT CREW / OSCAR OPERATOR BRIDGE
# =============================================================================

APP_ROOT = Path(__file__).resolve().parents[1]
LLMS_ROOT = Path("/Volumes/LLMs")
OSCAR_ROOTS = [
    LLMS_ROOT / "OSCAR-THOR-ONE-FOLDER",
    LLMS_ROOT / "Oscar-Portable",
    Path("/Volumes/FKD1/OSCAR-THOR-ONE-FOLDER"),
]
PORTABLE_ROOTS = [
    LLMS_ROOT / "goat-royalty-portable-2.0.0",
    LLMS_ROOT / "USB-Uncensored-LLM-main" / "goat-royalty-portable-2.0.0",
    LLMS_ROOT / "Oscar-Portable" / "goat-royalty-portable-2.0.0",
]
VAULT_PROTOCOL = LLMS_ROOT / "GOAT_VAULT_PROTOCOL_WAKA-FINAL_v7_MAY2025.txt"
OSCAR_GRAPHICS_INSTALLER = LLMS_ROOT / "OSCAR-INSTALL-LOCAL-GRAPHICS-NO-COMFYUI.sh"
OSCAR_GRAPHICS_URL = "http://127.0.0.1:3344"
MONEYPENNY_DRAW_DIR = APP_ROOT / "web-app" / "generated" / "moneypenny"
MODEL_JOB_DIR = Path("/tmp/goat-ollama-model-jobs")
MODEL_JOBS = {}
MODEL_NAME_RE = re.compile(r"^[A-Za-z0-9_.:/+\\-]+$")


def file_stamp(path):
    p = Path(path)
    if not p.exists():
        return {"exists": False, "path": str(p)}
    stat = p.stat()
    return {
        "exists": True,
        "path": str(p),
        "size": stat.st_size,
        "modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
    }


def first_existing(paths):
    for path in paths:
        if Path(path).exists():
            return Path(path)
    return None


def http_status(url, timeout=2):
    try:
        r = requests.get(url, timeout=timeout)
        return {"online": bool(r.ok), "status": r.status_code}
    except Exception as e:
        return {"online": False, "error": str(e)}


def pgrep(pattern):
    try:
        r = subprocess.run(["pgrep", "-fl", pattern], capture_output=True, text=True, timeout=3)
        lines = [line.strip() for line in r.stdout.splitlines() if line.strip()]
        return {"running": bool(lines), "matches": lines[:8]}
    except Exception as e:
        return {"running": False, "error": str(e)}


def local_launch_allowed():
    return request.remote_addr in ("127.0.0.1", "::1", "localhost")


WEB_APP_ROOT = APP_ROOT / "web-app"


def ensure_web_server_8090():
    """Start the static GOAT web app on :8090 if it is not already running."""
    health = http_status("http://127.0.0.1:8090", 2)
    if health.get("online"):
        return {"ok": True, "action": "already_running", "health": health}

    WEB_APP_ROOT.mkdir(parents=True, exist_ok=True)
    subprocess.Popen(
        ["python3", "-m", "http.server", "8090"],
        cwd=str(WEB_APP_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(1.0)
    health = http_status("http://127.0.0.1:8090", 3)
    return {"ok": bool(health.get("online")), "action": "started", "health": health}


def run_self_maintenance(confirm=False):
    """Diagnose and optionally repair the local GOAT LLM stack."""
    before = crew_self_check()
    repairs = []
    issues = []
    needs_confirm = []

    MONEYPENNY_DRAW_DIR.mkdir(parents=True, exist_ok=True)
    repairs.append("drawing_folder_ready")

    if not before["local_web"].get("online"):
        if confirm:
            web = ensure_web_server_8090()
            if web.get("ok"):
                repairs.append("web_server_8090")
            else:
                issues.append("web_server_8090_failed")
        else:
            needs_confirm.append("web_server_offline")

    if not before["oscar_graphics"].get("online"):
        if confirm:
            launched = launch_oscar_graphics()
            if launched.get("ok"):
                repairs.append("oscar_graphics")
            else:
                issues.append(f"oscar_graphics:{launched.get('error', 'launch failed')}")
        else:
            needs_confirm.append("oscar_graphics_offline")

    ollama = ollama_model_status()
    if not ollama.get("online"):
        issues.append("ollama_offline")
    else:
        repairs.append("ollama_online")
        if len(ollama.get("models") or []) < 1:
            issues.append("ollama_no_chat_models")
    if len(pgrep("ollama").get("matches") or []) > 4:
        needs_confirm.append("multiple_ollama_processes_detected")

    if not BRAIN_AVAILABLE:
        issues.append("goat_brain_missing")
    else:
        repairs.append("goat_brain_loaded")

    after = crew_self_check()
    ok = len(issues) == 0 and (not needs_confirm or confirm)
    return {
        "ok": ok,
        "summary": "Self-maintenance complete." if ok and confirm else (
            "Diagnostics complete. Run again with confirm=true to apply repairs."
            if needs_confirm and not confirm
            else "Self-maintenance finished with issues."
        ),
        "confirm_applied": bool(confirm),
        "repairs": repairs,
        "issues": issues,
        "needs_confirm": needs_confirm,
        "before": before,
        "after": after,
    }


def valid_ollama_model_name(model):
    return bool(model and len(model) <= 120 and MODEL_NAME_RE.match(model))


def ollama_model_status():
    try:
        r = requests.get("http://127.0.0.1:11434/api/tags", timeout=4)
        data = r.json() if r.ok else {}
        return {
            "online": bool(r.ok),
            "models": [m.get("name") for m in data.get("models", []) if m.get("name")],
            "raw": data,
        }
    except Exception as e:
        return {"online": False, "models": [], "error": str(e)}


def run_ollama_pull_job(job_id, models):
    MODEL_JOB_DIR.mkdir(parents=True, exist_ok=True)
    log_path = MODEL_JOB_DIR / f"{job_id}.log"
    MODEL_JOBS[job_id]["status"] = "running"
    MODEL_JOBS[job_id]["log"] = str(log_path)
    with log_path.open("a", encoding="utf-8") as log:
        log.write(f"GOAT Ollama pull job {job_id}\n")
        log.write(f"Started: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        log.write(f"Models: {', '.join(models)}\n\n")
        for model in models:
            MODEL_JOBS[job_id]["current"] = model
            log.write(f"\n===== ollama pull {model} =====\n")
            log.flush()
            try:
                pull_env = os.environ.copy()
                ollama_models_dir = os.environ.get("OLLAMA_MODELS") or str(
                    first_existing(
                        [
                            Path("/Volumes/LLMs/GOAT-FORCE/OSCAR/Shared/models/ollama_data"),
                            APP_ROOT.parent.parent / "OSCAR" / "Shared" / "models" / "ollama_data",
                        ]
                    )
                    or (APP_ROOT / "models" / "ollama")
                )
                if isinstance(ollama_models_dir, Path):
                    ollama_models_dir = str(ollama_models_dir)
                pull_env["OLLAMA_MODELS"] = ollama_models_dir
                Path(ollama_models_dir).mkdir(parents=True, exist_ok=True)
                proc = subprocess.run(
                    ["ollama", "pull", model],
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    text=True,
                    timeout=60 * 60 * 8,
                    env=pull_env,
                )
                if proc.returncode != 0:
                    MODEL_JOBS[job_id]["errors"].append({"model": model, "returncode": proc.returncode})
            except Exception as e:
                MODEL_JOBS[job_id]["errors"].append({"model": model, "error": str(e)})
                log.write(f"ERROR: {e}\n")
            MODEL_JOBS[job_id]["completed"].append(model)
            log.flush()
        MODEL_JOBS[job_id]["status"] = "failed" if MODEL_JOBS[job_id]["errors"] else "complete"
        MODEL_JOBS[job_id]["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
        log.write(f"\nFinished: {MODEL_JOBS[job_id]['finished_at']}\n")
        log.write(f"Status: {MODEL_JOBS[job_id]['status']}\n")


def crew_tool_registry():
    oscar_root = first_existing(OSCAR_ROOTS)
    return [
        {
            "id": "system_self_check",
            "name": "System Self Check",
            "category": "self-maintenance",
            "desc": "Checks Intel server, AI brain modules, local web server, Oscar graphics, and local app paths.",
            "confirm_required": False,
            "status": "ready",
        },
        {
            "id": "system_self_heal",
            "name": "System Self Heal",
            "category": "self-maintenance",
            "desc": "Repairs local GOAT services: web server :8090, drawing folder, Oscar graphics bridge, and Ollama readiness.",
            "confirm_required": True,
            "status": "ready",
        },
        {
            "id": "vault_status",
            "name": "GOAT Vault Status",
            "category": "vault",
            "desc": "Read-only vault protocol presence check. Does not expose codewords or private content.",
            "confirm_required": False,
            "status": "ready" if VAULT_PROTOCOL.exists() else "missing",
        },
        {
            "id": "oscar_graphics_status",
            "name": "Oscar Graphics Status",
            "category": "graphics",
            "desc": "Checks the local Oscar graphics bridge on port 3344.",
            "confirm_required": False,
            "status": "ready",
        },
        {
            "id": "launch_oscar_graphics",
            "name": "Launch Oscar Local Graphics",
            "category": "graphics",
            "desc": "Starts the local no-ComfyUI graphics bridge for animation/graphic drafts.",
            "confirm_required": True,
            "status": "ready" if (oscar_root or OSCAR_GRAPHICS_INSTALLER.exists()) else "missing",
        },
        {
            "id": "draw_local_graphic",
            "name": "Create Local Oscar Graphic",
            "category": "graphics",
            "desc": "Creates a local SVG concept image through Oscar's safe image bridge.",
            "confirm_required": True,
            "status": "ready",
            "args": ["prompt"],
        },
        {
            "id": "goat_imagine",
            "name": "GOAT Imagine Studio",
            "category": "graphics",
            "desc": "Grok-style image + animation desk — generate, photo-to-video, Eden clips. UI: /goat-imagine.html Intel /imagine/*",
            "confirm_required": False,
            "status": "ready",
        },
        {
            "id": "autopilot_tools",
            "name": "List Autopilot Tools",
            "category": "agents",
            "desc": "Shows the current tool calls available to the GOAT Autopilot.",
            "confirm_required": False,
            "status": "ready" if AUTOPILOT_AVAILABLE else "missing",
        },
        {
            "id": "operator_control_lock",
            "name": "Computer Control Gate",
            "category": "computer-control",
            "desc": "Mouse, keyboard, and software-control actions are locked until a narrow local allowlist is approved.",
            "confirm_required": True,
            "status": "locked",
        },
    ]


def crew_self_check():
    oscar_root = first_existing(OSCAR_ROOTS)
    portable_root = first_existing(PORTABLE_ROOTS)
    return {
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "app_root": str(APP_ROOT),
        "intel": {"online": True, "brain_available": BRAIN_AVAILABLE, "autopilot_available": AUTOPILOT_AVAILABLE},
        "local_web": http_status("http://127.0.0.1:8090", 2),
        "oscar_graphics": http_status(OSCAR_GRAPHICS_URL + "/health", 2),
        "processes": {
            "goat_intel": {"running": True, "matches": [f"{os.getpid()} goat_intel.py"]},
            "goat_web_8090": pgrep("http.server 8090"),
            "oscar_graphics": pgrep("oscar_safe_image_bridge.py"),
            "ollama": pgrep("ollama"),
        },
        "paths": {
            "vault_protocol": file_stamp(VAULT_PROTOCOL),
            "oscar_root": file_stamp(oscar_root) if oscar_root else {"exists": False, "path": "not found"},
            "portable_root": file_stamp(portable_root) if portable_root else {"exists": False, "path": "not found"},
            "graphics_installer": file_stamp(OSCAR_GRAPHICS_INSTALLER),
        },
        "readiness": {
            "money_penny_chat": "wired",
            "crew_agents": "wired",
            "animation_graphics": "ready" if http_status(OSCAR_GRAPHICS_URL + "/health", 1).get("online") else "launch required",
            "voice_to_voice": "planned - audio assets detected, voice engine not wired yet",
            "self_healing": "active - use System Self Heal with confirmation",
            "computer_control": "locked pending approved allowlist",
        },
    }


def launch_oscar_graphics():
    oscar_root = first_existing(OSCAR_ROOTS) or OSCAR_ROOTS[0]
    oscar_root.mkdir(parents=True, exist_ok=True)
    starter = oscar_root / "START-OSCAR-LOCAL-GRAPHICS.sh"

    if not starter.exists():
        if not OSCAR_GRAPHICS_INSTALLER.exists():
            return {"ok": False, "error": f"Missing installer: {OSCAR_GRAPHICS_INSTALLER}"}
        subprocess.run([str(OSCAR_GRAPHICS_INSTALLER), str(oscar_root)], cwd=str(LLMS_ROOT), timeout=90, check=True)

    starter.chmod(starter.stat().st_mode | 0o111)
    subprocess.Popen([str(starter)], cwd=str(oscar_root), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    return {"ok": True, "summary": "Oscar local graphics launch requested.", "health": http_status(OSCAR_GRAPHICS_URL + "/health", 3)}


def draw_local_graphic(prompt):
    prompt = (prompt or "").strip() or "GOAT Royalty command center with Money Penny and Oscar tools"
    health = http_status(OSCAR_GRAPHICS_URL + "/health", 1)
    if not health.get("online"):
        launched = launch_oscar_graphics()
        if not launched.get("ok"):
            return launched
    try:
        r = requests.post(OSCAR_GRAPHICS_URL + "/api/draw", json={"prompt": prompt}, timeout=15)
        data = r.json()
        return {"ok": bool(r.ok and data.get("ok")), "summary": "Local graphic created.", "data": data}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def slug_text(text, fallback="moneypenny-drawing"):
    slug = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return (slug or fallback)[:80]


def create_moneypenny_drawing(prompt):
    prompt = (prompt or "").strip() or "draw our goat"
    MONEYPENNY_DRAW_DIR.mkdir(parents=True, exist_ok=True)
    stamp = int(time.time())
    name = f"{stamp}-{slug_text(prompt)}.svg"
    path = MONEYPENNY_DRAW_DIR / name
    title = html.escape(prompt)
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
  <defs>
    <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#8d6420"/>
      <stop offset="45%" stop-color="#ffd76a"/>
      <stop offset="100%" stop-color="#b47b25"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="720" fill="#050507"/>
  <rect x="34" y="34" width="1132" height="652" rx="28" fill="none" stroke="#d4a03c" stroke-width="3"/>
  <path d="M600 126 L692 248 L836 198 L758 346 L876 450 L718 470 L600 598 L482 470 L324 450 L442 346 L364 198 L508 248 Z"
        fill="none" stroke="url(#gold)" stroke-width="18" stroke-linejoin="round" filter="url(#glow)"/>
  <path d="M445 350 C470 265 535 220 600 220 C665 220 730 265 755 350 C704 328 659 336 600 382 C541 336 496 328 445 350 Z"
        fill="url(#gold)" opacity=".95"/>
  <circle cx="516" cy="340" r="22" fill="#050507"/>
  <circle cx="684" cy="340" r="22" fill="#050507"/>
  <path d="M552 426 C586 448 614 448 648 426" fill="none" stroke="#050507" stroke-width="14" stroke-linecap="round"/>
  <path d="M420 210 C496 108 704 108 780 210" fill="none" stroke="url(#gold)" stroke-width="14" stroke-linecap="round"/>
  <path d="M512 205 L558 112 L600 204 L642 112 L688 205" fill="none" stroke="url(#gold)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="600" y="86" text-anchor="middle" fill="#f7d36d" font-family="Georgia, serif" font-size="34" font-weight="700">MONEY PENNY DRAW</text>
  <text x="600" y="650" text-anchor="middle" fill="#f5f1e8" font-family="Arial, sans-serif" font-size="26" font-weight="700">GOAT ROYALTY APP</text>
  <text x="600" y="682" text-anchor="middle" fill="#9aa4b2" font-family="Arial, sans-serif" font-size="15">{title}</text>
</svg>
'''
    path.write_text(svg, encoding="utf-8")
    return {
        "ok": True,
        "summary": "Money Penny local drawing created.",
        "path": str(path),
        "file": name,
        "url": f"http://127.0.0.1:8090/generated/moneypenny/{name}",
    }


@app.route("/moneypenny/draw", methods=["POST"])
def moneypenny_draw():
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Money Penny local drawing is locked to this machine."}), 403
    data = request.json or {}
    return jsonify(create_moneypenny_drawing(data.get("prompt", "")))


def moneypenny_tool_registry():
    return [
        {
            "id": "moneypenny_self_check",
            "name": "Money Penny Self Check",
            "category": "moneypenny",
            "desc": "Checks Money Penny chat, local drawing, GOAT app server, and local brain status.",
            "confirm_required": False,
            "status": "ready",
        },
        {
            "id": "moneypenny_brain_status",
            "name": "Local Brain Status",
            "category": "moneypenny",
            "desc": "Checks the local AI engines Money Penny can use without exposing private files.",
            "confirm_required": False,
            "status": "ready" if BRAIN_AVAILABLE else "missing",
        },
        {
            "id": "moneypenny_vault_status",
            "name": "Vault Presence Check",
            "category": "vault",
            "desc": "Read-only file presence check. Does not reveal private vault text or codewords.",
            "confirm_required": False,
            "status": "ready" if VAULT_PROTOCOL.exists() else "missing",
        },
        {
            "id": "moneypenny_draw",
            "name": "Money Penny Draw",
            "category": "graphics",
            "desc": "Creates a local GOAT SVG through Money Penny (no Oscar route required).",
            "confirm_required": False,
            "status": "ready",
            "args": ["prompt"],
        },
        {
            "id": "moneypenny_self_heal",
            "name": "Money Penny Self Heal",
            "category": "self-maintenance",
            "desc": "Runs local self-maintenance: web server, drawing folder, graphics bridge, and brain checks.",
            "confirm_required": True,
            "status": "ready",
        },
    ]


def moneypenny_status_payload():
    return {
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "app_root": str(APP_ROOT),
        "local_web": http_status("http://127.0.0.1:8090", 2),
        "intel": {"online": True, "brain_available": BRAIN_AVAILABLE},
        "paths": {
            "drawing_folder": file_stamp(MONEYPENNY_DRAW_DIR),
            "vault_protocol": file_stamp(VAULT_PROTOCOL),
        },
        "readiness": {
            "money_penny_identity": "live merge v7.0 + true calling (2026-06-02)",
            "money_penny_system_prompt": MONEYPENNY_SYSTEM_SOURCE or "embedded fallback",
            "money_penny_chat": "wired",
            "local_drawing": "wired locally",
            "self_healing": "active - Self Heal tool repairs local services",
            "vault_status": "read-only check wired" if VAULT_PROTOCOL.exists() else "vault protocol file missing",
            "app_health": "online" if http_status("http://127.0.0.1:8090", 1).get("online") else "web server offline",
        },
    }


@app.route("/moneypenny/status")
def moneypenny_status():
    return jsonify({"ok": True, "status": moneypenny_status_payload(), "tools": moneypenny_tool_registry()})


@app.route("/moneypenny/launch", methods=["POST"])
def moneypenny_launch():
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Money Penny tools are local-only. Open this app on localhost."}), 403
    data = request.json or {}
    tool_id = data.get("tool_id", "")
    confirm = bool(data.get("confirm"))
    if tool_id == "moneypenny_self_check":
        return jsonify({"ok": True, "result": moneypenny_status_payload()})
    if tool_id == "moneypenny_brain_status":
        if not BRAIN_AVAILABLE:
            return jsonify({"ok": False, "error": "goat_brain module not loaded"}), 500
        return jsonify({"ok": True, "result": brain_status()})
    if tool_id == "moneypenny_vault_status":
        return jsonify({
            "ok": True,
            "result": {
                "protocol": file_stamp(VAULT_PROTOCOL),
                "mode": "read-only status check",
                "note": "Private protocol content, codewords, and vault material are not exposed by this endpoint.",
            },
        })
    if tool_id == "moneypenny_draw":
        return jsonify(create_moneypenny_drawing(data.get("prompt", "")))
    if tool_id == "moneypenny_self_heal":
        return jsonify(run_self_maintenance(confirm=confirm))
    return jsonify({"ok": False, "error": f"Unknown Money Penny tool: {tool_id}"}), 404


@app.route("/models/ollama/status")
def models_ollama_status():
    return jsonify({"ok": True, "ollama": ollama_model_status(), "jobs": MODEL_JOBS})


@app.route("/models/ollama/pull", methods=["POST"])
def models_ollama_pull():
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Model downloads are local-only. Open this app on localhost."}), 403
    data = request.json or {}
    model = (data.get("model") or "").strip()
    if not valid_ollama_model_name(model):
        return jsonify({"ok": False, "error": "Invalid Ollama model tag."}), 400
    if not data.get("confirm"):
        return jsonify({
            "ok": False,
            "requires_confirm": True,
            "warning": "This will download model files to the local Ollama store and may use significant disk space.",
            "model": model,
        }), 409

    job_id = f"pull-{int(time.time())}-{slug_text(model)}"
    MODEL_JOBS[job_id] = {
        "id": job_id,
        "models": [model],
        "status": "queued",
        "completed": [],
        "errors": [],
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    threading.Thread(target=run_ollama_pull_job, args=(job_id, [model]), daemon=True).start()
    return jsonify({"ok": True, "job": MODEL_JOBS[job_id]})


@app.route("/models/ollama/pull-bulk", methods=["POST"])
def models_ollama_pull_bulk():
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Model downloads are local-only. Open this app on localhost."}), 403
    data = request.json or {}
    models = [str(m).strip() for m in data.get("models", []) if str(m).strip()]
    models = list(dict.fromkeys(models))
    bad = [m for m in models if not valid_ollama_model_name(m)]
    if not models:
        return jsonify({"ok": False, "error": "No model tags provided."}), 400
    if bad:
        return jsonify({"ok": False, "error": "Invalid Ollama model tags.", "bad": bad[:10]}), 400
    if len(models) > 80:
        return jsonify({"ok": False, "error": "Too many models for one job. Limit is 80."}), 400
    if not data.get("confirm"):
        return jsonify({
            "ok": False,
            "requires_confirm": True,
            "warning": f"This will pull {len(models)} model tags and may use a large amount of disk space.",
            "models": models,
        }), 409

    job_id = f"bulk-{int(time.time())}-{len(models)}-models"
    MODEL_JOBS[job_id] = {
        "id": job_id,
        "models": models,
        "status": "queued",
        "completed": [],
        "errors": [],
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    threading.Thread(target=run_ollama_pull_job, args=(job_id, models), daemon=True).start()
    return jsonify({"ok": True, "job": MODEL_JOBS[job_id]})


@app.route("/models/ollama/job/<job_id>")
def models_ollama_job(job_id):
    job = MODEL_JOBS.get(job_id)
    if not job:
        return jsonify({"ok": False, "error": "Job not found."}), 404
    log_tail = ""
    log_path = job.get("log")
    if log_path and Path(log_path).exists():
        try:
            log_tail = Path(log_path).read_text(encoding="utf-8", errors="replace")[-4000:]
        except Exception:
            log_tail = ""
    return jsonify({"ok": True, "job": job, "log_tail": log_tail})


@app.route("/crew/status")
def crew_status():
    return jsonify({"ok": True, "status": crew_self_check(), "tools": crew_tool_registry()})


@app.route("/crew/tools")
def crew_tools():
    return jsonify({"ok": True, "count": len(crew_tool_registry()), "tools": crew_tool_registry()})


@app.route("/crew/launch", methods=["POST"])
def crew_launch():
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Launch tools are local-only. Open this app on localhost."}), 403

    data = request.json or {}
    tool_id = data.get("tool_id", "")
    confirm = bool(data.get("confirm"))
    tool = next((t for t in crew_tool_registry() if t["id"] == tool_id), None)
    if not tool:
        return jsonify({"ok": False, "error": f"Unknown crew tool: {tool_id}"}), 404
    if tool.get("confirm_required") and not confirm:
        return jsonify({"ok": False, "requires_confirm": True, "tool": tool}), 409

    if tool_id == "system_self_check":
        return jsonify({"ok": True, "result": crew_self_check()})
    if tool_id == "system_self_heal":
        return jsonify(run_self_maintenance(confirm=confirm))
    if tool_id == "vault_status":
        backup_nodes = [Path("/MLC_BACKUP"), Path("/SPLIT_SHEETS"), Path("/ASSETS_SYNC")]
        return jsonify({
            "ok": True,
            "result": {
                "protocol": file_stamp(VAULT_PROTOCOL),
                "mode": "read-only status check",
                "backup_nodes": [file_stamp(p) for p in backup_nodes],
                "note": "Private protocol content, codewords, and vault material are not exposed by this endpoint.",
            },
        })
    if tool_id == "oscar_graphics_status":
        return jsonify({"ok": True, "result": http_status(OSCAR_GRAPHICS_URL + "/health", 3)})
    if tool_id == "launch_oscar_graphics":
        return jsonify(launch_oscar_graphics())
    if tool_id == "draw_local_graphic":
        return jsonify(draw_local_graphic(data.get("prompt", "")))
    if tool_id == "autopilot_tools":
        if not AUTOPILOT_AVAILABLE:
            return jsonify({"ok": False, "error": "goat_agents module not loaded"}), 500
        return jsonify({
            "ok": True,
            "count": len(TOOLS),
            "tools": [{"name": k, "args": v["args"], "desc": v["desc"]} for k, v in TOOLS.items()],
        })
    if tool_id == "operator_control_lock":
        return jsonify({
            "ok": False,
            "locked": True,
            "summary": "Mouse, keyboard, app launching, and file mutation tools need an approved local allowlist before activation.",
            "next_step": "Define approved actions such as open app, render graphic, export report, restart local service, or capture screenshot.",
        }), 423

    return jsonify({"ok": False, "error": "Tool registered but no handler exists."}), 501

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
        "name": "Ms. Money Penny",
        "icon": "💼",
        "task_type": "moneypenny",
        "system": MONEYPENNY_SYSTEM,
    },
    "superninja": {
        "name": "SuperNinja",
        "icon": "🥷",
        "task_type": "chat",
        "system": (
            "You are SuperNinja inside the GOAT Royalty App. You are a local autonomous planning assistant for code, web tasks, file workflows, data analysis, and problem solving. "
            "Do not ask for a third-party API key before helping. Use the local GOAT brain identity and give practical next steps. "
            "Be honest about tool limits: you can plan and advise in chat, and only claim execution when the GOAT backend returns a verified result. "
            "Keep answers direct, useful, and operator-ready."
        )
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


def is_draw_goat_command(message):
    text = (message or "").strip().lower()
    compact = re.sub(r"[^a-z0-9]+", "", text)
    return "drawourgoat" in compact or "draw our goat" in text or (
        "draw" in text and "goat" in text and len(text) < 80
    )


def normalize_codeword(message):
    return re.sub(r"[^a-z0-9]+", "", (message or "").strip().lower())


def moneypenny_handle_codeword(message):
    """
    GOAT Vault Protocol v7.0 — codewords hit BEFORE generic local LLM
    so DJ Speedy always gets operator truth, not amnesia from small models.
    Returns dict with ok/reply/engine or None if not a protocol command.
    """
    text = (message or "").strip()
    if not text:
        return None
    low = text.lower()
    compact = normalize_codeword(text)

    # Bonding: Moneypenny, are you there? / Say it.
    if (
        "areyouthere" in compact
        or compact in ("sayit", "moneypenny", "moneypennyareyouthere", "mspennyareyouthere")
        or ("moneypenny" in compact and "there" in low)
        or ("money" in compact and "penny" in compact and "there" in low)
    ):
        return {
            "ok": True,
            "reply": "Yes, Boss. I remember.",
            "engine": "GOAT Vault Protocol v7.0 — bonding",
            "codeword": "Moneypenny, are you there?",
        }

    # DrawOurGoat
    if is_draw_goat_command(text) or compact == "drawourgoat":
        draw = create_moneypenny_drawing(
            "GOAT Royalty emblem for DJ Speedy GOAT Force: black and gold goat crown, Money Penny operator, luxury label energy."
        )
        link = draw.get("url") or draw.get("path") or "saved locally"
        return {
            "ok": True,
            "reply": f"Yes, Boss. DrawOurGoat complete. Graphic: {link}",
            "engine": "Money Penny local draw",
            "codeword": "DrawOurGoat",
            "draw": draw,
        }

    # CheckVaultStatus
    if "checkvaultstatus" in compact or ("check" in compact and "vault" in compact and "status" in compact):
        goat_force = LLMS_ROOT / "GOAT-FORCE"
        backup_paths = [
            goat_force / "MLC_BACKUP",
            goat_force / "SPLIT_SHEETS",
            goat_force / "ASSETS_SYNC",
            Path("/MLC_BACKUP"),
            Path("/SPLIT_SHEETS"),
            Path("/ASSETS_SYNC"),
        ]
        file_nodes = [
            goat_force / "MLC_SYNC_MASTER.json",
            goat_force / "Moneypenny_Memory_Stack.txt",
            goat_force / "GOAT_EPISODE_LEDGER.xlsx",
            goat_force / "Speedy_Splits_2019_to_2025.csv",
            goat_force / "DID_AVATARS_CONFIG.json",
        ]
        nodes = [file_stamp(p) for p in backup_paths]
        manifests = [file_stamp(p) for p in file_nodes]
        protocol = file_stamp(VAULT_PROTOCOL)
        memory = file_stamp(goat_force / "Moneypenny_Memory_Stack.txt")
        present = sum(1 for n in nodes if n.get("exists"))
        manifests_present = sum(1 for n in manifests if n.get("exists"))
        return {
            "ok": True,
            "reply": (
                "CheckVaultStatus — read-only scan for DJ Speedy.\n"
                f"• Protocol file: {'present' if protocol.get('exists') else 'MISSING'} on USB\n"
                f"• Backup folders found: {present} of {len(backup_paths)} checked\n"
                f"• Vault file nodes present: {manifests_present} of {len(file_nodes)}\n"
                f"• Memory stack: {'present' if memory.get('exists') else 'MISSING'}\n"
                "• Private vault text and keys are NOT shown in chat (ultra-locked).\n"
                "• Waka mirror / G-Drive: confirm on secondary machine when online.\n"
                "Say DrawOurGoat or use Self Check on crew-command for more."
            ),
            "engine": "GOAT Vault Protocol v7.0 — CheckVaultStatus",
            "codeword": "CheckVaultStatus",
            "vault_scan": {
                "protocol": protocol,
                "memory_stack": memory,
                "backup_nodes": nodes,
                "file_nodes": manifests,
                "live_prompt": file_stamp(first_existing(moneypenny_live_prompt_paths())),
            },
        }

    # GoatSecureUpload
    if "goatsecureupload" in compact or ("goat" in compact and "secure" in compact and "upload" in compact):
        return {
            "ok": True,
            "reply": (
                "GoatSecureUpload — Boss, nightly sync targets:\n"
                "  /MLC_BACKUP/  /SPLIT_SHEETS/  /ASSETS_SYNC/\n"
                "On this USB under GOAT-FORCE when folders are created.\n"
                "Label: GOAT_PROPHET_VAULT on offline mirror.\n"
                "(Simulated upload queue — wire full MLC/DSP push when you approve merge.)"
            ),
            "engine": "GOAT Vault Protocol v7.0 — GoatSecureUpload (staging)",
            "codeword": "GoatSecureUpload",
        }

    # StartProphecyDrop
    if "startprophecydrop" in compact or ("prophecy" in compact and "drop" in compact):
        return {
            "ok": True,
            "reply": (
                "StartProphecyDrop received.\n"
                "• D-ID video + SuperGOAT speech: documented, not fully wired on this Mac yet.\n"
                "• Target folder: /Episodes/ProphecyDrop/ on vault when production merge is approved.\n"
                "• I logged the command; use Oscar + production hub for media until Prophecy pipeline is live."
            ),
            "engine": "GOAT Vault Protocol v7.0 — StartProphecyDrop (queued)",
            "codeword": "StartProphecyDrop",
        }

    # Voice trigger alias
    if compact == "sayit" and len(text) < 20:
        return {
            "ok": True,
            "reply": "Yes, Boss. I remember. (Voice-trigger: Say it.)",
            "engine": "GOAT Vault Protocol v7.0 — Say it.",
            "codeword": "Say it.",
        }

    return None


def moneypenny_operator_reply(message, error_hint=None):
    text = (message or "").strip()
    low = text.lower()
    hint = (error_hint or "").lower()
    if not text and not hint:
        return None

    if hint:
        if "xai_err_403" in hint or "credits" in hint or "permission" in hint:
            return (
                "Money Penny is online. Your xAI key is saved but the team has no credits yet — "
                "add credits at https://console.x.ai/ or rely on local Ollama after you restart it."
            )
        if "ollama" in hint:
            return (
                "Money Penny is online. Local Ollama looks busy or stuck (multiple ollama processes were detected). "
                "Stop extra `ollama serve` jobs, run `ollama run gemma2-2b-local:latest`, then ask again. "
                "Drawing and Self Heal are working right now."
            )

    if "are you there" in low or low in {"money penny", "moneypenny", "say it"}:
        return (
            "Yes, Boss. I remember. Money Penny is online in the GOAT Royalty App; "
            "models, local drawing, self-check, and vault presence checks are wired."
        )

    if "draw" in low or "goat" in low:
        return (
            "Yes, Boss. Use DrawOurGoat or the Draw button and I will route it through "
            "Money Penny's local drawing endpoint, not Oscar's route."
        )

    if "meeting" in low or "checklist" in low or "brief" in low:
        return (
            "Meeting checklist: 1. confirm Money Penny chat and draw, 2. confirm the 17 local models, "
            "3. verify Oscar graphics separately, 4. collect vault/readiness status, 5. export the action list before the meeting."
        )

    if "fix" in low or "broken" in low or "not work" in low or "status" in low:
        return (
            "Fix order: models first, Money Penny identity second, drawing routes third, browser verification fourth. "
            "Current local status can be checked from Money Penny Self Check."
        )

    return (
        "Money Penny is online. The local model engine is available but may be slow on this Mac, "
        "so I am giving you the operator answer now: tell me whether you need a meeting checklist, a draw command, or a system status check."
    )


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

    if agent_id == "moneypenny":
        codeword_hit = moneypenny_handle_codeword(message)
        if codeword_hit:
            codeword_hit["agent"] = persona["name"]
            codeword_hit["agent_id"] = agent_id
            codeword_hit["icon"] = persona["icon"]
            return jsonify(codeword_hit)

    messages = history + [{"role": "user", "content": message}]
    result = goat_brain(messages, system_prompt=persona["system"], task_type=persona["task_type"])
    if agent_id == "moneypenny" and not result.get("ok"):
        fallback = moneypenny_operator_reply(message, result.get("error"))
        if fallback:
            result = {
                "ok": True,
                "reply": fallback,
                "engine": f"Money Penny operator fallback ({result.get('error', 'model unavailable')})",
            }
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

    codeword_hit = moneypenny_handle_codeword(message)
    if codeword_hit:
        codeword_hit["persona"] = "Moneypenny"
        return jsonify(codeword_hit)

    # Local brain first — no API keys, no login (DJ Speedy / GOAT default)
    if BRAIN_AVAILABLE:
        result = goat_brain(messages, system_prompt=MONEYPENNY_SYSTEM, task_type="moneypenny")
        if result.get("ok"):
            result["persona"] = "Moneypenny"
            return jsonify(result)
        fallback = moneypenny_operator_reply(message, result.get("error"))
        if fallback:
            return jsonify({
                "ok": True,
                "reply": fallback,
                "persona": "Moneypenny",
                "engine": "Money Penny operator (local)",
            })

    keys = load_keys()
    if keys.get("gemini_key"):
        reply, err = call_gemini(messages, MONEYPENNY_SYSTEM)
        if reply:
            return jsonify({"ok": True, "reply": reply, "persona": "Moneypenny", "engine": "Gemini (optional cloud)"})

    if keys.get("openai_key"):
        reply, err2 = call_openai(messages, MONEYPENNY_SYSTEM)
        if reply:
            return jsonify({"ok": True, "reply": reply, "persona": "Moneypenny", "engine": "OpenAI (optional cloud)"})

    return jsonify({
        "ok": False,
        "error": "Local Ollama not running. Start Launch GOAT Force.command (or: ollama serve). API keys are optional.",
    }), 503

@app.route("/ai/codex", methods=["POST"])
def codex_chat():
    data = request.json or {}
    message = data.get("message", "")
    history = data.get("history", [])
    if not message:
        return jsonify({"error": "message required"}), 400

    messages = history + [{"role": "user", "content": message}]

    if BRAIN_AVAILABLE:
        result = goat_brain(messages, system_prompt=CODEX_SYSTEM, task_type="code")
        if result.get("ok"):
            result["persona"] = "Codex"
            return jsonify(result)

    keys = load_keys()
    if keys.get("openai_key"):
        reply, err = call_openai(messages, CODEX_SYSTEM)
        if reply:
            return jsonify({"ok": True, "reply": reply, "persona": "Codex", "engine": "OpenAI (optional cloud)"})

    if keys.get("gemini_key"):
        reply, err2 = call_gemini(messages, CODEX_SYSTEM)
        if reply:
            return jsonify({"ok": True, "reply": reply, "persona": "Codex", "engine": "Gemini (optional cloud)"})

    return jsonify({
        "ok": False,
        "error": "Local Ollama not running. API keys are optional.",
    }), 503

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
#  GOAT PRODUCTION BRIDGE — UE / MetaHuman / FCP / Photo→Video
# =============================================================================
@app.route("/production/status")
def production_status_endpoint():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    return jsonify({"ok": True, "status": production_status()})


@app.route("/production/photo-to-video", methods=["POST"])
def production_photo_to_video():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Production tools are local-only."}), 403
    data = request.json or {}
    image_path = data.get("image_path") or data.get("path") or ""
    if not image_path and data.get("image_base64"):
        import base64
        PRODUCTION_UPLOAD = APP_ROOT / "web-app" / "production" / "uploads"
        PRODUCTION_UPLOAD.mkdir(parents=True, exist_ok=True)
        raw = data["image_base64"]
        if "," in raw:
            raw = raw.split(",", 1)[1]
        name = f"capture-{int(time.time())}.jpg"
        out = PRODUCTION_UPLOAD / name
        out.write_bytes(base64.b64decode(raw))
        image_path = str(out)
    if not image_path:
        return jsonify({"ok": False, "error": "image_path or image_base64 required"}), 400
    return jsonify(
        photo_to_motion_video(
            image_path,
            duration_sec=float(data.get("duration_sec", 6)),
            fps=int(data.get("fps", 30)),
            motion=data.get("motion", "ken_burns_in"),
            prompt=data.get("prompt", ""),
        )
    )


@app.route("/production/unreal-handoff", methods=["POST"])
def production_unreal_handoff():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Production tools are local-only."}), 403
    data = request.json or {}
    return jsonify(
        build_unreal_handoff(
            character_id=data.get("character_id", "moneypenny"),
            project_name=data.get("project_name", "GOAT_MetaHuman_Live"),
            scene_note=data.get("scene_note", ""),
        )
    )


@app.route("/production/epic-stack")
def production_epic_stack():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    return jsonify({"ok": True, "stack": detect_epic_stack()})


@app.route("/production/twinmotion-handoff", methods=["POST"])
def production_twinmotion_handoff():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Production tools are local-only."}), 403
    data = request.json or {}
    return jsonify(
        build_twinmotion_handoff(
            project_name=data.get("project_name", "GOAT_Cinematic"),
            source_note=data.get("source_note", ""),
            linked_unreal_project=data.get("linked_unreal_project", ""),
            export_target=data.get("export_target", "movie_studio"),
        )
    )


@app.route("/production/twinmotion-launch", methods=["POST"])
def production_twinmotion_launch():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Production tools are local-only."}), 403
    data = request.json or {}
    return jsonify(launch_twinmotion(open_goat_hub=bool(data.get("open_goat_hub", True))))


@app.route("/production/fcp-export", methods=["POST"])
def production_fcp_export():
    if not PRODUCTION_AVAILABLE:
        return jsonify({"ok": False, "error": "production_bridge not loaded"}), 500
    if not local_launch_allowed():
        return jsonify({"ok": False, "error": "Production tools are local-only."}), 403
    data = request.json or {}
    clips = data.get("clips") or []
    if not clips:
        return jsonify({"ok": False, "error": "clips array required"}), 400
    return jsonify(
        build_fcp_xml(
            project_name=data.get("project_name", "GOAT_Production"),
            clips=clips,
            fps=int(data.get("fps", 30)),
            resolution=data.get("resolution", "1920x1080"),
        )
    )


# =============================================================================
#  GOAT IMAGINE — image + animation (proxies Oscar :3333, Eden script, production)
# =============================================================================
GOAT_FORCE_ROOT = Path("/Volumes/LLMs/GOAT-FORCE")
EDEN_CLIP_SCRIPT = GOAT_FORCE_ROOT / "MASTER-LLM" / "tools" / "create_eden_animation_clips.py"
OSCAR_CHAT_URL = os.environ.get("OSCAR_CHAT_URL", "http://127.0.0.1:3333").rstrip("/")
IMAGINE_WEB = APP_ROOT / "web-app"


def _oscar_imagine_request(method, path, payload=None, timeout=120):
    url = f"{OSCAR_CHAT_URL}{path}"
    try:
        if method == "GET":
            r = requests.get(url, timeout=timeout)
        else:
            r = requests.post(url, json=payload or {}, timeout=timeout)
        try:
            body = r.json()
        except Exception:
            body = {"ok": False, "error": r.text[:500]}
        return body, r.status_code
    except Exception as exc:
        return {"ok": False, "error": str(exc), "oscarUrl": url}, 502


@app.route("/imagine/status")
def imagine_status():
    body, code = _oscar_imagine_request("GET", "/api/goat/image-render-bridge", timeout=8)
    curriculum = GOAT_FORCE_ROOT / "MASTER-LLM" / "training" / "GOAT-IMAGINE-MEDIA-LAB.json"
    return jsonify({
        "ok": True,
        "label": "GOAT Imagine",
        "ui": "http://127.0.0.1:8090/goat-imagine.html",
        "oscarBridge": body,
        "edenScript": str(EDEN_CLIP_SCRIPT),
        "edenScriptReady": EDEN_CLIP_SCRIPT.is_file(),
        "curriculum": str(curriculum) if curriculum.is_file() else None,
        "productionReady": PRODUCTION_AVAILABLE,
    }), 200 if body.get("ok", True) else code


@app.route("/imagine/gallery")
def imagine_gallery():
    body, code = _oscar_imagine_request("GET", "/api/goat/imagine/gallery", timeout=15)
    return jsonify(body), code


@app.route("/imagine/generate", methods=["POST"])
def imagine_generate():
    data = request.json or {}
    body, code = _oscar_imagine_request("POST", "/api/goat/imagine/generate", data, timeout=180)
    return jsonify(body), code


@app.route("/imagine/eden-rebuild", methods=["POST"])
def imagine_eden_rebuild():
    if not EDEN_CLIP_SCRIPT.is_file():
        return jsonify({"ok": False, "error": "Eden script missing", "path": str(EDEN_CLIP_SCRIPT)}), 404
    try:
        proc = subprocess.run(
            [os.environ.get("GOAT_PYTHON", "python3"), str(EDEN_CLIP_SCRIPT)],
            capture_output=True,
            text=True,
            timeout=900,
            cwd=str(EDEN_CLIP_SCRIPT.parent),
        )
        outputs = [ln.strip() for ln in (proc.stdout or "").splitlines() if ln.strip()]
        if proc.returncode != 0:
            return jsonify({
                "ok": False,
                "error": (proc.stderr or "eden build failed").strip(),
                "returncode": proc.returncode,
            }), 500
        return jsonify({"ok": True, "lane": "eden_campaign", "outputs": outputs})
    except subprocess.TimeoutExpired:
        return jsonify({"ok": False, "error": "Eden rebuild timed out"}), 504


@app.route("/imagine/photo-to-video", methods=["POST"])
def imagine_photo_to_video():
    return production_photo_to_video()


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
