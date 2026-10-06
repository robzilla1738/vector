import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { IMAGE_MODELS } from "@aux/contracts";
import { EventBus, openDb, Repo, SettingsService } from "@aux/runtime";
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
vi.mock("ai", async (original) => ({ ...(await original<typeof import("ai")>()), generateImage: imageCall }));
const dispose: (() => void)[] = [];
afterEach(() => {
  for (const fn of dispose.splice(0).reverse()) fn();
  vi.unstubAllEnvs();
  imageCall.mockReset();
});
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-image-setting-")),
    db = openDb(":memory:"),
    repo = new Repo(db);
  vi.stubEnv("AUX_SPEND_LEDGER_PATH", join(dir, "spend.sqlite"));
  vi.stubEnv("AUX_PROGRAM_SPEND_CAP_USD", "5");
  const settings = new SettingsService(repo, join(dir, "settings.json"), {
    AI_GATEWAY_API_KEY: "synthetic-image-only",
  });
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
  const runs = new RunService({
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
  dispose.push(() => {
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
