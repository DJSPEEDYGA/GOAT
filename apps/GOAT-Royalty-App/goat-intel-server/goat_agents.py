"""
╔═══════════════════════════════════════════════════════════════╗
║  🤖 GOAT AUTOPILOT — Tool-Calling Agent                       ║
║                                                                ║
║  This is what makes the GOAT Royalty App the GREATEST:         ║
║  Autopilot doesn't just chat — it EXECUTES.                    ║
║                                                                ║
║  Business tools:                                               ║
║    - scrape_tiktok(url)         → real profile data           ║
║    - get_spotify_artist(id)     → live follower counts        ║
║    - search_youtube(query)      → trending tracks             ║
║    - add_fan(email,name,artist) → grow the mailing list       ║
║    - create_smart_link(slug,urls) → legal Linktree            ║
║    - generate_campaign(topic)   → email copy via Ms. Money Penny   ║
║    - lookup_itunes(artist)      → catalog data                ║
║    - get_billboard_charts()     → chart positions             ║
║    - fan_stats()                → database counts             ║
║                                                                ║
║  Self-healing / Computer Control (Ms. Money Penny first):      ║
║    - run_shell(cmd)             → safe shell execution        ║
║    - read_file(path)            → read project files          ║
║    - write_file(path,content)   → patch files (auto-backup)   ║
║    - check_servers()            → status of all GOAT servers  ║
║    - restart_intel()            → self-heal Intel server      ║
║    - open_app(app_name)         → launch Mac applications     ║
║    - open_url(url)              → open URL in Chrome          ║
║    - notify(title,message)      → Mac desktop notification    ║
║    - git_status()               → repo status & recent commits║
║                                                                ║
║  How it works:                                                 ║
║    1. User gives Autopilot a goal                             ║
║    2. Brain (Gemini/NVIDIA) plans the steps                   ║
║    3. Autopilot calls the tools in order                      ║
║    4. Returns full transcript + results                       ║
╚═══════════════════════════════════════════════════════════════╝
"""
import os, json, re, time, sqlite3, requests
import subprocess, platform, shutil, glob
from goat_brain import goat_brain, load_keys

HERE = os.path.dirname(os.path.abspath(__file__))
FAN_DB = os.path.join(HERE, "fans.db")

# ═══════════════════════════════════════════════════════════════
#  TOOL IMPLEMENTATIONS — each returns a dict {ok, data, summary}
# ═══════════════════════════════════════════════════════════════

def tool_scrape_tiktok(username):
    """Get real TikTok profile data via yt-dlp"""
    try:
        import yt_dlp
        url = f"https://www.tiktok.com/@{username.lstrip('@')}"
        with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": True, "skip_download": True, "playlistend": 10}) as ydl:
            info = ydl.extract_info(url, download=False)
        entries = info.get("entries", [])[:10]
        videos = [{"title": e.get("title", "")[:80], "views": e.get("view_count", 0), "url": e.get("url", "")} for e in entries]
        total_views = sum(v["views"] or 0 for v in videos)
        return {
            "ok": True,
            "summary": f"@{username}: {len(videos)} recent videos, {total_views:,} total views",
            "data": {"username": username, "videos": videos, "total_views": total_views}
        }
    except Exception as e:
        return {"ok": False, "summary": f"TikTok scrape failed: {e}", "data": None}


def tool_get_spotify_artist(artist_id):
    """Get real Spotify artist data (requires spotify_client_id + spotify_client_secret in local_keys.json)"""
    keys = load_keys()
    cid = keys.get("spotify_client_id")
    csec = keys.get("spotify_client_secret")
    if not cid or not csec:
        return {"ok": False, "summary": "Spotify credentials not set. Go to spotify-setup.html.", "data": None}

    # Get token
    try:
        tr = requests.post(
            "https://accounts.spotify.com/api/token",
            data={"grant_type": "client_credentials"},
            auth=(cid, csec), timeout=10
        )
        token = tr.json().get("access_token")
        if not token:
            return {"ok": False, "summary": "Could not get Spotify token", "data": None}

        r = requests.get(
            f"https://api.spotify.com/v1/artists/{artist_id}",
            headers={"Authorization": f"Bearer {token}"}, timeout=10
        )
        if r.ok:
            d = r.json()
            return {
                "ok": True,
                "summary": f"{d['name']}: {d['followers']['total']:,} followers, popularity {d['popularity']}/100",
                "data": {
                    "name": d["name"],
                    "followers": d["followers"]["total"],
                    "popularity": d["popularity"],
                    "genres": d.get("genres", [])
                }
            }
        return {"ok": False, "summary": f"Spotify API error {r.status_code}", "data": None}
    except Exception as e:
        return {"ok": False, "summary": f"Spotify lookup failed: {e}", "data": None}


def tool_search_youtube(query, limit=5):
    """Search YouTube via yt-dlp (no key needed)"""
    try:
        import yt_dlp
        with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": True, "skip_download": True, "default_search": f"ytsearch{limit}"}) as ydl:
            info = ydl.extract_info(query, download=False)
        results = [{"title": e.get("title",""), "views": e.get("view_count",0), "url": e.get("url","")} for e in info.get("entries", [])[:limit]]
        return {
            "ok": True,
            "summary": f"YouTube '{query}': {len(results)} results, top = {results[0]['title'] if results else 'none'}",
            "data": results
        }
    except Exception as e:
        return {"ok": False, "summary": f"YouTube search failed: {e}", "data": None}


def tool_lookup_itunes(artist):
    """Free iTunes Search API — no key needed"""
    try:
        r = requests.get(
            "https://itunes.apple.com/search",
            params={"term": artist, "entity": "musicArtist", "limit": 5},
            timeout=10
        )
        data = r.json()
        artists = [{"name": a.get("artistName"), "id": a.get("artistId"), "genre": a.get("primaryGenreName")} for a in data.get("results", [])]
        return {
            "ok": True,
            "summary": f"iTunes: found {len(artists)} artists matching '{artist}'",
            "data": artists
        }
    except Exception as e:
        return {"ok": False, "summary": f"iTunes lookup failed: {e}", "data": None}


def tool_add_fan(email, name="", artist="goat-force", source="autopilot"):
    """Add a fan to the local SQLite DB"""
    try:
        conn = sqlite3.connect(FAN_DB)
        c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS fans
            (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT, artist TEXT,
             source TEXT, consent INTEGER DEFAULT 1, created_at TEXT)""")
        c.execute("INSERT OR IGNORE INTO fans (email,name,artist,source,consent,created_at) VALUES (?,?,?,?,1,?)",
                  (email, name, artist, source, time.strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()
        return {"ok": True, "summary": f"Fan '{email}' added for {artist}", "data": {"email": email}}
    except Exception as e:
        return {"ok": False, "summary": f"Add fan failed: {e}", "data": None}


def tool_fan_stats():
    """Get fan DB statistics"""
    try:
        conn = sqlite3.connect(FAN_DB)
        c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS fans
            (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT, artist TEXT,
             source TEXT, consent INTEGER DEFAULT 1, created_at TEXT)""")
        c.execute("SELECT COUNT(*) FROM fans")
        total = c.fetchone()[0]
        c.execute("SELECT artist, COUNT(*) FROM fans GROUP BY artist")
        by_artist = dict(c.fetchall())
        conn.close()
        return {
            "ok": True,
            "summary": f"Fan DB: {total} total fans",
            "data": {"total": total, "by_artist": by_artist}
        }
    except Exception as e:
        return {"ok": False, "summary": f"Stats failed: {e}", "data": None}


def tool_generate_campaign(topic, artist="GOAT Force"):
    """Use Ms. Money Penny to generate email copy"""
    prompt = f"Write a 3-paragraph email campaign for {artist} about: {topic}. Include subject line, CTA button text, and P.S. Keep it sharp and authentic."
    result = goat_brain(
        [{"role": "user", "content": prompt}],
        system_prompt="You are Ms. Money Penny. Write compelling marketing copy.",
        task_type="creative"
    )
    if result.get("ok"):
        return {"ok": True, "summary": f"Campaign generated ({len(result['reply'])} chars)", "data": {"email_copy": result["reply"]}}
    return {"ok": False, "summary": f"Campaign gen failed: {result.get('error')}", "data": None}


def tool_create_smart_link(slug, spotify="", apple="", youtube="", title=""):
    """Create a smart link in the local DB"""
    try:
        conn = sqlite3.connect(FAN_DB)
        c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS smart_links
            (id INTEGER PRIMARY KEY, slug TEXT UNIQUE, title TEXT,
             spotify_url TEXT, apple_url TEXT, youtube_url TEXT,
             clicks INTEGER DEFAULT 0, created_at TEXT)""")
        c.execute("INSERT OR REPLACE INTO smart_links (slug,title,spotify_url,apple_url,youtube_url,created_at) VALUES (?,?,?,?,?,?)",
                  (slug, title, spotify, apple, youtube, time.strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()
        return {
            "ok": True,
            "summary": f"Smart link '/go/{slug}' created",
            "data": {"slug": slug, "url": f"http://localhost:8090/go.html?s={slug}"}
        }
    except Exception as e:
        return {"ok": False, "summary": f"Smart link failed: {e}", "data": None}


# ── SELF-HEALING / COMPUTER CONTROL TOOLS ──────────────────────────────────

def tool_run_shell(cmd, **_):
    """Run a safe shell command and return output. Blocks dangerous commands."""
    FORBIDDEN = ["rm -rf", "format", "shutdown", "reboot", "dd if=", "mkfs",
                 "sudo rm", "chmod 777", ":(){", "fork bomb"]
    cmd_lower = cmd.lower()
    for bad in FORBIDDEN:
        if bad in cmd_lower:
            return {"error": f"Blocked dangerous command: {bad}"}
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=30,
            cwd=os.path.expanduser("~/GOAT-Royalty-App")
        )
        return {
            "stdout": result.stdout[-3000:] if result.stdout else "",
            "stderr": result.stderr[-1000:] if result.stderr else "",
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {"error": "Command timed out after 30s"}
    except Exception as e:
        return {"error": str(e)}


def tool_read_file(path, **_):
    """Read a file from the GOAT system. Restricted to project dirs."""
    ALLOWED_ROOTS = [
        os.path.expanduser("~/GOAT-Royalty-App"),
        "/Volumes/i2i 1/Agent-007-GOAT",
        "/tmp"
    ]
    abs_path = os.path.abspath(os.path.expanduser(path))
    if not any(abs_path.startswith(r) for r in ALLOWED_ROOTS):
        return {"error": f"Access denied: {path} is outside allowed directories"}
    try:
        with open(abs_path, "r", errors="ignore") as f:
            content = f.read(8000)
        return {"content": content, "path": abs_path, "truncated": len(content) == 8000}
    except Exception as e:
        return {"error": str(e)}


def tool_write_file(path, content, **_):
    """Write/patch a file. Restricted to project dirs. Creates backup first."""
    ALLOWED_ROOTS = [
        os.path.expanduser("~/GOAT-Royalty-App"),
        "/tmp"
    ]
    abs_path = os.path.abspath(os.path.expanduser(path))
    if not any(abs_path.startswith(r) for r in ALLOWED_ROOTS):
        return {"error": f"Write denied: {path} is outside allowed directories"}
    try:
        # Backup first
        if os.path.exists(abs_path):
            backup = abs_path + ".bak"
            shutil.copy2(abs_path, backup)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w") as f:
            f.write(content)
        return {"ok": True, "path": abs_path, "bytes_written": len(content)}
    except Exception as e:
        return {"error": str(e)}


def tool_check_servers(**_):
    """Check status of all GOAT servers — Intel, web server, Ollama."""
    import urllib.request
    results = {}
    checks = {
        "intel_server": "http://127.0.0.1:5500/health",
        "web_server":   "http://127.0.0.1:8090",
        "ollama":       "http://127.0.0.1:11434/api/tags",
        "oscar":        "http://127.0.0.1:3333",
        "agent007":     "http://127.0.0.1:3335",
    }
    for name, url in checks.items():
        try:
            urllib.request.urlopen(url, timeout=3)
            results[name] = "✅ online"
        except Exception as e:
            results[name] = f"❌ offline ({str(e)[:50]})"
    return results


def tool_restart_intel_server(**_):
    """Self-heal: restart the Intel server if it's down."""
    server_script = os.path.expanduser("~/GOAT-Royalty-App/goat-intel-server/goat_intel.py")
    if not os.path.exists(server_script):
        return {"error": "Intel server script not found"}
    # Kill existing
    subprocess.run("lsof -ti :5500 | xargs kill -9", shell=True, capture_output=True)
    time.sleep(1)
    # Restart
    env = os.environ.copy()
    env["OLLAMA_MODELS"] = "/Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data"
    proc = subprocess.Popen(
        ["python3", server_script],
        cwd=os.path.dirname(server_script),
        env=env,
        stdout=open("/tmp/goat-intel-restart.log", "w"),
        stderr=subprocess.STDOUT
    )
    time.sleep(3)
    return {"ok": True, "pid": proc.pid, "message": "Intel server restarted"}


def tool_open_app(app_name, **_):
    """Open a Mac application by name."""
    ALLOWED_APPS = [
        "Google Chrome", "Safari", "Terminal", "Finder",
        "Pro Tools", "Logic Pro", "GarageBand", "FL Studio",
        "Ableton Live", "Activity Monitor", "System Preferences",
        "System Settings", "Notes", "TextEdit"
    ]
    if app_name not in ALLOWED_APPS:
        return {"error": f"App '{app_name}' not in allowed list. Allowed: {ALLOWED_APPS}"}
    try:
        subprocess.Popen(["open", "-a", app_name])
        return {"ok": True, "opened": app_name}
    except Exception as e:
        return {"error": str(e)}


def tool_open_url(url, **_):
    """Open a URL in Chrome."""
    if not url.startswith(("http://", "https://", "file://")):
        return {"error": "Invalid URL — must start with http/https/file"}
    try:
        subprocess.Popen(["open", "-a", "Google Chrome", url])
        return {"ok": True, "url": url}
    except Exception as e:
        return {"error": str(e)}


def tool_system_notify(title, message, **_):
    """Send a Mac desktop notification."""
    try:
        script = f'display notification "{message}" with title "{title}"'
        subprocess.run(["osascript", "-e", script], capture_output=True, timeout=5)
        return {"ok": True, "notified": True}
    except Exception as e:
        return {"error": str(e)}


def tool_git_status(**_):
    """Get git status of the GOAT Royalty App repo."""
    repo = os.path.expanduser("~/GOAT-Royalty-App")
    result = subprocess.run(
        ["git", "status", "--short"],
        capture_output=True, text=True, cwd=repo, timeout=10
    )
    log = subprocess.run(
        ["git", "log", "--oneline", "-5"],
        capture_output=True, text=True, cwd=repo, timeout=10
    )
    return {
        "status": result.stdout or "Clean",
        "recent_commits": log.stdout,
        "repo": repo
    }


# ═══════════════════════════════════════════════════════════════
#  TOOL REGISTRY
# ═══════════════════════════════════════════════════════════════
TOOLS = {
    "scrape_tiktok":      {"fn": tool_scrape_tiktok,      "args": ["username"],              "desc": "Scrape TikTok profile data (followers, videos, views)"},
    "get_spotify_artist": {"fn": tool_get_spotify_artist, "args": ["artist_id"],             "desc": "Get real Spotify artist data (requires keys)"},
    "search_youtube":     {"fn": tool_search_youtube,     "args": ["query"],                 "desc": "Search YouTube for tracks, no API key needed"},
    "lookup_itunes":      {"fn": tool_lookup_itunes,      "args": ["artist"],                "desc": "Free iTunes catalog lookup"},
    "add_fan":            {"fn": tool_add_fan,            "args": ["email","name","artist"], "desc": "Add a fan to the database"},
    "fan_stats":          {"fn": tool_fan_stats,          "args": [],                        "desc": "Get fan DB stats"},
    "generate_campaign":  {"fn": tool_generate_campaign,  "args": ["topic","artist"],        "desc": "Generate email marketing copy"},
    "create_smart_link":  {"fn": tool_create_smart_link,  "args": ["slug","spotify","apple","youtube","title"], "desc": "Create a shareable smart link"},
    # ── Self-healing / Computer Control (Ms. Money Penny) ──────────────────
    "run_shell":          {"fn": tool_run_shell,           "args": ["cmd"],                                     "desc": "Run a safe shell command on this Mac"},
    "read_file":          {"fn": tool_read_file,           "args": ["path"],                                    "desc": "Read a file from the GOAT project"},
    "write_file":         {"fn": tool_write_file,          "args": ["path", "content"],                         "desc": "Write/patch a file in the GOAT project (auto-backup)"},
    "check_servers":      {"fn": tool_check_servers,       "args": [],                                          "desc": "Check status of all GOAT servers"},
    "restart_intel":      {"fn": tool_restart_intel_server,"args": [],                                          "desc": "Self-heal: restart the Intel server"},
    "open_app":           {"fn": tool_open_app,            "args": ["app_name"],                                "desc": "Open a Mac application"},
    "open_url":           {"fn": tool_open_url,            "args": ["url"],                                     "desc": "Open a URL in Chrome"},
    "notify":             {"fn": tool_system_notify,       "args": ["title", "message"],                        "desc": "Send a Mac desktop notification"},
    "git_status":         {"fn": tool_git_status,          "args": [],                                          "desc": "Get git status of the GOAT Royalty App repo"},
}


def tools_description():
    """Human + LLM readable tool catalog"""
    lines = []
    for name, t in TOOLS.items():
        args = ", ".join(t["args"]) if t["args"] else "no args"
        lines.append(f"  • {name}({args}) — {t['desc']}")
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════
#  🤖 AUTOPILOT — the tool-using agent
# ═══════════════════════════════════════════════════════════════
AUTOPILOT_SYSTEM = f"""You are Autopilot — the autonomous agent of GOAT Force Records.
You have access to real tools that DO things. Don't just talk — use them.

AVAILABLE TOOLS:
{tools_description()}

WHEN THE USER GIVES YOU A GOAL:
1. Think about which tools solve it.
2. Output a numbered PLAN first (plain text, numbered steps).
3. Then for each step you want to execute, output a line in this EXACT format:
   TOOL: tool_name(arg1="value1", arg2="value2")
4. Use ONE tool call per line. You can request multiple tool calls.
5. After I run the tools and send results back, analyze and give a FINAL SUMMARY.

IMPORTANT:
- Only use tools from the list above.
- Use exact argument names.
- Quote all string values.
- If a tool fails, adapt the plan.
"""


def run_autopilot(goal, max_steps=5):
    """
    Run Autopilot end-to-end on a goal.
    Returns full transcript including plan, tool calls, results, and final summary.
    """
    transcript = []
    history = []

    # Step 1: Ask brain for plan + first tool calls
    user_msg = f"GOAL: {goal}\n\nGive me a plan, then your first tool calls."
    history.append({"role": "user", "content": user_msg})
    brain_reply = goat_brain(history, system_prompt=AUTOPILOT_SYSTEM, task_type="reason")

    if not brain_reply.get("ok"):
        return {"ok": False, "error": brain_reply.get("error"), "transcript": transcript}

    plan_text = brain_reply["reply"]
    engine = brain_reply.get("engine", "unknown")
    transcript.append({"type": "plan", "engine": engine, "text": plan_text})
    history.append({"role": "assistant", "content": plan_text})

    # Step 2: Extract and run tool calls
    step = 0
    while step < max_steps:
        step += 1
        tool_calls = extract_tool_calls(plan_text)
        if not tool_calls:
            # No more tools to run → done
            break

        results = []
        for tc in tool_calls:
            name, kwargs = tc["name"], tc["kwargs"]
            tool = TOOLS.get(name)
            if not tool:
                results.append({"tool": name, "ok": False, "summary": f"Unknown tool: {name}"})
                continue
            try:
                result = tool["fn"](**kwargs)
                results.append({"tool": name, "kwargs": kwargs, **result})
            except Exception as e:
                results.append({"tool": name, "ok": False, "summary": f"Execution error: {e}"})

        transcript.append({"type": "tool_results", "step": step, "results": results})

        # Feed results back to brain for next action / summary
        results_text = "\n".join([
            f"• {r['tool']}: {'✅' if r.get('ok') else '❌'} {r.get('summary','')}"
            for r in results
        ])
        next_msg = f"TOOL RESULTS:\n{results_text}\n\nDo you need more tool calls? If not, give your FINAL SUMMARY for the user."
        history.append({"role": "user", "content": next_msg})

        next_reply = goat_brain(history, system_prompt=AUTOPILOT_SYSTEM, task_type="reason")
        if not next_reply.get("ok"):
            break

        plan_text = next_reply["reply"]
        history.append({"role": "assistant", "content": plan_text})
        transcript.append({"type": "thinking", "step": step, "text": plan_text})

        # Check if this is the final summary (no more TOOL: lines)
        if not extract_tool_calls(plan_text):
            transcript.append({"type": "final", "text": plan_text})
            break

    return {"ok": True, "goal": goal, "engine_used": engine, "transcript": transcript, "steps_taken": step}


def extract_tool_calls(text):
    """Parse TOOL: name(arg="val", arg2="val2") lines from LLM output"""
    calls = []
    pattern = re.compile(r'TOOL:\s*(\w+)\s*\(([^)]*)\)', re.IGNORECASE)
    for match in pattern.finditer(text):
        name = match.group(1)
        arg_str = match.group(2)
        kwargs = {}
        # Parse "key=value" pairs, handling quoted strings
        for arg_match in re.finditer(r'(\w+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^,\s]+))', arg_str):
            k = arg_match.group(1)
            v = arg_match.group(2) or arg_match.group(3) or arg_match.group(4)
            kwargs[k] = v
        calls.append({"name": name, "kwargs": kwargs})
    return calls


if __name__ == "__main__":
    print("🤖 GOAT Autopilot — test run")
    print(f"\nAvailable tools:\n{tools_description()}\n")
    print("="*60)
    result = run_autopilot("Look up DJ Speedy on iTunes and give me a summary.")
    print(json.dumps(result, indent=2)[:3000])