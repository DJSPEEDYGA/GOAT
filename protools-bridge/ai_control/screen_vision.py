#!/usr/bin/env python3
"""
GOAT Force Screen Vision
Dr. Devin (Agent 007) — AI Computer Control Engine

Captures the screen and reads what's visible.
Uses: screencapture (macOS built-in) + PIL
"""

import subprocess
import tempfile
import os
import json
import base64
from datetime import datetime
from PIL import Image, ImageDraw

SCREENSHOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def capture_screen(output_path=None, display=1):
    """Capture the full screen. Returns path to PNG."""
    if output_path is None:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        output_path = os.path.join(SCREENSHOT_DIR, f"screen_{ts}.png")
    result = subprocess.run(
        ["screencapture", "-x", "-D", str(display), output_path],
        capture_output=True
    )
    if result.returncode != 0 or not os.path.exists(output_path):
        raise RuntimeError(f"screencapture failed: {result.stderr.decode()}")
    return output_path


def capture_region(x, y, w, h, output_path=None):
    """Capture a specific screen region."""
    if output_path is None:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        output_path = os.path.join(SCREENSHOT_DIR, f"region_{ts}.png")
    full = capture_screen()
    img = Image.open(full)
    region = img.crop((x, y, x + w, y + h))
    region.save(output_path)
    os.unlink(full)
    return output_path


def get_screen_size():
    """Return (width, height) of primary display."""
    path = capture_screen()
    img = Image.open(path)
    size = img.size
    os.unlink(path)
    return size


def screenshot_to_base64(path):
    """Convert screenshot to base64 string for API calls."""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def annotate_screenshot(path, points=None, regions=None, output_path=None):
    """
    Annotate a screenshot with click points and regions for debugging.
    points: list of (x, y, label) tuples
    regions: list of (x, y, w, h, label) tuples
    """
    img = Image.open(path).convert("RGB")
    draw = ImageDraw.Draw(img)

    if regions:
        for (x, y, w, h, label) in regions:
            draw.rectangle([x, y, x+w, y+h], outline=(255, 215, 0), width=3)
            draw.text((x+4, y+4), label, fill=(255, 215, 0))

    if points:
        for (x, y, label) in points:
            r = 10
            draw.ellipse([x-r, y-r, x+r, y+r], outline=(255, 50, 50), width=3)
            draw.line([x-r-5, y, x+r+5, y], fill=(255, 50, 50), width=2)
            draw.line([x, y-r-5, x, y+r+5], fill=(255, 50, 50), width=2)
            draw.text((x+r+4, y-r), label, fill=(255, 50, 50))

    if output_path is None:
        output_path = path.replace(".png", "_annotated.png")
    img.save(output_path)
    return output_path


def cleanup_screenshots(keep_last=10):
    """Keep only the most recent N screenshots."""
    files = sorted([
        os.path.join(SCREENSHOT_DIR, f)
        for f in os.listdir(SCREENSHOT_DIR)
        if f.endswith(".png")
    ], key=os.path.getmtime)
    for f in files[:-keep_last]:
        try:
            os.unlink(f)
        except Exception:
            pass


if __name__ == "__main__":
    print("Testing screen capture...")
    path = capture_screen()
    size = Image.open(path).size
    print(f"Screenshot: {path} ({size[0]}x{size[1]})")
    b64 = screenshot_to_base64(path)
    print(f"Base64 length: {len(b64)} chars")
    print("Screen vision OK")
