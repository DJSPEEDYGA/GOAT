#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
#  🐐 GOAT Force — Ubuntu 26.04 USB Flasher
#  Flashes /Volumes/AGENT1/ubuntu-26.04-desktop-amd64.iso
#  to a USB drive you select.
#
#  Usage: bash flash-ubuntu-usb.sh
#  Also works: bash flash-ubuntu-usb.sh /path/to/other.iso
# ════════════════════════════════════════════════════════════
GOLD="\033[1;33m"; GREEN="\033[1;32m"; CYAN="\033[1;36m"
RED="\033[0;31m"; DIM="\033[0;90m"; BOLD="\033[1m"; NC="\033[0m"

ISO="${1:-/Volumes/AGENT1/ubuntu-26.04-desktop-amd64.iso}"

echo -e "${GOLD}════════════════════════════════════════════════${NC}"
echo -e "${GOLD}  🐐 GOAT Force — Ubuntu USB Flasher             ${NC}"
echo -e "${GOLD}════════════════════════════════════════════════${NC}"
echo ""

# ── Check ISO exists ─────────────────────────────────────
if [ ! -f "$ISO" ]; then
  echo -e "${RED}✗  ISO not found: $ISO${NC}"
  echo -e "${DIM}   Is AGENT1 drive mounted? Try: open /Volumes/AGENT1${NC}"
  exit 1
fi
ISO_SIZE=$(du -h "$ISO" | cut -f1)
echo -e "${GREEN}✅ ISO found:${NC} $ISO (${ISO_SIZE})"
echo ""

# ── List external disks ──────────────────────────────────
echo -e "${CYAN}Available disks:${NC}"
echo ""
diskutil list | grep -E "^/dev/disk[0-9]" | while read -r line; do
  DISK=$(echo "$line" | awk '{print $1}')
  INFO=$(diskutil info "$DISK" 2>/dev/null)
  NAME=$(echo "$INFO" | grep "Volume Name"      | awk -F: '{print $2}' | xargs)
  TYPE=$(echo "$INFO" | grep "Protocol"         | awk -F: '{print $2}' | xargs)
  SIZE=$(echo "$INFO" | grep "Disk Size"        | awk -F: '{print $2}' | awk '{print $1,$2}')
  REMV=$(echo "$INFO" | grep "Removable Media"  | awk -F: '{print $2}' | xargs)
  # Highlight external/removable
  if echo "$TYPE" | grep -qiE "USB|Thunderbolt|External"; then
    echo -e "  ${GREEN}${DISK}${NC}  ${BOLD}${NAME:-unnamed}${NC}  ${SIZE}  [${TYPE}]  ${GREEN}← EXTERNAL${NC}"
  elif [ "$DISK" = "/dev/disk0" ] || [ "$DISK" = "/dev/disk1" ] || [ "$DISK" = "/dev/disk2" ]; then
    echo -e "  ${DIM}${DISK}  ${NAME:-internal}  ${SIZE}  [${TYPE}]  ← INTERNAL — DO NOT USE${NC}"
  else
    echo -e "  ${CYAN}${DISK}${NC}  ${NAME:-unnamed}  ${SIZE}  [${TYPE}]"
  fi
done

echo ""
echo -e "${GOLD}Full diskutil list:${NC}"
diskutil list
echo ""

# ── Select target disk ───────────────────────────────────
echo -e "${GOLD}Enter the disk number to flash (e.g. 4 for /dev/disk4):${NC}"
echo -e "${RED}⚠  THIS WILL COMPLETELY ERASE THAT DISK. Be absolutely sure.${NC}"
echo -n "> disk"
read -r DISKNUM

TARGET_DISK="/dev/disk${DISKNUM}"
TARGET_RDISK="/dev/rdisk${DISKNUM}"

# Validate
if ! diskutil info "$TARGET_DISK" &>/dev/null; then
  echo -e "${RED}✗  Disk ${TARGET_DISK} not found. Exiting.${NC}"
  exit 1
fi

TARGET_INFO=$(diskutil info "$TARGET_DISK")
TARGET_NAME=$(echo "$TARGET_INFO" | grep "Volume Name" | awk -F: '{print $2}' | xargs)
TARGET_SIZE=$(echo "$TARGET_INFO" | grep "Disk Size"   | awk -F: '{print $2}' | awk '{print $1,$2}')
TARGET_TYPE=$(echo "$TARGET_INFO" | grep "Protocol"    | awk -F: '{print $2}' | xargs)

echo ""
echo -e "${BOLD}You selected:${NC}"
echo -e "  Disk:   ${TARGET_DISK}"
echo -e "  Name:   ${TARGET_NAME:-unnamed}"
echo -e "  Size:   ${TARGET_SIZE}"
echo -e "  Type:   ${TARGET_TYPE}"
echo -e "  ISO:    $(basename $ISO) (${ISO_SIZE})"
echo ""

# Safety check — refuse to flash internal disks
if echo "$TARGET_TYPE" | grep -qiE "SATA|NVMe|PCIe|Apple"; then
  if ! echo "$TARGET_TYPE" | grep -qiE "USB|Thunderbolt"; then
    echo -e "${RED}✗  SAFETY ABORT: ${TARGET_DISK} appears to be an internal drive (${TARGET_TYPE}).${NC}"
    echo -e "${RED}   Refusing to flash. Unplug internal indicators and try again.${NC}"
    exit 1
  fi
fi

echo -e "${RED}⚠  LAST WARNING: ${TARGET_DISK} (${TARGET_NAME}, ${TARGET_SIZE}) will be ERASED.${NC}"
echo -n "Type YES to continue: "
read -r CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo -e "${DIM}Cancelled.${NC}"
  exit 0
fi

# ── Unmount ──────────────────────────────────────────────
echo ""
echo -e "${CYAN}Unmounting ${TARGET_DISK}...${NC}"
diskutil unmountDisk "$TARGET_DISK"
echo ""

# ── Flash ────────────────────────────────────────────────
echo -e "${GOLD}Flashing — this takes ~5 minutes. Do not unplug.${NC}"
echo -e "${DIM}  sudo dd if=\"$ISO\" of=${TARGET_RDISK} bs=1m status=progress${NC}"
echo ""

START=$(date +%s)
sudo dd if="$ISO" of="$TARGET_RDISK" bs=1m 2>&1 | \
  awk 'BEGIN{ORS=""} /records out/{
    split($0,a," ");
    bytes=a[1]*512;
    printf "\r  Written: %.1f GB", bytes/1073741824;
    fflush()
  } END{print ""}'

EXIT_CODE=${PIPESTATUS[0]}
END=$(date +%s)
ELAPSED=$(( END - START ))
MINS=$(( ELAPSED / 60 ))
SECS=$(( ELAPSED % 60 ))

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Flash complete in ${MINS}m ${SECS}s${NC}"
  echo ""
  # Eject safely
  diskutil eject "$TARGET_DISK" 2>/dev/null && \
    echo -e "${GREEN}✅ Drive ejected safely. Ready to boot.${NC}" || \
    echo -e "${DIM}   Eject manually if needed.${NC}"
  echo ""
  echo -e "${GOLD}════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  NEXT STEPS:                                    ${NC}"
  echo -e "${GOLD}════════════════════════════════════════════════${NC}"
  echo -e "  1. Plug USB into target PC"
  echo -e "  2. Press F12 / F2 / Delete at boot to enter BIOS/boot menu"
  echo -e "  3. Select the USB drive"
  echo -e "  4. Install Ubuntu 26.04"
  echo -e "  5. After install, run:"
  echo -e "     ${CYAN}git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git ~/goat${NC}"
  echo -e "     ${CYAN}cd ~/goat && bash start-goat.sh${NC}"
  echo -e "${GOLD}════════════════════════════════════════════════${NC}"
else
  echo -e "${RED}✗  dd failed (exit $EXIT_CODE). Check sudo password and try again.${NC}"
  echo -e "${DIM}   Also try: sudo diskutil unmountDisk force ${TARGET_DISK}${NC}"
  exit 1
fi
