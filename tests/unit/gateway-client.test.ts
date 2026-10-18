import { describe, expect, it } from "vitest";
import { AuxError } from "@aux/contracts";
import {
  extractJson,
  GatewayModelClient,
  gatewayProviderOptions,
  stripReasoning,
} from "../../apps/runtime/src/agent/gateway-client.js";

describe("extractJson", () => {
  it("parses a bare object", () => {
    expect(extractJson('{"ok":true}')).toEqual({ ok: true });
  });
  it("extracts from fenced prose", () => {
    expect(extractJson('Sure! Here is the plan:\n```json\n{"steps":[{"op":"click"}]}\n```')).toEqual({
      steps: [{ op: "click" }],
    });
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
    expect(extractJson('<think>consider {not json}</think>\n{"status":"done","message":"ok"}')).toEqual({
      status: "done",
      message: "ok",
    });
  });
  it("throws on no JSON", () => {
    expect(() => extractJson("no json here")).toThrow("no JSON value");
  });
  it("throws on unbalanced JSON", () => {
    expect(() => extractJson('{"a": [1, 2')).toThrow("truncated or unbalanced");
  });
});

describe("structured output parsing", () => {
  it("strips private reasoning before parsing output", () => {
    expect(stripReasoning("<think>nope</think>ok").trim()).toBe("ok");
  });
  it("preserves explicit provider routing and requested reasoning", () => {
    expect(gatewayProviderOptions(["custom-provider"], "openai/gpt-6-luna-fast").gateway.only).toEqual([
      "custom-provider",
    ]);
    expect(gatewayProviderOptions(undefined, "openai/gpt-6-luna-fast").gateway).toMatchObject({
      speed: "fast",
    });
    expect(gatewayProviderOptions(undefined, "openai/gpt-5.4").openai).toBeUndefined();
    const reasoner = [
      {
        id: "openai/gpt-5.4",
        provider: "openai",
        reasoning: "supported" as const,
        source: "configured" as const,
      },
    ];
    expect(gatewayProviderOptions(undefined, "openai/gpt-5.4", reasoner).openai).toEqual({
      reasoningEffort: "minimal",
    });
    expect(gatewayProviderOptions(undefined, "openai/gpt-5.4", reasoner, "high").openai).toBeUndefined();
    expect(gatewayProviderOptions(undefined, "openai/gpt-5.4", reasoner, "xhigh").openai).toBeUndefined();
  });
  it("rejects image parts before the Gateway call when pinned to Cerebras", async () => {
    const client = new GatewayModelClient("vg_test", {
      only: ["cerebras"],
      models: () => [{ id: "alibaba/qwen3.8-27b", modalities: ["text"], source: "configured" }],
    });
    await expect(
      client.generateText({
        modelId: "alibaba/qwen3.8-27b",
        prompt: "what color",
        imageDataUrl: "data:image/png;base64,AAAA",
      }),
    ).rejects.toBeInstanceOf(AuxError);
    await expect(
      client.generateText({
        modelId: "alibaba/qwen3.8-27b",
        prompt: "what color",
        imageDataUrl: "data:image/png;base64,AAAA",
      }),
    ).rejects.toMatchObject({ code: "capability_unsupported" });
  });
});
