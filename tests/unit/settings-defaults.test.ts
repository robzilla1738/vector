import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_PLANNER_MODEL, openDb, Repo, SettingsService } from "@vector/runtime";

function harness(env: NodeJS.ProcessEnv = {}, file: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "vector-settings-"));
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify(file));
  const repo = new Repo(openDb(":memory:"));
  const settings = new SettingsService(repo, settingsPath, env);
  return { dir, repo, settings };
}

describe("settings defaults for a real test pass", () => {
  it("honours a saved planner model including GPT Luna Fast", () => {
    const { dir, settings } = harness({}, { plannerModel: "openai/gpt-5.6-luna-fast" });
    try {
      expect(settings.plannerModel()).toBe("openai/gpt-5.6-luna-fast");
      expect(settings.all().plannerModel).toBe("openai/gpt-5.6-luna-fast");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("falls back to VECTOR_PLANNER_MODEL then the Qwen default", () => {
    const { dir, settings } = harness({ VECTOR_PLANNER_MODEL: "alibaba/qwen3.8-27b-custom" });
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

  it("defaults search to DuckDuckGo, engine auto, and 8 model calls", () => {
    const { dir, settings } = harness();
    try {
      expect(settings.searchEngine()).toBe("https://duckduckgo.com/?q=%s");
      expect(settings.engineMode()).toBe("auto");
      expect(settings.maxModelCalls()).toBe(8);
      expect(settings.plannerModel()).toBe(DEFAULT_PLANNER_MODEL);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("defaults effect grants to read+write+destructive+egress and sanitizes settings.set", () => {
    const { dir, settings } = harness();
    try {
      expect(settings.effectGrants()).toEqual([
        "effect:read",
        "effect:write",
        "effect:destructive",
        "effect:egress",
      ]);
      expect(settings.all().effectGrants).toEqual(settings.effectGrants());
      settings.set({ effectGrants: ["effect:write", "grant-from-model", "effect:*"] });
      expect(settings.effectGrants()).toEqual(["effect:write", "effect:*"]);
      settings.set({ effectGrants: ["effect:read"] });
      expect(settings.effectGrants()).toEqual(["effect:read"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("stores the gateway key in a 0600 file, not sqlite", () => {
    const { dir, repo, settings } = harness();
    try {
      settings.set({ gatewayApiKey: "sk-test-secret" });
      const keyFile = join(dir, "gateway.key");
      expect(existsSync(keyFile)).toBe(true);
      expect(readFileSync(keyFile, "utf8")).toBe("sk-test-secret");
      expect(statSync(keyFile).mode & 0o777).toBe(0o600);
      expect(repo.getSetting("gatewayApiKey")).toBeUndefined();
      expect(settings.gatewayKey()).toBe("sk-test-secret");
      expect(settings.all().gatewayApiKey).toBe("••••••••");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
