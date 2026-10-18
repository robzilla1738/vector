import { expect, it, vi } from "vitest";
import { z } from "zod";
import { zodSchema } from "ai";
import { openDb, TranscriptStore, runAgentLoop } from "@aux/runtime";
import type { RunContextState } from "@aux/contracts";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import { directModelClient } from "../../apps/runtime/src/agent/direct-providers.js";
import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";
import { modelUndispatched } from "../../apps/runtime/src/agent/model-client.js";
import { buildToolManifest } from "../../apps/runtime/src/agent/loop/tools.js";
import { modelTools } from "../../apps/runtime/src/agent/loop/loop.js";
import { prepareToolInputSchema } from "../../apps/runtime/src/agent/tool-input-schema.js";
import { modelStream, modelSse } from "../fixtures/model-stream.js";

const union = z.discriminatedUnion("operation", [
  z.strictObject({ operation: z.literal("read"), id: z.string() }),
  z.strictObject({ operation: z.literal("write"), value: z.string() }),
]);
const request = {
  modelId: "fixture",
  system: "Synthetic fixture",
  messages: [{ role: "user" as const, content: "Inspect schemas" }],
  tools: { operation: { inputSchema: union } },
};
const result = {
  content: [{ type: "text" as const, text: "ok" }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage: {
    inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 1, text: 1, reasoning: 0 },
  },
  warnings: [],
};

it("lowers object-root composition into a strict SDK wire envelope and returns the original validated input", async () => {
  const original = await zodSchema(union).jsonSchema;
  expect(original.type).toBeUndefined();
  const schema = prepareToolInputSchema(union);
  expect(schema.jsonSchema).toEqual({
    $schema: original.$schema,
    type: "object",
    properties: { input: { ...original, $schema: undefined } },
    required: ["input"],
    additionalProperties: false,
  });
  await expect(schema.validate?.({ input: { operation: "read", id: "source" } })).resolves.toEqual({
    success: true,
    value: { operation: "read", id: "source" },
  });
  await expect(
    schema.validate?.({ input: { operation: "read", id: "source", value: "unexpected" } }),
  ).resolves.toMatchObject({ success: false });
  await expect(schema.validate?.({ input: { operation: "delete", id: "source" } })).resolves.toMatchObject({
    success: false,
  });
});

it("uses SDK input semantics, including defaults, rather than Zod output schemas", async () => {
  const input = z.strictObject({ label: z.string().default("default") });
  const prepared = prepareToolInputSchema(input);
  expect(prepared.jsonSchema).toEqual(await zodSchema(input).jsonSchema);
  expect(prepared.jsonSchema).not.toHaveProperty("required");
  await expect(prepared.validate?.({})).resolves.toEqual({ success: true, value: { label: "default" } });
});

it("rejects non-object, unresolved, external and cyclic root alternatives without weakening constraints", () => {
  for (const input of [z.string(), z.array(z.string()), z.union([z.object({}), z.string()])])
    expect(() => prepareToolInputSchema(input)).toThrow("only root objects");
});

it.each(["inline", "references"] as const)(
  "prepares every canonical tool as an object using %s mode with resolvable refs",
  (mode) => {
    for (const tool of Object.values(buildToolManifest())) {
      const schema = prepareToolInputSchema(tool.inputSchema, mode).jsonSchema;
      expect(schema).toMatchObject({ type: "object" });
      for (const key of ["anyOf", "oneOf", "allOf"]) expect(schema).not.toHaveProperty(key);
      for (const match of JSON.stringify(schema).matchAll(/"\$ref":"(#[^"]+)"/g)) {
        let target: unknown = schema;
        for (const part of match[1]!.slice(2).split("/"))
          target = (target as Record<string, unknown>)[part.replaceAll("~1", "/").replaceAll("~0", "~")];
        expect(target).toBeDefined();
      }
    }
  },
);

it.each(["anthropic", "openai-compatible"] as const)(
  "publishes every canonical tool through the installed %s SDK transport with exact accounted schemas",
  async (provider) => {
    let body: Record<string, unknown> | undefined;
    const network = vi.fn<typeof fetch>(async (_input, init) => {
      body = JSON.parse(String(init?.body));
      return Response.json(
        { type: "error", error: { type: "invalid_request_error", message: "Fixture captured request" } },
        { status: 400 },
      );
    });
    const manifest = buildToolManifest();
    const client = directModelClient(
      provider,
      "synthetic-fixture",
      network,
      provider === "openai-compatible" ? "https://fixture.invalid/v1" : undefined,
    );
    const mode = client.toolSchemaMode("fixture");
    const prepared = modelTools(manifest, mode);
    await expect(
      client.toolCallStep({ ...request, toolSchemaMode: mode, tools: prepared.tools }),
    ).rejects.toThrow();
    expect(network).toHaveBeenCalledTimes(1);
    type WireTool = {
      name?: string;
      description?: string;
      input_schema?: unknown;
      function?: { name: string; description?: string; parameters: unknown };
    };
    const tools = body?.tools as WireTool[];
    expect(tools).toHaveLength(Object.keys(manifest).length);
    const projection = tools.map((tool) => ({
      name: tool.function?.name ?? tool.name,
      description: tool.function?.description ?? tool.description,
      schema: tool.function?.parameters ?? tool.input_schema,
    }));
    expect(projection.map((tool) => tool.name)).toEqual(Object.keys(manifest));
    for (const tool of projection) {
      expect(tool.schema).toMatchObject({ type: "object" });
      for (const key of ["anyOf", "oneOf", "allOf"]) expect(tool.schema).not.toHaveProperty(key);
    }
    expect(Buffer.byteLength(JSON.stringify(projection), "utf8")).toBe(prepared.bytes);
    expect(projection).toEqual(
      Object.entries(prepared.tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        schema: prepareToolInputSchema(tool.inputSchema, mode).jsonSchema,
      })),
    );
  },
);

it("separates schema accounting caches by mode and pins one mode across mixed-family failover", async () => {
  const manifest = buildToolManifest();
  const inline = modelTools(manifest, "inline");
  const references = modelTools(manifest, "references");
  expect(modelTools(manifest, "inline")).toBe(inline);
  expect(modelTools(manifest, "references")).toBe(references);
  expect(references.bytes).toBeLessThan(inline.bytes);
  const first = new MockLanguageModelV4({
    provider: "anthropic",
    doStream: () => {
      throw Object.assign(new Error("retry"), { statusCode: 503, isRetryable: true });
    },
  });
  const fallback = new MockLanguageModelV4({
    provider: "openai-compatible",
    doStream: () => modelStream(result),
  });
  const client = new GatewayModelClient("fixture", {
    model: (id) => (id === "first" ? first : fallback),
    candidatesFor: () => [
      { modelId: "first", reasoning: "medium" },
      { modelId: "fallback", reasoning: "medium" },
    ],
  });
  expect(client.toolSchemaMode("first")).toBe("inline");
  expect(client.toolSchemaMode("first", 1)).toBe("references");
  await client.toolCallStep({ ...request, modelId: "first", toolSchemaMode: "inline" });
  expect(first.doStreamCalls).toHaveLength(1);
  expect(fallback.doStreamCalls).toHaveLength(1);
  expect(
    first.doStreamCalls[0]!.tools?.map(({ name, inputSchema }: { name: string; inputSchema: unknown }) => ({
      name,
      inputSchema,
    })),
  ).toEqual(
    fallback.doStreamCalls[0]!.tools?.map(
      ({ name, inputSchema }: { name: string; inputSchema: unknown }) => ({ name, inputSchema }),
    ),
  );
});

it("rejects a stale referenced schema mode and unsupported root before any model dispatch", async () => {
  const original = new MockLanguageModelV4({ provider: "anthropic", doStream: () => modelStream(result) });
  const model = new MockLanguageModelV4({
    provider: "openai-compatible",
    doStream: () => modelStream(result),
  });
  let current = original;
  const client = new GatewayModelClient("fixture", { model: () => current });
  const mode = client.toolSchemaMode("fixture");
  expect(mode).toBe("references");
  current = model;
  for (const call of [
    { ...request, toolSchemaMode: mode },
    { ...request, tools: { invalid: { inputSchema: z.string() } } },
  ]) {
    const error = await client.toolCallStep(call).catch((error: unknown) => error);
    expect(modelUndispatched(error)).toBe(true);
  }
  expect(model.doStreamCalls).toHaveLength(0);
});

it.each([true, false])(
  "retains the exact dispatched schema bytes in context state (descriptor %s)",
  async (descriptor) => {
    const db = openDb(":memory:");
    try {
      const transcript = new TranscriptStore(db);
      transcript.append("schema-run", [{ role: "user", content: "Inspect synthetic page" }]);
      const provider = new MockLanguageModelV4({
        provider: "anthropic",
        doStream: () => modelStream(result),
      });
      const client = new GatewayModelClient("fixture", { model: () => provider });
      let state: RunContextState | undefined;
      const completion = await runAgentLoop({
        model: descriptor ? client : { toolCallStep: (options) => client.toolCallStep(options) },
        modelId: "fixture",
        runId: "schema-run",
        threadId: "schema-thread",
        transcript,
        tools: {
          act: buildToolManifest().act!,
          operation: {
            description: "Synthetic union",
            byline: "Fixture",
            inputSchema: union,
            execute: async () => ({ output: {} }),
          },
        },
        deps: {},
        contextTokens: 128_000,
        maxOutputTokens: 1000,
        contextOwner: {
          control: {},
          read: () => state,
          publish: (next) => {
            state = next;
          },
          authority: () => "original",
          check: () => {},
        },
      });
      expect(completion.kind).toBe("done");
      expect(provider.doStreamCalls).toHaveLength(1);
      const projection = provider.doStreamCalls[0]!.tools!.map(
        (tool: { name: string; description?: string; inputSchema: unknown }) => ({
          name: tool.name,
          description: tool.description,
          schema: tool.inputSchema,
        }),
      );
      expect(state?.toolsBytes).toBe(Buffer.byteLength(JSON.stringify(projection), "utf8"));
      expect(JSON.stringify(projection).includes('"$ref":')).toBe(descriptor);
    } finally {
      db.close();
    }
  },
);

it("publishes the exact prepared schema projection through the real Gateway SDK transport", async () => {
  let body: Record<string, unknown> | undefined;
  const network = vi.fn<typeof fetch>(async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return modelSse({
      ...result,
      content: [
        {
          type: "tool-call",
          toolCallId: "canonical-inspect",
          toolName: "connector_file_upload",
          input: JSON.stringify({
            input: { action: "inspect", transferId: "663db240-0c5f-4a2a-b7ce-ef4aebcfe718" },
          }),
        },
      ],
      finishReason: { unified: "tool-calls", raw: "tool_use" },
    });
  });
  const client = new GatewayModelClient("synthetic-fixture", {
    gatewayFetch: network,
    models: () => [
      { id: "anthropic/fixture", provider: "anthropic", source: "configured", contextTokens: 200_000 },
    ],
  });
  const mode = client.toolSchemaMode("anthropic/fixture");
  const manifest = buildToolManifest();
  const prepared = modelTools(manifest, mode);
  const step = await client.toolCallStep({
    ...request,
    modelId: "anthropic/fixture",
    toolSchemaMode: mode,
    tools: prepared.tools,
  });
  expect(step.toolCalls).toEqual([
    {
      toolCallId: "canonical-inspect",
      toolName: "connector_file_upload",
      input: { action: "inspect", transferId: "663db240-0c5f-4a2a-b7ce-ef4aebcfe718" },
    },
  ]);
  expect(network).toHaveBeenCalledTimes(1);
  expect(mode).toBe("references");
  expect(body).toBeDefined();
  const projection = (body!.tools as Array<{ name: string; description?: string; inputSchema: unknown }>).map(
    (tool) => ({
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    }),
  );
  expect(projection).toHaveLength(Object.keys(manifest).length);
  expect(projection.every((tool) => (tool.schema as { type?: string }).type === "object")).toBe(true);
  for (const tool of projection)
    for (const key of ["anyOf", "oneOf", "allOf"]) expect(tool.schema).not.toHaveProperty(key);
  expect(Buffer.byteLength(JSON.stringify(projection), "utf8")).toBe(prepared.bytes);
});
