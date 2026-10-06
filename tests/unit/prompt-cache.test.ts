import { modelStream, modelSse } from "../fixtures/model-stream.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import {
  GatewayModelClient,
  SpendLedger,
  TranscriptStore,
  buildToolManifest,
  gatewayProviderOptions,
  openDb,
  runAgentLoop,
} from "@aux/runtime";

const cleanup: Array<() => void> = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage: {
    inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 2, text: 2, reasoning: 0 },
  },
  warnings: [],
});

it("keeps gateway caching on auto", () => {
  expect(gatewayProviderOptions(undefined, "meta/muse-spark-1.3-contributor").gateway.caching).toBe("auto");
});

it("puts Anthropic cache breakpoints on the system, the last tool, and the history prefix", async () => {
  const model = new MockLanguageModelV4({
    provider: "anthropic",
    doStream: () => modelStream(textResult("ok")),
  });
  const client = new GatewayModelClient("fixture", { model: () => model });
  await client.toolCallStep({
    modelId: "claude-test",
    system: "Be brief",
    sessionId: "chat-1",
    messages: [
      { role: "user", content: "first" },
      { role: "assistant", content: [{ type: "text", text: "ack" }] },
      { role: "user", content: "newest" },
    ],
    tools: {
      alpha: { description: "a", inputSchema: z.object({ q: z.string() }) },
      beta: { description: "b", inputSchema: z.object({ q: z.string() }) },
    },
    maxOutputTokens: 32,
  });
  const call = model.doStreamCalls[0]!;
  const prompt = call.prompt as Array<{
    role: string;
    providerOptions?: { anthropic?: { cacheControl?: { type?: string } } };
    content?: unknown;
  }>;
  expect(prompt.map((message) => message.role)).toEqual(["system", "user", "assistant", "user"]);
  expect(prompt.map(hasAnthropicCache)).toEqual([true, false, true, false]);
  const tools = (call.tools ?? []) as Array<{
    name: string;
    providerOptions?: { anthropic?: { cacheControl?: { type?: string } } };
  }>;
  expect(tools.filter(hasAnthropicCache).map((tool) => tool.name)).toEqual(["beta"]);
});

it("sets the OpenAI prompt cache key to the session id", async () => {
  const model = new MockLanguageModelV4({
    provider: "openai",
    doStream: () => modelStream(textResult("ok")),
  });
  const client = new GatewayModelClient("fixture", { model: () => model });
  await client.toolCallStep({
    modelId: "gpt-test",
    system: "Be brief",
    sessionId: "chat-9",
    providerOptions: { openai: { user: "fixture-user" } },
    messages: [{ role: "user", content: "hi" }],
    tools: { alpha: { description: "a", inputSchema: z.object({}) } },
    maxOutputTokens: 32,
  });
  expect(model.doStreamCalls[0]?.providerOptions).toMatchObject({
    openai: { promptCacheKey: "chat-9", user: "fixture-user" },
  });
  const prompt = model.doStreamCalls[0]?.prompt as Array<{ providerOptions?: { anthropic?: unknown } }>;
  expect(prompt.some((message) => message.providerOptions?.anthropic)).toBe(false);
});

it("preserves Gateway Anthropic cache breakpoints and usage through the real SDK transport", async () => {
  let body: Record<string, unknown> | undefined;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return modelSse({
      ...textResult("ok"),
      usage: {
        inputTokens: { total: 10, noCache: 3, cacheRead: 7, cacheWrite: 0 },
        outputTokens: { total: 2, text: 2, reasoning: 0 },
      },
      providerMetadata: { gateway: { cost: "0.00001" } },
    });
  });
  const directory = mkdtempSync(join(tmpdir(), "aux-gateway-cache-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const ledger = new SpendLedger(join(directory, "spend.sqlite"));
  cleanup.push(() => ledger.close());
  const client = new GatewayModelClient("fixture", {
    spendLedger: ledger,
    models: () => [
      {
        id: "anthropic/cache-fixture",
        provider: "anthropic",
        source: "configured",
        contextTokens: 10000,
        inputUsdPerMTok: 1,
        outputUsdPerMTok: 1,
      },
    ],
  });
  const result = await client.toolCallStep({
    modelId: "anthropic/cache-fixture",
    system: "Stable instructions",
    messages: [
      { role: "user", content: "first" },
      { role: "user", content: "newest" },
    ],
    tools: { alpha: { inputSchema: z.object({}) } },
    providerOptions: { gateway: { tags: ["cache-test"] }, anthropic: { thinking: { type: "disabled" } } },
    maxOutputTokens: 32,
  });
  const prompt = body?.prompt as Array<{
    role: string;
    providerOptions?: { anthropic?: { cacheControl?: { type?: string } } };
  }>;
  expect(prompt.map((message) => message.role)).toEqual(["system", "user", "user"]);
  expect(prompt.map(hasAnthropicCache)).toEqual([true, true, false]);
  expect(body?.providerOptions).toMatchObject({
    gateway: { caching: "auto", sort: "ttft", tags: ["cache-test"] },
    anthropic: { thinking: { type: "disabled" } },
  });
  expect(
    (
      (body?.tools ?? []) as Array<{ providerOptions?: { anthropic?: { cacheControl?: { type?: string } } } }>
    ).map(hasAnthropicCache),
  ).toEqual([true]);
  expect(ledger.summary().committedUsd).toBe(0.00001);
  expect(result.cachedInputTokens).toBe(7);
  expect(result.providerMetadata).toMatchObject({ gateway: { cost: "0.00001" } });
});

it("sends the loop thread id through as the OpenAI session", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-cache-loop-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const db = openDb(join(directory, "state.sqlite"));
  cleanup.push(() => db.close());
  const transcript = new TranscriptStore(db);
  transcript.append("run-1", [{ role: "user", content: "do the task" }]);
  const model = new MockLanguageModelV4({
    provider: "openai",
    doStream: () => modelStream(textResult("done")),
  });
  const client = new GatewayModelClient("fixture", { model: () => model });
  const outcome = await runAgentLoop({
    model: client,
    modelId: "gpt-test",
    tools: buildToolManifest(),
    transcript,
    runId: "run-1",
    threadId: "chat-1",
    deps: {},
    maxSteps: 1,
  });
  expect(outcome.kind).toBe("done");
  expect(model.doStreamCalls[0]?.providerOptions).toMatchObject({ openai: { promptCacheKey: "chat-1" } });
});

function hasAnthropicCache(value: {
  providerOptions?: { anthropic?: { cacheControl?: { type?: string } } };
  content?: unknown;
}): boolean {
  if (value.providerOptions?.anthropic?.cacheControl?.type === "ephemeral") return true;
  if (!Array.isArray(value.content)) return false;
  return value.content.some((part) => {
    if (!part || typeof part !== "object") return false;
    const options = (part as { providerOptions?: { anthropic?: { cacheControl?: { type?: string } } } })
      .providerOptions;
    return options?.anthropic?.cacheControl?.type === "ephemeral";
  });
}
