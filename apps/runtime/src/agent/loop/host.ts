import { AuxError, type Observation, type Run, type StepOutcome } from "@aux/contracts";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import type { CoordinatorLoopHost } from "../coordinator-verify.js";
import { DEFAULT_MAX_MODEL_CALLS, TERMINAL_STATUSES } from "../coordinator-verify.js";
import { subagentGrants } from "../permissions.js";
import { guardedExecute } from "../guarded-dispatch.js";
import { renderObservation } from "../../services/observation-render.js";
import { runAgentLoop, resumeAgentLoop, type AgentLoopOptions, type AgentLoopOutcome } from "./loop.js";
import { ReplPool, type ReplHostDeps, type ReplTab } from "./repl.js";
import { permittedWebUrl } from "../web-tools.js";
import { TranscriptStore } from "./transcript.js";
import { buildToolManifest } from "./tools.js";
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
  /** Code-mode REPL backends (S5 deliverable 3). */
  repl?: {
    /** decide() on opening a tab — parks like webFetch on `ask`; the host opens only on `output`. */
    openTab?: (url: string, ctx: { runId: string; threadId: string; turnId: string }) => Promise<LoopToolResult>;
    /** Session storage roots the guest `fs` is confined to. */
    fsRoots?: () => string[];
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
  /** Provider prompt-cache options merged into each model step (S5 deliverable 1). */
  providerOptions?: Record<string, Record<string, unknown>>;
}

/** The first transcript row: the task exactly as the user authored it. */
function taskMessage(run: Run): ModelMessage {
  const parts = [
    `Task: ${run.goal}`,
    run.config?.instructions ? `Instructions (human-authored): ${run.config.instructions}` : "",
    run.config?.context ? `Context: ${run.config.context}` : "",
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
  if (!transcript.count(runId)) transcript.append(runId, [taskMessage(run)]);

  let activePageId = run.pageIds[0];
  const lastObs = new Map<string, Observation>();
  const outcomes: StepOutcome[] = [];
  let applied = run.config?.messageRevision ?? 0;
  let steerCursor = self.deps.repo.listRunSteers(runId).length;
  let modelCalls = 0;
  const maxModelCalls = run.config?.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS;

  const signal = c.dispatchAbort ? AbortSignal.any([c.abort.signal, c.dispatchAbort.signal]) : c.abort.signal;
  const steerPending = () =>
    c.paused || (self.deps.repo.getRun(runId)?.config?.messageRevision ?? 0) !== applied;

  /** Track uncertain writes for checkpoint/finish the same way the planner does. */
  const noteUnresolved = () => {
    self.unresolvedByRun.set(
      runId,
      outcomes
        .filter((o) => o.receipt?.uncertain === true || o.receipt?.dispatchedBeforeTakeover === true || o.effect === "uncertain" || o.effect === "dispatched")
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

  const deps: LoopToolDeps = {
    observe: async ({ pageId, scope, subtreeRef }) => {
      const obs = await observePage(pageId, { scope, subtreeRef });
      lastObs.set(obs.pageId, obs);
      const artifactId = self.deps.saveObservation?.(runId, obs);
      return { text: renderObservation(obs), observationId: artifactId ?? `rev:${obs.revision}`, revision: obs.revision };
    },
    act: async ({ pageId, steps }): Promise<LoopToolResult> => {
      const obs = lastObs.get(pageId) ?? (lastObs.set(pageId, await observePage(pageId, {})), lastObs.get(pageId)!);
      const gate = await guardedExecute(
        { pages: self.deps.pages, durable: self.durable, grants: subagentGrants(run.config?.subagentProfile, self.deps.grants) },
        {
          runId, pageId, steps,
          observation: obs.content, url: obs.content.url,
          documentEpoch: obs.documentEpoch, revision: obs.revision,
          taskId: run.config?.taskId, taskRevision: run.config?.taskRevision,
          isCurrent: () => !steerPending() && !signal.aborted,
          exec: {
            runId, taskId: run.config?.taskId, signal,
            onStep: (outcome, step) => {
              outcomes.push(outcome);
              self.deps.onStepRecorded?.(runId, outcome, step);
            },
          },
          returnObservation: { scope: "full" },
        },
      );
      if (gate.kind !== "ran") return { output: { [gate.kind]: gate.reason } };
      if (gate.result.observation) lastObs.set(pageId, gate.result.observation);
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
          ...(gate.result.observation ? { observation: renderObservation(gate.result.observation) } : {}),
        },
      };
    },
    webFetch: self.deps.agentLoop?.webFetch,
    webSearch: self.deps.agentLoop?.webSearch,
    recall: self.deps.agentLoop?.recall,
    writeTodos: (todos) => {
      self.deps.repo.saveCheckpoint(`run:${runId}`, "loop_todos", { todos });
    },
  };

  // ---- code-mode REPL (S5 deliverable 3) ----
  const replPool = new ReplPool();
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
  const fsRoots = () => (self.deps.agentLoop?.repl?.fsRoots?.() ?? []).map((root) => resolve(root));
  const insideRoots = (path: string) => {
    const resolved = resolve(path);
    return fsRoots().some((root) => resolved === root || resolved.startsWith(root + sep));
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
      openedTabs.set(target.pageId, await self.claimPage(runId, target.pageId));
      return { output: replTab(target.pageId) };
    },
    closeTab: async (pageId) => {
      const release = openedTabs.get(pageId);
      if (!release) throw new AuxError("permission_denied", "closeTab only closes tabs this run opened.");
      await self.deps.pages.close(pageId);
      openedTabs.delete(pageId);
      release();
    },
    useTab: async (pageId) => {
      if (!run.pageIds.includes(pageId) && !openedTabs.has(pageId))
        throw new AuxError("permission_denied", "The REPL can only use tabs the run claims or opened.");
      return replTab(pageId);
    },
    observe: async (pageId, scope) =>
      (await deps.observe!({ pageId, scope: scope as import("@aux/contracts").ObservationScope | undefined })).text,
    capture: async (pageId) => {
      const shot = await self.deps.pages.capture(pageId);
      const elements = (lastObs.get(pageId)?.content.elements ?? [])
        .filter((el) => el.rect)
        .map((el) => ({ ref: el.ref, name: el.name ?? el.text?.slice(0, 80), rect: el.rect }));
      return { ...shot, elements };
    },
    step: (pageId, step) => deps.act!({ pageId, steps: [step as import("@aux/contracts").Step] }),
    fetch: async (url) => {
      const fetchDep = self.deps.agentLoop?.webFetch;
      if (!fetchDep) throw new AuxError("capability_unsupported", "fetch is unavailable — no web egress backend for this run.");
      return fetchDep(url, { runId, threadId, turnId: runId });
    },
    fsRead: async (path) => {
      if (!insideRoots(path)) throw new AuxError("permission_denied", "fs reads stay inside session storage roots.");
      return readFileSync(path, "utf8");
    },
    fsWrite: async (path, content) => {
      if (!insideRoots(path)) throw new AuxError("permission_denied", "fs writes stay inside session storage roots.");
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    },
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
  };
  deps.repl = ({ code, deadlineMs }) => replPool.eval(replDeps, code, { pageId: activePageId, deadlineMs });

  self.setStatus(runId, "running", "Working…");
  const startedAt = Date.now();
  self.deps.repo.saveRun({ ...self.get(runId), startedAt });
  run.startedAt = startedAt;

  const modelId = () => run.config?.modelId ?? self.deps.defaultModel();
  const makeOpts = (): AgentLoopOptions => ({
    model,
    modelId: modelId(),
    tools: buildToolManifest(),
    transcript,
    runId,
    threadId,
    pageId: () => activePageId,
    signal,
    deps,
    maxSteps: Math.max(1, maxModelCalls - modelCalls),
    steerCheck: steerPending,
    onStep: async ({ step }) => {
      modelCalls++;
      self.deps.recordModelCall({
        runId, role: "agent", modelId: modelId(),
        durationMs: step.durationMs, inputTokens: step.inputTokens, outputTokens: step.outputTokens,
        ...(step.cachedInputTokens ? { cachedInputTokens: step.cachedInputTokens } : {}),
        ...(step.providerMetadata ? { providerMetadata: step.providerMetadata } : {}),
        ...(step.error ? { error: step.error } : {}),
      });
    },
    providerOptions: self.deps.agentLoop?.providerOptions,
  });

  try {
    let resumeAnswer: unknown;
    let hasResume = false;
    while (true) {
      await self.waitIfPaused(c, runId);
      if (signal.aborted) return;
      if (maxModelCalls > 0 && modelCalls >= maxModelCalls) {
        self.finish(runId, "failed", undefined, "model call budget exhausted");
        return;
      }
      const outcome: AgentLoopOutcome = hasResume
        ? await resumeAgentLoop(makeOpts(), resumeAnswer)
        : await runAgentLoop(makeOpts());
      hasResume = false;

      if (outcome.kind === "done") {
        self.finish(runId, "completed", { report: outcome.text }, undefined, "Done");
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
