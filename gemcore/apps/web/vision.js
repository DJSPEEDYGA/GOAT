'use strict';
/* GemCore VisionCore — LOCAL computer-vision adapter.
   Real pixel analysis on actual captures — no invented results.
   Measures: card-region detection, centering, corner/edge wear,
   surface defect density + coordinates, blur/glare capture quality.
   Reports honest confidence derived from image quality. */

const VisionLocal = (() => {

  function loadImage(dataUrl) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = dataUrl;
    });
  }

  function gray(data, w, h) {
    const g = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      g[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    }
    return g;
  }

  // Laplacian-ish local contrast energy
  function energyMap(g, w, h) {
    const e = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        e[i] = Math.abs(4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]);
      }
    }
    return e;
  }

  const stats = a => {
    let s = 0, s2 = 0;
    for (const v of a) { s += v; s2 += v * v; }
    const m = s / a.length;
    return { mean: m, std: Math.sqrt(Math.max(0, s2 / a.length - m * m)) };
  };

  // Detect the card's bounding box: rows/cols whose mean brightness
  // deviates from the dark stage background.
  function detectRegion(g, w, h) {
    const row = new Float32Array(h), col = new Float32Array(w);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { row[y] += g[y * w + x]; col[x] += g[y * w + x]; }
    for (let y = 0; y < h; y++) row[y] /= w;
    for (let x = 0; x < w; x++) col[x] /= h;
    const rs = stats(row), cs = stats(col);
    const rt = rs.mean + rs.std * 0.8, ct = cs.mean + cs.std * 0.8;
    let top = 0, bot = h - 1, left = 0, right = w - 1;
    while (top < h - 1 && row[top] < rt) top++;
    while (bot > top && row[bot] < rt) bot--;
    while (left < w - 1 && col[left] < ct) left++;
    while (right > left && col[right] < ct) right--;
    const minArea = w * h * 0.05;
    if ((right - left) * (bot - top) < minArea) return null;
    return { left, right, top, bot };
  }

  function analyzeSurface(e, reg, w) {
    // outlier energy cells inside the card region → defect coordinates
    const cells = 16, out = [];
    const cw = Math.max(1, Math.floor((reg.right - reg.left) / cells));
    const ch = Math.max(1, Math.floor((reg.bot - reg.top) / cells));
    const cellStat = [];
    for (let cy = 0; cy < cells; cy++) for (let cx = 0; cx < cells; cx++) {
      let s = 0, n = 0;
      for (let y = reg.top + cy * ch; y < Math.min(reg.bot, reg.top + (cy + 1) * ch); y++)
        for (let x = reg.left + cx * cw; x < Math.min(reg.right, reg.left + (cx + 1) * cw); x++) { s += e[y * w + x]; n++; }
      cellStat.push(n ? s / n : 0);
    }
    const { mean, std } = stats(cellStat);
    const thr = mean + std * 2.2;
    cellStat.forEach((v, i) => {
      if (v > thr) {
        const cx = i % cells, cy = Math.floor(i / cells);
        out.push({
          x: (reg.left + (cx + .5) * cw) / w,
          y: (reg.top + (cy + .5) * ch) / (reg.bot + (cells * ch) - (reg.top)), // approx normalized
          severity: Math.min(1, (v - thr) / (std * 4 + 1e-6)),
        });
      }
    });
    return { defects: out, density: out.length / (cells * cells) };
  }

  function bandEnergy(e, x0, y0, x1, y1, w) {
    let s = 0, n = 0;
    for (let y = Math.max(0, y0 | 0); y < Math.min(y1 | 0, 0 + e.length / w); y++)
      for (let x = Math.max(0, x0 | 0); x < Math.min(x1 | 0, w); x++) { s += e[y * w + x]; n++; }
    return n ? s / n : 0;
  }

  async function analyze(dataUrl) {
    const img = await loadImage(dataUrl);
    const maxW = 480;
    const scale = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data;
    const g = gray(px, w, h);
    const e = energyMap(g, w, h);

    // capture quality
    const bright = [...px].filter((_, i) => i % 4 === 0 && px[i] > 240).length / (w * h);
    const blurProxy = stats(e).std;
    const glare = bright;                       // % blown highlights
    const blur = Math.min(1, blurProxy / 30);   // normalized sharpness

    const reg = detectRegion(g, w, h);
    if (!reg) {
      return { ok: false, reason: 'no collectible region detected — retake with darker background', quality: { blur, glare } };
    }
    const rw = reg.right - reg.left, rh = reg.bot - reg.top;

    // centering: margin balance inside the frame
    const lM = reg.left / w, rM = (w - reg.right) / w, tM = reg.top / h, bM = (h - reg.bot) / h;
    const lrSym = 1 - Math.min(1, Math.abs(lM - rM) / Math.max(lM + rM, 0.01));
    const tbSym = 1 - Math.min(1, Math.abs(tM - bM) / Math.max(tM + bM, 0.01));
    const centering = Math.round(1000 * (0.5 * lrSym + 0.5 * tbSym));

    // corners: energy in 12% boxes at each corner vs region median
    const cw = rw * 0.12, chh = rh * 0.12;
    const cornerE = [
      bandEnergy(e, reg.left, reg.top, reg.left + cw, reg.top + chh, w),
      bandEnergy(e, reg.right - cw, reg.top, reg.right, reg.top + chh, w),
      bandEnergy(e, reg.left, reg.bot - chh, reg.left + cw, reg.bot, w),
      bandEnergy(e, reg.right - cw, reg.bot - chh, reg.right, reg.bot, w),
    ];
    const surf = analyzeSurface(e, reg, w);
    const cornerBase = stats(cornerE).mean;
    const cornerWear = Math.min(1, cornerBase / (blurProxy * 2 + 1e-6));

    // edges: 4 strips 6% wide along region edges
    const es = rw * 0.06;
    const edgeE = [
      bandEnergy(e, reg.left, reg.top, reg.left + es, reg.bot, w),
      bandEnergy(e, reg.right - es, reg.top, reg.right, reg.bot, w),
      bandEnergy(e, reg.left, reg.top, reg.right, reg.top + es, w),
      bandEnergy(e, reg.left, reg.bot - es, reg.right, reg.bot, w),
    ];
    const edgeWear = Math.min(1, stats(edgeE).mean / (blurProxy * 1.6 + 1e-6));

    // dimensions: aspect ratio vs standard card 63.5/88.9
    const ar = rw / rh, cardAR = 63.5 / 88.9;
    const arErr = Math.abs(ar - cardAR) / cardAR;
    const dimensions = Math.round(1000 * Math.max(0, 1 - arErr * 2.5));

    const lanes = {
      centering,
      corners: Math.round(1000 * (1 - cornerWear * 0.7)),
      edges: Math.round(1000 * (1 - edgeWear * 0.7)),
      surface: Math.round(1000 * (1 - Math.min(1, surf.density * 30))),
      dimensions,
    };
    for (const k of Object.keys(lanes)) lanes[k] = Math.max(0, Math.min(1000, lanes[k]));

    const confidence = Math.round(100 * (0.4 * blur + 0.4 * (1 - Math.min(1, glare * 8)) + 0.2 * Math.min(1, (rw * rh) / (w * h * 0.4))));

    return {
      ok: true,
      region: { l: reg.left / w, r: reg.right / w, t: reg.top / h, b: reg.bot / h },
      aspectRatio: +ar.toFixed(3),
      lanes,
      defects: surf.defects,       // real normalized coords on the capture
      quality: { blur: +blur.toFixed(2), glare: +glare.toFixed(3) },
      confidence,
    };
  }

  return { analyze };
})();
window.VisionLocal = VisionLocal;
