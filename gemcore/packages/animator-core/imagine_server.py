#!/usr/bin/env python3
"""GemCore Imagine — local card animation engine (runs on the Jetson).
No cloud API. Tier 1: pseudo-depth parallax MP4. Tier 2: diffusion
img2video when models are installed (SVD / LTX-Video via diffusers).

Run:  pip3 install fastapi uvicorn pillow numpy  (opencv-python optional)
      python3 imagine_server.py   # serves :10090
"""
import io, os, json, math, uuid, time, threading
from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
import numpy as np
from PIL import Image, ImageFilter

app = FastAPI(title='GemCore Imagine')
JOBS = os.path.join(os.path.dirname(__file__), 'jobs')
os.makedirs(JOBS, exist_ok=True)
STATUS = {}

def pseudo_depth(img: Image.Image) -> np.ndarray:
    """Cheap depth: blurred luminance ≈ distance (bright art pops forward).
    Good enough for card parallax — real depth model slot below."""
    g = np.asarray(img.convert('L'), dtype=np.float32) / 255.0
    from scipy.ndimage import gaussian_filter  # optional; fallback below
    return gaussian_filter(g, sigma=12)

def parallax_frames(img: Image.Image, depth: np.ndarray, n=48, amp=0.012, fx='holo'):
    """2.5D warp: shift pixels by depth * camera pan — the 'alive' look.
    fx: holo sweep | sparkle particles | depth-blur rack focus | cinema grade."""
    src = np.asarray(img, dtype=np.float32)
    h, w = depth.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rng = np.random.default_rng(7)
    sparks = np.column_stack([rng.random(60) * w, rng.random(60) * h, rng.random(60) * 2 * math.pi])
    blurred = np.asarray(img.filter(ImageFilter.GaussianBlur(9)), dtype=np.float32)
    frames = []
    for i in range(n):
        t = math.sin(i / n * 2 * math.pi)
        dx = (depth - depth.mean()) * amp * w * t
        xi = np.clip(xx + dx, 0, w - 1).astype(np.int32)
        frame = np.take_along_axis(src, xi[..., None], axis=1)
        if fx in ('holo', 'sparkle'):
            sweep = ((xx / w) - (i / n)) ** 2
            frame += np.exp(-sweep * 40)[..., None] * 38
        if fx == 'sparkle':
            ph = i / n * 2 * math.pi
            for sx, sy, sp in sparks:
                tw = (math.sin(sp + ph * 3) + 1) / 2
                if tw > .75:
                    frame[int(sy) % h, int(sx) % w] = [255, 250, 220]
        if fx == 'depth-blur':
            # rack focus: near-plane stays sharp, far blurs (breathing focus)
            mix = (np.abs(t) * .8 + .2)[..., None] if False else None
            sharpness = np.clip(depth * 2 - .5 + t * .3, 0, 1)[..., None]
            frame = frame * sharpness + np.take_along_axis(blurred, xi[..., None], axis=1) * (1 - sharpness)
        if fx == 'cinema':
            frame *= np.array([1.02, .98, .9])  # warm grade
            bar = int(h * .09)
            frame[:bar] = frame[-bar:] = 0
        frames.append(Image.fromarray(np.clip(frame, 0, 255).astype(np.uint8)))
    return frames

def presenter_frames(img: Image.Image, meta: dict, n=72):
    """Money Penny presents the cert: intro ring → card float-in → grade stamp."""
    from PIL import ImageDraw, ImageFont
    W, H = 640, 640
    try:
        f_big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 72)
        f_med = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
        f_sm = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    except Exception:
        f_big = f_med = f_sm = ImageFont.load_default()
    card = img.copy(); card.thumbnail((380, 500))
    frames = []
    name = (meta.get('name') or 'Certified Collectible')[:30]
    grade = meta.get('grade'); cert = meta.get('certId', '')
    for i in range(n):
        fr = Image.new('RGB', (W, H), (2, 7, 12))
        d = ImageDraw.Draw(fr, 'RGBA')
        t = i / n
        # reactor ring — always alive
        rr = 90 + 10 * math.sin(t * 6.28 * 2)
        d.ellipse([W//2 - rr, 130 - rr, W//2 + rr, 130 + rr], outline=(217, 185, 106, 160), width=2)
        d.ellipse([W//2 - rr*1.2, 130 - rr*1.2, W//2 + rr*1.2, 130 + rr*1.2], outline=(37, 243, 230, 60), width=1)
        phase = t * 3
        if phase < 1:   # intro — MP emblem
            a = min(1, t * 4)
            d.text((W//2, 118), 'MP', font=f_big, anchor='mm', fill=(217, 185, 106, int(255*a)))
            d.text((W//2, 240), 'MONEY PENNY', font=f_med, anchor='mm', fill=(234, 253, 251, int(255*a)))
            d.text((W//2, 280), 'presents', font=f_sm, anchor='mm', fill=(127, 168, 184, int(255*a)))
        elif phase < 2: # card float-in with drift
            rise = int(80 * (1 - (phase - 1)))
            fr.paste(card, (W//2 - card.width//2, 150 - rise), card if card.mode == 'RGBA' else None)
            d.text((W//2, 150 + card.height + 20 - rise), name, font=f_med, anchor='mm', fill=(234, 253, 251))
            d.text((W//2, 150 + card.height + 52 - rise), 'GEMCORE CERTIFIED', font=f_sm, anchor='mm', fill=(37, 243, 230))
        else:           # grade stamp
            pop = min(1, (phase - 2) * 4)
            gs = int(56 + 20 * pop)
            fr.paste(card, (W//2 - card.width//2 - 60, 110))
            d.text((W - 130, 240), str(grade or '—'), font=f_big, anchor='mm', fill=(37, 243, 230))
            d.text((W - 130, 300), 'GRADE', font=f_sm, anchor='mm', fill=(217, 185, 106))
            d.text((W - 130, 330), cert, font=f_sm, anchor='mm', fill=(127, 168, 184))
            d.text((W//2, H - 60), 'the standard is higher', font=f_sm, anchor='mm', fill=(217, 185, 106, 200))
        frames.append(fr)
    return frames

def write_mp4(frames, out):
    """Prefer imageio-ffmpeg → real mp4; fallback animated webp."""
    try:
        import imageio.v2 as imageio
        imageio.mimsave(out, [np.asarray(f) for f in frames], fps=24, codec='libx264',
                        macro_block_size=8, ffmpeg_params=['-pix_fmt', 'yuv420p'])
        return out
    except Exception:
        out = out.replace('.mp4', '.webp')
        frames[0].save(out, save_all=True, append_images=frames[1:], duration=42, loop=0)
        return out

def run_job(jid, png_bytes, mode, meta=None):
    STATUS[jid] = {'state': 'rendering', 'mode': mode, 'at': time.time()}
    try:
        img = Image.open(io.BytesIO(png_bytes)).convert('RGB')
        img.thumbnail((720, 720))
        if mode == 'presenter':
            frames = presenter_frames(img, meta or {})
        elif mode == 'diffuse':
            # Tier 2 — real video diffusion if a local model is installed
            try:
                from diffusers import StableVideoDiffusionPipeline
                import torch
                pipe = StableVideoDiffusionPipeline.from_pretrained(
                    'stabilityai/stable-video-diffusion-img2vid',
                    torch_dtype=torch.float16, variant='fp16')
                pipe.to('cuda')
                frames = pipe(img, num_frames=25, decode_chunk_size=4).frames[0]
                frames = [f.convert('RGB') for f in frames]
            except Exception as e:
                STATUS[jid] = {'state': 'fallback', 'note': f'no diffusion model ({type(e).__name__}) — depth parallax used'}
                depth = pseudo_depth(img); frames = parallax_frames(img, depth)
        else:
            depth = pseudo_depth(img)
            fx = mode if mode in ('holo', 'sparkle', 'depth-blur', 'cinema') else 'holo'
            frames = parallax_frames(img, depth, fx=fx)
        out = write_mp4(frames, os.path.join(JOBS, jid + '.mp4'))
        STATUS[jid] = {'state': 'done', 'file': os.path.basename(out), 'frames': len(frames)}
    except Exception as e:
        STATUS[jid] = {'state': 'error', 'error': str(e)}

@app.post('/animate')
async def animate(file: UploadFile, mode: str = 'depth', meta: str = Form('{}')):
    jid = uuid.uuid4().hex[:12]
    data = await file.read()
    try: m = json.loads(meta)
    except Exception: m = {}
    threading.Thread(target=run_job, args=(jid, data, mode, m), daemon=True).start()
    return {'job': jid}

@app.get('/animate/{jid}')
def status(jid): return JSONResponse(STATUS.get(jid, {'state': 'unknown'}))

@app.get('/animate/{jid}/file')
def file(jid):
    for ext in ('mp4', 'webp'):
        p = os.path.join(JOBS, jid + '.' + ext)
        if os.path.exists(p): return FileResponse(p)
    return JSONResponse({'error': 'not ready'}, 404)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=int(os.environ.get('IMAGINE_PORT', 10090)))
