import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  MODEL_REGISTRY,
  ModelCapabilitySchema,
  mergeModelCapabilities,
  modelPickerEntries,
} from "@aux/contracts";
import { DEFAULT_AGENT_MODEL, LUNA_FAST_MODEL, openDb, Repo, SettingsService } from "@aux/runtime";

describe("typed model registry (AI-04)", () => {
  it("covers the default planner and Luna Fast routes in the offline snapshot", () => {
    const ids = MODEL_REGISTRY.map((m) => m.id);
    expect(ids).toContain(DEFAULT_AGENT_MODEL);
    expect(ids).toContain(LUNA_FAST_MODEL);
    for (const entry of MODEL_REGISTRY) {
      expect(ModelCapabilitySchema.safeParse(entry).success).toBe(true);
      expect(entry.source).toBe("snapshot");
    }
  });

  it("merges catalog entries over the snapshot without dropping unknown IDs", () => {
    const merged = mergeModelCapabilities(MODEL_REGISTRY, [
      { id: LUNA_FAST_MODEL, name: "GPT 5.6 Luna Fast", contextTokens: 200_000, source: "catalog" },
      { id: "anthropic/claude-sonnet-x", source: "catalog" },
    ]);
    const luna = merged.find((m) => m.id === LUNA_FAST_MODEL);
    // catalog refresh wins metadata but snapshot capabilities survive
    expect(luna?.contextTokens).toBe(200_000);
    expect(luna?.structuredOutput).toBe(true);
    expect(luna?.source).toBe("catalog");
    // catalog-only IDs pass through — no blacklist of new identifiers
    expect(merged.some((m) => m.id === "anthropic/claude-sonnet-x")).toBe(true);
    // snapshot-only IDs remain selectable offline
    expect(merged.some((m) => m.id === DEFAULT_AGENT_MODEL)).toBe(true);
  });

  it("picker projection keeps the {id, name} contract", () => {
    const entries = modelPickerEntries(MODEL_REGISTRY);
    expect(entries).toContainEqual({
      id: DEFAULT_AGENT_MODEL,
      name: MODEL_REGISTRY.find((model) => model.id === DEFAULT_AGENT_MODEL)?.name,
    });
  });

  it("settings.listModels merges snapshot + live gateway catalog and re-tags sources", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-models-"));
    const settingsPath = join(dir, "settings.json");
    writeFileSync(settingsPath, JSON.stringify({}));
    const settings = new SettingsService(new Repo(openDb(":memory:")), settingsPath, {});
    const fake = {
      listModels: async () => [
        { id: LUNA_FAST_MODEL, name: "GPT 5.6 Luna Fast" },
        { id: "google/gemini-flash-new" },
      ],
      generateStructured: async () => {
        throw new Error("unused");
      },
      generateText: async () => {
        throw new Error("unused");
      },
    };
    (settings as unknown as { modelOverride: unknown }).modelOverride = fake;
    const out = await settings.listModels();
    expect(out.source).toBe("gateway");
    const byId = new Map(out.models.map((m) => [m.id, m]));
    expect(byId.get(LUNA_FAST_MODEL)?.source).toBe("catalog");
    expect(byId.get(LUNA_FAST_MODEL)?.structuredOutput).toBe(true);
    expect(byId.get("google/gemini-flash-new")?.source).toBe("catalog");
    expect(byId.get(DEFAULT_AGENT_MODEL)?.source).toBe("snapshot");
  });
});
