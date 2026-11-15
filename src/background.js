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
  console.log("[anki] menu clicked", info.srcUrl);

  try {
    const [loaded] = await browser.tabs.executeScript(tab.id, {
      code: "typeof sendToAnki === 'function';",
    });
    console.log("[anki] script already loaded in tab:", loaded);

    if (!loaded) {
      await browser.tabs.executeScript(tab.id, { file: "src/defaults.js" });
      await browser.tabs.executeScript(tab.id, { file: "src/sendimage.js" });
      console.log("[anki] scripts injected");
    }

    const [result] = await browser.tabs.executeScript(tab.id, {
      code: `(async () => {
        try {
          await sendToAnki(${JSON.stringify(info.srcUrl)});
          return { ok: true };
        } catch (e) {
          return { ok: false, message: e.message, rpc: e.rpc ?? null };
        }
      })()`,
    });
    console.log("[anki] result:", JSON.stringify(result));
  } catch (error) {
    console.error("Failed to send image:", error);
  }
});
