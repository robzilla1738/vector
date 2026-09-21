import type { BaseWindow } from "electron";
import type { SidebarMaterial } from "@vector/contracts";
import { createRequire } from "node:module";

const liquidGlass: { setEnabled(handle: Buffer, enabled: boolean): boolean } | null = process.platform === "darwin"
  ? createRequire(import.meta.url)("./liquid-glass.node") : null;

export function setWindowMaterial(window: BaseWindow, material: SidebarMaterial | null) {
  if (!liquidGlass) return;
  // Never layer the older vibrancy material over Liquid Glass.
  if (material === "liquid-glass") {
    window.setVibrancy(null);
    if (!liquidGlass.setEnabled(window.getNativeWindowHandle(), true)) window.setVibrancy("titlebar");
    return;
  }
  liquidGlass.setEnabled(window.getNativeWindowHandle(), false);
  window.setVibrancy(material);
}
