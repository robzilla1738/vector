import { downloadLocation, registry } from "../app/services.js";
import { confirmDownload, downloadWarning } from "../download-guard.js";
import { retrySource } from "../download-retry.js";
import { profileSession } from "../native-views.js";
import { notifyRuntime } from "../runtime/supervisor.js";
import { broadcastToShells, regularWindows, stateForEntry } from "../windows/registry.js";
import { throttleDownloadProgress } from "./progress.js";

// ---------- downloads ----------
export const liveDownloads = new Map<string, { item: Electron.DownloadItem; snapshot: () => import("@aux/contracts").Download }>();

export function wireDownloads() {
  profileSession().on("will-download", (event, item, webContents) => {
    const entry = registry.byWebContentsId(webContents?.id ?? -1);
    const filename = item.getFilename();
    const sourceUrl = retrySource(item.getURLChain()[0] ?? item.getURL());
    let savePath:string;
    try{savePath=downloadLocation.destination(filename);}catch(error){
      event.preventDefault();
      const failed={id:`dl_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,pageId:entry?.pageId,sourceUrl,filename,path:"",size:0,state:"interrupted",startedAt:Date.now(),endedAt:Date.now(),canResume:false,canCancel:false};
      notifyRuntime("view.downloadFinished",failed);broadcastToShells("download",failed);
      return;
    }
    item.setSavePath(savePath);
    const dl: import("@aux/contracts").Download & { warning?: "executable" | "insecure" } = {
      id: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pageId: entry?.pageId,
      filename,
      sourceUrl,
      path: savePath,
      size: 0,
      totalBytes: item.getTotalBytes() > 0 ? item.getTotalBytes() : undefined,
      startedAt: Date.now(),
      state: "started",
    };
    const snapshot = (): import("@aux/contracts").Download => ({
      ...dl, state: item.getState(), size: item.getReceivedBytes(),
      totalBytes: item.getTotalBytes() || undefined, paused: item.isPaused(),
      canResume: item.canResume(), canCancel: true,
    });
    liveDownloads.set(dl.id, { item, snapshot });
    notifyRuntime("view.downloadStarted", { ...snapshot(), state: "started" });
    broadcastToShells("download", { ...snapshot(), state: "started" });
    const warning = downloadWarning(filename, sourceUrl);
    if (warning) {
      dl.warning = warning;
      const win = stateForEntry(entry)?.win ?? [...regularWindows.values()][0]?.win;
      if (win) void confirmDownload(win, item, filename, sourceUrl, warning);
    }
    const stopProgress = throttleDownloadProgress(item, () => { if (liveDownloads.has(dl.id)) broadcastToShells("download", snapshot()); });
    item.once("done", (_e, state) => {
      stopProgress();
      liveDownloads.delete(dl.id);
      const final = { ...dl, state, size: item.getReceivedBytes(), paused: false, canResume: false, canCancel: false, endedAt: Date.now() };
      notifyRuntime("view.downloadFinished", final);
      broadcastToShells("download", final);
    });
  });
}
