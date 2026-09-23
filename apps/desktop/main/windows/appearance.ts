import { type SidebarMaterial, SidebarMaterialSchema } from "@aux/contracts";
import { BaseWindow, WebContentsView, nativeTheme } from "electron";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { recolorToolbarGlass } from "../toolbar-glass.js";
import { setWindowMaterial } from "../window-material.js";

/** Process-neutral: shared by regular and private windows, so it must not import the regular bootstrap. */
export const WINDOW_BG = { dark: "#171717", light: "#ffffff" } as const;
export type Theme = "system" | "dark" | "light";
interface Painted { win: BaseWindow; shellView: WebContentsView }

/** What the person asked for; glass also depends on platform and reduced transparency. */
export const appearance: { translucent: boolean; material: SidebarMaterial } = { translucent: true, material: "liquid-glass" };

export const glassActive = (translucent = appearance.translucent) => translucent && !nativeTheme.prefersReducedTransparency && process.platform === "darwin";
export const solidFill = () => WINDOW_BG[nativeTheme.shouldUseDarkColors ? "dark" : "light"];
export const windowFill = (glass = glassActive()) => glass ? "#00000000" : solidFill();
export const parseTheme = (theme: unknown): Theme => theme === "system" ? "system" : theme === "light" ? "light" : "dark";

export function readStoredAppearance(dataDir: string): { theme: Theme; translucent: boolean; material: SidebarMaterial } {
  try {
    const raw = JSON.parse(readFileSync(join(dataDir, "settings.json"), "utf8")) as { theme?: string; sidebarAppearance?: string; sidebarMaterial?: unknown };
    return { theme: parseTheme(raw.theme), translucent: raw.sidebarAppearance !== "solid", material: SidebarMaterialSchema.catch("liquid-glass").parse(raw.sidebarMaterial) };
  } catch {
    return { theme: "dark", translucent: true, material: "liquid-glass" };
  }
}

export function setRequestedAppearance(translucent: boolean, material: SidebarMaterial) {
  appearance.translucent = translucent;
  appearance.material = material;
}

function paint(windows: Iterable<Painted>) {
  const glass = glassActive();
  const fill = windowFill(glass);
  for (const { win, shellView } of windows) {
    try { win.setBackgroundColor(fill); } catch { /* platform support */ }
    setWindowMaterial(win, glass ? appearance.material : null);
    shellView.setBackgroundColor(fill);
  }
}

export function watchAppearance(windows: () => Iterable<Painted>) {
  nativeTheme.on("updated", () => {
    paint(windows());
    recolorToolbarGlass(nativeTheme.shouldUseDarkColors, nativeTheme.prefersReducedTransparency);
  });
}

export function applyAppearance(windows: Iterable<Painted>, theme: Theme, translucent = appearance.translucent, material = appearance.material) {
  setRequestedAppearance(translucent, material);
  nativeTheme.themeSource = theme;
  paint(windows);
}
