"""
Oscar Voice Library — register owner-approved reference voices for preview and read-aloud.
Stores metadata on the USB drive; audio files are copied or symlinked into voice_library/.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VOICE_LIBRARY_DIR = os.path.join(SCRIPT_DIR, "voice_library")
VOICE_LIBRARY_FILE = os.path.join(VOICE_LIBRARY_DIR, "library.json")
VOICE_SPEAK_CACHE_DIR = os.path.join(VOICE_LIBRARY_DIR, "speak_cache")
VOICE_SPEAK_CACHE_TTL_SEC = 3600

SLUG_RE = re.compile(r"[^a-z0-9]+")

DEFAULT_BOOTSTRAP_VOICES = [
    {
        "id": "raspy",
        "name": "Raspy (You)",
        "sourcePath": "/Volumes/LLMs/Voiceovers/Moor LF 1/Bounced Files/Moor LF 1.wav",
        "isDefault": True,
        "ownerApproved": True,
        "macSayVoice": "Alex",
        "rate": 1.02,
        "pitch": 1.0,
        "notes": "Primary owner reference — Moor LF 1 bounce.",
    },
    {
        "id": "ic_lf_1",
        "name": "IC LF 1",
        "sourcePath": "/Volumes/LLMs/Voiceovers/IC LF 1/Bounced Files/IC LF 1.wav",
        "isDefault": False,
        "ownerApproved": True,
        "macSayVoice": "Alex",
        "rate": 1.0,
        "pitch": 1.0,
        "notes": "IC LF 1 voiceover reference.",
    },
    {
        "id": "nationality_6",
        "name": "Nationality 6",
        "sourcePath": "/Volumes/LLMs/Voiceovers/Nationality 6/Bounced Files/Nationality 6.wav",
        "isDefault": False,
        "ownerApproved": True,
        "macSayVoice": "Alex",
        "rate": 0.98,
        "pitch": 0.95,
        "notes": "Nationality 6 voiceover reference.",
    },
]


def _ensure_dirs():
    os.makedirs(VOICE_LIBRARY_DIR, exist_ok=True)
    os.makedirs(VOICE_SPEAK_CACHE_DIR, exist_ok=True)


def _empty_library():
    return {"version": 1, "defaultVoiceId": None, "voices": []}


def load_library():
    _ensure_dirs()
    if not os.path.isfile(VOICE_LIBRARY_FILE):
        return _empty_library()
    try:
        with open(VOICE_LIBRARY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return _empty_library()
    if not isinstance(data, dict):
        return _empty_library()
    data.setdefault("version", 1)
    data.setdefault("voices", [])
    data.setdefault("defaultVoiceId", None)
    if not isinstance(data["voices"], list):
        data["voices"] = []
    return data


def save_library(data):
    _ensure_dirs()
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp-voice-lib-", suffix=".json", dir=VOICE_LIBRARY_DIR)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, VOICE_LIBRARY_FILE)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def slugify(value, fallback="voice"):
    slug = SLUG_RE.sub("_", str(value or "").strip().lower()).strip("_")
    return slug[:48] or fallback


def _voice_by_id(data, voice_id):
    for voice in data.get("voices", []):
        if voice.get("id") == voice_id:
            return voice
    return None


def _ext_for_path(path):
    ext = os.path.splitext(path)[1].lower()
    return ext if ext in {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus"} else ".wav"


def _link_or_copy_audio(source_path, dest_path):
    if os.path.isfile(dest_path):
        return dest_path
    if not os.path.isfile(source_path):
        raise FileNotFoundError(f"Source audio not found: {source_path}")
    try:
        if os.path.lexists(dest_path):
            os.remove(dest_path)
        os.symlink(source_path, dest_path)
        return dest_path
    except OSError:
        shutil.copy2(source_path, dest_path)
        return dest_path


def register_voice(
    *,
    name,
    source_path=None,
    upload_path=None,
    voice_id=None,
    is_default=False,
    owner_approved=True,
    mac_say_voice="Alex",
    rate=1.0,
    pitch=1.0,
    notes="",
):
    _ensure_dirs()
    data = load_library()
    clean_name = str(name or "").strip() or "Custom Voice"
    vid = slugify(voice_id or clean_name)
    existing = _voice_by_id(data, vid)
    if existing and not (source_path or upload_path):
        if is_default:
            data["defaultVoiceId"] = vid
            save_library(data)
        return existing

    if upload_path:
        ext = _ext_for_path(upload_path)
        audio_file = f"{vid}{ext}"
        dest = os.path.join(VOICE_LIBRARY_DIR, audio_file)
        shutil.copy2(upload_path, dest)
        resolved_source = upload_path
    elif source_path:
        ext = _ext_for_path(source_path)
        audio_file = f"{vid}{ext}"
        dest = os.path.join(VOICE_LIBRARY_DIR, audio_file)
        _link_or_copy_audio(os.path.abspath(source_path), dest)
        resolved_source = os.path.abspath(source_path)
    elif existing:
        resolved_source = existing.get("sourcePath")
        audio_file = existing.get("audioFile")
    else:
        raise ValueError("Provide source_path or upload_path for a new voice.")

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    entry = {
        "id": vid,
        "name": clean_name,
        "audioFile": audio_file,
        "sourcePath": resolved_source,
        "ownerApproved": bool(owner_approved),
        "macSayVoice": str(mac_say_voice or "Alex"),
        "rate": float(rate or 1.0),
        "pitch": float(pitch or 1.0),
        "notes": str(notes or "").strip(),
        "updatedAt": now,
    }
    if existing:
        entry["createdAt"] = existing.get("createdAt", now)
        data["voices"] = [v for v in data["voices"] if v.get("id") != vid]
    else:
        entry["createdAt"] = now
    data["voices"].append(entry)
    if is_default or not data.get("defaultVoiceId"):
        data["defaultVoiceId"] = vid
    save_library(data)
    return entry


def remove_voice(voice_id):
    data = load_library()
    voice = _voice_by_id(data, voice_id)
    if not voice:
        return False
    audio_path = voice_audio_path(voice)
    data["voices"] = [v for v in data["voices"] if v.get("id") != voice_id]
    if data.get("defaultVoiceId") == voice_id:
        data["defaultVoiceId"] = data["voices"][0]["id"] if data["voices"] else None
    save_library(data)
    if audio_path and os.path.isfile(audio_path) and VOICE_LIBRARY_DIR in os.path.abspath(audio_path):
        try:
            os.remove(audio_path)
        except OSError:
            pass
    return True


def voice_audio_path(voice):
    if not voice:
        return None
    audio_file = voice.get("audioFile")
    if not audio_file:
        return None
    return os.path.join(VOICE_LIBRARY_DIR, audio_file)


def public_voice_entry(voice):
    if not voice:
        return None
    audio_path = voice_audio_path(voice)
    return {
        "id": voice.get("id"),
        "name": voice.get("name"),
        "ownerApproved": bool(voice.get("ownerApproved")),
        "macSayVoice": voice.get("macSayVoice", "Alex"),
        "rate": voice.get("rate", 1.0),
        "pitch": voice.get("pitch", 1.0),
        "notes": voice.get("notes", ""),
        "isDefault": False,
        "hasAudio": bool(audio_path and os.path.isfile(audio_path)),
        "audioUrl": f"/api/voice/library/{voice.get('id')}/audio",
        "previewUrl": f"/api/voice/library/{voice.get('id')}/audio",
        "createdAt": voice.get("createdAt"),
        "updatedAt": voice.get("updatedAt"),
    }


def library_payload():
    data = load_library()
    default_id = data.get("defaultVoiceId")
    voices = []
    for voice in data.get("voices", []):
        entry = public_voice_entry(voice)
        if entry:
            entry["isDefault"] = entry["id"] == default_id
            voices.append(entry)
    voices.sort(key=lambda item: (not item.get("isDefault"), item.get("name", "").lower()))
    return {
        "ok": True,
        "defaultVoiceId": default_id,
        "defaultSpeechVoiceName": f"custom:{default_id}" if default_id else None,
        "voices": voices,
        "voiceCount": len(voices),
        "libraryPath": VOICE_LIBRARY_DIR,
    }


def bootstrap_default_voices(force=False):
    data = load_library()
    if data.get("voices") and not force:
        return library_payload()
    for spec in DEFAULT_BOOTSTRAP_VOICES:
        source = spec.get("sourcePath")
        if not source or not os.path.isfile(source):
            continue
        try:
            register_voice(
                name=spec["name"],
                voice_id=spec["id"],
                source_path=source,
                is_default=bool(spec.get("isDefault")),
                owner_approved=bool(spec.get("ownerApproved", True)),
                mac_say_voice=spec.get("macSayVoice", "Alex"),
                rate=spec.get("rate", 1.0),
                pitch=spec.get("pitch", 1.0),
                notes=spec.get("notes", ""),
            )
        except (OSError, ValueError):
            continue
    return library_payload()


def set_default_voice(voice_id):
    data = load_library()
    if not _voice_by_id(data, voice_id):
        raise ValueError(f"Unknown voice id: {voice_id}")
    data["defaultVoiceId"] = voice_id
    save_library(data)
    return library_payload()


def cleanup_speak_cache():
    if not os.path.isdir(VOICE_SPEAK_CACHE_DIR):
        return
    cutoff = time.time() - VOICE_SPEAK_CACHE_TTL_SEC
    for name in os.listdir(VOICE_SPEAK_CACHE_DIR):
        path = os.path.join(VOICE_SPEAK_CACHE_DIR, name)
        try:
            if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
                os.remove(path)
        except OSError:
            pass


def _aiff_to_wav(aiff_path):
    """Browsers (especially Chrome) often cannot play AIFF in <audio>; convert to WAV."""
    wav_path = os.path.splitext(aiff_path)[0] + ".wav"
    if os.path.isfile(wav_path) and os.path.getmtime(wav_path) >= os.path.getmtime(aiff_path):
        return wav_path
    afconvert = "/usr/bin/afconvert"
    if os.path.isfile(afconvert):
        proc = subprocess.run(
            [afconvert, "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if proc.returncode == 0 and os.path.isfile(wav_path):
            try:
                os.remove(aiff_path)
            except OSError:
                pass
            return wav_path
    try:
        import shutil

        ffmpeg = shutil.which("ffmpeg")
        if ffmpeg:
            proc = subprocess.run(
                [ffmpeg, "-y", "-i", aiff_path, wav_path],
                capture_output=True,
                text=True,
                timeout=60,
            )
            if proc.returncode == 0 and os.path.isfile(wav_path):
                try:
                    os.remove(aiff_path)
                except OSError:
                    pass
                return wav_path
    except Exception:
        pass
    return aiff_path


def mac_say_to_wav(text, voice_name="Alex", rate=200):
    import platform

    if platform.system() != "Darwin":
        raise RuntimeError("Mac say synthesis is only available on macOS.")
    spoken = re.sub(r"\s+", " ", str(text or "")).strip()
    if not spoken:
        raise ValueError("No text to speak.")
    spoken = spoken[:1200]
    cleanup_speak_cache()
    aiff_token = f"{uuid.uuid4().hex}.aiff"
    aiff_path = os.path.join(VOICE_SPEAK_CACHE_DIR, aiff_token)
    cmd = ["say", "-o", aiff_path]
    if voice_name:
        cmd.extend(["-v", str(voice_name)])
    try:
        rate_int = max(80, min(360, int(float(rate) * 200)))
    except (TypeError, ValueError):
        rate_int = 200
    cmd.extend(["-r", str(rate_int), spoken])
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    if proc.returncode != 0 or not os.path.isfile(aiff_path):
        raise RuntimeError(proc.stderr.strip() or "say command failed")
    out_path = _aiff_to_wav(aiff_path)
    token = os.path.basename(out_path)
    return out_path, token


def synthesize_custom_voice(voice_id, text, rate_multiplier=1.0):
    data = load_library()
    voice = _voice_by_id(data, voice_id)
    if not voice:
        raise ValueError(f"Unknown voice id: {voice_id}")
    try:
        rate = float(voice.get("rate", 1.0) or 1.0) * float(rate_multiplier or 1.0)
    except (TypeError, ValueError):
        rate = float(voice.get("rate", 1.0) or 1.0)
    rate = max(0.5, min(2.0, rate))
    out_path, token = mac_say_to_wav(
        text,
        voice_name=voice.get("macSayVoice") or "Alex",
        rate=rate,
    )
    return {
        "ok": True,
        "voiceId": voice_id,
        "voiceName": voice.get("name"),
        "mode": "mac-say-styled",
        "audioUrl": f"/api/voice/speak-output/{token}",
        "chars": len(text or ""),
        "path": out_path,
    }