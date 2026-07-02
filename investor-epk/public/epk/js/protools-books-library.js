(function () {
  "use strict";

  const endpoint = "/api/goat/protools-books";
  const manifestPath = "data/protools-books-library.json";

  const state = {
    backendOnline: false,
    payload: null
  };

  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function prettyBytes(bytes) {
    const value = Number(bytes || 0);
    if (!value) return "pending";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = value;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index += 1;
    }
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return response.json();
  }

  function withPendingStatus(records) {
    return (records || []).map((item) => ({ ...item, exists: null, ok: false }));
  }

  async function loadFallbackPayload() {
    const manifest = await fetchJson(manifestPath);
    const manuals = withPendingStatus(manifest.manuals);
    const privateSources = withPendingStatus(manifest.privateSources);
    const transcripts = withPendingStatus(manifest.transcripts);
    const systemArtifacts = withPendingStatus(manifest.systemArtifacts);
    const totalPages = manuals.reduce((sum, item) => sum + Number(item.pages || 0), 0);
    const gatedItems = [...privateSources, ...transcripts, ...systemArtifacts].length;

    return {
      ok: true,
      demoData: false,
      source: "static-protools-vault-fallback",
      manifest,
      manuals,
      privateSources,
      transcripts,
      systemArtifacts,
      privacyPolicy: manifest.privacyPolicy || {},
      summary: {
        backendReady: false,
        frontEndReady: true,
        manualsReady: 0,
        manualsTotal: manuals.length,
        visibleManuals: manuals.filter((item) => item.visibleInPublicApp !== false).length,
        privateSourcesReady: 0,
        privateSourcesTotal: privateSources.length,
        transcriptsReady: 0,
        transcriptsTotal: transcripts.length,
        systemArtifactsReady: 0,
        systemArtifactsTotal: systemArtifacts.length,
        itemsReady: 0,
        itemsTotal: manuals.length + gatedItems,
        totalPages,
        totalBytes: 0,
        gatedItems,
        manualsIndexed: manuals.length,
        sourceRoot: manifest.sourceRoot || "",
        sourceRootExists: false
      }
    };
  }

  function setLed(id, ok, label) {
    const root = document.querySelector(`[data-led="${id}"]`);
    if (!root) return;
    const led = root.querySelector(".pbv-led");
    const text = root.querySelector("span:last-child");
    led.classList.toggle("ok", ok === true);
    led.classList.toggle("warn", ok === "warn");
    led.classList.toggle("off", !ok);
    if (text && label) text.textContent = label;
  }

  function setText(selector, value) {
    const node = $(selector);
    if (node) node.textContent = value;
  }

  function statusText(item) {
    if (item.exists === true) return prettyBytes(item.sizeBytes);
    if (item.exists === false) return "check";
    return "indexed";
  }

  function manualCard(manual) {
    const href = manual.exists ? `file://${encodeURI(manual.path)}` : "#";
    return `
      <a class="pbv-manual-card" href="${escapeHtml(href)}">
        <div>
          <div class="pbv-card-top">
            <h3>${escapeHtml(manual.title)}</h3>
            <span class="pbv-pages">${number.format(manual.pages || 0)}p</span>
          </div>
          <div class="pbv-card-meta">
            <span>${escapeHtml(manual.category)}</span>
            <span>${escapeHtml(manual.lane)}</span>
            <span>${escapeHtml(statusText(manual))}</span>
          </div>
        </div>
        <div class="pbv-card-path">${escapeHtml(manual.path || "")}</div>
      </a>
    `;
  }

  function row(title, detail, value, warn) {
    return `
      <div class="pbv-row">
        <div class="pbv-row-main">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(detail)}</span>
        </div>
        <div class="${warn ? "pbv-count warn" : "pbv-count"}">${escapeHtml(value)}</div>
      </div>
    `;
  }

  function categoryRows(manuals) {
    const categories = new Map();
    manuals.forEach((manual) => {
      const key = manual.category || "Other";
      const current = categories.get(key) || { count: 0, pages: 0 };
      current.count += 1;
      current.pages += Number(manual.pages || 0);
      categories.set(key, current);
    });
    return [...categories.entries()]
      .sort((a, b) => b[1].pages - a[1].pages)
      .map(([category, data]) => row(category, `${number.format(data.pages)} pages across ${data.count} sources`, data.count, false))
      .join("");
  }

  function privateRows(payload) {
    const privateSources = payload.privateSources || [];
    const transcripts = payload.transcripts || [];
    const systemArtifacts = payload.systemArtifacts || [];
    return [...privateSources, ...transcripts, ...systemArtifacts].map((item) => {
      const detail = `${item.sensitivity || "private"} - ${item.metadataOnly ? "metadata only" : "gated"} - ${item.path || ""}`;
      return row(item.title || item.id, detail, item.exists ? "ready" : "gated", true);
    }).join("");
  }

  function nextRows(manifest) {
    return (manifest.nextPrivateIngestSteps || []).map((item, index) => (
      row(`Move ${index + 1}`, item, "queued", true)
    )).join("");
  }

  function render(payload) {
    const manifest = payload.manifest || {};
    const summary = payload.summary || {};
    const manuals = (payload.manuals || []).filter((item) => item.visibleInPublicApp !== false);
    const sourceOffline = state.backendOnline && summary.sourceRootExists === false;

    setLed("backend", state.backendOnline, state.backendOnline ? "backend online" : "static fallback");
    setLed("manuals", Number(summary.manualsReady || 0) > 0 ? true : "warn", sourceOffline ? "source offline" : `${summary.manualsReady || 0}/${summary.manualsTotal || manuals.length} manuals`);
    setLed("privacy", Number(summary.gatedItems || 0) > 0, `${summary.gatedItems || 0} gated`);
    setLed("transcripts", Number(summary.transcriptsTotal || 0) > 0 ? "warn" : true, "metadata only");
    setLed("frontend", summary.frontEndReady ? true : "warn", summary.frontEndReady ? "front end ready" : "front end check");

    setText("[data-manuals-ready]", sourceOffline ? `${summary.manualsIndexed || manuals.length} indexed` : `${summary.manualsReady || 0}/${summary.manualsTotal || manuals.length}`);
    setText("[data-page-total]", number.format(summary.totalPages || 0));
    setText("[data-private-gates]", number.format(summary.gatedItems || 0));
    setText("[data-total-bytes]", sourceOffline ? "source offline" : prettyBytes(summary.totalBytes || 0));

    const manualGrid = $("[data-manual-grid]");
    if (manualGrid) manualGrid.innerHTML = manuals.map(manualCard).join("");

    const categoryGrid = $("[data-category-grid]");
    if (categoryGrid) categoryGrid.innerHTML = categoryRows(manuals);

    const privateList = $("[data-private-list]");
    if (privateList) privateList.innerHTML = privateRows(payload);

    const nextList = $("[data-next-steps]");
    if (nextList) nextList.innerHTML = nextRows(manifest);
  }

  async function boot() {
    try {
      state.payload = await fetchJson(endpoint);
      state.backendOnline = true;
    } catch (error) {
      state.payload = await loadFallbackPayload();
      state.backendOnline = false;
    }
    render(state.payload);
  }

  document.addEventListener("DOMContentLoaded", boot);
}());
