// ============================================================
// GOAT Secure Vault — AES-GCM Encrypted Storage
// API Keys · Contracts · Passwords · Sensitive Data
// Built for Harvey Miller (DJ Speedy)
// ============================================================

const GOATSecureVault = (() => {
  const VAULT_KEY = 'goat_vault_v1';
  let isUnlocked = false;
  let masterKey = null;
  let vaultData = { items: [], categories: [] };
  let activeCategory = 'all';
  let searchQuery = '';

  // ─── DEFAULT CATEGORIES ───────────────────────────────────
  const DEFAULT_CATEGORIES = [
    { id: 'api_keys', name: 'API Keys', icon: '🔑', color: '#76B900' },
    { id: 'contracts', name: 'Contracts & Agreements', icon: '📜', color: '#f59e0b' },
    { id: 'passwords', name: 'Passwords', icon: '🔒', color: '#ef4444' },
    { id: 'wallets', name: 'Crypto Wallets', icon: '💎', color: '#627EEA' },
    { id: 'licenses', name: 'Licenses & ISRC', icon: '📋', color: '#0ea5e9' },
    { id: 'banking', name: 'Banking & Payments', icon: '🏦', color: '#22c55e' },
    { id: 'personal', name: 'Personal Info', icon: '👤', color: '#8b5cf6' },
    { id: 'notes', name: 'Secure Notes', icon: '📝', color: '#6366f1' },
  ];

  // ─── CRYPTO HELPERS (Web Crypto API) ──────────────────────
  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encrypt(data, key) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(data)));
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
  }

  async function decrypt(encData, key) {
    const dec = new TextDecoder();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encData.iv) },
      key,
      new Uint8Array(encData.data)
    );
    return JSON.parse(dec.decode(decrypted));
  }

  async function hashPassword(password) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(password + '_goat_vault_salt'));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ─── VAULT OPERATIONS ─────────────────────────────────────
  async function unlockVault(password) {
    try {
      const stored = localStorage.getItem(VAULT_KEY);
      const passHash = await hashPassword(password);
      const salt = new Uint8Array(passHash.slice(0, 32).split('').map(c => c.charCodeAt(0)));
      masterKey = await deriveKey(password, salt);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.passCheck !== passHash.slice(0, 16)) throw new Error('Wrong password');
        vaultData = await decrypt(parsed.encrypted, masterKey);
      } else {
        vaultData = { items: [], categories: [...DEFAULT_CATEGORIES] };
        await saveVault(passHash);
      }
      isUnlocked = true;
      return true;
    } catch (e) {
      isUnlocked = false;
      masterKey = null;
      throw new Error('Failed to unlock vault: ' + e.message);
    }
  }

  async function saveVault(passHash) {
    if (!masterKey) return;
    if (!passHash) {
      const stored = localStorage.getItem(VAULT_KEY);
      if (stored) passHash = JSON.parse(stored).passCheck;
    }
    const encrypted = await encrypt(vaultData, masterKey);
    localStorage.setItem(VAULT_KEY, JSON.stringify({ passCheck: passHash, encrypted, version: 1, updatedAt: new Date().toISOString() }));
  }

  function lockVault() {
    isUnlocked = false;
    masterKey = null;
    vaultData = { items: [], categories: [] };
  }

  function addItem(item) {
    item.id = 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    vaultData.items.unshift(item);
    saveVault();
    return item;
  }

  function updateItem(id, updates) {
    const item = vaultData.items.find(i => i.id === id);
    if (item) { Object.assign(item, updates, { updatedAt: new Date().toISOString() }); saveVault(); }
  }

  function deleteItem(id) {
    vaultData.items = vaultData.items.filter(i => i.id !== id);
    saveVault();
  }

  function generatePassword(length = 24) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => chars[b % chars.length]).join('');
  }

  // ─── RENDER ───────────────────────────────────────────────
  function render(container) {
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:42px;margin-bottom:6px">🔐</div>
        <h3 style="font-size:18px;background:linear-gradient(135deg,var(--accent),#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GOAT Secure Vault</h3>
        <p style="font-size:12px;color:var(--text-muted)">AES-256-GCM Encrypted · Zero-Knowledge · Local Only</p>
      </div>
      <div id="vaultContent">${isUnlocked ? renderVaultContent() : renderLockScreen()}</div>
    `;
  }

  function renderLockScreen() {
    const hasVault = !!localStorage.getItem(VAULT_KEY);
    return `
      <div style="padding:30px;text-align:center">
        <div style="font-size:64px;margin-bottom:16px">🔒</div>
        <h3 style="color:var(--text-primary);margin-bottom:8px">${hasVault ? 'Unlock Your Vault' : 'Create Your Vault'}</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:20px">${hasVault ? 'Enter your master password to access your encrypted data' : 'Set a master password to create your encrypted vault'}</p>
        <div style="max-width:300px;margin:0 auto">
          <input type="password" class="terminal-input" id="vaultPassword" placeholder="Master Password" style="width:100%;text-align:center;font-size:16px;padding:12px;margin-bottom:8px" onkeydown="if(event.key==='Enter')window._vaultUnlock()">
          ${!hasVault ? '<input type="password" class="terminal-input" id="vaultPasswordConfirm" placeholder="Confirm Password" style="width:100%;text-align:center;font-size:16px;padding:12px;margin-bottom:8px" onkeydown="if(event.key===\'Enter\')window._vaultUnlock()">' : ''}
          <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,var(--accent),#ef4444);padding:12px;font-size:14px" onclick="window._vaultUnlock()">${hasVault ? '🔓 Unlock' : '🔐 Create Vault'}</button>
          <div id="vaultError" style="margin-top:10px;color:var(--red);font-size:12px"></div>
        </div>
        <div style="margin-top:20px;padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:11px;color:var(--text-muted);text-align:left">
          <strong>🛡️ Security:</strong><br>
          • AES-256-GCM encryption (military grade)<br>
          • PBKDF2 key derivation (310,000 iterations)<br>
          • All data stored locally — never leaves your device<br>
          • Zero-knowledge design — we never see your password
        </div>
      </div>`;
  }

  function renderVaultContent() {
    const categories = vaultData.categories || DEFAULT_CATEGORIES;
    const filteredItems = vaultData.items.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || (item.notes || '').toLowerCase().includes(q);
      }
      return true;
    });

    return `
      <!-- Toolbar -->
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" class="terminal-input" placeholder="Search vault..." style="flex:1" value="${searchQuery}" oninput="window._vaultSearch(this.value)">
        <button class="terminal-run-btn" style="padding:8px 14px;background:var(--accent)" onclick="window._vaultAddItem()">+ Add</button>
        <button class="terminal-run-btn" style="padding:8px 14px" onclick="window._vaultLock()">🔒 Lock</button>
      </div>

      <!-- Categories -->
      <div style="display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap">
        <button class="tool-btn" style="padding:4px 10px;flex-direction:row;font-size:11px;${activeCategory==='all'?'background:var(--accent);color:white;border-color:var(--accent)':''}" onclick="window._vaultCategory('all')">All (${vaultData.items.length})</button>
        ${categories.map(c => {
          const count = vaultData.items.filter(i => i.category === c.id).length;
          return `<button class="tool-btn" style="padding:4px 10px;flex-direction:row;font-size:11px;${activeCategory===c.id?`background:${c.color};color:white;border-color:${c.color}`:''}" onclick="window._vaultCategory('${c.id}')">${c.icon} ${c.name} (${count})</button>`;
        }).join('')}
      </div>

      <!-- Items -->
      <div id="vaultItems" style="display:grid;gap:6px">
        ${filteredItems.length === 0 ? `<div style="text-align:center;padding:30px;color:var(--text-muted)"><div style="font-size:32px;margin-bottom:8px">🔐</div><p>No items yet. Click "+ Add" to store your first secret.</p></div>` :
          filteredItems.map(item => {
            const cat = categories.find(c => c.id === item.category) || { icon: '📄', color: '#666' };
            return `<div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:18px">${cat.icon}</span>
                  <div>
                    <div style="font-weight:600;font-size:13px;color:var(--text-primary)">${escapeHtmlVault(item.name)}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${cat.name || item.category} · ${new Date(item.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style="display:flex;gap:4px">
                  <button style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px" onclick="window._vaultReveal('${item.id}')" title="Reveal">👁️</button>
                  <button style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px" onclick="window._vaultCopy('${item.id}')" title="Copy">📋</button>
                  <button style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px" onclick="window._vaultDelete('${item.id}')" title="Delete">🗑️</button>
                </div>
              </div>
              <div id="vaultReveal_${item.id}" style="display:none;margin-top:8px;padding:8px;background:var(--bg-secondary);border-radius:4px;font-family:var(--font-mono);font-size:12px;word-break:break-all;color:var(--green)"></div>
              ${item.notes ? `<div style="margin-top:6px;font-size:11px;color:var(--text-muted)">${escapeHtmlVault(item.notes).slice(0,100)}</div>` : ''}
            </div>`;
          }).join('')
        }
      </div>

      <!-- Password Generator -->
      <div style="margin-top:14px;padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
        <h5 style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🎲 Password Generator</h5>
        <div style="display:flex;gap:6px">
          <input type="text" class="terminal-input" id="vaultGenPassword" readonly style="flex:1;font-family:var(--font-mono);font-size:12px" value="${generatePassword()}">
          <button class="tool-btn" style="padding:6px 10px;flex-direction:row;font-size:11px" onclick="document.getElementById('vaultGenPassword').value=window._vaultGenerate()">🔄</button>
          <button class="tool-btn" style="padding:6px 10px;flex-direction:row;font-size:11px" onclick="navigator.clipboard.writeText(document.getElementById('vaultGenPassword').value)">📋</button>
        </div>
      </div>`;
  }

  function escapeHtmlVault(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // ─── GLOBAL HANDLERS ──────────────────────────────────────
  window._vaultUnlock = async function() {
    const pw = document.getElementById('vaultPassword')?.value;
    const pwConfirm = document.getElementById('vaultPasswordConfirm')?.value;
    const errEl = document.getElementById('vaultError');
    if (!pw) { if (errEl) errEl.textContent = 'Please enter a password'; return; }
    if (pwConfirm !== undefined && pw !== pwConfirm) { if (errEl) errEl.textContent = 'Passwords do not match'; return; }
    try {
      await unlockVault(pw);
      const c = document.getElementById('toolPanelContent');
      if (c) render(c);
    } catch (e) {
      if (errEl) errEl.textContent = e.message;
    }
  };

  window._vaultLock = function() { lockVault(); const c = document.getElementById('toolPanelContent'); if(c) render(c); };
  window._vaultSearch = function(q) { searchQuery = q; const el = document.getElementById('vaultItems'); if(el) { /* Re-render items only for perf */ const c = document.getElementById('toolPanelContent'); if(c) render(c); } };
  window._vaultCategory = function(cat) { activeCategory = cat; const c = document.getElementById('toolPanelContent'); if(c) render(c); };
  window._vaultGenerate = function() { return generatePassword(); };

  window._vaultAddItem = function() {
    const content = document.getElementById('vaultContent');
    if (!content) return;
    const categories = vaultData.categories || DEFAULT_CATEGORIES;
    content.innerHTML = `
      <h4 style="margin-bottom:12px;color:var(--text-secondary)">➕ Add New Item</h4>
      <div style="display:grid;gap:10px">
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Name *</label><input class="terminal-input" id="vaultNewName" placeholder="e.g., NVIDIA API Key" style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Category</label><select class="terminal-input" id="vaultNewCategory" style="width:100%">${categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}</select></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Secret Value *</label><textarea class="terminal-input" id="vaultNewValue" placeholder="The sensitive data to encrypt..." style="width:100%;min-height:80px;resize:vertical;font-family:var(--font-mono)"></textarea></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Username / Email (optional)</label><input class="terminal-input" id="vaultNewUsername" placeholder="username@email.com" style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">URL (optional)</label><input class="terminal-input" id="vaultNewUrl" placeholder="https://..." style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Notes (optional)</label><textarea class="terminal-input" id="vaultNewNotes" placeholder="Additional notes..." style="width:100%;min-height:60px;resize:vertical"></textarea></div>
        <div style="display:flex;gap:8px">
          <button class="terminal-run-btn" style="flex:1;background:var(--accent)" onclick="window._vaultSaveNew()">🔐 Encrypt & Save</button>
          <button class="terminal-run-btn" style="flex:1" onclick="window._vaultCancelAdd()">Cancel</button>
        </div>
      </div>`;
  };

  window._vaultSaveNew = function() {
    const name = document.getElementById('vaultNewName')?.value?.trim();
    const value = document.getElementById('vaultNewValue')?.value?.trim();
    if (!name || !value) { alert('Name and Secret Value are required'); return; }
    addItem({
      name,
      value,
      category: document.getElementById('vaultNewCategory')?.value || 'notes',
      username: document.getElementById('vaultNewUsername')?.value?.trim() || '',
      url: document.getElementById('vaultNewUrl')?.value?.trim() || '',
      notes: document.getElementById('vaultNewNotes')?.value?.trim() || ''
    });
    const c = document.getElementById('toolPanelContent');
    if (c) render(c);
  };

  window._vaultCancelAdd = function() { const c = document.getElementById('toolPanelContent'); if(c) render(c); };

  window._vaultReveal = function(id) {
    const el = document.getElementById('vaultReveal_' + id);
    if (!el) return;
    if (el.style.display === 'none') {
      const item = vaultData.items.find(i => i.id === id);
      if (item) {
        el.textContent = item.value;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; el.textContent = ''; }, 15000); // Auto-hide after 15s
      }
    } else {
      el.style.display = 'none';
      el.textContent = '';
    }
  };

  window._vaultCopy = function(id) {
    const item = vaultData.items.find(i => i.id === id);
    if (item) navigator.clipboard.writeText(item.value);
  };

  window._vaultDelete = function(id) {
    if (confirm('Delete this item? This cannot be undone.')) {
      deleteItem(id);
      const c = document.getElementById('toolPanelContent');
      if (c) render(c);
    }
  };

  return { render, unlockVault, lockVault, isUnlocked: () => isUnlocked };
})();

// Export for renderer
if (typeof window !== 'undefined') {
  window.GOATSecureVault = GOATSecureVault;
  window.renderSecureVault = function(container) { GOATSecureVault.render(container); };
}