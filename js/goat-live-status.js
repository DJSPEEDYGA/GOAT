(function () {
  "use strict";

  /* GOAT live endpoint status — pings the real GOAT servers and marks
     each card online / offline. no-cors pings: any response = reachable. */

  const endpoints = [
    { id: "oscar", label: "Oscar Console", url: "http://72.61.193.184:3335/", desc: "Oscar local-AI console on the production box" },
    { id: "agent-007", label: "AGENT-007", url: "http://72.61.193.184:3334/", desc: "Agent 007 chat server" },
    { id: "casino", label: "GOAT Casino", url: "http://casino.72.61.193.184.nip.io/", desc: "Private VIP casino shell" },
    { id: "goat-city", label: "GOAT City RP", url: "https://cfx.re/join/3ygz8lo", desc: "BrickSquaD-Rp | GOAT City RP (FiveM)", ping: false }
  ];

  function ping(url, timeoutMs) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const timer = setTimeout(() => { controller.abort(); resolve(false); }, timeoutMs || 6000);
      fetch(url, { mode: "no-cors", cache: "no-store", signal: controller.signal })
        .then(() => { clearTimeout(timer); resolve(true); })
        .catch(() => { clearTimeout(timer); resolve(false); });
    });
  }

  function refresh(root) {
    endpoints.forEach((endpoint) => {
      const card = root.querySelector('[data-goat-endpoint="' + endpoint.id + '"]');
      if (!card) return;
      const badge = card.querySelector("[data-goat-endpoint-status]");
      if (!badge) return;
      if (endpoint.ping === false) {
        badge.textContent = "join";
        badge.dataset.state = "join";
        return;
      }
      badge.textContent = "checking";
      badge.dataset.state = "checking";
      ping(endpoint.url).then((ok) => {
        badge.textContent = ok ? "online" : "offline";
        badge.dataset.state = ok ? "online" : "offline";
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function render(root) {
    root.innerHTML = endpoints.map((endpoint) => `
      <a class="goat-live-card" data-goat-endpoint="${escapeHtml(endpoint.id)}" href="${escapeHtml(endpoint.url)}" target="_blank" rel="noopener">
        <span class="goat-live-badge" data-goat-endpoint-status data-state="checking">checking</span>
        <b>${escapeHtml(endpoint.label)}</b>
        <p>${escapeHtml(endpoint.desc)}</p>
        <small>${escapeHtml(endpoint.url)}</small>
      </a>
    `).join("");
    refresh(root);
  }

  window.GoatLiveStatus = { endpoints: endpoints, render: render, refresh: refresh };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-goat-live-strip]").forEach((target) => {
      render(target);
      setInterval(() => refresh(target), 60000);
    });
  });
}());
