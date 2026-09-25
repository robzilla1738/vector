import { screen, type BaseWindow, type WebContents } from "electron";
import { cursorAtWindowLeft, toolbarEdgeFromCursor } from "./toolbar-edge.js";

export interface ToolbarEdgeSample {
  page: boolean;
  stage: { x: number; y: number; width: number; height: number } | null;
}

/** Tell the shell when the pointer is at the top of a loaded page. The page view sits above the shell, so the shell never sees that hover itself. */
export function attachToolbarEdgeWatch(win: BaseWindow, shell: WebContents, read: () => ToolbarEdgeSample) {
  let open = false;
  let atLeft = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  const send = (next: boolean) => {
    if (next === open) return;
    open = next;
    if (!shell.isDestroyed()) shell.send("toolbar-edge", next);
  };
  const sendLeft = (next: boolean) => {
    if (next === atLeft) return;
    atLeft = next;
    if (!shell.isDestroyed()) shell.send("sidebar-edge", next);
  };
  // Polls only while it can matter: a focused, visible window showing a page.
  const active = () => !win.isDestroyed() && win.isFocused() && win.isVisible() && !win.isMinimized();
  const tick = () => {
    if (win.isDestroyed()) return stop();
    const { page, stage } = read();
    if (!page || !stage || !active()) return stop();
    const cursor = screen.getCursorScreenPoint();
    const content = win.getContentBounds();
    send(toolbarEdgeFromCursor(cursor, content, stage, open));
    sendLeft(cursorAtWindowLeft(cursor, content, atLeft));
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
    send(false);
    sendLeft(false);
  };
  const sync = () => {
    if (win.isDestroyed()) return stop();
    if (read().page && active()) {
      timer ??= setInterval(tick, 50);
      tick();
      return;
    }
    stop();
  };
  win.on("focus", sync);
  win.on("show", sync);
  win.on("restore", sync);
  win.on("blur", stop);
  win.on("hide", stop);
  win.on("minimize", stop);
  win.on("closed", stop);
  return { sync, stop };
}
