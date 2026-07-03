GOAT ROYALTY 8 TB BACKUP VAULT
==============================

Purpose
-------
This folder contains the script used to create dated GOAT Royalty app backups
on the dedicated 8 TB drive mounted as:

  /Volumes/GOAT ROYALTY APP

This is a backup vault, not a live mirror. It creates timestamped snapshots so
old known-good copies are preserved.

Current Status
--------------
The 8 TB drive is currently mounted by macOS as NTFS read-only. The backup
script is ready, but macOS cannot write the snapshot to that drive until it is
mounted writable or reformatted to a Mac-writable format.

Recommended writable formats:

- exFAT if the drive must move between Mac and Windows.
- APFS encrypted if the drive will stay Mac/server-side and needs stronger
  local protection.

Snapshot Layout
---------------
/Volumes/GOAT ROYALTY APP/GOAT_ROYALTY_BACKUP_VAULT/
  README-GOAT-ROYALTY-BACKUP-VAULT.txt
  Tools/
  Snapshots/
    <timestamp>/GOAT-Royalty-Core/
  Manifests/

What The Snapshot Includes
--------------------------
- Shared/Goat Royalty App Ultimate
- goat-royalty-portable-2.0.0
- Super GOAT Royalty app/package files at the USB root
- GOAT/Money Penny security and audit notes from BackupVault

AGENT-007 Companion Backup
----------------------
The 8 TB drive can also hold a separate AGENT-007 backup vault so the GOAT drive
travels with a second AGENT-007 recovery copy:

/Volumes/GOAT ROYALTY APP/AGENT-007_BACKUP_VAULT/
  README-AGENT-007-BACKUP-VAULT.txt
  Tools/
  Snapshots/
    <timestamp>/Original-AGENT-007-Core/
  Manifests/

What The Snapshot Skips
-----------------------
- node_modules
- build/dist cache folders
- AppleDouble metadata files beginning with ._
- git internals

Run When Writable
-----------------
Run:

  Backup GOAT Royalty to 8TB.command

Run AGENT-007 companion backup:

  Backup AGENT-007 Core to GOAT 8TB.command

Run both:

  Backup GOAT and AGENT-007 to 8TB.command

Restore Rule
------------
Restore only from a dated snapshot after identifying what failed. Never copy a
damaged live source over the whole backup vault.
