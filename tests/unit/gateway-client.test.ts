import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PlanChunkSchema, VectorError } from "@vector/contracts";
import {
  assignMissingStepIds,
  extractJson,
  GatewayModelClient,
  gatewayOnlyForModel,
  gatewayProviderOptions,
  isStructuredOutputError,
  normalizePlannerObject,
  schemaNeedsJsonFallback,
  stripReasoning,
} from "../../apps/runtime/src/agent/gateway-client.js";
import { extractJson as extractJsonPlanner } from "../../apps/runtime/src/agent/planner.js";

describe("extractJson", () => {
  it("parses a bare object", () => {
    expect(extractJson('{"ok":true}')).toEqual({ ok: true });
  });
  it("extracts from fenced prose", () => {
    expect(extractJson('Sure! Here is the plan:\n```json\n{"steps":[{"op":"click"}]}\n```')).toEqual({ steps: [{ op: "click" }] });
  });
  it("handles mixed nesting", () => {
    expect(extractJson('[{"a":[1,{"b":2}]}]')).toEqual([{ a: [1, { b: 2 }] }]);
  });
  it("ignores braces inside strings", () => {
    expect(extractJson('{"text":"use } and { freely"}')).toEqual({ text: "use } and { freely" });
  });
  it("handles escaped quotes inside strings", () => {
    expect(extractJson('{"q":"say \\"hi\\" then }"}')).toEqual({ q: 'say "hi" then }' });
  });
  it("strips Qwen think tags before parsing", () => {
    expect(extractJson('<think>consider {not json}</think>\n{"status":"done","message":"ok"}')).toEqual({ status: "done", message: "ok" });
  });
  it("throws on no JSON", () => {
    expect(() => extractJson("no json here")).toThrow("no JSON value");
  });
  it("throws on unbalanced JSON", () => {
    expect(() => extractJson('{"a": [1, 2')).toThrow("truncated or unbalanced");
  });
});

describe("planner extractJson", () => {
  it("skips braces inside think tags", () => {
    expect(extractJsonPlanner('<think>consider {not json}</think>\n{"status":"done"}')).toEqual({ status: "done" });
  });
});

describe("schemaNeedsJsonFallback", () => {
  it("is false for a flat object", () => {
    expect(schemaNeedsJsonFallback(z.object({ ok: z.boolean() }))).toBe(false);
  });
  it("is true for PlanChunk (discriminated unions → oneOf)", () => {
    expect(schemaNeedsJsonFallback(PlanChunkSchema)).toBe(true);
  });
});

describe("assignMissingStepIds", () => {
  it("fills omitted step ids", () => {
    expect(assignMissingStepIds({ status: "continue", steps: [{ op: "click", target: "r1" }] })).toEqual({
      status: "continue",
      steps: [{ op: "click", target: "r1", id: "s1" }],
    });
  });
});

describe("normalizePlannerObject", () => {
  it("fills omitted message and step ids so PlanChunk parses", () => {
    const n = normalizePlannerObject({ status: "continue", steps: [{ op: "click", target: "r1" }] });
    expect(PlanChunkSchema.parse(n)).toMatchObject({
      status: "continue",
      message: "Continue",
      steps: [{ op: "click", target: "r1", id: "s1" }],
    });
  });
});

describe("stripReasoning / oneOf errors", () => {
  it("clears think blocks", () => {
    expect(stripReasoning("<think>nope</think>ok").trim()).toBe("ok");
  });
  it("treats Cerebras oneOf rejection as a structured-output failure", () => {
    expect(isStructuredOutputError(new Error("Unsupported JSON schema fields in schema with keys: dict_keys(['oneOf'])."))).toBe(true);
  });
  it("drops a Cerebras pin for GPT Luna Fast", () => {
    expect(gatewayOnlyForModel("openai/gpt-5.6-luna-fast", ["cerebras"])).toBeUndefined();
    expect(gatewayOnlyForModel("alibaba/qwen3.8-27b", ["cerebras"])).toEqual(["cerebras"]);
    expect(gatewayProviderOptions(["cerebras"], "openai/gpt-5.6-luna-fast").gateway).toMatchObject({
      speed: "fast",
    });
    expect(gatewayProviderOptions(["cerebras"], "openai/gpt-5.6-luna-fast").gateway.only).toBeUndefined();
  });
  it("rejects image parts before the Gateway call when pinned to Cerebras", async () => {
    const client = new GatewayModelClient("vg_test", { only: ["cerebras"] });
    await expect(
      client.generateText({
        modelId: "alibaba/qwen3.8-27b",
        prompt: "what color",
        imageDataUrl: "data:image/png;base64,AAAA",
      }),
    ).rejects.toBeInstanceOf(VectorError);
    await expect(
      client.generateText({
        modelId: "alibaba/qwen3.8-27b",
        prompt: "what color",
        imageDataUrl: "data:image/png;base64,AAAA",
      }),
    ).rejects.toMatchObject({ code: "capability_unsupported" });
  });
});
