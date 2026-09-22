import type { TabCatalogSnapshot, TabPatch, TabPatchOp, TabRecord, WindowTabs } from "@aux/contracts";

/**
 * The authoritative in-memory tab catalog inside the main process (§7.1).
 * Native view hooks and typed commands mutate it through `apply`, which
 * stamps an ordered, versioned patch. Subscribers — shell renderers, the
 * runtime, and the persistence worker — converge on `snapshot()` when they
 * reconnect or detect a gap.
 */
export class TabCatalog {
  private tabs = new Map<string, TabRecord>();
  private windows = new Map<string, { order: string[]; activePageId: string | null }>();
  private version = 0;
  /** pageId → catalog version of the tab's last structural change (create,
   *  window move, generation) — backs `stale_tab`. Content updates do not
   *  bump it, so a title change never vetoes a human command. */
  private revisions = new Map<string, number>();
  /** pageId → highest generation ever issued — survives `remove` so a reopened
   *  or rematerialized tab keeps a strictly increasing instance generation. */
  private generations = new Map<string, number>();
  /** recent patches for gap recovery; a subscriber older than the log resyncs */
  private log: TabPatch[] = [];
  private static LOG_LIMIT = 256;

  get currentVersion() {
    return this.version;
  }

  tab(pageId: string) {
    return this.tabs.get(pageId);
  }

  /** The catalog version of this tab's last structural change. */
  revisionOf(pageId: string) {
    return this.revisions.get(pageId);
  }

  /** The generation the next tab instance under this id must carry. */
  nextGeneration(pageId: string) {
    return (this.generations.get(pageId) ?? -1) + 1;
  }

  window(windowId: string) {
    return this.windows.get(windowId);
  }

  all(): TabRecord[] {
    return [...this.tabs.values()];
  }

  apply(ops: TabPatchOp[], changedAt?: number): TabPatch {
    const patch: TabPatch = { version: this.version + 1, baseVersion: this.version, ops, ts: changedAt ?? Date.now() };
    for (const op of ops) this.applyOp(op, patch.version);
    this.version = patch.version;
    this.log.push(patch);
    if (this.log.length > TabCatalog.LOG_LIMIT) this.log.splice(0, this.log.length - TabCatalog.LOG_LIMIT);
    return patch;
  }

  private applyOp(op: TabPatchOp, atVersion: number) {
    switch (op.op) {
      case "upsert": {
        const previous = this.tabs.get(op.tab.pageId);
        this.tabs.set(op.tab.pageId, op.tab);
        this.generations.set(op.tab.pageId, Math.max(this.generations.get(op.tab.pageId) ?? -1, op.tab.generation));
        // Only structural change invalidates a targeted command — content
        // churn (title, favicon, loading) must not reject a human's close.
        if (!previous || previous.windowId !== op.tab.windowId || previous.generation !== op.tab.generation) {
          this.revisions.set(op.tab.pageId, atVersion);
        }
        if (previous && previous.windowId !== op.tab.windowId) {
          const source = this.windows.get(previous.windowId);
          if (source) {
            source.order = source.order.filter(id => id !== op.tab.pageId);
            if (source.activePageId === op.tab.pageId) source.activePageId = null;
          }
        }
        // Keep the owning window's order complete without requiring callers
        // to pair every upsert with a window op. Activation is expressed
        // only through window ops — the window owns the active pointer.
        const owner = this.windows.get(op.tab.windowId) ?? { order: [], activePageId: null };
        if (!owner.order.includes(op.tab.pageId)) owner.order.push(op.tab.pageId);
        this.windows.set(op.tab.windowId, owner);
        break;
      }
      case "remove": {
        const tab = this.tabs.get(op.pageId);
        this.tabs.delete(op.pageId);
        this.revisions.delete(op.pageId);
        if (tab) {
          const owner = this.windows.get(tab.windowId);
          if (owner) {
            owner.order = owner.order.filter(id => id !== op.pageId);
            if (owner.activePageId === op.pageId) owner.activePageId = null;
          }
        }
        break;
      }
      case "window": {
        // Drop order entries for tabs this window no longer owns — a patch
        // computed mid-flight can name a tab that has since been removed.
        const order = op.window.order.filter(id => {
          const tab = this.tabs.get(id);
          return !tab || tab.windowId === op.window.windowId;
        });
        const owned = (id: string | null) => !!id && this.tabs.get(id)?.windowId === op.window.windowId;
        // An active pointer naming a tab another window now owns is a stale
        // read, not an intent — keep the previous still-valid pick instead.
        const previous = this.windows.get(op.window.windowId)?.activePageId ?? null;
        const activePageId = op.window.activePageId && !owned(op.window.activePageId)
          ? (owned(previous) ? previous : null)
          : op.window.activePageId;
        this.windows.set(op.window.windowId, { order, activePageId });
        break;
      }
    }
  }

  snapshot(): TabCatalogSnapshot {
    return {
      version: this.version,
      tabs: [...this.tabs.values()],
      windows: [...this.windows.entries()].map(([windowId, w]) => ({ windowId, order: w.order, activePageId: w.activePageId })),
    };
  }

  /**
   * Load a persisted snapshot at boot — state appears without a patch and
   * the version continues from where the worker left off, so patches
   * already delivered to subscribers stay ordered.
   */
  restore(snapshot: TabCatalogSnapshot) {
    this.tabs = new Map(snapshot.tabs.map(tab => [tab.pageId, tab]));
    this.windows = new Map(snapshot.windows.map(w => [w.windowId, { order: [...w.order], activePageId: w.activePageId }]));
    this.version = snapshot.version;
    this.revisions = new Map(snapshot.tabs.map(tab => [tab.pageId, snapshot.version]));
    this.generations = new Map(snapshot.tabs.map(tab => [tab.pageId, tab.generation]));
    this.log = [];
  }

  /**
   * Everything a subscriber at `version` missed. A gap beyond the retained
   * log or an unknown future version resolves to a full snapshot instead —
   * a suspended renderer is never asked to replay what is no longer known.
   */
  since(version: number): { kind: "patches"; patches: TabPatch[] } | { kind: "snapshot"; snapshot: TabCatalogSnapshot } {
    if (version > this.version) return { kind: "snapshot", snapshot: this.snapshot() };
    const retained = this.log[0]?.baseVersion ?? this.version;
    if (version < retained) return { kind: "snapshot", snapshot: this.snapshot() };
    return { kind: "patches", patches: this.log.filter(patch => patch.version > version) };
  }
}

/** Build a fresh record for a tab entering the catalog. */
export function newTabRecord(input: {
  pageId: string;
  windowId: string;
  url?: string;
  title?: string;
  popup?: boolean;
  runtimeOwned?: boolean;
  generation?: number;
  createdAt?: number;
}): TabRecord {
  const now = input.createdAt ?? Date.now();
  return {
    pageId: input.pageId,
    windowId: input.windowId,
    url: input.url ?? "about:blank",
    title: input.title ?? "",
    loading: !!input.url,
    muted: false,
    audible: false,
    canGoBack: false,
    canGoForward: false,
    popup: input.popup === true,
    crashed: false,
    runtimeOwned: input.runtimeOwned === true,
    generation: input.generation ?? 0,
    createdAt: now,
    lastActiveAt: now,
  };
}

/** Window order/active ops describing `windowId` after `mutate` reorders it. */
export function windowOp(catalog: TabCatalog, windowId: string): TabPatchOp {
  const w = catalog.window(windowId);
  const window: WindowTabs = { windowId, order: w?.order ?? [], activePageId: w?.activePageId ?? null };
  return { op: "window", window };
}
