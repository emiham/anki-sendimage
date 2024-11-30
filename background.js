browser.contextMenus.create(
  {
    id: "send-image-to-anki",
    title: "Send image to Anki",
    contexts: ["image"],
  },
  () => void browser.runtime.lastError,
);

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "send-image-to-anki") {
    const code = "sendToAnki(" + JSON.stringify(info.srcUrl) + ");";

    browser.tabs
      .executeScript({
        code: "typeof sendToAnki === 'function';",
      })
      .then((results) => {
        if (!results || results[0] !== true) {
          return browser.tabs.executeScript(tab.id, {
            file: "sendimage.js",
          });
        }
      })
      .then(() => {
        return browser.tabs.executeScript(tab.id, {
          code,
        });
      })
      .catch((error) => {
        console.error("Failed to send image: " + error);
      });
  }
});
