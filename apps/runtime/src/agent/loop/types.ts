import type { z } from "zod";
import type { ModelMessage } from "ai";
import type { ResultCitation, SuspensionKind } from "@aux/contracts";

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
  | { park: LoopPark }
  /**
   * Verification v2 — a terminal tool's verified result ends the run. The
   * loop persists an `{accepted:true}` tool result for pairing, then the
   * run completes with this record (not raw model text).
   */
  | { finish: { result: Record<string, unknown> } };

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
  /** Confined file tools (read_file/write_file/edit_file) — the host enforces the root guard. */
  fileRead?: (path: string) => Promise<string>;
  fileWrite?: (path: string, content: string) => Promise<void>;
  /** `bash` under the seatbelt — network off by default; `{park}` propagates a gate ask. */
  bash?: (
    input: { command: string; timeoutMs?: number; workdir?: string; network?: boolean },
    ctx: { runId: string; threadId: string; turnId: string },
  ) => Promise<LoopToolResult>;
  /** Browser-history search (06-X history_search). */
  historySearch?: (query: string, limit: number) => Promise<{ url: string; title: string; pageId?: string; visitedAt: number }[]>;
  /** Protected page-memory search under the run's workspace policy (06-X memory_search). */
  memorySearch?: (
    query: string,
    ctx: { runId: string; threadId: string; turnId: string },
  ) => Promise<{ title: string; url: string; text: string; capturedAt: number }[]>;
  /** Subagent cells (06-Y): spawn/wait/send/cancel for the manifest tools. */
  subagents?: {
    spawnCell?: (input: { goal: string; profile?: string; pageIds?: string[] }, ctx: { runId: string; threadId: string; turnId: string }) => Promise<{ cellId: string }>;
    waitCell?: (cellId: string, timeoutMs: number) => Promise<{ state: string; runId?: string; pending?: boolean; result?: unknown; error?: string }>;
    sendCell?: (cellId: string, text: string) => Promise<void>;
    cancelCell?: (cellId: string) => Promise<void>;
  };
  /** `routine_update` — recipient-scoped decide() first; `{park}` propagates the ask. */
  routineUpdate?: (
    input: { routineId: string; title?: string; description?: string; objective?: string; trigger?: unknown; paused?: boolean; expectedRevision?: number },
    ctx: { runId: string; threadId: string; turnId: string },
  ) => Promise<LoopToolResult>;
  /** `notification` — a durable notice on the run's event stream. */
  notify?: (input: { text: string }, ctx: { runId: string; threadId: string; turnId: string }) => Promise<void>;
  /** Persisted todo scratchpad (write_todos). */
  writeTodos?: (todos: string[]) => Promise<void> | void;
  /**
   * Verification v2 — `submit_result` verify-and-finish. The host checks
   * every citation's quote against the cited snapshot's rendered text and
   * marks unconfirmed writes; `ok:false` returns the error to the model so
   * it can re-cite and retry.
   */
  submitResult?: (
    input: { report: string; citations?: ResultCitation[] },
    ctx: LoopToolContext,
  ) => Promise<{ ok: true; result: Record<string, unknown> } | { ok: false; error: string }>;
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
