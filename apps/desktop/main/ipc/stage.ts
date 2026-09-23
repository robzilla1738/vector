import { splitRatio } from "@aux/contracts/split-layout";
import { ipcMain } from "electron";
import { requireShellUi, stateForShell } from "../windows/registry.js";
import { applyStage, deliverPagePointer } from "../windows/stage.js";

export function wireStageIpc() {
  ipcMain.handle("ui.setStage", (event, pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null, radius?: number, ratio?: number) => {
    const state = requireShellUi(event);
    state.stageBounds = bounds;
    state.stagePageId = pageId;
    // `null` means the selected tab currently renders shell-owned content
    // (start page, settings, overview, or renderer bootstrap). It must not
    // erase that window's durable tab selection during a shell reload.
    if (pageId) state.focusedPageId = pageId;
    state.splitPageId = split ?? null;
    state.splitRatio = splitRatio(ratio);
    if (typeof radius === "number" && Number.isFinite(radius)) state.stageRadius = Math.max(0, Math.min(24, Math.round(radius)));
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.overlay", (event, open: boolean) => {
    const state = requireShellUi(event);
    state.overlayOpen = open;
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.toolbarOverlay", (event, open: unknown, ticket: unknown) => {
    const state = requireShellUi(event);
    const seq = typeof ticket === "number" && Number.isFinite(ticket) ? ticket : 0;
    if (seq < state.toolbarOverlaySeq) return false;
    state.toolbarOverlaySeq = seq;
    state.toolbarOverlay = open === true;
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.trafficLights", (event, visible: unknown) => {
    const state = requireShellUi(event);
    if (process.platform === "darwin") state.win.setWindowButtonVisibility(visible !== false);
    return true;
  });
  ipcMain.on("ui.pagePointer", (event, value: unknown) => {
    const state = stateForShell(event.sender.id);
    if (!state || event.senderFrame !== state.shellView.webContents.mainFrame) return;
    deliverPagePointer(state, value);
  });
  // Kept for older shells: the peek is a real column beside the page, so main has nothing to do.
  ipcMain.handle("ui.sidebarPeek", event => { requireShellUi(event); return true; });
  ipcMain.handle("ui.focusShell", event => { requireShellUi(event).shellView.webContents.focus(); });
}
