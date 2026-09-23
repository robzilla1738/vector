import { DownloadSchema } from "@aux/contracts";
import { dialog, ipcMain } from "electron";
import { desktopStartedAt } from "../app/bootstrap.js";
import { downloadLocation } from "../app/services.js";
import { controlDownload } from "../download-control.js";
import { interruptedDownloadHistory } from "../download-recovery.js";
import { retrySource } from "../download-retry.js";
import { liveDownloads } from "../downloads/controller.js";
import { downloadsSession } from "../native-views.js";
import { channel, notifyRuntime } from "../runtime/supervisor.js";
import { broadcastToShells, requireShellUi } from "../windows/registry.js";

export function wireDownloadsIpc() {
  ipcMain.handle("ui.downloadsSnapshot", async event => {
    requireShellUi(event);
    if (channel) {
      const records = DownloadSchema.array().parse(await channel.call("api.invoke", { method: "downloads.list", params: {}, desktopUser: true }));
      for (const recovered of interruptedDownloadHistory(records, new Set(liveDownloads.keys()), desktopStartedAt)) {
        notifyRuntime("view.downloadFinished", recovered);
        broadcastToShells("download", recovered);
      }
    }
    return [...liveDownloads.values()].map(download => download.snapshot());
  });
  ipcMain.handle("ui.downloadFolder", event=>{requireShellUi(event);return downloadLocation.status();});

  ipcMain.handle("ui.retryDownload", async (event,id:unknown)=>{
    requireShellUi(event);
    if(typeof id!=='string'||liveDownloads.has(id))throw new Error('Stop the active transfer before retrying.');
    if(!channel)throw new Error('Runtime not connected.');
    const records=DownloadSchema.array().parse(await channel.call('api.invoke',{method:'downloads.list',params:{},desktopUser:true}));
    const record=records.find(item=>item.id===id);
    const source=retrySource(record?.sourceUrl);
    if(!record||record.state==='completed'||!source)throw new Error('This download cannot be retried here. Start it again from the original page.');
    const folder=downloadLocation.status();if(folder.error)throw new Error(folder.error);
    if(liveDownloads.has(id))throw new Error('Stop the active transfer before retrying.');
    downloadsSession().downloadURL(source);
  });
  ipcMain.handle("ui.chooseDownloadFolder", async (event, reset:unknown)=>{
    const state=requireShellUi(event);if(reset===true)return downloadLocation.choose(null);
    const result=await dialog.showOpenDialog(state.win,{title:"Choose download folder",properties:["openDirectory","createDirectory"]});
    return result.canceled||!result.filePaths[0]?downloadLocation.status():downloadLocation.choose(result.filePaths[0]);
  });
  ipcMain.handle("ui.controlDownload", (event, id: unknown, action: unknown) => {
    requireShellUi(event);
    const download = typeof id === "string" ? liveDownloads.get(id) : undefined;
    controlDownload(download?.item, action);
    if (download && liveDownloads.has(id as string)) broadcastToShells("download", download.snapshot());
  });
}
