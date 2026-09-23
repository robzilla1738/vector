import { afterEach, expect, it, vi } from "vitest";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo, SettingsService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native";
import { SecretStore } from "../../apps/desktop/main/secret-store";

const cleanup: (() => void)[] = [];
afterEach(() => { vi.unstubAllGlobals(); for (const fn of cleanup.splice(0).reverse()) fn(); });
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-synthetic-secret-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const key = randomBytes(32);
  const encryption = {
    isEncryptionAvailable: () => true,
    getSelectedStorageBackend: () => "test-aes",
    encryptString: (value: string) => {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
    },
    decryptString: (payload: Buffer) => {
      const cipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
      cipher.setAuthTag(payload.subarray(12, 28));
      return Buffer.concat([cipher.update(payload.subarray(28)), cipher.final()]).toString("utf8");
    },
  };
  const store = new SecretStore(join(dir, "secrets"), encryption);
  const native = {
    available: () => true,
    readSecret: async (name: string) => ({ value: store.read(name) }),
    storeSecret: async (name: string, value: string) => { store.write(name, value); return { ok: true }; },
  } as NativeBridge;
  const settingsPath = join(dir, "settings.json");
  const settings = new SettingsService(repo, settingsPath, {});
  settings.attachNative(native);
  return { dir, repo, encryption, store, native, settings, settingsPath };
}

it("encrypts at rest, restores through the vault, and removes active legacy copies only on explicit replacement", async () => {
  const f = fixture();
  const legacyFile = join(f.dir, "gateway.key");
  writeFileSync(legacyFile, "synthetic-legacy");
  f.repo.setSetting("gatewayApiKey", "synthetic-legacy");
  expect(() => f.settings.gatewayKey()).toThrow("Legacy plaintext");
  await f.settings.set({ gatewayApiKey: "synthetic-new", theme: "light" });
  expect(existsSync(legacyFile)).toBe(false);
  expect(f.repo.getSetting("gatewayApiKey")).toBeUndefined();
  const encrypted = join(f.dir, "secrets", "gatewayApiKey");
  expect(readFileSync(encrypted).includes(Buffer.from("synthetic-new"))).toBe(false);
  expect(readFileSync(f.settingsPath, "utf8")).not.toContain("synthetic");
  expect(process.platform === "win32" || (statSync(encrypted).mode & 0o777) === 0o600).toBe(true);
  const restarted = new SettingsService(f.repo, f.settingsPath, {});
  restarted.attachNative(f.native);
  await restarted.initializeCredentials();
  expect(restarted.gatewayKey()).toBe("synthetic-new");
  expect(restarted.all().gatewayApiKey).toBe("••••••••");
  await restarted.set({ gatewayApiKey: "" });
  expect(existsSync(encrypted)).toBe(false);
  expect(restarted.gatewayKey()).toBeUndefined();
});

it("keeps legacy JSON unchanged during preference edits and failed replacement", async () => {
  const f = fixture();
  const original = JSON.stringify({ gatewayApiKey: "synthetic-legacy-json", theme: "dark" });
  writeFileSync(f.settingsPath, original);
  const settings = new SettingsService(f.repo, f.settingsPath, {});
  settings.attachNative(f.native);
  await settings.set({ theme: "light" });
  expect(readFileSync(f.settingsPath, "utf8")).toBe(original);
  expect(settings.all().theme).toBe("light");
  expect(settings.all().gatewayApiKey).toBeUndefined();
  f.encryption.encryptString = () => { throw new Error("synthetic provider failure"); };
  await expect(settings.set({ gatewayApiKey: "synthetic-new" })).rejects.toThrow("encryption failed");
  expect(readFileSync(f.settingsPath, "utf8")).toBe(original);
  expect(existsSync(join(f.dir, "secrets"))).toBe(false);
});

it("preserves old credentials and preferences on encryption failure and refuses plaintext backends", async () => {
  const f = fixture();
  await f.settings.set({ gatewayApiKey: "synthetic-original", theme: "dark" });
  const before = readFileSync(join(f.dir, "secrets", "gatewayApiKey"));
  f.encryption.isEncryptionAvailable = () => false;
  await expect(f.settings.set({ gatewayApiKey: "synthetic-replacement", theme: "light" })).rejects.toThrow("unavailable");
  expect(f.settings.gatewayKey()).toBe("synthetic-original");
  expect(f.settings.all().theme).toBe("dark");
  expect(readFileSync(join(f.dir, "secrets", "gatewayApiKey"))).toEqual(before);
  f.encryption.isEncryptionAvailable = () => true;
  f.encryption.getSelectedStorageBackend = () => "basic_text";
  await expect(f.settings.set({ gatewayApiKey: "synthetic-replacement" })).rejects.toThrow("unavailable");
  expect(readdirSync(join(f.dir, "secrets"))).toEqual(["gatewayApiKey"]);
});

it("shows unreadable storage explicitly and never returns corrupt ciphertext as a key", async () => {
  const f = fixture();
  f.store.write("gatewayApiKey", "synthetic-original");
  writeFileSync(join(f.dir, "secrets", "gatewayApiKey"), "aux-secret-v1\ncorrupt");
  await f.settings.initializeCredentials();
  expect(f.settings.all().gatewayCredentialError).toContain("unavailable");
  expect(() => f.settings.gatewayKey()).toThrow("unavailable");
  expect(f.settings.all().gatewayApiKey).toBeUndefined();
  await f.settings.set({ gatewayApiKey: "synthetic-replacement" });
  expect(f.settings.gatewayKey()).toBe("synthetic-replacement");
});

it("does not probe encryption for absent secrets and rejects names that escape or collide", () => {
  const f = fixture();
  const available = vi.spyOn(f.encryption, "isEncryptionAvailable");
  expect(f.store.read("gatewayApiKey")).toBeUndefined();
  expect(available).not.toHaveBeenCalled();
  for (const name of ["../key", "a/b", "a.b", ""]) expect(() => f.store.write(name, "synthetic")).toThrow("Invalid credential name");
});

it("serializes concurrent save/remove and does not persist environment credentials", async () => {
  const f = fixture();
  await Promise.all([f.settings.set({ gatewayApiKey: "synthetic-one" }), f.settings.set({ gatewayApiKey: "synthetic-two" }), f.settings.set({ gatewayApiKey: "" })]);
  expect(f.store.read("gatewayApiKey")).toBeUndefined();
  expect(f.settings.gatewayKey()).toBeUndefined();
  const settings = new SettingsService(f.repo, f.settingsPath, { AI_GATEWAY_API_KEY: "synthetic-env" });
  expect(settings.gatewayKey()).toBe("synthetic-env");
  await settings.set({ theme: "light" });
  expect(readFileSync(f.settingsPath, "utf8")).not.toContain("synthetic-env");
  expect(settings.all().gatewayCredentialSource).toBe("environment");
});

it("keeps the Vercel connection scoped while retained cloud resources need cleanup", async () => {
  const f = fixture();
  await f.settings.set({ vercelCredential: "synthetic-vercel", vercelTeamId: "team-a", vercelProjectId: "project-a" });
  f.repo.setSetting("cloudEnvironments", [{ environmentId: "11111111-1111-4111-8111-111111111111", status: "stopped", remoteName: "aux-fixture" }]);
  await expect(f.settings.set({ vercelCredential: "" })).rejects.toThrow("retained Aux cloud environment");
  await expect(f.settings.set({ vercelTeamId: "team-b" })).rejects.toThrow("retained Aux cloud environment");
  await f.settings.set({ vercelCredential: "synthetic-replacement" });
  expect(f.store.read("vercelToken")).toBe("synthetic-replacement");
  f.repo.setSetting("cloudEnvironments", [{ environmentId: "11111111-1111-4111-8111-111111111111", status: "deleted", remoteName: "aux-fixture" }]);
  await f.settings.set({ vercelCredential: "", vercelTeamId: "team-b", vercelProjectId: "project-b" });
  expect(f.store.read("vercelToken")).toBeUndefined();
});

it("rejects oversized service responses even without a content-length header", async () => {
  const f = fixture();
  await f.settings.set({ vercelCredential: "synthetic-vercel" });
  vi.stubGlobal("fetch", vi.fn(async () => new Response(`{"padding":"${"x".repeat(2_000_001)}"}`, {
    status: 200,
    headers: { "content-type": "application/json" },
  })));
  await expect(f.settings.probeVercel()).rejects.toThrow("more data than Aux will accept");
});

it("isolates direct provider keys and model choices across selection and restart", async () => {
  const f = fixture();
  await f.settings.set({ modelProvider: "openai", plannerModel: "fixture-openai", modelCredential: { provider: "openai", key: "synthetic-openai" } });
  expect(f.settings.all().modelConfigured).toBe(true);
  await f.settings.set({ modelProvider: "anthropic", plannerModel: "fixture-anthropic" });
  expect(f.settings.all().modelConfigured).toBe(false);
  expect(f.settings.all().modelApiKey).toBeUndefined();
  await f.settings.set({ modelCredential: { provider: "anthropic", key: "synthetic-anthropic" } });
  expect(readFileSync(f.settingsPath, "utf8")).not.toContain("synthetic-");
  expect(f.repo.getSetting("modelCredential")).toBeUndefined();
  const restarted = new SettingsService(f.repo, f.settingsPath, {});
  restarted.attachNative(f.native); await restarted.initializeCredentials();
  expect(restarted.all().plannerModel).toBe("fixture-anthropic");
  expect(restarted.all().modelApiKey).toBe("••••••••");
  await restarted.set({ modelProvider: "openai" });
  expect(restarted.plannerModel()).toBe("fixture-openai");
  expect(restarted.all().modelConfigured).toBe(true);
  f.repo.saveRun({ runId: "active-model", goal: "fixture", pageIds: [], status: "paused", createdAt: Date.now() });
  await expect(restarted.set({ modelProvider: "google" })).rejects.toThrow("Stop active runs");
  expect(restarted.modelProvider()).toBe("openai");
});

it("encrypts compatible-provider keys while persisting only its validated endpoint", async () => {
  const f = fixture();
  await f.settings.set({
    modelProvider: "openai-compatible",
    compatibleEndpoint: "http://127.0.0.1:11434/v1/",
    plannerModel: "fixture-local",
    modelCredential: { provider: "openai-compatible", key: "synthetic-compatible" },
  });
  expect(f.settings.all()).toMatchObject({
    modelProvider: "openai-compatible",
    modelEndpoint: "http://127.0.0.1:11434/v1",
    compatibleEndpoint: "http://127.0.0.1:11434/v1",
    plannerModel: "fixture-local",
    modelConfigured: true,
    modelApiKey: "••••••••",
  });
  expect(readFileSync(f.settingsPath, "utf8")).not.toContain("synthetic-compatible");
  expect(readFileSync(join(f.dir, "secrets", "modelKey-openai-compatible")).includes(Buffer.from("synthetic-compatible"))).toBe(false);
  const restarted = new SettingsService(f.repo, f.settingsPath, {});
  restarted.attachNative(f.native);
  await restarted.initializeCredentials();
  expect(restarted.all()).toMatchObject({ modelConfigured: true, modelEndpoint: "http://127.0.0.1:11434/v1" });
  await expect(restarted.set({ compatibleEndpoint: "http://remote.example.test/v1" })).rejects.toThrow("HTTPS");
  expect(restarted.all().modelEndpoint).toBe("http://127.0.0.1:11434/v1");
});

it("allows keyless local compatible models but never keyless remote endpoints", async () => {
  const f = fixture();
  await f.settings.set({ modelProvider: "openai-compatible", compatibleEndpoint: "http://localhost:11434/v1", plannerModel: "fixture-local" });
  expect(f.settings.all()).toMatchObject({ modelConfigured: true, modelCredentialSource: "none", modelApiKey: undefined });
  expect(f.settings.model()).not.toBeNull();
  await f.settings.set({ compatibleEndpoint: "https://models.example.test/v1" });
  expect(f.settings.all()).toMatchObject({ modelConfigured: false, modelCredentialSource: "none", modelApiKey: undefined });
  expect(f.settings.model()).toBeNull();
});

it("discovers bounded OpenAI-compatible model IDs from a configured local endpoint", async () => {
  const f = fixture();
  await f.settings.set({ modelProvider: "openai-compatible", compatibleEndpoint: "http://127.0.0.1:11434/v1", plannerModel: "configured-model" });
  const requests: { url: string; authorization: string | null }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input, init) => {
    requests.push({ url: String(input), authorization: new Headers(init?.headers).get("authorization") });
    return new Response(JSON.stringify({ data: [{ id: "local-model" }, { id: "local-model" }, { id: "second-model" }, { nope: true }] }), { status: 200 });
  }));
  await expect(f.settings.listModels()).resolves.toEqual({
    models: [
      { id: "local-model", source: "configured" },
      { id: "second-model", source: "configured" },
      { id: "configured-model", source: "configured" },
    ],
    source: "configured",
  });
  expect(requests).toEqual([{ url: "http://127.0.0.1:11434/v1/models", authorization: null }]);
});
