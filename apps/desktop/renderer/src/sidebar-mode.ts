/** Stored compact-rail preferences migrate to a fully hidden sidebar. */
export type SidebarMode = "expanded" | "rail" | "hidden";

export function readSidebarMode(raw: string | null | undefined): SidebarMode {
  if (raw === "rail") return "hidden";
  if (raw === "hidden" || raw === "expanded") return raw;
  return "expanded";
}

export function nextSidebarMode(current: SidebarMode): SidebarMode {
  return current === "expanded" ? "hidden" : "expanded";
}

export function sidebarFocusSelector(mode: SidebarMode): string {
  if (mode === "expanded") return ".space-switch";
  return '.toolbar [aria-label="Show sidebar"]';
}
