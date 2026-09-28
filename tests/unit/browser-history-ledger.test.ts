import { expect, it, vi } from "vitest";
import { EventBus, makeInvoker, openDb, PageClaimStore, Repo, TaskEvidenceService, TaskService,
  type Services } from "@aux/runtime";
import { BrowserHistoryLedger } from "../../apps/runtime/src/services/browser-history-ledger.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import type { PageTarget } from "@aux/contracts";

function fixture() {
  const db = openDb(":memory:");
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const space = tasks.createWorkspace("Fixture");
  const task = tasks.create({ workspaceId: space.workspaceId, title: "Visit",
    objective: "Browse", criteria: [{ criterionId: "seen", description: "Seen", verification: "manual" }] });
  const now = Date.now();
  repo.saveRun({ runId: "r1", goal: task.objective, status: "running", pageIds: ["p1"],
    config: { taskId: task.taskId, taskRevision: 1 }, createdAt: now - 20, startedAt: now - 20 });
  new PageClaimStore(db).claim({ pageId: "p1", runId: "r1", kind: "borrowed", now: now - 10 });
  const page = { pageId: "p1", url: "https://fixture.test/private", backend: "aux",
    viewStatus: "visible", controller: "agent" } as PageTarget;
  const visit = { url: page.url, title: "Private visit", visitedAt: now };
  return { db, repo, events, task, page, visit };
}

it("attributes one new native visit to a claimed run and removes only its unchanged identity", async () => {
  const f = fixture();
  try {
    f.repo.importHistory([f.visit]);
    new BrowserHistoryLedger(f.repo).record([f.visit], [f.page]);
    const step = f.repo.listSteps("r1")[0]!;
    expect(step.op).toBe("history.visit");
    const remove = vi.fn(async () => ({ removed: true }));
    const evidence = new TaskEvidenceService(f.repo, f.events, undefined,
      { historyRemove: remove } as unknown as NativeBridge);
    f.repo.saveRun({ ...f.repo.getRun("r1")!, status: "completed", endedAt: Date.now() });
    const params = { taskId: f.task.taskId, expectedRevision: 1, runId: "r1", stepId: step.stepId };
    expect(evidence.receipt(f.task.taskId).historyChanges[0]).toMatchObject({ url: f.visit.url,
      visitedAt: f.visit.visitedAt });
    await expect(evidence.undoHistoryChange(params)).resolves.toEqual({ ok: true });
    expect(remove).toHaveBeenCalledWith(f.visit.url, f.visit.visitedAt, f.visit.title);
    expect(evidence.receipt(f.task.taskId).historyChanges[0]?.undoneAt).toBeTypeOf("number");
    await expect(evidence.undoHistoryChange(params)).rejects.toThrow("safe removal record");
  } finally { f.db.close(); }
});

it("does not attribute ambiguous pages, human pages, or visits before a claim", () => {
  const f = fixture();
  try {
    const ledger = new BrowserHistoryLedger(f.repo);
    ledger.record([f.visit], [f.page, { ...f.page, pageId: "p2" }]);
    ledger.record([f.visit], [{ ...f.page, controller: "human" }]);
    ledger.record([{ ...f.visit, visitedAt: f.visit.visitedAt - 30 }], [f.page]);
    expect(f.repo.listSteps("r1")).toEqual([]);
  } finally { f.db.close(); }
});

it("records a new ordered native history delta but not a repeated or old visit", async () => {
  const f = fixture();
  try {
    const invoke = makeInvoker({ repo: f.repo, events: f.events, featureHost: "chromium-fork",
      featureProfileId: "regular", pages: { list: () => [f.page] } } as unknown as Services);
    const source = { profileId: "regular", sourceGeneration: "native", sequence: 1 };
    await invoke("history.projectSnapshot", { ...source, batchIndex: 0, complete: true, visits: [] },
      { external: false });
    await invoke("history.projectDelta", { ...source, sequence: 2, upserts: [f.visit] },
      { external: false });
    expect(f.repo.listSteps("r1")).toHaveLength(1);
    await invoke("history.projectDelta", { ...source, sequence: 2, upserts: [f.visit] },
      { external: false });
    await invoke("history.projectDelta", { ...source, sequence: 3, upserts: [f.visit] },
      { external: false });
    expect(f.repo.listSteps("r1")).toHaveLength(1);
  } finally { f.db.close(); }
});

it("refuses removal when the projected visit title changed", async () => {
  const f = fixture();
  try {
    f.repo.importHistory([f.visit]);
    new BrowserHistoryLedger(f.repo).record([f.visit], [f.page]);
    const step = f.repo.listSteps("r1")[0]!;
    f.repo.db.prepare("UPDATE history SET title=? WHERE url=? AND visited_at=?")
      .run("Changed", f.visit.url, f.visit.visitedAt);
    const remove = vi.fn();
    await expect(new BrowserHistoryLedger(f.repo,
      { historyRemove: remove } as unknown as NativeBridge).undo(step)).rejects.toThrow("changed");
    expect(remove).not.toHaveBeenCalled();
  } finally { f.db.close(); }
});
