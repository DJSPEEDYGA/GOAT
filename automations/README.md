# GOAT Automations — Creator Pack

Imported automation + AI-agent assets from the creator pack. This folder collects
the reusable, text-based pieces so they live with the projects; large media and
copyrighted course videos are indexed rather than committed.

## Contents

### `n8n-workflows/` — 29 importable n8n workflows
Drop any file into n8n via **Workflows → Import from File**. Grouped by theme:
- **Data / storage:** form-to-airtable, airtable-to-disk, connect-sheets, airtable-to-mail
- **AI / RAG:** sentiment-analyse, load-drive-to-pinecone, rag-bot, mails-to-pinecone, mail-agent-pinecone, send-mails-pinecone, goldsmith-to-pinecone, goldsmith-rag-app, scrape-html-to-markdown
- **Email agents:** easy-mail-automation, email-summary-agent, sponsor-reply
- **Messaging agents:** whatsapp-test-agent, telegram1 (+ sub-search), telegram2, telegram3, telegram-webhook
- **Sub-workflows:** x-posts-twitter, calendar-agent, contact-agent, mails
- **Ops / integrations:** error-workflow-trigger, webhook-flowise-stock-to-sheets, stock-infos-flowise

> Credentials are NOT included — each workflow expects you to reconnect your own
> API keys/credentials inside n8n after import.

### `scripts/` — owner-machine launchers (macOS)
`PULL-CREATOR-PACK.command`, `RESUME-LLM-DOWNLOADS.command`, `START-TRAINING.command`,
`start-oscar.sh`, `sync-core.sh`, `deploy-to-mycloud.sh`.

> These are hardwired to the owner's hardware (e.g. `/Volumes/FKD1/Raspy-Oscar`,
> a local `ollama-darwin` binary, a WD MyCloud NAS). They pull ~28 local LLMs and
> start the local "Oscar" AI server on `http://127.0.0.1:3333`. They run **only on
> the owner's Mac**, not in CI or this repo's server — kept here for reference/versioning.

### `docs/` — prompt + integration references and compliance
- `system-prompt-gpt.txt`, `key-principles-of-prompt-engineering.docx`
- `code-for-whatsapp.txt`, `flowise-custom-tool-1.txt`, `flowise-custom-tool-2.txt`
- `welcome.html`, `important-links.html`
- `eu-ai-act-chatbot-compliance.pdf`, `gdpr-compliance-for-chatbots.pdf`

### `media/` — course videos (index only)
See `media/VIDEO-MANIFEST.md`. ~565 MB of `.mp4` course videos are listed but not
committed (avoids permanent repo bloat + third-party course IP). Add via Git LFS
if you want them tracked.

## Provenance / licensing note
The workflow JSONs, prompt docs, compliance PDFs, and course videos originate from
a third-party AI-automation course. They're stored here for the owner's own use.
Do not redistribute the course videos/PDFs publicly.
