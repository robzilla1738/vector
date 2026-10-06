import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { afterAll, expect, it, vi } from "vitest";
import { BrowserImporter, Repo, openDb } from "@aux/runtime";
import { MethodSchemas, ResultSchemas } from "@aux/contracts";

const dirs: string[] = [];
const databases: DatabaseSync[] = [];
const temporary = () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-import-recovery-"));
  dirs.push(dir);
  return dir;
};
const repository = (path = ":memory:") => {
  const db = openDb(path);
  databases.push(db);
  return new Repo(db);
};
afterAll(() => {
  for (const db of databases) db.close();
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});
const digest = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const selection = (sourceId: string, category: "bookmarks" | "history" = "history") => [
  { sourceId, profileId: "Reviewed", categories: [category] },
];

function historyFixture(source: "chrome" | "arc" | "safari" | "firefox", count = 1001) {
  const dir = temporary();
  const file = join(
    dir,
    source === "safari" ? "History.db" : source === "firefox" ? "places.sqlite" : "History",
  );
  const db = new DatabaseSync(file);
  let insert;
  if (source === "safari") {
    db.exec(
      "CREATE TABLE history_items(id INTEGER PRIMARY KEY,url TEXT); CREATE TABLE history_visits(id INTEGER PRIMARY KEY,history_item INTEGER,title TEXT,visit_time REAL); INSERT INTO history_items VALUES(1,'https://import.example/history');",
    );
    insert = db.prepare("INSERT INTO history_visits VALUES(?,1,'Safari',?)");
  } else if (source === "firefox") {
    db.exec(
      "CREATE TABLE moz_places(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE moz_historyvisits(id INTEGER PRIMARY KEY,place_id INTEGER,visit_date INTEGER); INSERT INTO moz_places VALUES(1,'https://import.example/history','Firefox');",
    );
    insert = db.prepare("INSERT INTO moz_historyvisits VALUES(?,1,?)");
  } else {
    db.exec(
      "CREATE TABLE urls(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY,url INTEGER,visit_time INTEGER); INSERT INTO urls VALUES(1,'https://import.example/history','Chromium');",
    );
    insert = db.prepare("INSERT INTO visits VALUES(?,1,?)");
  }
  db.exec("BEGIN");
  for (let i = 0; i < count; i++) {
    const time = 1_700_000_000_000 + i * 1000;
    insert.run(
      i + 1,
      source === "safari"
        ? time / 1000 - 978_307_200
        : source === "firefox"
          ? time * 1000
          : (time + 11_644_473_600_000) * 1000,
    );
  }
  db.exec("COMMIT");
  db.close();
  return { dir, file, source: { id: source, label: source, profiles: [{ id: "Reviewed", dir }] } };
}

it.each(["chrome", "arc", "safari", "firefox"] as const)(
  "retains confirmed %s history counts after a later batch fails and merges a reviewed retry",
  async (id) => {
    const fixture = historyFixture(id),
      before = digest(fixture.file),
      repo = repository();
    let calls = 0;
    const importer = new BrowserImporter({
      repo,
      sources: () => [fixture.source],
      emit: () => {},
      native: {
        available: () => true,
        historyImport: async (rows: Parameters<Repo["importHistory"]>[0]) => {
          if (++calls === 2)
            throw new Error(`Cannot read ${fixture.dir}/secret https://do-not-persist.example/`);
          return repo.importHistory(rows);
        },
      } as never,
    });
    const failed = await importer.runNow({ selections: selection(id) });
    expect(failed.results[0]).toMatchObject({
      profileId: "Reviewed",
      state: "error",
      imported: 500,
      skipped: 0,
    });
    expect(repo.listHistory(undefined, 2000)).toHaveLength(500);
    const receipts = JSON.stringify(repo.getSetting("browser-import.receipts.v1"));
    expect(receipts).not.toContain(fixture.dir);
    expect(receipts).not.toContain("https://");
    const discovery = vi.fn(() => [fixture.source]);
    const resumed = new BrowserImporter({
      repo,
      sources: discovery,
      emit: () => {},
      native: {
        available: () => true,
        historyImport: async (rows: Parameters<Repo["importHistory"]>[0]) => repo.importHistory(rows),
      } as never,
    });
    expect(resumed.status()).toMatchObject({
      done: true,
      report: { results: [expect.objectContaining({ imported: 500, state: "error" })] },
    });
    expect(discovery).not.toHaveBeenCalled();
    expect((await resumed.preview()).sources[0]?.id).toBe(id);
    const retry = await resumed.runNow({ selections: selection(id) });
    expect(retry.results[0]).toMatchObject({ state: "done", imported: 501, skipped: 500 });
    expect(repo.listHistory(undefined, 2000)).toHaveLength(1001);
    expect(digest(fixture.file)).toBe(before);
  },
);

it("preserves existing bookmark titles and folders through partial native-seam failure and retry", async () => {
  const dir = temporary(),
    file = join(dir, "Bookmarks"),
    repo = repository();
  writeFileSync(
    file,
    JSON.stringify({
      roots: {
        bookmark_bar: {
          type: "folder",
          name: "Imported",
          children: Array.from({ length: 1001 }, (_, index) => ({
            type: "url",
            name: `Incoming ${index}`,
            url: `https://import.example/${index}`,
          })),
        },
      },
    }),
  );
  const before = digest(file);
  repo.importBookmarks([
    { url: "https://import.example/0", title: "Owner title", folderPath: ["Owner folder"] },
  ]);
  let calls = 0;
  const importer = new BrowserImporter({
    repo,
    emit: () => {},
    sources: () => [{ id: "chrome", label: "Chrome", profiles: [{ id: "Reviewed", dir }] }],
    native: {
      available: () => true,
      bookmarksInvoke: async (
        _method: string,
        params: { bookmarks: Parameters<Repo["importBookmarks"]>[0] },
      ) => {
        if (++calls === 2) throw new Error("Destination unavailable");
        return repo.importBookmarks(params.bookmarks);
      },
    } as never,
  });
  expect((await importer.runNow({ selections: selection("chrome", "bookmarks") })).results[0]).toMatchObject({
    state: "error",
    imported: 499,
    skipped: 1,
  });
  await importer.preview();
  expect((await importer.runNow({ selections: selection("chrome", "bookmarks") })).results[0]).toMatchObject({
    state: "done",
    imported: 501,
    skipped: 500,
  });
  expect(repo.listBookmarks().find((item) => item.url === "https://import.example/0")).toMatchObject({
    title: "Owner title",
    folderPath: ["Owner folder"],
  });
  expect(digest(file)).toBe(before);
});

it("status checkpoints running progress and refuses a second active import in the same Profile", async () => {
  const fixture = historyFixture("chrome"),
    repo = repository();
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const importer = new BrowserImporter({
    repo,
    sources: () => [fixture.source],
    emit: () => {},
    native: {
      available: () => true,
      historyImport: async (rows: Parameters<Repo["importHistory"]>[0]) => {
        if (++calls === 2) await waiting;
        return repo.importHistory(rows);
      },
    } as never,
  });
  const started = importer.start({ selections: selection("chrome") });
  await vi.waitFor(() => expect(calls).toBe(2));
  expect(importer.status(started.jobId).progress[0]).toMatchObject({ state: "running", imported: 500 });
  expect(() => importer.start({ selections: selection("chrome") })).toThrow("already running");
  importer.cancel(started.jobId);
  release();
  await vi.waitFor(() => expect(importer.status(started.jobId).done).toBe(true));
  expect(importer.status().progress[0]).toMatchObject({ imported: 1000, detail: "Stopped by cancel." });
});

it("a real runtime-process exit restores an interrupted receipt without opening sources or resuming writes", async () => {
  const fixture = historyFixture("chrome"),
    destination = join(temporary(), "aux.db");
  const module = pathToFileURL(resolve("apps/runtime/dist/index.js")).href;
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    const { BrowserImporter, Repo, openDb } = await import(process.argv[1]);
    const repo = new Repo(openDb(process.argv[2]));
    const importer = new BrowserImporter({repo, sources: () => [{id:"chrome",label:"Chrome",profiles:[{id:"Reviewed",dir:process.argv[3]}]}],
      native:{available:()=>true,historyImport:async rows=>repo.importHistory(rows)},
      emit:(type, receipt)=>{if(type==="import.progress" && receipt.progress?.[0]?.imported===500)process.exit(0);}});
    importer.start({selections:[{sourceId:"chrome",profileId:"Reviewed",categories:["history"]}]});
  `,
      module,
      destination,
      fixture.dir,
    ],
    { timeout: 15000, stdio: "pipe" },
  );
  const repo = repository(destination),
    discovery = vi.fn(() => [fixture.source]),
    write = vi.fn();
  const recovered = new BrowserImporter({
    repo,
    sources: discovery,
    emit: () => {},
    native: { available: () => true, historyImport: write } as never,
  });
  expect(recovered.status()).toMatchObject({
    done: true,
    interrupted: true,
    progress: [expect.objectContaining({ state: "error", imported: 500 })],
  });
  expect(discovery).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
  expect(repo.listHistory(undefined, 2000)).toHaveLength(500);
  expect(MethodSchemas["import.status"].parse({})).toEqual({});
  expect(ResultSchemas["import.status"].safeParse(recovered.status()).success).toBe(true);
});

it("retains five metadata-only receipts and cannot discover them from another Profile", async () => {
  const repo = repository();
  const fixture = historyFixture("chrome", 1);
  const importer = new BrowserImporter({ repo, emit: () => {}, sources: () => [fixture.source] });
  const ids: string[] = [];
  for (let i = 0; i < 7; i++)
    ids.push(
      (await importer.runNow({ selections: [{ sourceId: "chrome", profileId: "Reviewed", categories: ["history"] }] })).jobId,
    );
  const restored = new BrowserImporter({ repo, emit: () => {}, sources: () => [] });
  expect((await restored.preview()).recentJobs).toHaveLength(5);
  expect(restored.status().jobId).toBe(ids.at(-1));
  expect(() => restored.status(ids[0])).toThrow("No import");
  const another = new BrowserImporter({ repo: repository(), emit: () => {}, sources: () => [] });
  expect(() => another.status()).toThrow("No previous browser import");
});
