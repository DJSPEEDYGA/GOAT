============================================================
 GOAT ROYALTY — PORTABLE DRIVE EDITION
 DJ Speedy (Harvey L. Miller Jr.) + Waka Flocka Flame
============================================================

Copy this whole GOAT-Portable folder onto any USB / external
drive. The app runs straight off the drive — nothing installed.

HOW TO START
  Windows : double-click  Start-GOAT.bat
  macOS   : double-click  Start-GOAT.command
            (first time: right-click > Open to pass Gatekeeper)
  Linux   : run           ./start-goat.sh

YOUR BIG MODELS DRIVE (never re-download)
  The first launch asks for your Models Drive path — the drive
  where your big AI models live. You can also set it yourself:

  1. Open  models-drive.txt  in this folder
  2. Put the path on the first line, for example:
        Windows:  E:\GOAT-Models
        macOS:    /Volumes/BigDrive/GOAT-Models
        Linux:    /media/you/BigDrive/GOAT-Models
  3. Save. Done — every launcher on this drive now points
     Ollama (OLLAMA_MODELS) and GOAT at that drive, so models
     download once and get reused forever, on any computer.

  Tip: keep models on THIS portable drive by writing the
  drive-relative folder, e.g.  E:\GOAT-Models  on Windows or
  /Volumes/GOAT/GOAT-Models on macOS.

WHAT'S ON HERE
  web-app/            The full GOAT app (launcher, Powerhouse,
                      studio, catalog with real data)
  Start-GOAT.*        Click launchers for each OS
  set-models-drive.*  Change the linked Models Drive any time
  models-drive.txt    The saved Models Drive path (edit freely)

Requires Python 3 on the computer for live catalog stats
(python.org — one-time, tiny install).
