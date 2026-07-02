# Private Vault Reference Map - 2026-06-27

Purpose:
Track the private vault/admin files DJ Speedy attached without exposing their contents in public GOAT app pages, investor decks, localStorage, screenshots, or server deploy artifacts.

## Handling Rule

These files are private reference material.

Do:

- Keep paths, file sizes, timestamps, and SHA-256 hashes for verification.
- Use them to understand role boundaries, vault protocol intent, and private command references.
- Ask for fresh owner approval before copying, uploading, publishing, or embedding any contents.

Do not:

- Print their secret text in chat.
- Put admin keys, passwords, tokens, private call codes, vault protocols, or client-only material into public HTML.
- Add the admin-key file to server deploy packages.
- Store the admin key in browser localStorage.

## Files Inventoried

### 1. AGENT-007 vault protocol

Path:
`/Volumes/i2i 1/Agent-007-GOAT/Deploy/build/AGENT-007-Final-Portable/BackupVault/AGENT-007-Call-Protocols/AGENT-007_VAULT_PROTOCOL_DJ_SPEEDY_RASPY_WAKA_v1_20260526.txt`

Type:
ASCII text

Size:
4,141 bytes

Line/word count:
106 lines, 575 words

Modified:
2026-06-13 22:31:45 EDT

SHA-256:
`dafae1bf8c48f0df5730babee8645db6d17c9ccd32c68e7e09329538e2aede1e`

Private classification:
Private AGENT-007 call/vault protocol. Use as a private reference only.

### 2. GOAT vault protocol / Waka final copy

Path:
`/Volumes/WFHD/USB-Uncensored-LLM-main/AGENT-007-THOR-ONE-FOLDER/AGENT-007/AGENT-007-GOAT/USB-Uncensored-LLM-main/Oscar-Client-Test-USB-v1-leftover-20260604/Copy of GOAT_VAULT_PROTOCOL_WAKA-FINAL_v7_MAY2025.txt`

Type:
UTF-8 text with long lines

Size:
19,736 bytes

Line/word count:
676 lines, 2,855 words

Modified:
2026-06-02 04:39:02 EDT

SHA-256:
`3dd8b03c96946ef5fb3a4652d06ef7a826a3cbf814ef02a7ffa8b5ab10ef4e59`

Private classification:
Private GOAT/Waka vault protocol reference. Use as a private reference only.

### 3. Money Penny admin key / second account

Path:
`/Volumes/WFHD/USB-Uncensored-LLM-main/AGENT-007-THOR-ONE-FOLDER/AGENT-007/AGENT-007-GOAT/USB-Uncensored-LLM-main/Shared/Goat Royalty App Ultimate/drive-download-20260424T072858Z-3-001 (3)/Copy of MONEY PENNY ADMIN KEY 2ND ACCOUNT.txt`

Type:
ASCII text, single-line/no line terminator

Size:
133 bytes

Line/word count:
0 newline-delimited lines, 1 word/token

Modified:
2026-03-03 09:20:24 EST

SHA-256:
`64c2e02d0d61383245761b99366624f64fac752f548d4e2469beed56a21debb1`

Private classification:
Secret-like admin key. Do not print, copy into docs, commit into app code, or deploy to public server. Store only in an owner-approved secure vault/secret manager if runtime use is needed.

## GOAT App Integration Decision

These files should be referenced by private maps and protocols, not by public app UI.

The safe integration is:

- Money Penny remains the LLM boss / GOAT command layer.
- AGENT-007 remains the enforcer/tools holder.
- Vault/admin files stay private.
- Public pages can say "private vault protocol exists" but must not expose contents.

