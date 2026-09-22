# Chrome Web Store & Native Companion Deployment Guide

This guide walks you through publishing the **Chrome Appearance Switcher** on the **Chrome Web Store** and hosting the **Native Companion Installer**.

---

## 🏗️ Architecture Overview

| Component | Where It Is Hosted | What It Contains |
| :--- | :--- | :--- |
| **Chrome Extension** | **Chrome Web Store** | Manifest, popup, background service worker, newtab override, content script, icons. |
| **Native Companion** | **GitHub Releases / Your Server** | 1-click Windows installer (`install_host.bat`), PowerShell bridge (`host.ps1`), uninstaller. |

---

## 📦 Step 1: Generate Release Packages

Double-click **`build_release.bat`**. It produces:
1. **`release/chrome-web-store-v1.0.0.zip`** → Upload to Chrome Web Store Developer Console.
2. **`release/native-companion-installer-v1.0.0.zip`** → Upload to GitHub Releases or your web host.

---

## 🚀 Step 2: Publish to Chrome Web Store

### 1. Access Developer Dashboard
* Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
* Log in with your Google account. (If you don't have a developer account yet, pay the one-time $5 Google registration fee).

### 2. Upload the Extension Package
* Click **"New item"** (top right).
* Drag and drop **`release/chrome-web-store-v1.0.0.zip`**.

### 3. Complete Store Listing
* **Name**: Chrome Appearance Switcher
* **Summary**: Instantly toggle Chrome's actual browser UI (tabs, toolbar, omnibox & new tab) between Light and Dark mode.
* **Description**:
  ```text
  Switch the actual Google Chrome browser UI (tabs, toolbar, omnibox, and frame) between Light and Dark mode directly from a popup or with a global keyboard shortcut (Alt+Shift+D).

  ✨ Features:
  - Toggles the actual Chrome browser frame, tabs, toolbar, and omnibox.
  - Global Keyboard Shortcut: Alt + Shift + D.
  - Option to independently synchronize Windows Taskbar and Start Menu.
  - Themed New Tab page with clock, Google search bar, and live theme sync.
  - Optional webpage dark mode injection.

  ⚠️ Note for Windows Users:
  Chrome extensions run in a sandboxed browser environment. To alter the actual OS-drawn browser frame, a lightweight companion script is required. The extension popup includes a 1-click setup guide.
  ```
* **Category**: Productivity / Accessibility
* **Icons & Screenshots**:
  * Upload a 1280x800 or 640x400 screenshot of the popup and new-tab page.

### 4. Privacy Practices Tab (Crucial for Quick Approval)
Google reviewers ask why each permission is required:
* **`nativeMessaging`**:
  * *Justification*: *"Required to communicate with the local native host to synchronize the Windows application theme, allowing Chrome's native window frame, tab strip, and toolbar to reflect user theme selections."*
* **`storage`**:
  * *Justification*: *"Required to save user theme preferences (Light/Dark mode and Windows shell sync preferences)."*
* **`tabs`**:
  * *Justification*: *"Used to open shortcut links to Chrome Appearance settings (chrome://settings/appearance) and extension shortcuts from the popup."*
* **Single Purpose Description**:
  * *"Provides an appearance toggle to switch Chrome's browser UI (tabs, toolbar, omnibox, and frame) between Light and Dark themes."*

---

## 🌐 Step 3: Host the Native Companion Installer

Because Google Chrome Web Store does not host Windows batch/executable files, host the companion archive:

### Option A: GitHub Releases (Recommended - 100% Free & Fast)
1. Create a GitHub repository (e.g., `https://github.com/your-username/chrome-appearance-switcher`).
2. Go to **Releases** → **Draft a new release** (tag: `v1.0.0`).
3. Drag and drop **`release/native-companion-installer-v1.0.0.zip`**.
4. Publish release. You will get a permanent download URL:
   ```text
   https://github.com/your-username/chrome-appearance-switcher/releases/latest/download/native-companion-installer-v1.0.0.zip
   ```
5. Update the URL in `popup/popup.js` (`btnDownloadHost` handler).

### Option B: Self-Host on Your Website / Web Server
Upload `native-companion-installer-v1.0.0.zip` to your public website:
```text
https://yourdomain.com/downloads/native-companion-installer.zip
```

---

## 🔗 Step 4: Link Chrome Web Store Extension ID

When Google approves your extension on the Web Store:
1. Google assigns an official 32-character extension ID (e.g. `abcdefghijklmnopabcdefghijklmnop`).
2. Update `allowed_origins` in `host/com.appearance.switcher.json`:
   ```json
   "allowed_origins": [
     "chrome-extension://pmemlchnjmekopkkmjbbhfcfbmpbkclo/",
     "chrome-extension://YOUR_STORE_EXTENSION_ID/"
   ]
   ```
3. Re-run `build_release.bat`.
4. Anyone who installs your extension from the Chrome Web Store and runs `install_host.bat` will connect with zero configuration!
