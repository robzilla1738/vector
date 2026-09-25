import { expect, it } from "vitest";
import { EventBus, makeInvoker, openDb, Repo, type Services } from "@aux/runtime";
import { CommandRankingStore } from "../../apps/runtime/src/services/command-ranking.js";

it("persists bounded learned choices only in their browser Profile", () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    const personal = new CommandRankingStore(repo, "personal", () => 1000);
    const work = new CommandRankingStore(repo, "work", () => 1000);
    expect(personal.record("  Alpha  ", "alpha\u0000example.com", "tabs").uses).toBe(1);
    expect(personal.record("alpha", "alpha\u0000example.com", "bookmarks").uses).toBe(2);
    expect(personal.list()).toMatchObject([{ query: "alpha", uses: 2, source: "bookmarks" }]);
    expect(work.list()).toEqual([]);
    expect(new CommandRankingStore(repo, "personal", () => 1000).list()).toHaveLength(1);
    expect(personal.clear()).toEqual({ removed: 1 });
    expect(personal.list()).toEqual([]);
  } finally {
    db.close();
  }
});

it("keeps ranking feedback inside the trusted shell API", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    const invoke = makeInvoker({
      repo,
      events: new EventBus(repo),
      pages: {},
      featureProfileId: "personal",
    } as Services);
    await expect(invoke("command.ranking.list", {})).rejects.toMatchObject({ code: "permission_denied" });
    const entry = await invoke(
      "command.ranking.record",
      { query: "alpha", candidateKey: "alpha\u0000example.com", source: "tabs" },
      { external: false },
    );
    expect(entry).toMatchObject({ query: "alpha", uses: 1 });
    expect(await invoke("command.ranking.list", {}, { external: false })).toHaveLength(1);
    expect(await invoke("command.ranking.clear", {}, { external: false })).toEqual({ removed: 1 });
  } finally {
    db.close();
  }
});
