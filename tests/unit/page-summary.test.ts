import { afterEach, expect, it, vi } from "vitest";
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
  MockModelClient,
  openDb,
  Repo,
  RunService,
  SettingsService,
  TaskService,
} from "@aux/runtime";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";
import { SetService } from "../../apps/runtime/src/services/sets.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import type {
  PageDerivativeCacheContext,
  PageDerivativeCache,
} from "../../apps/runtime/src/services/ai-result-cache.js";
import { pageDerivativeCache } from "../../apps/runtime/src/services/ai-result-cache.js";
import type { PageService } from "../../apps/runtime/src/services/pages.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import { fixturePage } from "../fixtures/turn-mentions.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const text =
  "Browser research uses captured evidence. Exact quotations preserve source context.";

async function fixture(privateTask = false) {
  const directory = mkdtempSync(join(tmpdir(), "aux-summary-source-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const workspace = new TaskService(repo, events).createWorkspace(
    "Summary evidence",
  );
  const page = {
    ...fixturePage("page", "https://example.test/research", 3),
    ownedByRuntime: privateTask,
    title: "Browser research",
    windowKind: "normal" as const,
    workspaceId: workspace.workspaceId,
  };
  repo.upsertPage(page);
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      secrets.set(name, value);
      return { ok: true as const };
    },
    profileStorageRoot: async () => {
      const name = `aux_root_v1_${createHash("sha256").update("summary-profile").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name))
        secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
    captureReadablePage: vi.fn(async () => ({
      url: page.url,
      title: page.title,
      text,
    })),
    turnSourceContext: vi.fn(async () => ({
      windowId: "main",
      activePageId: page.pageId,
      revision: 0,
      shared: null,
      layout: null,
    })),
  };
  const memory = new ContentMemoryStore(repo, native, "summary-profile");
  await memory.setPolicy(workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const settings = new SettingsService(
    repo,
    join(directory, "settings.json"),
    {},
  );
  let generation = "original-account";
  vi.spyOn(settings, "modelCacheGeneration").mockImplementation(
    () => generation,
  );
  const entered = deferred<void>();
  const mainModel: ModelClient = new MockModelClient();
  mainModel.toolCallStep = async ({ signal }) => {
    if (!signal) throw new Error("The original SDK loop must supply its real abort signal.");
    entered.resolve();
    await new Promise<void>((_, reject) => {
      if (signal.aborted) reject(signal.reason);
      else
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
    });
    throw new Error("The original held SDK call must retire through Stop.");
  };
  vi.spyOn(settings, "model").mockReturnValue(mainModel);
  let response = {
    summary: "The page describes evidence-based browser research.",
    quotes: ["Exact quotations preserve source context."],
  };
  let gate: ReturnType<typeof deferred<void>> | undefined;
  const dispatched = vi.fn();
  const utility: ModelClient = {
    async generateStructured(opts) {
      await opts.beforeDispatch?.();
      dispatched();
      await gate?.promise;
      return {
        object: opts.schema.parse(response),
        durationMs: 2,
        inputTokens: 31,
        outputTokens: 17,
        providerMetadata: { gateway: { cost: "0.003" } },
      };
    },
    async generateText() {
      throw new Error("Summary must use its structured producer.");
    },
    async listModels() {
      return [];
    },
  };
  vi.spyOn(settings, "utilityModel").mockImplementation(async () => ({
    kind: "network",
    model: utility,
    modelId: DEFAULT_UTILITY_MODEL_ID,
    provider: "gateway",
    destination: "https://ai-gateway.vercel.sh",
  }));
  const turnMentions = new TurnMentionService({
    page: (id) => (id === page.pageId ? page : undefined),
    organization: async () => ({ revision: 0, shared: null }),
    turnSourceContext: native.turnSourceContext,
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const pages = {
    get: (id: string) => {
      if (id !== page.pageId) throw new Error("Missing original page");
      return page;
    },
    observe: async () => observation(),
  } as unknown as PageService;
  function observation() {
    return ObservationSchema.parse({
      observationId: "original-observation",
      pageId: page.pageId,
      documentEpoch: page.documentEpoch,
      revision: 1,
      observedAt: Date.now(),
      scope: "full",
      content: {
        url: page.url,
        title: page.title,
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
  }
  const runs = new RunService({
    repo,
    events,
    pages,
    settings,
    turnMentions,
    sets: new SetService(repo, events, pages),
    artifacts: new ArtifactStore(join(directory, "artifacts"), repo, events),
    budgets: new BudgetsService(
      repo.db,
      () => settings.budgetLimits(),
      budgetLineage(repo),
    ),
    nativeAvailable: () => false,
  });
  cleanup.push(async () => {
    gate?.resolve();
    await runs.close();
    await memory.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  if (privateTask)
    runs.coordinator.deps.prepareSources = async (original) => {
      runs.coordinator.ownPage(original.runId, page.pageId);
    };
  const run = await runs.coordinator.start({
    goal: "Read original browser evidence",
    pageIds: [],
    privateTask,
    nativeTurnContext: "00000000-0000-4000-8000-000000000001",
  });
  await entered.promise;
  expect(repo.getRun(run.runId)?.status).toBe("running");
  const authorize = vi.fn(async () => {});
  const checkOwner = vi.fn(async () => {
    await turnMentions.assert(run.runId, page.pageId, "read");
  });
  const cache = () =>
    pageDerivativeCache(
      {
        repo,
        settings,
        pages,
        contentMemory: memory,
        native,
      } as unknown as PageDerivativeCacheContext,
      [page.pageId],
    )!;
  const cacheObject = vi.fn();
  const summarize = (focus?: string) =>
    runs.summarizePage({
      runId: run.runId,
      observation: observation(),
      focus,
      signal: new AbortController().signal,
      checkOwner,
      authorize,
      cache: (() => {
        const actual = cache();
        const supplied: PageDerivativeCache = {
          object(input) {
            cacheObject();
            return actual.object(input);
          },
        };
        return supplied;
      })(),
    });
  return {
    repo,
    runs,
    run,
    page,
    memory,
    native,
    settings,
    dispatched,
    authorize,
    checkOwner,
    summarize,
    cacheObject,
    hold: () => {
      gate = deferred<void>();
      return gate;
    },
    response: (value: typeof response) => {
      response = value;
    },
    rotateAccount: () => {
      generation = "replacement-account";
    },
    cacheCount: () =>
      Number(
        repo.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()!.n,
      ),
  };
}

it("keeps held summaries and cache hits bound to the original live run, document and account", async () => {
  const f = await fixture();
  const first = await f.summarize();
  expect(first).toMatchObject({
    observationId: "original-observation",
    documentEpoch: 3,
    sourceUrl: f.page.url,
    quotes: ["Exact quotations preserve source context."],
  });
  expect(f.cacheCount()).toBe(1);
  expect(f.dispatched).toHaveBeenCalledTimes(1);
  expect(f.authorize).toHaveBeenCalled();
  expect(
    f.repo
      .listModelCalls(f.run.runId)
      .filter(
        (call) =>
          call.providerMetadata?.aux &&
          (call.providerMetadata.aux as { kind?: string }).kind ===
            "utility_generation",
      ),
  ).toEqual([
    expect.objectContaining({
      runId: f.run.runId,
      costUsd: 0.003,
      costEstimated: false,
      inputTokens: 31,
      outputTokens: 17,
    }),
  ]);
  const checked = f.checkOwner.mock.calls.length;
  await expect(f.summarize()).resolves.toEqual(first);
  expect(f.checkOwner.mock.calls.length).toBeGreaterThan(checked);
  expect(f.native.captureReadablePage).toHaveBeenCalledTimes(2);
  expect(f.dispatched).toHaveBeenCalledTimes(1);

  f.response({
    summary: "Unsupported inference",
    quotes: ["Not present in the captured text"],
  });
  await expect(f.summarize("invalid quote")).rejects.toMatchObject({
    code: "invalid_params",
  });
  expect(f.cacheCount()).toBe(1);
  f.response({
    summary: "Original evidence",
    quotes: ["Browser research uses captured evidence."],
  });
  const held = f.hold();
  const pending = f.summarize("document retirement");
  const rejected = expect(pending).rejects.toMatchObject({
    code: "permission_denied",
  });
  await vi.waitFor(() => expect(f.dispatched).toHaveBeenCalledTimes(3));
  f.page.documentEpoch++;
  held.resolve();
  await rejected;
  expect(f.cacheCount()).toBe(1);
  // The dispatched provider receipt remains accounted even when its output is withheld.
  expect(
    f.repo
      .listModelCalls(f.run.runId)
      .filter(
        (call) =>
          call.providerMetadata?.aux &&
          (call.providerMetadata.aux as { kind?: string }).kind ===
            "utility_generation",
      ),
  ).toEqual([
    expect.objectContaining({ costUsd: 0.003, costEstimated: false }),
    expect.objectContaining({ costUsd: 0.003, costEstimated: false }),
    expect.objectContaining({
      costUsd: 0.003,
      costEstimated: false,
      inputTokens: 31,
      outputTokens: 17,
      error: expect.any(String),
    }),
  ]);

  const account = await fixture();
  const accountHeld = account.hold();
  const accountPending = account.summarize("account retirement");
  const accountRejected = expect(accountPending).rejects.toMatchObject({
    code: "cancelled",
  });
  await vi.waitFor(() => expect(account.dispatched).toHaveBeenCalledTimes(1));
  account.rotateAccount();
  accountHeld.resolve();
  await accountRejected;
  expect(account.cacheCount()).toBe(0);

  const original = await fixture();
  const runHeld = original.hold();
  const runPending = original.summarize("original run Stop");
  const runRejected = expect(runPending).rejects.toBeDefined();
  await vi.waitFor(() => expect(original.dispatched).toHaveBeenCalledTimes(1));
  const stopped = original.runs.cancel(
    original.run.runId,
    "Original human Stop",
  );
  runHeld.resolve();
  await Promise.all([runRejected, stopped]);
  expect(original.cacheCount()).toBe(0);
  await expect(original.summarize()).rejects.toMatchObject({
    code: "permission_denied",
  });

  const privateRun = await fixture(true);
  await privateRun.summarize();
  await privateRun.summarize();
  expect(privateRun.cacheObject).not.toHaveBeenCalled();
  expect(privateRun.cacheCount()).toBe(0);
  expect(privateRun.dispatched).toHaveBeenCalledTimes(2);
});
