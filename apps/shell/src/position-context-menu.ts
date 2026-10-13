export function positionContextMenu(menu: HTMLElement, x: number, y: number) {
  // Layout dimensions stay stable while the entrance animation scales the menu.
  menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8))}px`;
}

/** Keep a control's menu on one side of its anchor, with scrolling on that side. */
export function positionAnchoredPopover(menu: HTMLElement, anchor: Pick<DOMRect, "left" | "top" | "bottom">) {
  menu.style.maxHeight = "";
  const above = Math.max(0, anchor.top - 16);
  const below = Math.max(0, window.innerHeight - anchor.bottom - 16);
  const height = menu.offsetHeight;
  const upwards = height > below && above > below;
  menu.style.maxHeight = `${Math.min(420, upwards ? above : below)}px`;
  positionContextMenu(menu, anchor.left, upwards ? anchor.top - 8 - menu.offsetHeight : anchor.bottom + 8);
}
