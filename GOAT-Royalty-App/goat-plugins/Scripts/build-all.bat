@echo off
REM ================================================================
REM  GOAT Plugin Suite — Build / Validate / Install (Windows)
REM  Run from a "x64 Native Tools Command Prompt for VS 2022"
REM ================================================================

IF "%AAX_SDK_PATH%"=="" SET AAX_SDK_PATH=C:\Audio\AAX_SDK_2.9.0
IF "%JUCE_PATH%"==""    SET JUCE_PATH=%USERPROFILE%\JUCE
IF "%BUILD_TYPE%"=="" SET BUILD_TYPE=Release

SET DIGISHELL="C:\Program Files\Avid\DigiShell\AAXValidator.exe"
SET PLUGINS=GoatSaturator BrickSquad808 WakaVocalChain GoatBus GoatReverb GoatDelay GoatAutoTune BrickSquadKick WakaAdLibFX

ECHO ============================================================
ECHO  GOAT PLUGIN SUITE - WINDOWS BUILD
ECHO  DJ Speedy / GOAT Force / BrickSquad
ECHO ============================================================
ECHO.
ECHO AAX SDK: %AAX_SDK_PATH%
ECHO JUCE:    %JUCE_PATH%
ECHO.

IF NOT EXIST "%AAX_SDK_PATH%" (
    ECHO [!] AAX SDK not found at %AAX_SDK_PATH%
    ECHO     Download from your Avid Developer account and unzip.
    EXIT /B 1
)

IF NOT EXIST "%JUCE_PATH%" (
    ECHO [!] JUCE not found at %JUCE_PATH%
    ECHO     git clone https://github.com/juce-framework/JUCE.git %JUCE_PATH%
    EXIT /B 1
)

CD /D "%~dp0.."
SET ROOT=%CD%

FOR %%P IN (%PLUGINS%) DO (
    ECHO.
    ECHO === Building %%P ===
    CD /D "%ROOT%\%%P"
    IF EXIST build RMDIR /S /Q build
    cmake -B build -G "Visual Studio 17 2022" -A x64 ^
        -DAAX_SDK_PATH="%AAX_SDK_PATH%" ^
        -DJUCE_PATH="%JUCE_PATH%"
    IF ERRORLEVEL 1 EXIT /B 1
    cmake --build build --config %BUILD_TYPE%
    IF ERRORLEVEL 1 EXIT /B 1
)

ECHO.
ECHO ============================================================
ECHO  BUILD COMPLETE
ECHO ============================================================
ECHO  AAX plugins installed to:
ECHO    C:\Program Files\Common Files\Avid\Audio\Plug-Ins\
ECHO  VST3 installed to:
ECHO    C:\Program Files\Common Files\VST3\
ECHO.
ECHO  Restart Pro Tools / Cubase / Studio One to load.
ECHO.
ENDLOCAL