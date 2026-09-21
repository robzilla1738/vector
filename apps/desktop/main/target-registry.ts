import type { BrowserWindow, WebContentsView } from "electron";

interface ViewIdentity {
  pageId: string;
  windowId?: string;
  marker: string;
  showBlankDocument?: boolean;
  owned: boolean;
  runtimeOwned?:boolean;
  kind?: "chromium" | "engine";
  lastPreview?: string;
  visibleBounds?: { x: number; y: number; width: number; height: number };
}

export type ViewEntry = ViewIdentity & (
  { popup?: undefined; view: WebContentsView } |
  { popup: BrowserWindow; view: Pick<WebContentsView, "webContents"> }
);

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
    // Removal also runs from `destroyed`; Electron properties are unavailable then.
    for (const [id, entry] of this.byWcId) {
      if (entry === e) this.byWcId.delete(id);
    }
  }
  all() {
    return [...this.byPageId.values()];
  }
}
