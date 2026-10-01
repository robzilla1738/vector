import { afterEach, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDb, prepareElectronMigration, Repo } from "@aux/runtime";
import { ElectronMigrationManifestSchema } from "@aux/contracts";

const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const sourceSnapshot = (root: string) => readdirSync(root).sort().filter(name => !name.endsWith("-shm") && statSync(join(root, name)).isFile()).map(name => [name, sha(join(root, name))]);
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aux-migrate-fixture-")); dirs.push(root);
  const source = join(root, "electron"), output = join(root, "bundle");
  mkdirSync(source);
  writeFileSync(join(source, "Cookies"), "COOKIE_MUST_STAY_IN_SOURCE");
  const database = join(source, "aux-state.sqlite");
  const db = openDb(database);
  const repo = new Repo(db);
  db.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES('w1','Work',1)").run();
  repo.setSetting("browserSpaces", [{ id: "space-work", workspaceId: "w1", name: "Work", color: "violet", archived: false }]);
  repo.setSetting("gatewayApiKey", "SECRET_API_KEY");
  repo.setSetting("vaultLock", { salt: "s", hash: "h" });
  repo.setSetting("effectGrants", [{ effect: "write" }]);
  db.prepare("INSERT INTO pages(page_id,backend,target_id,url,title,view_status,controller,owned,created_at,active_at) VALUES('p1','aux','electron-target','https://example.com','Example','visible','human',0,1,1)").run();
  db.prepare("INSERT INTO tabs(page_id,ordinal,url,title,backend,active,window_id) VALUES('p1',0,'https://example.com','Example','aux',1,'main')").run();
  db.prepare("INSERT INTO bookmarks(url,title,created_at,folder_path,reading_list) VALUES('https://example.com/docs','Docs',1,'[\"Reading\"]',1)").run();
  db.prepare("INSERT INTO bookmark_folders(path) VALUES('[\"Reading\"]')").run();
  db.prepare("INSERT INTO vault_items(item_id,label,kind,origin,created_at,updated_at) VALUES('v1','Secret','password','https://example.com',1,1)").run();
  db.prepare("INSERT INTO agent_connections(connection_id,name,client,scope_kind,workspace_id,token_hash,created_at) VALUES('c1','Agent','test','workspace','w1','TOKEN_HASH',1)").run();
  db.prepare("INSERT INTO safety_standing_grants(grant_id,profile_id,scope_kind,scope_id,effect,action,lifetime,created_at) VALUES('g1','electron','workspace','w1','write','submit','always',1)").run();
  db.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES('s1','w1','approved','{}',1,1)").run();
  db.prepare("INSERT INTO outbound_mcp_grants(grant_id,server_id,tool_name,body) VALUES('mg1','s1','search','{}')").run();
  db.prepare("INSERT INTO hooks(hook_id,workspace_id,event,trust,body,created_at,updated_at) VALUES('h1','w1','afterRun','approved','{}',1,1)").run();
  mkdirSync(join(source, "artifacts", "run1"), { recursive: true });
  const artifact = join(source, "artifacts", "run1", "report.txt");
  writeFileSync(artifact, "migrated artifact");
  db.prepare("INSERT INTO artifacts(artifact_id,path,media_type,size,status,created_at) VALUES('a1',?,'text/plain',17,'complete',1)").run(artifact);
  const layoutJson = JSON.stringify({ spaces: [{ id: "space-work", name: "Work", color: "violet" }], activeSpaceId: "space-work",
    tabSpace: { p1: "space-work" }, order: ["p1"], pins: { "space-work": [{ url: "https://example.com", title: "Example" }] },
    folders: [{ id: "f1", name: "Research", spaceId: "space-work", collapsed: false }], tabFolder: { p1: "f1" },
    tabNames: { p1: { url: "https://example.com", title: "Research Home" } }, activeTabs: { "space-work": "p1" }, splitGroups: [], splitRatio: .5 });
  return { source, output, db, database, artifact, layoutJson };
}

it("prepares a copy-based manifest, scrubs host secrets, and repeats without duplicate output", async () => {
  const f = fixture();
  const before = sha(f.database), artifactBefore = sha(f.artifact);
  const sourceFiles = sourceSnapshot(f.source);
  const dry = await prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson, dryRun: true });
  expect(dry).toMatchObject({ dryRun: true, path: null, tabs: 1, bookmarks: 1, spaces: 1, artifactFiles: 1 });
  expect(existsSync(f.output)).toBe(false);
  const first = await prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson });
  expect(first.alreadyPrepared).toBe(false);
  const manifest = ElectronMigrationManifestSchema.parse(JSON.parse(readFileSync(join(f.output, "manifest.json"), "utf8")));
  expect(() => ElectronMigrationManifestSchema.parse({ ...manifest, tabs: [...manifest.tabs, manifest.tabs[0]] })).toThrow();
  expect(manifest.tabs).toMatchObject([{ sourcePageId: "p1", spaceId: "space-work", folderId: "f1", label: "Research Home" }]);
  expect(manifest.bookmarks).toMatchObject([{ url: "https://example.com/docs", folderPath: ["Reading"], readingList: true }]);
  expect(manifest.layout.pins["space-work"]).toMatchObject([{ url: "https://example.com" }]);
  expect(sha(join(f.output, "aux-state.sqlite"))).toBe(manifest.database.sha256);
  const copied = new DatabaseSync(join(f.output, "aux-state.sqlite"), { readOnly: true });
  expect((copied.prepare("SELECT count(*) AS n FROM tabs").get() as { n: number }).n).toBe(0);
  expect(copied.prepare("SELECT view_status,controller,target_id FROM pages WHERE page_id='p1'").get()).toMatchObject({ view_status: "detached", controller: "none", target_id: "" });
  expect((copied.prepare("SELECT count(*) AS n FROM vault_items").get() as { n: number }).n).toBe(0);
  expect((copied.prepare("SELECT count(*) AS n FROM agent_connections").get() as { n: number }).n).toBe(0);
  expect((copied.prepare("SELECT count(*) AS n FROM safety_standing_grants").get() as { n: number }).n).toBe(0);
  expect((copied.prepare("SELECT count(*) AS n FROM outbound_mcp_grants").get() as { n: number }).n).toBe(0);
  expect(copied.prepare("SELECT trust FROM hooks WHERE hook_id='h1'").get()).toMatchObject({ trust: "untrusted" });
  expect(copied.prepare("SELECT value FROM kv WHERE key='setting:gatewayApiKey'").get()).toBeUndefined();
  expect(copied.prepare("SELECT value FROM kv WHERE key='setting:effectGrants'").get()).toBeUndefined();
  const artifactPath = (copied.prepare("SELECT path FROM artifacts WHERE artifact_id='a1'").get() as { path: string }).path;
  expect(artifactPath).toBe(join(f.output, manifest.artifacts[0]!.relativePath));
  expect(readFileSync(artifactPath, "utf8")).toBe("migrated artifact");
  expect(existsSync(join(f.output, "Cookies"))).toBe(false);
  copied.close();
  const second = await prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson });
  expect(second).toMatchObject({ alreadyPrepared: true, contentHash: first.contentHash });
  writeFileSync(join(f.output, "manifest.json"), JSON.stringify({ ...manifest, tabs: [{ ...manifest.tabs[0], title: "tampered" }] }));
  await expect(prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson })).rejects.toThrow(/different or damaged/);
  expect(sha(f.database)).toBe(before);
  expect(sha(f.artifact)).toBe(artifactBefore);
  expect(sourceSnapshot(f.source)).toEqual(sourceFiles);
  f.db.close();
});

it("refuses an existing unmarked output directory", async () => {
  const f = fixture();
  mkdirSync(f.output);
  await expect(prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson })).rejects.toThrow();
  expect(readdirSync(f.output)).toEqual([]);
  f.db.close();
});

it("refuses protected copied databases before interpreting encrypted browser Spaces", async () => {
  const f = fixture();
  f.db.prepare("UPDATE kv SET value='auxenc:v1:sealed' WHERE key='setting:browserSpaces'").run();
  f.db.prepare("INSERT INTO aux_meta(key,value) VALUES('protected_sqlite_v1:kv_filtered','sealed')").run();
  await expect(prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output,
    layoutJson: f.layoutJson })).rejects.toThrow(/reviewed recovery/);
  expect(existsSync(f.output)).toBe(false);
  f.db.close();
});

it("rejects a conflicting bundle and never copies unsafe URLs", async () => {
  const f = fixture();
  f.db.prepare("INSERT INTO pages(page_id,backend,target_id,url,title,created_at,active_at) VALUES('p2','aux','x','file:///private','Local',1,1)").run();
  f.db.prepare("INSERT INTO tabs(page_id,ordinal,url,title,backend,active,window_id) VALUES('p2',1,'file:///private','Local','aux',0,'main')").run();
  const first = await prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson });
  expect(first.omitted.unsafeTabs).toBe(1);
  f.db.prepare("INSERT INTO bookmarks(url,title,created_at) VALUES('https://new.test','New',2)").run();
  await expect(prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson, dryRun: true })).rejects.toThrow(/different/);
  await expect(prepareElectronMigration({ sourceDataDir: f.source, destinationDir: f.output, layoutJson: f.layoutJson })).rejects.toThrow(/different/);
  f.db.close();
});
