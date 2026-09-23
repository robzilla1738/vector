import { ShortcutOverridesSchema } from "@aux/contracts";
import { Menu, app, ipcMain, shell } from "electron";
import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { isWebUrl } from "../app/external-urls.js";
import { installMenu, menuShortcuts, setShortcutOverrides, shortcutOverrides } from "../app/menu.js";
import { cloudPreviewTokens, registry } from "../app/services.js";
import { cancelDictation, dictationStatus, startDictation, stopDictation } from "../dictation.js";
import { configureQuickAskShortcut, openQuickAsk, quickAskShortcutStatus, retuneQuickAskShortcut } from "../features/quick-ask.js";
import { setPageShortcuts } from "../page-shortcuts.js";
import { regularWindows, requireOwnedEntry, requireShellUi } from "../windows/registry.js";
import { updateWindowTitle, windowPageTitle } from "../windows/stage.js";

export function wireShellIpc() {
  ipcMain.handle("ui.dictationStatus", event => { requireShellUi(event); return dictationStatus(); });
  ipcMain.handle("ui.startDictation", (event, id: unknown) => { const state = requireShellUi(event); return startDictation(event.sender, id, state.win); });
  ipcMain.handle("ui.stopDictation", (event, id: unknown) => { requireShellUi(event); return stopDictation(event.sender, id); });
  ipcMain.handle("ui.cancelDictation", (event, id: unknown) => { requireShellUi(event); cancelDictation(event.sender, id); });

  ipcMain.handle("ui.quickAskShortcut",(event,enabled?:unknown)=>{requireShellUi(event);if(enabled===undefined)return quickAskShortcutStatus();if(typeof enabled!=="boolean")throw new Error("Invalid shortcut preference.");return configureQuickAskShortcut(enabled);});
  ipcMain.handle("ui.quickAsk", async (event, action: string) => {
    const state = requireShellUi(event);
    if (action === "open") { await openQuickAsk(); return state.quickAsk; }
    if (action === "expand" && state.quickAsk) {
      state.quickAsk = false;
      updateWindowTitle(state);
      state.win.setMinimumSize(900,640); state.win.setSize(1200,800); state.win.center();
      state.shellView.webContents.send("quick-ask.state", false);
    } else if (action === "dismiss" && state.quickAsk) state.win.hide();
    else if (!["status","expand","dismiss"].includes(action)) throw new Error("Unknown quick assistance action.");
    return state.quickAsk;
  });

  ipcMain.handle("ui.defaultBrowser",event=>{requireShellUi(event);return {isDefault:app.isDefaultProtocolClient("http")&&app.isDefaultProtocolClient("https")};});
  ipcMain.handle("ui.setDefaultBrowser",event=>{requireShellUi(event);
    // Report the measured state, not the request — unsigned/dev registrations
    // may be declined by the OS and the UI should not claim otherwise.
    app.setAsDefaultProtocolClient("http");app.setAsDefaultProtocolClient("https");
    return {isDefault:app.isDefaultProtocolClient("http")&&app.isDefaultProtocolClient("https")};
  });

  ipcMain.handle('ui.registerCloudPreview',(event,url:unknown,token:unknown)=>{
    requireShellUi(event);
    if(typeof url!=='string'||typeof token!=='string'||token.length<32||token.length>256)throw new Error('Invalid protected preview session.');
    let parsed:URL;try{parsed=new URL(url);}catch{throw new Error('Invalid protected preview address.');}
    if(parsed.protocol!=='https:'||(!parsed.hostname.endsWith('.vercel.run')&&parsed.hostname!=='vercel.run')||parsed.username||parsed.password)throw new Error('Aux only registers protected Vercel Sandbox previews.');
    if(cloudPreviewTokens.size>=32&&!cloudPreviewTokens.has(parsed.origin))cloudPreviewTokens.delete(cloudPreviewTokens.keys().next().value!);
    cloudPreviewTokens.set(parsed.origin,token);return true;
  });

  ipcMain.handle("ui.windows", event => {
    const current = requireShellUi(event);
    return [...regularWindows.values()].filter(state => state.id !== current.id && !state.quickAsk).map(state => {
      const entries = registry.all().filter(entry => !entry.popup && !entry.runtimeOwned && (entry.windowId ?? PRIMARY_WINDOW_ID) === state.id);
      return { id: state.id, title: windowPageTitle(state), tabCount: entries.length };
    });
  });

  ipcMain.handle("ui.shortcutOverrides", (event, value: unknown) => {
    requireShellUi(event);
    if (value === undefined) return shortcutOverrides;
    const parsed = ShortcutOverridesSchema.safeParse(value);
    if (!parsed.success) throw new Error("Invalid shortcut overrides.");
    setShortcutOverrides(parsed.data);
    setPageShortcuts(menuShortcuts);
    retuneQuickAskShortcut();
    installMenu();
    return shortcutOverrides;
  });

  ipcMain.handle("ui.contextMenu", (event, pageId: string | null) => {
    const state = requireShellUi(event);
    const entry = pageId ? requireOwnedEntry(state, pageId) : undefined;
    const wc = entry?.view.webContents;
    // page context → nav + edit + inspect on the page; chrome/input context
    // (null pageId) → edit roles on the focused shell + inspect the shell
    const template: Electron.MenuItemConstructorOptions[] = wc
      ? [
          { label: "Back", enabled: wc.navigationHistory.canGoBack(), click: () => wc.goBack() },
          { label: "Forward", enabled: wc.navigationHistory.canGoForward(), click: () => wc.goForward() },
          { label: "Reload", click: () => wc.reload() },
          { type: "separator" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Open DevTools", click: () => wc.openDevTools({ mode: "detach" }) },
        ]
      : [
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Inspect", click: () => state.shellView.webContents.openDevTools({ mode: "detach" }) },
        ];
    Menu.buildFromTemplate(template).popup();
    return true;
  });
  ipcMain.handle("ui.openExternal", (event, url: unknown) => {
    requireShellUi(event);
    if (!isWebUrl(url)) return false;
    return shell.openExternal(url).then(() => true);
  });

  ipcMain.handle("ui.closeWindow", event => {
    requireShellUi(event).win.close();
    return true;
  });
}
