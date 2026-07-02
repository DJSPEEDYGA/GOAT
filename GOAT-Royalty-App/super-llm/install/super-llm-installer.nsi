; Super LLM Windows Installer (NSIS)
; Builds a professional Windows installer for Super LLM

!define APPNAME "Super LLM"
!define APPVERSION "1.0.0"
!define COMPANYNAME "DJSPEEDYGA"
!define DESCRIPTION "215 LLMs in One - Intelligent Model Router"
!define HELPURL "https://github.com/DJSPEEDYGA/super-llm"
!define UPDATEURL "https://github.com/DJSPEEDYGA/super-llm/releases"
!define COPYRIGHT "Copyright (c) 2024 DJSPEEDYGA"

; Modern UI
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

; Installer settings
Name "${APPNAME} ${APPVERSION}"
OutFile "super-llm-setup-${APPVERSION}.exe"
InstallDir "$LOCALAPPDATA\${APPNAME}"
InstallDirRegKey HKCU "Software\${COMPANYNAME}\${APPNAME}" "Install_Dir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 32

; UI Settings
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\welcome.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets\header.bmp"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_NOAUTOCLOSE
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Launch Super LLM"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchApp"
!define MUI_FINISHPAGE_LINK "Visit Super LLM on GitHub"
!define MUI_FINISHPAGE_LINK_LOCATION "${HELPURL}"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

; Version info
VIProductVersion "${APPVERSION}.0"
VIAddVersionKey "ProductName" "${APPNAME}"
VIAddVersionKey "CompanyName" "${COMPANYNAME}"
VIAddVersionKey "LegalCopyright" "${COPYRIGHT}"
VIAddVersionKey "FileDescription" "${DESCRIPTION}"
VIAddVersionKey "FileVersion" "${APPVERSION}"

Section "Install" SecInstall
    SectionIn RO
    
    SetOutPath "$INSTDIR"
    
    ; Create directories
    CreateDirectory "$INSTDIR\core"
    CreateDirectory "$INSTDIR\config"
    CreateDirectory "$INSTDIR\logs"
    CreateDirectory "$INSTDIR\assets"
    
    ; Write core files
    File "core\SuperLLM.js"
    File "super-llm.js"
    File "package.json"
    File "LICENSE"
    File "README.md"
    
    ; Create batch launcher
    FileOpen $0 "$INSTDIR\super-llm.bat" w
    FileWrite $0 '@echo off$\r$\n'
    FileWrite $0 'node "$INSTDIR\super-llm.js" %*$\r$\n'
    FileClose $0
    
    ; Create config file
    FileOpen $0 "$INSTDIR\config\super-llm.json" w
    FileWrite $0 '{$\r$\n'
    FileWrite $0 '  "version": "${APPVERSION}",$\r$\n'
    FileWrite $0 '  "defaultModel": "auto",$\r$\n'
    FileWrite $0 '  "maxRetries": 3$\r$\n'
    FileWrite $0 '}$\r$\n'
    FileClose $0
    
    ; Create environment template
    FileOpen $0 "$INSTDIR\config\.env.example" w
    FileWrite $0 '# NVIDIA Build API Key (required)$\r$\n'
    FileWrite $0 'NVIDIA_BUILD_API_KEY=your-api-key$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '# Optional: OpenAI API Key$\r$\n'
    FileWrite $0 'OPENAI_API_KEY=$\r$\n'
    FileClose $0
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Registry entries
    WriteRegStr HKCU "Software\${COMPANYNAME}\${APPNAME}" "Install_Dir" "$INSTDIR"
    WriteRegStr HKCU "Software\${COMPANYNAME}\${APPNAME}" "Version" "${APPVERSION}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${APPVERSION}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "HelpLink" "${HELPURL}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLUpdateInfo" "${UPDATEURL}"
    
    ; Add to PATH
    EnVar::AddValue "PATH" "$INSTDIR"
    
    ; Create start menu shortcut
    CreateDirectory "$SMPROGRAMS\${APPNAME}"
    CreateShortcut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\super-llm.bat" "" "$INSTDIR\assets\icon.ico"
    CreateShortcut "$SMPROGRAMS\${APPNAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
    
    ; Create desktop shortcut
    CreateShortcut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\super-llm.bat" "" "$INSTDIR\assets\icon.ico"
    
    ; Calculate installed size
    ${GetSize} "$INSTDIR" "/S=0K" $0
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
    ; Remove from PATH
    EnVar::DeleteValue "PATH" "$INSTDIR"
    
    ; Delete files
    RMDir /r "$INSTDIR\core"
    RMDir /r "$INSTDIR\config"
    RMDir /r "$INSTDIR\logs"
    RMDir /r "$INSTDIR\assets"
    Delete "$INSTDIR\super-llm.js"
    Delete "$INSTDIR\super-llm.bat"
    Delete "$INSTDIR\package.json"
    Delete "$INSTDIR\LICENSE"
    Delete "$INSTDIR\README.md"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"
    
    ; Remove shortcuts
    Delete "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk"
    Delete "$SMPROGRAMS\${APPNAME}\Uninstall.lnk"
    RMDir "$SMPROGRAMS\${APPNAME}"
    Delete "$DESKTOP\${APPNAME}.lnk"
    
    ; Remove registry entries
    DeleteRegKey HKCU "Software\${COMPANYNAME}\${APPNAME}"
    DeleteRegKey /ifempty HKCU "Software\${COMPANYNAME}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
SectionEnd

Function LaunchApp
    Exec '"$INSTDIR\super-llm.bat"'
FunctionEnd

Function .onInit
    ; Check for Node.js
    ReadEnvStr $0 "PATH"
    nsExec::ExecToStack 'node --version'
    Pop $0
    Pop $1
    
    ${If} $0 != "0"
        MessageBox MB_YESNO|MB_ICONQUESTION "Node.js is required but not installed.$\n$\nWould you like to download Node.js now?" IDYES download_node
        Abort "Node.js is required to run Super LLM."
    ${EndIf}
    
    Goto done
    
    download_node:
        ExecShell "open" "https://nodejs.org/en/download/"
        Abort "Please install Node.js and run the installer again."
    
    done:
FunctionEnd