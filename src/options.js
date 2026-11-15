const form = document.querySelector("form");
const status = document.querySelector("#status");

function showStatus(message) {
  status.textContent = message;
  setTimeout(() => (status.textContent = ""), 2000);
}

async function restoreOptions() {
  const settings = await browser.storage.local.get(DEFAULTS);
  for (const [key, value] of Object.entries(settings)) {
    const input = form.elements[key];
    if (!input) continue;
    if (input.type === "checkbox") input.checked = value;
    else input.value = value;
  }
}

async function saveOptions(e) {
  e.preventDefault();
  try {
    const settings = {};
    for (const key of Object.keys(DEFAULTS)) {
      const input = form.elements[key];
      settings[key] =
        input.type === "checkbox"
          ? input.checked
          : input.value.trim() || DEFAULTS[key];
    }
    await browser.storage.local.set(settings);
    await restoreOptions();
    showStatus("Saved");
  } catch (error) {
    showStatus(`Error: ${error.message}`);
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
form.addEventListener("submit", saveOptions);
