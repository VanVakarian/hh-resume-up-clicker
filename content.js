const isCorrectPage = () => {
  const url = window.location.href;
  return url.includes("applicant/resumes");
};

const clickResumeUpdateButton = () => {
  const button = document.querySelector(
    'button[data-qa*="resume-update-button_actions"]'
  );

  if (!button) {
    console.log("HH Auto Clicker: ❌ Кнопка обновления резюме не найдена");
    return;
  }

  if (button.hasAttribute("disabled")) {
    console.log(
      "HH Auto Clicker: ⚠️ Кнопка найдена, но она заблокирована. Нажатие невозможно."
    );
    return;
  }

  console.log("HH Auto Clicker: ✅ Кнопка найдена и активна! Нажимаем...");
  button.click();
};

if (isCorrectPage()) {
  console.log(
    "HH Auto Clicker: Находимся на странице резюме, ждем загрузки..."
  );

  setTimeout(() => {
    chrome.storage.local.get(["extensionEnabled"], (result) => {
      if (result.extensionEnabled === false) {
        console.log("HH Auto Clicker: 🔴 Расширение выключено");
        return;
      }
      clickResumeUpdateButton();
    });
  }, 3000);
}
