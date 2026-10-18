import { expect, it, vi } from "vitest";
import { z } from "zod";
import { GatewayModelClient } from "@aux/runtime";
import type { ModelCapability } from "@aux/contracts";
import { modelSse, modelStream } from "../fixtures/model-stream.js";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";

const anthropic = "anthropic/claude-sonnet-5.5";
const google = "google/gemini-3.8-flash";
const openai = "openai/gpt-6.1-sol";
const capabilities: ModelCapability[] = [anthropic, google, openai].map((id) => ({
  id,
  provider: id.split("/")[0],
  reasoning: "supported",
  source: "configured",
}));
const modelResult = () => ({
  content: [{ type: "text" as const, text: '{"ok":true}' }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage: {
    inputTokens: { total: 4, noCache: 4, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 2, text: 2, reasoning: 0 },
  },
  warnings: [],
});
const result = () => modelSse(modelResult());
function fixture(models: readonly ModelCapability[] = capabilities) {
  const bodies: {
    reasoning?: string;
    providerOptions: Record<string, Record<string, unknown>>;
    tools?: { inputSchema: unknown }[];
    maxOutputTokens?: number;
  }[] = [];
  const network = vi.fn<typeof fetch>(async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return result();
  });
  const client = new GatewayModelClient("synthetic-never-sent", {
    gatewayFetch: network,
    models: () => models,
  });
  return { client, network, bodies };
}
for (const modelId of [anthropic, google, openai]) {
  it.each(["low", "medium", "high", "xhigh"] as const)(
    "forwards %s shared effort on the actual Gateway wire for " + modelId,
    async (reasoning) => {
      const { client, network, bodies } = fixture();
      const response = await client.generateText({ modelId, prompt: "Synthetic request", reasoning });
      expect(response.text).toBe('{"ok":true}');
      expect(network).toHaveBeenCalledOnce();
      expect(bodies[0]!.reasoning).toBe(reasoning);
      expect(bodies[0]!.providerOptions.gateway).toMatchObject({ caching: "auto", sort: "ttft" });
      expect(bodies[0]!.providerOptions[modelId.split("/")[0]!]).toBeUndefined();
      expect(response).toMatchObject({ inputTokens: 4, cachedInputTokens: 0, outputTokens: 2 });
    },
  );
}
it.each(["structured", "streamed", "tools"] as const)(
  "retains selected effort through the actual %s Gateway preparation",
  async (kind) => {
    const { client, bodies, network } = fixture();
    const opts = {
      modelId: anthropic,
      system: "Synthetic",
      reasoning: "medium" as const,
      maxOutputTokens: 128,
    };
    let actual: unknown, schema: unknown;
    if (kind === "tools") {
      const response = await client.toolCallStep({
        ...opts,
        messages: [{ role: "user", content: "Synthetic" }],
        tools: { lookup: { inputSchema: z.object({ id: z.string() }) } },
      });
      actual = response.toolCalls;
      schema = bodies[0]!.tools![0]!.inputSchema;
    } else {
      const params = { ...opts, prompt: "Synthetic", schema: z.object({ ok: z.boolean() }) };
      const response =
        kind === "structured"
          ? await client.generateStructured(params)
          : await client.streamStructured({ ...params, onText: () => {} });
      actual = response.object;
    }
    expect(actual).toEqual(kind === "tools" ? [] : { ok: true });
    const objectSchema = expect.objectContaining({ type: "object" });
    expect(schema).toEqual(kind === "tools" ? objectSchema : undefined);
    expect(network).toHaveBeenCalledOnce();
    expect(bodies[0]!.reasoning).toBe("medium");
    expect(bodies[0]!.maxOutputTokens).toBe(128);
  },
);
it.each(["none", "unknown"] as const)(
  "does not invent an effort option for a %s-capability model",
  async (kind) => {
    const { client, bodies } = fixture([
      {
        id: anthropic,
        provider: "anthropic",
        source: "configured",
        ...(kind === "none" ? { reasoning: "none" as const } : {}),
      },
    ]);
    await client.generateText({ modelId: anthropic, prompt: "Synthetic", reasoning: "high" });
    expect(bodies[0]).not.toHaveProperty("reasoning");
  },
);
const nativeCases: { modelId: string; native: Record<string, Record<string, unknown>> }[] = [
  { modelId: anthropic, native: { anthropic: { effort: "low", thinking: { type: "adaptive" } } } },
  { modelId: google, native: { google: { thinkingConfig: { thinkingLevel: "low" } } } },
  { modelId: openai, native: { openai: { reasoningEffort: "low" } } },
];
it.each(nativeCases)(
  "preserves explicit provider reasoning and independent Gateway options for $modelId",
  async ({ modelId, native }) => {
    const { client, bodies } = fixture();
    await client.toolCallStep({
      modelId,
      reasoning: "high",
      system: "Synthetic",
      messages: [{ role: "user", content: "Synthetic" }],
      tools: {},
      providerOptions: { ...native, gateway: { sort: "cost", only: ["fixture-provider"] } },
    });
    // The Gateway owns documented native-over-shared precedence; no local native rewrite.
    expect(bodies[0]!.reasoning).toBe("high");
    expect(bodies[0]!.providerOptions).toMatchObject({
      ...native,
      gateway: { caching: "auto", sort: "cost", only: ["fixture-provider"] },
    });
  },
);
it("uses each existing failover candidate's selected effort while preserving attempts", async () => {
  const observed: { model: string | null; reasoning: unknown }[] = [];
  const network = vi.fn<typeof fetch>(async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    observed.push({
      model: new Headers(init?.headers).get("ai-language-model-id"),
      reasoning: body.reasoning,
    });
    return observed.length === 1
      ? new Response(JSON.stringify({ error: { message: "Synthetic capacity" } }), {
          status: 429,
          headers: { "content-type": "application/json" },
        })
      : result();
  });
  const client = new GatewayModelClient("synthetic-never-sent", {
    gatewayFetch: network,
    models: () => capabilities,
    candidatesFor: () => [
      { modelId: anthropic, reasoning: "medium" },
      { modelId: google, reasoning: "low" },
    ],
  });
  const response = await client.generateText({ modelId: anthropic, prompt: "Synthetic" });
  expect(observed).toEqual([
    { model: anthropic, reasoning: "medium" },
    { model: google, reasoning: "low" },
  ]);
  expect(response.resolvedModelId).toBe(google);
  expect(response.retries?.map((attempt) => attempt.modelId)).toEqual([anthropic]);
});
it("keeps the original abort signal and does not fail over an aborted reasoning request", async () => {
  const stop = new AbortController();
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let originalSignal: AbortSignal | null | undefined;
  const network = vi.fn<typeof fetch>(async (_url, init) => {
    expect(JSON.parse(String(init?.body)).reasoning).toBe("medium");
    originalSignal = init?.signal;
    entered();
    return new Promise<Response>((_resolve, reject) => {
      originalSignal!.addEventListener("abort", () => reject(originalSignal!.reason), { once: true });
    });
  });
  const client = new GatewayModelClient("synthetic-never-sent", {
    gatewayFetch: network,
    models: () => capabilities,
    candidatesFor: () => [
      { modelId: anthropic, reasoning: "medium" },
      { modelId: google, reasoning: "low" },
    ],
  });
  const pending = client.generateText({ modelId: anthropic, prompt: "Synthetic", signal: stop.signal });
  const outcome = pending.then(
    () => null,
    (error: unknown) => error,
  );
  await started;
  stop.abort(new Error("Original owner stopped"));
  expect(await outcome).toMatchObject({ message: expect.stringContaining("Original owner stopped") });
  expect(originalSignal?.aborted).toBe(true);
  expect(network).toHaveBeenCalledOnce();
});

it("does not widen shared reasoning to another creator without this adapter's verified mapping", async () => {
  const modelId = "other/fixture";
  const { client, bodies } = fixture([
    { id: modelId, provider: "other", reasoning: "supported", source: "configured" },
  ]);
  await client.generateText({ modelId, prompt: "Synthetic", reasoning: "high" });
  expect(bodies[0]).not.toHaveProperty("reasoning");
});

it("forwards legacy Claude relative effort without synthesizing a native token budget", async () => {
  const modelId = "anthropic/claude-haiku-4.5";
  const { client, bodies } = fixture([
    { id: modelId, provider: "anthropic", reasoning: "supported", source: "configured" },
  ]);
  await client.generateText({ modelId, prompt: "Synthetic", reasoning: "low" });
  expect(bodies[0]!.reasoning).toBe("low");
  expect(bodies[0]!.providerOptions.anthropic).toBeUndefined();
});
it("retains OpenAI session caching and caller namespace keys beside shared xhigh", async () => {
  const { client, bodies } = fixture();
  await client.toolCallStep({
    modelId: openai,
    system: "Synthetic",
    reasoning: "xhigh",
    sessionId: "fixture-session",
    messages: [{ role: "user", content: "Synthetic" }],
    tools: {},
    providerOptions: { openai: { user: "fixture-user" } },
  });
  expect(bodies[0]!.reasoning).toBe("xhigh");
  expect(bodies[0]!.providerOptions.openai).toEqual({
    promptCacheKey: "fixture-session",
    user: "fixture-user",
  });
});
it.each(["openai", "anthropic", "google"] as const)(
  "preserves the direct %s provider's original native reasoning preparation",
  async (provider) => {
    const modelId = capabilities.find((model) => model.provider === provider)!.id;
    const model = new MockLanguageModelV4({ provider, doStream: () => modelStream(modelResult()) });
    const client = new GatewayModelClient("synthetic-direct", {
      model: () => model,
      models: () => capabilities,
    });
    await client.generateText({ modelId, prompt: "Synthetic", reasoning: "xhigh" });
    expect(model.doStreamCalls).toHaveLength(1);
    expect(model.doStreamCalls[0]!.reasoning).toBeUndefined();
    expect(model.doStreamCalls[0]!.providerOptions).toEqual({
      [provider]:
        provider === "openai"
          ? { reasoningEffort: "xhigh", forceReasoning: true }
          : provider === "anthropic"
            ? { effort: "xhigh" }
            : { thinkingConfig: { thinkingLevel: "high" } },
    });
  },
);
