import type { DownloadItem } from "electron";

/**
 * Byte progress reaches the shell at most 4×/s; a pause or interruption goes
 * at once. Shared by regular and private downloads. Returns a stop function
 * for the item's `done` handler.
 */
export function throttleDownloadProgress(item: DownloadItem, send: () => void) {
  let lastSent = 0, lastPhase = "", timer: NodeJS.Timeout | null = null;
  const flush = () => {
    timer = null;
    lastSent = Date.now(); lastPhase = `${item.getState()}:${item.isPaused()}`;
    send();
  };
  item.on("updated", () => {
    if (`${item.getState()}:${item.isPaused()}` !== lastPhase || Date.now() - lastSent >= 250) { if (timer) clearTimeout(timer); flush(); }
    else timer ??= setTimeout(flush, 250 - (Date.now() - lastSent));
  });
  return () => { if (timer) clearTimeout(timer); };
}
