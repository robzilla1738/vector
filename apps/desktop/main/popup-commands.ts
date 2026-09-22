import type { BrowserWindow } from 'electron';

export interface BrowserShortcut {
  key: string;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  ctrl?: boolean;
  /** Registry id when the sender already resolved the command (menus, interception). */
  commandId?: string;
}

/** Commands belonging to an independent browser popup, not the main tab strip. */
export function popupCommand(window: BrowserWindow, shortcut: BrowserShortcut): boolean {
  if (window.isDestroyed()) return false;
  const wc = window.webContents;
  const history = wc.navigationHistory;
  // A resolved registry id keeps menu clicks and rebound chords working;
  // the chord fallback covers anything that arrives without one.
  switch (shortcut.commandId) {
    case "back": if (history.canGoBack()) history.goBack(); return true;
    case "forward": if (history.canGoForward()) history.goForward(); return true;
    case "close-tab": window.close(); return true;
    case "reload": wc.reload(); return true;
    case "hard-reload": wc.reloadIgnoringCache(); return true;
    case "actual-size": wc.setZoomLevel(0); return true;
    case "zoom-in": wc.setZoomLevel(Math.max(-5, Math.min(5, wc.getZoomLevel() + 0.5))); return true;
    case "zoom-out": wc.setZoomLevel(Math.max(-5, Math.min(5, wc.getZoomLevel() - 0.5))); return true;
    case "print": wc.print(); return true;
  }
  const key = shortcut.key.toLowerCase();
  const arrowNavigation = shortcut.alt && !shortcut.meta && ['left', 'arrowleft', 'right', 'arrowright'].includes(key);
  const bracketNavigation = shortcut.meta && !shortcut.alt && !shortcut.shift && ['[', ']'].includes(key);
  if (arrowNavigation || bracketNavigation) {
    if (key.endsWith('left') || key === '[') { if (history.canGoBack()) history.goBack(); }
    else if (history.canGoForward()) history.goForward();
    return true;
  }
  if (!shortcut.meta || shortcut.alt) return false;
  if (key === 'w') { window.close(); return true; }
  if (key === 'r') { if (shortcut.shift) wc.reloadIgnoringCache(); else wc.reload(); return true; }
  if (key === '0') { wc.setZoomLevel(0); return true; }
  if (['=', '+', '-', '_'].includes(key)) {
    wc.setZoomLevel(Math.max(-5, Math.min(5, wc.getZoomLevel() + (key === '-' || key === '_' ? -0.5 : 0.5))));
    return true;
  }
  if (key === 'p' && !shortcut.shift) { wc.print(); return true; }
  return false;
}
