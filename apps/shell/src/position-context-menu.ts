export function positionContextMenu(menu: HTMLElement, x: number, y: number) {
  // Layout dimensions stay stable while the entrance animation scales the menu.
  menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8))}px`;
}

/** Keep a control's menu on one side of its anchor, with scrolling on that side. */
export function positionAnchoredPopover(
  menu: HTMLElement,
  anchor: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  align: "start" | "end" = "start",
) {
  menu.style.maxHeight = "";
  const above = Math.max(0, anchor.top - 16);
  const below = Math.max(0, window.innerHeight - anchor.bottom - 16);
  const height = menu.offsetHeight;
  const upwards = height > below && above > below;
  menu.style.maxHeight = `${Math.min(420, upwards ? above : below)}px`;
  const left = align === "end" ? anchor.right - menu.offsetWidth : anchor.left;
  positionContextMenu(menu, left, upwards ? anchor.top - 8 - menu.offsetHeight : anchor.bottom + 8);
}

/** Match the selected row to its trigger, keeping long pickers inside the viewport. */
export function positionSelectedPopover(
  menu: HTMLElement,
  anchor: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  selected: HTMLElement | null,
) {
  menu.style.minWidth = `${Math.min(anchor.right - anchor.left, 440, Math.max(0, window.innerWidth - 16))}px`;
  menu.style.maxHeight = `${Math.max(0, Math.min(360, window.innerHeight - 16))}px`;
  if (!selected || !menu.contains(selected)) {
    positionContextMenu(menu, anchor.left - 4, anchor.bottom + 4);
    return;
  }
  const row = selected.getBoundingClientRect();
  const offset = row.top - menu.getBoundingClientRect().top + menu.scrollTop + row.height / 2;
  const top = (anchor.top + anchor.bottom) / 2 - offset;
  positionContextMenu(menu, anchor.left - 4, top);
  menu.scrollTop = Math.max(0, Number.parseFloat(menu.style.top) - top);
}
