import { ipcMain } from "electron";
import { offscreen } from "../app/services.js";
import { nextFrame, previewJpeg, startPreviewWatch } from "../preview-watch.js";
import { wakePage } from "../tabs/lifecycle-controller.js";
import type { ViewEntry } from "../target-registry.js";
import { handleShell, requireOwnedEntry, requireShellUi } from "../windows/registry.js";
import { applyStage, clearPreviewWatch } from "../windows/stage.js";

export function wirePreviewIpc() {
  ipcMain.handle("ui.watchPreview", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    if (typeof pageId !== "string") return false;
    if (state.previewWatch?.pageId === pageId) return true;
    clearPreviewWatch(state);
    let entry: ViewEntry;
    try { entry = requireOwnedEntry(state, pageId); } catch { return false; }
    if (entry.popup || entry.view.webContents.isDestroyed()) return false;
    const wasVisible = entry.view.getVisible();
    let stopped = false;
    state.previewWatch = { pageId, stop: () => { stopped = true; } };
    offscreen.beginPreview(pageId);
    try {
      await wakePage(entry);
      if (stopped) return false;
      if (event.sender.isDestroyed() || entry.view.webContents.isDestroyed()) { clearPreviewWatch(state); return false; }
      applyStage(state);
      if (!wasVisible) await nextFrame(entry.view.webContents, 250);
      if (stopped) return false;
      if (event.sender.isDestroyed() || entry.view.webContents.isDestroyed()) { clearPreviewWatch(state); return false; }
      const sender = event.sender;
      const stopLoop = startPreviewWatch({
        pageId,
        contents: entry.view.webContents,
        capture: () => entry.view.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }),
        send: frame => { if (!sender.isDestroyed()) sender.send("preview-frame", frame); },
        stopped: () => stopped || sender.isDestroyed() || entry.view.webContents.isDestroyed(),
      });
      if (stopped || state.previewWatch === null) { stopLoop(); return false; }
      state.previewWatch = { pageId, stop: () => { stopped = true; stopLoop(); } };
      return true;
    } catch {
      if (state.previewWatch?.pageId === pageId) clearPreviewWatch(state);
      return false;
    }
  });
  handleShell("ui.unwatchPreview", (state, pageId: unknown) => {
    if (state.previewWatch && (typeof pageId !== "string" || state.previewWatch.pageId === pageId)) clearPreviewWatch(state);
    return true;
  });
  handleShell("ui.preview", async (state, pageId: string) => {
    let entry: ViewEntry;
    try { entry = requireOwnedEntry(state, pageId); } catch { return null; }
    const reveal = !entry.popup && !entry.view.getVisible();
    if (!entry.popup) offscreen.beginPreview(entry.pageId);
    try {
      await wakePage(entry);
      // A freshly revealed view paints before it is worth capturing.
      if (reveal) {
        applyStage(state);
        await nextFrame(entry.view.webContents, 250);
      }
      const img = await entry.view.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
      const size = img.getSize();
      const jpeg = previewJpeg(img, Math.max(320, Math.min(640, Math.round(size.width * 0.5))));
      return jpeg ? `data:image/jpeg;base64,${jpeg.toString("base64")}` : null;
    } catch {
      return null;
    } finally {
      // Hide only when this preview was the last reason the page stayed laid out.
      if (!entry.popup && offscreen.endPreview(entry.pageId)) applyStage(state);
    }
  });
}
