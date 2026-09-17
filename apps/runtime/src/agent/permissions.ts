/**
 * Privilege-independent permission checks (Gate D). Model text cannot grant.
 */
import type { Step } from "@vector/contracts";

export type EffectClass = "read" | "write" | "destructive" | "egress";

export const DEFAULT_GRANTS = ["effect:read", "effect:write"] as const;

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
  grants: readonly string[] = DEFAULT_GRANTS,
): { ok: true } | { ok: false; denied: string; effect: EffectClass } {
  for (const step of steps) {
    const effect = classifyStep(step.op);
    const needed = `effect:${effect}`;
    if (!grants.includes(needed) && !grants.includes("effect:*")) {
      return { ok: false, denied: `permission denied for ${step.op} (${needed})`, effect };
    }
  }
  return { ok: true };
}
