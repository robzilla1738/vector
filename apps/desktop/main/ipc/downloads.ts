import { DownloadSchema } from "@aux/contracts";
import { dialog } from "electron";
import { desktopStartedAt } from "../app/bootstrap.js";
import { downloadLocation } from "../app/services.js";
import { controlDownload } from "../download-control.js";
import { interruptedDownloadHistory } from "../download-recovery.js";
import { retrySource } from "../download-retry.js";
import { liveDownloads } from "../downloads/controller.js";
import { profileSession } from "../native-views.js";
import { channel, notifyRuntime, requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { broadcastToShells, handleShell } from "../windows/registry.js";

export function wireDownloadsIpc() {
  handleShell("ui.downloadsSnapshot", async () => {
    if (channel) {
      const records = DownloadSchema.array().parse(await runtimeInvoke("downloads.list"));
      for (const recovered of interruptedDownloadHistory(records, new Set(liveDownloads.keys()), desktopStartedAt)) {
        notifyRuntime("view.downloadFinished", recovered);
        broadcastToShells("download", recovered);
      }
    }
    return [...liveDownloads.values()].map(download => download.snapshot());
  });
  handleShell("ui.downloadFolder", () => downloadLocation.status());

  handleShell("ui.retryDownload", async (_, id:unknown) => {
    if(typeof id!=='string'||liveDownloads.has(id))throw new Error('Stop the active transfer before retrying.');
    requireRuntime('Runtime not connected.');
    const records=DownloadSchema.array().parse(await runtimeInvoke('downloads.list'));
    const record=records.find(item=>item.id===id);
    const source=retrySource(record?.sourceUrl);
    if(!record||record.state==='completed'||!source)throw new Error('This download cannot be retried here. Start it again from the original page.');
    const folder=downloadLocation.status();if(folder.error)throw new Error(folder.error);
    if(liveDownloads.has(id))throw new Error('Stop the active transfer before retrying.');
    profileSession().downloadURL(source);
  });
  handleShell("ui.chooseDownloadFolder", async (state, reset:unknown) => {
    if(reset===true)return downloadLocation.choose(null);
    const result=await dialog.showOpenDialog(state.win,{title:"Choose download folder",properties:["openDirectory","createDirectory"]});
    return result.canceled||!result.filePaths[0]?downloadLocation.status():downloadLocation.choose(result.filePaths[0]);
  });
  handleShell("ui.controlDownload", (_, id: unknown, action: unknown) => {
    const download = typeof id === "string" ? liveDownloads.get(id) : undefined;
    controlDownload(download?.item, action);
    if (download && liveDownloads.has(id as string)) broadcastToShells("download", download.snapshot());
  });
}
