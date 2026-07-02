AGENT-007 BACKUP VAULT
==================

Purpose
-------
This folder contains the scripts used to seed and maintain AGENT-007's portable
backup vault on the dedicated 2 TB SSD currently mounted as /Volumes/backup.

This is a backup vault, not a RAID mirror. A RAID mirror immediately repeats
deletions and damaged changes. This vault preserves dated recovery copies.

Current Mac Staging Layout
--------------------------
/Volumes/backup/AGENT-007_BACKUP_VAULT/
  README-AGENT-007-BACKUP-VAULT.txt
  Tools/
  Baselines/
    <date>/AGENT-007-Thor-Master-USB-v1/    complete runnable transfer master
  Snapshots/
    <timestamp>/Original-AGENT-007-Core/    current source, memory, launchers, docs
  Manifests/

What The Regular Snapshot Includes
----------------------------------
- Shared/FastChatUI.html
- Shared/chat_server.py
- Shared/chat_data/ including saved AGENT-007 settings and chats
- Shared/agent-007_drafts/
- Launch AGENT-007.command, Launch AGENT-007 on Windows 11.bat and README-AGENT-007-Launcher.txt
- Mac/, Windows/, Linux/, Thor/, Documentation/ and Workspace/

The regular snapshot intentionally does not duplicate model stores. Models
are preserved in the full baseline master package.

Important Safety Notes
----------------------
- Keep FKD1 as the live Original AGENT-007 source unless a tested restore is
  needed.
- Keep the 1TB JUMP master package as a separate recovery copy.
- Do not use this 2 TB backup SSD as a recovery destination for the damaged
  10 TB Money Penny/GOAT source drive.
- Before client distribution, review saved chats and settings for private
  material.
- For the future Jetson/Linux installation, this exFAT portable vault should
  be migrated to an encrypted Linux/server-backed versioned repository with
  restricted permissions and an off-device copy.

Commands On This Mac
--------------------
Run:
  Backup AGENT-007 Core to Vault.command

This makes a new timestamped core/source/memory snapshot without overwriting
prior snapshots.

Run once for the known-good full transfer package:
  Seed Complete AGENT-007 Master to Vault.command

Restore Rule
------------
Restore from a dated snapshot or baseline only after identifying what failed.
Never automatically copy a damaged live source over known-good backups.
