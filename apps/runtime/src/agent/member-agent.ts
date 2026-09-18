import {
  newResultId,
  PlanChunkSchema,
  VectorError,
  type ResultRecord,
  type SetMember,
  type Step,
  type StepOutcome,
} from "@vector/contracts";
import type { PageService } from "../services/pages.js";
import { compileAndAuthorize } from "./action-compiler.js";
import type { ModelClient } from "./model-client.js";
import type { GrantSource } from "./permissions.js";
import { buildPlannerPrompt, PLANNER_SYSTEM } from "./planner.js";

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
  recordModelCall?: (c: { modelId: string; durationMs: number; inputTokens?: number; outputTokens?: number }) => void;
}): Promise<{ result: ResultRecord; executedSteps: Step[] }> {
  const { member, pages, model, modelId, signal, runId } = opts;
  const pageId = opts.pageId;
  const outcomes: StepOutcome[] = [];
  const executed: Step[] = [];
  const memberGoal = `For this single record/page: ${opts.goal}\nReturn result fields as the structured result when done.`;

  for (let calls = 0, stepsRun = 0; calls < MEMBER_MAX_CALLS && stepsRun < MEMBER_MAX_STEPS; ) {
    if (signal.aborted) break;
    const obs = await pages.observe(pageId, {});
    const prompt = buildPlannerPrompt({ goal: memberGoal, observations: [obs], recentOutcomes: outcomes, pageIds: [pageId] });
    const call = await model.generateStructured({
      modelId,
      system: PLANNER_SYSTEM,
      prompt,
      schema: PlanChunkSchema,
      signal,
      maxOutputTokens: 3072,
    });
    calls++;
    opts.recordModelCall?.({ modelId, durationMs: call.durationMs, inputTokens: call.inputTokens, outputTokens: call.outputTokens });
    const plan = call.object;

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
    if (!plan.steps?.length) continue;
    const live = pages.get(pageId);
    const prepared = compileAndAuthorize({
      pageId,
      documentEpoch: live.documentEpoch ?? obs.documentEpoch,
      observedEpoch: obs.documentEpoch,
      steps: plan.steps,
      observation: obs.content,
      url: live.url ?? obs.content.url,
      grants: opts.grants,
    });
    if ("rejected" in prepared) return err(member, pageId, obs.content.url, prepared.rejected, executed);
    if ("denied" in prepared) return err(member, pageId, obs.content.url, prepared.denied, executed);
    const res = await pages.execute(prepared.program, { runId, signal });
    executed.push(...(prepared.program.steps ?? plan.steps));
    outcomes.push(...res.steps);
    stepsRun += (prepared.program.steps ?? plan.steps).length;
    if (res.status === "failed") return err(member, pageId, obs.content.url, res.error ?? "step failed", executed);
    if (res.status === "cancelled") break;
  }
  return err(member, pageId, member.url ?? "", "member budget exhausted without completion", executed);

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
