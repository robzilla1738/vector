import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { DEFAULT_PLANNER_MODEL_ID } from "@aux/contracts/model-registry";
import { modelCallCost, usageFields } from "../../apps/runtime/src/agent/model-client.js";
import { createFixture } from "../host/lib/fixture.mjs";
import { createModelFixture } from "../host/lib/model-fixture.mjs";
const runtimeRequire = createRequire(new URL("../../apps/runtime/package.json", import.meta.url));

describe("actual overnight pricing transport", () => {
  it("preserves default usage and parses bounded priced usage through the installed SDK", async () => {
    const fixture = await createFixture();
    const model = createModelFixture(fixture);
    try {
      const request = () => fetch(`${model.endpoint}/chat/completions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: DEFAULT_PLANNER_MODEL_ID, messages: [{ role: "user", content: "Synthetic local fixture" }] }) });
      const normal = await (await request()).json();
      expect(normal.usage).toEqual({ prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 });
      model.respond(() => ({ content: "Synthetic priced reply", usage: { prompt_tokens: 200_000, completion_tokens: 200_000, total_tokens: 400_000 } }));
      const { createOpenAI } = await import(runtimeRequire.resolve("@ai-sdk/openai"));
      const { generateText } = await import(runtimeRequire.resolve("ai"));
      const provider = createOpenAI({ apiKey: "synthetic-loopback-only", baseURL: model.endpoint });
      const result = await generateText({ model: provider.chat(DEFAULT_PLANNER_MODEL_ID), prompt: "Synthetic local fixture", maxRetries: 0 });
      expect(result.text).toBe("Synthetic priced reply");
      const usage = usageFields(result.usage);
      expect(usage).toMatchObject({ inputTokens: 200_000, outputTokens: 200_000 });
      expect(modelCallCost(DEFAULT_PLANNER_MODEL_ID, usage)).toEqual({ costUsd: 0.06, costEstimated: true });
      expect(model.calls.at(-1).model).toBe(DEFAULT_PLANNER_MODEL_ID);
      for (const usage of [
        { prompt_tokens: -1, completion_tokens: 1, total_tokens: 0 },
        { prompt_tokens: 1, completion_tokens: 1, total_tokens: 3 },
        { prompt_tokens: 10_000_001, completion_tokens: 0, total_tokens: 10_000_001 },
      ]) {
        model.respond(() => ({ content: "Invalid synthetic usage", usage }));
        expect((await request()).status).toBe(500);
      }
    } finally { model.close(); await fixture.close(); }
  });
});
