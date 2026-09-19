/**
 * Validated action compiler (Gate F). Rebinds recorded refs to the current
 * observation using semantic guards. Stale document epochs fail closed.
 */
import type { ObservationContent, Program, Step } from "@vector/contracts";
import { queryPage, type PageQuery } from "./page-query.js";
import type { SkillGuard } from "./skills.js";
import { authorizeProgram, type EffectClass, type GrantSource } from "./permissions.js";

export type CompileResult = { program: Program } | { rejected: string };
export type DispatchPrep =
  | { program: Program }
  | { rejected: string }
  | { denied: string; effect: EffectClass };

export type CompileActionOpts = {
  pageId: string;
  documentEpoch: number;
  steps: Step[];
  observation: ObservationContent;
  url: string;
  guards?: SkillGuard[];
  observedEpoch?: number;
};

export function rebindSteps(steps: Step[], obs: ObservationContent, guards: SkillGuard[] = []): Step[] {
  return steps.map((step) => {
    if (!("target" in step) || typeof step.target !== "string") return step;
    if (obs.elements.some((e) => e.ref === step.target)) return step;
    for (const g of guards) {
      const hit = queryPage(obs, guardQuery(g));
      if (hit) return { ...step, target: hit.ref };
    }
    if (step.target.startsWith("text:")) {
      const hit = queryPage(obs, { nameIncludes: step.target.slice(5) });
      if (hit) return { ...step, target: hit.ref };
    }
    return step;
  });
}

export function compileAction(opts: CompileActionOpts): CompileResult {
  if (opts.observedEpoch != null && opts.observedEpoch !== opts.documentEpoch) {
    return { rejected: "document epoch changed; re-observe before dispatch" };
  }
  try {
    if (opts.guards?.some((g) => g.exactOrigin) && opts.url) {
      const origin = new URL(opts.url).origin;
      if (opts.guards.some((g) => g.exactOrigin && g.exactOrigin !== origin)) {
        return { rejected: "compiled action origin does not match the live page" };
      }
    }
  } catch {
    return { rejected: "compiled action has an unparseable page URL" };
  }
  const steps = rebindSteps(opts.steps, opts.observation, opts.guards ?? []);
  if (opts.guards?.length) {
    const missing = steps.find((s) => "target" in s && typeof s.target === "string" && s.target.startsWith("r") && !opts.observation.elements.some((e) => e.ref === s.target));
    if (missing && "target" in missing) {
      return { rejected: `target ${String(missing.target)} could not be rebound on the current observation` };
    }
  }
  return {
    program: {
      pageId: opts.pageId,
      documentEpoch: opts.documentEpoch,
      steps,
    },
  };
}

/** Compiler + privilege check used by streamed and finished dispatch (Gate F). */
export function compileAndAuthorize(
  opts: CompileActionOpts & { grants?: GrantSource },
): DispatchPrep {
  const compiled = compileAction(opts);
  if ("rejected" in compiled) return compiled;
  let origin = "";
  try {
    origin = opts.url ? new URL(opts.url).origin : "";
  } catch {
    origin = "";
  }
  const auth = authorizeProgram(compiled.program.steps ?? [], opts.grants, origin);
  if (!auth.ok) return { denied: auth.denied, effect: auth.effect };
  return compiled;
}

function guardQuery(g: SkillGuard): PageQuery {
  return {
    role: g.role,
    nameIncludes: g.nameIncludes,
    exactOrigin: g.exactOrigin,
  };
}
