import type { Effect, Step } from "@aux/contracts";

export type EffectClass = Extract<Effect, "read" | "write" | "destructive" | "egress">;

/** User-selected child profiles restrict capability independently of mode policy. */
export function isReadOnlyProfile(profile: "explorer" | "read_only" | "default" | undefined): boolean {
  return profile === "explorer" || profile === "read_only";
}

const WRITE_OPS = new Set([
  "click",
  "dblclick",
  "fill",
  "fillCredential",
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
  "upload",
  "dialog",
  "stop",
]);

const DESTRUCTIVE_OPS = new Set(["evaluate"]);
const EGRESS_OPS = new Set(["navigate", "back", "forward", "reload"]);

/** Write-class ops that only move the viewport or pointer — nothing reaches the site. */
const LOCAL_ONLY_OPS = new Set(["hover", "scroll", "stop"]);

/** Single source of step classification; executor, durable writes and verification derive from it. */
export function classifyStep(op: string): EffectClass {
  if (EGRESS_OPS.has(op)) return "egress";
  if (DESTRUCTIVE_OPS.has(op)) return "destructive";
  if (WRITE_OPS.has(op)) return "write";
  return "read";
}

/** The step can change remote or document state, so its outcome is uncertain until observed. */
export function isConsequential(op: string): boolean {
  return classifyStep(op) !== "read" && !LOCAL_ONLY_OPS.has(op);
}

export function authorizeProfileProgram(steps: Step[], readOnly = false): { ok: true } | { ok: false; denied: string; effect: EffectClass } {
  if (!readOnly) return { ok: true };
  for (const step of steps) {
    const effect = classifyStep(step.op);
    if (effect !== "read") return { ok: false, denied: `The selected read-only profile cannot execute ${step.op}.`, effect };
  }
  return { ok: true };
}
