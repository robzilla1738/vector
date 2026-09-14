import { generateObject, generateText } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { VectorError } from "@vector/contracts";
import type { ModelClient, StructuredCallResult, TextCallResult } from "./model-client.js";

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

  constructor(apiKey: string) {
    if (!apiKey) throw new VectorError("invalid_params", "AI_GATEWAY_API_KEY is required");
    this.gateway = createGateway({ apiKey });
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
        abortSignal: opts.signal,
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
      abortSignal: opts.signal,
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
