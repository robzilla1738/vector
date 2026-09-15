import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

  it("defaults search to DuckDuckGo, engine off, and 8 model calls", () => {
    const { dir, settings } = harness();
    try {
      expect(settings.searchEngine()).toBe("https://duckduckgo.com/?q=%s");
      expect(settings.engineMode()).toBe("off");
      expect(settings.maxModelCalls()).toBe(8);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("listModels stays on the pinned Qwen catalog when Cerebras is the only provider", async () => {
    const { dir, settings } = harness();
    try {
      expect(await settings.listModels()).toEqual({ models: [{ id: DEFAULT_PLANNER_MODEL, name: "Qwen 3.8 27B" }], source: "static" });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
