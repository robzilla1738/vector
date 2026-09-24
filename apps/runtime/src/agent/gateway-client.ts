import {
  type LanguageModel,
  type ModelMessage,
  APICallError,
  generateObject,
  generateText,
  JSONParseError,
  NoObjectGeneratedError,
  streamText,
  TypeValidationError,
  UnsupportedFunctionalityError,
} from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { AuxError, TaskPlanChunkSchema } from "@aux/contracts";
import { clampOutputTokens, MODEL_REGISTRY, modelAcceptsImages, modelCapabilities, type ModelCapability } from "@aux/contracts/model-registry";
import { extractJson } from "./json-text.js";
import { usageFields, withAttempts, type ModelAttempt, type ModelClient, type StructuredCallResult, type TextCallResult } from "./model-client.js";

/** Per-call ceiling — a hung gateway must not stall a run until runs.cancel. */
export const DEFAULT_MODEL_CALL_TIMEOUT_MS = 90_000;

/**
 * Combine the caller's signal with a per-call timeout. Either aborting
 * aborts the SDK call; the timer never keeps the process alive.
 */
export function withCallTimeout(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

/**
 * Only failures of the *structured-output* mechanism justify the JSON-in-text
 * fallback: the model answered but not with a parseable/valid object, or the
 * provider rejected the schema/response_format feature itself. Auth (401/403),
 * quota (429), server (5xx), network and abort errors are surfaced as-is —
 * retrying them with a different prompt only amplifies cost.
 */
export function isStructuredOutputError(e: unknown): boolean {
  if (NoObjectGeneratedError.isInstance(e)) return true;
  if (TypeValidationError.isInstance(e)) return true;
  if (JSONParseError.isInstance(e)) return true;
  if (UnsupportedFunctionalityError.isInstance(e)) return true;
  const msg = e instanceof Error ? e.message : String(e);
  // Cerebras (and some other providers) reject JSON Schema oneOf/anyOf as a
  // generic Error, not always an APICallError 400.
  if (/unsupported json schema|json schema fields|\boneOf\b|\banyOf\b/i.test(msg)) return true;
  if (APICallError.isInstance(e)) {
    // a 400 that names the structured-output feature — everything else is not ours to retry
    return e.statusCode === 400 && /response_format|json_schema|structured|schema|tool_choice|tools?\b/i.test(e.message);
  }
  return false;
}

export function jsonSchemaHasKeyword(value: unknown, keywords: string[]): boolean {
  if (Array.isArray(value)) return value.some((v) => jsonSchemaHasKeyword(v, keywords));
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  for (const k of keywords) if (Object.prototype.hasOwnProperty.call(o, k)) return true;
  return Object.values(o).some((v) => jsonSchemaHasKeyword(v, keywords));
}

/** Discriminated unions compile to JSON Schema oneOf — Cerebras/Qwen reject that. */
export function schemaNeedsJsonFallback(schema: z.ZodType): boolean {
  try {
    return jsonSchemaHasKeyword(z.toJSONSchema(schema), ["oneOf", "anyOf"]);
  } catch {
    return true;
  }
}

export { extractJson, stripReasoning } from "./json-text.js";

/** Models often omit step ids; the schema requires them. */
export function assignMissingStepIds(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const o = { ...(value as Record<string, unknown>) };
  if (!Array.isArray(o.steps)) return o;
  o.steps = o.steps.map((step, i) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return step;
    const s = step as Record<string, unknown>;
    return s.id == null || s.id === "" ? { ...s, id: `s${i + 1}` } : s;
  });
  return o;
}

/** Fill required PlanChunk/RepairChunk fields Qwen commonly drops. */
export function normalizePlannerObject(value: unknown): unknown {
  const o = assignMissingStepIds(value);
  if (!o || typeof o !== "object" || Array.isArray(o)) return o;
  const rec = { ...(o as Record<string, unknown>) };
  if (typeof rec.message !== "string" || rec.message.length === 0) {
    rec.message = rec.status === "done" ? "Done" : rec.status === "needs_input" ? "Needs input" : "Continue";
  } else if (rec.message.length > 280) {
    rec.message = rec.message.slice(0, 280);
  }
  if (typeof rec.notes === "string" && rec.notes.length > 600) rec.notes = rec.notes.slice(0, 600);
  else if (rec.notes != null && typeof rec.notes !== "string") delete rec.notes;
  return rec;
}

/**
 * Cerebras rejects JSON Schema oneOf, so union schemas (PlanChunk steps)
 * cannot be sent as response_format. The system prompt already describes
 * the object; this is the compact remainder.
 */
export const PLAN_JSON_HINT = `Respond with ONLY a JSON object. No <think> tags, no reasoning, no markdown fences, no prose.

Required: "status" ("continue"|"done"|"needs_input") and "message" (short factual string).
continue: "steps" — 1-8 ops. Each step needs "id" (s1, s2, …) and "op".
  navigate{url} click|dblclick|hover|check|uncheck{target} fill|type{target,value}
  press{key,target?} select{target,value} scroll{direction?,target?}
  waitFor{condition:{kind, ...}} extract{fields:[{name,selector?}]}
  collectScroll{item} clickPoint{x,y} screenshot back forward reload stop
  dragTo{target,to} dialog{action} upload{target,files} expectDownload
  waitFor kinds: textVisible{text} selector{selector} refReady{ref} urlMatches{pattern}
    navigationSettled settled downloadCompleted response{urlIncludes}
done: "result" object; optional read-only steps (extract/collectScroll/waitFor) whose values fill result via "{{name}}".
needs_input: "question". Optional "notes" (≤600 chars): your running scratchpad, echoed back next turn.`;

export const TASK_PLAN_JSON_HINT = `${PLAN_JSON_HINT.replace('("continue"|"done"|"needs_input")', '("continue"|"done"|"needs_input"|"source")')}
For a saved task with a listed CALENDAR GRANT, status may also be "source" with a single sourceRequest:
  {"kind":"calendar.events.list","grantId":"listed UUID","timeMin":"ISO timestamp with offset","timeMax":"ISO timestamp with offset","limit":1..10,"pageToken":"optional"}.
Use source with no browser steps; its result is returned before the next decision.`;

/**
 * Vercel AI Gateway client. One explicit retry owner: the app sets
 * maxRetries 0 and owns repair/cancellation itself. The provider chooses
 * its own base URL — the SDK endpoint is not the OpenAI-compatible REST URL.
 */
/** Build one user message without permitting implicit network image retrieval. */
export function imageReferenceMessage(prompt: string, images: string[] = []): ModelMessage[] {
  if (!images.length) return [{role:"user",content:prompt}];
  if (images.length > 5 || images.reduce((total, image) => total + image.length, 0) > 16_000_000)
    throw new AuxError("invalid_params", "Use up to five images totaling at most 12 MB.");
  const files = images.map(image => {
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
    if (!match || match[2]!.length % 4 !== 0) throw new AuxError("invalid_params", "Image references must be PNG, JPEG or WebP snapshots.");
    return {type:"file" as const, mediaType:match[1]!, data:{type:"data" as const,data:match[2]!}};
  });
  return [{role:"user",content:[{type:"text",text:prompt},...files]}];
}

/**
 * Keep `AUX_GATEWAY_ONLY` when it matches this model; drop it otherwise
 * so `openai/gpt-5.6-luna-fast` still routes when the env pins Cerebras.
 */
export function gatewayOnlyForModel(modelId: string, only?: string[]): string[] | undefined {
  if (!only?.length) return undefined;
  const creator = modelId.split("/")[0] ?? "";
  const allowed = only.some((p) => {
    if (p === creator) return true;
    if (p === "cerebras" && (creator === "alibaba" || modelId.includes("qwen"))) return true;
    return false;
  });
  return allowed ? only : undefined;
}

/** OpenAI reasoning effort goes only to registry models that reason; others reject or ignore it. */
export function gatewayProviderOptions(only?: string[], modelId?: string, models: readonly ModelCapability[] = MODEL_REGISTRY) {
  const effective = modelId ? gatewayOnlyForModel(modelId, only) : only;
  const cap = modelId ? modelCapabilities(modelId, models) : undefined;
  const reasons = cap?.provider === "openai" && (cap.reasoning === "supported" || cap.reasoning === "required");
  return {
    gateway: {
      sort: "ttft" as const,
      caching: "auto" as const,
      ...(effective?.length ? { only: effective } : {}),
      ...(modelId?.endsWith("-fast") ? { speed: "fast" as const } : {}),
    },
    ...(reasons ? { openai: { reasoningEffort: "minimal" as const } } : {}),
  };
}

type CallOpts = {
  modelId: string;
  system: string;
  prompt: string;
  imageDataUrls?: string[];
  signal?: AbortSignal;
  maxOutputTokens?: number;
};

const RETRY_SYSTEM = "\n\nRespond with ONLY the JSON object — no <think> tags, no reasoning, no prose, no markdown fences.";

export class GatewayModelClient implements ModelClient {
  private gateway: ReturnType<typeof createGateway> | undefined;
  private resolveModel: (id: string) => LanguageModel;
  private readonly callTimeoutMs: number;
  private readonly only: string[] | undefined;

  constructor(apiKey: string, opts: { callTimeoutMs?: number; only?: string[]; model?: (id: string) => LanguageModel } = {}) {
    if (!apiKey) throw new AuxError("invalid_params", "AI_GATEWAY_API_KEY is required");
    this.gateway = opts.model ? undefined : createGateway({ apiKey });
    this.resolveModel = opts.model ?? ((id: string) => this.gateway!(id));
    this.callTimeoutMs = opts.callTimeoutMs && opts.callTimeoutMs > 0 ? opts.callTimeoutMs : DEFAULT_MODEL_CALL_TIMEOUT_MS;
    this.only = this.gateway && opts.only?.length ? opts.only : undefined;
  }

  private requireVision(modelId: string, images?: string[]) {
    if (images?.length && !modelAcceptsImages(modelId))
      throw new AuxError("capability_unsupported", "Choose an image-capable model to use these image references. This model accepts text only.");
  }

  private sdkOptions(opts: CallOpts, maxOutputTokens: number) {
    return {
      model: this.resolveModel(opts.modelId),
      abortSignal: withCallTimeout(opts.signal, this.callTimeoutMs),
      maxRetries: 0,
      maxOutputTokens: clampOutputTokens(opts.modelId, maxOutputTokens),
      providerOptions: this.gateway ? gatewayProviderOptions(this.only, opts.modelId) : undefined,
    };
  }

  async generateStructured<T>(opts: CallOpts & { schema: z.ZodType<T> }): Promise<StructuredCallResult<T>> {
    const started = Date.now();
    this.requireVision(opts.modelId, opts.imageDataUrls);
    const retries: ModelAttempt[] = [];
    // Skip generateObject when the schema would send oneOf — Cerebras/Qwen
    // reject it before any tokens. Simple schemas (probe, final decision)
    // still use structured output.
    if (!schemaNeedsJsonFallback(opts.schema)) {
      try {
        const res = await generateObject({
          ...this.sdkOptions(opts, opts.maxOutputTokens ?? 2000),
          schema: opts.schema,
          system: opts.system,
          messages: imageReferenceMessage(opts.prompt, opts.imageDataUrls),
        });
        return { object: res.object, ...attempt(started, res) };
      } catch (e) {
        if (opts.signal?.aborted) throw e;
        if (!isStructuredOutputError(e)) throw e;
        const usage = (e as { usage?: unknown }).usage;
        if (usage) retries.push({ ...attempt(started, { usage }), error: "structured output unusable" });
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
  async streamStructured<T>(opts: CallOpts & { schema: z.ZodType<T>; onText: (delta: string) => void }): Promise<StructuredCallResult<T>> {
    const started = Date.now();
    this.requireVision(opts.modelId, opts.imageDataUrls);
    const stream = streamText({
      ...this.sdkOptions(opts, opts.maxOutputTokens ?? 2000),
      system: `${opts.system}${schemaHint(opts.schema)}`,
      messages: imageReferenceMessage(opts.prompt, opts.imageDataUrls),
    });
    let text = "";
    for await (const delta of stream.textStream) {
      text += delta;
      opts.onText(delta);
    }
    const usage = await Promise.resolve(stream.usage).catch(() => undefined);
    const providerMetadata = await Promise.resolve(stream.providerMetadata).catch(() => undefined);
    const first = attempt(started, { usage, providerMetadata });
    return this.parseOrRetry(opts, text, first, []);
  }

  private async structuredFromText<T>(opts: CallOpts & { schema: z.ZodType<T> }, retries: ModelAttempt[]): Promise<StructuredCallResult<T>> {
    const res = await this.generateText({
      ...opts,
      system: `${opts.system}${schemaHint(opts.schema)}`,
    }).catch((e: unknown) => { throw withAttempts(e, retries); });
    return this.parseOrRetry(opts, res.text, res, retries);
  }

  /** One corrective retry on unparseable output; every billed attempt is reported. */
  private async parseOrRetry<T>(
    opts: CallOpts & { schema: z.ZodType<T> },
    text: string,
    first: ModelAttempt,
    retries: ModelAttempt[],
  ): Promise<StructuredCallResult<T>> {
    const parse = (t: string): T => opts.schema.parse(normalizePlannerObject(extractJson(t)));
    try {
      return { object: parse(text), ...stripText(first), ...(retries.length ? { retries } : {}) };
    } catch (e) {
      if (opts.signal?.aborted) throw withAttempts(e, [...retries, first]);
      const failed = [...retries, { ...stripText(first), error: `unparseable output: ${e instanceof Error ? e.message.slice(0, 120) : String(e)}` }];
      const retry = await this.generateText({
        ...opts,
        system: `${opts.system}${RETRY_SYSTEM}`,
        maxOutputTokens: (opts.maxOutputTokens ?? 2000) * 2,
      }).catch((err: unknown) => { throw withAttempts(err, failed); });
      try {
        return { object: parse(retry.text), ...stripText(retry), retries: failed };
      } catch (err) {
        throw withAttempts(err, [...failed, { ...stripText(retry), error: "unparseable output after retry" }]);
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
    maxOutputTokens?: number;
  }): Promise<TextCallResult> {
    const started = Date.now();
    const images = [...(opts.imageDataUrls ?? []), ...(opts.imageDataUrl ? [opts.imageDataUrl] : [])];
    this.requireVision(opts.modelId, images);
    const res = await generateText({
      ...this.sdkOptions({ ...opts, system: opts.system ?? "" }, opts.maxOutputTokens ?? 1200),
      system: opts.system,
      messages: imageReferenceMessage(opts.prompt, images),
    });
    return { text: res.text, ...attempt(started, res) };
  }

  async listModels(): Promise<{ id: string; name?: string }[]> {
    if (!this.gateway) return [];
    const catalog = await this.gateway.getAvailableModels();
    return catalog.models.map((m) => ({ id: m.id, name: m.name }));
  }
}

function attempt(started: number, res: { usage?: unknown; providerMetadata?: unknown }): ModelAttempt {
  return {
    durationMs: Date.now() - started,
    ...usageFields(res.usage),
    ...(res.providerMetadata ? { providerMetadata: res.providerMetadata as Record<string, unknown> } : {}),
  };
}

function stripText(a: ModelAttempt & { text?: string }): ModelAttempt {
  const { text: _text, ...rest } = a;
  return rest;
}

function schemaHint(schema: z.ZodType): string {
  return schemaNeedsJsonFallback(schema)
    ? `\n\n${schema === TaskPlanChunkSchema ? TASK_PLAN_JSON_HINT : PLAN_JSON_HINT}`
    : `\n\nRespond with ONLY a JSON value that validates against this JSON Schema — no prose, no markdown fences:\n${JSON.stringify(z.toJSONSchema(schema))}`;
}
