// Chrome Appearance Switcher - Background Service Worker
const NATIVE_HOST = "com.appearance.switcher";

// State cache
let state = {
  mode: "light",
  nativeConnected: false,
  syncSystemTheme: true
};

// Initialize state from storage and native host
async function init() {
  const stored = await chrome.storage.local.get(["mode", "syncSystemTheme"]);
  if (stored.mode) state.mode = stored.mode;
  if (stored.syncSystemTheme !== undefined) state.syncSystemTheme = stored.syncSystemTheme;

  updateBadge(state.mode);
  queryNativeHost();
}

function updateBadge(mode) {
  const isDark = mode === "dark";
  chrome.action.setBadgeText({ text: isDark ? "DARK" : "LGT" });
  chrome.action.setBadgeBackgroundColor({ color: isDark ? "#1e1b4b" : "#d97706" });
  chrome.action.setTitle({ title: `Chrome Appearance: ${isDark ? "Dark Mode" : "Light Mode"}` });
}

// Check native host status and fetch current OS/browser theme
function queryNativeHost() {
  return new Promise((resolve) => {
    chrome.runtime.sendNativeMessage(NATIVE_HOST, { action: "get_status" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        state.nativeConnected = false;
        chrome.storage.local.set({ nativeConnected: false });
        resolve({ connected: false, error: chrome.runtime.lastError?.message });
      } else {
        state.nativeConnected = true;
        state.mode = response.mode || state.mode;
        chrome.storage.local.set({
          mode: state.mode,
          nativeConnected: true,
          appsUseLightTheme: response.appsUseLightTheme,
          systemUsesLightTheme: response.systemUsesLightTheme
        });
        updateBadge(state.mode);
        resolve({ connected: true, mode: state.mode });
      }
    });
  });
}

// Request theme change through native host
function applyNativeTheme(targetMode) {
  return new Promise((resolve) => {
    chrome.runtime.sendNativeMessage(
      NATIVE_HOST,
      {
        action: "set_theme",
        mode: targetMode,
        syncSystem: state.syncSystemTheme
      },
      (response) => {
        if (chrome.runtime.lastError || !response) {
          state.nativeConnected = false;
          chrome.storage.local.set({ nativeConnected: false });
          resolve({ success: false, connected: false, error: chrome.runtime.lastError?.message });
        } else {
          state.nativeConnected = true;
          state.mode = response.mode || targetMode;
          chrome.storage.local.set({
            mode: state.mode,
            nativeConnected: true,
            appsUseLightTheme: response.appsUseLightTheme,
            systemUsesLightTheme: response.systemUsesLightTheme
          });
          updateBadge(state.mode);
          resolve({ success: true, connected: true, mode: state.mode });
        }
      }
    );
  });
}

// Handle extension lifecycle & messages
chrome.runtime.onInstalled.addListener((details) => {
  init();
  // Automatically open onboarding diagnostics page on first install
  if (details && details.reason === "install") {
    chrome.tabs.create({ url: "diagnostics/diagnostics.html?onboarding=true" });
  }
});

chrome.runtime.onStartup.addListener(() => {
  init();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_STATUS") {
    // 1. Immediately return cached state (0ms) so popup renders instantly
    chrome.storage.local.get(
      ["mode", "nativeConnected", "syncSystemTheme", "systemUsesLightTheme"],
      (data) => {
        sendResponse({
          mode: data.mode || state.mode,
          nativeConnected: data.nativeConnected !== undefined ? data.nativeConnected : state.nativeConnected,
          syncSystemTheme: data.syncSystemTheme !== undefined ? data.syncSystemTheme : true,
          systemUsesLightTheme: data.systemUsesLightTheme
        });

        // 2. Revalidate with native host asynchronously in background
        queryNativeHost();
      }
    );
    return true; // Keep channel open for immediate sendResponse
  }

  if (message.action === "SET_THEME") {
    applyNativeTheme(message.mode).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.action === "OPEN_SETTINGS") {
    chrome.tabs.create({ url: "chrome://settings/appearance" });
    sendResponse({ ok: true });
  }

  if (message.action === "OPEN_SHORTCUTS") {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    sendResponse({ ok: true });
  }

  if (message.action === "SET_SYNC_SYSTEM") {
    state.syncSystemTheme = !!message.enabled;
    chrome.storage.local.set({ syncSystemTheme: state.syncSystemTheme });
    sendResponse({ ok: true, syncSystemTheme: state.syncSystemTheme });
  }
});

// Global Keyboard Shortcut listener (Alt+Shift+D)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-theme") {
    const nextMode = state.mode === "dark" ? "light" : "dark";
    await applyNativeTheme(nextMode);
  }
});
