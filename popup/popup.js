// Chrome Appearance Switcher - Popup Controller
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const btnModeLight = document.getElementById("btnModeLight");
  const btnModeDark = document.getElementById("btnModeDark");
  const statusText = document.getElementById("statusText");
  const hostDot = document.getElementById("hostDot");
  const hostTitle = document.getElementById("hostTitle");
  const hostDesc = document.getElementById("hostDesc");
  const hostInstallBanner = document.getElementById("hostInstallBanner");
  const btnTestBridge = document.getElementById("btnTestBridge");
  const btnOpenChromeSettings = document.getElementById("btnOpenChromeSettings");
  const syncSystemToggle = document.getElementById("syncSystemToggle");

  let isUpdating = false;

  // Render current state to DOM
  function updateUI(mode, connected, syncSystemTheme) {
    const isDark = mode === "dark";

    // Update body theme class
    if (isDark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // Toggle switch state
    themeToggle.checked = isDark;

    // Header & Buttons
    statusText.textContent = isDark ? "Dark Mode" : "Light Mode";
    btnModeLight.classList.toggle("active", !isDark);
    btnModeDark.classList.toggle("active", isDark);

    // Host status
    if (connected) {
      hostDot.className = "host-dot connected";
      hostTitle.textContent = "Native Bridge: Connected";
      hostDesc.textContent = "Controlling Chrome's actual tabs, toolbar, omnibox and window frame.";
      hostInstallBanner.style.display = "none";
    } else {
      hostDot.className = "host-dot";
      hostTitle.textContent = "Native Bridge: Not Connected";
      hostDesc.textContent = "OS hook needed to alter Chrome's actual C++ browser frame & toolbar.";
      hostInstallBanner.style.display = "block";
    }

    if (syncSystemTheme !== undefined && syncSystemToggle) {
      syncSystemToggle.checked = !!syncSystemTheme;
    }
  }

  // 1. Instant hydration directly from local storage (0ms - no waiting)
  chrome.storage.local.get(["mode", "nativeConnected", "syncSystemTheme"], (data) => {
    if (data) {
      updateUI(
        data.mode || "light",
        data.nativeConnected !== undefined ? !!data.nativeConnected : true,
        data.syncSystemTheme !== undefined ? data.syncSystemTheme : true
      );
    }
    // Re-enable CSS animations once initial state is painted
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.remove("no-transitions");
      }, 60);
    });
  });

  // 2. Query background worker for any live updates
  function refreshStatus() {
    chrome.runtime.sendMessage({ action: "GET_STATUS" }, (response) => {
      if (response && !chrome.runtime.lastError) {
        updateUI(response.mode, response.nativeConnected, response.syncSystemTheme);
      }
    });
  }

  // Request theme change
  function applyTheme(targetMode) {
    if (isUpdating) return;
    isUpdating = true;

    // Optimistic UI update
    updateUI(targetMode, hostDot.classList.contains("connected"));

    chrome.runtime.sendMessage({ action: "SET_THEME", mode: targetMode }, (response) => {
      isUpdating = false;
      if (response && response.success) {
        updateUI(response.mode, response.connected);
      } else {
        // Refresh actual state if change could not be fully applied
        refreshStatus();
      }
    });
  }

  // Event Listeners
  themeToggle.addEventListener("change", (e) => {
    const targetMode = e.target.checked ? "dark" : "light";
    applyTheme(targetMode);
  });

  btnModeLight.addEventListener("click", () => {
    applyTheme("light");
  });

  btnModeDark.addEventListener("click", () => {
    applyTheme("dark");
  });

  btnTestBridge.addEventListener("click", () => {
    btnTestBridge.textContent = "...";
    chrome.runtime.sendMessage({ action: "GET_STATUS" }, (response) => {
      btnTestBridge.textContent = "Test";
      if (response && response.nativeConnected) {
        updateUI(response.mode, true);
        alert("Native Bridge is active and communicating with Chrome!");
      } else {
        updateUI(response?.mode || "light", false);
        alert("Native Bridge is not connected yet. Run host\\install_host.bat once to register it.");
      }
    });
  });

  btnOpenChromeSettings.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "OPEN_SETTINGS" });
  });

  const btnOpenShortcuts = document.getElementById("btnOpenShortcuts");
  if (btnOpenShortcuts) {
    btnOpenShortcuts.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "OPEN_SHORTCUTS" });
    });
  }

  const btnDownloadHost = document.getElementById("btnDownloadHost");
  if (btnDownloadHost) {
    btnDownloadHost.addEventListener("click", () => {
      chrome.tabs.create({
        url: "https://github.com/your-username/chrome-appearance-switcher/releases/latest"
      });
    });
  }

  if (syncSystemToggle) {
    syncSystemToggle.addEventListener("change", (e) => {
      chrome.runtime.sendMessage({
        action: "SET_SYNC_SYSTEM",
        enabled: e.target.checked
      });
    });
  }

  // Listen for external updates (e.g. when Alt+Shift+D is pressed while popup is open)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && (changes.mode || changes.nativeConnected || changes.syncSystemTheme)) {
      chrome.storage.local.get(["mode", "nativeConnected", "syncSystemTheme"], (data) => {
        updateUI(
          data.mode || "light",
          !!data.nativeConnected,
          data.syncSystemTheme !== undefined ? data.syncSystemTheme : true
        );
      });
    }
  });

  // Initial load
  refreshStatus();
});
