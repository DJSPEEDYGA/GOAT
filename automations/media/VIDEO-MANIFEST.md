# Creator Pack — Course Videos (index only)

These are the course/training videos that came with the creator pack. They total
**~565 MB** across 13 files, so the raw `.mp4` binaries are **intentionally NOT
committed to git** (large binaries bloat the repo permanently and this is
third-party course material). They live on the owner's machine and can be added
via Git LFS or an external asset host if you want them tracked — see the note at
the bottom.

| Size | Video |
|------|-------|
| 60M  | 2 - Course Overview |
| 59M  | 6 - What to Expect in This Section |
| 66M  | 8 - What Is an API Client and Server |
| 35M  | 12 - Test Time Compute (TTS) Explained — Thinking Models like Deepseek R1 / OpenAI o3 |
| 43M  | 19 - Updating n8n Locally via Node.js |
| 7.4M | 20 - Testing n8n for Free Without Local Installation |
| 15M  | 22 - Importing, Exporting and Selling Workflows as JSON |
| 43M  | 23 - Automatically Backing Up Airtable Data Locally |
| 73M  | 32 - What to Expect in This Section |
| 59M  | 37 - Automatically Summarizing All New Emails of the Day with LLMs at 7AM |
| 56M  | 51 - What to Expect — Debugging / Controlling n8n from Other Apps with Webhooks |
| 16M  | 61 - Integrating RAG Bots into Websites (HTML / WordPress / Custom CSS / Branding) |
| 33M  | 65 - Optimizing RAG Chatbots — Data Quality, Chunk Size, Overlap, Embeddings |

## To track the actual video files (optional)
```bash
git lfs install
git lfs track "automations/media/*.mp4"
git add .gitattributes
# copy the mp4s into automations/media/ then:
git add automations/media/*.mp4 && git commit -m "Add course videos via LFS"
```
