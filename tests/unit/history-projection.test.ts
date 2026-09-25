import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { HistoryProjection } from "../../apps/runtime/src/services/history-projection.js";

it("atomically rebuilds the derived FTS index and applies ordered Chromium deltas", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const projection = new HistoryProjection(repo, "p1");
  try {
    repo.addHistory("https://legacy.test/", "Legacy");
    const source = { profileId: "p1", sourceGeneration: "chromium-1", sequence: 40 };
    expect(projection.snapshot({ ...source, batchIndex: 0, complete: false, visits: [{ url: "https://one.test/", title: "One", visitedAt: 10 }] })).toMatchObject({ committed: false, nextBatchIndex: 1 });
    expect(repo.listHistory().map(row => row.title)).toEqual(["Legacy"]);
    expect(projection.snapshot({ ...source, batchIndex: 1, complete: true, visits: [{ url: "https://two.test/", title: "Two", visitedAt: 20 }] })).toMatchObject({ committed: true, nextBatchIndex: 2 });
    expect(repo.listHistory("two").map(row => row.url)).toEqual(["https://two.test/"]);
    expect(repo.listHistory("legacy")).toEqual([]);
    repo.recordVisit("https://runtime-only.test/", "Wrong authority");
    expect(repo.listHistory("runtime-only")).toEqual([]);
    expect(projection.delta({ ...source, sequence: 41, upserts: [{ url: "https://three.test/", title: "Three", visitedAt: 30 }], removals: [{ url: "https://one.test/", visitedAt: 10 }] })).toEqual({ accepted: true, sequence: 41 });
    expect(repo.listHistory().map(row => row.title)).toEqual(["Three", "Two"]);
    expect(projection.delta({ ...source, sequence: 41, upserts: [], removals: [] })).toEqual({ accepted: false, sequence: 41 });
    expect(() => projection.delta({ ...source, sequence: 43, upserts: [], removals: [] })).toThrow(/snapshot/);
    expect(() => projection.delta({ ...source, profileId: "other", sequence: 42, upserts: [], removals: [] })).toThrow(/Profile/);
  } finally { repo.close(); }
});
