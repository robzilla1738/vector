import type { z } from "zod";

export interface StructuredCallResult<T> {
  object: T;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  providerMetadata?: Record<string, unknown>;
}

export interface TextCallResult {
  text: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

/**
 * The runtime's only dependency on the model SDK. Real implementation talks
 * to Vercel AI Gateway; tests inject MockModelClient — the agent loop itself
 * never imports the SDK.
 */
export interface ModelClient {
  generateStructured<T>(opts: {
    modelId: string;
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<StructuredCallResult<T>>;

  generateText(opts: {
    modelId: string;
    system?: string;
    prompt: string;
    imageDataUrl?: string;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<TextCallResult>;

  listModels(): Promise<{ id: string; name?: string }[]>;
}

/** Static fallback list used until the Gateway catalog is reachable. */
export const FALLBACK_MODELS = [
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
  { id: "openai/gpt-5", name: "GPT-5" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
];
