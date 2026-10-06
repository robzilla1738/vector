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
    expect(
      projection.snapshot({
        ...source,
        batchIndex: 0,
        complete: false,
        visits: [{ url: "https://one.test/", title: "One", visitedAt: 10 }],
      }),
    ).toMatchObject({ committed: false, nextBatchIndex: 1 });
    expect(repo.listHistory().map((row) => row.title)).toEqual(["Legacy"]);
    expect(
      projection.snapshot({
        ...source,
        batchIndex: 1,
        complete: true,
        visits: [{ url: "https://two.test/", title: "Two", visitedAt: 20 }],
      }),
    ).toMatchObject({ committed: true, nextBatchIndex: 2 });
    expect(repo.listHistory("two").map((row) => row.url)).toEqual(["https://two.test/"]);
    expect(repo.listHistory("legacy")).toEqual([]);
    repo.recordVisit("https://runtime-only.test/", "Wrong authority");
    expect(repo.listHistory("runtime-only")).toEqual([]);
    expect(
      projection.delta({
        ...source,
        sequence: 41,
        upserts: [{ url: "https://three.test/", title: "Three", visitedAt: 30 }],
        removals: [{ url: "https://one.test/", visitedAt: 10 }],
        titleUpdates: [{ url: "https://two.test/", title: "Updated title" }],
      }),
    ).toEqual({ accepted: true, sequence: 41 });
    expect(repo.listHistory().map((row) => row.title)).toEqual(["Three", "Updated title"]);
    expect(
      projection.delta({ ...source, sequence: 41, upserts: [], removals: [], titleUpdates: [] }),
    ).toEqual({ accepted: false, sequence: 41 });
    expect(() =>
      projection.delta({ ...source, sequence: 43, upserts: [], removals: [], titleUpdates: [] }),
    ).toThrow(/snapshot/);
    expect(() =>
      projection.delta({
        ...source,
        profileId: "other",
        sequence: 42,
        upserts: [],
        removals: [],
        titleUpdates: [],
      }),
    ).toThrow(/Profile/);
  } finally {
    repo.close();
  }
});

it("keeps Chromium history read-only before the first native snapshot and rejects foreign Profiles", () => {
  const repo = new Repo(openDb(":memory:"));
  repo.requireChromiumHistory();
  const projection = new HistoryProjection(repo, "regular-profile");
  try {
    repo.recordVisit("https://pre-snapshot.test/", "Should not persist");
    expect(repo.listHistory()).toEqual([]);
    expect(projection.isAuthoritative()).toBe(true);
    expect(projection.isCurrentSessionReady()).toBe(false);
    expect(() =>
      projection.snapshot({
        profileId: "private-profile",
        sourceGeneration: "source",
        sequence: 0,
        batchIndex: 0,
        complete: true,
        visits: [],
      }),
    ).toThrow(/Profile/);
    expect(
      projection.snapshot({
        profileId: "regular-profile",
        sourceGeneration: "source",
        sequence: 0,
        batchIndex: 0,
        complete: true,
        visits: [{ url: "https://native.test/", title: "Native", visitedAt: 123 }],
      }).committed,
    ).toBe(true);
    expect(projection.isCurrentSessionReady()).toBe(true);
    expect(repo.listHistory().map((row) => row.url)).toEqual(["https://native.test/"]);
  } finally {
    repo.close();
  }
});
