import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PLANNER_MODEL_ID } from "@aux/contracts/model-registry";
import { modelCallCost, usageFields } from "../../apps/runtime/src/agent/model-client.js";
import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";
import { createFixture } from "../support/fixture.mjs";
import { createModelFixture } from "../support/model-fixture.mjs";
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

  it("delivers a genuine held SSE prefix through the installed SDK before completion", async () => {
    const fixture = await createFixture();
    const controller = new AbortController();
    const model = createModelFixture(fixture, { signal: controller.signal });
    const held = model.holdText("Page-free answer", " violet-271.");
    model.respond(() => held.response);
    try {
      const { createOpenAI } = await import(runtimeRequire.resolve("@ai-sdk/openai"));
      const { streamText } = await import(runtimeRequire.resolve("ai"));
      const provider = createOpenAI({ apiKey: "synthetic-loopback-only", baseURL: model.endpoint });
      const result = streamText({ model: provider.chat(DEFAULT_PLANNER_MODEL_ID), prompt: "Synthetic held reply", maxRetries: 0, abortSignal: controller.signal });
      let complete = false;
      const finalText = result.text.then((text: string) => { complete = true; return text; });
      const stream = result.textStream[Symbol.asyncIterator]();
      expect(await stream.next()).toEqual({ value: "Page-free answer", done: false });
      expect(complete).toBe(false);
      expect(model.pendingHolds).toBe(1);
      held.release();
      expect(await stream.next()).toEqual({ value: " violet-271.", done: false });
      expect((await stream.next()).done).toBe(true);
      expect(await finalText).toBe("Page-free answer violet-271.");
      expect(usageFields(await result.usage)).toMatchObject({ inputTokens: 10, outputTokens: 10 });
      expect(model.pendingHolds).toBe(0);
    } finally { held.cancel(); controller.abort(); model.close(); await fixture.close(); }
  });

  it("global abort cancels a held live response and unused holds without another deadline", async () => {
    const fixture = await createFixture();
    const controller = new AbortController();
    const model = createModelFixture(fixture, { signal: controller.signal });
    const held = model.holdText("Visible prefix", " held suffix");
    model.holdText("Unused prefix", " unused suffix");
    model.respond(() => held.response);
    try {
      const response = await fetch(`${model.endpoint}/chat/completions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: DEFAULT_PLANNER_MODEL_ID, stream: true, messages: [{ role: "user", content: "Synthetic held reply" }] }), signal: controller.signal });
      const reader = response.body!.getReader();
      const prefix = new TextDecoder().decode((await reader.read()).value);
      expect(prefix).toContain("Visible prefix");
      expect(prefix).not.toContain("held suffix");
      expect(prefix).not.toContain("[DONE]");
      expect(prefix).toContain("\n\n");
      expect(model.pendingHolds).toBe(2);
      controller.abort(new Error("Synthetic journey global deadline"));
      expect(model.pendingHolds).toBe(0);
      await expect(reader.read()).rejects.toBeDefined();
    } finally { held.cancel(); model.close(); await fixture.close(); }
  });
  it("frames an ordinary text or tool stream as real HTTP SSE events and DONE", async () => {
    const fixture = await createFixture();
    const model = createModelFixture(fixture);
    try {
      for (const result of [
        { content: "Synthetic ordinary reply" },
        { tool_calls: [{ id: "exact-tool", type: "function", function: { name: "repl", arguments: JSON.stringify({ code: "display(1)" }) } }] },
      ]) {
        model.respond(() => result);
        const response = await fetch(`${model.endpoint}/chat/completions`, { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ model: DEFAULT_PLANNER_MODEL_ID, stream: true, messages: [{ role: "user", content: "Synthetic local stream" }] }) });
        expect(response.headers.get("content-type")).toContain("text/event-stream");
        const raw = await response.text();
        const events = raw.split("\n\n").filter(Boolean);
        expect(events).toHaveLength(3);
        expect(events[2]).toBe("data: [DONE]");
        const first = JSON.parse(events[0]!.slice("data: ".length));
        const final = JSON.parse(events[1]!.slice("data: ".length));
        expect(first.choices[0].delta).toMatchObject({ role: "assistant", ...result });
        expect(final.choices[0].finish_reason).toBe("tool_calls" in result ? "tool_calls" : "stop");
        expect(final.usage).toEqual({ prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 });
      }
    } finally { model.close(); await fixture.close(); }
  });

  it("streams the held original prefix through the real GatewayModelClient before its step settles", async () => {
    const fixture = await createFixture(), controller = new AbortController();
    const model = createModelFixture(fixture, { signal: controller.signal });
    const held = model.holdText("Original prefix", " retained suffix");
    model.respond(() => held.response);
    let pending: Promise<unknown> | undefined;
    try {
      const { createOpenAI } = await import(runtimeRequire.resolve("@ai-sdk/openai"));
      const provider = createOpenAI({ apiKey: "synthetic-loopback-only", baseURL: model.endpoint });
      const client = new GatewayModelClient("synthetic-loopback-only", { model: id => provider.chat(id) });
      const visible: string[] = [];
      let settled = false;
      const step = client.toolCallStep({ modelId: DEFAULT_PLANNER_MODEL_ID, system: "Synthetic local stream", messages: [{ role: "user", content: "Return held text" }],
        tools: {}, signal: controller.signal, maxAttempts: 1, onText: text => visible.push(text) });
      pending = step;
      void step.then(() => { settled = true; }, () => { settled = true; });
      await vi.waitFor(() => expect(visible).toContain("Original prefix"));
      expect(settled).toBe(false);
      expect(model.pendingHolds).toBe(1);
      expect(visible).not.toContain("Original prefix retained suffix");
      held.release();
      expect(await step).toMatchObject({ text: "Original prefix retained suffix", toolCalls: [], inputTokens: 10, outputTokens: 10 });
      expect(visible.at(-1)).toBe("Original prefix retained suffix");
      expect(model.pendingHolds).toBe(0);
      expect(model.errors).toEqual([]);
    } finally { held.cancel(); controller.abort(); await pending?.catch(() => {}); model.close(); await fixture.close(); }
  });

  it("retires only the live hold when the original HTTP reader disconnects", async () => {
    const fixture = await createFixture(), controller = new AbortController();
    const model = createModelFixture(fixture, { signal: controller.signal });
    const held = model.holdText("Disconnect prefix", " withheld suffix");
    model.holdText("Unused prefix", " unused suffix");
    model.respond(() => held.response);
    try {
      const response = await fetch(`${model.endpoint}/chat/completions`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: DEFAULT_PLANNER_MODEL_ID, stream: true, messages: [{ role: "user", content: "Synthetic disconnect" }] }) });
      const reader = response.body!.getReader();
      const prefix = new TextDecoder().decode((await reader.read()).value);
      expect(prefix).toContain("Disconnect prefix");
      expect(prefix).not.toContain("withheld suffix");
      await reader.cancel();
      await vi.waitFor(() => expect(model.pendingHolds).toBe(1));
      expect(controller.signal.aborted).toBe(false);
      controller.abort();
      expect(model.pendingHolds).toBe(0);
    } finally { held.cancel(); controller.abort(); model.close(); await fixture.close(); }
  });

});
