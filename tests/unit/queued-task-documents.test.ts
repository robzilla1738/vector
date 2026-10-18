import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { expect, it, vi } from "vitest";
import {
  ArtifactStore,
  EventBus,
  MockModelClient,
  NullNativeBridge,
  PageService,
  Repo,
  RunService,
  SetService,
  SettingsService,
  TaskEvidenceService,
  TaskService,
  openDb,
} from "@aux/runtime";
import { DocumentSnapshots } from "../../apps/runtime/dist/services/document-snapshots.js";
import { ContentMemoryStore } from "../../apps/runtime/dist/services/content-memory.js";
import { initializeFieldCodec } from "../../apps/runtime/dist/store/field-codec.js";
import { queuedSourceHash } from "../../apps/runtime/dist/services/queue-context.js";
import { listPdfSources, withPdfSources } from "../../apps/runtime/dist/services/pdf-sources.js";
import { captureOriginalPdf } from "../support/pdf-original.js";
import { profileSecrets } from "../support/profile-secrets.js";
import type { Run, TaskDocumentReference } from "@aux/contracts";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

async function queuedTaskDocuments(state: string, original: boolean) {
  const directory = mkdtempSync(join(tmpdir(), "aux-queued-task-documents-"));
  const native = profileSecrets("queued-pdf-probe").native;
  const db = openDb(":memory:");
  const repo = new Repo(db, await initializeFieldCodec(db, native, "queued-pdf-probe"));
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspaceId = tasks.createWorkspace("Synthetic queued source probe").workspaceId;
  const task = tasks.create({
    workspaceId,
    title: "Original task",
    objective: "Use only original queued context",
    criteria: [{ criterionId: "pdf", description: "Review source", verification: "manual" }],
  });
  const memory = new ContentMemoryStore(repo, native, "queued-pdf-probe");
  await memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    originScope: "listed-sites",
    allowedOrigins: ["https://queue.test"],
  });
  const article = await memory.saveEligible({
    workspaceId,
    pageId: "synthetic-capture",
    documentEpoch: 1,
    url: "https://queue.test/source",
    title: "Queued original source",
    text: "The original queue source contains only this synthetic paragraph.",
  });
  const captured = (
    await memory.list(workspaceId, { workspaceId, query: "", selectedIds: [article.memoryId] })
  ).selected[0]!;
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  const model = new MockModelClient();
  vi.spyOn(settings, "model").mockReturnValue(model);
  const mentions = fixtureTurnMentions((id) => repo.getPage(id));
  const pages = new PageService({
    repo,
    events,
    turnMentions: mentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const documents = new DocumentSnapshots(repo);
  const evidence = new TaskEvidenceService(repo, events, documents);
  const runs = new RunService({
    repo,
    events,
    pages,
    settings,
    sets: new SetService(repo, events, pages),
    artifacts: new ArtifactStore(directory, repo, events),
    documentSnapshots: documents,
    turnMentions: mentions,
    contentMemory: memory,
    nativeAvailable: () => false,
  });
  const originalModel = deferred(),
    originalEntered = deferred(),
    capturedRead = deferred(),
    releaseCaptured = deferred(),
    followupModel = deferred(),
    followupEntered = deferred();
  let calls = 0;
  model.toolCallStep = vi.fn(async () => {
    calls++;
    if (calls === 1) {
      originalEntered.resolve();
      await originalModel.promise;
    } else {
      followupEntered.resolve();
      await followupModel.promise;
    }
    const call = {
      toolCallId: `done-${calls}`,
      toolName: "submit_result",
      input: { report: "Synthetic task turn completed." },
    };
    return {
      message: { role: "assistant" as const, content: [{ type: "tool-call" as const, ...call }] },
      toolCalls: [call],
      durationMs: 1,
      inputTokens: 1,
      outputTokens: 1,
      costUsd: 0,
    };
  });
  const initial = captureOriginalPdf();
  const originalEvidence = original
    ? await evidence.importDocument(
        { ...initial.input, taskId: task.taskId, expectedRevision: task.revision, criterionId: "pdf" },
        initial.source,
        { signal: new AbortController().signal },
      )
    : undefined;
  const originalRefs: TaskDocumentReference[] = originalEvidence
    ? [
        {
          taskId: task.taskId,
          taskRevision: task.revision,
          evidenceId: originalEvidence.evidenceId,
          sha256: originalEvidence.document!.sha256,
        },
      ]
    : [];
  let messageId: string | undefined;
  let held = false;
  const originalList = memory.list.bind(memory);
  const sourceWait = vi.spyOn(memory, "list").mockImplementation(async (...args) => {
    if (!held && messageId && repo.getRunMessage(messageId)?.status === "delivering") {
      held = true;
      capturedRead.resolve();
      await releaseCaptured.promise;
    }
    return originalList(...args);
  });
  try {
    const prepared = tasks.prepareRun(task.taskId, task.revision);
    expect(prepared.contextTaskDocumentRefs).toEqual(originalRefs);
    const target = await runs.start({
      ...prepared,
      pageIds: [],
      contextMemoryRefs: [captured],
      contextSnapshot: true,
    });
    await originalEntered.promise;
    expect(repo.getRun(target.runId)?.status).toBe("running");
    const selected = captureOriginalPdf(initial.bytes.length + 1);
    const documentInput = {
      ...selected.input,
      taskId: task.taskId,
      expectedRevision: task.revision,
      criterionId: "pdf",
    };
    await expect(
      evidence.importDocument(documentInput, selected.source, { signal: new AbortController().signal }),
    ).rejects.toThrow("Stop active task runs");
    expect(selected.read).not.toHaveBeenCalled();
    const queued = runs.messages.queue({
      messageId: randomUUID(),
      runId: target.runId,
      chatId: prepared.chatId,
      text: "Use the original queued context",
      pageIds: [],
      contextPageRefs: [],
      expectedRevision: 0,
    });
    messageId = queued.messageId;
    expect(queued.status).toBe("accepted");
    const acceptedTarget = repo.getRun(target.runId)!;
    const acceptedHash = queuedSourceHash(acceptedTarget);
    expect(acceptedTarget.config?.contextTaskDocumentRefs ?? []).toEqual(originalRefs);
    if (state === "legacy unbound snapshot") {
      const saved = repo.getRun(target.runId)!;
      saved.config!.queuedMessageContexts![messageId]!.sourceHash = queuedSourceHash({
        ...saved,
        config: { ...saved.config, contextTaskDocumentRefs: [] },
      });
      repo.saveRun(saved);
      originalModel.resolve();
      await vi.waitFor(() => {
        if (repo.getRunMessage(messageId!)?.status !== "needs_attention")
          throw new Error("Original queued delivery has not refused the stale source yet");
      });
      return {
        status: repo.getRunMessage(messageId)?.status,
        error: repo.getRunMessage(messageId)?.error,
        deliveryCreated: !!repo.getRun(queued.deliveryRunId),
        calls,
      };
    }
    originalModel.resolve();
    await capturedRead.promise;
    expect(repo.getRun(target.runId)?.status).toBe("completed");
    expect(repo.getRunMessage(messageId)?.status).toBe("delivering");
    expect(repo.getRun(queued.deliveryRunId)).toBeUndefined();
    const imported = await evidence.importDocument(documentInput, selected.source, {
      signal: new AbortController().signal,
    });
    expect(tasks.get(task.taskId).revision).toBe(task.revision);
    expect(queuedSourceHash(repo.getRun(target.runId)!)).toBe(acceptedHash);
    expect(imported.document?.original?.kind).toBe("capture");
    if (state === "original evidence removed") {
      repo.db.prepare("DELETE FROM task_evidence WHERE evidence_id=?").run(originalEvidence!.evidenceId);
    }
    if (state === "original evidence replaced") {
      const row = repo.db
        .prepare("SELECT seq FROM task_evidence WHERE evidence_id=?")
        .get(originalEvidence!.evidenceId) as { seq: number };
      const replacement = { ...originalEvidence!, document: imported.document };
      repo.db
        .prepare("UPDATE task_evidence SET json=? WHERE seq=?")
        .run(
          repo.protectRecordField("task_evidence", [row.seq], "json", JSON.stringify(replacement)),
          row.seq,
        );
    }
    if (state === "original config changed") {
      const saved = repo.getRun(target.runId)!;
      saved.config!.contextTaskDocumentRefs = [];
      repo.saveRun(saved);
    }
    releaseCaptured.resolve();
    const shouldDeliver = state === "no original PDF" || state === "original PDF preserved";
    if (!shouldDeliver) {
      await vi.waitFor(() => {
        if (repo.getRunMessage(messageId!)?.status !== "needs_attention")
          throw new Error("Original queued delivery has not refused the stale source yet");
      });
      return {
        status: repo.getRunMessage(messageId)?.status,
        error: repo.getRunMessage(messageId)?.error,
        deliveryCreated: !!repo.getRun(queued.deliveryRunId),
        calls,
      };
    }
    await followupEntered.promise;
    await vi.waitFor(() => expect(repo.getRunMessage(messageId!)?.status).toBe("delivered"));
    const delivery = repo.getRun(queued.deliveryRunId)!;
    expect(delivery.config?.contextTaskDocumentRefs).toEqual(originalRefs);
    const control = runs.coordinator.controls.get(delivery.runId)!;
    const owner = {
      run: delivery,
      signal: control.abort.signal,
      checkCurrent() {
        if (runs.coordinator.controls.get(delivery.runId) !== control || control.paused)
          throw new Error("Original delivery owner changed");
      },
    };
    const deps = { repo, documents, attachments: runs.documents };
    const available = await listPdfSources(deps, {}, owner);
    expect(available.sources.map((item) => item.source)).toEqual(
      originalRefs.map((item) => ({ kind: "task_document", evidenceId: item.evidenceId })),
    );
    await expect(
      withPdfSources(
        deps,
        [{ kind: "task_document", evidenceId: imported.evidenceId }],
        owner,
        async (sources) => Buffer.from(sources[0]!.bytes),
      ),
    ).rejects.toThrow("Choose current document evidence admitted with this task revision");
    const originalBytes = originalEvidence
      ? await withPdfSources(
          deps,
          [{ kind: "task_document", evidenceId: originalEvidence.evidenceId }],
          owner,
          async (sources) => Buffer.from(sources[0]!.bytes),
        )
      : undefined;
    expect(originalBytes).toEqual(originalEvidence ? initial.bytes : undefined);
    return {
      status: repo.getRunMessage(messageId)?.status,
      error: repo.getRunMessage(messageId)?.error,
      deliveryCreated: !!repo.getRun(queued.deliveryRunId),
      calls,
    };
  } finally {
    originalModel.resolve();
    releaseCaptured.resolve();
    followupModel.resolve();
    sourceWait.mockRestore();
    await runs.close();
    await documents.close();
    await memory.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
    vi.restoreAllMocks();
  }
}

it.each([
  { state: "no original PDF", original: false, status: "delivered", calls: 2, error: undefined },
  { state: "original PDF preserved", original: true, status: "delivered", calls: 2, error: undefined },
  {
    state: "original evidence removed",
    original: true,
    status: "needs_attention",
    calls: 1,
    error: "An original queued task document changed or is unavailable. Review this follow-up.",
  },
  {
    state: "original evidence replaced",
    original: true,
    status: "needs_attention",
    calls: 1,
    error: "An original queued task document changed or is unavailable. Review this follow-up.",
  },
  {
    state: "original config changed",
    original: true,
    status: "needs_attention",
    calls: 1,
    error: "The queued message or its original source changed before delivery.",
  },
  {
    state: "legacy unbound snapshot",
    original: true,
    status: "needs_attention",
    calls: 1,
    error: "The queued message's exact source snapshot is unavailable or changed. Review and resend it.",
  },
])("keeps queued task documents sealed: $state", async ({ state, original, status, calls, error }) => {
  expect(await queuedTaskDocuments(state, original)).toEqual({
    status,
    calls,
    error,
    deliveryCreated: status === "delivered",
  });
});

it("treats an empty task PDF selection as absent and binds every original PDF identity", () => {
  const run: Run = {
    runId: "source-run",
    goal: "Original request",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: {
      chatId: "chat",
      messageRevision: 0,
      taskId: "task",
      taskRevision: 1,
      contextWorkspaceId: "space",
    },
  };
  const originalHash = queuedSourceHash(run);
  expect(queuedSourceHash({ ...run, config: { ...run.config, contextTaskDocumentRefs: [] } })).toBe(
    originalHash,
  );
  const reference = { taskId: "task", taskRevision: 1, evidenceId: "evidence", sha256: "a".repeat(64) };
  const selected = { ...run, config: { ...run.config, contextTaskDocumentRefs: [reference] } };
  expect(queuedSourceHash(selected)).not.toBe(originalHash);
  for (const changed of [
    { ...reference, taskId: "other" },
    { ...reference, taskRevision: 2 },
    { ...reference, evidenceId: "other" },
    { ...reference, sha256: "b".repeat(64) },
  ])
    expect(
      queuedSourceHash({ ...selected, config: { ...selected.config, contextTaskDocumentRefs: [changed] } }),
    ).not.toBe(queuedSourceHash(selected));
});
