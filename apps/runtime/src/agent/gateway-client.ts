import {
  APICallError,
  generateObject,
  generateText,
  JSONParseError,
  NoObjectGeneratedError,
  TypeValidationError,
  UnsupportedFunctionalityError,
} from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { VectorError } from "@vector/contracts";
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
  if (APICallError.isInstance(e)) {
    // a 400 that names the structured-output feature — everything else is not ours to retry
    return e.statusCode === 400 && /response_format|json_schema|structured|schema|tool_choice|tools?\b/i.test(e.message);
  }
  return false;
}

/** Pull the first balanced JSON value out of a text completion (fences or prose allowed around it). */
export function extractJson(text: string): unknown {
  const start = text.search(/[{[]/);
  if (start < 0) throw new VectorError("model_output_invalid", "model returned no JSON value");
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i]!;
    if (esc) { esc = false; continue; }
    if (c === "\\") { if (inStr) esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") {
      if (stack.pop() !== (c === "}" ? "{" : "[")) break;
      if (stack.length === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new VectorError("model_output_invalid", "model returned truncated or unbalanced JSON");
}

/**
 * Vercel AI Gateway client. One explicit retry owner: the app sets
 * maxRetries 0 and owns repair/cancellation itself. The provider chooses
 * its own base URL — the SDK endpoint is not the OpenAI-compatible REST URL.
 */
export class GatewayModelClient implements ModelClient {
  private gateway: ReturnType<typeof createGateway>;
  private readonly callTimeoutMs: number;

  constructor(apiKey: string, opts: { callTimeoutMs?: number } = {}) {
    if (!apiKey) throw new VectorError("invalid_params", "AI_GATEWAY_API_KEY is required");
    this.gateway = createGateway({ apiKey });
    this.callTimeoutMs = opts.callTimeoutMs && opts.callTimeoutMs > 0 ? opts.callTimeoutMs : DEFAULT_MODEL_CALL_TIMEOUT_MS;
  }

  async generateStructured<T>(opts: {
    modelId: string;
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<StructuredCallResult<T>> {
    const started = Date.now();
    try {
      const res = await generateObject({
        model: this.gateway(opts.modelId),
        schema: opts.schema,
        system: opts.system,
        prompt: opts.prompt,
        abortSignal: withCallTimeout(opts.signal, this.callTimeoutMs),
        maxRetries: 0,
        maxOutputTokens: opts.maxOutputTokens ?? 2000,
        providerOptions: {
          gateway: { sort: "ttft", caching: "auto" },
          // reasoning models (muse, gpt-5*, o*) spend output tokens thinking;
          // minimal effort keeps planning snappy — namespaced so other
          // providers ignore it
          openai: { reasoningEffort: "minimal" },
        },
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
      // Models without structured-output support (e.g. meta/muse-*) get a
      // JSON-in-text fallback: ask for strict JSON, extract, schema-validate.
      // Anything that is not a structured-output failure (401/403/429/5xx,
      // network, timeout) propagates untouched — no retry amplification.
      if (!isStructuredOutputError(e)) throw e;
      const jsonSchema = JSON.stringify(z.toJSONSchema(opts.schema));
      const res = await this.generateText({
        modelId: opts.modelId,
        system: `${opts.system}\n\nRespond with ONLY a JSON value that validates against this JSON Schema — no prose, no markdown fences:\n${jsonSchema}`,
        prompt: opts.prompt,
        signal: opts.signal,
        maxOutputTokens: opts.maxOutputTokens,
      });
      let object: T;
      try {
        object = opts.schema.parse(extractJson(res.text));
      } catch (e) {
        if (opts.signal?.aborted) throw e;
        // reasoning models can spend their token budget thinking and truncate
        // the JSON — retry once with a terser instruction and double headroom
        const retry = await this.generateText({
          modelId: opts.modelId,
          system: `${opts.system}\n\nRespond with ONLY the JSON object — no reasoning, no prose, no markdown fences. Keep it complete and valid against this JSON Schema:\n${jsonSchema}`,
          prompt: opts.prompt,
          signal: opts.signal,
          maxOutputTokens: (opts.maxOutputTokens ?? 2000) * 2,
        });
        object = opts.schema.parse(extractJson(retry.text));
        return {
          object,
          durationMs: Date.now() - started,
          inputTokens: retry.inputTokens,
          outputTokens: retry.outputTokens,
        };
      }
      return {
        object,
        durationMs: Date.now() - started,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
      };
    }
  }

  async generateText(opts: {
    modelId: string;
    system?: string;
    prompt: string;
    imageDataUrl?: string;
    signal?: AbortSignal;
    maxOutputTokens?: number;
  }): Promise<TextCallResult> {
    const started = Date.now();
    const res = await generateText({
      model: this.gateway(opts.modelId),
      system: opts.system,
      messages: opts.imageDataUrl
        ? [
            {
              role: "user",
              content: [
                { type: "text", text: opts.prompt },
                { type: "image", image: opts.imageDataUrl },
              ],
            },
          ]
        : [{ role: "user", content: opts.prompt }],
      abortSignal: withCallTimeout(opts.signal, this.callTimeoutMs),
      maxRetries: 0,
      maxOutputTokens: opts.maxOutputTokens ?? 1200,
      providerOptions: {
        gateway: { sort: "ttft", caching: "auto" },
        openai: { reasoningEffort: "minimal" },
      },
    });
    return {
      text: res.text,
      durationMs: Date.now() - started,
      inputTokens: res.usage?.inputTokens,
      outputTokens: res.usage?.outputTokens,
    };
  }

  async listModels(): Promise<{ id: string; name?: string }[]> {
    const catalog = await this.gateway.getAvailableModels();
    return catalog.models.map((m) => ({ id: m.id, name: m.name }));
  }
}
