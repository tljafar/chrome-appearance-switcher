// Chrome Appearance Switcher - New Tab Controller
document.addEventListener("DOMContentLoaded", () => {
  const timeDisplay = document.getElementById("timeDisplay");
  const dateDisplay = document.getElementById("dateDisplay");
  const greetingDisplay = document.getElementById("greetingDisplay");
  const themeQuickToggle = document.getElementById("themeQuickToggle");
  const pillIcon = document.getElementById("pillIcon");
  const pillText = document.getElementById("pillText");
  const shortcutAppearance = document.getElementById("shortcutAppearance");
  const searchInput = document.getElementById("searchInput");

  let currentMode = "light";

  // Clock & Date updater
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    timeDisplay.textContent = `${hours}:${minutes}`;

    const options = { weekday: "long", month: "long", day: "numeric" };
    dateDisplay.textContent = now.toLocaleDateString(undefined, options);

    const hr = now.getHours();
    if (hr < 12) greetingDisplay.textContent = "Good morning";
    else if (hr < 18) greetingDisplay.textContent = "Good afternoon";
    else greetingDisplay.textContent = "Good evening";
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Apply Theme styling to page
  function applyThemeUI(mode) {
    currentMode = mode;
    const isDark = mode === "dark";
    if (isDark) {
      document.body.classList.add("dark-mode");
      pillIcon.textContent = "🌙";
      pillText.textContent = "Dark Mode";
    } else {
      document.body.classList.remove("dark-mode");
      pillIcon.textContent = "☀️";
      pillText.textContent = "Light Mode";
    }
  }

  // Fetch initial mode from extension storage or background
  chrome.storage.local.get(["mode"], (data) => {
    if (data.mode) {
      applyThemeUI(data.mode);
    } else {
      chrome.runtime.sendMessage({ action: "GET_STATUS" }, (res) => {
        if (res && res.mode) applyThemeUI(res.mode);
      });
    }
  });

  // Listen for storage changes from popup or background
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.mode) {
      applyThemeUI(changes.mode.newValue);
    }
  });

  // Quick toggle button on New Tab
  themeQuickToggle.addEventListener("click", () => {
    const targetMode = currentMode === "dark" ? "light" : "dark";
    applyThemeUI(targetMode);
    chrome.runtime.sendMessage({ action: "SET_THEME", mode: targetMode });
  });

  // Handle appearance shortcut
  shortcutAppearance.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: "OPEN_SETTINGS" });
  });

  // Omnibox URL redirect if user types full URL
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    const query = searchInput.value.trim();
    if (/^https?:\/\//i.test(query) || /^[\w-]+\.[\w.-]+/i.test(query)) {
      e.preventDefault();
      const url = /^https?:\/\//i.test(query) ? query : `https://${query}`;
      window.location.href = url;
    }
  });
});
