# Contributing to Chrome Appearance Switcher

Thank you for your interest in contributing to **Chrome Appearance Switcher**!

This project is an open-source Chrome extension paired with a lightweight Native Messaging bridge designed to toggle Chrome's native browser UI in real time.

---

## 🛠️ How You Can Contribute

1. **Reporting Bugs**:
   * Check the existing issues to ensure the bug hasn't already been reported.
   * Provide your OS version (e.g. Windows 11 Build 22631), Chrome version, and exact reproduction steps.

2. **Suggesting Enhancements**:
   * Open a feature request issue with a clear explanation of what problem the enhancement solves.
   * macOS / Linux Native Host companion ports are warmly welcomed!

3. **Submitting Pull Requests**:
   * Fork the repository and create a new feature branch (`git checkout -b feature/awesome-feature`).
   * Adhere to vanilla web standards (no unnecessary build tools or heavy dependencies).
   * Test your changes locally before submitting the PR.
   * Open a PR with a clear description of the changes made.

---

## 🧪 Local Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/chrome-appearance-switcher.git
   cd chrome-appearance-switcher
   ```
2. Register the local native host:
   * Run `host/install_host.bat` once to register the host in Windows Registry.
3. Load unpacked into Google Chrome:
   * Open `chrome://extensions`.
   * Enable **Developer mode**.
   * Click **Load unpacked** and select the repository root folder.
4. Packaging:
   * Run `build_release.bat` to test package generation.

---

## 📜 Code Style Guidelines

- **Vanilla Web**: Keep extension components in pure HTML, CSS, and modern JavaScript.
- **Manifest V3**: Respect Chrome MV3 rules (no inline scripts, adhere to CSP).
- **Security**: Never introduce external remote script execution or unvalidated native messaging inputs.

Thank you for helping make Chrome Appearance Switcher better!
