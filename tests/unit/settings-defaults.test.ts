import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MethodSchemas, SearchEngineTemplateSchema } from "@aux/contracts";
import { DEFAULT_MAX_MODEL_CALLS, DEFAULT_PLANNER_MODEL, openDb, Repo, SettingsService, USER_RUN_GRANTS, authorizeProgram } from "@aux/runtime";

function harness(env: NodeJS.ProcessEnv = {}, file: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "aux-settings-"));
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify(file));
  const repo = new Repo(openDb(":memory:"));
  const settings = new SettingsService(repo, settingsPath, env);
  return { dir, repo, settings };
}

describe("settings defaults for a real test pass", () => {
  it("persists native material, independent tint and content opacity", async () => {
    const { dir, settings } = harness();
    try {
      expect(settings.all()).toMatchObject({ sidebarMaterial: "liquid-glass", sidebarTint: 0, contentOpacity: 95 });
      const patch = { sidebarMaterial: "sidebar", sidebarTint: 20, contentOpacity: 100 } as const;
      await settings.set(MethodSchemas["settings.set"].parse(patch));
      expect(settings.all()).toMatchObject(patch);
      expect(JSON.parse(readFileSync(join(dir, "settings.json"), "utf8"))).toMatchObject(patch);
      expect(MethodSchemas["settings.set"].safeParse({ sidebarMaterial: "fake-blur" }).success).toBe(false);
      expect(MethodSchemas["settings.set"].safeParse({ sidebarTint: 61 }).success).toBe(false);
      expect(MethodSchemas["settings.set"].safeParse({ contentOpacity: 79 }).success).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("honours a saved planner model including GPT Luna Fast", () => {
    const { dir, settings } = harness({}, { plannerModel: "openai/gpt-5.6-luna-fast" });
    try {
      expect(settings.plannerModel()).toBe("openai/gpt-5.6-luna-fast");
      expect(settings.all().plannerModel).toBe("openai/gpt-5.6-luna-fast");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("falls back to AUX_PLANNER_MODEL then the Qwen default", () => {
    const { dir, settings } = harness({ AUX_PLANNER_MODEL: "alibaba/qwen3.8-27b-custom" });
    try {
      expect(settings.plannerModel()).toBe("alibaba/qwen3.8-27b-custom");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("treats maxModelCalls 0 as no limit", () => {
    const { dir, settings } = harness({}, { maxModelCalls: 0 });
    try {
      expect(settings.maxModelCalls()).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("defaults search to DuckDuckGo and the shared model-call budget", () => {
    const { dir, settings } = harness();
    try {
      expect(settings.searchEngine()).toBe("https://duckduckgo.com/?q=%s");
      expect(settings.maxModelCalls()).toBe(DEFAULT_MAX_MODEL_CALLS);
      expect(settings.plannerModel()).toBe(DEFAULT_PLANNER_MODEL);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("defaults effect grants to read-only and sanitizes settings.set", async () => {
    const { dir, settings } = harness();
    try {
      expect(settings.effectGrants()).toEqual([
        "effect:read",
      ]);
      expect(settings.effectGrantsForRun()).toEqual([
        "effect:read",
        "effect:write",
      ]);
      expect(settings.all().effectGrants).toEqual(settings.effectGrantsForRun());
      await settings.set({ effectGrants: ["effect:write", "grant-from-model", "effect:*"] });
      expect(settings.effectGrants()).toEqual(["effect:write", "effect:*"]);
      expect(settings.effectGrantsForRun()).toEqual(["effect:write", "effect:*"]);
      await settings.set({ effectGrants: ["effect:read"] });
      expect(settings.effectGrants()).toEqual(["effect:read"]);
      expect(settings.effectGrantsForRun()).toEqual(["effect:read"]);
      const parsed = MethodSchemas["settings.set"].parse({
        effectGrants: ["effect:read", "effect:write", "effect:egress"],
      });
      expect(parsed.effectGrants).toEqual(["effect:read", "effect:write", "effect:egress"]);
      expect(authorizeProgram([{ id: "c", op: "click", target: "r1" }], USER_RUN_GRANTS).ok).toBe(true);
      expect(authorizeProgram([{ id: "c", op: "click", target: "r1" }], settings.effectGrants()).ok).toBe(false);
      const scopedEgress = [{ effect: "egress" as const, origin: "https://allowed.test", scope: "page", expiresAt: 0 }];
      expect(authorizeProgram(
        [{ id: "n", op: "navigate", url: "https://allowed.test/path" }],
        scopedEgress,
        "https://current.test",
      ).ok).toBe(true);
      expect(authorizeProgram(
        [{ id: "n", op: "navigate", url: "https://other.test/path" }],
        scopedEgress,
        "https://allowed.test",
      ).ok).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses plaintext storage without a desktop vault", async () => {
    const { dir, repo, settings } = harness();
    try {
      await expect(settings.set({ gatewayApiKey: "synthetic-key" })).rejects.toThrow("requires the desktop");
      expect(existsSync(join(dir, "gateway.key"))).toBe(false);
      expect(repo.getSetting("gatewayApiKey")).toBeUndefined();
      expect(settings.gatewayKey()).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("persists only nonsecret connection health and clears it when the model changes", async () => {
    const { dir, repo, settings } = harness();
    try {
      settings.modelOverride = {
        generateStructured: async () => ({ object: { ok: true }, durationMs: 12 }),
        generateText: async () => ({ text: "white", durationMs: 3 }),
        listModels: async () => [],
      } as never;
      const result = await settings.probe("fixture-model");
      expect(result).toMatchObject({ ok: true, modelId: "fixture-model", latencyMs: 12, vision: true });
      const saved = repo.getSetting<Record<string, unknown>>("modelProbe");
      expect(saved).toMatchObject({ provider: "gateway", modelId: "fixture-model", ok: true, latencyMs: 12, vision: true });
      expect(JSON.stringify(saved)).not.toContain("key");
      await settings.set({ plannerModel: "different-model" });
      expect(repo.getSetting("modelProbe")).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});


describe("search engine URL templates", () => {
  it("accepts usable search destinations and rejects missing terms or unsafe URLs", () => {
    expect(SearchEngineTemplateSchema.safeParse(" https://search.example/search?q=%s ").success).toBe(true);
    expect(SearchEngineTemplateSchema.safeParse("http://localhost:8080/search/%s").success).toBe(true);
    for (const url of ["https://search.example/", "javascript:alert('%s')", "file:///tmp/%s", "https://user:password@example.com/?q=%s", "https://%s.example.com/", "not a url %s"]) {
      expect({ url, accepted: SearchEngineTemplateSchema.safeParse(url).success }).toEqual({ url, accepted: false });
    }
  });
});
