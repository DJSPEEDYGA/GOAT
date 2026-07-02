(function () {
  "use strict";

  if (window.__goatEpkMoneyMediaLoaded) return;
  window.__goatEpkMoneyMediaLoaded = true;

  const css = `
    .goat-money-media-dock{position:fixed;left:18px;right:18px;bottom:18px;z-index:9999;display:grid;grid-template-columns:minmax(220px,.8fr) minmax(260px,1.2fr) auto;gap:12px;align-items:center;padding:12px;border:1px solid rgba(243,188,84,.38);border-radius:12px;background:linear-gradient(135deg,rgba(7,9,12,.96),rgba(15,20,25,.94));box-shadow:0 18px 60px rgba(0,0,0,.46),0 0 0 1px rgba(255,255,255,.04) inset;color:#fff5df;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
    .goat-money-media-dock *{box-sizing:border-box;letter-spacing:0}
    .goat-money-video{height:86px;border-radius:8px;overflow:hidden;background:#050608;border:1px solid rgba(255,255,255,.12)}
    .goat-money-video video{width:100%;height:100%;object-fit:cover;display:block}
    .goat-money-copy b{display:block;color:#f3bc54;font-size:13px;text-transform:uppercase;letter-spacing:.14em}
    .goat-money-copy strong{display:block;margin-top:3px;font-size:18px;line-height:1.05}
    .goat-money-copy span{display:block;margin-top:4px;color:#cdd7df;font-size:12px;line-height:1.35}
    .goat-money-controls{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .goat-money-controls button,.goat-money-controls a{min-height:38px;border-radius:8px;border:1px solid rgba(255,255,255,.13);padding:9px 11px;background:rgba(255,255,255,.06);color:#fff5df;text-decoration:none;font-weight:850;font-size:12px;cursor:pointer}
    .goat-money-controls .gold{background:linear-gradient(135deg,#f3bc54,#ff9d42);border-color:transparent;color:#090806}
    .goat-money-meter{height:5px;margin-top:8px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}
    .goat-money-meter i{display:block;width:0;height:100%;background:linear-gradient(90deg,#f3bc54,#6bee9d)}
    body.goat-money-dock-space{padding-bottom:132px}
    @media(max-width:820px){.goat-money-media-dock{grid-template-columns:1fr;left:10px;right:10px;bottom:10px}.goat-money-video{height:120px}.goat-money-controls{justify-content:flex-start}body.goat-money-dock-space{padding-bottom:315px}}
    @media print{.goat-money-media-dock{display:none!important}body.goat-money-dock-space{padding-bottom:0}}
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const dock = document.createElement("aside");
  dock.className = "goat-money-media-dock";
  dock.setAttribute("aria-label", "GOAT investor money media controls");
  dock.innerHTML = `
    <div class="goat-money-video">
      <video muted autoplay loop playsinline preload="metadata" poster="assets/epk-media/images/ssl-duality-delta-overhead.jpg">
        <source src="assets/epk-media/videos/goat-flying-proof.mp4" type="video/mp4">
        <source src="assets/epk-media/videos/goat-royalty-force.mov" type="video/quicktime">
      </video>
    </div>
    <div class="goat-money-copy">
      <b>Investor Money Breakdown</b>
      <strong>$3.5M seed ask. $22M pre-money anchor. 65-70% built.</strong>
      <span>Royalty recovery, audio fingerprinting, distribution, banking payouts, 53+ local models, Thor/AGX/Nano deploy lanes, studio services, and living EPK marketing.</span>
      <div class="goat-money-meter" aria-hidden="true"><i></i></div>
    </div>
    <div class="goat-money-controls">
      <button class="gold" type="button" data-goat-money-play>Play Money Pitch</button>
      <button type="button" data-goat-money-next>Next Track</button>
      <a href="money-breakdown.html">Open Money Page</a>
    </div>
    <audio preload="metadata" data-goat-money-audio>
      <source src="assets/epk-media/audio/old-school-chevy.mp3" type="audio/mpeg">
      <source src="assets/epk-media/audio/walk-through-these-walls.wav" type="audio/wav">
    </audio>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(dock);
    document.body.classList.add("goat-money-dock-space");
    const audio = dock.querySelector("[data-goat-money-audio]");
    const play = dock.querySelector("[data-goat-money-play]");
    const next = dock.querySelector("[data-goat-money-next]");
    const meter = dock.querySelector(".goat-money-meter i");
    const tracks = [
      "assets/epk-media/audio/old-school-chevy.mp3",
      "assets/epk-media/audio/walk-through-these-walls.wav"
    ];
    let index = 0;

    function loadTrack() {
      audio.src = tracks[index];
      audio.load();
      play.textContent = "Play Money Pitch";
      meter.style.width = "0%";
    }

    play.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          await audio.play();
          play.textContent = "Pause Money Pitch";
        } else {
          audio.pause();
          play.textContent = "Play Money Pitch";
        }
      } catch (error) {
        play.textContent = "Tap Again To Play";
      }
    });

    next.addEventListener("click", async () => {
      index = (index + 1) % tracks.length;
      loadTrack();
      try {
        await audio.play();
        play.textContent = "Pause Money Pitch";
      } catch (error) {
        play.textContent = "Play Money Pitch";
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      meter.style.width = `${Math.min(100, (audio.currentTime / audio.duration) * 100)}%`;
    });

    audio.addEventListener("ended", () => {
      index = (index + 1) % tracks.length;
      loadTrack();
    });
  });
}());
