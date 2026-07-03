"""
GOAT Production Bridge
Epic / Unreal / MetaHuman / Final Cut Pro handoff for GOAT video & audio studios.
Photo → motion video (Ken Burns + optional live capture) without cloning third-party UIs.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

APP_ROOT = Path(__file__).resolve().parents[1]
PRODUCTION_ROOT = APP_ROOT / "web-app" / "production"
LIVE_VIDEO_DIR = PRODUCTION_ROOT / "live-video"
FCP_EXPORT_DIR = PRODUCTION_ROOT / "fcp-export"
UNREAL_HANDOFF_DIR = PRODUCTION_ROOT / "unreal-handoff"
TWINMOTION_HANDOFF_DIR = PRODUCTION_ROOT / "twinmotion-handoff"
OSCILLATOR_GRAPHICS_URL = os.environ.get("OSCAR_GRAPHICS_URL", "http://127.0.0.1:3344")

EPIC_UE_INSTALLER_DMG = Path(
    "/Volumes/LLMs/MAIN OSCAR/Mac/EpicInstaller-19.2.3-unrealEngine-7e1c281229b445a0b78e98ae17f54f3d.dmg"
)
TWINMOTION_APP = Path("/Volumes/LLMs/Twinmotion2026.1/Twinmotion.app")
TWINMOTION_PROJECTS_DIR = PRODUCTION_ROOT / "twinmotion-projects"

METAHUMAN_ROSTER = {
    "moneypenny": {"name": "Ms. Moneypenny", "metaHumanId": "MH_MoneyPenny_001", "ue_role": "operator"},
    "codex": {"name": "Codex", "metaHumanId": "MH_Codex_001", "ue_role": "technical"},
    "waka": {"name": "Waka Flocka Flame", "metaHumanId": "MH_Waka_001", "ue_role": "enforcer"},
    "goat": {"name": "The GOAT", "metaHumanId": "MH_GOAT_001", "ue_role": "mascot"},
}

STUDIO_LINKS = {
    "movie_studio": "/movie-studio.html",
    "music_studio": "/music-studio.html",
    "vocal_studio": "/vocal-studio.html",
    "studio_daw": "/studio.html",
    "ssl_mixer": "/ssl-mixer.html",
    "mastering": "/mastering.html",
    "unreal_copilot": "/unreal-copilot.html",
    "goat_3d": "/goat-3d-studio.html",
    "production_hub": "/production-hub.html",
    "twinmotion": "http://127.0.0.1:8090/production-hub.html#twinmotion",
    "oscar_chat": "http://127.0.0.1:3333",
}


def _ensure_dirs() -> None:
    for d in (LIVE_VIDEO_DIR, FCP_EXPORT_DIR, UNREAL_HANDOFF_DIR, TWINMOTION_HANDOFF_DIR, TWINMOTION_PROJECTS_DIR):
        d.mkdir(parents=True, exist_ok=True)


def _which(cmd: str) -> Optional[str]:
    return shutil.which(cmd)


def _slug(text: str, fallback: str = "goat-shot") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return (slug or fallback)[:72]


def detect_unreal_install() -> Dict[str, Any]:
    """Find likely Unreal Engine installs on macOS (Epic launcher layout)."""
    candidates: List[Path] = []
    home = Path.home()
    for base in (
        home / "UnrealEngine",
        home / "Documents" / "Unreal Projects",
        Path("/Users/Shared/Epic Games"),
        Path("/Volumes/LLMs/MAIN OSCAR/Mac"),
    ):
        if base.exists():
            candidates.append(base)

    ue_editors: List[Dict[str, str]] = []
    for root in candidates:
        try:
            for path in root.rglob("UnrealEditor"):
                if path.is_file() and os.access(path, os.X_OK):
                    ue_editors.append({"path": str(path), "version_hint": path.parent.name})
        except (OSError, PermissionError):
            continue

    return {
        "editors_found": len(ue_editors),
        "editors": ue_editors[:6],
        "epic_installer_dmg": str(EPIC_UE_INSTALLER_DMG) if EPIC_UE_INSTALLER_DMG.exists() else None,
        "remote_control_default": "http://127.0.0.1:30010",
        "pixel_streaming_default": "ws://127.0.0.1:8888",
        "metahuman_creator": "https://metahuman.unrealengine.com/",
    }


def detect_twinmotion() -> Dict[str, Any]:
    """Detect portable Twinmotion 2026.1 on the LLMs volume."""
    app = TWINMOTION_APP
    exe = app / "Contents/MacOS/TwinmotionCookedEditor-Mac-Shipping"
    version = "unknown"
    if app.exists():
        plist = app / "Contents/Info.plist"
        try:
            import plistlib
            with plistlib.open(plist) as data:
                version = data.get("CFBundleShortVersionString", version)
        except Exception:
            pass
    return {
        "installed": app.exists() and exe.exists(),
        "app_path": str(app) if app.exists() else None,
        "executable": str(exe) if exe.exists() else None,
        "version": version,
        "projects_dir": str(TWINMOTION_PROJECTS_DIR),
        "epic_ue_installer_dmg": str(EPIC_UE_INSTALLER_DMG) if EPIC_UE_INSTALLER_DMG.exists() else None,
    }


def detect_epic_stack() -> Dict[str, Any]:
    """Unreal + Twinmotion + Epic installer paths for GOAT cinematic pipeline."""
    return {
        "unreal": detect_unreal_install(),
        "twinmotion": detect_twinmotion(),
        "pipeline_order": [
            "GOAT photo / camera capture",
            "Unreal Engine 5 + MetaHuman (character + scene)",
            "Twinmotion 2026.1 (lighting, camera path, cinematic render)",
            "GOAT Movie Studio or Final Cut Pro (edit + audio)",
            "GOAT Vocal / Music / Mastering studios",
        ],
    }


def launch_twinmotion(open_goat_hub: bool = False) -> Dict[str, Any]:
    """Open Twinmotion.app from the LLMs portable install."""
    tm = detect_twinmotion()
    if not tm.get("installed"):
        return {
            "ok": False,
            "error": f"Twinmotion not found at {TWINMOTION_APP}",
            "hint": "Mount /Volumes/LLMs and confirm Twinmotion2026.1/Twinmotion.app exists.",
        }
    try:
        subprocess.run(["open", "-a", tm["app_path"]], check=True, timeout=15)
    except Exception as e:
        return {"ok": False, "error": str(e)}

    if open_goat_hub:
        subprocess.run(
            ["open", "http://127.0.0.1:8090/production-hub.html#twinmotion"],
            timeout=10,
        )

    return {
        "ok": True,
        "summary": f"Twinmotion {tm.get('version', '')} launched.",
        "app_path": tm["app_path"],
    }


def build_twinmotion_handoff(
    project_name: str = "GOAT_Cinematic",
    source_note: str = "",
    linked_unreal_project: str = "",
    export_target: str = "movie_studio",
) -> Dict[str, Any]:
    """
    Handoff pack: UE/MetaHuman → Twinmotion → GOAT Movie Studio / FCP.
    Twinmotion uses Datasmith / Direct Link from Unreal; exports MP4 or image seq.
    """
    _ensure_dirs()
    tm = detect_twinmotion()
    ue = detect_unreal_install()
    stamp = int(time.time())
    slug = _slug(project_name, "goat-tm")
    project_folder = TWINMOTION_PROJECTS_DIR / f"{stamp}-{slug}"
    project_folder.mkdir(parents=True, exist_ok=True)

    manifest = {
        "created": time.strftime("%Y-%m-%d %H:%M:%S"),
        "project_name": project_name,
        "source_note": source_note,
        "linked_unreal_project": linked_unreal_project,
        "twinmotion": tm,
        "unreal": {
            "epic_installer_dmg": ue.get("epic_installer_dmg"),
            "editors_found": ue.get("editors_found"),
        },
        "goat_project_folder": str(project_folder),
        "workflow": {
            "step_1": "In UE5: prepare MetaHuman + scene; enable Datasmith Exporter or Direct Link",
            "step_2": "Send to Twinmotion (File → Import from Unreal / Direct Link sync)",
            "step_3": "In Twinmotion: cameras, lighting, path animation, cinematic mode",
            "step_4": "Export MP4 or PNG sequence to GOAT project folder",
            "step_5_export_target": export_target,
        },
        "export_formats": ["MP4 (H.264)", "PNG sequence", "EXR sequence (HDR)"],
        "goat_studios": STUDIO_LINKS,
        "import_media_hint": f"Drop exports into {project_folder} then open Movie Studio",
    }
    manifest_path = TWINMOTION_HANDOFF_DIR / f"{stamp}-{slug}-twinmotion.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    readme = project_folder / "GOAT_README.txt"
    readme.write_text(
        f"""GOAT × Twinmotion handoff — {project_name}
Created: {manifest['created']}

Epic stack on this machine:
  UE installer: {ue.get('epic_installer_dmg') or 'not mounted'}
  Twinmotion:   {tm.get('app_path') or 'missing'}

Workflow:
  1. Unreal + MetaHuman scene
  2. Twinmotion cinematic polish
  3. Export here → Movie Studio / Final Cut

{source_note}
""",
        encoding="utf-8",
    )

    launcher = TWINMOTION_HANDOFF_DIR / f"{stamp}-launch-twinmotion.command"
    launcher.write_text(
        f'''#!/bin/bash
open -a "{tm.get("app_path", TWINMOTION_APP)}"
open "http://127.0.0.1:8090/production-hub.html#twinmotion"
''',
        encoding="utf-8",
    )
    launcher.chmod(launcher.stat().st_mode | 0o111)

    return {
        "ok": True,
        "summary": "Twinmotion handoff pack created (UE → TM → GOAT studios).",
        "manifest_path": str(manifest_path),
        "project_folder": str(project_folder),
        "launcher_command": str(launcher),
        "manifest": manifest,
        "twinmotion_detect": tm,
    }


def build_unreal_handoff(
    character_id: str = "moneypenny",
    project_name: str = "GOAT_MetaHuman_Live",
    scene_note: str = "",
) -> Dict[str, Any]:
    _ensure_dirs()
    char = METAHUMAN_ROSTER.get(character_id, METAHUMAN_ROSTER["moneypenny"])
    stamp = int(time.time())
    manifest = {
        "created": time.strftime("%Y-%m-%d %H:%M:%S"),
        "project_name": project_name,
        "character": char,
        "scene_note": scene_note,
        "pipelines": {
            "live_link_face": "Enable Live Link Face app → MetaHuman face source",
            "convai": "Optional Convai plugin for voice-driven MetaHuman",
            "pixel_streaming": detect_unreal_install()["pixel_streaming_default"],
            "remote_control_api": detect_unreal_install()["remote_control_default"],
        },
        "goat_studios": STUDIO_LINKS,
        "recommended_plugins": [
            "MetaHuman",
            "Live Link",
            "Remote Control API",
            "Movie Render Queue",
            "Pixel Streaming",
        ],
        "export_targets": ["twinmotion", "movie_studio", "fcp-export"],
        "twinmotion": detect_twinmotion(),
    }
    out = UNREAL_HANDOFF_DIR / f"{stamp}-{_slug(project_name)}-handoff.json"
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    applescript = f'''tell application "UnrealEditor" to activate
-- GOAT handoff: open project {project_name} and load MetaHuman {char.get("metaHumanId", "")}
-- Use Remote Control API at {manifest["pipelines"]["remote_control_api"]}
'''
    script_path = UNREAL_HANDOFF_DIR / f"{stamp}-open-ue.scpt"
    script_path.write_text(applescript, encoding="utf-8")

    return {
        "ok": True,
        "summary": f"Unreal/MetaHuman handoff pack created for {char['name']}.",
        "manifest_path": str(out),
        "applescript_path": str(script_path),
        "manifest": manifest,
        "unreal_detect": detect_unreal_install(),
    }


def photo_to_motion_video(
    image_path: str,
    duration_sec: float = 6.0,
    fps: int = 30,
    motion: str = "ken_burns_in",
    prompt: str = "",
) -> Dict[str, Any]:
    """
    Turn a still photo into a short motion clip (Ken Burns / zoom-pan).
    Original GOAT pipeline — not a Grok clone.
    """
    _ensure_dirs()
    src = Path(image_path)
    if not src.exists():
        return {"ok": False, "error": f"Image not found: {image_path}"}

    ffmpeg = _which("ffmpeg")
    if not ffmpeg:
        return {
            "ok": False,
            "error": "ffmpeg not installed. Install with: brew install ffmpeg",
            "hint": "GOAT Movie Studio can still import the still; motion export needs ffmpeg.",
        }

    duration_sec = max(2.0, min(float(duration_sec), 30.0))
    fps = max(24, min(int(fps), 60))
    frames = int(duration_sec * fps)
    stamp = int(time.time())
    slug = _slug(prompt or src.stem, "photo-motion")
    out_mp4 = LIVE_VIDEO_DIR / f"{stamp}-{slug}.mp4"
    out_poster = LIVE_VIDEO_DIR / f"{stamp}-{slug}-poster.jpg"

    shutil.copy2(src, out_poster)

    if motion == "ken_burns_out":
        zoom_expr = f"zoom+0.0015"
        zoom_start = "1.2"
    else:
        zoom_expr = f"if(lte(zoom,1.0),1.0,max(1.0,zoom-0.0015))"
        zoom_start = "1.0"

    vf = (
        f"scale=1920:1080:force_original_aspect_ratio=decrease,"
        f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2,"
        f"zoompan=z='{zoom_expr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"d={frames}:s=1920x1080:fps={fps}"
    )

    cmd = [
        ffmpeg, "-y",
        "-loop", "1",
        "-i", str(src),
        "-vf", vf,
        "-t", str(duration_sec),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(out_mp4),
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0:
            return {"ok": False, "error": proc.stderr[-800:] or "ffmpeg failed"}
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": "ffmpeg timed out after 120s"}

    return {
        "ok": True,
        "summary": "Photo converted to motion video.",
        "video_path": str(out_mp4),
        "poster_path": str(out_poster),
        "url": f"http://127.0.0.1:8090/production/live-video/{out_mp4.name}",
        "duration_sec": duration_sec,
        "fps": fps,
        "motion": motion,
        "next_studios": {
            "movie_studio": STUDIO_LINKS["movie_studio"],
            "unreal_copilot": STUDIO_LINKS["unreal_copilot"],
            "fcp_export": "/production-hub.html#fcp",
        },
    }


def build_fcp_xml(
    project_name: str,
    clips: List[Dict[str, Any]],
    fps: int = 30,
    resolution: str = "1920x1080",
) -> Dict[str, Any]:
    """Export a minimal FCPXML 1.9 timeline for Final Cut Pro import."""
    _ensure_dirs()
    w, h = 1920, 1080
    if "x" in resolution:
        parts = resolution.lower().split("x")
        w, h = int(parts[0]), int(parts[1])

    stamp = int(time.time())
    slug = _slug(project_name, "goat-timeline")
    xml_path = FCP_EXPORT_DIR / f"{stamp}-{slug}.fcpxml"

    def _xml_escape(s: str) -> str:
        return (
            s.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
        )

    spine = []
    offset = 0.0
    for i, clip in enumerate(clips):
        path = clip.get("path") or clip.get("file") or ""
        dur = float(clip.get("duration_sec") or clip.get("duration") or 5.0)
        name = _xml_escape(clip.get("name") or f"Clip_{i+1}")
        start = f"{offset:.4f}s"
        duration = f"{dur:.4f}s"
        offset += dur
        spine.append(
            f'        <asset-clip ref="r{i+2}" name="{name}" offset="{start}" duration="{duration}" start="0s">'
            f'<adjust-transform position="0 0" scale="1 1" anchor="0 0"/></asset-clip>'
        )

    resources = [
        f'    <format id="r1" name="FFVideoFormat1080p{fps}" frameDuration="1/{fps}s" width="{w}" height="{h}"/>'
    ]
    for i, clip in enumerate(clips):
        path = clip.get("path") or clip.get("file") or ""
        name = _xml_escape(clip.get("name") or f"Clip_{i+1}")
        resources.append(
            f'    <asset id="r{i+2}" name="{name}" uid="goat-{i}" start="0s" duration="3600s" '
            f'hasVideo="1" format="r1" hasAudio="1">'
            f'<media-rep kind="original-media" src="file://{_xml_escape(path)}"/></asset>'
        )

    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
{chr(10).join(resources)}
  </resources>
  <library>
    <event name="{_xml_escape(project_name)}">
      <project name="{_xml_escape(project_name)}">
        <sequence format="r1" duration="{offset:.4f}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
{chr(10).join(spine)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
'''
    xml_path.write_text(xml, encoding="utf-8")

    applescript_path = FCP_EXPORT_DIR / f"{stamp}-import-fcp.applescript"
    applescript_path.write_text(
        f'''tell application "Final Cut Pro"
  activate
end tell
-- Import FCPXML manually: File → Import → XML
-- Path: {xml_path}
''',
        encoding="utf-8",
    )

    return {
        "ok": True,
        "summary": "FCPXML timeline exported for Final Cut Pro.",
        "fcpxml_path": str(xml_path),
        "applescript_path": str(applescript_path),
        "clip_count": len(clips),
        "duration_sec": offset,
        "import_hint": "Final Cut Pro → File → Import → XML → select the .fcpxml file",
    }


def production_status() -> Dict[str, Any]:
    _ensure_dirs()
    ffmpeg = bool(_which("ffmpeg"))
    return {
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "studios": STUDIO_LINKS,
        "metahuman_roster": METAHUMAN_ROSTER,
        "paths": {
            "live_video": str(LIVE_VIDEO_DIR),
            "fcp_export": str(FCP_EXPORT_DIR),
            "unreal_handoff": str(UNREAL_HANDOFF_DIR),
            "twinmotion_handoff": str(TWINMOTION_HANDOFF_DIR),
            "twinmotion_projects": str(TWINMOTION_PROJECTS_DIR),
        },
        "tools": {
            "ffmpeg": ffmpeg,
            "oscar_graphics": OSCILLATOR_GRAPHICS_URL,
        },
        "epic_stack": detect_epic_stack(),
        "pipelines": [
            "photo_to_live_video",
            "unreal_metahuman_handoff",
            "twinmotion_handoff",
            "launch_twinmotion",
            "fcp_xml_export",
            "oscar_goat_bridge",
        ],
    }