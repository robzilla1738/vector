export interface MovedSelection {
  pageId: string;
  windowId: string;
}
let moved: MovedSelection | null = null;
const listeners = new Set<() => void>();
export const movedSelection = () => moved;
export function rememberMovedSelection(next: MovedSelection | null) {
  if (next?.pageId === moved?.pageId && next?.windowId === moved?.windowId) return;
  moved = next;
  queueMicrotask(() => {
    for (const listener of listeners) listener();
  });
}
export function observeMovedSelection(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
