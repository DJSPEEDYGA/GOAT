(function () {
  "use strict";

  const state = {
    data: null,
    items: [],
    lane: "All",
    query: "",
    gatedOnly: false
  };

  const selectors = {
    rack: "[data-tool-rack]",
    filters: "[data-lane-filters]",
    targets: "[data-feature-targets]",
    search: "[data-tool-search]",
    riskOnly: "[data-risk-only]",
    refresh: "[data-refresh-arsenal]",
    apiState: "[data-api-state]",
    sourceRoot: "[data-source-root]",
    totalSize: "[data-total-size]"
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = value;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
  }

  function shortDate(value) {
    if (!value) return "offline";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function riskLabel(risk) {
    return String(risk || "review").replaceAll("-", " ");
  }

  function laneList(items) {
    return ["All", ...Array.from(new Set(items.map((item) => item.lane || "Unsorted"))).sort()];
  }

  function filteredItems() {
    const term = state.query.trim().toLowerCase();
    return state.items.filter((item) => {
      if (state.lane !== "All" && item.lane !== state.lane) return false;
      if (state.gatedOnly && !["blocked", "license-gated", "system-image"].includes(item.risk)) return false;
      if (!term) return true;
      const haystack = [
        item.name,
        item.path,
        item.lane,
        item.risk,
        item.goatUse,
        item.featureTarget,
        item.review
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }

  function setSummary(summary) {
    document.querySelectorAll("[data-summary]").forEach((node) => {
      const key = node.dataset.summary;
      node.textContent = summary && summary[key] != null ? String(summary[key]) : "0";
    });
    const roots = summary && Array.isArray(summary.roots) ? summary.roots : [];
    const sourceRoot = $(selectors.sourceRoot);
    if (sourceRoot) sourceRoot.textContent = roots.join(", ") || "No root";
    const totalSize = $(selectors.totalSize);
    if (totalSize) totalSize.textContent = formatBytes(summary ? summary.totalBytes : 0);
  }

  function renderFilters() {
    const root = $(selectors.filters);
    if (!root) return;
    root.innerHTML = laneList(state.items).map((lane) => (
      `<button type="button" class="${lane === state.lane ? "active" : ""}" data-lane="${escapeHtml(lane)}">${escapeHtml(lane)}</button>`
    )).join("");
  }

  function renderTargets() {
    const root = $(selectors.targets);
    if (!root || !state.data) return;
    const targets = (state.data.manifest && state.data.manifest.originalFeatureTargets) || [];
    root.innerHTML = targets.map((target) => `
      <article class="target-card">
        <span class="target-status">${escapeHtml(target.status || "mapped")}</span>
        <b>${escapeHtml(target.title)}</b>
        <p>${escapeHtml(target.description)}</p>
      </article>
    `).join("");
  }

  function toolCard(item) {
    const ext = (item.extension || "").replace(".", "") || "app";
    const size = item.exists ? formatBytes(item.sizeBytes) : "offline";
    return `
      <article class="tool-module" data-risk="${escapeHtml(item.risk || "review")}">
        <div class="tool-head">
          <h2 class="tool-name">${escapeHtml(item.name)}</h2>
          <span class="tool-ext">${escapeHtml(ext)}</span>
        </div>
        <div class="tool-lane">
          <span>${escapeHtml(item.lane || "Unsorted")}</span>
          <span class="risk-pill">${escapeHtml(riskLabel(item.risk))}</span>
        </div>
        <p class="tool-copy">${escapeHtml(item.goatUse || item.review || "Owner review pending.")}</p>
        <div class="tool-meta">
          <div class="mini-readout"><span>Target</span><b>${escapeHtml(item.featureTarget || "Review")}</b></div>
          <div class="mini-readout"><span>Size</span><b>${escapeHtml(size)}</b></div>
          <div class="mini-readout"><span>Modified</span><b>${escapeHtml(shortDate(item.modifiedAt))}</b></div>
          <div class="mini-readout"><span>Policy</span><b>${escapeHtml(item.runPolicy || "review")}</b></div>
        </div>
        <div class="path-row">
          <span class="path-text" title="${escapeHtml(item.path)}">${escapeHtml(item.path)}</span>
          <button class="copy-path" type="button" data-copy-path="${escapeHtml(item.path)}">Copy path</button>
        </div>
      </article>
    `;
  }

  function renderRack() {
    const root = $(selectors.rack);
    if (!root) return;
    const items = filteredItems();
    root.innerHTML = items.length
      ? items.map(toolCard).join("")
      : '<div class="rack-empty">No local tools matched this view.</div>';
  }

  function render() {
    renderFilters();
    renderTargets();
    renderRack();
  }

  async function loadArsenal() {
    const apiState = $(selectors.apiState);
    if (apiState) apiState.textContent = "Scanning";
    try {
      const response = await fetch("/api/goat/studio-tool-arsenal", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
      state.data = data;
      state.items = Array.isArray(data.items) ? data.items : [];
      setSummary(data.summary || {});
      if (apiState) apiState.textContent = "Live";
      render();
    } catch (error) {
      state.data = null;
      state.items = [];
      setSummary({});
      if (apiState) apiState.textContent = "Backend offline";
      const rack = $(selectors.rack);
      if (rack) {
        rack.innerHTML = `<div class="rack-empty">Studio Tool Arsenal backend is offline: ${escapeHtml(error.message)}</div>`;
      }
    }
  }

  function bindEvents() {
    const search = $(selectors.search);
    if (search) {
      search.addEventListener("input", () => {
        state.query = search.value || "";
        renderRack();
      });
    }
    const riskOnly = $(selectors.riskOnly);
    if (riskOnly) {
      riskOnly.addEventListener("change", () => {
        state.gatedOnly = riskOnly.checked;
        renderRack();
      });
    }
    const filters = $(selectors.filters);
    if (filters) {
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-lane]");
        if (!button) return;
        state.lane = button.dataset.lane || "All";
        render();
      });
    }
    const refresh = $(selectors.refresh);
    if (refresh) refresh.addEventListener("click", loadArsenal);

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-path]");
      if (!button) return;
      const path = button.dataset.copyPath || "";
      try {
        await navigator.clipboard.writeText(path);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = "Copy path"; }, 1200);
      } catch (_error) {
        button.textContent = "Select path";
        setTimeout(() => { button.textContent = "Copy path"; }, 1200);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    loadArsenal();
  });
}());
