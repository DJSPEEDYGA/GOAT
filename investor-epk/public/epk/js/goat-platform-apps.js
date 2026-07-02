(function () {
  "use strict";

  const apps = [
    { title: "Living Investor EPK", href: "goat-investor-living-epk.html", lane: "Business", mark: "EPK", status: "live", featured: true, desc: "Living local-first investor kit with Thor, AGX, Nano, valuation, proof, money engine, app suite, hardware gates, and source links." },
    { title: "Server Field Hub", href: "goat-server-field-hub.html", lane: "Control", mark: "SRV", status: "server", featured: true, desc: "Server-first phone, Halito Chat, HELLO Email, Thor SSD, Nano recovery, production, staging, and field test command hub." },
    { title: "GOAT Cinema Forge", href: "goat-cinema-forge.html", lane: "Video", mark: "CINE", status: "forge", featured: true, desc: "Original local-first Hollywood studio router for movie, 3D, AI video, music sync, RAG, LoRA, render, rights, and export proof." },
    { title: "GOAT City RP", href: "goat-virtual-world-rp.html", lane: "3D", mark: "CITY", status: "pack", featured: true, desc: "Original virtual-world and server package lane for studio school, music economy, royalty missions, VIP events, and owner-approved FiveM deployment." },
    { title: "AI Video Studio", href: "goat-ai-video.html", lane: "Video", mark: "VID", status: "ready", featured: true, desc: "Generate, direct, package, and route music-video ideas through the GOAT video stack." },
    { title: "3D Studio", href: "goat-3d-studio.html", lane: "3D", mark: "3D", status: "ready", featured: true, desc: "Build products, scenes, stage concepts, avatars, and 3D promo assets." },
    { title: "Recording Studio", href: "studio.html", lane: "Audio", mark: "REC", status: "studio", featured: true, desc: "Record, arrange, route, and manage studio sessions from the GOAT production seat." },
    { title: "Pro Tools Book Vault", href: "protools-books-library.html", lane: "Audio", mark: "PT", status: "vault", featured: true, desc: "Local Pro Tools manuals, control-surface guides, plug-in books, and private studio source gates for Money Penny, AGENT-007, and Cody." },
    { title: "Studio Tool Arsenal", href: "goat-studio-tool-arsenal.html", lane: "Control", mark: "RACK", status: "live", featured: true, desc: "Read-only local inventory for DAWs, installers, boot media, AI tools, GPU/Thor assets, cloud tools, and safety-gated studio workflows." },
    { title: "AGENT-007 Brain", href: "agents-brain.html", lane: "AI", mark: "007", status: "local", featured: true, desc: "Local agent crew, model lanes, prompts, tools, memory, and computer-control workflows." },
    { title: "GOAT Casino", href: "goat-casino.html", lane: "VIP", mark: "VIP", status: "gate", featured: true, desc: "Private VIP casino shell with Fun Play, real-money gate controls, fairness, and rewards." },
    { title: "Money Penny Codex", href: "money-penny-codex.html", lane: "AI", mark: "MP", status: "ready", featured: true, desc: "Money Penny assistant for GOAT Store navigation, decisions, and product guidance." },
    { title: "Super GOAT Royalties", href: "super-goat-royalties.html", lane: "Business", mark: "SG", status: "live", featured: true, desc: "Physical-console royalty command lane wired to real local catalog, MLC, splits, ISRC, desktop builds, GitHub sources, and LLM tools." },
    { title: "Money Engine", href: "super-goat-royalties.html", lane: "Business", mark: "MNY", status: "core", featured: true, desc: "Royalty collections, catalog control, fingerprinting, distribution, marketing, splits, payout gates, and audit proof in one local-first workflow." },
    { title: "Cinema / Movie Studio", href: "movie-studio.html", lane: "Video", mark: "CIN", status: "ready", featured: true, desc: "Timeline, edits, effects, cuts, and video packaging for GOAT media work." },
    { title: "Picture Animation Lab", href: "goat-picture-animation-lab.html", lane: "Video", mark: "ANM", status: "ready", featured: true, desc: "Animate stills, references, campaign visuals, and character motion tests." },
    { title: "Beat Maker", href: "beat-maker.html", lane: "Audio", mark: "BEAT", status: "pro", featured: false, desc: "Pattern blocks, step sequencing, arrangement ideas, and beat sketching." },
    { title: "GOAT MPC", href: "goat-mpc.html", lane: "Audio", mark: "MPC", status: "pro", featured: false, desc: "Pad-based production, drum ideas, pattern chains, and groove building." },
    { title: "GOAT Sampler", href: "goat-sampler.html", lane: "Audio", mark: "SMP", status: "pro", featured: false, desc: "Slice, pitch, stretch, sketch, and organize sample-based ideas." },
    { title: "SSL Mixer", href: "ssl-mixer.html", lane: "Audio", mark: "SSL", status: "mix", featured: false, desc: "Console-style mix surface for levels, routing, tone, and rough mix moves." },
    { title: "Mastering Suite", href: "mastering.html", lane: "Audio", mark: "MST", status: "pro", featured: false, desc: "Loudness, polish, codec checks, and delivery prep." },
    { title: "Vocal Studio", href: "vocal-studio.html", lane: "Audio", mark: "VOX", status: "pro", featured: false, desc: "Vocal recording, harmonies, cleanup, and chain planning." },
    { title: "Auto-Tune", href: "goat-autotune.html", lane: "Audio", mark: "AT", status: "pro", featured: false, desc: "Pitch, graph-style edits, formant ideas, and vocal effects." },
    { title: "Plugin Rack", href: "goat-plugin-rack.html", lane: "Audio", mark: "FX", status: "pro", featured: false, desc: "Channel processing, compressors, EQ, delays, verbs, and color." },
    { title: "Catalog Manager", href: "catalog.html", lane: "Business", mark: "CAT", status: "ready", featured: false, desc: "Song data, ownership, metadata, ISRC/UPC, splits, and catalog organization." },
    { title: "Royalties", href: "royalties.html", lane: "Business", mark: "ROY", status: "money", featured: false, desc: "Royalty tracking, business review, earnings lanes, and ledger support." },
    { title: "Distribution", href: "distribution.html", lane: "Business", mark: "DSP", status: "ready", featured: false, desc: "Release planning, DSP prep, metadata, and delivery workflow." },
    { title: "Payments", href: "payments.html", lane: "Business", mark: "PAY", status: "ready", featured: false, desc: "Payout planning, payment routing, and money movement controls." },
    { title: "Banking", href: "banking.html", lane: "Business", mark: "BNK", status: "gate", featured: false, desc: "Banking, background checks, verification, and real-world financial lanes." },
    { title: "API Vault", href: "api-vault.html", lane: "Business", mark: "API", status: "secure", featured: false, desc: "Keys, provider settings, local secrets, and deployment controls." },
    { title: "VIP Lounge", href: "goat-celebrity-lounge.html", lane: "VIP", mark: "VIP", status: "private", featured: false, desc: "Private celebrity/VIP workspace, privacy controls, and relationship management." },
    { title: "Fashion Hub", href: "goat-fashion-hub.html", lane: "Lifestyle", mark: "FSH", status: "ready", featured: false, desc: "Styling, wardrobe, trend intelligence, drops, and brand lanes." },
    { title: "NFT Studio", href: "goat-nft-studio.html", lane: "Web3", mark: "NFT", status: "ready", featured: false, desc: "Create, package, and route digital collectibles and creator assets." },
    { title: "Crypto Wallet", href: "goat-crypto-wallet.html", lane: "Web3", mark: "WAL", status: "gate", featured: false, desc: "Wallet planning, crypto balances, token flows, and custody lanes." },
    { title: "Token Swap", href: "goat-token-swap.html", lane: "Web3", mark: "SWP", status: "gate", featured: false, desc: "Swap interface planning connected to owner-approved wallet controls." },
    { title: "Entertainment", href: "goat-entertainment.html", lane: "Video", mark: "ENT", status: "ready", featured: false, desc: "GOAT media universe, streaming concepts, originals, events, and content lanes." },
    { title: "Marketing Team", href: "goat-marketing-team.html", lane: "Business", mark: "MKT", status: "ready", featured: false, desc: "Campaign planning, content routing, creative ops, and rollout support." },
    { title: "Standards Registry", href: "goat-standards-registry.html", lane: "Business", mark: "ID", status: "ready", featured: false, desc: "GS1, ISRC, prizes, recordings, product IDs, and rights metadata." },
    { title: "GOAT Security", href: "goat-security.html", lane: "Security", mark: "SEC", status: "secure", featured: false, desc: "Security checks, VIP access, device confidence, and protected routes." },
    { title: "Vault", href: "goat-vault.html", lane: "Security", mark: "VLT", status: "secure", featured: false, desc: "Private files, sensitive documents, contracts, and protected storage concepts." },
    { title: "Touch Hub", href: "touch-hub.html", lane: "Control", mark: "TCH", status: "ready", featured: false, desc: "Touch-first control center for studio tools, decks, transport, keys, and pads." },
    { title: "Unreal Copilot", href: "unreal-copilot.html", lane: "3D", mark: "UE", status: "ready", featured: false, desc: "Unreal planning and virtual production assistant lane." },
    { title: "Model Downloads", href: "ai-models-download.html", lane: "AI", mark: "LLM", status: "local", featured: false, desc: "Local model catalog, downloads, model-drive planning, and offline AI setup." }
  ];

  const media = [
    { title: "Living Investor EPK", href: "goat-investor-living-epk.html", lane: "Business", bg: "url(\"assets/goat-force-media/images/royalty-recovery-data.jpg\")" },
    { title: "Server Field Hub", href: "goat-server-field-hub.html", lane: "Control", bg: "url(\"assets/goat-force-media/images/royalty-recovery-data.jpg\")" },
    { title: "GOAT Cinema Forge", href: "goat-cinema-forge.html", lane: "Video", bg: "url(\"assets/goat-force-media/images/royalty-recovery-data.jpg\")" },
    { title: "GOAT City RP", href: "goat-virtual-world-rp.html", lane: "3D", bg: "url(\"assets/goat-virtual-world-rp/images/goat-city-sky-hero.jpg\")" },
    { title: "Music Video Command", href: "goat-ai-video.html", lane: "Video", bg: "url(\"img/goat-flying.png\")" },
    { title: "Super GOAT Royalties", href: "super-goat-royalties.html", lane: "Business", bg: "url(\"img/goat-hero.png\")" },
    { title: "Money Engine", href: "super-goat-royalties.html", lane: "Business", bg: "url(\"assets/goat-force-media/images/royalty-performance-ui.jpg\")" },
    { title: "Casino Night", href: "goat-casino.html", lane: "VIP", bg: "url(\"goat-background.png\")" },
    { title: "3D Product Stage", href: "goat-3d-studio.html", lane: "3D", bg: "url(\"img/goat-hero.png\")" },
    { title: "Studio Session", href: "studio.html", lane: "Audio", bg: "url(\"splash.png\")" },
    { title: "Pro Tools Book Vault", href: "protools-books-library.html", lane: "Audio", bg: "url(\"splash.png\")" },
    { title: "Studio Tool Arsenal", href: "goat-studio-tool-arsenal.html", lane: "Control", bg: "url(\"img/goat-hero.png\")" }
  ];

  const filters = ["All", "Video", "Audio", "AI", "3D", "Business", "VIP", "Web3", "Security", "Control", "Lifestyle"];

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function appCard(app) {
    return `
      <a class="goat-app-card" href="${escapeHtml(app.href)}" data-lane="${escapeHtml(app.lane)}">
        <div class="goat-app-top">
          <span class="goat-app-mark">${escapeHtml(app.mark)}</span>
          <span class="goat-app-status">${escapeHtml(app.status)}</span>
        </div>
        <div>
          <b>${escapeHtml(app.title)}</b>
          <p>${escapeHtml(app.desc)}</p>
        </div>
        <div class="goat-app-meta"><span>${escapeHtml(app.lane)}</span><span>Open app</span></div>
      </a>
    `;
  }

  function renderGrid(root, query, lane, featuredOnly) {
    const term = (query || "").trim().toLowerCase();
    const activeLane = lane || "All";
    const filtered = apps.filter((app) => {
      if (featuredOnly && !app.featured) return false;
      if (activeLane !== "All" && app.lane !== activeLane) return false;
      if (!term) return true;
      return `${app.title} ${app.lane} ${app.desc} ${app.status}`.toLowerCase().includes(term);
    });
    root.innerHTML = filtered.length
      ? filtered.map(appCard).join("")
      : '<div class="goat-app-empty">No apps matched that search.</div>';
  }

  function setupDirectory(scope) {
    const grid = scope.querySelector("[data-goat-app-grid]");
    if (!grid) return;
    const featuredOnly = grid.dataset.featuredOnly === "true";
    const search = scope.querySelector("[data-goat-search]");
    const filterWrap = scope.querySelector("[data-goat-filters]");
    let activeLane = "All";

    if (filterWrap && !filterWrap.children.length) {
      filterWrap.innerHTML = filters.map((filter) => (
        `<button class="goat-filter-button ${filter === "All" ? "active" : ""}" type="button" data-goat-filter="${filter}">${filter}</button>`
      )).join("");
    }

    const refresh = () => renderGrid(grid, search ? search.value : "", activeLane, featuredOnly);
    if (search) search.addEventListener("input", refresh);
    if (filterWrap) {
      filterWrap.addEventListener("click", (event) => {
        const button = event.target.closest("[data-goat-filter]");
        if (!button) return;
        activeLane = button.dataset.goatFilter || "All";
        filterWrap.querySelectorAll("[data-goat-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        refresh();
      });
    }
    refresh();
  }

  function renderMedia() {
    document.querySelectorAll("[data-goat-media-strip]").forEach((target) => {
      target.innerHTML = media.map((item) => `
        <a class="goat-media-card" href="${escapeHtml(item.href)}" style="--media-bg:${item.bg}">
          <span>${escapeHtml(item.lane)}</span>
          <b>${escapeHtml(item.title)}</b>
        </a>
      `).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("goat-suite-mode");
    document.querySelectorAll("[data-goat-directory]").forEach(setupDirectory);
    renderMedia();
  });
}());
