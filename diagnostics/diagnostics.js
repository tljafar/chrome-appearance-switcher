// System Diagnostics Controller - Chrome Appearance Switcher
// Pure Vanilla JS, Manifest V3 CSP Compliant

const NATIVE_HOST = "com.appearance.switcher";

document.addEventListener("DOMContentLoaded", () => {
  // UI Elements - Checklist Items
  const itemChrome = document.getElementById("itemChrome");
  const chromeDesc = document.getElementById("chromeDesc");
  const chromeResult = document.getElementById("chromeResult");

  const itemExtension = document.getElementById("itemExtension");
  const extensionDesc = document.getElementById("extensionDesc");
  const extensionResult = document.getElementById("extensionResult");

  const itemNativeHost = document.getElementById("itemNativeHost");
  const nativeHostDesc = document.getElementById("nativeHostDesc");
  const nativeHostResult = document.getElementById("nativeHostResult");

  const itemNativeMessaging = document.getElementById("itemNativeMessaging");
  const nativeMessagingDesc = document.getElementById("nativeMessagingDesc");
  const nativeMessagingResult = document.getElementById("nativeMessagingResult");

  const itemThemeApi = document.getElementById("itemThemeApi");
  const themeApiDesc = document.getElementById("themeApiDesc");
  const themeApiResult = document.getElementById("themeApiResult");

  const itemDeviceMode = document.getElementById("itemDeviceMode");
  const deviceModeDesc = document.getElementById("deviceModeDesc");
  const deviceModeResult = document.getElementById("deviceModeResult");

  // Controls & Badges
  const btnRunTest = document.getElementById("btnRunTest");
  const btnRunTestText = document.getElementById("btnRunTestText");
  const overallStatusBadge = document.getElementById("overallStatusBadge");
  const extVersionBadge = document.getElementById("extVersionBadge");
  if (extVersionBadge && typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) {
    const manifest = chrome.runtime.getManifest();
    if (manifest && manifest.version) {
      extVersionBadge.textContent = `Extension v${manifest.version}`;
    }
  }

  // Remediation Card
  const remediationCard = document.getElementById("remediationCard");
  const remediationTitle = document.getElementById("remediationTitle");
  const remediationMessage = document.getElementById("remediationMessage");
  const remediationTag = document.getElementById("remediationTag");
  const btnReinstallHost = document.getElementById("btnReinstallHost");
  const onboardingCard = document.getElementById("onboardingCard");
  const btnDownloadAutoInstaller = document.getElementById("btnDownloadAutoInstaller");
  const btnOneClickRemediation = document.getElementById("btnOneClickRemediation");
  const btnViewGuide = document.getElementById("btnViewGuide");
  const btnCopyReport = document.getElementById("btnCopyReport");
  const copyReportText = document.getElementById("copyReportText");
  const btnFixChromeSettings = document.getElementById("btnFixChromeSettings");
  const btnCopyInstallCommand = document.getElementById("btnCopyInstallCommand");
  const codeInstallSnippet = document.getElementById("codeInstallSnippet");

  // Telemetry & Logs
  const telemetryApps = document.getElementById("telemetryApps");
  const telemetrySys = document.getElementById("telemetrySys");
  const telemetryLatency = document.getElementById("telemetryLatency");
  const telemetryScheme = document.getElementById("telemetryScheme");
  const rawLogViewer = document.getElementById("rawLogViewer");
  const logTimestamp = document.getElementById("logTimestamp");
  const btnCopyRawLogs = document.getElementById("btnCopyRawLogs");

  // Sandbox Buttons
  const btnTestLight = document.getElementById("btnTestLight");
  const btnTestDark = document.getElementById("btnTestDark");

  // Guide Modal
  const guideModal = document.getElementById("guideModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnModalCloseDone = document.getElementById("btnModalCloseDone");
  const btnOpenChromeShortcuts = document.getElementById("btnOpenChromeShortcuts");

  let isRunningTest = false;
  let lastDiagnosticReport = null;

  // Initialize version badge from manifest
  try {
    const manifest = chrome.runtime.getManifest();
    if (manifest && manifest.version) {
      extVersionBadge.textContent = `Extension v${manifest.version}`;
    }
  } catch (e) {
    // fallback
  }

  // Update item status helper
  function setItemStatus(element, resultEl, status, resultText, descEl, descText) {
    element.setAttribute("data-status", status);
    resultEl.textContent = resultText;
    if (descEl && descText) {
      descEl.textContent = descText;
    }
  }

  // Reset checklist to pending state
  function resetChecklist() {
    setItemStatus(itemChrome, chromeResult, "pending", "Pending", chromeDesc, "Checking browser environment and runtime...");
    setItemStatus(itemExtension, extensionResult, "pending", "Pending", extensionDesc, "Checking Manifest V3 ID and permissions...");
    setItemStatus(itemNativeHost, nativeHostResult, "pending", "Pending", nativeHostDesc, "Checking Windows registry registration...");
    setItemStatus(itemNativeMessaging, nativeMessagingResult, "pending", "Pending", nativeMessagingDesc, "Testing bidirectional IPC ping and latency...");
    setItemStatus(itemThemeApi, themeApiResult, "pending", "Pending", themeApiDesc, "Testing registry access to AppsUseLightTheme...");
    setItemStatus(itemDeviceMode, deviceModeResult, "pending", "Pending", deviceModeDesc, "Verifying Chrome appearance tracks system theme...");

    remediationCard.style.display = "none";
    overallStatusBadge.className = "badge badge-status";
    overallStatusBadge.textContent = "Running Tests...";
  }

  // Diagnostic Test Suite Runner
  async function runDiagnostics() {
    if (isRunningTest) return;
    isRunningTest = true;
    btnRunTest.disabled = true;
    btnRunTestText.textContent = "Testing...";

    resetChecklist();

    const report = {
      timestamp: new Date().toISOString(),
      chrome: {},
      extension: {},
      nativeHost: {},
      nativeMessaging: {},
      themeApi: {},
      deviceMode: {},
      errors: []
    };

    try {
      // 1. Check Chrome Browser
      setItemStatus(itemChrome, chromeResult, "running", "Checking...");
      await delay(120);

      const ua = navigator.userAgent;
      const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
      const chromeVer = chromeMatch ? chromeMatch[1] : "Unknown";
      const isWindows = /Windows NT/.test(ua);
      report.chrome = {
        version: chromeVer,
        isWindows,
        userAgent: ua,
        platform: navigator.platform
      };

      if (chromeMatch && isWindows) {
        setItemStatus(itemChrome, chromeResult, "success", "\u2713 Detected", chromeDesc, `Google Chrome v${chromeVer} on Windows (x64)`);
      } else if (chromeMatch) {
        setItemStatus(itemChrome, chromeResult, "success", "\u2713 Detected", chromeDesc, `Google Chrome v${chromeVer} (${navigator.platform})`);
      } else {
        setItemStatus(itemChrome, chromeResult, "failure", "\u2716 Warning", chromeDesc, "Running on unsupported browser environment");
        report.errors.push("Non-Chrome browser detected.");
      }

      // 2. Check Extension Runtime
      setItemStatus(itemExtension, extensionResult, "running", "Checking...");
      await delay(120);

      const manifest = chrome.runtime.getManifest();
      const extId = chrome.runtime.id;
      report.extension = {
        id: extId,
        version: manifest.version,
        manifestVersion: manifest.manifest_version,
        permissions: manifest.permissions
      };

      if (extId && manifest.manifest_version === 3) {
        setItemStatus(itemExtension, extensionResult, "success", "\u2713 Running", extensionDesc, `Manifest V3 &bull; ID: ${extId.substring(0, 16)}...`);
      } else {
        setItemStatus(itemExtension, extensionResult, "failure", "\u2716 Error", extensionDesc, "Extension runtime invalid or missing permissions");
        report.errors.push("Extension runtime invalid.");
      }

      // 3 & 4. Native Host & Native Messaging Check
      setItemStatus(itemNativeHost, nativeHostResult, "running", "Checking...");
      setItemStatus(itemNativeMessaging, nativeMessagingResult, "running", "Pinging...");

      const pingStart = performance.now();
      const pingResult = await sendNativePing();
      const latencyMs = Math.round(performance.now() - pingStart);

      report.nativeMessaging.latencyMs = latencyMs;
      telemetryLatency.textContent = `${latencyMs} ms`;

      if (pingResult.ok && pingResult.response) {
        // Native Host is Installed and reachable
        report.nativeHost.installed = true;
        report.nativeHost.version = pingResult.response.version || "1.0.1";
        report.nativeMessaging.connected = true;
        report.nativeMessaging.response = pingResult.response;

        setItemStatus(itemNativeHost, nativeHostResult, "success", "\u2713 Installed", nativeHostDesc, "Host registered in HKCU NativeMessagingHosts");
        setItemStatus(itemNativeMessaging, nativeMessagingResult, "success", "\u2713 Connected", nativeMessagingDesc, `IPC Ping roundtrip OK (${latencyMs}ms latency)`);
      } else {
        // Native Host connection failed
        report.nativeHost.installed = false;
        report.nativeMessaging.connected = false;
        report.nativeHost.error = pingResult.error;

        const errMsg = pingResult.error || "Unknown native messaging error";
        report.errors.push(`Native Host connection failed: ${errMsg}`);

        if (errMsg.includes("Specified native messaging host not found")) {
          setItemStatus(itemNativeHost, nativeHostResult, "failure", "\u2716 Not Registered", nativeHostDesc, "Registry key HKCU\\...\\com.appearance.switcher missing");
          setItemStatus(itemNativeMessaging, nativeMessagingResult, "failure", "\u2716 Disconnected", nativeMessagingDesc, "Cannot connect: Host is not registered");
          showRemediation(
            "Native Host \u2716",
            "The native host could not be contacted because it is not registered in the Windows registry. Chrome extensions cannot alter the OS browser frame without this companion.",
            "Run install_host.bat to register the companion host in your registry."
          );
        } else if (errMsg.includes("Access to the specified native messaging host is forbidden")) {
          setItemStatus(itemNativeHost, nativeHostResult, "failure", "\u2716 ID Mismatch", nativeHostDesc, "allowed_origins in host manifest does not match this extension ID");
          setItemStatus(itemNativeMessaging, nativeMessagingResult, "failure", "\u2716 Forbidden", nativeMessagingDesc, "Access forbidden: Extension ID not authorized");
          showRemediation(
            "Native Host \u2716",
            `The host manifest does not authorize extension ID "${extId}". Re-run install_host.bat to update the registration with your current extension ID.`,
            "Run install_host.bat to re-register with your extension ID."
          );
        } else {
          setItemStatus(itemNativeHost, nativeHostResult, "failure", "\u2716 Host Error", nativeHostDesc, errMsg);
          setItemStatus(itemNativeMessaging, nativeMessagingResult, "failure", "\u2716 Disconnected", nativeMessagingDesc, "Process exited or failed to communicate");
          showRemediation(
            "Native Host \u2716",
            `The native host could not be contacted. (Details: ${errMsg})`,
            "Verify PowerShell execution policy or run host\\install_host.bat."
          );
        }

        // Windows Theme API cannot be checked if host is disconnected
        setItemStatus(itemThemeApi, themeApiResult, "failure", "\u2716 Unavailable", themeApiDesc, "Requires connected Native Host");
        setItemStatus(itemDeviceMode, deviceModeResult, "pending", "Skipped", deviceModeDesc, "Requires Windows Theme API");
        finishDiagnostics(report, false);
        return;
      }

      // 5. Windows Theme API Check
      setItemStatus(itemThemeApi, themeApiResult, "running", "Querying Registry...");
      await delay(100);

      const statusResult = await queryHostStatus();
      if (statusResult.ok && statusResult.response) {
        const appsLight = statusResult.response.appsUseLightTheme;
        const sysLight = statusResult.response.systemUsesLightTheme;
        const currentMode = statusResult.response.mode || (appsLight === 1 ? "light" : "dark");

        report.themeApi = {
          available: true,
          appsUseLightTheme: appsLight,
          systemUsesLightTheme: sysLight,
          mode: currentMode
        };

        telemetryApps.textContent = appsLight === 1 ? "1 (Light)" : "0 (Dark)";
        telemetrySys.textContent = sysLight === 1 ? "1 (Light)" : "0 (Dark)";

        setItemStatus(
          itemThemeApi,
          themeApiResult,
          "success",
          "\u2713 Available",
          themeApiDesc,
          `AppsUseLightTheme: ${appsLight} &bull; SystemUsesLightTheme: ${sysLight} (HKCU Personalize OK)`
        );

        // 6. Chrome Device Mode Verification
        setItemStatus(itemDeviceMode, deviceModeResult, "running", "Inspecting...");
        await delay(100);

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const prefersScheme = prefersDark ? "dark" : "light";
        report.deviceMode = {
          prefersDark,
          browserColorScheme: prefersScheme,
          matchesOsTheme: prefersScheme === currentMode
        };

        telemetryScheme.textContent = prefersScheme.toUpperCase();

        if (prefersScheme === currentMode) {
          setItemStatus(
            itemDeviceMode,
            deviceModeResult,
            "success",
            "\u2713 Enabled",
            deviceModeDesc,
            `Chrome matches Windows Theme (${prefersScheme.toUpperCase()}) &bull; Device Mode active`
          );
        } else {
          // Mismatch: OS is Dark, but Chrome is Light (or vice versa).
          // This happens when Chrome Appearance is explicitly locked to Light/Dark instead of "Device"
          setItemStatus(
            itemDeviceMode,
            deviceModeResult,
            "failure",
            "\u2716 Needs Device Mode",
            deviceModeDesc,
            `Chrome is currently '${prefersScheme}', while OS theme is '${currentMode}'. Change Chrome mode to 'Device'.`
          );
          report.errors.push(`Chrome Appearance does not match OS theme. Chrome mode must be set to 'Device'.`);
          showRemediation(
            "Chrome Device Mode \u2716",
            "Chrome's internal appearance is set to a fixed theme rather than 'Device'. To allow the extension to control tabs, toolbar, and omnibox, set Chrome mode to 'Device'.",
            "Open Chrome Appearance Settings and click 'Device'.",
            true
          );
          finishDiagnostics(report, false);
          return;
        }

        finishDiagnostics(report, true);
      } else {
        report.themeApi.available = false;
        report.themeApi.error = statusResult.error;
        report.errors.push(`Windows Theme API query failed: ${statusResult.error}`);

        setItemStatus(itemThemeApi, themeApiResult, "failure", "\u2716 Error", themeApiDesc, statusResult.error || "Failed to query registry");
        setItemStatus(itemDeviceMode, deviceModeResult, "pending", "Skipped", deviceModeDesc, "Dependent test skipped");
        showRemediation(
          "Windows Theme API \u2716",
          "Could not read Windows Personalize theme registry key. Ensure your Windows account has access to HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize.",
          "Check Windows Registry permissions."
        );
        finishDiagnostics(report, false);
      }
    } catch (err) {
      report.errors.push(err.message || String(err));
      finishDiagnostics(report, false);
    }
  }

  function finishDiagnostics(report, allPass) {
    lastDiagnosticReport = report;
    isRunningTest = false;
    btnRunTest.disabled = false;
    btnRunTestText.textContent = "Run Test";

    // Update Overall Badge and Onboarding/Remediation banners
    if (allPass) {
      overallStatusBadge.className = "badge badge-status status-all-pass";
      overallStatusBadge.textContent = "All Subsystems Passed (6/6)";
      if (remediationCard) remediationCard.style.display = "none";
      if (onboardingCard) onboardingCard.style.display = "none";
    } else {
      overallStatusBadge.className = "badge badge-status status-has-fail";
      overallStatusBadge.textContent = "Issue Detected";
      if (onboardingCard) onboardingCard.style.display = "block";
    }

    // Render Logs & Timestamp
    logTimestamp.textContent = `Last Run: ${new Date().toLocaleTimeString()} (${new Date().toLocaleDateString()})`;
    rawLogViewer.textContent = JSON.stringify(report, null, 2);
  }

  // Show Contextual Remediation Card
  function showRemediation(title, message, snippetText, showSettingsBtn = false) {
    remediationTitle.textContent = title;
    remediationMessage.textContent = message;
    if (snippetText) {
      codeInstallSnippet.textContent = snippetText;
    }
    btnFixChromeSettings.style.display = showSettingsBtn ? "inline-flex" : "none";
    remediationCard.style.display = "block";
    remediationCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // IPC Promise Wrappers
  function sendNativePing() {
    return new Promise((resolve) => {
      chrome.runtime.sendNativeMessage(NATIVE_HOST, { action: "ping" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve({ ok: false, error: chrome.runtime.lastError?.message || "No response" });
        } else {
          resolve({ ok: true, response });
        }
      });
    });
  }

  function queryHostStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendNativeMessage(NATIVE_HOST, { action: "get_status" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve({ ok: false, error: chrome.runtime.lastError?.message || "No response" });
        } else {
          resolve({ ok: true, response });
        }
      });
    });
  }

  function setNativeTheme(mode) {
    return new Promise((resolve) => {
      chrome.runtime.sendNativeMessage(NATIVE_HOST, { action: "set_theme", mode: mode, syncSystem: true }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve({ ok: false, error: chrome.runtime.lastError?.message || "No response" });
        } else {
          resolve({ ok: true, response });
        }
      });
    });
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Interactive Theme Sandbox buttons
  btnTestLight.addEventListener("click", async () => {
    btnTestLight.disabled = true;
    btnTestLight.textContent = "Switching...";
    const res = await setNativeTheme("light");
    btnTestLight.disabled = false;
    btnTestLight.textContent = "\u2600\uFE0F Test Light Mode";
    if (res.ok) {
      telemetryApps.textContent = "1 (Light)";
      telemetrySys.textContent = "1 (Light)";
      await delay(200);
      runDiagnostics();
    } else {
      alert(`Error setting light theme: ${res.error}`);
    }
  });

  btnTestDark.addEventListener("click", async () => {
    btnTestDark.disabled = true;
    btnTestDark.textContent = "Switching...";
    const res = await setNativeTheme("dark");
    btnTestDark.disabled = false;
    btnTestDark.textContent = "\uD83C\uDF19 Test Dark Mode";
    if (res.ok) {
      telemetryApps.textContent = "0 (Dark)";
      telemetrySys.textContent = "0 (Dark)";
      await delay(200);
      runDiagnostics();
    } else {
      alert(`Error setting dark theme: ${res.error}`);
    }
  });

  // Action Button Handlers
  btnRunTest.addEventListener("click", () => {
    runDiagnostics();
  });

  // 1-Click Companion Installer Generator
  const HOST_PS1_BASE64 = "IyBDaHJvbWUgQXBwZWFyYW5jZSBTd2l0Y2hlciAtIE5hdGl2ZSBNZXNzYWdpbmcgSG9zdCAoV2luZG93cykKIyBIYW5kbGVzIEpTT04gbWVzc2FnZXMgdmlhIHN0YW5kYXJkIGlucHV0L291dHB1dCB3aXRoIDQtYnl0ZSBwcmVmaXguCgpbQ29uc29sZV06OklucHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4CltDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4Cgokc3RkaW4gPSBbU3lzdGVtLkNvbnNvbGVdOjpPcGVuU3RhbmRhcmRJbnB1dCgpCiRzdGRvdXQgPSBbU3lzdGVtLkNvbnNvbGVdOjpPcGVuU3RhbmRhcmRPdXRwdXQoKQoKIyBDIyBkZWZpbml0aW9uIGZvciBicm9hZGNhc3RpbmcgV01fU0VUVElOR0NIQU5HRSB0byBlbnN1cmUgaW5zdGFudCBVSSByZWFjdGlvbgpBZGQtVHlwZSAtVHlwZURlZmluaXRpb24gQCcKdXNpbmcgU3lzdGVtOwp1c2luZyBTeXN0ZW0uUnVudGltZS5JbnRlcm9wU2VydmljZXM7CgpwdWJsaWMgY2xhc3MgTmF0aXZlVGhlbWVOb3RpZmllciB7CiAgICBbRGxsSW1wb3J0KCJ1c2VyMzIuZGxsIiwgU2V0TGFzdEVycm9yID0gdHJ1ZSwgQ2hhclNldCA9IENoYXJTZXQuQXV0byldCiAgICBwdWJsaWMgc3RhdGljIGV4dGVybiBJbnRQdHIgU2VuZE1lc3NhZ2VUaW1lb3V0KAogICAgICAgIEludFB0ciBoV25kLAogICAgICAgIHVpbnQgTXNnLAogICAgICAgIFVJbnRQdHIgd1BhcmFtLAogICAgICAgIHN0cmluZyBsUGFyYW0sCiAgICAgICAgdWludCBmdUZsYWdzLAogICAgICAgIHVpbnQgdVRpbWVvdXQsCiAgICAgICAgb3V0IFVJbnRQdHIgbHBkd1Jlc3VsdCk7Cn0KJ0AKCmZ1bmN0aW9uIE5vdGlmeS1UaGVtZUNoYW5nZSB7CiAgICB0cnkgewogICAgICAgICRyZXN1bHQgPSBbVUludFB0cl06Olplcm8KICAgICAgICAjIEhXTkRfQlJPQURDQVNUID0gMHhmZmZmLCBXTV9TRVRUSU5HQ0hBTkdFID0gMHgwMDFBLCBTTVRPX0FCT1JUSUZIVU5HID0gMgogICAgICAgIFt2b2lkXVtOYXRpdmVUaGVtZU5vdGlmaWVyXTo6U2VuZE1lc3NhZ2VUaW1lb3V0KFtJbnRQdHJdMHhmZmZmLCAweDAwMUEsIFtVSW50UHRyXTo6WmVybywgIkltbWVyc2l2ZUNvbG9yU2V0IiwgMiwgMjAwLCBbcmVmXSRyZXN1bHQpCiAgICB9IGNhdGNoIHsKICAgICAgICAjIEZhbGxiYWNrIHdpdGhvdXQgZmFpbGluZwogICAgfQp9CgpmdW5jdGlvbiBTZW5kLU5hdGl2ZVJlc3BvbnNlKFtoYXNodGFibGVdJGRhdGEpIHsKICAgICRqc29uID0gKCRkYXRhIHwgQ29udmVydFRvLUpzb24gLUNvbXByZXNzKQogICAgJGJ5dGVzID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGOC5HZXRCeXRlcygkanNvbikKICAgICRsZW5CeXRlcyA9IFtTeXN0ZW0uQml0Q29udmVydGVyXTo6R2V0Qnl0ZXMoW2ludF0kYnl0ZXMuTGVuZ3RoKQoKICAgIFt2b2lkXSRzdGRvdXQuV3JpdGUoJGxlbkJ5dGVzLCAwLCA0KQogICAgW3ZvaWRdJHN0ZG91dC5Xcml0ZSgkYnl0ZXMsIDAsICRieXRlcy5MZW5ndGgpCiAgICBbdm9pZF0kc3Rkb3V0LkZsdXNoKCkKfQoKJHJlZ0tleSA9ICJIS0NVOlxTb2Z0d2FyZVxNaWNyb3NvZnRcV2luZG93c1xDdXJyZW50VmVyc2lvblxUaGVtZXNcUGVyc29uYWxpemUiCgp3aGlsZSAoJHRydWUpIHsKICAgICRsZW5CeXRlcyA9IE5ldy1PYmplY3QgYnl0ZVtdIDQKICAgICRyZWFkID0gJHN0ZGluLlJlYWQoJGxlbkJ5dGVzLCAwLCA0KQogICAgaWYgKCRyZWFkIC1sdCA0KSB7CiAgICAgICAgIyBFbmQgb2Ygc3RyZWFtIC8gQ2hyb21lIGRpc2Nvbm5lY3RlZAogICAgICAgIGJyZWFrCiAgICB9CgogICAgJG1zZ0xlbiA9IFtTeXN0ZW0uQml0Q29udmVydGVyXTo6VG9JbnQzMigkbGVuQnl0ZXMsIDApCiAgICBpZiAoJG1zZ0xlbiAtbGUgMCAtb3IgJG1zZ0xlbiAtZ3QgMTA0ODU3NikgewogICAgICAgICMgSW52YWxpZCBsZW5ndGgKICAgICAgICBicmVhawogICAgfQoKICAgICRidWZmZXIgPSBOZXctT2JqZWN0IGJ5dGVbXSAkbXNnTGVuCiAgICAkdG90YWxSZWFkID0gMAogICAgd2hpbGUgKCR0b3RhbFJlYWQgLWx0ICRtc2dMZW4pIHsKICAgICAgICAkY2h1bmsgPSAkc3RkaW4uUmVhZCgkYnVmZmVyLCAkdG90YWxSZWFkLCAkbXNnTGVuIC0gJHRvdGFsUmVhZCkKICAgICAgICBpZiAoJGNodW5rIC1sZSAwKSB7IGJyZWFrIH0KICAgICAgICAkdG90YWxSZWFkICs9ICRjaHVuawogICAgfQoKICAgIGlmICgkdG90YWxSZWFkIC1sdCAkbXNnTGVuKSB7CiAgICAgICAgYnJlYWsKICAgIH0KCiAgICAkcmF3VGV4dCA9IFtTeXN0ZW0uVGV4dC5FbmNvZGluZ106OlVURjguR2V0U3RyaW5nKCRidWZmZXIsIDAsICR0b3RhbFJlYWQpCiAgICAKICAgIHRyeSB7CiAgICAgICAgJG1zZyA9ICRyYXdUZXh0IHwgQ29udmVydEZyb20tSnNvbgogICAgICAgICRhY3Rpb24gPSAkbXNnLmFjdGlvbgoKICAgICAgICBpZiAoJGFjdGlvbiAtZXEgInBpbmciKSB7CiAgICAgICAgICAgIFNlbmQtTmF0aXZlUmVzcG9uc2UgQHsKICAgICAgICAgICAgICAgIHN0YXR1cyA9ICJvayIKICAgICAgICAgICAgICAgIHBvbmcgPSAkdHJ1ZQogICAgICAgICAgICAgICAgdmVyc2lvbiA9ICIxLjAuMSIKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBlbHNlaWYgKCRhY3Rpb24gLWVxICJnZXRfc3RhdHVzIikgewogICAgICAgICAgICAkYXBwc0xpZ2h0ID0gMQogICAgICAgICAgICAkc3lzTGlnaHQgPSAxCiAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICAkcHJvcCA9IEdldC1JdGVtUHJvcGVydHkgLVBhdGggJHJlZ0tleSAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZQogICAgICAgICAgICAgICAgaWYgKCRudWxsIC1uZSAkcHJvcC5BcHBzVXNlTGlnaHRUaGVtZSkgeyAkYXBwc0xpZ2h0ID0gW2ludF0kcHJvcC5BcHBzVXNlTGlnaHRUaGVtZSB9CiAgICAgICAgICAgICAgICBpZiAoJG51bGwgLW5lICRwcm9wLlN5c3RlbVVzZXNMaWdodFRoZW1lKSB7ICRzeXNMaWdodCA9IFtpbnRdJHByb3AuU3lzdGVtVXNlc0xpZ2h0VGhlbWUgfQogICAgICAgICAgICB9IGNhdGNoIHt9CgogICAgICAgICAgICAkbW9kZSA9IGlmICgkYXBwc0xpZ2h0IC1lcSAxKSB7ICJsaWdodCIgfSBlbHNlIHsgImRhcmsiIH0KICAgICAgICAgICAgU2VuZC1OYXRpdmVSZXNwb25zZSBAewogICAgICAgICAgICAgICAgc3RhdHVzID0gIm9rIgogICAgICAgICAgICAgICAgbW9kZSA9ICRtb2RlCiAgICAgICAgICAgICAgICBhcHBzVXNlTGlnaHRUaGVtZSA9ICRhcHBzTGlnaHQKICAgICAgICAgICAgICAgIHN5c3RlbVVzZXNMaWdodFRoZW1lID0gJHN5c0xpZ2h0CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgZWxzZWlmICgkYWN0aW9uIC1lcSAic2V0X3RoZW1lIikgewogICAgICAgICAgICAkdGFyZ2V0TW9kZSA9ICRtc2cubW9kZSAjICJsaWdodCIsICJkYXJrIiwgb3IgInRvZ2dsZSIKICAgICAgICAgICAgJGN1cnJlbnRBcHBzID0gMQogICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgJHByb3AgPSBHZXQtSXRlbVByb3BlcnR5IC1QYXRoICRyZWdLZXkgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUKICAgICAgICAgICAgICAgIGlmICgkbnVsbCAtbmUgJHByb3AuQXBwc1VzZUxpZ2h0VGhlbWUpIHsgJGN1cnJlbnRBcHBzID0gW2ludF0kcHJvcC5BcHBzVXNlTGlnaHRUaGVtZSB9CiAgICAgICAgICAgIH0gY2F0Y2gge30KCiAgICAgICAgICAgICRuZXdMaWdodFZhbCA9IDEKICAgICAgICAgICAgaWYgKCR0YXJnZXRNb2RlIC1lcSAidG9nZ2xlIikgewogICAgICAgICAgICAgICAgJG5ld0xpZ2h0VmFsID0gaWYgKCRjdXJyZW50QXBwcyAtZXEgMSkgeyAwIH0gZWxzZSB7IDEgfQogICAgICAgICAgICB9IGVsc2VpZiAoJHRhcmdldE1vZGUgLWVxICJkYXJrIikgewogICAgICAgICAgICAgICAgJG5ld0xpZ2h0VmFsID0gMAogICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgJG5ld0xpZ2h0VmFsID0gMQogICAgICAgICAgICB9CgogICAgICAgICAgICAjIFNldCBBcHBzIHRoZW1lICh0aGlzIGNvbnRyb2xzIENocm9tZSBVSSB0YWJzLCB0b29sYmFyLCBvbW5pYm94KQogICAgICAgICAgICBTZXQtSXRlbVByb3BlcnR5IC1QYXRoICRyZWdLZXkgLU5hbWUgIkFwcHNVc2VMaWdodFRoZW1lIiAtVmFsdWUgJG5ld0xpZ2h0VmFsIC1UeXBlIERXb3JkIC1Gb3JjZQogICAgICAgICAgICAKICAgICAgICAgICAgIyBPcHRpb25hbGx5IHN5bmMgU3lzdGVtIHRoZW1lIGlmIHJlcXVlc3RlZCAoZGVmYXVsdCB0cnVlKQogICAgICAgICAgICBpZiAoJG51bGwgLWVxICRtc2cuc3luY1N5c3RlbSAtb3IgJG1zZy5zeW5jU3lzdGVtIC1lcSAkdHJ1ZSkgewogICAgICAgICAgICAgICAgU2V0LUl0ZW1Qcm9wZXJ0eSAtUGF0aCAkcmVnS2V5IC1OYW1lICJTeXN0ZW1Vc2VzTGlnaHRUaGVtZSIgLVZhbHVlICRuZXdMaWdodFZhbCAtVHlwZSBEV29yZCAtRm9yY2UKICAgICAgICAgICAgfQoKICAgICAgICAgICAgIyBOb3RpZnkgZGVza3RvcCBhcHBsaWNhdGlvbnMgdG8gaW1tZWRpYXRlbHkgcmVwYWludAogICAgICAgICAgICBOb3RpZnktVGhlbWVDaGFuZ2UKCiAgICAgICAgICAgICRmaW5hbE1vZGUgPSBpZiAoJG5ld0xpZ2h0VmFsIC1lcSAxKSB7ICJsaWdodCIgfSBlbHNlIHsgImRhcmsiIH0KICAgICAgICAgICAgJGN1cnJTeXNMaWdodCA9IDEKICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgICRjdXJyU3lzTGlnaHQgPSBbaW50XShHZXQtSXRlbVByb3BlcnR5IC1QYXRoICRyZWdLZXkgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLlN5c3RlbVVzZXNMaWdodFRoZW1lCiAgICAgICAgICAgIH0gY2F0Y2gge30KCiAgICAgICAgICAgIFNlbmQtTmF0aXZlUmVzcG9uc2UgQHsKICAgICAgICAgICAgICAgIHN0YXR1cyA9ICJvayIKICAgICAgICAgICAgICAgIG1vZGUgPSAkZmluYWxNb2RlCiAgICAgICAgICAgICAgICBhcHBzVXNlTGlnaHRUaGVtZSA9ICRuZXdMaWdodFZhbAogICAgICAgICAgICAgICAgc3lzdGVtVXNlc0xpZ2h0VGhlbWUgPSAkY3VyclN5c0xpZ2h0CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgZWxzZSB7CiAgICAgICAgICAgIFNlbmQtTmF0aXZlUmVzcG9uc2UgQHsKICAgICAgICAgICAgICAgIHN0YXR1cyA9ICJlcnJvciIKICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAiVW5rbm93biBhY3Rpb246ICRhY3Rpb24iCiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICB9IGNhdGNoIHsKICAgICAgICBTZW5kLU5hdGl2ZVJlc3BvbnNlIEB7CiAgICAgICAgICAgIHN0YXR1cyA9ICJlcnJvciIKICAgICAgICAgICAgbWVzc2FnZSA9ICRfLkV4Y2VwdGlvbi5NZXNzYWdlCiAgICAgICAgfQogICAgfQp9Cg==";

  function downloadCompanionInstaller() {
    const extId = chrome.runtime.id || "pmemlchnjmekopkkmjbbhfcfbmpbkclo";
    const batContent = `@echo off
setlocal enabledelayedexpansion
title Chrome Appearance Switcher - 1-Click Host Setup
color 0B
echo ========================================================
echo   Chrome Appearance Switcher - 1-Click Host Installer
echo ========================================================
echo.

set "INSTALL_DIR=%USERPROFILE%\\.chrome-appearance-switcher"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [1/3] Setting up companion files in:
echo       %INSTALL_DIR%
echo.

:: 1. Decode host.ps1 from embedded Base64 payload
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$b = '${HOST_PS1_BASE64}'; [System.IO.File]::WriteAllBytes('%INSTALL_DIR%\\host.ps1', [System.Convert]::FromBase64String($b))"

:: 2. Create host_launcher.bat
(
  echo @echo off
  echo powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "%%~dp0host.ps1"
) > "%INSTALL_DIR%\\host_launcher.bat"

:: 3. Create com.appearance.switcher.json
set "LAUNCHER_FILE=%INSTALL_DIR%\\host_launcher.bat"
set "JSON_PATH=!LAUNCHER_FILE:\\=\\\\!"

(
  echo {
  echo   "name": "com.appearance.switcher",
  echo   "description": "Chrome Appearance Switcher Native Host",
  echo   "path": "!JSON_PATH!",
  echo   "type": "stdio",
  echo   "allowed_origins": [
  echo     "chrome-extension://pmemlchnjmekopkkmjbbhfcfbmpbkclo/",
  echo     "chrome-extension://${extId}/"
  echo   ]
  echo }
) > "%INSTALL_DIR%\\com.appearance.switcher.json"

echo [2/3] Registering in Windows Registry for Google Chrome...
REG ADD "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.appearance.switcher" /ve /t REG_SZ /d "%INSTALL_DIR%\\com.appearance.switcher.json" /f >nul
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Failed to write registry key!
  pause
  exit /b 1
)

echo.
echo [3/3] Verification:
REG QUERY "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.appearance.switcher"
echo.
echo ========================================================
echo  [SUCCESS] Native Host registered successfully!
echo  Switch back to Chrome and click [ Run Test ]!
echo ========================================================
echo.
pause
`;

    const blob = new Blob([batContent], { type: "application/x-bat" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install_companion.bat";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Downloaded install_companion.bat!\n\nClick it once in your browser download bar to complete setup in 2 seconds.");
  }

  if (btnDownloadAutoInstaller) {
    btnDownloadAutoInstaller.addEventListener("click", () => {
      downloadCompanionInstaller();
    });
  }

  if (btnOneClickRemediation) {
    btnOneClickRemediation.addEventListener("click", () => {
      downloadCompanionInstaller();
    });
  }

  if (btnReinstallHost) {
    btnReinstallHost.addEventListener("click", () => {
      downloadCompanionInstaller();
    });
  }

  btnViewGuide.addEventListener("click", () => {
    guideModal.style.display = "flex";
  });

  btnCloseModal.addEventListener("click", () => {
    guideModal.style.display = "none";
  });

  btnModalCloseDone.addEventListener("click", () => {
    guideModal.style.display = "none";
  });

  guideModal.addEventListener("click", (e) => {
    if (e.target === guideModal) {
      guideModal.style.display = "none";
    }
  });

  btnFixChromeSettings.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://settings/appearance" });
  });

  btnOpenChromeShortcuts.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });

  btnCopyInstallCommand.addEventListener("click", () => {
    const text = codeInstallSnippet.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btnCopyInstallCommand.textContent = "Copied!";
      setTimeout(() => {
        btnCopyInstallCommand.textContent = "Copy Command";
      }, 2000);
    });
  });

  // Copy Full Diagnostic Report to Clipboard
  btnCopyReport.addEventListener("click", () => {
    if (!lastDiagnosticReport) {
      alert("Please click 'Run Test' first to generate a diagnostic report.");
      return;
    }

    const markdownReport = [
      "### Chrome Appearance Switcher - Diagnostic Report",
      `**Generated:** ${lastDiagnosticReport.timestamp}`,
      "",
      "#### Subsystem Checklist:",
      `- Chrome: ${reportStatusSummary(lastDiagnosticReport.chrome)}`,
      `- Extension: ${reportStatusSummary(lastDiagnosticReport.extension)}`,
      `- Native Host: ${lastDiagnosticReport.nativeHost?.installed ? "\u2713 Installed" : "\u2716 Not Installed"} (${lastDiagnosticReport.nativeHost?.error || "OK"})`,
      `- Native Messaging: ${lastDiagnosticReport.nativeMessaging?.connected ? "\u2713 Connected" : "\u2716 Disconnected"} (Latency: ${lastDiagnosticReport.nativeMessaging?.latencyMs || "-"}ms)`,
      `- Windows Theme API: ${lastDiagnosticReport.themeApi?.available ? "\u2713 Available" : "\u2716 Unavailable"} (AppsUseLightTheme: ${lastDiagnosticReport.themeApi?.appsUseLightTheme})`,
      `- Chrome Device Mode: ${lastDiagnosticReport.deviceMode?.matchesOsTheme ? "\u2713 Matching System" : "\u2716 Mismatched"} (Browser scheme: ${lastDiagnosticReport.deviceMode?.browserColorScheme})`,
      "",
      "#### Raw Telemetry:",
      "```json",
      JSON.stringify(lastDiagnosticReport, null, 2),
      "```"
    ].join("\n");

    navigator.clipboard.writeText(markdownReport).then(() => {
      copyReportText.textContent = "Copied to Clipboard!";
      btnCopyReport.classList.add("btn-primary");
      setTimeout(() => {
        copyReportText.textContent = "Copy Diagnostic Report";
        btnCopyReport.classList.remove("btn-primary");
      }, 2500);
    });
  });

  btnCopyRawLogs.addEventListener("click", () => {
    if (!lastDiagnosticReport) return;
    navigator.clipboard.writeText(JSON.stringify(lastDiagnosticReport, null, 2)).then(() => {
      btnCopyRawLogs.textContent = "Copied!";
      setTimeout(() => {
        btnCopyRawLogs.textContent = "Copy JSON";
      }, 2000);
    });
  });

  function reportStatusSummary(obj) {
    if (!obj) return "N/A";
    if (obj.version) return `\u2713 Detected (v${obj.version})`;
    return "\u2713 OK";
  }

  // Auto-run diagnostics immediately on page open
  runDiagnostics();

  // If launched with ?autoDownload=true, trigger 1-click installer download immediately
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("autoDownload") === "true") {
    setTimeout(() => {
      downloadCompanionInstaller();
    }, 400);
  }
});

