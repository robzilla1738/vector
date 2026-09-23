import { SidebarMaterialSchema } from "@aux/contracts";
import { ipcMain } from "electron";
import { applyAppearance, parseTheme } from "../windows/appearance.js";
import { regularWindows, requireShellUi } from "../windows/registry.js";

export function wireAppearanceIpc() {
  ipcMain.handle("ui.setAppearance", (event, theme: unknown, translucent: unknown, windowControls: unknown, material: unknown) => {
    requireShellUi(event);
    const nativeMaterial = SidebarMaterialSchema.default("liquid-glass").parse(material);
    if (process.platform === "darwin") for (const state of regularWindows.values()) state.win.setWindowButtonVisibility(windowControls !== false);
    applyAppearance(regularWindows.values(), parseTheme(theme), translucent === true, nativeMaterial);
    return true;
  });
}
