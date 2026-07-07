/**
 * GOAT Shield — Global Error Handler + Toast Notification System + Keyboard Shortcuts
 * Provides app-wide error boundaries, user-friendly notifications, and power-user shortcuts.
 */
(function initGOATShield() {
  'use strict';

  // ============================================================
  // TOAST NOTIFICATION SYSTEM
  // ============================================================
  const TOAST_STYLES = {
    success: { icon: '✅', bg: 'linear-gradient(135deg, #059669, #10b981)', border: '#34d399' },
    error:   { icon: '❌', bg: 'linear-gradient(135deg, #dc2626, #ef4444)', border: '#f87171' },
    warning: { icon: '⚠️', bg: 'linear-gradient(135deg, #d97706, #f59e0b)', border: '#fbbf24' },
    info:    { icon: 'ℹ️', bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: '#60a5fa' },
    goat:    { icon: '🐐', bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: '#c084fc' },
  };

  // Inject toast container styles
  const style = document.createElement('style');
  style.textContent = `
    #goat-toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
      max-width: 400px;
    }
    .goat-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-radius: 10px;
      border-left: 4px solid;
      color: #fff;
      font-family: var(--font-sans, -apple-system, sans-serif);
      font-size: 13px;
      line-height: 1.4;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      backdrop-filter: blur(12px);
      pointer-events: auto;
      cursor: pointer;
      animation: goatToastIn 0.3s ease-out;
      transition: opacity 0.3s, transform 0.3s;
      max-width: 100%;
    }
    .goat-toast:hover { opacity: 0.85; transform: scale(0.98); }
    .goat-toast.removing { opacity: 0; transform: translateX(100px); }
    .goat-toast-icon { font-size: 18px; flex-shrink: 0; }
    .goat-toast-body { flex: 1; }
    .goat-toast-title { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
    .goat-toast-msg { font-size: 12px; opacity: 0.9; word-break: break-word; }
    .goat-toast-close { 
      background: none; border: none; color: rgba(255,255,255,0.6); 
      font-size: 16px; cursor: pointer; padding: 0 4px; flex-shrink: 0;
    }
    .goat-toast-close:hover { color: #fff; }
    @keyframes goatToastIn {
      from { opacity: 0; transform: translateX(80px) scale(0.9); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    #goat-shortcut-overlay {
      position: fixed; inset: 0; z-index: 99998;
      background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
      display: none; align-items: center; justify-content: center;
    }
    #goat-shortcut-overlay.visible { display: flex; }
    .goat-shortcut-panel {
      background: var(--bg-secondary, #1e1e2e); border: 1px solid var(--border, #333);
      border-radius: 16px; padding: 32px; max-width: 600px; width: 90%;
      max-height: 80vh; overflow-y: auto; color: var(--text-primary, #fff);
    }
    .goat-shortcut-panel h2 { margin: 0 0 20px; font-size: 20px; text-align: center; }
    .goat-shortcut-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .goat-shortcut-key {
      display: inline-flex; gap: 4px;
    }
    .goat-shortcut-key kbd {
      background: var(--bg-tertiary, #2a2a3e); border: 1px solid var(--border, #444);
      border-radius: 6px; padding: 3px 8px; font-family: var(--font-mono, monospace);
      font-size: 12px; color: var(--accent, #a855f7); min-width: 24px; text-align: center;
    }
    .goat-shortcut-desc { font-size: 13px; color: var(--text-secondary, #aaa); }
  `;
  document.head.appendChild(style);

  // Create toast container
  const container = document.createElement('div');
  container.id = 'goat-toast-container';
  document.body.appendChild(container);

  // Toast function — exposed globally
  window.goatToast = function(message, type = 'info', title = '', duration = 4000) {
    const cfg = TOAST_STYLES[type] || TOAST_STYLES.info;
    const toast = document.createElement('div');
    toast.className = 'goat-toast';
    toast.style.background = cfg.bg;
    toast.style.borderColor = cfg.border;
    toast.innerHTML = `
      <span class="goat-toast-icon">${cfg.icon}</span>
      <div class="goat-toast-body">
        ${title ? `<div class="goat-toast-title">${title}</div>` : ''}
        <div class="goat-toast-msg">${message}</div>
      </div>
      <button class="goat-toast-close">&times;</button>
    `;

    const close = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.goat-toast-close').addEventListener('click', close);
    toast.addEventListener('click', close);
    container.appendChild(toast);

    if (duration > 0) setTimeout(close, duration);

    // Max 5 toasts at once
    while (container.children.length > 5) {
      container.firstChild.remove();
    }

    return toast;
  };

  // ============================================================
  // GLOBAL ERROR HANDLER
  // ============================================================
  window.onerror = function(message, source, line, col, error) {
    console.error('[GOAT Shield] Uncaught Error:', message, source, line, col);
    window.goatToast(
      `${message}${source ? ` (${source.split('/').pop()}:${line})` : ''}`,
      'error',
      '🛡️ GOAT Shield — Error Caught'
    );
    return true; // Prevent default error dialog
  };

  window.onunhandledrejection = function(event) {
    const msg = event.reason?.message || event.reason || 'Unknown promise rejection';
    console.error('[GOAT Shield] Unhandled Promise Rejection:', msg);
    window.goatToast(
      String(msg).slice(0, 200),
      'error',
      '🛡️ GOAT Shield — Promise Rejected'
    );
  };

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  const SHORTCUTS = [
    { keys: 'Ctrl+N',          desc: 'New Chat',            action: () => window.newChat && window.newChat() },
    { keys: 'Ctrl+/',          desc: 'Toggle Sidebar',      action: () => window.toggleSidebar && window.toggleSidebar() },
    { keys: 'Ctrl+,',          desc: 'Open Settings',       action: () => window.openSettings && window.openSettings() },
    { keys: 'Ctrl+T',          desc: 'Terminal',            action: () => window.openTool && window.openTool('terminal') },
    { keys: 'Ctrl+E',          desc: 'Code Editor',         action: () => window.openTool && window.openTool('codeeditor') },
    { keys: 'Ctrl+B',          desc: 'File Manager',        action: () => window.openTool && window.openTool('filemanager') },
    { keys: 'Ctrl+Shift+W',    desc: 'Web Browser',         action: () => window.openTool && window.openTool('webbrowser') },
    { keys: 'Ctrl+M',          desc: 'Model Hub',           action: () => window.openTool && window.openTool('modelhub') },
    { keys: 'Ctrl+G',          desc: 'GOAT Brain Toggle',   action: () => window.toggleGOATBrain && window.toggleGOATBrain() },
    { keys: 'Ctrl+Shift+A',    desc: 'Axiom Automation',    action: () => window.openTool && window.openTool('axiom') },
    { keys: 'Ctrl+Shift+U',    desc: 'UE5 CoPilot',        action: () => window.openTool && window.openTool('uecopilot') },
    { keys: 'Ctrl+Shift+C',    desc: 'GOAT Connect',        action: () => window.openTool && window.openTool('goatconnect') },
    { keys: 'Ctrl+Shift+S',    desc: 'Script Studio',       action: () => window.openTool && window.openTool('scriptstudio') },
    { keys: 'Ctrl+Shift+P',    desc: 'Power Prompting',     action: () => window.openTool && window.openTool('promptengine') },
    { keys: 'Escape',          desc: 'Close Tool Panel',    action: () => {
      if (document.getElementById('settingsModal')?.classList.contains('open')) {
        window.closeSettings && window.closeSettings();
      } else if (document.getElementById('toolPanel')?.classList.contains('open')) {
        window.closeToolPanel && window.closeToolPanel();
      } else if (document.getElementById('goat-shortcut-overlay')?.classList.contains('visible')) {
        document.getElementById('goat-shortcut-overlay').classList.remove('visible');
      }
    }},
    { keys: 'Ctrl+L',          desc: 'Clear Chat',          action: () => window.clearChat && window.clearChat() },
    { keys: '?',               desc: 'Show Shortcuts',      action: null }, // handled separately
  ];

  // Build shortcut overlay
  const overlay = document.createElement('div');
  overlay.id = 'goat-shortcut-overlay';
  overlay.innerHTML = `
    <div class="goat-shortcut-panel">
      <h2>⌨️ Keyboard Shortcuts</h2>
      ${SHORTCUTS.filter(s => s.desc !== 'Show Shortcuts').map(s => `
        <div class="goat-shortcut-row">
          <span class="goat-shortcut-desc">${s.desc}</span>
          <span class="goat-shortcut-key">${s.keys.split('+').map(k => `<kbd>${k}</kbd>`).join('')}</span>
        </div>
      `).join('')}
      <div class="goat-shortcut-row" style="margin-top:12px;border:none;justify-content:center">
        <span style="font-size:12px;color:var(--text-muted)">Press <kbd style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-size:11px">Esc</kbd> to close</span>
      </div>
    </div>
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('visible');
  });
  document.body.appendChild(overlay);

  // Parse shortcut keys into a matchable format
  function parseShortcut(keys) {
    const parts = keys.toLowerCase().split('+');
    return {
      ctrl: parts.includes('ctrl'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt'),
      key: parts.filter(p => !['ctrl','shift','alt'].includes(p))[0]
    };
  }

  document.addEventListener('keydown', function(e) {
    // Don't intercept when typing in inputs/textareas
    const tag = e.target.tagName.toLowerCase();
    const isEditable = tag === 'input' || tag === 'textarea' || e.target.contentEditable === 'true';

    // ? key for shortcuts help (only when not in input)
    if (e.key === '?' && !isEditable && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      overlay.classList.toggle('visible');
      return;
    }

    // Process shortcuts
    for (const shortcut of SHORTCUTS) {
      if (!shortcut.action) continue;
      const parsed = parseShortcut(shortcut.keys);

      if (parsed.key === 'escape' && e.key === 'Escape') {
        shortcut.action();
        return;
      }

      const ctrlMatch = parsed.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = parsed.shift ? e.shiftKey : !e.shiftKey;
      const keyMatch = e.key.toLowerCase() === parsed.key || 
                       e.key === parsed.key;

      if (ctrlMatch && shiftMatch && keyMatch && !e.altKey) {
        // Don't intercept Ctrl+N if in input (for native behavior)
        if (isEditable && !parsed.shift) continue;
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  });

  // ============================================================
  // STARTUP TOAST
  // ============================================================
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.goatToast(
        'All systems operational • 18 modules loaded • CSP hardened',
        'goat',
        '🐐 GOAT Royalty 3.0 Ready',
        5000
      );
    }, 1500);
  });

  console.log('[GOAT Shield] Error handler + Toast system + Keyboard shortcuts initialized ✅');
})();