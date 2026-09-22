import { screen, type BaseWindow, type WebContents } from "electron";
import { toolbarEdgeFromCursor } from "./toolbar-edge.js";

export interface ToolbarEdgeSample {
  page: boolean;
  stage: { x: number; y: number; width: number; height: number } | null;
}

/** Tell the shell when the pointer is at the top of a loaded page. The page view sits above the shell, so the shell never sees that hover itself. */
export function attachToolbarEdgeWatch(win: BaseWindow, shell: WebContents, read: () => ToolbarEdgeSample) {
  let open = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  const send = (next: boolean) => {
    if (next === open) return;
    open = next;
    if (!shell.isDestroyed()) shell.send("toolbar-edge", next);
  };
  const tick = () => {
    if (win.isDestroyed()) return stop();
    const { page, stage } = read();
    if (!page || !stage || !win.isFocused()) {
      send(false);
      return;
    }
    const cursor = screen.getCursorScreenPoint();
    send(toolbarEdgeFromCursor(cursor, win.getContentBounds(), stage, open));
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
    send(false);
  };
  const sync = () => {
    if (win.isDestroyed()) return stop();
    if (read().page) {
      if (!timer) timer = setInterval(tick, 50);
      tick();
      return;
    }
    stop();
  };
  win.on("focus", tick);
  win.on("blur", () => send(false));
  win.on("closed", stop);
  return { sync, stop };
}
