import { expect, it } from "vitest";
import { openDb, Repo, EventBus, TaskService } from "@vector/runtime";
import { BrowsingMemory } from "../../apps/runtime/src/services/browsing-memory.js";
import type { PageTarget } from "@vector/contracts";

const page = (patch: Partial<PageTarget> = {}): PageTarget => ({ pageId: "p", backend: "vector", targetId: "t", url: "https://example.com/article?session=private#section", title: "Public article", documentEpoch: 1, lastRevision: 0, viewStatus: "visible", controller: "human", controllerEpoch: 0, ownedByRuntime: false, createdAt: 1, lastActiveAt: 1, ...patch });
function fixture() {
  const db = openDb(":memory:"), repo = new Repo(db), tasks = new TaskService(repo, new EventBus(repo));
  const space = tasks.createWorkspace("One"), other = tasks.createWorkspace("Two");
  let now = 1_000_000;
  return { db, repo, tasks, space, other, service: new BrowsingMemory(repo, () => now), advance: (ms: number) => { now += ms; } };
}

it("is opt-in, Space-scoped, and excludes agent/hidden/stale pages and query strings", () => {
  const f = fixture();
  try {
    expect(f.service.record(f.space.workspaceId, page(), 1).recorded).toBe(false);
    f.service.setPolicy(f.space.workspaceId, { enabled: true, retentionDays: 7 });
    for (const patch of [{ ownedByRuntime: true }, { controller: "agent" as const }, { viewStatus: "hidden" as const }, { loading: true }])
      expect(f.service.record(f.space.workspaceId, page(patch), 1).recorded).toBe(false);
    expect(f.service.record(f.space.workspaceId, page(), 2).recorded).toBe(false);
    expect(f.service.record(f.space.workspaceId, page(), 1).recorded).toBe(true);
    const saved = f.service.get(f.space.workspaceId).pages;
    expect(saved).toHaveLength(1);
    expect(saved[0]?.url).toBe("https://example.com/article");
    expect(f.service.get(f.other.workspaceId).pages).toEqual([]);
    expect(f.service.context(f.space.workspaceId)).toContain("page contents have not been read");
    f.service.record(f.space.workspaceId, page({ url: "https://example.com/article?new=value" }), 1);
    expect(f.service.get(f.space.workspaceId).pages[0]?.memoryId).toBe(saved[0]?.memoryId);
  } finally { f.db.close(); }
});

it("applies site exclusions at recording and retrieval, and pause preserves saved records", () => {
  const f = fixture();
  try {
    f.service.setPolicy(f.space.workspaceId, { enabled: true, retentionDays: 7 });
    f.service.record(f.space.workspaceId, page(), 1);
    f.tasks.setWorkspaceMemory(f.space.workspaceId, 0, "", true, undefined, ["https://example.com"]);
    expect(f.service.context(f.space.workspaceId)).toBe("");
    expect(f.service.record(f.space.workspaceId, page(), 1).recorded).toBe(false);
    expect(f.service.get(f.space.workspaceId).pages).toHaveLength(1);
    f.service.setPolicy(f.space.workspaceId, { enabled: false, retentionDays: 7 });
    expect(f.service.get(f.space.workspaceId).pages).toHaveLength(1);
    expect(f.service.context(f.space.workspaceId)).toBe("");
  } finally { f.db.close(); }
});

it("physically prunes expired records and forgets only the selected record or Space", () => {
  const f = fixture();
  try {
    for (const space of [f.space, f.other]) { f.service.setPolicy(space.workspaceId, { enabled: true, retentionDays: 7 }); f.service.record(space.workspaceId, page(), 1); }
    const id = f.service.get(f.space.workspaceId).pages[0]!.memoryId;
    expect(f.service.forget(f.space.workspaceId, id).pages).toEqual([]);
    expect(f.service.get(f.other.workspaceId).pages).toHaveLength(1);
    f.advance(8 * 86_400_000); f.service.prune();
    expect(f.repo.getSetting(`browsingMemoryPages:${f.other.workspaceId}`)).toEqual([]);
  } finally { f.db.close(); }
});
