import { SidebarMaterialSchema } from "@aux/contracts";
import { applyAppearance, parseTheme } from "../windows/appearance.js";
import { handleShell, regularWindows } from "../windows/registry.js";

export function wireAppearanceIpc() {
  handleShell("ui.setAppearance", (_, theme: unknown, translucent: unknown, windowControls: unknown, material: unknown) => {
    const nativeMaterial = SidebarMaterialSchema.default("liquid-glass").parse(material);
    if (process.platform === "darwin") for (const state of regularWindows.values()) state.win.setWindowButtonVisibility(windowControls !== false);
    applyAppearance(regularWindows.values(), parseTheme(theme), translucent === true, nativeMaterial);
    return true;
  });
}
