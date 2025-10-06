const isCorrectPage = () => {
  const url = window.location.href;
  return url.includes("applicant/resumes");
};

const parseNextAvailableTime = () => {
  const descriptionElement = document.querySelector(
    '[data-qa="title-description"]'
  );
  if (!descriptionElement) return null;

  const text = descriptionElement.textContent;

  const todayMatch = text.match(/сегодня\s+в\s+(\d{1,2}):(\d{2})/i);
  const tomorrowMatch = text.match(/завтра\s+в\s+(\d{1,2}):(\d{2})/i);

  if (todayMatch) {
    const hours = parseInt(todayMatch[1], 10);
    const minutes = parseInt(todayMatch[2], 10);

    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime;
  }

  if (tomorrowMatch) {
    const hours = parseInt(tomorrowMatch[1], 10);
    const minutes = parseInt(tomorrowMatch[2], 10);

    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setDate(targetTime.getDate() + 1);
    targetTime.setHours(hours, minutes, 0, 0);

    return targetTime;
  }

  return null;
};

const clickResumeUpdateButton = () => {
  const button = document.querySelector(
    'button[data-qa*="resume-update-button_actions"]'
  );

  if (!button) {
    console.log("HH Auto Clicker: ❌ Resume update button not found");
    return;
  }

  if (button.hasAttribute("disabled")) {
    console.log("HH Auto Clicker: ⚠️ Button found but disabled");

    const nextTime = parseNextAvailableTime();
    if (nextTime) {
      const now = new Date();
      const delayMinutes = Math.ceil((nextTime - now) / 60000) + 2;

      console.log(
        `HH Auto Clicker: 🕐 Button will be available at ${nextTime.getHours()}:${String(
          nextTime.getMinutes()
        ).padStart(2, "0")}. ` +
          `Timer set to reload page in ${delayMinutes} minutes.`
      );

      chrome.runtime.sendMessage({
        action: "scheduleReload",
        delayMinutes: delayMinutes,
        targetTime: nextTime.toISOString(),
      });
    }

    return;
  }

  console.log("HH Auto Clicker: ✅ Button found and active! Clicking...");
  button.click();
};

if (isCorrectPage()) {
  console.log("HH Auto Clicker: On resume page, waiting for load...");

  setTimeout(() => {
    chrome.storage.local.get(["extensionEnabled"], (result) => {
      if (result.extensionEnabled === false) {
        console.log("HH Auto Clicker: 🔴 Extension disabled");
        return;
      }
      clickResumeUpdateButton();
    });
  }, 3000);
}
