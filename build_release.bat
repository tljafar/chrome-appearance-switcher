@echo off
setlocal
echo ========================================================
echo  Chrome Appearance Switcher - Client Release Packager
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_release.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Release packaging failed!
    pause
    exit /b %ERRORLEVEL%
)

pause
