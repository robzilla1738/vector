import { AuxError } from "@aux/contracts";
import type { ModelClient, ToolCallStepResult } from "../model-client.js";
import type {
  LoopToolCall,
  LoopToolContext,
  LoopToolDeps,
  LoopToolManifest,
  LoopToolResult,
  LoopPark,
  ModelMessage,
} from "./types.js";
import { parkAnswerOutput, toolResultsMessage } from "./types.js";
import { TranscriptStore } from "./transcript.js";
import { buildSystemPrompt } from "./prompt.js";
import { budgetToolOutputs, compactMessages, pruneMedia, transcriptBytes, TRANSCRIPT_COMPACT_BYTES } from "./context.js";
import { parseLooseJson } from "./tools.js";

/**
 * The durable agent loop (S5): the model calls tools; each round trip is one
 * billed `toolCallStep`; tool results append to the run's durable transcript
 * before the next call. Suspending tools park the run — the parked call's
 * eventual tool result IS the resolution, so a resume loses no executed
 * side effects and replaying is never needed.
 */
export interface AgentLoopOptions {
  model: Pick<ModelClient, "toolCallStep">;
  modelId: string;
  tools: LoopToolManifest;
  transcript: TranscriptStore;
  runId: string;
  threadId: string;
  turnId?: string;
  /** Base prompt; defaults to the assembled system prompt + conditional docs. */
  system?: string;
  deps: LoopToolDeps;
  /** Active page — a getter lets the host retarget mid-run (detached fallback). */
  pageId?: string | (() => string | undefined);
  signal?: AbortSignal;
  /** Step cap for this invocation — the run-level budget lives in the host. */
  maxSteps?: number;
  /** New steer pending → stop before the next model call (or after in-flight tools). */
  steerCheck?: () => boolean;
  /** Pre-call gate (D11 budgets): throws before the model step is billed. */
  beforeModelCall?: () => void | Promise<void>;
  /** Called after each model step is persisted — usage/billing/reporting. */
  onStep?: (info: { index: number; step: ToolCallStepResult }) => void | Promise<void>;
  /** Called after each tool executes — status/byline reporting. */
  onToolCall?: (call: LoopToolCall, result: LoopToolResult) => void;
  /** Per-provider options merged into the client's defaults (prompt caching keys). */
  providerOptions?: Record<string, Record<string, unknown>>;
  /** Include the WebMCP conditional doc when this page has registered tools. */
  webmcp?: boolean;
  maxOutputTokens?: number;
}

export type AgentLoopOutcome =
  | { kind: "done"; text: string; result?: Record<string, unknown> }
  | { kind: "parked"; park: LoopPark; toolCallId: string }
  | { kind: "steered" }
  | { kind: "exhausted" }
  | { kind: "failed"; error: AuxError };

const DEFAULT_MAX_LOOP_STEPS = 24;

/** Provider markup a model leaks when it serialises calls into text rather than emitting real tool calls. */
const LEAKED_TOOL_MARKUP = /<(?:atem|antml)[:\w-]*(?:function_calls|invoke|tool_call)|<invoke\s+name="[\w.]+"/i;

/** Muse serialises a real call as `<atem:invoke name="default.submit_result">`. Run it instead of spending another turn. */
function parseLeakedToolCalls(text: string): LoopToolCall[] {
  const calls: LoopToolCall[] = [];
  const invokeRe = /<(?:atem|antml):invoke\s+name="([^"]+)">([\s\S]*?)<\/(?:atem|antml):invoke>/gi;
  for (const invoke of text.matchAll(invokeRe)) {
    const rawName = invoke[1]?.trim() ?? "";
    const toolName = rawName.includes(".") ? rawName.slice(rawName.lastIndexOf(".") + 1) : rawName;
    if (!toolName) continue;
    const input: Record<string, unknown> = {};
    const paramRe = /<(?:atem|antml):parameter\s+name="([^"]+)">([\s\S]*?)<\/(?:atem|antml):parameter>/gi;
    for (const param of invoke[2]?.matchAll(paramRe) ?? []) {
      const key = param[1]?.trim() ?? "";
      if (!key) continue;
      input[key] = looseParameter(param[2] ?? "");
    }
    calls.push({ toolCallId: `leaked-${calls.length + 1}`, toolName, input });
  }
  return calls;
}

function looseParameter(raw: string): unknown {
  const text = raw.trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      return parseLooseJson(text);
    } catch {
      return text;
    }
  }
  return text;
}

function withoutLeakedMarkup(message: ModelMessage): ModelMessage {
  if (message.role !== "assistant" || !Array.isArray(message.content)) return message;
  const content = message.content.flatMap((part) => {
    if (!part || typeof part !== "object" || !("type" in part) || part.type !== "text" || !("text" in part) || typeof part.text !== "string") return [part];
    if (!LEAKED_TOOL_MARKUP.test(part.text)) return [part];
    const text = part.text.replace(/<(?:atem|antml):function_calls>[\s\S]*?<\/(?:atem|antml):function_calls>/gi, "").trim();
    return text ? [{ ...part, text }] : [];
  });
  return { ...message, content };
}

/** Tool calls in a message that still have no following tool result — an in-flight interrupted step. */
function unansweredToolCalls(messages: ModelMessage[]): LoopToolCall[] {
  const last = messages.at(-1);
  if (last?.role !== "assistant" || !Array.isArray(last.content)) return [];
  const calls = last.content.filter((part): part is { type: "tool-call"; toolCallId: string; toolName: string; input: unknown } =>
    typeof part === "object" && part !== null && (part as { type?: string }).type === "tool-call",
  );
  return calls.map((part) => ({ toolCallId: part.toolCallId, toolName: part.toolName, input: part.input }));
}

/** An interrupted step's unanswered calls get honest placeholders — never silent drops. */
function interruptedResults(calls: LoopToolCall[], reason: string): { toolCallId: string; toolName: string; output: unknown }[] {
  return calls.map((call) => ({
    toolCallId: call.toolCallId, toolName: call.toolName,
    output: { interrupted: true, detail: reason },
  }));
}

async function executeOne(
  toolName: string,
  call: LoopToolCall,
  tools: LoopToolManifest,
  ctx: LoopToolContext,
): Promise<LoopToolResult> {
  const tool = tools[toolName];
  if (!tool) return { output: new AuxError("capability_unsupported", `Unknown tool: ${toolName}`) };
  if (tool.requiresSoloCall && ctx.callCount > 1) {
    return { output: new AuxError("invalid_params", `${toolName} must be the only tool call in its turn. Re-issue it alone.`) };
  }
  try {
    return await tool.execute(call.input, ctx);
  } catch (error) {
    if (ctx.signal?.aborted) throw error;
    return { output: error instanceof Error ? error : new Error(String(error)) };
  }
}

/** The provider pairs each tool result with a tool-call part. A text-only assistant message plus a result is a duplicate or an orphan output. */
function assistantWithToolCalls(message: ModelMessage, calls: LoopToolCall[]): ModelMessage {
  const content = message.role === "assistant" && Array.isArray(message.content)
    ? [...message.content]
    : message.role === "assistant" && typeof message.content === "string" && message.content
      ? [{ type: "text" as const, text: message.content }]
      : [];
  const present = new Set(content.flatMap((part) =>
    part && typeof part === "object" && "type" in part && part.type === "tool-call" && "toolCallId" in part
      ? [String(part.toolCallId)]
      : []));
  for (const call of calls) {
    if (!present.has(call.toolCallId)) content.push({ type: "tool-call", toolCallId: call.toolCallId, toolName: call.toolName, input: call.input });
  }
  return { role: "assistant", content };
}

export async function runAgentLoop(opts: AgentLoopOptions): Promise<AgentLoopOutcome> {
  const { model, tools, transcript, runId } = opts;
  if (!model.toolCallStep) {
    return { kind: "failed", error: new AuxError("capability_unsupported", "The configured model client does not support tool calling.") };
  }
  const messages = transcript.load(runId);
  const system = opts.system ?? buildSystemPrompt({
    hasPage: !!opts.pageId,
    webEnabled: !!(opts.deps.webFetch || opts.deps.webSearch),
    webmcp: opts.webmcp === true,
  });
  const maxSteps = Math.max(1, opts.maxSteps ?? DEFAULT_MAX_LOOP_STEPS);
  const sdkTools = Object.fromEntries(
    Object.entries(tools).map(([name, tool]) => [name, { description: `${tool.description}\n\n(${tool.byline})`, inputSchema: tool.inputSchema }]),
  );

  // Auto-recall (06-Z): query content memory for the task once, durably. The
  // recall message lands before any assistant turn, so every later step shares
  // the same cache prefix.
  if (opts.deps.recall && messages.length === 1 && messages[0]?.role === "user" && typeof messages[0].content === "string") {
    try {
      const hits = await opts.deps.recall(messages[0].content, { runId, threadId: opts.threadId, turnId: opts.turnId ?? runId });
      if (hits?.length) {
        const recallMessage = {
          role: "user" as const,
          content: `Auto-recalled memory (verify against the live page before citing):\n${hits
            .map((hit) => `- ${hit.title} — ${hit.url}\n  ${hit.text}`)
            .join("\n")}`,
        } as ModelMessage;
        messages.push(recallMessage);
        transcript.append(runId, [recallMessage]);
      }
    } catch {
      /* recall is best-effort — a memory failure never blocks the run */
    }
  }

  for (let index = 0; index < maxSteps; index++) {
    if (opts.signal?.aborted) return { kind: "failed", error: new AuxError("cancelled", "cancelled") };
    if (opts.steerCheck?.()) return { kind: "steered" };

    // Deterministic compaction (06-Z): when the serialized history passes the
    // cap, the oldest half shrinks to placeholders — persisted so a restart
    // rebuilds the same compact context.
    if (transcriptBytes(messages) > TRANSCRIPT_COMPACT_BYTES) {
      const compacted = compactMessages(messages);
      if (compacted) {
        const entries = transcript.entries(runId);
        transcript.rewrite(
          runId,
          compacted.changed.map((i) => ({ seq: entries[i]!.seq, message: compacted.messages[i]! })),
        );
        messages.splice(0, messages.length, ...compacted.messages);
      }
    }

    let step;
    try {
      await opts.beforeModelCall?.();
      step = await model.toolCallStep({
        modelId: opts.modelId,
        system,
        messages,
        tools: sdkTools,
        signal: opts.signal,
        providerOptions: opts.providerOptions,
        sessionId: opts.threadId,
        maxOutputTokens: opts.maxOutputTokens,
      });
    } catch (error) {
      if (opts.steerCheck?.()) return { kind: "steered" };
      return { kind: "failed", error: error instanceof AuxError ? error : new AuxError("step_failed", error instanceof Error ? error.message : String(error)) };
    }

    let toolCalls = step.toolCalls.filter((call) => !step.providerExecuted?.includes(call.toolCallId));
    let assistant = assistantWithToolCalls(step.message, toolCalls);
    if (!toolCalls.length && step.text && LEAKED_TOOL_MARKUP.test(step.text)) {
      const recovered = parseLeakedToolCalls(step.text);
      if (recovered.length) {
        toolCalls = recovered;
        assistant = withoutLeakedMarkup(assistantWithToolCalls(step.message, recovered));
      }
    }
    messages.push(assistant);
    transcript.append(runId, [assistant]);
    await opts.onStep?.({ index, step });

    if (!toolCalls.length) {
      // Markup that is not a complete invoke still gets one correction.
      if (step.text && LEAKED_TOOL_MARKUP.test(step.text)) {
        const nudge: ModelMessage = { role: "user",
          content: "Your last message contained raw function-call markup instead of real tool calls — it was not executed. Issue the actual tool call (submit_result to finish), not its markup." };
        messages.push(nudge);
        transcript.append(runId, [nudge]);
        continue;
      }
      return { kind: "done", text: step.text ?? "" };
    }

    const ctx: LoopToolContext = {
      runId, threadId: opts.threadId, turnId: opts.turnId ?? runId,
      pageId: typeof opts.pageId === "function" ? opts.pageId() : opts.pageId,
      signal: opts.signal, callCount: toolCalls.length,
      goalTurn: messages.filter(message => message.role === "assistant").length,
      deps: opts.deps,
    };

    // submit_result finishes the turn. Run the work first so a same-turn
    // answer still performs the actions it reports.
    const ordered = [
      ...toolCalls.filter((call) => call.toolName !== "submit_result"),
      ...toolCalls.filter((call) => call.toolName === "submit_result"),
    ];
    const results: { toolCallId: string; toolName: string; output?: unknown; parked?: boolean }[] = [];
    let parked: { call: LoopToolCall; park: LoopPark } | undefined;
    let finished: Record<string, unknown> | undefined;
    for (const call of ordered) {
      const result = await executeOne(call.toolName, call, tools, ctx);
      if ("park" in result) {
        parked = { call, park: result.park };
        results.push({ toolCallId: call.toolCallId, toolName: call.toolName, parked: true });
        break;
      }
      if ("finish" in result) {
        // Verification v2 — a terminal tool ends the run with its verified
        // result. The persisted tool result stays an honest acceptance.
        finished = result.finish.result;
        results.push({ toolCallId: call.toolCallId, toolName: call.toolName, output: { accepted: true } });
        opts.onToolCall?.(call, result);
        break;
      }
      results.push({ toolCallId: call.toolCallId, toolName: call.toolName, output: result.output });
      opts.onToolCall?.(call, result);
    }

    // Media pruning + the per-turn tool budget (06-Z): embedded payloads
    // shrink to markers before they persist, and aggregate output past 40 KB
    // truncates with an honest note.
    for (const result of results) if ("output" in result) result.output = pruneMedia(result.output);
    results.splice(0, results.length, ...budgetToolOutputs(results));

    if (parked) {
      // Calls that never ran still need a result so the transcript stays paired.
      const answered = new Set(results.map((result) => result.toolCallId));
      for (const call of toolCalls) {
        if (answered.has(call.toolCallId)) continue;
        results.push({
          toolCallId: call.toolCallId, toolName: call.toolName,
          output: { interrupted: true, detail: "a suspension ended this step; the call was not executed — re-issue if still needed." },
        });
      }
      transcript.park(runId, {
        toolCallId: parked.call.toolCallId,
        toolName: parked.call.toolName,
        pendingResults: results.map((r) => (r.parked ? { toolCallId: r.toolCallId, toolName: r.toolName, parked: true } : { toolCallId: r.toolCallId, toolName: r.toolName, output: r.output })),
      });
      return { kind: "parked", park: parked.park, toolCallId: parked.call.toolCallId };
    }

    const toolMessage = toolResultsMessage(results.map((r) => ({ toolCallId: r.toolCallId, toolName: r.toolName, output: r.output })));

    if (finished !== undefined) {
      // A verified result beats a pending steer — the run is already done;
      // the interruption lands as its own turn afterwards.
      messages.push(toolMessage);
      transcript.append(runId, [toolMessage]);
      const text = typeof finished.report === "string" ? finished.report : "";
      return { kind: "done", text, result: finished };
    }

    if (opts.steerCheck?.()) {
      // The step's calls executed but a steer landed — answer the unanswered
      // calls honestly, then hand control back.
      const toolMessage = toolResultsMessage([
        ...results.map((r) => ({ toolCallId: r.toolCallId, toolName: r.toolName, output: r.output })),
        ...interruptedResults(unansweredToolCalls(messages).filter((c) => !results.some((r) => r.toolCallId === c.toolCallId)), "interrupted by a user steer"),
      ]);
      messages.push(toolMessage);
      transcript.append(runId, [toolMessage]);
      return { kind: "steered" };
    }

    messages.push(toolMessage);
    transcript.append(runId, [toolMessage]);
  }
  return { kind: "exhausted" };
}

/**
 * Resume a parked run: the suspension's answer becomes the parked call's
 * tool result (joined with the results captured before parking), then the
 * loop continues. The host calls this after the suspension resolves.
 */
export async function resumeAgentLoop(opts: AgentLoopOptions, answer: unknown): Promise<AgentLoopOutcome> {
  const { transcript, runId } = opts;
  const parked = transcript.openPark(runId);
  if (!parked) return { kind: "failed", error: new AuxError("not_found", "This run has no parked tool call to resume.") };
  const message = toolResultsMessage(
    parked.pendingResults.map((part) =>
      "parked" in part
        ? { toolCallId: part.toolCallId, toolName: part.toolName, output: parkAnswerOutput(answer) }
        : { toolCallId: part.toolCallId, toolName: part.toolName, output: part.output },
    ),
  );
  transcript.resolvePark(runId, message);
  return runAgentLoop(opts);
}
