(function () {
  'use strict';

  const messages = {
    'View Documentation': 'Documentation lane: connect this button to the final docs page or generated PDF handoff.',
    'Update Preferences': 'Dating/VIP demo: preference saves should connect to the private member profile database after privacy terms are approved.',
    'Upgrade Now': 'VIP demo: paid upgrade must route through owner-approved payments and subscription terms before real billing.',
    'Complete Verification': 'Verification demo: identity checks require licensed provider, consent capture, KYC/AML rules, and audit logs.',
    'Manual Deploy': 'Deploy demo: manual deployment should run from the owner-approved terminal script, not directly from a public browser button.',
    'Create NFT': 'NFT demo: minting stays off until wallet, rights metadata, chain selection, and owner approval are connected.',
    'Browse Marketplace': 'Marketplace demo: connect to the GOAT marketplace catalog after IP/provenance review.',
    'My Portfolio': 'Portfolio demo: connect to wallet/profile holdings after custody and privacy controls are approved.',
    'Download PDF': 'Background-check demo: PDF export requires licensed data source, consent trail, and report template.',
    'Share': 'Background-check demo: sharing requires recipient permissions, consent, and audit logging.',
    'Identity': 'Background-check filter demo: connect to verified identity provider results.',
    'Criminal': 'Background-check filter demo: connect only to lawful, licensed criminal-history data for approved jurisdictions.',
    'Financial': 'Background-check filter demo: connect to permitted financial-screening source with consent.',
    'Employment': 'Background-check filter demo: connect to employment verification provider.',
    'Education': 'Background-check filter demo: connect to education verification provider.',
    'Send': 'Message/demo action: connect to the local AGENT/crew bridge or approved outbound messaging lane.',
    'Batch Upload CSV': 'Batch demo: upload parser and consent validation need to be connected before real screening.',
    'View Analytics': 'Analytics demo: connect to verified checks, pass/fail status, and review queue metrics.',
    'Settings': 'Settings demo: connect to admin-only configuration with owner approval.',
    'Add Channel': 'Studio demo: channel creation should connect to the mixer/session state engine.',
    'Auto-Mix': 'Studio demo: AI mix action needs the local audio engine, stems, owner approval, and rollback snapshots.',
    'Auto-Master': 'Studio demo: mastering action needs loudness target, reference track, export path, and owner approval.',
    'AI Vocals': 'Studio demo: vocal generation requires rights/voice consent and a connected local model or licensed service.',
    'Beat Generation': 'Studio demo: beat generation needs the local sound library/session bridge.',
    'Add Effect': 'Studio demo: effect insert should connect to the plugin rack/session state.',
    'Invite': 'Studio demo: collaborator invites need account permissions and outbound messaging.'
  };

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().replace(/^[^\w]+/, '').trim();
  }

  function showDemoNotice(label, message) {
    let notice = document.getElementById('goatDemoNotice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'goatDemoNotice';
      notice.setAttribute('role', 'status');
      notice.style.cssText = [
        'position:fixed',
        'right:18px',
        'bottom:18px',
        'z-index:99999',
        'max-width:min(420px,calc(100vw - 36px))',
        'padding:14px 16px',
        'border:1px solid rgba(216,164,65,.55)',
        'border-radius:8px',
        'background:rgba(7,16,32,.96)',
        'color:#f8fafc',
        'box-shadow:0 18px 60px rgba(0,0,0,.38)',
        'font:600 14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'letter-spacing:0'
      ].join(';');
      document.body.appendChild(notice);
    }
    notice.innerHTML = '<strong style="color:#f5c76a;display:block;margin-bottom:4px;">GOAT investor demo action: ' +
      label.replace(/[&<>"']/g, '') +
      '</strong><span>' + message.replace(/[&<>"']/g, '') + '</span>';
    clearTimeout(showDemoNotice.timer);
    showDemoNotice.timer = setTimeout(() => { notice.remove(); }, 5200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(button => {
      const label = normalize(button.textContent);
      if (!messages[label]) return;
      if (button.disabled || button.hasAttribute('onclick') || button.dataset.action || button.dataset.href || button.hasAttribute('aria-controls') || button.hasAttribute('form')) return;
      button.dataset.goatDemoAction = label;
      button.addEventListener('click', event => {
        event.preventDefault();
        showDemoNotice(label, messages[label]);
      });
    });
  });
})();
