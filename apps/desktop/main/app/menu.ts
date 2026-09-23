import { SHORTCUTS, type ShortcutCommandDef, type ShortcutOverrides, acceleratorFor, effectiveShortcuts, shortcutById } from "@aux/contracts";
import { BaseWindow, Menu, app } from "electron";
import { join } from "node:path";
import { openQuickAsk } from "../features/quick-ask.js";
import { popupCommand } from "../popup-commands.js";
import { createRegularWindow } from "../windows/create.js";
import { focusedRegularWindow, stateForWindowId } from "../windows/registry.js";
import { log } from "./bootstrap.js";
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
  const send = (id: string) => () =>
    {
      const binding = shortcutById(id, menuShortcuts)?.bindings[0];
      const shortcut = { key: binding?.key ?? "", meta: !!binding?.command, shift: !!binding?.shift, alt: !!binding?.alt, ctrl: !!binding?.ctrl, commandId: id };
      const focused = BaseWindow.getFocusedWindow();
      const popup = registry.all().find(entry => entry.popup === focused)?.popup;
      if (!popup || !popupCommand(popup, shortcut)) focusedRegularWindow()?.shellView.webContents.send("shortcut", shortcut);
    };
  const accel = (id: string) => { const b = shortcutById(id, menuShortcuts)?.bindings[0]; return b ? acceleratorFor(b) : ""; };
  const cmd = (id: string, label = shortcutById(id, menuShortcuts)?.label ?? id) =>
    ({ label, accelerator: accel(id) || undefined, click: send(id) }) satisfies Electron.MenuItemConstructorOptions;

  const template: Electron.MenuItemConstructorOptions[] = [
    {
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
    {
      label: "File",
      submenu: [
        { label: "Quick Ask", accelerator: accel("quick-ask"), click: () => { void openQuickAsk().catch(error => log("Quick Ask could not open", String(error))); } },
        { id: "new-window", label: "New Window", accelerator: accel("new-window"), click: () => { void createRegularWindow(); } },
        cmd("new-tab"),
        { id: "new-private-window", label: "New Private Window", accelerator: accel("new-private-window"), click: openPrivateWindow },
        cmd("open-file"),
        cmd("reopen-closed-tab"),
        { type: "separator" },
        cmd("close-tab"),
        { label: "Close Window", accelerator: accel("close-window"), click: () => (BaseWindow.getFocusedWindow() ?? stateForWindowId()?.win)?.close() },
        { type: "separator" },
        cmd("print"),
        cmd("save-pdf"),
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "selectAll" },
        { type: "separator" },
        cmd("find"),
        cmd("find-next"),
        cmd("find-previous"),
      ],
    },
    {
      label: "View",
      submenu: [
        cmd("reload"),
        cmd("hard-reload"),
        { type: "separator" },
        cmd("actual-size"),
        cmd("zoom-in"),
        cmd("zoom-out"),
        { type: "separator" },
        cmd("reader"),
        cmd("sidebar"),
        cmd("overview"),
        { type: "separator" },
        cmd("devtools"),
        cmd("view-source"),
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        cmd("back"),
        cmd("forward"),
        { type: "separator" },
        cmd("tab-next", "Select Next Tab"),
        cmd("tab-previous", "Select Previous Tab"),
        { type: "separator" },
        cmd("history"),
        cmd("downloads"),
        { type: "separator" },
        cmd("bookmark"),
        cmd("bookmark-all"),
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "front" }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
