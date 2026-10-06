import type { LanguageModel } from "ai";
import { AuxError } from "@aux/contracts";
import type { ModelCapability } from "@aux/contracts/model-registry";
import { GatewayModelClient } from "./gateway-client.js";
import { chatgptBillingReceipt, attemptsOf, type ModelClient, type ModelAttempt } from "./model-client.js";
import type { z } from "zod";
import { CHATGPT_RESOURCE, type ChatgptAccounts } from "../services/chatgpt-account.js";

const unsupported = new Set([
  "background",
  "conversation",
  "max_output_tokens",
  "max_tool_calls",
  "metadata",
  "moderation",
  "multi_agent",
  "prompt",
  "prompt_cache_retention",
  "safety_identifier",
  "temperature",
  "top_logprobs",
  "top_p",
  "truncation",
  "user",
  "previous_response_id",
]);

/** Subscription requests use their own documented wire shape; API-key requests are unaffected. */
export function chatgptRequest(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new AuxError("invalid_params", "Invalid ChatGPT request.");
  const value = { ...body } as Record<string, unknown>;
  for (const key of unsupported) delete value[key];
  if (typeof value.model !== "string" || !Array.isArray(value.input))
    throw new AuxError("invalid_params", "ChatGPT requires an account model and explicit input history.");
  value.input = value.input.map((item) => {
    if (item && typeof item === "object" && "role" in item && item.role === "system")
      return { ...item, role: "developer" };
    return item;
  });
  if (Array.isArray(value.tools))
    for (const tool of value.tools) {
      if (
        !tool ||
        typeof tool !== "object" ||
        !("type" in tool) ||
        !["namespace", "web_search", "web_search_preview"].includes(String(tool.type))
      )
        throw new AuxError(
          "capability_unsupported",
          "This hosted tool is unavailable through ChatGPT plan usage.",
        );
    }
  value.store = false;
  value.stream = true;
  return value;
}

/** Completion is a provider receipt, never inferred from an EOF after useful text. */
export function chatgptCompletionStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let pending = "",
    completed = false;
  function event(text: string) {
    const data = text
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data || data === "[DONE]") return;
    let value: unknown;
    try {
      value = JSON.parse(data);
    } catch {
      throw new AuxError("backend_unavailable", "ChatGPT returned an invalid stream event.");
    }
    if (value && typeof value === "object" && "type" in value) {
      if (value.type === "response.completed") completed = true;
      if (value.type === "response.incomplete")
        throw new AuxError("backend_unavailable", "ChatGPT returned an incomplete response.");
    }
  }
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        pending += decoder.decode(chunk, { stream: true });
        if (pending.length > 1_048_576)
          throw new AuxError("backend_unavailable", "ChatGPT stream event exceeds its limit.");
        for (;;) {
          const match = /\r?\n\r?\n/.exec(pending);
          if (!match) break;
          event(pending.slice(0, match.index));
          pending = pending.slice(match.index + match[0].length);
        }
        controller.enqueue(chunk);
      },
      flush() {
        pending += decoder.decode();
        if (pending.trim()) event(pending);
        if (!completed)
          throw new AuxError("backend_unavailable", "ChatGPT stream ended without a completed response.");
      },
    }),
  );
}

export function chatgptModelClient(
  accounts: ChatgptAccounts,
  accountId: string,
  models: () => readonly ModelCapability[],
  ensureModels: (signal?: AbortSignal) => Promise<void>,
  assertCurrent: () => void,
  networkFetch: typeof fetch = fetch,
) {
  const transport: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (
      url.href !== `${CHATGPT_RESOURCE}/responses` ||
      init?.method !== "POST" ||
      typeof init.body !== "string"
    )
      throw new AuxError("permission_denied", "ChatGPT inference requires the public Responses endpoint.");
    assertCurrent();
    await ensureModels(init.signal ?? undefined);
    assertCurrent();
    const body = chatgptRequest(JSON.parse(init.body));
    if (!models().some((model) => model.id === body.model))
      throw new AuxError("permission_denied", "Choose a model advertised for this ChatGPT account.");
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${await accounts.accessToken(accountId, init.signal ?? undefined)}`);
    assertCurrent();
    const response = await networkFetch(url, {
      ...init,
      redirect: "error",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok || !response.body) return response;
    return new Response(chatgptCompletionStream(response.body), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
  let sdk: Promise<ReturnType<typeof import("@ai-sdk/openai").createOpenAI>> | undefined;
  const load = () =>
    (sdk ??= import("@ai-sdk/openai").then((module) =>
      module.createOpenAI({
        apiKey: "aux-subscription-transport",
        baseURL: CHATGPT_RESOURCE,
        fetch: transport,
      }),
    ));
  const model = (id: string): LanguageModel => ({
    specificationVersion: "v4",
    provider: "openai.chatgpt",
    modelId: id,
    get supportedUrls() {
      return load().then((provider) => provider.responses(id).supportedUrls);
    },
    doGenerate: async () => {
      throw new AuxError("capability_unsupported", "ChatGPT plan usage requires streamed Responses.");
    },
    doStream: async (options) => {
      const provider = await load();
      return provider.responses(id).doStream({
        ...options,
        providerOptions: {
          ...options.providerOptions,
          openai: { ...options.providerOptions?.openai, store: false, systemMessageMode: "developer" },
        },
        tools: options.tools?.map((tool) =>
          tool.type === "function"
            ? {
                ...tool,
                providerOptions: {
                  ...tool.providerOptions,
                  openai: {
                    ...tool.providerOptions?.openai,
                    namespace: {
                      name: "aux",
                      description: "Aux tools executed under the original user's permissions.",
                    },
                  },
                },
              }
            : tool,
        ),
      });
    },
  });
  const client = new GatewayModelClient("aux-subscription-transport", { model, models });
  async function receipt<T extends ModelAttempt & { retries?: ModelAttempt[] }>(
    work: Promise<T>,
  ): Promise<T> {
    try {
      return chatgptBillingReceipt(await work);
    } catch (error) {
      for (const attempt of attemptsOf(error)) chatgptBillingReceipt(attempt);
      throw error;
    }
  }
  return {
    generateStructured: <T>(
      options: Parameters<ModelClient["generateStructured"]>[0] & { schema: z.ZodType<T> },
    ) => receipt(client.generateStructured<T>(options)),
    streamStructured: <T>(
      options: Parameters<NonNullable<ModelClient["streamStructured"]>>[0] & { schema: z.ZodType<T> },
    ) => receipt(client.streamStructured<T>(options)),
    generateText: (options) => receipt(client.generateText(options)),
    toolCallStep: (options) => receipt(client.toolCallStep(options)),
    listModels: async () => models().map(({ id, name }) => ({ id, ...(name ? { name } : {}) })),
  } satisfies ModelClient;
}

