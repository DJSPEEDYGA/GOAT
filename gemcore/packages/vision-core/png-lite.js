'use strict';
// Minimal PNG decoder — 8-bit RGB/RGBA, non-interlaced. zlib is builtin.
const zlib = require('zlib');

function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not PNG');
  let pos = 8, w = 0, h = 0, bitDepth = 8, colorType = 6, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error('only 8-bit PNG');
  const ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!ch) throw new Error('unsupported colorType ' + colorType);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch, px = Buffer.alloc(w * h * ch);
  let ri = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[ri++];
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= ch && y > 0 ? px[(y - 1) * stride + x - ch] : 0;
      const v = raw[ri++];
      let out = v;
      if (f === 1) out = v + a;
      else if (f === 2) out = v + b;
      else if (f === 3) out = v + ((a + b) >> 1);
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      px[y * stride + x] = out & 255;
    }
  }
  return { width: w, height: h, channels: ch, data: px };
}

function toGray(png) {
  const { width: w, height: h, channels: ch, data } = png;
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * ch;
    g[i] = ch === 1 ? data[o] : data[o] * .299 + data[o + 1] * .587 + data[o + 2] * .114;
  }
  return { w, h, g };
}

module.exports = { decodePNG, toGray };
