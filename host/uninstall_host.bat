@echo off
echo =======================================================
echo  Chrome Appearance Switcher - Native Host Uninstaller
echo =======================================================
echo.

echo Removing registry key from HKCU\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher...
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher" /f >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Native Host unregistered successfully.
) else (
    echo [INFO] Registry key was not present or already removed.
)

echo.
pause
