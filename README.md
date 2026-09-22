# Chrome Appearance Switcher

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-success.svg)](#)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue.svg)](#)

> Switch the **actual Chrome browser UI** (tabs, toolbar, omnibox, and frame) between **Light** and **Dark** mode directly from an extension popup or global hotkey.

---

## 💡 How It Works & Chrome Architecture

### The Chrome Security Constraint
In Google Chrome (Manifest V3), extensions operate within a sandboxed Javascript environment. Standard extension APIs (`chrome.tabs`, `chrome.storage`, etc.) are prohibited from directly mutating the Chrome application's C++ browser chrome (window frame, tab strip, address bar/omnibox, and toolbar) for security and sandbox isolation.

### The Solution: Native Messaging Hook
Google Chrome's browser UI is designed to automatically match the Operating System's application theme when Chrome's Appearance setting is set to **"Device"** (Chrome's standard default).

This extension provides:
1. **Manifest V3 Extension**: A modern popup interface with animated Sun/Moon toggle switches, live interactive browser preview mockup, and theme status indicator.
2. **Native Messaging Bridge**: A lightweight native host companion that securely synchronizes the application theme in real time (`AppsUseLightTheme`).
3. **Instant Repaint Notification**: Broadcasts the Windows `WM_SETTINGCHANGE` event so Chrome's active window instantly repaints its tabs, toolbar, omnibox, and new-tab page without requiring a browser restart.

---

## 🚀 Quick Start Guide

### Step 1: Register the Native Host (One-time, 10 seconds)
1. Open the project folder and navigate to the **`host/`** directory.
2. Double-click **`install_host.bat`**.
3. It will automatically register the native host in your Windows registry for Chrome.

> *Note:* To remove it in the future, simply run `uninstall_host.bat`.

### Step 2: Load the Extension into Google Chrome
1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in your address bar.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the project directory (or `Chrome-Extension` folder from release package).
6. Pin the **Chrome Appearance Switcher** icon to your Chrome toolbar.

### Step 3: Verify Chrome Setting
1. Click the extension popup and click **Open** next to **Chrome Appearance Settings** (or go to `chrome://settings/appearance`).
2. Ensure the Mode is set to **Device** (default) so Chrome follows the theme changes.

### Step 4: Toggle Theme
- **Option A (Extension Popup)**: Click the extension icon and flip the **Light / Dark switch**.
- **Option B (Keyboard Shortcut)**: Press **`Alt + Shift + D`** anywhere in Chrome to toggle the browser appearance instantly without opening the popup!
  *(To customize the shortcut, go to `chrome://extensions/shortcuts` or click the shortcut badge in the popup).*

---

## 📂 Project Structure

```
chrome-appearance-switcher/
├── manifest.json              # Manifest V3 configuration with fixed extension ID, commands & permissions
├── popup/
│   ├── popup.html             # High-end popup UI with animated slider, browser preview & shortcut badge
│   ├── popup.css              # Custom styling, dark/light theme tokens, glassmorphism, kbd badges
│   └── popup.js               # Event handling, live storage sync, and background communication
├── background/
│   └── background.js          # Service worker handling native messaging, commands & state sync
├── newtab/
│   ├── newtab.html            # Themed new-tab page matching the browser chrome
│   ├── newtab.css             # Dynamic light/dark styling for new tab
│   └── newtab.js              # Clock, search bar, and bidirectional theme sync
├── host/
│   ├── com.appearance.switcher.json # Chrome Native Messaging manifest
│   ├── host.ps1               # Native host script (handles theme toggling & notifications)
│   ├── host_launcher.bat      # Native process launcher
│   ├── install_host.bat       # 1-click Windows registry installer
│   └── uninstall_host.bat     # Clean uninstaller
└── icons/                     # Crisp icons (16px, 32px, 48px, 128px)
```

---

## ✨ Features Included

- **Actual Chrome Browser UI Switching**: Changes tab bar, toolbar background, omnibox address bar, and window frame.
- **Global Keyboard Shortcut (`Alt + Shift + D`)**: Toggle Chrome browser UI instantly from any tab or window.
- **Independent Windows Shell / Taskbar Sync**: Option to toggle ONLY Chrome/Apps or both Chrome and Windows Taskbar & Start Menu.
- **Animated Master Switch**: Fluid transition between Sun and Moon states with haptic-like animations.
- **Live Chrome UI Mockup**: Visual miniature browser inside the popup that reflects real-time UI state.
- **Themed New Tab Override**: Fully functional new-tab page with omnibox search, clock, and theme sync.
- **1-Click Deep Links**: Direct shortcuts to `chrome://settings/appearance` and `chrome://extensions/shortcuts`.
- **Preconfigured Extension ID**: Uses a deterministic RSA public key in `manifest.json` so the Native Messaging host connects reliably on any machine without ID mismatch errors.
- **Client Release Packager (`build_release.bat`)**: 1-click automated build tool producing a ready-to-deliver ZIP package with organized subfolders and client installation guide.

---

## 🗺️ Roadmap & Planned Features

- [x] Windows 10 & 11 Native Messaging theme controller
- [x] Global keyboard shortcut (`Alt + Shift + D`)
- [x] Instant zero-latency popup hydration
- [x] Multi-target release packager & GitHub Actions CI/CD
- [ ] **Auto-Schedule Mode**: Automatic Light/Dark switching based on local sunrise & sunset hours
- [ ] **macOS Companion Bridge**: AppleScript / `defaults write` companion for macOS dark mode toggle
- [ ] **Custom Accent Color Palettes**: User-selectable accent colors for the New Tab page

---

## 🔒 Privacy & Security

- **100% Local Execution**: All operations occur strictly on your machine.
- **Zero Telemetry / Analytics**: No external servers, analytics, tracking, or network requests are made.
- **Minimal Permissions**: Uses only `nativeMessaging`, `storage`, and `tabs`. Zero host permissions or web scraping.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to set up the project locally and submit pull requests.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
