import type { Download } from "@aux/contracts";

/** A live update received while the snapshot was in flight always wins. */
export function mergeDownloadSnapshot(
  current: Download[],
  snapshot: Download[],
  updated: ReadonlySet<string>,
): Download[] {
  const live = new Map(snapshot.map((download) => [download.id, download]));
  const merged = current.map((download) => {
    const fresh = live.get(download.id);
    live.delete(download.id);
    if (updated.has(download.id)) return download;
    if (fresh) return fresh;
    if (["started", "progressing"].includes(download.state))
      return {
        ...download,
        state: "interrupted" as const,
        canCancel: false,
        canResume: false,
        paused: false,
      };
    return download;
  });
  return [...live.values(), ...merged];
}

/** Live interrupted transfers may still resume, and must not be dismissed. */
export function canDismissDownload(download: Download): boolean {
  return !download.canCancel && ["completed", "cancelled", "interrupted"].includes(download.state);
}
