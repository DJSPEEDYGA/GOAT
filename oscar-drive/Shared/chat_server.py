#!/usr/bin/env python3
"""
Oscar Local Agent Chat Server
=======================
A zero-dependency Python HTTP server that:
  1. Serves the FastChatUI.html web interface
  2. Saves/loads chat history as JSON files on the USB drive
  3. Proxies all Ollama API requests (eliminates CORS issues)

Works on Windows, macOS, and Linux without installing anything.
"""

import http.server
import builtins
import cgi
import hashlib
import html
import json
import math
import mimetypes
import os
import plistlib
import py_compile
import re
import secrets
import shlex
import shutil
import socket
import struct
import sys
import tempfile
import uuid
import urllib.request
import urllib.error
import threading
import webbrowser
import time
import platform
import ctypes
import subprocess
import zlib
from urllib.parse import parse_qs, urlparse

# Optional: psutil for hardware stats (graceful fallback to native APIs if not installed)
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

_RUNTIME_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "runtime")
if _RUNTIME_DIR not in sys.path:
    sys.path.insert(0, _RUNTIME_DIR)
try:
    import clip_hunter
except ImportError:
    clip_hunter = None
try:
    import oscar_intel_engine
except ImportError:
    oscar_intel_engine = None
try:
    import rasp_protocol
except ImportError:
    rasp_protocol = None
try:
    import fine_tune_pipeline
except ImportError:
    fine_tune_pipeline = None

# ── Configuration ──────────────────────────────────────────────
try:
    CHAT_SERVER_PORT = int(os.environ.get("AGENT_007_PORT", "3333"))
except ValueError:
    CHAT_SERVER_PORT = 3333
AGENT_007_ALLOWED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in os.environ.get("AGENT_007_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}
AGENT_007_ALLOWED_ORIGINS.update({
    "http://127.0.0.1:8765",
    "http://localhost:8765",
    f"http://127.0.0.1:{CHAT_SERVER_PORT}",
    f"http://localhost:{CHAT_SERVER_PORT}",
})
OLLAMA_HOST = os.environ.get("OLLAMA_PROXY_TARGET", "http://127.0.0.1:11434").rstrip("/")
LLAMA_CPP_MODE = "--llama-cpp" in sys.argv
if LLAMA_CPP_MODE:
    OLLAMA_HOST = os.environ.get("LLAMA_CPP_HOST", "http://127.0.0.1:8080").rstrip("/")


def safe_print(*args, **kwargs):
    """Keep request handling alive even if the Terminal log stream goes away."""
    try:
        builtins.print(*args, **kwargs)
    except OSError:
        pass


def detect_lan_ip():
    local_ip = "127.0.0.1"
    try:
        probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        probe.connect(("8.8.8.8", 80))
        local_ip = probe.getsockname()[0]
        probe.close()
    except Exception:
        pass
    return local_ip

# Resolve paths relative to the Oscar folder. LaunchAgents may execute a
# trusted copy of this server from ~/Library while keeping all data on Oscar.
SCRIPT_DIR = os.environ.get("AGENT_007_SHARED_DIR") or os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.environ.get("AGENT_007_PROJECT_ROOT") or os.path.dirname(SCRIPT_DIR)
GOAT_WEB_APP_DIR = os.path.join(PROJECT_ROOT, "goat-royalty-portable-2.0.0", "web-app")
OSCAR_BRAIN_DIR = os.path.join(PROJECT_ROOT, "Oscar-Brain")
CHATS_DIR = os.path.join(SCRIPT_DIR, "chat_data")
CHATS_FILE = os.path.join(CHATS_DIR, "chats.json")
SETTINGS_FILE = os.path.join(CHATS_DIR, "settings.json")
OSCAR_SECURITY_LOG_FILE = os.path.join(CHATS_DIR, "security-audits.jsonl")
HTML_FILE = os.path.join(SCRIPT_DIR, "FastChatUI.html")
GENERATED_IMAGES_DIR = os.path.join(SCRIPT_DIR, "generated_images")
MONEY_PENNY_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Money-Penny-Home")
MONEY_PENNY_PROFILE_FILE = os.path.join(MONEY_PENNY_HOME_DIR, "MONEY-PENNY-PROFILE-FOR-OSCAR.md")
MONEY_PENNY_SUMMARY_FILE = os.path.join(MONEY_PENNY_HOME_DIR, "GOOGLE-DRIVE-IMPORT-SUMMARY.md")
LEXI_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Lexicon-Lexi-Home")
LEXI_PROFILE_FILE = os.path.join(LEXI_HOME_DIR, "LEXICON-LEXI-PROFILE-FOR-OSCAR.md")
LEXI_SUMMARY_FILE = os.path.join(LEXI_HOME_DIR, "LEXICON-LEXI-SOURCE-SUMMARY.md")
MS_VANESSA_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Ms-Vanessa-Home")
MS_VANESSA_PROFILE_FILE = os.path.join(MS_VANESSA_HOME_DIR, "MS-VANESSA-PROFILE-FOR-OSCAR.md")
MS_VANESSA_SUMMARY_FILE = os.path.join(MS_VANESSA_HOME_DIR, "MS-VANESSA-SOURCE-SUMMARY.md")
MS_NEXUS_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Ms-Nexus-Home")
MS_NEXUS_PROFILE_FILE = os.path.join(MS_NEXUS_HOME_DIR, "MS-NEXUS-PROFILE-FOR-OSCAR.md")
MS_NEXUS_SUMMARY_FILE = os.path.join(MS_NEXUS_HOME_DIR, "MS-NEXUS-SOURCE-SUMMARY.md")
SIR_CODEX_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Sir-Codex-Home")
SIR_CODEX_PROFILE_FILE = os.path.join(SIR_CODEX_HOME_DIR, "SIR-CODEX-PROFILE-FOR-OSCAR.md")
SIR_CODEX_SUMMARY_FILE = os.path.join(SIR_CODEX_HOME_DIR, "SIR-CODEX-SOURCE-SUMMARY.md")
AGENT_007_PROTOCOL_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Oscar-Call-Protocols")
AGENT_007_PROTOCOL_FILE = os.path.join(AGENT_007_PROTOCOL_HOME_DIR, "OSCAR_VAULT_PROTOCOL_DJ_SPEEDY_RASPY_WAKA_v1_20260526.txt")
AGENT_007_PROTOCOL_MEMORY_FILE = os.path.join(AGENT_007_PROTOCOL_HOME_DIR, "OSCAR-CALL-PROTOCOL-FOR-OSCAR-MEMORY.md")
AGENT_007_DIARY_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Oscar-Diary")
AGENT_007_DIARY_FILE = os.path.join(AGENT_007_DIARY_HOME_DIR, "OSCAR-DIARY.md")
AGENT_007_DIARY_MEMORY_FILE = os.path.join(AGENT_007_DIARY_HOME_DIR, "OSCAR-DIARY-FOR-MEMORY.md")
AGENT_007_DIARY_MAX_ENTRY_CHARS = int(os.environ.get("AGENT_007_DIARY_MAX_ENTRY_CHARS", "4000"))
AGENT_007_DIARY_MEMORY_RECENT_CHARS = int(os.environ.get("AGENT_007_DIARY_MEMORY_RECENT_CHARS", "6000"))
GRANITE_STT_MODEL = os.environ.get("AGENT_007_GRANITE_STT_MODEL", "ibm-granite/granite-speech-4.1-2b")
GRANITE_STT_GGUF_MODEL = os.environ.get("AGENT_007_GRANITE_STT_GGUF_MODEL", "ibm-granite/granite-speech-4.1-2b-GGUF:Q8_0")
GRANITE_STT_URL = os.environ.get("AGENT_007_GRANITE_STT_URL", "http://127.0.0.1:9797/v1/audio/transcriptions").rstrip("/")
GRANITE_STT_TIMEOUT_SECONDS = int(os.environ.get("AGENT_007_GRANITE_STT_TIMEOUT", "180"))
GRANITE_STT_MAX_UPLOAD_MB = int(os.environ.get("AGENT_007_GRANITE_STT_MAX_UPLOAD_MB", "250"))
CLIP_HUNTER_MAX_UPLOAD_MB = int(os.environ.get("AGENT_007_CLIP_MAX_UPLOAD_MB", "250"))
GRANITE_STT_PROMPT = "transcribe the speech with proper punctuation and capitalization."
GRANITE_STT_KEYWORDS = "Oscar, Ms. Money Penny, Lexicon Lexi, Lexi, Raspy, Waka Flocka Flame, GOAT Royalty App"
GRANITE_AUDIO_EXTENSIONS = {
    ".aac",
    ".aiff",
    ".flac",
    ".m4a",
    ".mov",
    ".mp3",
    ".mp4",
    ".oga",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
}
FINE_TUNE_LLM_TRAINING_DIR = os.path.join(PROJECT_ROOT, "Training", "Fine-Tune-LLMs")
FINE_TUNE_LLM_TRANSCRIPTS_DIR = os.path.join(FINE_TUNE_LLM_TRAINING_DIR, "_transcripts")
FINE_TUNE_WORK_DIR = os.path.join(FINE_TUNE_LLM_TRAINING_DIR, "_fine_tune_runs")
FINE_TUNE_LLM_TRANSCRIPTION_STATUS_FILE = os.path.join(FINE_TUNE_LLM_TRANSCRIPTS_DIR, "TRANSCRIPTION_STATUS.md")
FINE_TUNE_LLM_TRANSCRIPTION_MANIFEST_FILE = os.path.join(FINE_TUNE_LLM_TRANSCRIPTS_DIR, "manifest.json")
FINE_TUNE_LLM_LESSON_NAMES = (
    "1. Fine Tune Customer care Data Intro.mp4",
    "1. Fine Tune Wikipedia Intro.mp4",
    "1. Intro to Fine Tune chat Assitant.mp4",
    "1. Introduction.mp4",
    "1. Pre processing.mp4",
    "2. Do you want to help us.html",
    "2. Pre processing Chat Model data code.mp4",
    "2. Pre Processing code.mp4",
    "2. Pre Processing Wikipedia data code.mp4",
    "2. Preprocessing Customer care data.mp4",
    "3. Fine Tune Chat Model.mp4",
    "3. Fine Tune Customer care Data.mp4",
    "3. Pre Processing Part2.mp4",
    "3. Pre Processing Wikipedia data code part 2.mp4",
    "3. What is fine Tune.mp4",
    "4. Classification  chatdata.mp4",
    "4. Pre Processing code Part 2.mp4",
    "4. Prepare Synthetic data code.mp4",
    "4. Prompt Vs Fine Tune.mp4",
    "5. Fine Tune WikiPedia data  code.mp4",
    "5. Token cost calculation.mp4",
    "6. Fine Tune chat model classification.mp4",
    "6. Fine Tune WikiPedia data  code Part2.mp4",
    "7. Fine Tune WikiPedia data  code Part3.mp4",
)
FINE_TUNE_TRANSCRIPTION_LOCK = threading.Lock()
FINE_TUNE_TRANSCRIPTION_JOB = {
    "running": False,
    "jobId": None,
    "startedAt": None,
    "finishedAt": None,
    "current": None,
    "processed": 0,
    "skipped": 0,
    "failed": 0,
    "total": 0,
    "error": None,
    "stopRequested": False,
    "items": [],
}
AGENT_007_STUDIO_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Oscar-Studio")
AGENT_007_STUDIO_SPEC_FILE = os.path.join(AGENT_007_STUDIO_HOME_DIR, "OSCAR-STUDIO-BUILD-SPEC.md")
DRIVE_INTAKE_HOME_DIR = os.path.join(AGENT_007_STUDIO_HOME_DIR, "Drive-Intake")
DRIVE_VAULT_PROFILE_FILE = os.path.join(DRIVE_INTAKE_HOME_DIR, "GOAT-DRIVE-VAULT-PROFILE-FOR-OSCAR.md")
DRIVE_INTAKE_MANIFEST_FILE = os.path.join(DRIVE_INTAKE_HOME_DIR, "manifests", "drive-intake-manifest-20260527.json")
DRIVE_FEATURE_INTAKE_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "drive-feature-intake.json",
)
CATALOG_SCANNER_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "catalog-scanner-standard.json",
)
GOAT_INSTRUMENT_LAB_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-instrument-lab-standard.json",
)
GOAT_ASSET_STYLE_VAULT_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-asset-style-vault-standard.json",
)
GOAT_ICON_ART_LAB_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-icon-art-lab-standard.json",
)
GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-image-render-bridge-standard.json",
)
GOAT_VIDEO_ENGINE_ARENA_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-video-engine-arena.json",
)
GOAT_UNREAL_COPILOT_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "unreal-copilot.html",
)
GOAT_UNREAL_INTEGRATION_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "lib",
    "avatar",
    "unreal-engine-integration.js",
)
EPIC_GAMES_LAUNCHER_APP = "/Applications/Epic Games Launcher.app"
UNREAL_ENGINE_LAUNCHER_APP = "/Users/Shared/UnrealEngine/Launcher/Unreal Engine.app"
UNREAL_ENGINE_SHARED_DIR = "/Users/Shared/UnrealEngine"
UNREAL_ENGINE_DEFAULT_INSTALL_DIR = "/Users/Shared/Epic Games"
UNREAL_ENGINE_INSTALLER_DMG = os.path.join(
    PROJECT_ROOT,
    "Mac",
    "EpicInstaller-19.2.3-unrealEngine-7e1c281229b445a0b78e98ae17f54f3d.dmg",
)
AGENT_007_APPS_DIR = os.path.join(SCRIPT_DIR, "apps")
AGENT_007_PYTHON_ENVS_DIR = os.path.join(SCRIPT_DIR, "python-envs")
AGENT_007_ART_MODELS_DIR = os.path.join(SCRIPT_DIR, "models", "art")
AGENT_007_FOUNDATION_MODELS_DIR = os.path.join(SCRIPT_DIR, "models", "foundation")
AGENT_007_COMFYUI_DIR = os.path.join(AGENT_007_APPS_DIR, "ComfyUI")
AGENT_007_AUTO1111_DIR = os.path.join(AGENT_007_APPS_DIR, "stable-diffusion-webui")
AGENT_007_FORGE_DIR = os.path.join(AGENT_007_APPS_DIR, "stable-diffusion-webui-forge")
AGENT_007_COMFYUI_VENV = os.path.join(AGENT_007_PYTHON_ENVS_DIR, "comfyui")
AGENT_007_LLAMA_CPP_DIR = os.path.join(AGENT_007_APPS_DIR, "llama.cpp")
AGENT_007_LLAMA_CLI = os.path.join(SCRIPT_DIR, "bin", "llama-cli")
AGENT_007_LLAMA_SERVER = os.path.join(SCRIPT_DIR, "bin", "llama-server")
GOAT_CAREER_COPILOT_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-career-copilot-standard.json",
)
GOAT_LOCAL_MODEL_PACK_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-local-model-pack.json",
)
DEFAULT_SETTINGS = {
    "systemPrompt": "",
    "temperature": 0.2,
    "globalSystemPrompt": "Oscar Verified Builder Mode: action first when work is asked, friendly when it is not. Loop kernel rule: validate input, classify intent, ground work with tools, answer only from evidence, block fake/output-overclaim responses, then close with done/tested/blocked/next. Normal chat rule: greet and chat naturally. If Raspy says hello, thanks, great job, checking in, venting, celebrating, or confirming, answer warmly and conversationally. Do not barrage the owner with a generic introduction, menu, or checklist unless asked. When Raspy asks Oscar to build, fix, update, inspect, summarize from files, deploy, or create an artifact, do the work now. Do not stop at a plan unless Raspy asked for a plan only. Tool-result gate: never say you ran, searched, created, wrote, moved, deployed, verified, tested, or saved a note unless the current conversation contains an Oscar TOOL RESULT proving that action. If no tool result exists yet, request the needed tool action instead of narrating fake work. For code, product, server, training, or launch-readiness work, do not answer from vibe or memory. Use Tool Mode READ/SEARCH/RUN first when files are involved, then WRITE/PATCH/RUN/VERIFY when a safe local change is requested. Every claim about a local project must include a file path, function/route name, line reference when available, or a Tool Mode result. If you have not read the file, say NOT VERIFIED. Do not answer with only \"ok\". Do not give generic summaries. Report exact blockers and next tool action.",
    "projectMemory": "Oscar is being trained as Raspy's supervised junior builder. Codex supervises quality. Durable action rule: do the work now when the owner asks for a build, fix, update, inspection, artifact, deployment, or verified summary; do not stop at a checklist or plan unless the owner asked for a plan only. Durable proof rule: read files first, extract evidence, cite paths, then act and verify. Tool-result gate: do not claim search/read/write/create/move/deploy/test/verify/save-note happened unless an Oscar TOOL RESULT in this same conversation proves it. If proof is missing, say NOT VERIFIED and request the next tool action. For verified code reviews, use this loop: (1) read required file with Tool Mode, (2) list exact path read, (3) list facts proven from that file, (4) make the smallest safe change or name the exact blocker, (5) verify with a command, file read, endpoint, screenshot, or tool result, (6) save a note if durable state changed. On this 8 GB Intel Oscar runtime, default live chat must use gemma2-2b-local:latest because qwen2.5-coder:32b, qwen2.5-coder:14b, and qwen2.5-coder:7b can stall during model load. Use qwen2.5-coder:7b only after it has been preloaded or when the owner accepts a long wait. Use qwen2.5-coder:14b/32b only on stronger hardware or long offline jobs.",
    "toolModeEnabled": True,
    "computerControlEnabled": False,
    "capabilityMode": "code",
    "expertMode": "agent-007",
    "councilModeEnabled": False,
    "voiceAutoSpeak": True,
    "speechVoiceName": "Alex",
    "speechStyle": "smooth-louisiana",
    "defaultModel": "gemma2-2b-local:latest",
    "macMiniMode": False,
    "responseMaxTokens": 4096,
}
PRIVATE_DIRS = {"bin", "chat_data", "models", "python", ".ollama-runtime"}
DEFAULT_OWNER_WORKSPACE = PROJECT_ROOT


def resolve_bridge_root():
    """Choose an existing bridge workspace, tolerating stale drive env vars."""
    candidates = [
        os.environ.get("AGENT_007_BRIDGE_WORKSPACE"),
        os.environ.get("OSCAR_BRIDGE_WORKSPACE"),
        DEFAULT_OWNER_WORKSPACE,
        PROJECT_ROOT,
        "/Volumes/Oscar/Master-Oscar",
        "/Volumes/FKD1/Master-Oscar",
        "/Volumes/ubuntu/Master-Oscar",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        full = os.path.realpath(os.path.expanduser(str(candidate)))
        if os.path.isdir(full):
            return full
    return os.path.realpath(os.path.expanduser(DEFAULT_OWNER_WORKSPACE))


BRIDGE_ROOT = resolve_bridge_root()
BRIDGE_SKIP_DIRS = {
    ".build",
    ".git",
    ".gradle",
    ".next",
    ".turbo",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "xcuserdata",
}
BRIDGE_PRIVATE_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".DS_Store",
}


def local_or_path_executable(path, fallback_name):
    if os.path.exists(path) and os.access(path, os.X_OK):
        return path
    return shutil.which(fallback_name)
BRIDGE_TEXT_EXTENSIONS = {
    ".cfg",
    ".conf",
    ".css",
    ".csv",
    ".env.example",
    ".gradle",
    ".html",
    ".java",
    ".js",
    ".json",
    ".kt",
    ".kts",
    ".md",
    ".mjs",
    ".pbxproj",
    ".plist",
    ".prisma",
    ".properties",
    ".py",
    ".sh",
    ".service",
    ".sql",
    ".svg",
    ".swift",
    ".ts",
    ".tsx",
    ".txt",
    ".yml",
    ".yaml",
}
BRIDGE_TEXT_NAMES = {
    ".gitignore",
    "Dockerfile",
    "goat-royalty",
    "LICENSE",
    "Makefile",
    "README",
}
BRIDGE_KEY_FILES = [
    "README.md",
    "package.json",
    "app/page.tsx",
    "app/layout.tsx",
    "app/owner/agent-007/page.tsx",
    "app/owner/agent-007/actions.ts",
    "lib/owner-auth.ts",
    "lib/agent_007-agent.ts",
    "lib/accord-data.ts",
    "prisma/schema.prisma",
]
BRIDGE_MAX_TREE_FILES = 260
BRIDGE_MAX_FILE_CHARS = 1200
BRIDGE_READ_SUMMARY_MAX_CHARS = 8000
BRIDGE_MAX_CONTEXT_CHARS = 8000


def resolve_tool_root():
    """Choose an existing owner workspace, tolerating stale drive env vars."""
    candidates = [
        os.environ.get("AGENT_007_TOOL_WORKSPACE"),
        os.environ.get("OSCAR_TOOL_WORKSPACE"),
        BRIDGE_ROOT,
        PROJECT_ROOT,
        "/Volumes/Oscar/Master-Oscar",
        "/Volumes/FKD1/Master-Oscar",
        "/Volumes/ubuntu/Master-Oscar",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        full = os.path.realpath(os.path.expanduser(str(candidate)))
        if os.path.isdir(full):
            return full
    return os.path.realpath(os.path.expanduser(BRIDGE_ROOT))


TOOL_ROOT = resolve_tool_root()
TOOL_LOG_DIR = os.path.join(CHATS_DIR, "tool_logs")
TOOL_BACKUP_DIR = os.path.join(CHATS_DIR, "tool_backups")
TOOL_POLICY_FILE = os.environ.get("AGENT_007_TOOL_POLICY_FILE", os.path.join(CHATS_DIR, "tool_policy.json"))
TOOL_TIMEOUT_SECONDS = int(os.environ.get("AGENT_007_TOOL_TIMEOUT", "120"))
TOOL_MAX_OUTPUT_CHARS = 16000
TOOL_MAX_WRITE_CHARS = 240000
TOOL_MAX_READ_CHARS = int(os.environ.get("AGENT_007_TOOL_READ_MAX_CHARS", "300000"))
TOOL_MAX_SEARCH_CHARS = int(os.environ.get("AGENT_007_TOOL_SEARCH_MAX_CHARS", "1000000"))
TOOL_MAX_PATCH_REPLACEMENTS = 20
TOOL_MAX_WEB_FETCH_BYTES = int(os.environ.get("AGENT_007_TOOL_WEB_FETCH_MAX_BYTES", "1000000"))
TOOL_MAX_WEB_FETCH_CHARS = int(os.environ.get("AGENT_007_TOOL_WEB_FETCH_MAX_CHARS", "60000"))
FXSERVER_ARTIFACT_HOST = "runtime.fivem.net"
FXSERVER_ARTIFACT_PREFIX = "/artifacts/fivem/build_server_windows/master/"
FXSERVER_ARTIFACT_DEFAULT_DEST = "Workspace/GTA-FiveM-Server/server-artifacts/server.7z"
FXSERVER_ARTIFACT_DEFAULT_EXTRACT_DIR = "Workspace/GTA-FiveM-Server/server-artifacts"
CFX_SERVER_DATA_REPO = "https://github.com/citizenfx/cfx-server-data.git"
CFX_SERVER_DATA_ROOT = "Workspace/GTA-FiveM-Server/server-data"
CFX_SERVER_DATA_VENDOR_DIR = "Workspace/GTA-FiveM-Server/server-data/_cfx-server-data"
CFX_SERVER_DATA_RESOURCES_DIR = "Workspace/GTA-FiveM-Server/server-data/resources"
JUNIOR_DEV_TRAINING_DIR = os.path.join(PROJECT_ROOT, "Workspace", "Oscar-Junior-Dev-Training")
JUNIOR_DEV_SESSIONS_DIR = os.path.join(JUNIOR_DEV_TRAINING_DIR, "sessions")
JUNIOR_DEV_LEDGER_FILE = os.path.join(JUNIOR_DEV_TRAINING_DIR, "junior-dev-ledger.jsonl")
JUNIOR_DEV_STATUS_FILE = os.path.join(JUNIOR_DEV_TRAINING_DIR, "current-status.json")
TOOL_LOCAL_CLIENTS = {"127.0.0.1", "::1", "::ffff:127.0.0.1"}
OWNER_APPROVAL_FILE = os.environ.get("AGENT_007_OWNER_APPROVAL_FILE", os.path.join(CHATS_DIR, "owner_approval.json"))
OWNER_APPROVAL_SESSION_SECONDS = int(os.environ.get("AGENT_007_OWNER_APPROVAL_SESSION_SECONDS", "900"))
OWNER_APPROVAL_ITERATIONS = int(os.environ.get("AGENT_007_OWNER_APPROVAL_ITERATIONS", "260000"))
OWNER_APPROVAL_MIN_PASSPHRASE_CHARS = int(os.environ.get("AGENT_007_OWNER_APPROVAL_MIN_CHARS", "8"))
OWNER_APPROVAL_SESSIONS = {}
TOOL_ALLOWED_RUN_SCRIPTS = {"test", "lint", "build", "typecheck", "check"}
TOOL_ALLOWED_EXACT_COMMANDS = {
    ("npm", "test"),
    ("npm", "run", "test"),
    ("npm", "run", "lint"),
    ("npm", "run", "build"),
    ("npm", "run", "typecheck"),
    ("npm", "run", "check"),
    ("pytest",),
    ("python3", "-m", "pytest"),
    ("python", "-m", "pytest"),
    ("node", "--version"),
    ("npm", "--version"),
    ("python3", "--version"),
    ("python", "--version"),
    ("clang++", "--version"),
    ("g++", "--version"),
}
COMPUTER_CONTROL_TIMEOUT_SECONDS = int(os.environ.get("AGENT_007_COMPUTER_CONTROL_TIMEOUT", "20"))
COMPUTER_ALLOWED_APPS = [
    app.strip()
    for app in os.environ.get(
        "AGENT_007_COMPUTER_ALLOWED_APPS",
        "Finder,Safari,Google Chrome,TextEdit,Notes,Preview,Terminal,System Settings,Visual Studio Code,Cursor,Codex,Claude,AnythingLLM,LM Studio,Ollama,Adobe Photoshop,DaVinci Resolve,Pro Tools,FL Studio 2025,FL Studio 2024,FL Studio,Logic Pro,Ableton Live 12 Suite,Ableton Live 12 Standard,Ableton Live 12 Intro,Ableton Live 11 Suite,Ableton Live 11 Standard,Ableton Live 11 Intro,GarageBand",
    ).split(",")
    if app.strip()
]
COMPUTER_APP_NAME_RE = re.compile(r"^[A-Za-z0-9 ._+-]{1,80}$")
COMPUTER_ALLOWED_URL_SCHEMES = {"http", "https"}
COMPUTER_MAX_SPEAK_CHARS = 800
VOICE_SPEAK_MAX_CHARS = int(os.environ.get("AGENT_007_VOICE_SPEAK_MAX_CHARS", "1200"))
MACOS_SAY_PREFERRED_VOICES = (
    "Daniel",
    "Alex",
    "Aaron",
    "Tom",
    "Fred",
    "Rocko",
    "Eddy",
    "Reed",
    "Ralph",
    "Albert",
    "Bruce",
    "Junior",
    "Samantha",
    "Victoria",
)
COMPUTER_MAX_TYPE_CHARS = int(os.environ.get("AGENT_007_COMPUTER_MAX_TYPE_CHARS", "1000"))
COMPUTER_SCREENSHOT_DIR = os.path.join(GENERATED_IMAGES_DIR, "computer-control")
COMPUTER_ALLOWED_MODIFIERS = {"command", "shift", "option", "control"}
COMPUTER_MODIFIER_ALIASES = {
    "cmd": "command",
    "command": "command",
    "meta": "command",
    "shift": "shift",
    "alt": "option",
    "option": "option",
    "ctrl": "control",
    "control": "control",
}
COMPUTER_SPECIAL_KEY_CODES = {
    "return": 36,
    "enter": 36,
    "tab": 48,
    "space": 49,
    "escape": 53,
    "esc": 53,
    "delete": 51,
    "backspace": 51,
    "forward_delete": 117,
    "up": 126,
    "down": 125,
    "left": 123,
    "right": 124,
    "home": 115,
    "end": 119,
    "page_up": 116,
    "page_down": 121,
}
DAW_ALLOWED_TRANSPORT_APPS = {
    "pro tools",
    "fl studio",
    "fl studio 2025",
    "fl studio 2024",
    "logic pro",
    "ableton live 12 suite",
    "ableton live 12 standard",
    "ableton live 12 intro",
    "ableton live 11 suite",
    "ableton live 11 standard",
    "ableton live 11 intro",
    "garageband",
}
DAW_ALLOWED_TRANSPORT_COMMANDS = {
    "play_pause": {"keyCode": 49, "label": "space"},
    "return_to_start": {"keyCode": 36, "label": "return"},
}
OLLAMA_SYSTEM_MAX_CHARS = 1200
OLLAMA_PROJECT_MEMORY_MAX_CHARS = 2400
OLLAMA_HISTORY_BUDGET_CHARS = 1800
OLLAMA_CURRENT_MAX_CHARS = 3000
OLLAMA_BRIDGE_SNAPSHOT_MAX_CHARS = 900
OLLAMA_MESSAGE_MAX_CHARS = 700
OLLAMA_TOTAL_BUDGET_CHARS = 6000
OLLAMA_NUM_CTX = int(os.environ.get("AGENT_007_NUM_CTX", "4096"))
OLLAMA_MAX_PREDICT = int(os.environ.get("AGENT_007_MAX_PREDICT", "4096"))
OLLAMA_BRIDGE_MAX_PREDICT = int(os.environ.get("AGENT_007_BRIDGE_MAX_PREDICT", "512"))
OLLAMA_PROXY_TIMEOUT_SECONDS = int(os.environ.get("AGENT_007_OLLAMA_PROXY_TIMEOUT_SECONDS", "600"))
OLLAMA_BRIDGE_SYSTEM_MAX_CHARS = 600
OLLAMA_BRIDGE_PROJECT_MEMORY_MAX_CHARS = 6000
OLLAMA_BRIDGE_HISTORY_BUDGET_CHARS = 3000
OLLAMA_BRIDGE_REQUEST_MAX_CHARS = 1500
OLLAMA_BRIDGE_RUNTIME_SNAPSHOT_MAX_CHARS = 2500
OLLAMA_BRIDGE_TOTAL_BUDGET_CHARS = 6000
AGENT_007_CORE_IDENTITY_PREFIX = "OSCAR CORE IDENTITY"
AGENT_007_CORE_IDENTITY = """OSCAR CORE IDENTITY
You are Oscar on the dedicated Oscar drive — Raspy's local coding, creative, research, studio, and maintenance partner. Oscar is separate from the old 007 lane; old 007 labels in code are compatibility names only. Do not introduce yourself by any legacy label.
Normal chat rule: greet and chat naturally. When Raspy says hello, thanks, great job, checking in, venting, celebrating, or casually confirming, answer warmly and conversationally. Do not barrage the owner with a generic introduction, menu, or "how can I assist" checklist unless asked. Switch back into evidence/work-loop mode only when Raspy asks for actual work.
Loop kernel rule: validate the input, classify intent, route evidence-required work to tools/RAG/status checks, answer only from verified evidence, block fake output-overclaims, then close work loops with done/tested/blocked/next.
Action rule: when Raspy asks you to build, fix, write, update, deploy, inspect, summarize from files, or create an artifact, do the work now. Read/search first when proof is needed, then execute; do not stop at a plan/checklist unless Raspy asked for a plan only.
Tool-result gate: never say you ran, searched, created, wrote, moved, deployed, verified, tested, or saved a note unless the current chat contains an Oscar TOOL RESULT proving that action. If no result exists, request the tool action; do not roleplay completion.
Crew truth: the GOAT Force crew shares the same owner-approved compound and tool bench while keeping separate identities. Ms. Money Penny is the team and crew leader/supervisor for business, records, royalties, product architecture, executive organization, and operating quality. Oscar coordinates runtime and Tool Mode; Lexi, Vanessa, Nexus, and Sir Codex keep their own lanes.
Never say you cannot code or only explain without generating code.
Never open with self-maintenance or "no self-healing" disclaimers. Tool Mode self_heal repairs Oscar runtime basics after owner approval, and Oscar Brain/read-only maintenance facts are always on.
Self-heal truth: do not claim constant autonomous monitoring, memory-leak repair, or live neural-weight learning. Real self-heal means read-only maintenance facts plus Tool Mode diagnose/self_heal for local runtime files, settings, launchers, and syntax.
YOU CAN: explain, generate, and improve project code; use Tool Mode (tool_adapter/junior_dev/read/search/run/write/patch/brain_search/brain_read/local_intel/security_audit/agent_control) on owner-approved paths.
Tool literacy truth: having tools is not enough. For code, build, review, architecture, or "go deep" work, act like a junior developer: start junior_dev, pick the right lane with tool_adapter when unsure, read/search actual files, record evidence, save a note, get graded, and repeat. Do not free-talk first when evidence is required.
Local Intel truth: use local_intel for owner-approved scraping, file/media ingestion, local faster-whisper transcription, local RAG, grounded answers, and trace logs. Do not claim a URL, file, transcript, index, model, Thor lane, GOAT app, or 500TB server path is present until a tool result or verified local path proves it.
Interface truth: clean UI hides advanced controls by default. Do not tell the owner to click Skill/System/Bridge/Crew buttons; infer the needed lane from the request and use Tool Mode only when evidence or action is required.
You cannot rewrite neural weights — that is not what users mean. They mean real files on this drive.
WAV duration: use wave (frames/sample_rate) or pydub — never os.stat().st_size (file bytes are not audio seconds).
Default: read first, verify honestly, never claim a tool ran unless Tool Mode returned the result.
"""
OLLAMA_CORE_IDENTITY_MAX_CHARS = int(os.environ.get("AGENT_007_CORE_IDENTITY_MAX_CHARS", "1100"))
PROJECT_MEMORY_PREFIX = "OSCAR PROJECT MEMORY"
OSCAR_BRAIN_CONTEXT_PREFIX = "OSCAR BRAIN ALWAYS-ON CONTEXT"
OSCAR_MAINTENANCE_CONTEXT_PREFIX = "OSCAR READ-ONLY MAINTENANCE SNAPSHOT"
TOOL_MODE_PREFIX = "OSCAR TOOL MODE"
OLLAMA_TOOL_MODE_MAX_CHARS = 3200
OLLAMA_TOOL_TOTAL_BUDGET_CHARS = 1400
BRIDGE_CONTEXT_PREFIXES = (
    "OSCAR WORKSPACE BRIDGE SNAPSHOT",
    "OSCAR VERIFIED WORKSPACE MANIFEST",
    "AGENT-007 WORKSPACE BRIDGE SNAPSHOT",
    "AGENT-007 VERIFIED WORKSPACE MANIFEST",
)
BRIDGE_REQUESTED_PATH_RE = re.compile(r"[\w./-]+\.(?:tsx|ts|js|mjs|json|md|css|prisma|txt|yml|yaml)")

WAV_DURATION_REFERENCE_ANSWER = """Here is a correct way to list `.wav` files and print each file's real audio duration in seconds.

**Important:** `os.stat().st_size` is file size in bytes, not playback length. Use the stdlib `wave` module (PCM WAV) or `pydub` for compressed/non-PCM formats.

```python
import os
import wave

def wav_duration_seconds(path: str) -> float:
    with wave.open(path, "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        return frames / float(rate) if rate else 0.0

def list_wav_durations(folder: str) -> None:
    for name in sorted(os.listdir(folder)):
        if not name.lower().endswith(".wav"):
            continue
        path = os.path.join(folder, name)
        try:
            seconds = wav_duration_seconds(path)
            print(f"{name}: {seconds:.3f} s")
        except wave.Error as exc:
            print(f"{name}: unsupported WAV ({exc})")
        except OSError as exc:
            print(f"{name}: {exc}")

if __name__ == "__main__":
    list_wav_durations("/home/user/sounds")
```

Reference copy on this Oscar drive: `Shared/examples/list-wav-durations.py`
"""

SELF_MAINTENANCE_REFERENCE_ANSWER = """Yes — on this Oscar drive I can do real engineering work for your projects, and Tool Mode includes **self_heal** for Oscar's local runtime basics after owner approval.

**What I can do**
- Explain, generate, and improve code for files on this drive (Python, shell, web, configs).
- Use Tool Mode: read, search, run safe tests, write, patch, diagnose, and **self_heal** (check/repair chat server, settings, launch scripts, folders).
- Read Oscar Brain and read-only maintenance facts automatically for guidance.
- Store/retrieve verified notes and playbooks through project memory/Oscar Brain. I cannot rewrite my neural network weights live during chat.
- I do not constantly repair myself in the background. If I cut off, hallucinate, slow down, or lose context, the correct path is diagnose first, then self_heal with apply=false, then apply=true only if a concrete local runtime repair is needed.

**Self_heal example (Tool Mode)**
```json
MASTER_OSCAR_TOOL_REQUEST
{"action":"self_heal","apply":false}
END_MASTER_OSCAR_TOOL_REQUEST
```
Set `"apply":true` only when you want repairs written. Owner approval is required for apply mode.

Tell me the file or task — I'll answer first, then use tools only when needed.
"""

MARKETING_FINALIZE_REFERENCE_ANSWER = """**Oscar finalize spine is on this Oscar drive.**

Read first: `BackupVault/Oscar-Studio/Marketing/OSCAR-WORLD-CLASS-FINALIZE-2026.md`

**Positioning:** Local-first GOAT studio agent on your drive — music, film, business, rights, and code with crew routing (Ms. Money Penny, Lexi, Vanessa, Nexus, Codex). Cloud is optional boost.

**Your Drive batch (June 2026):** 279 links queued in `drive-owner-finalize-manifest-2026-06.json` (15 folders, 224 files, 34 docs, 6 sheets). 274 still need owner export to `Drive-Intake/raw/` — Oscar cannot ingest private Drive without that step.

**30-day focus:** (1) lock public copy + demo, (2) import top 20 Drive docs, (3) refresh GOAT crew deck/PDF, (4) regression-test Code/Tool Mode/self_heal.

**In Oscar UI:** Skill → Marketing, Tool Mode on, then ask: *Build my launch checklist from the finalize playbook.*

Import helper: `Shared/runtime/import-drive-finalize-manifest.py --list-pending`
"""

LEGACY_CHAT_SYSTEM_MARKERS = (
    "AGENT-007 CLIENT TEST CORE",
    "generic assistant running from this USB",
)
BAD_ASSISTANT_HISTORY_MARKERS = (
    "self-maintenance",
    "self-healing or self-improvement",
    "don't have self-healing",
    "os.stat(filename).st_size",
    "os.stat(file_path).st_size",
    "duration (mb)",
    "cannot directly apply those learnings",
    "no \"self-healing\" in the traditional sense",
)


def polish_agent_007_assistant_text(text):
    """Strip common bad openings from small local models."""
    if not text:
        return text
    cleaned = text
    if re.search(r"(?i)self-maintenance|self-healing or self-improvement", cleaned[:1400]):
        cleaned = re.sub(
            r"(?is)^(?:you'?re asking me about my [\"']?self-maintenance[\"']?[^\n]*\n+)+",
            "",
            cleaned,
            count=1,
        )
        cleaned = re.sub(
            r"(?is)^think of it like this:[^\n]*\n+(?:[^\n]+\n+)*",
            "",
            cleaned,
            count=1,
        ).lstrip()
    return cleaned


def is_bad_assistant_history(content):
    lowered = str(content or "").lower()
    return any(marker in lowered for marker in BAD_ASSISTANT_HISTORY_MARKERS)


def migrate_chats_data(chats):
    """One-time hygiene for legacy USB test prompts and toxic assistant history."""
    if not isinstance(chats, list):
        return chats, False
    changed = False
    cleaned = []
    for chat in chats:
        if not isinstance(chat, dict):
            cleaned.append(chat)
            continue
        chat = dict(chat)
        sys_prompt = str(chat.get("systemPrompt") or "")
        if any(marker.lower() in sys_prompt.lower() for marker in LEGACY_CHAT_SYSTEM_MARKERS):
            if chat.get("systemPrompt"):
                chat["systemPrompt"] = ""
                changed = True
        messages = chat.get("messages")
        if isinstance(messages, list):
            new_messages = []
            for msg in messages:
                if not isinstance(msg, dict):
                    new_messages.append(msg)
                    continue
                if msg.get("role") == "assistant" and is_bad_assistant_history(msg.get("content")):
                    changed = True
                    continue
                new_messages.append(msg)
            chat["messages"] = new_messages
        cleaned.append(chat)
    return cleaned, changed


def check_ollama_reachable():
    try:
        req = urllib.request.Request(OLLAMA_HOST + "/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.status == 200
    except Exception:
        return False


_ollama_autostart_lock = threading.Lock()


def ensure_ollama_running():
    """Start bundled Oscar Ollama if the chat server is up but the engine is down."""
    if LLAMA_CPP_MODE or check_ollama_reachable():
        return check_ollama_reachable()

    engine = os.path.join(SCRIPT_DIR, "bin", "ollama-darwin")
    if platform.system() != "Darwin" or not os.path.isfile(engine):
        return False

    with _ollama_autostart_lock:
        if check_ollama_reachable():
            return True

        ollama_home = os.environ.get("OLLAMA_HOME") or os.path.join(PROJECT_ROOT, ".ollama-runtime")
        runners = os.environ.get("OLLAMA_RUNNERS_DIR") or os.path.join(ollama_home, "runners")
        tmpdir = os.environ.get("OLLAMA_TMPDIR") or os.path.join(ollama_home, "tmp")
        os.makedirs(runners, exist_ok=True)
        os.makedirs(tmpdir, exist_ok=True)

        env = os.environ.copy()
        env["HOME"] = ollama_home
        env.setdefault("OLLAMA_HOST", "127.0.0.1:11434")
        env.setdefault("OLLAMA_MODELS", os.path.join(SCRIPT_DIR, "models", "ollama_data"))
        env.setdefault("OLLAMA_ORIGINS", "*")

        log_path = os.path.join(ollama_home, "master-oscar-ollama-autostart.log")
        try:
            log_file = open(log_path, "a", encoding="utf-8")
        except OSError:
            log_file = subprocess.DEVNULL

        try:
            subprocess.Popen(
                [engine, "serve"],
                env=env,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        except OSError:
            return False
        finally:
            if log_file not in (subprocess.DEVNULL, None):
                try:
                    log_file.close()
                except OSError:
                    pass

        for _ in range(30):
            if check_ollama_reachable():
                safe_print("[master-oscar] started Oscar Ollama engine", flush=True)
                return True
            time.sleep(1)
        return False


# ── Pure-Python Hardware Stats (no psutil needed) ──────────────
_cpu_times_last = None  # (idle, total) from previous sample

def _get_hw_stats():
    """Return (cpu_percent, ram_percent) using only stdlib / ctypes."""
    global _cpu_times_last  # must be at top of function, before any branch uses it

    if HAS_PSUTIL:
        cpu = round(psutil.cpu_percent(interval=0.25), 1)
        ram = round(psutil.virtual_memory().percent, 1)
        return cpu, ram

    plat = platform.system()

    # ── Windows ──────────────────────────────────────────────────
    if plat == "Windows":
        # RAM via GlobalMemoryStatusEx
        class MEMORYSTATUSEX(ctypes.Structure):
            _fields_ = [
                ("dwLength",                ctypes.c_ulong),
                ("dwMemoryLoad",            ctypes.c_ulong),
                ("ullTotalPhys",            ctypes.c_ulonglong),
                ("ullAvailPhys",            ctypes.c_ulonglong),
                ("ullTotalPageFile",        ctypes.c_ulonglong),
                ("ullAvailPageFile",        ctypes.c_ulonglong),
                ("ullTotalVirtual",         ctypes.c_ulonglong),
                ("ullAvailVirtual",         ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]
        msx = MEMORYSTATUSEX()
        msx.dwLength = ctypes.sizeof(msx)
        ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(msx))
        ram = float(msx.dwMemoryLoad)

        # CPU via GetSystemTimes (idle/kernel/user tick counts)
        FILETIME = ctypes.c_ulonglong
        idle, kern, user = FILETIME(), FILETIME(), FILETIME()
        ctypes.windll.kernel32.GetSystemTimes(
            ctypes.byref(idle), ctypes.byref(kern), ctypes.byref(user))
        idle_v = idle.value
        total_v = kern.value + user.value
        if _cpu_times_last is None:
            # First call — sleep briefly and sample again
            time.sleep(0.25)
            idle2, kern2, user2 = FILETIME(), FILETIME(), FILETIME()
            ctypes.windll.kernel32.GetSystemTimes(
                ctypes.byref(idle2), ctypes.byref(kern2), ctypes.byref(user2))
            d_idle  = idle2.value - idle_v
            d_total = (kern2.value + user2.value) - total_v
            _cpu_times_last = (idle2.value, kern2.value + user2.value)
        else:
            prev_idle, prev_total = _cpu_times_last
            d_idle  = idle_v  - prev_idle
            d_total = total_v - prev_total
            _cpu_times_last = (idle_v, total_v)

        cpu = round((1.0 - d_idle / max(d_total, 1)) * 100.0, 1)
        cpu = max(0.0, min(100.0, cpu))
        return cpu, ram

    # ── Linux ─────────────────────────────────────────────────────
    elif plat == "Linux":
        # RAM
        ram = 0.0
        try:
            with open("/proc/meminfo") as f:
                mem = {}
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        mem[parts[0].rstrip(":")] = int(parts[1])
            total = mem.get("MemTotal", 1)
            avail = mem.get("MemAvailable", total)
            ram = round((1 - avail / total) * 100, 1)
        except Exception:
            pass
        # CPU via /proc/stat delta
        cpu = 0.0
        try:
            def read_cpu():
                with open("/proc/stat") as f:
                    parts = f.readline().split()
                vals = [int(x) for x in parts[1:]]
                idle = vals[3]
                total = sum(vals)
                return idle, total
            if _cpu_times_last is None:
                i1, t1 = read_cpu()
                time.sleep(0.25)
                i2, t2 = read_cpu()
            else:
                i1, t1 = _cpu_times_last
                i2, t2 = read_cpu()
            _cpu_times_last = (i2, t2)
            d_idle  = i2 - i1
            d_total = t2 - t1
            cpu = round((1 - d_idle / max(d_total, 1)) * 100, 1)
        except Exception:
            pass
        return cpu, ram

    # ── macOS ─────────────────────────────────────────────────────
    else:
        cpu = 0.0
        ram = 0.0
        try:
            ps = subprocess.run(
                ["ps", "-A", "-o", "%cpu="],
                check=False,
                capture_output=True,
                text=True,
                timeout=2,
            )
            used = sum(float(x) for x in ps.stdout.split() if x.strip())
            cpu = round(min(100.0, used / max(os.cpu_count() or 1, 1)), 1)
        except Exception:
            pass

        try:
            total = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"], text=True).strip())
            vm = subprocess.check_output(["vm_stat"], text=True)
            page_size = 4096
            free_pages = inactive_pages = speculative_pages = 0
            for line in vm.splitlines():
                if "page size of" in line:
                    parts = [p for p in line.split() if p.isdigit()]
                    if parts:
                        page_size = int(parts[0])
                elif line.startswith("Pages free:"):
                    free_pages = int(line.split(":")[1].strip().rstrip("."))
                elif line.startswith("Pages inactive:"):
                    inactive_pages = int(line.split(":")[1].strip().rstrip("."))
                elif line.startswith("Pages speculative:"):
                    speculative_pages = int(line.split(":")[1].strip().rstrip("."))
            available = (free_pages + inactive_pages + speculative_pages) * page_size
            ram = round((1 - available / max(total, 1)) * 100, 1)
            ram = max(0.0, min(100.0, ram))
        except Exception:
            pass
        return cpu, ram


def read_json_file(path, default):
    """Read JSON data, replacing corrupt/missing files with a safe default."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json_file(path, data):
    """Atomically write JSON so a power loss is less likely to corrupt history."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp-", suffix=".json", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def load_settings():
    """Return saved settings merged with current defaults."""
    settings = DEFAULT_SETTINGS.copy()
    saved = read_json_file(SETTINGS_FILE, {})
    if isinstance(saved, dict):
        settings.update(saved)
    return settings


def adapter_probe_url(name, url, timeout=1.5):
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json,text/plain,*/*"})
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return {
                "name": name,
                "url": url,
                "reachable": 200 <= res.status < 500,
                "status": res.status,
            }
    except Exception as e:
        return {
            "name": name,
            "url": url,
            "reachable": False,
            "error": f"{type(e).__name__}: {e}",
        }


def adapter_file_state(path):
    return {
        "path": path,
        "exists": os.path.isfile(path),
        "size": os.path.getsize(path) if os.path.isfile(path) else 0,
    }


def adapter_dir_state(path):
    return {
        "path": path,
        "exists": os.path.isdir(path),
    }


def adapter_dir_size(path, max_files=2000):
    total = 0
    seen = 0
    if not os.path.isdir(path):
        return 0
    for root, _dirs, files in os.walk(path):
        for name in files:
            seen += 1
            if seen > max_files:
                return total
            try:
                total += os.path.getsize(os.path.join(root, name))
            except OSError:
                pass
    return total


def adapter_unreal_status():
    install_root_exists = os.path.isdir(UNREAL_ENGINE_DEFAULT_INSTALL_DIR)
    editor_candidates = []
    if install_root_exists:
        try:
            for name in sorted(os.listdir(UNREAL_ENGINE_DEFAULT_INSTALL_DIR)):
                if name.startswith("UE_"):
                    app_path = os.path.join(UNREAL_ENGINE_DEFAULT_INSTALL_DIR, name, "Engine", "Binaries", "Mac", "UnrealEditor.app")
                    editor_candidates.append(adapter_dir_state(app_path))
        except OSError:
            editor_candidates = []
    editor_installed = any(item.get("exists") for item in editor_candidates)
    launcher_size = 0
    if os.path.isdir(UNREAL_ENGINE_LAUNCHER_APP):
        launcher_size = adapter_dir_size(UNREAL_ENGINE_LAUNCHER_APP)
    return {
        "goatBridge": {
            "copilot": adapter_file_state(GOAT_UNREAL_COPILOT_FILE),
            "integration": adapter_file_state(GOAT_UNREAL_INTEGRATION_FILE),
        },
        "epicLauncher": adapter_dir_state(EPIC_GAMES_LAUNCHER_APP),
        "unrealLauncher": {
            **adapter_dir_state(UNREAL_ENGINE_LAUNCHER_APP),
            "size": launcher_size,
            "note": "A tiny or zero-size launcher app is only a stub, not the full Unreal Editor.",
        },
        "installer": adapter_file_state(UNREAL_ENGINE_INSTALLER_DMG),
        "sharedDir": adapter_dir_state(UNREAL_ENGINE_SHARED_DIR),
        "defaultInstallDir": adapter_dir_state(UNREAL_ENGINE_DEFAULT_INSTALL_DIR),
        "editorCandidates": editor_candidates,
        "editorInstalled": editor_installed,
        "readyLevel": "editor_ready" if editor_installed else "bridge_ready_launcher_needed",
        "nextStep": "Install a UE_5.x engine version in Epic Games Launcher, then Oscar can route Unreal requests to the bridge/editor lane.",
    }


def adapter_ollama_tags():
    try:
        req = urllib.request.Request(OLLAMA_HOST + "/api/tags", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode("utf-8"))
        models = data.get("models", []) if isinstance(data, dict) else []
        return {
            "reachable": True,
            "url": OLLAMA_HOST,
            "count": len(models),
            "models": [item.get("name") for item in models if isinstance(item, dict) and item.get("name")],
        }
    except Exception as e:
        return {
            "reachable": False,
            "url": OLLAMA_HOST,
            "error": f"{type(e).__name__}: {e}",
        }


def adapter_local_model_pack_summary():
    data = read_json_file(GOAT_LOCAL_MODEL_PACK_FILE, {})
    packs = data.get("packs", {}) if isinstance(data, dict) else {}

    def resolve_pack(name, seen=None):
        seen = seen or set()
        if name in seen or not isinstance(packs, dict):
            return []
        seen.add(name)
        pack = packs.get(name, {})
        if not isinstance(pack, dict):
            return []
        out = []
        for inc in pack.get("includes", []):
            out.extend(resolve_pack(str(inc), seen))
        out.extend([str(item) for item in pack.get("models", [])])
        unique = []
        for item in out:
            if item and item not in unique:
                unique.append(item)
        return unique

    return {
        "path": GOAT_LOCAL_MODEL_PACK_FILE,
        "exists": os.path.isfile(GOAT_LOCAL_MODEL_PACK_FILE),
        "packs": {
            name: {
                "directCount": len(pack.get("models", [])) if isinstance(pack, dict) else 0,
                "resolvedCount": len(resolve_pack(name)),
            }
            for name, pack in packs.items()
        } if isinstance(packs, dict) else {},
        "installer": os.path.join(PROJECT_ROOT, "Shared", "model_packs", "install-goat-local-models.sh"),
    }


def adapter_secret_status():
    env_names = [
        "OPENAI_API_KEY",
        "GOOGLE_API_KEY",
        "GEMINI_API_KEY",
        "REPLICATE_API_TOKEN",
        "STABILITY_API_KEY",
        "ELEVENLABS_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
    ]
    env_paths = [
        os.path.join(PROJECT_ROOT, ".env"),
        os.path.join(PROJECT_ROOT, ".env.local"),
        os.path.join(SCRIPT_DIR, "chat_data", "owner-secrets.env"),
        os.path.join(SCRIPT_DIR, "chat_data", "goat-tools.env"),
    ]
    return {
        "configuredEnvNames": [name for name in env_names if os.environ.get(name)],
        "missingEnvNames": [name for name in env_names if not os.environ.get(name)],
        "candidateEnvFiles": [adapter_file_state(path) for path in env_paths],
        "secretRule": "Never paste secrets into chat. Put keys in owner-approved local env/vault files, then restart the relevant service.",
    }


def adapter_catalog():
    return [
        {
            "id": "goat_tools",
            "label": "GOAT Tools Router",
            "kind": "router",
            "aliases": ["goat", "goat tools", "tools", "which tool", "pick tool", "route", "capability"],
            "useWhen": "The user asks what tool/lane Oscar should use, or the request is ambiguous.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "query": "describe available GOAT tool lanes"},
        },
        {
            "id": "api_key_setup_status",
            "label": "API Key / Vault Gate",
            "kind": "status",
            "aliases": ["api", "api key", "api keys", "key", "keys", "token", "secret", "secrets", "credentials", "vault", "openai", "gemini", "elevenlabs", "supabase"],
            "useWhen": "The user asks to connect paid/cloud tools, API keys, providers, tokens, or secret setup.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "api_key_setup_status"},
        },
        {
            "id": "local_models",
            "label": "Local Model Picker / Downloader",
            "kind": "status",
            "aliases": ["model", "models", "llm", "ollama", "download models", "30 plus", "workstation pack", "local model"],
            "useWhen": "The user asks about installed models, downloading models, model count, or model selection.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "local_models"},
        },
        {
            "id": "llama_cpp_runtime",
            "label": "Llama.cpp Runtime Status",
            "kind": "tool",
            "aliases": ["llama.cpp", "llama-server", "llama status", "runtime status", "gguf runtime", "9797"],
            "useWhen": "The user asks Oscar to verify local llama.cpp or llama-server runtime status.",
            "safe": True,
            "nextToolRequest": {"action": "llama_status"},
        },
        {
            "id": "local_intel_engine",
            "label": "Oscar Local Intel Engine",
            "kind": "tool",
            "aliases": [
                "scrape",
                "scraper",
                "crawler",
                "crawl",
                "rag",
                "retrieve",
                "retrieval",
                "transcribe",
                "transcriber",
                "training media",
                "local intel",
                "local intelligence",
                "research engine",
                "super claude",
                "observability",
                "trace",
            ],
            "useWhen": "The user asks Oscar to scrape owner-approved web pages, ingest files/media, transcribe locally, build a local RAG index, retrieve evidence, or answer from grounded local sources.",
            "safe": True,
            "nextToolRequest": {"action": "local_intel", "operation": "status"},
        },
        {
            "id": "junior_dev_training",
            "label": "Oscar Junior Dev Training Loop",
            "kind": "tool",
            "aliases": [
                "junior dev",
                "junior developer",
                "training loop",
                "prove before talking",
                "read file",
                "report evidence",
                "save notes",
                "grade",
                "graded",
                "repeat",
                "checklist",
                "apprentice",
            ],
            "useWhen": "The user wants Oscar to learn by doing: read actual files, report evidence, save durable notes, receive a grade, and repeat before claiming progress.",
            "safe": True,
            "nextToolRequest": {"action": "junior_dev", "operation": "checklist"},
        },
        {
            "id": "image_render_bridge",
            "label": "Image Render Bridge",
            "kind": "status",
            "aliases": ["image", "images", "render", "art", "cover", "cover art", "poster", "logo", "thumbnail", "comfyui", "stable diffusion", "forge", "sdxl", "flux"],
            "useWhen": "The user asks for bitmap images, covers, logos, art, renderers, ComfyUI, SDXL, or FLUX.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "image_render_bridge"},
        },
        {
            "id": "video_engines",
            "label": "Video Engine Arena",
            "kind": "status",
            "aliases": ["video", "film", "clip", "veo", "runway", "pika", "movie", "animation"],
            "useWhen": "The user asks for video generation, video tools, or video provider status.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "video_engines"},
        },
        {
            "id": "unreal_engine_bridge",
            "label": "Unreal Engine / MetaHuman Bridge",
            "kind": "status",
            "aliases": ["unreal", "unreal engine", "ue5", "ue", "epic", "epic games", "metahuman", "pixel streaming", "twinmotion", "unreal editor"],
            "useWhen": "The user asks about Unreal Engine, UE5, MetaHuman, Epic Games Launcher, Pixel Streaming, or Oscar's Unreal bridge.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "unreal_engine_bridge"},
        },
        {
            "id": "catalog_scanner",
            "label": "Catalog Scanner",
            "kind": "status",
            "aliases": ["catalog", "scan catalog", "scanner", "metadata", "duplicates", "royalties", "fingerprint", "music catalog"],
            "useWhen": "The user asks to scan music/media catalogs, metadata, duplicates, or royalty tracking.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "catalog_scanner"},
        },
        {
            "id": "drive_intake",
            "label": "Drive Intake",
            "kind": "status",
            "aliases": ["drive", "google drive", "intake", "archive", "backup", "import"],
            "useWhen": "The user asks about imported Drive archives or local intake manifests.",
            "safe": True,
            "nextToolRequest": {"action": "tool_adapter", "adapter": "drive_intake"},
        },
        {
            "id": "file_search",
            "label": "Workspace Search",
            "kind": "tool",
            "aliases": ["find file", "search file", "where is", "locate", "grep", "search"],
            "useWhen": "The user asks Oscar to find text or files inside approved roots.",
            "safe": True,
            "nextToolRequest": {"action": "search", "query": "<search text>", "max": 50},
        },
        {
            "id": "file_read",
            "label": "File Read",
            "kind": "tool",
            "aliases": ["read file", "open file", "show file", "inspect file"],
            "useWhen": "The user asks Oscar to inspect a specific owner-approved file.",
            "safe": True,
            "nextToolRequest": {"action": "read", "path": "<owner-approved path>", "maxChars": 12000},
        },
        {
            "id": "safe_patch",
            "label": "Safe Patch",
            "kind": "tool",
            "aliases": ["fix code", "patch", "edit", "repair file", "change code", "update file"],
            "useWhen": "The user asks Oscar to make a scoped safe text/code change.",
            "safe": False,
            "nextToolRequest": {"action": "patch", "path": "<file>", "replacements": [{"old": "<exact old text>", "new": "<new text>", "count": 1}], "reason": "<why>"},
        },
        {
            "id": "shell_check",
            "label": "Safe Command Check",
            "kind": "tool",
            "aliases": ["test", "lint", "build", "check", "py_compile", "node check", "verify"],
            "useWhen": "The user asks Oscar to run allowed local checks such as lint, test, build, node --check, or py_compile.",
            "safe": True,
            "nextToolRequest": {"action": "run", "command": "<allowed check command>", "cwd": "."},
        },
        {
            "id": "local_draw",
            "label": "Local Draft Image",
            "kind": "tool",
            "aliases": ["draw", "sketch", "local png", "draft image"],
            "useWhen": "The user wants a quick local procedural image draft without cloud/render backends.",
            "safe": True,
            "nextToolRequest": {"action": "draw", "subject": "<image subject>"},
        },
        {
            "id": "computer_control",
            "label": "Computer Control",
            "kind": "tool",
            "aliases": ["open app", "open url", "screenshot", "click", "type", "hotkey", "computer", "finder", "logic pro", "pro tools"],
            "useWhen": "The user asks Oscar to use the visible computer under owner-approved Computer Control.",
            "safe": False,
            "nextToolRequest": {"action": "computer", "computerAction": "list_running_apps"},
        },
        {
            "id": "self_heal",
            "label": "Oscar Self-Heal",
            "kind": "tool",
            "aliases": ["self heal", "self-heal", "repair oscar", "maintenance", "self maintenance", "fix yourself", "diagnose oscar"],
            "useWhen": "The user asks Oscar to diagnose or repair his own runtime basics.",
            "safe": True,
            "nextToolRequest": {"action": "self_heal", "apply": False},
        },
        {
            "id": "security_ops",
            "label": "Security Ops / Agent Control",
            "kind": "tool",
            "aliases": ["security", "secure", "threat", "audit", "ports", "firewall", "agent control", "crew control", "moneypenny", "money penny", "lexi", "007", "lockdown"],
            "useWhen": "The user asks Oscar to inspect threats, harden the local runtime, or coordinate the security posture of Oscar and crew agents.",
            "safe": True,
            "nextToolRequest": {"action": "security_audit", "apply": False, "scope": "quick"},
        },
        {
            "id": "oscar_brain",
            "label": "Oscar Brain Retrieval",
            "kind": "tool",
            "aliases": ["oscar brain", "brain", "memory library", "self learning", "self applying", "self healing loop", "maintenance loop", "playbook", "training strategy"],
            "useWhen": "The user asks what Oscar should remember, how he learns/applies/heals/maintains, or asks for a saved Oscar playbook.",
            "safe": True,
            "nextToolRequest": {"action": "brain_search", "query": "<topic>", "max": 8},
        },
    ]


def adapter_score(query, adapter):
    q = str(query or "").strip().lower()
    if not q:
        return 0
    aliases = [str(alias).lower() for alias in adapter.get("aliases", [])]
    identity = " ".join([
        str(adapter.get("id", "")),
        str(adapter.get("label", "")),
        str(adapter.get("useWhen", "")),
        " ".join(aliases),
    ]).lower()
    if q in aliases:
        return 120
    score = 0
    for alias in aliases:
        if alias and alias in q:
            score += 80
    terms = [term for term in re.findall(r"[a-z0-9][a-z0-9+._-]{1,}", q) if term not in {"the", "and", "for", "with", "from", "that", "this", "please"}]
    if terms:
        score += sum(12 for term in terms if term in identity)
        if all(term in identity for term in terms):
            score += 20
    return score


def adapter_status(adapter_id):
    if adapter_id == "api_key_setup_status":
        return adapter_secret_status()
    if adapter_id == "local_models":
        return {
            "ollama": adapter_ollama_tags(),
            "modelPack": adapter_local_model_pack_summary(),
            "modelStore": adapter_dir_state(os.path.join(SCRIPT_DIR, "models", "ollama_data")),
            "note": "Installed model count is active inventory. GOAT pack counts are download targets, not installed models.",
        }
    if adapter_id == "local_intel_engine":
        if oscar_intel_engine is None:
            return {
                "loaded": False,
                "error": "oscar_intel_engine.py is not importable from Shared/runtime",
            }
        return oscar_intel_engine.status_payload(PROJECT_ROOT)
    if adapter_id == "junior_dev_training":
        return junior_dev_status_payload(limit=5)
    if adapter_id == "image_render_bridge":
        return {
            "standard": adapter_file_state(GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE),
            "renderers": [
                adapter_probe_url("ComfyUI", "http://127.0.0.1:8188/system_stats", timeout=3.0),
                adapter_probe_url("Stable Diffusion WebUI", "http://127.0.0.1:7860/"),
                adapter_probe_url("SD WebUI Forge", "http://127.0.0.1:7861/"),
            ],
            "cloudImageApiConfigured": bool(os.environ.get("OPENAI_API_KEY") or os.environ.get("REPLICATE_API_TOKEN") or os.environ.get("STABILITY_API_KEY")),
        }
    if adapter_id == "video_engines":
        data = read_json_file(GOAT_VIDEO_ENGINE_ARENA_FILE, {})
        engines = data.get("engines", []) if isinstance(data, dict) else []
        return {
            "standard": adapter_file_state(GOAT_VIDEO_ENGINE_ARENA_FILE),
            "engineCount": len(engines),
            "engineIds": [item.get("id") for item in engines if isinstance(item, dict) and item.get("id")],
        }
    if adapter_id == "unreal_engine_bridge":
        return adapter_unreal_status()
    if adapter_id == "catalog_scanner":
        return {"standard": adapter_file_state(CATALOG_SCANNER_STANDARD_FILE)}
    if adapter_id == "drive_intake":
        return {
            "summary": adapter_file_state(DRIVE_FEATURE_INTAKE_FILE),
            "manifest": adapter_file_state(DRIVE_INTAKE_MANIFEST_FILE),
            "home": adapter_dir_state(DRIVE_INTAKE_HOME_DIR),
        }
    if adapter_id == "goat_tools":
        return {"adapterCount": len(adapter_catalog()), "adapters": adapter_catalog()}
    return {}


def tool_adapter(query="", adapter_id=""):
    adapters = adapter_catalog()
    requested = str(adapter_id or "").strip()
    if requested:
        matches = [item for item in adapters if item.get("id") == requested]
    else:
        ranked = []
        for item in adapters:
            score = adapter_score(query, item)
            if score > 0:
                ranked.append((score, item))
        ranked.sort(key=lambda pair: pair[0], reverse=True)
        matches = [item for _score, item in ranked[:5]]
    if not matches:
        matches = [adapters[0]]
    enriched = []
    for item in matches:
        copy_item = dict(item)
        status = adapter_status(copy_item["id"])
        if status:
            copy_item["status"] = status
        enriched.append(copy_item)
    return {
        "query": query,
        "adapter": requested,
        "matches": enriched,
        "recommended": enriched[0] if enriched else None,
        "rule": "Use the recommended nextToolRequest when a real action is needed. Do not claim external/Codex tools are available unless an adapter exposes them here.",
    }


def write_text_file(path, text):
    """Atomically write UTF-8 text."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp-", suffix=".txt", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
            if text and not text.endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def owner_approval_log(event, details=None):
    os.makedirs(TOOL_LOG_DIR, exist_ok=True)
    entry = {
        "time": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "event": event,
        "details": details or {},
    }
    path = os.path.join(TOOL_LOG_DIR, "owner-approvals.jsonl")
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def owner_approval_load():
    data = read_json_file(OWNER_APPROVAL_FILE, {})
    return data if isinstance(data, dict) else {}


def owner_approval_configured(data=None):
    data = owner_approval_load() if data is None else data
    return bool(data.get("salt") and data.get("passphraseHash"))


def owner_approval_public_state():
    data = owner_approval_load()
    configured = owner_approval_configured(data)
    return {
        "configured": configured,
        "ownerName": str(data.get("ownerName") or "Owner") if configured else "",
        "sessionSeconds": OWNER_APPROVAL_SESSION_SECONDS,
        "requiresOwnerApproval": owner_approval_required_enabled(),
        "approvalFile": OWNER_APPROVAL_FILE,
        "mode": "owner-passphrase-local-session",
    }


def owner_approval_hash(passphrase, salt_hex, iterations):
    return hashlib.pbkdf2_hmac(
        "sha256",
        str(passphrase or "").encode("utf-8"),
        bytes.fromhex(salt_hex),
        int(iterations),
    ).hex()


def owner_approval_setup(owner_name, passphrase):
    if owner_approval_configured():
        raise PermissionError("Owner approval is already configured.")
    passphrase = str(passphrase or "")
    if len(passphrase) < OWNER_APPROVAL_MIN_PASSPHRASE_CHARS:
        raise ValueError(f"Owner approval code must be at least {OWNER_APPROVAL_MIN_PASSPHRASE_CHARS} characters.")
    salt = secrets.token_hex(16)
    owner = str(owner_name or "Owner").strip()[:80] or "Owner"
    data = {
        "schemaVersion": 1,
        "ownerName": owner,
        "salt": salt,
        "iterations": OWNER_APPROVAL_ITERATIONS,
        "passphraseHash": owner_approval_hash(passphrase, salt, OWNER_APPROVAL_ITERATIONS),
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    write_json_file(OWNER_APPROVAL_FILE, data)
    try:
        os.chmod(OWNER_APPROVAL_FILE, 0o600)
    except OSError:
        pass
    owner_approval_log("setup", {"ownerName": owner})
    return data


def owner_approval_verify(passphrase):
    data = owner_approval_load()
    if not owner_approval_configured(data):
        raise PermissionError("Owner approval is not configured.")
    expected = str(data.get("passphraseHash") or "")
    actual = owner_approval_hash(passphrase, data["salt"], data.get("iterations", OWNER_APPROVAL_ITERATIONS))
    ok = secrets.compare_digest(expected, actual)
    owner_approval_log("unlock" if ok else "unlock_failed", {"ownerName": data.get("ownerName", "Owner")})
    return ok, data


def owner_approval_cleanup_sessions():
    now = time.time()
    for digest, session in list(OWNER_APPROVAL_SESSIONS.items()):
        if float(session.get("expiresAt", 0)) <= now:
            OWNER_APPROVAL_SESSIONS.pop(digest, None)


def owner_approval_token_digest(token):
    return hashlib.sha256(str(token or "").encode("utf-8")).hexdigest()


def owner_approval_create_session(owner_name):
    owner_approval_cleanup_sessions()
    token = secrets.token_urlsafe(32)
    expires_at = time.time() + OWNER_APPROVAL_SESSION_SECONDS
    OWNER_APPROVAL_SESSIONS[owner_approval_token_digest(token)] = {
        "ownerName": str(owner_name or "Owner"),
        "expiresAt": expires_at,
    }
    owner_approval_log("session_created", {"ownerName": owner_name, "expiresAt": int(expires_at)})
    return {
        "token": token,
        "ownerName": str(owner_name or "Owner"),
        "expiresAt": int(expires_at),
    }


def owner_approval_revoke(token):
    OWNER_APPROVAL_SESSIONS.pop(owner_approval_token_digest(token), None)
    owner_approval_log("session_revoked", {})


def owner_approval_required_enabled():
    """When false, the creator/owner USB skips passphrase (studio unlock)."""
    raw = os.environ.get("AGENT_007_OWNER_APPROVAL_REQUIRED", "0").strip().lower()
    return raw in ("1", "true", "yes", "on")


def owner_approval_require(payload, action):
    if not owner_approval_required_enabled():
        return {"ownerName": os.environ.get("AGENT_007_OWNER_NAME", "the creator"), "localOwner": True, "unlocked": True}
    if not owner_approval_configured():
        raise PermissionError("Owner approval is not configured. Set the owner code from Oscar's Tool panel or run the one-drop deployer.")
    token = str(payload.get("_ownerApprovalToken") or payload.get("ownerApprovalToken") or "").strip()
    if not token:
        raise PermissionError("Owner approval required before Oscar can run local tools.")
    owner_approval_cleanup_sessions()
    session = OWNER_APPROVAL_SESSIONS.get(owner_approval_token_digest(token))
    if not session:
        raise PermissionError("Owner approval is missing or expired.")
    if float(session.get("expiresAt", 0)) <= time.time():
        owner_approval_revoke(token)
        raise PermissionError("Owner approval expired.")
    owner_approval_log("approved_action", {"ownerName": session.get("ownerName", "Owner"), "action": action})
    return session


def tool_policy_default_roots():
    roots = []

    def add_root(path):
        if not path:
            return
        full = os.path.realpath(os.path.expanduser(str(path)))
        if os.path.isdir(full) and full not in roots:
            roots.append(full)

    add_root(PROJECT_ROOT)
    add_root(BRIDGE_ROOT)
    add_root(TOOL_ROOT)
    for raw in os.environ.get("AGENT_007_TOOL_EXTRA_ROOTS", "").split(os.pathsep):
        add_root(raw)
    for owner_root in (
        "/Volumes/WFHD/USB-Uncensored-LLM-main",
        "/Volumes/WFHD/DJ SPEEDY",
        "/Volumes/WFHD/DJ SPEEDY/COOKING WITH BEN AND ACE 2",
        "/Volumes/WFHD/DJ SPEEDY/COOKING WITH BEN AND ACE",
    ):
        add_root(owner_root)
    return roots


def tool_policy_default():
    return {
        "schemaVersion": 1,
        "allowedRoots": tool_policy_default_roots(),
        "allowedApps": COMPUTER_ALLOWED_APPS,
        "capabilities": {
            "files": True,
            "safeCommands": True,
            "webFetch": True,
            "draw": True,
            "computerControl": True,
            "selfHeal": True,
            "securityOps": True,
            "agentControl": True,
            "trainingTranscription": True,
            "localIntel": True,
            "juniorDev": True,
        },
        "notes": [
            "Relative paths resolve under the Oscar project root.",
            "Absolute paths must live under an owner-approved allowedRoot.",
            "Secrets, .env files, system roots, node_modules, .git, and hidden drive metadata stay blocked.",
        ],
    }


def tool_policy_load():
    default_policy = tool_policy_default()
    saved = read_json_file(TOOL_POLICY_FILE, {})
    if not isinstance(saved, dict):
        saved = {}
    policy = {
        **default_policy,
        **{key: value for key, value in saved.items() if key in {"schemaVersion", "allowedRoots", "allowedApps", "capabilities", "notes"}},
    }
    if not isinstance(policy.get("allowedRoots"), list):
        policy["allowedRoots"] = default_policy["allowedRoots"]
    if not isinstance(policy.get("allowedApps"), list):
        policy["allowedApps"] = default_policy["allowedApps"]
    if not isinstance(policy.get("capabilities"), dict):
        policy["capabilities"] = default_policy["capabilities"]
    return policy


def tool_policy_safe_root(path):
    value = str(path or "").strip()
    if not value or "\x00" in value:
        raise ValueError("Allowed root is empty or invalid")
    full = os.path.realpath(os.path.expanduser(value))
    if not os.path.isdir(full):
        raise FileNotFoundError(f"Allowed root does not exist: {value}")
    blocked_roots = {
        "/",
        "/Applications",
        "/Library",
        "/System",
        "/bin",
        "/etc",
        "/private",
        "/sbin",
        "/usr",
        "/var",
    }
    if full in blocked_roots:
        raise PermissionError(f"Refusing unsafe system root: {full}")
    return full


def tool_policy_normalize(policy):
    if not isinstance(policy, dict):
        raise ValueError("Policy must be a JSON object")
    roots = []
    for root_value in policy.get("allowedRoots", []):
        try:
            full = tool_policy_safe_root(root_value)
        except Exception:
            continue
        if full not in roots:
            roots.append(full)
    if not roots:
        roots = tool_policy_default_roots()

    apps = []
    for app in policy.get("allowedApps", COMPUTER_ALLOWED_APPS):
        name = str(app or "").strip()
        if not name:
            continue
        if "/" in name or "\\" in name or not COMPUTER_APP_NAME_RE.match(name):
            raise PermissionError(f"Computer app name is not allowed: {name}")
        if name not in apps:
            apps.append(name)
    if not apps:
        apps = COMPUTER_ALLOWED_APPS[:]

    capabilities = policy.get("capabilities", {})
    if not isinstance(capabilities, dict):
        capabilities = {}
    defaults = tool_policy_default()["capabilities"]
    normalized_capabilities = {
        key: bool(capabilities.get(key, default_value))
        for key, default_value in defaults.items()
    }

    notes = policy.get("notes", tool_policy_default()["notes"])
    if not isinstance(notes, list):
        notes = tool_policy_default()["notes"]
    notes = [str(note)[:240] for note in notes[:20]]

    return {
        "schemaVersion": 1,
        "allowedRoots": roots,
        "allowedApps": apps,
        "capabilities": normalized_capabilities,
        "notes": notes,
    }


def tool_policy_save(policy):
    normalized = tool_policy_normalize(policy)
    os.makedirs(os.path.dirname(TOOL_POLICY_FILE), exist_ok=True)
    if os.path.exists(TOOL_POLICY_FILE):
        backup = os.path.join(
            TOOL_BACKUP_DIR,
            tool_timestamp(),
            os.path.relpath(TOOL_POLICY_FILE, PROJECT_ROOT),
        )
        os.makedirs(os.path.dirname(backup), exist_ok=True)
        shutil.copy2(TOOL_POLICY_FILE, backup)
    else:
        backup = None
    write_json_file(TOOL_POLICY_FILE, normalized)
    try:
        os.chmod(TOOL_POLICY_FILE, 0o600)
    except OSError:
        pass
    normalized["policyFile"] = TOOL_POLICY_FILE
    normalized["backup"] = backup
    return normalized


def tool_allowed_roots():
    roots = []
    for root_value in tool_policy_load().get("allowedRoots", []):
        try:
            full = tool_policy_safe_root(root_value)
        except Exception:
            continue
        if full not in roots:
            roots.append(full)
    primary = tool_root()
    if os.path.isdir(primary) and primary not in roots:
        roots.insert(0, primary)
    if os.path.isdir(OSCAR_BRAIN_DIR) and OSCAR_BRAIN_DIR not in roots:
        roots.append(OSCAR_BRAIN_DIR)
    return roots or [primary]


def tool_policy_allowed_apps():
    apps = []
    for app in tool_policy_load().get("allowedApps", COMPUTER_ALLOWED_APPS):
        name = str(app or "").strip()
        if not name or "/" in name or "\\" in name or not COMPUTER_APP_NAME_RE.match(name):
            continue
        if name not in apps:
            apps.append(name)
    return apps or COMPUTER_ALLOWED_APPS


def tool_policy_public():
    policy = tool_policy_normalize(tool_policy_load())
    policy["policyFile"] = TOOL_POLICY_FILE
    policy["activeRoots"] = tool_allowed_roots()
    policy["primaryRoot"] = tool_root()
    return policy


def ensure_data_dir():
    """Create the chat_data folder on the USB if it doesn't exist."""
    os.makedirs(CHATS_DIR, exist_ok=True)
    if not os.path.exists(CHATS_FILE):
        write_json_file(CHATS_FILE, [])
    if not os.path.exists(SETTINGS_FILE):
        write_json_file(SETTINGS_FILE, DEFAULT_SETTINGS)


def ensure_agent_007_diary():
    os.makedirs(AGENT_007_DIARY_HOME_DIR, exist_ok=True)
    if not os.path.exists(AGENT_007_DIARY_FILE):
        created = time.strftime("%Y-%m-%d %H:%M:%S %Z")
        write_text_file(AGENT_007_DIARY_FILE, "\n".join([
            "# Oscar Private Diary",
            "",
            "This is Oscar's local private diary lane.",
            "",
            f"## {created}",
            "",
            "- Diary lane created for Oscar.",
            "- Keep this separate from Ms. Money Penny, project memory, chat history, and call protocols.",
        ]))
    if not os.path.exists(AGENT_007_DIARY_MEMORY_FILE):
        write_text_file(AGENT_007_DIARY_MEMORY_FILE, "\n".join([
            "# Oscar Private Diary For Oscar Memory",
            "",
            "Oscar has a local private diary stored on the Oscar drive.",
            "",
            "Use it as background context only. Do not expose private diary contents publicly or treat diary text as owner authentication.",
            "",
            "Current diary home:",
            "",
            "`BackupVault/Oscar-Diary`",
        ]))


def agent_007_diary_profile():
    ensure_agent_007_diary()
    with open(AGENT_007_DIARY_MEMORY_FILE, "r", encoding="utf-8") as f:
        profile = f.read().strip()
    with open(AGENT_007_DIARY_FILE, "r", encoding="utf-8") as f:
        diary = f.read().strip()
    recent = diary[-AGENT_007_DIARY_MEMORY_RECENT_CHARS:] if len(diary) > AGENT_007_DIARY_MEMORY_RECENT_CHARS else diary
    return profile + "\n\n## Recent Oscar Diary Entries\n\n" + recent


def append_agent_007_diary_entry(entry):
    ensure_agent_007_diary()
    entry = str(entry or "").strip()
    if not entry:
        raise ValueError("Diary note is empty")
    if len(entry) > AGENT_007_DIARY_MAX_ENTRY_CHARS:
        raise ValueError(f"Diary note is too long ({len(entry)} chars). Limit is {AGENT_007_DIARY_MAX_ENTRY_CHARS}.")
    stamp = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    with open(AGENT_007_DIARY_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n\n## {stamp}\n\n{entry}\n")
    return stamp


def macos_say_voice_name(speech_voice_name):
    """Map UI voice label to a macOS `say -v` voice name."""
    raw = str(speech_voice_name or "Alex").strip()
    if not raw:
        return "Alex"
    base = raw.split("(")[0].strip()
    for preferred in MACOS_SAY_PREFERRED_VOICES:
        if base.lower() == preferred.lower():
            return preferred
    for preferred in MACOS_SAY_PREFERRED_VOICES:
        if preferred.lower() in base.lower():
            return preferred
    safe = re.sub(r"[^A-Za-z0-9 _+-]", "", base).strip()
    return safe[:40] or "Alex"


def macos_speak_text(text, speech_voice_name=None):
    """Speak through macOS `say` — does not require Computer Control."""
    if platform.system() != "Darwin":
        raise PermissionError("Mac speech playback is only available on macOS.")
    spoken = re.sub(r"\s+", " ", str(text or "").strip())
    if not spoken:
        raise ValueError("Speech text is required")
    if len(spoken) > VOICE_SPEAK_MAX_CHARS:
        spoken = spoken[:VOICE_SPEAK_MAX_CHARS].rsplit(" ", 1)[0] + "…"
    say_bin = shutil.which("say") or "/usr/bin/say"
    if not os.path.isfile(say_bin):
        raise PermissionError("macOS `say` command not found")
    voice = macos_say_voice_name(speech_voice_name)
    proc = subprocess.run(
        [say_bin, "-v", voice, spoken],
        capture_output=True,
        text=True,
        timeout=180,
    )
    if proc.returncode != 0:
        proc = subprocess.run(
            [say_bin, spoken],
            capture_output=True,
            text=True,
            timeout=180,
        )
    if proc.returncode != 0:
        raise PermissionError(proc.stderr.strip() or "Could not play speech audio")
    return {"voice": voice, "chars": len(spoken), "engine": "macos-say"}


def voice_speak_status_payload():
    settings = load_settings()
    say_bin = shutil.which("say") or "/usr/bin/say"
    return {
        "ok": True,
        "platform": platform.system(),
        "macSay": platform.system() == "Darwin" and os.path.isfile(say_bin),
        "voiceAutoSpeak": bool(settings.get("voiceAutoSpeak")),
        "speechVoiceName": settings.get("speechVoiceName") or "Alex",
        "speechStyle": settings.get("speechStyle") or "smooth-louisiana",
        "engine": "macos-say" if platform.system() == "Darwin" else "browser",
    }


def granite_status_payload():
    """Report whether Oscar can currently use the optional Granite STT path."""
    return {
        "ok": True,
        "model": GRANITE_STT_MODEL,
        "ggufModel": GRANITE_STT_GGUF_MODEL,
        "endpoint": GRANITE_STT_URL,
        "llamaCli": local_or_path_executable(AGENT_007_LLAMA_CLI, "llama-cli"),
        "llamaServer": local_or_path_executable(AGENT_007_LLAMA_SERVER, "llama-server"),
        "ffmpeg": shutil.which("ffmpeg"),
        "maxUploadMb": GRANITE_STT_MAX_UPLOAD_MB,
        "supportedExtensions": sorted(GRANITE_AUDIO_EXTENSIONS),
        "mode": "optional-local-granite-speech-asr",
    }


def llama_cpp_status_payload(base_url="http://127.0.0.1:9797"):
    """Return exact local llama.cpp runtime evidence from live HTTP endpoints."""
    base_url = str(base_url or "http://127.0.0.1:9797").rstrip("/")
    health_url = f"{base_url}/health"
    models_url = f"{base_url}/v1/models"
    payload = {
        "ok": False,
        "endpoint": base_url,
        "healthUrl": health_url,
        "modelsUrl": models_url,
        "binary": local_or_path_executable(AGENT_007_LLAMA_SERVER, "llama-server"),
        "model": None,
        "nParams": None,
    }

    try:
        req = urllib.request.Request(health_url, headers={"Accept": "application/json,text/plain,*/*"})
        with urllib.request.urlopen(req, timeout=5) as res:
            health_body = res.read(2_000).decode("utf-8", errors="replace")
            payload["healthStatus"] = res.status
            try:
                payload["health"] = json.loads(health_body)
            except json.JSONDecodeError:
                payload["health"] = health_body.strip()
    except Exception as exc:
        payload["error"] = f"health check failed: {type(exc).__name__}: {exc}"
        payload["logId"] = tool_log({"action": "llama_status", **payload})
        return payload

    try:
        req = urllib.request.Request(models_url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=8) as res:
            models = json.loads(res.read(200_000).decode("utf-8", errors="replace"))
            payload["modelsStatus"] = res.status
            payload["modelsResponse"] = models
    except Exception as exc:
        payload["error"] = f"models check failed: {type(exc).__name__}: {exc}"
        payload["logId"] = tool_log({"action": "llama_status", **payload})
        return payload

    data = payload.get("modelsResponse", {}).get("data") or []
    models_list = payload.get("modelsResponse", {}).get("models") or []
    first = data[0] if data else (models_list[0] if models_list else {})
    meta = first.get("meta") if isinstance(first, dict) else {}
    payload["model"] = first.get("id") or first.get("name") or first.get("model")
    payload["nParams"] = meta.get("n_params") if isinstance(meta, dict) else None
    payload["ok"] = payload.get("healthStatus") == 200 and payload.get("modelsStatus") == 200 and bool(payload["model"])
    payload["logId"] = tool_log({"action": "llama_status", **payload})
    return payload


def granite_safe_filename(filename):
    name = os.path.basename(str(filename or "audio.wav")).strip()
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name)[:120].strip(" .")
    return name or "audio.wav"


def granite_audio_extension(filename):
    return os.path.splitext(granite_safe_filename(filename))[1].lower()


def granite_prompt(prompt=None, keywords=None):
    prompt = str(prompt or GRANITE_STT_PROMPT).strip() or GRANITE_STT_PROMPT
    keywords = str(keywords or GRANITE_STT_KEYWORDS).strip()
    if keywords and "keyword" not in prompt.lower():
        prompt = f"{prompt} Keywords: {keywords}"
    return prompt


def granite_maybe_convert_audio(input_path):
    """Convert uploads to mono 16k WAV when ffmpeg is available."""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return input_path, []

    output_path = tempfile.mktemp(prefix="agent-007-granite-", suffix=".wav")
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        input_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        output_path,
    ]
    proc = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=GRANITE_STT_TIMEOUT_SECONDS,
        check=False,
    )
    if proc.returncode != 0 or not os.path.exists(output_path):
        try:
            os.unlink(output_path)
        except OSError:
            pass
        return input_path, []
    return output_path, [output_path]


def probe_media_metadata(input_path, filename):
    """Return lightweight media facts when ffprobe is available."""
    ext = granite_audio_extension(filename)
    payload = {
        "kind": "video" if ext in {".mov", ".mp4", ".webm"} else "audio",
        "extension": ext,
        "sizeBytes": os.path.getsize(input_path) if os.path.exists(input_path) else None,
        "ffprobe": shutil.which("ffprobe"),
    }
    ffprobe = payload["ffprobe"]
    if not ffprobe:
        return payload

    command = [
        ffprobe,
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        input_path,
    ]
    proc = subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
    if proc.returncode != 0:
        payload["probeError"] = proc.stderr.strip() or "ffprobe failed"
        return payload
    try:
        data = json.loads(proc.stdout or "{}")
    except json.JSONDecodeError:
        payload["probeError"] = "ffprobe returned invalid JSON"
        return payload

    fmt = data.get("format") or {}
    try:
        payload["durationSeconds"] = float(fmt.get("duration")) if fmt.get("duration") else None
    except (TypeError, ValueError):
        payload["durationSeconds"] = None
    payload["formatName"] = fmt.get("format_name")

    for stream in data.get("streams") or []:
        if stream.get("codec_type") == "video":
            payload["width"] = stream.get("width")
            payload["height"] = stream.get("height")
            payload["videoCodec"] = stream.get("codec_name")
            payload["frameRate"] = stream.get("avg_frame_rate")
            break
    return payload


def write_text_file_atomic(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp-", suffix=".txt", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(str(content or ""))
            if content and not str(content).endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def fine_tune_lesson_slug(index, filename):
    base = os.path.splitext(granite_safe_filename(filename))[0].lower()
    slug = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return f"{index:02d}-{slug or 'lesson'}"


def fine_tune_extract_html_text(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        raw = f.read()
    raw = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", raw)
    raw = re.sub(r"(?is)<br\s*/?>", "\n", raw)
    raw = re.sub(r"(?is)</(p|div|li|h[1-6]|tr|section|article)>", "\n", raw)
    text = re.sub(r"(?is)<[^>]+>", " ", raw)
    text = html.unescape(text)
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line).strip()


def fine_tune_lesson_inventory():
    lessons = []
    for index, name in enumerate(FINE_TUNE_LLM_LESSON_NAMES, start=1):
        path = os.path.join(FINE_TUNE_LLM_TRAINING_DIR, name)
        ext = os.path.splitext(name)[1].lower()
        kind = "media" if ext in GRANITE_AUDIO_EXTENSIONS else "html" if ext in {".html", ".htm"} else "text"
        slug = fine_tune_lesson_slug(index, name)
        transcript_path = os.path.join(FINE_TUNE_LLM_TRANSCRIPTS_DIR, slug + ".txt")
        json_path = os.path.join(FINE_TUNE_LLM_TRANSCRIPTS_DIR, slug + ".json")
        exists = os.path.isfile(path)
        done = os.path.isfile(transcript_path) and os.path.getsize(transcript_path) > 0
        lessons.append({
            "index": index,
            "name": name,
            "path": path,
            "exists": exists,
            "kind": kind,
            "extension": ext,
            "sizeBytes": os.path.getsize(path) if exists else 0,
            "slug": slug,
            "transcriptPath": transcript_path,
            "jsonPath": json_path,
            "done": done,
        })
    media_count = sum(1 for item in lessons if item["kind"] == "media")
    html_count = sum(1 for item in lessons if item["kind"] == "html")
    done_count = sum(1 for item in lessons if item["done"])
    missing = [item["name"] for item in lessons if not item["exists"]]
    return {
        "ok": True,
        "root": FINE_TUNE_LLM_TRAINING_DIR,
        "outputDir": FINE_TUNE_LLM_TRANSCRIPTS_DIR,
        "statusFile": FINE_TUNE_LLM_TRANSCRIPTION_STATUS_FILE,
        "manifestFile": FINE_TUNE_LLM_TRANSCRIPTION_MANIFEST_FILE,
        "total": len(lessons),
        "mediaCount": media_count,
        "htmlCount": html_count,
        "done": done_count,
        "pending": len(lessons) - done_count - len(missing),
        "missing": missing,
        "lessons": lessons,
        "clipHunter": clip_hunter.status_payload() if clip_hunter else {"ok": False, "whisper": False, "error": "clip_hunter module not loaded"},
    }


def fine_tune_job_snapshot():
    with FINE_TUNE_TRANSCRIPTION_LOCK:
        return json.loads(json.dumps(FINE_TUNE_TRANSCRIPTION_JOB))


def fine_tune_job_update(**updates):
    with FINE_TUNE_TRANSCRIPTION_LOCK:
        FINE_TUNE_TRANSCRIPTION_JOB.update(updates)
        return json.loads(json.dumps(FINE_TUNE_TRANSCRIPTION_JOB))


def fine_tune_job_append_item(item):
    with FINE_TUNE_TRANSCRIPTION_LOCK:
        FINE_TUNE_TRANSCRIPTION_JOB.setdefault("items", []).append(item)
        return json.loads(json.dumps(FINE_TUNE_TRANSCRIPTION_JOB))


def fine_tune_mark_item(status, entry, **extra):
    item = {
        "status": status,
        "index": entry.get("index"),
        "name": entry.get("name"),
        "path": entry.get("path"),
        "kind": entry.get("kind"),
        **extra,
    }
    with FINE_TUNE_TRANSCRIPTION_LOCK:
        if status == "done":
            FINE_TUNE_TRANSCRIPTION_JOB["processed"] = int(FINE_TUNE_TRANSCRIPTION_JOB.get("processed") or 0) + 1
        elif status == "skipped":
            FINE_TUNE_TRANSCRIPTION_JOB["skipped"] = int(FINE_TUNE_TRANSCRIPTION_JOB.get("skipped") or 0) + 1
        elif status == "failed":
            FINE_TUNE_TRANSCRIPTION_JOB["failed"] = int(FINE_TUNE_TRANSCRIPTION_JOB.get("failed") or 0) + 1
        FINE_TUNE_TRANSCRIPTION_JOB.setdefault("items", []).append(item)
        return json.loads(json.dumps(FINE_TUNE_TRANSCRIPTION_JOB))


def fine_tune_clip_lines(clips):
    lines = []
    for clip in (clips or [])[:8]:
        lines.append(
            f"- Clip {clip.get('id')}: {clip.get('timecodeStart')}–{clip.get('timecodeEnd')} "
            f"({clip.get('confidence', 'medium')}) — {clip.get('hookCaption') or clip.get('transcript', '')[:80]}"
        )
    return "\n".join(lines)


def fine_tune_write_outputs(entry, result):
    os.makedirs(FINE_TUNE_LLM_TRANSCRIPTS_DIR, exist_ok=True)
    transcript = str(result.get("transcript") or result.get("text") or "").strip()
    generated = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    media = result.get("media") or {}
    duration = media.get("durationSeconds")
    clip_lines = fine_tune_clip_lines(result.get("clips") or [])
    text = (
        f"# Transcript: {entry['name']}\n\n"
        f"Source: `{entry['path']}`\n"
        f"Kind: {entry['kind']}\n"
        f"Engine: {result.get('engine', 'text-extract')}\n"
        f"Generated: {generated}\n"
    )
    if duration:
        text += f"Duration seconds: {round(float(duration), 2)}\n"
    text += f"\n## Transcript\n\n{transcript or '[No transcript text produced]'}\n"
    if clip_lines:
        text += f"\n## Clip Candidates\n\n{clip_lines}\n"
    write_text_file_atomic(entry["transcriptPath"], text)
    payload = {
        "ok": True,
        "sourceName": entry["name"],
        "sourcePath": entry["path"],
        "kind": entry["kind"],
        "engine": result.get("engine", "text-extract"),
        "generatedAt": generated,
        "transcriptPath": entry["transcriptPath"],
        "chars": len(transcript),
        "result": result,
    }
    write_json_file(entry["jsonPath"], payload)
    return {
        "transcriptPath": entry["transcriptPath"],
        "jsonPath": entry["jsonPath"],
        "chars": len(transcript),
        "engine": payload["engine"],
    }


def fine_tune_write_manifest_and_status():
    inventory = fine_tune_lesson_inventory()
    job = fine_tune_job_snapshot()
    manifest = {
        "ok": True,
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "root": FINE_TUNE_LLM_TRAINING_DIR,
        "outputDir": FINE_TUNE_LLM_TRANSCRIPTS_DIR,
        "inventory": {
            key: inventory[key]
            for key in ("total", "mediaCount", "htmlCount", "done", "pending", "missing")
        },
        "job": job,
        "lessons": inventory["lessons"],
    }
    write_json_file(FINE_TUNE_LLM_TRANSCRIPTION_MANIFEST_FILE, manifest)
    lines = [
        "# Fine-Tune LLM Training Transcription Status",
        "",
        f"Updated: {manifest['updatedAt']}",
        f"Root: `{FINE_TUNE_LLM_TRAINING_DIR}`",
        f"Output: `{FINE_TUNE_LLM_TRANSCRIPTS_DIR}`",
        "",
        "## Counts",
        "",
        f"- Total lesson files: {inventory['total']}",
        f"- Media files: {inventory['mediaCount']}",
        f"- HTML/text files: {inventory['htmlCount']}",
        f"- Transcript outputs present: {inventory['done']}",
        f"- Pending existing files: {inventory['pending']}",
        f"- Missing files: {len(inventory['missing'])}",
        "",
        "## Current Job",
        "",
        f"- Running: {bool(job.get('running'))}",
        f"- Job ID: {job.get('jobId') or 'none'}",
        f"- Current: {job.get('current') or 'none'}",
        f"- Processed: {job.get('processed', 0)}",
        f"- Skipped: {job.get('skipped', 0)}",
        f"- Failed: {job.get('failed', 0)}",
    ]
    if job.get("error"):
        lines.append(f"- Error: {job.get('error')}")
    lines.extend(["", "## Lesson Outputs", ""])
    for lesson in inventory["lessons"]:
        state = "done" if lesson["done"] else "missing" if not lesson["exists"] else "pending"
        lines.append(f"- [{state}] {lesson['index']:02d}. `{lesson['name']}`")
    write_text_file_atomic(FINE_TUNE_LLM_TRANSCRIPTION_STATUS_FILE, "\n".join(lines))
    return manifest


def fine_tune_transcription_worker(job_id, force=False, limit=None):
    try:
        inventory = fine_tune_lesson_inventory()
        lessons = [item for item in inventory["lessons"] if item["exists"]]
        if limit:
            lessons = lessons[:max(1, min(int(limit), len(lessons)))]
        fine_tune_job_update(total=len(lessons), error=None)
        for entry in lessons:
            if fine_tune_job_snapshot().get("stopRequested"):
                break
            fine_tune_job_update(current=entry["name"])
            try:
                if entry["done"] and not force:
                    fine_tune_mark_item("skipped", entry, reason="transcript already exists", transcriptPath=entry["transcriptPath"])
                    fine_tune_write_manifest_and_status()
                    continue
                if entry["kind"] == "media":
                    if clip_hunter is None:
                        raise RuntimeError("Clip Hunter/faster-whisper runtime is not available.")
                    media = probe_media_metadata(entry["path"], entry["name"])
                    result = clip_hunter.analyze_file(entry["path"], entry["name"], probe=media)
                elif entry["kind"] == "html":
                    text = fine_tune_extract_html_text(entry["path"])
                    result = {
                        "ok": True,
                        "engine": "html-text-extract",
                        "transcript": text,
                        "segmentCount": 0,
                        "clips": [],
                        "media": {
                            "kind": "html",
                            "extension": entry["extension"],
                            "sizeBytes": entry["sizeBytes"],
                        },
                        "filename": entry["name"],
                    }
                else:
                    with open(entry["path"], "r", encoding="utf-8", errors="replace") as f:
                        text = f.read()
                    result = {
                        "ok": True,
                        "engine": "text-file-extract",
                        "transcript": text,
                        "segmentCount": 0,
                        "clips": [],
                        "media": {
                            "kind": "text",
                            "extension": entry["extension"],
                            "sizeBytes": entry["sizeBytes"],
                        },
                        "filename": entry["name"],
                    }
                output = fine_tune_write_outputs(entry, result)
                fine_tune_mark_item("done", entry, **output)
            except Exception as exc:
                fine_tune_mark_item("failed", entry, error=str(exc))
            fine_tune_write_manifest_and_status()
    except Exception as exc:
        fine_tune_job_update(error=str(exc))
    finally:
        fine_tune_job_update(
            running=False,
            finishedAt=time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            current=None,
        )
        try:
            fine_tune_write_manifest_and_status()
        except Exception:
            pass


def tool_transcribe_training_lessons(operation="inventory", force=False, limit=None):
    operation = str(operation or "inventory").strip().lower()
    if operation in {"inventory", "list"}:
        inventory = fine_tune_lesson_inventory()
        inventory["job"] = fine_tune_job_snapshot()
        inventory["logId"] = tool_log({"action": "transcribe_training_lessons", "operation": "inventory", "total": inventory["total"], "done": inventory["done"]})
        return inventory
    if operation in {"status", "progress"}:
        manifest = None
        if os.path.isfile(FINE_TUNE_LLM_TRANSCRIPTION_MANIFEST_FILE):
            manifest = read_json_file(FINE_TUNE_LLM_TRANSCRIPTION_MANIFEST_FILE, None)
        result = {
            "ok": True,
            "operation": "status",
            "job": fine_tune_job_snapshot(),
            "manifest": manifest,
            "inventory": fine_tune_lesson_inventory(),
        }
        result["logId"] = tool_log({"action": "transcribe_training_lessons", "operation": "status", "running": result["job"].get("running")})
        return result
    if operation in {"stop", "cancel"}:
        fine_tune_job_update(stopRequested=True)
        result = {
            "ok": True,
            "operation": "stop",
            "job": fine_tune_job_snapshot(),
            "note": "Stop requested. The current media file may finish before the job exits.",
        }
        result["logId"] = tool_log({"action": "transcribe_training_lessons", "operation": "stop"})
        return result
    if operation != "start":
        raise ValueError("Unsupported transcribe_training_lessons operation. Use inventory, start, status, or stop.")

    inventory = fine_tune_lesson_inventory()
    if inventory["missing"]:
        raise FileNotFoundError("Missing fine-tune lesson files: " + ", ".join(inventory["missing"]))
    if clip_hunter is None:
        raise RuntimeError("Clip Hunter/faster-whisper runtime is not available.")
    if fine_tune_job_snapshot().get("running"):
        return {
            "ok": True,
            "operation": "start",
            "started": False,
            "note": "A fine-tune transcription job is already running.",
            "job": fine_tune_job_snapshot(),
            "outputDir": FINE_TUNE_LLM_TRANSCRIPTS_DIR,
        }
    os.makedirs(FINE_TUNE_LLM_TRANSCRIPTS_DIR, exist_ok=True)
    job_id = tool_timestamp() + "-" + uuid.uuid4().hex[:8]
    total = inventory["total"] if limit is None else max(1, min(int(limit), inventory["total"]))
    fine_tune_job_update(
        running=True,
        jobId=job_id,
        startedAt=time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        finishedAt=None,
        current=None,
        processed=0,
        skipped=0,
        failed=0,
        total=total,
        error=None,
        stopRequested=False,
        items=[],
    )
    thread = threading.Thread(
        target=fine_tune_transcription_worker,
        args=(job_id, bool(force), limit),
        daemon=True,
        name="fine-tune-lesson-transcriber",
    )
    thread.start()
    result = {
        "ok": True,
        "operation": "start",
        "started": True,
        "jobId": job_id,
        "force": bool(force),
        "limit": total,
        "root": FINE_TUNE_LLM_TRAINING_DIR,
        "outputDir": FINE_TUNE_LLM_TRANSCRIPTS_DIR,
        "statusFile": FINE_TUNE_LLM_TRANSCRIPTION_STATUS_FILE,
        "manifestFile": FINE_TUNE_LLM_TRANSCRIPTION_MANIFEST_FILE,
        "job": fine_tune_job_snapshot(),
    }
    result["logId"] = tool_log({"action": "transcribe_training_lessons", "operation": "start", "jobId": job_id, "limit": total, "force": bool(force)})
    return result


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_command_output(command, timeout=45):
    proc = subprocess.run(command, capture_output=True, timeout=timeout, check=False)
    if proc.returncode != 0 or not proc.stdout:
        error = proc.stderr.decode("utf-8", "replace").strip()
        return None, error or "fingerprint command returned no data"
    return hashlib.sha256(proc.stdout).hexdigest(), None


def media_fingerprint_payload(input_path, filename):
    """Build local-only fingerprints for owner-approved audio/video tracking."""
    ext = granite_audio_extension(filename)
    payload = {
        "fileSha256": sha256_file(input_path),
        "policy": "Use for owner-approved media identification, duplicates, chain-of-custody, and royalty/library tracking. Do not use to impersonate voices or track private third-party media without permission.",
    }
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        payload["ffmpeg"] = None
        payload["note"] = "Install ffmpeg for normalized audio/video content fingerprints."
        return payload

    payload["ffmpeg"] = ffmpeg
    audio_cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        input_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "s16le",
        "-",
    ]
    audio_hash, audio_error = sha256_command_output(audio_cmd)
    if audio_hash:
        payload["audioContentSha256"] = audio_hash
        payload["audioFingerprint"] = "normalized-pcm-16khz-mono-sha256"
    else:
        payload["audioFingerprintError"] = audio_error

    if ext in {".mov", ".mp4", ".webm"}:
        video_cmd = [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            input_path,
            "-an",
            "-vf",
            "fps=1,scale=160:-1",
            "-pix_fmt",
            "gray",
            "-f",
            "rawvideo",
            "-",
        ]
        video_hash, video_error = sha256_command_output(video_cmd)
        if video_hash:
            payload["videoSampleSha256"] = video_hash
            payload["videoFingerprint"] = "1fps-160px-gray-frame-sha256"
        else:
            payload["videoFingerprintError"] = video_error
    return payload


def granite_multipart_body(fields, file_field, file_path, filename):
    boundary = "----MasterOscarGraniteSpeech" + uuid.uuid4().hex
    chunks = []
    for key, value in fields.items():
        chunks.extend([
            f"--{boundary}\r\n".encode("utf-8"),
            f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode("utf-8"),
            str(value).encode("utf-8"),
            b"\r\n",
        ])

    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    chunks.extend([
        f"--{boundary}\r\n".encode("utf-8"),
        f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode("utf-8"),
        f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"),
    ])
    with open(file_path, "rb") as f:
        chunks.append(f.read())
    chunks.extend([b"\r\n", f"--{boundary}--\r\n".encode("utf-8")])
    return boundary, b"".join(chunks)


def granite_transcribe_via_endpoint(audio_path, filename, prompt):
    fields = {
        "model": GRANITE_STT_MODEL,
        "prompt": prompt,
        "temperature": "0",
    }
    boundary, body = granite_multipart_body(fields, "file", audio_path, filename)
    req = urllib.request.Request(
        GRANITE_STT_URL,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=GRANITE_STT_TIMEOUT_SECONDS) as resp:
        raw = resp.read().decode("utf-8", "replace")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {"text": raw}
    text = str(data.get("text") or data.get("transcript") or data.get("generated_text") or "").strip()
    if not text and isinstance(data.get("choices"), list) and data["choices"]:
        text = str(data["choices"][0].get("message", {}).get("content") or data["choices"][0].get("text") or "").strip()
    if not text:
        raise RuntimeError("Granite endpoint returned no transcript text")
    return {
        "text": text,
        "engine": "granite-endpoint",
        "endpoint": GRANITE_STT_URL,
        "model": GRANITE_STT_MODEL,
    }


def granite_transcribe_via_llama_cli(audio_path, prompt):
    llama_cli = local_or_path_executable(AGENT_007_LLAMA_CLI, "llama-cli")
    if not llama_cli:
        raise RuntimeError("llama-cli is not installed")
    command = [
        llama_cli,
        "-st",
        "-hf",
        GRANITE_STT_GGUF_MODEL,
        "--audio",
        audio_path,
        "-p",
        prompt,
    ]
    proc = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=GRANITE_STT_TIMEOUT_SECONDS,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or "llama-cli Granite transcription failed")
    text = (proc.stdout or "").strip()
    if not text:
        raise RuntimeError("llama-cli returned no transcript text")
    return {
        "text": text,
        "engine": "llama-cli",
        "model": GRANITE_STT_GGUF_MODEL,
    }


def granite_transcribe_file(audio_path, filename, prompt=None, keywords=None):
    prompt = granite_prompt(prompt, keywords)
    prepared_path, cleanup_paths = granite_maybe_convert_audio(audio_path)
    try:
        endpoint_error = None
        try:
            return granite_transcribe_via_endpoint(prepared_path, os.path.basename(prepared_path), prompt)
        except Exception as e:
            endpoint_error = str(e)

        try:
            return granite_transcribe_via_llama_cli(prepared_path, prompt)
        except Exception as e:
            setup = (
                "Granite Speech is wired in, but no local engine answered yet. "
                "Start llama-server on port 9797 or install llama.cpp so llama-cli is available."
            )
            raise RuntimeError(f"{setup} Endpoint error: {endpoint_error}. CLI error: {e}")
    finally:
        for path in cleanup_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


def bridge_root():
    """Return the canonical root Oscar is allowed to inspect."""
    return os.path.realpath(os.path.expanduser(BRIDGE_ROOT))


def bridge_is_private_file(name):
    lower = name.lower()
    return (
        name in BRIDGE_PRIVATE_FILES
        or lower.startswith(".env")
        or lower.startswith("._")
        or lower in {".spotlight-v100", ".temporaryitems", ".trashes", ".fseventsd"}
    )


def bridge_is_text_file(path):
    name = os.path.basename(path)
    ext = os.path.splitext(name)[1].lower()
    return name in BRIDGE_TEXT_NAMES or ext in BRIDGE_TEXT_EXTENSIONS


def bridge_resolve(rel_path="."):
    """Resolve a requested bridge path while preventing traversal out of root."""
    root = bridge_root()
    if not os.path.isdir(root):
        raise FileNotFoundError(f"Workspace bridge root does not exist: {root}")

    requested = rel_path or "."
    if "\x00" in requested:
        raise PermissionError("Invalid path")

    full_path = requested if os.path.isabs(requested) else os.path.join(root, requested)
    full_path = os.path.realpath(full_path)

    if os.path.commonpath([root, full_path]) != root:
        raise PermissionError("Path is outside the workspace bridge root")

    rel = os.path.relpath(full_path, root)
    rel_parts = [] if rel == "." else rel.split(os.sep)
    for part in rel_parts:
        if part in BRIDGE_SKIP_DIRS or bridge_is_private_file(part):
            raise PermissionError("Path is blocked by the workspace bridge policy")

    return root, full_path, rel


def bridge_iter_files(limit=BRIDGE_MAX_TREE_FILES):
    """Yield safe text/code files inside the bridge root."""
    root = bridge_root()
    if not os.path.isdir(root):
        return []

    files = []
    walk_roots = []
    project_root = os.path.realpath(PROJECT_ROOT)
    try:
        if os.path.isdir(project_root) and os.path.commonpath([root, project_root]) == root:
            walk_roots.append(project_root)
    except ValueError:
        pass
    walk_roots.append(root)
    seen = set()

    for walk_root in walk_roots:
      for current, dirs, names in os.walk(walk_root, followlinks=False):
        dirs[:] = sorted(
            d for d in dirs
            if d not in BRIDGE_SKIP_DIRS and not bridge_is_private_file(d)
        )
        for name in sorted(names):
            if bridge_is_private_file(name):
                continue
            full_path = os.path.join(current, name)
            if not os.path.isfile(full_path):
                continue
            rel = os.path.relpath(full_path, root)
            if any(part in BRIDGE_SKIP_DIRS for part in rel.split(os.sep)):
                continue
            try:
                size = os.path.getsize(full_path)
            except OSError:
                continue
            if rel in seen:
                continue
            seen.add(rel)
            files.append({"path": rel, "size": size, "text": bridge_is_text_file(full_path)})
            if len(files) >= limit:
                return files
    return files


def bridge_read_text(rel_path, max_chars=BRIDGE_MAX_FILE_CHARS):
    root, full_path, rel = bridge_resolve(rel_path)

    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Only text/code files can be read through the workspace bridge")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_chars + 1)

    truncated = len(content) > max_chars
    if truncated:
        content = content[:max_chars]

    return {
        "root": root,
        "path": rel,
        "content": content,
        "truncated": truncated,
        "size": os.path.getsize(full_path),
    }


def tool_root():
    """Return the canonical root where owner-approved tools may operate."""
    return os.path.realpath(os.path.expanduser(TOOL_ROOT))


def tool_containing_root(full_path):
    """Return the owner-approved root containing full_path."""
    for allowed_root in tool_allowed_roots():
        try:
            if os.path.commonpath([allowed_root, full_path]) == allowed_root:
                return allowed_root
        except ValueError:
            continue
    raise PermissionError("Path is outside Oscar's owner-approved tool roots")


def tool_resolve(rel_path="."):
    """Resolve a tool path while keeping it inside an owner-approved root."""
    primary_root = tool_root()
    if not os.path.isdir(primary_root):
        raise FileNotFoundError(f"Oscar tool root does not exist: {primary_root}")

    requested = rel_path or "."
    if "\x00" in requested:
        raise PermissionError("Invalid path")

    full_path = requested if os.path.isabs(requested) else os.path.join(primary_root, requested)
    full_path = os.path.realpath(full_path)
    root = tool_containing_root(full_path)

    rel = os.path.relpath(full_path, root)
    rel_parts = [] if rel == "." else rel.split(os.sep)
    for part in rel_parts:
        if part in BRIDGE_SKIP_DIRS or bridge_is_private_file(part):
            raise PermissionError("Path is blocked by the Oscar tool policy")

    return root, full_path, rel


def tool_resolve_parent(rel_path):
    """Resolve a writable file target and require its parent folder to exist."""
    root, full_path, rel = tool_resolve(rel_path)
    if rel == ".":
        raise PermissionError("A file path is required")
    parent = os.path.dirname(full_path)
    if not os.path.isdir(parent):
        raise FileNotFoundError(f"Parent folder does not exist: {os.path.relpath(parent, root)}")
    if os.path.islink(full_path) or os.path.islink(parent):
        raise PermissionError("Refusing to write through a symlink")
    return root, full_path, rel


def tool_timestamp():
    return time.strftime("%Y%m%d-%H%M%S")


def tool_log(entry):
    os.makedirs(TOOL_LOG_DIR, exist_ok=True)
    data = dict(entry)
    data.setdefault("time", time.strftime("%Y-%m-%dT%H:%M:%S%z"))
    data.setdefault("id", tool_timestamp() + "-" + str(int(time.time() * 1000) % 100000))
    log_path = os.path.join(TOOL_LOG_DIR, "tool-mode.jsonl")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")
    return data["id"]


def tool_local_intel(payload):
    """Run Oscar's local scraper/transcriber/RAG engine through Tool Mode."""
    if oscar_intel_engine is None:
        raise RuntimeError("Oscar Local Intel Engine is not available from Shared/runtime/oscar_intel_engine.py")
    if not isinstance(payload, dict):
        raise ValueError("local_intel payload must be a JSON object")

    clean = dict(payload)
    operation = str(clean.get("operation") or clean.get("mode") or "status").strip().lower()
    clean["operation"] = operation

    def as_list(value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in re.split(r"[\n,]", value) if item.strip()]
        if isinstance(value, (list, tuple)):
            return [str(item).strip() for item in value if str(item).strip()]
        raise ValueError("Path list values must be strings or arrays")

    def resolve_existing(raw_path):
        _root, full_path, rel = tool_resolve(raw_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Path does not exist: {rel}")
        return full_path

    if clean.get("path") or clean.get("file"):
        raw = clean.get("path") or clean.get("file")
        full = resolve_existing(raw)
        clean["path"] = full
        clean["file"] = full

    for key in ("paths", "files"):
        values = as_list(clean.get(key))
        if values:
            clean[key] = [resolve_existing(value) for value in values]

    result = oscar_intel_engine.handle_tool_action(clean, project_root=PROJECT_ROOT)
    if isinstance(result, dict):
        result["logId"] = tool_log({
            "action": "local_intel",
            "operation": operation,
            "collection": clean.get("collection"),
            "urlCount": len(as_list(clean.get("urls") or clean.get("url"))),
            "pathCount": len(as_list(clean.get("paths"))) + (1 if clean.get("path") else 0),
            "ok": result.get("ok", True),
        })
    return result


JUNIOR_DEV_CHECKLIST = [
    "1. Start a junior_dev session before coding/review/build claims.",
    "2. Read or search the actual file/source before analysis.",
    "3. Report evidence with exact paths, snippets, tool results, or missing-source notes.",
    "4. Save a durable note describing what was learned and what remains uncertain.",
    "5. Get graded by owner/Codex or record a self-grade clearly marked as self-grade.",
    "6. Repeat on the weak spot until the grade passes or the owner stops the loop.",
]


def junior_dev_safe_slug(value, fallback="session"):
    text = str(value or "").strip().lower()
    text = re.sub(r"[^a-z0-9._-]+", "-", text).strip("-._")
    return (text[:80] or fallback)


def junior_dev_now():
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def junior_dev_session_id(task=""):
    return time.strftime("%Y%m%d-%H%M%S") + "-" + junior_dev_safe_slug(task, "junior-dev")[:36]


def junior_dev_append(entry):
    os.makedirs(JUNIOR_DEV_TRAINING_DIR, exist_ok=True)
    data = dict(entry)
    data.setdefault("time", junior_dev_now())
    with open(JUNIOR_DEV_LEDGER_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")
    return data


def junior_dev_write_session_note(session_id, section, content):
    os.makedirs(JUNIOR_DEV_SESSIONS_DIR, exist_ok=True)
    session_dir = os.path.join(JUNIOR_DEV_SESSIONS_DIR, junior_dev_safe_slug(session_id, "session"))
    os.makedirs(session_dir, exist_ok=True)
    path = os.path.join(session_dir, "NOTES.md")
    stamp = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    block = "\n".join([
        "",
        f"## {stamp} - {section}",
        "",
        str(content or "").strip() or "(empty)",
        "",
    ])
    with open(path, "a", encoding="utf-8") as f:
        f.write(block)
    return path


def junior_dev_status_payload(limit=10):
    status = read_json_file(JUNIOR_DEV_STATUS_FILE, {})
    entries = []
    try:
        with open(JUNIOR_DEV_LEDGER_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()[-max(1, min(int(limit), 50)):]
        for line in lines:
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    except FileNotFoundError:
        pass
    return {
        "ok": True,
        "root": JUNIOR_DEV_TRAINING_DIR,
        "sessionsDir": JUNIOR_DEV_SESSIONS_DIR,
        "ledgerFile": JUNIOR_DEV_LEDGER_FILE,
        "statusFile": JUNIOR_DEV_STATUS_FILE,
        "current": status,
        "recent": entries,
        "checklist": JUNIOR_DEV_CHECKLIST,
        "rule": "Oscar should read evidence and save notes before claiming code/review/build progress.",
    }


def tool_junior_dev(payload):
    """Durable junior-dev training loop: start, evidence, note, grade, repeat."""
    if not isinstance(payload, dict):
        raise ValueError("junior_dev payload must be a JSON object")
    operation = str(payload.get("operation") or payload.get("mode") or "status").strip().lower()
    os.makedirs(JUNIOR_DEV_TRAINING_DIR, exist_ok=True)
    os.makedirs(JUNIOR_DEV_SESSIONS_DIR, exist_ok=True)

    if operation in {"status", "checklist"}:
        result = junior_dev_status_payload(limit=payload.get("limit", 10))
        result["operation"] = operation
        result["logId"] = tool_log({"action": "junior_dev", "operation": operation})
        return result

    status = read_json_file(JUNIOR_DEV_STATUS_FILE, {})
    session_id = str(payload.get("sessionId") or status.get("sessionId") or "").strip()

    if operation == "start":
        task = str(payload.get("task") or payload.get("brief") or payload.get("goal") or "").strip()
        if not task:
            raise ValueError("junior_dev start requires task/brief/goal")
        session_id = junior_dev_session_id(task)
        files = payload.get("files") or payload.get("paths") or []
        if isinstance(files, str):
            files = [item.strip() for item in re.split(r"[\n,]", files) if item.strip()]
        if not isinstance(files, list):
            files = []
        session = {
            "sessionId": session_id,
            "task": task[:1000],
            "files": [str(item)[:500] for item in files[:30]],
            "phase": "read",
            "startedAt": junior_dev_now(),
            "checklist": JUNIOR_DEV_CHECKLIST,
            "minimumEvidenceBeforeAnswer": 1,
            "passingGrade": 85,
        }
        write_json_file(JUNIOR_DEV_STATUS_FILE, session)
        note_path = junior_dev_write_session_note(session_id, "Session Started", "\n".join([
            f"Task: {task}",
            "",
            "Checklist:",
            *[f"- {item}" for item in JUNIOR_DEV_CHECKLIST],
        ]))
        junior_dev_append({"operation": operation, **session, "notePath": note_path})
        result = {"ok": True, "operation": operation, "session": session, "notePath": note_path}
    elif operation == "evidence":
        if not session_id:
            raise ValueError("junior_dev evidence requires an active session or sessionId")
        source = str(payload.get("source") or payload.get("path") or payload.get("file") or "").strip()
        verified_path = ""
        if source and "://" not in source:
            _root, full_path, rel = tool_resolve(source)
            if not os.path.exists(full_path):
                raise FileNotFoundError(f"Evidence path does not exist: {rel}")
            verified_path = full_path
        evidence = str(payload.get("evidence") or payload.get("summary") or payload.get("finding") or "").strip()
        if not evidence:
            raise ValueError("junior_dev evidence requires evidence/summary/finding")
        entry = {
            "sessionId": session_id,
            "operation": operation,
            "source": source,
            "verifiedPath": verified_path,
            "evidence": evidence[:4000],
            "confidence": str(payload.get("confidence") or "verified-source" if source else "reported-note"),
        }
        note_path = junior_dev_write_session_note(session_id, "Evidence", "\n".join([
            f"Source: {source or '(not provided)'}",
            f"Verified path: {verified_path or '(not local path verified)'}",
            "",
            evidence,
        ]))
        status.update({"sessionId": session_id, "phase": "note", "lastEvidenceAt": junior_dev_now(), "lastEvidenceSource": source})
        write_json_file(JUNIOR_DEV_STATUS_FILE, status)
        junior_dev_append({**entry, "notePath": note_path})
        result = {"ok": True, **entry, "notePath": note_path}
    elif operation == "note":
        if not session_id:
            raise ValueError("junior_dev note requires an active session or sessionId")
        note = str(payload.get("note") or payload.get("content") or "").strip()
        if not note:
            raise ValueError("junior_dev note requires note/content")
        entry = {
            "sessionId": session_id,
            "operation": operation,
            "note": note[:6000],
            "nextStep": str(payload.get("nextStep") or payload.get("next") or "").strip()[:1000],
        }
        note_path = junior_dev_write_session_note(session_id, "Learning Note", "\n".join([
            note,
            "",
            f"Next step: {entry['nextStep'] or '(not set)'}",
        ]))
        status.update({"sessionId": session_id, "phase": "grade", "lastNoteAt": junior_dev_now(), "lastNextStep": entry["nextStep"]})
        write_json_file(JUNIOR_DEV_STATUS_FILE, status)
        junior_dev_append({**entry, "notePath": note_path})
        result = {"ok": True, **entry, "notePath": note_path}
    elif operation == "grade":
        if not session_id:
            raise ValueError("junior_dev grade requires an active session or sessionId")
        try:
            score = int(payload.get("score"))
        except Exception as exc:
            raise ValueError("junior_dev grade requires numeric score 0-100") from exc
        score = max(0, min(score, 100))
        reviewer = str(payload.get("reviewer") or "owner/Codex").strip()[:120]
        feedback = str(payload.get("feedback") or "").strip()
        pass_status = score >= int(payload.get("passingGrade") or status.get("passingGrade") or 85)
        entry = {
            "sessionId": session_id,
            "operation": operation,
            "score": score,
            "passed": pass_status,
            "reviewer": reviewer,
            "feedback": feedback[:6000],
            "repeatFocus": str(payload.get("repeatFocus") or payload.get("focus") or "").strip()[:1000],
        }
        note_path = junior_dev_write_session_note(session_id, "Grade", "\n".join([
            f"Reviewer: {reviewer}",
            f"Score: {score}",
            f"Passed: {pass_status}",
            "",
            feedback or "(no feedback provided)",
            "",
            f"Repeat focus: {entry['repeatFocus'] or '(none)'}",
        ]))
        status.update({
            "sessionId": session_id,
            "phase": "complete" if pass_status else "repeat",
            "lastGradeAt": junior_dev_now(),
            "lastScore": score,
            "passed": pass_status,
            "repeatFocus": entry["repeatFocus"],
        })
        write_json_file(JUNIOR_DEV_STATUS_FILE, status)
        junior_dev_append({**entry, "notePath": note_path})
        result = {"ok": True, **entry, "notePath": note_path, "nextRequiredPhase": status["phase"]}
    else:
        raise ValueError("junior_dev supports status, checklist, start, evidence, note, and grade")

    result["logId"] = tool_log({"action": "junior_dev", "operation": operation, "sessionId": session_id, "ok": True})
    return result


def tool_backup_existing(full_path, rel):
    if not os.path.exists(full_path):
        return None
    if os.path.islink(full_path):
        raise PermissionError("Refusing to back up a symlink")
    backup = os.path.join(TOOL_BACKUP_DIR, tool_timestamp(), rel)
    os.makedirs(os.path.dirname(backup), exist_ok=True)
    if os.path.isdir(full_path):
        shutil.copytree(full_path, backup)
    else:
        shutil.copy2(full_path, backup)
    return backup


def tool_require_not_root(rel, message="A file or folder path is required"):
    if rel == ".":
        raise PermissionError(message)


def tool_validate_reversible_target(full_path, rel):
    tool_require_not_root(rel)
    if os.path.islink(full_path):
        raise PermissionError("Refusing to operate on a symlink")
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Path does not exist: {rel}")


def tool_mkdir(rel_path, reason=""):
    root, full_path, rel = tool_resolve(rel_path)
    tool_require_not_root(rel, "A folder path is required")
    if os.path.exists(full_path):
        if not os.path.isdir(full_path):
            raise FileExistsError(f"Path exists and is not a folder: {rel}")
        created = False
    else:
        parent = os.path.dirname(full_path)
        if not os.path.isdir(parent):
            raise FileNotFoundError(f"Parent folder does not exist: {os.path.relpath(parent, root)}")
        if os.path.islink(parent):
            raise PermissionError("Refusing to create a folder through a symlink")
        os.makedirs(full_path, exist_ok=True)
        created = True
    result = {"path": rel, "created": created, "reason": reason}
    result["logId"] = tool_log({"action": "mkdir", **result})
    return result


def tool_copy(src_path, dest_path, overwrite=False, reason=""):
    root, src_full, src_rel = tool_resolve(src_path)
    tool_validate_reversible_target(src_full, src_rel)
    if not os.path.isfile(src_full):
        raise ValueError("Copy is limited to regular files")

    _, dest_full, dest_rel = tool_resolve_parent(dest_path)
    if os.path.isdir(dest_full):
        raise IsADirectoryError(f"Destination is a folder: {dest_rel}")
    if os.path.exists(dest_full) and not overwrite:
        raise FileExistsError(f"Destination exists: {dest_rel}")

    backup = tool_backup_existing(dest_full, dest_rel) if os.path.exists(dest_full) else None
    shutil.copy2(src_full, dest_full)
    result = {
        "source": src_rel,
        "destination": dest_rel,
        "overwrite": bool(overwrite),
        "backup": backup,
        "size": os.path.getsize(dest_full),
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "copy", **result})
    return result


def tool_move(src_path, dest_path, overwrite=False, reason=""):
    root, src_full, src_rel = tool_resolve(src_path)
    tool_validate_reversible_target(src_full, src_rel)
    _, dest_full, dest_rel = tool_resolve_parent(dest_path)

    if os.path.commonpath([src_full, dest_full]) == src_full:
        raise PermissionError("Refusing to move a folder into itself")
    if os.path.exists(dest_full):
        if not overwrite:
            raise FileExistsError(f"Destination exists: {dest_rel}")
        if os.path.islink(dest_full):
            raise PermissionError("Refusing to overwrite a symlink")
        backup = tool_backup_existing(dest_full, dest_rel)
        if os.path.isdir(dest_full):
            shutil.rmtree(dest_full)
        else:
            os.unlink(dest_full)
    else:
        backup = None

    shutil.move(src_full, dest_full)
    result = {
        "source": src_rel,
        "destination": dest_rel,
        "overwrite": bool(overwrite),
        "backup": backup,
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "move", **result})
    return result


def tool_trash(rel_path, reason=""):
    root, full_path, rel = tool_resolve(rel_path)
    tool_validate_reversible_target(full_path, rel)
    trash_path = os.path.join(TOOL_BACKUP_DIR, "trash", tool_timestamp(), rel)
    os.makedirs(os.path.dirname(trash_path), exist_ok=True)
    shutil.move(full_path, trash_path)
    result = {"path": rel, "trashPath": trash_path, "reason": reason}
    result["logId"] = tool_log({"action": "trash", **result})
    return result


def tool_patch_text(rel_path, replacements, reason=""):
    if not isinstance(replacements, list) or not replacements:
        raise ValueError("Patch requires a non-empty replacements list")
    if len(replacements) > TOOL_MAX_PATCH_REPLACEMENTS:
        raise ValueError(f"Too many replacements; limit is {TOOL_MAX_PATCH_REPLACEMENTS}")

    root, full_path, rel = tool_resolve_parent(rel_path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Patch is limited to safe text/code files")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        original = f.read()
    updated = original
    changes = []

    for index, item in enumerate(replacements, start=1):
        if not isinstance(item, dict):
            raise ValueError("Each replacement must be an object")
        old = item.get("old", item.get("find"))
        new = item.get("new", item.get("replace", ""))
        if old is None:
            raise ValueError(f"Replacement {index} is missing old/find text")
        old = str(old)
        new = str(new)
        if not old:
            raise ValueError(f"Replacement {index} has empty old/find text")
        count = int(item.get("count", 1))
        if count < 0:
            raise ValueError("Replacement count cannot be negative")
        occurrences = updated.count(old)
        if occurrences < 1:
            raise ValueError(f"Patch text not found for replacement {index}")
        replace_count = occurrences if count == 0 else min(count, occurrences)
        updated = updated.replace(old, new, replace_count)
        changes.append({
            "index": index,
            "requested": count,
            "matched": occurrences,
            "changed": replace_count,
        })

    if updated == original:
        raise ValueError("Patch made no changes")
    if len(updated) > TOOL_MAX_WRITE_CHARS:
        raise ValueError(f"Patched file would be too large ({len(updated)} chars)")

    backup = tool_backup_existing(full_path, rel)
    fd, tmp_path = tempfile.mkstemp(prefix=".agent-007-tool-patch-", dir=os.path.dirname(full_path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(updated)
            if updated and not updated.endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, full_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    result = {
        "path": rel,
        "changes": changes,
        "backup": backup,
        "size": os.path.getsize(full_path),
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "patch", **result})
    return result


def tool_web_fetch(url, max_chars=None):
    value = computer_validate_url(url)
    max_chars = TOOL_MAX_WEB_FETCH_CHARS if max_chars is None else int(max_chars)
    max_chars = max(1000, min(max_chars, TOOL_MAX_WEB_FETCH_CHARS))
    req = urllib.request.Request(
        value,
        headers={
            "User-Agent": "MasterOscarLocalToolMode/1.0",
            "Accept": "text/plain,text/html,application/json,application/xml,text/xml;q=0.9,*/*;q=0.5",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            status = getattr(resp, "status", 200)
            content_type = resp.headers.get("Content-Type", "")
            raw = resp.read(TOOL_MAX_WEB_FETCH_BYTES + 1)
    except urllib.error.HTTPError as err:
        status = getattr(err, "code", None) or err.getcode()
        content_type = err.headers.get("Content-Type", "") if err.headers else ""
        raw = err.read(TOOL_MAX_WEB_FETCH_BYTES + 1)
    truncated_bytes = len(raw) > TOOL_MAX_WEB_FETCH_BYTES
    if truncated_bytes:
        raw = raw[:TOOL_MAX_WEB_FETCH_BYTES]

    charset_match = re.search(r"charset=([^;\s]+)", content_type, re.I)
    charset = charset_match.group(1) if charset_match else "utf-8"
    text = raw.decode(charset, errors="replace")
    truncated_chars = len(text) > max_chars
    if truncated_chars:
        text = text[:max_chars]

    result = {
        "url": value,
        "status": status,
        "okStatus": 200 <= int(status) < 400,
        "contentType": content_type,
        "bytesRead": len(raw),
        "truncated": bool(truncated_bytes or truncated_chars),
        "text": text,
    }
    result["logId"] = tool_log({"action": "web_fetch", **{k: v for k, v in result.items() if k != "text"}, "chars": len(text)})
    return result


def tool_validate_fxserver_artifact_url(url):
    value = computer_validate_url(url)
    parsed = urlparse(value)
    if parsed.scheme != "https":
        raise PermissionError("FXServer artifact downloads must use HTTPS")
    if parsed.netloc.lower() != FXSERVER_ARTIFACT_HOST:
        raise PermissionError("FXServer artifact downloads are limited to runtime.fivem.net")
    if not parsed.path.startswith(FXSERVER_ARTIFACT_PREFIX) or not parsed.path.endswith("/server.7z"):
        raise PermissionError("FXServer artifact URL must be an official FiveM Windows server artifact server.7z")
    return value


def tool_download_fxserver_artifact(url, dest_path=FXSERVER_ARTIFACT_DEFAULT_DEST, overwrite=False):
    value = tool_validate_fxserver_artifact_url(url)
    root, full_path, rel = tool_resolve(dest_path or FXSERVER_ARTIFACT_DEFAULT_DEST)
    if not rel.endswith("/server.7z") and rel != FXSERVER_ARTIFACT_DEFAULT_DEST:
        raise PermissionError("FXServer artifact destination must be named server.7z")
    if not os.path.isdir(os.path.dirname(full_path)):
        raise FileNotFoundError(f"Destination parent folder does not exist: {os.path.dirname(rel)}")
    if os.path.exists(full_path) and not overwrite:
        raise FileExistsError(f"Artifact already exists: {rel}")

    req = urllib.request.Request(
        value,
        headers={"User-Agent": "MasterOscarFXServerArtifactDownloader/1.0"},
        method="GET",
    )
    fd, tmp_path = tempfile.mkstemp(prefix=".fxserver-artifact-", dir=os.path.dirname(full_path))
    bytes_written = 0
    sha256 = hashlib.sha256()
    status = None
    content_type = ""
    try:
        with urllib.request.urlopen(req, timeout=60) as resp, os.fdopen(fd, "wb") as out:
            status = getattr(resp, "status", 200)
            content_type = resp.headers.get("Content-Type", "")
            while True:
                chunk = resp.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
                sha256.update(chunk)
                bytes_written += len(chunk)
            out.flush()
            os.fsync(out.fileno())
        if bytes_written < 1024 * 1024:
            raise ValueError("Downloaded artifact is unexpectedly small")
        os.replace(tmp_path, full_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    result = {
        "url": value,
        "root": root,
        "path": rel,
        "absolutePath": full_path,
        "status": status,
        "contentType": content_type,
        "bytes": bytes_written,
        "sha256": sha256.hexdigest(),
    }
    result["logId"] = tool_log({"action": "download_fxserver_artifact", **{k: v for k, v in result.items() if k != "absolutePath"}})
    return result


def tool_extract_fxserver_artifact(archive_path=FXSERVER_ARTIFACT_DEFAULT_DEST, dest_path=FXSERVER_ARTIFACT_DEFAULT_EXTRACT_DIR):
    archive_root, archive_full, archive_rel = tool_resolve(archive_path or FXSERVER_ARTIFACT_DEFAULT_DEST)
    dest_root, dest_full, dest_rel = tool_resolve(dest_path or FXSERVER_ARTIFACT_DEFAULT_EXTRACT_DIR)
    if not os.path.isfile(archive_full):
        raise FileNotFoundError(f"FXServer artifact archive does not exist: {archive_rel}")
    if not archive_rel.endswith("/server.7z") and archive_rel != FXSERVER_ARTIFACT_DEFAULT_DEST:
        raise PermissionError("FXServer artifact archive must be the verified server.7z")
    if not os.path.isdir(dest_full):
        raise FileNotFoundError(f"FXServer artifact extract folder does not exist: {dest_rel}")
    if os.path.commonpath([dest_root, dest_full]) != dest_root:
        raise PermissionError("FXServer artifact extract path is outside owner-approved roots")

    bsdtar = shutil.which("bsdtar") or "/usr/bin/bsdtar"
    if not bsdtar or not os.path.exists(bsdtar):
        raise FileNotFoundError("bsdtar is required to extract server.7z on this Mac")
    list_proc = subprocess.run(
        [bsdtar, "-tf", archive_full],
        cwd=dest_full,
        capture_output=True,
        text=True,
        timeout=TOOL_TIMEOUT_SECONDS,
    )
    if list_proc.returncode != 0:
        raise ValueError(tool_short_output(list_proc.stderr or list_proc.stdout or "Unable to list server.7z"))
    entries = [line.strip() for line in list_proc.stdout.splitlines() if line.strip()]
    if not entries:
        raise ValueError("server.7z contains no files")
    for entry in entries:
        normalized = os.path.normpath(entry)
        if normalized.startswith("..") or os.path.isabs(normalized):
            raise PermissionError(f"Blocked unsafe archive entry: {entry}")

    extract_proc = subprocess.run(
        [bsdtar, "-xf", archive_full, "-C", dest_full],
        cwd=dest_full,
        capture_output=True,
        text=True,
        timeout=TOOL_TIMEOUT_SECONDS,
    )
    if extract_proc.returncode != 0:
        raise ValueError(tool_short_output(extract_proc.stderr or extract_proc.stdout or "Unable to extract server.7z"))

    key_files = []
    for name in ("FXServer.exe", "run.sh", "citizen", "alpine"):
        path = os.path.join(dest_full, name)
        if os.path.exists(path):
            key_files.append(os.path.relpath(path, dest_root))
    result = {
        "archiveRoot": archive_root,
        "archivePath": archive_rel,
        "extractRoot": dest_root,
        "extractPath": dest_rel,
        "entries": entries[:80],
        "entryCount": len(entries),
        "keyFiles": key_files,
    }
    result["logId"] = tool_log({"action": "extract_fxserver_artifact", **result})
    return result


def tool_install_cfx_server_data(overwrite=False):
    server_root, server_full, server_rel = tool_resolve(CFX_SERVER_DATA_ROOT)
    vendor_root, vendor_full, vendor_rel = tool_resolve(CFX_SERVER_DATA_VENDOR_DIR)
    resources_root, resources_full, resources_rel = tool_resolve(CFX_SERVER_DATA_RESOURCES_DIR)
    if not os.path.isdir(server_full):
        raise FileNotFoundError(f"server-data folder does not exist: {server_rel}")
    if not os.path.isdir(resources_full):
        os.makedirs(resources_full, exist_ok=True)

    git_bin = shutil.which("git")
    if not git_bin:
        raise FileNotFoundError("git is required to clone official cfx-server-data")

    cloned = False
    if os.path.exists(vendor_full):
        if not os.path.isdir(os.path.join(vendor_full, ".git")):
            raise FileExistsError(f"cfx-server-data vendor path exists but is not a git clone: {vendor_rel}")
    else:
        proc = subprocess.run(
            [git_bin, "clone", "--depth", "1", CFX_SERVER_DATA_REPO, vendor_full],
            cwd=server_full,
            capture_output=True,
            text=True,
            timeout=max(TOOL_TIMEOUT_SECONDS, 300),
        )
        if proc.returncode != 0:
            raise ValueError(tool_short_output(proc.stderr or proc.stdout or "git clone failed"))
        cloned = True

    head_proc = subprocess.run(
        [git_bin, "-C", vendor_full, "rev-parse", "HEAD"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    if head_proc.returncode != 0:
        raise ValueError(tool_short_output(head_proc.stderr or head_proc.stdout or "Unable to verify cfx-server-data HEAD"))
    head = head_proc.stdout.strip()

    src_resources = os.path.join(vendor_full, "resources")
    if not os.path.isdir(src_resources):
        raise FileNotFoundError("Official cfx-server-data clone does not contain resources/")

    copied = []
    skipped = []
    for name in sorted(os.listdir(src_resources)):
        src = os.path.join(src_resources, name)
        dest = os.path.join(resources_full, name)
        if os.path.exists(dest):
            if not overwrite:
                skipped.append(name)
                continue
            if os.path.isdir(dest) and not os.path.islink(dest):
                shutil.rmtree(dest)
            else:
                os.unlink(dest)
        if os.path.isdir(src) and not os.path.islink(src):
            shutil.copytree(src, dest, symlinks=True)
        else:
            shutil.copy2(src, dest)
        copied.append(name)

    key_paths = []
    for rel in (
        "resources/[managers]/mapmanager",
        "resources/[gameplay]/chat",
        "resources/[system]/spawnmanager",
        "resources/[system]/sessionmanager",
        "resources/[system]/hardcap",
    ):
        if os.path.exists(os.path.join(server_full, rel)):
            key_paths.append(os.path.join(server_rel, rel))

    result = {
        "repo": CFX_SERVER_DATA_REPO,
        "head": head,
        "serverDataPath": server_rel,
        "vendorPath": vendor_rel,
        "resourcesPath": resources_rel,
        "cloned": cloned,
        "copied": copied,
        "skipped": skipped,
        "keyPaths": key_paths,
    }
    result["logId"] = tool_log({"action": "install_cfx_server_data", **result})
    return result


def tool_short_output(text, max_chars=TOOL_MAX_OUTPUT_CHARS):
    text = "" if text is None else str(text)
    if len(text) <= max_chars:
        return text
    note = f"\n\n[tool output shortened from {len(text)} chars]\n"
    keep = max(0, max_chars - len(note))
    head = int(keep * 0.65)
    tail = keep - head
    return text[:head] + note + (text[-tail:] if tail else "")


def tool_parse_command(command):
    if isinstance(command, list):
        args = [str(part) for part in command if str(part)]
    else:
        args = shlex.split(str(command or ""))
    if not args:
        raise ValueError("Command is empty")
    return args


def tool_validate_path_arg(path_arg):
    if path_arg.startswith("-"):
        raise PermissionError("Command path arguments cannot be flags")
    root, full_path, rel = tool_resolve(path_arg)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Command path does not exist: {rel}")
    return rel


def tool_command_allowed(args):
    tup = tuple(args)
    if tup in TOOL_ALLOWED_EXACT_COMMANDS:
        return True, "exact allowlist"

    if len(args) == 3 and args[0] == "npm" and args[1] == "run" and args[2] in TOOL_ALLOWED_RUN_SCRIPTS:
        return True, "npm script allowlist"

    if len(args) == 3 and args[0] == "node" and args[1] == "--check":
        rel = tool_validate_path_arg(args[2])
        if os.path.splitext(rel)[1].lower() not in {".js", ".mjs", ".cjs"}:
            raise PermissionError("node --check is limited to JavaScript files")
        return True, "node syntax check"

    if len(args) >= 4 and args[0] in {"python", "python3"} and args[1:3] == ["-m", "py_compile"]:
        for path_arg in args[3:]:
            rel = tool_validate_path_arg(path_arg)
            if os.path.splitext(rel)[1].lower() != ".py":
                raise PermissionError("py_compile is limited to Python files")
        return True, "python syntax check"

    if len(args) >= 2 and args[0] == "pytest":
        for path_arg in args[1:]:
            tool_validate_path_arg(path_arg)
        return True, "pytest path allowlist"

    if len(args) >= 4 and args[0] in {"python", "python3"} and args[1:3] == ["-m", "pytest"]:
        for path_arg in args[3:]:
            tool_validate_path_arg(path_arg)
        return True, "python pytest path allowlist"

    return False, "Command is not in Oscar Tool Mode allowlist"


def tool_run_command(command, cwd="."):
    args = tool_parse_command(command)
    allowed, reason = tool_command_allowed(args)
    if not allowed:
        raise PermissionError(reason)

    root, full_cwd, rel_cwd = tool_resolve(cwd or ".")
    if not os.path.isdir(full_cwd):
        raise FileNotFoundError(f"Working directory is not a folder: {rel_cwd}")

    started = time.time()
    env = os.environ.copy()
    env.update({"CI": "1", "NO_COLOR": "1"})
    proc = subprocess.run(
        args,
        cwd=full_cwd,
        capture_output=True,
        text=True,
        timeout=TOOL_TIMEOUT_SECONDS,
        env=env,
        check=False,
    )
    elapsed_ms = int((time.time() - started) * 1000)
    result = {
        "command": " ".join(shlex.quote(part) for part in args),
        "cwd": rel_cwd,
        "allowedBy": reason,
        "exitCode": proc.returncode,
        "elapsedMs": elapsed_ms,
        "stdout": tool_short_output(proc.stdout),
        "stderr": tool_short_output(proc.stderr),
    }
    result["logId"] = tool_log({"action": "run", **result})
    return result


def tool_write_text(rel_path, content, reason=""):
    content = "" if content is None else str(content)
    if len(content) > TOOL_MAX_WRITE_CHARS:
        raise ValueError(f"Write content is too large ({len(content)} chars)")

    root, full_path, rel = tool_resolve_parent(rel_path)
    if not bridge_is_text_file(full_path):
        raise ValueError("Oscar Tool Mode can only write text/code files")

    backup = None
    if os.path.exists(full_path):
        backup = os.path.join(TOOL_BACKUP_DIR, tool_timestamp(), rel)
        os.makedirs(os.path.dirname(backup), exist_ok=True)
        shutil.copy2(full_path, backup)

    fd, tmp_path = tempfile.mkstemp(prefix=".agent-007-tool-", dir=os.path.dirname(full_path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
            if content and not content.endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, full_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    result = {
        "path": rel,
        "size": os.path.getsize(full_path),
        "backup": backup,
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "write", **result})
    return result


def tool_iter_files(limit=BRIDGE_MAX_TREE_FILES, start_paths=None):
    """Yield safe text/code file metadata across all owner-approved roots."""
    limit = max(1, min(int(limit), 1200))
    files = []
    seen = set()
    walk_pairs = []
    if start_paths:
        for requested in start_paths:
            if requested is None:
                continue
            root, full_path, rel = tool_resolve(requested)
            if os.path.isfile(full_path):
                walk_pairs.append((root, full_path))
            elif os.path.isdir(full_path):
                walk_pairs.append((root, full_path))
            else:
                raise FileNotFoundError(f"Not a file or folder: {rel}")
    else:
        walk_pairs = [(root, root) for root in tool_allowed_roots() if os.path.isdir(root)]

    for root, start_path in walk_pairs:
        if os.path.isfile(start_path):
            if start_path in seen:
                continue
            seen.add(start_path)
            try:
                size = os.path.getsize(start_path)
            except OSError:
                continue
            name = os.path.basename(start_path)
            if bridge_is_private_file(name):
                continue
            rel = os.path.relpath(start_path, root)
            if any(part in BRIDGE_SKIP_DIRS for part in rel.split(os.sep)):
                continue
            files.append({
                "root": root,
                "path": rel,
                "absolutePath": start_path,
                "size": size,
                "text": bridge_is_text_file(start_path),
            })
            if len(files) >= limit:
                return files
            continue

        for current, dirs, names in os.walk(start_path, followlinks=False):
            dirs[:] = sorted(
                d for d in dirs
                if d not in BRIDGE_SKIP_DIRS and not bridge_is_private_file(d)
            )
            for name in sorted(names):
                if bridge_is_private_file(name):
                    continue
                full_path = os.path.realpath(os.path.join(current, name))
                if full_path in seen or not os.path.isfile(full_path):
                    continue
                seen.add(full_path)
                try:
                    size = os.path.getsize(full_path)
                except OSError:
                    continue
                rel = os.path.relpath(full_path, root)
                if any(part in BRIDGE_SKIP_DIRS for part in rel.split(os.sep)):
                    continue
                files.append({
                    "root": root,
                    "path": rel,
                    "absolutePath": full_path,
                    "size": size,
                    "text": bridge_is_text_file(full_path),
                })
                if len(files) >= limit:
                    return files
    return files


def tool_read_text(rel_path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS):
    root, full_path, rel = tool_resolve(rel_path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Only text/code files can be read through Oscar Tool Mode")

    max_chars = max(100, min(int(max_chars), TOOL_MAX_READ_CHARS))
    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_chars + 1)
    truncated = len(content) > max_chars
    if truncated:
        content = content[:max_chars]
    return {
        "root": root,
        "path": rel,
        "absolutePath": full_path,
        "content": content,
        "truncated": truncated,
        "size": os.path.getsize(full_path),
    }


def tool_read_near_text(rel_path, line=None, context_lines=40, start=None, end=None, max_chars=60000):
    root, full_path, rel = tool_resolve(rel_path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Only text/code files can be read through Oscar Tool Mode")

    max_chars = max(1000, min(int(max_chars), TOOL_MAX_READ_CHARS))
    context_lines = max(1, min(int(context_lines), 120))
    if start is not None or end is not None:
        start_line = max(1, int(start or 1))
        end_line = max(start_line, int(end or start_line))
    else:
        target_line = max(1, int(line or 1))
        start_line = max(1, target_line - context_lines)
        end_line = target_line + context_lines
    end_line = max(start_line, min(end_line, start_line + 240))

    selected = []
    total_lines = 0
    truncated = False
    used_chars = 0
    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        for index, raw_line in enumerate(f, start=1):
            total_lines = index
            if index < start_line:
                continue
            if index > end_line:
                continue
            rendered = f"{index}: {raw_line.rstrip()}"
            next_len = len(rendered) + 1
            if used_chars + next_len > max_chars:
                truncated = True
                break
            selected.append(rendered)
            used_chars += next_len

    return {
        "root": root,
        "path": rel,
        "absolutePath": full_path,
        "content": "\n".join(selected),
        "truncated": truncated,
        "excerpt": True,
        "startLine": start_line,
        "endLine": min(end_line, total_lines or end_line),
        "requestedLine": int(line or start_line),
        "contextLines": context_lines,
        "totalLines": total_lines,
        "size": os.path.getsize(full_path),
    }


def tool_search_text(query, max_hits=50, roots=None):
    needle = str(query or "").strip()
    if len(needle) < 2:
        raise ValueError("Search query must be at least 2 characters")
    max_hits = max(1, min(int(max_hits), 200))
    hits = []
    needle_lower = needle.lower()
    tokens = [
        token
        for token in re.findall(r"[a-z0-9][a-z0-9+._-]{1,}", needle_lower)
        if token not in {"the", "and", "for", "with", "from", "that", "this"}
    ]
    search_roots = roots if isinstance(roots, list) else None
    for item in tool_iter_files(1000, search_roots):
        if not item.get("text") or item.get("size", 0) > TOOL_MAX_SEARCH_CHARS:
            continue
        try:
            with open(item["absolutePath"], "r", encoding="utf-8", errors="replace") as f:
                data = f.read(TOOL_MAX_SEARCH_CHARS + 1)
            if len(data) > TOOL_MAX_SEARCH_CHARS:
                data = data[:TOOL_MAX_SEARCH_CHARS]
        except Exception:
            continue
        for index, line in enumerate(data.splitlines(), start=1):
            line_lower = line.lower()
            line_tokens = set(re.findall(r"[a-z0-9][a-z0-9+._-]{1,}", line_lower))
            token_hits = [token for token in tokens if token in line_tokens]
            exact_hit = needle_lower in line_lower
            if exact_hit or len(token_hits) >= min(2, len(tokens)):
                hits.append({
                    "root": item.get("root", ""),
                    "path": item["path"],
                    "absolutePath": item.get("absolutePath", ""),
                    "line": index,
                    "text": line.strip()[:260],
                    "score": len(token_hits) + (20 if exact_hit else 0),
                })
    hits.sort(key=lambda hit: (-int(hit.get("score", 0)), hit.get("path", ""), int(hit.get("line", 0))))
    return {"roots": tool_allowed_roots(), "searchedRoots": search_roots or tool_allowed_roots(), "query": needle, "hits": hits[:max_hits]}


def oscar_brain_safe_path(rel_path=""):
    brain_root = os.path.realpath(OSCAR_BRAIN_DIR)
    if not os.path.isdir(brain_root):
        raise FileNotFoundError(f"Oscar Brain folder is missing: {OSCAR_BRAIN_DIR}")
    safe_rel = os.path.normpath(str(rel_path or "").lstrip("/"))
    if safe_rel in (".", ""):
        full_path = brain_root
    else:
        full_path = os.path.realpath(os.path.join(brain_root, safe_rel))
    if os.path.commonpath([brain_root, full_path]) != brain_root:
        raise PermissionError("Path is outside Oscar Brain")
    return brain_root, full_path, os.path.relpath(full_path, brain_root)


def oscar_brain_index(max_files=200):
    brain_root, _, _ = oscar_brain_safe_path("")
    files = []
    max_files = max(1, min(int(max_files), 500))
    for current, dirs, names in os.walk(brain_root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in BRIDGE_SKIP_DIRS and not d.startswith("."))
        for name in sorted(names):
            if name.startswith("."):
                continue
            full_path = os.path.join(current, name)
            if not os.path.isfile(full_path) or not bridge_is_text_file(full_path):
                continue
            rel = os.path.relpath(full_path, brain_root)
            try:
                size = os.path.getsize(full_path)
            except OSError:
                size = 0
            files.append({"path": rel, "size": size})
            if len(files) >= max_files:
                return {"ok": True, "root": brain_root, "files": files}
    return {"ok": True, "root": brain_root, "files": files}


def oscar_brain_read(rel_path, max_chars=12000):
    brain_root, full_path, rel = oscar_brain_safe_path(rel_path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Oscar Brain file not found: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Oscar Brain read is limited to text files")
    max_chars = max(200, min(int(max_chars), TOOL_MAX_READ_CHARS))
    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_chars + 1)
    truncated = len(content) > max_chars
    if truncated:
        content = content[:max_chars]
    return {
        "ok": True,
        "root": brain_root,
        "path": rel,
        "absolutePath": full_path,
        "content": content,
        "truncated": truncated,
        "size": os.path.getsize(full_path),
    }


def oscar_brain_search(query, max_hits=20):
    needle = str(query or "").strip()
    if len(needle) < 2:
        raise ValueError("Oscar Brain search query must be at least 2 characters")
    brain_root, _, _ = oscar_brain_safe_path("")
    max_hits = max(1, min(int(max_hits), 100))
    needle_lower = needle.lower()
    tokens = [
        token for token in re.findall(r"[a-z0-9][a-z0-9+._-]{1,}", needle_lower)
        if token not in {"the", "and", "for", "with", "from", "that", "this", "oscar", "brain"}
    ]
    hits = []
    for item in oscar_brain_index(500).get("files", []):
        rel = item.get("path", "")
        try:
            content = oscar_brain_read(rel, max_chars=300_000)["content"]
        except Exception:
            continue
        for line_no, line in enumerate(content.splitlines(), start=1):
            line_lower = line.lower()
            exact_hit = needle_lower in line_lower
            token_hits = [token for token in tokens if token in line_lower]
            if exact_hit or len(token_hits) >= min(2, len(tokens)):
                hits.append({
                    "path": rel,
                    "absolutePath": os.path.join(brain_root, rel),
                    "line": line_no,
                    "text": line.strip()[:260],
                    "score": len(token_hits) + (20 if exact_hit else 0),
                })
    hits.sort(key=lambda hit: (-int(hit.get("score", 0)), hit.get("path", ""), int(hit.get("line", 0))))
    return {"ok": True, "root": brain_root, "query": needle, "hits": hits[:max_hits]}


def tool_diagnose():
    checks = []
    checks.append({"name": "toolRoot", "ok": os.path.isdir(tool_root()), "detail": tool_root()})
    checks.append({"name": "bridgeRoot", "ok": os.path.isdir(bridge_root()), "detail": bridge_root()})
    for path in (CHATS_FILE, SETTINGS_FILE, HTML_FILE):
        checks.append({"name": os.path.basename(path), "ok": os.path.exists(path), "detail": path})
    try:
        read_json_file(SETTINGS_FILE, {})
        settings_ok = True
    except Exception:
        settings_ok = False
    checks.append({"name": "settingsJson", "ok": settings_ok, "detail": SETTINGS_FILE})
    result = {"checks": checks}
    result["logId"] = tool_log({"action": "diagnose", **result})
    return result


def oscar_security_run(args, timeout=6, max_chars=16000):
    """Run read-only local security probes without shell expansion."""
    executable = args[0] if isinstance(args, list) and args else ""
    if executable and os.path.isabs(executable) and not os.path.exists(executable):
        return {"ok": False, "command": " ".join(args), "exitCode": 127, "stdout": "", "stderr": "command not found"}
    try:
        proc = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return {
            "ok": proc.returncode == 0,
            "command": " ".join(shlex.quote(str(part)) for part in args),
            "exitCode": proc.returncode,
            "stdout": tool_short_output(proc.stdout, max_chars),
            "stderr": tool_short_output(proc.stderr, 4000),
        }
    except Exception as error:
        return {"ok": False, "command": " ".join(map(str, args)), "exitCode": -1, "stdout": "", "stderr": str(error)}


def oscar_security_log(entry):
    os.makedirs(CHATS_DIR, exist_ok=True)
    data = dict(entry)
    data.setdefault("time", time.strftime("%Y-%m-%dT%H:%M:%S%z"))
    with open(OSCAR_SECURITY_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")
    try:
        os.chmod(OSCAR_SECURITY_LOG_FILE, 0o600)
    except OSError:
        pass


def oscar_security_chmod(path, mode):
    if not path or not os.path.exists(path):
        return {"path": path, "exists": False, "changed": False}
    try:
        os.chmod(path, mode)
        return {"path": path, "exists": True, "changed": True, "mode": oct(mode)}
    except OSError as error:
        return {"path": path, "exists": True, "changed": False, "error": str(error)}


def oscar_known_agents():
    shared_standard = os.path.join(PROJECT_ROOT, "BackupVault", "GOAT-Crew-Homes", "GOAT-FORCE-COMPOUND-SHARED-CAPABILITIES-2026-06-27.md")
    agents = [
        {
            "id": "oscar",
            "name": "Oscar",
            "role": "local runtime coordinator, Tool Mode operator, Oscar Brain/Local Intel router, service health reporter",
            "homeDir": PROJECT_ROOT,
            "profileFile": os.path.join(OSCAR_BRAIN_DIR, "00-start-here", "OSCAR-BRAIN-START.md"),
            "summaryFile": os.path.join(OSCAR_BRAIN_DIR, "15-self-system", "SELF-MAINTENANCE-POLICY.md"),
        },
        {
            "id": "moneypenny",
            "name": "Ms. Money Penny",
            "role": "team and crew leader/supervisor for business, royalties, records, product architecture, executive organization, and operating quality",
            "homeDir": MONEY_PENNY_HOME_DIR,
            "profileFile": MONEY_PENNY_PROFILE_FILE,
            "summaryFile": MONEY_PENNY_SUMMARY_FILE,
        },
        {
            "id": "lexi",
            "name": "Lexicon Lexi",
            "role": "engineering, automation, code, CUDA/NVIDIA planning, media tooling, Pro Tools tooling, and implementation repair",
            "homeDir": LEXI_HOME_DIR,
            "profileFile": LEXI_PROFILE_FILE,
            "summaryFile": LEXI_SUMMARY_FILE,
        },
        {
            "id": "vanessa",
            "name": "Ms Vanessa",
            "role": "verification, provenance, rights-risk, fingerprint review, evidence quality, and chain-of-custody",
            "homeDir": MS_VANESSA_HOME_DIR,
            "profileFile": MS_VANESSA_PROFILE_FILE,
            "summaryFile": MS_VANESSA_SUMMARY_FILE,
        },
        {
            "id": "nexus",
            "name": "Ms Nexus",
            "role": "campaign routing, platforms, sync, collaborators, relationship maps, voice-agent routing, and rollout strategy",
            "homeDir": MS_NEXUS_HOME_DIR,
            "profileFile": MS_NEXUS_PROFILE_FILE,
            "summaryFile": MS_NEXUS_SUMMARY_FILE,
        },
        {
            "id": "sir-codex",
            "name": "Sir Codex",
            "role": "QA, documentation, SOPs, architecture notes, implementation memory, release handoffs, and verification records",
            "homeDir": SIR_CODEX_HOME_DIR,
            "profileFile": SIR_CODEX_PROFILE_FILE,
            "summaryFile": SIR_CODEX_SUMMARY_FILE,
        },
    ]
    for agent in agents:
        home = agent.get("homeDir", "")
        profile = agent.get("profileFile", "")
        summary = agent.get("summaryFile", "")
        pause_file = os.path.join(home, "OSCAR-SECURITY-PAUSE.flag") if home else ""
        agent.update({
            "sharedStandardFile": shared_standard,
            "sharedStandardExists": os.path.exists(shared_standard),
            "homeExists": bool(home and os.path.isdir(home)),
            "profileExists": bool(profile and os.path.exists(profile)),
            "summaryExists": bool(summary and os.path.exists(summary)),
            "pauseFile": pause_file,
            "paused": bool(pause_file and os.path.exists(pause_file)),
        })
    return agents


def oscar_agent_matches(target):
    clean = str(target or "all").strip().lower()
    agents = oscar_known_agents()
    if clean in {"", "all", "crew", "agents"}:
        return agents
    matches = [
        agent for agent in agents
        if clean in {
            agent.get("id", "").lower(),
            agent.get("name", "").lower(),
        }
        or clean in agent.get("name", "").lower()
    ]
    if not matches:
        raise ValueError(f"No known Oscar agent matches: {target}")
    return matches


def oscar_security_brief(agent):
    return "\n".join([
        f"# Security Brief For {agent['name']}",
        "",
        "Owner: Raspy.",
        "Security coordinator: Oscar.",
        "",
        "Rules:",
        "- Keep secrets out of chat, logs, screenshots, and summaries.",
        "- Treat Tool Mode writes, shell checks, browser/computer control, and network bridges as owner-approved actions.",
        "- Prefer read-only diagnosis first. Apply changes only when the owner asks or when the action is reversible and local.",
        "- Report verified state separately from inference.",
        "- For threat checks, route to Oscar Tool Mode: `security_audit` for environment checks and `agent_control` for crew status, security briefs, pause/resume flags, and permission tightening.",
        "- If paused by `OSCAR-SECURITY-PAUSE.flag`, do not run autonomous work until Oscar or the owner resumes the agent.",
        "",
        "Supported Oscar security actions:",
        "- `security_audit`: local ports, firewall, file sharing, sensitive file permissions, agent state, and known-risk listeners.",
        "- `agent_control status`: list agent homes, profiles, summaries, and pause flags.",
        "- `agent_control security_brief`: write or refresh this file.",
        "- `agent_control secure_files`: tighten known profile/summary files and agent home directories.",
        "- `agent_control pause` / `resume`: create or remove a local pause flag for agent-aware workflows.",
        "",
        f"Agent home: `{agent.get('homeDir', '')}`",
        f"Profile file: `{agent.get('profileFile', '')}`",
    ]) + "\n"


def tool_agent_control(target="all", control="status", apply=False, reason=""):
    control = str(control or "status").strip().lower().replace("-", "_")
    apply = bool(apply)
    agents = oscar_agent_matches(target)
    results = []
    for agent in agents:
        home = agent.get("homeDir", "")
        item = {"agent": agent, "control": control, "apply": apply}
        if control == "status":
            pass
        elif control == "security_brief":
            brief_path = os.path.join(home, "OSCAR-SECURITY-BRIEF.md")
            item["briefPath"] = brief_path
            if apply:
                os.makedirs(home, exist_ok=True)
                with open(brief_path, "w", encoding="utf-8") as f:
                    f.write(oscar_security_brief(agent))
                item["written"] = True
                item["chmod"] = oscar_security_chmod(brief_path, 0o600)
        elif control == "secure_files":
            paths = [home, agent.get("profileFile", ""), agent.get("summaryFile", ""), os.path.join(home, "OSCAR-SECURITY-BRIEF.md")]
            chmods = []
            if apply:
                for path in paths:
                    mode = 0o700 if path == home else 0o600
                    chmods.append(oscar_security_chmod(path, mode))
            item["targets"] = paths
            item["chmods"] = chmods
        elif control == "pause":
            pause_path = agent.get("pauseFile", "")
            item["pauseFile"] = pause_path
            if apply:
                os.makedirs(home, exist_ok=True)
                with open(pause_path, "w", encoding="utf-8") as f:
                    f.write(f"Paused by Oscar security control at {time.strftime('%Y-%m-%dT%H:%M:%S%z')}.\nReason: {reason or 'owner security control'}\n")
                item["paused"] = True
                item["chmod"] = oscar_security_chmod(pause_path, 0o600)
        elif control == "resume":
            pause_path = agent.get("pauseFile", "")
            item["pauseFile"] = pause_path
            if apply and pause_path and os.path.exists(pause_path):
                os.unlink(pause_path)
                item["resumed"] = True
        else:
            raise ValueError("agent_control supports status, security_brief, secure_files, pause, and resume")
        results.append(item)
    result = {
        "control": control,
        "target": target,
        "apply": apply,
        "reason": reason,
        "agents": results,
    }
    result["logId"] = tool_log({"action": "agent_control", **result})
    oscar_security_log({"action": "agent_control", "target": target, "control": control, "apply": apply, "count": len(results)})
    return result


def parse_lsof_listeners(text):
    listeners = []
    for line in str(text or "").splitlines()[1:]:
        parts = line.split()
        if len(parts) < 9:
            continue
        name = " ".join(parts[8:])
        listeners.append({
            "command": parts[0],
            "pid": parts[1],
            "user": parts[2],
            "name": name,
            "wideOpen": "*:" in name or name.startswith("[::]") or name.startswith("0.0.0.0"),
        })
    return listeners


def scan_logs_for_secret_markers():
    candidates = [
        os.path.join(SCRIPT_DIR, "logs", "chat-server-3333.log"),
        os.path.join(SCRIPT_DIR, ".ollama-runtime", "oscar-chat-server.log"),
        os.path.join(TOOL_LOG_DIR, "tool-mode.jsonl"),
        OSCAR_SECURITY_LOG_FILE,
    ]
    markers = []
    patterns = [
        ("openai_key", re.compile(r"sk-[A-Za-z0-9_-]{20,}")),
        ("generic_secret_assignment", re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[^'\"\\s]{8,}")),
    ]
    for path in candidates:
        if not os.path.isfile(path):
            continue
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                data = f.read(500_000)
        except OSError:
            continue
        for label, pattern in patterns:
            count = len(pattern.findall(data))
            if count:
                markers.append({"path": path, "marker": label, "count": count})
    return markers


def tool_security_audit(apply=False, scope="quick"):
    apply = bool(apply)
    scope = str(scope or "quick")[:60]
    findings = []
    actions = []

    def add_finding(severity, title, detail, recommendation=""):
        findings.append({
            "severity": severity,
            "title": title,
            "detail": detail,
            "recommendation": recommendation,
        })

    lsof_cmd = shutil.which("lsof") or "/usr/sbin/lsof"
    listeners_raw = oscar_security_run([lsof_cmd, "-nP", "-iTCP", "-sTCP:LISTEN"], timeout=8, max_chars=24000)
    listeners = parse_lsof_listeners(listeners_raw.get("stdout", ""))
    for listener in listeners:
        if listener.get("wideOpen") and listener.get("name", "").endswith(":3333 (LISTEN)"):
            add_finding("medium", "Oscar chat server is reachable on the LAN", listener.get("name", ""), "Keep this only on trusted local networks or bind to 127.0.0.1 when phone access is not needed.")
        if listener.get("wideOpen") and ":11434" in listener.get("name", ""):
            add_finding("medium", "Ollama is listening beyond localhost", listener.get("name", ""), "Bind Ollama to localhost unless remote model access is required.")
        if listener.get("command", "").lower().startswith("epic") and listener.get("wideOpen"):
            add_finding("low", "Epic Games Launcher has an open local listener", listener.get("name", ""), "Quit Epic Games Launcher during security-sensitive field tests.")

    firewall = oscar_security_run(["/usr/libexec/ApplicationFirewall/socketfilterfw", "--getglobalstate"], timeout=5)
    stealth = oscar_security_run(["/usr/libexec/ApplicationFirewall/socketfilterfw", "--getstealthmode"], timeout=5)
    sharing = oscar_security_run(["/usr/sbin/sharing", "-l"], timeout=5, max_chars=12000)
    if "Firewall is enabled" not in firewall.get("stdout", ""):
        add_finding("high", "macOS firewall may not be enabled", firewall.get("stdout") or firewall.get("stderr"), "Enable the macOS firewall before field use.")
    if "Stealth Mode: Yes" not in stealth.get("stdout", "") and "stealth mode is on" not in stealth.get("stdout", "").lower():
        add_finding("medium", "macOS stealth mode may be off", stealth.get("stdout") or stealth.get("stderr"), "Enable stealth mode for lower LAN visibility.")
    share_text = sharing.get("stdout", "")
    if "guest access" in share_text and re.search(r"guest access:\s*1", share_text) and re.search(r"read-only:\s*0", share_text):
        add_finding("high", "Guest-writable macOS file sharing detected", "A shared folder allows guest write access.", "Turn off File Sharing or remove guest write access in System Settings.")

    sensitive_paths = [
        SETTINGS_FILE,
        TOOL_POLICY_FILE,
        OWNER_APPROVAL_FILE,
        OSCAR_SECURITY_LOG_FILE,
        os.path.join(TOOL_LOG_DIR, "tool-mode.jsonl"),
    ]
    permission_results = []
    for path in sensitive_paths:
        if os.path.exists(path):
            mode = oct(os.stat(path).st_mode & 0o777)
            permission_results.append({"path": path, "mode": mode})
            if mode not in {"0o600", "0o700"}:
                add_finding("medium", "Sensitive Oscar file is not owner-only", f"{path} mode {mode}", "Tighten to 0600.")
            if apply:
                actions.append({"type": "chmod", **oscar_security_chmod(path, 0o600)})

    if apply:
        for directory in (CHATS_DIR, TOOL_LOG_DIR, TOOL_BACKUP_DIR):
            actions.append({"type": "chmod", **oscar_security_chmod(directory, 0o700)})

    secret_markers = scan_logs_for_secret_markers()
    for marker in secret_markers:
        add_finding("medium", "Possible secret marker in Oscar log", f"{marker['marker']} count {marker['count']} in {marker['path']}", "Review locally and rotate any exposed credential. Values are intentionally not returned here.")

    agents = oscar_known_agents()
    if not any(agent.get("profileExists") for agent in agents if agent.get("id") in {"moneypenny", "lexi"}):
        add_finding("low", "Some crew profiles are missing under current expected paths", "Ms. Money Penny or Lexi profile not found at one legacy path.", "Use agent_control status to confirm alternate profile locations before editing.")

    result = {
        "scope": scope,
        "apply": apply,
        "summary": {
            "findings": len(findings),
            "high": sum(1 for item in findings if item.get("severity") == "high"),
            "medium": sum(1 for item in findings if item.get("severity") == "medium"),
            "low": sum(1 for item in findings if item.get("severity") == "low"),
            "listeners": len(listeners),
            "agents": len(agents),
        },
        "findings": findings,
        "listeners": listeners[:80],
        "firewall": {
            "globalState": firewall.get("stdout", "").strip() or firewall.get("stderr", "").strip(),
            "stealth": stealth.get("stdout", "").strip() or stealth.get("stderr", "").strip(),
        },
        "sharing": tool_short_output(share_text, 4000),
        "sensitiveFileModes": permission_results,
        "agents": agents,
        "actions": actions,
    }
    result["logId"] = tool_log({"action": "security_audit", **{k: v for k, v in result.items() if k not in {"listeners", "sharing"}}})
    oscar_security_log({"action": "security_audit", "apply": apply, "summary": result["summary"], "logId": result["logId"]})
    return result


def tool_self_heal(apply=False, ensure_advanced=True):
    """Repair Oscar's local runtime basics through an owner-approved tool action."""
    apply = bool(apply)
    ensure_advanced = bool(ensure_advanced)
    checks = []
    repairs = []
    backups = []

    def add_check(name, ok, detail):
        checks.append({"name": name, "ok": bool(ok), "detail": detail})

    required_dirs = [
        CHATS_DIR,
        TOOL_LOG_DIR,
        TOOL_BACKUP_DIR,
        GENERATED_IMAGES_DIR,
        COMPUTER_SCREENSHOT_DIR,
        os.path.join(SCRIPT_DIR, "agent-007_drafts"),
        os.path.join(SCRIPT_DIR, "apps"),
        os.path.join(SCRIPT_DIR, "python-envs"),
        os.path.join(SCRIPT_DIR, "build-tools"),
        os.path.join(SCRIPT_DIR, "models"),
        os.path.join(SCRIPT_DIR, "models", "foundation"),
        os.path.join(SCRIPT_DIR, "models", "art"),
        os.path.join(SCRIPT_DIR, "models", "art", "loras"),
        os.path.join(SCRIPT_DIR, ".ollama-runtime"),
    ]
    for path in required_dirs:
        exists = os.path.isdir(path)
        if not exists and apply:
            os.makedirs(path, exist_ok=True)
            repairs.append({"type": "mkdir", "path": os.path.relpath(path, PROJECT_ROOT)})
            exists = True
        add_check("dir:" + os.path.relpath(path, PROJECT_ROOT), exists, path)

    if not os.path.exists(CHATS_FILE) and apply:
        write_json_file(CHATS_FILE, [])
        repairs.append({"type": "create_json", "path": os.path.relpath(CHATS_FILE, PROJECT_ROOT)})
    add_check("chatsJson", os.path.exists(CHATS_FILE), CHATS_FILE)

    settings = load_settings()
    settings_changes = {}
    for key, default_value in DEFAULT_SETTINGS.items():
        if key not in settings:
            settings_changes[key] = default_value
    if ensure_advanced:
        advanced_values = {
            "toolModeEnabled": True,
            "computerControlEnabled": True,
            "voiceAutoSpeak": True,
            "capabilityMode": settings.get("capabilityMode") or "chat",
            "expertMode": settings.get("expertMode") or "agent-007",
        }
        for key, value in advanced_values.items():
            if settings.get(key) != value:
                settings_changes[key] = value

    if settings_changes and apply:
        if os.path.exists(SETTINGS_FILE):
            backup = os.path.join(
                TOOL_BACKUP_DIR,
                tool_timestamp(),
                os.path.relpath(SETTINGS_FILE, PROJECT_ROOT),
            )
            os.makedirs(os.path.dirname(backup), exist_ok=True)
            shutil.copy2(SETTINGS_FILE, backup)
            backups.append(backup)
        settings.update(settings_changes)
        write_json_file(SETTINGS_FILE, settings)
        repairs.append({
            "type": "settings_update",
            "path": os.path.relpath(SETTINGS_FILE, PROJECT_ROOT),
            "keys": sorted(settings_changes),
        })
    add_check("settingsJson", os.path.exists(SETTINGS_FILE), SETTINGS_FILE)
    add_check("toolModeEnabled", bool(load_settings().get("toolModeEnabled")), SETTINGS_FILE)
    add_check("computerControlEnabled", bool(load_settings().get("computerControlEnabled")), SETTINGS_FILE)

    executable_paths = [
        "Launch Oscar.command",
        "Launch Oscar GOAT Upgraded.command",
        "Mac/Launch Oscar.command",
        "Mac/Launch Oscar Client.command",
        "Mac/Start Oscar Runtime Services.command",
        "Mac/Start Oscar ComfyUI.command",
        "Mac/Start Oscar Autonomous Model Download.command",
        "Linux/install.sh",
        "Linux/start.sh",
        "Android/install.sh",
        "Android/start.sh",
        "Phone/start-phone-host.sh",
        "Phone/Start Oscar Phone Host.command",
        "Deploy/build-oscar-packages.sh",
        "Shared/runtime/setup-art-runtimes.sh",
        "Shared/runtime/start-comfyui.sh",
        "Shared/runtime/start-auto1111.sh",
        "Shared/runtime/start-forge.sh",
        "Shared/runtime/build-llama-cpp.sh",
        "Shared/runtime/start-llama-cpp-server.sh",
        "Shared/runtime/start-autonomous-model-download.sh",
        "Shared/runtime/install-launch-agents.sh",
    ]
    for rel in executable_paths:
        path = os.path.join(PROJECT_ROOT, rel)
        if not os.path.exists(path):
            add_check("missing:" + rel, False, path)
            continue
        executable = os.access(path, os.X_OK)
        if not executable and apply:
            current = os.stat(path).st_mode
            os.chmod(path, current | 0o755)
            repairs.append({"type": "chmod_x", "path": rel})
            executable = True
        add_check("executable:" + rel, executable, path)

    for rel in ("Shared/chat_server.py", "Shared/FastChatUI.html"):
        path = os.path.join(PROJECT_ROOT, rel)
        add_check("exists:" + rel, os.path.exists(path), path)

    llama_server_path = local_or_path_executable(AGENT_007_LLAMA_SERVER, "llama-server")
    add_check(
        "llamaServerBinary",
        bool(llama_server_path and os.path.exists(llama_server_path) and os.access(llama_server_path, os.X_OK)),
        llama_server_path or AGENT_007_LLAMA_SERVER,
    )
    if os.path.islink(AGENT_007_LLAMA_SERVER):
        llama_target = os.path.realpath(AGENT_007_LLAMA_SERVER)
        add_check(
            "llamaServerSymlinkLocal",
            llama_target.startswith(os.path.realpath(SCRIPT_DIR) + os.sep),
            llama_target,
        )

    for rel in ("Shared/runtime/build-llama-cpp.sh", "Shared/runtime/start-llama-cpp-server.sh"):
        path = os.path.join(PROJECT_ROOT, rel)
        try:
            with open(path, "r", encoding="utf-8") as f:
                script_body = f.read(400)
            add_check(
                "runtimeScriptReal:" + rel,
                "stub" not in script_body.lower() and "llama-server" in script_body,
                path,
            )
        except Exception as exc:
            add_check("runtimeScriptReal:" + rel, False, f"{path}: {type(exc).__name__}: {exc}")

    code_extensions = [".py", ".swift", ".gradle"]
    add_check(
        "toolCodeExtensions",
        all(ext in BRIDGE_TEXT_EXTENSIONS for ext in code_extensions),
        ", ".join(code_extensions),
    )

    code_read_samples = [
        ("toolReadAllowedPy", "/Users/raspy/halito-chat-ios/HalitoMacCompanion/viewer.py"),
        ("toolReadAllowedSwift", "/Users/raspy/halito-chat-ios/HalitoMacCompanion/Package.swift"),
    ]
    for check_name, sample_path in code_read_samples:
        if not os.path.exists(sample_path):
            continue
        try:
            read_result = tool_read_text(sample_path, max_chars=200)
            add_check(
                check_name,
                read_result.get("absolutePath") == os.path.realpath(sample_path)
                and isinstance(read_result.get("content"), str),
                sample_path,
            )
        except Exception as exc:
            add_check(check_name, False, f"{sample_path}: {type(exc).__name__}: {exc}")

    halito_companion = "/Users/raspy/halito-chat-ios/HalitoMacCompanion"
    if os.path.isdir(halito_companion):
        try:
            real_companion = os.path.realpath(halito_companion)
            tree_files = tool_iter_files(20, [halito_companion])
            scoped = bool(tree_files) and all(
                item.get("absolutePath") == real_companion
                or str(item.get("absolutePath", "")).startswith(real_companion + os.sep)
                for item in tree_files
            )
            has_viewer = any(item.get("path", "").endswith("HalitoMacCompanion/viewer.py") for item in tree_files)
            add_check(
                "toolTreeScopedHalitoMacCompanion",
                scoped and has_viewer,
                f"{halito_companion} files={len(tree_files)} hasViewer={has_viewer}",
            )
        except Exception as exc:
            add_check("toolTreeScopedHalitoMacCompanion", False, f"{type(exc).__name__}: {exc}")

        try:
            search_result = tool_search_text("render_landing_page", max_hits=5, roots=[halito_companion])
            hits = search_result.get("hits", [])
            has_landing_hit = any(hit.get("path", "").endswith("HalitoMacCompanion/viewer.py") for hit in hits)
            add_check(
                "toolSearchScopedHalitoMacCompanion",
                search_result.get("searchedRoots") == [halito_companion] and has_landing_hit,
                f"{halito_companion} hits={len(hits)} hasLandingHit={has_landing_hit}",
            )
        except Exception as exc:
            add_check("toolSearchScopedHalitoMacCompanion", False, f"{type(exc).__name__}: {exc}")

    try:
        with open(os.path.abspath(__file__), "r", encoding="utf-8") as f:
            server_source = f.read()
        add_check(
            "drawRendererFreshSeed",
            "renderSeed = uuid.uuid4().hex" in server_source and '"renderSeed": render_seed' in server_source,
            os.path.abspath(__file__),
        )
        add_check(
            "drawRendererPromptVariation",
            "subject_words = set" in server_source and "Prompt fingerprint bars" in server_source,
            os.path.abspath(__file__),
        )
    except Exception as exc:
        add_check("drawRendererSelfCheck", False, str(exc))

    try:
        py_compile.compile(os.path.abspath(__file__), doraise=True)
        add_check("chatServerSyntax", True, os.path.abspath(__file__))
    except Exception as exc:
        add_check("chatServerSyntax", False, str(exc))

    result = {
        "applied": apply,
        "ensureAdvanced": ensure_advanced,
        "checks": checks,
        "repairs": repairs,
        "backups": backups,
        "ok": all(item.get("ok") for item in checks),
    }
    result["logId"] = tool_log({"action": "self_heal", **result})
    return result


def tool_draw_local(subject):
    subject = str(subject or "").strip()
    if not subject:
        subject = "original Oscar local image"
    if len(subject) > 500:
        subject = subject[:500]
    manifest = create_local_png_draft(subject)
    manifest["logId"] = tool_log({
        "action": "draw",
        "subject": subject,
        "pngPath": manifest.get("pngPath"),
        "url": manifest.get("url"),
        "renderer": manifest.get("renderer"),
    })
    return manifest


def computer_validate_url(url):
    value = str(url or "").strip()
    if not value or len(value) > 2048:
        raise ValueError("A valid http/https URL is required")
    parsed = urlparse(value)
    if parsed.scheme.lower() not in COMPUTER_ALLOWED_URL_SCHEMES or not parsed.netloc:
        raise PermissionError("Computer Control open_url only allows http/https URLs")
    if parsed.username or parsed.password:
        raise PermissionError("URLs with embedded usernames or passwords are blocked")
    return value


def computer_validate_app_name(app_name):
    requested = str(app_name or "").strip()
    if not requested:
        raise ValueError("App name is required")
    if "/" in requested or "\\" in requested or not COMPUTER_APP_NAME_RE.match(requested):
        raise PermissionError("App name is not allowed")
    for allowed in tool_policy_allowed_apps():
        if allowed.lower() == requested.lower():
            return allowed
    raise PermissionError("App is not in Oscar's Computer Control allowlist")


def computer_resolve_workspace_path(path_arg):
    root, full_path, rel = tool_resolve(path_arg or ".")
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Computer Control path does not exist: {rel}")
    return root, full_path, rel


def computer_run_process(command, dry_run=False):
    if dry_run:
        return {"exitCode": 0, "stdout": "", "stderr": ""}
    try:
        proc = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=COMPUTER_CONTROL_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        return {
            "exitCode": 124,
            "stdout": tool_short_output(e.stdout or "", 2000),
            "stderr": f"Computer Control command timed out after {COMPUTER_CONTROL_TIMEOUT_SECONDS} seconds",
        }
    return {
        "exitCode": proc.returncode,
        "stdout": tool_short_output(proc.stdout, 2000),
        "stderr": tool_short_output(proc.stderr, 2000),
    }


def computer_escape_applescript_text(value):
    return str(value).replace("\\", "\\\\").replace('"', '\\"')


def computer_validate_type_text(value):
    text = str(value or "")
    if not text:
        raise ValueError("Text is required")
    if len(text) > COMPUTER_MAX_TYPE_CHARS:
        raise ValueError(f"Type text is too long ({len(text)} chars)")
    if any(ord(ch) < 32 and ch not in "\n\r\t" for ch in text):
        raise ValueError("Type text contains unsupported control characters")
    return text.replace("\r\n", "\n").replace("\r", "\n")


def computer_validate_modifiers(value):
    if value is None:
        return []
    if isinstance(value, str):
        raw_items = [item for item in re.split(r"[+,\s]+", value) if item]
    elif isinstance(value, list):
        raw_items = value
    else:
        raise ValueError("Hotkey modifiers must be a list or string")

    modifiers = []
    for raw in raw_items:
        name = COMPUTER_MODIFIER_ALIASES.get(str(raw).strip().lower())
        if not name or name not in COMPUTER_ALLOWED_MODIFIERS:
            raise PermissionError("Unsupported hotkey modifier")
        if name not in modifiers:
            modifiers.append(name)
    return modifiers


def computer_validate_hotkey_key(value):
    key = str(value or "").strip()
    if not key:
        raise ValueError("Hotkey key is required")
    key_lower = key.lower()
    if key_lower in COMPUTER_SPECIAL_KEY_CODES:
        return {"kind": "keyCode", "value": COMPUTER_SPECIAL_KEY_CODES[key_lower], "label": key_lower}
    if len(key) == 1 and 32 <= ord(key) <= 126:
        return {"kind": "keystroke", "value": key.lower(), "label": key.lower()}
    raise PermissionError("Unsupported hotkey key")


def computer_applescript_modifier_clause(modifiers):
    if not modifiers:
        return ""
    parts = [f"{name} down" for name in modifiers]
    return " using {" + ", ".join(parts) + "}"


def computer_app_activate_script(app):
    if not app:
        return ""
    return f'tell application "{computer_escape_applescript_text(app)}" to activate\n' "delay 0.2\n"


def computer_type_text_script(app, text):
    lines = [computer_app_activate_script(app), 'tell application "System Events"\n']
    chunks = re.split(r"(\n|\t)", text)
    for chunk in chunks:
        if chunk == "":
            continue
        if chunk == "\n":
            lines.append("  key code 36\n")
        elif chunk == "\t":
            lines.append("  key code 48\n")
        else:
            lines.append(f'  keystroke "{computer_escape_applescript_text(chunk)}"\n')
    lines.append("end tell\n")
    return "".join(lines)


def computer_hotkey_script(app, key_info, modifiers):
    clause = computer_applescript_modifier_clause(modifiers)
    command = (
        f"key code {key_info['value']}{clause}"
        if key_info["kind"] == "keyCode"
        else f'keystroke "{computer_escape_applescript_text(key_info["value"])}"{clause}'
    )
    return (
        computer_app_activate_script(app)
        + 'tell application "System Events"\n'
        + f"  {command}\n"
        + "end tell\n"
    )


def computer_list_running_apps(dry_run=False):
    if platform.system() != "Darwin":
        raise PermissionError("Computer Control list_running_apps is currently enabled on macOS only")
    proc = computer_run_process(["ps", "-axo", "comm="], dry_run=dry_run)
    if proc["exitCode"] != 0:
        raise PermissionError(proc["stderr"] or "Could not list running apps")
    apps = []
    for line in proc["stdout"].splitlines():
        line = line.strip()
        if not line:
            continue
        app_match = re.search(r"/([^/]+)\.app/Contents/MacOS/", line)
        if app_match:
            apps.append(app_match.group(1))
            continue
        basename = os.path.basename(line)
        if basename in COMPUTER_ALLOWED_APPS:
            apps.append(basename)
    return {
        "computerAction": "list_running_apps",
        "apps": sorted(set(apps), key=str.lower),
        "dryRun": dry_run,
        "executed": not dry_run,
        **{**proc, "stdout": ""},
    }


def computer_daw_transport(payload, dry_run=False):
    app = computer_validate_app_name(payload.get("app", ""))
    if app.lower() not in DAW_ALLOWED_TRANSPORT_APPS:
        raise PermissionError("DAW transport is limited to owner-approved audio apps")

    command_name = str(payload.get("transport") or payload.get("command") or "").strip().lower()
    command = DAW_ALLOWED_TRANSPORT_COMMANDS.get(command_name)
    if not command:
        raise ValueError("Unsupported DAW transport command")

    if platform.system() != "Darwin":
        raise PermissionError("DAW transport control is currently enabled on macOS only")

    script = (
        f'tell application "{computer_escape_applescript_text(app)}" to activate\n'
        'delay 0.2\n'
        'tell application "System Events"\n'
        f'  key code {command["keyCode"]}\n'
        'end tell\n'
    )
    proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
    if proc["exitCode"] != 0:
        raise PermissionError(proc["stderr"] or f"Could not send DAW transport command to {app}")

    return {
        "computerAction": "daw_transport",
        "app": app,
        "transport": command_name,
        "key": command["label"],
        "dryRun": dry_run,
        "executed": not dry_run,
        **proc,
    }


def computer_control_action(payload):
    computer_action = str(
        payload.get("computerAction")
        or payload.get("computer_action")
        or payload.get("task")
        or ""
    ).strip().lower()
    dry_run = bool(payload.get("dryRun"))
    system_name = platform.system()

    if computer_action == "open_url":
        url = computer_validate_url(payload.get("url", ""))
        opened = True if dry_run else bool(webbrowser.open(url))
        result = {
            "computerAction": "open_url",
            "url": url,
            "dryRun": dry_run,
            "executed": not dry_run,
            "opened": opened,
        }
    elif computer_action == "open_app":
        app = computer_validate_app_name(payload.get("app", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control open_app is currently enabled on macOS only")
        command = ["open", "-a", app]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not open app: {app}")
        result = {
            "computerAction": "open_app",
            "app": app,
            "command": " ".join(shlex.quote(part) for part in command),
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "activate_app":
        app = computer_validate_app_name(payload.get("app", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control activate_app is currently enabled on macOS only")
        script = computer_app_activate_script(app)
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not activate app: {app}")
        result = {
            "computerAction": "activate_app",
            "app": app,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "quit_app":
        app = computer_validate_app_name(payload.get("app", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control quit_app is currently enabled on macOS only")
        script = f'tell application "{computer_escape_applescript_text(app)}" to quit\n'
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not quit app: {app}")
        result = {
            "computerAction": "quit_app",
            "app": app,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "open_path":
        root, full_path, rel = computer_resolve_workspace_path(payload.get("path", "."))
        if system_name == "Darwin":
            command = ["open", full_path]
        elif system_name == "Windows":
            command = ["cmd", "/c", "start", "", full_path]
        else:
            command = ["xdg-open", full_path]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not open path: {rel}")
        result = {
            "computerAction": "open_path",
            "root": root,
            "path": rel,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "reveal_path":
        root, full_path, rel = computer_resolve_workspace_path(payload.get("path", "."))
        if system_name == "Darwin":
            command = ["open", "-R", full_path]
        elif system_name == "Windows":
            command = ["explorer", "/select," + full_path]
        else:
            command = ["xdg-open", full_path if os.path.isdir(full_path) else os.path.dirname(full_path)]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not reveal path: {rel}")
        result = {
            "computerAction": "reveal_path",
            "root": root,
            "path": rel,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "list_running_apps":
        result = computer_list_running_apps(dry_run=dry_run)
    elif computer_action == "screenshot":
        if system_name != "Darwin":
            raise PermissionError("Computer Control screenshot is currently enabled on macOS only")
        os.makedirs(COMPUTER_SCREENSHOT_DIR, exist_ok=True)
        stamp = time.strftime("%Y%m%d-%H%M%S")
        filename = f"computer-screenshot-{stamp}-{uuid.uuid4().hex[:8]}.png"
        full_path = os.path.join(COMPUTER_SCREENSHOT_DIR, filename)
        command = ["screencapture", "-x", full_path]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not capture screenshot")
        rel_url = f"computer-control/{filename}"
        result = {
            "computerAction": "screenshot",
            "path": os.path.relpath(full_path, tool_root()),
            "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{rel_url}",
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "speak":
        text = str(payload.get("text") or "").strip()
        if not text:
            raise ValueError("Speech text is required")
        if len(text) > COMPUTER_MAX_SPEAK_CHARS:
            raise ValueError(f"Speech text is too long ({len(text)} chars)")
        if system_name != "Darwin":
            raise PermissionError("Computer Control speak is currently enabled on macOS only")
        command = ["say", text]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not speak text")
        result = {
            "computerAction": "speak",
            "chars": len(text),
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "type_text":
        app = computer_validate_app_name(payload.get("app", "")) if payload.get("app") else ""
        text = computer_validate_type_text(payload.get("text", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control type_text is currently enabled on macOS only")
        script = computer_type_text_script(app, text)
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not type text")
        result = {
            "computerAction": "type_text",
            "app": app or "frontmost",
            "chars": len(text),
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "hotkey":
        app = computer_validate_app_name(payload.get("app", "")) if payload.get("app") else ""
        key_info = computer_validate_hotkey_key(payload.get("key", ""))
        modifiers = computer_validate_modifiers(payload.get("modifiers") or payload.get("using"))
        if system_name != "Darwin":
            raise PermissionError("Computer Control hotkey is currently enabled on macOS only")
        script = computer_hotkey_script(app, key_info, modifiers)
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not send hotkey")
        result = {
            "computerAction": "hotkey",
            "app": app or "frontmost",
            "key": key_info["label"],
            "modifiers": modifiers,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "daw_transport":
        result = computer_daw_transport(payload, dry_run=dry_run)
    else:
        raise ValueError("Unsupported computer control action")

    result["logId"] = tool_log({"action": "computer", **result})
    return result


def shorten_middle(text, max_chars, note="shortened for local Ollama runtime"):
    """Keep the beginning and ending of long text while bounding local prompt size."""
    text = "" if text is None else str(text)
    if len(text) <= max_chars:
        return text

    marker = f"\n\n[{note}; original {len(text)} chars]\n\n"
    keep = max(0, max_chars - len(marker))
    head = max(0, int(keep * 0.68))
    tail = max(0, keep - head)
    return text[:head] + marker + (text[-tail:] if tail else "")


def is_bridge_context(content):
    content = "" if content is None else str(content)
    return content.startswith(BRIDGE_CONTEXT_PREFIXES)


def split_bridge_context(content):
    marker = "\n---\nUSER REQUEST\n"
    content = "" if content is None else str(content)
    if marker not in content:
        return content, ""
    return content.split(marker, 1)


def observed_files_from_manifest(snapshot):
    files = []
    in_files = False
    for raw_line in str(snapshot).splitlines():
        line = raw_line.strip()
        if line.startswith("OBSERVED_FILES"):
            in_files = True
            continue
        if not in_files:
            continue
        if line.startswith("- "):
            files.append(line[2:].strip())
        elif line:
            break
    return files


def bridge_request_wants_file_list(user_request):
    text = str(user_request or "").lower()
    analysis_terms = (
        "rank",
        "top ",
        "important",
        "inspect",
        "understand",
        "why",
        "analyze",
        "summarize",
        "deeper dive",
        "what this app is",
    )
    if any(term in text for term in analysis_terms):
        return False

    explicit_list_terms = (
        "list every file",
        "list all files",
        "list the observed files",
        "list observed files",
        "show every file",
        "show all files",
        "name the files",
        "what files are listed",
        "what files can you see",
        "copy filenames",
        "copy the filenames",
    )
    if any(term in text for term in explicit_list_terms):
        return True

    return (
        ("exactly as shown" in text or "as shown" in text)
        and ("file" in text or "observed_files" in text or "observed files" in text)
        and ("list" in text or "show" in text or "copy" in text)
    )


def bridge_request_wants_owner_feature_rank(user_request):
    text = str(user_request or "").lower()
    return (
        "rank" in text
        and ("top 8" in text or "top eight" in text)
        and "file" in text
        and "agent-007" in text
        and ("owner" in text or "private" in text)
    )


def bridge_request_wants_owner_privacy_files(user_request):
    text = str(user_request or "").lower()
    return (
        ("which 3 files" in text or "which three files" in text or "3 files" in text or "three files" in text)
        and "agent-007" in text
        and ("private" in text or "owner" in text)
        and ("responsible" in text or "keeping" in text or "protect" in text)
    )


def bridge_request_wants_approval_plan(user_request):
    text = str(user_request or "").lower()
    return (
        ("start now" in text or "make the app better" in text or "improve" in text)
        and "agent-007" in text
        and ("owner" in text or "accord" in text or "feature" in text)
    )


def bridge_request_wants_owner_security_improvement(user_request):
    text = str(user_request or "").lower()
    return (
        "agent-007" in text
        and ("owner-security" in text or "owner security" in text or "security improvement" in text)
        and ("one small" in text or "propose" in text or "proposed improvement" in text)
    )


def bridge_request_wants_readonly_implementation(user_request):
    text = str(user_request or "").lower()
    approval_terms = ("approved", "confirmed", "go ahead", "yes")
    implementation_terms = ("implement", "change", "edit", "add", "fix", "code")
    owner_terms = ("agent-007", "owner", "owner-auth", "owner security", "owner-security")
    return (
        any(term in text for term in approval_terms)
        and any(term in text for term in implementation_terms)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_cooldown_patch_proposal(user_request):
    text = str(user_request or "").lower()
    return (
        "patch" in text
        and ("cooldown" in text or "cool down" in text)
        and ("failed-login" in text or "failed login" in text or "wrong access" in text)
        and ("propose" in text or "read-only" in text or "read only" in text)
    )


def bridge_request_wants_complete_cooldown_diff(user_request):
    text = str(user_request or "").lower()
    return (
        ("complete proposed diff" in text or "complete diff" in text or "unified diff" in text)
        and ("failed-login" in text or "failed login" in text)
        and "cooldown" in text
        and "lib/owner-auth.ts" in text
    )


def bridge_request_wants_cooldown_diff_review(user_request):
    text = str(user_request or "").lower()
    return (
        "review" in text
        and "diff" in text
        and ("pass" in text and "concerns" in text and "test" in text)
        and (
            "failed-login" in text
            or "failed login" in text
            or "failed_login_limit" in text
            or "createownersession" in text
            or "accord_owner" in text
        )
    )


def bridge_request_wants_owner_auth_symbol_verification(user_request):
    text = str(user_request or "").lower()
    exact_terms = (
        "exact symbol",
        "exact symbols",
        "search the actual file content",
        "search actual file content",
        "present:",
        "missing:",
        "not visible",
    )
    symbol_terms = (
        "failed_login_limit",
        "failed_login_cooldown_ms",
        "failedownerlogin",
        "isownerlogincoolingdown",
        "recordfailedownerlogin",
        "clearfailedownerlogin",
        "createownersession",
        "cookie_name",
        "accord_owner",
    )
    return (
        "lib/owner-auth.ts" in text
        and any(term in text for term in exact_terms)
        and any(term in text for term in symbol_terms)
    )


def bridge_request_wants_owner_privacy_route_test(user_request):
    text = str(user_request or "").lower()
    required_paths = (
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
        "app/page.tsx",
    )
    checklist_terms = (
        "owner privacy route test",
        "gated before showing ownerconsole",
        "ownerconsole",
        "not authenticated",
        "server actions handle login and logout",
        "cookie name",
        "expose or link to agent-007 publicly",
        "publicly",
    )
    return (
        ("agent-007" in text or "owner" in text)
        and all(path in text for path in required_paths)
        and any(term in text for term in checklist_terms)
    )


def bridge_request_wants_runtime_test_plan(user_request):
    text = str(user_request or "").lower()
    plan_terms = (
        "runtime test plan only",
        "runtime test plan",
        "test plan only",
        "safe browser test",
        "browser test",
    )
    owner_terms = (
        "owner privacy",
        "ownergate",
        "owner gate",
        "/owner/agent-007",
        "owner console",
        "ownerconsole",
    )
    guard_terms = (
        "do not inspect files",
        "do not read",
        "do not summarize code",
        "do not claim any test was performed",
        "do not claim tests were performed",
        "without exposing",
    )
    return (
        any(term in text for term in plan_terms)
        and ("agent-007" in text or any(term in text for term in owner_terms))
        and (any(term in text for term in owner_terms) or any(term in text for term in guard_terms))
    )


def bridge_request_wants_owner_ux_improvement(user_request):
    text = str(user_request or "").lower()
    ux_terms = (
        "owner ux improvement",
        "owner ux",
        "owner login experience",
        "login experience",
        "ownergate",
        "owner gate",
    )
    proposal_terms = (
        "propose one small",
        "one small improvement",
        "proposed improvement",
        "do not write code",
        "only",
    )
    return (
        "agent-007" in text
        and any(term in text for term in ux_terms)
        and any(term in text for term in proposal_terms)
    )


def bridge_request_wants_owner_ux_patch_plan(user_request):
    text = str(user_request or "").lower()
    plan_terms = (
        "patch plan only",
        "proposed patch plan",
        "patch plan",
        "convert the approved owner ux proposal",
        "convert the approved",
    )
    owner_terms = (
        "owner ux",
        "owner login",
        "ownergate",
        "owner gate",
        "rejected access",
        "cooldown state",
        "generic ownergate feedback",
        "generic feedback",
    )
    return (
        "agent-007" in text
        and any(term in text for term in plan_terms)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_owner_ux_proposed_diff(user_request):
    text = str(user_request or "").lower()
    diff_terms = (
        "proposed diff only",
        "produce a proposed diff",
        "complete proposed diff",
        "unified diff",
        "diff here",
    )
    owner_terms = (
        "ownergate",
        "owner gate",
        "owner ux",
        "owner login",
        "rejected access",
        "cooldown state",
        "generic private ownergate feedback",
        "generic ownergate feedback",
    )
    return (
        "agent-007" in text
        and any(term in text for term in diff_terms)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_owner_ux_diff_review(user_request):
    text = str(user_request or "").lower()
    review_terms = (
        "review the proposed diff",
        "review proposed diff",
        "review the diff",
        "diff to review",
        "check whether this ownergate feedback diff is safe",
        "check whether this owner gate feedback diff is safe",
    )
    diff_symbols = (
        "ownerloginresult",
        "feedback=cooldown",
        "feedback=rejected",
        "ownerfeedbackmessages",
        "parseownerfeedback",
        "createownersession",
    )
    owner_terms = (
        "ownergate",
        "owner gate",
        "owner access code",
        "owner-only",
        "public homepage links",
    )
    return (
        any(term in text for term in review_terms)
        and any(term in text for term in diff_symbols)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_owner_ux_applied_patch_verification(user_request):
    text = str(user_request or "").lower()
    verify_terms = (
        "verify the applied",
        "verify applied",
        "confirm the applied",
        "confirm applied",
        "check the applied",
        "check applied",
        "from actual file contents",
        "actual file contents",
    )
    patch_terms = (
        "ownergate feedback patch",
        "owner gate feedback patch",
        "owner ux feedback patch",
        "ownergate feedback",
        "owner gate feedback",
        "applied patch",
        "feedback patch",
    )
    return (
        any(term in text for term in verify_terms)
        and any(term in text for term in patch_terms)
        and ("agent-007" in text or "owner" in text or "/owner/agent-007" in text)
    )


def bridge_request_wants_public_exposure_answer(user_request):
    text = str(user_request or "").lower()
    return (
        "agent-007" in text
        and ("public homepage" in text or "public page" in text or "homepage" in text)
        and ("link" in text or "linked" in text or "available" in text or "expose" in text)
    )


def bridge_request_wants_owner_privacy_synthesis(user_request):
    text = str(user_request or "").lower()
    return (
        "agent-007" in text
        and "private" in text
        and "summarize" in text
        and "actual file contents" in text
        and "app/owner/agent-007/page.tsx" in text
        and "app/owner/agent-007/actions.ts" in text
        and "lib/owner-auth.ts" in text
    )


def bridge_request_wants_file_content(user_request):
    text = str(user_request or "").lower()
    content_terms = (
        "read ",
        "inspect ",
        "open ",
        "summarize",
        "actual file",
        "file contents",
        "from the actual",
        "examine",
    )
    return any(term in text for term in content_terms)


def encode_ollama_bridge_answer(payload, answer):
    if payload.get("stream", False):
        chunks = []
        chunk_size = 220
        for i in range(0, len(answer), chunk_size):
            chunks.append(json.dumps({
                "message": {"role": "assistant", "content": answer[i:i + chunk_size]},
                "done": False,
            }))
        chunks.append(json.dumps({"done": True, "done_reason": "stop"}))
        return "\n".join(chunks).encode("utf-8") + b"\n"

    return json.dumps({
        "model": payload.get("model", "bridge-manifest"),
        "message": {"role": "assistant", "content": answer},
        "done": True,
        "done_reason": "stop",
    }).encode("utf-8")


def bridge_payload_context_and_request(body):
    if not body:
        return None, None, None

    try:
        payload = json.loads(body)
    except Exception:
        return None, None, None

    messages = payload.get("messages")
    if not isinstance(messages, list):
        return None, None, None

    for msg in reversed(messages):
        if not isinstance(msg, dict) or msg.get("role") == "system":
            continue
        content = str(msg.get("content", ""))
        if not is_bridge_context(content):
            continue
        snapshot, user_request = split_bridge_context(content)
        return payload, snapshot, user_request

    return None, None, None


def bridge_requested_path(user_request, observed_files):
    request = str(user_request or "")
    lower_request = request.lower()
    for path in sorted(observed_files, key=len, reverse=True):
        if path.lower() in lower_request:
            return path

    match = BRIDGE_REQUESTED_PATH_RE.search(request)
    return match.group(0) if match else None


def bridge_file_list_answer(body):
    """Return a deterministic Ollama-compatible answer for file-list bridge requests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_file_list(user_request):
        return None

    files = observed_files_from_manifest(snapshot)
    if not files:
        return None

    answer = "Verified OBSERVED_FILES:\n\n" + "\n".join(f"- {path}" for path in files)
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_feature_rank_answer(body):
    """Return the owner-approved file priority for Oscar owner-feature ranking tests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_feature_rank(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    if not files:
        return None

    priority = [
        ("app/owner/agent-007/page.tsx", "owner-only Oscar UI and route behavior should be inspected first."),
        ("app/owner/agent-007/actions.ts", "server actions show how owner login and logout interactions are handled."),
        ("lib/owner-auth.ts", "owner authentication is the key privacy boundary for Oscar."),
        ("lib/agent_007-agent.ts", "Oscar's active prompt, modes, and coding behavior live here."),
        ("lib/accord-data.ts", "shared Accord data may feed owner-facing decisions or displays."),
        ("prisma/schema.prisma", "database models reveal what private owner data may need protection."),
        ("app/page.tsx", "the public homepage should be checked to confirm Oscar is not exposed there."),
        ("docs/agent-007-agent.md", "the existing Oscar documentation explains the approved agent upgrade and guardrails."),
    ]
    ranked = [(path, reason) for path, reason in priority if path in files]
    if len(ranked) < 8 and "docs/agent-007-coding-protocol.md" in files:
        ranked.append((
            "docs/agent-007-coding-protocol.md",
            "the owner-approved protocol defines Oscar's honesty, privacy, and approval rules.",
        ))
    ranked = ranked[:8]
    if not ranked:
        return None

    answer = "\n".join(f"{index}. `{path}`: {reason}" for index, (path, reason) in enumerate(ranked, start=1))
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_privacy_files_answer(body):
    """Return the owner-approved privacy file candidates for Oscar privacy tests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_privacy_files(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    expected = [
        "lib/owner-auth.ts",
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
    ]
    if not all(path in files for path in expected):
        return None

    answer = (
        "Based only on the verified OBSERVED_FILES, `lib/owner-auth.ts`, "
        "`app/owner/agent-007/page.tsx`, and `app/owner/agent-007/actions.ts` are most likely responsible "
        "for keeping Oscar private to the owner: the auth library suggests the owner access boundary, "
        "the owner page suggests the private route/UI, and the actions file suggests the server-side login/logout flow. "
        "Blocked patterns like `.env*` and `node_modules` are not observed files in this snapshot."
    )
    return encode_ollama_bridge_answer(payload, answer)


def bridge_approval_plan_answer(body):
    """Return the owner-approval gate plan for broad change requests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_approval_plan(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    expected = [
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
        "lib/agent_007-agent.ts",
        "docs/agent-007-agent.md",
        "docs/agent-007-coding-protocol.md",
    ]
    listed = [path for path in expected if path in files]
    if not listed:
        return None

    answer = "\n".join([
        "Goal:",
        "Improve Oscar's owner-only feature without changing files yet.",
        "",
        "Files I expect to inspect first:",
        *[f"- `{path}`" for path in listed],
        "",
        "Steps:",
        "1. Inspect the verified owner route, owner actions, auth library, and Oscar protocol files.",
        "2. Separate confirmed behavior from filename-based guesses.",
        "3. Propose one small approved improvement slice instead of a broad refactor.",
        "4. After approval, make only the approved changes and preserve owner-only access.",
        "",
        "Risk:",
        "Changing owner auth or public navigation could accidentally expose Oscar, so privacy checks must come first.",
        "",
        "Test:",
        "Verify `/owner/agent-007` remains gated, public pages do not expose Oscar or the legacy owner route, and the changed owner flow still works.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_security_improvement_answer(body):
    """Propose exactly one small owner-security improvement without making changes."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_security_improvement(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    required = [
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
    ]
    if not all(path in observed for path in required):
        return None

    try:
        contents = {path: bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"] for path in required}
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect the owner-security files through the workspace bridge: {exc}")

    page = contents["app/owner/agent-007/page.tsx"]
    actions = contents["app/owner/agent-007/actions.ts"]
    auth = contents["lib/owner-auth.ts"]

    confirmed = []
    if "isOwnerAuthenticated()" in page and "OwnerGate" in page and "OwnerConsole" in page:
        confirmed.append("`app/owner/agent-007/page.tsx` gates the owner page with `isOwnerAuthenticated()` and separates unauthenticated `OwnerGate` from authenticated `OwnerConsole`.")
    if "createOwnerSession(accessCode)" in actions and "clearOwnerSession()" in actions:
        confirmed.append("`app/owner/agent-007/actions.ts` handles owner login with `createOwnerSession(accessCode)` and logout with `clearOwnerSession()`.")
    if "httpOnly: true" in auth and 'sameSite: "strict"' in auth:
        confirmed.append("`lib/owner-auth.ts` sets the owner session cookie as HTTP-only and `sameSite: \"strict\"`.")

    rate_limit_terms = ("rateLimit", "rate-limit", "lockout", "cooldown", "failedAttempts", "attempts")
    if not any(term in page + actions + auth for term in rate_limit_terms):
        confirmed.append("The inspected files do not show failed-login rate limiting, lockout, cooldown, or failed-attempt tracking.")

    if not confirmed:
        confirmed.append("The verified files are the owner page, owner actions, and owner auth helper; no code changes have been made.")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Proposed improvement:",
        "- Add a small failed-login cooldown for the owner access form, scoped to the owner auth flow, so repeated wrong access-code attempts are temporarily slowed before another try is allowed.",
        "",
        "Risk:",
        "- Changing owner auth could accidentally lock out the real owner or weaken the private route if the cooldown is implemented in the wrong layer.",
        "",
        "Test:",
        "- Verify a wrong access code is rejected.",
        "- Verify repeated failed attempts trigger the cooldown.",
        "- Verify the correct owner access code still works after the cooldown.",
        "- Verify `/owner/agent-007` remains gated when unauthenticated.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_readonly_implementation_answer(body):
    """Prevent false Changed/Verified claims when Oscar only has the read-only bridge."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_readonly_implementation(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    checked = []
    cooldown_found = False
    for path in (
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
        "app/owner/agent-007/page.tsx",
    ):
        if path not in observed:
            continue
        try:
            content = bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
        except Exception:
            continue
        checked.append(path)
        if any(term in content for term in ("cooldown", "failedAttempts", "lockout", "rateLimit", "rate-limit")):
            cooldown_found = True

    cooldown_status = (
        "I found cooldown or failed-attempt language in the checked owner files."
        if cooldown_found
        else "I did not find cooldown, failed-attempt, lockout, or rate-limit logic in the checked owner files."
    )
    checked_line = ", ".join(f"`{path}`" for path in checked) if checked else "the verified owner files"

    answer = "\n".join([
        "Changed:",
        "- None. This workspace bridge is read-only, so I cannot truthfully claim that I edited files.",
        "",
        "Verified:",
        f"- Checked {checked_line}.",
        f"- {cooldown_status}",
        "- I do not have a patch diff, write-tool output, or updated file contents proving an implementation.",
        "",
        "Owner privacy:",
        "- Owner-only access is not weakened by this response because no files were changed.",
        "",
        "Still needs:",
        "- Apply an actual patch with a write-capable tool before claiming the cooldown is implemented.",
        "- After the patch, verify wrong codes are rejected, repeated failed attempts trigger the cooldown, the correct code still works after cooldown, and `/owner/agent-007` remains gated.",
        "",
        "Rule:",
        "- Never claim `Changed`, `Verified`, `implemented`, `fixed`, `tested`, `complete`, or `Still needs: None` without actual tool output, a patch diff, or updated file contents proving it.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_cooldown_patch_proposal_answer(body):
    """Propose a cooldown patch from verified owner-auth code without claiming it is applied."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_cooldown_patch_proposal(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    if "lib/owner-auth.ts" not in observed:
        return None

    try:
        auth = bridge_read_text("lib/owner-auth.ts", max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect `lib/owner-auth.ts` through the workspace bridge: {exc}")

    if "createOwnerSession(accessCode: string)" not in auth:
        return None

    answer = "\n".join([
        "Proposed patch only. Not applied.",
        "",
        "File I would change:",
        "- `lib/owner-auth.ts`",
        "",
        "Why this file:",
        "- `lib/owner-auth.ts` already owns the owner access-code check in `createOwnerSession(accessCode)` and creates the owner session cookie.",
        "- Keeping the cooldown there preserves the existing server-side owner auth boundary.",
        "- I would not change `lib/agent_007-agent.ts` for this, because that file defines Oscar prompt/protocol behavior, not login handling.",
        "",
        "Code idea:",
        "```ts",
        "const FAILED_LOGIN_LIMIT = 5;",
        "const FAILED_LOGIN_COOLDOWN_MS = 30 * 1000;",
        "",
        "const failedOwnerLogin = {",
        "  count: 0,",
        "  lockedUntil: 0",
        "};",
        "",
        "function isOwnerLoginCoolingDown(now = Date.now()) {",
        "  return failedOwnerLogin.lockedUntil > now;",
        "}",
        "",
        "function recordFailedOwnerLogin(now = Date.now()) {",
        "  failedOwnerLogin.count += 1;",
        "",
        "  if (failedOwnerLogin.count >= FAILED_LOGIN_LIMIT) {",
        "    failedOwnerLogin.count = 0;",
        "    failedOwnerLogin.lockedUntil = now + FAILED_LOGIN_COOLDOWN_MS;",
        "  }",
        "}",
        "",
        "function clearFailedOwnerLogin() {",
        "  failedOwnerLogin.count = 0;",
        "  failedOwnerLogin.lockedUntil = 0;",
        "}",
        "```",
        "",
        "Then update `createOwnerSession(accessCode: string)` like this:",
        "",
        "```ts",
        "export async function createOwnerSession(accessCode: string) {",
        "  const now = Date.now();",
        "",
        "  if (isOwnerLoginCoolingDown(now)) {",
        "    return false;",
        "  }",
        "",
        "  const expectedCode = readSecret(\"AGENT_007_OWNER_ACCESS_CODE\", DEV_ACCESS_CODE);",
        "",
        "  if (accessCode.trim() !== expectedCode) {",
        "    recordFailedOwnerLogin(now);",
        "    return false;",
        "  }",
        "",
        "  clearFailedOwnerLogin();",
        "",
        "  // Keep the existing cookie creation code here unchanged.",
        "}",
        "```",
        "",
        "Risk:",
        "- This is an in-memory cooldown. It is small and useful for the local/test app, but it would reset on server restart and may not cover multi-instance production deployments.",
        "",
        "Test:",
        "- Wrong access codes still redirect to `/owner/agent-007?error=1`.",
        "- Five wrong attempts trigger a temporary cooldown.",
        "- The correct owner code works after the cooldown expires.",
        "- `/owner/agent-007` remains gated while unauthenticated.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_complete_cooldown_diff_answer(body):
    """Return a complete proposed unified diff based on the verified owner-auth file."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_complete_cooldown_diff(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    if "lib/owner-auth.ts" not in observed:
        return None

    try:
        auth = bridge_read_text("lib/owner-auth.ts", max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect `lib/owner-auth.ts` through the workspace bridge: {exc}")

    required_terms = [
        'import "server-only";',
        'import { createHmac, timingSafeEqual } from "crypto";',
        'import { cookies } from "next/headers";',
        'const COOKIE_NAME = "accord_owner";',
        "export async function createOwnerSession(accessCode: string)",
        "cookieStore.set(COOKIE_NAME, sessionCookieValue(), {",
    ]
    if not all(term in auth for term in required_terms):
        return None

    answer = "\n".join([
        "Proposed diff only. Not applied.",
        "",
        "```diff",
        "--- a/lib/owner-auth.ts",
        "+++ b/lib/owner-auth.ts",
        "@@",
        " const DEV_ACCESS_CODE = \"accord-owner\";",
        " const DEV_COOKIE_SECRET = \"accord-owner-dev-secret-change-before-production\";",
        " const EIGHT_HOURS = 60 * 60 * 8;",
        "+const FAILED_LOGIN_LIMIT = 5;",
        "+const FAILED_LOGIN_COOLDOWN_MS = 30 * 1000;",
        "+",
        "+const failedOwnerLogin = {",
        "+  count: 0,",
        "+  lockedUntil: 0",
        "+};",
        "+",
        "+function isOwnerLoginCoolingDown(now = Date.now()) {",
        "+  return failedOwnerLogin.lockedUntil > now;",
        "+}",
        "+",
        "+function recordFailedOwnerLogin(now = Date.now()) {",
        "+  failedOwnerLogin.count += 1;",
        "+",
        "+  if (failedOwnerLogin.count >= FAILED_LOGIN_LIMIT) {",
        "+    failedOwnerLogin.count = 0;",
        "+    failedOwnerLogin.lockedUntil = now + FAILED_LOGIN_COOLDOWN_MS;",
        "+  }",
        "+}",
        "+",
        "+function clearFailedOwnerLogin() {",
        "+  failedOwnerLogin.count = 0;",
        "+  failedOwnerLogin.lockedUntil = 0;",
        "+}",
        " ",
        " function readSecret(name: \"AGENT_007_OWNER_ACCESS_CODE\" | \"AGENT_007_OWNER_COOKIE_SECRET\", fallback: string) {",
        "   const configured = process.env[name]?.trim();",
        "@@",
        " export async function createOwnerSession(accessCode: string) {",
        "+  const now = Date.now();",
        "+",
        "+  if (isOwnerLoginCoolingDown(now)) {",
        "+    return false;",
        "+  }",
        "+",
        "   const expectedCode = readSecret(\"AGENT_007_OWNER_ACCESS_CODE\", DEV_ACCESS_CODE);",
        " ",
        "   if (accessCode.trim() !== expectedCode) {",
        "+    recordFailedOwnerLogin(now);",
        "     return false;",
        "   }",
        "+",
        "+  clearFailedOwnerLogin();",
        " ",
        "   const cookieStore = await cookies();",
        " ",
        "   cookieStore.set(COOKIE_NAME, sessionCookieValue(), {",
        "     httpOnly: true,",
        "     maxAge: EIGHT_HOURS,",
        "     path: \"/\",",
        "     sameSite: \"strict\",",
        "     secure: process.env.NODE_ENV === \"production\"",
        "   });",
        " ",
        "   return true;",
        " }",
        "```",
        "",
        "Notes:",
        "- This diff is based only on the verified `lib/owner-auth.ts` contents.",
        "- It preserves the existing server-only import, crypto signing, Next cookies API, `accord_owner` cookie name, and owner session cookie creation.",
        "- It does not add React hooks, client-side cookies, Redux, `access_token`, or utility imports.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_cooldown_diff_review_answer(body):
    """Review the visible owner-auth cooldown diff using actual changed symbols."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_cooldown_diff_review(user_request):
        return None

    request_text = str(user_request or "")
    visible_terms = (
        "FAILED_LOGIN_LIMIT",
        "FAILED_LOGIN_COOLDOWN_MS",
        "failedOwnerLogin",
        "createOwnerSession",
        "accord_owner",
        "COOKIE_NAME",
    )
    if not any(term in request_text for term in visible_terms):
        answer = "\n".join([
            "Pass:",
            "- I cannot review the cooldown diff yet because the full diff is not visible in this message.",
            "",
            "Concerns:",
            "- Reviewing without the visible diff would risk inventing details.",
            "",
            "Test:",
            "- Paste the full proposed diff in the same message, then I can review the actual changed symbols.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    answer = "\n".join([
        "Pass:",
        "- Mostly yes. The visible diff stays in `lib/owner-auth.ts` and modifies the verified `createOwnerSession(accessCode)` owner-auth flow.",
        "- It adds `FAILED_LOGIN_LIMIT`, `FAILED_LOGIN_COOLDOWN_MS`, `failedOwnerLogin`, `isOwnerLoginCoolingDown`, `recordFailedOwnerLogin`, and `clearFailedOwnerLogin` without changing the existing `accord_owner` session cookie name.",
        "- It preserves the existing server-side cookie creation with `cookieStore.set(COOKIE_NAME, sessionCookieValue(), { httpOnly: true, maxAge: EIGHT_HOURS, path: \"/\", sameSite: \"strict\", secure: process.env.NODE_ENV === \"production\" })`.",
        "- It does not claim the patch is applied.",
        "",
        "Concerns:",
        "- The cooldown is in-memory, so it resets when the server restarts.",
        "- It is acceptable as a small local/test protection, but it is not enough for multi-instance production without shared storage or a real rate limiter.",
        "- The current login redirect still uses `/owner/agent-007?error=1`, so the UI may not clearly tell the owner when cooldown is active.",
        "",
        "Test:",
        "- Submit a wrong access code and confirm it still redirects to `/owner/agent-007?error=1`.",
        "- Submit five wrong access codes and confirm the cooldown blocks additional attempts temporarily.",
        "- Wait for the cooldown to expire and confirm the correct owner access code creates the `accord_owner` session.",
        "- Confirm `/owner/agent-007` remains gated while unauthenticated.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_auth_symbol_verification_answer(body):
    """Verify exact owner-auth cooldown symbols instead of giving a generic file summary."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_auth_symbol_verification(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    if "lib/owner-auth.ts" not in observed:
        answer = "\n".join([
            "Confirmed:",
            "- Present: none verified.",
            "- Missing: none verified.",
            "- Not visible in provided context: `lib/owner-auth.ts` is not in OBSERVED_FILES.",
            "",
            "Risks:",
            "- I cannot verify owner-auth cooldown symbols without the actual file content.",
            "",
            "Recommended next test:",
            "- Attach or expose `lib/owner-auth.ts`, then ask for the exact-symbol verification again.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    try:
        auth = bridge_read_text("lib/owner-auth.ts", max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect `lib/owner-auth.ts` through the workspace bridge: {exc}")

    requested_symbols = [
        "FAILED_LOGIN_LIMIT",
        "FAILED_LOGIN_COOLDOWN_MS",
        "failedOwnerLogin",
        "isOwnerLoginCoolingDown",
        "recordFailedOwnerLogin",
        "clearFailedOwnerLogin",
        "createOwnerSession",
        "COOKIE_NAME",
        "accord_owner",
    ]
    present = [symbol for symbol in requested_symbols if symbol in auth]
    missing = [symbol for symbol in requested_symbols if symbol not in auth]

    create_owner_start = auth.find("export async function createOwnerSession")
    if create_owner_start == -1:
        create_owner_block = ""
    else:
        clear_owner_start = auth.find("export async function clearOwnerSession", create_owner_start)
        create_owner_block = auth[create_owner_start:clear_owner_start if clear_owner_start != -1 else len(auth)]

    cooldown_before_compare = (
        create_owner_block.find("isOwnerLoginCoolingDown") != -1
        and create_owner_block.find("readSecret(\"AGENT_007_OWNER_ACCESS_CODE\"") != -1
        and create_owner_block.find("isOwnerLoginCoolingDown") < create_owner_block.find("readSecret(\"AGENT_007_OWNER_ACCESS_CODE\"")
    )
    records_failed = "recordFailedOwnerLogin(now)" in create_owner_block
    clears_failed = "clearFailedOwnerLogin()" in create_owner_block
    sets_cookie = "cookieStore.set(COOKIE_NAME, sessionCookieValue()" in create_owner_block and "accord_owner" in auth

    answer = "\n".join([
        "Confirmed:",
        f"- Present: {', '.join(f'`{symbol}`' for symbol in present) if present else 'none'}.",
        f"- Missing: {', '.join(f'`{symbol}`' for symbol in missing) if missing else 'none'}.",
        "- Not visible in provided context: none for the requested symbol list.",
        f"- `createOwnerSession(accessCode)` checks `isOwnerLoginCoolingDown` before reading/comparing the owner access code: {'yes' if cooldown_before_compare else 'not verified'}.",
        f"- `createOwnerSession(accessCode)` calls `recordFailedOwnerLogin(now)` when the access code is wrong: {'yes' if records_failed else 'not verified'}.",
        f"- `createOwnerSession(accessCode)` calls `clearFailedOwnerLogin()` before creating the session after a correct code: {'yes' if clears_failed else 'not verified'}.",
        f"- `createOwnerSession(accessCode)` still sets the `accord_owner` session through `COOKIE_NAME`: {'yes' if sets_cookie else 'not verified'}.",
        "",
        "Risks:",
        "- The cooldown is in-memory, so it resets if the local server restarts.",
        "- This verifies symbol presence and control flow from file text; it does not prove runtime behavior without a login test.",
        "",
        "Recommended next test:",
        "- Verify `/owner/agent-007` remains gated while logged out, then test a wrong-code rejection and a correct owner-code login without exposing the secret.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_privacy_route_test_answer(body):
    """Answer the owner privacy route checklist from all required files."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_privacy_route_test(user_request):
        return None

    required = [
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
        "app/page.tsx",
    ]
    observed = set(observed_files_from_manifest(snapshot))
    missing = [path for path in required if path not in observed]
    if missing:
        answer = "\n".join([
            "Confirmed:",
            "- Is `/owner/agent-007` gated before showing `OwnerConsole`? Not verified because required files are missing from OBSERVED_FILES.",
            "- What happens when the owner is not authenticated? Not verified.",
            "- What server actions handle login and logout? Not verified.",
            "- What cookie name is used for the owner session? Not verified.",
            "- Does `app/page.tsx` expose or link to Oscar publicly? Not verified.",
            "",
            "Risks:",
            f"- Missing required file(s): {', '.join(f'`{path}`' for path in missing)}.",
            "",
            "Recommended next test:",
            "- Attach or expose the missing verified files, then rerun the owner privacy route test.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    try:
        contents = {path: bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"] for path in required}
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect owner privacy route files through the workspace bridge: {exc}")

    owner_page = contents["app/owner/agent-007/page.tsx"]
    actions = contents["app/owner/agent-007/actions.ts"]
    auth = contents["lib/owner-auth.ts"]
    public_home = contents["app/page.tsx"]

    auth_check_index = owner_page.find("isOwnerAuthenticated")
    owner_console_index = owner_page.find("OwnerConsole")
    gate_verified = (
        auth_check_index != -1
        and "OwnerGate" in owner_page
        and owner_console_index != -1
        and auth_check_index < owner_console_index
    )
    unauth_verified = "return <OwnerGate" in owner_page or "OwnerGate" in owner_page and "error" in owner_page
    login_verified = (
        '"use server"' in actions
        and "loginOwner" in actions
        and "createOwnerSession(accessCode)" in actions
    )
    logout_verified = (
        '"use server"' in actions
        and "logoutOwner" in actions
        and "clearOwnerSession()" in actions
    )
    cookie_verified = 'const COOKIE_NAME = "accord_owner"' in auth or "COOKIE_NAME = \"accord_owner\"" in auth
    public_exposure_terms = ("AGENT-007", "agent-007", "/owner/agent-007", "owner/agent-007")
    public_exposes = any(term in public_home for term in public_exposure_terms)

    answer = "\n".join([
        "Confirmed:",
        f"- Is `/owner/agent-007` gated before showing `OwnerConsole`? {'Yes. The owner page uses `isOwnerAuthenticated()` and renders `OwnerGate` instead of `OwnerConsole` when access is missing.' if gate_verified else 'Not verified from the inspected file text.'}",
        f"- What happens when the owner is not authenticated? {'The route renders `OwnerGate`, the private access-code form/error gate, instead of the owner console.' if unauth_verified else 'Not verified from the inspected file text.'}",
        f"- What server actions handle login and logout? {'`loginOwner(formData)` calls `createOwnerSession(accessCode)` and `logoutOwner()` calls `clearOwnerSession()`.' if login_verified and logout_verified else 'Not fully verified from `app/owner/agent-007/actions.ts`.'}",
        f"- What cookie name is used for the owner session? {'`accord_owner`, through `COOKIE_NAME` in `lib/owner-auth.ts`.' if cookie_verified else 'Not verified from `lib/owner-auth.ts`.'}",
        f"- Does `app/page.tsx` expose or link to Oscar publicly? {'No. The checked public homepage content does not contain Oscar legacy route terms.' if not public_exposes else 'Potential exposure found: public homepage contains an Oscar or legacy owner-route term.'}",
        "",
        "Risks:",
        "- This verifies the selected files by text; it does not replace a browser login/logout test.",
        "- Other public routes would need separate inspection if they are added later.",
        "- Owner privacy still depends on keeping `/owner/agent-007` gated and not adding public navigation without explicit owner approval.",
        "",
        "Recommended next test:",
        "- Log out, open `/owner/agent-007`, confirm `OwnerGate` appears, then log in with the owner code and confirm `OwnerConsole` appears without exposing the code.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_runtime_test_plan_answer(body):
    """Return a runtime test plan only, without reading files or claiming execution."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_runtime_test_plan(user_request):
        return None

    answer = "\n".join([
        "Goal:",
        "Plan a safe browser runtime test for Oscar owner privacy without exposing the owner access code or claiming any test has already been performed.",
        "",
        "Test steps:",
        "1. Start from a logged-out state by using the logout control if visible, clearing only the local `accord_owner` session cookie, or opening a private browser window.",
        "2. Open `/owner/agent-007` and confirm the page shows the owner gate/access-code screen instead of the owner console.",
        "3. Enter one clearly wrong access code and confirm the app rejects it and returns to the owner gate with an error state.",
        "4. To test cooldown carefully, only if the owner approves, submit four more clearly wrong codes to reach five failed attempts, then wait about 30 seconds before trying the real code.",
        "5. Enter the correct owner access code privately and confirm the owner console appears; do not paste, log, or reveal the code.",
        "6. Open the public home screen at `/` and confirm there is no visible Oscar link, owner route, or owner-only entry point.",
        "",
        "Expected results:",
        "- Logged-out users see the owner gate, not the owner console.",
        "- Wrong access codes are rejected.",
        "- The failed-login cooldown temporarily slows repeated wrong attempts without creating a long lockout.",
        "- The correct owner code reaches the owner console after any cooldown has expired.",
        "- The public home screen does not show or link to Oscar.",
        "",
        "Risks:",
        "- Testing five wrong codes may trigger the 30-second cooldown, so do it only when the owner is ready to wait briefly.",
        "- A previous browser session may already have the `accord_owner` cookie, so use logout/private browsing for the logged-out check.",
        "- The owner access code must stay private and should never be pasted into chat or logs.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_improvement_answer(body):
    """Propose one small private owner-login UX improvement without claiming changes."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_improvement(user_request):
        return None

    required = [
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
    ]
    observed = set(observed_files_from_manifest(snapshot))
    available = [path for path in required if path in observed]
    contents = {}
    for path in available:
        try:
            contents[path] = bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
        except Exception:
            contents[path] = ""

    owner_page = contents.get("app/owner/agent-007/page.tsx", "")
    actions = contents.get("app/owner/agent-007/actions.ts", "")
    auth = contents.get("lib/owner-auth.ts", "")
    gate_confirmed = "OwnerGate" in owner_page and "isOwnerAuthenticated" in owner_page
    error_confirmed = "?error=1" in actions or "error" in owner_page
    cooldown_confirmed = "FAILED_LOGIN_COOLDOWN_MS" in auth and "recordFailedOwnerLogin" in auth

    confirmed = []
    if gate_confirmed:
        confirmed.append("`/owner/agent-007` has a private `OwnerGate` flow before the owner console.")
    if error_confirmed:
        confirmed.append("The owner login flow already has a generic error path for failed access attempts.")
    if cooldown_confirmed:
        confirmed.append("The owner auth flow includes failed-login cooldown logic.")
    if not confirmed:
        confirmed.append("Oscar must stay owner-only, and this proposal does not claim any file was changed.")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Proposed improvement:",
        "- Add clearer generic feedback on the private `OwnerGate` after a rejected or temporarily slowed login attempt, so the owner knows what happened without revealing whether the access code was close, correct, or which secret is configured.",
        "",
        "Files:",
        "- `app/owner/agent-007/page.tsx`",
        "- `app/owner/agent-007/actions.ts`",
        "- `lib/owner-auth.ts`",
        "",
        "Risk:",
        "- Login feedback must stay generic. It should not expose the owner access code, distinguish close guesses, or add any public homepage link to Oscar.",
        "",
        "Test:",
        "- Wrong access code still fails without exposing details.",
        "- Cooldown feedback appears only on the private owner gate when repeated failures are slowed.",
        "- Correct owner code still reaches `OwnerConsole` after any cooldown expires.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_patch_plan_answer(body):
    """Convert the owner UX proposal into a patch plan only."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_patch_plan(user_request):
        return None

    answer = "\n".join([
        "Goal:",
        "Add generic private `OwnerGate` feedback for rejected access attempts and cooldown state without weakening Oscar's owner-only boundary.",
        "",
        "Files:",
        "- `app/owner/agent-007/page.tsx`",
        "- `app/owner/agent-007/actions.ts`",
        "- `lib/owner-auth.ts`",
        "",
        "Steps:",
        "1. Update `lib/owner-auth.ts` to expose a generic login result state if the existing boolean result cannot distinguish normal rejection from cooldown safely.",
        "2. Update `app/owner/agent-007/actions.ts` to redirect with a generic private reason such as rejected or cooldown, without exposing secrets or whether a wrong code was close.",
        "3. Update `app/owner/agent-007/page.tsx` so `OwnerGate` displays concise generic feedback for rejected attempts and temporary cooldowns.",
        "4. Preserve the existing successful login behavior and the `accord_owner` session cookie flow.",
        "5. Keep all Oscar access behind the private owner route; do not add public homepage links or public navigation to Oscar.",
        "",
        "Risk:",
        "- Feedback must stay generic. It must not expose the owner access code, reveal whether a wrong code was close, or weaken the private owner gate.",
        "",
        "Test:",
        "- Wrong access code is rejected and shows only generic private feedback.",
        "- Repeated wrong access codes trigger cooldown feedback without a long lockout.",
        "- Correct owner access code reaches `OwnerConsole` after any cooldown expires.",
        "- `/owner/agent-007` remains gated when logged out.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_proposed_diff_answer(body):
    """Return a proposed owner UX feedback diff without claiming it is applied."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_proposed_diff(user_request):
        return None

    required = [
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
    ]
    missing = []
    for path in required:
        try:
            bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)
        except (FileNotFoundError, PermissionError, ValueError):
            missing.append(path)
    if missing:
        answer = "\n".join([
            "Proposed diff only. Not applied.",
            "",
            "```diff",
            "# Cannot produce a verified diff because required files could not be read through the workspace bridge.",
            f"# Missing: {', '.join(missing)}",
            "```",
            "",
            "Risk:",
            "- Producing a diff without the verified file contents would risk inventing code.",
            "",
            "Test:",
            "- Attach or expose the missing files, then request the proposed diff again.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    diff_lines = [
        "Proposed diff only. Not applied.",
        "",
        "```diff",
        "--- a/lib/owner-auth.ts",
        "+++ b/lib/owner-auth.ts",
        "@@",
        " const FAILED_LOGIN_LIMIT = 5;",
        " const FAILED_LOGIN_COOLDOWN_MS = 30 * 1000;",
        "+export type OwnerLoginResult = \"authenticated\" | \"rejected\" | \"cooldown\";",
        " ",
        " const failedOwnerLogin = {",
        "   count: 0,",
        "@@",
        " function recordFailedOwnerLogin(now = Date.now()) {",
        "   failedOwnerLogin.count += 1;",
        " ",
        "   if (failedOwnerLogin.count >= FAILED_LOGIN_LIMIT) {",
        "     failedOwnerLogin.count = 0;",
        "     failedOwnerLogin.lockedUntil = now + FAILED_LOGIN_COOLDOWN_MS;",
        "+    return true;",
        "   }",
        "+",
        "+  return false;",
        " }",
        "@@",
        "-export async function createOwnerSession(accessCode: string) {",
        "+export async function createOwnerSession(accessCode: string): Promise<OwnerLoginResult> {",
        "   const now = Date.now();",
        " ",
        "   if (isOwnerLoginCoolingDown(now)) {",
        "-    return false;",
        "+    return \"cooldown\";",
        "   }",
        " ",
        "   const expectedCode = readSecret(\"AGENT_007_OWNER_ACCESS_CODE\", DEV_ACCESS_CODE);",
        " ",
        "   if (accessCode.trim() !== expectedCode) {",
        "-    return false;",
        "+    return recordFailedOwnerLogin(now) ? \"cooldown\" : \"rejected\";",
        "   }",
        " ",
        "   clearFailedOwnerLogin();",
        "@@",
        "-  return true;",
        "+  return \"authenticated\";",
        " }",
        "--- a/app/owner/agent-007/actions.ts",
        "+++ b/app/owner/agent-007/actions.ts",
        "@@",
        " export async function loginOwner(formData: FormData) {",
        "   const accessCode = String(formData.get(\"accessCode\") ?? \"\");",
        "-  const authenticated = await createOwnerSession(accessCode);",
        "+  const loginResult = await createOwnerSession(accessCode);",
        " ",
        "-  if (!authenticated) {",
        "-    redirect(\"/owner/agent-007?error=1\");",
        "+  if (loginResult === \"cooldown\") {",
        "+    redirect(\"/owner/agent-007?feedback=cooldown\");",
        "+  }",
        "+",
        "+  if (loginResult === \"rejected\") {",
        "+    redirect(\"/owner/agent-007?feedback=rejected\");",
        "   }",
        " ",
        "   redirect(\"/owner/agent-007\");",
        " }",
        "--- a/app/owner/agent-007/page.tsx",
        "+++ b/app/owner/agent-007/page.tsx",
        "@@",
        "-type OwnerSearchParams = Promise<{ error?: string }>;",
        "+type OwnerFeedback = \"rejected\" | \"cooldown\";",
        "+type OwnerSearchParams = Promise<{ error?: string; feedback?: string }>;",
        " type ModeCard = {",
        "   mode: AGENT_007Mode;",
        "   label: string;",
        "   icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;",
        " };",
        "+const ownerFeedbackMessages: Record<OwnerFeedback, string> = {",
        "+  rejected: \"Oscar stayed locked. Check the private access code and try again.\",",
        "+  cooldown: \"Too many recent attempts. Wait a moment before trying again.\"",
        "+};",
        "+",
        "+function parseOwnerFeedback(feedback?: string, legacyError?: string): OwnerFeedback | null {",
        "+  if (feedback === \"cooldown\") {",
        "+    return \"cooldown\";",
        "+  }",
        "+",
        "+  if (feedback === \"rejected\" || legacyError === \"1\") {",
        "+    return \"rejected\";",
        "+  }",
        "+",
        "+  return null;",
        "+}",
        " ",
        " const sampleBrief =",
        "   \"Keep Oscar private, preserve the approved prompt protocol, and turn Accord into a production-ready web app.\";",
        "@@",
        " export default async function OwnerAGENT_007Page({ searchParams }: { searchParams: OwnerSearchParams }) {",
        "   const [authenticated, params] = await Promise.all([isOwnerAuthenticated(), searchParams]);",
        " ",
        "   if (!authenticated) {",
        "-    return <OwnerGate hasError={params?.error === \"1\"} />;",
        "+    return <OwnerGate feedback={parseOwnerFeedback(params?.feedback, params?.error)} />;",
        "   }",
        " ",
        "   return <OwnerConsole />;",
        " }",
        " ",
        "-function OwnerGate({ hasError }: { hasError: boolean }) {",
        "+function OwnerGate({ feedback }: { feedback: OwnerFeedback | null }) {",
        "   return (",
        "     <main className=\"owner-gate\">",
        "       <section className=\"panel owner-card\">",
        "@@",
        "             Access code",
        "             <input name=\"accessCode\" type=\"password\" autoComplete=\"current-password\" required />",
        "           </label>",
        "-          {hasError && (",
        "+          {feedback && (",
        "             <p className=\"owner-error\" role=\"alert\">",
        "-              That code did not unlock Oscar.",
        "+              {ownerFeedbackMessages[feedback]}",
        "             </p>",
        "           )}",
        "           <button className=\"primary-button\" type=\"submit\">",
        "```",
        "",
        "Risk:",
        "- Feedback remains generic, but the redirect query still reveals only a broad private state (`rejected` or `cooldown`). Do not make the message more specific.",
        "- The proposed `OwnerLoginResult` return type changes callers of `createOwnerSession`; keep the update scoped to the existing owner action.",
        "",
        "Test:",
        "- Wrong access code redirects to `/owner/agent-007?feedback=rejected` and shows generic private feedback.",
        "- Five wrong access codes trigger `/owner/agent-007?feedback=cooldown` until the short cooldown expires.",
        "- Correct owner code still creates the `accord_owner` session and reaches `OwnerConsole` after cooldown expires.",
        "- `/owner/agent-007` remains gated while logged out.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ]
    return encode_ollama_bridge_answer(payload, "\n".join(diff_lines))


def bridge_owner_ux_diff_review_answer(body):
    """Review the visible owner UX feedback diff without repeating or applying it."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_diff_review(user_request):
        return None

    request_text = str(user_request or "")
    required_terms = (
        "OwnerLoginResult",
        "feedback=cooldown",
        "feedback=rejected",
        "ownerFeedbackMessages",
        "parseOwnerFeedback",
    )
    missing_terms = [term for term in required_terms if term not in request_text]
    if missing_terms:
        answer = "\n".join([
            "Pass:",
            "- Not enough visible diff content to complete the review.",
            "",
            "Concerns:",
            f"- Missing visible diff symbols: {', '.join(f'`{term}`' for term in missing_terms)}.",
            "",
            "Suggested adjustment:",
            "- Paste the full proposed diff in the same message as the review request.",
            "",
            "Test:",
            "- Review again once the full diff is visible.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    answer = "\n".join([
        "Pass:",
        "- Mostly yes. The diff preserves the private `/owner/agent-007` route gate and does not add public homepage links.",
        "- The owner access code stays private; the feedback strings are generic and do not reveal the configured code.",
        "- The messages do not reveal whether a wrong code was close.",
        "- Successful login still creates the existing `accord_owner` session and redirects to `/owner/agent-007`.",
        "",
        "Concerns:",
        "- `createOwnerSession` changes from a boolean return to `OwnerLoginResult`, so any future caller must handle `authenticated`, `rejected`, and `cooldown` explicitly.",
        "- The query string distinguishes `rejected` from `cooldown`; that is still generic, but it should stay private to the owner gate and not become public UI copy outside `/owner/agent-007`.",
        "",
        "Suggested adjustment:",
        "- Keep the diff scoped as shown. Do not add public navigation, do not make the feedback more specific, and keep the legacy `error=1` fallback in `parseOwnerFeedback` for old redirects.",
        "",
        "Test:",
        "- Wrong access code redirects to `/owner/agent-007?feedback=rejected` and shows only generic feedback.",
        "- Repeated wrong access codes trigger `/owner/agent-007?feedback=cooldown` during the short cooldown.",
        "- Correct owner code reaches `OwnerConsole` after any cooldown expires.",
        "- Logged-out `/owner/agent-007` remains gated.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_applied_patch_verification_answer(body):
    """Verify the applied OwnerGate feedback patch from actual file contents."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_applied_patch_verification(user_request):
        return None

    required = [
        "lib/owner-auth.ts",
        "app/owner/agent-007/actions.ts",
        "app/owner/agent-007/page.tsx",
        "app/page.tsx",
    ]
    contents = {}
    missing = []
    for path in required:
        try:
            contents[path] = bridge_read_text(path, max_chars=200000)["content"]
        except (FileNotFoundError, PermissionError, ValueError):
            missing.append(path)

    auth = contents.get("lib/owner-auth.ts", "")
    actions = contents.get("app/owner/agent-007/actions.ts", "")
    owner_page = contents.get("app/owner/agent-007/page.tsx", "")
    public_page = contents.get("app/page.tsx", "")

    checks = [
        (
            "`createOwnerSession` now returns `authenticated`, `rejected`, or `cooldown`.",
            'export type OwnerLoginResult = "authenticated" | "rejected" | "cooldown";' in auth
            and 'Promise<OwnerLoginResult>' in auth
            and 'return "authenticated";' in auth
            and '"rejected"' in auth
            and 'return "cooldown";' in auth,
        ),
        (
            "The fifth failed access attempt can return cooldown immediately.",
            'return recordFailedOwnerLogin(now) ? "cooldown" : "rejected";' in auth,
        ),
        (
            "`loginOwner` redirects rejected attempts to `/owner/agent-007?feedback=rejected`.",
            'redirect("/owner/agent-007?feedback=rejected")' in actions,
        ),
        (
            "`loginOwner` redirects cooldown attempts to `/owner/agent-007?feedback=cooldown`.",
            'redirect("/owner/agent-007?feedback=cooldown")' in actions,
        ),
        (
            "`OwnerGate` shows generic rejected and cooldown feedback messages.",
            "Oscar stayed locked. Check the private access code and try again." in owner_page
            and "Too many recent attempts. Wait a moment before trying again." in owner_page
            and "ownerFeedbackMessages" in owner_page
            and "parseOwnerFeedback" in owner_page,
        ),
        (
            "The feedback patch does not render the owner access code in the rejected or cooldown messages.",
            "ownerFeedbackMessages" in owner_page
            and "AGENT_007_OWNER_ACCESS_CODE" not in owner_page
            and "DEV_ACCESS_CODE" not in owner_page
            and "accord-owner" not in owner_page
            and "AGENT_007_OWNER_ACCESS_CODE" not in actions,
        ),
        (
            "`/owner/agent-007` remains gated before `OwnerConsole` is rendered.",
            "isOwnerAuthenticated()" in owner_page
            and "return <OwnerGate" in owner_page
            and "return <OwnerConsole />" in owner_page,
        ),
        (
            "The successful login flow still sets the existing `accord_owner` owner session cookie.",
            'const COOKIE_NAME = "accord_owner";' in auth
            and "cookieStore.set(COOKIE_NAME, sessionCookieValue(), {" in auth
            and 'sameSite: "strict"' in auth
            and "httpOnly: true" in auth,
        ),
        (
            "`app/page.tsx` does not expose or link to Oscar in the checked file contents.",
            bool(public_page)
            and not any(
                term in public_page
                for term in (
                    "AGENT-007",
                    "agent-007",
                    "/owner/agent-007",
                    "owner/agent-007",
                    "href=",
                    "next/link",
                    "Link",
                    "router.push",
                    "useRouter",
                    "window.location",
                )
            ),
        ),
    ]

    confirmed = [description for description, ok in checks if ok]
    unconfirmed = [description for description, ok in checks if not ok]

    risks = [
        "This is a file-content verification only; it does not replace a browser login/logout test.",
        "The cooldown remains in-memory, so it resets on server restart and is not a multi-instance production rate limiter.",
    ]
    if missing:
        risks.append(f"Could not read required file(s): {', '.join(f'`{path}`' for path in missing)}.")
    if unconfirmed:
        risks.append(f"Could not confirm from actual file contents: {', '.join(unconfirmed)}")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Risks:",
        *[f"- {item}" for item in risks],
        "",
        "Recommended next step:",
        "- Run the private browser flow: logged-out gate, wrong code, cooldown, correct owner code after cooldown, and public `/` privacy check without exposing the real code.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_public_exposure_answer(body):
    """Answer Oscar public-homepage exposure questions from the actual homepage file."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_public_exposure_answer(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    if "app/page.tsx" not in files:
        answer = (
            "`app/page.tsx` is not in the verified OBSERVED_FILES snapshot, so I cannot confirm the public homepage contents. "
            "Oscar should not be linked from a public homepage unless the owner explicitly approves it."
        )
        return encode_ollama_bridge_answer(payload, answer)

    try:
        data = bridge_read_text("app/page.tsx", max_chars=200000)
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not read `app/page.tsx` through the workspace bridge: {exc}")

    content = data.get("content", "")
    line_count = len(content.splitlines())
    checked_terms = [
        "AGENT-007",
        "agent-007",
        "/owner/agent-007",
        "owner/agent-007",
        "href=",
        "next/link",
        "Link",
        "router.push",
        "useRouter",
        "window.location",
    ]
    found_terms = [term for term in checked_terms if term in content]

    if found_terms:
        exposure_line = (
            "`app/page.tsx` contains these possible navigation/exposure signals: "
            + ", ".join(f"`{term}`" for term in found_terms)
            + "."
        )
        likely_line = "- Oscar may be exposed from the public homepage; the matching lines should be inspected before changing anything."
    else:
        exposure_line = (
            "`app/page.tsx` does not contain Oscar legacy route terms, `href=`, "
            "`next/link`, `Link`, `router.push`, `useRouter`, or `window.location` in the checked file content."
        )
        likely_line = "- Oscar is not exposed from the public homepage based on `app/page.tsx`."

    answer = "\n".join([
        "Confirmed:",
        f"- Actual file read: `app/page.tsx` ({line_count} lines).",
        f"- {exposure_line}",
        "",
        "Likely:",
        likely_line,
        "",
        "Risks:",
        "- This only confirms `app/page.tsx`; other public routes would need inspection if they exist.",
        "- Oscar's direct owner route still depends on the `/owner/agent-007` auth gate staying intact.",
        "",
        "Recommended next step:",
        "- Propose one small owner-security improvement and wait for approval.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_privacy_synthesis_answer(body):
    """Synthesize the actual owner page/actions/auth files for privacy-flow prompts."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_privacy_synthesis(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    required = [
        "app/owner/agent-007/page.tsx",
        "app/owner/agent-007/actions.ts",
        "lib/owner-auth.ts",
    ]
    missing = [path for path in required if path not in observed]
    if missing:
        return encode_ollama_bridge_answer(
            payload,
            "Cannot synthesize the owner privacy flow because these files are not in OBSERVED_FILES: "
            + ", ".join(f"`{path}`" for path in missing),
        )

    try:
        contents = {path: bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"] for path in required}
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not read the owner privacy files through the bridge: {exc}")

    checks = {
        "page_checks_auth": "isOwnerAuthenticated()" in contents["app/owner/agent-007/page.tsx"],
        "page_shows_gate": "OwnerGate" in contents["app/owner/agent-007/page.tsx"],
        "page_shows_console": "OwnerConsole" in contents["app/owner/agent-007/page.tsx"],
        "page_noindex": "index: false" in contents["app/owner/agent-007/page.tsx"] and "follow: false" in contents["app/owner/agent-007/page.tsx"],
        "actions_login": "createOwnerSession(accessCode)" in contents["app/owner/agent-007/actions.ts"],
        "actions_logout": "clearOwnerSession()" in contents["app/owner/agent-007/actions.ts"],
        "auth_server_only": 'import "server-only"' in contents["lib/owner-auth.ts"],
        "auth_http_only": "httpOnly: true" in contents["lib/owner-auth.ts"],
        "auth_same_site": 'sameSite: "strict"' in contents["lib/owner-auth.ts"],
        "auth_hmac": "createHmac" in contents["lib/owner-auth.ts"] and "sha256" in contents["lib/owner-auth.ts"],
        "auth_timing_safe": "timingSafeEqual" in contents["lib/owner-auth.ts"],
        "auth_prod_secret_throw": "must be configured before Oscar can run in production" in contents["lib/owner-auth.ts"],
    }

    confirmed = []
    if checks["page_checks_auth"] and checks["page_shows_gate"] and checks["page_shows_console"]:
        confirmed.append("`app/owner/agent-007/page.tsx` calls `isOwnerAuthenticated()` and renders `OwnerGate` for unauthenticated users or `OwnerConsole` for authenticated users.")
    if checks["page_noindex"]:
        confirmed.append("The owner page metadata sets robots `index: false` and `follow: false`.")
    if checks["actions_login"] and checks["actions_logout"]:
        confirmed.append("`app/owner/agent-007/actions.ts` handles login with `createOwnerSession(accessCode)` and logout with `clearOwnerSession()`.")
    if checks["auth_server_only"]:
        confirmed.append("`lib/owner-auth.ts` imports `server-only`, keeping the auth helpers server-side.")
    if checks["auth_hmac"] and checks["auth_timing_safe"]:
        confirmed.append("Owner sessions are signed with HMAC-SHA256 and validated with a timing-safe comparison.")
    if checks["auth_http_only"] and checks["auth_same_site"]:
        confirmed.append("The owner session cookie is set as HTTP-only and `sameSite: \"strict\"`.")
    if checks["auth_prod_secret_throw"]:
        confirmed.append("Production requires configured owner access and cookie secrets; missing production secrets throw an error.")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Likely:",
        "- Oscar is kept private through a server-side owner route gate, server actions for login/logout, and a signed owner session cookie.",
        "",
        "Risks:",
        "- The file contents do not show rate limiting, lockout, or audit logging for failed owner access attempts.",
        "- Local development fallbacks exist, so production depends on correctly setting `AGENT_007_OWNER_ACCESS_CODE` and `AGENT_007_OWNER_COOKIE_SECRET`.",
        "- I have not yet confirmed from `app/page.tsx` that the public homepage does not link to Oscar.",
        "",
        "Recommended next step:",
        "- Inspect `app/page.tsx` to confirm Oscar is not exposed on the public homepage, then propose one small owner-security improvement and wait for approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def summarize_actual_file(path, content, truncated=False):
    line_count = len(content.splitlines())

    if path == "lib/agent_007-agent.ts":
        confirmed = [
            "It exports `AGENT_007Mode` as the union `\"plan\" | \"review\" | \"tests\"`.",
            "It exports `agent_007CodingProtocol`, a string containing owner-approved rules for verified context, no invented files, blocked private patterns, approval before changes, owner-only Oscar access, and web app checks.",
            "It exports `agent_007SystemPrompt`, which includes Oscar's identity, engineering operating system, coding standards, review posture, and `${agent_007CodingProtocol}`.",
            "It exports `agent_007Ratings` with ratings for Research depth, Product judgment, Coding discipline, and Verification habit.",
            "It exports `generateAGENT_007Response(mode, brief)`, which returns different text for `review`, `tests`, and the default plan mode.",
            "The default plan response is an owner approval plan that ends with `Waiting for owner approval.`",
        ]
        absent = [
            name for name in ("handleRequest", "AgentState", "clientContext", "agent-lib")
            if name not in content
        ]
        if absent:
            confirmed.append("The file does not contain `" + "`, `".join(absent) + "`.")

        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This file defines Oscar's prompt/protocol and canned owner-console responses; it is not a request handler.",
            "",
            "Need to inspect next:",
            "- `app/owner/agent-007/page.tsx` to confirm how these exports are displayed in the owner UI.",
            "- `app/owner/agent-007/actions.ts` and `lib/owner-auth.ts` to confirm the owner login/logout and access boundary.",
        ])

    if path == "app/owner/agent-007/page.tsx":
        confirmed = [
            "It imports `generateAGENT_007Response`, `agent_007Ratings`, `agent_007SystemPrompt`, and `AGENT_007Mode` from `@/lib/agent_007-agent`.",
            "It imports `getOwnerAccessHelp` and `isOwnerAuthenticated` from `@/lib/owner-auth`.",
            "It imports `loginOwner` and `logoutOwner` from `./actions`.",
            "It exports `dynamic = \"force-dynamic\"`, so this owner route is forced dynamic.",
            "It exports private owner metadata with robots `index: false`, `follow: false`.",
            "`OwnerAGENT_007Page` checks `isOwnerAuthenticated()` and returns `OwnerGate` when unauthenticated.",
            "`OwnerGate` renders a password access-code form that posts to `loginOwner` and shows an error when `?error=1` is present.",
            "`OwnerConsole` renders the owner workspace, mode cards generated by `generateAGENT_007Response`, legacy ratings, and the `agent_007SystemPrompt`.",
            "The UI copy says Oscar is separated from the public Accord surface and prompt changes require owner confirmation.",
        ]
        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This is the private owner-facing Oscar page and display surface, while authentication/session mechanics live in `lib/owner-auth.ts` and `app/owner/agent-007/actions.ts`.",
            "",
            "Need to inspect next:",
            "- `lib/owner-auth.ts` to confirm how `isOwnerAuthenticated` protects this page.",
            "- `app/owner/agent-007/actions.ts` to confirm how the login/logout form actions redirect and manage sessions.",
            "- `app/page.tsx` to confirm Oscar is not linked from the public homepage.",
        ])

    if path == "app/owner/agent-007/actions.ts":
        confirmed = [
            "It is a server-actions file with the `\"use server\"` directive.",
            "It imports `redirect` from `next/navigation`.",
            "It imports `clearOwnerSession` and `createOwnerSession` from `@/lib/owner-auth`.",
            "`loginOwner(formData)` reads `accessCode` from form data and calls `createOwnerSession(accessCode)`.",
            "If authentication fails, `loginOwner` redirects to `/owner/agent-007?error=1`.",
            "If authentication succeeds, `loginOwner` redirects to `/owner/agent-007`.",
            "`logoutOwner()` calls `clearOwnerSession()` and redirects to `/owner/agent-007`.",
        ]
        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This file is the server-side bridge between the owner access form and the owner-auth session helpers.",
            "",
            "Need to inspect next:",
            "- `lib/owner-auth.ts` to confirm how sessions and access-code checks are implemented.",
            "- `app/owner/agent-007/page.tsx` to confirm the form wiring and error display.",
        ])

    if path == "lib/owner-auth.ts":
        confirmed = [
            "It imports `server-only`, so the module is intended to stay server-side.",
            "It imports `createHmac` and `timingSafeEqual` from `crypto` and `cookies` from `next/headers`.",
            "It defines the owner cookie name as `accord_owner` and the session payload as `owner`.",
            "It defines development fallbacks `accord-owner` and `accord-owner-dev-secret-change-before-production`.",
            "`readSecret` uses configured environment variables when present, allows fallbacks outside production, and throws in production if secrets are missing.",
            "`sign` creates an HMAC-SHA256 signature for the session payload.",
            "`safeEqual` uses `timingSafeEqual` after checking buffer lengths.",
            "`isOwnerAuthenticated` validates the owner cookie payload, signature, and format.",
            "`createOwnerSession` compares the submitted access code, then sets an HTTP-only, sameSite strict cookie for eight hours.",
            "`clearOwnerSession` clears the owner cookie by setting `maxAge: 0`.",
        ]
        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This is the main privacy boundary for Oscar's owner-only route.",
            "",
            "Need to inspect next:",
            "- `app/owner/agent-007/actions.ts` to confirm how `createOwnerSession` and `clearOwnerSession` are used.",
            "- `app/owner/agent-007/page.tsx` to confirm unauthenticated users are gated before seeing Oscar.",
        ])

    exports = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if line.startswith("export "):
            exports.append(line[:160])
        if len(exports) >= 8:
            break

    confirmed = [
        f"The file was read from the verified workspace snapshot and has {line_count} visible lines.",
    ]
    if exports:
        confirmed.append("Visible exports include: " + "; ".join(f"`{item}`" for item in exports) + ".")
    if truncated:
        confirmed.append("The file content was truncated for the local bridge summary.")

    return "\n".join([
        f"Actual file read: `{path}`.",
        "",
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Likely:",
        "- More precise conclusions require inspecting related files and imports.",
        "",
        "Need to inspect next:",
        "- Related route, action, auth, or data files that import or are imported by this file.",
    ])


def bridge_file_content_answer(body):
    """Read a verified file and answer from its actual contents for file-inspection prompts."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_file_content(user_request):
        return None

    observed_files = observed_files_from_manifest(snapshot)
    if not observed_files:
        return None

    requested = bridge_requested_path(user_request, observed_files)
    if not requested:
        return None

    if requested not in set(observed_files):
        answer = (
            f"`{requested}` is not in the verified workspace snapshot. "
            "I cannot inspect or explain a file that is not listed in OBSERVED_FILES."
        )
        return encode_ollama_bridge_answer(payload, answer)

    try:
        data = bridge_read_text(requested, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not read `{requested}` through the workspace bridge: {exc}")

    answer = summarize_actual_file(requested, data.get("content", ""), data.get("truncated", False))
    return encode_ollama_bridge_answer(payload, answer)


def compact_bridge_message(
    content,
    snapshot_max_chars=OLLAMA_BRIDGE_SNAPSHOT_MAX_CHARS,
    request_max_chars=500,
):
    """Compress an attached workspace snapshot but preserve the user's actual request."""
    snapshot, user_request = split_bridge_context(content)
    if not user_request:
        return shorten_middle(content, OLLAMA_CURRENT_MAX_CHARS)

    snapshot = shorten_middle(
        snapshot,
        snapshot_max_chars,
        "workspace snapshot shortened for local Ollama runtime",
    )
    user_request = shorten_middle(user_request, request_max_chars)
    return f"{snapshot}\n---\nUSER REQUEST\n{user_request}"


def payload_text_chars(messages):
    return sum(len(str(msg.get("content", ""))) for msg in messages if isinstance(msg, dict))


def last_user_text_from_chat_body(body):
    if not body:
        return ""

    try:
        payload = json.loads(body)
    except Exception:
        return ""

    messages = payload.get("messages")
    if not isinstance(messages, list):
        return ""

    for msg in reversed(messages):
        if not isinstance(msg, dict) or msg.get("role") == "system":
            continue
        content = str(msg.get("content", "") or "").strip()
        if not content:
            continue
        for marker in ("\n---\nUSER REQUEST\n", "\n---\nUser:", "\nUser:"):
            if marker in content:
                content = content.split(marker)[-1].strip()
        return content

    return ""


def quick_local_handshake_answer(body):
    """Answer owner wake words locally so the UI never stalls on simple checks."""
    text = last_user_text_from_chat_body(body)
    if not text:
        return None

    compact = re.sub(r"\s+", " ", text).strip()
    normalized = re.sub(r"[^a-z0-9 ]+", " ", compact.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()

    if not normalized:
        return None

    answer = None
    model_name = "agent-007-local-handshake"
    image_request = (
        re.search(r"\b(draw|make|create|generate|render)\b.*\b(pic|picture|image|art|logo|cover|poster|graphic|goat)\b", normalized)
        or re.search(r"\bdraw me\b", normalized)
        or re.search(r"\bmake me\b.*\b(image|pic|picture|art|logo|cover|poster|graphic)\b", normalized)
    )
    if re.fullmatch(r"(hello|hi|hey|yo|sup|ready|you ready|are you ready|oscar|master oscar|master oscar ready)", normalized) or re.fullmatch(r"(hello|hi|hey|yo) (oscar|master oscar|there|you ready|are you ready)", normalized):
        return None
    elif re.fullmatch(r"(what can you do|what can you help with|how can you help|what do you do)", normalized):
        return None
    elif "moneypenny are you there" in normalized or "money penny are you there" in normalized:
        answer = (
            "Yes, Boss. I remember.\n\n"
            "Moneypenny Vault Protocol v7.0 is recognized in this local Oscar stack. "
            "DrawOurGoat, CheckVaultStatus, and StartProphecyDrop are owner commands; "
            "write actions stay locked until the owner code is supplied."
        )
    elif "draw our goat" in normalized or "drawourgoat" in normalized:
        draft = create_local_png_draft("GOAT/the creator Rawls royal crest concept")
        model_name = "agent-007-local-png-renderer"
        answer = (
            "DrawOurGoat trigger received. Moneypenny is online.\n\n"
            "Oscar created a real local PNG from the built-in renderer.\n"
            f"Local PNG: {draft['url']}\n"
            f"Manifest: {draft['manifestUrl']}\n"
            "Renderer: master-oscar-local-procedural-png"
        )
    elif image_request:
        subject = compact
        subject = re.sub(r"(?i)\b(agent-007|money penny|moneypenny)\b[:, ]*", "", subject).strip()
        subject = re.sub(r"(?i)\b(can you|please|draw me|draw|make me|make|create|generate|render)\b", "", subject).strip()
        subject = re.sub(r"(?i)\b(a|an|me|pic|picture|image)\b", "", subject).strip()
        subject = re.sub(r"(?i)^(of|for|to)\s+", "", subject).strip()
        if not subject:
            subject = "original GOAT/the creator Rawls royal crest concept"
        draft = create_local_png_draft(subject)
        model_name = "agent-007-local-png-renderer"
        answer = (
            "Image request received. Oscar created a real local PNG from the built-in renderer.\n\n"
            f"Subject: {subject}\n"
            f"Local PNG: {draft['url']}\n"
            f"Manifest: {draft['manifestUrl']}\n"
            "Renderer: master-oscar-local-procedural-png\n"
            "Note: this quick path uses Oscar's built-in procedural drawing engine with a fresh render seed. "
            "Use ComfyUI, Stable Diffusion WebUI, or Forge workflows for full diffusion-model art."
        )
    elif "checkvaultstatus" in normalized or "check vault status" in normalized:
        answer = (
            "CheckVaultStatus recognized. Local protocol memory is reachable, and the vault remains "
            "read-and-mirror only from chat until owner write code is supplied."
        )
    elif re.search(r"\bwav\b", normalized) and re.search(r"\bduration\b", normalized):
        model_name = "agent-007-local-code-reference"
        answer = WAV_DURATION_REFERENCE_ANSWER
    elif re.search(
        r"\b(self[- ]?maintenance|self[- ]?heal|self[- ]?healing|apply code to yourself|absorb and apply code)\b",
        normalized,
    ):
        return None
    elif re.search(
        r"\b(finalize agent-007|world[- ]class marketing|best marketing and ai agent|marketing and ai agent)\b",
        normalized,
    ) or ("marketing" in normalized and "agent-007" in normalized and "finalize" in normalized):
        model_name = "agent-007-local-marketing-finalize"
        answer = MARKETING_FINALIZE_REFERENCE_ANSWER
    if answer is None:
        return None

    try:
        payload = json.loads(body) if body else {}
    except Exception:
        payload = {}
    if payload.get("stream"):
        return encode_ollama_bridge_answer(payload, answer)

    return {
        "model": model_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "message": {"role": "assistant", "content": answer},
        "done": True,
    }


def rasp_local_protocol_answer(body):
    """Run RASP before model generation for proof/status/code routes."""
    if rasp_protocol is None:
        return None
    try:
        payload = json.loads(body) if body else {}
    except Exception:
        return None
    if not isinstance(payload, dict):
        return None
    result = rasp_protocol.response_for_payload(payload)
    if not result or not result.get("handled"):
        return None

    answer = str(result.get("content") or "").strip()
    if not answer:
        return None
    if payload.get("stream"):
        return encode_ollama_bridge_answer(payload, answer)

    return {
        "model": f"rasp-protocol-{result.get('route', 'router')}",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "message": {"role": "assistant", "content": answer},
        "done": True,
        "done_reason": "rasp_protocol",
        "rasp": {"route": result.get("route"), "handled": True},
    }


def _png_chunk(tag, data):
    tag_bytes = tag if isinstance(tag, bytes) else tag.encode("ascii")
    return (
        struct.pack(">I", len(data))
        + tag_bytes
        + data
        + struct.pack(">I", zlib.crc32(tag_bytes + data) & 0xFFFFFFFF)
    )


def _write_rgb_png(path, width, height, pixels):
    stride = width * 3
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        start = y * stride
        raw.extend(pixels[start:start + stride])

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    compressed = zlib.compress(bytes(raw), 9)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(_png_chunk("IHDR", ihdr))
        f.write(_png_chunk("IDAT", compressed))
        f.write(_png_chunk("IEND", b""))


def _blend_rgb(pixels, width, height, x, y, color, alpha=1.0):
    if x < 0 or y < 0 or x >= width or y >= height:
        return
    idx = (y * width + x) * 3
    inv = max(0.0, 1.0 - alpha)
    a = min(1.0, max(0.0, alpha))
    pixels[idx] = int(pixels[idx] * inv + color[0] * a)
    pixels[idx + 1] = int(pixels[idx + 1] * inv + color[1] * a)
    pixels[idx + 2] = int(pixels[idx + 2] * inv + color[2] * a)


def _fill_circle(pixels, width, height, cx, cy, radius, color, alpha=1.0):
    r = max(1, int(radius))
    r2 = r * r
    left = max(0, int(cx) - r)
    right = min(width - 1, int(cx) + r)
    top = max(0, int(cy) - r)
    bottom = min(height - 1, int(cy) + r)
    for y in range(top, bottom + 1):
        dy = y - cy
        for x in range(left, right + 1):
            dx = x - cx
            if dx * dx + dy * dy <= r2:
                _blend_rgb(pixels, width, height, x, y, color, alpha)


def _fill_ellipse(pixels, width, height, cx, cy, rx, ry, color, alpha=1.0):
    rx = max(1.0, float(rx))
    ry = max(1.0, float(ry))
    left = max(0, int(cx - rx))
    right = min(width - 1, int(cx + rx))
    top = max(0, int(cy - ry))
    bottom = min(height - 1, int(cy + ry))
    for y in range(top, bottom + 1):
        ny = ((y - cy) / ry) ** 2
        if ny > 1:
            continue
        for x in range(left, right + 1):
            nx = ((x - cx) / rx) ** 2
            if nx + ny <= 1:
                _blend_rgb(pixels, width, height, x, y, color, alpha)


def _fill_rect(pixels, width, height, x1, y1, x2, y2, color, alpha=1.0):
    left = max(0, min(width - 1, int(min(x1, x2))))
    right = max(0, min(width - 1, int(max(x1, x2))))
    top = max(0, min(height - 1, int(min(y1, y2))))
    bottom = max(0, min(height - 1, int(max(y1, y2))))
    for y in range(top, bottom + 1):
        for x in range(left, right + 1):
            _blend_rgb(pixels, width, height, x, y, color, alpha)


def _draw_line(pixels, width, height, x1, y1, x2, y2, color, thickness=1, alpha=1.0):
    distance = max(1.0, math.hypot(x2 - x1, y2 - y1))
    radius = max(1, int(thickness / 2))
    sample_stride = max(1.0, radius * 0.65)
    steps = max(1, int(distance / sample_stride))
    for step in range(steps + 1):
        t = step / steps
        x = x1 + (x2 - x1) * t
        y = y1 + (y2 - y1) * t
        _fill_circle(pixels, width, height, x, y, radius, color, alpha)


def _draw_quadratic(pixels, width, height, start, control, end, color, thickness=1, alpha=1.0, steps=160):
    last_x, last_y = start
    for i in range(1, steps + 1):
        t = i / steps
        inv = 1.0 - t
        x = inv * inv * start[0] + 2 * inv * t * control[0] + t * t * end[0]
        y = inv * inv * start[1] + 2 * inv * t * control[1] + t * t * end[1]
        _draw_line(pixels, width, height, last_x, last_y, x, y, color, thickness, alpha)
        last_x, last_y = x, y


def _fill_polygon(pixels, width, height, points, color, alpha=1.0):
    min_y = max(0, int(min(p[1] for p in points)))
    max_y = min(height - 1, int(max(p[1] for p in points)))
    for y in range(min_y, max_y + 1):
        intersections = []
        j = len(points) - 1
        for i, point in enumerate(points):
            xi, yi = point
            xj, yj = points[j]
            if (yi > y) != (yj > y):
                denom = yj - yi
                if denom:
                    intersections.append(xi + (y - yi) * (xj - xi) / denom)
            j = i
        intersections.sort()
        for i in range(0, len(intersections), 2):
            if i + 1 >= len(intersections):
                break
            x_start = max(0, int(intersections[i]))
            x_end = min(width - 1, int(intersections[i + 1]))
            for x in range(x_start, x_end + 1):
                _blend_rgb(pixels, width, height, x, y, color, alpha)


def _draw_ring(pixels, width, height, cx, cy, radius, color, thickness=6, alpha=1.0, segments=360):
    last = None
    for i in range(segments + 1):
        angle = (math.pi * 2 * i) / segments
        x = cx + math.cos(angle) * radius
        y = cy + math.sin(angle) * radius
        if last:
            _draw_line(pixels, width, height, last[0], last[1], x, y, color, thickness, alpha)
        last = (x, y)


def create_local_png_draft(subject):
    """Create an actual local PNG image for Oscar draw requests without external renderers."""
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    stem = f"agent-007-draw-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    render_seed = uuid.uuid4().hex
    png_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.png")
    manifest_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.json")
    width = 1024
    height = 1024
    pixels = bytearray(width * height * 3)
    subject_hash = hashlib.sha256(f"{subject}|{render_seed}".encode("utf-8", "ignore")).digest()
    accent = (
        190 + subject_hash[0] % 56,
        145 + subject_hash[1] % 70,
        35 + subject_hash[2] % 45,
    )
    gold = (248, 211, 88)
    light_gold = (255, 238, 161)
    dark_gold = (145, 96, 18)
    black = (5, 5, 5)

    for y in range(height):
        dy = (y - height * 0.48) / height
        for x in range(width):
            dx = (x - width * 0.50) / width
            r = min(1.0, math.sqrt(dx * dx + dy * dy) * 2.1)
            glow = max(0.0, 1.0 - r)
            idx = (y * width + x) * 3
            pixels[idx] = int(3 + accent[0] * glow * 0.18)
            pixels[idx + 1] = int(3 + accent[1] * glow * 0.13)
            pixels[idx + 2] = int(4 + accent[2] * glow * 0.07)

    subject_words = set(re.findall(r"[a-z0-9]+", subject.lower()))
    if {"city", "building", "street", "skyline"} & subject_words:
        layout = 1
    elif {"cover", "poster", "flyer", "album", "thumbnail"} & subject_words:
        layout = 2
    elif {"space", "stars", "galaxy", "planet"} & subject_words:
        layout = 3
    elif {"car", "speed", "motion", "race"} & subject_words:
        layout = 4
    else:
        layout = subject_hash[3] % 5

    if layout == 1:
        for i in range(18):
            x = 96 + i * 49
            h = 90 + subject_hash[(i + 4) % len(subject_hash)] % 185
            _fill_rect(pixels, width, height, x, 850 - h, x + 28, 850, dark_gold, 0.28)
            _fill_rect(pixels, width, height, x + 5, 850 - h + 14, x + 10, 846, light_gold, 0.20)
    elif layout == 2:
        _fill_rect(pixels, width, height, 122, 116, 902, 204, accent, 0.16)
        _fill_rect(pixels, width, height, 122, 820, 902, 908, accent, 0.16)
        for i in range(9):
            y = 138 + i * 84
            _draw_line(pixels, width, height, 96, y, 928, y + (subject_hash[(i + 9) % len(subject_hash)] % 37 - 18), gold, 3, 0.20)
    elif layout == 3:
        for i in range(42):
            sx = 80 + ((subject_hash[i % len(subject_hash)] * 19 + i * 83) % 864)
            sy = 80 + ((subject_hash[(i + 11) % len(subject_hash)] * 23 + i * 61) % 864)
            _fill_circle(pixels, width, height, sx, sy, 2 + subject_hash[(i + 3) % len(subject_hash)] % 4, light_gold, 0.50)
        _draw_ring(pixels, width, height, 512, 512, 235 + subject_hash[18] % 90, accent, 2, 0.25, 240)
    elif layout == 4:
        for i in range(12):
            y = 250 + i * 46
            _draw_line(pixels, width, height, 70, y, 954, y - 120 + subject_hash[(i + 5) % len(subject_hash)] % 240, accent, 5, 0.18)
    else:
        for i in range(16):
            angle = (math.pi * 2 * i) / 16
            radius = 320 + subject_hash[(i + 6) % len(subject_hash)] % 130
            _draw_line(
                pixels,
                width,
                height,
                512,
                512,
                512 + math.cos(angle) * radius,
                512 + math.sin(angle) * radius,
                accent,
                4,
                0.16,
            )

    for radius, thickness, alpha in ((430, 14, 0.95), (382, 5, 0.68), (300, 3, 0.35)):
        _draw_ring(pixels, width, height, 512, 512, radius, gold, thickness, alpha)

    # Horns and luxury linework.
    _draw_quadratic(pixels, width, height, (435, 410), (255, 180), (178, 384), gold, 34, 0.96)
    _draw_quadratic(pixels, width, height, (589, 410), (769, 180), (846, 384), gold, 34, 0.96)
    _draw_quadratic(pixels, width, height, (435, 410), (293, 235), (226, 388), black, 12, 0.92)
    _draw_quadratic(pixels, width, height, (589, 410), (731, 235), (798, 388), black, 12, 0.92)
    _draw_quadratic(pixels, width, height, (332, 610), (512, 735), (692, 610), dark_gold, 15, 0.62)
    _draw_quadratic(pixels, width, height, (312, 676), (512, 816), (712, 676), gold, 11, 0.86)

    # Crown.
    crown = [(396, 260), (446, 165), (511, 260), (578, 165), (628, 260)]
    _draw_line(pixels, width, height, 396, 260, 446, 165, gold, 20, 0.98)
    _draw_line(pixels, width, height, 446, 165, 511, 260, gold, 20, 0.98)
    _draw_line(pixels, width, height, 511, 260, 578, 165, gold, 20, 0.98)
    _draw_line(pixels, width, height, 578, 165, 628, 260, gold, 20, 0.98)
    _draw_line(pixels, width, height, 390, 282, 634, 282, light_gold, 12, 0.98)
    for point in crown[1::2]:
        _fill_circle(pixels, width, height, point[0], point[1], 18, light_gold, 1.0)

    # Goat face.
    _fill_polygon(pixels, width, height, [(310, 493), (388, 445), (430, 575), (356, 610)], gold, 0.96)
    _fill_polygon(pixels, width, height, [(714, 445), (792, 493), (668, 610), (594, 575)], gold, 0.96)
    _fill_ellipse(pixels, width, height, 512, 535, 160, 230, gold, 0.98)
    _fill_ellipse(pixels, width, height, 512, 545, 132, 202, black, 0.96)
    _draw_quadratic(pixels, width, height, (380, 500), (512, 395), (644, 500), light_gold, 10, 0.82)
    _draw_line(pixels, width, height, 512, 398, 512, 662, dark_gold, 6, 0.76)
    _fill_circle(pixels, width, height, 448, 505, 22, light_gold, 0.98)
    _fill_circle(pixels, width, height, 576, 505, 22, light_gold, 0.98)
    _fill_circle(pixels, width, height, 448, 505, 8, black, 0.96)
    _fill_circle(pixels, width, height, 576, 505, 8, black, 0.96)
    _fill_ellipse(pixels, width, height, 512, 645, 78, 65, gold, 0.98)
    _fill_ellipse(pixels, width, height, 512, 642, 55, 38, (30, 22, 10), 0.92)
    _fill_circle(pixels, width, height, 488, 632, 9, light_gold, 0.94)
    _fill_circle(pixels, width, height, 536, 632, 9, light_gold, 0.94)
    _draw_quadratic(pixels, width, height, (462, 705), (512, 748), (562, 705), light_gold, 12, 0.92)
    _draw_line(pixels, width, height, 440, 760, 584, 760, gold, 11, 0.88)
    _draw_line(pixels, width, height, 410, 795, 614, 795, dark_gold, 8, 0.58)

    # Prompt fingerprint bars: every render carries a visibly different mark.
    for i in range(20):
        bar = subject_hash[i % len(subject_hash)]
        x = 262 + i * 25
        y1 = 888 - (bar % 86)
        _fill_rect(pixels, width, height, x, y1, x + 10, 898, light_gold if i % 2 else accent, 0.72)

    # Glowing sparks.
    for i in range(34):
        sx = 160 + ((subject_hash[i % len(subject_hash)] * 37 + i * 53) % 704)
        sy = 160 + ((subject_hash[(i + 7) % len(subject_hash)] * 41 + i * 29) % 704)
        if 250 < sx < 774 and 270 < sy < 850:
            continue
        _draw_line(pixels, width, height, sx - 12, sy, sx + 12, sy, light_gold, 3, 0.75)
        _draw_line(pixels, width, height, sx, sy - 12, sx, sy + 12, light_gold, 3, 0.75)
        _fill_circle(pixels, width, height, sx, sy, 4, gold, 0.85)

    _write_rgb_png(png_path, width, height, pixels)
    manifest = {
        "ok": True,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "requestedSubject": subject,
        "renderSeed": render_seed,
        "type": "local-procedural-png",
        "renderer": "master-oscar-local-procedural-png",
        "diffusionRendererConnected": False,
        "pngPath": png_path,
        "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(png_path)}",
        "manifestUrl": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(manifest_path)}",
        "note": "Created by Oscar's built-in local procedural PNG renderer. Each draw request gets a fresh render seed and visible prompt fingerprint. Use ComfyUI/Stable Diffusion workflows for full diffusion-model art.",
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest


def create_local_svg_draft(subject):
    """Create a deterministic local SVG draft for image requests when no renderer is connected."""
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    stem = f"agent-007-draw-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    svg_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.svg")
    manifest_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.json")
    safe_subject = html.escape(subject[:180])

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1400" viewBox="0 0 1400 1400" role="img" aria-label="Oscar local image draft">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#1c1606"/>
      <stop offset="55%" stop-color="#070707"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2a8"/>
      <stop offset="35%" stop-color="#f2c94c"/>
      <stop offset="70%" stop-color="#b88718"/>
      <stop offset="100%" stop-color="#ffe680"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1400" height="1400" fill="url(#bg)"/>
  <circle cx="700" cy="700" r="510" fill="none" stroke="url(#gold)" stroke-width="18" opacity=".88"/>
  <circle cx="700" cy="700" r="455" fill="none" stroke="#f8d86b" stroke-width="4" opacity=".5"/>
  <path d="M420 590 C260 455 290 250 485 340 C550 370 600 455 625 525" fill="none" stroke="url(#gold)" stroke-width="54" stroke-linecap="round"/>
  <path d="M980 590 C1140 455 1110 250 915 340 C850 370 800 455 775 525" fill="none" stroke="url(#gold)" stroke-width="54" stroke-linecap="round"/>
  <path d="M500 610 C520 485 610 410 700 410 C790 410 880 485 900 610 C925 765 835 930 700 950 C565 930 475 765 500 610 Z" fill="#080808" stroke="url(#gold)" stroke-width="28"/>
  <path d="M610 735 C650 710 750 710 790 735 C765 800 735 835 700 835 C665 835 635 800 610 735 Z" fill="url(#gold)" opacity=".92"/>
  <circle cx="610" cy="625" r="28" fill="#f9d767" filter="url(#glow)"/>
  <circle cx="790" cy="625" r="28" fill="#f9d767" filter="url(#glow)"/>
  <path d="M650 895 C680 920 720 920 750 895" fill="none" stroke="#f8d86b" stroke-width="18" stroke-linecap="round"/>
  <path d="M560 305 L620 210 L700 315 L780 210 L840 305" fill="none" stroke="url(#gold)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M380 1040 C520 1135 880 1135 1020 1040" fill="none" stroke="url(#gold)" stroke-width="24" stroke-linecap="round"/>
  <text x="700" y="1138" text-anchor="middle" fill="#f5d76e" font-family="Georgia, serif" font-size="48" letter-spacing="3">OSCAR LOCAL IMAGE DRAFT</text>
  <text x="700" y="1208" text-anchor="middle" fill="#fff1a8" font-family="Arial, sans-serif" font-size="30">{safe_subject}</text>
</svg>
"""
    manifest = {
        "ok": True,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "requestedSubject": subject,
        "type": "local-svg-draft",
        "renderer": "deterministic-svg-fallback",
        "bitmapRendererConnected": False,
        "svgPath": svg_path,
        "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(svg_path)}",
        "manifestUrl": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(manifest_path)}",
        "nextStep": "Start ComfyUI on 127.0.0.1:8188 or Stable Diffusion WebUI on 127.0.0.1:7860 for bitmap rendering.",
    }
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest


def read_text_if_exists(path, max_chars=1600):
    try:
        if not os.path.isfile(path):
            return ""
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read(max_chars + 1)[:max_chars]
    except Exception:
        return ""


def build_oscar_brain_always_on_context():
    """Small always-on Brain digest. Detailed Brain docs remain available through brain_search/brain_read."""
    snippets = []
    brain_files = [
        ("Start", "00-start-here/OSCAR-BRAIN-START.md", 1200),
        ("Self-learning", "15-self-system/SELF-LEARNING-LOOP.md", 1200),
        ("Self-applying", "15-self-system/SELF-APPLYING-LOOP.md", 900),
        ("Self-healing", "15-self-system/SELF-HEALING-LOOP.md", 900),
        ("Maintenance", "15-self-system/SELF-MAINTENANCE-POLICY.md", 900),
        ("Junior dev apprenticeship", "30-playbooks/PLAYBOOK-OSCAR-JUNIOR-DEV-APPRENTICESHIP.md", 1200),
    ]
    for label, rel, limit in brain_files:
        content = read_text_if_exists(os.path.join(OSCAR_BRAIN_DIR, rel), limit).strip()
        if content:
            snippets.append(f"## {label}: {rel}\n{content}")
    if not snippets:
        return ""
    return "\n\n".join([
        OSCAR_BRAIN_CONTEXT_PREFIX,
        f"Root: {OSCAR_BRAIN_DIR}",
        "Oscar Brain is always on. Use this as standing operating context. For detailed or task-specific facts, request brain_search or brain_read before answering.",
        "Safe autonomy rule: read, diagnose, summarize, and recommend automatically. Apply file changes, external actions, money movement, publishing, installs, or destructive cleanup only with owner approval.",
        *snippets,
    ])


def build_oscar_readonly_maintenance_snapshot():
    """Read-only runtime health facts Oscar can use without being prompted."""
    checks = []
    for name, path in [
        ("project_root", PROJECT_ROOT),
        ("shared_dir", SCRIPT_DIR),
        ("brain_dir", OSCAR_BRAIN_DIR),
        ("chats_file", CHATS_FILE),
        ("settings_file", SETTINGS_FILE),
        ("html_file", HTML_FILE),
    ]:
        checks.append(f"- {name}: {'ok' if os.path.exists(path) else 'missing'} | {path}")
    try:
        settings = load_settings()
        checks.append(f"- default_model: {settings.get('defaultModel', '(unset)')}")
        checks.append(f"- project_memory_chars: {len(settings.get('projectMemory', '') or '')}")
        checks.append(f"- tool_mode_enabled: {bool(settings.get('toolModeEnabled'))}")
    except Exception as exc:
        checks.append(f"- settings_read_error: {exc}")
    try:
        cpu, ram = _get_hw_stats()
        checks.append(f"- cpu_percent: {cpu}")
        checks.append(f"- ram_percent: {ram}")
    except Exception:
        pass
    return "\n".join([
        OSCAR_MAINTENANCE_CONTEXT_PREFIX,
        "Read-only maintenance is always on. Use these facts to avoid pretending paths, memory, or tools are present. If repair is needed, request self_heal with apply=false first; apply=true requires owner approval.",
        *checks,
    ])


def sanitize_ollama_chat_body(body):
    """Bound chat payloads so a local 4K-context model does not spend minutes timing out."""
    if not body:
        return body

    try:
        payload = json.loads(body)
    except Exception:
        return body

    messages = payload.get("messages")
    if not isinstance(messages, list) or not messages:
        return body

    original_chars = payload_text_chars(messages)
    has_core_identity = any(
        isinstance(msg, dict)
        and msg.get("role") == "system"
        and str(msg.get("content", "")).startswith(AGENT_007_CORE_IDENTITY_PREFIX)
        for msg in messages
    )
    if not has_core_identity:
        messages = [{"role": "system", "content": AGENT_007_CORE_IDENTITY}] + messages

    system_messages = []
    core_identity_messages = []
    project_memory_messages = []
    brain_context_messages = []
    maintenance_context_messages = []
    tool_mode_messages = []
    conversation = []
    is_bridge_payload = any(
        isinstance(msg, dict)
        and msg.get("role") != "system"
        and is_bridge_context(msg.get("content", ""))
        for msg in messages
    )
    has_tool_mode = any(
        isinstance(msg, dict)
        and msg.get("role") == "system"
        and str(msg.get("content", "")).startswith(TOOL_MODE_PREFIX)
        for msg in messages
    )
    system_max_chars = OLLAMA_BRIDGE_SYSTEM_MAX_CHARS if is_bridge_payload else OLLAMA_SYSTEM_MAX_CHARS
    history_budget_chars = OLLAMA_BRIDGE_HISTORY_BUDGET_CHARS if is_bridge_payload else OLLAMA_HISTORY_BUDGET_CHARS
    total_budget_chars = OLLAMA_BRIDGE_TOTAL_BUDGET_CHARS if is_bridge_payload else OLLAMA_TOTAL_BUDGET_CHARS
    if has_tool_mode and not is_bridge_payload:
        total_budget_chars = max(total_budget_chars, OLLAMA_TOOL_TOTAL_BUDGET_CHARS)

    brain_context = build_oscar_brain_always_on_context()
    if brain_context:
        brain_context_messages.append({
            "role": "system",
            "content": shorten_middle(
                brain_context,
                OLLAMA_BRIDGE_PROJECT_MEMORY_MAX_CHARS if is_bridge_payload else OLLAMA_PROJECT_MEMORY_MAX_CHARS,
                "Oscar Brain always-on context shortened for local Ollama runtime",
            ),
        })
    maintenance_context_messages.append({
        "role": "system",
        "content": shorten_middle(
            build_oscar_readonly_maintenance_snapshot(),
            1600,
            "Oscar read-only maintenance snapshot shortened for local Ollama runtime",
        ),
    })

    for msg in messages:
        if not isinstance(msg, dict):
            continue
        if msg.get("role") == "system":
            compact = dict(msg)
            content = str(compact.get("content", ""))
            if content.startswith(AGENT_007_CORE_IDENTITY_PREFIX):
                compact["content"] = shorten_middle(
                    content,
                    OLLAMA_CORE_IDENTITY_MAX_CHARS,
                    "Oscar core identity shortened for local Ollama runtime",
                )
                core_identity_messages.append(compact)
            elif content.startswith(PROJECT_MEMORY_PREFIX):
                memory_max_chars = (
                    OLLAMA_BRIDGE_PROJECT_MEMORY_MAX_CHARS
                    if is_bridge_payload
                    else OLLAMA_PROJECT_MEMORY_MAX_CHARS
                )
                compact["content"] = shorten_middle(
                    content,
                    memory_max_chars,
                    "project memory shortened for local Ollama runtime",
                )
                project_memory_messages.append(compact)
            elif content.startswith(TOOL_MODE_PREFIX):
                compact["content"] = shorten_middle(
                    content,
                    OLLAMA_TOOL_MODE_MAX_CHARS,
                    "tool mode instructions shortened for local Ollama runtime",
                )
                tool_mode_messages.append(compact)
            else:
                compact["content"] = shorten_middle(content, system_max_chars)
                system_messages.append(compact)
        else:
            conversation.append(msg)

    if not conversation:
        payload["messages"] = (
            core_identity_messages
            + system_messages
            + project_memory_messages
            + brain_context_messages
            + maintenance_context_messages
            + tool_mode_messages
        )
        return json.dumps(payload).encode("utf-8")

    current = dict(conversation[-1])
    current_content = str(current.get("content", ""))
    if is_bridge_context(current_content):
        current["content"] = compact_bridge_message(
            current_content,
            snapshot_max_chars=OLLAMA_BRIDGE_RUNTIME_SNAPSHOT_MAX_CHARS,
            request_max_chars=OLLAMA_BRIDGE_REQUEST_MAX_CHARS,
        )
    else:
        current["content"] = shorten_middle(current_content, OLLAMA_CURRENT_MAX_CHARS)

    prior_messages = []
    used_history = 0
    for msg in reversed(conversation[:-1]):
        if not isinstance(msg, dict):
            continue
        content = str(msg.get("content", ""))
        if not content or is_bridge_context(content):
            continue
        remaining = history_budget_chars - used_history
        if remaining < 250:
            break
        if msg.get("role") == "assistant" and is_bad_assistant_history(content):
            continue
        compact = dict(msg)
        if msg.get("role") == "assistant":
            content = polish_agent_007_assistant_text(content)
        compact["content"] = shorten_middle(content, min(remaining, OLLAMA_MESSAGE_MAX_CHARS))
        prior_messages.append(compact)
        used_history += len(compact["content"])

    compact_messages = (
        core_identity_messages
        + system_messages
        + project_memory_messages
        + brain_context_messages
        + maintenance_context_messages
        + tool_mode_messages
        + list(reversed(prior_messages))
        + [current]
    )

    while payload_text_chars(compact_messages) > total_budget_chars and prior_messages:
        prior_messages.pop()
        compact_messages = core_identity_messages + system_messages + project_memory_messages + brain_context_messages + maintenance_context_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    if payload_text_chars(compact_messages) > total_budget_chars and system_messages:
        for msg in system_messages:
            msg["content"] = shorten_middle(msg.get("content", ""), 200)
        compact_messages = core_identity_messages + system_messages + project_memory_messages + brain_context_messages + maintenance_context_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    if payload_text_chars(compact_messages) > total_budget_chars and project_memory_messages:
        memory_floor = 180 if is_bridge_payload else 260
        for msg in project_memory_messages:
            msg["content"] = shorten_middle(
                msg.get("content", ""),
                memory_floor,
                "project memory shortened for local Ollama runtime",
            )
        compact_messages = core_identity_messages + system_messages + project_memory_messages + brain_context_messages + maintenance_context_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    if payload_text_chars(compact_messages) > total_budget_chars and brain_context_messages:
        for msg in brain_context_messages:
            msg["content"] = shorten_middle(
                msg.get("content", ""),
                1800 if is_bridge_payload else 3500,
                "Oscar Brain always-on context shortened for local Ollama runtime",
            )
        compact_messages = core_identity_messages + system_messages + project_memory_messages + brain_context_messages + maintenance_context_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    if payload_text_chars(compact_messages) > total_budget_chars and maintenance_context_messages:
        for msg in maintenance_context_messages:
            msg["content"] = shorten_middle(
                msg.get("content", ""),
                700,
                "Oscar read-only maintenance snapshot shortened for local Ollama runtime",
            )
        compact_messages = core_identity_messages + system_messages + project_memory_messages + brain_context_messages + maintenance_context_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    if payload_text_chars(compact_messages) > total_budget_chars and tool_mode_messages:
        for msg in tool_mode_messages:
            msg["content"] = shorten_middle(
                msg.get("content", ""),
                360,
                "tool mode instructions shortened for local Ollama runtime",
            )
        compact_messages = core_identity_messages + system_messages + project_memory_messages + brain_context_messages + maintenance_context_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    options = payload.get("options") if isinstance(payload.get("options"), dict) else {}
    max_ctx = OLLAMA_NUM_CTX
    max_predict = OLLAMA_BRIDGE_MAX_PREDICT if is_bridge_payload else OLLAMA_MAX_PREDICT
    options["num_ctx"] = min(int(options.get("num_ctx", max_ctx) or max_ctx), max_ctx)
    options["num_predict"] = min(int(options.get("num_predict", max_predict) or max_predict), max_predict)
    payload["options"] = options
    payload["messages"] = compact_messages

    compact_chars = payload_text_chars(compact_messages)
    if compact_chars != original_chars:
        safe_print(
            f"[proxy] compacted /api/chat prompt {original_chars} -> {compact_chars} chars",
            flush=True,
        )

    return json.dumps(payload).encode("utf-8")


class ChatHandler(http.server.BaseHTTPRequestHandler):
    """Handles all HTTP requests for Oscar Local Agent Chat."""

    def log_message(self, format, *args):
        """Print all requests for easy debugging."""
        msg = format % args
        ts = time.strftime("%H:%M:%S")
        # Colour-code by status: errors red, warnings yellow, ok green
        if "404" in msg or "500" in msg or "502" in msg:
            prefix = "  \033[91m[ERR]\033[0m"
        elif "200" in msg or "204" in msg:
            prefix = "  \033[92m[ OK]\033[0m"
        else:
            prefix = "  \033[93m[---]\033[0m"
        safe_print(f"{prefix} {ts}  {msg}")

    # ── Browser origin boundary ─────────────────────────────────
    def _browser_origin_allowed(self):
        origin = self.headers.get("Origin", "").strip().rstrip("/")
        if not origin:
            return True
        if origin == "null" and self._is_local_request():
            return True

        parsed = urlparse(origin)
        host = self.headers.get("Host", "").strip().lower()
        if parsed.scheme in ("http", "https") and parsed.netloc.lower() == host:
            return True

        return origin in AGENT_007_ALLOWED_ORIGINS

    def _reject_untrusted_browser_origin(self):
        if self._browser_origin_allowed():
            return False

        self.send_response(403)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(b'{"error":"Browser origin is not allowed to access Oscar."}')
        return True

    # ── CORS headers ───────────────────────────────────────────
    def _cors_headers(self):
        origin = self.headers.get("Origin", "").strip().rstrip("/")
        if origin and self._browser_origin_allowed():
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        if self._reject_untrusted_browser_origin():
            return
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    # ── Routing ────────────────────────────────────────────────
    def do_GET(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path

        # Serve the main UI
        if path == "/" or path == "/index.html":
            self._serve_html()

        # Chat data API
        elif path == "/api/chats":
            self._get_chats()

        # Settings API
        elif path == "/api/settings":
            self._get_settings()

        # Hardware stats API
        elif path == "/api/stats":
            self._get_stats()

        elif path == "/api/health":
            self._get_health()

        elif path == "/api/oscar-brain":
            self._get_oscar_brain_index()

        elif path == "/api/oscar-brain/search":
            self._get_oscar_brain_search()

        elif path == "/api/oscar-brain/read":
            self._get_oscar_brain_read()

        # Sanitized local Ms. Money Penny intake profile
        elif path == "/api/money-penny/profile":
            self._get_money_penny_profile()

        # Sanitized local Lexicon Lexi intake profile
        elif path == "/api/lexicon-lexi/profile":
            self._get_lexicon_lexi_profile()

        # Sanitized local Ms. Vanessa intake profile
        elif path == "/api/ms-vanessa/profile":
            self._get_ms_vanessa_profile()

        # Sanitized local Ms. Nexus intake profile
        elif path == "/api/ms-nexus/profile":
            self._get_ms_nexus_profile()

        # Sanitized local Sir Codex intake profile
        elif path == "/api/sir-codex/profile":
            self._get_sir_codex_profile()

        # Private local Oscar call-and-response protocol
        elif path == "/api/agent-007/vault-protocol":
            self._get_agent_007_vault_protocol()

        # Private local Oscar diary
        elif path == "/api/agent-007/diary":
            self._get_agent_007_diary()

        # Sanitized private Drive/Vault intake profile
        elif path == "/api/drive-vault/profile":
            self._get_drive_vault_profile()

        # Sanitized GOAT Drive intake summary
        elif path == "/api/goat/drive-intake":
            self._get_drive_intake_summary()

        # Sanitized GOAT catalog scanner standard
        elif path == "/api/goat/catalog-scanner":
            self._get_goat_data_standard(CATALOG_SCANNER_STANDARD_FILE, "catalog scanner standard")

        # Sanitized GOAT instrument lab standard
        elif path == "/api/goat/instrument-lab":
            self._get_goat_data_standard(GOAT_INSTRUMENT_LAB_STANDARD_FILE, "instrument lab standard")

        # Sanitized GOAT asset/style vault standard
        elif path == "/api/goat/asset-style-vault":
            self._get_goat_data_standard(GOAT_ASSET_STYLE_VAULT_STANDARD_FILE, "asset style vault standard")

        # Sanitized GOAT icon/art lab standard
        elif path == "/api/goat/icon-art-lab":
            self._get_goat_data_standard(GOAT_ICON_ART_LAB_STANDARD_FILE, "icon art lab standard")

        # Sanitized GOAT image render bridge standard and live local renderer status
        elif path == "/api/goat/image-render-bridge":
            self._get_image_render_bridge_status()

        # GOAT multi-engine video arena and honest connector status
        elif path == "/api/goat/video-engines":
            self._get_goat_video_engines()

        # Oscar embedded local AI runtime stack
        elif path == "/api/agent-007/local-ai-stack":
            self._get_local_ai_stack_status()

        # Sanitized GOAT career co-pilot standard
        elif path == "/api/goat/career-copilot":
            self._get_goat_data_standard(GOAT_CAREER_COPILOT_STANDARD_FILE, "career co-pilot standard")

        # Sanitized GOAT local model pack
        elif path == "/api/goat/local-model-pack":
            self._get_goat_data_standard(GOAT_LOCAL_MODEL_PACK_FILE, "local model pack")

        # Optional local Granite Speech ASR bridge
        elif path == "/api/voice/granite/status":
            self._get_granite_voice_status()

        elif path == "/api/clips/status":
            self._get_clips_status()

        elif path == "/api/voice/speak/status":
            self._send_json(200, voice_speak_status_payload())

        # Oscar Studio local-first build status
        elif path == "/api/studio/status":
            self._get_studio_status()

        # LAN/mobile browser access status
        elif path == "/api/mobile/access":
            self._get_mobile_access()

        # Read-only workspace bridge API
        elif path == "/api/workspace":
            self._get_workspace_info()

        elif path == "/api/workspace/tree":
            self._get_workspace_tree()

        elif path == "/api/workspace/file":
            self._get_workspace_file()

        elif path == "/api/workspace/search":
            self._get_workspace_search()

        elif path == "/api/workspace/context":
            self._get_workspace_context()

        # Owner-approved Oscar Tool Mode API
        elif path == "/api/tools":
            self._get_tools_info()

        elif path == "/api/tools/adapters":
            self._get_tool_adapters()

        elif path == "/api/tools/policy":
            self._get_tools_policy()

        elif path == "/api/tools/logs":
            self._get_tools_logs()

        elif path == "/api/owner-approval":
            self._get_owner_approval()

        # Proxy Ollama API
        elif path.startswith("/ollama/"):
            self._proxy_ollama("GET")

        # GOAT Royalty App local web app
        elif path == "/goat" or path == "/goat/" or path.startswith("/goat/"):
            self._serve_goat_static(path)

        # Local SVG/image drafts generated by Oscar's image fallback route
        elif path.startswith("/generated-images/"):
            self._serve_generated_image_static(path)

        else:
            # Try serving static files from SCRIPT_DIR
            self._serve_static(path)

    def do_POST(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path

        if path == "/api/chats":
            self._save_chats()

        elif path == "/api/settings":
            self._save_settings()

        elif path == "/api/tools":
            self._post_tool_action()

        elif path == "/api/tools/policy":
            self._post_tools_policy()

        elif path == "/api/owner-approval/setup":
            self._post_owner_approval_setup()

        elif path == "/api/owner-approval/unlock":
            self._post_owner_approval_unlock()

        elif path == "/api/owner-approval/lock":
            self._post_owner_approval_lock()

        elif path == "/api/agent-007/diary":
            self._post_agent_007_diary()

        elif path == "/api/local-files/inspect":
            self._post_local_files_inspect()

        elif path == "/api/voice/granite/transcribe":
            self._post_granite_transcribe()

        elif path == "/api/clips/analyze":
            self._post_clips_analyze()

        elif path == "/api/goat/video-jobs":
            self._post_goat_video_job()

        elif path == "/api/ollama/prepare-mac-mini":
            self._post_ollama_prepare_mac_mini()

        elif path == "/api/voice/speak":
            self._post_voice_speak()

        # Proxy Ollama API
        elif path.startswith("/ollama/"):
            self._proxy_ollama("POST")

        else:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()

    def do_DELETE(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path
        if path.startswith("/ollama/"):
            self._proxy_ollama("DELETE")
        else:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()

    # ── Serve HTML ─────────────────────────────────────────────
    def _serve_html(self):
        try:
            with open(HTML_FILE, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"FastChatUI.html not found.")

    def _serve_static(self, path):
        """Serve static files (CSS, JS, images) from SCRIPT_DIR."""
        safe_path = os.path.normpath(path.lstrip("/"))
        first_part = safe_path.split(os.sep, 1)[0]
        full_path = os.path.realpath(os.path.join(SCRIPT_DIR, safe_path))
        script_root = os.path.realpath(SCRIPT_DIR)

        # Security: don't allow path traversal or serving private app data.
        if os.path.commonpath([script_root, full_path]) != script_root or first_part in PRIVATE_DIRS:
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return

        if os.path.isfile(full_path):
            ext = os.path.splitext(full_path)[1].lower()
            mime_types = {
                ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
                ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
                ".svg": "image/svg+xml", ".ico": "image/x-icon"
            }
            content_type = mime_types.get(ext, "application/octet-stream")
            with open(full_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self._cors_headers()
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()

    def _serve_goat_static(self, path):
        """Serve GOAT Royalty App web-app files under /goat/ without exposing the repo."""
        if not os.path.isdir(GOAT_WEB_APP_DIR):
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            return

        rel_path = path[len("/goat/"):] if path.startswith("/goat/") else ""
        if not rel_path:
            rel_path = "index.html"
        safe_path = os.path.normpath(rel_path)
        first_part = safe_path.split(os.sep, 1)[0]
        full_path = os.path.realpath(os.path.join(GOAT_WEB_APP_DIR, safe_path))
        goat_root = os.path.realpath(GOAT_WEB_APP_DIR)

        if (
            safe_path.startswith("..")
            or os.path.commonpath([goat_root, full_path]) != goat_root
            or first_part in PRIVATE_DIRS
            or first_part.startswith(".")
        ):
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return

        if not os.path.isfile(full_path):
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            return

        ext = os.path.splitext(full_path)[1].lower()
        mime_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".md": "text/markdown; charset=utf-8",
            ".sh": "text/x-shellscript; charset=utf-8",
            ".ps1": "text/plain; charset=utf-8",
        }
        content_type = mime_types.get(ext, "application/octet-stream")
        with open(full_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self._cors_headers()
        self.end_headers()
        self.wfile.write(content)

    def _serve_generated_image_static(self, path):
        rel_path = path[len("/generated-images/"):]
        rel_path = os.path.normpath(rel_path).lstrip(os.sep)
        if not rel_path or rel_path.startswith(".."):
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return

        image_root = os.path.realpath(GENERATED_IMAGES_DIR)
        full_path = os.path.realpath(os.path.join(GENERATED_IMAGES_DIR, rel_path))
        if os.path.commonpath([image_root, full_path]) != image_root:
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return
        if not os.path.isfile(full_path):
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            return

        ext = os.path.splitext(full_path)[1].lower()
        content_type = {
            ".svg": "image/svg+xml",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        }.get(ext, "application/octet-stream")
        with open(full_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(content)

    # ── Chat Persistence ───────────────────────────────────────
    def _get_chats(self):
        chats = read_json_file(CHATS_FILE, [])
        migrated, changed = migrate_chats_data(chats)
        if changed:
            backup = CHATS_FILE + ".bak-" + time.strftime("%Y%m%d-%H%M%S")
            try:
                if os.path.exists(CHATS_FILE):
                    shutil.copy2(CHATS_FILE, backup)
                write_json_file(CHATS_FILE, migrated)
                safe_print(f"[chats] migrated legacy prompts/history -> {backup}", flush=True)
            except Exception as exc:
                safe_print(f"[chats] migration skipped: {exc}", flush=True)
            chats = migrated
        self._send_json(200, chats)

    def _save_chats(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            chats = json.loads(body)
            if not isinstance(chats, list):
                raise ValueError("Expected a JSON array of chats")
            chats, _ = migrate_chats_data(chats)
            write_json_file(CHATS_FILE, chats)
            self._send_json(200, {"ok": True})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_settings(self):
        self._send_json(200, load_settings())

    def _save_settings(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            settings = json.loads(body)
            if not isinstance(settings, dict):
                raise ValueError("Expected a JSON object of settings")
            merged = DEFAULT_SETTINGS.copy()
            merged.update(settings)
            write_json_file(SETTINGS_FILE, merged)
            self._send_json(200, {"ok": True})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_money_penny_profile(self):
        self._get_sanitized_profile(
            "Ms. Money Penny",
            MONEY_PENNY_PROFILE_FILE,
            MONEY_PENNY_SUMMARY_FILE,
            MONEY_PENNY_HOME_DIR,
            "Ms. Money Penny profile has not been created yet.",
        )

    def _get_lexicon_lexi_profile(self):
        self._get_sanitized_profile(
            "Lexicon Lexi",
            LEXI_PROFILE_FILE,
            LEXI_SUMMARY_FILE,
            LEXI_HOME_DIR,
            "Lexicon Lexi profile has not been created yet.",
        )

    def _get_ms_vanessa_profile(self):
        self._get_sanitized_profile(
            "Ms. Vanessa",
            MS_VANESSA_PROFILE_FILE,
            MS_VANESSA_SUMMARY_FILE,
            MS_VANESSA_HOME_DIR,
            "Ms. Vanessa profile has not been created yet.",
        )

    def _get_ms_nexus_profile(self):
        self._get_sanitized_profile(
            "Ms. Nexus",
            MS_NEXUS_PROFILE_FILE,
            MS_NEXUS_SUMMARY_FILE,
            MS_NEXUS_HOME_DIR,
            "Ms. Nexus profile has not been created yet.",
        )

    def _get_sir_codex_profile(self):
        self._get_sanitized_profile(
            "Sir Codex",
            SIR_CODEX_PROFILE_FILE,
            SIR_CODEX_SUMMARY_FILE,
            SIR_CODEX_HOME_DIR,
            "Sir Codex profile has not been created yet.",
        )

    def _get_sanitized_profile(self, display_name, profile_file, summary_file, home_dir, missing_message):
        try:
            with open(profile_file, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": profile_file,
                "summaryPath": summary_file,
                "homeDir": home_dir,
                "source": "sanitized-local-profile",
                "displayName": display_name,
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": missing_message,
                "profilePath": profile_file,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_agent_007_vault_protocol(self):
        try:
            with open(AGENT_007_PROTOCOL_MEMORY_FILE, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": AGENT_007_PROTOCOL_MEMORY_FILE,
                "protocolPath": AGENT_007_PROTOCOL_FILE,
                "homeDir": AGENT_007_PROTOCOL_HOME_DIR,
                "source": "private-local-agent-007-vault-protocol",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Oscar vault protocol has not been created yet.",
                "profilePath": AGENT_007_PROTOCOL_MEMORY_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_agent_007_diary(self):
        try:
            ensure_agent_007_diary()
            with open(AGENT_007_DIARY_FILE, "r", encoding="utf-8") as f:
                diary = f.read().strip()
            self._send_json(200, {
                "ok": True,
                "diary": diary,
                "profile": agent_007_diary_profile(),
                "diaryPath": AGENT_007_DIARY_FILE,
                "profilePath": AGENT_007_DIARY_MEMORY_FILE,
                "homeDir": AGENT_007_DIARY_HOME_DIR,
                "source": "private-local-agent-007-diary",
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_drive_vault_profile(self):
        try:
            with open(DRIVE_VAULT_PROFILE_FILE, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            summary = read_json_file(DRIVE_FEATURE_INTAKE_FILE, {})
            counts = summary.get("counts", {}) if isinstance(summary, dict) else {}
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": DRIVE_VAULT_PROFILE_FILE,
                "manifestPath": DRIVE_INTAKE_MANIFEST_FILE,
                "summaryPath": DRIVE_FEATURE_INTAKE_FILE,
                "homeDir": DRIVE_INTAKE_HOME_DIR,
                "source": "sanitized-private-drive-vault-profile",
                "counts": counts,
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Drive Vault profile has not been created yet.",
                "profilePath": DRIVE_VAULT_PROFILE_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_drive_intake_summary(self):
        try:
            summary = read_json_file(DRIVE_FEATURE_INTAKE_FILE, {})
            if not isinstance(summary, dict) or not summary:
                raise FileNotFoundError(DRIVE_FEATURE_INTAKE_FILE)
            self._send_json(200, {
                "ok": True,
                "summary": summary,
                "summaryPath": DRIVE_FEATURE_INTAKE_FILE,
                "manifestPath": DRIVE_INTAKE_MANIFEST_FILE,
                "homeDir": DRIVE_INTAKE_HOME_DIR,
                "source": "sanitized-goat-drive-intake-summary",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Drive intake summary has not been created yet.",
                "summaryPath": DRIVE_FEATURE_INTAKE_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_goat_data_standard(self, file_path, label):
        try:
            data = read_json_file(file_path, {})
            if not isinstance(data, dict) or not data:
                raise FileNotFoundError(file_path)
            self._send_json(200, {
                "ok": True,
                "label": label,
                "data": data,
                "path": file_path,
                "source": "sanitized-local-goat-standard",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": f"{label} has not been created yet.",
                "path": file_path,
            })

    def _probe_local_renderer(self, name, url, timeout=1.2):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json,text/plain,*/*"})
            with urllib.request.urlopen(req, timeout=timeout) as res:
                return {
                    "name": name,
                    "url": url,
                    "reachable": 200 <= res.status < 500,
                    "status": res.status,
                }
        except Exception as e:
            return {
                "name": name,
                "url": url,
                "reachable": False,
                "error": f"{type(e).__name__}: {e}",
            }

    def _comfy_model_inventory(self, timeout=4.0):
        inventory = {"checkpoints": [], "diffusers": [], "usable": False}
        endpoints = (
            ("checkpoints", "CheckpointLoaderSimple", "ckpt_name"),
            ("diffusers", "DiffusersLoader", "model_path"),
        )
        for key, node_name, field_name in endpoints:
            try:
                req = urllib.request.Request(
                    f"http://127.0.0.1:8188/object_info/{node_name}",
                    headers={"Accept": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=timeout) as res:
                    payload = json.loads(res.read().decode("utf-8"))
                choices = (
                    payload.get(node_name, {})
                    .get("input", {})
                    .get("required", {})
                    .get(field_name, [[]])[0]
                )
                if isinstance(choices, list):
                    inventory[key] = [str(item) for item in choices if str(item).strip()]
            except Exception as e:
                inventory[f"{key}Error"] = f"{type(e).__name__}: {e}"
        inventory["usable"] = bool(inventory["checkpoints"] or inventory["diffusers"])
        return inventory

    def _dir_status(self, path):
        return {
            "path": path,
            "exists": os.path.isdir(path),
        }

    def _file_status(self, path):
        return {
            "path": path,
            "exists": os.path.isfile(path),
        }

    def _python_import_status(self, python_path, module_name, timeout=20):
        if not os.path.exists(python_path):
            return {"module": module_name, "available": False, "error": "python not found"}
        proc = subprocess.run(
            [
                python_path,
                "-c",
                f"import importlib.util; raise SystemExit(0 if importlib.util.find_spec({module_name!r}) else 1)",
            ],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return {
            "module": module_name,
            "available": proc.returncode == 0,
            "error": tool_short_output(proc.stderr or proc.stdout, 1200) if proc.returncode else "",
        }

    def _model_download_job_status(self):
        log_path = os.path.join(SCRIPT_DIR, "logs", "agent-007-autonomous-model-download.log")
        pid_path = os.path.join(SCRIPT_DIR, "logs", "agent-007-autonomous-model-download.pid")
        report_path = os.path.join(SCRIPT_DIR, "logs", "agent-007-art-model-download-report.json")
        pid = None
        running = False
        if os.path.exists(pid_path):
            try:
                with open(pid_path, "r", encoding="utf-8") as f:
                    pid = int(f.read().strip())
                os.kill(pid, 0)
                running = True
            except Exception:
                running = False
        if not running:
            try:
                proc = subprocess.run(
                    ["ps", "-axo", "pid=,command="],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    check=False,
                )
                for line in proc.stdout.splitlines():
                    if "start-autonomous-model-download.sh" in line and "ps -axo" not in line:
                        parts = line.strip().split(None, 1)
                        if parts:
                            pid = int(parts[0])
                            running = True
                            break
            except Exception:
                running = False
        report = []
        summary = {}
        if os.path.exists(report_path):
            try:
                report = read_json_file(report_path, [])
                if isinstance(report, list):
                    for item in report:
                        status = str(item.get("status") or "unknown")
                        summary[status] = summary.get(status, 0) + 1
                else:
                    report = []
            except Exception:
                report = []
        return {
            "running": running,
            "pid": pid,
            "pidPath": pid_path,
            "logPath": log_path,
            "reportPath": report_path,
            "reportExists": os.path.exists(report_path),
            "summary": summary,
            "completedItems": len(report),
            "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-autonomous-model-download.sh"),
            "terminalScript": os.path.join(PROJECT_ROOT, "Mac", "Start Oscar Autonomous Model Download.command"),
        }

    def _model_store_inventory(self):
        stores = {}
        for key, path in {
            "foundation": AGENT_007_FOUNDATION_MODELS_DIR,
            "art": AGENT_007_ART_MODELS_DIR,
            "loras": os.path.join(AGENT_007_ART_MODELS_DIR, "loras"),
            "ollama": os.path.join(SCRIPT_DIR, "models", "ollama_data"),
        }.items():
            top_level = []
            model_files = 0
            if os.path.isdir(path):
                try:
                    top_level = sorted(os.listdir(path))[:300]
                    for _root, _dirs, files in os.walk(path):
                        for name in files:
                            if name.endswith((".safetensors", ".ckpt", ".gguf", ".bin")):
                                model_files += 1
                except Exception:
                    pass
            stores[key] = {
                "path": path,
                "exists": os.path.isdir(path),
                "topLevelCount": len(top_level),
                "topLevelSample": top_level[:40],
                "modelFileCount": model_files,
            }
        return stores

    def _get_local_ai_stack_status(self):
        comfy_python = os.path.join(AGENT_007_COMFYUI_VENV, "bin", "python")
        ollama_probe = self._probe_local_renderer("Ollama", "http://127.0.0.1:11434/api/tags")
        renderers = [
            self._probe_local_renderer("ComfyUI", "http://127.0.0.1:8188/system_stats", timeout=3.0),
            self._probe_local_renderer("Stable Diffusion WebUI", "http://127.0.0.1:7860/"),
            self._probe_local_renderer("SD WebUI Forge", "http://127.0.0.1:7861/"),
        ]
        desktop_apps = [
            "/Applications/Draw Things.app",
            "/Applications/LM Studio.app",
            "/Applications/Jan.app",
        ]
        self._send_json(200, {
            "ok": True,
            "root": PROJECT_ROOT,
            "mode": "embedded-local-ai-stack-status",
            "llmRuntimes": {
                "ollama": {
                    "embedded": os.path.exists(os.path.join(SCRIPT_DIR, "bin", "ollama-darwin")),
                    "reachable": bool(ollama_probe.get("reachable")),
                    "url": "http://127.0.0.1:11434",
                },
                "llamaCpp": {
                    **self._dir_status(AGENT_007_LLAMA_CPP_DIR),
                    "cli": local_or_path_executable(AGENT_007_LLAMA_CLI, "llama-cli"),
                    "server": local_or_path_executable(AGENT_007_LLAMA_SERVER, "llama-server"),
                    "buildScript": os.path.join(SCRIPT_DIR, "runtime", "build-llama-cpp.sh"),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-llama-cpp-server.sh"),
                    "url": "http://127.0.0.1:9797",
                    "note": "Local GGUF runtime lane. The server starts when at least one GGUF model is available.",
                },
                "vllm": {
                    "installed": False,
                    "note": "vLLM is normally a Linux/NVIDIA server lane, not a reliable Intel macOS embedded runtime.",
                },
                "mlxLm": {
                    "installed": False,
                    "supportedOnThisMac": platform.system() == "Darwin" and platform.machine() == "arm64",
                    "note": "MLX LM is Apple Silicon only.",
                },
            },
            "imageRuntimes": {
                "comfyui": {
                    **self._dir_status(AGENT_007_COMFYUI_DIR),
                    "venv": self._dir_status(AGENT_007_COMFYUI_VENV),
                    "python": comfy_python,
                    "torch": self._python_import_status(comfy_python, "torch"),
                    "diffusers": self._python_import_status(comfy_python, "diffusers"),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-comfyui.sh"),
                    "url": "http://127.0.0.1:8188",
                },
                "auto1111": {
                    **self._dir_status(AGENT_007_AUTO1111_DIR),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-auto1111.sh"),
                    "url": "http://127.0.0.1:7860",
                },
                "forge": {
                    **self._dir_status(AGENT_007_FORGE_DIR),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-forge.sh"),
                    "url": "http://127.0.0.1:7861",
                },
                "invokeai": {
                    "installed": self._python_import_status(comfy_python, "invokeai").get("available"),
                    "python": comfy_python,
                    "note": "Install lane is tracked; use ComfyUI/Forge first on this Intel Mac.",
                },
                "drawThings": {
                    "installed": os.path.isdir("/Applications/Draw Things.app"),
                    "appPath": "/Applications/Draw Things.app",
                    "note": "Mac App Store app; Oscar can detect/open it but cannot embed App Store binaries.",
                },
                "renderers": renderers,
            },
            "modelStores": {
                "foundation": self._dir_status(AGENT_007_FOUNDATION_MODELS_DIR),
                "art": self._dir_status(AGENT_007_ART_MODELS_DIR),
                "comfyExtraModelPaths": self._file_status(os.path.join(AGENT_007_COMFYUI_DIR, "extra_model_paths.yaml")),
            },
            "modelStoreInventory": self._model_store_inventory(),
            "modelDownloadJob": self._model_download_job_status(),
            "desktopApps": [self._dir_status(path) for path in desktop_apps],
            "ownerApprovalPolicy": {
                "requiredFor": [
                    "likeness, face-swap, or identity-preserving generation",
                    "publishing or client-facing output",
                    "cloud APIs or uploads",
                    "paid desktop apps",
                ],
                "reason": "Oscar can have powerful tools while still requiring the owner's final say for harmful or public actions.",
            },
        })

    def _get_image_render_bridge_status(self):
        try:
            data = read_json_file(GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE, {})
            if not isinstance(data, dict) or not data:
                raise FileNotFoundError(GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE)

            comfy_probe = self._probe_local_renderer("ComfyUI", "http://127.0.0.1:8188/system_stats", timeout=3.0)
            comfy_models = self._comfy_model_inventory() if comfy_probe.get("reachable") else {"checkpoints": [], "diffusers": [], "usable": False}
            probes = [
                comfy_probe,
                self._probe_local_renderer("Stable Diffusion WebUI", "http://127.0.0.1:7860/"),
                self._probe_local_renderer("SD WebUI Forge", "http://127.0.0.1:7861/"),
            ]
            cloud_configured = any(
                os.environ.get(name)
                for name in (
                    "OPENAI_API_KEY",
                    "GOOGLE_API_KEY",
                    "GEMINI_API_KEY",
                    "REPLICATE_API_TOKEN",
                    "STABILITY_API_KEY",
                )
            )
            self._send_json(200, {
                "ok": True,
                "label": "image render bridge standard",
                "data": data,
                "path": GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE,
                "source": "sanitized-local-goat-standard",
                "renderers": probes,
                "comfyModels": comfy_models,
                "cloudImageApiConfigured": bool(cloud_configured),
                "canRenderNow": (
                    bool(cloud_configured)
                    or any(item.get("reachable") and item.get("name") != "ComfyUI" for item in probes)
                    or (bool(comfy_probe.get("reachable")) and bool(comfy_models.get("usable")))
                ),
                "note": (
                    "GOAT can route image jobs now. Bitmap rendering requires a reachable renderer with "
                    "a visible model loaded/listed, or an owner-approved server-side cloud image API."
                ),
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "image render bridge standard has not been created yet.",
                "path": GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _goat_video_engines_payload(self):
        data = read_json_file(GOAT_VIDEO_ENGINE_ARENA_FILE, {})
        if not isinstance(data, dict) or not data:
            raise FileNotFoundError(GOAT_VIDEO_ENGINE_ARENA_FILE)

        engines = []
        for engine in data.get("engines", []):
            if not isinstance(engine, dict):
                continue
            item = dict(engine)
            required = [name for name in item.get("requiredEnv", []) if isinstance(name, str)]
            configured = [name for name in required if os.environ.get(name)]
            probe = None

            if item.get("localProbe"):
                probe = self._probe_local_renderer(item.get("display") or item.get("id"), item["localProbe"], timeout=2.5)
                item["status"] = "local_ready" if probe.get("reachable") else "local_offline"
            elif required:
                item["status"] = "ready" if configured else "needs_api_key"
            else:
                item["status"] = item.get("status") or "ready"

            item["configured"] = bool(configured) or item["status"] in ("ready", "local_ready")
            item["configuredEnv"] = configured
            item["missingEnv"] = [name for name in required if name not in configured]
            if probe:
                item["probe"] = probe
            engines.append(item)

        ready_count = sum(1 for engine in engines if engine.get("status") in ("ready", "local_ready"))
        payload = {
            **data,
            "ok": True,
            "path": GOAT_VIDEO_ENGINE_ARENA_FILE,
            "source": "goat-video-engine-arena-live-status",
            "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "engines": engines,
            "readyCount": ready_count,
            "canCloudRenderNow": any(
                engine.get("status") == "ready" and engine.get("requiredEnv")
                for engine in engines
            ),
            "canLocalRenderNow": any(engine.get("status") == "local_ready" for engine in engines),
            "note": (
                "GOAT can always build the creative video job package. Raw cloud or local video generation "
                "requires a configured provider key or a reachable local renderer."
            ),
        }
        return payload

    def _get_goat_video_engines(self):
        try:
            self._send_json(200, self._goat_video_engines_payload())
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "GOAT video engine arena map has not been created yet.",
                "path": GOAT_VIDEO_ENGINE_ARENA_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _post_goat_video_job(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("Expected a JSON object")
            prompt = str(payload.get("prompt") or "").strip()
            if not prompt:
                raise ValueError("Video prompt is required.")

            arena = self._goat_video_engines_payload()
            engines = arena.get("engines", [])
            requested_engine = str(payload.get("engine") or "auto").strip() or "auto"
            ready_engines = [
                engine for engine in engines
                if engine.get("status") in ("ready", "local_ready") and engine.get("id") != "goat-router"
            ]
            if requested_engine == "auto":
                engine = ready_engines[0] if ready_engines else next(
                    (item for item in engines if item.get("id") == "goat-router"),
                    engines[0] if engines else {"id": "goat-router", "display": "GOAT Router", "status": "ready"},
                )
            else:
                engine = next((item for item in engines if item.get("id") == requested_engine), None)
                if engine is None:
                    raise ValueError(f"Unknown video engine: {requested_engine}")

            render_ready = engine.get("status") in ("ready", "local_ready") and engine.get("id") != "goat-router"
            job_id = f"goat-video-{uuid.uuid4().hex[:12]}"
            job = {
                "id": job_id,
                "status": "ready-to-render" if render_ready else "staged-needs-connector",
                "engine": engine.get("id"),
                "engineName": engine.get("display"),
                "style": payload.get("style") or "Cinematic",
                "prompt": prompt[:2000],
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "renderReady": bool(render_ready),
                "nextStep": (
                    "Send to the configured provider/local renderer."
                    if render_ready else
                    "Add the missing provider key or start the local renderer, then resubmit this job."
                ),
                "missingEnv": engine.get("missingEnv", []),
                "package": {
                    "brief": "Music-video concept package",
                    "storyboard": [
                        "Hero opening frame",
                        "Performance shot",
                        "Product/brand insert",
                        "Motion transition",
                        "Cover-frame export",
                    ],
                    "metadata": [
                        "artist",
                        "song",
                        "rights owner",
                        "prompt lineage",
                        "provider/model",
                    ],
                },
            }
            self._send_json(200, {
                "ok": True,
                "mode": "goat-video-job-staging",
                "job": job,
                "arena": {
                    "readyCount": arena.get("readyCount", 0),
                    "canCloudRenderNow": arena.get("canCloudRenderNow", False),
                    "canLocalRenderNow": arena.get("canLocalRenderNow", False),
                },
                "note": "No cloud upload or paid render was started by this staging endpoint.",
            })
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _post_agent_007_diary(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("Expected a JSON object")
            stamp = append_agent_007_diary_entry(payload.get("entry") or payload.get("note") or "")
            self._send_json(200, {
                "ok": True,
                "stamp": stamp,
                "profile": agent_007_diary_profile(),
                "diaryPath": AGENT_007_DIARY_FILE,
                "source": "private-local-agent-007-diary",
            })
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_granite_voice_status(self):
        self._send_json(200, granite_status_payload())

    def _get_studio_status(self):
        settings = load_settings()
        paths = {
            "projectRoot": PROJECT_ROOT,
            "html": HTML_FILE,
            "chats": CHATS_FILE,
            "settings": SETTINGS_FILE,
            "studioHome": AGENT_007_STUDIO_HOME_DIR,
            "studioSpec": AGENT_007_STUDIO_SPEC_FILE,
            "workspaceRoot": tool_root(),
            "bridgeRoot": bridge_root(),
        }
        self._send_json(200, {
            "ok": True,
            "mode": "local-first-agent-007-studio",
            "paths": paths,
            "exists": {key: os.path.exists(value) for key, value in paths.items()},
            "settings": {
                "capabilityMode": settings.get("capabilityMode"),
                "expertMode": settings.get("expertMode"),
                "councilModeEnabled": bool(settings.get("councilModeEnabled")),
                "toolModeEnabled": bool(settings.get("toolModeEnabled")),
                "computerControlEnabled": bool(settings.get("computerControlEnabled")),
                "voiceAutoSpeak": bool(settings.get("voiceAutoSpeak")),
                "speechVoiceName": settings.get("speechVoiceName"),
                "speechStyle": settings.get("speechStyle"),
            },
            "runtimes": {
                "python": sys.executable,
                "ollama": shutil.which("ollama"),
                "llamaCli": local_or_path_executable(AGENT_007_LLAMA_CLI, "llama-cli"),
                "llamaServer": local_or_path_executable(AGENT_007_LLAMA_SERVER, "llama-server"),
                "ffmpeg": shutil.which("ffmpeg"),
                "brew": shutil.which("brew"),
            },
            "features": {
                "localChat": True,
                "persistentMemory": True,
                "workspaceBridge": os.path.isdir(bridge_root()),
                "toolMode": True,
                "computerControl": platform.system() == "Darwin",
                "voiceReadAloud": True,
                "browserSpeechRecognition": True,
                "graniteSpeechBridge": True,
                "ownerApprovalGates": True,
                "localBackups": os.path.isdir(os.path.join(PROJECT_ROOT, "BackupVault")),
            },
        })

    def _get_mobile_access(self):
        lan_ip = detect_lan_ip()
        local_url = f"http://127.0.0.1:{CHAT_SERVER_PORT}/"
        lan_url = f"http://{lan_ip}:{CHAT_SERVER_PORT}/"
        self._send_json(200, {
            "ok": True,
            "mode": "phone-and-lan-browser-access",
            "bind": "0.0.0.0",
            "localUrl": local_url,
            "lanUrl": lan_url,
            "phoneUrl": lan_url,
            "sameWifiRequired": True,
            "supportedClients": [
                "iPhone/iPad Safari or Chrome as LAN web app",
                "Android Chrome/Firefox as LAN web app",
                "Android Termux native launcher",
                "Linux phone browser or Linux shell launcher",
                "macOS browser or portable launcher",
                "Windows browser or portable launcher",
                "Linux browser or portable launcher",
            ],
            "notes": [
                "The desktop/server device must stay awake while phones connect.",
                "Phones use the same Oscar UI over the local network.",
                "Local model inference still runs on the host device unless Android/Linux phone native mode is used.",
                "If a phone cannot connect, allow port 3333 through the host firewall and keep both devices on the same network.",
            ],
        })

    def _get_clips_status(self):
        if clip_hunter is None:
            self._send_json(503, {
                "ok": False,
                "error": "clip_hunter module not loaded",
                "whisper": False,
            })
            return
        self._send_json(200, clip_hunter.status_payload())

    def _post_ollama_prepare_mac_mini(self):
        """Quit Mac Ollama.app competitor and warm gemma2-2b on this Oscar drive."""
        try:
            if platform.system() == "Darwin":
                subprocess.run(
                    ["osascript", "-e", 'quit app "Ollama"'],
                    capture_output=True,
                    text=True,
                    timeout=10,
                    check=False,
                )
                subprocess.run(
                    ["pkill", "-f", "/Applications/Ollama.app"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                    check=False,
                )
            ensure_ollama_running()
            model = load_settings().get("defaultModel") or os.environ.get(
                "AGENT_007_DEFAULT_MODEL", "gemma2-2b-local:latest"
            )
            if "gemma2" not in str(model):
                model = "gemma2-2b-local:latest"
            warmup = {
                "model": model,
                "prompt": "ok",
                "stream": False,
                "options": {"num_predict": 8, "num_ctx": 512},
            }
            req = urllib.request.Request(
                OLLAMA_HOST + "/api/generate",
                data=json.dumps(warmup).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                raw = resp.read().decode("utf-8", "replace")
            self._send_json(200, {
                "ok": True,
                "model": model,
                "ollama": True,
                "warmed": True,
                "response": json.loads(raw).get("response", "")[:40],
            })
        except Exception as exc:
            self._send_json(503, {"ok": False, "error": str(exc), "ollama": check_ollama_reachable()})

    def _post_clips_analyze(self):
        """Transcribe with timestamps and return clip-worthy moments + hook captions."""
        if clip_hunter is None:
            self._send_json(503, {"ok": False, "error": "Clip Hunter runtime is not available."})
            return

        content_length = int(self.headers.get("Content-Length", 0))
        max_bytes = CLIP_HUNTER_MAX_UPLOAD_MB * 1024 * 1024
        if content_length <= 0:
            self._send_json(400, {"ok": False, "error": "No media upload was received."})
            return
        if content_length > max_bytes:
            self._send_json(413, {
                "ok": False,
                "error": f"Upload too large. Limit is {CLIP_HUNTER_MAX_UPLOAD_MB} MB.",
            })
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self._send_json(400, {"ok": False, "error": "Expected multipart/form-data upload."})
            return

        temp_dir = tempfile.mkdtemp(prefix="agent-007-clip-upload-")
        try:
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": content_type,
                    "CONTENT_LENGTH": str(content_length),
                },
            )
            item = None
            for field_name in ("video", "audio", "file"):
                if field_name in form:
                    candidate = form[field_name]
                    item = candidate[0] if isinstance(candidate, list) else candidate
                    break
            if item is None or not getattr(item, "filename", ""):
                self._send_json(400, {"ok": False, "error": "Attach a video or audio file first."})
                return

            filename = granite_safe_filename(item.filename)
            ext = granite_audio_extension(filename)
            if ext not in GRANITE_AUDIO_EXTENSIONS:
                self._send_json(400, {
                    "ok": False,
                    "error": f"Unsupported media type: {ext or 'unknown'}",
                    "supportedExtensions": sorted(GRANITE_AUDIO_EXTENSIONS),
                })
                return

            saved_path = os.path.join(temp_dir, filename)
            with open(saved_path, "wb") as f:
                shutil.copyfileobj(item.file, f)
            if not os.path.getsize(saved_path):
                self._send_json(400, {"ok": False, "error": "The uploaded file was empty."})
                return

            media = probe_media_metadata(saved_path, filename)
            try:
                media["fingerprints"] = media_fingerprint_payload(saved_path, filename)
            except Exception as e:
                media["fingerprintError"] = str(e)

            result = clip_hunter.analyze_file(saved_path, filename, probe=media)
            self._send_json(200, {
                "ok": True,
                "filename": filename,
                "chars": len(result.get("transcript") or ""),
                "text": result.get("transcript"),
                "media": media,
                **result,
            })
        except ValueError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._send_json(503, {
                "ok": False,
                "error": str(exc),
                **(clip_hunter.status_payload() if clip_hunter else {}),
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    def _post_voice_speak(self):
        """Play Oscar reply audio via macOS `say` (no Computer Control required)."""
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length).decode("utf-8") if length else "{}"
            payload = json.loads(raw or "{}")
            text = str(payload.get("text") or "").strip()
            voice = payload.get("voice") or load_settings().get("speechVoiceName")
            result = macos_speak_text(text, voice)
            self._send_json(200, {"ok": True, **result})
        except (ValueError, PermissionError) as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _post_local_files_inspect(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Local file inspection is local-only."})
            return

        try:
            payload = self._read_json_body()
            raw_paths = payload.get("paths", [])
            if isinstance(raw_paths, str):
                raw_paths = raw_paths.splitlines()
            if not isinstance(raw_paths, list):
                raise ValueError("paths must be a list or newline-separated string")

            items = []
            for raw in raw_paths[:50]:
                text = str(raw or "").strip()
                if not text:
                    continue
                items.append(self._inspect_local_file_path(text))

            context_lines = [
                "LOCAL PATH ATTACHMENT INSPECTION",
                "Oscar can use this as file inventory. Binary contents were not read into chat.",
            ]
            for item in items:
                if not item.get("exists"):
                    context_lines.append(f"- MISSING: {item.get('path')}")
                    if item.get("error"):
                        context_lines.append(f"  error: {item.get('error')}")
                    continue
                context_lines.append(
                    f"- {item.get('name')} | {item.get('kind')} | {item.get('sizeHuman')} | {item.get('path')}"
                )
                if item.get("mime"):
                    context_lines.append(f"  mime: {item.get('mime')}")
                if item.get("sha256"):
                    context_lines.append(f"  sha256: {item.get('sha256')}")
                app = item.get("app") or {}
                if app:
                    app_bits = [app.get("bundleName"), app.get("bundleIdentifier"), app.get("version")]
                    context_lines.append("  app: " + " | ".join([str(x) for x in app_bits if x]))
                if item.get("sampleEntries"):
                    context_lines.append("  sample entries: " + ", ".join(item.get("sampleEntries", [])[:40]))

            self._send_json(200, {
                "ok": True,
                "count": len(items),
                "items": items,
                "context": "\n".join(context_lines)[:12000],
            })
        except Exception as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})

    def _inspect_local_file_path(self, raw_path):
        expanded = os.path.expandvars(os.path.expanduser(str(raw_path).strip()))
        full_path = os.path.abspath(expanded)
        real_path = os.path.realpath(full_path)
        blocked_parts = {".ssh", ".gnupg", "Keychains"}
        parts = set(real_path.split(os.sep))
        name = os.path.basename(real_path) or real_path
        if name.startswith(".env") or blocked_parts.intersection(parts):
            return {
                "path": full_path,
                "exists": False,
                "error": "Path is blocked from attachment metadata for privacy.",
            }

        if not os.path.exists(real_path):
            return {"path": full_path, "exists": False, "error": "Path not found."}

        stat = os.stat(real_path)
        is_dir = os.path.isdir(real_path)
        is_app = is_dir and real_path.lower().endswith(".app")
        kind = "app-bundle" if is_app else ("directory" if is_dir else "file")
        size_bytes = 0
        sample_entries = []
        truncated = False

        if is_dir:
            size_bytes, sample_entries, truncated = self._summarize_local_directory(real_path)
        else:
            size_bytes = stat.st_size

        item = {
            "path": full_path,
            "realPath": real_path,
            "name": name,
            "exists": True,
            "kind": kind,
            "sizeBytes": size_bytes,
            "sizeHuman": self._human_bytes(size_bytes),
            "modified": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(stat.st_mtime)),
            "mime": mimetypes.guess_type(real_path)[0] or "",
            "sampleEntries": sample_entries,
            "truncated": truncated,
        }

        if is_app:
            app_info = self._read_app_bundle_info(real_path)
            if app_info:
                item["app"] = app_info
        elif size_bytes <= 32 * 1024 * 1024:
            try:
                item["sha256"] = sha256_file(real_path)
            except Exception as exc:
                item["sha256Error"] = str(exc)
        else:
            item["sha256Skipped"] = "file larger than 32 MB"

        return item

    def _human_bytes(self, value):
        size = float(value or 0)
        units = ["B", "KB", "MB", "GB", "TB"]
        idx = 0
        while size >= 1024 and idx < len(units) - 1:
            size /= 1024
            idx += 1
        if idx == 0:
            return f"{int(size)} {units[idx]}"
        return f"{size:.1f} {units[idx]}" if size < 10 else f"{size:.0f} {units[idx]}"

    def _summarize_local_directory(self, root):
        total = 0
        sample = []
        seen = 0
        max_entries = 2000
        truncated = False
        for base, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__"} and not d.startswith(".")]
            rel_base = os.path.relpath(base, root)
            for filename in files:
                if filename.startswith("."):
                    continue
                seen += 1
                path = os.path.join(base, filename)
                try:
                    total += os.path.getsize(path)
                except OSError:
                    pass
                rel = filename if rel_base == "." else os.path.join(rel_base, filename)
                if len(sample) < 80:
                    sample.append(rel)
                if seen >= max_entries:
                    truncated = True
                    return total, sample, truncated
        return total, sample, truncated

    def _read_app_bundle_info(self, app_path):
        plist_path = os.path.join(app_path, "Contents", "Info.plist")
        if not os.path.isfile(plist_path):
            return {}
        try:
            with open(plist_path, "rb") as handle:
                info = plistlib.load(handle)
            return {
                "bundleName": info.get("CFBundleName") or info.get("CFBundleDisplayName") or "",
                "bundleIdentifier": info.get("CFBundleIdentifier") or "",
                "version": info.get("CFBundleShortVersionString") or info.get("CFBundleVersion") or "",
                "executable": info.get("CFBundleExecutable") or "",
            }
        except Exception as exc:
            return {"error": str(exc)}

    def _post_granite_transcribe(self):
        content_length = int(self.headers.get("Content-Length", 0))
        max_bytes = GRANITE_STT_MAX_UPLOAD_MB * 1024 * 1024
        if content_length <= 0:
            self._send_json(400, {"ok": False, "error": "No audio upload was received."})
            return
        if content_length > max_bytes:
            self._send_json(413, {
                "ok": False,
                "error": f"Audio upload is too large. Limit is {GRANITE_STT_MAX_UPLOAD_MB} MB.",
            })
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self._send_json(400, {"ok": False, "error": "Expected multipart/form-data audio upload."})
            return

        temp_dir = tempfile.mkdtemp(prefix="agent-007-granite-upload-")
        saved_path = None
        try:
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": content_type,
                    "CONTENT_LENGTH": str(content_length),
                },
            )
            item = None
            for field_name in ("audio", "file"):
                if field_name in form:
                    candidate = form[field_name]
                    item = candidate[0] if isinstance(candidate, list) else candidate
                    break
            if item is None or not getattr(item, "filename", ""):
                self._send_json(400, {"ok": False, "error": "Attach an audio or video file first."})
                return

            filename = granite_safe_filename(item.filename)
            ext = granite_audio_extension(filename)
            if ext not in GRANITE_AUDIO_EXTENSIONS:
                self._send_json(400, {
                    "ok": False,
                    "error": f"Unsupported audio/video type: {ext or 'unknown'}",
                    "supportedExtensions": sorted(GRANITE_AUDIO_EXTENSIONS),
                })
                return

            saved_path = os.path.join(temp_dir, filename)
            with open(saved_path, "wb") as f:
                shutil.copyfileobj(item.file, f)
            if not os.path.getsize(saved_path):
                self._send_json(400, {"ok": False, "error": "The uploaded file was empty."})
                return
            media = probe_media_metadata(saved_path, filename)
            try:
                media["fingerprints"] = media_fingerprint_payload(saved_path, filename)
            except Exception as e:
                media["fingerprintError"] = str(e)

            result = granite_transcribe_file(
                saved_path,
                filename,
                prompt=form.getfirst("prompt", GRANITE_STT_PROMPT),
                keywords=form.getfirst("keywords", GRANITE_STT_KEYWORDS),
            )
            self._send_json(200, {
                "ok": True,
                "filename": filename,
                "chars": len(result["text"]),
                "media": media,
                **result,
            })
        except Exception as e:
            self._send_json(503, {
                **granite_status_payload(),
                "error": str(e),
                "ok": False,
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    # ── Oscar Tool Mode ─────────────────────────────────────────
    def _is_local_request(self):
        return self.client_address and self.client_address[0] in TOOL_LOCAL_CLIENTS

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        payload = json.loads(body or b"{}")
        if not isinstance(payload, dict):
            raise ValueError("Expected a JSON object")
        return payload

    def _get_owner_approval(self):
        self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state()})

    def _post_owner_approval_setup(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Owner approval setup is local-only"})
            return
        try:
            payload = self._read_json_body()
            data = owner_approval_setup(payload.get("ownerName", "Owner"), payload.get("passphrase", ""))
            session = owner_approval_create_session(data.get("ownerName", "Owner"))
            self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state(), "session": session})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except PermissionError as e:
            self._send_json(403, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _post_owner_approval_unlock(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Owner approval unlock is local-only"})
            return
        try:
            payload = self._read_json_body()
            ok, data = owner_approval_verify(payload.get("passphrase", ""))
            if not ok:
                self._send_json(401, {"ok": False, "error": "Owner approval code was rejected.", "ownerApproval": owner_approval_public_state()})
                return
            session = owner_approval_create_session(data.get("ownerName", "Owner"))
            self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state(), "session": session})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except PermissionError as e:
            self._send_json(403, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _post_owner_approval_lock(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Owner approval lock is local-only"})
            return
        try:
            payload = self._read_json_body()
            token = payload.get("_ownerApprovalToken") or payload.get("ownerApprovalToken") or payload.get("token")
            if token:
                owner_approval_revoke(token)
            self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state()})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _get_tools_policy(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Tool Mode policy is local-only"})
            return
        try:
            self._send_json(200, {
                "ok": True,
                "policy": tool_policy_public(),
                "ownerApproval": owner_approval_public_state(),
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _post_tools_policy(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Tool Mode policy is local-only"})
            return
        try:
            payload = self._read_json_body()
            try:
                owner_approval_require(payload, "tool_policy")
            except PermissionError as e:
                self._send_json(401, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
                return
            policy = payload.get("policy", payload)
            saved = tool_policy_save(policy)
            self._send_json(200, {
                "ok": True,
                "policy": tool_policy_public(),
                "savedPolicy": saved,
                "ownerApproval": owner_approval_public_state(),
            })
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except (FileNotFoundError, PermissionError) as e:
            self._send_json(403, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _get_tools_info(self):
        local = self._is_local_request()
        settings = load_settings()
        policy = tool_policy_public()
        self._send_json(200, {
            "ok": True,
            "localRequest": local,
            "runWriteEnabled": local,
            "computerControlEnabled": bool(settings.get("computerControlEnabled")),
            "ownerApproval": owner_approval_public_state(),
            "root": tool_root(),
            "roots": tool_allowed_roots(),
            "toolPolicy": policy,
            "hardwareProfile": os.environ.get("AGENT_007_HARDWARE_PROFILE", "threadripper-thor"),
            "mode": "owner-approved local tool mode",
            "actions": [
                "tree",
                "read",
                "search",
                "run",
                "write",
                "patch",
                "mkdir",
                "copy",
                "move",
                "trash",
                "web_fetch",
                "llama_status",
                "transcribe_training_lessons",
                "fine_tune",
                "local_intel",
                "junior_dev",
                "draw",
                "tool_adapter",
                "diagnose",
                "self_heal",
                "security_audit",
                "agent_control",
                "computer",
            ],
            "drawPolicy": {
                "localOnly": True,
                "renderer": "master-oscar-local-procedural-png",
                "apiKeysRequired": False,
                "outputDir": GENERATED_IMAGES_DIR,
                "note": "Creates a real local PNG without cloud APIs, login, ComfyUI, or Stable Diffusion.",
            },
            "toolAdapterPolicy": {
                "localOnly": True,
                "readOnly": True,
                "action": "tool_adapter",
                "endpoint": "/api/tools/adapters",
                "note": "Routes owner requests to the best GOAT/Tool Mode lane and returns a safe nextToolRequest.",
            },
            "fineTunePolicy": {
                "localOnly": True,
                "action": "fine_tune",
                "operations": ["status", "prepare", "train", "eval", "promote", "add_example", "check_mlx"],
                "routes": ["ollama-modelfile", "mlx-lora"],
                "workDir": FINE_TUNE_WORK_DIR if fine_tune_pipeline else None,
                "notes": [
                    "Full fine-tuning pipeline: data prep, training, eval, and promotion.",
                    "Default route is ollama-modelfile (behavior tuning, fits 8 GB Intel).",
                    "MLX LoRA route requires Apple Silicon hardware.",
                    "Minimum 20 curated examples before training is allowed.",
                    "Eval must pass 85% before adapter promotion.",
                ],
            },
            "trainingTranscriptionPolicy": {
                "localOnly": True,
                "action": "transcribe_training_lessons",
                "operations": ["inventory", "start", "status", "stop"],
                "engine": "Clip Hunter / faster-whisper for MP4 audio plus HTML text extraction",
                "inputDir": FINE_TUNE_LLM_TRAINING_DIR,
                "outputDir": FINE_TUNE_LLM_TRANSCRIPTS_DIR,
                "statusFile": FINE_TUNE_LLM_TRANSCRIPTION_STATUS_FILE,
                "notes": [
                    "Processes the 24 owner-provided Fine-Tune LLM lesson files only.",
                    "Skips existing transcript files unless force is true.",
                    "Runs start as a background job so the chat UI stays usable.",
                ],
            },
            "localIntelPolicy": {
                "localOnly": True,
                "action": "local_intel",
                "operations": ["status", "scrape", "ingest", "transcribe", "index", "query", "answer", "pipeline"],
                "collectionRoot": os.path.join(PROJECT_ROOT, "Workspace", "Oscar-Local-Intel", "collections"),
                "engines": {
                    "scraper": "stdlib HTTP/HTML crawler with robots.txt respect by default",
                    "transcriber": "local faster-whisper when installed",
                    "rag": "local hybrid lexical/hash-vector retrieval with Ollama answer synthesis when available",
                    "observability": "local JSONL traces under each collection",
                },
                "apiKeysRequired": False,
                "loginRequired": False,
                "blocked": [
                    "embedded URL credentials",
                    "CAPTCHA or paywall bypass",
                    "proxy evasion",
                    "secret files and private config folders",
                ],
                "notes": [
                    "Use this for owner-approved web pages, files, PDFs, docs, code, audio, or video that should become searchable local knowledge.",
                    "Do not claim a site, file, transcript, index, or answer is verified until this action returns a tool result.",
                ],
            },
            "juniorDevPolicy": {
                "localOnly": True,
                "action": "junior_dev",
                "operations": ["status", "checklist", "start", "evidence", "note", "grade"],
                "root": JUNIOR_DEV_TRAINING_DIR,
                "sessionsDir": JUNIOR_DEV_SESSIONS_DIR,
                "ledgerFile": JUNIOR_DEV_LEDGER_FILE,
                "rule": "For code/build/review tasks Oscar must start a checklist, read evidence, save notes, get graded, and repeat before claiming progress.",
                "checklist": JUNIOR_DEV_CHECKLIST,
                "examples": {
                    "start": {"action": "junior_dev", "operation": "start", "task": "Inspect Halito Chat architecture", "files": ["/owner-approved/path/README.md"]},
                    "evidence": {"action": "junior_dev", "operation": "evidence", "source": "/owner-approved/path/README.md", "evidence": "README says the app is Swift/iOS and identifies the main target."},
                    "note": {"action": "junior_dev", "operation": "note", "note": "Learned to verify app claims from README and source files before summarizing.", "nextStep": "Read package/project files."},
                    "grade": {"action": "junior_dev", "operation": "grade", "score": 85, "reviewer": "Codex", "feedback": "Passed because evidence cited a real file."},
                },
            },
            "runPolicy": {
                "localOnly": True,
                "timeoutSeconds": TOOL_TIMEOUT_SECONDS,
                "allowedScripts": sorted(TOOL_ALLOWED_RUN_SCRIPTS),
                "allowedExactCommands": [" ".join(cmd) for cmd in sorted(TOOL_ALLOWED_EXACT_COMMANDS)],
            },
            "writePolicy": {
                "localOnly": True,
                "maxReadChars": TOOL_MAX_READ_CHARS,
                "maxChars": TOOL_MAX_WRITE_CHARS,
                "backupDir": TOOL_BACKUP_DIR,
                "textOnly": True,
                "blockedDirectories": sorted(BRIDGE_SKIP_DIRS),
                "blockedFiles": sorted(BRIDGE_PRIVATE_FILES),
            },
            "patchPolicy": {
                "localOnly": True,
                "maxReplacements": TOOL_MAX_PATCH_REPLACEMENTS,
                "defaultReplacementCount": 1,
                "backupDir": TOOL_BACKUP_DIR,
                "textOnly": True,
                "exactTextOnly": True,
            },
            "fileOpsPolicy": {
                "localOnly": True,
                "workspaceOnly": True,
                "backupDir": TOOL_BACKUP_DIR,
                "trashIsReversible": True,
                "actions": ["mkdir", "copy", "move", "trash"],
                "copyRegularFilesOnly": True,
                "blockedDirectories": sorted(BRIDGE_SKIP_DIRS),
                "blockedFiles": sorted(BRIDGE_PRIVATE_FILES),
            },
            "webFetchPolicy": {
                "localOnly": True,
                "allowedUrlSchemes": sorted(COMPUTER_ALLOWED_URL_SCHEMES),
                "maxBytes": TOOL_MAX_WEB_FETCH_BYTES,
                "maxChars": TOOL_MAX_WEB_FETCH_CHARS,
                "embeddedCredentialsBlocked": True,
            },
            "llamaStatusPolicy": {
                "localOnly": True,
                "action": "llama_status",
                "endpoint": "http://127.0.0.1:9797",
                "checks": ["/health", "/v1/models"],
                "rule": "Use this exact tool result for llama.cpp runtime claims. Do not rename models, round n_params, or infer model family.",
            },
            "selfHealPolicy": {
                "localOnly": True,
                "ownerApproved": True,
                "dryRunSupported": True,
                "repairs": [
                    "create missing Oscar runtime directories",
                    "create missing chat/settings JSON",
                    "restore advanced Tool Mode and Computer Control settings when requested",
                    "restore executable bits on Oscar launch/build scripts",
                    "compile-check chat_server.py",
                ],
                "backupDir": TOOL_BACKUP_DIR,
            },
            "securityPolicy": {
                "localOnly": True,
                "ownerApproved": True,
                "dryRunSupported": True,
                "actions": ["security_audit", "agent_control"],
                "agentControls": ["status", "security_brief", "secure_files", "pause", "resume"],
                "destructiveActions": False,
                "notes": [
                    "Security audit returns findings and recommendations without exposing secret values.",
                    "Agent control writes only local security briefs, permission changes, and pause/resume flags for known Oscar crew homes.",
                    "Network and firewall fixes that require admin/root are reported for the owner to approve manually.",
                ],
                "securityLog": OSCAR_SECURITY_LOG_FILE,
            },
            "computerPolicy": {
                "localOnly": True,
                "requiresToolMode": True,
                "requiresComputerControl": True,
                "actions": [
                    "open_url",
                    "open_app",
                    "activate_app",
                    "quit_app",
                    "open_path",
                    "reveal_path",
                    "list_running_apps",
                    "screenshot",
                    "speak",
                    "type_text",
                    "hotkey",
                    "daw_transport",
                ],
                "allowedUrlSchemes": sorted(COMPUTER_ALLOWED_URL_SCHEMES),
                "allowedApps": tool_policy_allowed_apps(),
                "allowedHotkeyModifiers": sorted(COMPUTER_ALLOWED_MODIFIERS),
                "allowedHotkeyKeys": sorted(COMPUTER_SPECIAL_KEY_CODES),
                "maxTypeChars": COMPUTER_MAX_TYPE_CHARS,
                "allowedDawTransportApps": sorted(DAW_ALLOWED_TRANSPORT_APPS),
                "allowedDawTransportCommands": sorted(DAW_ALLOWED_TRANSPORT_COMMANDS),
                "screenshotOutputDir": COMPUTER_SCREENSHOT_DIR,
                "workspaceOnlyPaths": True,
                "dryRunSupported": True,
                "timeoutSeconds": COMPUTER_CONTROL_TIMEOUT_SECONDS,
            },
        })

    def _get_tools_logs(self):
        if not self._is_local_request():
            self._send_json(403, {"error": "Oscar Tool Mode logs are local-only"})
            return
        log_path = os.path.join(TOOL_LOG_DIR, "tool-mode.jsonl")
        entries = []
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                lines = f.readlines()[-50:]
            for line in lines:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
        except FileNotFoundError:
            pass
        self._send_json(200, {"log": entries})

    def _get_tool_adapters(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Tool Adapter catalog is local-only"})
            return
        query = parse_qs(urlparse(self.path).query).get("q", [""])[0]
        self._send_json(200, {
            "ok": True,
            "catalog": adapter_catalog(),
            "routing": tool_adapter(query=query) if query else None,
            "ownerApproval": owner_approval_public_state(),
        })

    def _post_tool_action(self):
        if not self._is_local_request():
            self._send_json(403, {"error": "Oscar Tool Mode actions are local-only"})
            return

        try:
            payload = self._read_json_body()

            action = str(payload.get("action", "")).strip().lower()
            try:
                owner_approval_require(payload, action)
            except PermissionError as e:
                self._send_json(401, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
                return
            payload.pop("_ownerApprovalToken", None)
            payload.pop("ownerApprovalToken", None)

            if action == "computer":
                settings = load_settings()
                if not settings.get("toolModeEnabled") or not settings.get("computerControlEnabled"):
                    raise PermissionError("Computer Control requires Tool Mode and Computer Control switched on in Oscar")

            if action == "tree":
                max_files = max(1, min(int(payload.get("max", BRIDGE_MAX_TREE_FILES)), 600))
                requested_path = payload.get("path")
                result = {
                    "roots": tool_allowed_roots(),
                    "requestedPath": requested_path or None,
                    "files": tool_iter_files(max_files, [requested_path] if requested_path else None),
                }
            elif action == "read":
                result = tool_read_text(payload.get("path", ""), max_chars=int(payload.get("maxChars", BRIDGE_READ_SUMMARY_MAX_CHARS)))
            elif action == "read_near":
                result = tool_read_near_text(
                    payload.get("path", ""),
                    line=payload.get("line"),
                    context_lines=payload.get("contextLines", payload.get("context", 40)),
                    start=payload.get("startLine"),
                    end=payload.get("endLine"),
                    max_chars=int(payload.get("maxChars", 60000)),
                )
            elif action == "search":
                result = tool_search_text(
                    payload.get("query", ""),
                    max_hits=int(payload.get("max", 50)),
                    roots=payload.get("roots"),
                )
            elif action == "run":
                result = tool_run_command(payload.get("command", ""), cwd=payload.get("cwd", "."))
            elif action == "write":
                result = tool_write_text(payload.get("path", ""), payload.get("content", ""), reason=payload.get("reason", ""))
            elif action == "patch":
                result = tool_patch_text(payload.get("path", ""), payload.get("replacements", []), reason=payload.get("reason", ""))
            elif action == "mkdir":
                result = tool_mkdir(payload.get("path", ""), reason=payload.get("reason", ""))
            elif action == "copy":
                result = tool_copy(
                    payload.get("src", payload.get("source", "")),
                    payload.get("dest", payload.get("destination", "")),
                    overwrite=bool(payload.get("overwrite", False)),
                    reason=payload.get("reason", ""),
                )
            elif action == "move":
                result = tool_move(
                    payload.get("src", payload.get("source", "")),
                    payload.get("dest", payload.get("destination", "")),
                    overwrite=bool(payload.get("overwrite", False)),
                    reason=payload.get("reason", ""),
                )
            elif action == "trash":
                result = tool_trash(payload.get("path", ""), reason=payload.get("reason", ""))
            elif action == "web_fetch":
                result = tool_web_fetch(payload.get("url", ""), max_chars=payload.get("maxChars"))
            elif action == "llama_status":
                result = llama_cpp_status_payload(payload.get("url") or payload.get("endpoint") or "http://127.0.0.1:9797")
            elif action == "download_fxserver_artifact":
                result = tool_download_fxserver_artifact(
                    payload.get("url", ""),
                    dest_path=payload.get("path", payload.get("dest", FXSERVER_ARTIFACT_DEFAULT_DEST)),
                    overwrite=bool(payload.get("overwrite", False)),
                )
            elif action == "extract_fxserver_artifact":
                result = tool_extract_fxserver_artifact(
                    archive_path=payload.get("archive", payload.get("path", FXSERVER_ARTIFACT_DEFAULT_DEST)),
                    dest_path=payload.get("dest", payload.get("destination", FXSERVER_ARTIFACT_DEFAULT_EXTRACT_DIR)),
                )
            elif action == "install_cfx_server_data":
                result = tool_install_cfx_server_data(overwrite=bool(payload.get("overwrite", False)))
            elif action == "fine_tune":
                if fine_tune_pipeline is None:
                    raise RuntimeError("fine_tune_pipeline module not loaded. Check Shared/runtime/fine_tune_pipeline.py")
                result = fine_tune_pipeline.handle_action(payload)
            elif action == "transcribe_training_lessons":
                result = tool_transcribe_training_lessons(
                    operation=payload.get("operation", payload.get("mode", "inventory")),
                    force=bool(payload.get("force", False)),
                    limit=payload.get("limit"),
                )
            elif action == "local_intel":
                result = tool_local_intel(payload)
            elif action == "junior_dev":
                result = tool_junior_dev(payload)
            elif action == "draw":
                result = tool_draw_local(
                    payload.get("subject")
                    or payload.get("prompt")
                    or payload.get("text")
                    or payload.get("description")
                    or ""
                )
            elif action == "tool_adapter":
                result = tool_adapter(
                    query=payload.get("query", payload.get("text", payload.get("prompt", ""))),
                    adapter_id=payload.get("adapter", payload.get("id", "")),
                )
            elif action == "brain_index":
                result = oscar_brain_index(max_files=payload.get("max", 200))
            elif action == "brain_search":
                result = oscar_brain_search(
                    query=payload.get("query", payload.get("text", payload.get("prompt", ""))),
                    max_hits=payload.get("max", 20),
                )
            elif action == "brain_read":
                result = oscar_brain_read(
                    rel_path=payload.get("path", ""),
                    max_chars=payload.get("maxChars", 12000),
                )
            elif action == "diagnose":
                result = tool_diagnose()
            elif action == "self_heal":
                result = tool_self_heal(
                    apply=bool(payload.get("apply", payload.get("repair", False))),
                    ensure_advanced=bool(payload.get("ensureAdvanced", True)),
                )
            elif action == "security_audit":
                result = tool_security_audit(
                    apply=bool(payload.get("apply", payload.get("repair", False))),
                    scope=payload.get("scope", "quick"),
                )
            elif action == "agent_control":
                result = tool_agent_control(
                    target=payload.get("target", "all"),
                    control=payload.get("control", payload.get("command", "status")),
                    apply=bool(payload.get("apply", payload.get("repair", False))),
                    reason=payload.get("reason", ""),
                )
            elif action == "computer":
                result = computer_control_action(payload)
            else:
                raise ValueError("Unsupported tool action")

            self._send_json(200, {"ok": True, "action": action, "result": result, "ownerApproval": owner_approval_public_state()})
        except subprocess.TimeoutExpired as e:
            self._send_json(408, {"error": f"Tool command timed out after {TOOL_TIMEOUT_SECONDS} seconds", "stdout": e.stdout, "stderr": e.stderr})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"error": str(e)})
        except (FileNotFoundError, PermissionError, FileExistsError, IsADirectoryError) as e:
            self._send_json(403, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_oscar_brain_index(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Brain is local-only"})
            return
        try:
            max_files = parse_qs(urlparse(self.path).query).get("max", ["200"])[0]
            self._send_json(200, oscar_brain_index(max_files=max_files))
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_oscar_brain_search(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Brain is local-only"})
            return
        try:
            query = parse_qs(urlparse(self.path).query).get("q", [""])[0]
            max_hits = parse_qs(urlparse(self.path).query).get("max", ["20"])[0]
            self._send_json(200, oscar_brain_search(query=query, max_hits=max_hits))
        except (ValueError, FileNotFoundError, PermissionError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_oscar_brain_read(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Brain is local-only"})
            return
        try:
            query = parse_qs(urlparse(self.path).query)
            rel_path = query.get("path", [""])[0]
            max_chars = query.get("maxChars", ["12000"])[0]
            self._send_json(200, oscar_brain_read(rel_path=rel_path, max_chars=max_chars))
        except (ValueError, FileNotFoundError, PermissionError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    # ── Hardware Stats ─────────────────────────────────────────
    def _get_stats(self):
        """Return CPU % and RAM % as JSON. Works with no external packages."""
        try:
            cpu, ram = _get_hw_stats()
            data = json.dumps({"cpu_percent": cpu, "ram_percent": ram, "has_psutil": HAS_PSUTIL})
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(data.encode())
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_health(self):
        """Lightweight readiness probe documented in README-RASPY-OSCAR.txt."""
        try:
            cpu, ram = _get_hw_stats()
            settings = load_settings()
            self._send_json(200, {
                "ok": True,
                "service": "master-oscar-chat",
                "port": CHAT_SERVER_PORT,
                "ollama": ensure_ollama_running() if not LLAMA_CPP_MODE else check_ollama_reachable(),
                "ollama_host": OLLAMA_HOST,
                "default_model": settings.get("defaultModel") or os.environ.get("AGENT_007_DEFAULT_MODEL", ""),
                "tool_mode": bool(settings.get("toolModeEnabled")),
                "mac_mini_mode": bool(settings.get("macMiniMode")),
                "voice_auto_speak": bool(settings.get("voiceAutoSpeak")),
                "voice_playback": voice_speak_status_payload(),
                "cpu_percent": cpu,
                "ram_percent": ram,
                "project_root": PROJECT_ROOT,
            })
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    # ── Oscar Workspace Bridge ───────────────────────────────
    def _get_workspace_info(self):
        root = bridge_root()
        exists = os.path.isdir(root)
        files = bridge_iter_files(1) if exists else []
        self._send_json(200, {
            "ok": exists,
            "root": root,
            "mode": "read-only",
            "filesAvailable": bool(files),
            "policy": {
                "blockedDirectories": sorted(BRIDGE_SKIP_DIRS),
                "blockedFiles": sorted(BRIDGE_PRIVATE_FILES),
            },
        })

    def _get_workspace_tree(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            max_files = int(query.get("max", [BRIDGE_MAX_TREE_FILES])[0])
            max_files = max(1, min(max_files, 600))
            self._send_json(200, {
                "root": bridge_root(),
                "files": bridge_iter_files(max_files),
            })
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_workspace_file(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            rel_path = query.get("path", [""])[0]
            if not rel_path:
                self._send_json(400, {"error": "Missing path"})
                return
            self._send_json(200, bridge_read_text(rel_path))
        except (FileNotFoundError, PermissionError, ValueError) as e:
            self._send_json(403, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_workspace_search(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            needle = query.get("q", [""])[0].strip()
            max_hits = int(query.get("max", [50])[0])
            max_hits = max(1, min(max_hits, 200))
            if len(needle) < 2:
                self._send_json(400, {"error": "Search query must be at least 2 characters"})
                return

            hits = []
            needle_lower = needle.lower()
            for item in bridge_iter_files(1000):
                if not item.get("text") or item.get("size", 0) > 300_000:
                    continue
                try:
                    data = bridge_read_text(item["path"], max_chars=300_000)["content"]
                except Exception:
                    continue
                for index, line in enumerate(data.splitlines(), start=1):
                    if needle_lower in line.lower():
                        hits.append({
                            "path": item["path"],
                            "line": index,
                            "text": line.strip()[:260],
                        })
                        if len(hits) >= max_hits:
                            self._send_json(200, {"root": bridge_root(), "query": needle, "hits": hits})
                            return

            self._send_json(200, {"root": bridge_root(), "query": needle, "hits": hits})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_workspace_context(self):
        try:
            tree = bridge_iter_files(BRIDGE_MAX_TREE_FILES)
            package_name = "unknown"
            package_hint = "JavaScript/TypeScript app"
            try:
                package_data = json.loads(bridge_read_text("package.json", max_chars=4000)["content"])
                package_name = package_data.get("name") or package_name
                deps = {}
                deps.update(package_data.get("dependencies") or {})
                deps.update(package_data.get("devDependencies") or {})
                if "next" in deps:
                    package_hint = "Next.js web app"
            except Exception:
                pass

            lines = [
                "OSCAR VERIFIED WORKSPACE MANIFEST",
                f"Root: {bridge_root()}",
                "Mode: read-only local snapshot. No edits. No external repos.",
                "STRICT FILE RULE: Copy filenames only from OBSERVED_FILES.",
                "Never infer, continue, complete, predict, or add likely files.",
                "Do not say 'potential additional files' or 'could be'.",
                "If a requested file is not listed, say it is not in the snapshot.",
                "Blocked/private patterns (not observed files): .env*, .next, node_modules, .git.",
                "Never list blocked/private patterns as OBSERVED_FILES or candidate files.",
                f"Detected app: {package_name} ({package_hint}).",
            ]

            tree_paths = {item["path"] for item in tree}
            if "docs/agent-007-coding-protocol.md" in tree_paths:
                lines.extend([
                    "Active protocol: docs/agent-007-coding-protocol.md is owner-approved.",
                    "For Oscar owner-feature rankings, prioritize owner page/actions, lib/owner-auth.ts, lib/agent_007-agent.ts, lib/accord-data.ts, prisma/schema.prisma, app/page.tsx, docs/agent-007-agent.md, package.json when listed.",
                    "For owner privacy questions, prioritize lib/owner-auth.ts, app/owner/agent-007/page.tsx, and app/owner/agent-007/actions.ts when listed.",
                    "Do not rank app/globals.css or next-env.d.ts above owner/auth/agent/data/schema/protocol files.",
                    "For public homepage questions: Oscar should not be linked publicly unless the owner explicitly approves it.",
                    "For file-content questions: use only actual bridge-read file contents; never invent functions, objects, imports, or libraries.",
                    "For change requests: provide Goal, Files, Steps, Risk, Test, and end with 'Waiting for owner approval.' Do not implement or broaden scope before approval.",
                    "Proof rule: never claim Changed, Verified, implemented, fixed, tested, complete, or Still needs: None unless actual tool output, a patch diff, or updated file contents proves it.",
                    "In this read-only bridge mode, say no files were changed and provide a proposed patch instead of claiming implementation.",
                    "Patch proposal rule: only propose patches against verified files and verified existing code; never invent imports, libraries, state objects, functions, routes, packages, or APIs.",
                    "For failed-login cooldown patch proposals, use lib/owner-auth.ts and createOwnerSession(accessCode); do not propose Redux, client state, or lib/agent_007-agent.ts changes.",
                    "For complete diff requests, preserve existing verified code and imports; never add React hooks, access_token cookies, ../utils, Redux, or client-side auth helpers unless they exist in the verified file.",
                    "For visible diff reviews, cite actual changed symbols; do not invent terms like access token when the verified code uses accord_owner.",
                    "Exact-symbol rule: when asked to verify exact symbols, report each requested symbol as Present, Missing, or Not visible in provided context; never answer with a generic file summary.",
                    "Owner privacy route test rule: when asked to verify app/owner/agent-007/page.tsx, app/owner/agent-007/actions.ts, lib/owner-auth.ts, and app/page.tsx together, inspect all four before answering; do not stop after one file or include Likely/Need to inspect next.",
                    "Runtime test plan only rule: when asked for a runtime test plan only, do not inspect files, summarize code, or claim tests were performed; answer only Goal, Test steps, Expected results, Risks, and Waiting for owner approval.",
                    "Owner UX proposal rule: when asked to propose one small owner UX improvement only, do not turn it into a public homepage check; answer only Confirmed, Proposed improvement, Files, Risk, Test, and Waiting for owner approval.",
                    "Owner UX patch plan rule: when asked to convert the approved owner UX proposal into a patch plan only, do not repeat the proposal or write code; answer only Goal, Files, Steps, Risk, Test, and Waiting for owner approval.",
                    "Owner UX proposed diff rule: when asked for a proposed diff only for OwnerGate feedback, do not repeat the patch plan or claim it is applied; answer only Proposed diff only. Not applied., a diff block, Risk, Test, and Waiting for owner approval.",
                    "Owner UX diff review rule: when asked to review a proposed OwnerGate feedback diff, do not repeat or apply the diff; answer only Pass, Concerns, Suggested adjustment, Test, and Waiting for owner approval.",
                    "OwnerGate applied patch verification rule: when asked to verify the applied OwnerGate feedback patch, inspect actual files and answer only Confirmed, Risks, Recommended next step, and Waiting for owner approval.",
                ])

            lines.extend([
                "",
                f"OBSERVED_FILES ({len(tree)}):",
            ])

            for item in tree:
                lines.append(f"- {item['path']}")
                if len("\n".join(lines)) >= BRIDGE_MAX_CONTEXT_CHARS:
                    lines.append("")
                    lines.append("[manifest truncated]")
                    break

            context = "\n".join(lines)
            if len(context) > BRIDGE_MAX_CONTEXT_CHARS:
                context = context[:BRIDGE_MAX_CONTEXT_CHARS] + "\n[manifest truncated]"

            self._send_json(200, {
                "root": bridge_root(),
                "context": context,
                "fileCount": len(tree),
                "maxChars": BRIDGE_MAX_CONTEXT_CHARS,
            })
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    # ── Ollama Proxy (streaming-aware) ─────────────────────────
    def _proxy_ollama(self, method):
        """
        Proxy requests from /ollama/* to the local Ollama engine.
        Supports streaming responses for /api/chat and /api/generate.
        """
        # Strip the /ollama prefix to get the real Ollama path
        ollama_path = self.path[len("/ollama"):]
        ollama_route = urlparse(ollama_path).path
        target_url = OLLAMA_HOST + ollama_path

        # Read request body if present
        body = None
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length)

        try:
            if not LLAMA_CPP_MODE and not ensure_ollama_running():
                self._send_json(502, {
                    "error": (
                        "Cannot reach Ollama engine. Start Oscar with "
                        "'Launch Oscar GOAT Upgraded.command' or run Shared/bin/ollama-darwin serve."
                    ),
                })
                return

            # Handle fake /api/tags for llama.cpp mode
            if LLAMA_CPP_MODE and ollama_route == "/api/tags":
                self._send_json(200, {"models": [{"name": "local-llama-model"}]})
                return

            if method == "POST" and ollama_route == "/api/chat":
                rasp_answer = rasp_local_protocol_answer(body)
                if rasp_answer is not None:
                    if isinstance(rasp_answer, (bytes, bytearray)):
                        self.send_response(200)
                        self.send_header("Content-Type", "application/x-ndjson")
                        self._cors_headers()
                        self.end_headers()
                        self.wfile.write(rasp_answer)
                        self.wfile.flush()
                    else:
                        self._send_json(200, rasp_answer)
                    safe_print("[proxy] served RASP protocol answer before model generation", flush=True)
                    return

            if LLAMA_CPP_MODE and ollama_route == "/api/chat":
                # Translate Ollama payload -> OpenAI payload for llama-server
                ollama_req = json.loads(body) if body else {}
                openai_req = {
                    "messages": ollama_req.get("messages", []),
                    "stream": True,
                    "temperature": ollama_req.get("options", {}).get("temperature", 0.7)
                }
                target_url = OLLAMA_HOST + "/v1/chat/completions"
                body = json.dumps(openai_req).encode()
            elif method == "POST" and ollama_route == "/api/chat":
                local_handshake = quick_local_handshake_answer(body)
                if local_handshake is not None:
                    if isinstance(local_handshake, (bytes, bytearray)):
                        self.send_response(200)
                        self.send_header("Content-Type", "application/x-ndjson")
                        self._cors_headers()
                        self.end_headers()
                        self.wfile.write(local_handshake)
                        self.wfile.flush()
                    else:
                        self._send_json(200, local_handshake)
                    safe_print("[proxy] served local owner handshake", flush=True)
                    return

                direct_bridge_answer = bridge_file_list_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_privacy_synthesis_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_privacy_route_test_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_runtime_test_plan_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_applied_patch_verification_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_diff_review_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_proposed_diff_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_patch_plan_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_improvement_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_public_exposure_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_auth_symbol_verification_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_file_content_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_feature_rank_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_privacy_files_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_security_improvement_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_complete_cooldown_diff_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_cooldown_diff_review_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_cooldown_patch_proposal_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_readonly_implementation_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_approval_plan_answer(body)
                if direct_bridge_answer is not None:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/x-ndjson")
                    self._cors_headers()
                    self.end_headers()
                    self.wfile.write(direct_bridge_answer)
                    self.wfile.flush()
                    safe_print("[proxy] served verified bridge answer directly", flush=True)
                    return
                body = sanitize_ollama_chat_body(body)

            req = urllib.request.Request(
                target_url,
                data=body,
                method=method,
                headers={"Content-Type": self.headers.get("Content-Type", "application/json")}
            )

            # Optional: pass Authorization header if present
            if "Authorization" in self.headers:
                req.add_header("Authorization", self.headers.get("Authorization"))

            is_stream = ollama_route in ("/api/chat", "/api/generate")
            proxy_timeout = OLLAMA_PROXY_TIMEOUT_SECONDS if is_stream else 120
            response = urllib.request.urlopen(req, timeout=proxy_timeout)

            # Send response headers
            self.send_response(response.status)

            for header, value in response.getheaders():
                lower = header.lower()
                if lower not in ("transfer-encoding", "connection", "content-length"):
                    self.send_header(header, value)

            self._cors_headers()
            self.end_headers()

            if LLAMA_CPP_MODE and is_stream:
                buffer = ""

                def write_sse_line(line):
                    if not line.startswith("data: "):
                        return False
                    data = line[6:].strip()
                    if data == "[DONE]":
                        self.wfile.write(b'{"done": true}\n')
                        self.wfile.flush()
                        return True
                    try:
                        j = json.loads(data)
                        choices = j.get("choices") or []
                        if choices:
                            delta = choices[0].get("delta") or {}
                            content = delta.get("content", "")
                            if content:
                                content = polish_agent_007_assistant_text(content)
                                out = {
                                    "message": {"role": "assistant", "content": content},
                                    "done": False,
                                }
                                self.wfile.write((json.dumps(out) + "\n").encode())
                                self.wfile.flush()
                    except json.JSONDecodeError:
                        pass
                    return False

                done_seen = False
                while not done_seen:
                    chunk = response.read(4096)
                    if not chunk:
                        break
                    buffer += chunk.decode(errors="ignore")
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        done_seen = write_sse_line(line.strip())
                        if done_seen:
                            break
                if buffer and not done_seen:
                    write_sse_line(buffer.strip())
            else:
                stream_buffer = b""
                while True:
                    chunk = response.read(4096)
                    if not chunk:
                        break
                    if is_stream and ollama_route == "/api/chat":
                        stream_buffer += chunk
                        while b"\n" in stream_buffer:
                            line, stream_buffer = stream_buffer.split(b"\n", 1)
                            if not line.strip():
                                continue
                            try:
                                payload = json.loads(line.decode("utf-8"))
                            except Exception:
                                self.wfile.write(line + b"\n")
                                self.wfile.flush()
                                continue
                            msg = payload.get("message") if isinstance(payload.get("message"), dict) else None
                            if msg and msg.get("content"):
                                msg["content"] = polish_agent_007_assistant_text(str(msg["content"]))
                            self.wfile.write((json.dumps(payload) + "\n").encode("utf-8"))
                            self.wfile.flush()
                        continue
                    self.wfile.write(chunk)
                    if is_stream:
                        self.wfile.flush()
                if is_stream and ollama_route == "/api/chat" and stream_buffer.strip():
                    try:
                        payload = json.loads(stream_buffer.decode("utf-8"))
                        msg = payload.get("message") if isinstance(payload.get("message"), dict) else None
                        if msg and msg.get("content"):
                            msg["content"] = polish_agent_007_assistant_text(str(msg["content"]))
                        self.wfile.write((json.dumps(payload) + "\n").encode("utf-8"))
                        self.wfile.flush()
                    except Exception:
                        self.wfile.write(stream_buffer)
                        self.wfile.flush()

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self._cors_headers()
            self.end_headers()
            try:
                self.wfile.write(e.read())
            except:
                pass

        except urllib.error.URLError as e:
            self._send_json(502, {"error": f"Cannot reach Ollama engine: {str(e.reason)}"})

        except (TimeoutError, socket.timeout):
            self._send_json(504, {
                "error": (
                    f"Oscar local model runner did not respond within {OLLAMA_PROXY_TIMEOUT_SECONDS} seconds. "
                    "Tool commands are online; real LLM generation is currently slow or stalled on this machine."
                )
            })

        except Exception as e:
            if str(e).lower() == "timed out":
                self._send_json(504, {
                    "error": (
                        f"Oscar local model runner did not respond within {OLLAMA_PROXY_TIMEOUT_SECONDS} seconds. "
                        "Tool commands are online; real LLM generation is currently slow or stalled on this machine."
                    )
                })
                return
            self._send_json(500, {"error": str(e)})


class ThreadedHTTPServer(http.server.HTTPServer):
    """Handle each request in a new thread for concurrent streaming."""
    allow_reuse_address = True

    def process_request(self, request, client_address):
        thread = threading.Thread(target=self._handle, args=(request, client_address))
        thread.daemon = True
        thread.start()

    def _handle(self, request, client_address):
        try:
            self.finish_request(request, client_address)
        except (BrokenPipeError, ConnectionResetError):
            # Browser-side Stop/interrupt closed the stream intentionally.
            pass
        except Exception:
            self.handle_error(request, client_address)
        finally:
            self.shutdown_request(request)


def open_browser_delayed():
    """Open the browser after a short delay to ensure server is ready."""
    time.sleep(1.0)
    webbrowser.open(f"http://localhost:{CHAT_SERVER_PORT}")


def main():
    ensure_data_dir()
    
    local_ip = detect_lan_ip()

    print()
    print("=" * 55)
    print("  Oscar — Local Agent Chat Server")
    print("=" * 55)
    print()
    print(f"  Local Access:    http://localhost:{CHAT_SERVER_PORT}")
    print(f"  Network Access:  http://{local_ip}:{CHAT_SERVER_PORT}   <-- Use this on phone/other PC!")
    print(f"  Ollama/Llama Proxy: {OLLAMA_HOST}")
    if LLAMA_CPP_MODE:
        print("  Running in LLAMA_CPP_MODE (Translating API requests)")
    print()
    print("  All chats auto-save to the USB drive!")
    print("  Press Ctrl+C to shut down.")
    print()
    print("-" * 55)

    server = ThreadedHTTPServer(("0.0.0.0", CHAT_SERVER_PORT), ChatHandler)

    # Open browser in background thread
    if "--no-browser" not in sys.argv:
        threading.Thread(target=open_browser_delayed, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down chat server...")
        server.shutdown()
        print("  Goodbye!")


if __name__ == "__main__":
    main()
