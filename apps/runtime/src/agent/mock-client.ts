import type { z } from "zod";
import type { ModelMessage } from "ai";
import {
  FALLBACK_MODELS,
  type ModelClient,
  type StructuredCallResult,
  type TextCallResult,
  type ToolCallStepResult,
} from "./model-client.js";

type StructuredHandler = (prompt: string) => unknown | MeteredPlan;

/** Explicit model usage. Never derive tokens from prompt bytes. */
export interface MeteredPlan {
  object: unknown;
  inputTokens: number;
  outputTokens: number;
}

function isMetered(raw: unknown): raw is MeteredPlan {
  return (
    !!raw &&
    typeof raw === "object" &&
    "object" in raw &&
    "inputTokens" in raw &&
    typeof (raw as MeteredPlan).inputTokens === "number"
  );
}

/**
 * Deterministic model for tests and benchmarks. Handlers inspect the
 * rendered prompt (goal + observation text) and return the next plan chunk.
 */
export class MockModelClient implements ModelClient {
  calls: { modelId: string; prompt: string; system: string }[] = [];
  private queue: StructuredHandler[] = [];
  private fallback: StructuredHandler = () => ({ status: "done", message: "done (mock)", result: {} });
  latencyMs = 0;
  /** Declared usage when a handler does not return a MeteredPlan. */
  inputTokens = 0;
  outputTokens = 0;

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
    const handler = this.queue.length > 1 ? this.queue.shift()! : (this.queue[0] ?? this.fallback);
    const raw = handler(opts.prompt);
    const metered = isMetered(raw);
    const object = opts.schema.parse(metered ? raw.object : raw) as T;
    return {
      object,
      durationMs: this.latencyMs,
      inputTokens: metered ? raw.inputTokens : this.inputTokens,
      outputTokens: metered ? raw.outputTokens : this.outputTokens,
    };
  }

  async generateText(): Promise<TextCallResult> {
    return { text: "mock", durationMs: this.latencyMs };
  }

  /**
   * Scripted tool-loop steps (S5): each handler sees the message history and
   * returns tool calls or the final text — the same seam the real client
   * fills with `generateText` + client-side tools.
   */
  toolSteps: { toolCalls?: { toolCallId: string; toolName: string; input?: unknown }[]; text?: string }[] =
    [];
  scriptToolSteps(steps: MockModelClient["toolSteps"]) {
    this.toolSteps = [...steps];
    return this;
  }

  async toolCallStep(_opts: {
    modelId: string;
    system: string;
    messages: ModelMessage[];
    tools: Record<string, { description?: string; inputSchema: z.ZodType }>;
  }): Promise<ToolCallStepResult> {
    if (this.latencyMs) await new Promise((r) => setTimeout(r, this.latencyMs));
    const scripted =
      this.toolSteps.length > 1 ? this.toolSteps.shift()! : (this.toolSteps[0] ?? { text: "done (mock)" });
    const calls = (scripted.toolCalls ?? []).map((c, i) => ({
      toolCallId: c.toolCallId || `call-${i + 1}`,
      toolName: c.toolName,
      input: c.input ?? {},
    }));
    const content = [
      ...(scripted.text ? [{ type: "text" as const, text: scripted.text }] : []),
      ...calls.map((c) => ({
        type: "tool-call" as const,
        toolCallId: c.toolCallId,
        toolName: c.toolName,
        input: c.input,
      })),
    ];
    return {
      durationMs: this.latencyMs,
      message: { role: "assistant", content } as ModelMessage,
      toolCalls: calls,
      text: scripted.text,
      finishReason: calls.length ? "tool-calls" : "stop",
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
    };
  }

  async listModels() {
    return FALLBACK_MODELS;
  }
}
