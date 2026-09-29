import { randomUUID } from "node:crypto";
import { expect, it, vi } from "vitest";
import { BrowserGroupLedger } from "../../apps/runtime/src/services/browser-group-ledger.js";
import { registerNativeReceiptChannel } from "../../apps/runtime/src/services/native-receipt-channel.js";
import { EventBus, openDb, PageClaimStore, Repo, TaskEvidenceService, TaskService } from "@aux/runtime";
import { memoryTransportPair, RpcChannel, type PageTarget } from "@aux/contracts";
import type { NativeBridge } from "../../apps/runtime/src/native.js";

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
  const pages = ["p1", "p2"].map(pageId => ({ pageId, documentEpoch: 2,
    url: `https://fixture.test/${pageId}`, backend: "aux", controller: "agent",
    viewStatus: "visible" } as PageTarget));
  const envelope = { effect, pages: pages.map(page => ({ pageId: page.pageId,
    documentEpoch: page.documentEpoch, url: page.url })) };
  return { db, repo, events, task, claims, effect, pages, envelope, ledger: new BrowserGroupLedger(repo) };
}

it("projects a native group effect from one claimed task run without granting undo", () => {
  const f = fixture();
  try {
    expect(f.ledger.recordNativeEffect(f.envelope, f.pages)).toEqual({ recorded: true, stepId: f.effect.mutationId });
    expect(f.ledger.recordNativeEffect(f.envelope, f.pages)).toEqual({ recorded: false, stepId: f.effect.mutationId });
    f.repo.saveRun({ ...f.repo.getRun("group-run")!, status: "completed", endedAt: Date.now() });
    const receipt = new TaskEvidenceService(f.repo, f.events).receipt(f.task.taskId);
    expect(receipt.groupChanges).toMatchObject([{ groupId: "native-group", runId: "group-run",
      before: { revision: 1, memberPageIds: ["p1"] }, after: { revision: 2, memberPageIds: ["p1", "p2"] },
      undoAvailable: false }]);
    expect(receipt.undoReviews[0]?.eligibleStepIds).toEqual([]);
    expect(() => f.ledger.recordNativeEffect({ ...f.envelope,
      effect: { ...f.effect, after: { ...f.effect.after, title: "Changed" } } }, f.pages))
      .toThrow(/reused with different content/);
  } finally { f.db.close(); }
});

it("refuses ambiguous, stale or unproven group effects before recording a step", () => {
  const f = fixture();
  try {
    f.claims.claim({ pageId: "p2", runId: "other", kind: "borrowed" });
    expect(() => f.ledger.recordNativeEffect(f.envelope, f.pages)).toThrow(/exact agent run claim/);
    f.claims.release("p2");
    f.claims.claim({ pageId: "p2", runId: "group-run", kind: "borrowed" });
    expect(() => f.ledger.recordNativeEffect({ ...f.envelope, effect: { ...f.effect, observedAt: 1 } }, f.pages)).toThrow(/exact agent run claim/);
    expect(() => f.ledger.recordNativeEffect({ ...f.envelope, effect: { ...f.effect, pageIds: ["p1"] } }, f.pages)).toThrow(/Affected pages/);
    expect(() => f.ledger.recordNativeEffect(f.envelope, [{ ...f.pages[0]!, documentEpoch: 3 }, f.pages[1]!])).toThrow(/exact current agent page/);
    expect(f.repo.listSteps("group-run")).toEqual([]);
  } finally { f.db.close(); }
});

it("accepts authenticated native effects into one receipt and selected history undo", async () => {
  const f = fixture();
  try {
    const [nativeTransport, runtimeTransport] = memoryTransportPair();
    const nativeChannel = new RpcChannel(nativeTransport, "native fixture");
    registerNativeReceiptChannel(new RpcChannel(runtimeTransport, "runtime fixture"), f.repo, () => f.pages);
    expect(await nativeChannel.call("browser.groupEffect", f.envelope)).toEqual({
      recorded: true, stepId: f.effect.mutationId });
    const visit = { visitId: "203", pageId: "p1", documentEpoch: 2,
      url: f.pages[0]!.url, title: "Research", visitedAt: f.effect.observedAt };
    f.repo.importHistory([{ url: visit.url, title: visit.title, visitedAt: visit.visitedAt }]);
    const added = await nativeChannel.call<{ recorded: boolean; stepId: string }>("browser.historyVisitEffect", visit);
    expect(added.recorded).toBe(true);
    f.repo.saveRun({ ...f.repo.getRun("group-run")!, status: "completed", endedAt: Date.now() });
    const remove = vi.fn(async () => ({ removed: true }));
    const evidence = new TaskEvidenceService(f.repo, f.events, undefined,
      { historyRemove: remove } as unknown as NativeBridge);
    const receipt = evidence.receipt(f.task.taskId);
    expect(receipt.groupChanges).toHaveLength(1);
    expect(receipt.groupChanges[0]?.undoAvailable).toBe(false);
    expect(receipt.historyChanges).toMatchObject([{ pageId: "p1", url: visit.url }]);
    const review = receipt.undoReviews.find(item => item.runId === "group-run")!;
    expect(review.eligibleStepIds).toEqual([added.stepId]);
    expect(await evidence.undoRunBrowserChanges({ taskId: f.task.taskId, expectedRevision: 1,
      runId: "group-run", reviewToken: review.token, expectedStepIds: review.eligibleStepIds,
      selectedStepIds: [added.stepId] })).toEqual({ restored: 1, skipped: [] });
    expect(remove).toHaveBeenCalledWith(visit.url, visit.visitedAt, visit.title);
  } finally { f.db.close(); }
});
