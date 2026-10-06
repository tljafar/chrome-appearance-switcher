# Chrome Appearance Switcher - Native Companion Host (Windows)

This directory contains the lightweight Windows Native Messaging host companion for the **Chrome Appearance Switcher** extension.

---

## 💡 Why Is This Companion Needed?

Google Chrome extensions run in an isolated, sandboxed JavaScript environment (Manifest V3). Chrome's security model strictly prohibits extensions from directly modifying the browser's C++ native window frame, tab strip, address bar (omnibox), and toolbar.

However, Google Chrome is engineered to automatically synchronize its window appearance with Windows when Chrome's Appearance mode is set to **"Device"** (Chrome's default setting). 

This companion serves as a secure, local Native Messaging bridge between Chrome and the Windows Theme API:
1. It receives JSON requests from the extension over standard I/O (stdin/stdout).
2. It toggles Windows application theme keys (`AppsUseLightTheme`).
3. It broadcasts the Windows `WM_SETTINGCHANGE` system notification, triggering an immediate UI repaint of Chrome without requiring a browser restart.

---

## 📂 File Manifest

| File | Purpose |
| :--- | :--- |
| **`install_host.bat`** | **1-Click Registry Installer**. Automatically creates `%USERPROFILE%\.chrome-appearance-switcher\`, copies host scripts, and registers `com.appearance.switcher` in `HKCU\Software\Google\Chrome\NativeMessagingHosts`. |
| **`uninstall_host.bat`** | **Clean Uninstaller**. Deletes the registry key and removes installed host files from `%USERPROFILE%\.chrome-appearance-switcher\`. |
| **`host_launcher.bat`** | Process launcher executed directly by Google Chrome via stdio pipes to launch `host.ps1` with bypass execution policy. |
| **`host.ps1`** | Native messaging bridge script. Handles length-prefixed binary JSON frames, reads/writes theme registry values, and sends `WM_SETTINGCHANGE`. |
| **`com.appearance.switcher.json`** | Chrome Native Messaging Host manifest. Defines the host name, path to `host_launcher.bat`, and allowed extension IDs (`allowed_origins`). |

---

## 🚀 Installation Instructions

### Option 1: 1-Click Automated Setup (Recommended)
You do **not** need to manually download or configure these files.
1. Open Google Chrome with the extension installed.
2. Click **Diagnostics** in the extension popup (or the auto-onboarding tab).
3. Click **[ ⚡ 1-Click Setup (.bat) ]**.
4. Run the downloaded `install_companion.bat` once. It embeds your active extension ID and installs automatically.

---

### Option 2: Manual Installation via ZIP / Git Repository

If you downloaded the standalone **`chrome-appearance-switcher-host-v1.0.0.zip`** or cloned the repository:

1. **Extract the ZIP** (if downloaded as a zip) to any permanent folder on your PC.
2. **Double-click `install_host.bat`**:
   - The installer will automatically configure the host files in `%USERPROFILE%\.chrome-appearance-switcher\`.
   - If prompted for an Extension ID:
     - For **unpacked / developer** installs, press **Enter** to accept the default preconfigured ID (`pmemlchnjmekopkkmjbbhfcfbmpbkclo`).
     - For **Chrome Web Store** installs, paste the 32-character ID from `chrome://extensions`.
3. **Verify Installation**:
   - Open Chrome and click the extension icon.
   - Click **Diagnostics** &rarr; **[ Run Full Test ]**.
   - All subsystems should show green checkmarks (`✓`).

---

## 🔍 Verification & Troubleshooting

### 1. Check Windows Registry
The installer writes a registry key pointing to `com.appearance.switcher.json`:
- **Path**: `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.appearance.switcher`
- **Default Value**: Full path to `com.appearance.switcher.json` (e.g. `C:\Users\<Username>\.chrome-appearance-switcher\com.appearance.switcher.json`).

### 2. Verify Extension ID in Manifest
Ensure the extension ID matches `allowed_origins` inside `com.appearance.switcher.json`:
```json
{
  "name": "com.appearance.switcher",
  "description": "Chrome Appearance Switcher Native Host",
  "path": "host_launcher.bat",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://pmemlchnjmekopkkmjbbhfcfbmpbkclo/",
    "chrome-extension://giipkopljmnjmlkecknneemdkobcapnk/"
  ]
}
```

### 3. Verify Chrome Appearance Setting
In Google Chrome, navigate to:
```text
chrome://settings/appearance
```
Ensure that **Mode** is set to **Device** (default). If Chrome is manually pinned to "Light" or "Dark" in Chrome settings, it will ignore Windows OS theme changes.

---

## 🗑️ Uninstallation

To completely remove the native companion:
1. Double-click **`uninstall_host.bat`**.
2. The batch script removes the Chrome registry key and deletes `%USERPROFILE%\.chrome-appearance-switcher\`.

---

## 🔒 Security & Privacy

- **100% Local**: Zero network communication. The companion does not connect to the internet.
- **Minimal Registry Scope**: Only reads and writes `HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize`.
- **Standard Protocol**: Communicates exclusively via Chrome's official [Native Messaging standard I/O protocol](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging).
