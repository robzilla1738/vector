/**
 * Compiled guarded skills (AUX-018 / H2-C6).
 *
 * A skill is a bounded program plus semantic guards. Reuse is allowed only
 * when every precondition holds on a fresh observation. Failures stop at the
 * guard; they do not improvise writes. `siteKey` is the registrable origin
 * plus a control-fingerprint of the observation ref set.
 */
import { createHash } from "node:crypto";
import type { ObservationContent, Program, Step } from "@aux/contracts";
import { rebindSteps } from "./action-compiler.js";

export interface SkillGuard {
  /** Role or accessible name that must exist. */
  role?: string;
  nameIncludes?: string;
  urlIncludes?: string;
  /** Exact origin; substring matches are not enough for reuse. */
  exactOrigin?: string;
  /** Document generation that must still be current. */
  documentEpoch?: number;
}

export interface CompiledSkill {
  id: string;
  goalPattern: string;
  program: Program;
  preconditions: SkillGuard[];
  postconditions: SkillGuard[];
  evidence: string;
  /** `${origin}#${controlFingerprint}` — required for reuse when set. */
  siteKey?: string;
  /** Set after postconditions fail. Consequential reuse is then refused. */
  blocked?: boolean;
}

/** Registrable origin; empty when `url` is not absolute. */
export function registrableOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/** Stable hash of interactive controls (role/name/tag + form fields). */
export function controlFingerprint(obs: ObservationContent): string {
  const parts = [
    ...(obs.elements ?? []).map((e) => `${e.role ?? e.tag}:${e.name ?? ""}:${e.ref}`),
    ...(obs.formFields ?? []).map((f) => `field:${f.type}:${f.name ?? f.label ?? ""}:${f.ref}`),
  ].sort();
  return createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 16);
}

/** H2-C6 site key: origin plus control fingerprint. */
export function siteKey(url: string, obs: ObservationContent): string {
  return `${registrableOrigin(url)}#${controlFingerprint(obs)}`;
}

export function guardsHold(
  obs: ObservationContent,
  url: string,
  guards: SkillGuard[],
  documentEpoch?: number,
): boolean {
  return guards.every((g) => {
    if (g.urlIncludes && !url.includes(g.urlIncludes)) return false;
    if (g.exactOrigin) {
      try {
        if (new URL(url).origin !== g.exactOrigin) return false;
      } catch {
        return false;
      }
    }
    if (g.documentEpoch != null && documentEpoch != null && documentEpoch !== g.documentEpoch) {
      return false;
    }
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
  siteKey?: string;
}): CompiledSkill {
  return {
    id: opts.id,
    goalPattern: opts.goalPattern,
    program: { pageId: opts.pageId, steps: opts.steps },
    preconditions: opts.preconditions,
    postconditions: opts.postconditions,
    evidence: opts.evidence,
    siteKey: opts.siteKey,
  };
}

/**
 * Replace observation refs with role/name locators so a replay binds to the
 * same control on a fresh page. Undefined when any ref has no role+name —
 * such a step cannot be retargeted safely, so the chunk is not a skill.
 */
export function portableSkillSteps(steps: Step[], obs: ObservationContent): Step[] | undefined {
  const out: Step[] = [];
  for (const step of steps) {
    if (!("target" in step) || typeof step.target !== "string" || !/^r\d+$/.test(step.target)) {
      out.push(step);
      continue;
    }
    const el = obs.elements.find((e) => e.ref === step.target);
    if (!el?.role || !el.name || /[\]\n]/.test(el.name)) return undefined;
    out.push({ ...step, target: `role=${el.role}[name=${el.name}]` } as Step);
  }
  return out;
}

export function tryReuseSkill(
  skills: CompiledSkill[],
  goal: string,
  obs: ObservationContent,
  url: string,
  documentEpoch?: number,
): { skill: CompiledSkill; reason: string } | { skipped: string } {
  const match = skills.find((s) => goal.toLowerCase().includes(s.goalPattern.toLowerCase()));
  if (!match) return { skipped: "no skill matched the goal" };
  if (match.blocked) {
    return { skipped: `skill ${match.id} blocked after failed postconditions` };
  }
  if (match.siteKey) {
    const now = siteKey(url, obs);
    if (now !== match.siteKey) {
      return { skipped: `skill ${match.id} siteKey mismatch` };
    }
  }
  if (!guardsHold(obs, url, match.preconditions, documentEpoch)) {
    return { skipped: `skill ${match.id} guards failed` };
  }
  const unbound = rebindSteps(match.program.steps ?? [], obs, match.preconditions)
    .find((st) => "target" in st && typeof st.target === "string" && /^r\d+$/.test(st.target) && !obs.elements.some((e) => e.ref === st.target));
  if (unbound) return { skipped: `skill ${match.id} has a ref that cannot be rebound on this page` };
  return { skill: match, reason: match.evidence };
}

/** Refuse later reuse after a postcondition miss. */
export function markSkillFailed(skill: CompiledSkill): void {
  skill.blocked = true;
}

/** After a reused skill runs, postconditions must still hold or the skill failed closed. */
export function verifySkillPostconditions(
  skill: CompiledSkill,
  obs: ObservationContent,
  url: string,
  documentEpoch?: number,
): boolean {
  if (skill.postconditions.length === 0) return true;
  return guardsHold(obs, url, skill.postconditions, documentEpoch);
}
