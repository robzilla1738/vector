import type { createOpenAI } from "@ai-sdk/openai";
import { AuxError, type ModelProvider, type CustomModelProvider } from "@aux/contracts";
import type { ModelCapability } from "@aux/contracts/model-registry";
import { GatewayModelClient } from "./gateway-client.js";

export const DIRECT_PROVIDERS = ["openai", "anthropic", "google", "openrouter", "openai-compatible"] as const;
export const PROVIDER_ENV = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  "openai-compatible": "OPENAI_COMPATIBLE_API_KEY",
} as const;
export const PROVIDER_ENDPOINT = {
  gateway: "https://ai-gateway.vercel.sh",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  openrouter: "https://openrouter.ai/api/v1",
} as const;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Local model servers commonly accept OpenAI requests without authentication. */
export function isLoopbackCompatibleEndpoint(value: string | undefined): boolean {
  if (!value) return false;
  try {
    return LOOPBACK_HOSTS.has(new URL(normalizeCompatibleEndpoint(value)).hostname);
  } catch {
    return false;
  }
}

/** User-entered destinations may use plain HTTP only on the local machine. */
export function normalizeCompatibleEndpoint(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid OpenAI-compatible endpoint URL.");
  }
  if (url.username || url.password || url.search || url.hash)
    throw new Error("The endpoint cannot include credentials, query parameters, or a fragment.");
  if (url.protocol !== "https:" && !(url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname))) {
    throw new Error("Use HTTPS for remote endpoints. Plain HTTP is allowed only for localhost.");
  }
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

export function providerEndpoint(provider: ModelProvider, compatibleEndpoint?: string): string {
  if (provider === "openai-compatible")
    return compatibleEndpoint ? normalizeCompatibleEndpoint(compatibleEndpoint) : "Not configured";
  return PROVIDER_ENDPOINT[provider];
}

type ProviderModel = ReturnType<ReturnType<typeof createOpenAI>["chat"]>;

function memo<T>(load: () => Promise<T>): () => Promise<T> {
  let loaded: Promise<T> | undefined;
  return () => (loaded ??= load());
}

/** Provider SDKs are imported on the first model call, keeping them off the runtime startup path. */
function lazyModel(provider: string, modelId: string, load: () => Promise<ProviderModel>): ProviderModel {
  const model = memo(load);
  return {
    specificationVersion: "v4",
    provider,
    modelId,
    get supportedUrls() {
      return model().then((m) => m.supportedUrls);
    },
    doGenerate: async (options) => (await model()).doGenerate(options),
    doStream: async (options) => (await model()).doStream(options),
  };
}

/** Explicit endpoints prevent unrelated process environment from redirecting keys. */
export function directModelClient(
  provider: Exclude<ModelProvider, "gateway">,
  apiKey: string,
  fetchOverride?: typeof fetch,
  compatibleEndpoint?: string,
  configuration?: Pick<CustomModelProvider, "api" | "authHeader"> & { models: readonly ModelCapability[] },
) {
  const api =
    configuration?.api ??
    (provider === "anthropic"
      ? "anthropic-messages"
      : provider === "google"
        ? "google-generative-ai"
        : provider === "openai"
          ? "openai-responses"
          : "openai-completions");
  const baseURL =
    provider === "openai-compatible"
      ? normalizeCompatibleEndpoint(compatibleEndpoint ?? "")
      : providerEndpoint(provider);
  const family =
    api === "anthropic-messages" ? "anthropic" : api === "google-generative-ai" ? "google" : "openai";
  const network = fetchOverride ?? fetch;
  const base = new URL(baseURL);
  const configuredFetch: typeof fetch | undefined = configuration
    ? async (input, init) => {
        const url = new URL(input instanceof Request ? input.url : String(input));
        if (
          url.origin !== base.origin ||
          !(url.pathname === base.pathname || url.pathname.startsWith(base.pathname.replace(/\/$/, "") + "/"))
        )
          throw new AuxError("permission_denied", "Inference changed its configured provider destination.");
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!configuration.authHeader) {
          headers.delete("authorization");
          headers.delete("x-api-key");
          headers.delete("x-goog-api-key");
        }
        return network(input, { ...init, headers, redirect: "error" });
      }
    : fetchOverride;
  const options = {
    apiKey: configuration?.authHeader === false ? "aux-anonymous" : apiKey,
    baseURL,
    fetch: configuredFetch,
  };
  const models = configuration
    ? () => configuration.models.map((model) => ({ ...model, provider: family }))
    : undefined;
  const toolSchemas = configuration ? ("inline" as const) : ("provider-default" as const);
  const tag = configuration ? family : provider;
  if (api === "openai-completions" || api === "openai-responses") {
    const sdk = memo(async () =>
      (await import("@ai-sdk/openai")).createOpenAI({ ...options, name: provider }),
    );
    return new GatewayModelClient(apiKey, {
      model: (id) =>
        lazyModel(tag, id, async () =>
          api === "openai-completions" ? (await sdk()).chat(id) : (await sdk()).responses(id),
        ),
      models,
      toolSchemas,
    });
  }
  const sdk = memo(async () =>
    api === "anthropic-messages"
      ? (await import("@ai-sdk/anthropic")).createAnthropic(options)
      : (await import("@ai-sdk/google")).createGoogle(options),
  );
  return new GatewayModelClient(apiKey, {
    model: (id) => lazyModel(tag, id, async () => (await sdk())(id)),
    models,
    toolSchemas,
  });
}
