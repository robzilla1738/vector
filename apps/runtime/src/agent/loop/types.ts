import type { z } from "zod";
import type { ModelMessage } from "ai";
import type { SuspensionKind } from "@aux/contracts";

/**
 * The provider-agnostic message type is the SDK's `ModelMessage` — a
 * type-only import, so the loop never takes a runtime dependency on `ai`.
 * Message construction uses plain literals that satisfy the shape.
 */
export type { ModelMessage } from "ai";

/** One tool call a model emitted in a step. */
export interface LoopToolCall {
  toolCallId: string;
  toolName: string;
  input: unknown;
}

/** What a single `toolCallStep` round trip produced. */
export interface LoopStep {
  /** Assistant message to append to the transcript (tool-call parts included). */
  message: ModelMessage;
  toolCalls: LoopToolCall[];
  /** Model text when the step produced no tool calls — the turn's answer. */
  text?: string;
  finishReason?: string;
  /** Tool results that were provider-executed; already answered in-band. */
  providerExecuted?: string[];
}

/**
 * A tool's execute may return output, or `park` the run: the loop stops,
 * the host records a typed suspension, and the parked call's eventual tool
 * result IS the resolution (approval answer, user answer, …).
 */
export interface LoopPark {
  kind: SuspensionKind;
  /** Text shown to the user / planner when the suspension resolves. */
  instruction: string;
  /** Approval suspensions resolve through the approval record. */
  approvalId?: string;
  /** Extra detail persisted on the suspension (never shown to the model). */
  detail?: Record<string, unknown>;
}

export type LoopToolResult =
  | { output: unknown }
  | { park: LoopPark };

/** Service surface a loop tool executes against. */
export interface LoopToolDeps {
  /** Observe a page: the observation renderer's text becomes the tool output. */
  observe?: (input: { pageId: string; scope?: import("@aux/contracts").ObservationScope; subtreeRef?: string }) => Promise<{ text: string; observationId: string; revision: number }>;
  /**
   * Compile + authorize + execute + journal a step batch on a page.
   * Returns LoopToolResult so a safety `ask` raised inside the gate can
   * park the loop on the suspension it already created.
   */
  act?: (input: { pageId: string; steps: import("@aux/contracts").Step[] }) => Promise<LoopToolResult>;
  /**
   * Cookie-free web fetch; the destination runs through decide() first —
   * an `ask` parks the loop on the suspension it creates.
   */
  webFetch?: (url: string, ctx: { runId: string; threadId: string; turnId: string }) => Promise<LoopToolResult>;
  webSearch?: (query: string, ctx: { runId: string; threadId: string; turnId: string }) => Promise<LoopToolResult>;
  /** The code-mode REPL: eval guest code against the persistent per-run session. */
  repl?: (input: { code: string; deadlineMs?: number }, ctx: LoopToolContext) => Promise<LoopToolResult>;
  /** Auto-recall (06-Z): query content memory for the task — hits land as one durable system message. */
  recall?: (query: string, ctx: { runId: string; threadId: string; turnId: string }) => Promise<{ title: string; url: string; text: string }[]>;
  /** Session/workspace file roots — fs tools stay inside them (S4 upload roots). */
  fsRoots?: () => string[];
  /** Persisted todo scratchpad (write_todos). */
  writeTodos?: (todos: string[]) => Promise<void> | void;
}

/** Context a tool executes in: the run, its page, and the runtime surface. */
export interface LoopToolContext {
  runId: string;
  /** Active page when a run claims one; page tools require it. */
  pageId?: string;
  threadId: string;
  turnId: string;
  /** Number of tool calls in this step — `requiresSoloCall` tools need 1. */
  callCount: number;
  deps: LoopToolDeps;
  signal?: AbortSignal;
}

/** One manifest entry — the single source shared by loop, MCP, CLI and SDK surfaces. */
export interface LoopTool {
  /** Short provider-facing description (before the byline line). */
  description: string;
  /** One-line provenance shown to the model and the user (05-B). */
  byline: string;
  inputSchema: z.ZodType;
  /**
   * Suspension tools (`ask_user_question`, `request_action_confirmation`)
   * must be the only tool call in their step — the model's park turn.
   */
  requiresSoloCall?: boolean;
  execute: (input: unknown, ctx: LoopToolContext) => Promise<LoopToolResult> | LoopToolResult;
}

export type LoopToolManifest = Record<string, LoopTool>;

/** Construct a `tool`-role ModelMessage from tool results (SDK 7 shape). */
export function toolResultsMessage(parts: Array<{ toolCallId: string; toolName: string; output: unknown }>): ModelMessage {
  return {
    role: "tool",
    content: parts.map((part) => ({
      type: "tool-result" as const,
      toolCallId: part.toolCallId,
      toolName: part.toolName,
      output: part.output instanceof Error
        ? ({ type: "error-text" as const, value: part.output.message })
        : typeof part.output === "string"
          ? ({ type: "text" as const, value: part.output })
          : ({ type: "json" as const, value: (part.output ?? null) as never }),
    })),
  } as ModelMessage;
}

/** The tool-result part a resumed suspension appends for its parked call. */
export function parkAnswerOutput(answer: unknown): unknown {
  return typeof answer === "string" ? answer : (answer ?? { resolved: true });
}
