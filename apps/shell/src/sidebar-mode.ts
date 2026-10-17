export type SidebarMode = "expanded" | "hidden";

export function readSidebarMode(raw: string | null | undefined): SidebarMode {
  if (raw == null) return "expanded";
  if (raw === "hidden" || raw === "expanded") return raw;
  return "hidden";
}

export function nextSidebarMode(current: SidebarMode): SidebarMode {
  return current === "expanded" ? "hidden" : "expanded";
}

export function sidebarFocusSelector(mode: SidebarMode): string {
  if (mode === "expanded") return ".chat-sidebar .chat-sidebar-link, .space-switch";
  return '.chat-sidebar-toggle, .toolbar [aria-label="Show sidebar"]';
}
