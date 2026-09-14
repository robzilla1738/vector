import type { z } from "zod";
import { FALLBACK_MODELS, type ModelClient, type StructuredCallResult, type TextCallResult } from "./model-client.js";

type StructuredHandler = (prompt: string) => unknown;

/**
 * Deterministic model for tests and benchmarks. Handlers inspect the
 * rendered prompt (goal + observation text) and return the next plan chunk.
 */
export class MockModelClient implements ModelClient {
  calls: { modelId: string; prompt: string; system: string }[] = [];
  private queue: StructuredHandler[] = [];
  private fallback: StructuredHandler = () => ({ status: "done", message: "done (mock)", result: {} });
  latencyMs = 0;

  /** Each entry handles one planner call in order; the last repeats. */
  scripted(handlers: StructuredHandler[]) {
    this.queue = [...handlers];
    return this;
  }
  always(handler: StructuredHandler) {
    this.fallback = handler;
    return this;
  }

  async generateStructured<T>(opts: {
    modelId: string;
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
  }): Promise<StructuredCallResult<T>> {
    if (this.latencyMs) await new Promise((r) => setTimeout(r, this.latencyMs));
    this.calls.push({ modelId: opts.modelId, prompt: opts.prompt, system: opts.system });
    const handler = this.queue.length > 1 ? this.queue.shift()! : this.queue[0] ?? this.fallback;
    const raw = handler(opts.prompt);
    const object = opts.schema.parse(raw) as T;
    return { object, durationMs: this.latencyMs, inputTokens: opts.prompt.length >> 2, outputTokens: 64 };
  }

  async generateText(): Promise<TextCallResult> {
    return { text: "mock", durationMs: this.latencyMs };
  }

  async listModels() {
    return FALLBACK_MODELS;
  }
}
