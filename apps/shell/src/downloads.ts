import type { Download } from "@aux/contracts";

// A GUID is never reused by this native Profile. Keep acknowledgements for the
// window lifetime so an older snapshot cannot restore an already dismissed row.
const dismissed = new Set<string>();
export function noteDismissedDownloads(ids: readonly string[]): void {
  for (const id of ids) dismissed.add(id);
}
export function visibleDownloads(items: Download[]): Download[] {
  return items.filter((item) => !dismissed.has(item.id));
}

/** The native snapshot owns the shelf; live updates received during it win. */
export function mergeDownloadSnapshot(
  current: Download[],
  snapshot: Download[],
  updated: ReadonlySet<string>,
  removed: ReadonlySet<string> = new Set(),
): Download[] {
  const live = new Map(snapshot.map((download) => [download.id, download]));
  for (const download of current) if (updated.has(download.id)) live.set(download.id, download);
  return visibleDownloads([...live.values()].filter((download) => !removed.has(download.id)));
}

/** Interrupted transfers may still resume, and must not be dismissed. */
export function canDismissDownload(download: Download): boolean {
  return (
    !download.canCancel &&
    !download.canResume &&
    ["completed", "cancelled", "interrupted"].includes(download.state)
  );
}
