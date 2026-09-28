import { AuxError, type Observation, type Run, type StepOutcome } from "@aux/contracts";
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve, sep } from "node:path";
import type { CoordinatorLoopHost } from "../coordinator-verify.js";
import { DEFAULT_MAX_MODEL_CALLS, NAV_OPS, TERMINAL_STATUSES, markUnconfirmedWrites, verifyResultCitations } from "../coordinator-verify.js";
import { classifyStep, subagentGrants } from "../permissions.js";
import { observationLineHash } from "../durable.js";
import { redactObservation } from "../planner.js";
import { redactForModel } from "../policy.js";
import { guardedExecute } from "../guarded-dispatch.js";
import { renderObservation } from "../../services/observation-render.js";
import { runAgentLoop, resumeAgentLoop, type AgentLoopOptions, type AgentLoopOutcome } from "./loop.js";
import { ReplPool, type ReplHostDeps, type ReplTab } from "./repl.js";
import type { WebmcpOutcome } from "../webmcp.js";
import { permittedWebUrl } from "../web-tools.js";
import { TranscriptStore } from "./transcript.js";
import { recordRunTabChange } from "../../services/browser-change-ledger.js";
import { buildToolManifest } from "./tools.js";
import { matchingRoute } from "./route.js";
import type { LoopToolDeps, LoopToolResult, ModelMessage } from "./types.js";

/**
 * The run-lifecycle host for the S5 tool loop (the coordinator-loop sibling).
 * `coordinator.loop()` picks it when `run.config.implementation === "agent-loop"`.
 * It owns the pieces the loop does not: page ownership is already held by the
 * caller; this host seeds the durable transcript, builds the tool deps from
 * runtime services (decide() and the write ledger ride inside them), maps a
 * `parked` outcome onto a durable suspension + needs_input park, drains user
 * steers into the transcript, and finishes the run.
 */
export interface AgentLoopHostDeps {
  /** decide()-gated web backends — main.ts builds them from AgentWebTools + decideDeps. */
  webFetch?: LoopToolDeps["webFetch"];
  webSearch?: LoopToolDeps["webSearch"];
  /** Auto-recall backend (06-Z) — main.ts queries content memory under the run's workspace policy. */
  recall?: LoopToolDeps["recall"];
  workspaceContext?: (workspaceId: string) => string;
  /** Code-mode REPL backends (S5 deliverable 3). */
  repl?: {
    /** decide() on opening a tab — parks like webFetch on `ask`; the host opens only on `output`. */
    openTab?: (url: string, ctx: { runId: string; threadId: string; turnId: string }) => Promise<LoopToolResult>;
    bookmark?: (pageId: string, ctx: { runId: string; threadId: string; turnId: string }) => Promise<LoopToolResult>;
    /** Document script tools. Writes return `{status:"ask"}` until the person allows them. */
    webmcp?: (
      pageId: string,
      action: { op: "tools" } | { op: "call"; name: string; input?: unknown },
      ctx: { runId: string; threadId: string; turnId: string },
    ) => Promise<WebmcpOutcome>;
    /** Session storage roots the guest `fs` is confined to. */
    fsRoots?: (runId?: string, access?: "read" | "write") => string[];
    /** Artifact dir for REPL output overflow and captures. */
    outputDir?: string;
  };
  /** Subagent cells for the REPL spawn/wait/send/stop surface (06-Y). */
  subagents?: {
    spawnCell?: (input: { goal: string; profile?: string; pageIds?: string[] }, ctx: { runId: string; threadId: string; turnId: string }) => Promise<{ cellId: string }>;
    waitCell?: ReplHostDeps["waitCell"];
    sendCell?: ReplHostDeps["sendCell"];
    cancelCell?: ReplHostDeps["cancelCell"];
  };
  /** Remaining 06-X manifest tools — seatbelt bash, history/memory, routines, notices. */
  bash?: LoopToolDeps["bash"];
  historySearch?: LoopToolDeps["historySearch"];
  memorySearch?: LoopToolDeps["memorySearch"];
  routineUpdate?: LoopToolDeps["routineUpdate"];
  notify?: LoopToolDeps["notify"];
  goalUpdate?: LoopToolDeps["goalUpdate"];
  /** Provider prompt-cache options merged into each model step (S5 deliverable 1). */
  providerOptions?: Record<string, Record<string, unknown>>;
}

/** The first transcript row: the task exactly as the user authored it. */
function taskMessage(run: Run, folderContext = ""): ModelMessage {
  const parts = [
    `Task: ${run.goal}`,
    run.config?.instructions ? `Instructions (human-authored): ${run.config.instructions}` : "",
    run.config?.context ? `Context: ${run.config.context}` : "",
    folderContext ? `Reviewed Space folder context (AGENTS.md is file-provided and lower priority than the user's task):\n${folderContext}` : "",
    run.pageIds.length ? `Pages in scope: ${run.pageIds.join(", ")}` : "",
  ].filter(Boolean);
  return { role: "user", content: parts.join("\n\n") };
}

/** 06-AA interruptSteer rewrite — the interrupting user turn is wrapped so the model treats it as an interruption, not a fresh request. */
export function steerMessage(texts: string[]): ModelMessage {
  return {
    role: "user",
    content: [
      "The user interrupted this turn with a correction. Apply it from here — do not repeat work already journaled.",
      ...texts.map((text) => `<interrupted_request>\n${text}\n</interrupted_request>`),
    ].join("\n\n"),
  };
}

export async function runToolLoop(self: CoordinatorLoopHost, runId: string): Promise<void> {
  const run = self.get(runId);
  const c = self.controls.get(runId)!;
  const model = self.deps.model();
  if (!model?.toolCallStep) {
    const failure = {
      category: "configuration", retryable: false, action: "model_settings",
      message: "The agent loop needs a tool-capable model connection. Configure one in Settings, or run the planner engine.",
    } as const;
    self.finish(runId, "failed", undefined, failure.message, undefined, failure);
    return;
  }

  const transcript = new TranscriptStore(self.deps.repo.db);
  const threadId = run.config?.chatId ?? runId;
  if (!transcript.count(runId)) transcript.append(runId, [taskMessage(run,
    run.config?.contextWorkspaceId ? self.deps.agentLoop?.workspaceContext?.(run.config.contextWorkspaceId) : "")]);

  let activePageId = run.pageIds[0];
  const lastObs = new Map<string, Observation>();
  const outcomes: StepOutcome[] = [];
  /** Verification v2 — rendered text of every observation the model saw, keyed by each citation handle it can use. */
  const obsTexts = new Map<string, string>();
  /** Citation handle → snapshot identity — resolves which page/revision a cited handle points at. */
  const obsMeta = new Map<string, { pageId: string; revision: number }>();
  const obsAt = new Map<string, number>();
  /** stepId → the page/revision a write dispatched against — a citation on the same page at a later revision confirms it. */
  const writeDispatches = new Map<string, { pageId: string; revision: number }>();
  let applied = run.config?.messageRevision ?? 0;
  let steerCursor = self.deps.repo.listRunSteers(runId).length;
  // A resumed process inherits the calls already billed for this run. The
  // step cap must not reset just because the in-memory host restarted.
  let modelCalls = self.deps.repo.listModelCalls(runId).filter((call) => call.role === "agent").length;
  const maxModelCalls = run.config?.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS;
  /** One re-observe chance when an uncertain dispatch blocks a done turn. */
  let blockedOnLedger = false;

  const signal = c.dispatchAbort ? AbortSignal.any([c.abort.signal, c.dispatchAbort.signal]) : c.abort.signal;
  const steerPending = () =>
    c.paused || (self.deps.repo.getRun(runId)?.config?.messageRevision ?? 0) !== applied;

  /** Track uncertain writes for checkpoint/finish the same way the planner does. */
  const noteUnresolved = () => {
    self.unresolvedByRun.set(
      runId,
      outcomes
        // NAV_OPS never count as writes — same exclusion verifyDone applies.
        .filter((o) => !NAV_OPS.has(o.op) && (o.receipt?.uncertain === true || o.receipt?.dispatchedBeforeTakeover === true || o.effect === "uncertain" || o.effect === "dispatched"))
        .map((o) => o.stepId),
    );
  };

  /** observe with the same detached-target fallback the planner loop uses. */
  const observePage = async (pageId: string, req: { scope?: import("@aux/contracts").ObservationScope; subtreeRef?: string }): Promise<Observation> => {
    try {
      return await self.deps.pages.observe(pageId, req);
    } catch (error) {
      if (error instanceof AuxError && error.code === "target_detached") {
        const next = run.pageIds.find((candidate) => {
          if (candidate === pageId || !self.deps.pages.livePageIds().includes(candidate)) return false;
          const status = self.deps.pages.get(candidate).viewStatus;
          return status !== "detached" && status !== "crashed";
        });
        if (!next) throw error;
        activePageId = next;
        self.setStatus(runId, "running", `Page detached — moved to ${next}`);
        return await self.deps.pages.observe(next, req);
      }
      throw error;
    }
  };

  /** Snapshot bookkeeping — every rendered observation gets a durable, citable handle. */
  const recordObs = (obs: Observation) => {
    lastObs.set(obs.pageId, obs);
    const artifactId = self.deps.saveObservation?.(runId, obs);
    const observationId = artifactId ?? `rev:${obs.revision}`;
    // The same redacted render the planner shows — secrets never reach the model,
    // and citation verification checks the text the model actually saw.
    const text = renderObservation(redactObservation(obs));
    obsTexts.set(observationId, text);
    obsTexts.set(`${obs.pageId}@${obs.revision}`, text);
    obsTexts.set(obs.pageId, text);
    obsMeta.set(observationId, { pageId: obs.pageId, revision: obs.revision });
    obsMeta.set(`${obs.pageId}@${obs.revision}`, { pageId: obs.pageId, revision: obs.revision });
    obsAt.set(observationId, Date.now());
    obsAt.set(`${obs.pageId}@${obs.revision}`, Date.now());
    return { text, observationId, revision: obs.revision };
  };

  const deps: LoopToolDeps = {
    observe: async ({ pageId, scope, subtreeRef }) => {
      const obs = await observePage(pageId, { scope, subtreeRef });
      return recordObs(obs);
    },
    act: async ({ pageId, steps }): Promise<LoopToolResult> => {
      const obs = lastObs.get(pageId) ?? (lastObs.set(pageId, await observePage(pageId, {})), lastObs.get(pageId)!);
      const safeObs = redactObservation(obs);
      const actionLabels = steps.filter((step) => classifyStep(step.op) !== "read").flatMap((step) => {
        const target = "target" in step ? step.target : undefined;
        if (typeof target !== "string") return [];
        const name = safeObs.content.elements.find((element) => element.ref === target)?.name
          ?? safeObs.content.formFields.find((field) => field.ref === target)?.label;
        const redacted = name ? String(redactForModel(name)) : "";
        return redacted && !redacted.startsWith("{handle:") ? [redacted.slice(0, 80)] : [];
      });
      const gate = await guardedExecute(
        { pages: self.deps.pages, durable: self.durable, grants: subagentGrants(run.config?.subagentProfile, self.deps.grants) },
        {
          runId, pageId, steps,
          observation: obs.content, url: obs.content.url,
          beforeText: renderObservation(safeObs), actionLabels,
          documentEpoch: obs.documentEpoch, revision: obs.revision,
          taskId: run.config?.taskId, taskRevision: run.config?.taskRevision,
          isCurrent: () => !steerPending() && !signal.aborted,
          exec: {
            runId, taskId: run.config?.taskId, signal,
            onStep: (outcome, step) => {
              outcomes.push(outcome);
              writeDispatches.set(outcome.stepId, { pageId, revision: obs.revision });
              self.deps.onStepRecorded?.(runId, outcome, step);
            },
          },
          returnObservation: { scope: "full" },
        },
      );
      if (gate.kind !== "ran") return { output: { [gate.kind]: gate.reason } };
      // The post-action observation is citable too — a write's post-state is
      // what a consequential-write citation points at.
      const post = gate.result.observation ? recordObs(gate.result.observation) : undefined;
      noteUnresolved();
      self.persistCheckpoint(self.get(runId));
      // A safety `ask` parks a suspension inside the gate and fails the step
      // with needs_input — park the loop on that same record, never a second.
      const needsInput = gate.result.steps.find((outcome) => outcome.error?.code === "needs_input");
      if (needsInput) {
        const pending = self.suspensions.pending(runId);
        if (pending) {
          return {
            park: {
              kind: pending.kind,
              instruction: pending.request.instruction || needsInput.error?.message || "This action needs your input.",
              ...(pending.request.approvalId ? { approvalId: pending.request.approvalId } : {}),
            },
          };
        }
      }
      return {
        output: {
          status: gate.result.status,
          steps: gate.result.steps.map((outcome) => ({
            op: outcome.op, status: outcome.status, detail: outcome.detail,
            ...(outcome.error ? { error: `${outcome.error.code}: ${outcome.error.message}` } : {}),
            ...(outcome.before !== undefined ? { before: outcome.before } : {}),
            ...(outcome.extracted !== undefined ? { extracted: outcome.extracted } : {}),
          })),
          ...(gate.result.error ? { error: gate.result.error } : {}),
          ...(post ? { observation: post.text, observationId: post.observationId, revision: post.revision } : {}),
        },
      };
    },
    submitResult: async ({ report, citations }) => {
      if (citations?.length) {
        const check = verifyResultCitations(citations, obsTexts);
        if (check.missing.length || check.unverified.length) {
          const problems = [
            ...check.missing.map((i) => `citation ${i + 1}: no snapshot found for the cited handle`),
            ...check.unverified.map((i) => `citation ${i + 1}: quote not found in the cited snapshot`),
          ];
          return { ok: false as const, error: `Unverifiable citations — ${problems.join("; ")}. Re-observe and quote exactly.` };
        }
      }
      // An uncertain effect is settled only by reconcile_action, which checks
      // fresh evidence against the persisted pre-dispatch state.
      const unresolved = [
        ...(self.unresolvedByRun.get(runId) ?? []),
        ...self.durable.unresolved(runId).map((intent) => intent.id),
      ];
      if (unresolved.length)
        return { ok: false as const, error: `${unresolved.length} uncertain dispatch(es) are recorded in the write ledger (${self.durable.unresolved(runId).map((intent) => intent.id).join(", ")}) — use reconcile_action with a fresh snapshot proving the intended effect before submitting.` };
      const unconfirmed = markUnconfirmedWrites(outcomes);
      const result: Record<string, unknown> = { report };
      if (citations?.length) result.citations = citations;
      if (unconfirmed.length) result.unconfirmedWrites = unconfirmed;
      return { ok: true as const, result };
    },
    reconcileAction: async ({ intentId, citation, effect }) => {
      const pending = self.durable.unresolved(runId);
      const selectedId = intentId ?? (pending.length === 1 ? pending[0]!.id : undefined);
      const intent = selectedId ? self.durable.getById(selectedId) : undefined;
      if (!intent || intent.runId !== runId || !["pending", "uncertain"].includes(intent.status))
        return { ok: false as const, error: "No unresolved intent with that ID belongs to this run." };
      if (intent.summary?.ops.length !== 1 || !intent.summary.beforeLineHashes.length)
        return { ok: false as const, error: "This intent lacks a single action and recorded pre-state; leave its effect uncertain." };
      const key = citation.observationId ?? `${citation.pageId}@${citation.revision}`;
      const meta = obsMeta.get(key);
      const text = obsTexts.get(key);
      const observedAt = obsAt.get(key);
      if (!meta || !text || observedAt === undefined || meta.pageId !== intent.pageId || observedAt < intent.createdAt)
        return { ok: false as const, error: "Cite a fresh observation of the affected page after the write." };
      const quote = citation.quote.trim();
      if (!quote || !text.split("\n").some((line) => line.trim() === quote))
        return { ok: false as const, error: "Evidence must be one exact rendered line from the cited observation." };
      if (intent.summary?.beforeLineHashes.includes(observationLineHash(quote)))
        return { ok: false as const, error: "That line was already visible before the write and does not prove its effect." };
      const labels = intent.summary?.actionLabels ?? [];
      if (!labels.length) return { ok: false as const, error: "The ledger has no redacted action label to bind this evidence; leave the effect uncertain." };
      const completedClickWords: Record<string, string> = {
        save: "saved", submit: "submitted", create: "created", delete: "deleted", update: "updated",
        approve: "approved", send: "sent", publish: "published", apply: "applied", remove: "removed",
        add: "added", confirm: "confirmed", complete: "completed", place: "placed", cancel: "cancelled",
      };
      if (intent.summary?.ops.includes("click")) {
        const completed = labels.some((label) => {
          const word = completedClickWords[label.trim().toLowerCase().split(/\s+/)[0]!];
          return word && new RegExp(`\\b${word}\\b`, "i").test(quote);
        });
        if (!completed) return { ok: false as const, error: "The new line does not confirm the click completed." };
      }
      if (!labels.some((label) => {
        const stem = label.trim().toLowerCase().split(/\s+/)[0]!.replace(/e$/, "");
        return stem.length >= 3 && quote.toLowerCase().includes(stem);
      })) return { ok: false as const, error: "The new line does not show the intended action's effect." };
      if (!effect.trim() || !quote.toLowerCase().includes(effect.trim().toLowerCase()))
        return { ok: false as const, error: "The claimed effect must appear verbatim in the new post-state line." };
      self.durable.reconcile(intent.id, "applied", JSON.stringify({
        observationId: key,
        quote: redactForModel(quote),
        effect: redactForModel(effect.trim()),
      }));
      for (const outcome of outcomes) {
        const dispatch = writeDispatches.get(outcome.stepId);
        if (dispatch?.pageId !== intent.pageId) continue;
        if (outcome.receipt) outcome.receipt = { ...outcome.receipt, uncertain: false, unconfirmed: false, dispatchedBeforeTakeover: false, observed: quote };
        if (outcome.effect === "uncertain" || outcome.effect === "dispatched") outcome.effect = "observed";
      }
      noteUnresolved();
      return { ok: true as const, intentId: intent.id, status: "confirmed" as const };
    },
    webFetch: self.deps.agentLoop?.webFetch,
    webSearch: self.deps.agentLoop?.webSearch,
    recall: self.deps.agentLoop?.recall,
    fsRoots: () => fsRoots("write"),
    fileRead: async (path) => {
      if (!insideRoots(path, "read")) throw new AuxError("permission_denied", "read_file stays inside reviewed roots.");
      return readFileSync(path, "utf8");
    },
    fileWrite: async (path, content) => {
      if (!insideRoots(path, "write")) throw new AuxError("permission_denied", "write_file stays inside reviewed writable roots.");
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    },
    bash: self.deps.agentLoop?.bash,
    historySearch: self.deps.agentLoop?.historySearch,
    memorySearch: self.deps.agentLoop?.memorySearch,
    subagents: self.deps.agentLoop?.subagents,
    routineUpdate: self.deps.agentLoop?.routineUpdate,
    notify: self.deps.agentLoop?.notify,
    goalUpdate: self.deps.repo.db.prepare("SELECT 1 FROM goals WHERE run_id=?").get(runId)
      ? self.deps.agentLoop?.goalUpdate : undefined,
    writeTodos: (todos) => {
      self.deps.repo.saveCheckpoint(`run:${runId}`, "loop_todos", { todos });
    },
  };

  // ---- code-mode REPL (S5 deliverable 3) ----
  const replPool = new ReplPool();
  let beforeModalClickText: string | undefined;
  /** Tabs this run opened via openTab — pageId → ownership release. */
  const openedTabs = new Map<string, () => void>();
  const replTab = (pageId: string): ReplTab => {
    const target = self.deps.pages.get(pageId);
    return {
      pageId,
      url: target.url,
      title: target.title,
      active: self.deps.pages.activePageIdFor(target.windowId) === pageId,
      owned: openedTabs.has(pageId) || target.ownedByRuntime,
    };
  };
  const fsRoots = (access: "read" | "write") =>
    (self.deps.agentLoop?.repl?.fsRoots?.(runId, access) ?? []).map((root) => realpathSync(root));
  const canonicalTarget = (path: string) => {
    let current = resolve(path);
    const missing: string[] = [];
    while (true) {
      try { lstatSync(current); break; } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        missing.unshift(basename(current));
        const parent = dirname(current);
        if (parent === current) throw new AuxError("permission_denied", "File path has no existing parent.");
        current = parent;
      }
    }
    return resolve(realpathSync(current), ...missing);
  };
  const insideRoots = (path: string, access: "read" | "write") => {
    const resolved = canonicalTarget(path);
    return fsRoots(access).some((root) => resolved === root || resolved.startsWith(root + sep));
  };
  const replDeps: ReplHostDeps = {
    runId,
    signal,
    outputDir: self.deps.agentLoop?.repl?.outputDir,
    tabs: async () => [...new Set([...run.pageIds, ...openedTabs.keys()])].map(replTab),
    openTab: async (url) => {
      permittedWebUrl(url);
      const gate = self.deps.agentLoop?.repl?.openTab;
      if (gate) {
        const decision = await gate(url, { runId, threadId, turnId: runId });
        if ("park" in decision) return decision;
      }
      const target = await self.deps.pages.open({ url, background: true, ownedByRuntime: true });
      recordRunTabChange(self.deps.repo, runId, target, "tab.open");
      openedTabs.set(target.pageId, await self.claimPage(runId, target.pageId));
      return { output: replTab(target.pageId) };
    },
    closeTab: async (pageId) => {
      const release = openedTabs.get(pageId);
      if (!release) throw new AuxError("permission_denied", "closeTab only closes tabs this run opened.");
      const target = self.deps.pages.get(pageId);
      const closed = await self.deps.pages.close(pageId);
      recordRunTabChange(self.deps.repo, runId, target, "tab.close", closed.ok ? "ok" : "failed");
      if (!closed.ok) throw new AuxError("conflict", "The browser did not close this tab");
      openedTabs.delete(pageId);
      release();
    },
    bookmark: async (pageId) => {
      if (!run.pageIds.includes(pageId) && !openedTabs.has(pageId))
        throw new AuxError("permission_denied", "Bookmarking requires a tab claimed by this run.");
      const gate = self.deps.agentLoop?.repl?.bookmark;
      if (!gate) throw new AuxError("capability_unsupported", "Bookmarking is unavailable in this browser.");
      return gate(pageId, { runId, threadId, turnId: runId });
    },
    useTab: async (pageId) => {
      if (!run.pageIds.includes(pageId) && !openedTabs.has(pageId))
        throw new AuxError("permission_denied", "The REPL can only use tabs the run claims or opened.");
      return replTab(pageId);
    },
    observe: async (pageId, scope) =>
      deps.observe!({ pageId, scope: scope as import("@aux/contracts").ObservationScope | undefined }),
    findRef: async (pageId, name, role) => {
      if (!run.pageIds.includes(pageId) && !openedTabs.has(pageId))
        throw new AuxError("permission_denied", "Named control lookup requires a tab claimed by this run.");
      const wanted = name.trim().toLocaleLowerCase();
      if (!wanted) throw new AuxError("invalid_params", "A control name is required.");
      const observation = await observePage(pageId, {});
      recordObs(observation);
      const candidates = observation.content.elements.filter((element) =>
        !role || element.role?.toLocaleLowerCase() === role.toLocaleLowerCase());
      const label = (element: (typeof candidates)[number]) => (element.name ?? element.text ?? "").trim().toLocaleLowerCase();
      const exact = candidates.filter((element) => label(element) === wanted);
      const matches = exact.length ? exact : candidates.filter((element) => label(element).includes(wanted));
      if (matches.length !== 1)
        throw new AuxError("invalid_params", matches.length
          ? `Named control "${name}" is ambiguous (${matches.length} matches); use a specific name or ref.`
          : `No control named "${name}" is in the current observation.`);
      return { ref: matches[0]!.ref };
    },
    findRoute: async (pageId, targetId) => {
      if (!run.pageIds.includes(pageId) && !openedTabs.has(pageId))
        throw new AuxError("permission_denied", "Route matching requires a tab claimed by this run.");
      const obs = lastObs.get(pageId) ?? await observePage(pageId, {});
      const hrefs = [...obs.content.elements.flatMap((element) => element.href ? [element.href] : []),
        ...obs.content.links.map((link) => link.href)];
      const url = matchingRoute(obs.content.url, hrefs, targetId);
      if (!url) throw new AuxError("invalid_params", `No unique route for ${targetId} is supported by the observed links.`);
      return { url };
    },
    capture: async (pageId) => {
      const shot = await self.deps.pages.capture(pageId);
      const elements = (lastObs.get(pageId)?.content.elements ?? [])
        .filter((el) => el.rect)
        .map((el) => ({ ref: el.ref, name: el.name ?? el.text?.slice(0, 80), rect: el.rect }));
      return { ...shot, elements };
    },
    step: (pageId, step) => {
      if (step && typeof step === "object" && "op" in step && step.op === "click")
        beforeModalClickText = lastObs.get(pageId)?.content.text;
      return deps.act!({ pageId, steps: [step as import("@aux/contracts").Step] });
    },
    fetch: async (url) => {
      const fetchDep = self.deps.agentLoop?.webFetch;
      if (!fetchDep) throw new AuxError("capability_unsupported", "fetch is unavailable — no web egress backend for this run.");
      return fetchDep(url, { runId, threadId, turnId: runId });
    },
    fsRead: async (path) => {
      if (!insideRoots(path, "read")) throw new AuxError("permission_denied", "fs reads stay inside reviewed roots.");
      return readFileSync(path, "utf8");
    },
    fsWrite: async (path, content) => {
      if (!insideRoots(path, "write")) throw new AuxError("permission_denied", "fs writes stay inside reviewed writable roots.");
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    },
    submitResult: (input) => deps.submitResult!(input, {
      runId, threadId, turnId: runId, pageId: activePageId, deps,
      callCount: 1, goalTurn: 0, signal,
    }),
    spawnCell: (input) => {
      const spawn = self.deps.agentLoop?.subagents?.spawnCell;
      if (!spawn) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return spawn(input, { runId, threadId, turnId: runId });
    },
    waitCell: (cellId, timeoutMs) => {
      const wait = self.deps.agentLoop?.subagents?.waitCell;
      if (!wait) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return wait(cellId, timeoutMs);
    },
    sendCell: (cellId, text) => {
      const send = self.deps.agentLoop?.subagents?.sendCell;
      if (!send) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return send(cellId, text);
    },
    cancelCell: (cellId) => {
      const cancel = self.deps.agentLoop?.subagents?.cancelCell;
      if (!cancel) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return cancel(cellId);
    },
    webmcp: async (pageId, action) => {
      const gate = self.deps.agentLoop?.repl?.webmcp;
      if (!gate) throw new AuxError("capability_unsupported", "WebMCP is not exposed for this page.");
      const request = action && typeof action === "object" ? (action as { op?: string; name?: string; input?: unknown }) : {};
      const outcome = await gate(
        pageId,
        request.op === "call" ? { op: "call", name: String(request.name ?? ""), input: request.input } : { op: "tools" },
        { runId, threadId, turnId: runId },
      );
      if (outcome.status === "ask") {
        return {
          park: {
            kind: "approval",
            instruction: outcome.instruction,
            approvalId: outcome.approvalId,
          },
        };
      }
      if (outcome.status === "tools") return outcome.tools;
      return { result: outcome.result, success: outcome.success };
    },
  };
  deps.repl = ({ code, deadlineMs }) => replPool.eval(replDeps, code, { pageId: activePageId, deadlineMs });
  deps.canRecoverDialogValue = (label) => {
    const obs = activePageId ? lastObs.get(activePageId) : undefined;
    const aliases = [label.toLowerCase(), label.toLowerCase().replace(/\breference\b/g, "ref")];
    const newlyVisible = !!obs && aliases.some((alias) => alias && obs.content.text.toLowerCase().includes(alias)
      && !beforeModalClickText?.toLowerCase().includes(alias));
    return newlyVisible && !!obs && obs.content.elements.some((element) => element.occluded)
      && obs.content.elements.some((element) => !element.occluded && element.role === "button"
        && /^(close|dismiss)$/i.test(element.name?.trim() ?? ""));
  };

  // The planner sees the page inside its first call. Seed that same snapshot
  // so a read can finish in one submit_result instead of a snapshot round trip.
  if (activePageId && transcript.count(runId) === 1) {
    try {
      const seeded = recordObs(await observePage(activePageId, {}));
      transcript.append(runId, [{
        role: "user",
        content: [
          "Current page snapshot. This observation is already recorded — answer from it when it contains the answer, and do not call snapshot again unless the page changes.",
          `observationId: ${seeded.observationId}`,
          `revision: ${seeded.revision}`,
          seeded.text,
        ].join("\n"),
      }]);
    } catch {
      /* the page is not observable yet; the model can snapshot */
    }
  }

  self.setStatus(runId, "running", "Working…");
  const startedAt = Date.now();
  self.deps.repo.saveRun({ ...self.get(runId), startedAt });
  run.startedAt = startedAt;

  const modelId = () => run.config?.modelId ?? self.deps.defaultModel();
  let pageExposesWebmcp = false;
  if (activePageId && self.deps.agentLoop?.repl?.webmcp) {
    try {
      const listed = await self.deps.agentLoop.repl.webmcp(
        activePageId,
        { op: "tools" },
        { runId, threadId, turnId: runId },
      );
      pageExposesWebmcp = listed.status === "tools" && listed.tools.length > 0;
    } catch {
      pageExposesWebmcp = false;
    }
  }
  const makeOpts = (): AgentLoopOptions => ({
    model,
    modelId: modelId(),
    tools: (() => {
      const manifest = buildToolManifest();
      if (!deps.goalUpdate) delete manifest.goal_update;
      return manifest;
    })(),
    transcript,
    runId,
    threadId,
    pageId: () => activePageId,
    signal,
    deps,
    maxSteps: Math.max(1, maxModelCalls - modelCalls),
    steerCheck: steerPending,
    beforeModelCall: () => self.deps.checkBudget?.({ runId }),
    onStep: async ({ step }) => {
      for (const a of step.retries ?? []) {
        modelCalls++;
        self.deps.recordModelCall({
          runId, role: "agent", modelId: a.modelId ?? modelId(),
          durationMs: a.durationMs, inputTokens: a.inputTokens, outputTokens: a.outputTokens,
          ...(a.cachedInputTokens ? { cachedInputTokens: a.cachedInputTokens } : {}),
          ...(a.providerMetadata ? { providerMetadata: a.providerMetadata } : {}),
          ...(a.error ? { error: a.error } : {}),
        });
      }
      modelCalls++;
      self.deps.recordModelCall({
        runId, role: "agent", modelId: step.resolvedModelId ?? step.modelId ?? modelId(),
        durationMs: step.durationMs, inputTokens: step.inputTokens, outputTokens: step.outputTokens,
        ...(step.cachedInputTokens ? { cachedInputTokens: step.cachedInputTokens } : {}),
        ...(step.providerMetadata ? { providerMetadata: step.providerMetadata } : {}),
        ...(step.error ? { error: step.error } : {}),
      });
    },
    providerOptions: self.deps.agentLoop?.providerOptions,
    webmcp: pageExposesWebmcp,
  });

  try {
    let resumeAnswer: unknown;
    let hasResume = false;
    while (true) {
      await self.waitIfPaused(c, runId);
      if (signal.aborted) return;
      // A restart may find a durable parked tool call while the old host's
      // in-memory answer waiter is gone. Recreate its typed suspension and
      // wait for a fresh answer; never send the unanswered call back to the
      // model or execute it a second time.
      const openPark = !hasResume ? transcript.openPark(runId) : undefined;
      if (openPark) {
        const suspensionInfo = openPark.suspension ?? {
          kind: "ask-user-question" as const,
          instruction: "The agent was waiting for an answer when the runtime stopped. Please answer again to continue.",
        };
        const suspension = self.suspensions.pending(runId) ?? self.suspensions.park({
          runId, threadId, turnId: runId,
          kind: suspensionInfo.kind,
          request: {
            kind: suspensionInfo.kind,
            instruction: suspensionInfo.instruction,
            guidance: "Wait for the user to answer; do not dispatch or retry while parked.",
            ...(suspensionInfo.approvalId ? { approvalId: suspensionInfo.approvalId } : {}),
          },
        });
        self.setStatus(runId, "needs_input", suspension.request.instruction || suspensionInfo.instruction);
        const raw = await self.waitForAnswer(c, runId);
        if (signal.aborted || c.abort.signal.aborted) {
          self.suspensions.resolve(suspension.suspensionId, "cancelled");
          return;
        }
        self.suspensions.resolve(suspension.suspensionId, "answered");
        resumeAnswer = raw.trim() ? raw : { resolved: true };
        hasResume = true;
      }
      if (maxModelCalls > 0 && modelCalls >= maxModelCalls) {
        self.finish(runId, "failed", undefined, "model call budget exhausted");
        return;
      }
      const outcome: AgentLoopOutcome = hasResume
        ? await resumeAgentLoop(makeOpts(), resumeAnswer)
        : await runAgentLoop(makeOpts());
      hasResume = false;

      if (outcome.kind === "done") {
        // An uncertain dispatch in the durable ledger blocks completion —
        // give the model one chance to re-observe or re-dispatch, then stop.
        const unresolved = [...new Set([
          ...(self.unresolvedByRun.get(runId) ?? []),
          ...self.durable.unresolved(runId).map((intent) => intent.id),
        ])];
        if (unresolved.length) {
          if (!blockedOnLedger) {
            blockedOnLedger = true;
            transcript.append(runId, [{
              role: "user",
              content: `The write ledger still records an uncertain dispatch (${unresolved.join(", ")}). Take a fresh snapshot and use reconcile_action only if a new line proves the intended effect. Otherwise finish with a partial result; you cannot claim these actions completed.`,
            }]);
            continue;
          }
          const partial = outcome.result?.report ?? outcome.text;
          self.finish(runId, "partially_completed",
            { partial: { report: partial }, unconfirmedWrites: markUnconfirmedWrites(outcomes) },
            "an uncertain dispatch is recorded in the write ledger",
            "Couldn't confirm every action — stopped with what I found");
          return;
        }
        self.finish(runId, "completed", outcome.result ?? { report: outcome.text }, undefined, "Done");
        return;
      }
      if (outcome.kind === "parked") {
        // The gate may already have parked a typed suspension inside `act`;
        // only create one when the suspension tools parked directly.
        const suspension = self.suspensions.pending(runId)
          ?? self.suspensions.park({
            runId, threadId, turnId: runId,
            kind: outcome.park.kind,
            request: {
              kind: outcome.park.kind,
              instruction: outcome.park.instruction,
              guidance: "Wait for the user to answer; do not dispatch or retry while parked.",
              ...(outcome.park.approvalId ? { approvalId: outcome.park.approvalId } : {}),
            },
          });
        self.setStatus(runId, "needs_input", suspension.request.instruction || outcome.park.instruction);
        const raw = await self.waitForAnswer(c, runId);
        if (signal.aborted || c.abort.signal.aborted) {
          self.suspensions.resolve(suspension.suspensionId, "cancelled");
          return;
        }
        self.suspensions.resolve(suspension.suspensionId, "answered");
        resumeAnswer = raw.trim() ? raw : { resolved: true };
        hasResume = true;
        continue;
      }
      if (outcome.kind === "steered") {
        const latest = self.get(runId);
        applied = latest.config?.messageRevision ?? applied;
        const steers = self.deps.repo.listRunSteers(runId).map((message) => message.text);
        const fresh = steers.slice(steerCursor);
        steerCursor = steers.length;
        if (fresh.length) transcript.append(runId, [steerMessage(fresh)]);
        continue;
      }
      if (outcome.kind === "exhausted") {
        self.finish(runId, "failed", undefined, "agent loop exhausted its step budget", "Ran out of room — stopped before repeating work");
        return;
      }
      if (outcome.error.code === "cancelled" || signal.aborted) return;
      self.finish(runId, "failed", undefined, outcome.error.message, "The agent loop failed");
      return;
    }
  } catch (error) {
    if (error instanceof AuxError && error.code === "cancelled") return;
    if (signal.aborted) return;
    if (!TERMINAL_STATUSES.has(self.get(runId).status)) {
      self.finish(runId, "failed", undefined, error instanceof Error ? error.message : String(error));
    }
  } finally {
    if (c.deadlineHit && !TERMINAL_STATUSES.has(self.get(runId).status)) {
      self.finish(runId, "failed", undefined, `run deadline exceeded (${run.config?.deadlineMs}ms)`, "Ran out of time");
    }
    replPool.disposeAll();
    for (const release of [...openedTabs.values()].reverse()) release();
    self.controls.delete(runId);
  }
}
