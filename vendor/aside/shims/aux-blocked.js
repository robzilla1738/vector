(async () => {
  const target = new URLSearchParams(location.search).get("url") ?? "";
  document.getElementById("url").textContent = target;

  document.getElementById("back").addEventListener("click", async () => {
    if (history.length > 1) history.back();
    else window.close();
  });

  document.getElementById("continue").addEventListener("click", async () => {
    if (!/^https?:\/\//i.test(target)) return;
    const tab = await chrome.tabs.getCurrent();
    const id = 900000 + Math.floor(Math.random() * 90000);
    // A session rule scoped to this tab lets exactly this URL load once.
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id],
      addRules: [
        {
          id,
          priority: 100,
          action: { type: "allowAllRequests" },
          condition: { urlFilter: `|${target}|`, resourceTypes: ["main_frame"], tabIds: [tab.id] },
        },
      ],
    });
    location.replace(target);
    setTimeout(() => chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [id] }), 15000);
  });
})();
