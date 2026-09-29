import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { BrowserGroupLedger } from "../../apps/runtime/src/services/browser-group-ledger.js";
import { EventBus, openDb, PageClaimStore, Repo, TaskEvidenceService, TaskService } from "@aux/runtime";

function fixture() {
  const db = openDb(":memory:"), repo = new Repo(db), events = new EventBus(repo);
  const tasks = new TaskService(repo, events), space = tasks.createWorkspace("Fixture");
  const task = tasks.create({ workspaceId: space.workspaceId, title: "Group research",
    objective: "Group research", criteria: [{ criterionId: "grouped", description: "Grouped", verification: "manual" }] });
  const now = Date.now();
  repo.saveRun({ runId: "group-run", goal: task.objective, status: "running", pageIds: ["p1", "p2"],
    config: { taskId: task.taskId, taskRevision: 1 }, createdAt: now - 100, startedAt: now - 100 });
  const claims = new PageClaimStore(db);
  claims.claim({ pageId: "p1", runId: "group-run", kind: "borrowed", now: now - 50 });
  claims.claim({ pageId: "p2", runId: "group-run", kind: "borrowed", now: now - 50 });
  const effect = { mutationId: randomUUID(), groupId: "native-group", observedAt: now,
    pageIds: ["p1", "p2"], before: { revision: 1, memberPageIds: ["p1"], title: "Research" },
    after: { revision: 2, memberPageIds: ["p1", "p2"], title: "Research" } };
  return { db, repo, events, task, claims, effect, ledger: new BrowserGroupLedger(repo) };
}

it("projects a native group effect from one claimed task run without granting undo", () => {
  const f = fixture();
  try {
    expect(f.ledger.recordNativeEffect(f.effect)).toEqual({ recorded: true, stepId: f.effect.mutationId });
    expect(f.ledger.recordNativeEffect(f.effect)).toEqual({ recorded: false, stepId: f.effect.mutationId });
    f.repo.saveRun({ ...f.repo.getRun("group-run")!, status: "completed", endedAt: Date.now() });
    const receipt = new TaskEvidenceService(f.repo, f.events).receipt(f.task.taskId);
    expect(receipt.groupChanges).toMatchObject([{ groupId: "native-group", runId: "group-run",
      before: { revision: 1, memberPageIds: ["p1"] }, after: { revision: 2, memberPageIds: ["p1", "p2"] },
      undoAvailable: false }]);
    expect(receipt.undoReviews[0]?.eligibleStepIds).toEqual([]);
    expect(() => f.ledger.recordNativeEffect({ ...f.effect, after: { ...f.effect.after, title: "Changed" } }))
      .toThrow(/reused with different content/);
  } finally { f.db.close(); }
});

it("refuses ambiguous, stale or unproven group effects before recording a step", () => {
  const f = fixture();
  try {
    f.claims.claim({ pageId: "p2", runId: "other", kind: "borrowed" });
    expect(() => f.ledger.recordNativeEffect(f.effect)).toThrow(/exact agent run claim/);
    f.claims.release("p2");
    f.claims.claim({ pageId: "p2", runId: "group-run", kind: "borrowed" });
    expect(() => f.ledger.recordNativeEffect({ ...f.effect, observedAt: 1 })).toThrow(/exact agent run claim/);
    expect(() => f.ledger.recordNativeEffect({ ...f.effect, pageIds: ["p1"] })).toThrow(/Affected pages/);
    expect(f.repo.listSteps("group-run")).toEqual([]);
  } finally { f.db.close(); }
});
