chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["extensionEnabled"], (result) => {
    const enabled = result.extensionEnabled !== false;
    const iconPath = enabled ? "icon128.png" : "icon128-g.png";
    chrome.action.setIcon({ path: iconPath });
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["extensionEnabled"], (result) => {
    const enabled = result.extensionEnabled !== false;
    const iconPath = enabled ? "icon128.png" : "icon128-g.png";
    chrome.action.setIcon({ path: iconPath });
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.extensionEnabled) {
    const enabled = changes.extensionEnabled.newValue !== false;
    const iconPath = enabled ? "icon128.png" : "icon128-g.png";
    chrome.action.setIcon({ path: iconPath });
  }
});
