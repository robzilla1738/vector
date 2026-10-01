let windowId;
chrome.windows.getCurrent().then((window) => { windowId = window.id; });
const output = document.querySelector("#result");
function report(work) { Promise.resolve(work).then((value) => { output.textContent = JSON.stringify(value); }, (error) => { output.textContent = error.message; }); }
document.querySelector("#panel").onclick = () => report(chrome.sidePanel.open({ windowId }));
async function create(withOpener) {
  const origin = new URL(document.querySelector("#origin").value);
  if (origin.protocol !== "http:" || origin.hostname !== "127.0.0.1" || origin.username || origin.password) throw new Error("Use the disposable loopback fixture.");
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = await chrome.tabs.create({ url: `${origin.origin}/extension-created`, active: false, ...(withOpener ? { openerTabId: active.id } : {}) });
  await chrome.storage.local.set({ fixtureTab: tab.id });
  return { created: tab.id, opener: tab.openerTabId ?? null };
}
document.querySelector("#create").onclick = () => report(create(false));
document.querySelector("#opener").onclick = () => report(create(true));
document.querySelector("#activate").onclick = () => report(chrome.storage.local.get("fixtureTab").then(({ fixtureTab }) => chrome.tabs.update(fixtureTab, { active: true })));
