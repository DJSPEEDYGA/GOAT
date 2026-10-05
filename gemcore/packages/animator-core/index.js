// GemCore Animator — exports real 3D assets from submission evidence.
// GLB (Unreal/Blender/three.js) + USDZ (iOS AR Quick Look).
// No external deps — GLB and USDZ (zip-store) written by hand.

const BASE64 = s => Buffer.from(s.split(',')[1] || s, 'base64');

/* ── GLB: slab mesh (box) textured with the card image ─────────────── */
function buildGLB(cardDataUrl, meta = {}) {
  // slab dims: 89×137×8mm normalized to meters
  const W = 0.089, H = 0.137, T = 0.008;
  const x = W / 2, y = H / 2, z = T / 2;
  // 24 verts (per-face normals), positions + normals + uvs
  const pos = [], nrm = [], uv = [], idx = [];
  const face = (p, n, u) => {
    const base = pos.length / 3;
    p.forEach(v => pos.push(...v));
    u.forEach(t => uv.push(...t));
    for (let i = 0; i < 4; i++) nrm.push(...n);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  // front (+z): card face texture
  face([[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]], [0, 0, 1],
       [[0, 1], [1, 1], [1, 0], [0, 0]]);
  // back (-z) — uses same texture (back side of slab face)
  face([[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]], [0, 0, -1],
       [[0, 1], [1, 1], [1, 0], [0, 0]]);
  // 4 edges — untextured gold trim feel via material roughness
  face([[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]], [-1, 0, 0], [[0, 0], [0, 0], [0, 0], [0, 0]]);
  face([[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]], [1, 0, 0], [[0, 0], [0, 0], [0, 0], [0, 0]]);
  face([[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]], [0, 1, 0], [[0, 0], [0, 0], [0, 0], [0, 0]]);
  face([[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]], [0, -1, 0], [[0, 0], [0, 0], [0, 0], [0, 0]]);

  const imgBuf = cardDataUrl ? BASE64(cardDataUrl) : Buffer.alloc(0);
  const mime = (cardDataUrl || '').match(/^data:(image\/\w+)/)?.[1] || 'image/png';

  const bpos = Buffer.from(new Float32Array(pos).buffer);
  const bnrm = Buffer.from(new Float32Array(nrm).buffer);
  const buv = Buffer.from(new Float32Array(uv).buffer);
  const bidx = Buffer.from(new Uint16Array(idx).buffer);
  const pad4 = b => Buffer.concat([b, Buffer.alloc((4 - b.length % 4) % 4)]);

  const views = [];
  let off = 0;
  const push = (b, tgt) => { views.push({ buffer: 0, byteOffset: off, byteLength: b.length, target: tgt }); off += pad4(b).length; return views.length - 1; };
  const vPos = push(bpos, 34962), vNrm = push(bnrm, 34962), vUv = push(buv, 34962), vIdx = push(bidx, 34963);
  const vImg = imgBuf.length ? push(imgBuf) : null;

  const gltf = {
    asset: { version: '2.0', generator: `GemCore Animator — ${meta.name || 'slab'}` },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: meta.name || 'GemCore Slab' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    accessors: [
      { bufferView: vPos, componentType: 5126, count: pos.length / 3, type: 'VEC3', min: [-x, -y, -z], max: [x, y, z] },
      { bufferView: vNrm, componentType: 5126, count: nrm.length / 3, type: 'VEC3' },
      { bufferView: vUv, componentType: 5126, count: uv.length / 2, type: 'VEC2' },
      { bufferView: vIdx, componentType: 5123, count: idx.length, type: 'SCALAR' },
    ],
    bufferViews: views,
    buffers: [{ byteLength: off }],
    materials: [{ name: 'slab', doubleSided: true, pbrMetallicRoughness: {
      baseColorFactor: [0.9, 0.95, 1, 0.92], metallicFactor: 0.05, roughnessFactor: 0.15,
      ...(vImg != null ? { baseColorTexture: { index: 0 } } : {}) } }],
    ...(vImg != null ? {
      textures: [{ source: 0 }], images: [{ bufferView: vImg, mimeType: mime }],
      samplers: [{ magFilter: 9729, minFilter: 9987 }],
    } : {}),
  };

  const json = pad4(Buffer.from(JSON.stringify(gltf)));
  const bin = Buffer.concat([bpos, bnrm, buv, bidx, imgBuf].map(pad4));
  const head = Buffer.alloc(12); head.write('glTF'); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length, 0); jh.write('JSON', 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.write('BIN\0', 4);
  return Buffer.concat([head, jh, json, bh, bin]);
}

/* ── USDZ: zip-store container with a textured slab .usda ──────────── */
function crc32(buf) {
  let t = crc32.t; if (!t) {
    t = crc32.t = new Int32Array(256);
    for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c; }
  }
  let c = -1; for (const b of buf) c = (c >>> 8) ^ t[(c ^ b) & 255];
  return (c ^ -1) >>> 0;
}
function zipStore(files) {
  const chunks = [], central = [];
  let off = 0;
  for (const [name, data] of files) {
    const n = Buffer.from(name), d = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const crc = crc32(d);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(d.length, 18); lh.writeUInt32LE(d.length, 22);
    lh.writeUInt16LE(n.length, 26); lh.writeUInt16LE(0, 28);
    chunks.push(lh, n, d);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(d.length, 20); cd.writeUInt32LE(d.length, 24);
    cd.writeUInt16LE(n.length, 28); cd.writeUInt32LE(off, 42);
    central.push(cd, n);
    off += 30 + n.length + d.length;
  }
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50); eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(off, 16);
  return Buffer.concat([...chunks, cdBuf, eocd]);
}

function buildUSDZ(cardDataUrl, meta = {}) {
  const imgBuf = cardDataUrl ? BASE64(cardDataUrl) : null;
  const ext = (cardDataUrl || '').includes('png') ? 'png' : 'jpg';
  const usda = `#usda 1.0
(
  defaultPrim = "Slab"
  metersPerUnit = 1
  upAxis = "Y"
)
def Xform "Slab" (
  asset references = @./CardMesh.usd@
) {}
def Mesh "CardMesh"
{
    int[] faceVertexCounts = [4]
    int[] faceVertexIndices = [0, 1, 2, 3]
    point3f[] points = [(-0.0445, -0.0685, 0.004), (0.0445, -0.0685, 0.004), (0.0445, 0.0685, 0.004), (-0.0445, 0.0685, 0.004)]
    float2[] primvars:st = [(0,0), (1,0), (1,1), (0,1)] (interpolation = "faceVarying")
    uniform token subdivisionScheme = "none"
    rel material:binding = </CardMesh/Mat>
}
def Material "Mat"
{
    token outputs:surface.connect = </CardMesh/Mat/PBR.outputs:surface>
    def Shader "PBR" {
        uniform token info:id = "UsdPreviewSurface"
        float3 inputs:diffuseColor.connect = </CardMesh/Mat/Texture.outputs:rgb>
        token outputs:surface
    }
    def Shader "Texture" {
        uniform token info:id = "UsdUVTexture"
        asset inputs:file = @./card.${ext}@
        float4 inputs:st.connect = </CardMesh/Mat/ST.outputs:result>
        float3 outputs:rgb
    }
    def Shader "ST" {
        uniform token info:id = "UsdPrimvarReader_float2"
        token inputs:varname = "st"
        float2 inputs:fallback = (0,0)
        float2 outputs:result
    }
}
`;
  const files = [['Slab.usda', usda]];
  if (imgBuf) files.push([`card.${ext}`, imgBuf]);
  return zipStore(files);
}

module.exports = { buildGLB, buildUSDZ };
