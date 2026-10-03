# Privacy Policy for Chrome Appearance Switcher

**Last updated:** October 3, 2026

Chrome Appearance Switcher ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains our practices regarding user data and information handling.

---

### 1. Zero Data Collection

Chrome Appearance Switcher **does not collect, transmit, store, track, sell, or share any personal information, browsing history, or analytics data**.

* **No Personal Data**: We do not collect names, email addresses, IP addresses, location data, or device identifiers.
* **No Browsing History**: We do not monitor, log, or transmit the websites you visit or your web activity.
* **No Analytics / Tracking**: We do not use Google Analytics, cookies, tracking pixels, or any third-party telemetry tools.
* **No External Servers**: The extension communicates exclusively with your local computer via local Windows Native Messaging. No data is sent over the Internet.

---

### 2. Local Storage and Data Usage

The extension uses Chrome's client-side local storage API (`chrome.storage.local`) solely for persisting your interface preferences on your device:

* **Theme State**: Saves your preferred appearance mode (`light` or `dark`).
* **Taskbar Sync Setting**: Remembers whether you enabled or disabled synchronization with the Windows Taskbar / Start Menu.

This data remains strictly on your local machine and can be cleared at any time by uninstalling the extension or clearing extension data in `chrome://settings`.

---

### 3. Permissions Explained

Chrome Appearance Switcher requests only the minimum permissions necessary for its single purpose:

* **`nativeMessaging`**: Used solely to send theme change commands to the local companion host script running on your Windows device (`com.appearance.switcher`) to toggle the OS application theme.
* **`storage`**: Used to save your selected theme preference locally.
* **`tabs`**: Used only to open internal shortcut links (such as `chrome://settings/appearance` and `chrome://extensions/shortcuts`) when clicked from the extension popup.

---

### 4. Third-Party Services and Remote Code

* The extension contains **no remote code** (`script-src 'self'`). All scripts, stylesheets, and assets are bundled locally in the extension package in compliance with Chrome Manifest V3 guidelines.
* We do not integrate with third-party advertising, profiling, or data brokerage networks.

---

### 5. Changes to This Privacy Policy

If we ever make updates to this Privacy Policy, the revised version will be published here with an updated revision date.

---

### 6. Contact Us

If you have any questions or feedback regarding this Privacy Policy, please open an issue on our GitHub repository:
* **GitHub Repository:** [https://github.com/tljafar/chrome-appearance-switcher](https://github.com/tljafar/chrome-appearance-switcher)
