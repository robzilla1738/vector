import type { LanguageModel, ModelMessage } from "ai";
import type { createGateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import {
  clampOutputTokens,
  MODEL_REGISTRY,
  modelAcceptsImages,
  modelCapabilities,
  type AgentModelRoute,
  type ModelCapability,
} from "@aux/contracts/model-registry";
import { extractJson } from "./json-text.js";
import {
  attemptsOf,
  modelCallCost,
  usageFields,
  withAttempts,
  type ModelAttempt,
  type ModelClient,
  type StructuredCallResult,
  type TextCallResult,
  type ToolCallStepResult,
} from "./model-client.js";
import { estimatedPromptTokens, projectedModelCostUsd, SpendLedger } from "../store/spend-ledger.js";
import {
  ANTHROPIC_CACHE_CONTROL,
  anthropicCachedHistory,
  openAiSessionCache,
  stampAnthropicCache,
} from "./prompt-cache.js";

/** Stop only when the model stream has made no progress for one minute. */
export const DEFAULT_MODEL_STREAM_IDLE_TIMEOUT_MS = 60_000;

async function withStreamIdle<T>(
  signal: AbortSignal | undefined,
  idleMs: number,
  call: (signal: AbortSignal, progress: () => void) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const progress = () => {
    if (disposed) return;
    clearTimeout(timer);
    timer = setTimeout(
      () => controller.abort(new DOMException("Model stream stopped responding", "TimeoutError")),
      idleMs,
    );
    timer.unref();
  };
  let rejectAbort!: (reason: unknown) => void;
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const onAbort = () => rejectAbort(combined.reason);
  combined.addEventListener("abort", onAbort, { once: true });
  progress();
  try {
    if (combined.aborted) throw combined.reason;
    return await Promise.race([call(combined, progress), aborted]);
  } finally {
    disposed = true;
    clearTimeout(timer);
    combined.removeEventListener("abort", onAbort);
  }
}

async function consumeModelStream(
  stream: AsyncIterable<{ type: string; error?: unknown; text?: string; delta?: string }>,
  signal: AbortSignal,
  progress: () => void,
  onText?: (text: string) => void,
): Promise<void> {
  for await (const part of stream) {
    if (signal.aborted) throw signal.reason;
    if (part.type === "error") throw part.error;
    if (part.type === "abort")
      throw signal.reason ?? new AuxError("cancelled", "Model stream was cancelled.");
    if (
      ((part.type === "text-delta" || part.type === "reasoning-delta") && part.text?.length) ||
      (part.type === "tool-input-delta" && part.delta?.length) ||
      ["file", "reasoning-file", "tool-call"].includes(part.type)
    )
      progress();
    if (part.type === "text-delta" && part.text) onText?.(part.text);
  }
}

/**
 * Only failures of the *structured-output* mechanism justify the JSON-in-text
 * fallback: the model answered but not with a parseable/valid object, or the
 * provider rejected the schema/response_format feature itself. Auth (401/403),
 * quota (429), server (5xx), network and abort errors are surfaced as-is —
 * retrying them with a different prompt only amplifies cost.
 */
export async function isStructuredOutputError(e: unknown): Promise<boolean> {
  const {
    APICallError,
    JSONParseError,
    NoObjectGeneratedError,
    TypeValidationError,
    UnsupportedFunctionalityError,
  } = await import("ai");
  if (NoObjectGeneratedError.isInstance(e)) return true;
  if (TypeValidationError.isInstance(e)) return true;
  if (JSONParseError.isInstance(e)) return true;
  if (UnsupportedFunctionalityError.isInstance(e)) return true;
  if (APICallError.isInstance(e)) {
    // a 400 that names the structured-output feature — everything else is not ours to retry
    return (
      e.statusCode === 400 &&
      /response_format|json_schema|structured|schema|tool_choice|tools?\b/i.test(e.message)
    );
  }
  return false;
}

export { extractJson, stripReasoning } from "./json-text.js";

/**
 * Vercel AI Gateway client. One explicit retry owner: the app sets
 * maxRetries 0 and owns repair/cancellation itself. The provider chooses
 * its own base URL — the SDK endpoint is not the OpenAI-compatible REST URL.
 */
/** Build one user message without permitting implicit network image retrieval. */
export function imageReferenceMessage(prompt: string, images: string[] = []): ModelMessage[] {
  if (!images.length) return [{ role: "user", content: prompt }];
  if (images.length > 5 || images.reduce((total, image) => total + image.length, 0) > 16_000_000)
    throw new AuxError("invalid_params", "Use up to five images totaling at most 12 MB.");
  const files = images.map((image) => {
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
    if (!match || match[2]!.length % 4 !== 0)
      throw new AuxError("invalid_params", "Image references must be PNG, JPEG or WebP snapshots.");
    return { type: "file" as const, mediaType: match[1]!, data: { type: "data" as const, data: match[2]! } };
  });
  return [{ role: "user", content: [{ type: "text", text: prompt }, ...files] }];
}

/**
 * Retriable-for-failover: the request never meaningfully started or the
 * server side wedged. Walks cause/lastError chains because the SDK wraps
 * provider errors (RetryError, GatewayError) before they reach callers.
 */
export function isFailoverStatus(e: unknown): boolean {
  const seen = new Set<unknown>();
  const visit = (v: unknown): boolean => {
    if (!v || typeof v !== "object" || seen.has(v)) return false;
    seen.add(v);
    const rec = v as Record<string, unknown>;
    const status =
      typeof rec.statusCode === "number"
        ? rec.statusCode
        : typeof rec.status === "number"
          ? rec.status
          : typeof rec.responseStatusCode === "number"
            ? rec.responseStatusCode
            : undefined;
    if (status === 429 || (status !== undefined && status >= 500 && status <= 599)) return true;
    return visit(rec.cause) || visit(rec.lastError) || visit(rec.error);
  };
  return visit(e);
}

/** OpenAI reasoning effort goes only to registry models that reason; others reject or ignore it. */
export function gatewayProviderOptions(
  only?: string[],
  modelId?: string,
  models: readonly ModelCapability[] = MODEL_REGISTRY,
  effort?: "low" | "medium" | "high" | "xhigh",
) {
  const effective = only;
  const cap = modelId ? modelCapabilities(modelId, models) : undefined;
  const reasons =
    cap?.provider === "openai" && (cap.reasoning === "supported" || cap.reasoning === "required");
  return {
    gateway: {
      sort: "ttft" as const,
      caching: "auto" as const,
      ...(effective?.length ? { only: effective } : {}),
      ...(modelId?.endsWith("-fast") ? { speed: "fast" as const } : {}),
    },
    ...(reasons
      ? {
          openai: {
            reasoningEffort: (effort === "xhigh" ? "high" : (effort ?? "minimal")) as
              "low" | "medium" | "high" | "minimal",
          },
        }
      : {}),
  };
}

/** Merge namespaces independently so caller options do not erase routing or cache keys. */
function mergeProviderOptions(
  ...sources: Array<Record<string, Record<string, unknown>> | undefined>
): Parameters<typeof import("ai").generateText>[0]["providerOptions"] {
  const result: Record<string, Record<string, unknown>> = {};
  for (const source of sources) {
    for (const [provider, options] of Object.entries(source ?? {}))
      result[provider] = { ...result[provider], ...options };
  }
  return result as Parameters<typeof import("ai").generateText>[0]["providerOptions"];
}

type CallOpts = {
  modelId: string;
  system: string;
  prompt: string;
  imageDataUrls?: string[];
  signal?: AbortSignal;
  beforeDispatch?: () => Promise<void>;
  maxOutputTokens?: number;
  maxAttempts?: number;
  reasoning?: "minimal" | "low" | "medium" | "high" | "xhigh";
  sessionId?: string;
  providerOptions?: Record<string, Record<string, unknown>>;
};

const RETRY_SYSTEM =
  "\n\nRespond with ONLY the JSON object — no <think> tags, no reasoning, no prose, no markdown fences.";

export class GatewayModelClient implements ModelClient {
  private gateway: ReturnType<typeof createGateway> | undefined;
  private sdkPromise: Promise<typeof import("ai")> | undefined;
  private readonly apiKey: string;
  private readonly gatewayFetch?: typeof fetch;
  private readonly teamIdOrSlug?: string;
  private readonly directModel: boolean;
  private resolveModel: (id: string) => LanguageModel;
  private readonly streamIdleTimeoutMs: number;
  private readonly only: string[] | undefined;
  private readonly spendLedger: SpendLedger | undefined;
  /** Live-catalog-fed capability list (S5.9); falls back to the bundled snapshot. */
  private readonly registryModels: () => readonly ModelCapability[];
  /** Route chain per requested model — runtime failover on 429/5xx (S5.9). */
  private readonly candidatesFor: ((modelId: string) => readonly AgentModelRoute[]) | undefined;
  /** Benchmark authorization: only this model may receive requests, even after 429/5xx. */
  private readonly allowedModelId: string | undefined;

  constructor(
    apiKey: string,
    opts: {
      gatewayFetch?: typeof fetch;
      teamIdOrSlug?: string;
      streamIdleTimeoutMs?: number;
      only?: string[];
      model?: (id: string) => LanguageModel;
      spendLedger?: SpendLedger;
      models?: () => readonly ModelCapability[];
      candidatesFor?: (modelId: string) => readonly AgentModelRoute[];
      allowedModelId?: string;
    } = {},
  ) {
    if (!apiKey) throw new AuxError("invalid_params", "AI_GATEWAY_API_KEY is required");
    this.apiKey = apiKey;
    this.gatewayFetch = opts.gatewayFetch;
    this.teamIdOrSlug = opts.teamIdOrSlug;
    this.directModel = !!opts.model;
    this.resolveModel = opts.model ?? ((id: string) => this.gateway!(id));
    this.streamIdleTimeoutMs =
      opts.streamIdleTimeoutMs && opts.streamIdleTimeoutMs > 0
        ? opts.streamIdleTimeoutMs
        : DEFAULT_MODEL_STREAM_IDLE_TIMEOUT_MS;
    this.only = !this.directModel && opts.only?.length ? opts.only : undefined;
    this.spendLedger =
      opts.spendLedger ??
      (!this.directModel && process.env.AUX_PROGRAM_SPEND_CAP_USD ? new SpendLedger() : undefined);
    this.registryModels = opts.models ?? (() => MODEL_REGISTRY);
    this.candidatesFor = opts.candidatesFor;
    this.allowedModelId = opts.allowedModelId;
  }

  private loadSdk(): Promise<typeof import("ai")> {
    return (this.sdkPromise ??= Promise.all([
      import("ai"),
      this.directModel ? undefined : import("@ai-sdk/gateway"),
    ])
      .then(([sdk, gateway]) => {
        if (gateway) this.gateway = gateway.createGateway({ apiKey: this.apiKey, fetch: this.gatewayFetch, teamIdOrSlug: this.teamIdOrSlug });
        return sdk;
      })
      .catch((error) => {
        this.sdkPromise = undefined;
        throw error;
      }));
  }

  private capabilities() {
    return this.registryModels();
  }

  /**
   * Walk the route chain for `opts.modelId`: each candidate carries its own
   * reasoning effort, and a 429/5xx advances to the next candidate. Prior
   * candidates' billed attempts survive as `retries` on the result (or
   * attached to a thrown error via withAttempts) so billing never loses a
   * failover hop. A chain whose head isn't the requested model still starts
   * at the requested candidate when it appears later in the chain.
   */
  private async withFailover<
    R extends ModelAttempt & { retries?: ModelAttempt[]; resolvedModelId?: string },
    O extends {
      modelId: string;
      reasoning?: CallOpts["reasoning"];
      signal?: AbortSignal;
      singleCandidate?: boolean;
    },
  >(opts: O, invoke: (o: O) => Promise<R>): Promise<R> {
    if (this.allowedModelId && opts.modelId !== this.allowedModelId)
      throw new AuxError(
        "permission_denied",
        `Model ${opts.modelId} is outside this benchmark's authorized model pin.`,
      );
    const chain = this.candidatesFor?.(opts.modelId) ?? [];
    const at = chain.findIndex((c) => c.modelId === opts.modelId);
    const seq: readonly AgentModelRoute[] = this.allowedModelId
      ? [
          {
            modelId: this.allowedModelId,
            reasoning: (opts.reasoning as AgentModelRoute["reasoning"]) ?? "medium",
          },
        ]
      : at >= 0
        ? chain.slice(at)
        : [
            {
              modelId: opts.modelId,
              reasoning: (opts.reasoning as AgentModelRoute["reasoning"]) ?? "medium",
            },
          ];
    const prior: ModelAttempt[] = [];
    for (let i = 0; i < (opts.singleCandidate ? 1 : seq.length); i++) {
      const c = seq[i]!;
      try {
        const res = await invoke({ ...opts, modelId: c.modelId, reasoning: opts.reasoning ?? c.reasoning });
        res.modelId = c.modelId;
        res.resolvedModelId = c.modelId;
        if (prior.length) res.retries = [...prior, ...(res.retries ?? [])];
        return res;
      } catch (e) {
        if (opts.signal?.aborted) throw withAttempts(e, prior);
        const billed = attemptsOf(e).map((a) => ({ ...a, modelId: a.modelId ?? c.modelId }));
        if (opts.singleCandidate || i === seq.length - 1 || !isFailoverStatus(e))
          throw withAttempts(e, prior);
        prior.push(
          ...(billed.length
            ? billed
            : [
                {
                  durationMs: 0,
                  modelId: c.modelId,
                  error: `failover: ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`,
                },
              ]),
        );
      }
    }
    throw new AuxError("internal", "Model failover chain exhausted without a result.");
  }

  private async billed<T extends { usage?: unknown; providerMetadata?: unknown }>(
    modelId: string,
    promptTokens: number,
    maxOutputTokens: number,
    call: () => Promise<T>,
    beforeDispatch?: () => Promise<void>,
  ): Promise<T> {
    const started = Date.now();
    const reservation = this.spendLedger?.reserve(
      "aux-runtime",
      modelId,
      projectedModelCostUsd(modelId, promptTokens, maxOutputTokens, this.capabilities()),
    );
    let dispatched = false;
    try {
      await beforeDispatch?.();
      dispatched = true;
      const result = await call();
      const cost = modelCallCost(modelId, {
        ...usageFields(result.usage),
        providerMetadata: result.providerMetadata as Record<string, unknown> | undefined,
      });
      if (reservation) this.spendLedger?.settle(reservation, cost.costUsd);
      return result;
    } catch (error) {
      const billed = error as { usage?: unknown; providerMetadata?: unknown };
      const cost = modelCallCost(modelId, {
        ...usageFields(billed?.usage),
        providerMetadata: billed?.providerMetadata as Record<string, unknown> | undefined,
      });
      const known = attemptsOf(error);
      if (reservation)
        this.spendLedger?.settle(
          reservation,
          dispatched
            ? (cost.costUsd ?? (known.length ? modelCallCost(modelId, known.at(-1)!).costUsd : undefined))
            : 0,
        );
      throw known.length || (!billed?.usage && !billed?.providerMetadata)
        ? error
        : withAttempts(error, [{ ...attempt(started, billed), modelId }]);
    }
  }

  private requireVision(modelId: string, images?: string[]) {
    if (images?.length && !modelAcceptsImages(modelId, this.capabilities()))
      throw new AuxError(
        "capability_unsupported",
        "Choose an image-capable model to use these image references. This model accepts text only.",
      );
  }

  /** Preserve stable prompt breakpoints on both direct and Gateway provider routes. */
  private directRequest(
    opts: Omit<CallOpts, "prompt"> & { messages: ModelMessage[] },
    maxOutputTokens: number,
  ) {
    const model = this.resolveModel(opts.modelId);
    const provider = this.gateway
      ? modelCapabilities(opts.modelId, this.capabilities())?.provider
      : (model as { provider?: string }).provider;
    const anthropic = provider === "anthropic";
    const cachedMessages = anthropic ? anthropicCachedHistory(opts.messages) : opts.messages;
    const gateway = this.gateway
      ? gatewayProviderOptions(
          this.only,
          opts.modelId,
          this.capabilities(),
          opts.reasoning as "low" | "medium" | "high" | "xhigh" | undefined,
        )
      : undefined;
    const session = provider === "openai" && opts.sessionId ? openAiSessionCache(opts.sessionId) : undefined;
    return {
      model,
      abortSignal: opts.signal,
      maxRetries: 0 as const,
      maxOutputTokens: clampOutputTokens(opts.modelId, maxOutputTokens, this.capabilities()),
      instructions: anthropic ? stampAnthropicCache({ role: "system", content: opts.system }) : opts.system,
      messages: cachedMessages,
      providerOptions: mergeProviderOptions(gateway, session, opts.providerOptions),
      cacheTools: anthropic,
    };
  }

  async generateStructured<T>(opts: CallOpts & { schema: z.ZodType<T> }): Promise<StructuredCallResult<T>> {
    await this.loadSdk();
    return this.withFailover({ ...opts, singleCandidate: opts.maxAttempts === 1 }, (o) =>
      this.generateStructuredInner(o),
    );
  }

  private async generateStructuredInner<T>(
    opts: CallOpts & { schema: z.ZodType<T> },
  ): Promise<StructuredCallResult<T>> {
    const { streamText, Output } = await this.loadSdk();
    const started = Date.now();
    this.requireVision(opts.modelId, opts.imageDataUrls);
    const retries: ModelAttempt[] = [];
    // Provider capabilities decide transport support; schemas do not select an engine.
    if (modelCapabilities(opts.modelId, this.capabilities())?.structuredOutput !== false) {
      try {
        const res = await this.billed(
          opts.modelId,
          estimatedPromptTokens(opts.system, opts.prompt, z.toJSONSchema(opts.schema)) +
            (opts.imageDataUrls?.length ?? 0) * 8192,
          opts.maxOutputTokens ?? 2000,
          () =>
            withStreamIdle(opts.signal, this.streamIdleTimeoutMs, async (signal, progress) => {
              const { cacheTools: _cacheTools, ...request } = this.directRequest(
                { ...opts, messages: imageReferenceMessage(opts.prompt, opts.imageDataUrls) },
                opts.maxOutputTokens ?? 2000,
              );
              const stream = streamText({
                ...request,
                abortSignal: signal,
                output: Output.object({ schema: opts.schema }),
              });
              await consumeModelStream(stream.fullStream, signal, progress);
              return {
                object: await stream.output,
                usage: await stream.usage,
                providerMetadata: await stream.providerMetadata,
              };
            }),
          opts.beforeDispatch,
        );
        return { object: res.object, ...attempt(started, res) };
      } catch (e) {
        if (opts.signal?.aborted || !(await isStructuredOutputError(e)) || opts.maxAttempts === 1) throw e;
        retries.push(...attemptsOf(e).map((a) => ({ ...a, error: "structured output unusable" })));
      }
    }
    return this.structuredFromText(opts, retries);
  }

  /**
   * Streamed variant of the JSON-in-text path (plan A5). The completion is
   * requested with `streamText`; every text delta is forwarded to `onText`
   * so the coordinator can parse and dispatch steps as they complete. The
   * finished text is validated exactly like the non-streaming path. On a
   * parse failure it falls back to one non-streamed retry, reported in
   * `retries` — the caller must not mix the retry's steps with any it
   * already dispatched from the stream.
   */
  async streamStructured<T>(
    opts: CallOpts & { schema: z.ZodType<T>; onText: (delta: string) => void },
  ): Promise<StructuredCallResult<T>> {
    await this.loadSdk();
    return this.withFailover({ ...opts, singleCandidate: opts.maxAttempts === 1 }, (o) =>
      this.streamStructuredInner(o),
    );
  }

  private async streamStructuredInner<T>(
    opts: CallOpts & { schema: z.ZodType<T>; onText: (delta: string) => void },
  ): Promise<StructuredCallResult<T>> {
    const { streamText } = await this.loadSdk();
    const started = Date.now();
    this.requireVision(opts.modelId, opts.imageDataUrls);
    const { cacheTools: _cacheTools, ...request } = this.directRequest(
      {
        ...opts,
        system: `${opts.system}${schemaHint(opts.schema)}`,
        messages: imageReferenceMessage(opts.prompt, opts.imageDataUrls),
      },
      opts.maxOutputTokens ?? 2000,
    );
    let text = "";
    const res = await this.billed(
      opts.modelId,
      estimatedPromptTokens(opts.system, opts.prompt, schemaHint(opts.schema)) +
        (opts.imageDataUrls?.length ?? 0) * 8192,
      opts.maxOutputTokens ?? 2000,
      () =>
        withStreamIdle(opts.signal, this.streamIdleTimeoutMs, async (signal, progress) => {
          let completed: ModelAttempt | undefined;
          const stream = streamText({
            ...request,
            abortSignal: signal,
            onStepFinish: (result) => {
              completed = reportedAttempt(started, opts.modelId, result);
            },
          });
          try {
            await consumeModelStream(stream.fullStream, signal, progress, (delta) => {
              text += delta;
              opts.onText(delta);
            });
            return { usage: await stream.usage, providerMetadata: await stream.providerMetadata };
          } catch (error) {
            throw completed ? withAttempts(error, [completed]) : error;
          }
        }),
    );
    return this.parseOrRetry(opts, text, attempt(started, res), []);
  }

  private async structuredFromText<T>(
    opts: CallOpts & { schema: z.ZodType<T> },
    retries: ModelAttempt[],
  ): Promise<StructuredCallResult<T>> {
    const res = await this.generateText({
      ...opts,
      system: `${opts.system}${schemaHint(opts.schema)}`,
    }).catch((e: unknown) => {
      throw withAttempts(e, retries);
    });
    return this.parseOrRetry(opts, res.text, res, retries);
  }

  /** One corrective retry on unparseable output; every billed attempt is reported. */
  private async parseOrRetry<T>(
    opts: CallOpts & { schema: z.ZodType<T> },
    text: string,
    first: ModelAttempt,
    retries: ModelAttempt[],
  ): Promise<StructuredCallResult<T>> {
    const parse = (t: string): T => opts.schema.parse(extractJson(t));
    try {
      return { object: parse(text), ...stripText(first), ...(retries.length ? { retries } : {}) };
    } catch (e) {
      if (opts.signal?.aborted) throw withAttempts(e, [...retries, first]);
      if (opts.maxAttempts === 1)
        throw withAttempts(e, [...retries, { ...stripText(first), error: "unparseable output" }]);
      const failed = [
        ...retries,
        {
          ...stripText(first),
          error: `unparseable output: ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`,
        },
      ];
      const retry = await this.generateText({
        ...opts,
        system: `${opts.system}${RETRY_SYSTEM}`,
        maxOutputTokens: (opts.maxOutputTokens ?? 2000) * 2,
      }).catch((err: unknown) => {
        throw withAttempts(err, failed);
      });
      try {
        return { object: parse(retry.text), ...stripText(retry), retries: failed };
      } catch (err) {
        throw withAttempts(err, [
          ...failed,
          { ...stripText(retry), error: "unparseable output after retry" },
        ]);
      }
    }
  }

  async generateText(opts: {
    modelId: string;
    system?: string;
    prompt: string;
    imageDataUrls?: string[];
    imageDataUrl?: string;
    signal?: AbortSignal;
    beforeDispatch?: () => Promise<void>;
    maxOutputTokens?: number;
    maxAttempts?: number;
    reasoning?: CallOpts["reasoning"];
    sessionId?: string;
  }): Promise<TextCallResult> {
    await this.loadSdk();
    return this.withFailover({ ...opts, singleCandidate: opts.maxAttempts === 1 }, (o) =>
      this.generateTextInner(o),
    );
  }

  private async generateTextInner(opts: {
    modelId: string;
    system?: string;
    prompt: string;
    imageDataUrls?: string[];
    imageDataUrl?: string;
    signal?: AbortSignal;
    beforeDispatch?: () => Promise<void>;
    maxOutputTokens?: number;
    maxAttempts?: number;
    reasoning?: CallOpts["reasoning"];
    sessionId?: string;
  }): Promise<TextCallResult> {
    const { streamText } = await this.loadSdk();
    const started = Date.now();
    const images = [...(opts.imageDataUrls ?? []), ...(opts.imageDataUrl ? [opts.imageDataUrl] : [])];
    this.requireVision(opts.modelId, images);
    const res = await this.billed(
      opts.modelId,
      estimatedPromptTokens(opts.system ?? "", opts.prompt) + images.length * 8192,
      opts.maxOutputTokens ?? 1200,
      () =>
        withStreamIdle(opts.signal, this.streamIdleTimeoutMs, async (signal, progress) => {
          const { cacheTools: _cacheTools, ...request } = this.directRequest(
            { ...opts, system: opts.system ?? "", messages: imageReferenceMessage(opts.prompt, images) },
            opts.maxOutputTokens ?? 1200,
          );
          const stream = streamText({ ...request, abortSignal: signal });
          await consumeModelStream(stream.fullStream, signal, progress);
          return {
            text: await stream.text,
            usage: await stream.usage,
            providerMetadata: await stream.providerMetadata,
          };
        }),
      opts.beforeDispatch,
    );
    return { text: res.text, ...attempt(started, res) };
  }

  /**
   * One step of the v2 tool-call loop (S5). Manifest tools carry no `execute`,
   * so the completed response returns with client-side tool
   * calls for the loop to dispatch — every side effect is journaled by the
   * caller, never hidden inside the SDK loop.
   */
  async toolCallStep(opts: {
    onText?: (text: string) => void;
    modelId: string;
    system: string;
    messages: ModelMessage[];
    tools: Record<string, { description?: string; inputSchema: z.ZodType }>;
    signal?: AbortSignal;
    providerOptions?: Record<string, Record<string, unknown>>;
    maxOutputTokens?: number;
    maxAttempts?: 1;
    reasoning?: CallOpts["reasoning"];
    sessionId?: string;
  }): Promise<ToolCallStepResult> {
    await this.loadSdk();
    return this.withFailover({ ...opts, singleCandidate: opts.maxAttempts === 1 }, (o) =>
      this.toolCallStepInner(o),
    );
  }

  private async toolCallStepInner(opts: {
    onText?: (text: string) => void;
    modelId: string;
    system: string;
    messages: ModelMessage[];
    tools: Record<string, { description?: string; inputSchema: z.ZodType }>;
    signal?: AbortSignal;
    providerOptions?: Record<string, Record<string, unknown>>;
    maxOutputTokens?: number;
    maxAttempts?: 1;
    reasoning?: CallOpts["reasoning"];
    sessionId?: string;
  }): Promise<ToolCallStepResult> {
    const { streamText, tool } = await this.loadSdk();
    const started = Date.now();
    const names = Object.keys(opts.tools);
    const maxOut = clampOutputTokens(opts.modelId, opts.maxOutputTokens ?? 4000, this.capabilities());
    const { cacheTools, ...request } = this.directRequest(opts, maxOut);
    const lastTool = names.at(-1);
    const tools = Object.fromEntries(
      names.map((name) => {
        const spec = opts.tools[name]!;
        return [
          name,
          tool({
            ...(spec.description ? { description: spec.description } : {}),
            inputSchema: spec.inputSchema,
            ...(cacheTools && name === lastTool
              ? { providerOptions: { anthropic: { cacheControl: ANTHROPIC_CACHE_CONTROL } } }
              : {}),
          }),
        ];
      }),
    );
    const res = await this.billed(
      opts.modelId,
      estimatedPromptTokens(opts.system, JSON.stringify(opts.messages).slice(0, 120_000)),
      maxOut,
      () =>
        withStreamIdle(opts.signal, this.streamIdleTimeoutMs, async (signal, progress) => {
          let completed: ModelAttempt | undefined;
          const stream = streamText({
            ...request,
            abortSignal: signal,
            tools,
            onStepFinish: (result) => {
              completed = reportedAttempt(started, opts.modelId, result);
            },
          });
          let text = "";
          opts.onText?.(text);
          try {
            await consumeModelStream(stream.fullStream, signal, progress, (delta) => {
              text += delta;
              opts.onText?.(text);
            });
            return {
              text: await stream.text,
              steps: await stream.steps,
              toolCalls: await stream.toolCalls,
              response: await stream.response,
              finishReason: await stream.finishReason,
              usage: await stream.usage,
              providerMetadata: await stream.providerMetadata,
            };
          } catch (error) {
            throw completed ? withAttempts(error, [completed]) : error;
          }
        }),
    );
    const lastStep = res.steps.at(-1);
    const calls = (lastStep?.toolCalls ?? res.toolCalls ?? []).map((call) => ({
      toolCallId: call.toolCallId,
      toolName: call.toolName,
      input: call.input,
    }));
    const providerExecuted = (
      (lastStep?.toolCalls ?? []) as { toolCallId: string; providerExecuted?: boolean }[]
    )
      .filter((call) => call.providerExecuted)
      .map((call) => call.toolCallId);
    // The response can end on a tool message. Replaying that plus the loop's
    // own tool result sends the provider two outputs for one call.
    const responseMessages = res.response.messages ?? [];
    const assistant = [...responseMessages].reverse().find((message) => message.role === "assistant");
    return {
      message: assistant ?? {
        role: "assistant",
        content: calls.map((call) => ({
          type: "tool-call" as const,
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          input: call.input,
        })),
      },
      toolCalls: calls,
      text: res.text || undefined,
      finishReason: res.finishReason === "tool-calls" ? "tool-calls" : res.finishReason,
      ...(providerExecuted.length ? { providerExecuted } : {}),
      ...attempt(started, res),
    };
  }

  async listModels(): Promise<{ id: string; name?: string }[]> {
    if (this.directModel) return [];
    await this.loadSdk();
    if (!this.gateway) return [];
    const catalog = await this.gateway.getAvailableModels();
    return catalog.models.map((m) => {
      const input = Number(m.pricing?.input),
        output = Number(m.pricing?.output);
      return {
        id: m.id,
        name: m.name,
        ...(m.pricing && Number.isFinite(input) && input >= 0 && Number.isFinite(output) && output >= 0
          ? { inputUsdPerMTok: input * 1_000_000, outputUsdPerMTok: output * 1_000_000 }
          : {}),
      };
    });
  }
}

function attempt(started: number, res: { usage?: unknown; providerMetadata?: unknown }): ModelAttempt {
  return {
    durationMs: Date.now() - started,
    ...usageFields(res.usage),
    ...(res.providerMetadata ? { providerMetadata: res.providerMetadata as Record<string, unknown> } : {}),
  };
}

/** SDK error steps may have entirely unknown usage; never replace a provider's actual error receipt with that empty step. */
function reportedAttempt(
  started: number,
  modelId: string,
  res: { usage?: unknown; providerMetadata?: unknown },
): ModelAttempt | undefined {
  const recorded = attempt(started, res);
  return recorded.inputTokens !== undefined ||
    recorded.outputTokens !== undefined ||
    recorded.providerMetadata
    ? { ...recorded, modelId }
    : undefined;
}

function stripText(a: ModelAttempt & { text?: string }): ModelAttempt {
  const { text: _text, ...rest } = a;
  return rest;
}

function schemaHint(schema: z.ZodType): string {
  return `\n\nRespond with ONLY a JSON value that validates against this JSON Schema — no prose, no markdown fences:\n${JSON.stringify(z.toJSONSchema(schema))}`;
}
