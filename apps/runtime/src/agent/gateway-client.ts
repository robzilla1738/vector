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
import { AuxError } from "@aux/contracts";
import type { ModelClient, StructuredCallResult, TextCallResult } from "./model-client.js";

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

/** Qwen and other reasoners wrap the answer in <think>…</think>. */
export function stripReasoning(text: string): string {
  return text.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "").replace(/<think\b[^>]*>[\s\S]*$/gi, "");
}

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
done: "result" object, no steps. needs_input: "question".`;

/** Pull the first balanced JSON value out of a text completion (fences or prose allowed around it). */
export function extractJson(text: string): unknown {
  const body = stripReasoning(text);
  const start = body.search(/[{[]/);
  if (start < 0) throw new AuxError("model_output_invalid", "model returned no JSON value");
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (let i = start; i < body.length; i++) {
    const c = body[i]!;
    if (esc) { esc = false; continue; }
    if (c === "\\") { if (inStr) esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") {
      if (stack.pop() !== (c === "}" ? "{" : "[")) break;
      if (stack.length === 0) return JSON.parse(body.slice(start, i + 1));
    }
  }
  throw new AuxError("model_output_invalid", "model returned truncated or unbalanced JSON");
}

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

export function gatewayProviderOptions(only?: string[], modelId?: string) {
  const effective = modelId ? gatewayOnlyForModel(modelId, only) : only;
  const luna = Boolean(modelId?.includes("luna"));
  return {
    gateway: {
      sort: "ttft" as const,
      caching: "auto" as const,
      ...(effective?.length ? { only: effective } : {}),
      ...(modelId?.endsWith("-fast") ? { speed: "fast" as const } : {}),
    },
    ...(luna ? {} : { openai: { reasoningEffort: "minimal" as const } }),
  };
}

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

  private requireVision(modelId:string, images?:string[]) {
    if (images?.length && gatewayOnlyForModel(modelId, this.only)?.includes("cerebras"))
      throw new AuxError("capability_unsupported", "Choose an image-capable model to use these image references. The Cerebras planner accepts text only.");
  }

  async generateStructured<T>(opts: {
    modelId: string;
    system: string;
    prompt: string;
    imageDataUrls?: string[];
    schema: z.ZodType<T>;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<StructuredCallResult<T>> {
    const started = Date.now();
    this.requireVision(opts.modelId, opts.imageDataUrls);
    // Skip generateObject when the schema would send oneOf — Cerebras/Qwen
    // reject it before any tokens. Simple schemas (probe, final decision)
    // still use structured output.
    if (!schemaNeedsJsonFallback(opts.schema)) {
      try {
        const res = await generateObject({
          model: this.resolveModel(opts.modelId),
          schema: opts.schema,
          system: opts.system,
          messages: imageReferenceMessage(opts.prompt, opts.imageDataUrls),
          abortSignal: withCallTimeout(opts.signal, this.callTimeoutMs),
          maxRetries: 0,
          maxOutputTokens: opts.maxOutputTokens ?? 2000,
          providerOptions: this.gateway ? gatewayProviderOptions(this.only, opts.modelId) : undefined,
        });
        return {
          object: res.object,
          durationMs: Date.now() - started,
          inputTokens: res.usage?.inputTokens,
          outputTokens: res.usage?.outputTokens,
          providerMetadata: (res.providerMetadata ?? undefined) as Record<string, unknown> | undefined,
        };
      } catch (e) {
        if (opts.signal?.aborted) throw e;
        if (!isStructuredOutputError(e)) throw e;
      }
    }
    return this.structuredFromText(opts, started);
  }

  /**
   * Streamed variant of the JSON-in-text path (plan A5). The completion is
   * requested with `streamText`; every text delta is forwarded to `onText`
   * so the coordinator can parse and dispatch steps as they complete. The
   * finished text is validated exactly like the non-streaming path. On a
   * parse failure it falls back to one non-streamed retry — by then the
   * caller has already executed whatever steps streamed in cleanly, and
   * the retry's object is reconciled against those.
   */
  async streamStructured<T>(opts: {
    modelId: string;
    system: string;
    prompt: string;
    imageDataUrls?: string[];
    schema: z.ZodType<T>;
    signal?: AbortSignal;
    maxOutputTokens?: number;
    onText: (delta: string) => void;
  }): Promise<StructuredCallResult<T>> {
    const started = Date.now();
    this.requireVision(opts.modelId, opts.imageDataUrls);
    const schemaHint = schemaNeedsJsonFallback(opts.schema)
      ? `\n\n${PLAN_JSON_HINT}`
      : `\n\nRespond with ONLY a JSON value that validates against this JSON Schema — no prose, no markdown fences:\n${JSON.stringify(z.toJSONSchema(opts.schema))}`;
    const parse = (text: string): T => opts.schema.parse(normalizePlannerObject(extractJson(text)));
    const stream = streamText({
      model: this.resolveModel(opts.modelId),
      system: `${opts.system}${schemaHint}`,
      messages: imageReferenceMessage(opts.prompt, opts.imageDataUrls),
      abortSignal: withCallTimeout(opts.signal, this.callTimeoutMs),
      maxRetries: 0,
      maxOutputTokens: opts.maxOutputTokens ?? 2000,
      providerOptions: this.gateway ? gatewayProviderOptions(this.only, opts.modelId) : undefined,
    });
    let text = "";
    for await (const delta of stream.textStream) {
      text += delta;
      opts.onText(delta);
    }
    const usage = await Promise.resolve(stream.usage).catch(() => undefined);
    try {
      return {
        object: parse(text),
        durationMs: Date.now() - started,
        inputTokens: usage?.inputTokens,
        outputTokens: usage?.outputTokens,
      };
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      const retry = await this.generateText({
        modelId: opts.modelId,
        system: `${opts.system}\n\nRespond with ONLY the JSON object — no <think> tags, no reasoning, no prose, no markdown fences.`,
        prompt: opts.prompt,
        imageDataUrls: opts.imageDataUrls,
        signal: opts.signal,
        maxOutputTokens: (opts.maxOutputTokens ?? 2000) * 2,
      });
      return {
        object: parse(retry.text),
        durationMs: Date.now() - started,
        inputTokens: retry.inputTokens,
        outputTokens: retry.outputTokens,
      };
    }
  }

  private async structuredFromText<T>(
    opts: {
      modelId: string;
      system: string;
      prompt: string;
    imageDataUrls?: string[];
      schema: z.ZodType<T>;
      signal?: AbortSignal;
      maxOutputTokens?: number;
    },
    started: number,
  ): Promise<StructuredCallResult<T>> {
    const schemaHint = schemaNeedsJsonFallback(opts.schema)
      ? `\n\n${PLAN_JSON_HINT}`
      : `\n\nRespond with ONLY a JSON value that validates against this JSON Schema — no prose, no markdown fences:\n${JSON.stringify(z.toJSONSchema(opts.schema))}`;
    const parse = (text: string): T => opts.schema.parse(normalizePlannerObject(extractJson(text)));
    const res = await this.generateText({
      modelId: opts.modelId,
      system: `${opts.system}${schemaHint}`,
      prompt: opts.prompt,
      imageDataUrls: opts.imageDataUrls,
      signal: opts.signal,
      maxOutputTokens: opts.maxOutputTokens,
    });
    try {
      return {
        object: parse(res.text),
        durationMs: Date.now() - started,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
      };
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      const retry = await this.generateText({
        modelId: opts.modelId,
        system: `${opts.system}\n\nRespond with ONLY the JSON object — no <think> tags, no reasoning, no prose, no markdown fences.`,
        prompt: opts.prompt,
        imageDataUrls: opts.imageDataUrls,
        signal: opts.signal,
        maxOutputTokens: (opts.maxOutputTokens ?? 2000) * 2,
      });
      return {
        object: parse(retry.text),
        durationMs: Date.now() - started,
        inputTokens: retry.inputTokens,
        outputTokens: retry.outputTokens,
      };
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
      model: this.resolveModel(opts.modelId),
      system: opts.system,
      messages: imageReferenceMessage(opts.prompt, images),
      abortSignal: withCallTimeout(opts.signal, this.callTimeoutMs),
      maxRetries: 0,
      maxOutputTokens: opts.maxOutputTokens ?? 1200,
      providerOptions: this.gateway ? gatewayProviderOptions(this.only, opts.modelId) : undefined,
    });
    return {
      text: res.text,
      durationMs: Date.now() - started,
      inputTokens: res.usage?.inputTokens,
      outputTokens: res.usage?.outputTokens,
    };
  }

  async listModels(): Promise<{ id: string; name?: string }[]> {
    if (!this.gateway) return [];
    const catalog = await this.gateway.getAvailableModels();
    return catalog.models.map((m) => ({ id: m.id, name: m.name }));
  }
}
