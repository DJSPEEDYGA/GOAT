(function () {
  function addStyles() {
    if (document.getElementById('money-penny-restore-style')) return;
    const style = document.createElement('style');
    style.id = 'money-penny-restore-style';
    style.textContent = `
      .money-penny-restore-ribbon{
        position:sticky;top:0;z-index:3000;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;
        padding:10px 18px;background:linear-gradient(135deg,rgba(5,10,20,.96),rgba(32,20,6,.96));border-bottom:1px solid rgba(240,192,64,.42);
        box-shadow:0 10px 40px rgba(0,0,0,.32);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      .money-penny-restore-brand{display:flex;align-items:center;gap:10px;color:#fff0c8;text-decoration:none;font-weight:950;letter-spacing:.01em}
      .money-penny-restore-brand img{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid rgba(240,192,64,.55);box-shadow:0 0 18px rgba(240,192,64,.28)}
      .money-penny-restore-brand span{display:block;font-size:14px;line-height:1.05}
      .money-penny-restore-brand small{display:block;color:#d4a03c;font-size:10px;text-transform:uppercase;letter-spacing:.12em;margin-top:3px}
      .money-penny-restore-links{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .money-penny-restore-links a{display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:900;border:1px solid rgba(240,192,64,.35);color:#f8fafc;background:rgba(15,23,42,.7)}
      .money-penny-restore-links a.primary{background:linear-gradient(135deg,#fff0a8,#d4a03c);color:#080808;border-color:#f0c040}
      .money-penny-restore-links a.store{background:linear-gradient(135deg,#f0c040,#ff7a18);color:#080808;border-color:#ffcf66}
      .money-penny-restore-links a:hover{transform:translateY(-1px);filter:brightness(1.08)}
      @media(max-width:720px){.money-penny-restore-ribbon{align-items:flex-start}.money-penny-restore-links a{font-size:11px;padding:7px 9px}}
    `;
    document.head.appendChild(style);
  }

  function shouldAddRibbon() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    const hasMoneyPennyStore = pageText.includes('money penny') && pageText.includes('store');
    const hasVisibleStoreLink = Array.from(document.querySelectorAll('a')).some(a => {
      const text = `${a.textContent || ''} ${a.getAttribute('href') || ''}`.toLowerCase();
      return text.includes('money penny') && (text.includes('store') || text.includes('home'));
    });
    return !(hasMoneyPennyStore && hasVisibleStoreLink);
  }

  function addRibbon() {
    if (document.querySelector('.money-penny-restore-ribbon')) return;
    addStyles();
    const ribbon = document.createElement('div');
    ribbon.className = 'money-penny-restore-ribbon';
    ribbon.innerHTML = `
      <a class="money-penny-restore-brand" href="index.html" aria-label="Money Penny Store Home">
        <img src="money-penny-logo.png" alt="Money Penny" onerror="this.style.display='none'">
        <span>Money Penny Store<small>Home beside the GOAT tools</small></span>
      </a>
      <nav class="money-penny-restore-links" aria-label="Money Penny restored navigation">
        <a class="primary" href="index.html">💰 Home</a>
        <a class="store" href="shop.html">🛍️ Store</a>
        <a href="goat-launcher-home.html">🐐 Launcher</a>
        <a href="studio.html">🎛️ Studio</a>
        <a href="beat-maker.html">🥁 Beats</a>
        <a href="recording-studio.html">🎙️ Recording</a>
        <a href="music-studio.html">🎚️ Music Lab</a>
      </nav>
    `;
    document.body.prepend(ribbon);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (shouldAddRibbon()) addRibbon();
  });
})();
