import { modelStream } from "../fixtures/model-stream.js";
import { expect, it } from "vitest";
import { z } from "zod";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import { GatewayModelClient, imageReferenceMessage } from "../../apps/runtime/src/agent/gateway-client.js";

const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
const usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 3, text: 3, reasoning: 0 },
};
const response = (text: string) => ({
  content: [{ type: "text" as const, text }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage,
  warnings: [],
});

it("retains image references in structured output and JSON repair calls", async () => {
  const model = new MockLanguageModelV4({
    doStream: [modelStream(response("not json")), modelStream(response('{"ok":true}'))],
  });
  const client = new GatewayModelClient("local-test", { model: () => model });
  const schema = z.discriminatedUnion("ok", [
    z.object({ ok: z.literal(true) }),
    z.object({ ok: z.literal(false) }),
  ]);
  expect(
    (
      await client.generateStructured({
        modelId: "test",
        system: "Read the image",
        prompt: "Is the image visible?",
        imageDataUrls: [image],
        schema,
      })
    ).object,
  ).toEqual({ ok: true });
  expect(model.doStreamCalls).toHaveLength(2);
  for (const call of model.doStreamCalls) {
    const user = call.prompt.find((message: { role: string; content: unknown }) => message.role === "user")!;
    expect(user.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "file", mediaType: "image/png" })]),
    );
  }
});

it("retains image references through streamed-output repair", async () => {
  const model = new MockLanguageModelV4({
    doStream: [modelStream(response("invalid")), modelStream(response('{"ok":true}'))],
  });
  const client = new GatewayModelClient("local-test", { model: () => model });
  await client.streamStructured({
    modelId: "test",
    system: "Inspect",
    prompt: "Describe",
    imageDataUrls: [image],
    schema: z.object({ ok: z.boolean() }),
    onText: () => {},
  });
  for (const call of model.doStreamCalls)
    expect(
      call.prompt.find((message: { role: string; content: unknown }) => message.role === "user")!.content,
    ).toEqual(expect.arrayContaining([expect.objectContaining({ type: "file", mediaType: "image/png" })]));
  expect(model.doStreamCalls).toHaveLength(2);
});

it("rejects remote or unsupported image inputs instead of silently sending text only", async () => {
  expect(() => imageReferenceMessage("Inspect", ["https://example.com/image.png"])).toThrow("snapshots");
  expect(() => imageReferenceMessage("Inspect", ["data:image/svg+xml;base64,AAAA"])).toThrow("snapshots");
  expect(() => imageReferenceMessage("Inspect", Array(6).fill(image))).toThrow("five");
  const model = new MockLanguageModelV4({
    doStream: () => {
      throw new Error("Invalid image must not dispatch");
    },
  });
  const client = new GatewayModelClient("local-test", { model: () => model });
  await expect(
    client.generateStructured({
      modelId: "alibaba/qwen3.8-27b",
      system: "Inspect",
      prompt: "Describe",
      imageDataUrls: ["https://example.com/image.png"],
      schema: z.object({ ok: z.boolean() }),
    }),
  ).rejects.toMatchObject({ code: "invalid_params" });
  const textOnly = new GatewayModelClient("local-test", {
    model: () => model,
    models: () => [{ id: "fixture/text-only", modalities: ["text"], source: "configured" }],
  });
  await expect(
    textOnly.generateStructured({
      modelId: "fixture/text-only",
      system: "Inspect",
      prompt: "Describe",
      imageDataUrls: [image],
      schema: z.object({ ok: z.boolean() }),
    }),
  ).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(model.doStreamCalls).toHaveLength(0);
});
