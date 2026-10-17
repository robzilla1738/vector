import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { CustomModelProviderSchema, MethodSchemas, RunSchema } from "@aux/contracts";
import { openDb, Repo, SettingsService } from "@aux/runtime";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";

const cleanup: (() => unknown | Promise<unknown>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
  vi.unstubAllGlobals();
});
function fixture(env: NodeJS.ProcessEnv = {}) {
  const directory = mkdtempSync(join(tmpdir(), "aux-custom-providers-"));
  const path = join(directory, "settings.json");
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const secrets = new Map<string, string>();
  const native = new (class extends NullNativeBridge {
    override available() {
      return true;
    }
    override async readSecret(name = "") {
      return { value: secrets.get(name) };
    }
    override async storeSecret(name = "", value = ""): Promise<{ ok: true }> {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true };
    }
  })();
  const service = new SettingsService(repo, path, env);
  service.attachNative(native);
  cleanup.push(
    () => rmSync(directory, { recursive: true, force: true }),
    () => db.close(),
    () => service.close(),
  );
  const save = (patch: Record<string, unknown>) =>
    service.set(
      MethodSchemas["settings.set"].parse({
        ...patch,
        expectedModelConnectionRevision: service.all().modelConnectionRevision,
      }),
    );
  return { service, repo, native, secrets, path, save };
}
const definition = (id: string, baseUrl = `https://${id}.example.test/v1`) =>
  CustomModelProviderSchema.parse({
    id,
    name: id.toUpperCase(),
    baseUrl,
    api: "openai-completions",
    models: [{ id: `${id}-model`, source: "configured", modalities: ["text"], contextTokens: 128000 }],
  });
const chatResponse = () =>
  new Response(
    [
      {
        id: "chat_fixture",
        object: "chat.completion.chunk",
        created: 1,
        model: "fixture",
        choices: [{ index: 0, delta: { role: "assistant", content: "READY" }, finish_reason: null }],
      },
      {
        id: "chat_fixture",
        object: "chat.completion.chunk",
        created: 1,
        model: "fixture",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
      },
    ]
      .map((event) => `data: ${JSON.stringify(event)}\n\n`)
      .join(""),
    { headers: { "content-type": "text/event-stream" } },
  );

it("switches complete named connections without mixing keys, endpoints or role defaults", async () => {
  const { service, save, repo, path } = fixture({ OPENAI_COMPATIBLE_API_KEY: "synthetic-ambient" });
  const requests: { url: string; key: string | null; model: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (input, init) => {
      requests.push({
        url: String(input),
        key: new Headers(init?.headers).get("authorization"),
        model: JSON.parse(String(init?.body)).model,
      });
      return chatResponse();
    }),
  );
  await save({
    modelProvider: "openai-compatible",
    compatibleEndpoint: "https://manual.example.test/v1",
    plannerModel: "manual-model",
    modelCredential: { provider: "openai-compatible", key: "synthetic-manual" },
  });
  await save({
    customModelProvider: definition("alpha"),
    customModelProviderId: "alpha",
    modelCredential: { provider: "openai-compatible", connectionId: "alpha", key: "synthetic-alpha" },
  });
  await save({ plannerModel: "alpha-deep", recoveryModel: "alpha-recovery" });
  await service.model()!.generateText({ modelId: service.plannerModel(), prompt: "Synthetic fixture" });
  await save({
    customModelProvider: definition("beta"),
    customModelProviderId: "beta",
    modelCredential: { provider: "openai-compatible", connectionId: "beta", key: "synthetic-beta" },
  });
  await service.model()!.generateText({ modelId: service.plannerModel(), prompt: "Synthetic fixture" });
  await save({ customModelProviderId: "alpha" });
  expect(service.all()).toMatchObject({
    plannerModel: "alpha-deep",
    recoveryModel: "alpha-recovery",
    modelConfigured: true,
  });
  await service.model()!.generateText({ modelId: service.plannerModel(), prompt: "Synthetic fixture" });
  await save({ customModelProviderId: null });
  expect(service.all()).toMatchObject({
    plannerModel: "manual-model",
    compatibleEndpoint: "https://manual.example.test/v1",
  });
  await service.model()!.generateText({ modelId: service.plannerModel(), prompt: "Synthetic fixture" });
  expect(requests).toEqual([
    {
      url: "https://alpha.example.test/v1/chat/completions",
      key: "Bearer synthetic-alpha",
      model: "alpha-deep",
    },
    {
      url: "https://beta.example.test/v1/chat/completions",
      key: "Bearer synthetic-beta",
      model: "beta-model",
    },
    {
      url: "https://alpha.example.test/v1/chat/completions",
      key: "Bearer synthetic-alpha",
      model: "alpha-deep",
    },
    {
      url: "https://manual.example.test/v1/chat/completions",
      key: "Bearer synthetic-manual",
      model: "manual-model",
    },
  ]);
  const persisted = readFileSync(path, "utf8") + JSON.stringify(repo.db.prepare("SELECT * FROM kv").all());
  for (const key of ["synthetic-alpha", "synthetic-beta", "synthetic-manual", "synthetic-ambient"])
    expect(persisted).not.toContain(key);
});

it("binds stored credentials to the saved endpoint and protocol and refuses stale writes", async () => {
  const { service, save, native } = fixture({ OPENAI_COMPATIBLE_API_KEY: "synthetic-ambient" });
  await save({
    customModelProvider: definition("alpha"),
    customModelProviderId: "alpha",
    modelCredential: { provider: "openai-compatible", connectionId: "alpha", key: "synthetic-alpha" },
  });
  const revision = service.all().modelConnectionRevision;
  await save({ customModelProvider: definition("alpha", "https://other.example.test/v1") });
  expect(service.all()).toMatchObject({ modelConfigured: false, modelCredentialSource: "none" });
  expect(service.model()).toBeNull();
  const store = vi.spyOn(native, "storeSecret");
  await expect(
    service.set({
      expectedModelConnectionRevision: revision,
      modelCredential: { provider: "openai-compatible", connectionId: "alpha", key: "stale-synthetic-key" },
    }),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(store).not.toHaveBeenCalled();
  await save({ customModelProvider: { ...definition("alpha"), api: "anthropic-messages" } });
  expect(service.model()).toBeNull();
  await save({ customModelProvider: definition("alpha") });
  expect(service.all().modelConfigured).toBe(true);
});

it("uses anonymous custom providers only when explicitly configured and keeps local-only policy", async () => {
  const { service, save } = fixture({ OPENAI_COMPATIBLE_API_KEY: "synthetic-ambient" });
  await save({
    customModelProvider: definition("local", "http://127.0.0.1:11434/v1"),
    customModelProviderId: "local",
  });
  expect(service.all().modelConfigured).toBe(false);
  expect(service.model()).toBeNull();
  await save({
    customModelProvider: { ...definition("remote"), authHeader: false },
    customModelProviderId: "remote",
  });
  expect(service.all()).toMatchObject({ modelConfigured: true, modelCredentialSource: "none" });
  const described = await service.privateProviderRequest({ operation: "describe" });
  expect(described).toMatchObject({
    operation: "describe",
    connection: {
      provider: "openai-compatible",
      customApi: "openai-completions",
      customAuthHeader: false,
      credentialSource: "none",
      endpoint: "https://remote.example.test/v1",
    },
  });
  await save({ localModelsOnly: true });
  expect(service.all().modelConfigured).toBe(false);
  expect(service.model()).toBeNull();
  await save({
    customModelProvider: { ...definition("local", "http://127.0.0.1:11434/v1"), authHeader: false },
    customModelProviderId: "local",
  });
  expect(service.all().modelConfigured).toBe(true);
});

it("keeps disconnects and removal isolated from other custom and manual connections", async () => {
  const { service, save, secrets } = fixture();
  await save({
    modelProvider: "openai-compatible",
    compatibleEndpoint: "https://manual.example.test/v1",
    plannerModel: "manual",
    modelConnection: { provider: "openai-compatible", enabled: false },
  });
  for (const id of ["alpha", "beta"])
    await save({
      customModelProvider: definition(id),
      customModelProviderId: id,
      modelCredential: { provider: "openai-compatible", connectionId: id, key: `synthetic-${id}` },
      modelConnection: { provider: "openai-compatible", enabled: true },
    });
  await save({ modelConnection: { provider: "openai-compatible", enabled: false } });
  expect(service.model()).toBeNull();
  await save({ customModelProviderId: "alpha" });
  expect(service.all().modelConfigured).toBe(true);
  await save({ removeCustomModelProviderId: "beta" });
  expect(secrets.size).toBe(1);
  expect(service.all().customModelProviders?.map((provider) => provider.id)).toEqual(["alpha"]);
  await save({ customModelProviderId: null });
  expect(service.connectionEnabled("openai-compatible")).toBe(false);
  await save({ removeCustomModelProviderId: "alpha" });
  expect(secrets.size).toBe(0);
});

it("reloads destination-bound credentials after restart and honors persisted null selection", async () => {
  const { save, native, repo, path } = fixture();
  await save({
    customModelProvider: definition("alpha"),
    customModelProviderId: "alpha",
    modelCredential: { provider: "openai-compatible", connectionId: "alpha", key: "synthetic-alpha" },
  });
  const reopened = new SettingsService(repo, path, {});
  reopened.attachNative(native);
  cleanup.push(() => reopened.close());
  await reopened.initializeCredentials(["openai-compatible"]);
  expect(reopened.all()).toMatchObject({ modelConfigured: true, customModelProviderId: "alpha" });
  repo.setSetting("customModelProviderId", null);
  expect(reopened.all().customModelProviderId).toBeNull();
  expect(reopened.all().modelApiKey).toBeUndefined();
});

it("rejects custom connection changes during active work before touching credentials", async () => {
  const { service, save, repo, native } = fixture();
  const store = vi.spyOn(native, "storeSecret");
  repo.saveRun(
    RunSchema.parse({
      runId: "active-provider-fixture",
      goal: "Synthetic active work",
      status: "running",
      pageIds: [],
      createdAt: Date.now(),
    }),
  );
  await expect(
    save({
      customModelProvider: definition("alpha"),
      customModelProviderId: "alpha",
      modelCredential: { provider: "openai-compatible", connectionId: "alpha", key: "synthetic-alpha" },
    }),
  ).rejects.toThrow("Stop active runs");
  expect(store).not.toHaveBeenCalled();
  expect(service.all().customModelProviders).toEqual([]);
});

it("retires previously acquired model transports before another request can leave", async () => {
  const { service, save } = fixture();
  const network = vi.fn<typeof fetch>(async () => chatResponse());
  vi.stubGlobal("fetch", network);
  await save({
    customModelProvider: definition("alpha"),
    customModelProviderId: "alpha",
    modelCredential: { provider: "openai-compatible", connectionId: "alpha", key: "synthetic-alpha" },
  });
  const previous = service.model()!;
  await save({ modelConnection: { provider: "openai-compatible", enabled: false } });
  await expect(
    previous.generateText({ modelId: "alpha-model", prompt: "Retired synthetic request" }),
  ).rejects.toThrow();
  expect(network).not.toHaveBeenCalled();
});
