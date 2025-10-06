chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["extensionEnabled"], (result) => {
    const enabled = result.extensionEnabled !== false;
    const iconPath = enabled ? "icon128.png" : "icon128-gray.png";
    chrome.action.setIcon({ path: iconPath });
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["extensionEnabled"], (result) => {
    const enabled = result.extensionEnabled !== false;
    const iconPath = enabled ? "icon128.png" : "icon128-gray.png";
    chrome.action.setIcon({ path: iconPath });
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.extensionEnabled) {
    const enabled = changes.extensionEnabled.newValue !== false;
    const iconPath = enabled ? "icon128.png" : "icon128-gray.png";
    chrome.action.setIcon({ path: iconPath });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scheduleReload") {
    schedulePageReload(sender.tab.id, message.delayMinutes, message.targetTime);
  }
});

async function schedulePageReload(tabId, delayMinutes, targetTimeISO) {
  const alarmName = `reload_tab_${tabId}`;

  const existingAlarm = await chrome.alarms.get(alarmName);

  if (existingAlarm) {
    const existingScheduledTime = existingAlarm.scheduledTime;
    const newScheduledTime = Date.now() + delayMinutes * 60 * 1000;

    if (Math.abs(existingScheduledTime - newScheduledTime) < 5 * 60 * 1000) {
      console.log(
        `HH Auto Clicker: ⏰ Alarm already set for tab ${tabId}, time matches`
      );
      return;
    }

    await chrome.alarms.clear(alarmName);
    console.log(`HH Auto Clicker: 🗑️ Removed old alarm for tab ${tabId}`);
  }

  chrome.alarms.create(alarmName, {
    delayInMinutes: delayMinutes,
  });

  await chrome.storage.local.set({
    [`alarm_${alarmName}`]: {
      tabId: tabId,
      targetTime: targetTimeISO,
      scheduledTime: Date.now() + delayMinutes * 60 * 1000,
    },
  });

  const targetDate = new Date(targetTimeISO);
  console.log(
    `HH Auto Clicker: ⏰ Alarm "${alarmName}" set to reload in ${delayMinutes} minutes ` +
      `(target button time: ${targetDate.getHours()}:${String(
        targetDate.getMinutes()
      ).padStart(2, "0")})`
  );
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("reload_tab_")) {
    const storageKey = `alarm_${alarm.name}`;
    const result = await chrome.storage.local.get([storageKey]);
    const alarmData = result[storageKey];

    if (!alarmData) {
      console.log(`HH Auto Clicker: ⚠️ Alarm data "${alarm.name}" not found`);
      return;
    }

    const tabId = alarmData.tabId;

    try {
      const tab = await chrome.tabs.get(tabId);

      if (
        tab.url &&
        (tab.url.includes("hh.ru") || tab.url.includes("hh.kz")) &&
        tab.url.includes("applicant/resumes")
      ) {
        console.log(`HH Auto Clicker: 🔄 Reloading tab ${tabId} (${tab.url})`);
        await chrome.tabs.reload(tabId);
      } else {
        console.log(
          `HH Auto Clicker: ⚠️ Tab ${tabId} no longer on resume page, skipping reload`
        );
      }
    } catch (error) {
      console.log(
        `HH Auto Clicker: ❌ Failed to reload tab ${tabId}:`,
        error.message
      );
    }

    await chrome.storage.local.remove([storageKey]);
  }
});
