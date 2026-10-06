import type { PageTarget } from "@aux/contracts";

export type TabSwitcherOrder = "sidebar" | "recently-used";
type SwitchTab = Pick<PageTarget, "pageId" | "lastActiveAt">;

/** Keeps a quick series of shortcut presses on one stable MRU list. */
export function createTabSwitcher() {
  let sequence: { ids: string[]; activeId: string; at: number } | undefined;
  return (
    tabs: SwitchTab[],
    activeId: string | null,
    direction: 1 | -1,
    order: TabSwitcherOrder,
    now = Date.now(),
  ): string | null => {
    if (tabs.length < 2) return null;
    const sidebarIds = tabs.map((tab) => tab.pageId);
    if (order === "sidebar") {
      sequence = undefined;
      const index = sidebarIds.indexOf(activeId ?? "");
      return sidebarIds[(index + direction + sidebarIds.length) % sidebarIds.length] ?? null;
    }
    const continuing =
      sequence &&
      now - sequence.at < 900 &&
      sequence.activeId === activeId &&
      sequence.ids.length === sidebarIds.length &&
      sequence.ids.every((id) => sidebarIds.includes(id));
    const ids = continuing
      ? sequence!.ids
      : [...tabs]
          .sort(
            (a, b) =>
              b.lastActiveAt - a.lastActiveAt || sidebarIds.indexOf(a.pageId) - sidebarIds.indexOf(b.pageId),
          )
          .map((tab) => tab.pageId);
    const index = ids.indexOf(activeId ?? "");
    const next = ids[(index + direction + ids.length) % ids.length] ?? null;
    if (next) sequence = { ids, activeId: next, at: now };
    return next;
  };
}
