import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = "/Volumes/FKD1/USB-Uncensored-LLM-main";
const outputDir = path.join(root, "Documentation", "outputs");
const qaDir = "/private/tmp/oscar_workbook_render";
const outputPath = path.join(outputDir, "Oscar_Project_Cross_Reference_Workbook.xlsx");

const colors = {
  ink: "#17324D",
  navy: "#163A5F",
  teal: "#148A8A",
  green: "#DFF2E2",
  amber: "#FFF0CC",
  coral: "#FCE1DB",
  pale: "#E8EEF5",
  light: "#F6F8FA",
  white: "#FFFFFF",
  line: "#CFD9E2",
};

function columnLabel(number) {
  let label = "";
  let value = number;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

function applyTitle(sheet, lastColumn, title, subtitle) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastColumn}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: colors.navy,
    font: { name: "Calibri", size: 18, bold: true, color: colors.white },
    verticalAlignment: "center",
  };
  sheet.getRange(`A1:${lastColumn}1`).format.rowHeight = 34;
  sheet.getRange(`A2:${lastColumn}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${lastColumn}2`).format = {
    fill: colors.pale,
    font: { name: "Calibri", size: 10, italic: true, color: colors.ink },
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(`A2:${lastColumn}2`).format.rowHeight = 30;
}

function applyStatusFormats(sheet, statusRange) {
  statusRange.conditionalFormats.add("containsText", {
    text: "Working",
    format: { fill: colors.green, font: { bold: true, color: "#1F603A" } },
  });
  statusRange.conditionalFormats.add("containsText", {
    text: "Prepared",
    format: { fill: colors.green, font: { bold: true, color: "#1F603A" } },
  });
  statusRange.conditionalFormats.add("containsText", {
    text: "Planned",
    format: { fill: colors.amber, font: { bold: true, color: "#805A00" } },
  });
  statusRange.conditionalFormats.add("containsText", {
    text: "Confirm",
    format: { fill: colors.coral, font: { bold: true, color: "#8F362A" } },
  });
  statusRange.conditionalFormats.add("containsText", {
    text: "Not installed",
    format: { fill: colors.coral, font: { bold: true, color: "#8F362A" } },
  });
}

function addDataSheet(workbook, config) {
  const sheet = workbook.worksheets.add(config.name);
  const columns = config.headers.length;
  const lastColumn = columnLabel(columns);
  const lastRow = config.rows.length + 3;
  applyTitle(sheet, lastColumn, config.title, config.subtitle);
  sheet.getRange(`A3:${lastColumn}${lastRow}`).values = [config.headers, ...config.rows];
  sheet.getRange(`A3:${lastColumn}3`).format = {
    fill: colors.teal,
    font: { name: "Calibri", size: 10, bold: true, color: colors.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: colors.line },
  };
  sheet.getRange(`A3:${lastColumn}3`).format.rowHeight = 31;
  sheet.getRange(`A4:${lastColumn}${lastRow}`).format = {
    font: { name: "Calibri", size: 10, color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: colors.line },
  };
  sheet.getRange(`A4:${lastColumn}${lastRow}`).format.rowHeight = config.rowHeight || 50;
  config.widths.forEach((width, index) => {
    sheet.getRange(`${columnLabel(index + 1)}:${columnLabel(index + 1)}`).format.columnWidth = width;
  });
  const table = sheet.tables.add(`A3:${lastColumn}${lastRow}`, true, config.tableName);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
  sheet.freezePanes.freezeRows(3);
  if (config.statusColumn) {
    applyStatusFormats(sheet, sheet.getRange(`${config.statusColumn}4:${config.statusColumn}${lastRow}`));
  }
  return sheet;
}

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Dashboard");
applyTitle(
  dashboard,
  "H",
  "Oscar Project Cross-Reference Workbook",
  "Prepared 2026-05-25 | Status, source inventory, hardware roles, final deployment matrix and roadmap"
);
dashboard.getRange("A4:B4").values = [["Project Snapshot", "Value"]];
dashboard.getRange("A5:B10").values = [
  ["Original source location", "/Volumes/FKD1/USB-Uncensored-LLM-main"],
  ["Thor master transfer", "/Volumes/1TB JUMP/Oscar-Thor-Master-USB-v1"],
  ["Master package size", "52 GB"],
  ["Active model manifests", 7],
  ["Current document status", "PDF and workbook generated from project record"],
  ["Final delivery status", "Multi-platform launchers pending confirmed hardware and integration builds"],
];
dashboard.getRange("D4:E4").values = [["Capability Status", "Count"]];
dashboard.getRange("D5:D8").values = [
  ["Working now"],
  ["Not installed / planned"],
  ["Partially designed"],
  ["Hardware confirmations needed"],
];
dashboard.getRange("F12:G15").values = [
  ["Status", "Count"],
  ["Working now", null],
  ["Not installed / planned", null],
  ["Hardware confirmations", null],
];
dashboard.getRange("A4:B10").format = {
  font: { name: "Calibri", size: 10, color: colors.ink },
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "outside", style: "thin", color: colors.line },
};
dashboard.getRange("D4:E8").format = {
  font: { name: "Calibri", size: 10, color: colors.ink },
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: colors.line },
};
dashboard.getRange("A4:B4").format = dashboard.getRange("D4:E4").format = {
  fill: colors.teal,
  font: { name: "Calibri", size: 10, bold: true, color: colors.white },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
dashboard.getRange("D5:D8").format.fill = colors.pale;
dashboard.getRange("E5:E8").format = {
  fill: colors.light,
  font: { name: "Calibri", size: 18, bold: true, color: colors.navy },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: colors.line },
};
dashboard.getRange("A:A").format.columnWidth = 25;
dashboard.getRange("B:B").format.columnWidth = 55;
dashboard.getRange("C:C").format.columnWidth = 3;
dashboard.getRange("D:D").format.columnWidth = 29;
dashboard.getRange("E:E").format.columnWidth = 13;
dashboard.getRange("F:G").format.columnWidth = 20;
dashboard.getRange("A5:B10").format.rowHeight = 48;
dashboard.getRange("D5:E8").format.rowHeight = 38;
dashboard.getRange("F12:G15").format = { font: { size: 9, color: colors.ink } };
dashboard.freezePanes.freezeRows(2);

addDataSheet(workbook, {
  name: "Timeline",
  title: "Completed Work Timeline",
  subtitle: "Delivered features and verified outcomes recorded to date.",
  headers: ["Date", "Work Completed", "Verified Outcome", "State"],
  rows: [
    ["2026-05-22 to 2026-05-23", "Persistent memory, identity guidance and Tool Mode foundations", "Oscar settings and tool-oriented workflow stored with the USB app", "Working"],
    ["2026-05-23", "Mac launcher and portable-client packaging work", "Current launcher guidance and portable behavior recorded", "Working"],
    ["2026-05-25", "Voice conversation upgrade", "Browser dictation, read-aloud, wake listening and saved delivery profile", "Working"],
    ["2026-05-25", "Skill/model routing upgrade", "Chat, Voice, Code, Research and Vision modes route to local models", "Working"],
    ["2026-05-25", "Vision model addition", "moondream:1.8b present in active model manifests", "Working"],
    ["2026-05-25", "Live toolbox feature merge", "Crew perspectives, optional Council review and readiness display", "Working"],
    ["2026-05-25", "Mobile usability repair", "Conversation and Crew panel stay within phone viewport", "Working"],
    ["2026-05-25", "NVIDIA Thor master transfer build", "52 GB master package copied to 1TB JUMP and critical files checked", "Prepared"],
  ],
  widths: [19, 33, 49, 14],
  statusColumn: "D",
  tableName: "TimelineTable",
});

addDataSheet(workbook, {
  name: "Capabilities",
  title: "Capability Truth Table",
  subtitle: "Current state is separated from future work so plans do not become false product claims.",
  headers: ["Capability", "Current State", "Evidence", "Expansion Needed"],
  rows: [
    ["Chat and saved memory", "Working", "Shared/FastChatUI.html; Shared/chat_server.py; Shared/chat_data/settings.json", "Searchable server memory and retrieval layer"],
    ["Voice conversation", "Working through browser/system voice", "Shared/FastChatUI.html; VOICE_ENGINE_UPGRADE.md", "Dedicated licensed/consented neural Oscar voice"],
    ["Image understanding", "Working, host-dependent", "moondream:1.8b manifest", "Faster visual models on GPU hosts"],
    ["PDF intake", "Working with text snippet", "UI sends roughly first 12,000 extracted characters per question", "Document vault, indexing, citations and retrieval"],
    ["Code/research roles", "Working as prompts and local tools", "Skill selector; Crew panel; Tool Mode", "Larger coding models and audited adapters"],
    ["Image/graphic generation", "Not installed", "No generation engine currently wired into Oscar", "CUDA image pipeline and export workflow"],
    ["3D art/rendering", "Not installed", "No Blender production bridge currently wired in", "Blender job bridge and previews"],
    ["Audio/music intake", "Not installed", "File input accepts images and PDF only", "Audio upload, transcription and catalog"],
    ["Video intake", "Not installed", "File input accepts images and PDF only", "MOV/MP4 upload and FFmpeg analysis"],
    ["Autonomous production work", "Partially designed, constrained", "Tool Mode is subject to approved local action", "Audited queues, checkpoints and permissions"],
  ],
  widths: [25, 25, 45, 42],
  statusColumn: "B",
  tableName: "CapabilitiesTable",
  rowHeight: 58,
});

addDataSheet(workbook, {
  name: "Hardware_Roles",
  title: "Reported Final Hardware Estate",
  subtitle: "Owner-reported targets are recorded separately from specifications requiring confirmation.",
  headers: ["Node", "Reported Hardware or Storage", "Intended Oscar Role", "Verification Status"],
  rows: [
    ["Oscar final PC home", "42-core AMD Threadripper; 256 GB RAM; 2 x RTX 5090 Founders Edition; 100 TB internal 10-SSD PCIe storage; 100 TB Thunderbolt external cloud rack", "Creative production node for graphics, 3D, audio/video and CUDA/WSL workloads", "Owner-reported; confirm CPU SKU, SSD layout, network and CUDA/WSL"],
    ["NVIDIA Jetson AGX Thor", "Purchased for Oscar; official developer kit specification references T5000 and 128 GB LPDDR5X", "Always-on service/orchestration node and unified-memory inference target", "Thor transfer package prepared; configure after arrival and JetPack install"],
    ["Mac Studio", "Requested as Mac M5 128 G Mac Studio", "macOS creator workstation and one-click target", "Confirm exact model/chip/RAM before final launcher"],
    ["NVIDIA Jetson secondary device", "Requested as Jetson Nano 64 G with 2 TB storage", "Smaller edge/satellite Oscar node", "Confirm exact NVIDIA SKU before selecting runtime"],
    ["Server vault", "100 TB storage reported", "Media Vault, project data, generated assets, backups and index stores", "Owner-reported; confirm filesystem, backups, network and permissions"],
  ],
  widths: [25, 48, 42, 43],
  statusColumn: "D",
  tableName: "HardwareTable",
  rowHeight: 68,
});

addDataSheet(workbook, {
  name: "Source_Inventory",
  title: "Source-Code Inventory",
  subtitle: "The final Oscar delivery must carry editable source code, launchers, memory migration and documentation.",
  headers: ["Component", "Live Source Location", "Purpose", "Include in Final Package"],
  rows: [
    ["Web interface", "Shared/FastChatUI.html", "Chat UI, voice controls, skill routing, Crew panel and attachments", "Yes"],
    ["Local server", "Shared/chat_server.py", "USB persistence, API proxy, stats and workspace/tool behavior", "Yes"],
    ["Settings and memory", "Shared/chat_data/settings.json", "Oscar identity, project memory and saved choices", "Yes, with privacy review"],
    ["Chat history", "Shared/chat_data/chats.json", "Saved conversations", "Owner-selectable export"],
    ["Mac launchers", "Launch Oscar.command; Mac/Launch Oscar.command; Mac/start.command", "Current macOS launch path", "Yes"],
    ["Windows scripts", "Windows/install.bat; Windows/install-core.ps1; Windows/start-fast-chat.bat", "Existing Windows portable baseline", "Yes"],
    ["Generic Linux scripts", "Linux/install.sh; Linux/start.sh", "Existing Linux baseline; not Thor specific", "Yes, labeled"],
    ["Thor deployment scripts", "Thor/install-oscar-thor.sh; Thor/start-oscar-thor.sh; Thor/verify-oscar-thor.sh; Thor/build-master-on-mac.sh", "ARM64/JetPack-aware deployment and launch path", "Yes"],
    ["Design notes", "Shared/oscar_drafts/*.md; Thor/*.md; Documentation/*", "Capability record and final deployment plan", "Yes"],
  ],
  widths: [25, 55, 48, 25],
  tableName: "SourceInventoryTable",
  rowHeight: 62,
});

addDataSheet(workbook, {
  name: "One_Click_Matrix",
  title: "Final One-Click Delivery Matrix",
  subtitle: "Each confirmed platform requires one obvious launcher, prerequisite checks, diagnostics and repeatable testing.",
  headers: ["Platform", "Required One-Click Result", "Current Position", "Final Acceptance Focus"],
  rows: [
    ["Oscar final PC home", "Launch Oscar creative node and connect vault/services with GPU diagnostics", "Windows baseline exists; final CUDA/WSL creative-node launcher to build", "GPU use, media jobs, storage connection, logs and recovery"],
    ["Mac Studio", "Launch Oscar client or native service with Apple Silicon-compatible runtime", "Mac baseline exists; rebuild/test after hardware confirmation", "Apple Silicon install, microphone/speech, memory and vault access"],
    ["Jetson AGX Thor", "Install native ARM64 runtime once; then launch service and verification from one entry point", "Thor transfer scripts prepared", "JetPack/runtime, inference, context size, restart and recovery"],
    ["Secondary NVIDIA Jetson", "Launch properly scaled satellite mode", "Waiting for exact SKU confirmation", "Memory fit, storage mount, role boundary and performance"],
    ["Server vault", "Mount and validate media/storage/index paths without exposing private data", "Media Vault service and permission plan to build", "Backup, permissions, indexing, capacity and privacy"],
  ],
  widths: [31, 50, 47, 46],
  statusColumn: "C",
  tableName: "OneClickTable",
  rowHeight: 72,
});

addDataSheet(workbook, {
  name: "Roadmap",
  title: "Media, Art, Music and 3D Roadmap",
  subtitle: "Capability expansion is organized by the runtime needed and the node best suited to run it.",
  headers: ["Phase", "Capability", "Needed Runtime or Tool Class", "Target Node", "State"],
  rows: [
    [1, "Media Vault and indexing", "Server uploads, metadata DB and retrieval/index pipeline", "Thor plus 100 TB server", "Planned"],
    [2, "Audio/video intake", "Resumable upload, FFmpeg, transcription and frame extraction", "Windows node plus vault", "Planned"],
    [3, "Graphics studio", "CUDA image generation, references, editing/upscale/export workflow", "Oscar final PC home", "Planned"],
    [4, "Music/entertainment workspace", "Catalog memory, stems, notes, assets and rights tracking", "Windows node plus vault", "Planned"],
    [5, "3D studio", "Blender controlled runner, previews, rendering and export", "Windows node", "Planned"],
    [6, "Larger model routing", "Benchmarked reasoning, coding, vision and multimodal engines", "Thor and Windows node", "Planned"],
    [7, "Audited automation", "Owner-approved tasks, backups, checkpoints, logs and review gates", "Thor orchestration layer", "Planned"],
  ],
  widths: [10, 33, 59, 30, 16],
  statusColumn: "E",
  tableName: "RoadmapTable",
  rowHeight: 58,
});

addDataSheet(workbook, {
  name: "References",
  title: "Reference Sources",
  subtitle: "Official product documentation and live local project paths supporting this record.",
  headers: ["Source", "Use"],
  rows: [
    ["https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-thor/", "Official Jetson Thor specification reference"],
    ["https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/latest/index.html", "Official Thor setup/documentation path"],
    ["https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin", "Official Jetson family comparison for SKU confirmation"],
    ["https://www.apple.com/mac-studio/specs/", "Official current Mac Studio specifications reference"],
    ["https://docs.ollama.com/faq", "Ollama model-loading and multi-GPU behavior reference"],
    ["https://docs.nvidia.com/cuda/wsl-user-guide/", "Windows 11 WSL/CUDA workflow reference"],
    ["/Volumes/FKD1/USB-Uncensored-LLM-main/Shared/FastChatUI.html", "Live Oscar interface implementation"],
    ["/Volumes/FKD1/USB-Uncensored-LLM-main/Shared/chat_server.py", "Live Oscar local server implementation"],
    ["/Volumes/FKD1/USB-Uncensored-LLM-main/Thor/README-THOR-TRANSFER.md", "Thor migration record"],
    ["/Volumes/1TB JUMP/Oscar-Thor-Master-USB-v1", "Completed transfer artifact"],
  ],
  widths: [80, 67],
  tableName: "ReferencesTable",
  rowHeight: 44,
});

dashboard.getRange("E5:E8").formulas = [
  ['=COUNTIF(Capabilities!B4:B13,"Working")+COUNTIF(Capabilities!B4:B13,"Working through browser/system voice")+COUNTIF(Capabilities!B4:B13,"Working, host-dependent")+COUNTIF(Capabilities!B4:B13,"Working with text snippet")+COUNTIF(Capabilities!B4:B13,"Working as prompts and local tools")'],
  ['=COUNTIF(Capabilities!B4:B13,"Not installed")'],
  ['=COUNTIF(Capabilities!B4:B13,"Partially designed, constrained")'],
  ['=COUNTIF(Hardware_Roles!D4:D8,"Confirm exact model/chip/RAM before final launcher")+COUNTIF(Hardware_Roles!D4:D8,"Confirm exact NVIDIA SKU before selecting runtime")'],
];
dashboard.getRange("G13:G15").formulas = [["=E5"], ["=E6"], ["=E8"]];
const dashboardChart = dashboard.charts.add("bar", dashboard.getRange("F12:G15"));
dashboardChart.setPosition("D11", "H29");
dashboardChart.title = "Implementation Readiness";
dashboardChart.hasLegend = false;

const snapshot = await workbook.inspect({
  kind: "region",
  sheetId: "Dashboard",
  range: "A1:H15",
  maxChars: 3500,
});
const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
  maxChars: 1500,
});

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(qaDir, { recursive: true });
const sheets = [
  "Dashboard",
  "Timeline",
  "Capabilities",
  "Hardware_Roles",
  "Source_Inventory",
  "One_Click_Matrix",
  "Roadmap",
  "References",
];
for (const name of sheets) {
  const preview = await workbook.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(path.join(qaDir, `${name}.png`), bytes);
}
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

console.log(snapshot.ndjson);
console.log(formulaErrors.ndjson);
console.log(`Workbook exported: ${outputPath}`);
console.log(`Rendered sheets: ${qaDir}`);
