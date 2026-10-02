import { expect, it, vi } from "vitest";
import { z } from "zod";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";

const usage = {
  inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 4, text: 4, reasoning: 0 },
};
it("publishes actual SDK text before completion while buffering tool calls and retaining usage", async () => {
  let release!: () => void;
  const model = new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "text" });
          controller.enqueue({ type: "text-delta", id: "text", delta: "I’ll read " });
          release = () => {
            controller.enqueue({ type: "text-delta", id: "text", delta: "the selected page." });
            controller.enqueue({ type: "text-end", id: "text" });
            controller.enqueue({
              type: "tool-call",
              toolCallId: "snapshot-1",
              toolName: "snapshot",
              input: "{}",
            });
            controller.enqueue({
              type: "finish",
              finishReason: { unified: "tool-calls", raw: "tool_calls" },
              usage,
            });
            controller.close();
          };
        },
      }),
    },
  });
  const client = new GatewayModelClient("synthetic", { model: () => model });
  const previews: string[] = [];
  let finished = false;
  const pending = client
    .toolCallStep({
      modelId: "test",
      system: "Read the selected page",
      messages: [{ role: "user", content: "Read" }],
      tools: { snapshot: { inputSchema: z.object({}) } },
      onText: (text) => previews.push(text),
    })
    .then((result) => {
      finished = true;
      return result;
    });
  try {
    await vi.waitFor(() => expect(previews).toContain("I’ll read "));
    expect(finished).toBe(false);
    expect(model.doGenerateCalls).toHaveLength(0);
  } finally {
    release();
  }
  const result = await pending;
  expect(previews.at(-1)).toBe("I’ll read the selected page.");
  expect(result.toolCalls).toEqual([{ toolCallId: "snapshot-1", toolName: "snapshot", input: {} }]);
  expect(result).toMatchObject({ text: "I’ll read the selected page.", inputTokens: 12, outputTokens: 4 });
});

it("refuses a provider stream error instead of completing its partial answer", async () => {
  const model = new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "text" });
          controller.enqueue({ type: "text-delta", id: "text", delta: "Partial" });
          controller.enqueue({ type: "error", error: new Error("Synthetic provider stream failed") });
          controller.close();
        },
      }),
    },
  });
  const client = new GatewayModelClient("synthetic", { model: () => model });
  const previews: string[] = [];
  await expect(
    client.toolCallStep({
      modelId: "test",
      system: "Answer",
      messages: [{ role: "user", content: "Hello" }],
      tools: {},
      onText: (text) => previews.push(text),
    }),
  ).rejects.toThrow("Synthetic provider stream failed");
  expect(previews).toContain("Partial");
  expect(model.doGenerateCalls).toHaveLength(0);
});

it("replaces an interrupted provider preview when the genuine route fails over", async () => {
  const first = new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "text" });
          controller.enqueue({ type: "text-delta", id: "text", delta: "Abandoned" });
          controller.enqueue({
            type: "error",
            error: Object.assign(new Error("Synthetic rate limit"), { statusCode: 429 }),
          });
          controller.close();
        },
      }),
    },
  });
  const second = new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "text" });
          controller.enqueue({ type: "text-delta", id: "text", delta: "Final answer" });
          controller.enqueue({ type: "text-end", id: "text" });
          controller.enqueue({ type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage });
          controller.close();
        },
      }),
    },
  });
  const client = new GatewayModelClient("synthetic", {
    model: (id) => (id === "first" ? first : second),
    candidatesFor: () => [
      { modelId: "first", reasoning: "medium" },
      { modelId: "second", reasoning: "low" },
    ],
  });
  const previews: string[] = [];
  const result = await client.toolCallStep({
    modelId: "first",
    system: "Answer",
    messages: [{ role: "user", content: "Hello" }],
    tools: {},
    onText: (text) => previews.push(text),
  });
  expect(previews).toEqual(["", "Abandoned", "", "Final answer"]);
  expect(result).toMatchObject({
    text: "Final answer",
    resolvedModelId: "second",
    retries: [{ modelId: "first" }],
  });
  expect(first.doStreamCalls).toHaveLength(1);
  expect(second.doStreamCalls).toHaveLength(1);
});

it("does not complete a partial answer after the person cancels the actual stream", async () => {
  const abort = new AbortController();
  const model = new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          abort.signal.addEventListener("abort", () => controller.close(), { once: true });
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "text" });
          controller.enqueue({ type: "text-delta", id: "text", delta: "Unfinished answer" });
        },
      }),
    },
  });
  const client = new GatewayModelClient("synthetic", { model: () => model });
  const previews: string[] = [];
  const pending = client.toolCallStep({
    modelId: "test",
    system: "Answer",
    messages: [{ role: "user", content: "Hello" }],
    tools: {},
    signal: abort.signal,
    onText: (text) => previews.push(text),
  });
  const rejection = expect(pending).rejects.toThrow("Synthetic person cancellation");
  await vi.waitFor(() => expect(previews).toContain("Unfinished answer"));
  abort.abort(new Error("Synthetic person cancellation"));
  await rejection;
  expect(model.doGenerateCalls).toHaveLength(0);
});
