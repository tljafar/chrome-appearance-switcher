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

  // Remediation Card
  const remediationCard = document.getElementById("remediationCard");
  const remediationTitle = document.getElementById("remediationTitle");
  const remediationMessage = document.getElementById("remediationMessage");
  const remediationTag = document.getElementById("remediationTag");
  const btnReinstallHost = document.getElementById("btnReinstallHost");
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
        setItemStatus(itemChrome, chromeResult, "success", "✓ Detected", chromeDesc, `Google Chrome v${chromeVer} on Windows (x64)`);
      } else if (chromeMatch) {
        setItemStatus(itemChrome, chromeResult, "success", "✓ Detected", chromeDesc, `Google Chrome v${chromeVer} (${navigator.platform})`);
      } else {
        setItemStatus(itemChrome, chromeResult, "failure", "✕ Warning", chromeDesc, "Running on unsupported browser environment");
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
        setItemStatus(itemExtension, extensionResult, "success", "✓ Running", extensionDesc, `Manifest V3 &bull; ID: ${extId.substring(0, 16)}...`);
      } else {
        setItemStatus(itemExtension, extensionResult, "failure", "✕ Error", extensionDesc, "Extension runtime invalid or missing permissions");
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
        report.nativeHost.version = pingResult.response.version || "1.0.0";
        report.nativeMessaging.connected = true;
        report.nativeMessaging.response = pingResult.response;

        setItemStatus(itemNativeHost, nativeHostResult, "success", "✓ Installed", nativeHostDesc, "Host registered in HKCU NativeMessagingHosts");
        setItemStatus(itemNativeMessaging, nativeMessagingResult, "success", "✓ Connected", nativeMessagingDesc, `IPC Ping roundtrip OK (${latencyMs}ms latency)`);
      } else {
        // Native Host connection failed
        report.nativeHost.installed = false;
        report.nativeMessaging.connected = false;
        report.nativeHost.error = pingResult.error;

        const errMsg = pingResult.error || "Unknown native messaging error";
        report.errors.push(`Native Host connection failed: ${errMsg}`);

        if (errMsg.includes("Specified native messaging host not found")) {
          setItemStatus(itemNativeHost, nativeHostResult, "failure", "✕ Not Registered", nativeHostDesc, "Registry key HKCU\\...\\com.appearance.switcher missing");
          setItemStatus(itemNativeMessaging, nativeMessagingResult, "failure", "✕ Disconnected", nativeMessagingDesc, "Cannot connect: Host is not registered");
          showRemediation(
            "Native Host ✕",
            "The native host could not be contacted because it is not registered in the Windows registry. Chrome extensions cannot alter the OS browser frame without this companion.",
            "Run install_host.bat to register the companion host in your registry."
          );
        } else if (errMsg.includes("Access to the specified native messaging host is forbidden")) {
          setItemStatus(itemNativeHost, nativeHostResult, "failure", "✕ ID Mismatch", nativeHostDesc, "allowed_origins in host manifest does not match this extension ID");
          setItemStatus(itemNativeMessaging, nativeMessagingResult, "failure", "✕ Forbidden", nativeMessagingDesc, "Access forbidden: Extension ID not authorized");
          showRemediation(
            "Native Host ✕",
            `The host manifest does not authorize extension ID "${extId}". Re-run install_host.bat to update the registration with your current extension ID.`,
            "Run install_host.bat to re-register with your extension ID."
          );
        } else {
          setItemStatus(itemNativeHost, nativeHostResult, "failure", "✕ Host Error", nativeHostDesc, errMsg);
          setItemStatus(itemNativeMessaging, nativeMessagingResult, "failure", "✕ Disconnected", nativeMessagingDesc, "Process exited or failed to communicate");
          showRemediation(
            "Native Host ✕",
            `The native host could not be contacted. (Details: ${errMsg})`,
            "Verify PowerShell execution policy or run host\\install_host.bat."
          );
        }

        // Windows Theme API cannot be checked if host is disconnected
        setItemStatus(itemThemeApi, themeApiResult, "failure", "✕ Unavailable", themeApiDesc, "Requires connected Native Host");
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
          "✓ Available",
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
            "✓ Enabled",
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
            "✕ Needs Device Mode",
            deviceModeDesc,
            `Chrome is currently '${prefersScheme}', while OS theme is '${currentMode}'. Change Chrome mode to 'Device'.`
          );
          report.errors.push(`Chrome Appearance does not match OS theme. Chrome mode must be set to 'Device'.`);
          showRemediation(
            "Chrome Device Mode ✕",
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

        setItemStatus(itemThemeApi, themeApiResult, "failure", "✕ Error", themeApiDesc, statusResult.error || "Failed to query registry");
        setItemStatus(itemDeviceMode, deviceModeResult, "pending", "Skipped", deviceModeDesc, "Dependent test skipped");
        showRemediation(
          "Windows Theme API ✕",
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

    // Update Overall Badge
    if (allPass) {
      overallStatusBadge.className = "badge badge-status status-all-pass";
      overallStatusBadge.textContent = "All Subsystems Passed (6/6)";
      remediationCard.style.display = "none";
    } else {
      overallStatusBadge.className = "badge badge-status status-has-fail";
      overallStatusBadge.textContent = "Issue Detected";
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
    btnTestLight.textContent = "☀️ Test Light Mode";
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
    btnTestDark.textContent = "🌙 Test Dark Mode";
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

  btnReinstallHost.addEventListener("click", () => {
    // Open guide modal with emphasis on step 2
    guideModal.style.display = "flex";
  });

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
      `- Native Host: ${lastDiagnosticReport.nativeHost?.installed ? "✓ Installed" : "✕ Not Installed"} (${lastDiagnosticReport.nativeHost?.error || "OK"})`,
      `- Native Messaging: ${lastDiagnosticReport.nativeMessaging?.connected ? "✓ Connected" : "✕ Disconnected"} (Latency: ${lastDiagnosticReport.nativeMessaging?.latencyMs || "-"}ms)`,
      `- Windows Theme API: ${lastDiagnosticReport.themeApi?.available ? "✓ Available" : "✕ Unavailable"} (AppsUseLightTheme: ${lastDiagnosticReport.themeApi?.appsUseLightTheme})`,
      `- Chrome Device Mode: ${lastDiagnosticReport.deviceMode?.matchesOsTheme ? "✓ Matching System" : "✕ Mismatched"} (Browser scheme: ${lastDiagnosticReport.deviceMode?.browserColorScheme})`,
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
    if (obj.version) return `✓ Detected (v${obj.version})`;
    return "✓ OK";
  }

  // Auto-run diagnostics immediately on page open
  runDiagnostics();
});
