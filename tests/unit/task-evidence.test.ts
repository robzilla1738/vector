import { afterEach, expect, it } from "vitest";
import {
  DurableWriteLedger,
  EventBus,
  makeInvoker,
  openDb,
  Repo,
  TaskEvidenceService,
  TaskService,
  type PageService,
  type Services,
} from "@aux/runtime";
import { TaskReceiptSchema } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((fn) => fn()));
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Check order",
    objective: "Check fixture order",
    criteria: [{ criterionId: "order", description: "One order exists", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Fixture tab" }],
  });
  const page = {
    url: "https://fixture.test/order",
    documentEpoch: 1,
    lastRevision: 1,
    viewStatus: "visible",
  };
  const pages = {
    get: () => page,
    observe: async () => ({
      content: { url: page.url, title: "Order", text: "Order 123" },
      documentEpoch: page.documentEpoch,
      revision: page.lastRevision,
      observedAt: Date.now(),
    }),
  } as unknown as PageService;
  const evidence = new TaskEvidenceService(repo, events, pages);
  const invoke = makeInvoker({ repo, events, pages } as Services);
  const base = { taskId: task.taskId, expectedRevision: 1, criterionId: "order" };
  const note = () =>
    evidence.recordNote({ ...base, summary: "Independent fixture record: order 123" }, "desktop_user");
  const review = (id: string) =>
    evidence.review({
      ...base,
      evidenceIds: [id],
      outcome: "accepted",
      note: "I checked the fixture record",
    });
  const run = (status: "interrupted" | "running" = "interrupted") =>
    repo.saveRun({
      runId: "r1",
      goal: task.objective,
      pageIds: ["p1"],
      status,
      createdAt: Date.now(),
      config: { taskId: task.taskId, taskRevision: 1 },
    });
  return { db, repo, tasks, task, evidence, page, invoke, base, note, review, run };
}

it("keeps external claims separate from desktop acceptance and rejects actor spoofing", async () => {
  const f = fixture();
  const record = (await f.invoke("tasks.recordEvidence", { ...f.base, summary: "Agent says done" })) as {
    evidenceId: string;
    actor: string;
  };
  expect(record.actor).toBe("external_client");
  const params = { ...f.base, evidenceIds: [record.evidenceId], outcome: "accepted", note: "Checked" };
  await expect(f.invoke("tasks.reviewCriterion", params)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(f.invoke("tasks.reviewCriterion", { ...params, desktopUser: true })).rejects.toThrow();
  await expect(
    f.invoke("tasks.recordEvidence", { ...f.base, summary: "Forged", actor: "desktop_user" }),
  ).rejects.toThrow();
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  await f.invoke("tasks.reviewCriterion", params, { external: false });
  const receipt = TaskReceiptSchema.parse(f.evidence.receipt(f.task.taskId));
  expect(receipt.status).toBe("accepted");
  expect(receipt.criteria[0]!.review?.actor).toBe("desktop_user");
});

it("invalidates reviews on new evidence, new runs and task revisions", () => {
  const f = fixture();
  f.review(f.note().evidenceId);
  f.note();
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  f.review(f.note().evidenceId);
  f.run();
  expect(f.evidence.receipt(f.task.taskId).criteria[0]!.status).toBe("stale");
  f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "Check a second order" });
  expect(f.evidence.receipt(f.task.taskId).criteria[0]!.status).toBe("unverified");
  expect(() => f.note()).toThrow("revision changed");
});

it("aggregates descendant outcomes into the parent receipt", () => {
  const f = fixture();
  const parentEvidence = f.note();
  f.review(parentEvidence.evidenceId);
  const child = f.tasks.create({
    workspaceId: f.task.workspaceId,
    parentTaskId: f.task.taskId,
    title: "Verify child outcome",
    objective: "Check a child record",
    criteria: [{ criterionId: "child", description: "Child record exists", verification: "manual" }],
    resources: [],
  });
  expect(f.evidence.receipt(f.task.taskId)).toMatchObject({
    status: "needs_review",
    childTasks: [
      {
        taskId: child.taskId,
        depth: 1,
        status: "needs_review",
        modelCalls: 0,
        knownCostUsd: 0,
        costComplete: true,
      },
    ],
  });
  const childEvidence = f.evidence.recordNote(
    { taskId: child.taskId, expectedRevision: 1, criterionId: "child", summary: "Child record checked" },
    "desktop_user",
  );
  f.evidence.review({
    taskId: child.taskId,
    expectedRevision: 1,
    criterionId: "child",
    evidenceIds: [childEvidence.evidenceId],
    outcome: "accepted",
    note: "Reviewed child record",
  });
  expect(f.evidence.receipt(f.task.taskId).status).toBe("accepted");
  f.repo.saveRun({
    runId: "child-active",
    goal: child.objective,
    pageIds: [],
    status: "running",
    createdAt: Date.now(),
    config: { taskId: child.taskId, taskRevision: 1 },
  });
  expect(f.evidence.receipt(f.task.taskId)).toMatchObject({
    status: "in_progress",
    childTasks: [{ status: "in_progress" }],
  });
});

it("captures only task-scoped pages and rejects known stale observations", async () => {
  const f = fixture();
  await expect(f.evidence.capture({ ...f.base, pageId: "unrelated" })).rejects.toMatchObject({
    code: "permission_denied",
  });
  const captured = await f.evidence.capture({ ...f.base, pageId: "p1" });
  expect(captured.snapshot?.text).toBe("Order 123");
  f.review(captured.evidenceId);
  f.page.documentEpoch++;
  expect(f.evidence.receipt(f.task.taskId).criteria[0]!.status).toBe("stale");
  expect(() => f.review(captured.evidenceId)).toThrow("stale");
});

it("keeps uncertain actions blocking until desktop reconciliation with current evidence", async () => {
  const f = fixture();
  f.run();
  const ledger = new DurableWriteLedger(f.db);
  const action = ledger.begin({ runId: "r1", pageId: "p1", documentEpoch: 1, signature: "submit" });
  const id = f.note().evidenceId;
  f.review(id);
  expect(f.evidence.receipt(f.task.taskId).status).toBe("uncertain");
  const params = {
    taskId: f.task.taskId,
    expectedRevision: 1,
    intentId: action.intent.id,
    evidenceId: id,
    outcome: "applied",
    note: "Order confirmed in fixture records",
  };
  await expect(f.invoke("tasks.reconcileAction", params)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(
    f.invoke("tasks.reconcileAction", { ...params, intentId: "unrelated" }, { external: false }),
  ).rejects.toThrow("belongs to the task");
  await f.invoke("tasks.reconcileAction", params, { external: false });
  expect(f.evidence.receipt(f.task.taskId).status).toBe("accepted");
  expect(ledger.unresolved("r1")).toEqual([]);
});

it("keeps direct task-bound browser writes in the receipt and requires task evidence to reconcile", async () => {
  const f = fixture(),
    ledger = new DurableWriteLedger(f.db);
  const action = ledger.begin({
    runId: "direct:p1",
    pageId: "p1",
    documentEpoch: 1,
    signature: "submit",
    taskId: f.task.taskId,
    taskRevision: 1,
  });
  const competing = ledger.begin({
    runId: "direct:p2",
    pageId: "p2",
    documentEpoch: 1,
    signature: "another",
    taskId: f.task.taskId,
    taskRevision: 1,
  });
  expect(competing).toMatchObject({ duplicate: true, intent: { id: action.intent.id } });
  expect(f.evidence.receipt(f.task.taskId).unresolvedActions).toMatchObject([{ intentId: action.intent.id }]);
  expect(() => f.tasks.preparePageAccess(f.task.taskId, 1, "p1", true)).toThrow("unresolved action");
  await expect(
    f.invoke("pages.reconcileWrite", { pageId: "p1", outcome: "applied", evidence: "Looked at the page" }),
  ).rejects.toMatchObject({ code: "conflict" });
  const evidenceId = f.note().evidenceId;
  await f.invoke(
    "tasks.reconcileAction",
    {
      taskId: f.task.taskId,
      expectedRevision: 1,
      intentId: action.intent.id,
      evidenceId,
      outcome: "applied",
      note: "Order confirmed",
    },
    { external: false },
  );
  expect(f.evidence.receipt(f.task.taskId).unresolvedActions).toEqual([]);
});

it("keeps uncertain connected writes blocking until desktop reconciliation with current evidence", async () => {
  const f = fixture();
  f.run();
  const revoked = f.repo.getRun("r1")!;
  revoked.config = { ...revoked.config, contextMemoryRevoked: true };
  f.repo.saveRun(revoked);
  f.repo.saveOperation({
    operationId: "op-write",
    siteKey: "fixture.test",
    name: "submit-order",
    effectClass: "write",
  });
  f.repo.saveInvocation({
    invocationId: "inv-write",
    operationId: "op-write",
    runId: "r1",
    status: "interrupted",
    effectOutcome: "unknown",
    startedAt: Date.now(),
    inputs: { taskId: f.task.taskId, taskRevision: 1, privateText: "forgotten article answer" },
    error: "Connection ended before confirmation",
  });
  expect(f.repo.getInvocation("inv-write")?.inputs).toHaveProperty("privateText");
  const evidenceId = f.note().evidenceId;
  f.review(evidenceId);
  const receipt = f.evidence.receipt(f.task.taskId);
  expect(receipt.status).toBe("uncertain");
  expect(receipt.unresolvedOperations).toMatchObject([
    { invocationId: "inv-write", operation: "fixture.test/submit-order", effectClass: "write" },
  ]);
  expect(() => f.tasks.prepareRun(f.task.taskId, 1)).toThrow("unresolved operation");
  const params = {
    taskId: f.task.taskId,
    expectedRevision: 1,
    invocationId: "inv-write",
    evidenceId,
    outcome: "not_applied",
    note: "Independent fixture records contain no matching order",
  };
  await expect(f.invoke("tasks.reconcileOperation", params)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await f.invoke("tasks.reconcileOperation", params, { external: false });
  expect(f.evidence.receipt(f.task.taskId).unresolvedOperations).toEqual([]);
  expect(f.repo.getInvocation("inv-write")).toMatchObject({
    status: "reconciled",
    effectOutcome: "not-dispatched",
  });
  expect(f.repo.getInvocation("inv-write")?.inputs).toEqual({ taskId: f.task.taskId, taskRevision: 1 });
  expect(
    f.db
      .prepare("SELECT outcome,evidence_id FROM operation_reconciliations WHERE invocation_id='inv-write'")
      .get(),
  ).toEqual({ outcome: "not_applied", evidence_id: evidenceId });
  expect(() => f.tasks.prepareRun(f.task.taskId, 1)).not.toThrow();
});

it("blocks decisions during active work", () => {
  const f = fixture();
  f.run("running");
  const id = f.note().evidenceId;
  expect(() => f.review(id)).toThrow("Stop active task runs");
  expect(f.evidence.receipt(f.task.taskId).status).toBe("in_progress");
});

it("imports exact local document snapshots only through desktop authority and requires fresh idle revisions", async () => {
  const f = fixture();
  const params = { ...f.base, filename: "order.md", content: "# Order\n123\n" };
  await expect(f.invoke("tasks.importDocumentEvidence", params)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(
    f.invoke("tasks.importDocumentEvidence", { ...params, filename: "../order.md" }, { external: false }),
  ).rejects.toThrow();
  const record = (await f.invoke("tasks.importDocumentEvidence", params, {
    external: false,
  })) as import("@aux/contracts").TaskEvidence;
  expect(record).toMatchObject({
    kind: "document_snapshot",
    actor: "desktop_user",
    source: { filename: "order.md", byteLength: 12 },
    snapshot: { text: params.content },
  });
  expect(record.source.sha256).toMatch(/^[a-f0-9]{64}$/);
  f.review(record.evidenceId);
  expect(f.evidence.receipt(f.task.taskId).status).toBe("accepted");
  f.evidence.importDocument({ ...params, content: "Updated order" });
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  expect(() => f.evidence.importDocument({ ...params, expectedRevision: 2 })).toThrow("revision changed");
  expect(() => f.evidence.importDocument({ ...params, content: "x\0y" })).toThrow();
  expect(() => f.evidence.importDocument({ ...params, content: "é".repeat(262145) })).toThrow();
  f.run("running");
  expect(() => f.evidence.importDocument(params)).toThrow("Stop active task runs");
});

it("reads earlier definitions and evidence without carrying acceptance into current revisions", async () => {
  const f = fixture();
  const original = f.evidence.importDocument({ ...f.base, filename: "order.txt", content: "Order 123" });
  f.review(original.evidenceId);
  f.repo.saveRun({
    runId: "old-run",
    goal: "Original goal",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    config: { taskId: f.task.taskId, taskRevision: 1 },
  });
  f.tasks.update({
    taskId: f.task.taskId,
    expectedRevision: 1,
    objective: "Check the revised order",
    criteria: [{ criterionId: "new", description: "Two items exist", verification: "manual" }],
  });
  f.repo.saveRun({
    runId: "new-run",
    goal: "New goal",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    config: { taskId: f.task.taskId, taskRevision: 2 },
  });
  const historical = TaskReceiptSchema.parse(
    await f.invoke("tasks.receipt", { taskId: f.task.taskId, revision: 1 }),
  );
  expect(historical).toMatchObject({ taskRevision: 1, currentTaskRevision: 2, objective: f.task.objective });
  expect(historical.criteria[0]!.evidence[0]!.record).toEqual(original);
  expect(historical.criteria[0]!.review?.outcome).toBe("accepted");
  expect(historical.criteria[0]!.status).toBe("stale"); // Later runs invalidate confidence, not the recorded review.
  expect(historical.runs.map((run) => run.runId)).toEqual(["old-run"]);
  expect(historical.runs[0]!.currentRevision).toBe(true);
  const current = f.evidence.receipt(f.task.taskId);
  expect(current.taskRevision).toBe(2);
  expect(current.status).toBe("needs_review");
  expect(current.criteria[0]!.evidence).toEqual([]);
  await expect(f.invoke("tasks.receipt", { taskId: f.task.taskId, revision: 99 })).rejects.toMatchObject({
    code: "not_found",
  });
  expect(() => f.evidence.recordNote({ ...f.base, summary: "Change old evidence" }, "desktop_user")).toThrow(
    "revision changed",
  );
  f.tasks.archive(f.task.taskId, 2, true);
  expect(f.evidence.receipt(f.task.taskId, 1).criteria[0]!.evidence[0]!.record).toEqual(original);
});

it("records honest criterion checks without accepting the criterion", () => {
  const f = fixture();
  const manual = f.evidence.verifyCriterion(f.base);
  expect(manual).toMatchObject({ method: "manual", status: "unverified", localMatch: false });
  expect(f.db.prepare("SELECT count(*) AS n FROM criterion_reviews").get()?.n).toBe(0);
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  expect(f.evidence.receipt(f.task.taskId).verifications[0]?.verificationId).toBe(manual.verificationId);
  const browserTask = f.tasks.update({
    taskId: f.task.taskId,
    expectedRevision: 1,
    criteria: [{ criterionId: "order", description: "One order exists", verification: "browser" }],
  });
  const browser = f.evidence.verifyCriterion({
    taskId: browserTask.taskId,
    expectedRevision: 2,
    criterionId: "order",
  });
  expect(browser).toMatchObject({ method: "browser", status: "needs_review", localMatch: false });
  expect(f.db.prepare("SELECT count(*) AS n FROM criterion_reviews").get()?.n).toBe(0);
});

it("refuses CLI and MCP write access on task resources", async () => {
  const f = fixture();
  await expect(
    f.invoke("tasks.update", {
      taskId: f.task.taskId,
      expectedRevision: 1,
      resources: [{ ...f.task.resources[0], access: "write" }],
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  const updated = (await f.invoke(
    "tasks.update",
    {
      taskId: f.task.taskId,
      expectedRevision: 1,
      resources: [{ ...f.task.resources[0], access: "read" }],
    },
    { external: false },
  )) as { resources: { access: string }[] };
  expect(updated.resources[0]?.access).toBe("read");
});
