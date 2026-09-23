import type { z } from "zod";
import { MODEL_REGISTRY, modelPickerEntries, registryCostUsd } from "@aux/contracts/model-registry";

/** Usage of one provider round trip. Every attempt a client makes is reported, including hidden retries. */
export interface ModelAttempt {
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;
  providerMetadata?: Record<string, unknown>;
  /** set when this attempt's output was unusable and the client retried */
  error?: string;
}

export interface StructuredCallResult<T> extends ModelAttempt {
  object: T;
  /** earlier attempts inside this call that failed to parse; each is a billed model call */
  retries?: ModelAttempt[];
}

export interface TextCallResult extends ModelAttempt {
  text: string;
}

const ATTEMPTS = Symbol.for("aux.modelAttempts");

/** Carry billed attempts on an error so a failed call still records its usage. */
export function withAttempts<E>(error: E, attempts: ModelAttempt[]): E {
  if (error && typeof error === "object" && attempts.length) {
    const prior = (error as Record<symbol, ModelAttempt[] | undefined>)[ATTEMPTS] ?? [];
    Object.defineProperty(error, ATTEMPTS, { value: [...attempts, ...prior], configurable: true });
  }
  return error;
}

export function attemptsOf(error: unknown): ModelAttempt[] {
  return (error && typeof error === "object" ? (error as Record<symbol, ModelAttempt[] | undefined>)[ATTEMPTS] : undefined) ?? [];
}

/** Normalize SDK usage (v7 inputTokenDetails, older cachedInputTokens) into attempt fields. */
export function usageFields(usage: unknown): Pick<ModelAttempt, "inputTokens" | "outputTokens" | "cachedInputTokens"> {
  const u = (usage ?? {}) as { inputTokens?: number; outputTokens?: number; cachedInputTokens?: number; inputTokenDetails?: { cacheReadTokens?: number } };
  const cached = u.inputTokenDetails?.cacheReadTokens ?? u.cachedInputTokens;
  return { inputTokens: u.inputTokens, outputTokens: u.outputTokens, ...(cached ? { cachedInputTokens: cached } : {}) };
}

/** Gateway-reported cost (providerMetadata.gateway.cost) wins; registry pricing is an estimate. */
export function modelCallCost(
  modelId: string,
  c: { inputTokens?: number; outputTokens?: number; providerMetadata?: Record<string, unknown> },
): { costUsd?: number; costEstimated?: boolean } {
  const gateway = c.providerMetadata?.gateway as { cost?: unknown; marketCost?: unknown } | undefined;
  for (const raw of [gateway?.cost, gateway?.marketCost]) {
    const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
    if (Number.isFinite(n) && n >= 0) return { costUsd: n, costEstimated: false };
  }
  const estimate = c.inputTokens !== undefined || c.outputTokens !== undefined ? registryCostUsd(modelId, c) : undefined;
  return estimate === undefined ? {} : { costUsd: estimate, costEstimated: true };
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

/** Product default per-turn model-call budget, shared by settings and the coordinator. */
export const DEFAULT_MAX_MODEL_CALLS = 16;

/** `0` means no per-run model-call cap. */
export function modelCallBudget(raw: unknown, fallback = DEFAULT_MAX_MODEL_CALLS): number {
  const n = Number(raw);
  if (n === 0) return 0;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(256, Math.floor(n));
}
