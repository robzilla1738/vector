import type { CopilotSession } from "@github/copilot-sdk";
import type { LanguageModel } from "ai";
import type { z } from "zod";
import { AuxError } from "@aux/contracts";
import type { ModelCapability } from "@aux/contracts/model-registry";
import { GatewayModelClient } from "./gateway-client.js";
import {
  attemptsOf,
  withAttempts,
  copilotBillingReceipt,
  type ModelClient,
  type ModelAttempt,
  type ModelCallSource,
} from "./model-client.js";

type Endpoint = Awaited<ReturnType<CopilotSession["rpc"]["provider"]["getEndpoint"]>>;
export interface CopilotInference {
  inference<T>(
    accountId: string,
    source: ModelCallSource,
    modelId: string,
    signal: AbortSignal,
    use: (session: CopilotSession, current: () => Promise<void>, signal: AbortSignal) => Promise<T>,
  ): Promise<T>;
}

function validateEndpoint(endpoint: Endpoint, modelId: string): URL {
  const url = new URL(endpoint.baseUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
    throw new AuxError("permission_denied", "Copilot returned an invalid HTTPS inference endpoint.");
  if (
    endpoint.transport !== "http" ||
    (endpoint.type !== "openai" && endpoint.type !== "anthropic") ||
    (endpoint.type === "openai" && endpoint.wireApi !== "responses" && endpoint.wireApi !== "completions")
  )
    throw new AuxError(
      "capability_unsupported",
      "This Copilot endpoint does not expose a supported HTTP wire API.",
    );
  if (endpoint.sessionToken?.model && endpoint.sessionToken.model !== modelId)
    throw new AuxError("permission_denied", "Copilot returned a token for another model.");
  if (
    endpoint.sessionToken?.expiresAt &&
    (!Number.isFinite(Date.parse(endpoint.sessionToken.expiresAt)) ||
      Date.parse(endpoint.sessionToken.expiresAt) <= Date.now())
  )
    throw new AuxError("cancelled", "The Copilot endpoint token has expired.");
  // The SDK's endpoint is authoritative, but no endpoint may override HTTP framing or routing.
  for (const [key, value] of Object.entries(endpoint.headers)) {
    if (
      /^(host|connection|content-length|transfer-encoding|proxy-.*)$/i.test(key) ||
      (value !== undefined && (value.length > 16384 || /[\r\n]/.test(value)))
    )
      throw new AuxError("permission_denied", "Copilot returned an invalid inference header.");
  }
  if (endpoint.sessionToken) {
    if (/^(host|connection|content-length|transfer-encoding|proxy-.*)$/i.test(endpoint.sessionToken.header))
      throw new AuxError("permission_denied", "Copilot returned an invalid token header.");
    new Headers({
      [endpoint.sessionToken.header]: endpoint.sessionToken.token,
    });
  }
  return url;
}

/** Genuine account endpoint; SDK sessions never execute Aux tools or receive user turns. */
export function copilotModelClient(
  service: CopilotInference,
  accountId: string,
  models: () => readonly ModelCapability[],
  authorizeEndpoint: (source: ModelCallSource, destination: string) => Promise<void>,
  networkFetch: typeof fetch = fetch,
): ModelClient {
  async function call<T extends ModelAttempt & { retries?: ModelAttempt[] }>(
    options: {
      modelId: string;
      source?: ModelCallSource;
      signal?: AbortSignal;
    },
    use: (client: GatewayModelClient, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const source = options.source;
    if (!source)
      throw new AuxError("needs_input", "Copilot inference needs the original live run and browser window.");
    await source.checkOriginal();
    const signal = options.signal ?? new AbortController().signal;
    let completed: T | undefined;
    try {
      return copilotBillingReceipt(
        await service.inference(
          accountId,
          source,
          options.modelId,
          signal,
          async (session, current, originalSignal) => {
            await current();
            const initial = await session.rpc.provider.getEndpoint({
              modelId: options.modelId,
            });
            await current();
            const base = validateEndpoint(initial, options.modelId);
            await authorizeEndpoint(source, base.origin);
            await current();
            const transport: typeof fetch = async (input, init) => {
              await current();
              const url = new URL(input instanceof Request ? input.url : String(input));
              if (
                url.origin !== base.origin ||
                !url.pathname.startsWith(base.pathname.replace(/\/$/, "") + "/") ||
                init?.method !== "POST"
              )
                throw new AuxError(
                  "permission_denied",
                  "Copilot inference changed its admitted destination.",
                );
              // Refresh through this exact session before dispatch, never retry an already billed HTTP attempt here.
              const latest = await session.rpc.provider.getEndpoint({
                modelId: options.modelId,
              });
              await current();
              if (
                validateEndpoint(latest, options.modelId).href !== base.href ||
                latest.type !== initial.type ||
                latest.wireApi !== initial.wireApi
              )
                throw new AuxError("cancelled", "The original Copilot endpoint changed.");
              await authorizeEndpoint(source, base.origin);
              await current();
              const headers = new Headers(init.headers);
              headers.delete("authorization");
              headers.delete("x-api-key");
              for (const key of Object.keys(initial.headers)) headers.delete(key);
              for (const [key, value] of Object.entries(latest.headers))
                if (value !== undefined) headers.set(key, value);
              if (latest.sessionToken) headers.set(latest.sessionToken.header, latest.sessionToken.token);
              if (latest.apiKey)
                headers.set(
                  initial.type === "anthropic" ? "x-api-key" : "authorization",
                  initial.type === "anthropic" ? latest.apiKey : `Bearer ${latest.apiKey}`,
                );
              const response = await networkFetch(url, {
                ...init,
                headers,
                redirect: "error",
                signal: AbortSignal.any([originalSignal, ...(init?.signal ? [init.signal] : [])]),
              });
              await current();
              if (!response.body) return response;
              const body = response.body.pipeThrough(
                new TransformStream<Uint8Array, Uint8Array>({
                  async transform(chunk, controller) {
                    await current();
                    controller.enqueue(chunk);
                  },
                  async flush() {
                    await current();
                  },
                }),
              );
              return new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              });
            };
            let model: LanguageModel;
            if (initial.type === "anthropic") {
              const { createAnthropic } = await import("@ai-sdk/anthropic");
              model = createAnthropic({
                apiKey: initial.apiKey ?? "aux-endpoint-transport",
                baseURL: initial.baseUrl,
                fetch: transport,
              })(options.modelId);
            } else {
              const { createOpenAI } = await import("@ai-sdk/openai");
              const provider = createOpenAI({
                apiKey: initial.apiKey ?? "aux-endpoint-transport",
                baseURL: initial.baseUrl,
                fetch: transport,
              });
              model =
                initial.wireApi === "responses"
                  ? provider.responses(options.modelId)
                  : provider.chat(options.modelId);
            }
            await current();
            const client = new GatewayModelClient("aux-endpoint-transport", {
              model: (id) => {
                if (id !== options.modelId)
                  throw new AuxError(
                    "permission_denied",
                    "Copilot model changed within its original session.",
                  );
                return model;
              },
              models,
            });
            completed = copilotBillingReceipt(await use(client, originalSignal));
            return completed;
          },
        ),
      );
    } catch (error) {
      if (completed) withAttempts(error, [...(completed.retries ?? []), completed]);
      for (const attempt of attemptsOf(error)) copilotBillingReceipt(attempt);
      throw error;
    }
  }
  return {
    generateStructured: <T>(
      options: Parameters<ModelClient["generateStructured"]>[0] & {
        schema: z.ZodType<T>;
      },
    ) =>
      call(options, (client, signal) => client.generateStructured<T>({ ...options, signal, maxAttempts: 1 })),
    streamStructured: <T>(
      options: Parameters<NonNullable<ModelClient["streamStructured"]>>[0] & {
        schema: z.ZodType<T>;
      },
    ) =>
      call(options, (client, signal) => client.streamStructured<T>({ ...options, signal, maxAttempts: 1 })),
    generateText: (options) =>
      call(options, (client, signal) => client.generateText({ ...options, signal, maxAttempts: 1 })),
    toolCallStep: (options) =>
      call(options, (client, signal) => client.toolCallStep({ ...options, signal, maxAttempts: 1 })),
    listModels: async () => models().map(({ id, name }) => ({ id, name })),
  };
}
