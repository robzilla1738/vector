import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { IMAGE_MODELS } from "@aux/contracts";
import { EventBus, openDb, Repo, SettingsService } from "@aux/runtime";
import { PrivateBudgetOwner } from "../../apps/runtime/src/services/private-budget.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { SpendLedger } from "../../apps/runtime/src/store/spend-ledger.js";
import { RunService } from "../../apps/runtime/src/services/runs.js";
import { BudgetsService } from "../../apps/runtime/src/services/budgets.js";
import { PageService } from "../../apps/runtime/src/services/pages.js";
import { SetService } from "../../apps/runtime/src/services/sets.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";
import { agentMethods } from "../../apps/runtime/src/api/methods/agent.js";

const imageCall = vi.hoisted(() => vi.fn());
vi.mock("ai", async (original) => ({
  ...(await original<typeof import("ai")>()),
  generateImage: async (input: {
    model: { doGenerate(params: unknown): Promise<unknown> };
    prompt: string;
  }) => {
    // Exercise the actual Gateway transport before the configurable output fixture.
    await input.model.doGenerate({ prompt: input.prompt, n: 1, providerOptions: {} });
    return imageCall(input);
  },
}));
const dispose: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const fn of dispose.splice(0).reverse()) await fn();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  imageCall.mockReset();
});
function fixture(env: NodeJS.ProcessEnv = { AI_GATEWAY_API_KEY: "synthetic-image-only" }) {
  const dir = mkdtempSync(join(tmpdir(), "aux-image-setting-")),
    db = openDb(":memory:"),
    repo = new Repo(db);
  vi.stubEnv("AUX_SPEND_LEDGER_PATH", join(dir, "spend.sqlite"));
  vi.stubEnv("AUX_PROGRAM_SPEND_CAP_USD", "5");
  const settings = new SettingsService(repo, join(dir, "settings.json"), env);
  const network = vi.fn<typeof fetch>(async () => Response.json({ images: [] }));
  vi.stubGlobal("fetch", network);
  const events = new EventBus(repo);
  const artifacts = new ArtifactStore(join(dir, "artifacts"), repo, events);
  const turnMentions = fixtureTurnMentions((id) => repo.getPage(id));
  const pages = new PageService({
    repo,
    events,
    turnMentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const budgets = new BudgetsService(db, () => settings.budgetLimits(), budgetLineage(repo));
  const owner = new PrivateBudgetOwner(repo, budgets),
    accountBudget = owner.client();
  const runs = new RunService({
    documentSnapshots: new DocumentSnapshots(repo),
    accountBudget,
    repo,
    events,
    artifacts,
    turnMentions,
    pages,
    settings,
    budgets,
    sets: new SetService(repo, events, pages),
    nativeAvailable: () => false,
  });
  let ownerLive = true;
  const native = {
    turnSourceContext: async () => {
      if (!ownerLive) throw new Error("Original window retired");
      return {
        windowId: "original-image-window",
        activePageId: null,
        revision: 0,
        shared: null,
        layout: null,
      };
    },
  };
  const decideEgress = vi.fn(async () => {});
  dispose.push(async () => {
    await accountBudget.close();
    owner.close();
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const generate = () =>
    agentMethods["agent.images.generate"]!({
      client: { nativeTurnContext: "00000000-0000-4000-8000-000000000001" },
      params: { prompt: "Synthetic blue circle" },
      s: { settings, artifacts, repo, runs, native },
      decideEgress,
    } as never);
  return {
    settings,
    network,
    artifacts,
    decideEgress,
    generate,
    dir,
    repo,
    runs,
    budgets,
    events,
    retireOwner: () => {
      ownerLive = false;
    },
  };
}

it.each(IMAGE_MODELS)(
  "uses the saved $label selection for one synthetic dispatch, receipt and spend reservation",
  async (model) => {
    const f = fixture();
    await f.settings.set({ imageModel: model.id });
    imageCall.mockResolvedValue({
      image: { uint8Array: PNG.sync.write(new PNG({ width: 1, height: 1 })), mediaType: "image/png" },
      providerMetadata: { gateway: { cost: "0.03" } },
    });
    const result = (await f.generate()) as { artifactId: string; modelId: string; mediaType: string };
    expect(result).toMatchObject({ modelId: model.id, mediaType: "image/png" });
    expect(imageCall).toHaveBeenCalledTimes(1);
    expect(imageCall.mock.calls[0]![0]).toMatchObject({
      model: { modelId: model.id },
      prompt: "Synthetic blue circle",
      n: 1,
      maxRetries: 0,
    });
    expect(f.decideEgress).toHaveBeenCalledTimes(1);
    const calls = f.repo.db.prepare("SELECT run_id,cost_usd,cost_estimated FROM model_calls").all();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ cost_usd: 0.03, cost_estimated: 0 });
    expect(f.repo.getRun(String(calls[0]!.run_id))).toMatchObject({
      status: "completed",
      config: { implementation: "image-generation" },
    });
    expect(f.artifacts.read(result.artifactId).artifact.mediaType).toBe("image/png");
    const ledger = new SpendLedger(join(f.dir, "spend.sqlite"), { AUX_PROGRAM_SPEND_CAP_USD: "5" });
    try {
      expect(ledger.db.prepare("SELECT model_id,actual_nanos FROM ai_spend").get()).toMatchObject({
        model_id: model.id,
        actual_nanos: 30000000,
      });
    } finally {
      ledger.close();
    }
  },
);

it("does not fall back after an image provider error and retains unknown spend", async () => {
  const f = fixture();
  await f.settings.set({ imageModel: IMAGE_MODELS[0].id });
  imageCall.mockRejectedValue(new Error("Synthetic unavailable model"));
  await expect(f.generate()).rejects.toThrow(/unavailable model/);
  expect(imageCall).toHaveBeenCalledTimes(1);
  const ledger = new SpendLedger(join(f.dir, "spend.sqlite"), { AUX_PROGRAM_SPEND_CAP_USD: "5" });
  try {
    expect(ledger.summary().committedUsd).toBe(1);
  } finally {
    ledger.close();
  }
});

it("does not use a disconnected Gateway for images even when another chat provider is selected", async () => {
  const f = fixture();
  await f.settings.set({
    imageModel: IMAGE_MODELS[0].id,
    modelProvider: "openai",
    modelConnection: { provider: "gateway", enabled: false },
  });
  await expect(f.generate()).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(imageCall).not.toHaveBeenCalled();
});

it.each(["off", "replacement"])(
  "rechecks image settings after asynchronous egress approval (%s)",
  async (change) => {
    const f = fixture();
    await f.settings.set({ imageModel: IMAGE_MODELS[0].id });
    f.decideEgress.mockImplementationOnce(async () => {
      await f.settings.set(
        change === "off" ? { imageModel: null } : { gatewayApiKey: "replacement-fixture-key" },
      );
    });
    await expect(f.generate()).rejects.toThrow();
    expect(imageCall).not.toHaveBeenCalled();
  },
);

it("reserves user budget before dispatch and continues only the original image request with enough headroom", async () => {
  const f = fixture();
  await f.settings.set({ budgets: { dayUsd: 0.5 } });
  imageCall.mockImplementation(async () => {
    expect(f.budgets.spentDayUsd()).toBe(1);
    return {
      image: { uint8Array: PNG.sync.write(new PNG({ width: 1, height: 1 })), mediaType: "image/png" },
      providerMetadata: { gateway: { cost: 0.04 } },
    };
  });
  const pending = f.generate();
  await vi.waitFor(() => expect(f.repo.listRuns()[0]?.status).toBe("needs_input"));
  const run = f.repo.listRuns()[0]!;
  const suspension = f.runs.coordinator.suspensions.pending(run.runId)!;
  expect(suspension.request.budget).toMatchObject({ reason: "spend", used: 0, limit: 0.5, requiredUsd: 1 });
  expect(imageCall).not.toHaveBeenCalled();
  await f.settings.set({ budgets: { dayUsd: 0.75 } });
  await expect(f.runs.coordinator.continueBudget(run.runId, suspension.suspensionId)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(f.runs.coordinator.suspensions.pending(run.runId)?.suspensionId).toBe(suspension.suspensionId);
  await f.settings.set({ budgets: { dayUsd: 2 } });
  await f.runs.coordinator.continueBudget(run.runId, suspension.suspensionId);
  await pending;
  expect(imageCall).toHaveBeenCalledTimes(1);
  expect(f.budgets.spentRunUsd(run.runId)).toBe(0.04);
  expect(f.budgets.spentDayUsd()).toBe(0.04);
});

it("retains unresolved accounting after unknown usage and refuses stale-window artifact publication", async () => {
  const f = fixture();
  imageCall.mockImplementation(async () => {
    f.retireOwner();
    return {
      image: { uint8Array: PNG.sync.write(new PNG({ width: 1, height: 1 })), mediaType: "image/png" },
    };
  });
  await expect(f.generate()).rejects.toThrow(/window retired/);
  expect(f.repo.db.prepare("SELECT cost_usd,cost_estimated FROM model_calls").get()).toMatchObject({
    cost_usd: null,
    cost_estimated: 1,
  });
  expect(f.repo.db.prepare("SELECT count(*) n FROM artifacts").get()).toMatchObject({ n: 0 });
});

it("charges known invalid provider output honestly and never publishes it", async () => {
  const f = fixture();
  imageCall.mockResolvedValue({
    image: { uint8Array: new Uint8Array([1, 2]), mediaType: "image/png" },
    providerMetadata: { gateway: { cost: 0.06 } },
  });
  await expect(f.generate()).rejects.toThrow(/invalid image bytes/);
  expect(f.budgets.spentDayUsd()).toBe(0.06);
  expect(f.repo.db.prepare("SELECT cost_estimated FROM model_calls").get()).toMatchObject({
    cost_estimated: 0,
  });
});

it("cancels the actual in-flight image transport and retains unknown attempted spend", async () => {
  const f = fixture();
  imageCall.mockImplementation(async (request: { abortSignal: AbortSignal }) => {
    return new Promise((_resolve, reject) => {
      request.abortSignal.addEventListener("abort", () => reject(request.abortSignal.reason), { once: true });
    });
  });
  const pending = f.generate();
  const outcome = pending.catch((error: unknown) => error);
  await vi.waitFor(() => expect(imageCall).toHaveBeenCalledTimes(1));
  const run = f.repo.listRuns()[0]!;
  await f.runs.cancel(run.runId);
  expect(await outcome).toMatchObject({ code: "cancelled" });
  expect(f.repo.getRun(run.runId)?.status).toBe("cancelled");
  expect(f.budgets.runCostComplete(run.runId)).toBe(false);
  expect(f.budgets.status({}).find((window) => window.scope === "day")?.unpricedModelCalls).toBe(1);
  expect(f.repo.db.prepare("SELECT count(*) n FROM artifacts").get()).toMatchObject({ n: 0 });
});

it("settles the actual image receipt when it exceeds the estimate without inventing a price cap", async () => {
  const f = fixture();
  imageCall.mockResolvedValue({
    image: { uint8Array: PNG.sync.write(new PNG({ width: 1, height: 1 })), mediaType: "image/png" },
    providerMetadata: { gateway: { cost: 1.2 } },
  });
  const result = await f.generate();
  expect(result).toMatchObject({ mediaType: "image/png" });
  expect(f.budgets.spentDayUsd()).toBe(1.2);
  expect(f.repo.db.prepare("SELECT cost_estimated FROM model_calls").get()).toMatchObject({
    cost_estimated: 0,
  });
});

it("uses the original Gateway image lease in private and refuses a lease returned after its window retires", async () => {
  const normal = fixture({ AI_GATEWAY_API_KEY: "original-image-key", OPENAI_API_KEY: "original-text-key" });
  await normal.settings.set({ modelProvider: "openai" });
  const f = fixture({ AUX_PRIVATE_SESSION: "00000000-0000-4000-8000-000000000002" });
  const requests: unknown[] = [];
  let retireOnCredential = false;
  await f.settings.attachPrivateProvider(async (request) => {
    requests.push(request);
    const result = await normal.settings.privateProviderRequest(request);
    if (request.operation === "credential" && retireOnCredential) f.retireOwner();
    return result;
  });
  imageCall.mockResolvedValue({
    image: { uint8Array: PNG.sync.write(new PNG({ width: 1, height: 1 })), mediaType: "image/png" },
    providerMetadata: { gateway: { cost: 0.03 } },
  });
  await f.generate();
  expect(new Headers(f.network.mock.calls[0]![1]?.headers).get("authorization")).toBe(
    "Bearer original-image-key",
  );
  expect(f.network.mock.calls[0]![1]?.redirect).toBe("error");
  expect(JSON.stringify(requests)).not.toContain("Synthetic blue circle");
  expect(JSON.stringify(f.repo.db.prepare("SELECT * FROM kv").all())).not.toContain("original-image-key");
  retireOnCredential = true;
  await expect(f.generate()).rejects.toThrow(/window retired/);
  expect(f.network).toHaveBeenCalledTimes(1);
  expect(imageCall).toHaveBeenCalledTimes(1);
});
