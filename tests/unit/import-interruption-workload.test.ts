import { it, expect } from "vitest";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { BrowserImporter, Repo, openDb } from "@aux/runtime";
import { createImportSourceOwner, createImportInterruptionSourceHome, readImportSourceHome, disposeImportSourceHome } from "../host/lib/import-source-home.mjs";

it("real fixed5001 reader yields confirmed partial progress, cancels and merges reviewed retry without source mutation", async () => {
  const root = mkdtempSync("/tmp/aux-native-journey-");
  const profile = join(root, "profile"); mkdirSync(profile, { mode: 0o700 });
  const owner = createImportSourceOwner(profile), lease = createImportInterruptionSourceHome(owner, "http://127.0.0.1:32123/");
  const original = readImportSourceHome(lease, owner), db = openDb(":memory:"), repo = new Repo(db);
  const sources = () => [{ id: "chrome" as const, label: "Chrome", profiles: [{ id: "Default", dir: dirname(original.files[1].path) }] }];
  const selections = [{ sourceId: "chrome", profileId: "Default", categories: ["history" as const] }];
  try {
    const importer = new BrowserImporter({ repo, sources, emit: () => {} });
    const started = importer.start({ selections });
    const running = importer.status(started.jobId);
    expect(running.done).toBe(false);
    expect(running.progress[0]).toMatchObject({ state: "running", imported: 500, skipped: 0 });
    importer.cancel(started.jobId);
    for (let turn = 0; turn < 20 && !importer.status(started.jobId).done; turn++) await new Promise<void>(resolve => setImmediate(resolve));
    const cancelled = importer.status(started.jobId);
    expect(cancelled).toMatchObject({ done: true, cancelled: true });
    expect(cancelled.progress[0]).toMatchObject({ imported: 500, skipped: 0, detail: "Stopped by cancel." });
    expect(repo.countHistory({})).toBe(500);
    expect(repo.listBookmarks()).toEqual([]);
    // Durable receipts deliberately omit raw reader/native detail strings.
    const durable = structuredClone(cancelled);
    for (const row of durable.progress) delete row.detail;
    for (const row of durable.report!.results) delete row.detail;
    const restored = new BrowserImporter({ repo, sources, emit: () => {} });
    expect(restored.status(started.jobId)).toEqual(durable);
    expect(repo.countHistory({})).toBe(500);
    const report = await restored.runNow({ selections });
    expect(report.jobId).not.toBe(started.jobId);
    expect(report.cancelled).toBe(false);
    expect(report.results[0]).toMatchObject({ state: "done", imported: 4501, skipped: 500 });
    expect(repo.countHistory({})).toBe(5001);
    expect(restored.status(started.jobId)).toEqual(durable);
    expect(repo.listBookmarks()).toEqual([]);
    expect(readImportSourceHome(lease, owner)).toEqual(original);
  } finally { db.close(); disposeImportSourceHome(lease, owner); rmSync(root, { recursive: true, force: true }); }
});
