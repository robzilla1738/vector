import { expect, it, vi } from "vitest";
import { z } from "zod";
import { zodSchema } from "ai";
import { openDb, TranscriptStore, runAgentLoop } from "@aux/runtime";
import type { ToolCallStepResult } from "../../apps/runtime/src/agent/model-client.js";
import type { LoopToolManifest } from "../../apps/runtime/src/agent/loop/types.js";
import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";
import { directModelClient } from "../../apps/runtime/src/agent/direct-providers.js";
import { prepareToolInputSchema } from "../../apps/runtime/src/agent/tool-input-schema.js";
import { modelSse } from "../fixtures/model-stream.js";

// Original arguments themselves contain `input`: transport decoding happens once.
const original = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("set"), input: z.string().default("default") }),
  z.strictObject({ kind: z.literal("clear") }),
]);
const invalid = [
  { kind: "set", input: "flat but original-valid" },
  { input: { kind: "set", input: "hybrid", other: true } },
  { input: { kind: "set" }, other: true },
  { input: { input: { kind: "set" } } },
  { input: { kind: "clear", input: "wrong branch" } },
];
const usage = {
  inputTokens: { total: 2, noCache: 2, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};
function modelResult(input?: unknown, index = 0) {
  return {
    content:
      input === undefined
        ? [{ type: "text" as const, text: "Finished" }]
        : [
            {
              type: "tool-call" as const,
              toolCallId: `original-${index}`,
              toolName: "operation",
              input: JSON.stringify(input),
            },
          ],
    finishReason: { unified: input === undefined ? ("stop" as const) : ("tool-calls" as const), raw: "stop" },
    usage,
    warnings: [],
  };
}
function assertProviderRoot(schema: Record<string, unknown>) {
  // Actual Anthropic root rejection, in addition to SDK serialization acceptance.
  expect(schema.type).toBe("object");
  for (const key of ["oneOf", "anyOf", "allOf"]) expect(schema).not.toHaveProperty(key);
  expect(schema.properties).toBeDefined();
}
it.each(["inline", "references"] as const)(
  "preserves defaults and rejects malformed wire objects in %s mode",
  async (mode) => {
    const schema = prepareToolInputSchema(original, mode);
    assertProviderRoot(await schema.jsonSchema);
    await expect(schema.validate?.({ input: { kind: "set" } })).resolves.toEqual({
      success: true,
      value: { kind: "set", input: "default" },
    });
    await expect(schema.validate?.({ input: { kind: "clear" } })).resolves.toEqual({
      success: true,
      value: { kind: "clear" },
    });
    for (const input of invalid)
      await expect(schema.validate?.(input)).resolves.toMatchObject({ success: false });
  },
);
it.each([
  {
    kind: "anyOf",
    schema: z.union([z.strictObject({ id: z.string() }), z.strictObject({ count: z.number() })]),
    value: { id: "source" },
  },
  {
    kind: "allOf",
    schema: z.intersection(z.record(z.string(), z.string()), z.object({ id: z.string() })),
    value: { id: "source" },
  },
])(
  "retains original $kind input validation inside the canonical envelope",
  async ({ kind, schema, value }) => {
    expect(await zodSchema(schema).jsonSchema).toHaveProperty(kind);
    const prepared = prepareToolInputSchema(schema);
    assertProviderRoot(await prepared.jsonSchema);
    await expect(prepared.validate?.({ input: value })).resolves.toEqual({ success: true, value });
    await expect(prepared.validate?.({ input: { id: 42, count: "invalid" } })).resolves.toMatchObject({
      success: false,
    });
  },
);
it.each([false, true])(
  "keeps actual Gateway SDK invalid inputs out of execution/preparation and permits original repair (prepared read %s)",
  async (preparedRead) => {
    const db = openDb(":memory:");
    try {
      const transcript = new TranscriptStore(db);
      transcript.append("envelope", [{ role: "user", content: "Use a synthetic operation" }]);
      const wire = [...invalid, { input: { kind: "set" } }];
      const execute = vi.fn(async (_input: unknown) => ({ output: { ok: true } }));
      const prepare = vi.fn(async (input: unknown) => ({ execute: () => execute(input) }));
      const published: Record<string, unknown>[] = [];
      const network = vi.fn<typeof fetch>(async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        published.push(body);
        for (const tool of body.tools) assertProviderRoot(tool.inputSchema);
        const index = published.length - 1;
        return modelSse(modelResult(wire[index], index));
      });
      const client = new GatewayModelClient("synthetic-fixture", {
        gatewayFetch: network,
        models: () => [
          { id: "anthropic/fixture", provider: "anthropic", source: "configured", contextTokens: 200_000 },
        ],
      });
      const tools: LoopToolManifest = {
        operation: {
          description: "Synthetic operation",
          byline: "Fixture",
          inputSchema: original,
          execute,
          ...(preparedRead ? { prepare, independentRead: () => true } : {}),
        },
      };
      const billed = vi.fn(async (_receipt: { step: ToolCallStepResult }) => {});
      const output = await runAgentLoop({
        model: client,
        modelId: "anthropic/fixture",
        runId: "envelope",
        threadId: "thread",
        transcript,
        tools,
        deps: {},
        maxSteps: wire.length + 2,
        onStep: billed,
      });
      expect(output.kind).toBe("done");
      expect(network).toHaveBeenCalledTimes(wire.length + 1);
      expect(billed).toHaveBeenCalledTimes(wire.length + 1);
      for (const [receipt] of billed.mock.calls)
        expect(receipt.step).toMatchObject({ inputTokens: 2, outputTokens: 1, cachedInputTokens: 0 });
      expect(execute).toHaveBeenCalledOnce();
      expect(prepare).toHaveBeenCalledTimes(preparedRead ? 1 : 0);
      const accepted = { kind: "set", input: "default" };
      const acceptedCalls = preparedRead ? prepare.mock.calls : execute.mock.calls;
      expect(acceptedCalls[0]![0]).toEqual(accepted);
      const stored = JSON.stringify(transcript.load("envelope"));
      expect(stored).toContain(JSON.stringify(accepted));
      expect(stored).toContain("failed its original wire schema validation");
      expect(
        billed.mock.calls.slice(0, invalid.length).map(([receipt]) => receipt.step.toolCalls[0]?.invalid),
      ).toEqual(invalid.map(() => true));
      // Continuation receives the validated original arguments in history while
      // this same actual request retains the strict enveloped tool declaration.
      const continuation = published.at(-1)!;
      expect(JSON.stringify(continuation.prompt)).toContain(JSON.stringify(accepted));
      expect(continuation.tools).toEqual(published[0]!.tools);
    } finally {
      db.close();
    }
  },
);

it("decodes a valid enveloped call through the installed Anthropic SDK transport", async () => {
  const network = vi.fn<typeof fetch>(async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    assertProviderRoot(body.tools[0].input_schema);
    const events = [
      [
        "message_start",
        {
          type: "message_start",
          message: {
            id: "fixture-message",
            type: "message",
            role: "assistant",
            content: [],
            model: "fixture",
            stop_reason: null,
            stop_sequence: null,
            usage: { input_tokens: 2, output_tokens: 0 },
          },
        },
      ],
      [
        "content_block_start",
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "tool_use", id: "original-call", name: "operation", input: {} },
        },
      ],
      [
        "content_block_delta",
        {
          type: "content_block_delta",
          index: 0,
          delta: {
            type: "input_json_delta",
            partial_json: JSON.stringify({ input: { kind: "set", input: "supplied" } }),
          },
        },
      ],
      ["content_block_stop", { type: "content_block_stop", index: 0 }],
      [
        "message_delta",
        {
          type: "message_delta",
          delta: { stop_reason: "tool_use", stop_sequence: null },
          usage: { output_tokens: 1 },
        },
      ],
      ["message_stop", { type: "message_stop" }],
    ];
    return new Response(
      events.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join(""),
      { headers: { "content-type": "text/event-stream" } },
    );
  });
  const client = directModelClient("anthropic", "synthetic-fixture", network);
  const step = await client.toolCallStep({
    modelId: "fixture",
    system: "Synthetic fixture",
    messages: [{ role: "user", content: "Use operation" }],
    tools: { operation: { inputSchema: original } },
  });
  expect(step.toolCalls).toEqual([
    { toolCallId: "original-call", toolName: "operation", input: { kind: "set", input: "supplied" } },
  ]);
  expect(JSON.stringify(step.message)).toContain(JSON.stringify({ kind: "set", input: "supplied" }));
});
