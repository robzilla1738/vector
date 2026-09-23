import { splitRatio } from "@aux/contracts/split-layout";
import { ipcMain } from "electron";
import { handleShell, stateForShell } from "../windows/registry.js";
import { applyStage, deliverPagePointer } from "../windows/stage.js";

export function wireStageIpc() {
  handleShell("ui.setStage", (state, pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null, radius?: number, ratio?: number) => {
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
  handleShell("ui.overlay", (state, open: boolean) => {
    state.overlayOpen = open;
    applyStage(state);
    return true;
  });
  handleShell("ui.toolbarOverlay", (state, open: unknown, ticket: unknown) => {
    const seq = typeof ticket === "number" && Number.isFinite(ticket) ? ticket : 0;
    if (seq < state.toolbarOverlaySeq) return false;
    state.toolbarOverlaySeq = seq;
    state.toolbarOverlay = open === true;
    applyStage(state);
    return true;
  });
  handleShell("ui.trafficLights", (state, visible: unknown) => {
    if (process.platform === "darwin") state.win.setWindowButtonVisibility(visible !== false);
    return true;
  });
  ipcMain.on("ui.pagePointer", (event, value: unknown) => {
    const state = stateForShell(event.sender.id);
    if (!state || event.senderFrame !== state.shellView.webContents.mainFrame) return;
    deliverPagePointer(state, value);
  });
  // Kept for older shells: the peek is a real column beside the page, so main has nothing to do.
  handleShell("ui.sidebarPeek", () => true);
  handleShell("ui.focusShell", state => { state.shellView.webContents.focus(); });
}
