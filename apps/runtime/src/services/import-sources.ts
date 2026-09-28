import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { readChromeBookmarksFile, type ImportedBookmark } from "./chrome-bookmarks.js";

/**
 * Browser-data import sources. Every reader is read-only against the source
 * profile: SQLite stores are opened only after a db+wal+shm snapshot copy so a
 * running browser's live WAL is folded into a consistent view without ever
 * locking or writing the original file.
 */

export type ImportSourceId = "chrome" | "chrome-beta" | "chromium" | "edge" | "arc" | "safari" | "firefox";
export type ImportCategory = "bookmarks" | "history" | "tabs";

export interface ImportProfileRef {
  id: string;
  /** Absolute profile directory (or the data file's directory for Safari). */
  dir: string;
}

export interface ImportSource {
  id: ImportSourceId;
  label: string;
  profiles: ImportProfileRef[];
  /** Why this source cannot be used right now (permission, missing store). */
  blocker?: string;
  hasSidebarMetadata?: boolean;
  /** Arc keeps StorableSidebar.json at the User Data root, above Default. */
  sidebarDir?: string;
}

export interface ImportHistoryRow {
  url: string;
  title: string;
  visitedAt: number;
}

// A fixture may relocate read-only import discovery without changing the app's
// actual HOME (which also affects native Profile/Keychain startup on macOS).
const HOME = process.env.AUX_IMPORT_SOURCE_HOME ?? homedir();

const CHROMIUM_SOURCES: { id: ImportSourceId; label: string; dir: string }[] = [
  { id: "chrome", label: "Chrome", dir: join(HOME, "Library/Application Support/Google/Chrome") },
  { id: "chrome-beta", label: "Chrome Beta", dir: join(HOME, "Library/Application Support/Google/Chrome Beta") },
  { id: "edge", label: "Microsoft Edge", dir: join(HOME, "Library/Application Support/Microsoft Edge") },
  { id: "chromium", label: "Chromium", dir: join(HOME, "Library/Application Support/Chromium") },
  { id: "chrome", label: "Chrome", dir: join(HOME, ".config/google-chrome") },
  { id: "chrome-beta", label: "Chrome Beta", dir: join(HOME, ".config/google-chrome-beta") },
  { id: "chromium", label: "Chromium", dir: join(HOME, ".config/chromium") },
  { id: "edge", label: "Microsoft Edge", dir: join(HOME, ".config/microsoft-edge") },
];

const ARC_DIR = join(HOME, "Library/Application Support/Arc/User Data");
const SAFARI_DIR = join(HOME, "Library/Safari");
const FIREFOX_DIRS = [
  join(HOME, "Library/Application Support/Firefox/Profiles"),
  join(HOME, ".mozilla/firefox"),
];

const CHROMIUM_PROFILE = /^(Default|Profile \d+)$/;
const HTTP_URL = /^https?:\/\//;

function dirState(dir: string): "ok" | "missing" | "denied" {
  try {
    return statSync(dir).isDirectory() ? "ok" : "missing";
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM" || (error as NodeJS.ErrnoException).code === "EACCES" ? "denied" : "missing";
  }
}

function chromiumProfiles(base: string): ImportProfileRef[] {
  let names: string[];
  try {
    names = readdirSync(base).filter(p => CHROMIUM_PROFILE.test(p) && (existsSync(join(base, p, "Bookmarks")) || existsSync(join(base, p, "History"))));
  } catch {
    return [];
  }
  return names.map(p => ({ id: p, dir: join(base, p) }));
}

/** Snapshot a live SQLite store (db + WAL + shm) into a fresh temp dir. */
export function snapshotSqlite(src: string): { path: string; cleanup: () => void } {
  const tmp = mkdtempSync(join(tmpdir(), "aux-import-"));
  const dst = join(tmp, "snapshot.db");
  copyFileSync(src, dst);
  for (const suffix of ["-wal", "-shm"]) {
    if (existsSync(`${src}${suffix}`)) copyFileSync(`${src}${suffix}`, `${dst}${suffix}`);
  }
  return { path: dst, cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

export function listImportSources(): ImportSource[] {
  const out: ImportSource[] = [];
  const seen = new Set<string>();
  for (const source of CHROMIUM_SOURCES) {
    if (seen.has(source.id) || dirState(source.dir) !== "ok") continue;
    const profiles = chromiumProfiles(source.dir);
    if (!profiles.length) continue;
    seen.add(source.id);
    out.push({ id: source.id, label: source.label, profiles });
  }
  if (dirState(ARC_DIR) === "ok") {
    const profiles = chromiumProfiles(ARC_DIR);
    if (profiles.length || existsSync(join(ARC_DIR, "StorableSidebar.json"))) {
      out.push({
        id: "arc",
        label: "Arc",
        profiles: profiles.length ? profiles : [{ id: "Default", dir: ARC_DIR }],
        hasSidebarMetadata: existsSync(join(ARC_DIR, "StorableSidebar.json")),
        sidebarDir: ARC_DIR,
      });
    }
  }
  const safariState = dirState(SAFARI_DIR);
  if (safariState !== "missing") {
    out.push({
      id: "safari",
      label: "Safari",
      profiles: [{ id: "Safari", dir: SAFARI_DIR }],
      blocker: safariState === "denied"
        ? "macOS needs Full Disk Access for Aux to read Safari's data (System Settings → Privacy & Security → Full Disk Access)."
        : !existsSync(join(SAFARI_DIR, "Bookmarks.plist")) && !existsSync(join(SAFARI_DIR, "History.db"))
          ? "Safari has no bookmarks or history store to import."
          : undefined,
    });
  }
  for (const base of FIREFOX_DIRS) {
    if (dirState(base) !== "ok") continue;
    let profiles: ImportProfileRef[] = [];
    try {
      profiles = readdirSync(base)
        .filter(p => existsSync(join(base, p, "places.sqlite")))
        .map(p => ({ id: p, dir: join(base, p) }));
    } catch { /* unreadable profiles dir — no source */ }
    if (profiles.length) {
      out.push({ id: "firefox", label: "Firefox", profiles });
      break;
    }
  }
  return out;
}

// ---------- bookmarks ----------

export function readChromiumBookmarks(profileDir: string): ImportedBookmark[] {
  const path = join(profileDir, "Bookmarks");
  return existsSync(path) ? readChromeBookmarksFile(path) : [];
}

interface ArcTabData {
  savedURL?: unknown;
  url?: unknown;
  customTitle?: unknown;
  title?: unknown;
}

/**
 * Arc's StorableSidebar.json holds Spaces, folders and pinned/unpinned tabs.
 * Versions vary; this walks it defensively — any item carrying a data.tab URL
 * becomes a bookmark inside its Space (and folder chain) so the Space/folder/
 * pin/title metadata survives the move.
 */
export function readArcSidebar(dir: string): { bookmarks: ImportedBookmark[]; skipped: number } {
  const path = join(dir, "StorableSidebar.json");
  if (!existsSync(path)) return { bookmarks: [], skipped: 0 };
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { bookmarks: [], skipped: 0 };
  }
  const sidebar = (parsed as { sidebar?: { containers?: unknown[] } }).sidebar;
  const out: ImportedBookmark[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const container of sidebar?.containers ?? []) {
    const c = container as { spaces?: { id?: unknown; title?: unknown; name?: unknown; customInfo?: { title?: unknown } }[]; items?: unknown[] };
    const spaceNames = new Map<string, string>();
    for (const space of c.spaces ?? []) {
      const id = typeof space.id === "string" ? space.id : undefined;
      const title = (typeof space.title === "string" && space.title) || (typeof space.name === "string" && space.name) || (typeof space.customInfo?.title === "string" && space.customInfo.title) || undefined;
      if (id && title) spaceNames.set(id, title.slice(0, 200));
    }
    const items = new Map<string, { parentID?: string; spaceID?: string; title?: string; isFolder: boolean; url?: string; name?: string }>();
    const rawItems = c.items ?? [];
    for (const raw of rawItems) {
      const item = raw as { id?: unknown; parentID?: unknown; spaceID?: unknown; title?: unknown; data?: { tab?: ArcTabData; itemContainer?: unknown } };
      if (typeof item.id !== "string") continue;
      const tab = item.data?.tab;
      const url = typeof tab?.savedURL === "string" ? tab.savedURL : typeof tab?.url === "string" ? tab.url : undefined;
      items.set(item.id, {
        parentID: typeof item.parentID === "string" ? item.parentID : undefined,
        spaceID: typeof item.spaceID === "string" ? item.spaceID : undefined,
        title: typeof item.title === "string" ? item.title.slice(0, 200) : undefined,
        isFolder: item.data?.itemContainer != null,
        url,
        name: (typeof tab?.customTitle === "string" && tab.customTitle.slice(0, 1000)) || (typeof tab?.title === "string" && tab.title.slice(0, 1000)) || (typeof item.title === "string" ? item.title.slice(0, 1000) : undefined),
      });
    }
    for (const item of items.values()) {
      if (!item.url || !HTTP_URL.test(item.url) || item.url.length > 8192 || seen.has(item.url)) {
        if (item.url && !HTTP_URL.test(item.url)) skipped++;
        continue;
      }
      const space = item.spaceID ? spaceNames.get(item.spaceID) : undefined;
      const ancestors: string[] = [];
      let parent = item.parentID ? items.get(item.parentID) : undefined;
      let hops = 0;
      while (parent && hops++ < 16) {
        if (parent.isFolder && parent.title) ancestors.push(parent.title);
        parent = parent.parentID ? items.get(parent.parentID) : undefined;
      }
      const folders = [...(space ? [space] : []), ...ancestors.reverse()];
      seen.add(item.url);
      out.push({ url: item.url, title: item.name ?? "", folderPath: folders.length ? folders : ["Arc"] });
    }
  }
  return { bookmarks: out, skipped };
}

/** Safari Bookmarks.plist → JSON via plutil, then walk the Children tree. */
export function readSafariBookmarks(dir: string): ImportedBookmark[] {
  const path = join(dir, "Bookmarks.plist");
  if (!existsSync(path)) return [];
  const json = execFileSync("plutil", ["-convert", "json", "-o", "-", path], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 30_000 });
  const root = JSON.parse(json) as { Children?: unknown[] };
  const out: ImportedBookmark[] = [];
  const seen = new Set<string>();
  const walk = (node: { Children?: unknown[]; Title?: unknown; URLString?: unknown }, folderPath: string[]) => {
    for (const child of node.Children ?? []) {
      const c = child as { Children?: unknown[]; Title?: unknown; URLString?: unknown; URIDictionary?: { title?: unknown } };
      if (typeof c.URLString === "string" && HTTP_URL.test(c.URLString) && c.URLString.length <= 8192 && !seen.has(c.URLString)) {
        seen.add(c.URLString);
        const title = (typeof c.URIDictionary?.title === "string" && c.URIDictionary.title) || (typeof c.Title === "string" ? c.Title : "");
        out.push({ url: c.URLString, title: title.slice(0, 1000), folderPath });
      } else if (Array.isArray(c.Children)) {
        const name = typeof c.Title === "string" && c.Title ? c.Title.slice(0, 200) : "Folder";
        walk(c, [...folderPath, name]);
      }
    }
  };
  walk(root, []);
  return out;
}

// ---------- history (batched, newest first — cancel between batches) ----------

const CHROME_EPOCH_MS = 11_644_473_600_000; // microseconds→ms offset from 1601 to 1970
const SAFARI_EPOCH_S = 978_307_200; // seconds from 1970 to 2001-01-01

function* queryHistory(db: DatabaseSync, select: string, params: number[], cursorColumn: string, batch: number): Generator<ImportHistoryRow[]> {
  const stmt = db.prepare(`${select} WHERE ${cursorColumn} < ? ORDER BY ${cursorColumn} DESC LIMIT ?`);
  let cursor = Number.MAX_SAFE_INTEGER;
  for (;;) {
    const rows = stmt.all(...params, cursor, batch) as { id: number; url: string; title: string | null; t: number }[];
    if (!rows.length) return;
    yield rows.filter(r => r.url && HTTP_URL.test(r.url)).map(r => ({ url: r.url, title: r.title ?? "", visitedAt: Math.max(0, Math.round(r.t)) }));
    cursor = rows[rows.length - 1]!.id;
    if (rows.length < batch) return;
  }
}

export function* readChromiumHistory(profileDir: string, batch = 500): Generator<ImportHistoryRow[]> {
  const src = join(profileDir, "History");
  if (!existsSync(src)) return;
  const snap = snapshotSqlite(src);
  let db: DatabaseSync | null = null;
  try {
    db = new DatabaseSync(snap.path);
    yield* queryHistory(
      db,
      "SELECT v.id AS id, u.url AS url, u.title AS title, CAST(v.visit_time/1000 - ? AS INTEGER) AS t FROM visits v JOIN urls u ON u.id = v.url",
      [CHROME_EPOCH_MS],
      "v.id",
      batch,
    );
  } finally {
    db?.close();
    snap.cleanup();
  }
}

export function* readFirefoxHistory(profileDir: string, batch = 500): Generator<ImportHistoryRow[]> {
  const src = join(profileDir, "places.sqlite");
  if (!existsSync(src)) return;
  const snap = snapshotSqlite(src);
  let db: DatabaseSync | null = null;
  try {
    db = new DatabaseSync(snap.path);
    yield* queryHistory(
      db,
      "SELECT h.id AS id, p.url AS url, p.title AS title, CAST(h.visit_date/1000 AS INTEGER) AS t FROM moz_historyvisits h JOIN moz_places p ON p.id = h.place_id",
      [],
      "h.id",
      batch,
    );
  } finally {
    db?.close();
    snap.cleanup();
  }
}

export function readFirefoxBookmarks(profileDir: string): ImportedBookmark[] {
  const src = join(profileDir, "places.sqlite");
  if (!existsSync(src)) return [];
  const snap = snapshotSqlite(src);
  let db: DatabaseSync | null = null;
  try {
    db = new DatabaseSync(snap.path);
    const rows = db.prepare(
      "SELECT b.id AS id, b.parent AS parent, b.type AS type, b.title AS title, b.position AS pos, p.url AS url " +
      "FROM moz_bookmarks b LEFT JOIN moz_places p ON p.id = b.fk ORDER BY b.parent, b.position",
    ).all() as { id: number; parent: number; type: number; title: string | null; pos: number; url: string | null }[];
    const byId = new Map(rows.map(r => [r.id, r]));
    const ROOTS: Record<number, string> = { 2: "Bookmarks menu", 3: "Bookmarks toolbar", 5: "Unfiled bookmarks", 6: "Mobile bookmarks" };
    const pathFor = (start: number): string[] => {
      const path: string[] = [];
      let id = start;
      let hops = 0;
      while (id > 6 && hops++ < 32) {
        const node = byId.get(id);
        if (!node) break;
        if (node.title) path.unshift(node.title.slice(0, 200));
        id = node.parent;
      }
      const root = ROOTS[id];
      if (root) path.unshift(root);
      return path;
    };
    const out: ImportedBookmark[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      if (row.type !== 1 || !row.url || !HTTP_URL.test(row.url) || row.url.length > 8192 || seen.has(row.url)) continue;
      seen.add(row.url);
      out.push({ url: row.url, title: (row.title ?? "").slice(0, 1000), folderPath: pathFor(row.parent) });
    }
    return out;
  } finally {
    db?.close();
    snap.cleanup();
  }
}

export function* readSafariHistory(dir: string, batch = 500): Generator<ImportHistoryRow[]> {
  const src = join(dir, "History.db");
  if (!existsSync(src)) return;
  const snap = snapshotSqlite(src);
  let db: DatabaseSync | null = null;
  try {
    db = new DatabaseSync(snap.path);
    yield* queryHistory(
      db,
      "SELECT v.id AS id, i.url AS url, v.title AS title, CAST((v.visit_time + ?)*1000 AS INTEGER) AS t FROM history_visits v JOIN history_items i ON i.id = v.history_item",
      [SAFARI_EPOCH_S],
      "v.id",
      batch,
    );
  } finally {
    db?.close();
    snap.cleanup();
  }
}

/** Rough byte size shown in the preview without touching the store. */
export function sourceStoreSize(profile: ImportProfileRef, files: string[]): number {
  let bytes = 0;
  for (const file of files) {
    try {
      bytes += statSync(join(profile.dir, file)).size;
      if (existsSync(join(profile.dir, `${file}-wal`))) bytes += statSync(join(profile.dir, `${file}-wal`)).size;
    } catch { /* file gone between listing and stat — skip */ }
  }
  return bytes;
}
