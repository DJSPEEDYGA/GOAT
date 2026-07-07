"""Generate the paginated PDF edition of the Oscar project record."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path("/Volumes/FKD1/USB-Uncensored-LLM-main")
OUTPUT = ROOT / "Documentation" / "outputs" / "Oscar_Project_Record_and_Final_Deployment_Blueprint.pdf"
NAVY = colors.HexColor("#173B60")
BLUE = colors.HexColor("#2E74B5")
TEAL = colors.HexColor("#148A8A")
INK = colors.HexColor("#23384A")
PALE = colors.HexColor("#E8EEF5")
LIGHT = colors.HexColor("#F6F8FA")
GREEN = colors.HexColor("#E1F1E4")
AMBER = colors.HexColor("#FFF0CC")
RED = colors.HexColor("#FCE1DB")
GRID = colors.HexColor("#C8D5DF")


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", parent=base["Title"], fontName="Helvetica-Bold", fontSize=27,
            leading=31, textColor=NAVY, alignment=TA_LEFT, spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=base["Normal"], fontName="Helvetica", fontSize=14,
            leading=18, textColor=BLUE, spaceAfter=15,
        ),
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=15,
            leading=18, textColor=BLUE, spaceBefore=7, spaceAfter=7,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
            leading=14, textColor=BLUE, spaceBefore=7, spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body", parent=base["BodyText"], fontName="Helvetica", fontSize=9,
            leading=12, textColor=INK, spaceAfter=5,
        ),
        "body_bold": ParagraphStyle(
            "body_bold", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=9,
            leading=12, textColor=INK, spaceAfter=5,
        ),
        "small": ParagraphStyle(
            "small", parent=base["BodyText"], fontName="Helvetica", fontSize=7.1,
            leading=8.8, textColor=INK,
        ),
        "small_bold": ParagraphStyle(
            "small_bold", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=7.1,
            leading=8.8, textColor=colors.white,
        ),
        "callout": ParagraphStyle(
            "callout", parent=base["BodyText"], fontName="Helvetica", fontSize=9.2,
            leading=12, textColor=INK,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"], fontName="Helvetica", fontSize=7,
            textColor=NAVY, alignment=TA_RIGHT,
        ),
    }


S = styles()


def para(value, style="small"):
    safe = str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, S[style])


def heading(value, level=1):
    return Paragraph(value, S["h1" if level == 1 else "h2"])


def body(value, bold=False):
    return Paragraph(value, S["body_bold" if bold else "body"])


def data_table(headers, rows, widths, status_column=None):
    data = [[para(value, "small_bold") for value in headers]]
    data.extend([[para(value) for value in row] for row in rows])
    table = Table(data, colWidths=[width * inch for width in widths], repeatRows=1)
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, GRID),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for row_index in range(1, len(rows) + 1):
        if row_index % 2 == 0:
            commands.append(("BACKGROUND", (0, row_index), (-1, row_index), LIGHT))
        if status_column is not None:
            status = str(rows[row_index - 1][status_column]).lower()
            fill = None
            if "working" in status or "prepared" in status:
                fill = GREEN
            elif "planned" in status or "to build" in status:
                fill = AMBER
            elif "confirm" in status or "not installed" in status or "waiting" in status:
                fill = RED
            if fill:
                commands.append(("BACKGROUND", (status_column, row_index), (status_column, row_index), fill))
    table.setStyle(TableStyle(commands))
    return table


def note_box(text):
    table = Table([[Paragraph(text, S["callout"])]], colWidths=[7.1 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.7, GRID),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def bullet_lines(items):
    flow = []
    for item in items:
        flow.append(body(f"- {item}"))
    return flow


def page_frame(canvas, document):
    canvas.saveState()
    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, LETTER[0], LETTER[1], fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.drawString(document.leftMargin, LETTER[1] - 0.44 * inch, "OSCAR PROJECT RECORD  |  FINAL DEPLOYMENT BLUEPRINT")
    canvas.setStrokeColor(GRID)
    canvas.setLineWidth(0.5)
    canvas.line(document.leftMargin, LETTER[1] - 0.51 * inch, LETTER[0] - document.rightMargin, LETTER[1] - 0.51 * inch)
    canvas.setFont("Helvetica", 7)
    canvas.drawRightString(LETTER[0] - document.rightMargin, 0.38 * inch, f"Prepared May 25, 2026  |  Page {document.page}")
    canvas.restoreState()


def build():
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=LETTER,
        leftMargin=0.70 * inch,
        rightMargin=0.70 * inch,
        topMargin=0.72 * inch,
        bottomMargin=0.58 * inch,
        title="Oscar Project Record and Final Deployment Blueprint",
        author="Codex",
    )
    story = []

    story.append(Spacer(1, 0.22 * inch))
    story.append(Paragraph("Oscar Project Record", S["title"]))
    story.append(Paragraph("Final Deployment Blueprint and Source-Code Delivery Record", S["subtitle"]))
    story.append(body("Prepared for the owner | Version 2026-05-25", bold=True))
    story.append(note_box(
        "Status: Original Oscar is local and working from the FKD1 USB source. A 52 GB NVIDIA "
        "Thor master transfer package is already built on 1TB JUMP. Final all-platform one-click "
        "delivery remains an integration and hardware-confirmation task."
    ))
    story.append(Spacer(1, 8))
    story.append(heading("Purpose And Current Position"))
    story.append(body(
        "This record captures what has been implemented in Oscar, what is present in the transfer "
        "master, where editable source code lives, the requested final hardware estate and the build "
        "requirements for a finished one-click Oscar system."
    ))
    story.extend(bullet_lines([
        "Original source: /Volumes/FKD1/USB-Uncensored-LLM-main",
        "Thor transfer master: /Volumes/1TB JUMP/Oscar-Thor-Master-USB-v1",
        "The transfer master preserves UI, settings, chat history, drafts, active model store and rebuildable model files.",
        "Seven active model manifests are included, with moondream:1.8b for image understanding.",
        "Graphics generation, 3D production, broad audio/video intake and distributed orchestration are roadmap work.",
    ]))
    story.append(heading("Completed Work"))
    story.append(data_table(
        ["Date", "Work Completed", "Verified Outcome", "State"],
        [
            ["2026-05-22 to 05-23", "Persistent memory, identity guidance and Tool Mode foundations", "Settings and workflow stored with USB app", "Working"],
            ["2026-05-23", "Mac launcher and portable-client packaging", "Launcher guidance and portable behavior recorded", "Working"],
            ["2026-05-25", "Voice conversation upgrade", "Dictation, read-aloud, wake listening and saved profile", "Working"],
            ["2026-05-25", "Skill/model routing and vision addition", "Chat/Voice/Code/Research/Vision modes; moondream manifest", "Working"],
            ["2026-05-25", "Crew feature merge and mobile repair", "Expert views, Council review and phone layout", "Working"],
            ["2026-05-25", "NVIDIA Thor master transfer build", "52 GB package copied and key files checked", "Prepared"],
        ],
        [1.15, 2.08, 2.72, 1.15],
        status_column=3,
    ))

    story.append(PageBreak())
    story.append(heading("Capability Truth Table"))
    story.append(body(
        "Current state is separated from future work so planning does not become a false product claim."
    ))
    story.append(data_table(
        ["Capability", "Current State", "Evidence", "Expansion Needed"],
        [
            ["Chat and saved memory", "Working", "UI, local server and saved settings", "Searchable retrieval layer"],
            ["Voice conversation", "Working through browser voice", "UI and voice upgrade draft", "Licensed/consented neural voice"],
            ["Image understanding", "Working, host-dependent", "moondream:1.8b manifest", "Higher-performance visual models"],
            ["PDF intake", "Working with text snippet", "Roughly first 12,000 extracted characters", "Indexed document vault and citations"],
            ["Code/research roles", "Working as local workflow", "Skills, Crew panel and Tool Mode", "Larger models and adapters"],
            ["Image/graphic generation", "Not installed", "No engine wired into Oscar", "CUDA generation workflow"],
            ["3D art/rendering", "Not installed", "No Blender bridge", "Controlled runner and preview"],
            ["Audio/music intake", "Not installed", "UI accepts images/PDF only", "Audio upload and transcription"],
            ["Video intake", "Not installed", "UI accepts images/PDF only", "MOV/MP4 and FFmpeg workflow"],
            ["Autonomous production work", "Partially designed, constrained", "Approved local actions required", "Audited queues and permissions"],
        ],
        [1.55, 1.65, 2.05, 1.85],
        status_column=1,
    ))
    story.append(Spacer(1, 12))
    story.append(heading("Can Oscar Produce Work Like This?"))
    story.append(body(
        "Today Oscar has chat, saved memory, browser voice controls, image understanding, PDF snippet "
        "intake and constrained local-tool workflow. He does not yet independently expose a report, "
        "PDF or spreadsheet-generation tool."
    ))
    story.append(body(
        "On the final system, yes: Oscar can be equipped to create structured reports, PDF exports, "
        "spreadsheets, inventories and project packages by adding audited document and spreadsheet "
        "adapters through Tool Mode. Capabilities become real after their engines, permissions, storage "
        "and acceptance tests are connected and verified."
    ))

    story.append(PageBreak())
    story.append(heading("Reported Final Hardware Estate"))
    story.append(body(
        "The requested targets are preserved here while details needing exact confirmation are clearly marked."
    ))
    story.append(data_table(
        ["Node", "Reported Hardware Or Storage", "Oscar Role", "Verification Status"],
        [
            ["Oscar final PC home", "42-core AMD Threadripper; 256 GB RAM; 2 x RTX 5090 Founders Edition; 100 TB internal 10-SSD PCIe storage; 100 TB Thunderbolt external cloud rack", "Creative production and CUDA/WSL services", "Confirm CPU, SSD layout and runtime"],
            ["Jetson AGX Thor", "Purchased; official kit reference states T5000 and 128 GB LPDDR5X", "Always-on service/orchestration hub", "Thor scripts prepared"],
            ["Mac Studio", "Requested as Mac M5 128 G", "macOS creator access and launch target", "Confirm exact model/chip/RAM"],
            ["Secondary Jetson", "Requested as Jetson Nano 64 G with 2 TB", "Satellite service node", "Confirm exact NVIDIA SKU"],
            ["Server vault", "100 TB storage reported", "Media vault, assets and backups", "Confirm filesystem and permissions"],
        ],
        [1.35, 2.35, 1.65, 1.75],
        status_column=3,
    ))
    story.append(Spacer(1, 8))
    story.append(note_box(
        "Confirmation point: before final installers are locked, check the exact purchased Mac Studio "
        "and secondary Jetson SKU against current official Apple and NVIDIA specifications."
    ))
    story.append(heading("Recommended Multi-Node Architecture"))
    story.append(data_table(
        ["Layer", "Primary Node", "Function"],
        [
            ["Control and orchestration", "Thor", "Always-on chat/service hub, routing, scheduling, indexes and permissions"],
            ["Creative generation", "Oscar final PC home", "Artwork, audio/video processing, 3D rendering and CUDA workflows"],
            ["macOS creator access", "Mac Studio", "Review, creative workflow and macOS launch experience"],
            ["Satellite workflow", "Confirmed Jetson SKU", "Scaled edge/local services after capability verification"],
            ["Durable storage", "100 TB server", "Originals, masters, assets, reference library and backups"],
            ["Recovery and transfer", "Oscar master USB", "Source package, scripts, model seed and recovery workflow"],
        ],
        [1.72, 1.73, 3.65],
    ))

    story.append(PageBreak())
    story.append(heading("Editable Source-Code Inventory"))
    story.append(body(
        "The final delivery includes editable source and rebuild tools, not only packaged executables."
    ))
    story.append(data_table(
        ["Component", "Live Source Location", "Purpose", "Final Package"],
        [
            ["Web interface", "Shared/FastChatUI.html", "Voice, skills, Crew and attachments", "Include"],
            ["Local server", "Shared/chat_server.py", "Persistence, API proxy and tools", "Include"],
            ["Settings/memory", "Shared/chat_data/settings.json", "Identity and saved choices", "Include with privacy review"],
            ["Chat history", "Shared/chat_data/chats.json", "Saved conversations", "Owner-selectable export"],
            ["Mac launchers", "Launch Oscar.command; Mac/*.command", "macOS baseline launch", "Include"],
            ["Windows scripts", "Windows/install*; Windows/start-fast-chat.bat", "Windows baseline", "Include"],
            ["Thor scripts", "Thor/install*; start*; verify*; build-master*", "ARM64/JetPack path", "Include"],
            ["Documentation tools", "Documentation/tools/*", "Rebuild PDF and XLSX record", "Include"],
        ],
        [1.20, 2.65, 2.10, 1.15],
    ))
    story.append(heading("Final One-Click Delivery Requirement"))
    story.append(body(
        "A platform is ready only when it has one obvious launch entry point, editable source, prerequisite "
        "checks, diagnostics, migration behavior and acceptance tests."
    ))
    story.append(data_table(
        ["Platform", "Required One-Click Result", "Current Position", "Acceptance Focus"],
        [
            ["Oscar final PC home", "Creative node launch and vault connection", "Baseline exists; CUDA/WSL launcher to build", "GPU, media, storage and recovery"],
            ["Mac Studio", "Apple Silicon client/service launch", "Baseline exists; test after confirmation", "Runtime, voice and vault access"],
            ["Jetson AGX Thor", "ARM64 setup once; direct service launch", "Transfer scripts prepared", "JetPack, inference and restart"],
            ["Secondary Jetson", "Scaled satellite launch", "Waiting for exact SKU", "Memory fit and performance"],
            ["Server vault", "Validate private media/storage paths", "Service/permission plan to build", "Backup, indexing and privacy"],
        ],
        [1.38, 2.00, 2.02, 1.70],
        status_column=2,
    ))

    story.append(PageBreak())
    story.append(heading("Every Final Package Must Include"))
    story.extend(bullet_lines([
        "Editable source files and source manifest.",
        "Prerequisite installer or system check plus one obvious launcher.",
        "Settings and memory migration path with privacy boundaries.",
        "Model/runtime placement, media-vault connection and GPU/storage diagnostics.",
        "Logs, backup/recovery directions and tests for chat, voice, tools, files and services.",
    ]))
    story.append(heading("Media, Art, Music And 3D Roadmap"))
    story.append(data_table(
        ["Phase", "Capability", "Needed Runtime Or Tool Class", "Target Node", "State"],
        [
            ["1", "Media Vault and indexing", "Uploads, metadata DB and retrieval/index", "Thor + server", "Planned"],
            ["2", "Audio/video intake", "Upload, FFmpeg and transcription", "Windows + vault", "Planned"],
            ["3", "Graphics studio", "CUDA generation, edit/upscale/export", "Oscar final PC home", "Planned"],
            ["4", "Music workspace", "Catalog, stems, notes and rights tracking", "Windows + vault", "Planned"],
            ["5", "3D studio", "Blender runner, preview and rendering", "Windows", "Planned"],
            ["6", "Larger model routing", "Code, vision and multimodal benchmarks", "Thor + Windows", "Planned"],
            ["7", "Audited automation", "Approved jobs, checkpoints and logs", "Thor", "Planned"],
        ],
        [0.55, 1.40, 2.65, 1.48, 1.02],
        status_column=4,
    ))
    story.append(heading("Source References"))
    story.append(data_table(
        ["Reference", "Use"],
        [
            ["https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-thor/", "Official Jetson Thor reference"],
            ["https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/latest/index.html", "Official Thor setup path"],
            ["https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin", "Official Jetson family comparison"],
            ["https://www.apple.com/mac-studio/specs/", "Official Mac Studio reference"],
            ["https://docs.ollama.com/faq", "Ollama multi-GPU/loading reference"],
            ["https://docs.nvidia.com/cuda/wsl-user-guide/", "Windows WSL/CUDA reference"],
            ["/Volumes/FKD1/USB-Uncensored-LLM-main", "Live Original Oscar source"],
            ["/Volumes/1TB JUMP/Oscar-Thor-Master-USB-v1", "Transfer master artifact"],
        ],
        [4.90, 2.20],
    ))
    story.append(heading("Record Maintenance", level=2))
    story.append(body(
        "Keep this PDF and its cross-reference workbook with the Oscar master USB. Update both after "
        "hardware confirmation, each final launcher build and acceptance-tested capability additions."
    ))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document.build(story, onFirstPage=page_frame, onLaterPages=page_frame)
    print(f"PDF exported: {OUTPUT}")


if __name__ == "__main__":
    build()
