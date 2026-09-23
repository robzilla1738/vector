import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterAll, expect, it } from "vitest";
import {
  BrowserImporter,
  Repo,
  openDb,
  readArcSidebar,
  readChromiumBookmarks,
  readChromiumHistory,
  readFirefoxBookmarks,
  readFirefoxHistory,
  snapshotSqlite,
} from "@aux/runtime";

const dirs: string[] = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), "aux-import-test-")); dirs.push(d); return d; };
afterAll(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

const CHROME_EPOCH = 11_644_473_600_000;

function chromiumProfile(visits = 3): string {
  const dir = join(tmp(), "Default");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "Bookmarks"), JSON.stringify({
    roots: {
      bookmark_bar: { type: "folder", name: "Bookmarks bar", children: [
        { type: "url", name: "Example", url: "https://example.com/" },
        { type: "folder", name: "Dev", children: [{ type: "url", name: "Docs", url: "https://developer.mozilla.org/" }] },
      ] },
      other: { type: "folder", children: [] },
      synced: { type: "folder", children: [] },
    },
  }));
  const db = new DatabaseSync(join(dir, "History"));
  db.exec("CREATE TABLE urls(id INTEGER PRIMARY KEY, url TEXT, title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY, url INTEGER, visit_time INTEGER);");
  db.prepare("INSERT INTO urls(id,url,title) VALUES(1,'https://a.example/','A'),(2,'https://b.example/','B')").run();
  // Chrome visit_time is microseconds since 1601 — (unix_ms + epoch_ms) * 1000.
  if (visits <= 3) {
    db.prepare("INSERT INTO visits(id,url,visit_time) VALUES(1,1,?),(2,2,?),(3,1,?)")
      .run((1_700_000_000_000 + CHROME_EPOCH) * 1000, (1_700_000_100_000 + CHROME_EPOCH) * 1000, (1_700_000_200_000 + CHROME_EPOCH) * 1000);
  } else {
    const insert = db.prepare("INSERT INTO visits(id,url,visit_time) VALUES(?,1,?)");
    for (let i = 1; i <= visits; i++) insert.run(i, (1_700_000_000_000 + CHROME_EPOCH + i * 1000) * 1000);
  }
  db.close();
  return dir;
}

function firefoxProfile(): string {
  const dir = join(tmp(), "abc.default-release");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "places.sqlite"));
  db.exec("CREATE TABLE moz_places(id INTEGER PRIMARY KEY, url TEXT, title TEXT);" +
    "CREATE TABLE moz_bookmarks(id INTEGER PRIMARY KEY, type INTEGER, fk INTEGER, parent INTEGER, position INTEGER, title TEXT);" +
    "CREATE TABLE moz_historyvisits(id INTEGER PRIMARY KEY, place_id INTEGER, visit_date INTEGER);");
  db.prepare("INSERT INTO moz_places(id,url,title) VALUES(1,'https://ff.example/','FF'),(2,'https://deep.example/','Deep')").run();
  // id 3 = "Bookmarks toolbar" root child → bookmark under [Bookmarks toolbar, Tools]
  db.prepare("INSERT INTO moz_bookmarks(id,type,fk,parent,position,title) VALUES" +
    "(10,2,NULL,3,0,'Tools'),(11,1,1,3,1,'FF'),(12,1,2,10,0,'Deep')").run();
  db.prepare("INSERT INTO moz_historyvisits(id,place_id,visit_date) VALUES(1,1,?),(2,2,?)").run(1_700_000_000_000_000, 1_700_000_100_000_000);
  db.close();
  return dir;
}

it("reads Chromium bookmarks into folder paths and history off a WAL snapshot", () => {
  const profile = chromiumProfile();
  const bookmarks = readChromiumBookmarks(profile);
  expect(bookmarks).toEqual([
    { url: "https://example.com/", title: "Example", folderPath: ["Bookmarks bar"] },
    { url: "https://developer.mozilla.org/", title: "Docs", folderPath: ["Bookmarks bar", "Dev"] },
  ]);
  const rows = [...readChromiumHistory(profile)].flat();
  expect(rows).toHaveLength(3);
  expect(rows[0]!.visitedAt).toBe(1_700_000_200_000); // newest first
  expect(rows.every(r => r.visitedAt < CHROME_EPOCH)).toBe(true);
});

it("copies live WAL contents into the snapshot without touching the source", () => {
  const dir = tmp();
  const src = join(dir, "live.db");
  const db = new DatabaseSync(src);
  db.exec("PRAGMA journal_mode=WAL; CREATE TABLE t(v TEXT);");
  db.prepare("INSERT INTO t VALUES('in-wal')").run();
  // Data still sits in the -wal file — a naive copy of just the db would miss it.
  const snap = snapshotSqlite(src);
  const copy = new DatabaseSync(snap.path);
  expect(copy.prepare("SELECT v FROM t").all()).toEqual([{ v: "in-wal" }]);
  copy.close(); snap.cleanup(); db.close();
});

it("maps Arc Spaces and pinned tabs into bookmark folders", () => {
  const dir = tmp();
  writeFileSync(join(dir, "StorableSidebar.json"), JSON.stringify({
    sidebar: { containers: [
      { spaces: [{ id: "s1", title: "Work" }, { id: "s2", title: "Personal" }],
        items: [
          { id: "f1", spaceID: "s1", title: "Projects", data: { itemContainer: {} } },
          { id: "i1", parentID: "f1", spaceID: "s1", data: { tab: { savedURL: "https://repo.example/", customTitle: "Repo" } } },
          { id: "i2", spaceID: "s2", data: { tab: { savedURL: "https://mail.example/" } } },
          { id: "i3", spaceID: "s2", data: { tab: { savedURL: "chrome://newtab" } } },
        ] },
    ] },
  }));
  const { bookmarks, skipped } = readArcSidebar(dir);
  expect(bookmarks).toEqual([
    { url: "https://repo.example/", title: "Repo", folderPath: ["Work", "Projects"] },
    { url: "https://mail.example/", title: "", folderPath: ["Personal"] },
  ]);
  expect(skipped).toBe(1);
});

it("reads Firefox bookmarks with folder chains and history visits", () => {
  const profile = firefoxProfile();
  const bookmarks = readFirefoxBookmarks(profile);
  expect(bookmarks).toContainEqual({ url: "https://ff.example/", title: "FF", folderPath: ["Bookmarks toolbar"] });
  expect(bookmarks).toContainEqual({ url: "https://deep.example/", title: "Deep", folderPath: ["Bookmarks toolbar", "Tools"] });
  const rows = [...readFirefoxHistory(profile)].flat();
  expect(rows).toEqual([
    { url: "https://deep.example/", title: "Deep", visitedAt: 1_700_000_100_000 },
    { url: "https://ff.example/", title: "FF", visitedAt: 1_700_000_000_000 },
  ]);
});

function fixtureRepo() {
  return new Repo(openDb(":memory:"));
}

it("importBookmarks dedupes and importHistory preserves visit timestamps", () => {
  const repo = fixtureRepo();
  const first = repo.importBookmarks([{ url: "https://x.example/", title: "X", folderPath: ["A"] }, { url: "https://x.example/", title: "X dup", folderPath: ["A"] }]);
  expect(first).toEqual({ added: 1, skipped: 1 });
  const h = repo.importHistory([{ url: "https://x.example/", title: "X", visitedAt: 1_700_000_000_000 }, { url: "https://x.example/", title: "X", visitedAt: 1_700_000_000_000 }]);
  expect(h).toEqual({ added: 1, skipped: 1 });
  const listed = repo.listHistory("x.example");
  expect(listed[0]!.visitedAt).toBe(1_700_000_000_000);
});

it("runs a preview + partial-result import over injected sources", async () => {
  const profile = chromiumProfile();
  const repo = fixtureRepo();
  const events: { type: string; payload: Record<string, unknown> }[] = [];
  const importer = new BrowserImporter({
    repo,
    emit: (type, payload) => events.push({ type, payload }),
    sources: () => [{ id: "chrome", label: "Chrome", profiles: [{ id: "Default", dir: profile }] }],
  });
  const preview = await importer.preview();
  const chrome = preview.sources.find(s => s.id === "chrome")!;
  expect(chrome.categories.find(c => c.category === "bookmarks")).toMatchObject({ available: true, count: 2 });
  expect(chrome.categories.find(c => c.category === "history")).toMatchObject({ available: true });

  const report = await importer.runNow({ sources: ["chrome"] });
  const bookmarks = report.results.find(r => r.category === "bookmarks")!;
  const history = report.results.find(r => r.category === "history")!;
  expect(bookmarks).toMatchObject({ state: "done", imported: 2 });
  expect(history).toMatchObject({ state: "done", imported: 3 });
  expect(repo.listHistory("a.example").length).toBe(2);
  expect(events.some(e => e.type === "bookmarks.changed")).toBe(true);
  expect(events.some(e => e.type === "import.progress" && e.payload.done === true)).toBe(true);
});

it("opens live tabs from an attached Chrome and reports partial failures", async () => {
  const repo = fixtureRepo();
  const opened: string[] = [];
  const importer = new BrowserImporter({
    repo,
    emit: () => {},
    sources: () => [],
    chromeTabs: async () => [
      { type: "page", url: "https://one.example/", title: "One" },
      { type: "page", url: "https://two.example/", title: "Two" },
      { type: "page", url: "chrome://settings", title: "Settings" },
      { type: "page", url: "https://fail.example/", title: "Fail" },
    ],
    openTab: async url => { if (url.includes("fail")) throw new Error("no"); opened.push(url); },
  });
  const report = await importer.runNow({ categories: ["tabs"] });
  expect(opened).toEqual(["https://one.example/", "https://two.example/"]);
  expect(report.results[0]).toMatchObject({ source: "chrome-attached", state: "done", imported: 2, skipped: 1 });
});

it("cancel stops a running history import between batches", async () => {
  const profile = chromiumProfile(1500); // three 500-row batches
  const repo = fixtureRepo();
  const importer = new BrowserImporter({
    repo,
    emit: () => {},
    sources: () => [{ id: "chrome", label: "Chrome", profiles: [{ id: "Default", dir: profile }] }],
  });
  const { jobId } = importer.start({ sources: ["chrome"], categories: ["history"] });
  importer.cancel(jobId);
  await new Promise(resolve => setTimeout(resolve, 100));
  const status = importer.status(jobId);
  expect(status.done).toBe(true);
  expect(status.report!.cancelled).toBe(true);
  // At least one batch landed, but not all 1500 rows.
  const imported = repo.listHistory(undefined, 2000).length;
  expect(imported).toBeGreaterThan(0);
  expect(imported).toBeLessThan(1500);
});
