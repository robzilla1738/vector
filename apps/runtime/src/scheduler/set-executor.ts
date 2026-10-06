import {
  EventTypes,
  newResultId,
  AuxError,
  type Program,
  type ResultRecord,
  type SetMember,
  type Step,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "../services/pages.js";
import type { SetService } from "../services/sets.js";
import { compileAndAuthorize } from "../agent/action-compiler.js";
import { beginConsequentialWrite, DurableWriteLedger, settleWrite } from "../agent/durable.js";
import { collectProgramSteps } from "../services/pages/executor.js";
import { WorkerPool } from "./pool.js";

export interface SetExecutorDeps {
  turnMentions: import("../services/turn-mention-service.js").TurnMentionService;
  repo: Repo;
  events: EventBus;
  pages: PageService;
  sets: SetService;
  pool: WorkerPool;
  /**
   * Creates a short agent run for one member when no program applies. The
   * ctx carries the owning set-run's id (results are listable by run) and
   * its abort signal (runs.cancel must stop model calls, not just bookkeeping).
   */
  runGoalForMember: (member: SetMember, goal: string, ctx: {
    runId: string; signal: AbortSignal; modelId?: string; checkSource: () => void;
  }) => Promise<{ result: ResultRecord }>;
  /** look up a saved program to replay */
  getProgram: (programId: string) => { stepsJson: string; siteKey: string } | undefined;
  nativeAvailable?: () => boolean;
  controlledPage?: (
    runId: string,
    url: string,
    sourcePageId: string | undefined,
    signal: AbortSignal,
  ) => Promise<{ pageId: string; release: () => void }>;
  /** Privilege-independent grants for saved program replay (Finding 5 / Gate F). */
  readOnly?: boolean;
  /** Shared persist-before-dispatch ledger (Gate D). */
  durableWrites?: DurableWriteLedger;
}

/** A replayable program and where it applies (`*` = every member). */
interface SavedReplay {
  siteKey: string;
  steps?: Step[];
  nodes?: Program["nodes"];
}

const originOfSiteKey = (siteKey: string): string | undefined => {
  if (!siteKey || siteKey === "*") return undefined;
  try {
    return new URL(siteKey).origin;
  } catch {
    return undefined;
  }
};

/** Minimal counting semaphore — the per-map `concurrency` cap on top of the global pool. */
class Semaphore {
  private queue: (() => void)[] = [];
  private active = 0;
  constructor(private readonly limit: number) {}
  async acquire(signal?: AbortSignal): Promise<() => void> {
    while (this.active >= this.limit) {
      if (signal?.aborted)
        throw new AuxError("cancelled", "run stopped while waiting for capacity");
      await new Promise<void>((resolve) => {
        const wake = () => {
          signal?.removeEventListener("abort", onAbort);
          resolve();
        };
        const onAbort = () => {
          this.queue = this.queue.filter((item) => item !== wake);
          wake();
        };
        this.queue.push(wake);
        signal?.addEventListener("abort", onAbort, { once: true });
      });
    }
    if (signal?.aborted)
      throw new AuxError("cancelled", "run stopped while waiting for capacity");
    this.active++;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active--;
      this.queue.shift()?.();
    };
  }
}

/**
 * sets.map — apply a parameterized program (or agent goal) over set members
 * with bounded concurrency. Members without live pages get pooled workers;
 * failures never erase completed siblings.
 */
export class SetExecutor {
  constructor(private deps: SetExecutorDeps) {}

  async map(opts: {
    setId: string;
    runId: string;
    program?: { steps?: Step[]; nodes?: Program["nodes"] };
    programId?: string;
    goal?: string;
    modelId?: string;
    /** per-map cap, applied on top of the global WorkerPool limits */
    concurrency?: number;
    memberIds?: string[];
    signal: AbortSignal;
    /** pause gate — resolves immediately unless the owning run is paused */
    waitIfPaused?: (signal?: AbortSignal) => Promise<void>;
    /** synchronous view of the gate, re-checked after waiting for capacity */
    isPaused?: () => boolean;
  }): Promise<void> {
    const signal = opts.signal;
    const skipReason = () => "cancelled";
    {
      const { set, members } = this.deps.sets.get(opts.setId);
      const target = members.filter(
        (m) => (!opts.memberIds || opts.memberIds.includes(m.memberId)) && m.status !== "completed",
      );

      // saved program bodies may hold {steps, nodes} — parse like runProgram does
      const parseSaved = (json: string): { steps?: Step[]; nodes?: Program["nodes"] } => {
        const body = JSON.parse(json) as Step[] | { steps?: Step[]; nodes?: Program["nodes"] };
        return Array.isArray(body) ? { steps: body } : { steps: body.steps, nodes: body.nodes };
      };
      let replay: SavedReplay | undefined;
      if (opts.programId) {
        const p = this.deps.getProgram(opts.programId);
        if (p) replay = { siteKey: p.siteKey, ...parseSaved(p.stepsJson) };
      } else if (opts.program) {
        replay = { siteKey: "*", steps: opts.program.steps, nodes: opts.program.nodes };
      } else if (set.programId) {
        const p = this.deps.getProgram(set.programId);
        if (p) replay = { siteKey: p.siteKey, ...parseSaved(p.stepsJson) };
      }

      const sem = new Semaphore(Math.max(1, opts.concurrency ?? Number.MAX_SAFE_INTEGER));
      const jobs = target.map((m) => async () => {
        // gate order: pause → per-map concurrency → global pool. A paused run
        // starts no new members; cancel while paused releases the gate (the
        // owner rejects/resolves it) and the member is skipped below.
        await opts.waitIfPaused?.(signal);
        if (signal.aborted) {
          this.skip(m, opts.runId, skipReason());
          return;
        }
        let url: string | undefined;
        try {
          url = this.memberUrl(m);
        } catch (e) {
          // one member's vanished page must not reject the whole set run
          this.fail(m, e instanceof Error ? e.message : String(e), opts.runId);
          return;
        }
        if (!url && !m.pageId) {
          this.fail(m, "member has neither url nor page", opts.runId);
          return;
        }
        let releaseSem: (() => void) | undefined;
        let release: (() => void) | undefined;
        let workerPageId: string | undefined;
        let releaseControlled: (() => void) | undefined;
        const owner =
          m.pageId && !this.deps.controlledPage
            ? { pageId: m.pageId, actor: "set_member" as const, runId: opts.runId, memberId: m.memberId }
            : undefined;
        try {
          releaseSem = await sem.acquire(signal);
          // pause may have arrived while this member waited for capacity —
          // re-check, and never hold a global pool slot while gated (other
          // runs share the pool)
          await opts.waitIfPaused?.(signal);
          release = await this.deps.pool.acquire(url ?? "unknown", signal, owner);
          while (!signal.aborted && opts.isPaused?.()) {
            release();
            release = undefined;
            await opts.waitIfPaused?.(signal);
            release = await this.deps.pool.acquire(url ?? "unknown", signal, owner);
          }
          if (signal.aborted) {
            this.skip(m, opts.runId, skipReason());
            return;
          }
          m.status = "running";
          this.deps.sets.updateMember(m);
          const outcome = await this.processMember(
            m,
            url!,
            { ...opts, signal },
            replay,
            (id, cleanup) => {
              workerPageId = id;
              releaseControlled = cleanup;
            },
          );
          if (signal.aborted) {
            this.skip(m, opts.runId, skipReason());
            return;
          }
          const { result } = outcome;
          result.runId ??= opts.runId;
          this.deps.repo.saveResult(result);
          m.status = result.status === "ok" ? "completed" : "failed";
          m.resultId = result.resultId;
          if (result.error) m.error = result.error;
          this.deps.sets.updateMember(m);
          this.deps.events.emit(EventTypes.ResultAdded, { result }, opts.runId);

        } catch (e) {
          if (signal.aborted) {
            // cancelled mid-flight: the member never finished — never leave it "running"
            this.skip(m, opts.runId, skipReason());
            return;
          }
          this.fail(m, e instanceof Error ? e.message : String(e), opts.runId);
        } finally {
          releaseControlled?.();
          if (workerPageId) await this.releaseWorker(workerPageId);
          release?.();
          releaseSem?.();
        }
      });

      await Promise.all(jobs.map((job) => job()));
      this.deps.events.emit(
        EventTypes.SetUpdated,
        { setId: opts.setId, done: true },
        opts.runId,
      );
    }
  }

  private async processMember(
    m: SetMember,
    url: string,
    opts: { goal?: string; runId: string; signal: AbortSignal; modelId?: string },
    replay: SavedReplay | undefined,
    setWorker: (id: string, release?: () => void) => void,
  ): Promise<{ result: ResultRecord; executedSteps?: Step[] }> {
    const source = { memberId: m.memberId, setId: m.setId, pageId: m.pageId, url: m.url, recordKey: m.recordKey };
    const checkMember = () => {
      if (opts.signal.aborted) throw new AuxError("cancelled", "This Set member was cancelled.");
      const current = this.deps.sets.get(source.setId);
      const member = current.members.find((item) => item.memberId === source.memberId);
      if (!current.set.memberIds.includes(source.memberId) || !member ||
          member.pageId !== source.pageId || member.url !== source.url || member.recordKey !== source.recordKey)
        throw new AuxError("permission_denied", "This Set member's approved source changed.");
    };
    checkMember();
    if (opts.goal && !replay) return this.deps.runGoalForMember(m, opts.goal, {
      runId: opts.runId, signal: opts.signal, modelId: opts.modelId, checkSource: checkMember,
    });
    let pageId = m.pageId;
    if (pageId && this.deps.pages.isAttached(pageId) && m.url && this.deps.pages.get(pageId).url !== m.url)
      throw new AuxError(
        "conflict",
        "Set member page changed since it was added; refresh the set before running it",
      );
    if (this.deps.controlledPage) {
      const page = await this.deps.controlledPage(
        opts.runId,
        url,
        pageId && this.deps.pages.isAttached(pageId) ? pageId : undefined,
        opts.signal,
      );
      pageId = page.pageId;
      this.deps.turnMentions.created(opts.runId, pageId);
      setWorker(pageId, page.release);
    } else if (!pageId || !this.deps.pages.isAttached(pageId)) {
      const page = await this.deps.pages.open({
        url,
        backend: "aux",
        background: true,
        ownedByRuntime: true,
      });
      pageId = page.pageId;
      const release = await this.deps.pool.ownership.acquire(
        { pageId, actor: "set_member", runId: opts.runId, memberId: m.memberId },
        opts.signal,
      );
      setWorker(pageId, release);
      this.deps.turnMentions.created(opts.runId, pageId);
    }
    if (this.deps.pages.get(pageId).controller === "human")
      throw new AuxError("conflict", "A person controls this tab; return control before mapping the set");

    const checkSource = () => {
      checkMember();
      const owner = this.deps.pool.ownership.snapshot()[pageId];
      if (
        !owner ||
        owner.runId !== opts.runId ||
        (owner.actor !== "coordinator" &&
          !(owner.actor === "set_member" && owner.memberId === source.memberId))
      )
        throw new AuxError("permission_denied", "This Set run no longer owns its source page lease.");
    };
    const scopedOpts = { ...opts, checkSource };
    checkSource();
    if (replay) {
      const outcome = await this.replayProgram(replay, pageId, url, scopedOpts);
      if ("res" in outcome) return { result: this.resultOf(m, pageId, outcome.res) };
      return { result: this.resultOf(m, pageId, { status: "failed", error: outcome.blocked }) };
    }
    throw new AuxError("invalid_params", "sets.map needs program, programId, or goal");
  }

  /**
   * Finding 5: saved program replay observes first, then compileAndAuthorize.
   * Consequential writes do not dispatch on a stale epoch, origin mismatch,
   * or missing grant.
   */
  private async replayProgram(
    replay: SavedReplay,
    pageId: string,
    url: string,
    opts: { runId: string; signal: AbortSignal; checkSource: () => void },
  ): Promise<
    { res: { status: string; extracted?: Record<string, unknown>; error?: string } } | { blocked: string }
  > {
    const obs = await this.deps.turnMentions.useSourcePage(opts.runId, pageId, "read", opts.checkSource, () =>
      this.deps.pages.observe(pageId, {}),
    );
    const live = this.deps.pages.get(pageId);
    const origin = originOfSiteKey(replay.siteKey);
    const href = live.url ?? obs.content.url ?? url;
    if (origin) {
      try {
        if (new URL(href).origin !== origin) {
          return { blocked: "compiled action origin does not match the live page" };
        }
      } catch {
        return { blocked: "compiled action has an unparseable page URL" };
      }
    }
    const prepared = compileAndAuthorize({
      pageId,
      documentEpoch: live.documentEpoch ?? obs.documentEpoch,
      observedEpoch: obs.documentEpoch,
      steps: replay.steps ?? [],
      observation: obs.content,
      url: href,
      readOnly: this.deps.readOnly,
    });
    if ("rejected" in prepared) return { blocked: prepared.rejected };
    if ("denied" in prepared) return { blocked: prepared.denied };
    const program: Program = { ...prepared.program, nodes: replay.nodes };
    const write = beginConsequentialWrite(this.deps.durableWrites, {
      runId: opts.runId,
      pageId,
      documentEpoch: prepared.program.documentEpoch ?? obs.documentEpoch,
      revision: obs.revision,
      steps: collectProgramSteps(program),
    });
    if (write.skip) return { blocked: write.reason! };
    const res = await this.deps.turnMentions.useSourcePage(opts.runId, pageId, "act", opts.checkSource, () =>
      this.deps.pages.execute(program, {
        runId: opts.runId,
        journaled: true,
        journalIntentId: write.intentId,
        signal: opts.signal,
        allowEval: true,
        sourcePageCheck: opts.checkSource,
      }),
    );
    settleWrite(this.deps.durableWrites, write.intentId, res);
    return { res };
  }

  private resultOf(
    m: SetMember,
    pageId: string,
    res: { status: string; extracted?: Record<string, unknown>; error?: string },
  ): ResultRecord {
    const sourceUrl = this.deps.pages.get(pageId).url;
    return {
      resultId: newResultId(),
      memberId: m.memberId,
      pageId,
      sourceUrl,
      values: (res.extracted as Record<string, unknown>) ?? {},
      observedAt: Date.now(),
      status: res.status === "completed" ? "ok" : res.status === "cancelled" ? "partial" : "error",
      error: res.error,
    };
  }

  /** The member's url, or its page's; throws not_found when that page is gone. */
  private memberUrl(m: SetMember): string | undefined {
    return m.url ?? (m.pageId ? this.deps.pages.get(m.pageId).url : undefined);
  }

  private fail(m: SetMember, error: string, runId?: string) {
    m.status = "failed";
    m.error = error;
    this.deps.sets.updateMember(m);
    const result: ResultRecord = {
      resultId: newResultId(),
      runId,
      memberId: m.memberId,
      sourceUrl: m.url ?? "",
      values: {},
      observedAt: Date.now(),
      status: "error",
      error,
    };
    this.deps.repo.saveResult(result);
    m.resultId = result.resultId;
    this.deps.sets.updateMember(m);
  }

  /** Cancelled before/while running: not a failure, not completed — skipped, re-runnable. */
  private skip(m: SetMember, runId: string, reason = "cancelled") {
    if (m.status === "completed" || m.status === "failed") return;
    m.status = "skipped";
    m.error = `${reason} (run ${runId})`;
    this.deps.sets.updateMember(m);
  }

  /** Workers are runtime-owned and disposable — close them after the member. */
  private async releaseWorker(pageId: string) {
    const p = this.deps.pages.get(pageId);
    if (!p || !p.ownedByRuntime) return;
    await this.deps.pages.close(pageId).catch(() => {});
  }
}
