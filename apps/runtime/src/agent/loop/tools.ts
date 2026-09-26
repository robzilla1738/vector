import { z } from "zod";
import { AuxError, ObservationScopeSchema, PlanStepSchema, ResultCitationSchema } from "@aux/contracts";
import type { LoopTool, LoopToolManifest, LoopToolContext } from "./types.js";

/**
 * The built-in loop's tool manifest (S5/06-X): one definition shared by the
 * loop, MCP, CLI and SDK surfaces. Each entry carries its schema, the text
 * the model sees, and a `byline` recording provenance (05-B). Execution
 * composes existing runtime services — nothing here bypasses decide() or
 * the durable ledger.
 */

const need = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) throw new AuxError("capability_unsupported", `${name} is not available in this context.`);
  return value;
};

export function buildToolManifest(): LoopToolManifest {
  const snapshot: LoopTool = {
    description:
      "Read the current page: accessibility-first tree text with [ref=…] markers, form fields, links, tables and dialogs. " +
      "Default scope is interactive-first; 'all' refs every shown element and 'viewport' clips to what is on screen. " +
      "Use 'subtree' with subtreeRef to read below one element.",
    byline: "Aux page observation",
    inputSchema: z.object({
      scope: ObservationScopeSchema.optional().describe("Element-collection scope; default 'full' (interactive elements + all sections)."),
      subtreeRef: z.string().optional().describe("Read only the subtree below this ref (e.g. 'r12')."),
    }),
    execute: async (raw, ctx: LoopToolContext) => {
      const input = z.object({ scope: ObservationScopeSchema.optional(), subtreeRef: z.string().optional() }).parse(raw ?? {});
      if (!ctx.pageId) throw new AuxError("invalid_params", "snapshot needs an active page; this run claims none.");
      const obs = await need(ctx.deps.observe, "snapshot")({ pageId: ctx.pageId, scope: input.scope, subtreeRef: input.subtreeRef });
      return { output: obs };
    },
  };

  const act: LoopTool = {
    description:
      "Act on the page: a batch of program steps compiled, authorized through decide(), executed and journaled to the " +
      "durable ledger. Steps run in order and report partial failures. Setter steps (fill/type/check/uncheck/select) " +
      "record the control's prior value. Do not repeat a step the ledger marks uncertain — re-observe and re-plan.",
    byline: "Aux actuation · decide() + durable write ledger",
    inputSchema: z.object({
      steps: z.array(PlanStepSchema).min(1).max(16).describe("Program steps, executed in order."),
    }),
    execute: async (raw, ctx: LoopToolContext) => {
      const input = z.object({ steps: z.array(PlanStepSchema).min(1).max(16) }).parse(raw);
      if (!ctx.pageId) throw new AuxError("invalid_params", "act needs an active page; this run claims none.");
      // The dep returns LoopToolResult — a safety `ask` may park the loop.
      return need(ctx.deps.act, "act")({ pageId: ctx.pageId, steps: input.steps });
    },
  };

  const webfetch: LoopTool = {
    description: "Fetch a public web page (text/HTML/JSON/XML, ≤1 MB). Carries no cookies; the destination is decided by decide() before dispatch.",
    byline: "Aux cookie-free web fetch",
    inputSchema: z.object({ url: z.string().url().describe("Absolute http(s) URL; private-network addresses are denied.") }),
    execute: async (raw, ctx) => {
      const { url } = z.object({ url: z.string().url() }).parse(raw);
      return need(ctx.deps.webFetch, "webfetch")(url, { runId: ctx.runId, threadId: ctx.threadId, turnId: ctx.turnId });
    },
  };

  const websearch: LoopTool = {
    description: "Search the web through the configured search engine; returns title, text and links. Same egress rules as webfetch.",
    byline: "Aux web search",
    inputSchema: z.object({ query: z.string().min(1).max(500) }),
    execute: async (raw, ctx) => {
      const { query } = z.object({ query: z.string().min(1).max(500) }).parse(raw);
      return need(ctx.deps.webSearch, "websearch")(query, { runId: ctx.runId, threadId: ctx.threadId, turnId: ctx.turnId });
    },
  };

  const askUserQuestion: LoopTool = {
    description:
      "Park this turn and ask the user a question when their answer changes what you do next. " +
      "The turn resumes with your question's answer as this call's result. Must be the only tool call in its turn.",
    byline: "Aux durable suspension",
    inputSchema: z.object({ question: z.string().min(1).max(2_000).describe("One clear question with the options or format you need.") }),
    requiresSoloCall: true,
    execute: (raw) => {
      const { question } = z.object({ question: z.string().min(1).max(2_000) }).parse(raw);
      return { park: { kind: "ask-user-question", instruction: question } };
    },
  };

  const requestActionConfirmation: LoopTool = {
    description:
      "Confirm a consequential outcome with the user before finishing: produces a review artifact (what changed, evidence, links). " +
      "Call exactly once as the only tool call of its turn, after the work is done and verified.",
    byline: "Aux action confirmation",
    inputSchema: z.object({
      summary: z.string().min(1).max(4_000).describe("What was done and the evidence for it."),
      links: z.array(z.string().url()).max(8).optional(),
    }),
    requiresSoloCall: true,
    execute: (raw) => {
      const { summary, links } = z.object({ summary: z.string().min(1).max(4_000), links: z.array(z.string().url()).max(8).optional() }).parse(raw);
      return { park: { kind: "action-confirmation", instruction: summary, detail: links?.length ? { links } : undefined } };
    },
  };

  const writeTodos: LoopTool = {
    description: "Update your durable todo scratchpad for this run — short items the user can watch; survives suspension and restart.",
    byline: "Aux run scratchpad",
    inputSchema: z.object({ todos: z.array(z.string().min(1).max(280)).max(12) }),
    execute: async (raw, ctx) => {
      const { todos } = z.object({ todos: z.array(z.string().min(1).max(280)).max(12) }).parse(raw);
      await ctx.deps.writeTodos?.(todos);
      return { output: { saved: todos.length } };
    },
  };

  const repl: LoopTool = {
    description: "Run JavaScript in this run's persistent code-mode REPL. The guest surface: page.* page actions " +
      "(page.click(ref), page.fill(ref, text), page.navigate(url), page.waitFor({…}) and friends — every one " +
      "compiles to a governed step through decide() and the write ledger), snapshot(scope), tabs(), " +
      "openTab(url)/closeTab(id) for owned background tabs, annotatedScreenshot(), display(value), sleep(ms), " +
      "cookie-free fetch(url), fs confined to session roots, and subagent cells: spawn({goal, profile?, pageIds?}) " +
      "returns {cellId}, wait(cellId) yields until the cell finishes or the deadline lapses, send(cellId, text) " +
      "steers a running cell, stop(cellId) cancels it. Guest state persists across calls; modules, " +
      "eval/Function, process and WebAssembly are denied. Results must be JSON data, ≤16 KB (larger output spills to a file).",
    byline: "Aux code mode — page ops still pass authorization and the ledger",
    inputSchema: z.object({
      code: z.string().min(1).max(64_000).describe("Synchronous-looking JavaScript for the REPL session."),
      deadlineMs: z.number().int().positive().optional().describe("Max run time for this call; capped at 120000."),
    }),
    execute: async (raw, ctx) => {
      const input = z.object({ code: z.string().min(1).max(64_000), deadlineMs: z.number().int().positive().optional() }).parse(raw);
      return need(ctx.deps.repl, "repl")(input, ctx);
    },
  };

  const getTime: LoopTool = {
    description: "Current wall-clock time (ISO and epoch ms).",
    byline: "Aux clock",
    inputSchema: z.object({}),
    execute: () => ({ output: { iso: new Date().toISOString(), unixMs: Date.now() } }),
  };

  const submitResult: LoopTool = {
    description:
      "Finish the run with the verified result. `report` is the final answer; `citations` ground it — each cites a " +
      "snapshot you observed (observationId, or pageId + revision) with a verbatim `quote` copied from that snapshot's " +
      "text. The verifier checks every quote exists in the cited snapshot; an unverifiable citation rejects the call — " +
      "re-observe, fix the quote, and resubmit. Paraphrase around quotes is allowed. Must be the only tool call in its turn.",
    byline: "Aux verified result — citations checked against the cited snapshots",
    inputSchema: z.object({
      report: z.string().min(1).max(64_000).describe("The final answer — markdown is fine."),
      citations: z.array(ResultCitationSchema).max(32).optional(),
    }),
    requiresSoloCall: true,
    execute: async (raw, ctx) => {
      const input = z.object({ report: z.string().min(1).max(64_000), citations: z.array(ResultCitationSchema).max(32).optional() }).parse(raw);
      const verdict = await need(ctx.deps.submitResult, "submit_result")(input, ctx);
      if (!verdict.ok) return { output: new AuxError("invalid_params", verdict.error) };
      return { finish: { result: verdict.result } };
    },
  };

  return {
    get_time: getTime,
    snapshot,
    act,
    repl,
    webfetch,
    websearch,
    ask_user_question: askUserQuestion,
    request_action_confirmation: requestActionConfirmation,
    write_todos: writeTodos,
    submit_result: submitResult,
  };
}
