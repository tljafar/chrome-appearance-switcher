# Chrome Appearance Switcher - Multi-Target Release Packager
# Packages:
# 1. Chrome Web Store upload package (.zip)
# 2. Native Companion standalone installer (.zip)
# 3. All-In-One Client Delivery bundle (.zip)

$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Chrome Appearance Switcher - Release Packager" -ForegroundColor Cyan
Write-Host " Targets: Chrome Web Store + Native Companion Host" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Read manifest to extract metadata
$manifestPath = Join-Path $rootDir "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Host "[ERROR] manifest.json not found at $manifestPath" -ForegroundColor Red
    exit 1
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version

Write-Host "[1/5] Parsed extension version: v$version" -ForegroundColor Green

# 2. Setup release directories
$releaseDir = Join-Path $rootDir "release"
$stagingDir = Join-Path $releaseDir "staging"
$extStagingDir = Join-Path $stagingDir "Chrome-Extension"
$hostStagingDir = Join-Path $stagingDir "Native-Host-Installer"

# Target Zip Paths
$allInOneZip = Join-Path $rootDir "Chrome-Appearance-Switcher-v$version.zip"
$webStoreZip = Join-Path $releaseDir "chrome-web-store-v$version.zip"
$companionZip = Join-Path $releaseDir "native-companion-installer-v$version.zip"

# Clean previous build artifacts
if (Test-Path $stagingDir) { Remove-Item -Path $stagingDir -Recurse -Force }
if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null }
if (Test-Path $allInOneZip) { Remove-Item -Path $allInOneZip -Force }
if (Test-Path $webStoreZip) { Remove-Item -Path $webStoreZip -Force }
if (Test-Path $companionZip) { Remove-Item -Path $companionZip -Force }

New-Item -ItemType Directory -Force -Path $extStagingDir | Out-Null
New-Item -ItemType Directory -Force -Path $hostStagingDir | Out-Null

Write-Host "[2/5] Created clean staging directory structure..." -ForegroundColor Green

# 3. Copy Extension Files
Write-Host "[3/5] Packaging extension components..." -ForegroundColor Yellow

Copy-Item (Join-Path $rootDir "manifest.json") $extStagingDir -Force
Copy-Item (Join-Path $rootDir "popup") $extStagingDir -Recurse -Force
Copy-Item (Join-Path $rootDir "background") $extStagingDir -Recurse -Force
Copy-Item (Join-Path $rootDir "newtab") $extStagingDir -Recurse -Force
Copy-Item (Join-Path $rootDir "diagnostics") $extStagingDir -Recurse -Force
Copy-Item (Join-Path $rootDir "icons") $extStagingDir -Recurse -Force

# 4. Copy Native Host Files
Write-Host "[4/5] Packaging native host installer components..." -ForegroundColor Yellow

Copy-Item (Join-Path $rootDir "host\install_host.bat") $hostStagingDir -Force
Copy-Item (Join-Path $rootDir "host\uninstall_host.bat") $hostStagingDir -Force
Copy-Item (Join-Path $rootDir "host\host_launcher.bat") $hostStagingDir -Force
Copy-Item (Join-Path $rootDir "host\host.ps1") $hostStagingDir -Force
Copy-Item (Join-Path $rootDir "host\com.appearance.switcher.json") $hostStagingDir -Force

# Create Client Quick-Start Guide inside the package
$clientGuideContent = @"
# Chrome Appearance Switcher - Client Delivery Package

Thank you for your order! This package contains everything needed to install and run the **Chrome Appearance Switcher**.

---

## 📦 Package Contents

- **`Native-Host-Installer/`**: Contains the 1-click Windows registration script for the native theme bridge.
- **`Chrome-Extension/`**: The clean Google Chrome extension folder ready to load in developer mode.

---

## 🚀 Quick 60-Second Setup Guide

### Step 1: Run the Native Host Installer (One-time setup)
1. Open the folder: **`Native-Host-Installer`**
2. Double-click **`install_host.bat`**.
3. A command prompt will confirm the registry key is created. Press any key to finish.
*(To uninstall in the future, simply run `uninstall_host.bat`)*

### Step 2: Load the Extension into Google Chrome
1. Open Google Chrome.
2. Navigate to:
   ````
   chrome://extensions
   ````
3. Toggle ON **Developer mode** in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the **`Chrome-Extension`** folder from this package.
6. Click the puzzle icon in Chrome's top toolbar and **Pin** the **Chrome Appearance Switcher** icon.

### Step 3: Verify Chrome Appearance Mode
1. In Chrome, visit: `chrome://settings/appearance` (or click "Open" inside the extension popup).
2. Ensure **Mode** is set to **Device** (default).

---

## 🎯 How to Use

- **Option 1 (Extension Popup)**: Click the toolbar icon to view status, toggle Light/Dark, preview the live mockup, or customize options.
- **Option 2 (Global Keyboard Shortcut)**: Press **`Alt + Shift + D`** anywhere in Chrome to instantly switch the browser tabs, toolbar, omnibox, and frame!
- **Option 3 (System Diagnostics)**: Click **Diagnostics** in the extension popup (or right click the extension icon -> **Options**) to verify all 6 subsystems (Chrome, Extension, Native Host, Native Messaging, Windows Theme API, Device Mode) with 1-click remediation.
"@

$clientGuidePath = Join-Path $stagingDir "CLIENT_INSTALLATION_GUIDE.md"
Set-Content -Path $clientGuidePath -Value $clientGuideContent -Encoding UTF8

# Companion-specific README
$companionReadme = @"
# Chrome Appearance Switcher - Native Companion Host (Windows)

This is the lightweight Windows companion required to allow the Chrome extension to switch Chrome's native window frame, tabs, toolbar, and omnibox.

INSTALLATION:
1. Double-click 'install_host.bat'.
2. If you installed the extension from the Chrome Web Store, optionally enter your extension ID when prompted.
3. Open Chrome and click 'Test' in the extension popup.

UNINSTALL:
To remove the registry entry at any time, double-click 'uninstall_host.bat'.
"@
Set-Content -Path (Join-Path $hostStagingDir "README.txt") -Value $companionReadme -Encoding UTF8

# 5. Compress packages
Write-Host "[5/5] Compressing multi-target packages..." -ForegroundColor Yellow

# Target 1: Chrome Web Store Zip (contains root contents of Chrome-Extension)
Compress-Archive -Path "$extStagingDir\*" -DestinationPath $webStoreZip -CompressionLevel Optimal

# Target 2: Standalone Native Companion Installer Zip
Compress-Archive -Path "$hostStagingDir\*" -DestinationPath $companionZip -CompressionLevel Optimal

# Target 3: All-In-One Client Delivery Bundle Zip
Compress-Archive -Path "$stagingDir\*" -DestinationPath $allInOneZip -CompressionLevel Optimal

# Cleanup staging temp folder
Remove-Item -Path $stagingDir -Recurse -Force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " [SUCCESS] All Release Packages Generated!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host " 1. Chrome Web Store Package: (Upload to Chrome Developer Console)" -ForegroundColor Cyan
Write-Host "    $webStoreZip" -ForegroundColor White
Write-Host " 2. Native Companion Installer: (Host on GitHub Releases / Website)" -ForegroundColor Cyan
Write-Host "    $companionZip" -ForegroundColor White
Write-Host " 3. All-In-One Client Bundle: (Direct freelance delivery)" -ForegroundColor Cyan
Write-Host "    $allInOneZip" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
