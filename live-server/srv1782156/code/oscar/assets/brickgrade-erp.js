(function () {
  "use strict";

  if (window.__brickGradeERPInstalled) return;
  window.__brickGradeERPInstalled = true;

  const STORAGE_SCOPE = String(window.__brickGradeSessionScope || "").replace(/[^a-f0-9]/gi, "").slice(0, 48);
  const STORAGE_KEY = STORAGE_SCOPE ? `goat-force.brickgrade.local-draft.v1.${STORAGE_SCOPE}` : "";
  const MODULE_VERSION = 1;
  const MIN_DEPTH = 0.72;
  const MAX_DEPTH = 1.55;

  const COMMANDS = [
    { id: "scan", label: "SCAN", metric: "CAPTURE", copy: "Inspect surfaces and record observations." },
    { id: "grade", label: "GRADE", metric: "1000 PT", copy: "Apply the weighted category standard." },
    { id: "evidence", label: "EVIDENCE", metric: "PASSPORT", copy: "Assemble the local evidence record." },
    { id: "market", label: "MARKET", metric: "RANGE", copy: "Model an illustrative value range." }
  ];

  const CATEGORIES = [
    {
      id: "cards",
      name: "Trading Cards",
      code: "CARDS",
      axes: [
        { id: "surface", label: "Surface", weight: 0.28 },
        { id: "corners", label: "Corners", weight: 0.24 },
        { id: "edges", label: "Edges", weight: 0.2 },
        { id: "centering", label: "Centering", weight: 0.16 },
        { id: "print", label: "Print quality", weight: 0.12 }
      ]
    },
    {
      id: "comics",
      name: "Comics",
      code: "COMICS",
      axes: [
        { id: "cover", label: "Cover", weight: 0.24 },
        { id: "spine", label: "Spine", weight: 0.22 },
        { id: "pages", label: "Pages", weight: 0.19 },
        { id: "corners", label: "Corners", weight: 0.17 },
        { id: "restoration", label: "Restoration risk", weight: 0.18 }
      ]
    },
    {
      id: "coins",
      name: "Coins & Currency",
      code: "COINS",
      axes: [
        { id: "surfaces", label: "Surfaces", weight: 0.28 },
        { id: "strike", label: "Strike", weight: 0.22 },
        { id: "luster", label: "Luster", weight: 0.18 },
        { id: "marks", label: "Marks", weight: 0.2 },
        { id: "appeal", label: "Eye appeal", weight: 0.12 }
      ]
    },
    {
      id: "sneakers",
      name: "Sneakers",
      code: "KICKS",
      axes: [
        { id: "uppers", label: "Uppers", weight: 0.25 },
        { id: "soles", label: "Soles", weight: 0.23 },
        { id: "shape", label: "Shape", weight: 0.18 },
        { id: "hardware", label: "Hardware", weight: 0.16 },
        { id: "originality", label: "Originality", weight: 0.18 }
      ]
    },
    {
      id: "watches",
      name: "Watches",
      code: "WATCH",
      axes: [
        { id: "case", label: "Case", weight: 0.2 },
        { id: "dial", label: "Dial & hands", weight: 0.22 },
        { id: "movement", label: "Movement", weight: 0.26 },
        { id: "bracelet", label: "Bracelet", weight: 0.14 },
        { id: "provenance", label: "Provenance", weight: 0.18 }
      ]
    },
    {
      id: "toys",
      name: "Toys & Figures",
      code: "TOYS",
      axes: [
        { id: "paint", label: "Paint", weight: 0.22 },
        { id: "structure", label: "Structure", weight: 0.24 },
        { id: "articulation", label: "Articulation", weight: 0.16 },
        { id: "completeness", label: "Completeness", weight: 0.2 },
        { id: "packaging", label: "Packaging", weight: 0.18 }
      ]
    },
    {
      id: "memorabilia",
      name: "Memorabilia",
      code: "MEM",
      axes: [
        { id: "authenticity", label: "Authenticity evidence", weight: 0.28 },
        { id: "material", label: "Material condition", weight: 0.18 },
        { id: "display", label: "Display quality", weight: 0.14 },
        { id: "provenance", label: "Provenance", weight: 0.24 },
        { id: "inscription", label: "Inscription", weight: 0.16 }
      ]
    },
    {
      id: "media",
      name: "Music & Media",
      code: "MEDIA",
      axes: [
        { id: "surface", label: "Media surface", weight: 0.28 },
        { id: "playback", label: "Playback", weight: 0.25 },
        { id: "label", label: "Label", weight: 0.15 },
        { id: "packaging", label: "Packaging", weight: 0.16 },
        { id: "markers", label: "Issue markers", weight: 0.16 }
      ]
    },
    {
      id: "art",
      name: "Art",
      code: "ART",
      axes: [
        { id: "surface", label: "Surface", weight: 0.2 },
        { id: "medium", label: "Medium", weight: 0.18 },
        { id: "support", label: "Support", weight: 0.18 },
        { id: "provenance", label: "Provenance", weight: 0.26 },
        { id: "presentation", label: "Presentation", weight: 0.18 }
      ]
    },
    {
      id: "specialist",
      name: "Specialist Objects",
      code: "SPEC",
      axes: [
        { id: "condition", label: "Condition", weight: 0.22 },
        { id: "integrity", label: "Integrity", weight: 0.22 },
        { id: "completeness", label: "Completeness", weight: 0.2 },
        { id: "provenance", label: "Provenance", weight: 0.22 },
        { id: "marketability", label: "Marketability", weight: 0.14 }
      ]
    }
  ];

  const EVIDENCE_CHECKS = [
    { id: "identity", label: "Item identity and issue markers recorded" },
    { id: "capture", label: "Condition observations captured" },
    { id: "authenticity", label: "Authenticity checks documented" },
    { id: "provenance", label: "Ownership or provenance notes reviewed" },
    { id: "anomalies", label: "Anomalies and limitations disclosed" }
  ];

  const categoryById = (id) => CATEGORIES.find((category) => category.id === id) || CATEGORIES[0];
  const commandById = (id) => COMMANDS.find((command) => command.id === id) || COMMANDS[1];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const finiteNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);

  const defaultScores = {};
  CATEGORIES.forEach((category) => {
    defaultScores[category.id] = {};
    category.axes.forEach((axis) => {
      defaultScores[category.id][axis.id] = 85;
    });
  });

  const state = {
    command: "grade",
    category: "cards",
    scores: defaultScores,
    rotationX: -8,
    rotationY: 18,
    depth: 1,
    motion: !window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    item: { title: "", reference: "", notes: "" },
    evidence: EVIDENCE_CHECKS.reduce((result, check) => {
      result[check.id] = false;
      return result;
    }, {}),
    valuation: { lastSale: 0, volatility: 12, comps: 0 },
    lockedAt: ""
  };

  let lastLockedSnapshot = "";
  let observer;
  let mountQueued = false;
  const initializedSections = new WeakSet();
  const stagePointers = new Map();
  let gestureOrigin = null;
  const boundNavs = new WeakSet();
  let announceTimer = 0;

  function getGrade() {
    const category = categoryById(state.category);
    const axisResults = category.axes.map((axis) => ({
      id: axis.id,
      label: axis.label,
      weight: axis.weight,
      value: clamp(finiteNumber(state.scores[category.id][axis.id], 0), 0, 100)
    }));
    const weighted = axisResults.reduce((sum, axis) => sum + axis.value * axis.weight, 0);
    const raw = clamp(Math.round(weighted * 10), 0, 1000);
    const limiting = axisResults.reduce((lowest, axis) => axis.value < lowest.value ? axis : lowest, axisResults[0]);
    let cap = 1000;
    if (limiting.value < 40) cap = 499;
    else if (limiting.value < 60) cap = 699;
    else if (limiting.value < 70) cap = 799;
    else if (limiting.value < 80) cap = 899;
    const score = Math.min(raw, cap);
    let band = "Poor / Study";
    if (score >= 950) band = "Exceptional";
    else if (score >= 900) band = "Mint";
    else if (score >= 850) band = "Near Mint+";
    else if (score >= 800) band = "Near Mint";
    else if (score >= 700) band = "Excellent";
    else if (score >= 600) band = "Very Good";
    else if (score >= 500) band = "Good";
    else if (score >= 350) band = "Fair";
    return { category, axisResults, raw, limiting, cap, score, band, ten: (score / 100).toFixed(1) };
  }

  function getEvidenceStatus() {
    const complete = EVIDENCE_CHECKS.filter((check) => Boolean(state.evidence[check.id])).length;
    const core = JSON.stringify(passportCore());
    const changed = Boolean(state.lockedAt && lastLockedSnapshot && core !== lastLockedSnapshot);
    let label = `${complete}/${EVIDENCE_CHECKS.length} checks recorded`;
    if (complete === EVIDENCE_CHECKS.length) label = "Evidence checklist complete";
    if (state.lockedAt && !changed) label += " · locked locally";
    if (changed) label += " · modified since local lock";
    return { complete, label, changed };
  }

  function getValuation() {
    const sale = Math.max(0, finiteNumber(state.valuation.lastSale, 0));
    const volatility = clamp(finiteNumber(state.valuation.volatility, 0), 0, 100) / 100;
    const comps = clamp(Math.round(finiteNumber(state.valuation.comps, 0)), 0, 999);
    if (!sale || !comps) return { available: false, low: 0, center: 0, high: 0 };
    const grade = getGrade();
    const gradeFactor = 0.65 + (grade.score / 1000) * 0.42;
    const compConfidence = clamp(comps / 12, 0, 1);
    const center = sale * gradeFactor;
    const spread = clamp(volatility + (1 - compConfidence) * 0.08, 0.03, 0.75);
    return {
      available: true,
      low: Math.max(0, center * (1 - spread)),
      center,
      high: center * (1 + spread)
    };
  }

  function currency(value) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  function hashText(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  }

  function snapshotCore() {
    const scores = {};
    CATEGORIES.forEach((category) => {
      scores[category.id] = {};
      category.axes.forEach((axis) => {
        scores[category.id][axis.id] = clamp(
          Math.round(finiteNumber(state.scores[category.id][axis.id], 0)),
          0,
          100
        );
      });
    });
    return {
      command: state.command,
      category: state.category,
      scores,
      rotationX: state.rotationX,
      rotationY: state.rotationY,
      depth: state.depth,
      motion: state.motion,
      item: {
        title: String(state.item.title || "").slice(0, 180),
        reference: String(state.item.reference || "").slice(0, 120),
        notes: String(state.item.notes || "").slice(0, 1500)
      },
      evidence: EVIDENCE_CHECKS.reduce((result, check) => {
        result[check.id] = Boolean(state.evidence[check.id]);
        return result;
      }, {}),
      valuation: {
        lastSale: Math.max(0, finiteNumber(state.valuation.lastSale, 0)),
        volatility: clamp(finiteNumber(state.valuation.volatility, 0), 0, 100),
        comps: clamp(Math.round(finiteNumber(state.valuation.comps, 0)), 0, 999)
      }
    };
  }

  function passportCore() {
    const core = snapshotCore();
    return {
      category: core.category,
      scores: core.scores,
      item: core.item,
      evidence: core.evidence,
      valuation: core.valuation
    };
  }

  function hydrateState(raw) {
    if (!raw || typeof raw !== "object") throw new Error("Draft data is not valid.");
    if (CATEGORIES.some((category) => category.id === raw.category)) state.category = raw.category;
    if (COMMANDS.some((command) => command.id === raw.command)) state.command = raw.command;

    CATEGORIES.forEach((category) => {
      category.axes.forEach((axis) => {
        const candidate = raw.scores && raw.scores[category.id] && raw.scores[category.id][axis.id];
        if (candidate !== undefined) {
          state.scores[category.id][axis.id] = clamp(Math.round(finiteNumber(candidate, 85)), 0, 100);
        }
      });
    });

    state.rotationX = clamp(finiteNumber(raw.rotationX, -8), -65, 65);
    state.rotationY = finiteNumber(raw.rotationY, 18);
    state.depth = clamp(finiteNumber(raw.depth, 1), MIN_DEPTH, MAX_DEPTH);
    state.motion = typeof raw.motion === "boolean" ? raw.motion : state.motion;
    state.item.title = String(raw.item && raw.item.title || "").slice(0, 180);
    state.item.reference = String(raw.item && raw.item.reference || "").slice(0, 120);
    state.item.notes = String(raw.item && raw.item.notes || "").slice(0, 1500);
    EVIDENCE_CHECKS.forEach((check) => {
      state.evidence[check.id] = Boolean(raw.evidence && raw.evidence[check.id]);
    });
    state.valuation.lastSale = Math.max(0, finiteNumber(raw.valuation && raw.valuation.lastSale, 0));
    state.valuation.volatility = clamp(finiteNumber(raw.valuation && raw.valuation.volatility, 0), 0, 100);
    state.valuation.comps = clamp(Math.round(finiteNumber(raw.valuation && raw.valuation.comps, 0)), 0, 999);
  }

  function navMarkup() {
    return `
      <button type="button" id="bx-nav-button" data-page="brickgrade" aria-controls="page-brickgrade">
        <span aria-hidden="true">BG</span>
        <span>BrickGrade</span>
      </button>`;
  }

  function launchTileMarkup() {
    return `
      <span class="bx-launch-tile-mark" aria-hidden="true">BG</span>
      <span class="bx-launch-tile-copy">
        <strong>BrickGrade Exchange</strong>
        <span>Forensic grading, evidence passports and valuation modeling</span>
      </span>
      <span class="bx-launch-tile-arrow" aria-hidden="true">↗</span>`;
  }

  function sectionMarkup() {
    const modeButtons = COMMANDS.map((command) => `
      <button class="bx-mode-button${command.id === state.command ? " is-active" : ""}" type="button" data-bx-command="${command.id}" aria-pressed="${command.id === state.command}">
        <span class="bx-mode-icon" aria-hidden="true">${command.label.slice(0, 1)}</span>
        <span class="bx-mode-label">${command.label}</span>
        <span class="bx-mode-metric">${command.metric}</span>
      </button>`).join("");

    const categoryOptions = CATEGORIES.map((category) =>
      `<option value="${category.id}">${escapeHTML(category.name)}</option>`
    ).join("");

    const categoryCards = CATEGORIES.map((category) => `
      <button class="bx-category-card${category.id === state.category ? " is-active" : ""}" type="button" data-bx-category="${category.id}" aria-pressed="${category.id === state.category}">
        <span>${escapeHTML(category.name)}</span>
        <small>${category.axes.length} weighted axes</small>
      </button>`).join("");

    const evidenceChecks = EVIDENCE_CHECKS.map((check) => `
      <label class="bx-check">
        <input type="checkbox" data-bx-evidence="${check.id}">
        <span>${escapeHTML(check.label)}</span>
      </label>`).join("");

    return `
      <div class="bx-shell">
        <div class="bx-command-bar">
          <div class="bx-brand">
            <span class="bx-brand-mark" aria-hidden="true">BG</span>
            <span><strong>BRICKGRADE EXCHANGE</strong><small>GOAT FORCE // LOCAL GRADING LAB</small></span>
          </div>
          <div class="bx-status"><span class="bx-signal-dot" aria-hidden="true"></span>Local engine ready</div>
          <div class="bx-command-actions">
            <button class="bx-btn bx-ghost" id="bx-motion" type="button" aria-label="Toggle 4D motion" title="Toggle 4D motion" aria-pressed="${state.motion}">4D ${state.motion ? "ON" : "OFF"}</button>
            <button class="bx-btn bx-icon" id="bx-fullscreen" type="button" aria-label="Toggle BrickGrade fullscreen">FULL</button>
            <button class="bx-btn bx-icon" id="bx-reset-view" type="button" aria-label="Reset spatial view">RESET</button>
          </div>
        </div>

        <header class="bx-hero">
          <div class="bx-hero-copy">
            <p class="bx-kicker">THE CALIBRATION VAULT // SPATIAL COMMAND</p>
            <h2 class="bx-title">Grade the object.<br><span>Prove the result.</span></h2>
            <p class="bx-lede">A deterministic 1,000-point grading workbench for ten collectible categories, with a local evidence passport and transparent limiting-axis cap.</p>
            <div class="bx-chips" aria-label="System capabilities">
              <span>TOUCH + POINTER</span><span>KEYBOARD</span><span>LOCAL STORAGE</span><span>LOCAL-ONLY DRAFTS</span>
            </div>
          </div>
        </header>

        <div class="bx-war-room">
          <nav class="bx-command-rail" aria-label="BrickGrade command layers">
            <div class="bx-command-copy">
              <span>COMMAND LAYERS</span>
              <strong id="bx-command-name">GRADE</strong>
            </div>
            ${modeButtons}
          </nav>

          <div class="bx-stage" id="bx-stage" tabindex="0" role="group" aria-label="Interactive three-dimensional evidence scene. Drag to orbit, pinch or use plus and minus to change depth. Use arrow keys to orbit and Home to reset.">
            <div class="bx-atmosphere" aria-hidden="true"></div>
            <div class="bx-data-rain" aria-hidden="true"></div>
            <div class="bx-scan-plane" aria-hidden="true"></div>
            <div class="bx-stage-corners" aria-hidden="true">
              <i class="bx-stage-corner"></i><i class="bx-stage-corner"></i><i class="bx-stage-corner"></i><i class="bx-stage-corner"></i>
            </div>
            <div class="bx-holo-scene" id="bx-holo-scene" aria-hidden="true">
              <div class="bx-scene-ring bx-ring-1"></div>
              <div class="bx-scene-ring bx-ring-2"></div>
              <div class="bx-scene-ring bx-ring-3"></div>
              <div class="bx-evidence-stack">
                <div class="bx-evidence-plate" data-bx-plate="scan"><span class="bx-plate-label">SURFACE FIELD</span><strong class="bx-plate-value">OBSERVE</strong></div>
                <div class="bx-evidence-plate is-active" data-bx-plate="grade"><span class="bx-plate-label">WEIGHTED STANDARD</span><strong class="bx-plate-value" id="bx-plate-score">850</strong></div>
                <div class="bx-evidence-plate" data-bx-plate="evidence"><span class="bx-plate-label">EVIDENCE PASSPORT</span><strong class="bx-plate-value" id="bx-plate-evidence">0 / 5</strong></div>
                <div class="bx-evidence-plate" data-bx-plate="market"><span class="bx-plate-label">ILLUSTRATIVE RANGE</span><strong class="bx-plate-value" id="bx-plate-market">INPUT</strong></div>
              </div>
              <div class="bx-slab">
                <span class="bx-grade-label" id="bx-slab-category">TRADING CARDS</span>
                <strong class="bx-grade" id="bx-slab-grade">850</strong>
                <span class="bx-grade-confidence" id="bx-slab-ten">8.5 / 10.0</span>
              </div>
              <div class="bx-orbit bx-orbit-one"><span class="bx-orbit-node">AXIS</span></div>
              <div class="bx-orbit bx-orbit-two"><span class="bx-orbit-node">CAP</span></div>
              <div class="bx-pedestal"></div>
            </div>
            <div class="bx-live-readout" id="bx-scene-readout">X −08° / Y +18° / DEPTH 100%</div>
            <button class="bx-btn bx-ghost bx-stage-reset" id="bx-stage-reset" type="button">RESET VIEW</button>
            <p class="bx-stage-help" id="bx-stage-help">Drag to orbit · pinch or scroll for depth · arrow keys, +, − and Home supported</p>
          </div>

          <aside class="bx-mission-panel" aria-label="Current grading readout">
            <p class="bx-kicker">MISSION READOUT</p>
            <h3 id="bx-mission-command">GRADE // WEIGHTED STANDARD</h3>
            <p id="bx-mission-copy">Apply the weighted category standard.</p>
            <div class="bx-metric-grid">
              <div class="bx-metric"><span>SCORE</span><strong id="bx-metric-score">850</strong></div>
              <div class="bx-metric"><span>10.0 SCALE</span><strong id="bx-metric-ten">8.5</strong></div>
              <div class="bx-metric"><span>LIMITER</span><strong id="bx-metric-limiter">SURFACE 85</strong></div>
              <div class="bx-metric"><span>CAP</span><strong id="bx-metric-cap">1000</strong></div>
            </div>
          </aside>
        </div>

        <div class="bx-touch-deck" aria-label="Touch command deck">
          <div class="bx-touch-group bx-category-control">
            <button class="bx-btn bx-icon" id="bx-category-prev" type="button" aria-label="Previous collectible category">←</button>
            <label class="bx-field">
              <span>COLLECTIBLE CLASS</span>
              <select class="bx-select" id="bx-category-select">${categoryOptions}</select>
            </label>
            <button class="bx-btn bx-icon" id="bx-category-next" type="button" aria-label="Next collectible category">→</button>
          </div>
          <div class="bx-touch-group bx-zoom-controls">
            <span>SCENE DEPTH</span>
            <button class="bx-btn bx-icon" id="bx-depth-out" type="button" aria-label="Decrease scene depth">−</button>
            <strong id="bx-depth-label">100%</strong>
            <button class="bx-btn bx-icon" id="bx-depth-in" type="button" aria-label="Increase scene depth">+</button>
          </div>
        </div>

        <div class="bx-signal-strip" aria-label="Engine facts">
          <div class="bx-signal"><span>ENGINE</span><strong>DETERMINISTIC</strong></div>
          <div class="bx-signal"><span>STANDARD</span><strong>WEIGHTED AXES</strong></div>
          <div class="bx-signal"><span>STORAGE</span><strong>THIS BROWSER</strong></div>
          <div class="bx-signal"><span>MODULE EGRESS</span><strong>NONE</strong></div>
        </div>

        <section class="bx-section" aria-labelledby="bx-workbench-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">01 // UNIVERSAL ENGINE</p><h3 id="bx-workbench-title">Condition grading workbench</h3></div>
            <p>Choose a category, document the item and move every weighted axis. The lowest axis can cap the final score.</p>
          </div>
          <div class="bx-profile-grid" aria-label="Collectible categories">${categoryCards}</div>
          <div class="bx-workbench">
            <div>
              <div class="bx-form-grid">
                <label class="bx-field"><span>ITEM TITLE</span><input class="bx-input" id="bx-item-title" type="text" maxlength="180" autocomplete="off"></label>
                <label class="bx-field"><span>REFERENCE / SKU</span><input class="bx-input" id="bx-item-reference" type="text" maxlength="120" autocomplete="off"></label>
                <label class="bx-field bx-field-wide"><span>EXAMINATION NOTES</span><textarea class="bx-textarea" id="bx-item-notes" rows="3" maxlength="1500"></textarea></label>
              </div>
              <div class="bx-axes" id="bx-axes"></div>
            </div>
            <aside class="bx-grade-card" aria-label="Calculated grade">
              <span>BRICKGRADE SCORE</span>
              <strong class="bx-grade-score" id="bx-grade-score">850</strong>
              <div class="bx-grade-ten" id="bx-grade-ten">8.5 / 10.0</div>
              <div class="bx-grade-band" id="bx-grade-band">NEAR MINT+</div>
              <dl>
                <div><dt>RAW WEIGHTED</dt><dd id="bx-raw-score">850</dd></div>
                <div><dt>LIMITING AXIS</dt><dd id="bx-limiting-axis">Surface · 85</dd></div>
                <div><dt>ACTIVE CAP</dt><dd id="bx-active-cap">1000</dd></div>
              </dl>
              <p class="bx-cap-note" id="bx-cap-note">No limiting-axis cap is active.</p>
            </aside>
          </div>
        </section>

        <section class="bx-section bx-passport" aria-labelledby="bx-passport-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">02 // EVIDENCE</p><h3 id="bx-passport-title">Local evidence passport</h3></div>
            <p>A transparent draft record stored only in this browser. It is not a certification or database registration.</p>
          </div>
          <div class="bx-passport-grid">
            <div>
              <div class="bx-evidence-list">${evidenceChecks}</div>
              <div class="bx-local-actions">
                <button class="bx-btn bx-primary" id="bx-lock-draft" type="button">LOCK LOCAL DRAFT</button>
                <button class="bx-btn bx-ghost" id="bx-restore-draft" type="button">RESTORE LOCAL DRAFT</button>
                <button class="bx-btn bx-ghost" id="bx-copy-passport" type="button">COPY PASSPORT</button>
              </div>
            </div>
            <article class="bx-passport-copy" aria-label="Evidence passport preview">
              <span>BRICKGRADE // LOCAL DRAFT</span>
              <strong id="bx-passport-id">BG-00000000</strong>
              <div class="bx-finding"><span>ITEM</span><b id="bx-passport-item">Untitled item</b></div>
              <div class="bx-finding"><span>CATEGORY</span><b id="bx-passport-category">Trading Cards</b></div>
              <div class="bx-finding"><span>GRADE</span><b id="bx-passport-grade">850 / 8.5</b></div>
              <div class="bx-finding"><span>LIMITER</span><b id="bx-passport-limiter">Surface · 85</b></div>
              <div class="bx-passport-status" id="bx-passport-status">0/5 checks recorded</div>
            </article>
          </div>
        </section>

        <section class="bx-section bx-valuation" aria-labelledby="bx-valuation-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">03 // VALUE MODEL</p><h3 id="bx-valuation-title">Valuation lab</h3></div>
            <p>Enter verified sale research to explore a transparent illustrative range.</p>
          </div>
          <div class="bx-market-grid">
            <div class="bx-form-grid">
              <label class="bx-field"><span>LAST SALE ($)</span><input class="bx-input" id="bx-last-sale" type="number" min="0" step="1" inputmode="decimal" value="0"></label>
              <label class="bx-field"><span>VOLATILITY (%)</span><input class="bx-input" id="bx-volatility" type="number" min="0" max="100" step="1" inputmode="decimal" value="12"></label>
              <label class="bx-field"><span>COMPARABLE SALES</span><input class="bx-input" id="bx-comps" type="number" min="0" max="999" step="1" inputmode="numeric" value="0"></label>
            </div>
            <div class="bx-range">
              <span class="bx-range-label">ILLUSTRATIVE RANGE</span>
              <strong class="bx-range-value" id="bx-range-value">$0 — $0</strong>
              <small id="bx-range-center">Modeled midpoint $0</small>
              <p class="bx-valuation-note">Illustrative only. This model uses your inputs and the calculated condition score; it is not live market data, an appraisal, an offer or a guarantee.</p>
            </div>
          </div>
        </section>

        <div class="bx-toast" id="bx-live-region" role="status" aria-live="polite" aria-atomic="true" hidden></div>
      </div>`;
  }

  function announce(message) {
    const region = document.getElementById("bx-live-region");
    if (!region) return;
    window.clearTimeout(announceTimer);
    region.hidden = false;
    region.textContent = "";
    window.setTimeout(() => { region.textContent = message; }, 20);
    announceTimer = window.setTimeout(() => {
      region.hidden = true;
    }, 3600);
  }

  function hasAuthenticatedShell() {
    const body = document.body;
    const appView = document.getElementById("app-view");
    const loginView = document.getElementById("login-view");
    if (!body || !body.classList.contains("erp-authenticated")) return false;
    if (!appView || !appView.classList.contains("active")) return false;
    if (!loginView || window.getComputedStyle(loginView).display !== "none") return false;
    return true;
  }

  function removeInjectedUI() {
    document.getElementById("bx-nav-item")?.remove();
    document.getElementById("bx-launch-tile")?.remove();
    document.getElementById("page-brickgrade")?.remove();
    stagePointers.clear();
    gestureOrigin = null;
  }

  function ensureNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    let item = document.getElementById("bx-nav-item");
    if (!item) {
      item = document.createElement("li");
      item.id = "bx-nav-item";
      item.className = "bx-nav-item";
      item.innerHTML = navMarkup();
      nav.appendChild(item);
      item.querySelector("button").addEventListener("click", openBrickGrade);
    }
    if (!boundNavs.has(nav)) {
      nav.addEventListener("click", (event) => {
        const trigger = event.target instanceof Element ? event.target.closest("[data-page]") : null;
        if (!trigger || trigger.dataset.page === "brickgrade") return;
        const brickGradeButton = document.getElementById("bx-nav-button");
        const brickGradeItem = document.getElementById("bx-nav-item");
        brickGradeButton?.removeAttribute("aria-current");
        brickGradeButton?.classList.remove("active");
        brickGradeItem?.classList.remove("active");
      });
      boundNavs.add(nav);
    }
  }

  function ensureLaunchTile() {
    const tiles = document.getElementById("app-tiles");
    if (!tiles || document.getElementById("bx-launch-tile")) return;
    const tile = document.createElement("button");
    tile.type = "button";
    tile.id = "bx-launch-tile";
    tile.className = "bx-launch-tile";
    tile.dataset.page = "brickgrade";
    tile.setAttribute("aria-controls", "page-brickgrade");
    tile.innerHTML = launchTileMarkup();
    tile.addEventListener("click", openBrickGrade);
    tiles.appendChild(tile);
  }

  function ensureSection() {
    const content = document.getElementById("content");
    if (!content) return null;
    let section = document.getElementById("page-brickgrade");
    if (!section) {
      section = document.createElement("section");
      section.id = "page-brickgrade";
      section.className = "page";
      section.setAttribute("aria-labelledby", "bx-workbench-title");
      content.appendChild(section);
    }
    if (!initializedSections.has(section)) {
      section.innerHTML = sectionMarkup();
      initializedSections.add(section);
      bindSection(section);
      renderAxes();
      syncFormValues();
      updateUI();
    }
    return section;
  }

  function openBrickGrade(event) {
    if (event) event.preventDefault();
    if (!hasAuthenticatedShell()) return;
    const section = ensureSection();
    if (!section) return;

    if (typeof window.switchPage === "function") {
      try { window.switchPage("brickgrade"); } catch (_) { /* shell fallback below */ }
    }

    document.querySelectorAll("#content > .page").forEach((page) => {
      const active = page === section;
      page.classList.toggle("active", active);
    });
    document.querySelectorAll("#nav [data-page]").forEach((button) => {
      const active = button.dataset.page === "brickgrade";
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
      if (button.parentElement) button.parentElement.classList.toggle("active", active);
    });
    const title = document.getElementById("page-title");
    if (title) title.textContent = "BrickGrade Exchange";
    announce("BrickGrade Exchange opened.");
    window.requestAnimationFrame(() => document.getElementById("bx-stage")?.focus({ preventScroll: true }));
  }

  function renderAxes() {
    const container = document.getElementById("bx-axes");
    if (!container) return;
    const category = categoryById(state.category);
    container.innerHTML = category.axes.map((axis) => {
      const value = state.scores[category.id][axis.id];
      const inputId = `bx-axis-${category.id}-${axis.id}`;
      return `
        <div class="bx-axis">
          <div class="bx-axis-head">
            <label class="bx-axis-name" for="${inputId}">${escapeHTML(axis.label)}</label>
            <span class="bx-axis-weight">${Math.round(axis.weight * 100)}% WEIGHT</span>
            <output class="bx-axis-value" for="${inputId}">${value}</output>
          </div>
          <input class="bx-slider" id="${inputId}" type="range" min="0" max="100" step="1" value="${value}" data-bx-axis="${axis.id}" aria-valuetext="${value} out of 100">
        </div>`;
    }).join("");

    container.querySelectorAll("[data-bx-axis]").forEach((slider) => {
      slider.addEventListener("input", () => {
        const value = clamp(Math.round(finiteNumber(slider.value, 0)), 0, 100);
        state.scores[state.category][slider.dataset.bxAxis] = value;
        slider.setAttribute("aria-valuetext", `${value} out of 100`);
        const output = slider.closest(".bx-axis").querySelector(".bx-axis-value");
        if (output) output.value = value;
        updateUI();
      });
    });
  }

  function selectCategory(categoryId, shouldAnnounce) {
    if (!CATEGORIES.some((category) => category.id === categoryId)) return;
    state.category = categoryId;
    renderAxes();
    syncFormValues();
    updateUI();
    if (shouldAnnounce) announce(`${categoryById(categoryId).name} grading profile selected.`);
  }

  function shiftCategory(direction) {
    const index = CATEGORIES.findIndex((category) => category.id === state.category);
    const next = (index + direction + CATEGORIES.length) % CATEGORIES.length;
    selectCategory(CATEGORIES[next].id, true);
  }

  function activateCommand(commandId, shouldAnnounce) {
    if (!COMMANDS.some((command) => command.id === commandId)) return;
    state.command = commandId;
    updateUI();
    if (shouldAnnounce) announce(`${commandById(commandId).label} command layer active.`);
  }

  function resetScene(shouldAnnounce) {
    state.rotationX = -8;
    state.rotationY = 18;
    state.depth = 1;
    updateScene();
    updateUI();
    if (shouldAnnounce) announce("Spatial view reset.");
  }

  function updateScene() {
    const scene = document.getElementById("bx-holo-scene");
    if (scene) {
      scene.style.setProperty("--bx-rx", `${state.rotationX}deg`);
      scene.style.setProperty("--bx-ry", `${state.rotationY}deg`);
      scene.style.setProperty("--bx-depth", String(state.depth));
    }
    const readout = document.getElementById("bx-scene-readout");
    if (readout) {
      const x = `${state.rotationX >= 0 ? "+" : "−"}${Math.abs(Math.round(state.rotationX)).toString().padStart(2, "0")}°`;
      const y = `${state.rotationY >= 0 ? "+" : "−"}${Math.abs(Math.round(state.rotationY)).toString().padStart(2, "0")}°`;
      readout.textContent = `X ${x} / Y ${y} / DEPTH ${Math.round(state.depth * 100)}%`;
    }
    const depthLabel = document.getElementById("bx-depth-label");
    if (depthLabel) depthLabel.textContent = `${Math.round(state.depth * 100)}%`;
  }

  function syncFormValues() {
    const categorySelect = document.getElementById("bx-category-select");
    if (categorySelect) categorySelect.value = state.category;
    const itemTitle = document.getElementById("bx-item-title");
    const itemReference = document.getElementById("bx-item-reference");
    const itemNotes = document.getElementById("bx-item-notes");
    if (itemTitle) itemTitle.value = state.item.title;
    if (itemReference) itemReference.value = state.item.reference;
    if (itemNotes) itemNotes.value = state.item.notes;
    EVIDENCE_CHECKS.forEach((check) => {
      const input = document.querySelector(`[data-bx-evidence="${check.id}"]`);
      if (input) input.checked = Boolean(state.evidence[check.id]);
    });
    const sale = document.getElementById("bx-last-sale");
    const volatility = document.getElementById("bx-volatility");
    const comps = document.getElementById("bx-comps");
    if (sale) sale.value = state.valuation.lastSale;
    if (volatility) volatility.value = state.valuation.volatility;
    if (comps) comps.value = state.valuation.comps;
  }

  function updateText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function updateUI() {
    const grade = getGrade();
    const evidence = getEvidenceStatus();
    const valuation = getValuation();
    const command = commandById(state.command);
    const draftId = `BG-${hashText(JSON.stringify(passportCore()))}`;
    const scoreLabel = String(grade.score).padStart(3, "0");

    document.querySelectorAll("[data-bx-command]").forEach((button) => {
      const active = button.dataset.bxCommand === state.command;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-bx-plate]").forEach((plate) => {
      plate.classList.toggle("is-active", plate.dataset.bxPlate === state.command);
    });
    document.querySelectorAll("[data-bx-category]").forEach((button) => {
      const active = button.dataset.bxCategory === state.category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const shell = document.querySelector("#page-brickgrade .bx-shell");
    if (shell) shell.classList.toggle("bx-motion-off", !state.motion);
    const warRoom = shell?.querySelector(".bx-war-room");
    if (warRoom) warRoom.dataset.mode = state.command;
    const motionButton = document.getElementById("bx-motion");
    if (motionButton) {
      motionButton.textContent = `4D ${state.motion ? "ON" : "OFF"}`;
      motionButton.setAttribute("aria-pressed", String(state.motion));
    }

    updateText("bx-command-name", command.label);
    updateText("bx-mission-command", `${command.label} // ${command.metric}`);
    updateText("bx-mission-copy", command.copy);
    updateText("bx-slab-category", grade.category.name.toUpperCase());
    updateText("bx-slab-grade", scoreLabel);
    updateText("bx-slab-ten", `${grade.ten} / 10.0`);
    updateText("bx-plate-score", scoreLabel);
    updateText("bx-plate-evidence", `${evidence.complete} / ${EVIDENCE_CHECKS.length}`);
    updateText("bx-plate-market", valuation.available ? `${currency(valuation.low)}–${currency(valuation.high)}` : "INPUT");
    updateText("bx-metric-score", scoreLabel);
    updateText("bx-metric-ten", grade.ten);
    updateText("bx-metric-limiter", `${grade.limiting.label.toUpperCase()} ${grade.limiting.value}`);
    updateText("bx-metric-cap", grade.cap);
    updateText("bx-grade-score", scoreLabel);
    updateText("bx-grade-ten", `${grade.ten} / 10.0`);
    updateText("bx-grade-band", grade.band.toUpperCase());
    updateText("bx-raw-score", grade.raw);
    updateText("bx-limiting-axis", `${grade.limiting.label} · ${grade.limiting.value}`);
    updateText("bx-active-cap", grade.cap);
    updateText("bx-cap-note", grade.cap < 1000
      ? `The ${grade.limiting.label} score activates a ${grade.cap}-point limiting cap.`
      : "No limiting-axis cap is active.");
    updateText("bx-passport-id", draftId);
    updateText("bx-passport-item", state.item.title.trim() || "Untitled item");
    updateText("bx-passport-category", grade.category.name);
    updateText("bx-passport-grade", `${scoreLabel} / ${grade.ten}`);
    updateText("bx-passport-limiter", `${grade.limiting.label} · ${grade.limiting.value}`);
    updateText("bx-passport-status", evidence.label);

    if (valuation.available) {
      updateText("bx-range-value", `${currency(valuation.low)} — ${currency(valuation.high)}`);
      updateText("bx-range-center", `Modeled midpoint ${currency(valuation.center)}`);
    } else {
      updateText("bx-range-value", "ADD SALE + COMPS");
      updateText("bx-range-center", "A positive verified sale and at least one comparable are required.");
    }

    updateScene();
  }

  function stageDistance() {
    const points = Array.from(stagePointers.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  }

  function resetGestureOrigin() {
    const points = Array.from(stagePointers.values());
    if (points.length >= 2) {
      gestureOrigin = { mode: "pinch", distance: stageDistance(), depth: state.depth };
    } else if (points.length === 1) {
      gestureOrigin = {
        mode: "orbit",
        x: points[0].x,
        y: points[0].y,
        rotationX: state.rotationX,
        rotationY: state.rotationY
      };
    } else {
      gestureOrigin = null;
    }
  }

  function onStagePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const stage = event.currentTarget;
    stagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    try { stage.setPointerCapture(event.pointerId); } catch (_) { /* capture may be unavailable */ }
    resetGestureOrigin();
    stage.classList.add("is-interacting");
  }

  function onStagePointerMove(event) {
    if (!stagePointers.has(event.pointerId)) return;
    stagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(stagePointers.values());
    if (points.length >= 2) {
      if (!gestureOrigin || gestureOrigin.mode !== "pinch") resetGestureOrigin();
      const currentDistance = stageDistance();
      const baseDistance = Math.max(gestureOrigin.distance, 1);
      state.depth = clamp(gestureOrigin.depth * (currentDistance / baseDistance), MIN_DEPTH, MAX_DEPTH);
    } else if (points.length === 1) {
      if (!gestureOrigin || gestureOrigin.mode !== "orbit") resetGestureOrigin();
      state.rotationY = gestureOrigin.rotationY + (points[0].x - gestureOrigin.x) * 0.24;
      state.rotationX = clamp(gestureOrigin.rotationX - (points[0].y - gestureOrigin.y) * 0.2, -65, 65);
    }
    updateScene();
  }

  function onStagePointerEnd(event) {
    stagePointers.delete(event.pointerId);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (_) { /* capture may already be released */ }
    resetGestureOrigin();
    if (!stagePointers.size) event.currentTarget.classList.remove("is-interacting");
  }

  function onStageWheel(event) {
    event.preventDefault();
    state.depth = clamp(state.depth - event.deltaY * 0.001, MIN_DEPTH, MAX_DEPTH);
    updateScene();
  }

  function onStageKeyDown(event) {
    let handled = true;
    if (event.key === "ArrowLeft") state.rotationY -= 4;
    else if (event.key === "ArrowRight") state.rotationY += 4;
    else if (event.key === "ArrowUp") state.rotationX = clamp(state.rotationX - 4, -65, 65);
    else if (event.key === "ArrowDown") state.rotationX = clamp(state.rotationX + 4, -65, 65);
    else if (event.key === "+" || event.key === "=") state.depth = clamp(state.depth + 0.05, MIN_DEPTH, MAX_DEPTH);
    else if (event.key === "-" || event.key === "_") state.depth = clamp(state.depth - 0.05, MIN_DEPTH, MAX_DEPTH);
    else if (event.key === "Home") resetScene(false);
    else handled = false;
    if (handled) {
      event.preventDefault();
      updateScene();
    }
  }

  function toggleFullscreen() {
    const target = document.querySelector("#page-brickgrade .bx-shell");
    if (!target || !document.fullscreenEnabled) {
      announce("Fullscreen is not available in this browser.");
      return;
    }
    const operation = document.fullscreenElement ? document.exitFullscreen() : target.requestFullscreen();
    Promise.resolve(operation).then(() => {
      announce(document.fullscreenElement ? "BrickGrade fullscreen enabled." : "BrickGrade fullscreen closed.");
    }).catch(() => announce("Fullscreen could not be changed."));
  }

  function lockDraft() {
    if (!STORAGE_KEY) {
      announce("Local drafts are unavailable because this session has no verified operator scope.");
      return;
    }
    try {
      const core = snapshotCore();
      const savedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: MODULE_VERSION, savedAt, state: core }));
      state.lockedAt = savedAt;
      lastLockedSnapshot = JSON.stringify(passportCore());
      updateUI();
      announce("BrickGrade draft locked in this browser.");
    } catch (_) {
      announce("This browser blocked local draft storage.");
    }
  }

  function restoreDraft() {
    if (!STORAGE_KEY) {
      announce("Local drafts are unavailable because this session has no verified operator scope.");
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        announce("No local BrickGrade draft was found.");
        return;
      }
      const payload = JSON.parse(raw);
      if (!payload || payload.version !== MODULE_VERSION || !payload.state) throw new Error("Unsupported draft.");
      hydrateState(payload.state);
      state.lockedAt = String(payload.savedAt || "");
      lastLockedSnapshot = JSON.stringify(passportCore());
      renderAxes();
      syncFormValues();
      updateUI();
      announce("Local BrickGrade draft restored.");
    } catch (_) {
      announce("The local BrickGrade draft could not be restored.");
    }
  }

  function passportText() {
    const grade = getGrade();
    const evidence = getEvidenceStatus();
    const valuation = getValuation();
    const id = `BG-${hashText(JSON.stringify(passportCore()))}`;
    const lines = [
      "BRICKGRADE EXCHANGE — LOCAL EVIDENCE DRAFT",
      `Local draft ID: ${id}`,
      `Item: ${state.item.title.trim() || "Untitled item"}`,
      `Reference: ${state.item.reference.trim() || "Not entered"}`,
      `Category: ${grade.category.name}`,
      `Score: ${grade.score}/1000 (${grade.ten}/10.0) — ${grade.band}`,
      `Raw weighted score: ${grade.raw}/1000`,
      `Limiting axis: ${grade.limiting.label} ${grade.limiting.value}/100`,
      `Active cap: ${grade.cap}/1000`,
      `Evidence: ${evidence.complete}/${EVIDENCE_CHECKS.length} checks recorded`,
      `Notes: ${state.item.notes.trim() || "Not entered"}`
    ];
    if (valuation.available) {
      lines.push(`Illustrative range: ${currency(valuation.low)}–${currency(valuation.high)} (modeled midpoint ${currency(valuation.center)})`);
    } else {
      lines.push("Illustrative range: Not calculated");
    }
    lines.push("Local draft only — not a certification, registry entry, appraisal, offer or guarantee.");
    return lines.join("\n");
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
    textarea.remove();
    if (!copied) throw new Error("Copy unavailable");
  }

  async function copyPassport() {
    const text = passportText();
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else fallbackCopy(text);
      announce("Evidence passport copied to the clipboard.");
    } catch (_) {
      try {
        fallbackCopy(text);
        announce("Evidence passport copied to the clipboard.");
      } catch (_) {
        announce("Clipboard access was blocked. Select and copy the passport details manually.");
      }
    }
  }

  function bindSection(section) {
    section.querySelectorAll("[data-bx-command]").forEach((button) => {
      button.addEventListener("click", () => activateCommand(button.dataset.bxCommand, true));
    });
    section.querySelectorAll("[data-bx-category]").forEach((button) => {
      button.addEventListener("click", () => selectCategory(button.dataset.bxCategory, true));
    });
    section.querySelectorAll("[data-bx-evidence]").forEach((input) => {
      input.addEventListener("change", () => {
        state.evidence[input.dataset.bxEvidence] = input.checked;
        updateUI();
      });
    });

    document.getElementById("bx-category-select").addEventListener("change", (event) => selectCategory(event.target.value, true));
    document.getElementById("bx-category-prev").addEventListener("click", () => shiftCategory(-1));
    document.getElementById("bx-category-next").addEventListener("click", () => shiftCategory(1));
    document.getElementById("bx-depth-out").addEventListener("click", () => {
      state.depth = clamp(state.depth - 0.08, MIN_DEPTH, MAX_DEPTH);
      updateScene();
    });
    document.getElementById("bx-depth-in").addEventListener("click", () => {
      state.depth = clamp(state.depth + 0.08, MIN_DEPTH, MAX_DEPTH);
      updateScene();
    });
    document.getElementById("bx-motion").addEventListener("click", () => {
      state.motion = !state.motion;
      updateUI();
      announce(`4D motion ${state.motion ? "enabled" : "paused"}.`);
    });
    document.getElementById("bx-fullscreen").addEventListener("click", toggleFullscreen);
    document.getElementById("bx-reset-view").addEventListener("click", () => resetScene(true));
    document.getElementById("bx-stage-reset").addEventListener("click", () => resetScene(true));
    document.getElementById("bx-lock-draft").addEventListener("click", lockDraft);
    document.getElementById("bx-restore-draft").addEventListener("click", restoreDraft);
    document.getElementById("bx-copy-passport").addEventListener("click", copyPassport);

    const stage = document.getElementById("bx-stage");
    stage.addEventListener("pointerdown", onStagePointerDown);
    stage.addEventListener("pointermove", onStagePointerMove);
    stage.addEventListener("pointerup", onStagePointerEnd);
    stage.addEventListener("pointercancel", onStagePointerEnd);
    stage.addEventListener("lostpointercapture", onStagePointerEnd);
    stage.addEventListener("wheel", onStageWheel, { passive: false });
    stage.addEventListener("keydown", onStageKeyDown);

    [
      ["bx-item-title", "title"],
      ["bx-item-reference", "reference"],
      ["bx-item-notes", "notes"]
    ].forEach(([id, key]) => {
      document.getElementById(id).addEventListener("input", (event) => {
        state.item[key] = event.target.value;
        updateUI();
      });
    });

    [
      ["bx-last-sale", "lastSale", 0, Number.MAX_SAFE_INTEGER],
      ["bx-volatility", "volatility", 0, 100],
      ["bx-comps", "comps", 0, 999]
    ].forEach(([id, key, min, max]) => {
      document.getElementById(id).addEventListener("input", (event) => {
        state.valuation[key] = clamp(finiteNumber(event.target.value, 0), min, max);
        updateUI();
      });
    });
  }

  function mount() {
    if (!hasAuthenticatedShell()) {
      removeInjectedUI();
      return;
    }
    ensureNav();
    ensureLaunchTile();
    ensureSection();
  }

  function queueMount() {
    if (mountQueued) return;
    mountQueued = true;
    window.requestAnimationFrame(() => {
      mountQueued = false;
      mount();
    });
  }

  function boot() {
    mount();
    observer = new MutationObserver(queueMount);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }

  window.BrickGradeERP = Object.freeze({
    open: openBrickGrade,
    refresh: mount,
    version: MODULE_VERSION
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
