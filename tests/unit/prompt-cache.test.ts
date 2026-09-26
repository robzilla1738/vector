import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { z } from "zod";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import {
  GatewayModelClient,
  TranscriptStore,
  buildToolManifest,
  gatewayProviderOptions,
  openDb,
  runAgentLoop,
} from "@aux/runtime";

const cleanup: Array<() => void> = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage: { inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 2, text: 2, reasoning: 0 } },
  warnings: [],
});

it("keeps gateway caching on auto", () => {
  expect(gatewayProviderOptions(undefined, "meta/muse-spark-1.3-contributor").gateway.caching).toBe("auto");
});

it("puts Anthropic cache breakpoints on the system, the last tool, and the history prefix", async () => {
  const model = new MockLanguageModelV4({ provider: "anthropic", doGenerate: textResult("ok") });
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
  const call = model.doGenerateCalls[0]!;
  const prompt = call.prompt as Array<{ role: string; providerOptions?: { anthropic?: { cacheControl?: { type?: string } } }; content?: unknown }>;
  expect(prompt.map((message) => message.role)).toEqual(["system", "user", "assistant", "user"]);
  expect(prompt.map(hasAnthropicCache)).toEqual([true, false, true, false]);
  const tools = (call.tools ?? []) as Array<{ name: string; providerOptions?: { anthropic?: { cacheControl?: { type?: string } } } }>;
  expect(tools.filter(hasAnthropicCache).map((tool) => tool.name)).toEqual(["beta"]);
});

it("sets the OpenAI prompt cache key to the session id", async () => {
  const model = new MockLanguageModelV4({ provider: "openai", doGenerate: textResult("ok") });
  const client = new GatewayModelClient("fixture", { model: () => model });
  await client.toolCallStep({
    modelId: "gpt-test",
    system: "Be brief",
    sessionId: "chat-9",
    messages: [{ role: "user", content: "hi" }],
    tools: { alpha: { description: "a", inputSchema: z.object({}) } },
    maxOutputTokens: 32,
  });
  expect(model.doGenerateCalls[0]?.providerOptions).toMatchObject({ openai: { promptCacheKey: "chat-9" } });
  const prompt = model.doGenerateCalls[0]?.prompt as Array<{ providerOptions?: { anthropic?: unknown } }>;
  expect(prompt.some((message) => message.providerOptions?.anthropic)).toBe(false);
});

it("sends the loop thread id through as the OpenAI session", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-cache-loop-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const db = openDb(join(directory, "state.sqlite"));
  cleanup.push(() => db.close());
  const transcript = new TranscriptStore(db);
  transcript.append("run-1", [{ role: "user", content: "do the task" }]);
  const model = new MockLanguageModelV4({ provider: "openai", doGenerate: textResult("done") });
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
  expect(model.doGenerateCalls[0]?.providerOptions).toMatchObject({ openai: { promptCacheKey: "chat-1" } });
});

function hasAnthropicCache(value: { providerOptions?: { anthropic?: { cacheControl?: { type?: string } } }; content?: unknown }): boolean {
  if (value.providerOptions?.anthropic?.cacheControl?.type === "ephemeral") return true;
  if (!Array.isArray(value.content)) return false;
  return value.content.some((part) => {
    if (!part || typeof part !== "object") return false;
    const options = (part as { providerOptions?: { anthropic?: { cacheControl?: { type?: string } } } }).providerOptions;
    return options?.anthropic?.cacheControl?.type === "ephemeral";
  });
}
