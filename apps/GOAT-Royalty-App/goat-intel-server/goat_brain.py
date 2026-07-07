"""
╔═══════════════════════════════════════════════════════════════╗
║  🧠 GOAT AI BRAIN — Unified Router                             ║
║  Owner: DJ Speedy + Waka Flocka                                ║
║                                                                ║
║  Routes AI requests to the CHEAPEST + FASTEST available engine ║
║  in this priority order:                                       ║
║                                                                ║
║    1. OLLAMA (local Gemma 3 / Qwen) — FREE + PRIVATE           ║
║    2. NVIDIA Build NIM            — FREE tier, cloud GPUs      ║
║    3. Gemini 2.5 Flash            — FREE tier, fast            ║
║    4. Gemini 3 Pro Preview        — paid, heavy reasoning      ║
║                                                                ║
║  OpenAI is REMOVED. Your local Gemma is your own GPT.          ║
╚═══════════════════════════════════════════════════════════════╝
"""
import os, json, time, requests

HERE = os.path.dirname(os.path.abspath(__file__))
KEYS_FILE = os.path.join(HERE, "local_keys.json")

# Ollama local endpoint (user runs `ollama serve` + `ollama pull gemma3:4b`)
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")

# NVIDIA Build NIM (free tier, key from goat-app/.env)
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

# Gemini model tiers
GEMINI_FAST = "gemini-2.5-flash"      # quick chat, marketing copy, low latency
GEMINI_SMART = "gemini-2.5-pro"       # complex reasoning, contracts, analysis
GEMINI_GENIUS = "gemini-3-pro-preview"  # deepest reasoning (when available)


def load_keys():
    try:
        with open(KEYS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def load_nvidia_key():
    """Pull NVIDIA key from goat-app/.env if set"""
    env_path = os.path.join(os.path.dirname(HERE), "goat-app", ".env")
    try:
        with open(env_path) as f:
            for line in f:
                if line.startswith("NVIDIA_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    except Exception:
        pass
    return None


# ============================================================
#  ENGINE 1: OLLAMA (LOCAL)
# ============================================================
def call_ollama(messages, system_prompt, model=None):
    """Call local Ollama server — auto-picks best available model from drive."""
    # Power model first — DJ Speedy has llama3.1:70b + all big models on drive
    preferred = [
        "llama3.1:70b", "llama3.3:70b", "qwen3:32b", "qwen2.5:32b",
        "deepseek-r1:32b", "qwen3:14b", "qwen2.5:14b", "llama3.1:8b",
        "qwen3:8b", "qwen2.5:7b", "mistral:7b", "llama3.2:3b"
    ]
    try:
        ping = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        if not ping.ok:
            return None, "ollama_unavailable"
        if model is None:
            available = [m["name"] for m in ping.json().get("models", [])]
            for p in preferred:
                if p in available:
                    model = p
                    break
            if not model and available:
                model = available[0]
    except Exception:
        return None, "ollama_unavailable"

    if not model:
        model = "llama3.1:8b"

    msgs = []
    if system_prompt:
        msgs.append({"role": "system", "content": system_prompt})
    msgs += messages

    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json={"model": model, "messages": msgs, "stream": False,
                  "think": False, "options": {"temperature": 0.8, "num_predict": 2048, "num_ctx": 4096}},
            timeout=180,
        )
        if r.ok:
            text = r.json().get("message", {}).get("content", "")
            if not text:
                text = r.json().get("message", {}).get("thinking", "")
            return (text.strip() or None), (None if text.strip() else "empty_response")
        return None, f"ollama_err_{r.status_code}"
    except Exception as e:
        return None, f"ollama_exc_{e}"


# ============================================================
#  ENGINE 2: NVIDIA BUILD NIM
# ============================================================
def call_nvidia(messages, system_prompt, model="meta/llama-3.3-70b-instruct"):
    key = load_nvidia_key()
    if not key or key.startswith("your-") or key == "":
        return None, "nvidia_no_key"

    msgs = []
    if system_prompt:
        msgs.append({"role": "system", "content": system_prompt})
    msgs += messages

    try:
        r = requests.post(
            NVIDIA_URL,
            json={"model": model, "messages": msgs, "temperature": 0.8, "max_tokens": 2048},
            headers={"Authorization": f"Bearer {key}", "Accept": "application/json"},
            timeout=30,
        )
        if r.ok:
            return r.json()["choices"][0]["message"]["content"], None
        return None, f"nvidia_err_{r.status_code}"
    except Exception as e:
        return None, f"nvidia_exc_{e}"


# ============================================================
#  ENGINE 3: GEMINI
# ============================================================
def call_gemini(messages, system_prompt, model=GEMINI_FAST):
    keys = load_keys()
    api_key = keys.get("gemini_key", "")
    if not api_key:
        return None, "gemini_no_key"

    contents = []
    if system_prompt:
        contents.append({"role": "user", "parts": [{"text": f"[SYSTEM]: {system_prompt}"}]})
        contents.append({"role": "model", "parts": [{"text": "Understood. Ready."}]})

    for m in messages:
        role = "user" if m.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    try:
        r = requests.post(
            url,
            json={
                "contents": contents,
                "generationConfig": {"temperature": 0.85, "maxOutputTokens": 2048, "topP": 0.95},
            },
            timeout=30,
        )
        if r.ok:
            data = r.json()
            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            if text:
                return text, None
            return None, f"gemini_empty_{json.dumps(data)[:150]}"
        return None, f"gemini_err_{r.status_code}_{r.text[:120]}"
    except Exception as e:
        return None, f"gemini_exc_{e}"


# ============================================================
#  🧠 THE BRAIN: intelligent routing
# ============================================================
def goat_brain(messages, system_prompt="", task_type="chat"):
    """
    Unified AI call. task_type hints at which engine tier to prefer.
      - "chat"     → local Ollama → NVIDIA → Gemini Flash
      - "creative" → Gemini Flash (best for marketing copy)
      - "reason"   → Gemini Pro (best for contracts, analysis)
      - "code"     → NVIDIA Llama → Gemini Pro
      - "private"  → Ollama only (never leaves your machine)
    """
    errors = []

    # ── STEP 1: Always try Ollama first (local, no API key, 56 models on drive) ──
    if task_type != "private":
        text, err = call_ollama(messages, system_prompt)
        if text:
            return {"ok": True, "reply": text, "engine": "Ollama/Local"}
        errors.append(f"ollama:{err}")

    if task_type == "private":
        text, err = call_ollama(messages, system_prompt)
        if text:
            return {"ok": True, "reply": text, "engine": "Ollama (local, private)"}
        return {"ok": False, "error": f"Local Ollama not running. ({err})"}

    # ── STEP 2: NVIDIA cloud (if key set) ──
    text, err = call_nvidia(messages, system_prompt)
    if text:
        return {"ok": True, "reply": text, "engine": "NVIDIA Llama"}
    errors.append(f"nvidia:{err}")

    # ── STEP 3: Gemini fallback (if key set) ──
    gemini_model = GEMINI_SMART if task_type in ("reason", "code") else GEMINI_FAST
    text, err = call_gemini(messages, system_prompt, model=gemini_model)
    if text:
        return {"ok": True, "reply": text, "engine": f"Gemini ({gemini_model})"}
    errors.append(f"gemini:{err}")

    return {"ok": False, "error": " | ".join(errors)}


def brain_status():
    """Check which engines are online"""
    status = {}

    # Ollama
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        status["ollama"] = {
            "online": r.ok,
            "models": [m["name"] for m in r.json().get("models", [])] if r.ok else [],
        }
    except Exception:
        status["ollama"] = {"online": False, "hint": "Install from ollama.com, then: ollama serve && ollama pull gemma3:4b"}

    # NVIDIA
    key = load_nvidia_key()
    status["nvidia"] = {"online": bool(key), "hint": "Key set in goat-app/.env" if key else "Get free key at build.nvidia.com"}

    # Gemini
    keys = load_keys()
    status["gemini"] = {
        "online": bool(keys.get("gemini_key")),
        "model": keys.get("gemini_model", GEMINI_FAST),
        "hint": "Key set" if keys.get("gemini_key") else "Get at aistudio.google.com/apikey",
    }

    return status


if __name__ == "__main__":
    print("🧠 GOAT AI BRAIN — status check")
    print(json.dumps(brain_status(), indent=2))
    print("\n🧪 Test chat:")
    result = goat_brain(
        [{"role": "user", "content": "One line: hype DJ Speedy + Waka Flocka."}],
        system_prompt="You are Ms. Money Penny, GOAT Force Records' marketing AI.",
    )
    print(json.dumps(result, indent=2))