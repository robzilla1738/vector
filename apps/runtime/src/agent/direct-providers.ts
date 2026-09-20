import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";
import type { ModelProvider } from "@vector/contracts";
import { GatewayModelClient } from "./gateway-client.js";

export const DIRECT_PROVIDERS = ["openai", "anthropic", "google", "openai-compatible"] as const;
export const PROVIDER_ENV = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  "openai-compatible": "OPENAI_COMPATIBLE_API_KEY",
} as const;
export const PROVIDER_ENDPOINT = { gateway: "https://ai-gateway.vercel.sh", openai: "https://api.openai.com/v1", anthropic: "https://api.anthropic.com/v1", google: "https://generativelanguage.googleapis.com/v1beta" } as const;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Local model servers commonly accept OpenAI requests without authentication. */
export function isLoopbackCompatibleEndpoint(value: string | undefined): boolean {
  if (!value) return false;
  try { return LOOPBACK_HOSTS.has(new URL(normalizeCompatibleEndpoint(value)).hostname); }
  catch { return false; }
}

/** User-entered destinations may use plain HTTP only on the local machine. */
export function normalizeCompatibleEndpoint(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); }
  catch { throw new Error("Enter a valid OpenAI-compatible endpoint URL."); }
  if (url.username || url.password || url.search || url.hash) throw new Error("The endpoint cannot include credentials, query parameters, or a fragment.");
  if (url.protocol !== "https:" && !(url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname))) {
    throw new Error("Use HTTPS for remote endpoints. Plain HTTP is allowed only for localhost.");
  }
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

export function providerEndpoint(provider: ModelProvider, compatibleEndpoint?: string): string {
  if (provider === "openai-compatible") return compatibleEndpoint ? normalizeCompatibleEndpoint(compatibleEndpoint) : "Not configured";
  return PROVIDER_ENDPOINT[provider];
}

/** Explicit endpoints prevent unrelated process environment from redirecting keys. */
export function directModelClient(provider: Exclude<ModelProvider, "gateway">, apiKey: string, fetchOverride?: typeof fetch, compatibleEndpoint?: string) {
  if (provider === "openai-compatible") {
    const model = createOpenAI({ apiKey, baseURL: normalizeCompatibleEndpoint(compatibleEndpoint ?? ""), fetch: fetchOverride, name: "openai-compatible" });
    return new GatewayModelClient(apiKey, { model: id => model.chat(id) });
  }
  const options = { apiKey, baseURL: PROVIDER_ENDPOINT[provider], fetch: fetchOverride };
  const model = provider === "openai" ? createOpenAI(options) : provider === "anthropic" ? createAnthropic(options) : createGoogle(options);
  return new GatewayModelClient(apiKey, { model: id => model(id) });
}
