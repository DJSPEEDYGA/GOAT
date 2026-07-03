(function () {
  const DEFAULT_LIBRARY = {
    title: 'GOAT Beats + Sounds Lab',
    soundSlots: [
      { id: 'kick', name: 'Kick', role: 'Low-end anchor', tags: ['808', 'punch', 'trap'], recordingNote: 'Tune kick and 808 so the vocal still has room.' },
      { id: 'snare', name: 'Snare', role: 'Backbeat', tags: ['snap', 'clap'], recordingNote: 'Keep the snare pocket clean before adding reverb.' },
      { id: 'hat', name: 'Hi-hat', role: 'Motion', tags: ['rolls', 'swing'], recordingNote: 'Automate density from verse to hook.' },
      { id: 'bass', name: 'Bass / 808', role: 'Power', tags: ['sub', 'glide'], recordingNote: 'Keep sub mono and print a saturation layer.' }
    ],
    kits: [],
    recordingChains: []
  };

  function injectStyles() {
    if (document.getElementById('goat-beats-sounds-lab-style')) return;
    const style = document.createElement('style');
    style.id = 'goat-beats-sounds-lab-style';
    style.textContent = `
      .goat-bs-lab{margin:24px 0;padding:22px;border:1px solid rgba(212,160,60,.38);border-radius:18px;background:linear-gradient(135deg,rgba(10,14,23,.92),rgba(39,15,72,.72));box-shadow:0 18px 60px rgba(0,0,0,.22)}
      .goat-bs-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px}
      .goat-bs-head h2,.goat-bs-head h3{margin:0;color:#f0c040;font-size:clamp(1.3rem,2.5vw,2rem)}
      .goat-bs-head p{margin:.35rem 0 0;color:#d4d4d8;max-width:760px}
      .goat-bs-actions{display:flex;gap:8px;flex-wrap:wrap}
      .goat-bs-actions a,.goat-bs-actions button{border:1px solid rgba(240,192,64,.45);background:rgba(240,192,64,.1);color:#ffe08a;border-radius:999px;padding:8px 12px;font-weight:800;font-size:12px;text-decoration:none;cursor:pointer}
      .goat-bs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
      .goat-bs-card{border:1px solid rgba(255,255,255,.11);background:rgba(5,8,15,.72);border-radius:14px;padding:14px;min-height:140px}
      .goat-bs-card b{display:block;color:#fff;margin-bottom:5px}
      .goat-bs-card small{display:block;color:#5eead4;text-transform:uppercase;letter-spacing:.08em;font-weight:900;margin-bottom:8px}
      .goat-bs-card p{color:#cbd5e1;font-size:13px;line-height:1.45;margin:0 0 10px}
      .goat-bs-tags{display:flex;gap:6px;flex-wrap:wrap}
      .goat-bs-tags span{font-size:10px;color:#0a0e17;background:#f0c040;border-radius:999px;padding:3px 7px;font-weight:900}
      .goat-bs-chain{margin-top:14px;border-top:1px solid rgba(255,255,255,.12);padding-top:14px}
      .goat-bs-chain ul{margin:8px 0 0 18px;color:#d4d4d8;font-size:13px}
      .goat-bs-note{margin-top:12px;color:#bbf7d0;font-size:12px;border:1px solid rgba(34,197,94,.28);background:rgba(34,197,94,.08);padding:10px;border-radius:10px}
    `;
    document.head.appendChild(style);
  }

  async function loadLibrary() {
    try {
      const response = await fetch('data/goat-beats-sounds-library.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Library unavailable');
      return await response.json();
    } catch {
      return DEFAULT_LIBRARY;
    }
  }

  function kitCard(kit) {
    return `
      <article class="goat-bs-card">
        <small>${escapeHtml(kit.genre || 'Beat Kit')} • ${escapeHtml(kit.bpm || '')} BPM</small>
        <b>${escapeHtml(kit.name)}</b>
        <p><strong>Key:</strong> ${escapeHtml(kit.key || 'TBD')}</p>
        <p>${escapeHtml(kit.useCase || '')}</p>
        <div class="goat-bs-tags">${(kit.sounds || []).slice(0, 6).map(sound => `<span>${escapeHtml(sound)}</span>`).join('')}</div>
      </article>`;
  }

  function slotCard(slot) {
    return `
      <article class="goat-bs-card">
        <small>${escapeHtml(slot.role || 'Sound Slot')}</small>
        <b>${escapeHtml(slot.name)}</b>
        <p>${escapeHtml(slot.recordingNote || '')}</p>
        <div class="goat-bs-tags">${(slot.tags || []).slice(0, 6).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </article>`;
  }

  function chainBlock(chains, context) {
    const wanted = context === 'recording' ? 'vocal-over-beat' : context === 'music' ? 'sync-ready-cue' : 'beat-stem-session';
    const chain = chains.find(item => item.id === wanted) || chains[0];
    if (!chain) return '';
    return `
      <div class="goat-bs-chain">
        <b>${escapeHtml(chain.name)} Handoff</b>
        <ul>${(chain.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
        <div class="goat-bs-note">${escapeHtml(chain.handoff || '')}</div>
      </div>`;
  }

  function render(container, library) {
    const context = container.dataset.context || 'studio';
    const cards = context === 'recording'
      ? (library.soundSlots || []).map(slotCard)
      : (library.kits || []).map(kitCard);
    container.classList.add('goat-bs-lab');
    container.innerHTML = `
      <div class="goat-bs-head">
        <div>
          <h2>🥁 Beats + Sounds Lab</h2>
          <p>Original beat recipes, sound slots, recording chains, and stem handoffs for the GOAT Royalty Recording Studio and Music Production Lab.</p>
        </div>
        <div class="goat-bs-actions">
          <a href="index.html">💰 Money Penny Home</a>
          <a href="shop.html">🛍️ Store</a>
          <a href="beat-maker.html">🥁 Beat Maker</a>
          <a href="goat-sound-library.html">📚 Sound Library</a>
        </div>
      </div>
      <div class="goat-bs-grid">${cards.join('')}</div>
      ${chainBlock(library.recordingChains || [], context)}
    `;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const containers = document.querySelectorAll('[data-goat-beats-sounds-lab]');
    if (!containers.length) return;
    injectStyles();
    const library = await loadLibrary();
    containers.forEach(container => render(container, library));
  });
})();
