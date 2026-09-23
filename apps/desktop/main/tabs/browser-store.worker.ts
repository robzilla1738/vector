import { parentPort, workerData } from "node:worker_threads";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { TabPatch, TabPatchOp, TabCatalogSnapshot, TabRecord, WindowTabs } from "@aux/contracts";

/**
 * Browser persistence worker (§7.1): durable catalog/session state owned off
 * the main thread. Requests are versioned patches applied in order inside a
 * single transaction; the acknowledgment is sent only after commit — a
 * durable acknowledgment is never issued for state SQLite did not keep.
 * synchronous=FULL: session state is not a rebuildable cache.
 */

const dir = String(workerData?.dir ?? "");
mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(join(dir, "browser-state.sqlite"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tabs (
    page_id TEXT PRIMARY KEY,
    window_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    favicon TEXT,
    loading INTEGER NOT NULL,
    muted INTEGER NOT NULL,
    audible INTEGER NOT NULL,
    can_back INTEGER NOT NULL,
    can_forward INTEGER NOT NULL,
    popup INTEGER NOT NULL,
    crashed INTEGER NOT NULL,
    runtime_owned INTEGER NOT NULL,
    nav_error_json TEXT,
    generation INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    last_active_at INTEGER NOT NULL,
    changed_version INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS windows (
    window_id TEXT PRIMARY KEY,
    ord_json TEXT NOT NULL,
    active_page_id TEXT REFERENCES tabs(page_id) ON DELETE SET NULL
  );
`);

const upsertTab = db.prepare(`
  INSERT INTO tabs (page_id, window_id, url, title, favicon, loading, muted, audible,
    can_back, can_forward, popup, crashed, runtime_owned, nav_error_json, generation, created_at, last_active_at, changed_version)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(page_id) DO UPDATE SET
    window_id=excluded.window_id, url=excluded.url, title=excluded.title, favicon=excluded.favicon,
    loading=excluded.loading, muted=excluded.muted, audible=excluded.audible,
    can_back=excluded.can_back, can_forward=excluded.can_forward, popup=excluded.popup,
    crashed=excluded.crashed, runtime_owned=excluded.runtime_owned, nav_error_json=excluded.nav_error_json, generation=excluded.generation,
    created_at=excluded.created_at, last_active_at=excluded.last_active_at, changed_version=excluded.changed_version
`);
const deleteTab = db.prepare(`DELETE FROM tabs WHERE page_id = ?`);
const allWindows = db.prepare(`SELECT window_id, ord_json, active_page_id FROM windows`);
const upsertWindow = db.prepare(`INSERT INTO windows (window_id, ord_json, active_page_id) VALUES (?, ?, ?)
  ON CONFLICT(window_id) DO UPDATE SET ord_json=excluded.ord_json, active_page_id=excluded.active_page_id`);
const setVersion = db.prepare(`INSERT INTO meta (key, value) VALUES ('catalogVersion', ?)
  ON CONFLICT(key) DO UPDATE SET value=excluded.value`);

const post = (message: unknown) => parentPort?.postMessage(message);

function applyOp(op: TabPatchOp, version: number) {
  switch (op.op) {
    case "upsert": {
      const t = op.tab;
      upsertTab.run(t.pageId, t.windowId, t.url, t.title, t.favicon ?? null, Number(t.loading),
        Number(t.muted), Number(t.audible), Number(t.canGoBack), Number(t.canGoForward), Number(t.popup),
        Number(t.crashed), Number(t.runtimeOwned), t.navigationError ? JSON.stringify(t.navigationError) : null,
        t.generation, t.createdAt, t.lastActiveAt, version);
      break;
    }
    case "remove": {
      deleteTab.run(op.pageId);
      // A removed tab also leaves every strip it occupied — mirror the
      // catalog's remove semantics so a persisted order never names a tab
      // without a row. (FK ON DELETE SET NULL already covers active_page_id;
      // passing it here keeps the update explicit.)
      for (const row of allWindows.all() as { window_id: string; ord_json: string; active_page_id: string | null }[]) {
        const order = (JSON.parse(row.ord_json) as string[]).filter(id => id !== op.pageId);
        const active = row.active_page_id === op.pageId ? null : row.active_page_id;
        if (order.join() !== row.ord_json || active !== row.active_page_id) upsertWindow.run(row.window_id, JSON.stringify(order), active);
      }
      break;
    }
    case "window":
      upsertWindow.run(op.window.windowId, JSON.stringify(op.window.order), op.window.activePageId);
      break;
  }
}

function loadSnapshot(): TabCatalogSnapshot {
  const version = Number((db.prepare(`SELECT value FROM meta WHERE key='catalogVersion'`).get() as { value: string } | undefined)?.value ?? 0);
  const tabs = (db.prepare(`SELECT * FROM tabs ORDER BY created_at`).all() as Record<string, unknown>[]).map(row => ({
    pageId: String(row.page_id),
    windowId: String(row.window_id),
    url: String(row.url),
    title: String(row.title),
    favicon: row.favicon == null ? undefined : String(row.favicon),
    loading: false,
    muted: !!row.muted,
    audible: false,
    canGoBack: !!row.can_back,
    canGoForward: !!row.can_forward,
    popup: !!row.popup,
    crashed: false,
    navigationError: row.nav_error_json ? JSON.parse(String(row.nav_error_json)) : undefined,
    runtimeOwned: !!row.runtime_owned,
    generation: Number(row.generation),
    createdAt: Number(row.created_at),
    lastActiveAt: Number(row.last_active_at),
  } satisfies TabRecord));
  const known = new Set(tabs.map(tab => tab.pageId));
  const windows = (db.prepare(`SELECT * FROM windows`).all() as Record<string, unknown>[]).map(row => ({
    windowId: String(row.window_id),
    // An id in ord_json whose row is gone is a stale remove artifact, not a
    // pending upsert — a snapshot has no in-flight ops, so drop it here.
    order: (JSON.parse(String(row.ord_json)) as string[]).filter(id => known.has(id)),
    activePageId: row.active_page_id == null ? null : String(row.active_page_id),
  } satisfies WindowTabs));
  return { version, tabs, windows };
}

parentPort?.on("message", (request: { type: string; seq: number; patch?: TabPatch }) => {
  try {
    switch (request.type) {
      case "apply": {
        const patch = request.patch!;
        db.exec("BEGIN IMMEDIATE");
        // Ops inside a patch are unordered across tables — a window op may
        // name a tab whose upsert follows it. FKs still hold at COMMIT.
        db.exec("PRAGMA defer_foreign_keys = ON");
        try {
          for (const op of patch.ops) applyOp(op, patch.version);
          setVersion.run(String(patch.version));
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
        post({ type: "applied", seq: request.seq, version: patch.version });
        break;
      }
      case "load":
        post({ type: "snapshot", seq: request.seq, snapshot: loadSnapshot() });
        break;
      case "close":
        db.close();
        post({ type: "closed", seq: request.seq });
        process.exit(0);
    }
  } catch (error) {
    post({ type: "error", seq: request.seq, message: error instanceof Error ? error.message : String(error) });
  }
});
