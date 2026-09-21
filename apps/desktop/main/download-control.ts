import type { DownloadItem } from "electron";

type Transfer = Pick<DownloadItem, "getState" | "canResume" | "pause" | "resume" | "cancel">;

/** Shared by regular and isolated private sessions; ownership is checked by the caller. */
export function controlDownload(item: Transfer | undefined, action: unknown) {
  if (!item) throw new Error("This download is no longer active.");
  if (action === "pause" && item.getState() === "progressing") item.pause();
  else if (action === "resume" && item.canResume()) item.resume();
  else if (action === "cancel") item.cancel();
  else throw new Error("This download cannot perform that action.");
}
