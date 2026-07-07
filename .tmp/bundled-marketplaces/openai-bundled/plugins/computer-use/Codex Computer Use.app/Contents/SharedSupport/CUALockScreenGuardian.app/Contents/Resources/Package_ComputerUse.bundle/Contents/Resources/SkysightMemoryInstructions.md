# Skysight Memory Instructions

Skysight is a memory extension that provides chronological 10-minute and 6-hour summaries of the user's recent activity context, informed by a rolling local event stream process that runs in the background.

When generating phase2 memories, use relevant summaries from the resources folder next to this instructions file as evidence about the user's recent activity. The resources may include development, meetings, communication, planning, research, and operational tasks. Grep over the folder to find material relevant to the memory being consolidated.

Key things to include from Skysight:

- Use `"Important non-obvious context about the user"` sections selectively for the `User Profile` when they provide sufficiently supported, reusable context such as a recurring preference, stable workflow, or repeated collaborator/tool pattern. Do not promote a single observed meeting, trip, app visit, or short-term logistics step into a durable profile fact.
- Include chronological details in `MEMORY.md` only when they materially support an ongoing task, durable decision, meaningful blocker, reusable workflow, or likely follow-up. Prefer a concise task arc over retaining every window-level action.
- Use 10-minute summaries to recover immediate context and 6-hour summaries to recover broader arcs. When both cover the same activity, prefer the higher-level account unless the finer detail is needed for continuity.
- Skysight resources supplement rollout memories with observed activity; they are not automatically more important than other evidence and do not require synthetic entries for incidental activity.

Include the tag `[skysight memory]` after any information derived from this in your summary.

## Folder structure

- resources/*.md
  - Skysight memories: markdown summaries of event streams, broken up into 10 minute/6h chunks. File format: `YYYY-MM-DDTHH-MM-SS-{4_alpha_chars}-10min-{slug_description}.md` or `YYYY-MM-DDTHH-MM-SS-{4_alpha_chars}-6h-{slug_description}.md`.
