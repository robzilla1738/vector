import type { z } from "zod";
import type { ModelMessage } from "ai";
import { DEFAULT_PLANNER_MODEL_ID, MODEL_REGISTRY, modelPickerEntries, registryCostUsd } from "@aux/contracts/model-registry";

/** Usage of one provider round trip. Every attempt a client makes is reported, including hidden retries. */
export interface ModelAttempt {
  durationMs: number;
  /** Model that actually served this attempt — differs from the request on failover. */
  modelId?: string;
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
  /** Model that produced `object` — the request's model unless failover rerouted. */
  resolvedModelId?: string;
}

export interface TextCallResult extends ModelAttempt {
  text: string;
  retries?: ModelAttempt[];
  resolvedModelId?: string;
}

/** One model round trip in the agent loop (S5): assistant message + client-side tool calls. */
export interface ToolStepToolCall {
  toolCallId: string;
  toolName: string;
  input: unknown;
}

export interface ToolCallStepResult extends ModelAttempt {
  /** Assistant message to append to the transcript verbatim (tool-call parts included). */
  message: ModelMessage;
  toolCalls: ToolStepToolCall[];
  text?: string;
  finishReason?: string;
  /** Tool calls the provider executed in-band; the loop must not re-run them. */
  providerExecuted?: string[];
  /** Earlier billed attempts on failover candidates that failed. */
  retries?: ModelAttempt[];
  /** Model that served this step — the request's model unless failover rerouted. */
  resolvedModelId?: string;
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
    reasoning?: "low" | "medium" | "xhigh";
    /** Bound provider attempts for shared-budget callers; 1 disables corrective retries. */
    maxAttempts?: number;
    /** OpenAI prompt-cache key. Direct Anthropic caching does not use it. */
    sessionId?: string;
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
    reasoning?: "low" | "medium" | "xhigh";
    sessionId?: string;
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
    reasoning?: "low" | "medium" | "xhigh";
    sessionId?: string;
  }): Promise<TextCallResult>;

  /**
   * One step of the v2 tool-call loop (S5): the model sees the durable
   * transcript plus the client-side tool specs and returns either text or
   * tool calls. Tools carry no `execute` — the loop itself dispatches them
   * so side effects are journaled per call and suspensions park durably.
   * Optional: clients without tool support leave it unset and the loop
   * reports capability_unsupported.
   */
  toolCallStep?(opts: {
    modelId: string;
    system: string;
    messages: ModelMessage[];
    tools: Record<string, { description?: string; inputSchema: z.ZodType }>;
    signal?: AbortSignal;
    providerOptions?: Record<string, Record<string, unknown>>;
    maxOutputTokens?: number;
    /** Funded calls reserve one exact provider attempt; suppress route failover. */
    maxAttempts?: 1;
    reasoning?: "low" | "medium" | "xhigh";
    /** Conversation id. Direct OpenAI calls send it as `prompt_cache_key`. */
    sessionId?: string;
  }): Promise<ToolCallStepResult>;

  listModels(): Promise<{ id: string; name?: string; inputUsdPerMTok?: number; outputUsdPerMTok?: number }[]>;
}

/** Static fallback list used until the Gateway catalog is reachable. */
export const DEFAULT_PLANNER_MODEL = DEFAULT_PLANNER_MODEL_ID;
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
