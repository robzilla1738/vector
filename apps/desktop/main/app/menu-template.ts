import { type ShortcutCommandDef, acceleratorFor, shortcutById } from "@aux/contracts";
import type { MenuItemConstructorOptions } from "electron";

/** The shortcut the renderer's dispatcher receives for a registry command. */
export function shortcutFor(id: string, shortcuts: readonly ShortcutCommandDef[]) {
  const binding = shortcutById(id, shortcuts)?.bindings[0];
  return { key: binding?.key ?? "", meta: !!binding?.command, shift: !!binding?.shift, alt: !!binding?.alt, ctrl: !!binding?.ctrl, commandId: id };
}

/**
 * The application menu, shared by regular and private windows. Every browser
 * command's label and accelerator come from the effective shortcut table, so
 * menus follow the person's overrides; `send` routes the click through the
 * same dispatcher the keyboard uses. Process-neutral — no regular bootstrap.
 */
export function appMenuTemplate(o: {
  shortcuts: readonly ShortcutCommandDef[];
  send: (id: string) => () => void;
  appMenu: MenuItemConstructorOptions;
  closeWindow: () => void;
  /** Regular-only window commands: File items before and after New Tab. */
  beforeNewTab?: MenuItemConstructorOptions[];
  afterNewTab?: MenuItemConstructorOptions[];
  /** Commands only regular windows support (reopen, view source, tab cycling). */
  regular?: boolean;
}): MenuItemConstructorOptions[] {
  const accel = (id: string) => { const b = shortcutById(id, o.shortcuts)?.bindings[0]; return b ? acceleratorFor(b) : ""; };
  const cmd = (id: string, label = shortcutById(id, o.shortcuts)?.label ?? id) =>
    ({ label, accelerator: accel(id) || undefined, click: o.send(id) }) satisfies MenuItemConstructorOptions;
  const only = (items: MenuItemConstructorOptions[]) => o.regular ? items : [];
  return [
    o.appMenu,
    {
      label: "File",
      submenu: [
        ...(o.beforeNewTab ?? []),
        cmd("new-tab"),
        ...(o.afterNewTab ?? []),
        cmd("open-file"),
        ...only([cmd("reopen-closed-tab")]),
        { type: "separator" },
        cmd("close-tab"),
        { label: "Close Window", accelerator: accel("close-window"), click: o.closeWindow },
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
        ...only([cmd("view-source")]),
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        ...(o.regular ? [] : [cmd("open-address")]),
        cmd("back"),
        cmd("forward"),
        { type: "separator" },
        ...only([cmd("tab-next", "Select Next Tab"), cmd("tab-previous", "Select Previous Tab"), { type: "separator" }]),
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
}
