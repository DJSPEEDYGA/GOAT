(function () {
  "use strict";

  if (window.__brickGradeERPInstalled) return;
  window.__brickGradeERPInstalled = true;

  let STORAGE_SCOPE = String(window.__brickGradeSessionScope || "").replace(/[^a-f0-9]/gi, "").slice(0, 48);
  let STORAGE_KEY = STORAGE_SCOPE ? `goat-force.brickgrade.command.v2.${STORAGE_SCOPE}` : "";
  let LEGACY_STORAGE_KEY = STORAGE_SCOPE ? `goat-force.brickgrade.local-draft.v1.${STORAGE_SCOPE}` : "";
  const MODULE_VERSION = 2;
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

  const TCG_GAMES = [
    { id: "pokemon", name: "Pokémon", code: "PKM", accent: "#ffd45a", signal: "Electric archive", fields: ["Set / era", "Card number", "Rarity / variant", "Language"] },
    { id: "one-piece", name: "One Piece Card Game", code: "OP", accent: "#ff5968", signal: "Grand Line archive", fields: ["Set code", "Card number", "Parallel / manga", "Language"] },
    { id: "magic", name: "Magic: The Gathering", code: "MTG", accent: "#b993ff", signal: "Multiverse archive", fields: ["Set", "Collector number", "Treatment / foil", "Language"] },
    { id: "yugioh", name: "Yu-Gi-Oh!", code: "YGO", accent: "#7ee7ff", signal: "Duel archive", fields: ["Set code", "Card number", "Rarity / edition", "Language"] },
    { id: "lorcana", name: "Disney Lorcana", code: "LOR", accent: "#72f0ca", signal: "Inklands archive", fields: ["Set", "Collector number", "Enchanted / foil", "Language"] },
    { id: "dragon-ball", name: "Dragon Ball Super", code: "DBS", accent: "#ff9b45", signal: "Saiyan archive", fields: ["Set code", "Card number", "Rarity / parallel", "Language"] },
    { id: "digimon", name: "Digimon", code: "DGM", accent: "#4ba8ff", signal: "Digital archive", fields: ["Set code", "Card number", "Alt art / foil", "Language"] },
    { id: "flesh-blood", name: "Flesh and Blood", code: "FAB", accent: "#ff7168", signal: "Rathed archive", fields: ["Set", "Collector number", "Cold foil / edition", "Language"] },
    { id: "weiss", name: "Weiss Schwarz", code: "WSS", accent: "#ff79c8", signal: "Stage archive", fields: ["Set code", "Card number", "SP / SSP / signed", "Language"] },
    { id: "star-wars", name: "Star Wars Unlimited", code: "SWU", accent: "#ffe780", signal: "Galaxy archive", fields: ["Set", "Collector number", "Showcase / hyperspace", "Language"] },
    { id: "union-arena", name: "Union Arena", code: "UNA", accent: "#73d8ff", signal: "Arena archive", fields: ["Set code", "Card number", "Alt art / parallel", "Language"] },
    { id: "sports", name: "Sports Cards", code: "SPT", accent: "#8cffaa", signal: "League archive", fields: ["Sport / league", "Set / year", "Card number", "Parallel / serial"] },
    { id: "other-tcg", name: "Other / Emerging TCG", code: "TCG", accent: "#d8e6ef", signal: "Open archive", fields: ["Game", "Set", "Card number", "Variant / language"] }
  ];

  const GRADING_AGENTS = [
    { id: "moneypenny", name: "Ms. Money Penny", role: "Intake Commander", specialty: "Intake, documentation and handoffs", mark: "MP" },
    { id: "superninja", name: "SuperNinja", role: "Anomaly Hunter", specialty: "Pattern checks and exception tracing", mark: "SN" },
    { id: "codex", name: "Codex", role: "Systems Master", specialty: "Standards, calculations and technical review", mark: "CX", live: true },
    { id: "legal", name: "Legal Eagle", role: "Provenance Master", specialty: "Ownership, disclosures and claim language", mark: "LE" },
    { id: "producer", name: "The Producer", role: "Presentation Master", specialty: "Capture direction and visual presentation", mark: "PR" },
    { id: "a&r", name: "A&R Scout", role: "Market Signal Master", specialty: "Demand context and comparable research", mark: "AR" },
    { id: "business", name: "CFO Brain", role: "Valuation Control", specialty: "Range logic, risk and commercial review", mark: "CF" },
    { id: "fashion", name: "Stylist", role: "Eye Appeal Master", specialty: "Presentation, color and display appeal", mark: "ST" },
    { id: "researcher", name: "Deep Research", role: "Authenticity Research", specialty: "Issue markers, references and provenance", mark: "DR" },
    { id: "writer", name: "Lyricist", role: "Report Editor", specialty: "Clear findings and customer-ready notes", mark: "LY" },
    { id: "autonomous", name: "Autopilot", role: "Workflow Marshal", specialty: "Stage plans and queue coordination", mark: "AP" },
    { id: "private", name: "Vault", role: "Evidence Custodian", specialty: "Sensitive evidence and local-only review", mark: "VT" }
  ];

  const WORKFLOW_STAGES = [
    { id: "intake", label: "Intake", agent: "moneypenny" },
    { id: "primary", label: "Primary Grade", agent: "codex" },
    { id: "authenticity", label: "Authenticity", agent: "researcher" },
    { id: "market", label: "Market Review", agent: "a&r" },
    { id: "qc", label: "QC Review", agent: "superninja" },
    { id: "owner", label: "Owner Approval", agent: "human" },
    { id: "sealed", label: "Sealed", agent: "human" }
  ];

  const STUDIO_ROUTES = [
    { id: "fusion-core", name: "GOAT Fusion Core", status: "97-MODEL", kind: "BRAIN" },
    { id: "bricklife", name: "BrickLife Motion", status: "IMAGINE", kind: "MOTION" },
    { id: "card-soul", name: "Card Soul Digital Twin", status: "CAPTURE", kind: "TWIN" },
    { id: "world-forge", name: "World Forge 3D", status: "BUILD", kind: "WORLD" },
    { id: "crew-director", name: "Crew Director", status: "ORCHESTRATE", kind: "AGENTS" },
    { id: "master-room", name: "Master Room", status: "FINISH", kind: "MASTER" },
    { id: "crewcast", name: "CrewCast Live", status: "OWNER GATE", kind: "LIVE" },
    { id: "vault-render", name: "Vault Render", status: "OFFLINE", kind: "PRIVATE" }
  ];

  const CREW_MODES = [
    { id: "speedy-director", name: "Speedy Director Cut", cue: "Music-first timing, kinetic camera and precision transitions" },
    { id: "waka-impact", name: "Waka Impact Mode", cue: "Arena energy, power moments and crowd-scale reveals" },
    { id: "brick-squad", name: "Brick Squad Ensemble", cue: "Crew chemistry, team entrances and shared hero moments" },
    { id: "grading-master", name: "Proof First", cue: "Evidence education, macro detail and transparent grading" },
    { id: "collector-premiere", name: "Collector Premiere", cue: "Luxury lighting, foil detail and a premium card hero" }
  ];

  const LEGACY_STUDIO_ROUTES = {
    "local-first": "fusion-core", unreal: "world-forge", comfyui: "fusion-core",
    higgsfield: "bricklife", seedance: "bricklife", "nano-banana": "bricklife",
    editorial: "master-room", obs: "crewcast"
  };

  const categoryById = (id) => CATEGORIES.find((category) => category.id === id) || CATEGORIES[0];
  const commandById = (id) => COMMANDS.find((command) => command.id === id) || COMMANDS[1];
  const tcgById = (id) => TCG_GAMES.find((game) => game.id === id) || TCG_GAMES[0];
  const agentById = (id) => GRADING_AGENTS.find((agent) => agent.id === id) || GRADING_AGENTS[0];
  const workflowStageById = (id) => WORKFLOW_STAGES.find((stage) => stage.id === id) || WORKFLOW_STAGES[0];
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

  function buildInitialState() {
    const defaultScores = {};
    CATEGORIES.forEach((category) => {
      defaultScores[category.id] = {};
      category.axes.forEach((axis) => {
        defaultScores[category.id][axis.id] = 85;
      });
    });
    return {
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
    tcg: { game: "pokemon", set: "", number: "", variant: "", language: "English" },
    workflow: {
      jobId: "",
      stage: "intake",
      assignedAgent: "moneypenny",
      priority: "Standard",
      dueDate: "",
      projectId: 0,
      taskId: 0,
      approvalId: 0,
      qcDecision: "Pending",
      qcSnapshot: "",
      approvalSnapshot: "",
      owner: "DJ Speedy / Waka Flocka Flame",
      audit: []
    },
    studio: {
      world: "goatverse",
      crewMode: "brick-squad",
      prompt: "The verified card enters GOATVERSE FORGE, awakens as an original living champion, and drafts DJ Speedy, Waka and the crew into a reverse-strategy arena.",
      duration: 15,
      aspect: "16:9",
      pipeline: "fusion-core",
      platform: "Private rehearsal",
      rightsConfirmed: false,
      sourceName: "",
      status: "DESIGN"
    },
    lockedAt: ""
    };
  }

  let state = buildInitialState();

  let lastLockedSnapshot = "";
  let observer;
  let mountQueued = false;
  const initializedSections = new WeakSet();
  const stagePointers = new Map();
  let gestureOrigin = null;
  const boundNavs = new WeakSet();
  let announceTimer = 0;
  let studioObjectURL = "";
  let studioCameraStream = null;

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

  function workflowJobId() {
    if (state.workflow.jobId) return state.workflow.jobId;
    const seed = `${Date.now()}|${state.item.reference}|${state.item.title}|${STORAGE_SCOPE}`;
    state.workflow.jobId = `BGJ-${hashText(seed)}`;
    return state.workflow.jobId;
  }

  function addAudit(action, detail) {
    state.workflow.audit.unshift({
      at: new Date().toISOString(),
      action: String(action || "UPDATE").slice(0, 48),
      detail: String(detail || "").slice(0, 240)
    });
    state.workflow.audit = state.workflow.audit.slice(0, 40);
  }

  function approvalRelevantSnapshot() {
    return JSON.stringify({
      category: state.category,
      scores: state.scores,
      item: state.item,
      evidence: state.evidence,
      valuation: state.valuation,
      tcg: state.tcg,
      workflow: {
        jobId: state.workflow.jobId,
        assignedAgent: state.workflow.assignedAgent,
        priority: state.workflow.priority,
        dueDate: state.workflow.dueDate,
        owner: state.workflow.owner
      }
    });
  }

  function invalidateQC(reason) {
    const wasReviewed = state.workflow.qcDecision === "Pass" || Boolean(state.workflow.approvalId) || state.workflow.stage === "sealed";
    if (!wasReviewed) return;
    const supersededApproval = state.workflow.approvalId;
    state.workflow.qcDecision = "Pending";
    state.workflow.qcSnapshot = "";
    state.workflow.approvalSnapshot = "";
    state.workflow.approvalId = 0;
    state.workflow.stage = "primary";
    addAudit("QC INVALIDATED", `${reason || "Approval-relevant data changed"}${supersededApproval ? ` · superseded ERP approval #${supersededApproval}` : ""}`);
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
      },
      tcg: {
        game: tcgById(state.tcg.game).id,
        set: String(state.tcg.set || "").slice(0, 120),
        number: String(state.tcg.number || "").slice(0, 80),
        variant: String(state.tcg.variant || "").slice(0, 120),
        language: String(state.tcg.language || "English").slice(0, 60)
      },
      workflow: {
        jobId: String(state.workflow.jobId || "").slice(0, 24),
        stage: workflowStageById(state.workflow.stage).id,
        assignedAgent: agentById(state.workflow.assignedAgent).id,
        priority: ["Standard", "Rush", "Vault"].includes(state.workflow.priority) ? state.workflow.priority : "Standard",
        dueDate: String(state.workflow.dueDate || "").slice(0, 10),
        projectId: Math.max(0, Math.round(finiteNumber(state.workflow.projectId, 0))),
        taskId: Math.max(0, Math.round(finiteNumber(state.workflow.taskId, 0))),
        approvalId: Math.max(0, Math.round(finiteNumber(state.workflow.approvalId, 0))),
        qcDecision: ["Pending", "Pass", "Revision"].includes(state.workflow.qcDecision) ? state.workflow.qcDecision : "Pending",
        qcSnapshot: String(state.workflow.qcSnapshot || "").slice(0, 12000),
        approvalSnapshot: String(state.workflow.approvalSnapshot || "").slice(0, 12000),
        owner: String(state.workflow.owner || "DJ Speedy / Waka Flocka Flame").slice(0, 120),
        audit: Array.isArray(state.workflow.audit) ? state.workflow.audit.slice(0, 40) : []
      },
      studio: {
        world: ["goatverse", "creature-arena", "pirate-league", "hoopverse", "multiverse"].includes(state.studio.world) ? state.studio.world : "goatverse",
        crewMode: CREW_MODES.some((mode) => mode.id === state.studio.crewMode) ? state.studio.crewMode : "brick-squad",
        prompt: String(state.studio.prompt || "").slice(0, 2000),
        duration: clamp(Math.round(finiteNumber(state.studio.duration, 15)), 3, 60),
        aspect: ["16:9", "9:16", "1:1"].includes(state.studio.aspect) ? state.studio.aspect : "16:9",
        pipeline: STUDIO_ROUTES.some((route) => route.id === state.studio.pipeline) ? state.studio.pipeline : "fusion-core",
        platform: String(state.studio.platform || "Private rehearsal").slice(0, 80),
        rightsConfirmed: Boolean(state.studio.rightsConfirmed),
        sourceName: String(state.studio.sourceName || "").slice(0, 180),
        status: String(state.studio.status || "DESIGN").slice(0, 32)
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
      valuation: core.valuation,
      tcg: core.tcg,
      workflow: {
        jobId: core.workflow.jobId,
        stage: core.workflow.stage,
        assignedAgent: core.workflow.assignedAgent,
        priority: core.workflow.priority,
        dueDate: core.workflow.dueDate,
        qcDecision: core.workflow.qcDecision,
        owner: core.workflow.owner
      },
      studio: core.studio
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
    if (raw.tcg && TCG_GAMES.some((game) => game.id === raw.tcg.game)) state.tcg.game = raw.tcg.game;
    state.tcg.set = String(raw.tcg && raw.tcg.set || "").slice(0, 120);
    state.tcg.number = String(raw.tcg && raw.tcg.number || "").slice(0, 80);
    state.tcg.variant = String(raw.tcg && raw.tcg.variant || "").slice(0, 120);
    state.tcg.language = String(raw.tcg && raw.tcg.language || "English").slice(0, 60);
    if (raw.workflow && typeof raw.workflow === "object") {
      state.workflow.jobId = String(raw.workflow.jobId || "").slice(0, 24);
      if (WORKFLOW_STAGES.some((stage) => stage.id === raw.workflow.stage)) state.workflow.stage = raw.workflow.stage;
      if (GRADING_AGENTS.some((agent) => agent.id === raw.workflow.assignedAgent)) state.workflow.assignedAgent = raw.workflow.assignedAgent;
      if (["Standard", "Rush", "Vault"].includes(raw.workflow.priority)) state.workflow.priority = raw.workflow.priority;
      state.workflow.dueDate = String(raw.workflow.dueDate || "").slice(0, 10);
      state.workflow.projectId = Math.max(0, Math.round(finiteNumber(raw.workflow.projectId, 0)));
      state.workflow.taskId = Math.max(0, Math.round(finiteNumber(raw.workflow.taskId, 0)));
      state.workflow.approvalId = Math.max(0, Math.round(finiteNumber(raw.workflow.approvalId, 0)));
      if (["Pending", "Pass", "Revision"].includes(raw.workflow.qcDecision)) state.workflow.qcDecision = raw.workflow.qcDecision;
      state.workflow.qcSnapshot = String(raw.workflow.qcSnapshot || "").slice(0, 12000);
      state.workflow.approvalSnapshot = String(raw.workflow.approvalSnapshot || "").slice(0, 12000);
      state.workflow.owner = String(raw.workflow.owner || "DJ Speedy / Waka Flocka Flame").slice(0, 120);
      state.workflow.audit = Array.isArray(raw.workflow.audit) ? raw.workflow.audit.slice(0, 40) : [];
    }
    if (raw.studio && typeof raw.studio === "object") {
      if (["goatverse", "creature-arena", "pirate-league", "hoopverse", "multiverse"].includes(raw.studio.world)) state.studio.world = raw.studio.world;
      if (CREW_MODES.some((mode) => mode.id === raw.studio.crewMode)) state.studio.crewMode = raw.studio.crewMode;
      state.studio.prompt = String(raw.studio.prompt || state.studio.prompt).slice(0, 2000);
      state.studio.duration = clamp(Math.round(finiteNumber(raw.studio.duration, 15)), 3, 60);
      if (["16:9", "9:16", "1:1"].includes(raw.studio.aspect)) state.studio.aspect = raw.studio.aspect;
      const restoredPipeline = LEGACY_STUDIO_ROUTES[raw.studio.pipeline] || raw.studio.pipeline;
      if (STUDIO_ROUTES.some((route) => route.id === restoredPipeline)) state.studio.pipeline = restoredPipeline;
      state.studio.platform = String(raw.studio.platform || "Private rehearsal").slice(0, 80);
      state.studio.rightsConfirmed = Boolean(raw.studio.rightsConfirmed);
      state.studio.sourceName = String(raw.studio.sourceName || "").slice(0, 180);
      state.studio.status = String(raw.studio.status || "DESIGN").slice(0, 32);
    }
    if ((state.workflow.qcDecision === "Pass" || state.workflow.stage === "sealed") && state.workflow.qcSnapshot !== approvalRelevantSnapshot()) {
      invalidateQC("Restored draft does not match its QC-reviewed snapshot");
    }
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

    const tcgOptions = TCG_GAMES.map((game) =>
      `<option value="${game.id}">${escapeHTML(game.name)}</option>`
    ).join("");

    const tcgCards = TCG_GAMES.map((game) => `
      <button class="bx-tcg-game${game.id === state.tcg.game ? " is-active" : ""}" type="button" data-bx-tcg="${game.id}" aria-pressed="${game.id === state.tcg.game}" style="--bx-game-accent:${game.accent}">
        <span class="bx-tcg-emblem" aria-hidden="true">${game.code}</span>
        <span><strong>${escapeHTML(game.name)}</strong><small>${escapeHTML(game.signal)}</small></span>
      </button>`).join("");

    const agentOptions = GRADING_AGENTS.map((agent) =>
      `<option value="${agent.id}">${escapeHTML(agent.name)} — ${escapeHTML(agent.role)}</option>`
    ).join("");

    const agentCards = GRADING_AGENTS.map((agent) => `
      <button class="bx-agent-card${agent.id === state.workflow.assignedAgent ? " is-active" : ""}" type="button" data-bx-agent="${agent.id}" aria-pressed="${agent.id === state.workflow.assignedAgent}">
        <span class="bx-agent-mark" aria-hidden="true">${agent.mark}</span>
        <span><strong>${escapeHTML(agent.name)}</strong><small>${escapeHTML(agent.role)}</small></span>
        <i>${agent.live ? "AI LIVE" : "TASK BUS"}</i>
      </button>`).join("");

    const stageOptions = WORKFLOW_STAGES.filter((stage) => stage.id !== "sealed").map((stage) =>
      `<option value="${stage.id}">${escapeHTML(stage.label)}</option>`
    ).join("");

    const workflowRail = WORKFLOW_STAGES.map((stage, index) => `
      <div class="bx-workflow-stage${stage.id === state.workflow.stage ? " is-active" : ""}" data-bx-stage-id="${stage.id}">
        <span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(stage.label)}</strong>
      </div>`).join("");

    const studioRoutes = STUDIO_ROUTES.map((route) => `
      <button class="bx-studio-route${route.id === state.studio.pipeline ? " is-active" : ""}" type="button" data-bx-studio-route="${route.id}" aria-pressed="${route.id === state.studio.pipeline}">
        <span>${route.kind}</span><strong>${escapeHTML(route.name)}</strong><i>${route.status}</i>
      </button>`).join("");

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
              <div class="bx-tcg-holo-card" id="bx-tcg-holo-card">
                <div class="bx-tcg-card-face">
                  <span class="bx-tcg-card-code" id="bx-tcg-card-code">PKM</span>
                  <i class="bx-tcg-card-core"></i>
                  <strong id="bx-tcg-card-name">POKÉMON</strong>
                  <small id="bx-tcg-card-variant">HOLO / STANDARD</small>
                </div>
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
          <div class="bx-signal"><span>TEAM BUS</span><strong>ERP TASKS</strong></div>
          <div class="bx-signal"><span>FINAL GATE</span><strong>HUMAN APPROVAL</strong></div>
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

        <section class="bx-section bx-tcg-lab" aria-labelledby="bx-tcg-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">02 // TCG MATRIX</p><h3 id="bx-tcg-title">Top card-game command profiles</h3></div>
            <p>Built for modern TCG variants, parallels, serialized cards, foils and language-specific releases. Brand labels identify the game; the interface artwork is original.</p>
          </div>
          <div class="bx-tcg-grid" aria-label="Trading card game profiles">${tcgCards}</div>
          <div class="bx-tcg-console">
            <div class="bx-tcg-visual" id="bx-tcg-visual" style="--bx-game-accent:${tcgById(state.tcg.game).accent}">
              <div class="bx-tcg-visual-card">
                <span id="bx-tcg-visual-code">PKM</span>
                <div class="bx-tcg-visual-art"><i></i><i></i><i></i></div>
                <strong id="bx-tcg-visual-name">POKÉMON</strong>
                <small>ORIGINAL BRICKGRADE SCAN FIELD</small>
              </div>
              <div class="bx-tcg-scanlines" aria-hidden="true"></div>
            </div>
            <div class="bx-form-grid bx-tcg-fields">
              <label class="bx-field bx-field-wide"><span>GAME PROFILE</span><select class="bx-select" id="bx-tcg-select">${tcgOptions}</select></label>
              <label class="bx-field"><span>SET / ERA</span><input class="bx-input" id="bx-tcg-set" maxlength="120" autocomplete="off" placeholder="Base Set, OP-05, Alpha…"></label>
              <label class="bx-field"><span>CARD NUMBER</span><input class="bx-input" id="bx-tcg-number" maxlength="80" autocomplete="off" placeholder="4/102, OP05-119…"></label>
              <label class="bx-field"><span>RARITY / VARIANT</span><input class="bx-input" id="bx-tcg-variant" maxlength="120" autocomplete="off" placeholder="Holo, Manga, Alt Art, 1/1…"></label>
              <label class="bx-field"><span>LANGUAGE</span><input class="bx-input" id="bx-tcg-language" maxlength="60" autocomplete="off" value="English"></label>
              <div class="bx-tcg-defect-map bx-field-wide">
                <span>TCG INSPECTION MAP</span>
                <div><b>CENTERING</b><b>CORNERS</b><b>EDGES</b><b>SURFACE</b><b>PRINT</b><b>ALTERATION</b></div>
              </div>
            </div>
          </div>
        </section>

        <section class="bx-section bx-passport" aria-labelledby="bx-passport-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">03 // EVIDENCE</p><h3 id="bx-passport-title">Local evidence passport</h3></div>
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

        <section class="bx-section bx-team-command" aria-labelledby="bx-team-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">04 // GRADING MASTERS</p><h3 id="bx-team-title">Agent task force & quality control</h3></div>
            <p>Assign authenticated ERP work, run specialist reviews, then require a separate QC decision and owner approval before a grade can be sealed.</p>
          </div>
          <div class="bx-workflow-rail" id="bx-workflow-rail">${workflowRail}</div>
          <div class="bx-team-layout">
            <div>
              <div class="bx-agent-grid" aria-label="GOAT grading agent roster">${agentCards}</div>
              <div class="bx-assignment-console">
                <div class="bx-form-grid">
                  <label class="bx-field"><span>ASSIGN MASTER</span><select class="bx-select" id="bx-agent-select">${agentOptions}</select></label>
                  <label class="bx-field"><span>WORKFLOW STAGE</span><select class="bx-select" id="bx-workflow-stage">${stageOptions}</select></label>
                  <label class="bx-field"><span>PRIORITY</span><select class="bx-select" id="bx-priority"><option>Standard</option><option>Rush</option><option>Vault</option></select></label>
                  <label class="bx-field"><span>DUE DATE</span><input class="bx-input" id="bx-due-date" type="date"></label>
                </div>
                <div class="bx-local-actions">
                  <button class="bx-btn bx-primary" id="bx-dispatch-task" type="button">DISPATCH ERP TASK</button>
                  <button class="bx-btn bx-ghost" id="bx-brief-codex" type="button">BRIEF CODEX</button>
                  <button class="bx-btn bx-ghost" id="bx-refresh-queue" type="button">REFRESH QUEUE</button>
                </div>
                <p class="bx-team-note" id="bx-team-note">Select a specialist. Dispatch creates a real task inside the authenticated GOAT Projects system.</p>
              </div>
            </div>
            <aside class="bx-qc-console" aria-label="Quality control and owner approval">
              <span>QC CONTROL</span>
              <strong id="bx-job-id">NEW JOB</strong>
              <div class="bx-qc-score"><span>PROPOSED GRADE</span><b id="bx-qc-grade">850</b></div>
              <div class="bx-qc-state"><span>QC DECISION</span><b id="bx-qc-decision">PENDING</b></div>
              <div class="bx-qc-actions">
                <button class="bx-btn bx-success" id="bx-qc-pass" type="button">QC PASS</button>
                <button class="bx-btn bx-danger" id="bx-qc-revision" type="button">SEND BACK</button>
                <button class="bx-btn bx-primary" id="bx-owner-approval" type="button">REQUEST SPEEDY / WAKA APPROVAL</button>
              </div>
              <p>No agent can self-seal a grade. Final certification remains locked until a human owner approves it in GOAT Approvals.</p>
            </aside>
          </div>
          <div class="bx-queue-board">
            <div class="bx-queue-head"><span>LIVE ERP QUEUE</span><strong id="bx-queue-count">NOT SYNCED</strong></div>
            <div class="bx-queue-list" id="bx-queue-list"><p>Press Refresh Queue to load BrickGrade tasks visible to this authenticated operator.</p></div>
          </div>
          <div class="bx-audit-board">
            <div class="bx-queue-head"><span>JOB ACTIVITY</span><strong id="bx-erp-audit-count">ERP AUDIT NOT SYNCED</strong></div>
            <div id="bx-job-audit" class="bx-job-audit"><p>No job activity yet.</p></div>
            <div id="bx-erp-audit" class="bx-job-audit bx-erp-audit"><p>ERP audit events appear after queue synchronization.</p></div>
          </div>
        </section>

        <section class="bx-section bx-valuation" aria-labelledby="bx-valuation-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">05 // VALUE MODEL</p><h3 id="bx-valuation-title">Valuation lab</h3></div>
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

        <section class="bx-section bx-studio" aria-labelledby="bx-studio-title">
          <div class="bx-section-head">
            <div><p class="bx-kicker">06 // GOATVERSE FORGE</p><h3 id="bx-studio-title">Your crew's original imagination engine</h3></div>
            <p>One local-first system turns verified cards into digital twins, living motion, original worlds, finished masters and owner-gated live shows.</p>
          </div>
          <div class="bx-forge-core" aria-label="GOATVERSE Forge engine">
            <span>GOATVERSE</span><strong>FORGE</strong><i>ONE ENGINE // EIGHT FORGES // CREW OWNED</i><b>FUSION CORE ONLINE</b>
          </div>
          <div class="bx-studio-policy">
            <div><span>01</span><strong>LIVE GRADE</strong><small>Unaltered source and macro evidence</small></div>
            <div><span>02</span><strong>DIGITAL TWIN</strong><small>Front, back, edge and foil material</small></div>
            <div><span>03</span><strong>GOATVERSE REVEAL</strong><small>Clearly labeled synthetic animation</small></div>
            <div><span>04</span><strong>OWNER LIVE GATE</strong><small>Speedy / Waka approve broadcast</small></div>
          </div>
          <div class="bx-studio-router" aria-label="GOATVERSE Forge modules">${studioRoutes}</div>
          <div class="bx-studio-layout">
            <div class="bx-studio-preview" id="bx-studio-preview">
              <div class="bx-studio-frame" id="bx-studio-frame">
                <video class="bx-studio-camera" id="bx-studio-camera" muted playsinline hidden></video>
                <span class="bx-studio-live" id="bx-studio-live-label">SYNTHETIC PREVIEW</span>
                <div class="bx-studio-avatar bx-avatar-speedy"><b>DJ</b><small>SPEEDY</small></div>
                <div class="bx-studio-card-life"><i></i><strong id="bx-studio-card-title">CARD CHAMPION</strong></div>
                <div class="bx-studio-avatar bx-avatar-waka"><b>WF</b><small>WAKA</small></div>
                <div class="bx-studio-floor"></div>
              </div>
              <div class="bx-studio-telemetry"><span id="bx-studio-status">DESIGN</span><strong id="bx-studio-route-name">GOAT FUSION CORE</strong><i id="bx-studio-source">NO SOURCE SELECTED</i></div>
            </div>
            <div class="bx-studio-controls">
              <div class="bx-form-grid">
                <label class="bx-field"><span>ORIGINAL WORLD</span><select class="bx-select" id="bx-studio-world"><option value="goatverse">GOATVERSE Command</option><option value="creature-arena">Creature Champions</option><option value="pirate-league">Pirate League</option><option value="hoopverse">Hoopverse</option><option value="multiverse">Multiverse Collision</option></select></label>
                <label class="bx-field"><span>CREW MODE</span><select class="bx-select" id="bx-studio-crew-mode">${CREW_MODES.map((mode) => `<option value="${mode.id}">${escapeHTML(mode.name)}</option>`).join("")}</select></label>
                <label class="bx-field"><span>PICTURE SOURCE</span><input class="bx-input" id="bx-studio-source-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
                <label class="bx-field"><span>DURATION</span><select class="bx-select" id="bx-studio-duration"><option value="6">6 sec teaser</option><option value="15" selected>15 sec reveal</option><option value="30">30 sec spot</option><option value="60">60 sec commercial</option></select></label>
                <label class="bx-field"><span>FORMAT</span><select class="bx-select" id="bx-studio-aspect"><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
                <label class="bx-field"><span>LIVE TARGET</span><select class="bx-select" id="bx-studio-platform"><option>Private rehearsal</option><option>GOAT studio monitor</option><option>YouTube via approved RTMP</option><option>Twitch via approved RTMP</option><option>Custom RTMP via approved gateway</option></select></label>
                <label class="bx-field bx-field-wide"><span>ANIMATION DIRECTION</span><textarea class="bx-textarea" id="bx-studio-prompt" rows="5" maxlength="2000"></textarea></label>
              </div>
              <label class="bx-check bx-studio-consent"><input type="checkbox" id="bx-studio-rights"><span>I confirm media rights and on-camera subject consent; generated footage will carry a synthetic-content label.</span></label>
              <div class="bx-local-actions">
                <button class="bx-btn bx-ghost" id="bx-camera-preview" type="button">START PRIVATE CAMERA</button>
                <button class="bx-btn bx-primary" id="bx-queue-studio" type="button">QUEUE STUDIO JOB</button>
                <button class="bx-btn bx-ghost" id="bx-copy-studio" type="button">COPY PIPELINE MANIFEST</button>
                <button class="bx-btn bx-ghost" id="bx-scan-studio" type="button">SCAN STUDIO ROUTER</button>
              </div>
              <p class="bx-team-note" id="bx-studio-note">Source images stay local until your authenticated Forge gateway is invoked. Outside tools are optional backstage adapters, never the product identity. Live publishing is never automatic.</p>
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
    stopStudioCamera();
    if (studioObjectURL) URL.revokeObjectURL(studioObjectURL);
    studioObjectURL = "";
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
        invalidateQC("Grading score changed");
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
    invalidateQC("Collectible category changed");
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
    const tcgSelect = document.getElementById("bx-tcg-select");
    const tcgSet = document.getElementById("bx-tcg-set");
    const tcgNumber = document.getElementById("bx-tcg-number");
    const tcgVariant = document.getElementById("bx-tcg-variant");
    const tcgLanguage = document.getElementById("bx-tcg-language");
    if (tcgSelect) tcgSelect.value = state.tcg.game;
    if (tcgSet) tcgSet.value = state.tcg.set;
    if (tcgNumber) tcgNumber.value = state.tcg.number;
    if (tcgVariant) tcgVariant.value = state.tcg.variant;
    if (tcgLanguage) tcgLanguage.value = state.tcg.language;
    const agentSelect = document.getElementById("bx-agent-select");
    const workflowStage = document.getElementById("bx-workflow-stage");
    const priority = document.getElementById("bx-priority");
    const dueDate = document.getElementById("bx-due-date");
    if (agentSelect) agentSelect.value = state.workflow.assignedAgent;
    if (workflowStage && state.workflow.stage !== "sealed") workflowStage.value = state.workflow.stage;
    if (priority) priority.value = state.workflow.priority;
    if (dueDate) dueDate.value = state.workflow.dueDate;
    const studioWorld = document.getElementById("bx-studio-world");
    const studioCrewMode = document.getElementById("bx-studio-crew-mode");
    const studioDuration = document.getElementById("bx-studio-duration");
    const studioAspect = document.getElementById("bx-studio-aspect");
    const studioPlatform = document.getElementById("bx-studio-platform");
    const studioPrompt = document.getElementById("bx-studio-prompt");
    const studioRights = document.getElementById("bx-studio-rights");
    if (studioWorld) studioWorld.value = state.studio.world;
    if (studioCrewMode) studioCrewMode.value = state.studio.crewMode;
    if (studioDuration) studioDuration.value = String(state.studio.duration);
    if (studioAspect) studioAspect.value = state.studio.aspect;
    if (studioPlatform) studioPlatform.value = state.studio.platform;
    if (studioPrompt) studioPrompt.value = state.studio.prompt;
    if (studioRights) studioRights.checked = state.studio.rightsConfirmed;
  }

  function updateText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  async function erpApi(path, options) {
    const opts = Object.assign({ credentials: "include" }, options || {});
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      opts.headers = Object.assign({}, opts.headers, { "Content-Type": "application/json" });
      opts.body = JSON.stringify(opts.body);
    }
    const response = await fetch(path, opts);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch (_) { data = { ok: false, error: "The ERP returned an unreadable response." }; }
    if (!response.ok || (data && data.ok === false)) {
      const error = new Error(String(data && data.error || `ERP request failed (${response.status}).`));
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function selectTCG(gameId, shouldAnnounce) {
    if (!TCG_GAMES.some((game) => game.id === gameId)) return;
    state.tcg.game = gameId;
    invalidateQC("TCG profile changed");
    syncFormValues();
    updateUI();
    if (shouldAnnounce) announce(`${tcgById(gameId).name} card profile selected.`);
  }

  function selectAgent(agentId, shouldAnnounce) {
    if (!GRADING_AGENTS.some((agent) => agent.id === agentId)) return;
    state.workflow.assignedAgent = agentId;
    const defaultStage = WORKFLOW_STAGES.find((stage) => stage.agent === agentId);
    if (defaultStage) state.workflow.stage = defaultStage.id;
    invalidateQC("Assigned grading specialist changed");
    syncFormValues();
    updateUI();
    if (shouldAnnounce) announce(`${agentById(agentId).name} selected for ${agentById(agentId).role}.`);
  }

  function selectStudioRoute(routeId, shouldAnnounce) {
    if (!STUDIO_ROUTES.some((route) => route.id === routeId)) return;
    state.studio.pipeline = routeId;
    updateUI();
    if (shouldAnnounce) announce(`${STUDIO_ROUTES.find((route) => route.id === routeId).name} production route selected.`);
  }

  function studioManifest() {
    const grade = getGrade();
    return {
      schema: "goat.goatverse.forge.v1",
      engine: {
        name: "GOATVERSE FORGE",
        owner: "GOAT FORCE",
        modules: STUDIO_ROUTES.map((route) => ({ id: route.id, name: route.name })),
        model_policy: "local-first routed fusion core"
      },
      job_id: workflowJobId(),
      source_name: state.studio.sourceName || null,
      card_name: state.item.title.trim() || "Untitled card",
      card_reference: state.item.reference.trim() || null,
      grade: { score: grade.score, scale_10: grade.ten, band: grade.band, sealed: state.workflow.stage === "sealed" },
      world: state.studio.world,
      crew_mode: state.studio.crewMode,
      crew_direction: (CREW_MODES.find((mode) => mode.id === state.studio.crewMode) || CREW_MODES[2]).cue,
      creative_prompt: state.studio.prompt,
      duration_sec: state.studio.duration,
      aspect_ratio: state.studio.aspect,
      preferred_pipeline: state.studio.pipeline,
      live_target: state.studio.platform,
      rights_confirmed: state.studio.rightsConfirmed,
      evidence_policy: {
        source_grade_media_immutable: true,
        generated_frames_excluded_from_grading: true,
        synthetic_label_required: true,
        human_qc_before_publish: true
      },
      native_pipeline: ["proof-lock", "card-soul", "fusion-core", "bricklife", "world-forge", "master-room", "crewcast"],
      compatible_exports: ["OpenEXR / PNG sequence", "USD / FBX / glTF", "AAF / EDL / FCPXML", "WAV stems", "approved RTMP master"]
    };
  }

  function onStudioSource(event) {
    const file = event.target.files && event.target.files[0];
    if (studioObjectURL) URL.revokeObjectURL(studioObjectURL);
    studioObjectURL = "";
    state.studio.sourceName = "";
    const frame = document.getElementById("bx-studio-frame");
    if (frame) frame.style.removeProperty("--bx-studio-source-image");
    if (!file) {
      updateUI();
      return;
    }
    if (!/^image\/(png|jpeg|webp)$/i.test(file.type) || file.size > 25 * 1024 * 1024) {
      event.target.value = "";
      announce("Choose a PNG, JPEG or WebP image no larger than 25 MB.");
      return;
    }
    studioObjectURL = URL.createObjectURL(file);
    state.studio.sourceName = file.name.slice(0, 180);
    if (frame) frame.style.setProperty("--bx-studio-source-image", `url("${studioObjectURL}")`);
    updateUI();
    announce("Picture loaded into the local GOATVERSE preview. It has not been uploaded.");
  }

  function stopStudioCamera() {
    const stream = studioCameraStream;
    studioCameraStream = null;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    const video = document.getElementById("bx-studio-camera");
    if (video) {
      video.pause();
      video.srcObject = null;
      video.hidden = true;
    }
    updateText("bx-studio-live-label", "SYNTHETIC PREVIEW");
    state.studio.status = state.studio.sourceName ? "SOURCE READY" : "DESIGN";
    const button = document.getElementById("bx-camera-preview");
    if (button) button.textContent = "START PRIVATE CAMERA";
    updateUI();
  }

  async function toggleStudioCamera() {
    if (studioCameraStream) {
      stopStudioCamera();
      announce("Private camera preview stopped.");
      return;
    }
    if (!state.studio.rightsConfirmed) {
      announce("Confirm media rights and on-camera subject consent before starting the camera.");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      announce("Camera preview is not available in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      const video = document.getElementById("bx-studio-camera");
      if (!video || !hasAuthenticatedShell()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      studioCameraStream = stream;
      stream.getTracks().forEach((track) => track.addEventListener("ended", () => {
        if (studioCameraStream === stream) stopStudioCamera();
      }, { once: true }));
      video.srcObject = stream;
      video.hidden = false;
      await video.play();
      updateText("bx-studio-live-label", "PRIVATE CAMERA · NOT STREAMING");
      const button = document.getElementById("bx-camera-preview");
      if (button) button.textContent = "STOP PRIVATE CAMERA";
      state.studio.status = "CAMERA PREVIEW";
      updateUI();
      announce("Private camera preview started. No video is being uploaded or broadcast.");
    } catch (_) {
      stopStudioCamera();
      announce("Camera access was not granted or the camera is unavailable.");
    }
  }

  async function queueStudioJob() {
    if (!state.studio.rightsConfirmed) {
      announce("Confirm media rights and subject consent before queuing a studio job.");
      return;
    }
    if (!state.studio.sourceName) {
      announce("Select a picture source before queuing the reveal.");
      return;
    }
    const button = document.getElementById("bx-queue-studio");
    if (button) button.disabled = true;
    try {
      const projectId = await ensureBrickGradeProject();
      const route = STUDIO_ROUTES.find((entry) => entry.id === state.studio.pipeline) || STUDIO_ROUTES[0];
      const payload = await erpApi("/api/tasks", {
        method: "POST",
        body: {
          project_id: projectId,
          name: `[GOATVERSE FORGE] ${workflowJobId()} · ${route.name} · ${(CREW_MODES.find((mode) => mode.id === state.studio.crewMode) || CREW_MODES[2]).name} · ${state.studio.duration}s ${state.studio.aspect} · ${state.item.title.trim() || state.studio.sourceName}`.slice(0, 220),
          status: "Todo",
          assigned_to: "The Producer — Crew Director",
          due_date: state.workflow.dueDate || ""
        }
      });
      state.studio.status = "QUEUED";
      addAudit("STUDIO JOB QUEUED", `${route.name} · ERP task #${payload.id || payload.task_id || "created"}`);
      updateUI();
      await refreshQueue(false);
      announce("GOATVERSE Forge task queued for Crew Director.");
    } catch (error) {
      announce(`Studio queue failed: ${error.message}`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function copyStudioManifest() {
    const text = JSON.stringify(studioManifest(), null, 2);
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else fallbackCopy(text);
      announce("GOATVERSE Forge manifest copied.");
    } catch (_) {
      announce("Clipboard access was blocked.");
    }
  }

  async function scanStudioRouter() {
    const note = document.getElementById("bx-studio-note");
    if (note) note.textContent = "Scanning the authenticated studio gateway…";
    try {
      const payload = await erpApi("/api/intel/production/status");
      const status = payload.status || payload;
      const creative = status.creative_stack || {};
      const count = finiteNumber(creative.detected_model_count, 0);
      state.studio.status = "ROUTER ONLINE";
      if (note) note.textContent = `Forge gateway online · ${count} local models discovered · Fusion Core capability routing and optional backstage adapters loaded from the studio host.`;
      announce("GOATVERSE Fusion Core synchronized.");
    } catch (_) {
      state.studio.status = "GATEWAY NEEDED";
      if (note) note.textContent = "The public ERP does not currently expose the local studio gateway. The handoff and task queue are ready; deploy the authenticated /api/intel production proxy before remote generation or live broadcast.";
      announce("Local studio gateway is not exposed to this ERP yet.");
    }
    updateUI();
  }

  function taskBrief() {
    const grade = getGrade();
    const evidence = getEvidenceStatus();
    const game = tcgById(state.tcg.game);
    const stage = workflowStageById(state.workflow.stage);
    return [
      `BrickGrade job ${workflowJobId()} — ${stage.label}`,
      `Item: ${state.item.title.trim() || "Untitled item"}`,
      `Reference: ${state.item.reference.trim() || "Not entered"}`,
      `Class: ${grade.category.name}`,
      grade.category.id === "cards" ? `TCG: ${game.name}; set ${state.tcg.set || "not entered"}; card ${state.tcg.number || "not entered"}; variant ${state.tcg.variant || "not entered"}; language ${state.tcg.language || "not entered"}` : "",
      `Proposed score: ${grade.score}/1000 (${grade.ten}/10.0), ${grade.band}`,
      `Limiter: ${grade.limiting.label} ${grade.limiting.value}/100; active cap ${grade.cap}`,
      `Evidence: ${evidence.complete}/${EVIDENCE_CHECKS.length}`,
      `QC: ${state.workflow.qcDecision}; owner gate: ${state.workflow.owner}`,
      `Notes: ${state.item.notes.trim() || "Not entered"}`,
      "Return findings, uncertainties, evidence gaps and a recommended next action. Do not claim certification or final approval."
    ].filter(Boolean).join("\n");
  }

  async function ensureBrickGradeProject() {
    if (state.workflow.projectId) return state.workflow.projectId;
    const projectsPayload = await erpApi("/api/projects");
    const projects = Array.isArray(projectsPayload) ? projectsPayload : (projectsPayload.projects || []);
    let project = projects.find((entry) => String(entry.name || "").toLowerCase() === "brickgrade exchange — grading operations".toLowerCase());
    if (!project) {
      await erpApi("/api/projects", {
        method: "POST",
        body: {
          name: "BrickGrade Exchange — Grading Operations",
          budget: 0,
          status: "In Progress",
          manager: "DJ Speedy / Waka Flocka Flame"
        }
      });
      const refreshedPayload = await erpApi("/api/projects");
      const refreshed = Array.isArray(refreshedPayload) ? refreshedPayload : (refreshedPayload.projects || []);
      project = refreshed.find((entry) => String(entry.name || "").toLowerCase() === "brickgrade exchange — grading operations".toLowerCase());
    }
    if (!project || !project.id) throw new Error("The BrickGrade ERP project could not be resolved.");
    state.workflow.projectId = Number(project.id);
    return state.workflow.projectId;
  }

  async function dispatchTask() {
    const button = document.getElementById("bx-dispatch-task");
    if (button) button.disabled = true;
    try {
      const projectId = await ensureBrickGradeProject();
      const agent = agentById(state.workflow.assignedAgent);
      const stage = workflowStageById(state.workflow.stage);
      const jobId = workflowJobId();
      const grade = getGrade();
      const cardRef = grade.category.id === "cards" ? `${tcgById(state.tcg.game).code} ${state.tcg.number || state.item.reference || "CARD"}` : grade.category.code;
      const title = `[BrickGrade] ${jobId} · ${stage.label} · ${cardRef} · ${grade.score} · ${state.item.title.trim() || "Untitled item"}`.slice(0, 220);
      const payload = await erpApi("/api/tasks", {
        method: "POST",
        body: {
          project_id: projectId,
          name: title,
          status: "Todo",
          assigned_to: `${agent.name} — ${agent.role}`,
          due_date: state.workflow.dueDate || ""
        }
      });
      state.workflow.taskId = Number(payload.id || payload.task_id || payload.task && payload.task.id || 0);
      addAudit("TASK DISPATCHED", `${stage.label} assigned to ${agent.name}${state.workflow.taskId ? ` · ERP #${state.workflow.taskId}` : ""}`);
      updateUI();
      await refreshQueue(false);
      announce(`ERP task dispatched to ${agent.name}.`);
    } catch (error) {
      announce(error.status === 401 || error.status === 403 ? "Your ERP session cannot create this task." : `Task dispatch failed: ${error.message}`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function briefCodex() {
    if (state.workflow.priority === "Vault") {
      announce("Vault-priority evidence is not sent to the Codex cloud briefing lane.");
      return;
    }
    const button = document.getElementById("bx-brief-codex");
    if (button) button.disabled = true;
    try {
      const payload = await erpApi("/api/ai/codex", { method: "POST", body: { prompt: taskBrief() } });
      const answer = String(payload.answer || "Codex accepted the brief.").slice(0, 800);
      addAudit("CODEX BRIEF", answer);
      const note = document.getElementById("bx-team-note");
      if (note) {
        note.textContent = answer;
        note.dataset.hasAiReply = "true";
      }
      updateUI();
      announce("Codex returned a grading review to the job activity log.");
    } catch (error) {
      announce(`Codex briefing failed: ${error.message}`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function recordQC(decision) {
    const evidence = getEvidenceStatus();
    if (decision === "Pass" && evidence.complete !== EVIDENCE_CHECKS.length) {
      announce("Complete all evidence checks before QC can pass.");
      return;
    }
    state.workflow.qcDecision = decision;
    state.workflow.stage = decision === "Pass" ? "owner" : "primary";
    state.workflow.approvalId = 0;
    state.workflow.approvalSnapshot = "";
    state.workflow.qcSnapshot = decision === "Pass" ? (workflowJobId(), approvalRelevantSnapshot()) : "";
    addAudit(decision === "Pass" ? "QC PASS" : "REVISION REQUIRED", decision === "Pass" ? "Evidence complete; routed to owner gate." : "Returned to the primary grading stage.");
    syncFormValues();
    updateUI();
    announce(decision === "Pass" ? "QC passed. Owner approval is now available." : "Job returned for revision.");
  }

  async function requestOwnerApproval() {
    if (state.workflow.qcDecision !== "Pass") {
      announce("A separate QC pass is required before owner approval.");
      return;
    }
    if (!state.workflow.qcSnapshot || state.workflow.qcSnapshot !== approvalRelevantSnapshot()) {
      invalidateQC("Draft changed after QC review");
      updateUI();
      announce("The reviewed draft changed. Run QC again before owner approval.");
      return;
    }
    if (state.workflow.approvalId) {
      announce(`Owner approval is already queued as ERP #${state.workflow.approvalId}.`);
      return;
    }
    const button = document.getElementById("bx-owner-approval");
    if (button) button.disabled = true;
    try {
      const grade = getGrade();
      const jobId = workflowJobId();
      const payload = await erpApi("/api/approvals", {
        method: "POST",
        body: {
          approval_type: "Report",
          title: `[BrickGrade] ${jobId} · Seal grade ${grade.score}`,
          amount: 0,
          requester: `${agentById(state.workflow.assignedAgent).name} / Grading Masters QC`,
          approver: state.workflow.owner,
          status: "Pending",
          due_date: state.workflow.dueDate || "",
          risk_level: grade.category.id === "cards" ? "Medium" : "High",
          notes: taskBrief()
        }
      });
      state.workflow.approvalId = Number(payload.id || payload.approval_id || payload.approval && payload.approval.id || 0);
      state.workflow.approvalSnapshot = state.workflow.qcSnapshot;
      addAudit("OWNER GATE REQUESTED", `Speedy / Waka approval queued${state.workflow.approvalId ? ` · ERP #${state.workflow.approvalId}` : ""}`);
      updateUI();
      announce("Owner approval request created in GOAT Approvals.");
    } catch (error) {
      announce(`Approval request failed: ${error.message}`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function refreshQueue(shouldAnnounce) {
    const list = document.getElementById("bx-queue-list");
    if (list) list.innerHTML = "<p>Synchronizing authenticated ERP tasks…</p>";
    try {
      const [tasksPayload, approvalsPayload, auditPayload] = await Promise.all([
        erpApi("/api/tasks"),
        erpApi("/api/approvals"),
        erpApi("/api/audit_log?limit=100").catch(() => ({ logs: [] }))
      ]);
      const tasks = (Array.isArray(tasksPayload) ? tasksPayload : (tasksPayload.tasks || [])).filter((task) => ["[BrickGrade]", "[GOATVERSE]", "[GOATVERSE FORGE]"].some((prefix) => String(task.name || "").startsWith(prefix)));
      const approvals = (Array.isArray(approvalsPayload) ? approvalsPayload : (approvalsPayload.approvals || [])).filter((approval) => String(approval.title || "").startsWith("[BrickGrade]"));
      const currentApproval = state.workflow.approvalId && state.workflow.jobId ? approvals.find((approval) => Number(approval.id) === Number(state.workflow.approvalId) && String(approval.title || "").includes(state.workflow.jobId)) : undefined;
      const approvalStillMatches = Boolean(currentApproval && state.workflow.qcDecision === "Pass" && state.workflow.approvalSnapshot && state.workflow.approvalSnapshot === approvalRelevantSnapshot());
      const taskIds = new Set(tasks.map((entry) => String(entry.id || "")).filter(Boolean));
      const approvalIds = new Set(approvals.map((entry) => String(entry.id || "")).filter(Boolean));
      const auditLogs = (Array.isArray(auditPayload) ? auditPayload : (auditPayload.logs || [])).filter((entry) => {
        const table = String(entry.table_name || entry.record_type || "").toLowerCase();
        const recordId = String(entry.record_id || "");
        if (table.includes("task")) return taskIds.has(recordId);
        if (table.includes("approval")) return approvalIds.has(recordId);
        return false;
      });
      if (approvalStillMatches && currentApproval.status === "Approved") {
        if (state.workflow.stage !== "sealed") addAudit("GRADE SEALED", `Approved by ${currentApproval.approver || state.workflow.owner} · ERP #${currentApproval.id}`);
        state.workflow.stage = "sealed";
      } else if (approvalStillMatches && currentApproval.status === "Rejected") {
        state.workflow.stage = "primary";
        state.workflow.qcDecision = "Revision";
        state.workflow.approvalId = 0;
        state.workflow.qcSnapshot = "";
        state.workflow.approvalSnapshot = "";
      }
      if (list) {
        list.innerHTML = tasks.length ? tasks.slice(0, 12).map((task) => `
          <article class="bx-queue-item">
            <span>${escapeHTML(String(task.status || "Todo"))}</span>
            <div><strong>${escapeHTML(String(task.name || "BrickGrade task"))}</strong><small>${escapeHTML(String(task.assigned_to || "Unassigned"))}${task.due_date ? ` · due ${escapeHTML(String(task.due_date))}` : ""}</small></div>
            <b>#${escapeHTML(String(task.id || "—"))}</b>
          </article>`).join("") : "<p>No BrickGrade tasks are visible in this ERP entity yet.</p>";
      }
      updateText("bx-queue-count", `${tasks.length} TASKS · ${approvals.filter((entry) => entry.status === "Pending").length} PENDING GATES`);
      updateText("bx-erp-audit-count", `${auditLogs.length} MATCHED ERP EVENTS`);
      const erpAudit = document.getElementById("bx-erp-audit");
      if (erpAudit) {
        erpAudit.innerHTML = auditLogs.length ? auditLogs.slice(0, 20).map((entry) => `
          <div><time>${escapeHTML(String(entry.created_at || ""))}</time><strong>${escapeHTML(String(entry.action || "ERP EVENT"))}</strong><span>${escapeHTML(String(entry.user_email || "ERP operator"))} · ${escapeHTML(String(entry.table_name || "record"))} #${escapeHTML(String(entry.record_id || "—"))}</span></div>`).join("") : "<p>No matching task or approval audit events were returned for this operator.</p>";
      }
      updateUI();
      if (shouldAnnounce) announce("BrickGrade ERP queue synchronized.");
    } catch (error) {
      if (list) list.innerHTML = `<p>${escapeHTML(error.status === 401 || error.status === 403 ? "Sign in with an ERP account allowed to view projects and approvals." : error.message)}</p>`;
      updateText("bx-queue-count", "SYNC FAILED");
      if (shouldAnnounce) announce("The ERP queue could not be synchronized.");
    }
  }

  function updateUI() {
    const grade = getGrade();
    const evidence = getEvidenceStatus();
    const valuation = getValuation();
    const command = commandById(state.command);
    const draftId = `BG-${hashText(JSON.stringify(passportCore()))}`;
    const scoreLabel = String(grade.score).padStart(3, "0");
    const game = tcgById(state.tcg.game);
    const assignedAgent = agentById(state.workflow.assignedAgent);

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
    document.querySelectorAll("[data-bx-tcg]").forEach((button) => {
      const active = button.dataset.bxTcg === state.tcg.game;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-bx-agent]").forEach((button) => {
      const active = button.dataset.bxAgent === state.workflow.assignedAgent;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-bx-stage-id]").forEach((stage) => {
      const activeIndex = WORKFLOW_STAGES.findIndex((entry) => entry.id === state.workflow.stage);
      const stageIndex = WORKFLOW_STAGES.findIndex((entry) => entry.id === stage.dataset.bxStageId);
      stage.classList.toggle("is-active", stageIndex === activeIndex);
      stage.classList.toggle("is-complete", stageIndex < activeIndex);
    });
    document.querySelectorAll("[data-bx-studio-route]").forEach((button) => {
      const active = button.dataset.bxStudioRoute === state.studio.pipeline;
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
    updateText("bx-tcg-card-code", game.code);
    updateText("bx-tcg-card-name", game.name.toUpperCase());
    updateText("bx-tcg-card-variant", (state.tcg.variant || "HOLO / STANDARD").toUpperCase());
    updateText("bx-tcg-visual-code", game.code);
    updateText("bx-tcg-visual-name", game.name.toUpperCase());
    const tcgVisual = document.getElementById("bx-tcg-visual");
    if (tcgVisual) tcgVisual.style.setProperty("--bx-game-accent", game.accent);
    const holoCard = document.getElementById("bx-tcg-holo-card");
    if (holoCard) {
      holoCard.style.setProperty("--bx-game-accent", game.accent);
      holoCard.hidden = grade.category.id !== "cards";
    }
    updateText("bx-job-id", state.workflow.jobId || "NEW JOB");
    updateText("bx-qc-grade", scoreLabel);
    updateText("bx-qc-decision", state.workflow.stage === "sealed" ? "SEALED" : state.workflow.qcDecision.toUpperCase());
    const teamNote = document.getElementById("bx-team-note");
    if (teamNote && !teamNote.dataset.hasAiReply) teamNote.textContent = `${assignedAgent.name} · ${assignedAgent.role} — ${assignedAgent.specialty}. Dispatch creates a real authenticated ERP task.`;
    const ownerButton = document.getElementById("bx-owner-approval");
    if (ownerButton) ownerButton.disabled = state.workflow.qcDecision !== "Pass" || Boolean(state.workflow.approvalId) || state.workflow.stage === "sealed";
    const qcPassButton = document.getElementById("bx-qc-pass");
    if (qcPassButton) qcPassButton.disabled = state.workflow.stage === "sealed";
    const audit = document.getElementById("bx-job-audit");
    if (audit) {
      audit.innerHTML = state.workflow.audit.length ? state.workflow.audit.map((entry) => `
        <div><time>${escapeHTML(new Date(entry.at).toLocaleString())}</time><strong>${escapeHTML(entry.action)}</strong><span>${escapeHTML(entry.detail)}</span></div>`).join("") : "<p>No job activity yet.</p>";
    }
    const studioRoute = STUDIO_ROUTES.find((route) => route.id === state.studio.pipeline) || STUDIO_ROUTES[0];
    updateText("bx-studio-status", state.studio.status);
    updateText("bx-studio-route-name", studioRoute.name.toUpperCase());
    updateText("bx-studio-source", state.studio.sourceName ? state.studio.sourceName.toUpperCase() : "NO SOURCE SELECTED");
    updateText("bx-studio-card-title", (state.item.title.trim() || "CARD CHAMPION").toUpperCase());

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
    const operation = document.fullscreenElement === target ? document.exitFullscreen() : target.requestFullscreen();
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
      const raw = localStorage.getItem(STORAGE_KEY) || (LEGACY_STORAGE_KEY ? localStorage.getItem(LEGACY_STORAGE_KEY) : "");
      if (!raw) {
        announce("No local BrickGrade draft was found.");
        return;
      }
      const payload = JSON.parse(raw);
      if (!payload || !payload.state || ![1, MODULE_VERSION].includes(payload.version)) throw new Error("Unsupported draft.");
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
      grade.category.id === "cards" ? `TCG profile: ${tcgById(state.tcg.game).name}` : "",
      grade.category.id === "cards" ? `Set / card / variant: ${state.tcg.set || "Not entered"} / ${state.tcg.number || "Not entered"} / ${state.tcg.variant || "Not entered"}` : "",
      `Score: ${grade.score}/1000 (${grade.ten}/10.0) — ${grade.band}`,
      `Raw weighted score: ${grade.raw}/1000`,
      `Limiting axis: ${grade.limiting.label} ${grade.limiting.value}/100`,
      `Active cap: ${grade.cap}/1000`,
      `Evidence: ${evidence.complete}/${EVIDENCE_CHECKS.length} checks recorded`,
      `Notes: ${state.item.notes.trim() || "Not entered"}`,
      `Workflow: ${workflowStageById(state.workflow.stage).label}; assigned ${agentById(state.workflow.assignedAgent).name}; QC ${state.workflow.qcDecision}`,
      `Owner gate: ${state.workflow.owner}`
    ].filter(Boolean);
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
    section.querySelectorAll("[data-bx-tcg]").forEach((button) => {
      button.addEventListener("click", () => selectTCG(button.dataset.bxTcg, true));
    });
    section.querySelectorAll("[data-bx-agent]").forEach((button) => {
      button.addEventListener("click", () => selectAgent(button.dataset.bxAgent, true));
    });
    section.querySelectorAll("[data-bx-studio-route]").forEach((button) => {
      button.addEventListener("click", () => selectStudioRoute(button.dataset.bxStudioRoute, true));
    });
    section.querySelectorAll("[data-bx-evidence]").forEach((input) => {
      input.addEventListener("change", () => {
        state.evidence[input.dataset.bxEvidence] = input.checked;
        invalidateQC("Evidence checklist changed");
        updateUI();
      });
    });

    document.getElementById("bx-category-select").addEventListener("change", (event) => selectCategory(event.target.value, true));
    document.getElementById("bx-category-prev").addEventListener("click", () => shiftCategory(-1));
    document.getElementById("bx-category-next").addEventListener("click", () => shiftCategory(1));
    document.getElementById("bx-tcg-select").addEventListener("change", (event) => selectTCG(event.target.value, true));
    document.getElementById("bx-agent-select").addEventListener("change", (event) => selectAgent(event.target.value, true));
    document.getElementById("bx-workflow-stage").addEventListener("change", (event) => {
      state.workflow.stage = event.target.value;
      invalidateQC("Workflow stage changed");
      updateUI();
    });
    document.getElementById("bx-priority").addEventListener("change", (event) => {
      state.workflow.priority = event.target.value;
      invalidateQC("Job priority changed");
      updateUI();
    });
    document.getElementById("bx-due-date").addEventListener("change", (event) => {
      state.workflow.dueDate = event.target.value;
      invalidateQC("Due date changed");
      updateUI();
    });
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
    document.getElementById("bx-dispatch-task").addEventListener("click", dispatchTask);
    document.getElementById("bx-brief-codex").addEventListener("click", briefCodex);
    document.getElementById("bx-refresh-queue").addEventListener("click", () => refreshQueue(true));
    document.getElementById("bx-qc-pass").addEventListener("click", () => recordQC("Pass"));
    document.getElementById("bx-qc-revision").addEventListener("click", () => recordQC("Revision"));
    document.getElementById("bx-owner-approval").addEventListener("click", requestOwnerApproval);
    document.getElementById("bx-camera-preview").addEventListener("click", toggleStudioCamera);
    document.getElementById("bx-studio-source-file").addEventListener("change", onStudioSource);
    document.getElementById("bx-studio-world").addEventListener("change", (event) => { state.studio.world = event.target.value; updateUI(); });
    document.getElementById("bx-studio-crew-mode").addEventListener("change", (event) => { state.studio.crewMode = event.target.value; updateUI(); });
    document.getElementById("bx-studio-duration").addEventListener("change", (event) => { state.studio.duration = clamp(finiteNumber(event.target.value, 15), 3, 60); updateUI(); });
    document.getElementById("bx-studio-aspect").addEventListener("change", (event) => { state.studio.aspect = event.target.value; updateUI(); });
    document.getElementById("bx-studio-platform").addEventListener("change", (event) => { state.studio.platform = event.target.value; updateUI(); });
    document.getElementById("bx-studio-prompt").addEventListener("input", (event) => { state.studio.prompt = event.target.value; updateUI(); });
    document.getElementById("bx-studio-rights").addEventListener("change", (event) => { state.studio.rightsConfirmed = event.target.checked; updateUI(); });
    document.getElementById("bx-queue-studio").addEventListener("click", queueStudioJob);
    document.getElementById("bx-copy-studio").addEventListener("click", copyStudioManifest);
    document.getElementById("bx-scan-studio").addEventListener("click", scanStudioRouter);

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
        invalidateQC("Item details changed");
        updateUI();
      });
    });

    [
      ["bx-tcg-set", "set"],
      ["bx-tcg-number", "number"],
      ["bx-tcg-variant", "variant"],
      ["bx-tcg-language", "language"]
    ].forEach(([id, key]) => {
      document.getElementById(id).addEventListener("input", (event) => {
        state.tcg[key] = event.target.value;
        invalidateQC("TCG identification changed");
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
        invalidateQC("Valuation inputs changed");
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

  function setSessionScope(rawScope) {
    const nextScope = String(rawScope || "").replace(/[^a-f0-9]/gi, "").slice(0, 48);
    if (nextScope === STORAGE_SCOPE) return;
    removeInjectedUI();
    state = buildInitialState();
    lastLockedSnapshot = "";
    STORAGE_SCOPE = nextScope;
    STORAGE_KEY = STORAGE_SCOPE ? `goat-force.brickgrade.command.v2.${STORAGE_SCOPE}` : "";
    LEGACY_STORAGE_KEY = STORAGE_SCOPE ? `goat-force.brickgrade.local-draft.v1.${STORAGE_SCOPE}` : "";
    if (nextScope && hasAuthenticatedShell()) queueMount();
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
    setSessionScope,
    version: MODULE_VERSION
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
