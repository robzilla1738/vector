import {
  EventTypes,
  newResultId,
  VectorError,
  type Program,
  type ResultRecord,
  type SetMember,
  type Step,
} from "@vector/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "../services/pages.js";
import type { SetService } from "../services/sets.js";
import { compileAndAuthorize } from "../agent/action-compiler.js";
import { beginConsequentialWrite, DurableWriteLedger, settleWrite } from "../agent/durable.js";
import type { GrantSource } from "../agent/permissions.js";
import { WorkerPool } from "./pool.js";

export interface SetRunnerDeps {
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
  runAgentForMember: (
    member: SetMember,
    pageId: string,
    goal: string,
    ctx: { runId: string; signal: AbortSignal },
  ) => Promise<{ result: ResultRecord; executedSteps?: Step[] }>;
  /** look up a saved program to replay */
  getProgram: (programId: string) => { stepsJson: string; siteKey: string } | undefined;
  saveProgram: (p: { name: string; siteKey: string; steps: Step[]; parameters: string[] }) => string;
  /**
   * Rewrite observation refs (r12) in executed steps into portable
   * selectors (role/css) so a program learned on one page replays on
   * siblings. Also drops member-specific navigation.
   */
  translateSteps: (pageId: string, steps: Step[]) => Step[];
  nativeAvailable?: () => boolean;
  /** Privilege-independent grants for learned replay (Finding 5 / Gate F). */
  grants?: GrantSource;
  /** Shared persist-before-dispatch ledger (Gate D). */
  durableWrites?: DurableWriteLedger;
}

/** A replayable program and where it applies (`*` = every member). */
interface Learned {
  siteKey: string;
  steps?: Step[];
  nodes?: Program["nodes"];
  /** authored by the API caller or saved by a user — model-learned programs never get eval rights */
  trusted: boolean;
}

const siteKeyOf = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/[0-9a-f-]{6,}/g, "*")}`;
  } catch {
    return url;
  }
};

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
  async acquire(): Promise<() => void> {
    if (this.active >= this.limit) await new Promise<void>((r) => this.queue.push(r));
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
export class SetRunner {
  constructor(private deps: SetRunnerDeps) {}

  async map(opts: {
    setId: string;
    runId: string;
    program?: { steps?: Step[]; nodes?: Program["nodes"] };
    programId?: string;
    goal?: string;
    /** per-map cap, applied on top of the global WorkerPool limits */
    concurrency?: number;
    memberIds?: string[];
    signal: AbortSignal;
    /** pause gate — resolves immediately unless the owning run is paused */
    waitIfPaused?: () => Promise<void>;
    /** synchronous view of the gate, re-checked after waiting for capacity */
    isPaused?: () => boolean;
  }): Promise<void> {
    const { set, members } = this.deps.sets.get(opts.setId);
    const target = members.filter(
      (m) => (!opts.memberIds || opts.memberIds.includes(m.memberId)) && m.status !== "completed",
    );

    // saved program bodies may hold {steps, nodes} — parse like runProgram does
    const parseSaved = (json: string): { steps?: Step[]; nodes?: Program["nodes"] } => {
      const body = JSON.parse(json) as Step[] | { steps?: Step[]; nodes?: Program["nodes"] };
      return Array.isArray(body) ? { steps: body } : { steps: body.steps, nodes: body.nodes };
    };
    // `trusted` marks programs authored by the API caller or saved by a user;
    // programs learned from a member agent's plan mid-map are model output
    // and never get eval rights.
    let learned: Learned | undefined;
    // programs learned by pilot members, keyed by site (plan A9)
    const learnedBySite = new Map<string, Learned>();
    const learnedFor = (url: string): Learned | undefined => learned ?? learnedBySite.get(siteKeyOf(url));
    if (opts.programId) {
      const p = this.deps.getProgram(opts.programId);
      if (p) learned = { siteKey: p.siteKey, ...parseSaved(p.stepsJson), trusted: true };
    } else if (opts.program) {
      learned = { siteKey: "*", steps: opts.program.steps, nodes: opts.program.nodes, trusted: true };
    } else if (set.programId) {
      const p = this.deps.getProgram(set.programId);
      if (p) learned = { siteKey: p.siteKey, ...parseSaved(p.stepsJson), trusted: true };
    }

    const sem = new Semaphore(Math.max(1, opts.concurrency ?? Number.MAX_SAFE_INTEGER));
    const jobs = target.map((m) => async () => {
      // gate order: pause → per-map concurrency → global pool. A paused run
      // starts no new members; cancel while paused releases the gate (the
      // owner rejects/resolves it) and the member is skipped below.
      await opts.waitIfPaused?.();
      if (opts.signal.aborted) {
        this.skip(m, opts.runId);
        return;
      }
      const url = m.url ?? this.deps.pages.get(m.pageId ?? "")?.url;
      if (!url && !m.pageId) {
        this.fail(m, "member has neither url nor page", opts.runId);
        return;
      }
      let releaseSem: (() => void) | undefined;
      let release: (() => void) | undefined;
      let workerPageId: string | undefined;
      try {
        releaseSem = await sem.acquire();
        // pause may have arrived while this member waited for capacity —
        // re-check, and never hold a global pool slot while gated (other
        // runs share the pool)
        await opts.waitIfPaused?.();
        release = await this.deps.pool.acquire(url ?? "unknown", opts.signal);
        while (!opts.signal.aborted && opts.isPaused?.()) {
          release();
          release = undefined;
          await opts.waitIfPaused?.();
          release = await this.deps.pool.acquire(url ?? "unknown", opts.signal);
        }
        if (opts.signal.aborted) {
          this.skip(m, opts.runId);
          return;
        }
        m.status = "running";
        this.deps.sets.updateMember(m);
        const outcome = await this.processMember(m, url!, opts, learnedFor(url!), (id) => (workerPageId = id));
        if (opts.signal.aborted) {
          this.skip(m, opts.runId);
          return;
        }
        const { result } = outcome;
        result.runId ??= opts.runId;
        this.deps.repo.saveResult(result);
        m.status = result.status === "error" ? "failed" : "completed";
        m.resultId = result.resultId;
        if (result.error) m.error = result.error;
        this.deps.sets.updateMember(m);
        this.deps.events.emit(EventTypes.ResultAdded, { result }, opts.runId);

        // M5 speed path: a successful agent member becomes a replayable
        // program for same-site siblings — no more model calls for them.
        const site = siteKeyOf(result.sourceUrl);
        if (!learned && !learnedBySite.has(site) && opts.goal && result.status === "ok" && outcome.executedSteps?.length) {
          const portable = this.deps.translateSteps(workerPageId ?? m.pageId ?? "", outcome.executedSteps);
          if (portable.length) {
            learnedBySite.set(site, { siteKey: site, steps: portable, trusted: false });
            this.deps.saveProgram({
              name: `learned:${opts.setId}:${opts.goal.slice(0, 40)}`,
              siteKey: site,
              steps: portable,
              parameters: [],
            });
          }
        }
      } catch (e) {
        if (opts.signal.aborted) {
          // cancelled mid-flight: the member never finished — never leave it "running"
          this.skip(m, opts.runId);
          return;
        }
        this.fail(m, e instanceof Error ? e.message : String(e), opts.runId);
      } finally {
        if (workerPageId) await this.releaseWorker(workerPageId);
        release?.();
        releaseSem?.();
      }
    });

    // Pilot-then-fan-out (plan A9): with a goal and no program yet, every
    // member of the first wave would otherwise run the model. Run one member
    // per site first; if it yields a replayable program, its siblings replay
    // it with zero model calls (agent only on divergence). Members whose
    // site has no pilot result still run as agents, as before.
    if (opts.goal && !learned && target.length > 1) {
      const bySite = new Map<string, number[]>();
      target.forEach((m, i) => {
        const key = siteKeyOf(m.url ?? this.deps.pages.get(m.pageId ?? "")?.url ?? "");
        const list = bySite.get(key) ?? [];
        list.push(i);
        bySite.set(key, list);
      });
      const pilots: number[] = [];
      const rest: number[] = [];
      for (const idx of bySite.values()) {
        pilots.push(idx[0]!);
        rest.push(...idx.slice(1));
      }
      this.deps.events.emit(
        EventTypes.SetUpdated,
        { setId: opts.setId, pilot: pilots.map((i) => target[i]!.memberId), sites: bySite.size },
        opts.runId,
      );
      await Promise.all(pilots.map((i) => jobs[i]!()));
      if (opts.signal.aborted) {
        for (const i of rest) this.skip(target[i]!, opts.runId);
      } else {
        await Promise.all(rest.map((i) => jobs[i]!()));
      }
    } else {
      await Promise.all(jobs.map((j) => j()));
    }
    this.deps.events.emit(EventTypes.SetUpdated, { setId: opts.setId, done: true }, opts.runId);
  }

  private async processMember(
    m: SetMember,
    url: string,
    opts: { goal?: string; runId: string; signal: AbortSignal },
    learned: Learned | undefined,
    setWorker: (id: string) => void,
  ): Promise<{ result: ResultRecord; executedSteps?: Step[] }> {
    // existing human-owned page: use it directly
    let pageId = m.pageId;
    if (!pageId || !this.deps.pages.isAttached(pageId)) {
      const page = await this.deps.pages.open({
        url,
        backend: "vector",
        background: true,
        ownedByRuntime: true,
      });
      pageId = page.pageId;
      setWorker(pageId);
    } else if (m.url && this.deps.pages.get(pageId).url !== m.url) {
      await this.deps.pages.navigate(pageId, m.url);
    }

    // replay a validated program when the member's site matches its key
    if (learned && (learned.siteKey === "*" || siteKeyOf(url) === learned.siteKey)) {
      const replay = await this.replayLearned(learned, pageId, url, opts);
      if ("res" in replay) {
        // a completed replay is the result; so is any outcome when there is no
        // agent to fall through to (re-running the same program would only
        // repeat the failure) or the run was cancelled mid-program
        if (replay.res.status === "completed" || !opts.goal || opts.signal.aborted) {
          return { result: this.resultOf(m, pageId, replay.res) };
        }
        // divergence: fall through to the agent for this member
      } else if (!opts.goal) {
        return { result: this.resultOf(m, pageId, { status: "failed", error: replay.blocked }) };
      }
    }
    if (opts.goal) {
      const agentRes = await this.deps.runAgentForMember(m, pageId, opts.goal, { runId: opts.runId, signal: opts.signal });
      return { result: agentRes.result, executedSteps: agentRes.executedSteps };
    }
    if (learned) {
      // site key did not match and no goal: replay anyway rather than fail silently
      const replay = await this.replayLearned(learned, pageId, url, opts);
      if ("res" in replay) return { result: this.resultOf(m, pageId, replay.res) };
      return { result: this.resultOf(m, pageId, { status: "failed", error: replay.blocked }) };
    }
    throw new VectorError("invalid_params", "sets.map needs program, programId, or goal");
  }

  /**
   * Finding 5: learned replay observes first, then compileAndAuthorize.
   * Consequential writes do not dispatch on a stale epoch, origin mismatch,
   * or missing grant.
   */
  private async replayLearned(
    learned: Learned,
    pageId: string,
    url: string,
    opts: { runId: string; signal: AbortSignal },
  ): Promise<{ res: { status: string; extracted?: Record<string, unknown>; error?: string } } | { blocked: string }> {
    const obs = await this.deps.pages.observe(pageId, {});
    const live = this.deps.pages.get(pageId);
    const origin = originOfSiteKey(learned.siteKey);
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
      steps: learned.steps ?? [],
      observation: obs.content,
      url: href,
      grants: this.deps.grants,
    });
    if ("rejected" in prepared) return { blocked: prepared.rejected };
    if ("denied" in prepared) return { blocked: prepared.denied };
    const steps = prepared.program.steps ?? learned.steps ?? [];
    const write = beginConsequentialWrite(this.deps.durableWrites, {
      runId: opts.runId,
      pageId,
      documentEpoch: prepared.program.documentEpoch ?? obs.documentEpoch,
      revision: obs.revision,
      steps,
    });
    if (write.skip) return { res: { status: "completed", extracted: {} } };
    const program: Program = { ...prepared.program, nodes: learned.nodes };
    const res = await this.deps.pages.execute(program, {
      runId: opts.runId,
      signal: opts.signal,
      allowEval: learned.trusted,
    });
    settleWrite(this.deps.durableWrites, write.intentId, res.status === "completed");
    return { res };
  }

  private resultOf(m: SetMember, pageId: string, res: { status: string; extracted?: Record<string, unknown>; error?: string }): ResultRecord {
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
  private skip(m: SetMember, runId: string) {
    if (m.status === "completed" || m.status === "failed") return;
    m.status = "skipped";
    m.error = `cancelled (run ${runId})`;
    this.deps.sets.updateMember(m);
  }

  /** Workers are runtime-owned and disposable — close them after the member. */
  private async releaseWorker(pageId: string) {
    const p = this.deps.pages.get(pageId);
    if (!p || !p.ownedByRuntime) return;
    await this.deps.pages.close(pageId).catch(() => {});
  }
}
