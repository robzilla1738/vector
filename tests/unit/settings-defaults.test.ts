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
  it("pins the planner to Cerebras Qwen even if an old catalog model is stored", () => {
    const { dir, settings } = harness({}, { plannerModel: "anthropic/claude-sonnet-4.5" });
    try {
      expect(settings.plannerModel()).toBe(DEFAULT_PLANNER_MODEL);
      expect(settings.all().plannerModel).toBe("alibaba/qwen3.8-27b");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("honours VECTOR_PLANNER_MODEL over the pin", () => {
    const { dir, settings } = harness({ VECTOR_PLANNER_MODEL: "alibaba/qwen3.8-27b-custom" });
    try {
      expect(settings.plannerModel()).toBe("alibaba/qwen3.8-27b-custom");
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
