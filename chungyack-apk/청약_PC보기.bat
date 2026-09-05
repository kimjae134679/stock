@echo off
setlocal
title ChungYack PC
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-pc.ps1"
if errorlevel 1 (
  echo.
  echo [ERROR] Could not start ChungYack PC. See the message above.
  pause
)
endlocal
