import {
  newResultId,
  PlanChunkSchema,
  type ResultRecord,
  type PlanChunk,
  type SetMember,
  type Step,
  type StepOutcome,
} from "@aux/contracts";
import type { PageService } from "../services/pages.js";
import type { DurableWriteLedger } from "./durable.js";
import { guardedExecute } from "./guarded-dispatch.js";
import { attemptsOf, type ModelClient, type StructuredCallResult } from "./model-client.js";
import type { GrantSource } from "./permissions.js";
import { buildPlannerPrompt, PLANNER_SYSTEM } from "./planner.js";
import type { ResearchBudget } from "../scheduler/research-budget.js";

const MEMBER_MAX_CALLS = 6;
const MEMBER_MAX_STEPS = 20;

/**
 * Bounded per-member agent used by sets.map when a goal (rather than a
 * program) drives the map. Returns the result plus the executed steps so a
 * portable program can be learned and replayed for siblings.
 */
export async function runMemberAgent(opts: {
  member: SetMember;
  pageId: string;
  goal: string;
  runId: string;
  pages: PageService;
  model: ModelClient;
  modelId: string;
  signal: AbortSignal;
  /** Privilege-independent grants. Model text cannot expand them. */
  grants?: GrantSource;
  /** Persist write intent before dispatch (Gate D). */
  durable?: DurableWriteLedger;
  budget?: ResearchBudget;
  recordModelCall?: (c: { modelId: string; durationMs: number; inputTokens?: number; outputTokens?: number; cachedInputTokens?: number; providerMetadata?: Record<string, unknown>; error?: string }) => void;
}): Promise<{ result: ResultRecord; executedSteps: Step[] }> {
  const { member, pages, model, modelId, signal, runId } = opts;
  const pageId = opts.pageId;
  const outcomes: StepOutcome[] = [];
  const executed: Step[] = [];
  const memberGoal = `For this single record/page: ${opts.goal}\nReturn result fields as the structured result when done.`;

  let notes: string | undefined;
  for (let calls = 0, stepsRun = 0; calls < MEMBER_MAX_CALLS && stepsRun < MEMBER_MAX_STEPS; ) {
    if (signal.aborted || opts.budget?.signal.aborted) break;
    const obs = await pages.observe(pageId, {});
    const prompt = buildPlannerPrompt({ goal: memberGoal, observations: [obs], recentOutcomes: outcomes, pageIds: [pageId], notes, budget: { tokens: 3000 } });
    const permit=opts.budget?.reserveModel(modelId,prompt,PLANNER_SYSTEM,8192);
    if(permit&&"reason" in permit)return err(member,pageId,obs.content.url,permit.reason,executed);
    let call: StructuredCallResult<PlanChunk>;
    const callStarted=Date.now();
    try {
      call=await model.generateStructured({modelId,system:PLANNER_SYSTEM,prompt,schema:PlanChunkSchema,
        signal:opts.budget?.signal??signal,maxOutputTokens:8192,...(opts.budget?{maxAttempts:1}:{})});
      if(permit&&"finish" in permit)permit.finish([...(call.retries??[]),call]);
    } catch(error) {
      const attempts=attemptsOf(error);
      if(permit&&"finish" in permit)permit.finish(attempts);
      for(const attempt of attempts)opts.recordModelCall?.({modelId,...attempt});
      if(!attempts.length)opts.recordModelCall?.({modelId,durationMs:Date.now()-callStarted,error:error instanceof Error?error.message:String(error)});
      return err(member,pageId,obs.content.url,error instanceof Error?error.message:String(error),executed);
    }
    calls += 1 + (call.retries?.length ?? 0);
    for (const retry of call.retries ?? []) opts.recordModelCall?.({ modelId, ...retry });
    opts.recordModelCall?.({ modelId, durationMs: call.durationMs, inputTokens: call.inputTokens, outputTokens: call.outputTokens, cachedInputTokens: call.cachedInputTokens, providerMetadata: call.providerMetadata });
    const plan = call.object;
    if (plan.notes !== undefined) notes = plan.notes;

    if (plan.status === "done") {
      return {
        result: {
          resultId: newResultId(),
          runId,
          memberId: member.memberId,
          pageId,
          sourceUrl: obs.content.url,
          values: plan.result ?? collectExtracted(outcomes),
          observedAt: Date.now(),
          status: "ok",
        },
        executedSteps: executed,
      };
    }
    if (plan.status === "needs_input") {
      return err(member, pageId, obs.content.url, plan.question ?? "needs input", executed);
    }
    if (!plan.steps?.length) {
      if (plan.observationRequest) continue;
      return err(member, pageId, obs.content.url, "planner returned no steps", executed);
    }
    if(stepsRun+plan.steps.length>MEMBER_MAX_STEPS)return err(member,pageId,obs.content.url,"member step budget exhausted",executed);
    const live = pages.get(pageId);
    const g = await guardedExecute({ pages, durable: opts.durable, grants: opts.grants }, {
      runId,
      pageId,
      steps: plan.steps,
      observation: obs.content,
      url: live.url ?? obs.content.url,
      documentEpoch: live.documentEpoch ?? obs.documentEpoch,
      observedEpoch: obs.documentEpoch,
      revision: obs.revision,
      exec: { runId, signal:opts.budget?.signal??signal },
    });
    if (g.kind !== "ran") return err(member, pageId, obs.content.url, g.reason, executed);
    const steps = g.program.steps ?? plan.steps;
    executed.push(...steps);
    outcomes.push(...g.result.steps);
    stepsRun += steps.length;
    if (g.result.status === "failed") return err(member, pageId, obs.content.url, g.result.error ?? "step failed", executed);
    if (g.result.status === "cancelled") break;
  }
  return err(member, pageId, member.url ?? "", opts.budget?.reason()??"member budget exhausted without completion", executed);

  function err(m: SetMember, pid: string, url: string, error: string, executedSteps: Step[]) {
    return {
      result: {
        resultId: newResultId(),
        runId,
        memberId: m.memberId,
        pageId: pid,
        sourceUrl: url,
        values: collectExtracted(outcomes),
        observedAt: Date.now(),
        status: "partial" as const,
        error,
      },
      executedSteps,
    };
  }
}

function collectExtracted(outcomes: StepOutcome[]): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const o of outcomes) if (o.extracted) Object.assign(merged, o.extracted);
  return merged;
}
