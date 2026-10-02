import { AnswerDeltaEmitter } from "../answer-delta.js";
import { MentionUnavailable } from "../turn-mentions.js";
import { ObservationScopeSchema, AuxError, type Observation, type Run, type StepOutcome } from "@aux/contracts";
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve, sep } from "node:path";
import type { CoordinatorLoopHost } from "../coordinator-verify.js";
import { DEFAULT_MAX_MODEL_CALLS, TERMINAL_STATUSES, markUnconfirmedWrites, verifyResultCitations } from "../coordinator-verify.js";
import { attemptsOf, type ModelAttempt } from "../model-client.js";
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
  goalBudget?: {
    reserve(runId: string, request: { modelId: string; promptBytes: number; toolsBytes: number;
      maxOutputTokens: number }): Promise<string | undefined>;
    settle(runId: string, reservationId: string | undefined, attempts: ModelAttempt[]): void;
  };
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
    await self.finish(runId, "failed", undefined, failure.message, undefined, failure);
    return;
  }

  const transcript = new TranscriptStore(self.deps.repo.db);
  const answer = new AnswerDeltaEmitter(self.deps.events, runId);
  const threadId = run.config?.chatId ?? runId;
  const goalRun = !!self.deps.repo.db.prepare("SELECT 1 FROM goals WHERE run_id=?").get(runId);
  const initialTranscript = !transcript.count(runId);
  let skillTurn = self.deps.turnMentions.capture(runId);
  const mentionedSkills = self.deps.turnMentions.skills(runId);
  if (mentionedSkills.length) transcript.append(runId, [{ role: "user", content:
    "Current person-mentioned skills (turn lifetime only; no site, plugin or connector permission is implied):\n" +
    mentionedSkills.map(skill => JSON.stringify({ routineId: skill.routineId, revision: skill.revision, title: skill.title, objective: skill.objective, description: skill.description })).join("\n") }]);
  if (initialTranscript) transcript.append(runId, [taskMessage(run,
    run.config?.contextWorkspaceId ? self.deps.agentLoop?.workspaceContext?.(run.config.contextWorkspaceId) : "")]);

  let activePageId = run.pageIds[0];
  const lastObs = new Map<string, Observation>();
  const outcomes: StepOutcome[] = [];
  /** Verification v2 — rendered text of every observation the model saw, keyed by each citation handle it can use. */
  const obsTexts = new Map<string, string>();
  /** Citation handle → snapshot identity — resolves which page/revision a cited handle points at. */
  const obsMeta = new Map<string, { pageId: string; revision: number }>();
  const obsRecords = new Map<string, Observation>();
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
  let blockedOnRepl = false;

  c.dispatchAbort = new AbortController();
  let signal = AbortSignal.any([c.abort.signal, c.dispatchAbort.signal]);
  const steerPending = () =>
    c.paused || (self.deps.repo.getRun(runId)?.config?.messageRevision ?? 0) !== applied;

  /** The durable ledger, not a transient "dispatched" step label, decides uncertainty. */
  const noteUnresolved = () => {
    self.unresolvedByRun.set(runId, self.durable.unresolved(runId).map((intent) => intent.id));
  };
  const modalVisible = (obs: Observation) => obs.content.elements.some((element) => element.occluded)
    && obs.content.elements.some((element) => !element.occluded && element.role === "button"
      && /^(close|dismiss|cancel|done)$/i.test((element.name ?? "").trim()));

  /** Never substitute a different tab when an explicitly targeted attachment is unavailable. */
  const observePage = (pageId: string, req: { scope?: import("@aux/contracts").ObservationScope; subtreeRef?: string }): Promise<Observation> =>
    self.usePage(runId, pageId, "read", () => self.deps.pages.observe(pageId, req));

  /** Snapshot bookkeeping — every rendered observation gets a durable, citable handle. */
  const recordObs = (obs: Observation) => {
    lastObs.set(obs.pageId, obs);
    const artifactId = self.deps.saveObservation?.(runId, obs);
    const observationId = artifactId ?? `rev:${obs.revision}`;
    // The same redacted render the planner shows — secrets never reach the model,
    // and citation verification checks the text the model actually saw.
    const safeObs = redactObservation(obs);
    const text = renderObservation(safeObs);
    obsTexts.set(observationId, text);
    obsTexts.set(`${obs.pageId}@${obs.revision}`, text);
    obsTexts.set(obs.pageId, text);
    obsMeta.set(observationId, { pageId: obs.pageId, revision: obs.revision });
    obsMeta.set(`${obs.pageId}@${obs.revision}`, { pageId: obs.pageId, revision: obs.revision });
    obsRecords.set(observationId, safeObs);
    obsRecords.set(`${obs.pageId}@${obs.revision}`, safeObs);
    obsAt.set(observationId, Date.now());
    obsAt.set(`${obs.pageId}@${obs.revision}`, Date.now());
    const visibleLines = new Set(safeObs.content.text.split("\n").map((line) => line.trim()));
    return {
      text, observationId, revision: obs.revision,
      bodyText: safeObs.content.text,
      headings: safeObs.content.headings.filter((heading) => visibleLines.has(heading.trim())),
    };
  };

  const deps: LoopToolDeps = {
    observe: async ({ pageId, scope, subtreeRef }) => {
      const obs = await observePage(pageId, { scope, subtreeRef });
      return recordObs(obs);
    },
    act: async ({ pageId, steps }): Promise<LoopToolResult> => {
      await self.assertPage(runId, pageId, "act");
      const obs = lastObs.get(pageId) ?? (lastObs.set(pageId, await observePage(pageId, {})), lastObs.get(pageId)!);
      const safeObs = redactObservation(obs);
      // Selecting an unchecked native radio/checkbox is a state-setting
      // operation. Route a click through check so the driver can prove the
      // checked transition instead of leaving an opaque click uncertain.
      steps = steps.map((step) => step.op === "click" && safeObs.content.elements.some((element) =>
        element.ref === step.target && (element.role === "radio" || element.role === "checkbox")
        && element.checked === false)
        ? { ...step, op: "check" } : step);
      // Typing into an observed rich-text field focuses it itself. A preceding
      // click has no reliable write receipt and can strand the whole batch as
      // uncertain even when the text change is observed. Reject before either
      // action is dispatched so the model can issue the single type action.
      const firstStep = steps[0];
      const secondStep = steps[1];
      const focusClick = steps.length === 2 && firstStep?.op === "click" && secondStep?.op === "type"
        && firstStep.target === secondStep.target
        && safeObs.content.elements.some((element) => element.ref === firstStep.target && element.tag === "div")
        && safeObs.content.formFields.some((field) => field.ref === firstStep.target);
      if (focusClick) return { output: { rejected: "This rich-text field can be typed directly. Issue one type action on the same target; no action was dispatched." } };
      const dispatchStartedAt = Date.now();
      const actionLabels = steps.filter((step) => classifyStep(step.op) !== "read").flatMap((step) => {
        const target = "target" in step ? step.target : undefined;
        if (typeof target !== "string") return [];
        const name = safeObs.content.elements.find((element) => element.ref === target)?.name
          ?? safeObs.content.formFields.find((field) => field.ref === target)?.label;
        const redacted = name ? String(redactForModel(name)) : "";
        return redacted && !redacted.startsWith("{handle:") ? [redacted.slice(0, 80)] : [];
      });
      const click = steps.length === 1 && steps[0]?.op === "click" ? steps[0] : undefined;
      const clickedLink = click && "target" in click
        ? safeObs.content.elements.find((element) => element.ref === click.target && element.href)
        : undefined;
      let expectedNavigationUrlHash: string | undefined;
      if (clickedLink?.href) {
        try { expectedNavigationUrlHash = observationLineHash(new URL(clickedLink.href, safeObs.content.url).href); }
        catch { /* An invalid href cannot provide reconciliation proof. */ }
      }
      const gate = await guardedExecute(
        { pages: self.deps.pages, durable: self.durable, grants: subagentGrants(run.config?.subagentProfile, self.deps.grants) },
        {
          runId, pageId, steps,
          observation: obs.content, url: obs.content.url,
          beforeText: renderObservation(safeObs), actionLabels,
          expectedNavigationUrlHash,
          modalWasOpen: modalVisible(safeObs),
          beforeHeadingHashes: safeObs.content.headings.map(observationLineHash),
          documentEpoch: obs.documentEpoch, revision: obs.revision,
          taskId: run.config?.taskId, taskRevision: run.config?.taskRevision,
          isCurrent: () => !steerPending() && !signal.aborted,
          exec: {
            runId, taskId: run.config?.taskId, signal, sourcePageCheck: self.pageSourceCheck(runId, pageId),
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
      // A single Edit record click can open an inline form without a URL or
      // dialog transition. The post-action observation is trusted evidence:
      // settle only this exact target when the same page newly renders both
      // the form heading and its Save/Cancel controls.
      const editClick = steps.length === 1 && steps[0]?.op === "click" && steps[0].target;
      const clickedEdit = editClick && safeObs.content.elements.some((element) =>
        element.ref === editClick && element.name?.trim() === "Edit record");
      const afterObs = gate.result.observation && redactObservation(gate.result.observation);
      const beforeLines = new Set(safeObs.content.text.split("\n").map((line) => line.trim()));
      const afterLines = afterObs?.content.text.split("\n").map((line) => line.trim()) ?? [];
      const openIntents = self.durable.unresolved(runId);
      const pendingEdit = clickedEdit && afterObs && post && gate.result.status === "completed"
        && afterObs.pageId === obs.pageId && afterObs.documentEpoch === obs.documentEpoch
        && afterObs.revision > obs.revision && afterObs.observedAt >= dispatchStartedAt
        && !modalVisible(afterObs) && !beforeLines.has("Edit record") && !beforeLines.has("Save record Cancel")
        && afterLines.includes("Edit record") && afterLines.includes("Save record Cancel")
        && openIntents.length === 1
        ? openIntents.filter((intent) => intent.pageId === pageId
          && intent.documentEpoch === obs.documentEpoch && intent.createdAt >= dispatchStartedAt
          && intent.summary?.ops.length === 1 && intent.summary.ops[0] === "click"
          && intent.summary.actionLabels?.length === 1 && intent.summary.actionLabels[0] === "Edit record")
        : [];
      if (pendingEdit.length === 1) {
        self.durable.reconcile(pendingEdit[0]!.id, "applied", JSON.stringify({
          observationId: post!.observationId, quote: "Save record Cancel", effect: "Opened inline edit form",
        }));
        const outcome = gate.result.steps[0];
        if (outcome?.receipt) outcome.receipt = { ...outcome.receipt, uncertain: false,
          unconfirmed: false, dispatchedBeforeTakeover: false, observed: "Save record Cancel" };
        if (outcome?.effect === "uncertain" || outcome?.effect === "dispatched") outcome.effect = "observed";
      }
      // A newly created record has stronger proof than the Create button's
      // click receipt: the same page navigates from the filled form to a new
      // record URL, and its visible identity and fields match the preform.
      const createClick = steps.length === 1 && steps[0]?.op === "click" ? steps[0] : undefined;
      const clickedCreate = createClick && safeObs.content.elements.some((element) =>
        element.ref === createClick.target && element.name?.trim() === "Create record");
      const fieldValue = (label: string) => safeObs.content.formFields.find((field) =>
        field.label?.trim() === label)?.value?.trim();
      const title = fieldValue("Title");
      const owner = fieldValue("Owner");
      const status = fieldValue("Status");
      let createdId: string | undefined;
      try {
        if (afterObs && new URL(safeObs.content.url).pathname === "/new") {
          const beforeUrl = new URL(safeObs.content.url);
          const afterUrl = new URL(afterObs.content.url);
          createdId = beforeUrl.origin === afterUrl.origin
            ? /^\/records\/(rec-[A-Za-z0-9_-]+)$/.exec(afterUrl.pathname)?.[1] : undefined;
        }
      } catch { /* Unparseable URLs provide no creation proof. */ }
      const pendingCreate = clickedCreate && createdId && title && owner && status && afterObs && post
        && gate.result.status === "completed" && openIntents.length === 1
        && afterObs.pageId === obs.pageId && afterObs.documentEpoch > obs.documentEpoch
        && afterObs.revision > obs.revision && afterObs.observedAt >= dispatchStartedAt
        && !safeObs.content.text.includes(createdId)
        && afterLines.includes(title) && afterLines.includes(`Owner: ${owner}`)
        && afterLines.includes(`Status: ${status}`)
        && afterLines.some((line) => line.startsWith(`id=${createdId} · updated `))
        ? openIntents.filter((intent) => intent.pageId === pageId
          && intent.documentEpoch === obs.documentEpoch && intent.createdAt >= dispatchStartedAt
          && intent.summary?.ops.length === 1 && intent.summary.ops[0] === "click"
          && intent.summary.actionLabels?.length === 1 && intent.summary.actionLabels[0] === "Create record")
        : [];
      if (pendingCreate.length === 1) {
        self.durable.reconcile(pendingCreate[0]!.id, "applied", JSON.stringify({
          observationId: post!.observationId, quote: `id=${createdId}`, effect: "Created matching record",
        }));
        const outcome = gate.result.steps[0];
        if (outcome?.receipt) outcome.receipt = { ...outcome.receipt, uncertain: false,
          unconfirmed: false, dispatchedBeforeTakeover: false, observed: `id=${createdId}` };
        if (outcome?.effect === "uncertain" || outcome?.effect === "dispatched") outcome.effect = "observed";
      }
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
          ...(self.durable.unresolved(runId).length
            ? { uncertainIntentIds: self.durable.unresolved(runId).map((intent) => intent.id) } : {}),
          ...(post ? { observation: post.text, observationId: post.observationId, revision: post.revision } : {}),
        },
      };
    },
    submitResult: async ({ report, citations, textProposal }) => {
      const currentObs = activePageId ? lastObs.get(activePageId) : undefined;
      if (/\bexact (?:\w+\s+)?title\b/i.test(run.goal) && !/\b(?:browser|tab) title\b/i.test(run.goal)
        && currentObs && report.trim() === currentObs.content.title.trim()) {
        const lines = new Set(currentObs.content.text.split("\n").map((line) => line.trim()));
        const pageHeading = currentObs.content.headings.find((heading) => lines.has(heading.trim())
          && [" — ", " | ", " - ", " · "].some((separator) => report.startsWith(`${heading}${separator}`)));
        if (pageHeading)
          return { ok: false as const, error: `The browser title includes surrounding site text. The visible page heading is "${redactForModel(pageHeading)}"; inspect and cite that heading for an exact title.` };
      }
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
      if (textProposal !== undefined) result.textProposal = textProposal;
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
      const navigationHash = intent.summary?.expectedNavigationUrlHash;
      if (intent.summary.ops[0] === "click" && navigationHash && quote.startsWith("url: ")) {
        if (text.split("\n").find((line) => line.startsWith("url: "))?.trim() !== quote)
          return { ok: false as const, error: "Cite the observed page URL, not page content mentioning a URL." };
        const url = quote.slice(5).trim();
        let actualHash: string;
        try { actualHash = observationLineHash(new URL(url).href); }
        catch { return { ok: false as const, error: "The cited URL is invalid." }; }
        if (actualHash !== navigationHash)
          return { ok: false as const, error: "The new URL does not match the clicked link's recorded destination." };
        if (!effect.trim()) return { ok: false as const, error: "Describe the observed navigation effect." };
        self.durable.reconcile(intent.id, "applied", JSON.stringify({ observationId: key, quote: redactForModel(quote), effect: redactForModel(effect.trim()) }));
        for (const outcome of outcomes) {
          const dispatch = writeDispatches.get(outcome.stepId);
          if (dispatch?.pageId !== intent.pageId) continue;
          if (outcome.receipt) outcome.receipt = { ...outcome.receipt, uncertain: false, unconfirmed: false, dispatchedBeforeTakeover: false, observed: quote };
          if (outcome.effect === "uncertain" || outcome.effect === "dispatched") outcome.effect = "observed";
        }
        noteUnresolved();
        return { ok: true as const, intentId: intent.id, status: "confirmed" as const };
      }
      const citedObs = obsRecords.get(key);
      const labelWords = labels.map((label) => label.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)?.[0]).filter(Boolean) as string[];
      const newModalHeading = citedObs?.content.headings.find((heading) =>
        // Some observers index hidden dialog headings before the dialog opens.
        // The rendered text, not the heading index, must show the heading only
        // after this click; pair it with the fresh modal and quoted content.
        !intent.summary?.beforeLineHashes.includes(observationLineHash(heading))
        && citedObs.content.text.split("\n").some((line) => line.trim() === heading.trim())
        && labelWords.some((word) => heading.toLocaleLowerCase().includes(word)));
      if (intent.summary.ops[0] === "click" && intent.summary.modalWasOpen === false
        && citedObs && modalVisible(citedObs) && newModalHeading
        && citedObs.content.text.split("\n").some((line) => line.trim() === quote)) {
        self.durable.reconcile(intent.id, "applied", JSON.stringify({
          observationId: key, quote: redactForModel(quote), effect: redactForModel(`Opened dialog: ${newModalHeading}`),
        }));
        for (const outcome of outcomes) {
          const dispatch = writeDispatches.get(outcome.stepId);
          if (dispatch?.pageId !== intent.pageId) continue;
          if (outcome.receipt) outcome.receipt = { ...outcome.receipt, uncertain: false, unconfirmed: false, dispatchedBeforeTakeover: false, observed: quote };
          if (outcome.effect === "uncertain" || outcome.effect === "dispatched") outcome.effect = "observed";
        }
        noteUnresolved();
        return { ok: true as const, intentId: intent.id, status: "confirmed" as const };
      }
      // Inline edit forms have no dialog role or navigation. Require the
      // clicked Edit control's label to become a newly rendered heading and
      // newly rendered Save/Cancel controls; hidden indexed headings alone
      // are insufficient evidence that the form opened.
      const inlineEditOpened = intent.summary.ops[0] === "click"
        && labels.some((label) => /^edit\b/i.test(label.trim()))
        && citedObs && !modalVisible(citedObs)
        && labels.some((label) => citedObs.content.text.split("\n").some((line) =>
          line.trim().toLowerCase() === label.trim().toLowerCase()
          && !intent.summary?.beforeLineHashes.includes(observationLineHash(line))))
        && citedObs.content.text.split("\n").some((line) =>
          /\bsave\b.*\bcancel\b/i.test(line)
          && !intent.summary?.beforeLineHashes.includes(observationLineHash(line)));
      if (inlineEditOpened && /\bsave\b.*\bcancel\b/i.test(quote)) {
        self.durable.reconcile(intent.id, "applied", JSON.stringify({
          observationId: key, quote: redactForModel(quote), effect: "Opened inline edit form",
        }));
        for (const outcome of outcomes) {
          const dispatch = writeDispatches.get(outcome.stepId);
          if (dispatch?.pageId !== intent.pageId) continue;
          if (outcome.receipt) outcome.receipt = { ...outcome.receipt, uncertain: false, unconfirmed: false, dispatchedBeforeTakeover: false, observed: quote };
          if (outcome.effect === "uncertain" || outcome.effect === "dispatched") outcome.effect = "observed";
        }
        noteUnresolved();
        return { ok: true as const, intentId: intent.id, status: "confirmed" as const };
      }
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
    // Child model calls have their own ledger; keep Goal funding on this one run.
    subagents: goalRun ? undefined : self.deps.agentLoop?.subagents,
    routineUpdate: self.deps.agentLoop?.routineUpdate,
    notify: self.deps.agentLoop?.notify,
    goalUpdate: goalRun ? self.deps.agentLoop?.goalUpdate : undefined,
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
    tabs: async () => run.config?.mentions?.length
      ? self.deps.turnMentions.list(runId, self.deps.pages.list({}))
      : [...new Set([...self.get(runId).pageIds, ...self.ownedPages(runId)])].map(replTab),
    openTab: async (url) => {
      const destination = permittedWebUrl(url).href;
      const gate = self.deps.agentLoop?.repl?.openTab;
      if (gate) {
        const decision = await gate(destination, { runId, threadId, turnId: runId });
        if ("park" in decision) return decision;
      }
      let claimedPageId: string | undefined;
      try {
        const target = await self.deps.pages.open({ url: destination, background: true, ownedByRuntime: true,
          agentScope: await self.deps.browserEgress?.creationScope(runId),
          beforeNavigate: async target => {
            openedTabs.set(target.pageId, await self.claimPage(runId, target.pageId, destination));
            claimedPageId = target.pageId;
          },
        });
        self.ownPage(runId, target.pageId);
        recordRunTabChange(self.deps.repo, runId, target, "tab.open");
        return { output: replTab(target.pageId) };
      } catch (error) {
        if (claimedPageId) { openedTabs.get(claimedPageId)?.(); openedTabs.delete(claimedPageId); }
        throw error;
      }
    },
    closeTab: async (pageId) => {
      const release = openedTabs.get(pageId);
      if (!release) throw new AuxError("permission_denied", "closeTab only closes tabs this run opened.");
      await self.assertPage(runId, pageId, "act");
      const target = self.deps.pages.get(pageId);
      const closed = await self.deps.pages.close(pageId);
      recordRunTabChange(self.deps.repo, runId, target, "tab.close", closed.ok ? "ok" : "failed");
      if (!closed.ok) throw new AuxError("conflict", "The browser did not close this tab");
      openedTabs.delete(pageId);
      release();
    },
    bookmark: async (pageId) => {
      await self.assertPage(runId, pageId, "act");
      const gate = self.deps.agentLoop?.repl?.bookmark;
      if (!gate) throw new AuxError("capability_unsupported", "Bookmarking is unavailable in this browser.");
      return gate(pageId, { runId, threadId, turnId: runId });
    },
    useTab: async (pageId) => {
      await self.assertPage(runId, pageId, "read");
      return replTab(pageId);
    },
    observe: async (pageId, scope) => {
      let observed: Observation;
      try { observed = await self.usePage(runId, pageId, "read", () => self.deps.pages.observe(pageId, {
        scope: scope === undefined ? undefined : ObservationScopeSchema.parse(scope),
      })); }
      catch (error) { if (error instanceof MentionUnavailable) return error.unavailable; throw error; }
      return recordObs(observed);
    },
    findRef: async (pageId, name, role) => {
      await self.assertPage(runId, pageId, "read");
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
      const target = matches[0]!;
      // Expose an observed route for the explicit followLinkByName operation.
      // clickByName still dispatches a click because href alone does not reveal
      // target=_blank, download, or handler semantics.
      if (target.role === "link" && target.href) {
        try {
          const base = new URL(observation.content.url);
          const url = new URL(target.href, base);
          if ((url.protocol === "http:" || url.protocol === "https:") && url.origin === base.origin)
            return { ref: target.ref, navigationUrl: url.href };
        } catch { /* An invalid href remains a governed click. */ }
      }
      return { ref: target.ref };
    },
    findRoute: async (pageId, targetId) => {
      await self.assertPage(runId, pageId, "read");
      const obs = lastObs.get(pageId) ?? await observePage(pageId, {});
      const hrefs = [...obs.content.elements.flatMap((element) => element.href ? [element.href] : []),
        ...obs.content.links.map((link) => link.href)];
      const url = matchingRoute(obs.content.url, hrefs, targetId);
      if (!url) throw new AuxError("invalid_params", `No unique route for ${targetId} is supported by the observed links.`);
      return { url };
    },
    capture: async (pageId) => {
      const shot = await self.usePage(runId, pageId, "read", () => self.deps.pages.capture(pageId));
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
      const spawn = goalRun ? undefined : self.deps.agentLoop?.subagents?.spawnCell;
      if (!spawn) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return spawn(input, { runId, threadId, turnId: runId });
    },
    waitCell: (cellId, timeoutMs) => {
      const wait = goalRun ? undefined : self.deps.agentLoop?.subagents?.waitCell;
      if (!wait) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return wait(cellId, timeoutMs);
    },
    sendCell: (cellId, text) => {
      const send = goalRun ? undefined : self.deps.agentLoop?.subagents?.sendCell;
      if (!send) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return send(cellId, text);
    },
    cancelCell: (cellId) => {
      const cancel = goalRun ? undefined : self.deps.agentLoop?.subagents?.cancelCell;
      if (!cancel) throw new AuxError("capability_unsupported", "Subagent cells are unavailable for this run.");
      return cancel(cellId);
    },
    webmcp: async (pageId, action) => {
      const gate = self.deps.agentLoop?.repl?.webmcp;
      if (!gate) throw new AuxError("capability_unsupported", "WebMCP is not exposed for this page.");
      const request = action && typeof action === "object" ? (action as { op?: string; name?: string; input?: unknown }) : {};
      await self.assertPage(runId, pageId, request.op === "call" ? "act" : "read");
      const outcome = await gate(
        pageId,
        request.op === "call" ? { op: "call", name: String(request.name ?? ""), input: request.input } : { op: "tools" },
        { runId, threadId, turnId: runId },
      );
      await self.assertPage(runId, pageId, request.op === "call" ? "act" : "read");
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
  deps.repl = ({ code, deadlineMs, yieldTimeMs }) => replPool.eval(replDeps, code, { pageId: activePageId, deadlineMs, yieldTimeMs });
  deps.replProgress = async () => {
    if (!activePageId) return undefined;
    const observed = recordObs(await observePage(activePageId, {}));
    return { pageId: activePageId, ...observed };
  };
  deps.replWait = ({ cellId, yieldTimeMs, terminate }) => replPool.wait(runId, cellId, yieldTimeMs, terminate);
  deps.canRecoverDialogValue = (label) => {
    const obs = activePageId ? lastObs.get(activePageId) : undefined;
    const aliases = [label.toLowerCase(), label.toLowerCase().replace(/\breference\b/g, "ref")];
    const newlyVisible = !!obs && aliases.some((alias) => alias && obs.content.text.toLowerCase().includes(alias)
      && !beforeModalClickText?.toLowerCase().includes(alias));
    return newlyVisible && !!obs && obs.content.elements.some((element) => element.occluded)
      && obs.content.elements.some((element) => !element.occluded && element.role === "button"
        && /^(close|dismiss)$/i.test(element.name?.trim() ?? ""));
  };
  deps.dialogAnswerLabel = () => /\b(?:report|return|give|tell me)\s+(?:the\s+)?(.{2,80}?)\s+(?:shown|displayed)\s+(?:inside|in)\s+(?:the|a)\s+dialog\b/i
    .exec(run.goal)?.[1]?.trim();

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

  await self.setStatus(runId, "running", "Working…");
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
  const makeOpts = (): AgentLoopOptions => {
      const currentSkillTurn = self.deps.turnMentions.capture(runId);
      const currentSkills = self.deps.turnMentions.skills(runId);
      if (currentSkillTurn !== skillTurn) {
        transcript.append(runId, [{ role: "user", content:
          "Current person-mentioned skills for this turn supersede all previous mention selections. No site, plugin or connector permission is implied:\n" +
          JSON.stringify(currentSkills.map(skill => ({ routineId: skill.routineId, revision: skill.revision, title: skill.title, objective: skill.objective, description: skill.description }))) }]);
        skillTurn = currentSkillTurn;
      }
    return ({
    model,
    onText: text => { if (!signal.aborted) answer.push(text); },
    modelId: modelId(),
    tools: (() => {
      const manifest = buildToolManifest();
      if (!deps.goalUpdate) delete manifest.goal_update;
      if (goalRun) for (const name of ["subagent", "subagent_wait", "subagent_send", "subagent_stop"])
        delete manifest[name];
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
    beforeModelCall: async request => {
      self.deps.turnMentions.skills(runId);
      await self.deps.checkBudget?.({ runId });
      if (goalRun && !self.deps.agentLoop?.goalBudget)
        throw new AuxError("capability_unsupported", "Goal funding is unavailable; no model call was sent.");
      return goalRun ? self.deps.agentLoop!.goalBudget!.reserve(runId, request) : undefined;
    },
    maxAttempts: goalRun ? 1 : undefined,
    onStep: async ({ step, reservationId }) => {
      for (const a of step.retries ?? []) {
        modelCalls++;
        await self.deps.recordModelCall({
          runId, role: "agent", modelId: a.modelId ?? modelId(),
          durationMs: a.durationMs, inputTokens: a.inputTokens, outputTokens: a.outputTokens,
          ...(a.cachedInputTokens ? { cachedInputTokens: a.cachedInputTokens } : {}),
          ...(a.providerMetadata ? { providerMetadata: a.providerMetadata } : {}),
          ...(a.error ? { error: a.error } : {}),
        });
      }
      modelCalls++;
      await self.deps.recordModelCall({
        runId, role: "agent", modelId: step.resolvedModelId ?? step.modelId ?? modelId(),
        durationMs: step.durationMs, inputTokens: step.inputTokens, outputTokens: step.outputTokens,
        ...(step.cachedInputTokens ? { cachedInputTokens: step.cachedInputTokens } : {}),
        ...(step.providerMetadata ? { providerMetadata: step.providerMetadata } : {}),
        ...(step.error ? { error: step.error } : {}),
      });
      if (goalRun) self.deps.agentLoop?.goalBudget?.settle(runId, reservationId,
        [...(step.retries ?? []), step].map(attempt => ({ ...attempt,
          modelId: attempt.modelId ?? step.resolvedModelId ?? modelId() })));
    },
    onModelFailure: async ({ error, reservationId }) => {
      // Known provider attempts include the final failed request.
      const attempts = attemptsOf(error);
      for (const attempt of attempts) {
        modelCalls++;
        await self.deps.recordModelCall({
          runId, role: "agent", modelId: attempt.modelId ?? modelId(),
          durationMs: attempt.durationMs, inputTokens: attempt.inputTokens, outputTokens: attempt.outputTokens,
          ...(attempt.cachedInputTokens ? { cachedInputTokens: attempt.cachedInputTokens } : {}),
          ...(attempt.providerMetadata ? { providerMetadata: attempt.providerMetadata } : {}),
          error: attempt.error ?? "model attempt failed before a usable response",
        });
      }
      if (!attempts.length) {
        modelCalls++;
        await self.deps.recordModelCall({ runId, role: "agent", modelId: modelId(), durationMs: 0,
          error: error instanceof Error ? error.message : String(error) });
      }
      if (goalRun) self.deps.agentLoop?.goalBudget?.settle(runId, reservationId,
        attempts.map(attempt => ({ ...attempt, modelId: attempt.modelId ?? modelId() })));
    },
    providerOptions: self.deps.agentLoop?.providerOptions,
    webmcp: pageExposesWebmcp,
    });
  };

  try {
    let resumeAnswer: unknown;
    let hasResume = false;
    let freshHandoff = false;
    while (true) {
      await self.waitIfPaused(c, runId);
      if (c.abort.signal.aborted) return;
      if (signal.aborted) {
        // The owner returned a held page. The old tool/model turn is fenced;
        // the next turn must inspect live state before choosing another act.
        c.dispatchAbort = new AbortController();
        signal = AbortSignal.any([c.abort.signal, c.dispatchAbort.signal]);
        const takeover = c.takeoverInterrupted === true;
        c.takeoverInterrupted = false;
        lastObs.clear();
        hasResume = false;
        if (takeover) {
          if (!activePageId) {
            await self.finish(runId, "interrupted", undefined, "The returned page is unavailable for a fresh observation.");
            return;
          }
          let fresh: ReturnType<typeof recordObs>;
          try { fresh = recordObs(await observePage(activePageId, {})); }
          catch {
            await self.finish(runId, "interrupted", undefined, "The returned page could not be observed safely.");
            return;
          }
          transcript.append(runId, [{ role: "user", content:
            `A person took control of the page and has returned it. This is a fresh page snapshot after takeover:\n${fresh.text}\nInspect the durable write ledger; do not retry an uncertain effect.` }]);
        }
        else {
          const latest = self.get(runId);
          await self.deps.turnMentions.begin(runId, latest.config?.mentions ?? [], self.ownedPages(runId), {
            workspaceId: latest.config?.contextWorkspaceId, taskId: latest.config?.taskId, taskRevision: latest.config?.taskRevision,
          });
          const selected = await self.refreshPageSelection(runId);
          activePageId = selected.includes(activePageId ?? "") ? activePageId : selected[0];
          lastObs.clear();
          applied = latest.config?.messageRevision ?? applied;
          const steers = self.deps.repo.listRunSteers(runId).map(message => message.text);
          const fresh = steers.slice(steerCursor);
          steerCursor = steers.length;
          if (fresh.length) transcript.append(runId, [steerMessage(fresh)]);
        }
      }
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
        await self.setStatus(runId, "needs_input", suspension.request.instruction || suspensionInfo.instruction);
        const raw = await self.waitForAnswer(c, runId);
        if (signal.aborted || c.abort.signal.aborted) {
          self.suspensions.resolve(suspension.suspensionId, "cancelled");
          return;
        }
        self.suspensions.resolve(suspension.suspensionId, "answered");
        freshHandoff = suspension.kind === "handoff";
        resumeAnswer = raw.trim() ? raw : { resolved: true };
        hasResume = true;
      }
      if (maxModelCalls > 0 && modelCalls >= maxModelCalls) {
        await self.finish(runId, "failed", undefined, "model call budget exhausted");
        return;
      }
      if (freshHandoff) {
        freshHandoff = false;
        if (!activePageId) {
          await self.finish(runId, "interrupted", undefined, "The handed-off page is unavailable for a fresh observation.");
          return;
        }
        let fresh: ReturnType<typeof recordObs>;
        try { fresh = recordObs(await observePage(activePageId, {})); }
        catch {
          await self.finish(runId, "interrupted", undefined, "The handed-off page could not be observed safely.");
          return;
        }
        transcript.append(runId, [{ role: "user", content:
          `The person finished the handoff in the page. This is a fresh page snapshot:\n${fresh.text}\nDo not retry the action they just completed.` }]);
      }
      let outcome: AgentLoopOutcome;
      try {
        outcome = hasResume
          ? await resumeAgentLoop(makeOpts(), resumeAnswer)
          : await runAgentLoop(makeOpts());
      } catch (error) {
        if (signal.aborted && !c.abort.signal.aborted) continue;
        throw error;
      } finally { answer.flush(); }
      hasResume = false;

      if ((c.paused || signal.aborted) && !c.abort.signal.aborted) continue;

      if (outcome.kind === "done") {
        if (goalRun && !outcome.result) {
          await self.finish(runId, "failed", undefined, "Goal completion requires a verified submit_result call.",
            "The Goal stopped without a verified result");
          return;
        }
        if (replPool.hasOpen(runId)) {
          if (!blockedOnRepl) {
            blockedOnRepl = true;
            transcript.append(runId, [{ role: "user", content: "A REPL script is still open. Call repl_wait with its cell ID to receive its actual result, or terminate it. Do not claim this run completed while the cell is open." }]);
            continue;
          }
          await self.finish(runId, "failed", undefined, "REPL cell still open; its result was not joined", "A script was still running");
          return;
        }
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
          await self.finish(runId, "partially_completed",
            { partial: { report: partial }, unconfirmedWrites: markUnconfirmedWrites(outcomes) },
            "an uncertain dispatch is recorded in the write ledger",
            "Couldn't confirm every action — stopped with what I found");
          return;
        }
        if (goalRun) self.deps.repo.saveCheckpoint(`run:${runId}`, "goal_verified", { accepted: true });
        await self.finish(runId, "completed", outcome.result ?? { report: outcome.text }, undefined, "Done");
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
        await self.setStatus(runId, "needs_input", suspension.request.instruction || outcome.park.instruction);
        const raw = await self.waitForAnswer(c, runId);
        if (signal.aborted || c.abort.signal.aborted) {
          self.suspensions.resolve(suspension.suspensionId, "cancelled");
          return;
        }
        self.suspensions.resolve(suspension.suspensionId, "answered");
        freshHandoff = suspension.kind === "handoff";
        resumeAnswer = raw.trim() ? raw : { resolved: true };
        hasResume = true;
        continue;
      }
      if (outcome.kind === "steered") {
        const latest = self.get(runId);
        await self.deps.turnMentions.begin(runId, latest.config?.mentions ?? [], self.ownedPages(runId), {
          workspaceId: latest.config?.contextWorkspaceId, taskId: latest.config?.taskId, taskRevision: latest.config?.taskRevision,
        });
        const selected = await self.refreshPageSelection(runId);
        activePageId = selected.includes(activePageId ?? "") ? activePageId : selected[0];
        lastObs.clear();
        applied = latest.config?.messageRevision ?? applied;
        const steers = self.deps.repo.listRunSteers(runId).map((message) => message.text);
        const fresh = steers.slice(steerCursor);
        steerCursor = steers.length;
        if (fresh.length) transcript.append(runId, [steerMessage(fresh)]);
        continue;
      }
      if (outcome.kind === "exhausted") {
        await self.finish(runId, "failed", undefined, "agent loop exhausted its step budget", "Ran out of room — stopped before repeating work");
        return;
      }
      if (outcome.error.code === "cancelled" || signal.aborted) return;
      await self.finish(runId, "failed", undefined, outcome.error.message, "The agent loop failed");
      return;
    }
  } catch (error) {
    if (error instanceof AuxError && error.code === "cancelled") return;
    if (signal.aborted) return;
    if (!TERMINAL_STATUSES.has(self.get(runId).status)) {
      await self.finish(runId, "failed", undefined, error instanceof Error ? error.message : String(error));
    }
  } finally {
    if (c.deadlineHit && !TERMINAL_STATUSES.has(self.get(runId).status)) {
      await self.finish(runId, "failed", undefined, `run deadline exceeded (${run.config?.deadlineMs}ms)`, "Ran out of time");
    }
    replPool.disposeAll();
    for (const release of [...openedTabs.values()].reverse()) release();
    self.controls.delete(runId);
  }
}
