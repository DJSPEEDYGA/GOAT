; ============================================================
; NSIS Installer Script — Claude Code for Oscar (Windows)
;
; Prerequisites to BUILD this:
;   1. Install NSIS: https://nsis.sourceforge.io
;   2. Run: makensis installer-oscar.nsi
;
; This packages install-claude-oscar.ps1 into a self-contained
; Windows .exe that users can double-click.
; ============================================================

!define APPNAME    "Claude Code for Oscar"
!define COMPANY    "Oscar AI"
!define VERSION    "1.0.0"
!define SLUG       "claude-code-oscar"

Name "${APPNAME}"
OutFile "Claude-Code-Oscar-Installer.exe"
InstallDir "$LOCALAPPDATA\${SLUG}"
InstallDirRegKey HKCU "Software\${SLUG}" ""
RequestExecutionLevel user    ; no UAC needed (user-scope install)
SetCompressor /SOLID lzma

; Modern UI
!include "MUI2.nsh"
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install" SecInstall
  SetOutPath "$INSTDIR"

  ; Bundle the PowerShell installer script
  File "install-claude-oscar.ps1"

  ; Write uninstaller
  WriteUninstaller "$INSTDIR\Uninstall-Claude-Code-Oscar.exe"

  ; Add to Programs list
  WriteRegStr HKCU \
    "Software\Microsoft\Windows\CurrentVersion\Uninstall\${SLUG}" \
    "DisplayName" "${APPNAME}"
  WriteRegStr HKCU \
    "Software\Microsoft\Windows\CurrentVersion\Uninstall\${SLUG}" \
    "UninstallString" "$INSTDIR\Uninstall-Claude-Code-Oscar.exe"
  WriteRegStr HKCU \
    "Software\Microsoft\Windows\CurrentVersion\Uninstall\${SLUG}" \
    "DisplayVersion" "${VERSION}"

  ; Run the PowerShell installer
  DetailPrint "Running Claude Code installer via PowerShell..."
  ExecWait 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\install-claude-oscar.ps1"' $0

  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION \
      "Installer exited with code $0. Check that PowerShell is available and your internet connection is working."
  ${EndIf}
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\install-claude-oscar.ps1"
  Delete "$INSTDIR\Uninstall-Claude-Code-Oscar.exe"
  RMDir  "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${SLUG}"
  DeleteRegKey HKCU "Software\${SLUG}"
SectionEnd
