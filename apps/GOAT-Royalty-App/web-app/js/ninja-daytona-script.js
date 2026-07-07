// NOTE: The following BASE_DOMAIN is environment-specific
// and is replaced by the website_assets Lambda during CDK deployment
// If ever deploying / uploading manually, you will need to update these values.
// DO NOT UPDATE THE FORMATTING OF THE FOLLOWING LINES.
const BASE_DOMAIN = "super.myninja.ai";
const WEBSITE_DOMAIN_PREFIX = "sites";

const BASE_URL = `https://${WEBSITE_DOMAIN_PREFIX}.${BASE_DOMAIN}`;
const ALLOWED_PARENTS = new Set([`https://${BASE_DOMAIN}`]);
const HEALTH_CHECK_INTERVAL_SECONDS = 30;
const HEALTH_CHECK_TIMEOUT_SECONDS = 10;

function getParentOrigin() {
  try {
    if (window.self === window.top) return null;
    const ref = document.referrer || "";
    if (!ref) return null;
    const origin = new URL(ref).origin;
    return ALLOWED_PARENTS.has(origin) ? origin : null;
  } catch {
    return null;
  }
}

function initDomainSpecificContent() {
  const hostname = window.location.hostname;
  const bannerName = "ninja-daytona-banner";
  const footerName = "ninja-badge";

  function createBanner() {
    if (!document.body) {
      setTimeout(createBanner, 100);
      return;
    }

    const banner = document.createElement("div");
    fetch(`${BASE_URL}/_assets/${bannerName}.html`)
      .then((response) => response.text())
      .then((html) => {
        banner.innerHTML = html;
        document.body.appendChild(banner);
        const ninjaBanner = document.getElementById(bannerName);
        if (!ninjaBanner) return;
        document.body.style.paddingTop = "40px";
        // Initialize connection status checker after banner is loaded
        initConnectionStatusChecker();
      })
      .catch((error) => {
        console.error("Error fetching banner content:", error);
      });
  }

  function createFooter() {
    if (!document.body) {
      setTimeout(createFooter, 100);
      return;
    }

    fetch(`${BASE_URL}/_assets/${footerName}.html`)
      .then((r) => r.text())
      .then((html) => {
        document.querySelectorAll("#ninja-badge").forEach((el) => el.remove());
        document.body.insertAdjacentHTML("beforeend", html);
      })
      .catch((error) => {
        console.error("Error fetching footer content:", error);
      });
  }

  function createConnectionStatus() {
    if (!document.body) {
      setTimeout(createConnectionStatus, 100);
      return;
    }

    const statusContainer = document.createElement("div");
    fetch(`${BASE_URL}/_assets/ninja-connection-status.html`)
      .then((response) => response.text())
      .then((html) => {
        statusContainer.innerHTML = html;
        document.body.appendChild(statusContainer);
        initConnectionStatusChecker();
      })
      .catch((error) => {
        console.error("Error fetching connection status content:", error);
      });
  }

  function initConnectionStatusChecker() {
    const dot = document.getElementById("ninja-connection-dot");
    const text = document.getElementById("ninja-connection-text");
    if (!dot || !text) return;

    fetch(`${BASE_URL}/_assets/ninja-disconnected-overlay.html`)
      .then((response) => response.text())
      .then((html) => {
        document.body.insertAdjacentHTML("beforeend", html);
        const overlay = document.getElementById("ninja-disconnect-overlay");
        initHealthChecking(overlay);
      })
      .catch((error) => {
        console.error("Error loading disconnected overlay:", error);
        initHealthChecking(null);
      });
  }

  function initHealthChecking(overlay) {
    const dot = document.getElementById("ninja-connection-dot");
    const spinner = document.getElementById("ninja-connection-spinner");
    const text = document.getElementById("ninja-connection-text");
    if (!dot || !text) return;

    let healthCheckInterval = null;
    let isDisconnected = false;

    function isPageVisible() {
      return document.visibilityState === "visible";
    }

    function startHealthChecking() {
      if (!healthCheckInterval && !isDisconnected && isPageVisible()) {
        healthCheckInterval = setInterval(() => {
          if (isPageVisible()) {
            checkConnection();
          }
        }, HEALTH_CHECK_INTERVAL_SECONDS * 1000);
      }
    }

    function stopHealthChecking() {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
      }
    }

    function showDisconnectedOverlay() {
      if (!isDisconnected && overlay) {
        isDisconnected = true;
        overlay.style.display = "flex";
        // Disable scrolling
        document.body.style.overflow = "hidden";
        stopHealthChecking();
      }
    }

    async function checkConnection() {
      // Only check if page is visible
      if (!isPageVisible()) {
        return;
      }

      // Set to checking state - show spinner, hide dot
      spinner.className = "ninja-connection-status-spinner checking";
      dot.className = "ninja-connection-status-dot checking";

      try {
        // Create a timeout promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), HEALTH_CHECK_TIMEOUT_SECONDS * 1000);
        });

        // Race the fetch against the timeout
        const response = await Promise.race([
          fetch("/__ninja/health"),
          timeoutPromise
        ]);

        // Check if response is OK
        // Treat redirects as errors - proxy would return 302 if host is unreachable
        if (!response.ok || response.status === 302) {
          throw new Error("Disconnected");
        }

        spinner.className = "ninja-connection-status-spinner";
        dot.className = "ninja-connection-status-dot connected";
        text.textContent = "Connected";
      } catch (error) {
        spinner.className = "ninja-connection-status-spinner";
        dot.className = "ninja-connection-status-dot disconnected";
        text.textContent = "Disconnected";
        showDisconnectedOverlay();
      }
    }

    // Listen for visibility changes
    document.addEventListener("visibilitychange", () => {
      if (isPageVisible()) {
        // Page became visible - do immediate check and resume health checking
        if (!isDisconnected) {
          checkConnection();
          startHealthChecking();
        }
      } else {
        // Page became hidden - stop health checking
        stopHealthChecking();
      }
    });

    // Initial check (only if page is visible)
    if (isPageVisible()) {
      checkConnection();
      startHealthChecking();
    }
  }

  // Website running on S3 static website hosting
  if (hostname.startsWith(`${WEBSITE_DOMAIN_PREFIX}.`)) {
    createFooter();
  // Website running in a sandbox
  } else if (hostname.includes("super")) {
    createBanner();
    createFooter();
  }
}

const attrs = (el) =>
  el ? Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(" ") : "";

function takeSnapshot() {
  const doctype = document.doctype
    ? new XMLSerializer().serializeToString(document.doctype)
    : "<!DOCTYPE html>";
  return {
    doctype,
    htmlAttrs: attrs(document.documentElement),
    headHTML: document.head ? document.head.innerHTML : "",
    bodyAttrs: attrs(document.body),
  };
}

function cleanHeadToWhitelist(rawHeadHTML) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = rawHeadHTML.replace(/<base[^>]*>/gi, "");
  const ALLOW = new Set(["META", "TITLE", "LINK", "STYLE", "SCRIPT"]);
  const BLACKLIST = /(grapesjs|min\.css|beautify)/i;
  const cleaned = [];
  const seen = new Set();
  for (const node of Array.from(wrapper.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      const src = node.getAttribute("src") || "";
      const href = node.getAttribute("href") || "";
      if (!ALLOW.has(tag)) continue;
      if (BLACKLIST.test(src + href)) continue;
      const html = node.outerHTML;
      if (!seen.has(html)) { cleaned.push(html); seen.add(html); }
    } else if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue)) {
      cleaned.push(node.nodeValue.trim());
    }
  }
  return cleaned.join("\n");
}

function collapseBlankLines(html) {
  return html.replace(/\n{2,}/g, "\n\n");
}

let SNAPSHOT = null;
let ORIGINAL_BODY_SCRIPTS = "";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

function addCDNs(onReady) {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://unpkg.com/grapesjs@0.21.9/dist/css/grapes.min.css";
  document.head.appendChild(css);

  loadScript("https://cdn.jsdelivr.net/npm/js-beautify@1.14.11/js/lib/beautify-html.js")
    .then(() => loadScript("https://unpkg.com/grapesjs@0.21.9/dist/grapes.min.js"))
    .then(onReady)
    .catch(() => {
      console.warn("Beautify failed to load, continuing without it.");
      loadScript("https://unpkg.com/grapesjs@0.21.9/dist/grapes.min.js").then(onReady);
    });
}

function makeBodyEditable() {
  if (document.getElementById("gjs-controls")) return;

  const controls = document.createElement("div");
  controls.id = "gjs-controls";
  Object.assign(controls.style, {
    position: "fixed", bottom: "20px", left: "20px",
    zIndex: "2147483647", display: "flex", gap: "8px",
  });

  const styleBtn = (btn) => Object.assign(btn.style, {
    padding: "10px 16px", background: "#764ba2", color: "#fff",
    border: "none", borderRadius: "8px", fontWeight: "bold",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,.2)",
  });

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "✏️ Edit";
  styleBtn(btnEdit);

  const btnSave = document.createElement("button");
  btnSave.textContent = "💾 Save";
  styleBtn(btnSave);
  btnSave.disabled = true; btnSave.style.opacity = "0.6"; btnSave.style.cursor = "not-allowed";

  controls.append(btnEdit, btnSave);
  document.body.appendChild(controls);

  let editor = null;
  let originalHtml = "";

  btnEdit.onclick = () => {
    if (editor) return;
    if (!SNAPSHOT) SNAPSHOT = takeSnapshot();

    const BLACKLIST = /(grapesjs|beautify)/i;
    ORIGINAL_BODY_SCRIPTS = Array.from(document.body.querySelectorAll("script"))
      .filter(s => !BLACKLIST.test(s.getAttribute("src") || ""))
      .map(s => s.outerHTML)
      .join("\n");

    controls.remove();
    originalHtml = document.body.innerHTML;
    document.body.innerHTML = '<div id="gjs" style="height:100vh"></div>';
    document.body.appendChild(controls);

    editor = grapesjs.init({
      container: "#gjs",
      height: "100vh",
      storageManager: false,
      avoidInlineStyle: false,
      deviceManager: {
        devices: [
          { id: "Desktop", name: "Desktop", width: "" },
          { id: "Tablet",  name: "Tablet",  width: "768px" },
          { id: "Mobile",  name: "Mobile",  width: "320px" },
        ],
      },
      richTextEditor: { actions: ["bold", "italic", "underline"] },
      canvas: {
        styles: [...document.querySelectorAll('link[rel="stylesheet"][href]')].map(l => l.href),
      },
    });

    // Hide all gray GrapesJS UI (panels/gutters) and make canvas full width
    editor.on("load", () => {
      const style = document.createElement("style");
      style.textContent = `
        .gjs-pn-panels,
        .gjs-pn-views-container,
        .gjs-pn-views,
        .gjs-pn-options,
        .gjs-pn-devices,
        .gjs-pn-panel,
        .gjs-blocks-c,
        .gjs-sm-sectors,
        .gjs-trt-traits,
        .gjs-layers { display: none !important; }
        .gjs-editor, .gjs-cv-canvas { background: transparent !important; left: 0 !important; right: 0 !important; width: 100% !important; }
        .gjs-frame { background: transparent !important; }
      `;
      document.head.appendChild(style);
    });

    editor.setComponents(originalHtml);

    const lockFooter = () => {
      const res = editor.getWrapper().find('#ninja-badge');
      if (!res.length) return;
      const footer = res[0];

      const lock = (cmp) => {
        cmp.set({
          selectable: false,
          hoverable: false,
          badgable: false,
          highlightable: false,
          draggable: false,
          droppable: false,
          editable: false,
          copyable: false,
          removable: false,
          layerable: false,
          stylable: false,
        });
        cmp.components().forEach(child => lock(child));
      };

      lock(footer);
    };

    lockFooter();

    btnEdit.disabled = true;
    btnEdit.style.opacity = "0.6";
    btnEdit.style.cursor = "not-allowed";
    btnSave.disabled = false;
    btnSave.style.opacity = "1";
    btnSave.style.cursor = "pointer";
  };

  btnSave.onclick = () => {
    if (!editor) return;

    let rawFragment = editor.getHtml()
      .replace(/<\/?body[^>]*>/gi, "")
      .replace(/<script[^>]*(grapesjs|beautify)[^>]*><\/script>/gi, "")
      .replace(/<link[^>]*(grapesjs|min\.css)[^>]*>/gi, "");

    const htmlBeautify = window.html_beautify || ((s) => s);
    const BEAUTIFY_OPTS = { indent_size: 2, wrap_line_length: 120, preserve_newlines: true, max_preserve_newlines: 1, extra_liners: [] };
    const fragment = htmlBeautify(rawFragment, BEAUTIFY_OPTS);

    document.body.innerHTML = fragment;
    document.body.appendChild(controls);

    const snap = SNAPSHOT || takeSnapshot();
    const cleanHeadHTML = cleanHeadToWhitelist(snap.headHTML);
    const bodyOpen = snap.bodyAttrs && snap.bodyAttrs.trim() ? `<body ${snap.bodyAttrs}>` : `<body>`;
    let fullHtml = `${snap.doctype}
      <html ${snap.htmlAttrs}>
      <head>
      ${cleanHeadHTML}
      </head>
      ${bodyOpen}
      ${fragment}
      ${ORIGINAL_BODY_SCRIPTS}
      </body>
      </html>`;
    fullHtml = fullHtml.replace(/<base[^>]*>/gi, "");
    fullHtml = collapseBlankLines(htmlBeautify(fullHtml, BEAUTIFY_OPTS));

    editor.destroy();
    editor = null;

    btnEdit.disabled = false; btnEdit.style.opacity = "1"; btnEdit.style.cursor = "pointer";
    btnSave.disabled = true;  btnSave.style.opacity = "0.6"; btnSave.style.cursor = "not-allowed";

    const origin = getParentOrigin();
    const target = origin || "*"; // fallback for environments without referrer
    const message = {
      source: "grapesjs",
      type: "GRAPESJS_SAVE_FILE",
      payload: { path: "/index.html", content: fullHtml },
    };
    console.log("[GrapesJS] postMessage", { target, type: message.type, bytes: fullHtml.length });
    window.top.postMessage(message, target);
  };
}

(function startWhenReady() {
  function start() {
    const isHtml = !document.contentType || /text\/html/i.test(document.contentType);
    if (!isHtml) return;

    const isTopLevel = window.self === window.top;
    const hideControls = new URLSearchParams(window.location.search).get('hideControls') === 'true';

    // Allow init even if referrer is missing; we'll fallback to '*' on save
    // Don't show controls if hideControls parameter is set
    if (!isTopLevel && !hideControls) {
      if (!window.SNAPSHOT) window.SNAPSHOT = takeSnapshot();
      addCDNs(makeBodyEditable);
    }

    // Skip banner and footer only when embedded in SitePreview iframe (has hideControls=true)
    // NewHTMLDesignRenderer uses v={timestamp} without hideControls, so it will still show banner/footer
    if (isTopLevel || !hideControls) {
      initDomainSpecificContent();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    setTimeout(start, 10);
  }
})();
