import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { IMAGE_MODELS } from "@aux/contracts";
import { EventBus, openDb, Repo, SettingsService } from "@aux/runtime";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { SpendLedger } from "../../apps/runtime/src/store/spend-ledger.js";
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
  const artifacts = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
  const decideEgress = vi.fn(async () => {});
  dispose.push(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const generate = () =>
    agentMethods["agent.images.generate"]!({
      client: {},
      params: { prompt: "Synthetic blue circle", taskId: "fixture-task" },
      s: { settings, artifacts },
      decideEgress,
    } as never);
  return { settings, artifacts, decideEgress, generate, dir };
}

it.each(IMAGE_MODELS)(
  "uses the saved $label selection for one synthetic dispatch, receipt and spend reservation",
  async (model) => {
    const f = fixture();
    await f.settings.set({ imageModel: model.id, effectGrants: ["effect:egress"] });
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
  await f.settings.set({ imageModel: IMAGE_MODELS[1].id, effectGrants: ["effect:egress"] });
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
    effectGrants: ["effect:egress"],
    modelProvider: "openai",
    modelConnection: { provider: "gateway", enabled: false },
  });
  await expect(f.generate()).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(imageCall).not.toHaveBeenCalled();
});

it.each(["off", "replacement", "cap"])(
  "rechecks image settings after asynchronous egress approval (%s)",
  async (change) => {
    const f = fixture();
    await f.settings.set({ imageModel: IMAGE_MODELS[0].id, effectGrants: ["effect:egress"] });
    f.decideEgress.mockImplementationOnce(async () => {
      await f.settings.set(
        change === "cap"
          ? { budgets: { dayUsd: 1 } }
          : { imageModel: change === "off" ? null : IMAGE_MODELS[1].id },
      );
    });
    await expect(f.generate()).rejects.toThrow();
    expect(imageCall).not.toHaveBeenCalled();
  },
);
