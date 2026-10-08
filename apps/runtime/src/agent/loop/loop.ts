import { MentionUnavailable } from "../turn-mentions.js";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import type { ModelClient, ToolCallStepResult } from "../model-client.js";
import type {
  LoopToolCall,
  LoopToolContext,
  LoopToolDeps,
  LoopToolManifest,
  LoopToolResult,
  LoopPark,
  PreparedRead,
  ModelMessage,
} from "./types.js";
import { parkAnswerOutput, toolResultsMessage } from "./types.js";
import { TranscriptStore } from "./transcript.js";
import { buildSystemPrompt } from "./prompt.js";
import { annotateToolFailure, pruneMedia } from "./context.js";
import { prepareWorkingContext } from "./working-context.js";
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
  modelSource?: import("../model-client.js").ModelCallSource;
  /** Actual provider text, published independently of complete tool dispatch. */
  onText?: (text: string) => void;
  afterModelCall?: () => void;
  onModelAdmissionCancelled?: (reservationId: string | undefined) => void;
  prepareModelMessages?: (messages: ModelMessage[]) => Promise<ModelMessage[]>;
  modelId: string;
  reasoning?: "low" | "medium" | "high";
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
  beforeModelCall?: (request: {
    modelId: string;
    promptBytes: number;
    toolsBytes: number;
    maxOutputTokens: number;
  }) => string | undefined | Promise<string | undefined>;
  /** Called after each model step is persisted — usage/billing/reporting. */
  onStep?: (info: {
    index: number;
    step: ToolCallStepResult;
    reservationId?: string;
  }) => void | Promise<void>;
  /** A dispatched provider request failed; persist every attempted call before returning. */
  onModelFailure?: (info: { index: number; error: unknown; reservationId?: string }) => void | Promise<void>;
  /** A funded Goal permits one provider attempt per reservation. */
  maxAttempts?: 1;
  /** Called after each tool executes — status/byline reporting. */
  beforeToolCall?: (call: LoopToolCall) => Promise<void>;
  onToolCall?: (call: LoopToolCall, result: LoopToolResult) => void;
  /** Per-provider options merged into the client's defaults (prompt caching keys). */
  providerOptions?: Record<string, Record<string, unknown>>;
  /** Include the WebMCP conditional doc when this page has registered tools. */
  webmcp?: boolean;
  hasProject?: boolean;
  maxOutputTokens?: number;
  /** Context window from the selected route's model capability metadata. */
  contextTokens?: number;
}

export type AgentLoopOutcome =
  | { kind: "done"; text: string; result?: Record<string, unknown> }
  | { kind: "parked"; park: LoopPark; toolCallId: string }
  | { kind: "steered" }
  | { kind: "exhausted" }
  | { kind: "failed"; error: AuxError };

const DEFAULT_MAX_LOOP_STEPS = 0;
const MAX_PARALLEL_READS = 4;
const modelToolsCache = new WeakMap<
  LoopToolManifest,
  { tools: Record<string, { description: string; inputSchema: z.ZodType }>; bytes: number }
>();

function modelTools(manifest: LoopToolManifest) {
  const cached = modelToolsCache.get(manifest);
  if (cached) return cached;
  const tools = Object.fromEntries(
    Object.entries(manifest).map(([name, tool]) => [
      name,
      { description: `${tool.description}\n\n(${tool.byline})`, inputSchema: tool.inputSchema },
    ]),
  );
  const bytes = Buffer.byteLength(
    JSON.stringify(
      Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        schema: z.toJSONSchema(tool.inputSchema),
      })),
    ),
    "utf8",
  );
  const result = { tools, bytes };
  modelToolsCache.set(manifest, result);
  return result;
}

/** Provider markup a model leaks when it serialises calls into text rather than emitting real tool calls. */
const LEAKED_TOOL_MARKUP =
  /<(?:atem|antml)[:\w-]*(?:function_calls|invoke|tool_call)|<invoke\s+name="[\w.]+"/i;

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
    if (
      !part ||
      typeof part !== "object" ||
      !("type" in part) ||
      part.type !== "text" ||
      !("text" in part) ||
      typeof part.text !== "string"
    )
      return [part];
    if (!LEAKED_TOOL_MARKUP.test(part.text)) return [part];
    const text = part.text
      .replace(/<(?:atem|antml):function_calls>[\s\S]*?<\/(?:atem|antml):function_calls>/gi, "")
      .trim();
    return text ? [{ ...part, text }] : [];
  });
  return { ...message, content };
}

/** Tool calls in a message that still have no following tool result — an in-flight interrupted step. */
function unansweredToolCalls(messages: ModelMessage[]): LoopToolCall[] {
  const last = messages.at(-1);
  if (last?.role !== "assistant" || !Array.isArray(last.content)) return [];
  const calls = last.content.filter(
    (
      part,
    ): part is {
      type: "tool-call";
      toolCallId: string;
      toolName: string;
      input: unknown;
    } => typeof part === "object" && part !== null && (part as { type?: string }).type === "tool-call",
  );
  return calls.map((part) => ({ toolCallId: part.toolCallId, toolName: part.toolName, input: part.input }));
}

/** An interrupted step's unanswered calls get honest placeholders — never silent drops. */
function interruptedResults(
  calls: LoopToolCall[],
  reason: string,
): { toolCallId: string; toolName: string; output: unknown }[] {
  return calls.map((call) => ({
    toolCallId: call.toolCallId,
    toolName: call.toolName,
    output: { interrupted: true, detail: reason },
  }));
}

function parkCall(park: LoopPark, call: LoopToolCall, ctx: LoopToolContext): { park: LoopPark } {
  return {
    park: {
      ...park,
      detail: {
        ...park.detail,
        execution: { input: call.input, callCount: ctx.callCount, goalTurn: ctx.goalTurn },
      },
    },
  };
}

function failedCall(
  error: unknown,
  call: LoopToolCall,
  ctx: LoopToolContext,
): { output: unknown } | { park: LoopPark } {
  if (ctx.signal?.aborted) throw error;
  if (error instanceof AuxError && error.code === "needs_input") {
    const detail = error.detail as { park?: LoopPark } | undefined;
    const park = detail?.park ?? ctx.deps.pendingPark?.();
    if (park) return parkCall(park, call, ctx);
  }
  if (error instanceof MentionUnavailable) return { output: error.unavailable };
  return { output: error instanceof Error ? error : new Error(String(error)) };
}

async function executeOne(
  toolName: string,
  call: LoopToolCall,
  tools: LoopToolManifest,
  ctx: LoopToolContext,
): Promise<LoopToolResult> {
  const tool = tools[toolName];
  if (!tool)
    return {
      output: new AuxError("capability_unsupported", `Unknown tool: ${toolName}`),
    };
  if (tool.requiresSoloCall && ctx.callCount > 1) {
    return {
      output: new AuxError(
        "invalid_params",
        `${toolName} must be the only tool call in its turn. Re-issue it alone.`,
      ),
    };
  }
  try {
    const result = await tool.execute(call.input, { ...ctx, toolCallId: call.toolCallId });
    if ("park" in result && (result.park.approvalId || result.park.detail?.retryCall))
      return parkCall(result.park, call, ctx);
    return "output" in result ? { ...result, output: annotateToolFailure(result.output) } : result;
  } catch (error) {
    return failedCall(error, call, ctx);
  }
}

/** The provider pairs each tool result with a tool-call part. A text-only assistant message plus a result is a duplicate or an orphan output. */
function assistantWithToolCalls(message: ModelMessage, calls: LoopToolCall[]): ModelMessage {
  const content =
    message.role === "assistant" && Array.isArray(message.content)
      ? [...message.content]
      : message.role === "assistant" && typeof message.content === "string" && message.content
        ? [{ type: "text" as const, text: message.content }]
        : [];
  const present = new Set(
    content.flatMap((part) =>
      part && typeof part === "object" && "type" in part && part.type === "tool-call" && "toolCallId" in part
        ? [String(part.toolCallId)]
        : [],
    ),
  );
  for (const call of calls) {
    if (!present.has(call.toolCallId))
      content.push({
        type: "tool-call",
        toolCallId: call.toolCallId,
        toolName: call.toolName,
        input: call.input,
      });
  }
  return { role: "assistant", content };
}

export async function runAgentLoop(opts: AgentLoopOptions): Promise<AgentLoopOutcome> {
  const { model, tools, transcript, runId } = opts;
  if (!model.toolCallStep) {
    return {
      kind: "failed",
      error: new AuxError(
        "capability_unsupported",
        "The configured model client does not support tool calling.",
      ),
    };
  }
  const messages = transcript.load(runId);
  // The assistant call is persisted before any tool is dispatched. A process
  // can die at any point after that write, including after an effect happened
  // but before its result was stored. Close that transcript gap on restart;
  // never replay the call to guess whether it ran. The write ledger remains
  // the authority for reconciling consequential effects.
  const interrupted = unansweredToolCalls(messages);
  if (interrupted.length && !transcript.openPark(runId)) {
    const recovery = toolResultsMessage(
      interruptedResults(
        interrupted,
        "The process stopped before this tool result was recorded. Its outcome is unknown. Do not repeat a consequential action; inspect the write ledger and fresh page state first.",
      ),
    );
    transcript.append(runId, [recovery]);
    messages.push(recovery);
  }
  const system =
    opts.system ??
    buildSystemPrompt({
      hasProject: opts.hasProject,
      hasPage: !!(typeof opts.pageId === "function" ? opts.pageId() : opts.pageId),
      webEnabled: !!(opts.deps.webFetch || opts.deps.webSearch),
      webmcp: opts.webmcp === true,
    });
  const maxSteps = opts.maxSteps ?? DEFAULT_MAX_LOOP_STEPS;
  const sdk = modelTools(tools);
  // Auto-recall (06-Z): query content memory for the task once, durably. The
  // recall message lands before any assistant turn, so every later step shares
  // the same cache prefix.
  if (
    opts.deps.recall &&
    messages.length === 1 &&
    messages[0]?.role === "user" &&
    typeof messages[0].content === "string"
  ) {
    try {
      const hits = await opts.deps.recall(messages[0].content, {
        runId,
        threadId: opts.threadId,
        turnId: opts.turnId ?? runId,
      });
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

  for (let index = 0; maxSteps === 0 || index < maxSteps; index++) {
    if (opts.signal?.aborted) return { kind: "failed", error: new AuxError("cancelled", "cancelled") };
    if (opts.steerCheck?.()) return { kind: "steered" };

    const callTools = sdk.tools;
    let reservationId: string | undefined;
    let requestMessages: ModelMessage[];
    try {
      requestMessages = opts.prepareModelMessages ? await opts.prepareModelMessages(messages) : messages;
      if (opts.signal?.aborted) throw new AuxError("cancelled", "Original model request authority changed.");
      requestMessages = prepareWorkingContext(requestMessages, {
        contextTokens: opts.contextTokens,
        maxOutputTokens: opts.maxOutputTokens ?? 4000,
        system,
        toolsBytes: sdk.bytes,
      }).messages;
      reservationId = await opts.beforeModelCall?.({
        modelId: opts.modelId,
        promptBytes: Buffer.byteLength(`${system}\n${JSON.stringify(requestMessages)}`, "utf8"),
        toolsBytes: sdk.bytes,
        maxOutputTokens: opts.maxOutputTokens ?? 4000,
      });
    } catch (error) {
      return {
        kind: "failed",
        error:
          error instanceof AuxError
            ? error
            : new AuxError("step_failed", error instanceof Error ? error.message : String(error)),
      };
    }

    if (opts.signal?.aborted) {
      opts.onModelAdmissionCancelled?.(reservationId);
      opts.afterModelCall?.();
      return {
        kind: "failed",
        error: new AuxError("cancelled", "Original model request authority changed before dispatch."),
      };
    }
    let step;
    try {
      step = await model.toolCallStep({
        onText: opts.onText,
        modelId: opts.modelId,
        reasoning: opts.reasoning,
        system,
        messages: requestMessages,
        tools: callTools,
        signal: opts.signal,
        source: opts.modelSource,
        providerOptions: opts.providerOptions,
        sessionId: opts.threadId,
        maxOutputTokens: opts.maxOutputTokens,
        maxAttempts: opts.maxAttempts,
      });
    } catch (error) {
      try {
        await opts.onModelFailure?.({ index, error, reservationId });
      } finally {
        opts.afterModelCall?.();
      }
      if (opts.steerCheck?.()) return { kind: "steered" };
      return {
        kind: "failed",
        error:
          error instanceof AuxError
            ? error
            : new AuxError("step_failed", error instanceof Error ? error.message : String(error)),
      };
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
    try {
      await opts.onStep?.({ index, step, reservationId });
    } finally {
      opts.afterModelCall?.();
    }

    if (!toolCalls.length) {
      if (!step.text?.trim()) {
        const nudge: ModelMessage = {
          role: "user",
          content:
            "Your last turn had no tool call or answer, so no result was submitted. Continue with a real tool call; use submit_result with verified citations to finish.",
        };
        messages.push(nudge);
        transcript.append(runId, [nudge]);
        continue;
      }
      // Markup that is not a complete invoke still gets one correction.
      if (step.text && LEAKED_TOOL_MARKUP.test(step.text)) {
        const nudge: ModelMessage = {
          role: "user",
          content:
            "Your last message contained raw function-call markup instead of real tool calls — it was not executed. Issue the actual tool call (submit_result to finish), not its markup.",
        };
        messages.push(nudge);
        transcript.append(runId, [nudge]);
        continue;
      }
      return { kind: "done", text: step.text ?? "" };
    }

    const ctx: LoopToolContext = {
      runId,
      threadId: opts.threadId,
      turnId: opts.turnId ?? runId,
      pageId: typeof opts.pageId === "function" ? opts.pageId() : opts.pageId,
      signal: opts.signal,
      callCount: toolCalls.length,
      goalTurn: messages.filter((message) => message.role === "assistant").length,
      deps: opts.deps,
    };

    // submit_result finishes the turn. Run the work first so a same-turn
    // answer still performs the actions it reports.
    const ordered = [
      ...toolCalls.filter((call) => call.toolName !== "submit_result"),
      ...toolCalls.filter((call) => call.toolName === "submit_result"),
    ];
    const results: {
      toolCallId: string;
      toolName: string;
      output?: unknown;
      parked?: boolean;
    }[] = [];
    let parked: { call: LoopToolCall; park: LoopPark } | undefined;
    let finished: Record<string, unknown> | undefined;
    let skippedReason: string | undefined;
    const independentRead = (call: LoopToolCall) => {
      const tool = tools[call.toolName];
      return !!tool?.prepare && !tool.requiresSoloCall && tool.independentRead?.(ctx) === true;
    };
    for (let cursor = 0; cursor < ordered.length;) {
      const call = ordered[cursor]!;
      if (independentRead(call)) {
        const controller = new AbortController();
        const signal = ctx.signal ? AbortSignal.any([ctx.signal, controller.signal]) : controller.signal;
        const readContext = { ...ctx, signal };
        const batch: { call: LoopToolCall; execute: () => Promise<{ output: unknown }> }[] = [];
        while (cursor < ordered.length && batch.length < MAX_PARALLEL_READS) {
          const next = ordered[cursor]!;
          if (!independentRead(next)) break;
          try {
            signal.throwIfAborted();
            await opts.beforeToolCall?.(next);
            signal.throwIfAborted();
          } catch (error) {
            controller.abort(error);
            return {
              kind: "failed",
              error: error instanceof AuxError ? error : new AuxError("step_failed", String(error)),
            };
          }
          let prepared: PreparedRead | { output: unknown };
          try {
            prepared = await tools[next.toolName]!.prepare!(next.input, {
              ...readContext,
              toolCallId: next.toolCallId,
            });
          } catch (error) {
            prepared = failedCall(error, next, readContext);
          }
          cursor++;
          if ("park" in prepared) {
            parked = { call: next, park: parkCall(prepared.park, next, ctx).park };
            results.push({ toolCallId: next.toolCallId, toolName: next.toolName, parked: true });
            controller.abort(new AuxError("cancelled", "Read preparation requires review."));
            break;
          }
          if ("output" in prepared) {
            results.push({ toolCallId: next.toolCallId, toolName: next.toolName, output: prepared.output });
            opts.onToolCall?.(next, prepared);
            skippedReason =
              "A read could not be prepared. This call was not executed; replan from the reported error.";
            controller.abort(prepared.output);
            break;
          }
          batch.push({ call: next, execute: prepared.execute });
        }
        if (parked || skippedReason) break;
        // The batch contains only prepared reads with no browser/page effects.
        // Joining the batch before the next call is the barrier for all other tools.
        const outputs = await Promise.all(
          batch.map(async ({ execute }) => {
            try {
              signal.throwIfAborted();
              const result = await execute();
              if (result.output instanceof Error) controller.abort(result.output);
              return { output: annotateToolFailure(result.output) };
            } catch (error) {
              controller.abort(error);
              return { output: error instanceof Error ? error : new Error(String(error)) };
            }
          }),
        );
        batch.forEach(({ call }, index) => {
          const result = outputs[index]!;
          results.push({ toolCallId: call.toolCallId, toolName: call.toolName, output: result.output });
          opts.onToolCall?.(call, result);
        });
        if (signal.aborted) {
          skippedReason =
            "An independent read failed or was stopped. This call was not executed; inspect the read results before continuing.";
          break;
        }
        continue;
      }
      cursor++;
      try {
        await opts.beforeToolCall?.(call);
      } catch (error) {
        return {
          kind: "failed",
          error: error instanceof AuxError ? error : new AuxError("step_failed", String(error)),
        };
      }
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

    if (parked)
      skippedReason = "A suspension ended this step; the call was not executed — re-issue if still needed.";
    if (finished !== undefined)
      skippedReason = "The accepted submit_result ended this turn before this call ran.";
    if (skippedReason) {
      const answered = new Set(results.map((result) => result.toolCallId));
      for (const call of toolCalls)
        if (!answered.has(call.toolCallId))
          results.push({
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            output: { interrupted: true, detail: skippedReason },
          });
    }
    const callOrder = new Map(toolCalls.map((call, index) => [call.toolCallId, index]));
    results.sort((a, b) => callOrder.get(a.toolCallId)! - callOrder.get(b.toolCallId)!);

    // Embedded media already lives in artifacts; textual results remain complete
    // in the durable history. Only the next model request receives a compact view.
    for (const result of results) if ("output" in result) result.output = pruneMedia(result.output);

    if (parked) {
      transcript.park(runId, {
        toolCallId: parked.call.toolCallId,
        toolName: parked.call.toolName,
        suspension: parked.park,
        pendingResults: results.map((r) =>
          r.parked
            ? { toolCallId: r.toolCallId, toolName: r.toolName, parked: true }
            : { toolCallId: r.toolCallId, toolName: r.toolName, output: r.output },
        ),
      });
      return { kind: "parked", park: parked.park, toolCallId: parked.call.toolCallId };
    }

    const toolMessage = toolResultsMessage(
      results.map((r) => ({ toolCallId: r.toolCallId, toolName: r.toolName, output: r.output })),
    );

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
        ...interruptedResults(
          unansweredToolCalls(messages).filter((c) => !results.some((r) => r.toolCallId === c.toolCallId)),
          "interrupted by a user steer",
        ),
      ]);
      messages.push(toolMessage);
      transcript.append(runId, [toolMessage]);
      return { kind: "steered" };
    }

    messages.push(toolMessage);
    transcript.append(runId, [toolMessage]);
    if (opts.signal?.aborted)
      return { kind: "failed", error: new AuxError("cancelled", "The original read batch stopped.") };
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
  if (!parked)
    return {
      kind: "failed",
      error: new AuxError("not_found", "This run has no parked tool call to resume."),
    };
  let resumedOutput = parkAnswerOutput(answer);
  const execution = parked.suspension?.detail?.execution as
    { input: unknown; callCount: number; goalTurn: number } | undefined;
  if (execution) {
    const ctx: LoopToolContext = {
      runId,
      threadId: opts.threadId,
      turnId: opts.turnId ?? runId,
      pageId: typeof opts.pageId === "function" ? opts.pageId() : opts.pageId,
      signal: opts.signal,
      callCount: execution.callCount,
      goalTurn: execution.goalTurn,
      deps: opts.deps,
    };
    const continuation = parked.suspension?.detail?.resumeCall as
      { toolName: string; toolCallId: string; input: unknown } | undefined;
    const result = await executeOne(
      continuation?.toolName ?? parked.toolName,
      {
        toolCallId: continuation?.toolCallId ?? parked.toolCallId,
        toolName: continuation?.toolName ?? parked.toolName,
        input: continuation?.input ?? execution.input,
      },
      opts.tools,
      ctx,
    );
    if ("park" in result) {
      transcript.updatePark(runId, {
        ...parked,
        suspension: continuation
          ? { ...result.park, detail: { ...result.park.detail, resumeCall: continuation } }
          : result.park,
      });
      return { kind: "parked", park: result.park, toolCallId: parked.toolCallId };
    }
    resumedOutput = "finish" in result ? { accepted: true } : result.output;
    opts.onToolCall?.(
      {
        toolCallId: continuation?.toolCallId ?? parked.toolCallId,
        toolName: continuation?.toolName ?? parked.toolName,
        input: continuation?.input ?? execution.input,
      },
      result,
    );
    if ("finish" in result) {
      const message = toolResultsMessage(
        parked.pendingResults.map((part) => ({
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          output: "parked" in part ? resumedOutput : part.output,
        })),
      );
      transcript.resolvePark(runId, message);
      return { kind: "done", text: String(result.finish.result.report ?? ""), result: result.finish.result };
    }
  }
  const message = toolResultsMessage(
    parked.pendingResults.map((part) => ({
      toolCallId: part.toolCallId,
      toolName: part.toolName,
      output: "parked" in part ? resumedOutput : part.output,
    })),
  );
  transcript.resolvePark(runId, message);
  return runAgentLoop(opts);
}
