import { afterEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { directModelClient, isLoopbackCompatibleEndpoint, normalizeCompatibleEndpoint } from "@aux/runtime";

afterEach(() => vi.unstubAllEnvs());
const sse = (events: unknown[]) =>
  new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""), {
    headers: { "content-type": "text/event-stream" },
  });
const streamedResponse = (provider: "openai" | "anthropic" | "google", jsonToolName?: string) => {
  const text = '{"ok":true}';
  if (provider === "openai")
    return sse([
      { type: "response.created", response: { id: "resp_fixture", created_at: 1, model: "fixture-model" } },
      { type: "response.output_item.added", output_index: 0, item: { type: "message", id: "msg_fixture" } },
      { type: "response.output_text.delta", item_id: "msg_fixture", output_index: 0, delta: text },
      {
        type: "response.output_item.done",
        output_index: 0,
        item: {
          type: "message",
          id: "msg_fixture",
          role: "assistant",
          content: [{ type: "output_text", text, annotations: [] }],
        },
      },
      {
        type: "response.completed",
        response: {
          incomplete_details: null,
          usage: {
            input_tokens: 4,
            output_tokens: 5,
            input_tokens_details: { cached_tokens: 0 },
            output_tokens_details: { reasoning_tokens: 0 },
          },
        },
      },
    ]);
  if (provider === "anthropic")
    return sse([
      {
        type: "message_start",
        message: {
          id: "msg_fixture",
          role: "assistant",
          model: "fixture-model",
          content: [],
          usage: { input_tokens: 4 },
        },
      },
      {
        type: "content_block_start",
        index: 0,
        content_block: { type: "tool_use", id: "tool_fixture", name: jsonToolName, input: {} },
      },
      { type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: text } },
      { type: "content_block_stop", index: 0 },
      { type: "message_delta", delta: { stop_reason: "tool_use" }, usage: { output_tokens: 5 } },
      { type: "message_stop" },
    ]);
  return sse([
    {
      candidates: [{ content: { role: "model", parts: [{ text }] }, finishReason: "STOP", index: 0 }],
      usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 5, totalTokenCount: 9 },
    },
  ]);
};

for (const provider of ["openai", "anthropic", "google"] as const) {
  it(`${provider} uses only its selected credential/destination and parses structured evidence`, async () => {
    vi.stubEnv("OPENAI_BASE_URL", "https://unrelated.invalid");
    const calls: { url: string; headers: Headers }[] = [];
    const fakeFetch: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), headers: new Headers(init?.headers) });
      const body = JSON.parse(String(init?.body));
      expect(body.stream ?? new URL(String(input)).searchParams.get("alt")).toBe(
        provider === "google" ? "sse" : true,
      );
      expect(body.tool_choice?.type).toBe(provider === "anthropic" ? "any" : undefined);
      expect(body.tools?.map((tool: { name: string }) => tool.name)).toEqual(
        provider === "anthropic" ? ["json"] : undefined,
      );
      return streamedResponse(provider, body.tools?.[0]?.name);
    };
    const model = directModelClient(provider, `synthetic-${provider}`, fakeFetch);
    const result = await model.generateStructured({
      modelId: "fixture-model",
      system: "Return JSON",
      prompt: "Return ok true",
      schema: z.object({ ok: z.boolean() }),
    });
    expect(result.object).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    const request = calls[0]!;
    const expectedHost = {
      openai: "api.openai.com",
      anthropic: "api.anthropic.com",
      google: "generativelanguage.googleapis.com",
    }[provider];
    expect(new URL(request.url).hostname).toBe(expectedHost);
    const header = { openai: "authorization", anthropic: "x-api-key", google: "x-goog-api-key" }[provider];
    expect(request.headers.get(header)).toContain(`synthetic-${provider}`);
    expect(result.inputTokens).toBe(4);
  });
  it(`${provider} does not retry authentication failures or route them through Gateway`, async () => {
    let requests = 0;
    const model = directModelClient(provider, "synthetic-invalid", async () => {
      requests++;
      return new Response(
        JSON.stringify({
          error: { type: "authentication_error", message: "invalid test credential", code: 401 },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
    });
    await expect(model.generateText({ modelId: "fixture-model", prompt: "Test" })).rejects.toThrow();
    expect(requests).toBe(1);
  });
}

it("uses an explicitly validated OpenAI-compatible chat endpoint", async () => {
  const calls: { url: string; headers: Headers }[] = [];
  const fakeFetch: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), headers: new Headers(init?.headers) });
    expect(JSON.parse(String(init?.body)).stream).toBe(true);
    return sse([
      {
        id: "chatcmpl_fixture",
        object: "chat.completion.chunk",
        created: 1,
        model: "fixture-model",
        choices: [{ index: 0, delta: { role: "assistant", content: '{"ok":true}' }, finish_reason: null }],
      },
      {
        id: "chatcmpl_fixture",
        object: "chat.completion.chunk",
        created: 1,
        model: "fixture-model",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        usage: { prompt_tokens: 4, completion_tokens: 5, total_tokens: 9 },
      },
    ]);
  };
  const model = directModelClient(
    "openai-compatible",
    "synthetic-local",
    fakeFetch,
    "http://127.0.0.1:11434/v1/",
  );
  const result = await model.generateStructured({
    modelId: "fixture-model",
    system: "Return JSON",
    prompt: "Return ok true",
    schema: z.object({ ok: z.boolean() }),
  });
  expect(result.object).toEqual({ ok: true });
  expect(calls).toHaveLength(1);
  expect(calls[0]!.url).toBe("http://127.0.0.1:11434/v1/chat/completions");
  expect(calls[0]!.headers.get("authorization")).toBe("Bearer synthetic-local");
});

it("permits local HTTP endpoints and requires HTTPS everywhere else", () => {
  expect(normalizeCompatibleEndpoint(" http://localhost:11434/v1/ ")).toBe("http://localhost:11434/v1");
  expect(normalizeCompatibleEndpoint("https://models.example.test/v1/")).toBe(
    "https://models.example.test/v1",
  );
  expect(() => normalizeCompatibleEndpoint("http://models.example.test/v1")).toThrow("HTTPS");
  expect(() => normalizeCompatibleEndpoint("https://user:secret@models.example.test/v1")).toThrow(
    "credentials",
  );
  expect(() => normalizeCompatibleEndpoint("https://models.example.test/v1?key=secret")).toThrow("query");
  expect(isLoopbackCompatibleEndpoint("http://127.0.0.1:11434/v1")).toBe(true);
  expect(isLoopbackCompatibleEndpoint("http://[::1]:11434/v1")).toBe(true);
  expect(isLoopbackCompatibleEndpoint("https://localhost:1234/v1")).toBe(true);
  expect(isLoopbackCompatibleEndpoint("https://models.example.test/v1")).toBe(false);
  expect(isLoopbackCompatibleEndpoint("invalid")).toBe(false);
});
