export function positionContextMenu(menu: HTMLElement, x: number, y: number) {
  // Layout dimensions stay stable while the entrance animation scales the menu.
  menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8))}px`;
}
