/**
 * Compiled guarded skills (VEC-018).
 *
 * A skill is a bounded program plus semantic guards. Reuse is allowed only
 * when every precondition holds on a fresh observation. Failures stop at the
 * guard; they do not improvise writes.
 */
import type { ObservationContent, Program, Step } from "@vector/contracts";

export interface SkillGuard {
  /** Role or accessible name that must exist. */
  role?: string;
  nameIncludes?: string;
  urlIncludes?: string;
}

export interface CompiledSkill {
  id: string;
  goalPattern: string;
  program: Program;
  preconditions: SkillGuard[];
  postconditions: SkillGuard[];
  evidence: string;
}

export function guardsHold(obs: ObservationContent, url: string, guards: SkillGuard[]): boolean {
  return guards.every((g) => {
    if (g.urlIncludes && !url.includes(g.urlIncludes)) return false;
    if (g.role || g.nameIncludes) {
      const hit = obs.elements.some((e) => {
        if (g.role && e.role !== g.role) return false;
        if (g.nameIncludes && !(e.name ?? "").includes(g.nameIncludes)) return false;
        return true;
      });
      if (!hit) return false;
    }
    return true;
  });
}

export function compileSkill(opts: {
  id: string;
  goalPattern: string;
  steps: Step[];
  pageId: string;
  preconditions: SkillGuard[];
  postconditions: SkillGuard[];
  evidence: string;
}): CompiledSkill {
  return {
    id: opts.id,
    goalPattern: opts.goalPattern,
    program: { pageId: opts.pageId, steps: opts.steps },
    preconditions: opts.preconditions,
    postconditions: opts.postconditions,
    evidence: opts.evidence,
  };
}

export function tryReuseSkill(
  skills: CompiledSkill[],
  goal: string,
  obs: ObservationContent,
  url: string,
): { skill: CompiledSkill; reason: string } | { skipped: string } {
  const match = skills.find((s) => goal.toLowerCase().includes(s.goalPattern.toLowerCase()));
  if (!match) return { skipped: "no skill matched the goal" };
  if (!guardsHold(obs, url, match.preconditions)) {
    return { skipped: `skill ${match.id} guards failed` };
  }
  return { skill: match, reason: match.evidence };
}

/** Measured task metrics for VEC-021 / M3 stretch comparison. */
export interface HeldOutMetrics {
  success: number;
  p95Ms: number;
  tokensPerSuccess: number;
}

/** Stretch gate: ≥2× lower p95 and ≥50% fewer tokens at non-inferior success. */
export interface HeldOutAdvantage {
  successNonInferior: boolean;
  p95Ratio: number;
  tokenRatio: number;
  meetsStretch: boolean;
}

export function evaluateHeldOutAdvantage(baseline: HeldOutMetrics, candidate: HeldOutMetrics): HeldOutAdvantage {
  const successNonInferior = candidate.success >= baseline.success;
  const p95Ratio = candidate.p95Ms > 0 ? baseline.p95Ms / candidate.p95Ms : 0;
  const tokensMeasured = baseline.tokensPerSuccess > 0 && candidate.tokensPerSuccess > 0;
  const tokenRatio = tokensMeasured ? baseline.tokensPerSuccess / candidate.tokensPerSuccess : 0;
  return {
    successNonInferior,
    p95Ratio,
    tokenRatio,
    meetsStretch: successNonInferior && p95Ratio >= 2 && tokensMeasured && tokenRatio >= 2,
  };
}
