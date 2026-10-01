const boot = crypto.randomUUID();
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type === "wake") respond({ boot, echo: message.value, extensionId: chrome.runtime.id });
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "aux-fixture", title: "Aux extension context fixture", contexts: ["page"] });
  chrome.action.setBadgeText({ text: "4" });
  chrome.action.setBadgeBackgroundColor({ color: "#3168d8" });
});
