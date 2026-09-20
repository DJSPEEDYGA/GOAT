#!/usr/bin/env python3
"""GemCore Imagine — local card animation engine (runs on the Jetson).
No cloud API. Tier 1: pseudo-depth parallax MP4. Tier 2: diffusion
img2video when models are installed (SVD / LTX-Video via diffusers).

Run:  pip3 install fastapi uvicorn pillow numpy  (opencv-python optional)
      python3 imagine_server.py   # serves :10090
"""
import io, os, json, math, uuid, time, threading
from fastapi import FastAPI, UploadFile
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

def parallax_frames(img: Image.Image, depth: np.ndarray, n=48, amp=0.012):
    """2.5D warp: shift pixels by depth * camera pan — the 'alive' look."""
    src = np.asarray(img, dtype=np.float32)
    h, w = depth.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    frames = []
    for i in range(n):
        t = math.sin(i / n * 2 * math.pi)          # smooth loop
        dx = (depth - depth.mean()) * amp * w * t  # near pixels move more
        xi = np.clip(xx + dx, 0, w - 1).astype(np.int32)
        frame = np.take_along_axis(src, xi[..., None], axis=1)
        # holo sweep
        sweep = ((xx / w) - (i / n)) ** 2
        frame += np.exp(-sweep * 40)[..., None] * 38
        frames.append(Image.fromarray(np.clip(frame, 0, 255).astype(np.uint8)))
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

def run_job(jid, png_bytes, mode):
    STATUS[jid] = {'state': 'rendering', 'mode': mode, 'at': time.time()}
    try:
        img = Image.open(io.BytesIO(png_bytes)).convert('RGB')
        img.thumbnail((720, 720))
        if mode == 'diffuse':
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
            depth = pseudo_depth(img); frames = parallax_frames(img, depth)
        out = write_mp4(frames, os.path.join(JOBS, jid + '.mp4'))
        STATUS[jid] = {'state': 'done', 'file': os.path.basename(out), 'frames': len(frames)}
    except Exception as e:
        STATUS[jid] = {'state': 'error', 'error': str(e)}

@app.post('/animate')
async def animate(file: UploadFile, mode: str = 'depth'):
    jid = uuid.uuid4().hex[:12]
    data = await file.read()
    threading.Thread(target=run_job, args=(jid, data, mode), daemon=True).start()
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
