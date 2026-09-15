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
export const DEFAULT_PLANNER_MODEL = "alibaba/qwen3.8-27b";
export const FALLBACK_MODELS = [
  { id: DEFAULT_PLANNER_MODEL, name: "Qwen 3.8 27B" },
];
