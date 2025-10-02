const updateIcon = (enabled) => {
  const iconPath = enabled ? "icon128.png" : "icon128-gray.png";
  chrome.action.setIcon({ path: iconPath });
};

chrome.storage.local.get(["extensionEnabled"], (result) => {
  const checkbox = document.getElementById("extensionToggle");
  const enabled = result.extensionEnabled !== false;
  checkbox.checked = enabled;
  updateIcon(enabled);
});

document.getElementById("extensionToggle").addEventListener("change", (e) => {
  const enabled = e.target.checked;
  chrome.storage.local.set({ extensionEnabled: enabled });
  updateIcon(enabled);
  console.log("HH Auto Clicker:", enabled ? "✅ Включено" : "❌ Выключено");
});
