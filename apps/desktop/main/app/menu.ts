import { SHORTCUTS, type ShortcutCommandDef, type ShortcutOverrides, acceleratorFor, effectiveShortcuts, shortcutById } from "@aux/contracts";
import { BaseWindow, Menu, app } from "electron";
import { join } from "node:path";
import { openQuickAsk } from "../features/quick-ask.js";
import { popupCommand } from "../popup-commands.js";
import { createRegularWindow } from "../windows/create.js";
import { focusedRegularWindow, stateForWindowId } from "../windows/registry.js";
import { log } from "./bootstrap.js";
import { appMenuTemplate, shortcutFor } from "./menu-template.js";
import { openPrivateWindow } from "./private-windows.js";
import { registry } from "./services.js";

/** Person's saved binding overrides and the effective table they produce — one source feeds menus, page interception and renderer dispatch. */
export let shortcutOverrides: ShortcutOverrides = {};
export let menuShortcuts: readonly ShortcutCommandDef[] = SHORTCUTS;
export function setShortcutOverrides(overrides: ShortcutOverrides) {
  shortcutOverrides = overrides;
  menuShortcuts = effectiveShortcuts(overrides);
}

export function installMenu() {
  // The internal app.name stays stable for Electron encrypted storage.
  const iconPath = process.env.VITE_DEV_SERVER_URL
    ? join(app.getAppPath(), "renderer/public/aux-icon.png")
    : join(import.meta.dirname, "../renderer/aux-icon.png");
  app.setAboutPanelOptions({ applicationName: "Aux", applicationVersion: app.getVersion(), iconPath });
  if (process.platform === "darwin" && !app.isPackaged) app.dock?.setIcon(iconPath);
  // Browser commands route through the same shortcut dispatcher the keyboard
  // uses — one code path, correct regardless of which view holds focus. The
  // menu's accelerator consumes the key before the focused webContents, so the
  // click handler routes popup-owned commands locally and main-shell commands
  // to the renderer. Independent sign-in windows must not mutate the main tab.
  const send = (id: string) => () => {
    const shortcut = shortcutFor(id, menuShortcuts);
    const focused = BaseWindow.getFocusedWindow();
    const popup = registry.all().find(entry => entry.popup === focused)?.popup;
    if (!popup || !popupCommand(popup, shortcut)) focusedRegularWindow()?.shellView.webContents.send("shortcut", shortcut);
  };
  const accel = (id: string) => { const b = shortcutById(id, menuShortcuts)?.bindings[0]; return b ? acceleratorFor(b) : ""; };
  Menu.setApplicationMenu(Menu.buildFromTemplate(appMenuTemplate({
    shortcuts: menuShortcuts,
    send,
    regular: true,
    appMenu: {
      label: "Aux",
      submenu: [
        { role: "about", label: "About Aux" },
        { type: "separator" },
        { role: "hide", label: "Hide Aux" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: "Quit Aux" },
      ],
    },
    beforeNewTab: [
      { label: "Quick Ask", accelerator: accel("quick-ask"), click: () => { void openQuickAsk().catch(error => log("Quick Ask could not open", String(error))); } },
      { id: "new-window", label: "New Window", accelerator: accel("new-window"), click: () => { void createRegularWindow(); } },
    ],
    afterNewTab: [{ id: "new-private-window", label: "New Private Window", accelerator: accel("new-private-window"), click: openPrivateWindow }],
    closeWindow: () => (BaseWindow.getFocusedWindow() ?? stateForWindowId()?.win)?.close(),
  })));
}
