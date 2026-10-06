import { z } from "zod";
import {
  AuxError,
  InlineAssistTextSchema,
  ObservationScopeSchema,
  PlanStepSchema,
  ResultCitationSchema,
} from "@aux/contracts";
import type { LoopTool, LoopToolManifest, LoopToolContext, LoopToolResult } from "./types.js";

/**
 * The built-in loop's tool manifest (S5/06-X): one definition shared by the
 * loop, MCP, CLI and SDK surfaces. Each entry carries its schema, the text
 * the model sees, and a `byline` recording provenance (05-B). Execution
 * composes existing runtime services — nothing here bypasses decide() or
 * the durable ledger.
 */

const need = <T>(value: T | undefined, name: string): T => {
  if (value === undefined)
    throw new AuxError("capability_unsupported", `${name} is not available in this context.`);
  return value;
};

/**
 * JSON.parse that tolerates the raw tabs and newlines models leave inside
 * string values. A strict parse rejects those, and the tool call is then
 * retried for the rest of the turn.
 */
export function parseLooseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    const escaped = text.replace(/[\u0000-\u001F]/g, (ch) => {
      if (ch === "\n") return "\\n";
      if (ch === "\r") return "\\r";
      if (ch === "\t") return "\\t";
      return "";
    });
    return JSON.parse(escaped) as unknown;
  }
}

/** Models often send `citations` as a JSON string or one object. The schema is an array. */
export function normalizeSubmitResultInput(raw: unknown): unknown {
  let value = raw;
  if (typeof value === "string") {
    const text = value.trim();
    if (!text.startsWith("{") && !text.startsWith("[")) return raw;
    try {
      value = parseLooseJson(text);
    } catch {
      return raw;
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const input = { ...(value as Record<string, unknown>) };
  let citations = input.citations;
  if (typeof citations === "string") {
    const text = citations.trim();
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        citations = parseLooseJson(text);
      } catch {
        /* the schema reports the unparsed string */
      }
    }
  }
  if (citations && typeof citations === "object" && !Array.isArray(citations)) citations = [citations];
  if (Array.isArray(citations)) {
    citations = citations.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return item;
      const citation = { ...(item as Record<string, unknown>) };
      if (typeof citation.revision === "string" && /^\d+$/.test(citation.revision))
        citation.revision = Number(citation.revision);
      return citation;
    });
  }
  if (citations !== input.citations) input.citations = citations;
  return input;
}

export function buildToolManifest(): LoopToolManifest {
  const snapshot: LoopTool = {
    description:
      "Read the current page: accessibility-first tree text with [ref=…] markers, form fields, links, tables and dialogs. " +
      "Default scope is interactive-first; 'all' refs every shown element and 'viewport' clips to what is on screen. " +
      "Use 'subtree' with subtreeRef to read below one element.",
    byline: "Aux page observation",
    inputSchema: z.object({
      scope: ObservationScopeSchema.optional().describe(
        "Element-collection scope; default 'full' (interactive elements + all sections).",
      ),
      subtreeRef: z.string().optional().describe("Read only the subtree below this ref (e.g. 'r12')."),
    }),
    execute: async (raw, ctx: LoopToolContext) => {
      const input = z
        .object({ scope: ObservationScopeSchema.optional(), subtreeRef: z.string().optional() })
        .parse(raw ?? {});
      if (!ctx.pageId)
        throw new AuxError("invalid_params", "snapshot needs an active page; this run claims none.");
      const obs = await need(
        ctx.deps.observe,
        "snapshot",
      )({ pageId: ctx.pageId, scope: input.scope, subtreeRef: input.subtreeRef });
      return { output: obs };
    },
  };

  const act: LoopTool = {
    description:
      "Act on the page: a batch of program steps compiled, authorized through decide(), executed and journaled to the " +
      "durable ledger. Steps run in order and report partial failures. Setter steps (fill/type/check/uncheck/select) " +
      "record the control's prior value. Do not repeat a step the ledger marks uncertain — re-observe and re-plan. " +
      "For a download, put expectDownload immediately BEFORE its triggering click; a misplaced waiter is rejected before any step runs. " +
      "When the snapshot's links differ only by an id, navigate to the matching href instead of paging click by click.",
    byline: "Aux actuation · decide() + durable write ledger",
    inputSchema: z.object({
      steps: z.array(PlanStepSchema).min(1).max(16).describe("Program steps, executed in order."),
    }),
    execute: async (raw, ctx: LoopToolContext) => {
      const input = z.object({ steps: z.array(PlanStepSchema).min(1).max(16) }).parse(raw);
      if (!ctx.pageId)
        throw new AuxError("invalid_params", "act needs an active page; this run claims none.");
      if (input.steps.some((step, index) => step.op === "expectDownload" && index === input.steps.length - 1))
        throw new AuxError(
          "invalid_params",
          "expectDownload must immediately precede its trigger; no page action was dispatched. Reissue one batch with expectDownload before the click.",
        );
      // The dep returns LoopToolResult — a safety `ask` may park the loop.
      return need(ctx.deps.act, "act")({ pageId: ctx.pageId, steps: input.steps });
    },
  };

  const webfetch: LoopTool = {
    description:
      "Fetch a public web page (text/HTML/JSON/XML, ≤1 MB). Carries no cookies; the destination is decided by decide() before dispatch.",
    byline: "Aux cookie-free web fetch",
    inputSchema: z.object({
      url: z.string().url().describe("Absolute http(s) URL; private-network addresses are denied."),
    }),
    execute: async (raw, ctx) => {
      const { url } = z.object({ url: z.string().url() }).parse(raw);
      return need(ctx.deps.webFetch, "webfetch")(url, {
        runId: ctx.runId,
        threadId: ctx.threadId,
        turnId: ctx.turnId,
      });
    },
  };

  const websearch: LoopTool = {
    description:
      "Search the web through the configured search engine; returns title, text and links. Same egress rules as webfetch.",
    byline: "Aux web search",
    inputSchema: z.object({ query: z.string().min(1).max(500) }),
    execute: async (raw, ctx) => {
      const { query } = z.object({ query: z.string().min(1).max(500) }).parse(raw);
      return need(ctx.deps.webSearch, "websearch")(query, {
        runId: ctx.runId,
        threadId: ctx.threadId,
        turnId: ctx.turnId,
      });
    },
  };

  const askUserQuestion: LoopTool = {
    description:
      "Park this turn and ask the user a question when their answer changes what you do next. " +
      "The turn resumes with your question's answer as this call's result. Must be the only tool call in its turn.",
    byline: "Aux durable suspension",
    inputSchema: z.object({
      question: z
        .string()
        .min(1)
        .max(2_000)
        .describe("One clear question with the options or format you need."),
    }),
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
      const { summary, links } = z
        .object({ summary: z.string().min(1).max(4_000), links: z.array(z.string().url()).max(8).optional() })
        .parse(raw);
      return {
        park: {
          kind: "action-confirmation",
          instruction: summary,
          detail: links?.length ? { links } : undefined,
        },
      };
    },
  };

  const writeTodos: LoopTool = {
    description:
      "Update your durable todo scratchpad for this run — short items the user can watch; survives suspension and restart.",
    byline: "Aux run scratchpad",
    inputSchema: z.object({ todos: z.array(z.string().min(1).max(280)).max(12) }),
    execute: async (raw, ctx) => {
      const { todos } = z.object({ todos: z.array(z.string().min(1).max(280)).max(12) }).parse(raw);
      await ctx.deps.writeTodos?.(todos);
      return { output: { saved: todos.length } };
    },
  };

  const repl: LoopTool = {
    description:
      "Run a whole browsing workflow in one persistent JavaScript REPL call. When the script sees the final evidence, call submitResult(report, citations) inside it to finish the run without another model call. The guest surface: page.* page actions " +
      "(page.click(ref), page.clickByName(name, role?), page.followLinkByName(name) for explicit same-origin route navigation, page.labeledValue(label), page.submitLabeledValue(label), page.fill(ref, text), page.navigate(url), page.waitFor({…}) and friends — every action " +
      "compiles to a governed step through decide() and the write ledger), snapshot(scope), tabs(), " +
      "openTab(url)/closeTab(id) for owned background tabs, page.bookmark() to save the current page after a write decision, annotatedScreenshot(), display(value), sleep(ms), " +
      "submitResult(report, citations) to finish inside the script after inspecting live observations — same verified citation and write-ledger checks as submit_result, " +
      "cookie-free fetch(url), fs confined to session roots, and subagent cells: spawn({goal, profile?, pageIds?}) " +
      "returns {cellId}, wait(cellId) yields until the cell finishes or the deadline lapses, send(cellId, text) " +
      "steers a running cell, stop(cellId) cancels it. Guest state persists across calls; modules, " +
      "eval/Function, process and WebAssembly are denied. All exposed calls are synchronous-looking: do not use await. Set yieldTimeMs to return a cell ID for a long script, then call repl_wait before starting another script or finishing. Results must be JSON data, ≤16 KB (larger output spills to a file).",
    byline: "Aux code mode — page ops still pass authorization and the ledger",
    inputSchema: z.object({
      code: z.string().min(1).max(64_000).describe("Synchronous-looking JavaScript for the REPL session."),
      deadlineMs: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Max run time for this call; capped at 120000."),
      yieldTimeMs: z
        .number()
        .int()
        .min(0)
        .max(120_000)
        .optional()
        .describe("Return a cell ID if the script is still running after this many milliseconds."),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          code: z.string().min(1).max(64_000),
          deadlineMs: z.number().int().positive().optional(),
          yieldTimeMs: z.number().int().min(0).max(120_000).optional(),
        })
        .parse(raw);
      return need(ctx.deps.repl, "repl")(input, ctx);
    },
  };

  const replWait: LoopTool = {
    description:
      "Resume a yielded REPL cell. Returns its result when finished, or the same cell ID while running. terminate stops the guest and prevents further effects from that script.",
    byline: "Aux code mode — yielded script continuation",
    inputSchema: z.object({
      cellId: z.string().uuid(),
      yieldTimeMs: z.number().int().min(0).max(120_000).optional(),
      terminate: z.boolean().optional(),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          cellId: z.string().uuid(),
          yieldTimeMs: z.number().int().min(0).max(120_000).optional(),
          terminate: z.boolean().optional(),
        })
        .parse(raw);
      return need(ctx.deps.replWait, "repl_wait")(input, ctx);
    },
  };

  const goalProgram: LoopTool = {
    description:
      "First-turn page workflow. Write one synchronous-looking JavaScript script that performs the whole task and calls submitResult(report, citations) or page.submitLabeledValue(label) after inspecting live evidence. Supply answerLabel with the requested field label (or empty string for non-labeled answers); for a requested dialog-only value set answerScope to dialog. If the script's own extraction fails after opening a visible modal, a unique labeled value in that modal may complete via the same verifier. For pagination or a route link, use page.followLinkByName(name): it resolves one observed same-origin href and navigates the current tab without firing click handlers. Use page.clickByName(name, role?) when click behavior is required, such as a button, download, or new-tab link. page.navigateMatching(targetId) resolves a unique same-origin route only when observed sibling links support it. All named lookups fail on ambiguity; actions still pass decide() and the durable write ledger. On other ambiguity, throw rather than guess; ordinary tools are available on the next turn.",
    byline: "Aux first-turn goal program — governed REPL with verified finish",
    inputSchema: z.object({
      code: z
        .string()
        .min(1)
        .max(64_000)
        .describe("One complete REPL script ending in submitResult(...) or page.submitLabeledValue(...)."),
      answerLabel: z
        .string()
        .max(160)
        .describe("Requested visible field label, or empty when the answer is not a labeled value."),
      answerScope: z.enum(["dialog"]).optional(),
      deadlineMs: z.number().int().positive().optional(),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          code: z.string().min(1).max(64_000),
          answerLabel: z.string().max(160),
          answerScope: z.enum(["dialog"]).optional(),
          deadlineMs: z.number().int().positive().optional(),
        })
        .parse(raw);
      if (!/\b(?:submitResult|submitLabeledValue)\s*\(/.test(input.code))
        return {
          output: new AuxError(
            "invalid_params",
            "Goal program needs a verified terminal submitResult or page.submitLabeledValue call; use ordinary tools on the next turn if the answer cannot be derived safely.",
          ),
        };
      const run = need(ctx.deps.repl, "goal_program");
      const recoveryLabel =
        ctx.deps.dialogAnswerLabel?.() ?? (input.answerScope === "dialog" ? input.answerLabel : "");
      const failureWithProgress = async (error: unknown): Promise<LoopToolResult> => {
        const message = error instanceof Error ? error.message : String(error);
        if (ctx.signal?.aborted || !ctx.deps.replProgress) return { output: { error: message } };
        try {
          const current = await ctx.deps.replProgress();
          if (!current) return { output: { error: message } };
          return {
            output: {
              error: message,
              currentObservation: {
                pageId: current.pageId,
                observationId: current.observationId,
                revision: current.revision,
                text: current.text.slice(0, 4_096),
                truncated: current.text.length > 4_096,
              },
              guidance:
                "Continue from this fresh page state. Do not repeat an action whose outcome is uncertain; reconcile it with evidence first.",
            },
          };
        } catch {
          return { output: { error: message } };
        }
      };
      try {
        const result = await run(input, ctx);
        if (
          "finish" in result ||
          "park" in result ||
          !recoveryLabel ||
          !ctx.deps.canRecoverDialogValue?.(recoveryLabel)
        )
          return result;
      } catch (error) {
        if (!recoveryLabel || !ctx.deps.canRecoverDialogValue?.(recoveryLabel))
          return failureWithProgress(error);
      }
      try {
        return await run(
          { code: `page.submitLabeledValue(${JSON.stringify(recoveryLabel)})`, deadlineMs: input.deadlineMs },
          ctx,
        );
      } catch (error) {
        return failureWithProgress(error);
      }
    },
  };

  const getTime: LoopTool = {
    description: "Current wall-clock time (ISO and epoch ms).",
    byline: "Aux clock",
    inputSchema: z.object({}),
    execute: () => ({ output: { iso: new Date().toISOString(), unixMs: Date.now() } }),
  };

  const readFile: LoopTool = {
    description: "Read a UTF-8 text file inside the session roots (artifacts, downloads, workspace).",
    byline: "Aux confined fs",
    inputSchema: z.object({ path: z.string().min(1).max(4_096) }),
    execute: async (raw, ctx) => {
      const { path } = z.object({ path: z.string().min(1).max(4_096) }).parse(raw);
      return { output: await need(ctx.deps.fileRead, "read_file")(path) };
    },
  };

  const writeFile: LoopTool = {
    description: "Write a UTF-8 text file inside the session roots, creating parent directories.",
    byline: "Aux confined fs",
    inputSchema: z.object({
      path: z.string().min(1).max(4_096),
      content: z.string().max(1_000_000),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({ path: z.string().min(1).max(4_096), content: z.string().max(1_000_000) })
        .parse(raw);
      await need(ctx.deps.fileWrite, "write_file")(input.path, input.content);
      return { output: { written: input.path } };
    },
  };

  const editFile: LoopTool = {
    description:
      "Replace text in a file inside the session roots. `oldText` must occur exactly once unless `all` is set; " +
      "fail honestly when it is absent or ambiguous so the edit can be re-read and retried.",
    byline: "Aux confined fs",
    inputSchema: z.object({
      path: z.string().min(1).max(4_096),
      oldText: z.string().min(1).max(200_000),
      newText: z.string().max(200_000),
      all: z.boolean().optional().describe("Replace every occurrence instead of requiring exactly one."),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          path: z.string().min(1).max(4_096),
          oldText: z.string().min(1).max(200_000),
          newText: z.string().max(200_000),
          all: z.boolean().optional(),
        })
        .parse(raw);
      const read = need(ctx.deps.fileRead, "edit_file");
      const write = need(ctx.deps.fileWrite, "edit_file");
      const current = await read(input.path);
      const occurrences = current.split(input.oldText).length - 1;
      if (!occurrences) throw new AuxError("not_found", "oldText is not in the file — re-read it and retry.");
      if (!input.all && occurrences > 1)
        throw new AuxError(
          "conflict",
          `oldText occurs ${occurrences} times — quote more context or pass all: true.`,
        );
      const next = input.all
        ? current.split(input.oldText).join(input.newText)
        : current.replace(input.oldText, input.newText);
      await write(input.path, next);
      return { output: { edited: input.path, replacements: input.all ? occurrences : 1 } };
    },
  };

  const bash: LoopTool = {
    description:
      "Run a shell command inside the current file permissions. Auto and Full allow outbound network by default; Ask can request it with network:true. Commands always stay sandboxed. stdout/stderr are bounded to 64 KB and timeoutMs to 120000.",
    byline: "Aux sandbox — current file and network permissions",
    inputSchema: z.object({
      command: z
        .string()
        .min(1)
        .max(8_192)
        .describe("The command line, run via /bin/sh -c inside the seatbelt."),
      timeoutMs: z.number().int().positive().optional(),
      workdir: z
        .string()
        .max(4_096)
        .optional()
        .describe("Working directory inside any granted read or write root."),
      network: z.boolean().optional().describe("Override outbound network; Ask mode requires permission."),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          command: z.string().min(1).max(8_192),
          timeoutMs: z.number().int().positive().optional(),
          workdir: z.string().max(4_096).optional(),
          network: z.boolean().optional(),
        })
        .parse(raw);
      return need(ctx.deps.bash, "bash")(input, {
        runId: ctx.runId,
        threadId: ctx.threadId,
        turnId: ctx.turnId,
      });
    },
  };

  const historySearch: LoopTool = {
    description: "Search browser history by title/URL text — returns the most recent matching visits.",
    byline: "Aux history",
    inputSchema: z.object({
      query: z.string().min(1).max(500),
      limit: z.number().int().positive().max(50).optional(),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({ query: z.string().min(1).max(500), limit: z.number().int().positive().max(50).optional() })
        .parse(raw);
      return {
        output: {
          entries: await need(ctx.deps.historySearch, "history_search")(input.query, input.limit ?? 10),
        },
      };
    },
  };

  const memorySearch: LoopTool = {
    description:
      "Search this workspace's protected page memory — pages you were allowed to remember. " +
      "Returns ranked snippets; empty when recall is off for this workspace.",
    byline: "Aux content memory",
    inputSchema: z.object({ query: z.string().min(1).max(500) }),
    execute: async (raw, ctx) => {
      const { query } = z.object({ query: z.string().min(1).max(500) }).parse(raw);
      return {
        output: {
          memories: await need(ctx.deps.memorySearch, "memory_search")(query, {
            runId: ctx.runId,
            threadId: ctx.threadId,
            turnId: ctx.turnId,
          }),
        },
      };
    },
  };

  const subagent: LoopTool = {
    description:
      "Spawn a subagent cell under this run — an independent durable agent with its own goal. " +
      "Returns {cellId}; check in with subagent_wait, steer with subagent_send, cancel with subagent_stop.",
    byline: "Aux subagent cells",
    inputSchema: z.object({
      goal: z.string().min(1).max(8_000).describe("The cell's objective."),
      profile: z.enum(["default", "explorer", "read_only"]).optional(),
      pageIds: z
        .array(z.string().min(1).max(200))
        .max(8)
        .optional()
        .describe("Pages to hand the cell — default: this run's pages."),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          goal: z.string().min(1).max(8_000),
          profile: z.enum(["default", "explorer", "read_only"]).optional(),
          pageIds: z.array(z.string().min(1).max(200)).max(8).optional(),
        })
        .parse(raw);
      const spawn = ctx.deps.subagents?.spawnCell;
      if (!spawn)
        throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return { output: await spawn(input, { runId: ctx.runId, threadId: ctx.threadId, turnId: ctx.turnId }) };
    },
  };

  const subagentWait: LoopTool = {
    description:
      "Wait for a subagent cell to finish or the timeout to lapse; returns its state, result or error.",
    byline: "Aux subagent cells",
    inputSchema: z.object({
      cellId: z.string().min(1).max(200),
      timeoutMs: z.number().int().positive().max(120_000).optional(),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          cellId: z.string().min(1).max(200),
          timeoutMs: z.number().int().positive().max(120_000).optional(),
        })
        .parse(raw);
      const wait = ctx.deps.subagents?.waitCell;
      if (!wait) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return { output: await wait(input.cellId, input.timeoutMs ?? 60_000) };
    },
  };

  const subagentSend: LoopTool = {
    description: "Steer a running subagent cell with new instructions.",
    byline: "Aux subagent cells",
    inputSchema: z.object({
      cellId: z.string().min(1).max(200),
      message: z.string().min(1).max(8_000),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({ cellId: z.string().min(1).max(200), message: z.string().min(1).max(8_000) })
        .parse(raw);
      const send = ctx.deps.subagents?.sendCell;
      if (!send) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      await send(input.cellId, input.message);
      return { output: { sent: input.cellId } };
    },
  };

  const subagentStop: LoopTool = {
    description: "Cancel a subagent cell.",
    byline: "Aux subagent cells",
    inputSchema: z.object({ cellId: z.string().min(1).max(200) }),
    execute: async (raw, ctx) => {
      const { cellId } = z.object({ cellId: z.string().min(1).max(200) }).parse(raw);
      const cancel = ctx.deps.subagents?.cancelCell;
      if (!cancel)
        throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      await cancel(cellId);
      return { output: { stopped: cellId } };
    },
  };

  const routineUpdate: LoopTool = {
    description:
      "Propose a change to an automation routine in this workspace — title, description, objective, trigger or " +
      "paused state. The user confirms every change before it lands; an approval lets the same call run once.",
    byline: "Aux routines — confirmed before landing",
    inputSchema: z.object({
      routineId: z.string().min(1).max(200),
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(2_000).optional(),
      objective: z.string().max(4_000).optional(),
      trigger: z
        .unknown()
        .optional()
        .describe("RoutineTrigger payload, e.g. {kind:'schedule', cron:'0 9 * * *'}."),
      paused: z.boolean().optional(),
      expectedRevision: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Optimistic-concurrency guard — omit to apply to the current revision."),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          routineId: z.string().min(1).max(200),
          title: z.string().min(1).max(200).optional(),
          description: z.string().max(2_000).optional(),
          objective: z.string().max(4_000).optional(),
          trigger: z.unknown().optional(),
          paused: z.boolean().optional(),
          expectedRevision: z.number().int().positive().optional(),
        })
        .parse(raw);
      return need(ctx.deps.routineUpdate, "routine_update")(input, {
        runId: ctx.runId,
        threadId: ctx.threadId,
        turnId: ctx.turnId,
      });
    },
  };

  const notification: LoopTool = {
    description: "Post a durable notice on this run's event stream — the user sees it in the task view.",
    byline: "Aux run notice",
    inputSchema: z.object({ text: z.string().min(1).max(2_000) }),
    execute: async (raw, ctx) => {
      const { text } = z.object({ text: z.string().min(1).max(2_000) }).parse(raw);
      await ctx.deps.notify?.({ text }, { runId: ctx.runId, threadId: ctx.threadId, turnId: ctx.turnId });
      return { output: { posted: true } };
    },
  };

  const submitResult: LoopTool = {
    description:
      "Finish the run with the verified result. `report` is the final answer; `citations` ground it — each cites a " +
      "snapshot you observed (observationId, or pageId + revision) with a verbatim `quote` copied from that snapshot's " +
      "text. The verifier checks every quote exists in the cited snapshot; an unverifiable citation rejects the call — " +
      "re-observe, fix the quote, and resubmit. Paraphrase around quotes is allowed. If a write is marked uncertain in " +
      "the write ledger, use reconcile_action with a fresh effect line before submitting. " +
      "It may share a turn with the act or repl that does the work; it runs after those calls. " +
      "When the answer depends on a result you have not seen yet, it is the only call on the next turn.",
    byline: "Aux verified result — citations checked against the cited snapshots",
    inputSchema: z.object({
      report: z
        .string()
        .min(1)
        .max(64_000)
        .describe(
          "The final answer. Give exactly what the task asked for — a bare name, number, status, filename, or short " +
            "confirmation — not a narrative of the steps you took. Longer prose only when the task asks for a report.",
        ),
      citations: z
        .array(ResultCitationSchema)
        .max(32)
        .optional()
        .describe("Array of citation objects. Never a JSON string."),
      textProposal: InlineAssistTextSchema.optional().describe(
        "Optional exact plain text the person may review and insert into a focused browser field. Use only for a requested writing draft.",
      ),
    }),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          report: z.string().min(1).max(64_000),
          citations: z.array(ResultCitationSchema).max(32).optional(),
          textProposal: InlineAssistTextSchema.optional(),
        })
        .parse(normalizeSubmitResultInput(raw));
      const verdict = await need(ctx.deps.submitResult, "submit_result")(input, ctx);
      if (!verdict.ok) return { output: new AuxError("invalid_params", verdict.error) };
      return { finish: { result: verdict.result } };
    },
  };

  const reconcileAction: LoopTool = {
    description:
      "Settle one uncertain page write after observing its actual effect. Cite one exact full line from a fresh snapshot of the affected page that was absent before dispatch; describe the specific intended effect shown by that line. An unchanged title or generic page text is not proof. Omit intentId only when this run has exactly one unresolved intent. Do not replay the write.",
    byline: "Aux durable write reconciliation — fresh effect evidence",
    inputSchema: z
      .object({
        intentId: z.string().optional(),
        citation: ResultCitationSchema,
        effect: z.string().min(1).max(500),
      })
      .strict(),
    execute: async (raw, ctx) => {
      const input = z
        .object({
          intentId: z.string().optional(),
          citation: ResultCitationSchema,
          effect: z.string().min(1).max(500),
        })
        .strict()
        .parse(raw);
      return { output: await need(ctx.deps.reconcileAction, "reconcile_action")(input) };
    },
  };

  const goalUpdate: LoopTool = {
    description:
      "Report this Goal as paused, or report a blocker. A blocked Goal pauses only after you report the exact same blocker on three consecutive model turns. Use submit_result to complete. This cannot change the owner's budget.",
    byline: "Aux Goal status — owner-controlled budget",
    inputSchema: z
      .object({ status: z.enum(["paused", "blocked"]), blocker: z.string().min(1).max(2_000).optional() })
      .strict(),
    requiresSoloCall: true,
    execute: async (raw, ctx) => {
      const input = z
        .object({ status: z.enum(["paused", "blocked"]), blocker: z.string().min(1).max(2_000).optional() })
        .strict()
        .parse(raw);
      return { output: await need(ctx.deps.goalUpdate, "goal_update")(input, ctx) };
    },
  };

  return {
    get_time: getTime,
    snapshot,
    act,
    repl,
    repl_wait: replWait,
    goal_program: goalProgram,
    webfetch,
    websearch,
    ask_user_question: askUserQuestion,
    request_action_confirmation: requestActionConfirmation,
    write_todos: writeTodos,
    read_file: readFile,
    write_file: writeFile,
    edit_file: editFile,
    bash,
    history_search: historySearch,
    memory_search: memorySearch,
    subagent,
    subagent_wait: subagentWait,
    subagent_send: subagentSend,
    subagent_stop: subagentStop,
    routine_update: routineUpdate,
    notification,
    goal_update: goalUpdate,
    reconcile_action: reconcileAction,
    submit_result: submitResult,
  };
}
