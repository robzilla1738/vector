import { PrivateBudgetClient, PrivateBudgetOwner } from "../../apps/runtime/dist/services/private-budget.js";
import { BudgetsService } from "@aux/runtime";
import { budgetLineage } from "../fixtures/budget-lineage.js";
import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openDb, Repo, SettingsService } from "@aux/runtime";
import { IMAGE_MODELS, MethodSchemas } from "@aux/contracts";
import { agentMethods } from "../../apps/runtime/src/api/methods/agent.js";

const dispose: (() => void)[] = [];
afterEach(() => {
  for (const fn of dispose.splice(0).reverse()) fn();
  vi.unstubAllGlobals();
});
function fixture(env: NodeJS.ProcessEnv = {}) {
  const dir = mkdtempSync(join(tmpdir(), "aux-model-connections-")),
    db = openDb(join(dir, "db.sqlite")),
    repo = new Repo(db);
  const path = join(dir, "settings.json"),
    keys = new Map<string, string>();
  const native = {
    available: () => true,
    readSecret: vi.fn(async (name: string) => ({ value: keys.get(name) })),
    storeSecret: vi.fn(async (name: string, value: string) => {
      if (value) keys.set(name, value);
      else keys.delete(name);
      return { ok: true };
    }),
  };
  const restart = async () => {
    const settings = new SettingsService(repo, path, env);
    settings.attachNative(native as never);
    await settings.initializeCredentials();
    return settings;
  };
  const settings = new SettingsService(repo, path, env);
  settings.attachNative(native as never);
  dispose.push(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { dir, db, repo, path, keys, native, settings, restart };
}

it("disconnects saved and environment Gateway authority durably without deleting its key or model choices", async () => {
  const f = fixture({ AI_GATEWAY_API_KEY: "fixture-environment" });
  await f.settings.set({
    modelCredential: { provider: "gateway", key: "fixture-saved" },
    plannerModel: "fixture-model",
  });
  await f.settings.set(
    MethodSchemas["settings.set"].parse({ modelConnection: { provider: "gateway", enabled: false } }),
  );
  expect(f.settings.model()).toBeNull();
  expect(f.settings.gatewayKey()).toBeUndefined();
  expect(f.keys.get("gatewayApiKey")).toBe("fixture-saved");
  const restarted = await f.restart();
  expect(restarted.all()).toMatchObject({ modelConfigured: false, plannerModel: "fixture-model" });
  expect(restarted.all().modelConnections.find((value) => value.provider === "gateway")).toMatchObject({
    enabled: false,
    credentialSource: "saved",
  });
  expect(restarted.gatewayKey()).toBeUndefined();
  await restarted.set({ modelConnection: { provider: "gateway", enabled: true } });
  expect(restarted.gatewayKey()).toBe("fixture-saved");
  expect(readFileSync(f.path, "utf8")).not.toContain("fixture-saved");
  expect(JSON.stringify(restarted.all())).not.toContain("fixture-saved");
  expect(JSON.stringify(restarted.all())).not.toContain("fixture-environment");
});

it("does not reconnect on key replacement and does not fall back to an environment key on reviewed removal", async () => {
  const f = fixture({ OPENAI_API_KEY: "fixture-environment" });
  await f.settings.set({
    modelProvider: "openai",
    plannerModel: "fixture-chat",
    modelConnection: { provider: "openai", enabled: false },
  });
  await f.settings.set({ modelCredential: { provider: "openai", key: "fixture-replacement" } });
  expect(f.settings.model()).toBeNull();
  await f.settings.set({ modelConnection: { provider: "openai", enabled: true } });
  expect(f.settings.model()).not.toBeNull();
  await f.settings.set({
    modelCredential: { provider: "openai", key: "" },
    modelConnection: { provider: "openai", enabled: false },
  });
  expect(f.keys.has("modelKey-openai")).toBe(false);
  expect((await f.restart()).model()).toBeNull();
  expect(f.settings.all().modelConnections.find((value) => value.provider === "openai")).toMatchObject({
    credentialSource: "environment",
    enabled: false,
  });
  expect(f.settings.all().modelProvider).toBe("openai");
});

it("stops credential-free localhost discovery and probes after disconnect without selecting another provider", async () => {
  const f = fixture();
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await f.settings.set({
    modelProvider: "openai-compatible",
    compatibleEndpoint: "http://127.0.0.1:11434/v1",
    plannerModel: "fixture-local",
  });
  expect(f.settings.all().modelConfigured).toBe(true);
  await f.settings.set({ modelConnection: { provider: "openai-compatible", enabled: false } });
  expect((await f.settings.listModels()).models).toEqual([{ id: "fixture-local", source: "configured" }]);
  expect((await f.settings.probe()).ok).toBe(false);
  expect(fetcher).not.toHaveBeenCalled();
  expect(f.settings.all().modelConfigured).toBe(false);
});

it("refuses connection and image changes during an active run before touching a saved key", async () => {
  const f = fixture();
  f.db
    .prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,created_at) VALUES(?,?,?,?,?,?)")
    .run("fixture", "fixture", "running", "[]", "{}", Date.now());
  for (const patch of [
    { modelConnection: { provider: "gateway", enabled: false } },
    { imageModel: IMAGE_MODELS[0].id },
    { modelCredential: { provider: "gateway", key: "fixture-key" } },
  ]) {
    await expect(f.settings.set(MethodSchemas["settings.set"].parse(patch))).rejects.toThrow(
      /Stop active runs/,
    );
  }
  expect(f.native.storeSecret).not.toHaveBeenCalled();
  expect(f.settings.imageModel()).toBe(IMAGE_MODELS[0].id);
});

it("never reconnects or clears the old key after a credential-store failure", async () => {
  const f = fixture();
  await f.settings.set({
    modelCredential: { provider: "gateway", key: "fixture-old" },
    modelConnection: { provider: "gateway", enabled: false },
  });
  f.native.storeSecret.mockRejectedValueOnce(new Error("OS storage unavailable"));
  await expect(
    f.settings.set({ modelCredential: { provider: "gateway", key: "fixture-new" } }),
  ).rejects.toThrow(/storage unavailable/);
  expect(f.keys.get("gatewayApiKey")).toBe("fixture-old");
  expect(f.settings.gatewayKey()).toBeUndefined();
});

it.each(["disconnect", "account-generation"])("does not continue a stale probe or record success after %s", async (change) => {
  const f = fixture();
  let finish!: () => void;
  const vision = vi.fn();
  f.settings.modelOverride = {
    generateStructured: async () => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return { object: { ok: true }, durationMs: 1 };
    },
    generateText: vision,
    listModels: async () => [],
  } as never;
  const pending = f.settings.probe("fixture-model");
  await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
  if (change === "disconnect")
    await f.settings.set({ modelConnection: { provider: "gateway", enabled: false } });
  else f.repo.setSetting("modelCacheGeneration", "replacement-account-generation");
  finish();
  expect(await pending).toMatchObject({ ok: false, error: expect.stringMatching(/Connection changed/) });
  expect(vision).not.toHaveBeenCalled();
  expect(f.repo.getSetting("modelProbe")).toBeUndefined();
});

it("exposes the existing nonsecret connection revision across masked-key A to B to A changes", async () => {
  const f = fixture();
  const revisions = [];
  for (const key of ["synthetic-A", "synthetic-B", "synthetic-A"]) {
    await f.settings.set({ modelProvider: "openai", plannerModel: "same-model", modelCredential: { provider: "openai", key } });
    const current = f.settings.all();
    expect(current.modelApiKey).toBe("••••••••");
    expect(current.modelConnectionRevision).toBe(f.settings.modelCacheGeneration());
    expect(JSON.stringify(current)).not.toContain(key);
    revisions.push(current.modelConnectionRevision);
  }
  expect(new Set(revisions).size).toBe(3);
  expect((await f.restart()).all().modelConnectionRevision).toBe(revisions[2]);
});

it("defaults to the verified image model and preserves an explicit Off choice", async () => {
  const f = fixture();
  expect(f.settings.imageModel()).toBe(IMAGE_MODELS[0].id);
  for (const model of IMAGE_MODELS) {
    await f.settings.set(MethodSchemas["settings.set"].parse({ imageModel: model.id }));
    expect((await f.restart()).imageModel()).toBe(model.id);
  }
  expect(MethodSchemas["settings.set"].safeParse({ imageModel: "arbitrary/expensive" }).success).toBe(false);
  await expect(f.settings.set({ imageModel: "arbitrary/expensive" } as never)).rejects.toThrow();
  await f.settings.set({ imageModel: null });
  expect((await f.restart()).imageModel()).toBeNull();
});

it("refuses explicitly disabled image generation before egress or provider dispatch", async () => {
  const decideEgress = vi.fn(),
    generator = vi.fn();
  await expect(
    agentMethods["agent.images.generate"]!({
      params: { prompt: "Synthetic" },
      client: {},
      decideEgress,
      s: { settings: { imageModel: () => null, gatewayKey: generator } },
    } as never),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(decideEgress).not.toHaveBeenCalled();
  expect(generator).not.toHaveBeenCalled();
});

it("local-only disables cloud requests without erasing saved connections and uses a detected utility model", async () => {
  const f = fixture({ AI_GATEWAY_API_KEY: "synthetic-gateway-key" });
  const request = vi
    .fn<typeof fetch>()
    .mockImplementation(async (url) =>
      String(url).endsWith("/api/tags")
        ? new Response(JSON.stringify({ models: [{ name: "detected-local-utility" }] }))
        : new Response("", { status: 404 }),
    );
  vi.stubGlobal("fetch", request);
  await f.settings.set({ localModelsOnly: true, imageModel: IMAGE_MODELS[0].id });
  expect(f.settings.model()).toBeNull();
  expect(f.settings.gatewayKey()).toBeUndefined();
  expect(f.settings.imageModel()).toBeNull();
  expect(f.settings.all().modelConfigured).toBe(false);
  const utility = await f.settings.utilityModel();
  expect(utility?.modelId).toBe("detected-local-utility");
  expect(request).toHaveBeenCalledTimes(4);
  await f.settings.set({
    modelProvider: "openai-compatible",
    compatibleEndpoint: "http://127.0.0.1:11434/v1",
    plannerModel: "detected-local-utility",
  });
  expect(f.settings.model()).not.toBeNull();
  await f.settings.set({ localModelsOnly: false });
  expect(f.settings.gatewayKey()).toBe("synthetic-gateway-key");
  expect(f.settings.imageModel()).toBe(IMAGE_MODELS[0].id);
});

it("refuses catalog results when the account changes while local discovery is still pending", async () => {
  const f = fixture();
  let respond!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockImplementation(async (url) => {
      if (String(url).endsWith("/api/tags"))
        return new Promise<Response>((resolve) => {
          respond = resolve;
        });
      if (String(url).startsWith("https://ai-gateway.vercel.sh"))
        return new Response(JSON.stringify({ data: [{ id: "catalog/original" }] }));
      return new Response("", { status: 404 });
    }),
  );
  const pending = f.settings.listModels();
  await vi.waitFor(() => expect(f.repo.getSetting("modelCatalog:gateway")).toBeDefined());
  await f.settings.set({ plannerModel: "new-account-choice" });
  respond(new Response(JSON.stringify({ models: [] })));
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
});

it("does not automatically use a catalog-confirmed embedding model for text utilities", async () => {
  const f = fixture({ GOOGLE_GENERATIVE_AI_API_KEY: "synthetic-google-key" });
  vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockImplementation(async (url) =>
    String(url).startsWith("https://generativelanguage.googleapis.com/")
      ? new Response(JSON.stringify({ models: [
          { name: "models/vector-route", supportedGenerationMethods: ["embedContent"] },
        ] }))
      : new Response("", { status: 404 }),
  ));
  await f.settings.set({ modelProvider: "google", plannerModel: "vector-route" });
  expect((await f.settings.listModels()).models).toContainEqual(expect.objectContaining({
    id: "vector-route", textGeneration: false,
  }));
  expect(await f.settings.utilityModel()).toBeNull();
  await f.settings.set({ plannerModel: "new-unknown-route" });
  expect((await f.settings.utilityModel())?.modelId).toBe("new-unknown-route");
});

it("loads the selected provider without reading unrelated credentials, and serializes a late read with key rotation", async () => {
  const f = fixture();
  f.repo.setSetting("modelProvider", "anthropic");
  f.keys.set("modelKey-anthropic", "selected-fixture");
  await f.settings.initializeCredentials([f.settings.modelProvider()]);
  expect(f.native.readSecret.mock.calls.map(([name]) => name)).toEqual(["modelKey-anthropic"]);
  expect(f.settings.all().modelCredentialSource).toBe("saved");
  let entered!: () => void;
  let release!: () => void;
  const reading = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const read = f.native.readSecret.getMockImplementation()!;
  f.native.readSecret.mockImplementation(async (name) => {
    if (name !== "modelKey-openai") return read(name);
    const previous = { value: "old-fixture" };
    entered();
    await gate;
    return previous;
  });
  const loading = f.settings.initializeCredentials(["openai"]);
  await reading;
  const rotating = f.settings.set({
    modelProvider: "openai",
    modelCredential: { provider: "openai", key: "new-fixture" },
  });
  release();
  await Promise.all([loading, rotating]);
  expect(f.keys.get("modelKey-openai")).toBe("new-fixture");
  await f.settings.initializeCredentials(["openai"]);
  expect(f.native.readSecret.mock.calls.filter(([name]) => name === "modelKey-openai")).toHaveLength(1);
  expect(f.settings.all().modelCredentialSource).toBe("saved");
});

it("shares Settings probe admission with private spending and records each actual probe once", async () => {
  const f = fixture(),
    budgets = new BudgetsService(f.db, () => ({ dayUsd: 0.01 }), budgetLineage(f.repo));
  const owner = new PrivateBudgetOwner(f.repo, budgets),
    client = owner.client();
  const privateClient = new PrivateBudgetClient(async (request) => owner.request("private-fixture", request));
  f.settings.configureAccountBudget(client);
  const structured = vi.fn(async (opts: { beforeDispatch?: () => Promise<void>; signal?: AbortSignal }) => {
    await opts.beforeDispatch?.();
    return { object: { ok: true }, durationMs: 1, providerMetadata: { gateway: { cost: 0.003 } } };
  });
  const text = vi.fn(async (opts: { beforeDispatch?: () => Promise<void> }) => {
    await opts.beforeDispatch?.();
    return { text: "white", durationMs: 1, providerMetadata: { gateway: { cost: 0.001 } } };
  });
  f.settings.modelOverride = {
    generateStructured: structured,
    generateText: text,
    listModels: async () => [],
  } as never;
  try {
    await privateClient.reserve("private-request", "model", 0.00999);
    expect(await f.settings.probe("meta/muse-spark-1.3-contributor")).toMatchObject({
      ok: false,
      error: expect.stringContaining("usage limit"),
    });
    expect(structured).not.toHaveBeenCalled();
    await privateClient.cancel("private-request");
    expect(await f.settings.probe("meta/muse-spark-1.3-contributor")).toMatchObject({
      ok: true,
      vision: true,
    });
    expect(structured).toHaveBeenCalledOnce();
    expect(text).toHaveBeenCalledOnce();
    expect(budgets.spentDayUsd()).toBeCloseTo(0.004);
    expect(f.repo.db.prepare("SELECT COUNT(*) n FROM model_calls WHERE role='probe'").get()).toEqual({
      n: 2,
    });
    structured.mockImplementationOnce(async (opts) => {
      await opts.beforeDispatch?.();
      return new Promise<never>((_resolve, reject) =>
        opts.signal?.addEventListener("abort", () => reject(opts.signal?.reason), { once: true }),
      );
    });
    const pending = f.settings.probe("meta/muse-spark-1.3-contributor");
    await vi.waitFor(() => expect(structured).toHaveBeenCalledTimes(2));
    await f.settings.close();
    expect(await pending).toMatchObject({ ok: false, error: expect.stringContaining("Connection changed") });
    expect(budgets.status({}).find((window) => window.scope === "day")?.unpricedModelCalls).toBe(1);
  } finally {
    await f.settings.close();
    await client.close();
    await privateClient.close();
    owner.close();
  }
});
