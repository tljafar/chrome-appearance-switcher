// Chrome Appearance Switcher - Head Pre-hydration Script
// Runs before first paint to prevent theme flicker (CSP Compliant external script)
chrome.storage.local.get(["mode"], (data) => {
  if (data && data.mode === "dark") {
    document.documentElement.classList.add("dark-mode");
    if (document.body) {
      document.body.classList.add("dark-mode");
    }
  }
});
