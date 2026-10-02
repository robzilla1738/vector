import { newAsyncContext, type QuickJSAsyncContext, type QuickJSHandle } from "quickjs-emscripten";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AuxError, InlineAssistTextSchema, PlanStepSchema, ResultCitationSchema, type ResultCitation } from "@aux/contracts";
import { z } from "zod";
import type { LoopPark, LoopToolResult } from "./types.js";

/**
 * The S5 code-mode REPL (roadmap deliverable 3): one persistent QuickJS
 * context per run exposing the page-centric surface — `page.*` actions that
 * compile to PlanSteps and flow through the same `act` dep (guardedExecute →
 * decide() → durable ledger), `tabs`/`openTab`/`closeTab`, `snapshot()`,
 * `annotatedScreenshot()`, `display()`, `sleep`, restricted `fs`, and a
 * cookie-free `fetch` routed through decide(), and `page.webmcp.tools()` /
 * `.call()` for document script tools. Nothing on the host side can
 * be called outside the exposed names — the raw bridge is deleted from the
 * guest global after bootstrap.
 *
 * Safety shape: a gate `ask` inside a page op cannot pause the running VM, so
 * the host returns a park marker the guest rethrows as a sentinel error; the
 * session catches it and yields `LoopPark` — the run suspends on the same
 * durable record `act` would have, and resume injects the answer as this
 * tool call's result.
 */

export interface ReplTab {
  pageId: string;
  url: string;
  title: string;
  active: boolean;
  /** True when this run opened the tab (openTab) rather than claiming an existing one. */
  owned: boolean;
}

/** Host surface the REPL dispatches into — one entry per exposed call name. */
export interface ReplHostDeps {
  runId: string;
  /** Abort when the run is cancelled. */
  signal?: AbortSignal;
  /** Session storage dir for screenshot/overflow artifacts. */
  outputDir?: string;
  /** Metadata discovery does not grant page access, including the special @Tabs catalog. */
  tabs(): Promise<Array<Pick<ReplTab, "pageId" | "title" | "url">>>;
  /** decide() first; parks like webFetch on `ask`. */
  openTab(url: string): Promise<LoopToolResult>;
  closeTab(pageId: string): Promise<void>;
  /** Save the claimed current page into Profile bookmarks after a write decision. */
  bookmark?(pageId: string): Promise<LoopToolResult>;
  /** Switch the REPL's current page — only tabs the run claims or opened. */
  useTab(pageId: string): Promise<ReplTab>;
  observe(pageId: string, scope?: string): Promise<unknown>;
  /** Resolve one uniquely named control from a fresh governed observation. */
  findRef?(pageId: string, name: string, role?: string): Promise<{ ref: string; navigationUrl?: string }>;
  /** Infer one route from exact same-origin links or two sibling record links. */
  findRoute?(pageId: string, targetId: string): Promise<{ url: string }>;
  /** Capture plus the last observation's ref geometry — the annotation data (pixel overlays land with native support). */
  capture(
    pageId: string,
  ): Promise<{
    dataUrl?: string;
    width: number;
    height: number;
    scale?: number;
    elements?: { ref: string; name?: string; rect?: { x: number; y: number; w: number; h: number } }[];
  }>;
  /** One PlanStep through the act dep — returns `{park}` on a gate `ask`. */
  step(pageId: string, step: unknown): Promise<LoopToolResult>;
  /** Cookie-free fetch through decide() — returns `{park}` on `ask`. */
  fetch(url: string): Promise<LoopToolResult>;
  fsRead(path: string): Promise<string>;
  fsWrite(path: string, content: string): Promise<void>;
  /** Same verified terminal path as the submit_result tool. */
  submitResult?(input: { report: string; citations?: ResultCitation[]; textProposal?: string }): Promise<
    { ok: true; result: Record<string, unknown> } | { ok: false; error: string }
  >;
  /** `{park}` when a write-annotated tool is waiting on the person. */
  webmcp?(pageId: string, action: unknown): Promise<unknown>;
  /** Subagent cells (06-Y): spawn under this run's group, then wait/send/stop. */
  spawnCell?(input: { goal: string; profile?: string; pageIds?: string[] }): Promise<{ cellId: string }>;
  /** Yield until the cell reaches a terminal state or the remaining deadline lapses. */
  waitCell?(cellId: string, timeoutMs: number): Promise<{ state: string; runId?: string; pending?: boolean; result?: unknown; error?: string }>;
  /** Steer a running cell with new instructions. */
  sendCell?(cellId: string, text: string): Promise<void>;
  cancelCell?(cellId: string): Promise<void>;
}

const MAX_HEAP_BYTES = 128 * 1024 * 1024;
const MAX_STACK_BYTES = 1 * 1024 * 1024;
export const REPL_MAX_DEADLINE_MS = 120_000;
const OUTPUT_CAP_BYTES = 16 * 1024;
const IDLE_MS = 30 * 60_000;
const MAX_SESSIONS = 16;
const PARK_MARKER = "__aux_park__:";

/** Modules are disabled: the REPL is a script context, not a bundler. */
const MODULE_RE = /\bimport\b|\bexport\b|\brequire\s*\(/;
/** Host denylist: identifiers that could escape the guest sandbox — every `__aux_` internal is off-limits. */
const HOST_DENYLIST = /\bprocess\b|\bWebAssembly\b|\beval\s*\(|\bFunction\s*\(|__aux_\w+/;

function checkSource(code: string): void {
  if (MODULE_RE.test(code))
    throw new AuxError(
      "invalid_params",
      "The REPL does not run modules — import/export/require are disabled.",
    );
  if (HOST_DENYLIST.test(code))
    throw new AuxError(
      "invalid_params",
      "The REPL denylist blocks eval, Function, WebAssembly, process and the raw host bridge.",
    );
}

/**
 * Model-generated code often uses `await` with the exposed bridge calls.
 * Those calls already suspend QuickJS until the host returns and therefore
 * return ordinary values. Remove only awaits immediately before known bridge
 * calls, outside strings and comments, so a script remains synchronous.
 */
function normalizeBridgeAwaits(code: string): string {
  const bridgeCall = /^(?:page\.[A-Za-z]+|snapshot|annotatedScreenshot|tabs|openTab|closeTab|display|sleep|fetch|spawn|wait|send|stop|submitResult|fs\.(?:readFile|writeFile))\s*\(/;
  let output = "";
  let i = 0;
  let quote = "";
  while (i < code.length) {
    const char = code[i]!;
    if (quote) {
      output += char;
      if (char === "\\") { output += code[++i] ?? ""; }
      else if (char === quote) quote = "";
      i++;
      continue;
    }
    if (code.startsWith("//", i)) {
      const end = code.indexOf("\n", i);
      const next = end < 0 ? code.length : end;
      output += code.slice(i, next);
      i = next;
      continue;
    }
    if (code.startsWith("/*", i)) {
      const end = code.indexOf("*/", i + 2);
      const next = end < 0 ? code.length : end + 2;
      output += code.slice(i, next);
      i = next;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") { quote = char; output += char; i++; continue; }
    if (code.startsWith("await", i) && (i === 0 || !/[\w$]/.test(code[i - 1]!)) && !/[\w$]/.test(code[i + 5] ?? "")) {
      let next = i + 5;
      while (/\s/.test(code[next] ?? "")) next++;
      if (bridgeCall.test(code.slice(next))) { i = next; continue; }
    }
    output += char;
    i++;
  }
  return output;
}

/** Top-level lexical names persist in QuickJS across calls; detect collisions before evaluating. */
function topLevelLexicals(code: string): string[] {
  const names: string[] = [];
  let depth = 0;
  let quote = "";
  for (let i = 0; i < code.length;) {
    const char = code[i]!;
    if (quote) {
      if (char === "\\") i += 2;
      else { if (char === quote) quote = ""; i++; }
      continue;
    }
    if (code.startsWith("//", i)) { const end = code.indexOf("\n", i); i = end < 0 ? code.length : end; continue; }
    if (code.startsWith("/*", i)) { const end = code.indexOf("*/", i + 2); i = end < 0 ? code.length : end + 2; continue; }
    if (char === "'" || char === '"' || char === "`") { quote = char; i++; continue; }
    if (char === "{") { depth++; i++; continue; }
    if (char === "}") { depth = Math.max(0, depth - 1); i++; continue; }
    if (depth === 0 && (i === 0 || !/[\w$]/.test(code[i - 1]!))) {
      const declaration = /^(?:let|const)\s+([A-Za-z_$][\w$]*)\b/.exec(code.slice(i));
      if (declaration) { names.push(declaration[1]!); i += declaration[0].length; continue; }
    }
    i++;
  }
  return names;
}

/**
 * Marshalability is proven inside the guest: `context.dump` mirrors guest
 * objects host-side and explodes on cycles, so the result is JSON.stringify'd
 * in QuickJS and only the string crosses the boundary.
 */
const MARSHAL_SNIPPET = `
  (typeof __aux_pending_result === "function" || typeof __aux_pending_result === "symbol" || typeof __aux_pending_result === "bigint"
    ? (() => { throw new TypeError("__aux_unmarshalable__"); })()
    : JSON.stringify(__aux_pending_result))
`;

const BOOTSTRAP = `
"use strict";
// Top-level const/let bindings persist in the context's global lexical
// environment across evals — they ARE the guest globals (const = no
// reassignment; objects get Object.freeze'd below). The host bridge is
// captured, then its global name is deleted so guest code cannot call it raw.
const __aux_bridge = __aux_call;
const __aux_displayed = [];
const __aux_step_ops = ${JSON.stringify([
  "navigate",
  "back",
  "forward",
  "reload",
  "stop",
  "click",
  "dblclick",
  "hover",
  "fill",
  "fillCredential",
  "type",
  "press",
  "check",
  "uncheck",
  "select",
  "scroll",
  "dragTo",
  "clickPoint",
  "waitFor",
  "screenshot",
  "extract",
  "upload",
  "expectDownload",
  "collectScroll",
  "dialog",
])};
let __aux_page = null;
let __aux_step_counter = 0;
const __aux_invoke = (name, params) => {
  const response = JSON.parse(__aux_bridge(name, JSON.stringify(params ?? {})));
  if (!response.ok) {
    if (response.park) throw new Error(${JSON.stringify(PARK_MARKER)} + JSON.stringify(response.park));
    const error = new Error(response.error || "host call failed");
    error.code = response.code;
    throw error;
  }
  return response.value;
};
const __aux_step_fields = ${JSON.stringify({
  navigate: ["url"],
  click: ["target", "button"],
  dblclick: ["target"],
  hover: ["target"],
  fill: ["target", "value"],
  fillCredential: ["passwordSelector", "usernameSelector"],
  type: ["target", "value", "delayMs"],
  press: ["key", "target"],
  check: ["target"],
  uncheck: ["target"],
  select: ["target", "value"],
  scroll: ["direction", "amount", "target"],
  dragTo: ["target", "to"],
  clickPoint: ["x", "y", "button"],
  waitFor: ["condition"],
  screenshot: ["fullPage", "artifact"],
  extract: ["fields", "as"],
  upload: ["target", "files"],
  expectDownload: ["saveAs"],
  collectScroll: ["as", "item", "container", "key", "limit"],
  dialog: ["action", "promptText"],
})};
const page = {};
for (const op of __aux_step_ops) {
  page[op] = (...args) => {
    const step = { id: "repl-" + Date.now().toString(36) + "-" + (++__aux_step_counter), op };
    const named = __aux_step_fields[op];
    for (let i = 0; i < named.length && i < args.length; i++) if (args[i] !== undefined) step[named[i]] = args[i];
    return __aux_invoke("step", { pageId: __aux_page, step });
  };
}
page.use = (pageId) => { const t = __aux_invoke("useTab", { pageId }); __aux_page = t.pageId; return t; };
const __aux_clean_link_name = (name) => {
  // A model may copy the rendered link line rather than only its quoted name.
  // Strip renderer syntax, then still require the host's fresh unique lookup.
  let label = String(name).trim();
  const rendered = label.match(/^(?:r\\d+\\s+\\w+\\s+)?"([^"]+)"(?:\\s+href=.*)?$/);
  if (rendered) label = rendered[1];
  else if (label.includes('" href=')) label = label.slice(0, label.indexOf('" href='));
  return label;
};
page.clickByName = (name, role) => {
  const label = __aux_clean_link_name(name);
  const target = __aux_invoke("findRef", { pageId: __aux_page, name: label, role });
  return page.click(target.ref);
};
page.followLinkByName = (name) => {
  const target = __aux_invoke("findRef", { pageId: __aux_page, name: __aux_clean_link_name(name), role: "link" });
  if (!target.navigationUrl) throw new Error("The named link has no observed same-origin route; use a governed click if its click behavior is required.");
  return page.navigate(target.navigationUrl);
};
page.navigateMatching = (targetId) => {
  const route = __aux_invoke("findRoute", { pageId: __aux_page, targetId });
  return page.navigate(route.url);
};
page.labeledValue = (label) => {
  const wanted = String(label || "").trim().toLowerCase();
  if (!wanted) throw new Error("A field label is required");
  const observation = __aux_invoke("observe", { pageId: __aux_page });
  const lines = String(observation.text || "").split("\\n");
  const aliases = [wanted, wanted.replace(/\\breference\\b/g, "ref")];
  const matches = lines.filter((line) => aliases.some((alias) => line.toLowerCase().includes(alias)));
  if (matches.length !== 1) throw new Error("Expected one line containing field label " + label + "; found " + matches.length);
  const line = matches[0];
  const matched = aliases.find((alias) => line.toLowerCase().includes(alias));
  const rest = line.slice(line.toLowerCase().indexOf(matched) + matched.length).replace(/^[\\s:–—-]+/, "").trim();
  const value = rest.split(/\\.\\s+/)[0].replace(/[.。]$/, "").trim();
  if (!value) throw new Error("Field " + label + " has no visible value");
  return { value, citation: { observationId: observation.observationId, quote: line.trim() }, observationId: observation.observationId };
};
page.submitLabeledValue = (label) => {
  const found = page.labeledValue(label);
  return submitResult(found.value, [found.citation]);
};
page.webmcp = Object.freeze({
  tools: () => __aux_invoke("webmcp", { pageId: __aux_page, action: { op: "tools" } }),
  call: (name, input) => __aux_invoke("webmcp", { pageId: __aux_page, action: { op: "call", name, input } }),
});
const tabs = () => __aux_invoke("tabs");
const openTab = (url) => { const t = __aux_invoke("openTab", { url }); __aux_page = t.pageId; return t; };
const closeTab = (pageId) => __aux_invoke("closeTab", { pageId });
page.bookmark = () => __aux_invoke("bookmark", { pageId: __aux_page });
const snapshot = (scope) => __aux_invoke("observe", { pageId: __aux_page, scope });
const annotatedScreenshot = () => __aux_invoke("capture", { pageId: __aux_page });
const display = (value) => { __aux_displayed.push(value); return __aux_invoke("display", { value }); };
const sleep = (ms) => __aux_invoke("sleep", { ms });
const fetch = (url) => __aux_invoke("fetch", { url });
const fs = Object.freeze({
  readFile: (path) => __aux_invoke("fsRead", { path }),
  writeFile: (path, content) => __aux_invoke("fsWrite", { path, content }),
});
const spawn = (spec) => __aux_invoke("spawnCell", spec);
const wait = (cellId) => __aux_invoke("waitCell", { cellId, ms: 120000 });
const send = (cellId, text) => __aux_invoke("sendCell", { cellId, text });
const stop = (cellId) => __aux_invoke("cancelCell", { cellId });
const submitResult = (report, citations, textProposal) => __aux_invoke("submitResult", { report, citations, textProposal });
const console = Object.freeze({
  log: (...args) => display(args.map(String).join(" ")),
  warn: (...args) => display("warn: " + args.map(String).join(" ")),
  error: (...args) => display("error: " + args.map(String).join(" ")),
  info: (...args) => display(args.map(String).join(" ")),
});
Object.freeze(page);
delete globalThis.__aux_call;
`;

class ReplSession {
  private queue: Promise<void> = Promise.resolve();
  deadline = 0;
  touchedAt = Date.now();
  private artifacts = 0;
  private finished?: Record<string, unknown>;
  private readonly lexicals = new Set<string>();
  private cancelled = false;

  private constructor(
    private context: QuickJSAsyncContext,
    readonly deps: ReplHostDeps,
    private pageId?: string,
  ) {}

  static async create(deps: ReplHostDeps, initialPageId?: string): Promise<ReplSession> {
    const context = await newAsyncContext();
    context.runtime.setMemoryLimit(MAX_HEAP_BYTES);
    context.runtime.setMaxStackSize(MAX_STACK_BYTES);
    const session = new ReplSession(context, deps, initialPageId);
    context.runtime.setInterruptHandler(
      () => session.cancelled || Date.now() >= session.deadline || deps.signal?.aborted === true,
    );
    session.deadline = Date.now() + 30_000; // bootstrap window; eval resets it per call
    const bridge = context.newAsyncifiedFunction("__aux_call", (nameHandle, paramsHandle) =>
      session.dispatch(context, nameHandle, paramsHandle),
    );
    bridge.consume((fn) => context.setProp(context.global, "__aux_call", fn));
    try {
      const init = await context.evalCodeAsync(BOOTSTRAP);
      context.unwrapResult(init).dispose();
      if (initialPageId) {
        const seeded = await context.evalCodeAsync(`__aux_page = ${JSON.stringify(initialPageId)};`);
        context.unwrapResult(seeded).dispose();
      }
    } catch (error) {
      context.dispose();
      // unwrapResult errors carry the whole wasm context — never surface them.
      throw new AuxError(
        "internal",
        `REPL bootstrap failed: ${error instanceof Error ? error.message.slice(0, 160) : String(error)}`,
      );
    }
    return session;
  }

  /** Guest-side host calls — returns the JSON string `__aux_call` parses. */
  private async dispatch(
    context: QuickJSAsyncContext,
    nameHandle: QuickJSHandle,
    paramsHandle: QuickJSHandle,
  ) {
    const name = context.getString(nameHandle);
    const params = context.getString(paramsHandle);
    const ok = (value: unknown) => context.newString(JSON.stringify({ ok: true, value: value ?? null }));
    const fail = (error: unknown, extra?: Record<string, unknown>) =>
      context.newString(
        JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
          code: error instanceof AuxError ? error.code : undefined,
          ...extra,
        }),
      );
    if (this.finished)
      return fail(new AuxError("conflict", "This verified result ended the run; no further REPL effects are allowed."));
    if (this.cancelled || Date.now() >= this.deadline || this.deps.signal?.aborted)
      return fail(new AuxError("cancelled", "REPL deadline or run abort reached."));
    try {
      const parsed = params ? JSON.parse(params) : {};
      switch (name) {
        case "tabs":
          return ok(await this.deps.tabs());
        case "openTab": {
          const result = await this.deps.openTab(String(parsed.url ?? ""));
          if ("park" in result) return fail("tab open needs a decision", { park: result.park });
          if ("finish" in result) return ok(result.finish.result);
          const tab = result.output as ReplTab;
          return ok(tab);
        }
        case "closeTab":
          return ok(await this.deps.closeTab(String(parsed.pageId ?? "")));
        case "bookmark": {
          if (!this.deps.bookmark) throw new AuxError("capability_unsupported", "Bookmarking is unavailable in this run.");
          const result = await this.deps.bookmark(String(parsed.pageId ?? ""));
          if ("park" in result) return fail("bookmark needs a decision", { park: result.park });
          if ("finish" in result) return ok(result.finish.result);
          return ok(result.output);
        }
        case "useTab":
          return ok(await this.deps.useTab(String(parsed.pageId ?? "")));
        case "observe":
          return ok(
            await this.deps.observe(
              String(parsed.pageId ?? ""),
              parsed.scope === undefined ? undefined : String(parsed.scope),
            ),
          );
        case "findRef":
          if (!this.deps.findRef)
            return fail(new AuxError("capability_unsupported", "Named control lookup is unavailable in this run."));
          return ok(await this.deps.findRef(String(parsed.pageId ?? ""), String(parsed.name ?? ""),
            parsed.role === undefined ? undefined : String(parsed.role)));
        case "findRoute":
          if (!this.deps.findRoute)
            return fail(new AuxError("capability_unsupported", "Route matching is unavailable in this run."));
          return ok(await this.deps.findRoute(String(parsed.pageId ?? ""), String(parsed.targetId ?? "")));
        case "capture": {
          const shot = await this.deps.capture(String(parsed.pageId ?? ""));
          if (shot.dataUrl && this.deps.outputDir) {
            const file = join(this.deps.outputDir, `repl-${this.deps.runId}-capture-${++this.artifacts}.png`);
            writeFileSync(file, Buffer.from(shot.dataUrl.replace(/^data:image\/\w+;base64,/, ""), "base64"));
            return ok({ ...shot, dataUrl: undefined, file });
          }
          return ok(shot);
        }
        case "step": {
          const step = PlanStepSchema.parse(parsed.step);
          const result = await this.deps.step(String(parsed.pageId ?? ""), step);
          if ("park" in result) return fail("step needs a decision", { park: result.park });
          if ("finish" in result) return ok(result.finish.result);
          const output = result.output;
          if (output && typeof output === "object") {
            const action = output as Record<string, unknown>;
            const refusal = ["skipped", "rejected", "denied"].find((key) => typeof action[key] === "string");
            if (refusal) return fail(new AuxError("conflict", `Action ${refusal}: ${action[refusal]}`));
            if (Array.isArray(action.uncertainIntentIds) && action.uncertainIntentIds.length)
              return fail(new AuxError("conflict", `Action outcome uncertain (${action.uncertainIntentIds.join(", ")}); reconcile before another action.`));
            if (typeof action.status === "string" && action.status !== "completed")
              return fail(new AuxError("conflict", `Action ${action.status}: ${String(action.error ?? "inspect step outcomes before continuing")}`));
          }
          return ok(result.output);
        }
        case "fetch": {
          const result = await this.deps.fetch(String(parsed.url ?? ""));
          if ("park" in result) return fail("fetch needs a decision", { park: result.park });
          if ("finish" in result) return ok(result.finish.result);
          return ok(result.output);
        }
        case "display":
          return ok({ displayed: true });
        case "sleep": {
          const ms = Math.max(0, Math.min(Number(parsed.ms) || 0, this.deadline - Date.now()));
          await new Promise((resolve) => setTimeout(resolve, ms));
          return ok({ slept: ms });
        }
        case "fsRead":
          return ok(await this.deps.fsRead(String(parsed.path ?? "")));
        case "fsWrite":
          return ok(await this.deps.fsWrite(String(parsed.path ?? ""), String(parsed.content ?? "")));
        case "submitResult": {
          if (!this.deps.submitResult)
            return fail(new AuxError("capability_unsupported", "Verified completion is unavailable in this run."));
          const input = z.object({
            report: z.string().min(1).max(64_000),
            citations: z.array(ResultCitationSchema).max(32).optional(),
            textProposal: InlineAssistTextSchema.optional(),
          }).parse(parsed);
          const result = await this.deps.submitResult(input);
          if (!result.ok) return fail(new AuxError("invalid_params", result.error));
          this.finished = result.result;
          return ok({ accepted: true });
        }
        case "webmcp": {
          if (!this.deps.webmcp)
            return fail(new AuxError("capability_unsupported", "WebMCP is not exposed for this page."));
          const value = await this.deps.webmcp(String(parsed.pageId ?? ""), parsed.action);
          if (value && typeof value === "object" && "park" in value) {
            return fail("webmcp needs a decision", { park: (value as { park: LoopPark }).park });
          }
          return ok(value);
        }
        case "spawnCell": {
          if (!this.deps.spawnCell)
            return fail(new AuxError("capability_unsupported", "Subagent cells are unavailable for this run."));
          const spec = (parsed && typeof parsed === "object" ? parsed : {}) as { goal?: unknown; profile?: unknown; pageIds?: unknown };
          return ok(await this.deps.spawnCell({
            goal: String(spec.goal ?? ""),
            ...(typeof spec.profile === "string" ? { profile: spec.profile } : {}),
            ...(Array.isArray(spec.pageIds) ? { pageIds: spec.pageIds.map(String) } : {}),
          }));
        }
        case "waitCell": {
          if (!this.deps.waitCell)
            return fail(new AuxError("capability_unsupported", "Subagent cells are unavailable for this run."));
          const remaining = Math.max(0, this.deadline - Date.now());
          const ms = Math.min(Math.max(0, Number(parsed.ms) || 0), remaining);
          return ok(await this.deps.waitCell(String(parsed.cellId ?? ""), ms));
        }
        case "sendCell": {
          if (!this.deps.sendCell)
            return fail(new AuxError("capability_unsupported", "Subagent cells are unavailable for this run."));
          return ok(await this.deps.sendCell(String(parsed.cellId ?? ""), String(parsed.text ?? "")));
        }
        case "cancelCell": {
          if (!this.deps.cancelCell)
            return fail(new AuxError("capability_unsupported", "Subagent cells are unavailable for this run."));
          return ok(await this.deps.cancelCell(String(parsed.cellId ?? "")));
        }
        default:
          return fail(new AuxError("invalid_params", `Unknown REPL call: ${name}`));
      }
    } catch (error) {
      return fail(error);
    }
  }

  async eval(code: string, deadlineMs?: number): Promise<LoopToolResult> {
    checkSource(code);
    code = normalizeBridgeAwaits(code);
    const declared = topLevelLexicals(code);
    const scoped = declared.some((name) => this.lexicals.has(name));
    const source = scoped ? `{\n${code}\n}` : code;
    let release!: () => void;
    const previous = this.queue;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    const started = Date.now();
    this.deadline = started + Math.min(deadlineMs ?? REPL_MAX_DEADLINE_MS, REPL_MAX_DEADLINE_MS);
    this.touchedAt = started;
    this.finished = undefined;
    try {
      const result = await this.context.evalCodeAsync(source);
      if (this.finished) {
        try { this.context.unwrapResult(result).dispose(); } catch { /* accepted result is already terminal */ }
        return { finish: { result: this.finished } };
      }
      const valueHandle = this.context.unwrapResult(result); // guest exceptions throw here (park marker included)
      if (!scoped) for (const name of declared) this.lexicals.add(name);
      this.context.setProp(this.context.global, "__aux_pending_result", valueHandle);
      valueHandle.dispose();
      let marshalled: unknown;
      try {
        const marshaling = await this.context.evalCodeAsync(MARSHAL_SNIPPET);
        const json = this.context.unwrapResult(marshaling).consume((h) => this.context.getString(h));
        marshalled = json === undefined ? null : (JSON.parse(json) as unknown);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new AuxError(
          "invalid_params",
          message.includes("__aux_unmarshalable__")
            ? "REPL result is not marshalable — return plain data."
            : `REPL result is not marshalable (${message.slice(0, 120)}).`,
        );
      } finally {
        const cleared = await this.context.evalCodeAsync("delete globalThis.__aux_pending_result;");
        try {
          this.context.unwrapResult(cleared).dispose();
        } catch {
          /* cleanup only */
        }
      }
      const displayed = this.context
        .unwrapResult(await this.context.evalCodeAsync("JSON.stringify(__aux_displayed)"))
        .consume((h) => this.context.getString(h));
      const output = { value: marshalled, displayed: JSON.parse(displayed) as unknown[] };
      const json = JSON.stringify(output);
      if (json.length <= OUTPUT_CAP_BYTES) return { output };
      if (!this.deps.outputDir)
        return {
          output: {
            truncated: true,
            note: "REPL output exceeded 16 KB and no artifact store is configured.",
            preview: json.slice(0, OUTPUT_CAP_BYTES),
          },
        };
      const file = join(this.deps.outputDir, `repl-${this.deps.runId}-output-${++this.artifacts}.json`);
      mkdirSync(this.deps.outputDir, { recursive: true });
      writeFileSync(file, json);
      return {
        output: {
          truncated: true,
          outputFile: file,
          bytes: json.length,
          preview: output.value === null ? null : JSON.stringify(output.value).slice(0, 4_000),
        },
      };
    } catch (error) {
      if (this.finished) return { finish: { result: this.finished } };
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith(PARK_MARKER)) {
        try {
          return { park: JSON.parse(message.slice(PARK_MARKER.length)) as LoopPark };
        } catch {
          return { park: { kind: "ask-user-question", instruction: "This action needs your input." } };
        }
      }
      if (this.deps.signal?.aborted) throw new AuxError("cancelled", "run aborted during REPL eval");
      throw error instanceof AuxError ? error : new AuxError("invalid_params", `REPL failed: ${message}`);
    } finally {
      release();
    }
  }

  dispose() {
    this.context.dispose();
  }

  cancel() { this.cancelled = true; }
}

/** Persistent REPL sessions keyed by run — one QuickJS context each. */
export class ReplPool {
  private sessions = new Map<string, ReplSession>();
  private cells = new Map<string, { runId: string; completion: Promise<{ value?: LoopToolResult; error?: unknown }>;
    settled: boolean; terminated: boolean }>();

  private dispose(runId: string) {
    const session = this.sessions.get(runId);
    if (session) {
      const active = [...this.cells.values()].filter((cell) => cell.runId === runId && !cell.settled);
      if (active.length) {
        session.cancel();
        void Promise.all(active.map((cell) => cell.completion)).then(() => session.dispose());
      } else session.dispose();
    }
    for (const [id, cell] of this.cells) if (cell.runId === runId) this.cells.delete(id);
    this.sessions.delete(runId);
  }

  disposeAll() {
    for (const runId of this.sessions.keys()) this.dispose(runId);
  }

  hasOpen(runId: string): boolean {
    return [...this.cells.values()].some((cell) => cell.runId === runId);
  }

  async eval(
    deps: ReplHostDeps,
    code: string,
    opts?: { pageId?: string; deadlineMs?: number; yieldTimeMs?: number },
  ): Promise<LoopToolResult> {
    for (const [runId, session] of this.sessions) {
      if (Date.now() - session.touchedAt > IDLE_MS) {
        void session;
        this.dispose(runId);
      }
    }
    let session = this.sessions.get(deps.runId);
    if (!session) {
      if (this.sessions.size >= MAX_SESSIONS)
        throw new AuxError("conflict", "Too many active REPL sessions; finish or reset a run first.");
      session = await ReplSession.create(deps, opts?.pageId);
      this.sessions.set(deps.runId, session);
    }
    if (this.cells.size && [...this.cells.values()].some((cell) => cell.runId === deps.runId))
      throw new AuxError("conflict", "A REPL cell is still open; use repl_wait before starting another script.");
    if (opts?.yieldTimeMs === undefined) return session.eval(code, opts?.deadlineMs);
    const id = randomUUID();
    const cell = { runId: deps.runId, completion: Promise.resolve({} as { value?: LoopToolResult; error?: unknown }),
      settled: false, terminated: false };
    cell.completion = session.eval(code, opts.deadlineMs).then(
      (value) => ({ value }), (error) => ({ error }),
    ).then((result) => { cell.settled = true; return result; });
    this.cells.set(id, cell);
    const outcome = await this.wait(deps.runId, id, opts.yieldTimeMs);
    return outcome;
  }

  async wait(runId: string, cellId: string, yieldTimeMs = 30_000, terminate = false): Promise<LoopToolResult> {
    const cell = this.cells.get(cellId);
    if (!cell || cell.runId !== runId) throw new AuxError("not_found", "No REPL cell with that ID belongs to this run.");
    if (terminate && !cell.settled) {
      cell.terminated = true;
      this.sessions.get(runId)?.cancel();
    }
    if (cell.terminated && !cell.settled) return { output: { cellId, terminated: true } };
    let timerId: ReturnType<typeof setTimeout>;
    const timer = new Promise<undefined>((resolve) => { timerId = setTimeout(() => resolve(undefined), Math.max(0, Math.min(yieldTimeMs, REPL_MAX_DEADLINE_MS))); });
    const result = await Promise.race([cell.completion, timer]);
    clearTimeout(timerId!);
    if (!result) return { output: { cellId, running: true } };
    this.cells.delete(cellId);
    if (cell.terminated) {
      this.dispose(runId);
      return { output: { cellId, terminated: true } };
    }
    if (result.error) throw result.error;
    return result.value!;
  }
}
