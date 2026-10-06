import { afterEach, expect, it, vi } from "vitest";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import {
  GatewayModelClient,
  DEFAULT_MODEL_STREAM_IDLE_TIMEOUT_MS,
} from "../../apps/runtime/src/agent/gateway-client.js";

const usage = {
  inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 7, text: 7, reasoning: 0 },
};
afterEach(() => vi.useRealTimers());

it("allows a model stream to run longer than its idle deadline while semantic output continues", async () => {
  vi.useFakeTimers();
  expect(DEFAULT_MODEL_STREAM_IDLE_TIMEOUT_MS).toBe(60_000);
  let output!: ReadableStreamDefaultController;
  const model = new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          output = controller;
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "t" });
        },
      }),
    },
  });
  const client = new GatewayModelClient("synthetic", { model: () => model, streamIdleTimeoutMs: 100 });
  const previews: string[] = [];
  const pending = client.toolCallStep({
    modelId: "synthetic",
    system: "Answer",
    messages: [{ role: "user", content: "Answer" }],
    tools: {},
    onText: (text) => previews.push(text),
  });
  const settled = pending.then(
    (result) => ({ result }),
    (error: unknown) => ({ error }),
  );
  await vi.waitFor(() => expect(model.doStreamCalls).toHaveLength(1));
  for (let index = 0; index < 7; index++) {
    await vi.advanceTimersByTimeAsync(30);
    output.enqueue({ type: "text-delta", id: "t", delta: "x" });
    await vi.advanceTimersByTimeAsync(0);
    expect(previews.at(-1)).toBe("x".repeat(index + 1));
  }
  output.enqueue({ type: "text-end", id: "t" });
  output.enqueue({ type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage });
  output.close();
  expect(await settled).toMatchObject({ result: { text: "xxxxxxx", inputTokens: 12, outputTokens: 7 } });
});

it("cancels a provider that never returns its first response without waiting for transport cooperation", async () => {
  vi.useFakeTimers();
  let signal: AbortSignal | undefined;
  const model = new MockLanguageModelV4({
    doStream: async (options) => {
      signal = options.abortSignal;
      return new Promise<never>(() => {});
    },
  });
  const client = new GatewayModelClient("synthetic", { model: () => model, streamIdleTimeoutMs: 100 });
  const pending = client
    .generateText({ modelId: "synthetic", prompt: "Answer" })
    .catch((error: unknown) => error);
  await vi.waitFor(() => expect(signal).toBeDefined());
  await vi.advanceTimersByTimeAsync(100);
  expect(await pending).toMatchObject({ name: "TimeoutError" });
  expect(signal?.aborted).toBe(true);
});

it("cancels a stalled stream and preserves caller cancellation", async () => {
  vi.useFakeTimers();
  let signal: AbortSignal | undefined;
  const model = new MockLanguageModelV4({
    doStream: async (options) => {
      signal = options.abortSignal;
      return {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings: [] });
            controller.enqueue({ type: "text-start", id: "t" });
            controller.enqueue({ type: "text-delta", id: "t", delta: "started" });
          },
        }),
      };
    },
  });
  const client = new GatewayModelClient("synthetic", { model: () => model, streamIdleTimeoutMs: 100 });
  const pending = client
    .generateText({ modelId: "synthetic", prompt: "Answer" })
    .catch((error: unknown) => error);
  await vi.waitFor(() => expect(signal).toBeDefined());
  await vi.advanceTimersByTimeAsync(101);
  expect(await pending).toMatchObject({ name: "TimeoutError" });
  expect(signal?.aborted).toBe(true);
  const caller = new AbortController();
  const cancellation = client
    .generateText({ modelId: "synthetic", prompt: "Answer", signal: caller.signal })
    .catch((error: unknown) => error);
  await vi.waitFor(() => expect(model.doStreamCalls).toHaveLength(2));
  caller.abort(new DOMException("Stopped by user", "AbortError"));
  expect(await cancellation).toMatchObject({ name: "AbortError", message: "Stopped by user" });
});
