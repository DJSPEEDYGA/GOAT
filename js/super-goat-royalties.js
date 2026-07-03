(function () {
  "use strict";

  const endpoint = "/api/goat/super-goat-royalties";
  const manifestPath = "data/super-goat-royalties.json";

  const state = {
    backendOnline: false,
    payload: null
  };

  const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

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

  function recordCount(data) {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === "object") return Object.keys(data).length;
    return data ? 1 : 0;
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return response.json();
  }

  async function loadFallbackPayload() {
    const manifest = await fetchJson(manifestPath);
    const dataSources = await Promise.all((manifest.dataSources || []).map(async (source) => {
      const item = { ...source, exists: false, ok: false, recordCount: 0, shape: "pending" };
      try {
        const data = await fetchJson(source.relativePath);
        item.exists = true;
        item.ok = true;
        item.recordCount = recordCount(data);
        item.shape = Array.isArray(data) ? "array" : typeof data;
      } catch (error) {
        item.error = error.message;
      }
      return item;
    }));

    return {
      ok: true,
      demoData: false,
      source: "static-super-goat-fallback",
      manifest,
      dataSources,
      desktopBuilds: manifest.desktopBuilds || [],
      sourceArchives: manifest.sourceArchives || [],
      blockedLiveInputs: manifest.blockedLiveInputs || [],
      summary: {
        backendReady: false,
        frontEndReady: true,
        dataSourcesReady: dataSources.filter((item) => item.ok).length,
        dataSourcesTotal: dataSources.length,
        desktopBuildsReady: 0,
        desktopBuildsTotal: (manifest.desktopBuilds || []).length,
        sourceArchivesReady: 0,
        sourceArchivesTotal: (manifest.sourceArchives || []).length,
        verifiedRecordTotal: dataSources.reduce((sum, item) => sum + Number(item.recordCount || 0), 0)
      }
    };
  }

  function setLed(id, ok, label) {
    const root = document.querySelector(`[data-led="${id}"]`);
    if (!root) return;
    const led = root.querySelector(".sg-led");
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

  function meterPercent(count) {
    const value = Number(count || 0);
    if (!value) return 6;
    return Math.max(10, Math.min(100, (Math.log10(value + 1) / 4) * 100));
  }

  function sourceRow(source) {
    const count = Number(source.recordCount || 0);
    const ok = Boolean(source.ok || source.exists);
    const countClass = ok ? "sg-count" : "sg-count warn";
    const label = ok ? money.format(count) : "pending";
    return `
      <div class="sg-source-row">
        <div class="sg-source-main">
          <strong>${escapeHtml(source.label || source.relativePath)}</strong>
          <span>${escapeHtml(source.lane || source.shape || "local")} - ${escapeHtml(source.relativePath || source.path || "")}</span>
          <div class="sg-bar" style="--pct:${meterPercent(count)}%"><i></i></div>
        </div>
        <div class="${countClass}">${escapeHtml(label)}</div>
      </div>
    `;
  }

  function buildRow(build) {
    const exists = Boolean(build.exists);
    return `
      <div class="sg-build-row">
        <div class="sg-build-main">
          <strong>${escapeHtml(build.label || build.path)}</strong>
          <span>${escapeHtml(build.platform || "local")} - ${escapeHtml(build.path || "")}</span>
        </div>
        <div class="${exists ? "sg-count" : "sg-count warn"}">${exists ? prettyBytes(build.sizeBytes) : "check"}</div>
      </div>
    `;
  }

  function repoRow(repo, locked) {
    const status = locked ? "private" : `${escapeHtml(repo.language || "code")} - ${escapeHtml(repo.defaultBranch || "main")}`;
    const value = locked ? "needs export" : (repo.pushedAt || "public");
    const url = repo.url || "#";
    return `
      <a class="sg-repo-row" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
        <div class="sg-repo-main">
          <strong>${escapeHtml(repo.name)}</strong>
          <span>${status}</span>
        </div>
        <div class="${locked ? "sg-count warn" : "sg-count"}">${escapeHtml(value)}</div>
      </a>
    `;
  }

  function render(payload) {
    const manifest = payload.manifest || {};
    const summary = payload.summary || {};
    const dataSources = payload.dataSources || [];
    const desktopBuilds = payload.desktopBuilds || [];
    const sourceArchives = payload.sourceArchives || [];
    const github = manifest.githubSources || {};
    const publicRepos = github.publicRepos || [];
    const privateRepos = github.privateReposRegistered || [];
    const blocked = payload.blockedLiveInputs || manifest.blockedLiveInputs || [];

    setLed("backend", state.backendOnline, state.backendOnline ? "backend online" : "static fallback");
    setLed("demo", payload.demoData === false, "demo data off");
    setLed("catalog", Number(summary.dataSourcesReady || 0) > 0, "catalog verified");
    setLed("desktop", Number(summary.desktopBuildsReady || 0) > 0 ? true : "warn", `${summary.desktopBuildsReady || 0}/${summary.desktopBuildsTotal || 0} builds`);
    setLed("github", publicRepos.length ? true : "warn", `${publicRepos.length} public repos`);
    setLed("money", "warn", "live money gated");

    setText("[data-total-records]", money.format(summary.verifiedRecordTotal || 0));
    setText("[data-data-ready]", `${summary.dataSourcesReady || 0}/${summary.dataSourcesTotal || dataSources.length}`);
    setText("[data-builds-ready]", `${summary.desktopBuildsReady || 0}/${summary.desktopBuildsTotal || desktopBuilds.length}`);
    setText("[data-repos-ready]", `${publicRepos.length}+${privateRepos.length}`);

    const sources = $("[data-source-list]");
    if (sources) sources.innerHTML = dataSources.map(sourceRow).join("");

    const builds = $("[data-build-list]");
    if (builds) builds.innerHTML = desktopBuilds.map(buildRow).join("");

    const archives = $("[data-archive-list]");
    if (archives) archives.innerHTML = sourceArchives.map(buildRow).join("");

    const repos = $("[data-repo-list]");
    if (repos) {
      repos.innerHTML = [
        ...publicRepos.map((repo) => repoRow(repo, false)),
        ...privateRepos.map((repo) => repoRow(repo, true))
      ].join("");
    }

    const blockedList = $("[data-blocked-inputs]");
    if (blockedList) {
      blockedList.innerHTML = blocked.map((item) => `<div class="sg-source-row"><div class="sg-source-main"><strong>${escapeHtml(item)}</strong><span>waiting on owner-approved import or connector</span></div><div class="sg-count warn">pending</div></div>`).join("");
    }
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
