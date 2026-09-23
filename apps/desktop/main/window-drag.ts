import { type BaseWindow } from "electron";
const drags = new WeakMap<BaseWindow, { cursor: Electron.Point; bounds: Electron.Rectangle }>();
/** Shell-only pointer capture drives BaseWindow movement across WebContentsView layers. */
export function dragWindow(win: BaseWindow, phase: unknown, point: unknown) {
  if (win.isDestroyed()) return;
  if (phase === "end") { drags.delete(win); return; }
  if (!point || typeof point !== "object" || !("x" in point) || !("y" in point)) return;
  const { x, y } = point;
  if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 100000 || Math.abs(y) > 100000) return;
  const cursor = { x, y };
  if (phase === "start") {
    if (win.isFullScreen() || !win.isMovable()) return;
    drags.set(win, { cursor, bounds: win.getBounds() });
    return;
  }
  const start = drags.get(win);
  if (phase !== "move" || !start) return;
  win.setPosition(Math.round(start.bounds.x + cursor.x - start.cursor.x), Math.round(start.bounds.y + cursor.y - start.cursor.y));
}
