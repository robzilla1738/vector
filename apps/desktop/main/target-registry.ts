import type { WebContentsView } from "electron";

export interface ViewEntry {
  pageId: string;
  marker: string;
  view: WebContentsView;
  owned: boolean;
  lastPreview?: string;
  visibleBounds?: { x: number; y: number; width: number; height: number };
}

/**
 * The authoritative pageId/marker -> native view map inside the main
 * process. Runtime assigns pageIds; the marker injected into every document
 * is how the automation driver finds the exact target (same-URL safe).
 */
export class TargetRegistry {
  private byPageId = new Map<string, ViewEntry>();
  private byMarker = new Map<string, ViewEntry>();
  private byWcId = new Map<number, ViewEntry>();

  add(entry: ViewEntry) {
    this.byPageId.set(entry.pageId, entry);
    this.byMarker.set(entry.marker, entry);
    this.byWcId.set(entry.view.webContents.id, entry);
  }
  get(pageId: string) {
    return this.byPageId.get(pageId);
  }
  byMarkerId(marker: string) {
    return this.byMarker.get(marker);
  }
  byWebContentsId(id: number) {
    return this.byWcId.get(id);
  }
  remove(pageId: string) {
    const e = this.byPageId.get(pageId);
    if (!e) return;
    this.byPageId.delete(pageId);
    this.byMarker.delete(e.marker);
    this.byWcId.delete(e.view.webContents.id);
  }
  all() {
    return [...this.byPageId.values()];
  }
}
