/**
 * Privilege-independent permission checks (Gate D). Model text cannot grant.
 */
import type { Step } from "@vector/contracts";

export type EffectClass = "read" | "write" | "destructive" | "egress";

export const DEFAULT_GRANTS = ["effect:read"] as const;
export const ALL_EFFECT_GRANTS = ["effect:read", "effect:write", "effect:destructive", "effect:egress"] as const;

export const KNOWN_GRANTS = ["effect:read", "effect:write", "effect:destructive", "effect:egress", "effect:*"] as const;

export type GrantSource = readonly string[] | (() => readonly string[]);

/** Settings / PageService / coordinator share one grant list. Functions re-read after settings.set. */
export function resolveGrants(grants?: GrantSource): readonly string[] {
  if (typeof grants === "function") return grants();
  return grants ?? DEFAULT_GRANTS;
}

export function sanitizeGrants(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_GRANTS];
  const cleaned = raw.filter((x): x is string => typeof x === "string" && (KNOWN_GRANTS as readonly string[]).includes(x));
  if (!cleaned.includes("effect:read") && !cleaned.includes("effect:*")) cleaned.unshift("effect:read");
  return cleaned.length ? cleaned : [...DEFAULT_GRANTS];
}

const WRITE_OPS = new Set([
  "click",
  "dblclick",
  "fill",
  "type",
  "press",
  "select",
  "check",
  "uncheck",
  "navigate",
  "submit",
  "hover",
  "scroll",
  "dragTo",
  "clickPoint",
]);

const DESTRUCTIVE_OPS = new Set(["evaluate"]);

export function classifyStep(op: string): EffectClass {
  if (op === "navigate") return "egress";
  if (DESTRUCTIVE_OPS.has(op)) return "destructive";
  if (WRITE_OPS.has(op)) return "write";
  return "read";
}

export function authorizeProgram(
  steps: Step[],
  grants: GrantSource = DEFAULT_GRANTS,
): { ok: true } | { ok: false; denied: string; effect: EffectClass } {
  const allowed = resolveGrants(grants);
  for (const step of steps) {
    const effect = classifyStep(step.op);
    const needed = `effect:${effect}`;
    if (!allowed.includes(needed) && !allowed.includes("effect:*")) {
      return { ok: false, denied: `permission denied for ${step.op} (${needed})`, effect };
    }
  }
  return { ok: true };
}
