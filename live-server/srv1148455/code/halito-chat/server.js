const { createReadStream, existsSync, statSync } = require('node:fs');
const { createServer } = require('node:http');
const { extname, join, normalize } = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 4177);
const host = process.env.HOST || '0.0.0.0';
const relayRooms = new Map();

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function getPath(url) {
  const parsed = new URL(url, `http://${host}:${port}`);
  const pathname = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  const normalized = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  return join(root, normalized);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error('Payload too large.'));
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

function getRelayRoom(roomId) {
  const safeRoomId = roomId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!safeRoomId) return null;
  if (!relayRooms.has(safeRoomId)) relayRooms.set(safeRoomId, []);
  return {
    id: safeRoomId,
    entries: relayRooms.get(safeRoomId),
  };
}

async function handleRelay(request, response, parsedUrl) {
  const roomId = parsedUrl.pathname.replace('/api/relay/', '');
  const room = getRelayRoom(roomId);
  if (!room) {
    sendJson(response, 400, { error: 'Relay room is required.' });
    return true;
  }

  if (request.method === 'GET') {
    const since = Number(parsedUrl.searchParams.get('since') || 0);
    const entries = room.entries.filter((entry) => entry.receivedAt > since);
    sendJson(response, 200, {
      room: room.id,
      latest: room.entries.at(-1)?.receivedAt ?? since,
      packets: entries.map((entry) => entry.packet),
    });
    return true;
  }

  if (request.method === 'POST') {
    try {
      const payload = await readJson(request);
      const packets = Array.isArray(payload.packets) ? payload.packets : [];
      const known = new Set(room.entries.map((entry) => entry.packet?.id).filter(Boolean));
      const now = Date.now();

      for (const packet of packets.slice(0, 120)) {
        if (!packet || typeof packet.id !== 'string' || known.has(packet.id)) continue;
        room.entries.push({ packet, receivedAt: now });
        known.add(packet.id);
      }

      room.entries.splice(0, Math.max(0, room.entries.length - 500));
      sendJson(response, 200, {
        room: room.id,
        latest: room.entries.at(-1)?.receivedAt ?? now,
        stored: room.entries.length,
      });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Relay write failed.' });
    }
    return true;
  }

  sendJson(response, 405, { error: 'Relay only supports GET and POST.' });
  return true;
}

const server = createServer((request, response) => {
  if (!request.url) {
    response.writeHead(405);
    response.end();
    return;
  }

  const parsedUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  if (parsedUrl.pathname.startsWith('/api/relay/')) {
    void handleRelay(request, response, parsedUrl);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405);
    response.end();
    return;
  }

  const filePath = getPath(request.url);
  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': types[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Halito Chat serving on http://${host}:${port}`);
});
