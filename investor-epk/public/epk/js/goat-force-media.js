(function () {
  "use strict";

  const base = "assets/goat-force-media";
  const media = [
    { id: "force-video-01", type: "video", title: "GOAT Force Motion 01", lane: "AI video", src: `${base}/videos/force-video-01.mp4`, poster: `${base}/posters/force-video-01.jpg`, featured: true },
    { id: "force-video-02", type: "video", title: "GOAT Force Motion 02", lane: "AI video", src: `${base}/videos/force-video-02.mp4`, poster: `${base}/posters/force-video-02.jpg` },
    { id: "force-video-03", type: "video", title: "GOAT Force Motion 03", lane: "AI video", src: `${base}/videos/force-video-03.mp4`, poster: `${base}/posters/force-video-03.jpg` },
    { id: "force-video-04", type: "video", title: "GOAT Force Motion 04", lane: "AI video", src: `${base}/videos/force-video-04.mp4`, poster: `${base}/posters/force-video-04.jpg` },
    { id: "goat-command-lab", type: "image", title: "GOAT Command Lab", lane: "Command center", src: `${base}/images/goat-command-lab.jpg`, poster: `${base}/images/goat-command-lab.jpg`, featured: true },
    { id: "royalty-recovery-data", type: "image", title: "Royalty Recovery Data", lane: "Royalty intel", src: `${base}/images/royalty-recovery-data.jpg`, poster: `${base}/images/royalty-recovery-data.jpg`, featured: true },
    { id: "royalty-performance-ui", type: "image", title: "Royalty Performance UI", lane: "Business OS", src: `${base}/images/royalty-performance-ui.jpg`, poster: `${base}/images/royalty-performance-ui.jpg`, featured: true },
    { id: "flying-goat-sunrise", type: "image", title: "Flying GOAT Sunrise", lane: "Hero visual", src: `${base}/images/flying-goat-sunrise.jpg`, poster: `${base}/images/flying-goat-sunrise.jpg`, featured: true },
    { id: "realist-goat-ever", type: "image", title: "Realist GOAT Ever", lane: "Hero visual", src: `${base}/images/realist-goat-ever-6.png`, poster: `${base}/images/realist-goat-ever-6.png` },
    { id: "rooftop-goat-hero", type: "image", title: "Rooftop GOAT Hero", lane: "Hero visual", src: `${base}/images/rooftop-goat-hero.jpg`, poster: `${base}/images/rooftop-goat-hero.jpg` },
    { id: "codex-armor-blue", type: "image", title: "Codex Armor Blue", lane: "Agent visual", src: `${base}/images/codex-armor-blue.jpg`, poster: `${base}/images/codex-armor-blue.jpg` },
    { id: "parking-deck-target", type: "image", title: "Target Acquired", lane: "Scene concept", src: `${base}/images/parking-deck-target.jpg`, poster: `${base}/images/parking-deck-target.jpg` },
    { id: "royalty-check-respect", type: "image", title: "Royalty Check Or Respect", lane: "Private concept", src: `${base}/images/royalty-check-respect-series.jpg`, poster: `${base}/images/royalty-check-respect-series.jpg`, privateConcept: true },
    { id: "goat-royalty-force-series", type: "image", title: "GOAT Royalty Force", lane: "Private concept", src: `${base}/images/goat-royalty-force-series.jpg`, poster: `${base}/images/goat-royalty-force-series.jpg`, privateConcept: true },
    { id: "force-video-05", type: "video", title: "GOAT Force Motion 05", lane: "AI video", src: `${base}/videos/force-video-05.mp4`, poster: `${base}/posters/force-video-05.jpg` },
    { id: "force-video-06", type: "video", title: "GOAT Force Motion 06", lane: "AI video", src: `${base}/videos/force-video-06.mp4`, poster: `${base}/posters/force-video-06.jpg` },
    { id: "force-video-07", type: "video", title: "GOAT Force Motion 07", lane: "AI video", src: `${base}/videos/force-video-07.mp4`, poster: `${base}/posters/force-video-07.jpg` },
    { id: "force-video-08", type: "video", title: "GOAT Force Motion 08", lane: "AI video", src: `${base}/videos/force-video-08.mp4`, poster: `${base}/posters/force-video-08.jpg` },
    { id: "force-video-09", type: "video", title: "GOAT Force Motion 09", lane: "AI video", src: `${base}/videos/force-video-09.mp4`, poster: `${base}/posters/force-video-09.jpg` },
    { id: "force-video-10", type: "video", title: "GOAT Force Motion 10", lane: "AI video", src: `${base}/videos/force-video-10.mp4`, poster: `${base}/posters/force-video-10.jpg` },
    { id: "force-video-11", type: "video", title: "GOAT Force Motion 11", lane: "AI video", src: `${base}/videos/force-video-11.mp4`, poster: `${base}/posters/force-video-11.jpg` },
    { id: "grok-force-square", type: "video", title: "GOAT Square Motion", lane: "Social clip", src: `${base}/videos/grok-force-square.mp4`, poster: `${base}/posters/grok-force-square.jpg` },
    { id: "grok-force-vertical-01", type: "video", title: "GOAT Vertical Motion 01", lane: "Shorts clip", src: `${base}/videos/grok-force-vertical-01.mp4`, poster: `${base}/posters/grok-force-vertical-01.jpg` },
    { id: "grok-force-vertical-02", type: "video", title: "GOAT Vertical Motion 02", lane: "Shorts clip", src: `${base}/videos/grok-force-vertical-02.mp4`, poster: `${base}/posters/grok-force-vertical-02.jpg` },
    { id: "grok-force-vertical-03", type: "video", title: "GOAT Vertical Motion 03", lane: "Shorts clip", src: `${base}/videos/grok-force-vertical-03.mp4`, poster: `${base}/posters/grok-force-vertical-03.jpg` }
  ];

  let current = media[0];

  const publicMedia = media.filter((item) => !item.privateConcept);

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function stageMedia(item) {
    if (item.type === "video") {
      return `<video autoplay muted loop playsinline preload="metadata" poster="${escapeHtml(item.poster)}"><source src="${escapeHtml(item.src)}" type="video/mp4"></video>`;
    }
    return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}">`;
  }

  function setHero(id) {
    const item = publicMedia.find((entry) => entry.id === id) || publicMedia[0];
    current = item;
    const stage = document.querySelector("[data-force-stage-media]");
    const title = document.querySelector("[data-force-title]");
    const lane = document.querySelector("[data-force-lane]");
    if (stage) stage.innerHTML = stageMedia(item);
    if (title) title.textContent = item.title;
    if (lane) lane.textContent = item.lane;
    document.querySelectorAll("[data-force-id]").forEach((button) => {
      button.classList.toggle("active", button.dataset.forceId === item.id);
    });
  }

  function tile(item) {
    return `
      <button class="force-tile" type="button" data-force-id="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.poster)}" alt="">
        ${item.type === "video" ? '<i class="force-play-badge">▶</i>' : ""}
        <span>${escapeHtml(item.title)}</span>
      </button>
    `;
  }

  function railCard(item) {
    return `
      <button class="force-rail-card" type="button" data-force-id="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.poster)}" alt="">
        <span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.lane)} · ${item.type}</small></span>
      </button>
    `;
  }

  function openLightbox(item) {
    const lightbox = document.getElementById("force-lightbox");
    if (!lightbox) return;
    lightbox.querySelector(".force-lightbox-title").textContent = item.title;
    lightbox.querySelector(".force-lightbox-media").innerHTML = item.type === "video"
      ? `<video controls autoplay playsinline poster="${escapeHtml(item.poster)}"><source src="${escapeHtml(item.src)}" type="video/mp4"></video>`
      : `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}">`;
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    const lightbox = document.getElementById("force-lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.querySelector(".force-lightbox-media").innerHTML = "";
  }

  function initForceMedia() {
    const filmstrip = document.querySelector("[data-force-filmstrip]");
    const rail = document.querySelector("[data-force-rail]");
    if (filmstrip) filmstrip.innerHTML = publicMedia.filter((item) => item.featured).slice(0, 4).map(tile).join("");
    if (rail) rail.innerHTML = publicMedia.map(railCard).join("");
    setHero(current.id);

    document.addEventListener("click", (event) => {
      const forceButton = event.target.closest("[data-force-id]");
      if (forceButton) {
        const item = publicMedia.find((entry) => entry.id === forceButton.dataset.forceId);
        if (!item) return;
        setHero(item.id);
        return;
      }
      if (event.target.closest("[data-force-open]")) {
        openLightbox(current);
        return;
      }
      if (event.target.closest("[data-force-close]") || event.target.id === "force-lightbox") {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });
  }

  document.addEventListener("DOMContentLoaded", initForceMedia);
}());
