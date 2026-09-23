import type { z } from "zod";
import { MODEL_REGISTRY, modelPickerEntries } from "@aux/contracts/model-registry";

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
    /** Explicit image references; never fetched from remote URLs. */
    imageDataUrls?: string[];
    schema: z.ZodType<T>;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<StructuredCallResult<T>>;

  /**
   * Same contract as generateStructured, but the raw completion text is
   * streamed through `onText` as it arrives so the caller can start acting
   * on completed parts (plan steps) before the object is finished. Optional:
   * the coordinator falls back to generateStructured when absent.
   */
  streamStructured?<T>(opts: {
    modelId: string;
    system: string;
    prompt: string;
    /** Explicit image references; never fetched from remote URLs. */
    imageDataUrls?: string[];
    schema: z.ZodType<T>;
    signal?: AbortSignal;
    maxOutputTokens?: number;
    onText: (delta: string) => void;
  }): Promise<StructuredCallResult<T>>;

  generateText(opts: {
    modelId: string;
    system?: string;
    prompt: string;
    /** Explicit image references; never fetched from remote URLs. */
    imageDataUrls?: string[];
    imageDataUrl?: string;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<TextCallResult>;

  listModels(): Promise<{ id: string; name?: string }[]>;
}

/** Static fallback list used until the Gateway catalog is reachable. */
export const DEFAULT_PLANNER_MODEL = "alibaba/qwen3.8-27b";
export const LUNA_FAST_MODEL = "openai/gpt-5.6-luna-fast";
export const FALLBACK_MODELS = modelPickerEntries(MODEL_REGISTRY);

/** `0` means no per-run model-call cap. */
export function modelCallBudget(raw: unknown, fallback = 8): number {
  const n = Number(raw);
  if (n === 0) return 0;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(256, Math.floor(n));
}
