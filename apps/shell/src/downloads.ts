import type { Download } from "@aux/contracts";

type DownloadChange = { version: number; item: Download | null };
let nativeCollection: NativeDownloadCollection | undefined;

/** One native window's ordered shelf projection, including in-flight snapshot fences. */
export class NativeDownloadCollection {
  private version = 0;
  private snapshotVersion = 0;
  private changes = new Map<string, DownloadChange>();

  begin(): number {
    return ++this.version;
  }

  receive(item: Download): void {
    const previous = this.changes.get(item.id);
    // Chromium may make the same DownloadItem resumable after dismissal. Only
    // a genuine active/resumable event can revive it before a fresh snapshot.
    if (previous?.item === null && !item.canResume && !["started", "progressing"].includes(item.state))
      return;
    this.changes.set(item.id, { version: ++this.version, item });
  }

  remove(ids: readonly string[], requested?: number): void {
    for (const id of ids) {
      const previous = this.changes.get(id);
      // A removal acknowledgement may arrive after this item resumed elsewhere.
      if (requested !== undefined && previous && previous.version > requested) continue;
      this.changes.set(id, { version: ++this.version, item: null });
    }
  }

  snapshot(items: Download[], requested: number): Download[] {
    if (requested >= this.snapshotVersion) {
      const snapshot = new Map(items.map((item) => [item.id, item]));
      for (const id of new Set([...snapshot.keys(), ...this.changes.keys()])) {
        const previous = this.changes.get(id);
        if (previous && previous.version > requested) continue;
        this.changes.set(id, { version: requested, item: snapshot.get(id) ?? null });
      }
      this.snapshotVersion = requested;
    }
    return this.values();
  }

  has(id: string): boolean {
    return !!this.changes.get(id)?.item;
  }

  values(): Download[] {
    return [...this.changes.values()].flatMap(({ item }) => (item ? [item] : []));
  }
}

export function installNativeDownloadCollection(): NativeDownloadCollection {
  return (nativeCollection = new NativeDownloadCollection());
}

/** Supporting runtime data may finish later than the native snapshot it accompanied. */
export function visibleDownloads(items: Download[]): Download[] {
  return nativeCollection?.values() ?? items;
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
