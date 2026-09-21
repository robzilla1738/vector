/** Sidebar collapse: ⌘S toggles expanded ↔ rail. Palette can still hide completely. */
export type SidebarMode = "expanded" | "rail" | "hidden";

export function readSidebarMode(raw: string | null | undefined): SidebarMode {
  if (raw === "rail" || raw === "hidden" || raw === "expanded") return raw;
  return "expanded";
}

export function nextSidebarMode(current: SidebarMode): SidebarMode {
  return current === "expanded" ? "rail" : "expanded";
}

export function sidebarFocusSelector(mode: SidebarMode): string {
  if (mode === "expanded") return ".space-switch";
  if (mode === "rail") return ".sidebar-rail";
  return ".sidebar-reveal";
}
