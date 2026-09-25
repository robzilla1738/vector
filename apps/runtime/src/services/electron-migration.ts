/** Read-only Electron profile snapshot for the Chromium host's native apply step. */
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { BrowserSpaceSchema, ElectronMigrationManifestSchema, type ElectronMigrationManifest } from "@aux/contracts";
import { AUX_DATABASE_NAME } from "@aux/contracts/installation";
import { sanitizePortablePageRecall } from "@aux/contracts/portable-page-recall";
import { SCHEMA_VERSION } from "../store/db.js";

const MAX_DB = 2 * 1024 * 1024 * 1024;
const MAX_ARTIFACTS = 10_000;
const MAX_ARTIFACT_BYTES = 1024 * 1024 * 1024;
const MAX_LAYOUT_BYTES = 4 * 1024 * 1024;
const validUrl = (value: string) => {
  try { const url = new URL(value); return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password && value.length <= 8192; }
  catch { return false; }
};
const digest = async (path: string) => new Promise<string>((ok, fail) => {
  const hash = createHash("sha256");
  const stream = createReadStream(path);
  stream.on("data", chunk => hash.update(chunk)); stream.on("error", fail);
  stream.on("end", () => ok(hash.digest("hex")));
});
const hashJson = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const contentDigest = (manifest: Pick<ElectronMigrationManifest, "source" | "database" | "layout" | "tabs" | "bookmarks" | "bookmarkFolders" | "artifacts" | "omitted">) =>
  hashJson({ sourceSnapshotSha256: manifest.source.snapshotSha256, databaseSha: manifest.database.sha256,
    layout: manifest.layout, tabs: manifest.tabs, bookmarks: manifest.bookmarks,
    bookmarkFolders: manifest.bookmarkFolders, artifacts: manifest.artifacts, omitted: manifest.omitted });
const table = (db: DatabaseSync, name: string) => !!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(name);
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max ? value : "";
const ids = (value: unknown, max: number) => {
  if (!Array.isArray(value)) return [];
  if (value.length > max) throw new Error("The source layout exceeds migration limits.");
  return value.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 200);
};
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const json = (value: unknown): unknown => { try { return JSON.parse(String(value)); } catch { return undefined; } };
const inside = (root: string, path: string) => { const rel = relative(root, path); return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
async function prospectiveReal(path: string): Promise<string> {
  let ancestor = path;
  const missing: string[] = [];
  while (true) {
    try { return resolve(await realpath(ancestor), ...missing.reverse()); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = dirname(ancestor);
      if (parent === ancestor) throw error;
      missing.push(basename(ancestor)); ancestor = parent;
    }
  }
}

function validateSource(db: DatabaseSync): number {
  const version = Number((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version);
  if (!Number.isInteger(version) || version < 1 || version > SCHEMA_VERSION) throw new Error(`Unsupported Electron Aux database schema ${version}.`);
  if (!table(db, "aux_meta") || (db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value?: string } | undefined)?.value !== "aux") throw new Error("This is not an Aux runtime database.");
  if ((db.prepare("PRAGMA quick_check").get() as { quick_check: string }).quick_check !== "ok") throw new Error("The source database failed integrity checking.");
  for (const name of ["kv", "pages", "tabs", "bookmarks", "workspaces", "artifacts"]) if (!table(db, name)) throw new Error(`The source database is missing ${name}.`);
  if (db.prepare("SELECT 1 FROM sqlite_schema WHERE (type IN ('trigger','view') OR upper(coalesce(sql,'')) LIKE '%VIRTUAL TABLE%') AND name NOT LIKE 'history_fts%' LIMIT 1").get()) throw new Error("The source database contains unsupported executable schema.");
  return version;
}

function portableLayout(raw: string | undefined, db: DatabaseSync) {
  if (raw && Buffer.byteLength(raw) > MAX_LAYOUT_BYTES) throw new Error("The layout export is too large.");
  const source = record(raw ? JSON.parse(raw) : undefined);
  const saved = record(db.prepare("SELECT value FROM kv WHERE key='setting:browserSpaces'").get());
  const dbSpaces = Array.isArray(json(saved.value)) ? BrowserSpaceSchema.array().parse(json(saved.value)) : [];
  const layoutSpaces = [...(Array.isArray(source.spaces) ? source.spaces : []), ...(Array.isArray(source.archivedSpaces) ? source.archivedSpaces : [])];
  const byId = new Map(dbSpaces.map(space => [space.id, space]));
  const cleanSpaces: ElectronMigrationManifest["layout"]["spaces"] = [];
  for (const candidate of layoutSpaces) {
    const space = record(candidate); const id = text(space.id, 200); if (!id || cleanSpaces.some(item => item.id === id)) continue;
    const existing = byId.get(id);
    const parsed = BrowserSpaceSchema.shape.color.safeParse(space.color ?? existing?.color ?? "blue");
    const name = text(space.name, 100).trim() || existing?.name || "Space";
    const layoutWorkspaceId = text(space.workspaceId, 200);
    const workspaceId = existing?.workspaceId ?? (layoutWorkspaceId && db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(layoutWorkspaceId) ? layoutWorkspaceId : deterministicUuid(`aux-space:${id}`));
    cleanSpaces.push({ id, workspaceId, name,
      color: parsed.success ? parsed.data : "blue", archived: !!existing?.archived || !!space.archived || (Array.isArray(source.archivedSpaces) && source.archivedSpaces.includes(candidate)),
      ...(Number.isInteger(space.grain) && Number(space.grain) >= 0 && Number(space.grain) <= 100 ? { grain: Number(space.grain) } : {}) });
  }
  for (const space of dbSpaces) if (!cleanSpaces.some(item => item.id === space.id)) cleanSpaces.push({ ...space });
  if (!cleanSpaces.length) cleanSpaces.push({ id: "space-personal", workspaceId: deterministicUuid("aux-space:space-personal"), name: "Personal", color: "blue", archived: false });
  if (cleanSpaces.length > 200) throw new Error("The source has too many Spaces.");
  if (cleanSpaces.every(space => space.archived)) cleanSpaces[0]!.archived = false;
  const validSpaces = new Set(cleanSpaces.map(space => space.id));
  const activeSpaceId = validSpaces.has(String(source.activeSpaceId)) && !cleanSpaces.find(space => space.id === source.activeSpaceId)?.archived
    ? String(source.activeSpaceId) : cleanSpaces.find(space => !space.archived)!.id;
  const pins: ElectronMigrationManifest["layout"]["pins"] = Object.create(null) as ElectronMigrationManifest["layout"]["pins"];
  for (const [spaceId, list] of Object.entries(record(source.pins))) {
    if (!validSpaces.has(spaceId) || !Array.isArray(list)) continue;
    if (list.length > 1_000) throw new Error("A Space has too many pinned sites.");
    pins[spaceId] = list.flatMap(item => { const pin = record(item); return validUrl(String(pin.url ?? "")) ? [{ url: String(pin.url), title: text(pin.title, 500) }] : []; });
  }
  const folders: ElectronMigrationManifest["layout"]["folders"] = [];
  if (Array.isArray(source.folders) && source.folders.length > 2_000) throw new Error("The source has too many tab folders.");
  for (const item of Array.isArray(source.folders) ? source.folders : []) {
    const folder = record(item), id = text(folder.id, 200), spaceId = text(folder.spaceId, 200), name = text(folder.name, 100).trim();
    if (!id || !name || !validSpaces.has(spaceId) || folders.some(existing => existing.id === id)) continue;
    const color = BrowserSpaceSchema.shape.color.safeParse(folder.color);
    folders.push({ id, spaceId, name, collapsed: !!folder.collapsed, ...(color.success ? { color: color.data } : {}), ...(text(folder.emoji, 16) ? { emoji: String(folder.emoji) } : {}) });
  }
  const activeTabs = Object.fromEntries(Object.entries(record(source.activeTabs)).filter((entry): entry is [string,string] => validSpaces.has(entry[0]) && typeof entry[1] === "string" && entry[1].length <= 200));
  const splits = Object.fromEntries(Object.entries(record(source.splits)).filter((entry): entry is [string,string] => entry[0].length <= 200 && typeof entry[1] === "string" && entry[1].length <= 200 && entry[0] !== entry[1]));
  const ratio = Number(source.splitRatio);
  return { source, layout: { activeSpaceId, spaces: cleanSpaces, order: ids(source.order, 20_000), pins, folders, activeTabs, splits,
    splitRatio: Number.isFinite(ratio) ? Math.min(.9, Math.max(.1, ratio)) : .5 } };
}
function deterministicUuid(input: string) {
  const hex = createHash("sha256").update(input).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

export type ElectronMigrationReport = { path: string | null; dryRun: boolean; alreadyPrepared: boolean; contentHash: string; schemaVersion: number;
  spaces: number; tabs: number; bookmarks: number; artifactFiles: number; omitted: ElectronMigrationManifest["omitted"] };
/** Destination is a new, standalone bundle. Neither this method nor dry run writes into the source tree. */
export async function prepareElectronMigration(input: { sourceDataDir: string; destinationDir: string; layoutJson?: string; dryRun?: boolean }): Promise<ElectronMigrationReport> {
  const sourceRoot = await realpath(input.sourceDataDir);
  const sourceInfo = await lstat(sourceRoot);
  if (!sourceInfo.isDirectory() || sourceInfo.isSymbolicLink()) throw new Error("Choose a regular Electron Aux data directory.");
  const destination = resolve(input.destinationDir);
  if (inside(sourceRoot, destination) || inside(destination, sourceRoot)) throw new Error("Keep the migration bundle outside the source data directory.");
  const sourcePath = join(sourceRoot, AUX_DATABASE_NAME);
  const dbInfo = await lstat(sourcePath);
  if (!dbInfo.isFile() || dbInfo.isSymbolicLink() || dbInfo.size > MAX_DB) throw new Error("The source database is missing or exceeds 2 GB.");
  const realDestination = await prospectiveReal(destination);
  if (inside(sourceRoot, realDestination) || inside(realDestination, sourceRoot)) throw new Error("Keep the migration bundle outside the source data directory.");
  const parent = dirname(destination);
  await mkdir(parent, { recursive: true, mode: 0o700 });
  const stage = join(parent, `.aux-electron-migration-${randomUUID()}`);
  await mkdir(stage, { mode: 0o700 });
  const stagedDbPath = join(stage, AUX_DATABASE_NAME);
  try {
    const source = new DatabaseSync(sourcePath, { readOnly: true });
    let schemaVersion: number;
    try {
      schemaVersion = validateSource(source);
      source.prepare("VACUUM INTO ?").run(stagedDbPath);
    } finally { source.close(); }
    await chmod(stagedDbPath, 0o600);
    const sourceSnapshotSha256 = await digest(stagedDbPath);
    const copied = new DatabaseSync(stagedDbPath);
    let layout: ElectronMigrationManifest["layout"], layoutSource: Record<string, unknown>, tabs: ElectronMigrationManifest["tabs"], bookmarks: ElectronMigrationManifest["bookmarks"];
    let bookmarkFolders: ElectronMigrationManifest["bookmarkFolders"];
    const omitted = { unsafeTabs: 0, unsafeBookmarks: 0, missingArtifacts: 0, vaultMetadata: 0, layoutMissing: !input.layoutJson };
    let artifactRows: { artifact_id: string; path: string; status: string }[];
    try {
      ({ source: layoutSource, layout } = portableLayout(input.layoutJson, copied));
      const knownSpaces = new Set(layout.spaces.map(space => space.id));
      const tabSpace = record(layoutSource.tabSpace), tabFolder = record(layoutSource.tabFolder), tabNames = record(layoutSource.tabNames);
      const validFolders = new Set(layout.folders.map(folder => folder.id));
      const rows = copied.prepare("SELECT page_id,window_id,ordinal,url,title,active FROM tabs ORDER BY window_id,ordinal,page_id").all() as { page_id:string;window_id:string;ordinal:number;url:string;title:string;active:number }[];
      if (rows.length > 20_000) throw new Error("The source has too many tabs.");
      tabs = rows.flatMap(row => {
        if (!validUrl(row.url) || !row.page_id || row.page_id.length > 200 || !row.window_id || row.window_id.length > 200 || !Number.isInteger(row.ordinal) || row.ordinal < 0) { omitted.unsafeTabs++; return []; }
        const spaceId = typeof tabSpace[row.page_id] === "string" && knownSpaces.has(String(tabSpace[row.page_id])) ? String(tabSpace[row.page_id]) : layout.activeSpaceId;
        const folderId = typeof tabFolder[row.page_id] === "string" && validFolders.has(String(tabFolder[row.page_id])) ? String(tabFolder[row.page_id]) : undefined;
        const named = record(tabNames[row.page_id]);
        const label = named.url === row.url && text(named.title, 60).trim().length >= 2 ? String(named.title) : undefined;
        return [{ sourcePageId: row.page_id, sourceWindowId: row.window_id || "main", ordinal: row.ordinal, url: row.url,
          title: text(row.title, 500), spaceId, ...(folderId ? { folderId } : {}), active: !!row.active, ...(label ? { label } : {}) }];
      });
      const migratedPageIds = new Set(tabs.map(tab => tab.sourcePageId));
      layout.order = [...new Set(layout.order.filter(pageId => migratedPageIds.has(pageId)))];
      layout.activeTabs = Object.fromEntries(Object.entries(layout.activeTabs).filter(([,pageId]) => migratedPageIds.has(pageId)));
      layout.splits = Object.fromEntries(Object.entries(layout.splits).filter(([pageId,other]) => migratedPageIds.has(pageId) && migratedPageIds.has(other)));
      const bookmarkRows = copied.prepare("SELECT url,title,folder_path,reading_list,read_at,created_at FROM bookmarks ORDER BY created_at,url").all() as {url:string;title:string;folder_path:string;reading_list:number;read_at:number|null;created_at:number}[];
      if (bookmarkRows.length > 100_000) throw new Error("The source has too many bookmarks.");
      bookmarks = bookmarkRows.flatMap(row => {
        const path = json(row.folder_path);
        if (!validUrl(row.url) || !Number.isFinite(row.created_at) || !Array.isArray(path) || path.length > 16 || path.some(part => typeof part !== "string" || !part || part.length > 200)) { omitted.unsafeBookmarks++; return []; }
        return [{ url: row.url, title: text(row.title, 500), folderPath: path as string[], readingList: !!row.reading_list, readAt: row.read_at, createdAt: row.created_at }];
      });
      const folderRows = copied.prepare("SELECT path FROM bookmark_folders ORDER BY path").all() as { path: string }[];
      if (folderRows.length > 10_000) throw new Error("The source has too many bookmark folders.");
      bookmarkFolders = folderRows.map(row => json(row.path))
        .filter((path): path is string[] => Array.isArray(path) && path.length <= 16 && path.every(part => typeof part === "string" && !!part && part.length <= 200));
      // The runtime copy retains history and task provenance, but no live Electron controller, grant, or OS-bound secret reference.
      copied.exec("BEGIN");
      try {
        for (const space of layout.spaces) {
          if (!copied.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(space.workspaceId))
            copied.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES(?,?,?)").run(space.workspaceId, space.name, 0);
        }
        copied.prepare("INSERT INTO kv(key,value) VALUES('setting:browserSpaces',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
          .run(JSON.stringify(layout.spaces));
        copied.prepare("DELETE FROM tabs").run();
        copied.prepare("UPDATE sessions SET status='disconnected',detail='Migrated from Electron Aux'").run();
        const keptBookmarks = new Set(bookmarks.map(bookmark => bookmark.url));
        for (const row of bookmarkRows) if (!keptBookmarks.has(row.url)) copied.prepare("DELETE FROM bookmark_articles WHERE url=?").run(row.url);
        for (const row of bookmarkRows) if (!keptBookmarks.has(row.url)) copied.prepare("DELETE FROM bookmarks WHERE url=?").run(row.url);
        for (const space of layout.spaces) copied.prepare("UPDATE workspaces SET name=? WHERE workspace_id=?").run(space.name, space.workspaceId);
        copied.prepare("UPDATE pages SET view_status='detached',controller='none',detached=1,target_id='' ").run();
        if (table(copied, "vault_access")) copied.prepare("DELETE FROM vault_access").run();
        if (table(copied, "vault_grants")) copied.prepare("DELETE FROM vault_grants").run();
        if (table(copied, "vault_items")) { omitted.vaultMetadata = Number((copied.prepare("SELECT count(*) AS n FROM vault_items").get() as {n:number}).n); copied.prepare("DELETE FROM vault_items").run(); }
        for (const name of ["calendar_task_grants", "calendar_connections", "agent_connections", "mcp_connections", "mcp_grants", "mcp_tokens"]) if (table(copied, name)) copied.prepare(`DELETE FROM ${name}`).run();
        copied.prepare("DELETE FROM kv WHERE lower(key) GLOB '*token*' OR lower(key) GLOB '*secret*' OR lower(key) GLOB '*apikey*' OR lower(key) GLOB '*oauth*' OR lower(key) GLOB '*credential*' OR lower(key) GLOB '*vault*' OR lower(key) GLOB '*mcp*' OR lower(key) GLOB '*calendar*' OR lower(key) GLOB '*cloud*'").run();
        if (table(copied, "routines")) copied.prepare("UPDATE routines SET paused=1").run();
        if (table(copied, "runs")) copied.prepare("UPDATE runs SET status='cancelled',ended_at=coalesce(ended_at,created_at) WHERE status NOT IN ('done','failed','cancelled','needs_input')").run();
        if (table(copied, "run_messages")) copied.prepare("UPDATE run_messages SET status='cancelled' WHERE status IN ('accepted','delivering','needs_attention')").run();
        if (table(copied, "action_intents")) copied.prepare("UPDATE action_intents SET status='uncertain' WHERE status='pending'").run();
        if (table(copied, "downloads")) copied.prepare("DELETE FROM downloads").run();
        copied.exec("COMMIT");
      } catch (error) { copied.exec("ROLLBACK"); throw error; }
      sanitizePortablePageRecall(copied);
      artifactRows = copied.prepare("SELECT artifact_id,path,status FROM artifacts ORDER BY artifact_id").all() as typeof artifactRows;
      if (artifactRows.length > MAX_ARTIFACTS) throw new Error("The source has too many artifacts.");
    } finally { copied.close(); }
    const artifacts: ElectronMigrationManifest["artifacts"] = [];
    const sourceArtifacts = resolve(sourceRoot, "artifacts");
    let artifactBytes = 0;
    const staged = new DatabaseSync(stagedDbPath);
    try {
      for (const row of artifactRows) {
        let safe = false, sourceFile = "";
        try {
          if (!/^[A-Za-z0-9_-]{1,128}$/.test(row.artifact_id)) throw new Error("Invalid artifact id.");
          if ((await lstat(row.path)).isSymbolicLink()) throw new Error("Symlink artifact.");
          sourceFile = await realpath(row.path);
          const info = await lstat(sourceFile);
          safe = inside(sourceArtifacts, sourceFile) && info.isFile() && !info.isSymbolicLink() && artifactBytes + info.size <= MAX_ARTIFACT_BYTES;
        } catch { /* Missing or nonportable artifact. */ }
        if (!safe) {
          omitted.missingArtifacts++;
          staged.prepare("UPDATE artifacts SET status='failed',path='' WHERE artifact_id=?").run(row.artifact_id);
          continue;
        }
        const ext = extname(basename(sourceFile)).match(/^\.[a-zA-Z0-9]{1,10}$/)?.[0] ?? "";
        const relativePath = join("artifacts", "migrated", `${row.artifact_id}${ext}`);
        const stagedFile = join(stage, relativePath);
        await mkdir(dirname(stagedFile), { recursive: true, mode: 0o700 });
        const sourceDigest = await digest(sourceFile);
        await copyFile(sourceFile, stagedFile); await chmod(stagedFile, 0o600);
        const info = await stat(stagedFile); artifactBytes += info.size;
        const copiedDigest = await digest(stagedFile);
        if (copiedDigest !== sourceDigest) throw new Error("An artifact changed while the source profile was being copied. Close the source app and retry.");
        staged.prepare("UPDATE artifacts SET path=? WHERE artifact_id=?").run(join(destination, relativePath), row.artifact_id);
        artifacts.push({ artifactId: row.artifact_id, relativePath, bytes: info.size, sha256: copiedDigest });
      }
      staged.exec("VACUUM");
    } finally { staged.close(); }
    const databaseInfo = await stat(stagedDbPath);
    if (databaseInfo.size > MAX_DB) throw new Error("The migration database exceeds 2 GB.");
    const databaseSha = await digest(stagedDbPath);
    const canonical = ElectronMigrationManifestSchema.parse({ format: "aux-electron-to-chromium", version: 1, contentHash: "0".repeat(64),
      createdAt: Date.now(), source: { schemaVersion, snapshotSha256: sourceSnapshotSha256 },
      database: { relativePath: AUX_DATABASE_NAME, sha256: databaseSha, bytes: databaseInfo.size },
      layout, tabs, bookmarks, bookmarkFolders, artifacts, omitted });
    const contentHash = contentDigest(canonical);
    const manifest: ElectronMigrationManifest = { ...canonical, contentHash };
    const report = (path: string | null, dryRun: boolean, alreadyPrepared: boolean): ElectronMigrationReport => ({
      path, dryRun, alreadyPrepared, contentHash, schemaVersion, spaces: layout.spaces.length, tabs: tabs.length,
      bookmarks: bookmarks.length, artifactFiles: artifacts.length, omitted });
    let existing: Awaited<ReturnType<typeof lstat>> | undefined;
    try { existing = await lstat(destination); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (existing) {
      if (!existing.isDirectory() || existing.isSymbolicLink()) throw new Error("The destination already exists and is not a migration bundle.");
      const current = ElectronMigrationManifestSchema.parse(JSON.parse(await readFile(join(destination, "manifest.json"), "utf8")));
      const currentDatabase = await lstat(join(destination, AUX_DATABASE_NAME));
      if (current.contentHash !== contentHash || current.contentHash !== contentDigest(current) || !currentDatabase.isFile() ||
          currentDatabase.isSymbolicLink() || currentDatabase.size !== current.database.bytes || current.database.sha256 !== await digest(join(destination, AUX_DATABASE_NAME)))
        throw new Error("The destination contains different or damaged migration data.");
      for (const item of current.artifacts) {
        const path = join(destination, item.relativePath);
        const info = await lstat(path);
        if (!info.isFile() || info.isSymbolicLink() || info.size !== item.bytes || await digest(path) !== item.sha256)
          throw new Error("The destination contains a damaged migration artifact.");
      }
      return report(input.dryRun ? null : destination, !!input.dryRun, true);
    }
    if (input.dryRun) return report(null, true, false);
    await writeFile(join(stage, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { mode: 0o600 });
    await rename(stage, destination);
    return report(destination, false, false);
  } finally { await rm(stage, { recursive: true, force: true }); }
}
