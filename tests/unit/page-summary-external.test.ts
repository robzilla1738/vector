import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { expect, it, vi } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ObservationSchema } from "@aux/contracts";
import { DEFAULT_UTILITY_MODEL_ID } from "@aux/contracts/model-registry";
import {
  ArtifactStore,
  BudgetsService,
  EventBus,
  openDb,
  Repo,
  RunService,
  SettingsService,
  TaskService,
} from "@aux/runtime";
import { makeInvoker } from "../../apps/runtime/src/api/invoke.js";
import type { Services } from "../../apps/runtime/src/api/methods/context.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import { AgentConnectionService } from "../../apps/runtime/src/services/agent-connections.js";
import { ExternalSessionService } from "../../apps/runtime/src/services/external-sessions.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import { PageService } from "../../apps/runtime/src/services/pages.js";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";
import { pageDerivativeCache } from "../../apps/runtime/src/services/ai-result-cache.js";
import { SetService } from "../../apps/runtime/src/services/sets.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { fixturePage } from "../fixtures/turn-mentions.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

/** Entry must win before an operation settles; propagate its original early error. */
function waitForEntry(
  gate: Promise<void>,
  operation: Promise<unknown>,
  label: string,
): Promise<void> {
  return Promise.race([
    gate,
    operation.then(
      () => {
        throw new Error(`${label} settled before reaching its held entry.`);
      },
      (error: unknown) => {
        throw error;
      },
    ),
  ]);
}

it("funds scoped external summaries on the original session and joins a held dispatch on task retirement", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-external-summary-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("External summary");
  const page = {
    ...fixturePage("source", "https://source.test/research", 3),
    workspaceId: workspace.workspaceId,
    title: "Source research",
  };
  const sibling = {
    ...fixturePage("sibling", "https://source.test/context", 4),
    workspaceId: workspace.workspaceId,
    title: "Source context",
  };
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read original page",
    objective: "Summarize the approved resource",
    criteria: [
      {
        criterionId: "read",
        description: "Read source",
        verification: "manual",
      },
    ],
    resources: [
      {
        resourceId: "source",
        kind: "page",
        locator: page.pageId,
        label: "Source research",
      },
      {
        resourceId: "sibling",
        kind: "page",
        locator: sibling.pageId,
        label: "Source context",
      },
    ],
  });
  const connections = new AgentConnectionService(repo);
  const connection = connections.create({
    name: "Owned external summary",
    client: "codex",
    scope: {
      kind: "task",
      workspaceId: workspace.workspaceId,
      taskId: task.taskId,
    },
    expiresAt: Date.now() + 60_000,
  }).connection;
  const client = {
    external: true as const,
    connectionId: connection.connectionId,
    scope: connection.scope,
  };
  const mentions = new TurnMentionService({
    page: (id) => repo.getPage(id),
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const settings = new SettingsService(
    repo,
    join(directory, "settings.json"),
    {},
  );
  await settings.set({ agentMode: "auto", agentPolicyRevision: 0 });
  const safety = new SafetyDispatchGate({
    approvals: new ApprovalStore(repo.db),
    journal: new DecisionJournal(repo.db),
    managedRules: () => [],
    agentPolicy: () => settings.agentPolicy(),
    audit: () => {},
  });
  const secrets = new Map<string, string>();
  const native = Object.assign(new NullNativeBridge(), {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      secrets.set(name, value);
      return { ok: true as const };
    },
    profileStorageRoot: async () => {
      const name = `aux_root_v1_${createHash("sha256").update("external-summary-profile").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name))
        secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
    captureReadablePage: vi.fn(async () => ({
      url: page.url,
      title: page.title,
      text,
    })),
  });
  const memory = new ContentMemoryStore(
    repo,
    native,
    "external-summary-profile",
  );
  await memory.setPolicy(workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://source.test"],
  });
  const cacheRead = vi.spyOn(memory, "cachedDerivative");
  const capturedSibling = deferred(),
    joinSibling = deferred();
  const pages = new PageService({
    repo,
    events,
    native,
    drivers: () => ({ aux: null, chrome: null }),
    turnMentions: mentions,
    safetyGate: safety,
  });
  // PageService boot detaches persisted history. Publish the synthetic browser
  // attachment only after boot, with the same session/epoch used by observation.
  repo.upsertPage(page);
  repo.upsertPage(sibling);
  expect(pages.get(page.pageId)).toMatchObject({
    sessionId: page.sessionId,
    documentEpoch: page.documentEpoch,
    viewStatus: "visible",
  });
  expect(pages.get(sibling.pageId)).toMatchObject({
    sessionId: sibling.sessionId,
    documentEpoch: sibling.documentEpoch,
    viewStatus: "visible",
  });
  const text =
    "Captured browser evidence supports factual research. Exact source quotations remain verifiable.";
  const observe = vi
    .spyOn(pages, "observe")
    .mockImplementation(async (pageId) => {
      const source = pages.get(pageId);
      if (pageId === sibling.pageId) {
        capturedSibling.resolve();
        await joinSibling.promise;
      }
      return ObservationSchema.parse({
        observationId: "external-source-observation",
        pageId: source.pageId,
        documentEpoch: source.documentEpoch,
        revision: 7,
        observedAt: Date.now(),
        scope: "full",
        content: {
          url: source.url,
          title: source.title,
          viewport: { width: 100, height: 100, scale: 1 },
          scroll: { x: 0, y: 0, maxY: 0 },
          frames: [],
          text,
          headings: [],
          elements: [],
          formFields: [],
          tables: [],
          links: [],
          dialogs: [],
          truncated: false,
          stats: {
            elementsTotal: 0,
            elementsShown: 0,
            textChars: text.length,
            approxTokens: 20,
          },
        },
      });
    });
  // The observation, protected-storage primitive and provider transport are synthetic.
  // Connection,
  // task-read admission, session registration, funding and Stop are real services.
  const read = vi.spyOn(pages, "authorizeAgentRead");
  const joined = deferred(),
    entered = deferred(),
    aborted = deferred();
  let held = false;
  const dispatch = vi.fn();
  const utility: ModelClient = {
    async generateStructured(opts) {
      await opts.beforeDispatch?.();
      dispatch();
      if (held) {
        if (!opts.signal)
          throw new Error(
            "Actual utility admission must retain its original signal.",
          );
        if (opts.signal.aborted) aborted.resolve();
        else
          opts.signal.addEventListener("abort", aborted.resolve, {
            once: true,
          });
        entered.resolve();
        await joined.promise;
      }
      return {
        object: opts.schema.parse({
          summary: "The excerpt describes verifiable browser research.",
          quotes: ["Exact source quotations remain verifiable."],
        }),
        durationMs: 2,
        inputTokens: 31,
        outputTokens: 17,
        providerMetadata: { gateway: { cost: "0.003" } },
      };
    },
    async generateText() {
      throw new Error(
        "Summary requires the canonical structured utility path.",
      );
    },
    async listModels() {
      return [];
    },
  };
  const route = vi
    .spyOn(settings, "utilityModel")
    .mockImplementation(async () => ({
      kind: "network",
      model: utility,
      modelId: DEFAULT_UTILITY_MODEL_ID,
      provider: "gateway",
      destination: "https://ai-gateway.vercel.sh",
    }));
  const runs = new RunService({
    documentSnapshots: new DocumentSnapshots(repo),
    repo,
    events,
    pages,
    settings,
    turnMentions: mentions,
    sets: new SetService(repo, events, pages),
    artifacts: new ArtifactStore(join(directory, "artifacts"), repo, events),
    budgets: new BudgetsService(
      repo.db,
      () => settings.budgetLimits(),
      budgetLineage(repo),
    ),
    nativeAvailable: () => false,
    contentMemory: memory,
  });
  const sessions = new ExternalSessionService(
    repo,
    events,
    mentions,
    async (_connectionId, runId) => {
      await runs.cancel(runId, "Original external task retired.");
    },
  );
  const invoke = makeInvoker({
    repo,
    events,
    tasks,
    pages,
    settings,
    runs,
    native,
    turnMentions: mentions,
    agentConnections: connections,
    externalSessions: sessions,
    safetyGate: safety,
    contentMemory: memory,
  } as unknown as Services);
  let pending: Promise<unknown> | undefined;
  let siblingPending: Promise<unknown> | undefined;
  try {
    // A real enabled encrypted cache is available; scoped work must bypass it.
    expect(
      pageDerivativeCache(
        { repo, pages, settings, native, contentMemory: memory },
        [page.pageId],
      ),
    ).toBeDefined();
    const runId = sessions.ensure(client)!;
    expect(runId).toBeTruthy();
    expect(repo.getRun(runId)?.config).toMatchObject({
      implementation: "external-agent",
      externalConnectionId: connection.connectionId,
      taskId: task.taskId,
      taskRevision: task.revision,
    });
    expect(repo.getRun(runId)?.config?.nativeTurnContext).toBeUndefined();
    expect(runs.coordinator.controls.has(runId)).toBe(false);
    const result = await invoke(
      "agent.pageSummary",
      { runId, pageId: page.pageId },
      client,
    );
    expect(result).toMatchObject({
      pageId: page.pageId,
      observationId: "external-source-observation",
      revision: 7,
      quotes: ["Exact source quotations remain verifiable."],
    });
    expect(observe).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalled();
    const proof = read.mock.calls[0]?.[3];
    expect(proof?.provenance).toMatchObject({
      taskId: task.taskId,
      pageId: page.pageId,
      documentEpoch: 3,
      sessionId: page.sessionId,
    });
    expect(proof?.check).toBeTypeOf("function");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(route.mock.calls[0]).toEqual([]);
    expect(cacheRead).not.toHaveBeenCalled();
    expect(native.captureReadablePage).not.toHaveBeenCalled();
    expect(repo.listModelCalls(runId)).toEqual([
      expect.objectContaining({
        runId,
        costUsd: 0.003,
        inputTokens: 31,
        outputTokens: 17,
      }),
    ]);
    expect(
      Number(
        repo.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()!.n,
      ),
    ).toBe(0);
    expect(repo.getRun(runId)?.status).toBe("running");
    expect(runs.coordinator.controls.has(runId)).toBe(false);

    held = true;
    pending = invoke(
      "agent.pageSummary",
      { runId, pageId: page.pageId, focus: "Source context" },
      client,
    );
    await waitForEntry(entered.promise, pending, "Funded summary");
    const rejected = expect(pending).rejects.toMatchObject({
      code: expect.stringMatching(/cancelled|permission_denied|conflict/),
    });
    const originalControl = runs.coordinator.controls.get(runId);
    expect(originalControl).toBeDefined();
    siblingPending = invoke(
      "agent.pageSummary",
      { runId, pageId: sibling.pageId },
      client,
    );
    await waitForEntry(
      capturedSibling.promise,
      siblingPending,
      "Sibling observation",
    );
    const siblingRejected = expect(siblingPending).rejects.toMatchObject({
      code: expect.stringMatching(
        /cancelled|permission_denied|conflict|ref_stale/,
      ),
    });
    expect(runs.coordinator.controls.get(runId)).toBe(originalControl);
    expect(runs.pageOwnership.snapshot()[sibling.pageId]).toMatchObject({
      actor: "external",
      runId,
      connectionId: connection.connectionId,
      taskId: task.taskId,
    });
    expect(() =>
      tasks.update({
        taskId: task.taskId,
        expectedRevision: task.revision,
        title: "Replacement task authority",
      }),
    ).toThrow("active run");
    let stopped = false;
    const stop = sessions
      .end(
        connection.connectionId,
        "cancelled",
        "Original task revision retired",
      )
      .then(() => {
        stopped = true;
      });
    await waitForEntry(aborted.promise, stop, "Original Stop abort");
    expect(() => proof?.check()).toThrow();
    await Promise.resolve();
    expect(stopped).toBe(false);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(
      Number(
        repo.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()!.n,
      ),
    ).toBe(0);
    joined.resolve();
    await rejected;
    await Promise.resolve();
    expect(stopped).toBe(false);
    expect(runs.coordinator.controls.get(runId)).toBe(originalControl);
    joinSibling.resolve();
    await siblingRejected;
    await stop;
    expect(stopped).toBe(true);
    expect(repo.getRun(runId)?.status).toBe("cancelled");
    const revised = tasks.update({
      taskId: task.taskId,
      expectedRevision: task.revision,
      title: "Replacement task authority",
    });
    expect(revised.revision).toBe(task.revision + 1);
    expect(() => proof?.check()).toThrow();
    expect(runs.coordinator.controls.has(runId)).toBe(false);
    expect(repo.listModelCalls(runId)).toHaveLength(2);
    expect(cacheRead).not.toHaveBeenCalled();
    expect(native.captureReadablePage).not.toHaveBeenCalled();
    expect(
      Number(
        repo.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()!.n,
      ),
    ).toBe(0);
  } finally {
    joined.resolve();
    joinSibling.resolve();
    await siblingPending?.catch(() => {});
    await pending?.catch(() => {});
    await sessions.dispose();
    await invoke.dispose();
    await runs.close();
    await memory.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
