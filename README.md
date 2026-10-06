# Chrome Appearance Switcher

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available%20Now-brightgreen.svg?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/chrome-appearance-switche/giipkopljmnjmlkecknneemdkobcapnk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-success.svg)](#)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue.svg)](#)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20Local%20%7C%20Zero%20Telemetry-green.svg)](#)

> Switch the **actual Google Chrome browser UI** (window frame, tabs, toolbar, omnibox, and new tab) between **Light** and **Dark** mode directly from an extension popup, global hotkey (`Alt + Shift + D`), or automated diagnostics suite.

🛒 **[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/chrome-appearance-switche/giipkopljmnjmlkecknneemdkobcapnk)**

---

## 💡 How It Works & Architecture

### The Chrome Sandbox Constraint
In Google Chrome (Manifest V3), extensions operate inside an isolated JavaScript sandbox. Chrome's core security model strictly prohibits standard web extension APIs (`chrome.tabs`, `chrome.storage`, `chrome.theme`, etc.) from directly modifying the browser's C++ native application chrome (top window frame, tab strip, address bar/omnibox, and bookmarks toolbar).

### The Solution: Native Messaging & OS Theme Sync
When Chrome's appearance setting is configured to **"Device"** (Chrome's default setting), Chrome automatically synchronizes its browser frame with the host Operating System's application theme.

**Chrome Appearance Switcher bridges this capability seamlessly:**
1. **Manifest V3 Extension**: A modern glassmorphic popup interface with animated Sun/Moon toggle switch, live browser preview mockup, global hotkey listener, and a 6-subsystem automated diagnostics suite.
2. **Native Messaging Bridge**: A lightweight native host companion that securely synchronizes the Windows application theme in real time (`AppsUseLightTheme`).
3. **Instant System Repaint (`WM_SETTINGCHANGE`)**: Broadcasts the Windows `WM_SETTINGCHANGE` system notification (0x001A), prompting Chrome's active window to immediately repaint tabs, address bar, and toolbar without restarting the browser.

---

## 🚀 Installation & Quick Start

Choose the setup method that works best for you:

### Option 1: ⚡ 1-Click Automated Setup (Fastest & Zero ZIP Extraction)
*Recommended for most users.*

1. Install or load the extension in Google Chrome.
2. The **System Diagnostics & Setup** page will open automatically upon installation (or click **Diagnostics** in the extension popup anytime).
3. If the companion is not yet connected, click **[ ⚡ 1-Click Setup (.bat) ]** (or **[ ⚡ Download 1-Click Installer ]**).
4. Chrome will download `install_companion.bat`. This file is dynamically generated with your active Extension ID embedded.
5. Click `install_companion.bat` in your browser download bar once:
   - It automatically creates `%USERPROFILE%\.chrome-appearance-switcher\`.
   - It registers the native messaging host into Windows Registry (`HKCU\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher`).
   - Setup completes in ~2 seconds.
6. Return to Chrome: the Diagnostics page immediately confirms all 6 subsystems with green checkmarks (`✓`).

---

### Option 2: 🛠️ Manual Installation via Companion ZIP (Offline / Corporate / Advanced)
*Ideal if your browser or network restricts `.bat` downloads, or if you prefer inspecting files before execution.*

1. **Download the Companion ZIP**:
   - In the extension popup or Diagnostics page, click **[ 🛠️ Manual ZIP (GitHub) ]** / **[ Download Companion ZIP ]**.
   - Or download **`chrome-appearance-switcher-host-v1.0.0.zip`** directly from [GitHub Releases](https://github.com/tljafar/chrome-appearance-switcher/releases).
2. **Extract the ZIP**:
   - Right-click the downloaded `.zip` file and extract it to a permanent folder on your PC (or extract into `%USERPROFILE%\.chrome-appearance-switcher`).
3. **Run the Installer**:
   - Double-click **`install_host.bat`**.
   - Both the official Chrome Web Store ID (`giipkopljmnjmlkecknneemdkobcapnk`) and developer unpacked ID are pre-authorized automatically! Simply press any key to complete installation.
4. **Verify Connection**:
   - Open the extension popup in Chrome and click **Diagnostics** &rarr; **[ Run Full Test ]**.

---

### Option 3: 💻 Local Developer Setup (Unpacked Source)
*For contributors and developers modifying the extension source code.*

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tljafar/chrome-appearance-switcher.git
   cd chrome-appearance-switcher
   ```
2. **Register the Native Host**:
   - Double-click **`host/install_host.bat`**.
3. **Load Unpacked into Google Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Turn ON **Developer mode** (top-right toggle).
   - Click **Load unpacked** (top-left) and select the repository root folder.
   - Click the extensions puzzle icon in Chrome's toolbar and **Pin** Chrome Appearance Switcher.

---

## ⌨️ How to Use

- **Popup Switch**: Click the toolbar icon to toggle between Light and Dark mode, see your current theme status, and view the live browser mockup.
- **Global Keyboard Shortcut**: Press **`Alt + Shift + D`** anywhere in Chrome to instantly switch the browser UI without opening any popups or menus. (Customizable at `chrome://extensions/shortcuts`).
- **Windows Shell Sync**: Toggle the *"Also switch Windows Taskbar & Start Menu"* option in the popup to choose whether to switch only Chrome/Apps or the entire Windows desktop shell.
- **System Diagnostics**: Click **Diagnostics** in the popup or right-click the extension icon &rarr; **Options** to verify subsystem health anytime.

---

## 🩺 System Diagnostics Suite

The built-in Diagnostics Suite (`diagnostics/diagnostics.html`) provides enterprise-grade health verification and troubleshooting:

```
┌────────────────────────────────────────────────────────────────────────┐
│  SYSTEM DIAGNOSTICS & VERIFICATION SUITE                               │
├────────────────────────────────────────────────────────────────────────┤
│  [✓] Subsystem 1: Chrome Environment (Version, Platform, Extension ID) │
│  [✓] Subsystem 2: Extension Runtime (Manifest V3 Service Worker)       │
│  [✓] Subsystem 3: Native Host Registration (Registry Manifest Path)    │
│  [✓] Subsystem 4: Native Messaging IPC (Roundtrip Ping & Latency)      │
│  [✓] Subsystem 5: Windows Theme API (AppsUseLightTheme Read/Write)     │
│  [✓] Subsystem 6: Chrome Device Mode (Appearance Setting Check)        │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Diagnostic Features:
- **Automated Health Check**: Runs all 6 subsystem tests with one click and reports exact latency in milliseconds.
- **Contextual Remediation**: When any check fails, the remediation panel presents 1-click automated fix actions and manual ZIP links.
- **Live Theme Sandbox**: Interactive Light and Dark test buttons with live JSON telemetry output to test native host responsiveness in real time.
- **1-Click Diagnostic Report**: Exports an anonymized Markdown report to your clipboard for instant GitHub issue filing.
- **Interactive Installation Guide**: Built-in modal with tabbed step-by-step instructions for both 1-Click setup and manual ZIP installation.

---

## 📂 Project Structure

```
chrome-appearance-switcher/
├── manifest.json              # Manifest V3 configuration with fixed extension ID, commands & permissions
├── popup/
│   ├── popup.html             # Popup UI with animated slider, browser preview & shortcut badge
│   ├── popup.css              # Theme tokens, glassmorphism, responsive styles
│   └── popup.js               # Event handling, live storage sync, background messaging & setup banners
├── diagnostics/
│   ├── diagnostics.html       # 6-subsystem health & verification suite, sandbox & guide modals
│   ├── diagnostics.css        # Diagnostics layout, test cards, status badges & modal styling
│   └── diagnostics.js         # Automated tests, 1-click installer generator, telemetry sandbox
├── background/
│   └── background.js          # Service worker handling native messaging, keyboard shortcuts & first-run onboarding
├── newtab/
│   ├── newtab.html            # Themed new-tab page matching the browser chrome
│   ├── newtab.css             # Dynamic light/dark styling for new tab
│   └── newtab.js              # Clock, search bar, and bidirectional theme sync
├── host/
│   ├── README.md              # Dedicated technical reference for the native companion
│   ├── com.appearance.switcher.json # Chrome Native Messaging manifest
│   ├── host.ps1               # Native PowerShell host script (reads/writes registry, sends WM_SETTINGCHANGE)
│   ├── host_launcher.bat      # Process launcher executed by Chrome via stdio pipes
│   ├── install_host.bat       # 1-click Windows registry installer
│   └── uninstall_host.bat     # Clean companion uninstaller
├── store_assets/              # Chrome Web Store promo graphics (440x280, 1400x560)
├── icons/                     # Crisp icons (16px, 32px, 48px, 128px)
├── build_release.bat          # 1-click multi-package release build runner
├── build_release.ps1          # PowerShell packager producing CWS zip, companion zip, and client zip
├── PRIVACY_POLICY.md          # Google Web Store compliant privacy policy
├── CONTRIBUTING.md            # Developer contribution guidelines
└── CHROME_WEB_STORE_GUIDE.md  # Publisher deployment & upload guide
```

---

## ✨ Features

- **⚡ 1-Click Automated Setup**: Generates and downloads a self-contained setup file directly from the extension—no ZIP extraction or manual folder navigation needed.
- **🚀 Automated First-Run Onboarding**: Auto-launches the diagnostics tab the moment the extension is installed to guide users through setup in 30 seconds.
- **🩺 Automated System Diagnostics Suite**: 6-subsystem verification with 1-click remediation, live telemetry sandbox, and clipboard report export.
- **Actual Chrome Browser UI Switching**: Changes tab bar, toolbar background, omnibox address bar, and window frame.
- **Global Keyboard Shortcut (`Alt + Shift + D`)**: Toggle Chrome browser UI instantly from any tab or window.
- **Independent Windows Shell / Taskbar Sync**: Option to toggle ONLY Chrome/Apps or both Chrome and Windows Taskbar & Start Menu.
- **Animated Master Switch**: Fluid transition between Sun and Moon states with haptic-like animations.
- **Live Chrome UI Mockup**: Visual miniature browser inside the popup that reflects real-time UI state.
- **Themed New Tab Override**: Fully functional new-tab page with omnibox search, clock, and theme sync.
- **1-Click Deep Links**: Direct shortcuts to `chrome://settings/appearance` and `chrome://extensions/shortcuts`.
- **Preconfigured Extension ID**: Uses a deterministic RSA public key in `manifest.json` so the Native Messaging host connects reliably on any machine without ID mismatch errors.
- **Client Release Packager (`build_release.bat`)**: 1-click automated build tool producing ready-to-deliver ZIP packages for Chrome Web Store, standalone companion installer, and all-in-one delivery.

---

## ❓ Troubleshooting & FAQ

### 1. The extension says "Native Host Disconnected"
- Run the **1-Click Setup** from the popup or Diagnostics page.
- Or download the manual companion ZIP and run `install_host.bat`.
- Ensure the registry key exists:
  `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher`
- If you installed from the Chrome Web Store, make sure your Web Store extension ID is listed in `allowed_origins` in `com.appearance.switcher.json`.

### 2. Windows changes theme, but Chrome remains Light or Dark
- Google Chrome must be set to follow the device theme.
- Navigate to `chrome://settings/appearance` in Chrome.
- Verify that **Mode** is set to **"Device"** (not manually locked to "Light" or "Dark").

### 3. Windows SmartScreen or Antivirus Prompt
- When downloading `.bat` files from a browser, Windows SmartScreen may show a warning: *"Windows protected your PC"*.
- This is normal for newly downloaded batch files. Click **"More info"** &rarr; **"Run anyway"**.
- Alternatively, you can use **Option 2 (Manual ZIP)**: extract the ZIP and inspect the plain-text batch and PowerShell scripts yourself before running.

### 4. How do I uninstall the Native Host Companion?
- Run `uninstall_host.bat` from the companion folder or `%USERPROFILE%\.chrome-appearance-switcher\`.
- This removes the Windows registry entry and deletes the local companion directory.

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
