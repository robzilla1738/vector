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
import { WorkerPool } from "./pool.js";

export interface SetRunnerDeps {
  repo: Repo;
  events: EventBus;
  pages: PageService;
  sets: SetService;
  pool: WorkerPool;
  /** creates a short agent run for one member when no program applies */
  runAgentForMember: (
    member: SetMember,
    pageId: string,
    goal: string,
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
}

const siteKeyOf = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/[0-9a-f-]{6,}/g, "*")}`;
  } catch {
    return url;
  }
};

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
    concurrency?: number;
    memberIds?: string[];
    signal: AbortSignal;
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
    let learned: { siteKey: string; steps?: Step[]; nodes?: Program["nodes"] } | undefined;
    if (opts.programId) {
      const p = this.deps.getProgram(opts.programId);
      if (p) learned = { siteKey: p.siteKey, ...parseSaved(p.stepsJson) };
    } else if (opts.program) {
      learned = { siteKey: "*", steps: opts.program.steps, nodes: opts.program.nodes };
    } else if (set.programId) {
      const p = this.deps.getProgram(set.programId);
      if (p) learned = { siteKey: p.siteKey, ...parseSaved(p.stepsJson) };
    }

    const jobs = target.map((m) => async () => {
      if (opts.signal.aborted) return;
      const url = m.url ?? this.deps.pages.get(m.pageId ?? "")?.url;
      if (!url && !m.pageId) {
        this.fail(m, "member has neither url nor page");
        return;
      }
      const release = await this.deps.pool.acquire(url ?? "unknown", opts.signal);
      let workerPageId: string | undefined;
      try {
        m.status = "running";
        this.deps.sets.updateMember(m);
        const outcome = await this.processMember(m, url!, opts, learned, (id) => (workerPageId = id));
        const { result } = outcome;
        this.deps.repo.saveResult(result);
        m.status = result.status === "error" ? "failed" : "completed";
        m.resultId = result.resultId;
        if (result.error) m.error = result.error;
        this.deps.sets.updateMember(m);
        this.deps.events.emit(EventTypes.ResultAdded, { result }, opts.runId);

        // M5 speed path: a successful agent member becomes a replayable
        // program for same-site siblings — no more model calls for them.
        if (!learned && opts.goal && result.status === "ok" && outcome.executedSteps?.length) {
          const portable = this.deps.translateSteps(workerPageId ?? m.pageId ?? "", outcome.executedSteps);
          if (portable.length) {
            learned = { siteKey: siteKeyOf(result.sourceUrl), steps: portable };
            this.deps.saveProgram({
              name: `learned:${opts.setId}:${opts.goal.slice(0, 40)}`,
              siteKey: learned.siteKey,
              steps: portable,
              parameters: [],
            });
          }
        }
      } catch (e) {
        if (opts.signal.aborted) return;
        this.fail(m, e instanceof Error ? e.message : String(e));
      } finally {
        if (workerPageId) await this.releaseWorker(workerPageId);
        release();
      }
    });

    await Promise.all(jobs.map((j) => j()));
    this.deps.events.emit(EventTypes.SetUpdated, { setId: opts.setId, done: true }, opts.runId);
  }

  private async processMember(
    m: SetMember,
    url: string,
    opts: { goal?: string; runId: string; signal: AbortSignal },
    learned: { siteKey: string; steps?: Step[]; nodes?: Program["nodes"] } | undefined,
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
      const program: Program = { pageId, steps: learned.steps, nodes: learned.nodes };
      const res = await this.deps.pages.execute(program, { runId: opts.runId, signal: opts.signal });
      if (res.status === "completed") return { result: this.resultOf(m, pageId, res) };
      // divergence: fall through to the agent for this member
    }
    if (opts.goal) {
      const agentRes = await this.deps.runAgentForMember(m, pageId, opts.goal);
      return { result: agentRes.result, executedSteps: agentRes.executedSteps };
    }
    if (learned) {
      const program: Program = { pageId, steps: learned.steps, nodes: learned.nodes };
      const res = await this.deps.pages.execute(program, { runId: opts.runId, signal: opts.signal });
      return { result: this.resultOf(m, pageId, res) };
    }
    throw new VectorError("invalid_params", "sets.map needs program, programId, or goal");
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

  private fail(m: SetMember, error: string) {
    m.status = "failed";
    m.error = error;
    this.deps.sets.updateMember(m);
    const result: ResultRecord = {
      resultId: newResultId(),
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

  /** Workers are runtime-owned and disposable — close them after the member. */
  private async releaseWorker(pageId: string) {
    const p = this.deps.pages.get(pageId);
    if (!p || !p.ownedByRuntime) return;
    await this.deps.pages.close(pageId).catch(() => {});
  }
}
