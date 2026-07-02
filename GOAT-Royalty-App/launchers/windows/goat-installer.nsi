; ============================================================
;  GOAT Royalty - Windows Installer (NSIS)
;  Builds GOAT-Royalty-Setup.exe
;  Installs the web app + click launcher, Start Menu & Desktop
;  shortcuts, and a "Set Models Drive" tool so big AI models
;  live on the user's own drive (no re-downloads).
; ============================================================
!define APPNAME "GOAT Royalty"
!define COMPANY "DJ Speedy (Harvey L. Miller Jr.)"
!define VERSION "1.0.0"

Name "${APPNAME}"
OutFile "..\dist\GOAT-Royalty-Setup.exe"
InstallDir "$LOCALAPPDATA\GOAT-Royalty"
RequestExecutionLevel user
Icon "goat.ico"
UninstallIcon "goat.ico"

Page directory
Page instfiles

Section "Install"
  SetOutPath "$INSTDIR"
  File "GOAT-Launcher.bat"
  File "set-models-drive.bat"
  File "goat.ico"
  SetOutPath "$INSTDIR\web-app"
  File /r "..\stage\web-app\*.*"

  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortcut "$SMPROGRAMS\${APPNAME}\GOAT Royalty.lnk" "$INSTDIR\GOAT-Launcher.bat" "" "$INSTDIR\goat.ico"
  CreateShortcut "$SMPROGRAMS\${APPNAME}\Set Models Drive.lnk" "$INSTDIR\set-models-drive.bat" "" "$INSTDIR\goat.ico"
  CreateShortcut "$DESKTOP\GOAT Royalty.lnk" "$INSTDIR\GOAT-Launcher.bat" "" "$INSTDIR\goat.ico"

  WriteUninstaller "$INSTDIR\uninstall.exe"
  CreateShortcut "$SMPROGRAMS\${APPNAME}\Uninstall.lnk" "$INSTDIR\uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GOATRoyalty" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GOATRoyalty" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GOATRoyalty" "DisplayIcon" "$INSTDIR\goat.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GOATRoyalty" "Publisher" "${COMPANY}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GOATRoyalty" "DisplayVersion" "${VERSION}"
SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\${APPNAME}\GOAT Royalty.lnk"
  Delete "$SMPROGRAMS\${APPNAME}\Set Models Drive.lnk"
  Delete "$SMPROGRAMS\${APPNAME}\Uninstall.lnk"
  RMDir "$SMPROGRAMS\${APPNAME}"
  Delete "$DESKTOP\GOAT Royalty.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GOATRoyalty"
SectionEnd
