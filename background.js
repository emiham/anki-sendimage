browser.contextMenus.create(
  {
    id: "send-image-to-anki",
    title: "Send image to Anki",
    contexts: ["image"],
  },
  () => void browser.runtime.lastError,
);

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "send-image-to-anki") return;

  try {
    const [loaded] = await browser.tabs.executeScript(tab.id, {
      code: "typeof sendToAnki === 'function';",
    });

    if (!loaded) {
      await browser.tabs.executeScript(tab.id, { file: "defaults.js" });
      await browser.tabs.executeScript(tab.id, { file: "sendimage.js" });
    }

    await browser.tabs.executeScript(tab.id, {
      code: `sendToAnki(${JSON.stringify(info.srcUrl)});`,
    });
  } catch (error) {
    console.error("Failed to send image:", error);
  }
});
