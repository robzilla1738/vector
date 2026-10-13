import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MethodSchemas, SearchEngineTemplateSchema } from "@aux/contracts";
import { DEFAULT_MAX_MODEL_CALLS, DEFAULT_AGENT_MODEL, openDb, Repo, SettingsService } from "@aux/runtime";

function harness(env: NodeJS.ProcessEnv = {}, file: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "aux-settings-"));
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify(file));
  const repo = new Repo(openDb(":memory:"));
  const settings = new SettingsService(repo, settingsPath, env);
  return { dir, repo, settings };
}

describe("settings defaults for a real test pass", () => {
  it("persists sidebar preview, visibility and tab placement preferences across restart", async () => {
    const { dir, repo, settings } = harness();
    try {
      expect(settings.all()).toMatchObject({
        sidebarRecentChatLimit: 3,
        sidebarBookmarksVisible: true,
        verticalTabInsertionPosition: "top",
        horizontalTabShrinkToFit: false,
      });
      const patch = MethodSchemas["settings.set"].parse({
        sidebarRecentChatLimit: 10,
        sidebarBookmarksVisible: false,
        verticalTabInsertionPosition: "bottom",
        horizontalTabShrinkToFit: true,
      });
      await settings.set(patch);
      expect(settings.all()).toMatchObject(patch);
      expect(new SettingsService(repo, join(dir, "settings.json"), {}).all()).toMatchObject(patch);
      expect(JSON.parse(readFileSync(join(dir, "settings.json"), "utf8"))).toMatchObject(patch);
      for (const invalid of [
        { sidebarRecentChatLimit: 4 },
        { sidebarRecentChatLimit: "all" },
        { sidebarBookmarksVisible: "false" },
        { verticalTabInsertionPosition: "sorted" },
        { horizontalTabShrinkToFit: "true" },
      ])
        expect(MethodSchemas["settings.set"].safeParse(invalid).success).toBe(false);
    } finally {
      repo.db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("exposes saved layout and automation preferences in live and reopened snapshots", async () => {
    const { dir, repo, settings } = harness();
    try {
      expect(settings.all()).toMatchObject({
        toolbarAutoHide: true,
        minimalUi: false,
        minimalUiAcknowledged: false,
        autoArchive: { acknowledged: false, bySpace: {} },
        nightShift: { enabled: false, requireAC: true },
      });
      const patch = MethodSchemas["settings.set"].parse({
        toolbarAutoHide: false,
        minimalUi: true,
        minimalUiAcknowledged: true,
        autoArchive: { acknowledged: true, bySpace: { work: 24 } },
        nightShift: {
          enabled: true,
          start: "01:00",
          end: "07:00",
          nightlyUsd: 3,
          perTaskUsd: 1,
          requireAC: true,
        },
      });
      await settings.set(patch);
      expect(settings.all()).toMatchObject(patch);
      expect(new SettingsService(repo, join(dir, "settings.json"), {}).all()).toMatchObject(patch);
      const reopened = harness({}, JSON.parse(readFileSync(join(dir, "settings.json"), "utf8")));
      try {
        expect(reopened.settings.all()).toMatchObject(patch);
      } finally {
        reopened.repo.db.close();
        rmSync(reopened.dir, { recursive: true, force: true });
      }
    } finally {
      repo.db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("persists the new-tab mode and rejects unsupported choices", async () => {
    const { dir, settings } = harness();
    try {
      expect(settings.all().homeEntryMode).toBeUndefined();
      await settings.set(MethodSchemas["settings.set"].parse({ homeEntryMode: "ask" }));
      expect(settings.all().homeEntryMode).toBe("ask");
      expect(JSON.parse(readFileSync(join(dir, "settings.json"), "utf8")).homeEntryMode).toBe("ask");
      expect(MethodSchemas["settings.set"].safeParse({ homeEntryMode: "unsupported" }).success).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("persists tab switcher order and rejects unknown modes", async () => {
    const { dir, settings } = harness();
    try {
      expect(settings.all().tabSwitcherOrder).toBe("sidebar");
      await settings.set(MethodSchemas["settings.set"].parse({ tabSwitcherOrder: "recently-used" }));
      expect(settings.all().tabSwitcherOrder).toBe("recently-used");
      expect(JSON.parse(readFileSync(join(dir, "settings.json"), "utf8")).tabSwitcherOrder).toBe(
        "recently-used",
      );
      expect(MethodSchemas["settings.set"].safeParse({ tabSwitcherOrder: "random" }).success).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("persists the local Skill suggestion cadence and rejects unknown modes", async () => {
    const { dir, settings } = harness();
    try {
      expect(settings.all().routineSuggestionScan).toBe("context");
      await settings.set(MethodSchemas["settings.set"].parse({ routineSuggestionScan: "five-minutes" }));
      expect(settings.all().routineSuggestionScan).toBe("five-minutes");
      expect(JSON.parse(readFileSync(join(dir, "settings.json"), "utf8")).routineSuggestionScan).toBe(
        "five-minutes",
      );
      expect(MethodSchemas["settings.set"].safeParse({ routineSuggestionScan: "hourly" }).success).toBe(
        false,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("persists native material, independent tint and content opacity", async () => {
    const { dir, settings } = harness();
    try {
      expect(settings.all()).toMatchObject({
        sidebarMaterial: "liquid-glass",
        sidebarTint: 0,
        contentOpacity: 95,
      });
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

  it("routes fast, standard, deep and visual calls with validated overrides", async () => {
    const { dir, settings } = harness(
      {},
      { plannerModel: "fixture-standard", recoveryModel: "fixture-deep", visionModel: "fixture-visual" },
    );
    try {
      expect(settings.agentRoute("standard")).toEqual({ modelId: "fixture-standard", reasoning: "medium" });
      expect(settings.agentRoute("deep")).toEqual({ modelId: "fixture-deep", reasoning: "high" });
      expect(settings.agentRoute("visual")).toEqual({ modelId: "fixture-visual", reasoning: "medium" });
      expect(settings.agentRoute("fast")).toEqual({ modelId: "fixture-standard", reasoning: "low" });
      const patch = MethodSchemas["settings.set"].parse({
        agentModelRoutes: { fast: { modelId: "fixture-fast", reasoning: "low" } },
      });
      await settings.set(patch);
      expect(settings.agentRoute("fast").modelId).toBe("fixture-fast");
      expect(settings.all().agentModelRouteOverrides).toEqual(patch.agentModelRoutes);
      await settings.set(MethodSchemas["settings.set"].parse({ agentModelRoutes: {} }));
      expect(settings.all().agentModelRouteOverrides).toEqual({});
      expect(settings.agentRoute("fast")).toEqual({ modelId: "fixture-standard", reasoning: "low" });
      expect(
        MethodSchemas["settings.set"].safeParse({
          agentModelRoutes: { fast: { modelId: "x", reasoning: "unsupported" } },
        }).success,
      ).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps model role overrides scoped to their selected provider", async () => {
    const { dir, settings } = harness();
    try {
      await settings.set({ agentModelRoutes: { fast: { modelId: "gateway-fast", reasoning: "low" } } });
      await settings.set({ modelProvider: "openai" });
      expect(settings.all().agentModelRouteOverrides).toEqual({});
      await settings.set({ agentModelRoutes: { fast: { modelId: "openai-fast", reasoning: "low" } } });
      expect(settings.agentRoute("fast").modelId).toBe("openai-fast");
      await settings.set({ modelProvider: "gateway" });
      expect(settings.agentRoute("fast").modelId).toBe("gateway-fast");
      await settings.set({ modelProvider: "openai" });
      expect(settings.agentRoute("fast").modelId).toBe("openai-fast");
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

  it("validates and persists user spend caps, including clearing all caps", async () => {
    const { dir, settings } = harness();
    try {
      const patch = MethodSchemas["settings.set"].parse({
        budgets: { runUsd: 2.5, dayUsd: 10, monthUsd: 200_000, routineUsd: 25 },
      });
      await settings.set(patch);
      expect(settings.budgetLimits()).toEqual(patch.budgets);
      await settings.set(MethodSchemas["settings.set"].parse({ budgets: {} }));
      expect(settings.budgetLimits()).toEqual({
        runUsd: undefined,
        dayUsd: undefined,
        monthUsd: undefined,
        routineUsd: undefined,
      });
      expect(MethodSchemas["settings.set"].safeParse({ budgets: { dayUsd: -1 } }).success).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("defaults search to DuckDuckGo and the shared model-call budget", () => {
    const { dir, settings } = harness();
    try {
      expect(settings.searchEngine()).toBe("https://duckduckgo.com/?q=%s");
      expect(settings.maxModelCalls()).toBe(DEFAULT_MAX_MODEL_CALLS);
      expect(settings.plannerModel()).toBe(DEFAULT_AGENT_MODEL);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("defaults to Ask first and Guard and persists each permission with its own revision", async () => {
    const { dir, repo, settings } = harness();
    try {
      expect(settings.agentPolicy()).toEqual({
        agentMode: "ask",
        agentPolicyRevision: 0,
        agentPolicies: [],
      });
      expect(settings.fileAccess()).toEqual({ fileAccessMode: "guard", fileAccessRevision: 0 });
      await settings.set(
        MethodSchemas["settings.set"].parse({ fileAccessMode: "read-only", fileAccessRevision: 0 }),
      );
      expect(settings.fileAccess()).toEqual({ fileAccessMode: "read-only", fileAccessRevision: 1 });
      await expect(settings.set({ fileAccessMode: "full", fileAccessRevision: 0 })).rejects.toMatchObject({
        code: "conflict",
      });
      await expect(
        settings.set({
          fileAccessMode: "full",
          fileAccessRevision: 1,
          agentMode: "full",
          agentPolicyRevision: 0,
        }),
      ).rejects.toMatchObject({ code: "invalid_params" });
      await expect(settings.set({ fileAccessRevision: 1 })).rejects.toMatchObject({ code: "invalid_params" });
      expect(new SettingsService(repo, join(dir, "settings.json"), {}).fileAccess()).toEqual(
        settings.fileAccess(),
      );
      expect(settings.agentPolicy().agentPolicyRevision).toBe(0);
    } finally {
      repo.db.close();
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
      expect(saved).toMatchObject({
        provider: "gateway",
        modelId: "fixture-model",
        ok: true,
        latencyMs: 12,
        vision: true,
      });
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
    for (const url of [
      "https://search.example/",
      "javascript:alert('%s')",
      "file:///tmp/%s",
      "https://user:password@example.com/?q=%s",
      "https://%s.example.com/",
      "not a url %s",
    ]) {
      expect({ url, accepted: SearchEngineTemplateSchema.safeParse(url).success }).toEqual({
        url,
        accepted: false,
      });
    }
  });
});
