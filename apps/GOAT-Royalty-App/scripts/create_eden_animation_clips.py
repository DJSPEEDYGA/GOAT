#!/usr/bin/env python3
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

sys.path.insert(0, "/tmp/eden-video-deps")
try:
    import imageio.v3 as iio
except Exception:  # pragma: no cover - optional local video writer
    iio = None


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "goat-royalty-portable-2.0.0" / "web-app"
ASSETS = WEB / "assets" / "eden-campaign"
CLIPS = WEB / "videos" / "eden-campaign"
CLIPS.mkdir(parents=True, exist_ok=True)

SIZE = (720, 1280)
FRAMES = 72
DURATION_MS = 83


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Helvetica.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT_BIG = font(58, True)
FONT_MED = font(34, True)
FONT_SMALL = font(26, False)
FONT_TINY = font(19, True)


def cover_crop(img: Image.Image, size=SIZE) -> Image.Image:
    img = img.convert("RGB")
    sw, sh = size
    scale = max(sw / img.width, sh / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - sw) // 2
    top = (nh - sh) // 2
    return img.crop((left, top, left + sw, top + sh))


def fit_inside(img: Image.Image, size=SIZE) -> Image.Image:
    bg = Image.new("RGB", size, "#05070c")
    scale = min(size[0] / img.width, size[1] / img.height)
    resized = img.convert("RGB").resize((int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS)
    bg.paste(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return bg


def moving_crop(img: Image.Image, t: float, zoom0: float, zoom1: float, pan_x: float = 0.0, pan_y: float = 0.0) -> Image.Image:
    sw, sh = SIZE
    zoom = zoom0 + (zoom1 - zoom0) * t
    cw, ch = int(sw / zoom), int(sh / zoom)
    base = cover_crop(img)
    cx = sw // 2 + int((t - 0.5) * pan_x)
    cy = sh // 2 + int((t - 0.5) * pan_y)
    left = max(0, min(sw - cw, cx - cw // 2))
    top = max(0, min(sh - ch, cy - ch // 2))
    return base.crop((left, top, left + cw, top + ch)).resize(SIZE, Image.Resampling.LANCZOS)


def gradient_overlay(frame: Image.Image, alpha_top=170, alpha_bottom=115) -> Image.Image:
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(SIZE[1]):
        edge = min(y / 420, (SIZE[1] - y) / 470, 1)
        a = int((1 - edge) * (alpha_top if y < SIZE[1] / 2 else alpha_bottom))
        if a > 0:
            draw.line((0, y, SIZE[0], y), fill=(0, 0, 0, a))
    return Image.alpha_composite(frame.convert("RGBA"), overlay)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        trial = word if not line else f"{line} {word}"
        if draw.textbbox((0, 0), trial, font=font_obj)[2] <= max_width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_centered(draw: ImageDraw.ImageDraw, y: int, text: str, font_obj: ImageFont.ImageFont, fill, stroke=(0, 0, 0), sw=3):
    bbox = draw.textbbox((0, 0), text, font=font_obj, stroke_width=sw)
    x = (SIZE[0] - (bbox[2] - bbox[0])) // 2
    draw.text((x, y), text, font=font_obj, fill=fill, stroke_width=sw, stroke_fill=stroke)


def draw_text_block(frame: Image.Image, title: str, hook: str, footer: str, t: float) -> Image.Image:
    frame = gradient_overlay(frame)
    draw = ImageDraw.Draw(frame)
    fade = min(1, max(0, (t - 0.08) / 0.18))
    gold = (244, 197, 66, int(255 * fade))
    white = (248, 250, 252, int(245 * fade))
    blue = (130, 220, 255, int(230 * fade))
    draw_centered(draw, 80, title, FONT_BIG, gold, sw=4)
    y = 164
    for line in wrap_text(draw, hook.upper(), FONT_SMALL, 620):
        draw_centered(draw, y, line, FONT_SMALL, white, sw=3)
        y += 36
    draw.rounded_rectangle((58, 1118, 662, 1196), radius=18, fill=(2, 6, 23, int(170 * fade)), outline=(244, 197, 66, int(90 * fade)), width=2)
    for i, line in enumerate(wrap_text(draw, footer, FONT_TINY, 560)[:2]):
        draw_centered(draw, 1134 + i * 26, line, FONT_TINY, blue, sw=2)
    return frame


def light_sweep(frame: Image.Image, t: float, color=(53, 211, 255)) -> Image.Image:
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x = int(-260 + (SIZE[0] + 520) * t)
    for w in range(100):
        a = max(0, 42 - int(abs(w - 50) * 0.75))
        draw.line((x + w, 0, x - 230 + w, SIZE[1]), fill=(*color, a), width=3)
    return Image.alpha_composite(frame.convert("RGBA"), overlay)


def particles(frame: Image.Image, t: float, count=90) -> Image.Image:
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(count):
        x = (i * 137 + int(t * 180)) % SIZE[0]
        y = (i * 71 + int(t * 520)) % SIZE[1]
        pulse = 0.5 + 0.5 * math.sin(t * math.pi * 6 + i)
        r = 1 + int(pulse * 2)
        color = (244, 197, 66, 55 + int(pulse * 95)) if i % 3 else (53, 211, 255, 70 + int(pulse * 90))
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
    return Image.alpha_composite(frame.convert("RGBA"), overlay)


def make_clip(name: str, source: Image.Image, title: str, hook: str, footer: str, mode: str):
    frames = []
    rgb_frames = []
    for n in range(FRAMES):
        t = n / (FRAMES - 1)
        if mode == "cover":
            frame = fit_inside(source)
            frame = frame.filter(ImageFilter.GaussianBlur(0.35 + t * 0.2))
            frame = ImageEnhance.Contrast(frame).enhance(1.08)
            frame = moving_crop(frame, t, 1.0, 1.06, 60, -50)
        elif mode == "battle":
            frame = moving_crop(source, t, 1.05, 1.22, -90, 70)
            frame = ImageEnhance.Color(frame).enhance(1.16 + 0.12 * math.sin(t * math.pi * 2))
            frame = ImageEnhance.Contrast(frame).enhance(1.15)
            frame = light_sweep(frame, (t * 1.2) % 1, color=(244, 197, 66))
        elif mode == "dna":
            frame = moving_crop(source, t, 1.12, 1.34, 110, -30)
            frame = ImageEnhance.Color(frame).enhance(0.92)
            frame = ImageEnhance.Brightness(frame).enhance(0.86)
            frame = light_sweep(frame, t, color=(53, 211, 255))
        else:
            frame = moving_crop(source, t, 1.0, 1.16, 80, -80)
            frame = ImageEnhance.Contrast(frame).enhance(1.12)
            frame = light_sweep(frame, t, color=(53, 211, 255))
        frame = particles(frame, t)
        frame_rgba = draw_text_block(frame, title, hook, footer, t)
        rgb = frame_rgba.convert("RGB")
        rgb_frames.append(rgb)
        frames.append(rgb.convert("P", palette=Image.Palette.ADAPTIVE))

    gif_out = CLIPS / f"{name}.gif"
    frames[0].save(
        gif_out,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )
    outputs = [gif_out]

    if iio is not None:
        mp4_out = CLIPS / f"{name}.mp4"
        iio.imwrite(
            mp4_out,
            [frame for frame in rgb_frames],
            fps=12,
            codec="libx264",
            quality=8,
            pixelformat="yuv420p",
        )
        outputs.append(mp4_out)
    return outputs


def main() -> None:
    keyframe = Image.open(ASSETS / "eden-9-gate-keyframe.png")
    cover = Image.open(ASSETS / "EDEN AWAKENING 2026.pdf.png")
    outputs_nested = [
        make_clip(
            "eden-001-gate-opens",
            keyframe,
            "EDEN AWAKENS",
            "They buried the city. They could not bury the truth.",
            "Clip 01 - Eden-9 Gate Opens",
            "gate",
        ),
        make_clip(
            "eden-002-dna-limit-break",
            keyframe,
            "DNA UNLOCKED",
            "What if your power was never gone, only capped?",
            "Clip 02 - DNA Limit Break",
            "dna",
        ),
        make_clip(
            "eden-003-battle-for-humanity",
            keyframe,
            "THE BATTLE BEGINS",
            "The battle for humanity's awakening has begun.",
            "Clip 03 - Battle For Humanity",
            "battle",
        ),
        make_clip(
            "eden-004-waka-momma-drop",
            cover,
            "WAKA MOMMA PRESENTS",
            "A mythic sci-fi universe built for the big screen.",
            "Clip 04 - Promo Drop",
            "cover",
        ),
    ]
    outputs = [out for group in outputs_nested for out in group]
    for out in outputs:
        print(out)


if __name__ == "__main__":
    main()
