# GOAT Royalty + AGENT-007 Ubuntu Deploy

This package deploys the current finalized GOAT Royalty app and AGENT-007 private bridge to Ubuntu 24.04.

## Hostinger VPS Targets

Use the KVM 8 server as the main production lane:

- Production: `srv1782156.hstgr.cloud`
- IP: `2.25.68.216`
- Plan: KVM 8
- OS: Ubuntu 24.04 LTS
- Role: GOAT Royalty public app + private AGENT-007 bridge + room for newer deploys

Keep the smaller KVM 2 box as staging/legacy unless you intentionally want to update it:

- Staging/legacy: `srv1148455.hstgr.cloud`
- IP: `72.61.193.184`
- Plan: KVM 2
- OS profile: Ubuntu 24.04 with Docker and Traefik
- Note: Owner dashboard showed this server at about 77% disk usage, so avoid using it for giant model blobs or large media archives.

From the Mac drive, use:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/DEPLOY\ GOAT\ ROYALTY\ +\ AGENT-007\ TO\ UBUNTU.command
```

That launcher builds the latest package, asks which Hostinger VPS to use, uploads with `scp`, and runs the Ubuntu installer over SSH. Passwords are entered only into Terminal/SSH and are not saved by the script.

What goes public:
- `http://SERVER/` serves the GOAT Royalty web app.
- `http://SERVER/goat-apps.html` serves the standalone app launcher.

What stays private:
- `/agent-007/`
- `/api/`
- `/ollama/`
- `/generated-images/`

Those private paths are protected by Nginx Basic Auth. The installer asks for the private username/password at runtime and stores only the hashed password in `/etc/nginx/.goat-agent-007.htpasswd`.

Run on Ubuntu after extracting the package:

```bash
cd /root/goat-deploy/GOAT-Agent-007-Server/server
bash install-on-ubuntu.sh
```

Verify:

```bash
bash /opt/goat-agent-007/server/verify-server.sh
```

Security verify:

```bash
sudo bash /opt/goat-agent-007/server/security-audit.sh
```

From the Mac drive, use:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/GOAT\ SERVER\ SECURITY\ VERIFY.command
```

Expected secure shape:

- Nginx serves public GOAT pages.
- `/agent-007/`, `/api/`, `/ollama/`, and `/generated-images/` are private.
- The Python bridge binds to `127.0.0.1:3333`.
- `/etc/goat-agent-007.env` and `/etc/nginx/.goat-agent-007.htpasswd` are not world-readable.
- UFW or an equivalent host firewall is active with only intentional ports.

Large local model stores are deliberately excluded from this VPS package. Use `/srv/goat-agent-007-models/ollama_data` for server-side models, or point AGENT-007 at Thor/Threadripper for heavy model work.

## Studio Security And Model Verification

On the Mac drive:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/GOAT\ SECURITY\ AUDIT.command
/Volumes/i2i\ 1/Agent-007-GOAT/GOAT\ MAC\ SECURITY\ HARDEN.command
/Volumes/i2i\ 1/Agent-007-GOAT/AGENT-007\ SECURITY\ AND\ LLM\ VERIFY.command
```

Training file for AGENT-007:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/Training-Corpus/AGENT-007-STUDIO-SECURITY-OPS.md
```

The Mac hardening menu is owner-run and does not silently delete launch agents, credentials, or creative files. It can enable firewall/stealth mode, re-enable Gatekeeper, confirm AGENT-007 local-only binding, and print SIP/FileVault steps that need owner action.

## Link Large Storage

For Hostinger block storage, an attached Ubuntu disk, or a WD Cloud/NAS share:

```bash
bash /opt/goat-agent-007/server/link-large-storage.sh
```

Recommended layout:
- `/srv/goat-storage/models/ollama_data` for Ollama models
- `/srv/goat-storage/archives` for large archives
- `/srv/goat-storage/generated-images` for generated media
- `/srv/goat-storage/backups` for backups

For WD Cloud, prefer SMB/NFS over a private network or VPN. Do not expose a WD SMB share directly to the public internet.

## Western Digital Cloud Share

On the studio Mac, the WD Cloud currently appears as:

- Mac mount: `/Volumes/Public`
- SMB source: `SPEEDYSCLOUD`
- Share: `Public`
- Capacity seen on Mac: about `9.9T` total, `2.4T` free

Use the Mac launcher:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/LINK\ WD\ CLOUD\ STORAGE\ TO\ GOAT\ SERVER.command
```

That launcher copies the storage linker to the chosen Hostinger VPS and runs it over SSH.

To create the WD Cloud folder layout from the Mac first, run:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/SETUP\ WD\ CLOUD\ GOAT\ STORAGE.command
```

Recommended server-side WD layout:

- Mount/share root: `/srv/goat-storage`
- Subfolder inside the WD share: `GOAT-Server-Storage`
- Active model path: `/srv/goat-storage/GOAT-Server-Storage/models/ollama_data`
- Archive path: `/srv/goat-storage/GOAT-Server-Storage/archives`
- Generated media path: `/srv/goat-storage/GOAT-Server-Storage/generated-images`

Important: a Hostinger VPS will not normally resolve or reach `SPEEDYSCLOUD._smb._tcp.local` from the public internet. Use a private VPN/private network address, such as Tailscale/WireGuard, then mount something like `//100.x.y.z/Public` or `//speedyscloud.tailnet-name/Public`. Do not port-forward SMB/CIFS to the public internet.

Dashboard checklist:

```bash
/Volumes/i2i\ 1/Agent-007-GOAT/WD-CLOUD-GOAT-DASHBOARD-CHECKLIST.md
```
