# Lexi AAX CUDA Developer Stack

Date: 2026-05-29
Owner lane: Lexicon Lexi
Status: planning manifest, not proof of installed tools

## Purpose

This file captures the developer packages and GPU direction needed for GOAT audio plug-in work, Pro Tools validation, and future NVIDIA acceleration planning.

Lexicon Lexi owns this lane because it covers Pro Tools tooling, AAX/JUCE research, validation checklists, build matrices, file hashes, and metadata QA.

AGENT-007 coordinates runtime status only when needed. Money Penny protects licensing, access, and business records. Sir Codex writes QA and handoff notes. Do not blend the lane name into `AGENT-007/Money Penny/Lexi`; this stack lives in Lexi's folder and speaks as Lexicon Lexi.

## Source References

- NVIDIA CUDA-X: https://www.nvidia.com/en-us/technologies/cuda-x/?ncid=no-ncid
- Avid developer package list supplied by owner in Codex on 2026-05-29.
- NVIDIA GOAT tool map: `NVIDIA-GOAT-TOOL-MAP-2026-05-29.md`

NVIDIA describes CUDA-X as GPU-accelerated microservices and libraries for AI, and as a collection built on CUDA for data processing, AI, and high-performance computing. For AGENT-007, this means CUDA-X belongs on a verified NVIDIA machine, not this Mac staging bench.

## Local Safety Rules

1. Do not commit Avid SDKs, installers, licensed PDFs, Pro Tools installers, or proprietary binaries to public GitHub.
2. Store licensed Avid downloads in a private local folder or private Google Drive folder only.
3. Keep evaluation license PDFs next to the exact package they govern.
4. Track file name, version, platform, size, download date, hash, and install status before using a package.
5. Never claim CUDA, AAX DSP, DigiShell, or Pro Tools Dev is working until the exact tool is installed and a real validation command passes.
6. API keys are not part of this lane. Local model work should stay on AGENT-007/Ollama unless a future task explicitly requires a cloud provider.

## Recommended Folder Layout

```text
BackupVault/GOAT-Crew-Homes/Lexicon-Lexi/AAX-Developer-Stack/
  00-licenses/
  01-aax-sdk/
  02-developer-tools/
  03-validators/
  04-pro-tools-dev/
  05-drivers-services/
  06-demo-sessions/
  07-legacy-reference/
  08-cuda-x-notes/
  manifests/
```

## Priority Install and Archive Order

### Phase 1: Required AAX Development Base

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| AAX SDK | 2.9.0 | Cross-platform SDK | 41.28 MB | Current AAX SDK target from supplied list | Archive first |
| AAX SDK | 2.8.1 | Cross-platform SDK | 40.36 MB | Compatibility fallback | Archive |
| AAX SDK | 2.8.0 | Cross-platform SDK | 41.69 MB | Older compatibility fallback | Archive |
| JUCE to AAX DSP Example Plug-In | 5.4.1 | Example project | 236 KB | JUCE-to-AAX DSP reference | Archive with notes |
| AAX Plugin Test Plan | January 2024 | Documentation | 664 KB | Validation checklist | Read and convert into GOAT test checklist |

### Phase 2: Mac Developer Tools

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| AAX Developer Tools Beta | 22.9.0.1 | Mac x86_64 | 295.21 MB | Intel Mac AAX tools | Archive if Intel builds are needed |
| AAX Developer Tools Beta | 22.R4.0.1 | Mac arm64 | 191.79 MB | Apple Silicon AAX tools | Archive for current Mac lane |
| AAX Plug-In Page Table Editor | 24.6 | Mac Intel | 82.74 MB | Control-surface page table editing | Archive |
| AAX Plug-In Page Table Editor | 24.6 | Mac Arm | 79.51 MB | Apple Silicon page table editing | Archive |
| DigiShell and AAX Validator | 24.6 | Mac Intel | 309.93 MB | Intel validation shell/tools | Archive |
| DigiShell and AAX Validator | 24.6 | Mac Arm | 298.31 MB | Apple Silicon validation shell/tools | Archive first for current Mac |
| Pro Tools kTrace Capture Tool | v13 | Mac | 135 KB | Trace capture | Archive |

### Phase 3: Windows Validation Lane

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| DigiShell and AAX Validator | 24.6 | Win Intel | 232.72 MB | Windows validator | Archive for PC validation |
| Pro Tools WPR Capture Tool | 0.9 | Win | 603 KB | Windows performance recorder capture | Archive |
| HD Driver | 2024.10 | Win ZIP | 336.91 MB | HD hardware driver | Archive only if matching hardware exists |
| Avid Cloud Client Services | 22.10 | Win ZIP | 51.77 MB | Avid services | Archive if required by dev install |

### Phase 4: Pro Tools Runtime and Dev Builds

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| Pro Tools | 2025.12 | Mac | 6.3 GB | Current production comparison | Archive only if license permits |
| Pro Tools | 2025.12 | Win | 4.29 GB | Windows comparison | Archive only if needed |
| Pro Tools Dev | 2025.12.0 | Mac Arm | 2.29 GB | Current Apple Silicon developer target | Highest priority dev build |
| Pro Tools Dev | 2025.12.0 | Mac Intel | 2.32 GB | Intel developer target | Archive if needed |
| Pro Tools Dev | 2025.12.0 | Win | 2.15 GB | Windows developer target | Archive if PC lane exists |
| Pro Tools Dev | 2026.R1.0.1 Beta | Mac Arm | 2.3 GB | Future beta Apple Silicon | Archive, do not make default |
| Pro Tools Dev | 2026.R1.0.1 Beta | Mac Intel | 2.33 GB | Future beta Intel | Archive |
| Pro Tools Dev | 2026.R1.0.1 Beta | Win | 2.16 GB | Future beta Windows | Archive |

### Phase 5: Driver and Services

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| HD Driver | 2024.10 | Mac DMG | 541.51 MB | Avid HD hardware driver | Install only if hardware needs it |
| Avid Cloud Client Services | 22.10 | Mac DMG | 77.87 MB | Avid cloud/service support | Install only if required |

### Phase 6: Documentation and Demo Material

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| Pro Tools Demo Session Low Roar | Current listed | Cross-platform session | 1.14 GB | Test session/reference | Archive for validation |
| Installation Instructions and User Guides | Current listed | Documentation | unknown | Install and usage docs | Archive/read |
| Evaluation License PDFs | Per section | Documentation | unknown | License terms | Keep with every package |

### Phase 7: Legacy Reference Only

| Package | Version | Platform | Size | Purpose | Action |
|---|---:|---|---:|---|---|
| TDM/RTAS Plug-In SDK | 9.0 | Legacy SDK | 15.36 MB | Legacy reference | Do not use for new AAX builds |
| DigiTraceDecryptor | 12.7.676 | Legacy utility | 165 KB | Trace/reference | Archive only |
| Spot-To-Region Event Documentation | listed | Documentation | 37 KB | Legacy event docs | Archive |
| Avid Crash Reader | 0.2.8 | Mac | 418 KB | Crash triage | Archive |

## CUDA-X Meaning for AGENT-007

CUDA-X is not an AAX dependency by itself. It is the NVIDIA acceleration layer for AI/data/HPC workflows that can support:

- local LLM inference on NVIDIA GPUs,
- TensorRT or TensorRT-LLM experiments,
- vLLM or llama.cpp CUDA builds,
- GPU image/video generation,
- RAG and retrieval services using NVIDIA libraries or microservices,
- future audio ML acceleration if the model/toolchain supports CUDA.

For Pro Tools/AAX plug-ins, CUDA-X should be treated as a separate acceleration research lane unless a specific plug-in design calls for GPU offload. Real-time audio plug-ins must remain deterministic, low-latency, and safe under Pro Tools/AAX constraints.

## Build Matrix to Create Later

| Target | Compiler | Architecture | Pro Tools Build | Validator | Status |
|---|---|---|---|---|---|
| Mac Arm AAX Native | Xcode | arm64 | Pro Tools Dev 2025.12.0 Arm | DigiShell/AAX Validator 24.6 Arm | pending |
| Mac Intel AAX Native | Xcode | x86_64 | Pro Tools Dev 2025.12.0 Intel | DigiShell/AAX Validator 24.6 Intel | pending |
| Windows AAX Native | Visual Studio | x86_64 | Pro Tools Dev 2025.12.0 Win | DigiShell/AAX Validator 24.6 Win | pending |
| CUDA research rig | NVIDIA driver/CUDA toolkit | target GPU | not Pro Tools default | nvidia-smi + CUDA sample | pending |

## Next Verification Checklist

1. Create the `AAX-Developer-Stack` folder layout.
2. Download packages only from the authenticated Avid developer portal or official NVIDIA sites.
3. Compute SHA-256 for every downloaded package.
4. Write `manifests/aax-download-manifest-2026-05-29.csv`.
5. Install only the current platform minimum first: AAX SDK 2.9.0, Mac Arm Dev 2025.12.0, DigiShell/AAX Validator 24.6 Arm, Page Table Editor 24.6 Arm.
6. Build or inspect the JUCE to AAX DSP example.
7. Run AAX Validator and record the exact pass/fail output.
8. For CUDA, verify on the NVIDIA machine only with `nvidia-smi`, CUDA toolkit version, and a real sample or model run.

## GitHub Rule

GitHub can hold only source code, build scripts, manifests, and documentation written by the GOAT team. It must not hold:

- Avid installers,
- AAX SDK archives,
- Pro Tools installers,
- Avid licensed PDFs,
- proprietary sample sessions,
- generated license keys,
- private account credentials.

## Google Drive Rule

Google Drive can hold a private archive folder for licensed downloads if the owner chooses. Recommended folder name:

`GOAT Developer Vault / Avid AAX Pro Tools CUDA Stack / 2026-05-29`

Keep sharing locked down. Do not use public links for licensed SDKs or installers.
