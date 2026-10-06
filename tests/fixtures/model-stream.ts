import type { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";

type Result = Awaited<ReturnType<MockLanguageModelV4["doGenerate"]>>;
type StreamResult = Awaited<ReturnType<MockLanguageModelV4["doStream"]>>;
type Part = StreamResult["stream"] extends ReadableStream<infer T> ? T : never;

/** Fresh, actual V4 protocol parts for deterministic model fixtures. */
export function modelStreamParts(result: Result): Part[] {
  const parts: Part[] = [{ type: "stream-start", warnings: result.warnings }];
  for (const [index, content] of result.content.entries()) {
    const id = `part-${index}`;
    if (content.type === "text" || content.type === "reasoning") {
      const prefix = content.type;
      parts.push(
        { type: `${prefix}-start`, id },
        { type: `${prefix}-delta`, id, delta: content.text },
        { type: `${prefix}-end`, id },
      );
    } else if (content.type === "tool-call") {
      parts.push(
        { type: "tool-input-start", id: content.toolCallId, toolName: content.toolName },
        { type: "tool-input-delta", id: content.toolCallId, delta: content.input },
        { type: "tool-input-end", id: content.toolCallId },
        content,
      );
    } else throw new Error(`Unsupported model fixture content: ${content.type}`);
  }
  parts.push({
    type: "finish",
    finishReason: result.finishReason,
    usage: result.usage,
    providerMetadata: result.providerMetadata,
  });
  return parts;
}
export function modelStream(result: Result): StreamResult {
  return {
    stream: new ReadableStream<Part>({
      start(controller) {
        for (const part of modelStreamParts(result)) controller.enqueue(part);
        controller.close();
      },
    }),
  };
}
export function modelSse(result: Result): Response {
  return new Response(
    modelStreamParts(result)
      .map((part) => `data: ${JSON.stringify(part)}\n\n`)
      .join(""),
    { headers: { "content-type": "text/event-stream" } },
  );
}
