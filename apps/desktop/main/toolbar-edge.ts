/** How far into the page (px) the pointer may be before the address bar appears. */
export const TOOLBAR_EDGE_OPEN = 6;
/** Extra travel into the page before an open address bar hides, so it does not flicker. */
export const TOOLBAR_EDGE_LEEWAY = 8;
/** The open bar sits above the page. Pointers in that band stay inside the control. */
export const TOOLBAR_EDGE_ABOVE = 56;

/**
 * `offsetFromPageTop` is the pointer's distance below the native page's top.
 * Negative means the pointer is in the chrome band above an already open bar.
 */
export function pagePointerKeepsToolbar(offsetFromPageTop: number, open: boolean): boolean {
  if (open) return offsetFromPageTop >= -TOOLBAR_EDGE_ABOVE && offsetFromPageTop <= TOOLBAR_EDGE_OPEN + TOOLBAR_EDGE_LEEWAY;
  return offsetFromPageTop >= 0 && offsetFromPageTop <= TOOLBAR_EDGE_OPEN;
}

/** The hidden sidebar leaves no gutter. The pointer on the window's left edge still opens it. */
export function cursorAtWindowLeft(
  cursor: { x: number; y: number },
  content: { x: number; y: number; width: number; height: number },
  open = false,
): boolean {
  const x = cursor.x - content.x;
  const y = cursor.y - content.y;
  return x >= 0 && x <= TOOLBAR_EDGE_OPEN + (open ? TOOLBAR_EDGE_LEEWAY : 0) && y >= 0 && y <= content.height;
}

export function toolbarEdgeFromCursor(
  cursor: { x: number; y: number },
  content: { x: number; y: number },
  stage: { x: number; y: number; width: number; height: number },
  open: boolean,
): boolean {
  const x = cursor.x - content.x;
  if (x < stage.x || x > stage.x + stage.width) return false;
  return pagePointerKeepsToolbar(cursor.y - content.y - stage.y, open);
}
