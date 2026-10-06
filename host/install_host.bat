@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo  Chrome Appearance Switcher - Native Host Installer
echo =======================================================
echo.

set "SCRIPT_DIR=%~dp0"
:: Remove trailing backslash if present
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

set "HOST_JSON=%SCRIPT_DIR%\com.appearance.switcher.json"
set "LAUNCHER_BAT=%SCRIPT_DIR%\host_launcher.bat"

:: Escape backslashes for JSON
set "JSON_PATH=%LAUNCHER_BAT:\=\\%"

:: Check if extension ID was passed as argument
set "STORE_ID=%~1"

:: If not passed as argument, check if an ID file exists or prompt optionally
if "%STORE_ID%"=="" (
    if exist "%SCRIPT_DIR%\webstore_id.txt" (
        set /p STORE_ID=<"%SCRIPT_DIR%\webstore_id.txt"
    )
)

echo [1/3] Generating host configuration with absolute path...
(
  echo {
  echo   "name": "com.appearance.switcher",
  echo   "description": "Chrome Appearance Switcher Native Host",
  echo   "path": "!JSON_PATH!",
  echo   "type": "stdio",
  echo   "allowed_origins": [
  echo     "chrome-extension://pmemlchnjmekopkkmjbbhfcfbmpbkclo/",
  echo     "chrome-extension://giipkopljmnjmlkecknneemdkobcapnk/"
  if not "!STORE_ID!"=="" (
    if not "!STORE_ID!"=="giipkopljmnjmlkecknneemdkobcapnk" (
      echo     ,"chrome-extension://!STORE_ID!/"
    )
  )
  echo   ]
  echo }
) > "%HOST_JSON%"

if not "!STORE_ID!"=="" (
  echo       Included Web Store ID: !STORE_ID!
)

echo [2/3] Registering host in Windows Registry for Google Chrome...
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher" /ve /t REG_SZ /d "%HOST_JSON%" /f >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to write registry key!
    pause
    exit /b 1
)

echo [3/3] Testing Native Host registry entry...
REG QUERY "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher"

echo.
echo =======================================================
echo  [SUCCESS] Native Host registered successfully!
echo  Chrome can now communicate with the theme switcher.
echo =======================================================
echo.
pause
