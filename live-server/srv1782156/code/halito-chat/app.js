const storageKeys = {
  node: 'offgrid-mesh-node',
  handle: 'offgrid-mesh-handle',
  packets: 'offgrid-mesh-packets',
  relayRoom: 'halito-chat-relay-room',
};

const els = {
  handle: document.querySelector('#handle'),
  saveHandle: document.querySelector('#save-handle'),
  nodeId: document.querySelector('#node-id'),
  peerCount: document.querySelector('#peer-count'),
  relayStatus: document.querySelector('#relay-status'),
  syncChat: document.querySelector('#sync-chat'),
  pairState: document.querySelector('#pair-state'),
  messages: document.querySelector('#messages'),
  messageForm: document.querySelector('#message-form'),
  messageInput: document.querySelector('#message-input'),
  signalInput: document.querySelector('#signal-input'),
  signalOutput: document.querySelector('#signal-output'),
  createOffer: document.querySelector('#create-offer'),
  createAnswer: document.querySelector('#create-answer'),
  acceptAnswer: document.querySelector('#accept-answer'),
  useSignal: document.querySelector('#use-signal'),
  copySignal: document.querySelector('#copy-signal'),
  shareSignal: document.querySelector('#share-signal'),
  connectionLog: document.querySelector('#connection-log'),
  peers: document.querySelector('#peers-list') || document.querySelector('#peers'),
  exportPackets: document.querySelector('#export-packets'),
  packetImport: document.querySelector('#packet-import'),
  importPackets: document.querySelector('#import-packets'),
};

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 4,
};

const maxTtl = 8;
const defaultRelayRoom = 'halito_lobby';
const state = {
  nodeId: loadNodeId(),
  handle: localStorage.getItem(storageKeys.handle) || `node-${Math.random().toString(16).slice(2, 6)}`,
  packets: loadPackets(),
  peers: new Map(),
  pendingConnection: null,
  relayRoom: '',
  relayLastSeen: 0,
  relayTimer: null,
};

function apiPath(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const configuredBase = document.querySelector('meta[name="halito-api-base"]')?.getAttribute('content')?.trim();
  if (configuredBase) return `${configuredBase.replace(/\/+$/, '')}${normalized}`;
  return `.${normalized}`;
}

els.handle.value = state.handle;
els.nodeId.textContent = `Node ${state.nodeId}`;

function loadNodeId() {
  const existing = localStorage.getItem(storageKeys.node);
  if (existing) return existing;
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(storageKeys.node, id);
  return id;
}

function loadPackets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKeys.packets) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isPacket) : [];
  } catch {
    return [];
  }
}

function savePackets() {
  localStorage.setItem(storageKeys.packets, JSON.stringify(state.packets.slice(-800)));
}

function isPacket(packet) {
  return Boolean(
    packet &&
      typeof packet.id === 'string' &&
      typeof packet.authorId === 'string' &&
      typeof packet.author === 'string' &&
      typeof packet.body === 'string' &&
      typeof packet.createdAt === 'number',
  );
}

function setPairState(text, tone = 'muted') {
  els.pairState.textContent = text;
  els.pairState.className = `status-pill ${tone}`;
  addConnectionLog(text);
}

function setRelayStatus(text, tone = '') {
  if (!els.relayStatus) return;
  els.relayStatus.textContent = text;
  els.relayStatus.className = `relay-status ${tone}`.trim();
}

function addConnectionLog(text) {
  if (!els.connectionLog) return;
  const item = document.createElement('p');
  const timestamp = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(Date.now());
  item.textContent = `${timestamp} ${text}`;
  els.connectionLog.prepend(item);

  while (els.connectionLog.children.length > 5) {
    els.connectionLog.lastElementChild?.remove();
  }
}

function showSignalSheet(title) {
  const signal = els.signalOutput.value.trim();
  if (!signal) return;

  document.querySelector('.signal-sheet')?.remove();

  const sheet = document.createElement('div');
  sheet.className = 'signal-sheet';
  sheet.innerHTML = `
    <div class="signal-sheet-card" role="dialog" aria-modal="true" aria-labelledby="signal-sheet-title">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Signal ready</p>
          <h2 id="signal-sheet-title">${escapeHtml(title)}</h2>
        </div>
        <button type="button" class="small" data-signal-close>Close</button>
      </div>
      <textarea readonly spellcheck="false">${escapeHtml(signal)}</textarea>
      <div class="split-row">
        <button type="button" data-signal-copy>Copy</button>
        <button type="button" data-signal-share>Share</button>
      </div>
    </div>
  `;

  sheet.querySelector('[data-signal-close]').addEventListener('click', () => sheet.remove());
  sheet.querySelector('[data-signal-copy]').addEventListener('click', async () => {
    await navigator.clipboard.writeText(signal);
    setPairState('signal copied', '');
  });
  sheet.querySelector('[data-signal-share]').addEventListener('click', async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Halito Chat signal', text: signal });
      setPairState('signal shared', '');
      return;
    }
    await navigator.clipboard.writeText(signal);
    setPairState('signal copied', '');
  });

  document.body.append(sheet);
  const textarea = sheet.querySelector('textarea');
  textarea.focus();
  textarea.select();
}

function createPacket(body) {
  const createdAt = Date.now();
  return {
    id: `${state.nodeId}:${createdAt}:${Math.random().toString(16).slice(2)}`,
    authorId: state.nodeId,
    author: state.handle,
    body,
    createdAt,
    ttl: maxTtl,
    path: [state.nodeId],
  };
}

function rememberPackets(packets, fromPeerId = null) {
  let accepted = 0;
  const acceptedPackets = [];
  const known = new Set(state.packets.map((packet) => packet.id));

  for (const incoming of packets) {
    if (!isPacket(incoming) || known.has(incoming.id)) continue;
    const ttl = Number.isFinite(incoming.ttl) ? incoming.ttl : maxTtl;
    if (ttl <= 0) continue;
    const path = Array.isArray(incoming.path) ? incoming.path : [];
    const nextPacket = {
      ...incoming,
      ttl,
      path: path.includes(state.nodeId) ? path : [...path, state.nodeId],
    };
    state.packets.push(nextPacket);
    acceptedPackets.push(nextPacket);
    known.add(incoming.id);
    accepted += 1;
  }

  if (accepted) {
    state.packets.sort((a, b) => a.createdAt - b.createdAt);
    savePackets();
    renderMessages();
    gossip(fromPeerId);
    void postRelayPackets(acceptedPackets);
  }

  return accepted;
}

function gossip(exceptPeerId = null) {
  const recent = state.packets.slice(-120).map((packet) => ({
    ...packet,
    ttl: Math.max(0, (Number.isFinite(packet.ttl) ? packet.ttl : maxTtl) - 1),
    path: Array.isArray(packet.path) && packet.path.includes(state.nodeId) ? packet.path : [...(packet.path || []), state.nodeId],
  }));

  for (const [peerId, peer] of state.peers) {
    if (peerId === exceptPeerId || peer.channel.readyState !== 'open') continue;
    peer.channel.send(JSON.stringify({ type: 'packets', packets: recent }));
  }

  void postRelayPackets(recent);
}

function renderMessages() {
  els.messages.innerHTML = '';
  const formatter = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' });

  for (const packet of state.packets.slice(-180)) {
    const item = document.createElement('article');
    item.className = `message ${packet.authorId === state.nodeId ? 'mine' : ''}`;
    const hops = Array.isArray(packet.path) ? Math.max(0, packet.path.length - 1) : 0;
    item.innerHTML = `
      <div class="message-meta">
        <span>${escapeHtml(packet.author)}</span>
        <span>${formatter.format(packet.createdAt)} · ${hops} hop${hops === 1 ? '' : 's'}</span>
      </div>
      <p class="message-text">${escapeHtml(packet.body)}</p>
    `;
    els.messages.append(item);
  }

  els.messages.scrollTop = els.messages.scrollHeight;
}

function renderPeers() {
  const openPeers = [...state.peers.values()].filter((peer) => peer.channel.readyState === 'open');
  els.peerCount.textContent = state.relayRoom && !openPeers.length
    ? 'shared room'
    : `${openPeers.length} peer${openPeers.length === 1 ? '' : 's'}`;
  els.peers.innerHTML = '';

  if (!state.peers.size && !state.relayRoom) {
    els.peers.innerHTML = '<p class="node-id">No live links yet. Create an offer and exchange it with a nearby device.</p>';
    return;
  }

  if (state.relayRoom) {
    const row = document.createElement('div');
    row.className = 'peer';
    row.innerHTML = `
      <div>
        <strong>Relay fallback</strong>
        <span>${escapeHtml(state.relayRoom)}</span>
      </div>
      <span>polling</span>
    `;
    els.peers.append(row);
  }

  for (const [peerId, peer] of state.peers) {
    const row = document.createElement('div');
    row.className = 'peer';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(peer.handle || 'Unknown peer')}</strong>
        <span>${escapeHtml(peerId)}</span>
      </div>
      <span>${escapeHtml(peer.channel.readyState)}</span>
    `;
    els.peers.append(row);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function encodeSignal(signal) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(signal))));
}

function decodeSignal(value) {
  return JSON.parse(decodeURIComponent(escape(atob(value.trim()))));
}

function createRelayRoom() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `halito_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function startRelay(room) {
  if (!room || state.relayRoom === room) return;
  state.relayRoom = room;
  localStorage.setItem(storageKeys.relayRoom, room);
  state.relayLastSeen = 0;
  setRelayStatus(`Shared room connected: ${room}`);
  addConnectionLog(`relay ${room}`);
  renderPeers();

  if (state.relayTimer) window.clearInterval(state.relayTimer);
  state.relayTimer = window.setInterval(pollRelay, 750);
  void postRelayPackets(state.packets.slice(-120));
  void pollRelay();
}

function getInitialRelayRoom() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || defaultRelayRoom;
}

async function postRelayPackets(packets) {
  if (!state.relayRoom || !packets.length) return;

  try {
    await fetch(apiPath(`/api/relay/${encodeURIComponent(state.relayRoom)}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packets }),
    });
  } catch {
    setRelayStatus('Shared room write failed. Tap Sync or reload.', 'warn');
    addConnectionLog('relay post failed');
  }
}

async function pollRelay() {
  if (!state.relayRoom) return;

  try {
    const response = await fetch(apiPath(`/api/relay/${encodeURIComponent(state.relayRoom)}?since=${state.relayLastSeen}`));
    if (!response.ok) throw new Error('Relay poll failed.');
    const data = await response.json();
    state.relayLastSeen = Number(data.latest || state.relayLastSeen);
    if (Array.isArray(data.packets) && rememberPackets(data.packets, 'relay')) {
      addConnectionLog('relay packets received');
    }
    setRelayStatus(`Shared room connected: ${state.relayRoom}`);
  } catch {
    setRelayStatus('Shared room sync failed. Tap Sync or reload.', 'warn');
    addConnectionLog('relay poll failed');
  }
}

function makePeerConnection() {
  const pc = new RTCPeerConnection(rtcConfig);
  pc.addEventListener('connectionstatechange', () => {
    setPairState(`peer ${pc.connectionState}`, pc.connectionState === 'failed' ? 'muted' : '');
  });
  pc.addEventListener('iceconnectionstatechange', () => {
    addConnectionLog(`ice ${pc.iceConnectionState}`);
  });
  pc.addEventListener('icegatheringstatechange', () => {
    addConnectionLog(`gathering ${pc.iceGatheringState}`);
  });
  return pc;
}

function waitForIceGathering(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      addConnectionLog('signal ready with partial ICE');
      resolve();
    }, 8000);
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') {
        window.clearTimeout(timeout);
        resolve();
      }
    });
  });
}

function attachChannel(pc, channel) {
  const peer = {
    id: `pending-${Math.random().toString(16).slice(2)}`,
    handle: '',
    pc,
    channel,
  };

  channel.addEventListener('open', () => {
    addConnectionLog('data channel open');
    channel.send(JSON.stringify({
      type: 'hello',
      nodeId: state.nodeId,
      handle: state.handle,
    }));
    channel.send(JSON.stringify({ type: 'packets', packets: state.packets.slice(-120) }));
    renderPeers();
    setPairState('linked', '');
  });

  channel.addEventListener('message', (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }

    if (payload.type === 'hello' && typeof payload.nodeId === 'string') {
      state.peers.delete(peer.id);
      peer.id = payload.nodeId;
      peer.handle = typeof payload.handle === 'string' ? payload.handle : '';
      state.peers.set(peer.id, peer);
      renderPeers();
      return;
    }

    if (payload.type === 'packets' && Array.isArray(payload.packets)) {
      rememberPackets(payload.packets, peer.id);
    }
  });

  channel.addEventListener('close', renderPeers);
  channel.addEventListener('close', () => addConnectionLog('data channel closed'));
  channel.addEventListener('error', () => {
    addConnectionLog('data channel error');
    renderPeers();
  });
  state.peers.set(peer.id, peer);
  renderPeers();
  return peer;
}

async function createOffer() {
  setPairState('creating offer', '');
  const relayRoom = createRelayRoom();
  startRelay(relayRoom);
  const pc = makePeerConnection();
  const channel = pc.createDataChannel('mesh');
  attachChannel(pc, channel);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForIceGathering(pc);
  state.pendingConnection = pc;
  els.signalOutput.value = encodeSignal({
    kind: 'offer',
    from: state.nodeId,
    handle: state.handle,
    room: relayRoom,
    description: pc.localDescription,
  });
  setPairState('offer ready', '');
  showSignalSheet('Send this offer to the other device');
}

async function createAnswer() {
  setPairState('creating answer', '');
  const signal = getPastedSignal();
  if (signal.kind !== 'offer') throw new Error('Paste an offer first.');
  startRelay(signal.room || createRelayRoom());
  const pc = makePeerConnection();
  pc.addEventListener('datachannel', (event) => attachChannel(pc, event.channel));
  await pc.setRemoteDescription(signal.description);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitForIceGathering(pc);
  els.signalOutput.value = encodeSignal({
    kind: 'answer',
    from: state.nodeId,
    handle: state.handle,
    room: state.relayRoom,
    description: pc.localDescription,
  });
  setPairState('answer ready', '');
  showSignalSheet('Send this answer back to the offer device');
}

async function acceptAnswer() {
  setPairState('accepting answer', '');
  const signal = getPastedSignal();
  if (signal.kind !== 'answer') throw new Error('Paste an answer first.');
  if (!state.pendingConnection) throw new Error('Create an offer before accepting an answer.');
  startRelay(signal.room || state.relayRoom || createRelayRoom());
  await state.pendingConnection.setRemoteDescription(signal.description);
  setPairState('connecting', '');
}

function getPastedSignal() {
  const raw = els.signalInput.value.trim();
  if (!raw) throw new Error('Paste a signal first.');
  const signal = decodeSignal(raw);
  if (signal.kind === 'offer') addConnectionLog('pasted signal is an offer');
  if (signal.kind === 'answer') addConnectionLog('pasted signal is an answer');
  return signal;
}

async function usePastedSignal() {
  const signal = getPastedSignal();
  if (signal.kind === 'offer') {
    await createAnswer();
    return;
  }
  if (signal.kind === 'answer') {
    if (!state.pendingConnection) {
      throw new Error('This is an answer. Paste it on the device that created the offer.');
    }
    await acceptAnswer();
    return;
  }
  throw new Error('Signal must be an offer or answer.');
}

function showError(error) {
  setPairState(error instanceof Error ? error.message : 'signal failed', 'muted');
}

els.saveHandle.addEventListener('click', () => {
  state.handle = els.handle.value.trim().slice(0, 32) || state.handle;
  els.handle.value = state.handle;
  localStorage.setItem(storageKeys.handle, state.handle);
});

els.messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const body = els.messageInput.value.trim();
  if (!body) return;
  rememberPackets([createPacket(body)]);
  els.messageInput.value = '';
  gossip();
});

els.createOffer.addEventListener('click', () => createOffer().catch(showError));
els.createAnswer?.addEventListener('click', () => createAnswer().catch(showError));
els.acceptAnswer?.addEventListener('click', () => acceptAnswer().catch(showError));
els.useSignal?.addEventListener('click', () => usePastedSignal().catch(showError));
els.syncChat?.addEventListener('click', () => {
  setRelayStatus(`Syncing shared room: ${state.relayRoom || defaultRelayRoom}`);
  void postRelayPackets(state.packets.slice(-120));
  void pollRelay();
});

els.copySignal.addEventListener('click', async () => {
  await navigator.clipboard.writeText(els.signalOutput.value);
  setPairState('copied', '');
});

els.shareSignal.addEventListener('click', async () => {
  const signal = els.signalOutput.value.trim();
  if (!signal) {
    setPairState('nothing to share', 'muted');
    return;
  }

  if (navigator.share) {
    await navigator.share({
      title: 'Halito Chat signal',
      text: signal,
    });
    setPairState('shared', '');
    return;
  }

  await navigator.clipboard.writeText(signal);
  setPairState('copied', '');
});

els.exportPackets.addEventListener('click', async () => {
  const bundle = encodeSignal({
    kind: 'packet-bundle',
    from: state.nodeId,
    packets: state.packets.slice(-240),
  });
  await navigator.clipboard.writeText(bundle);
  els.signalOutput.value = bundle;
  setPairState('bundle copied', '');
});

els.importPackets.addEventListener('click', () => {
  try {
    const bundle = decodeSignal(els.packetImport.value);
    if (!Array.isArray(bundle.packets)) throw new Error('Bundle has no packets.');
    const count = rememberPackets(bundle.packets);
    setPairState(`${count} imported`, '');
  } catch (error) {
    showError(error);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

startRelay(getInitialRelayRoom());
renderMessages();
renderPeers();
