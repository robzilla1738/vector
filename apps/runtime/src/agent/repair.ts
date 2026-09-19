/**
 * Repair taxonomy (H2-C3). Each failure class has its own budget so a
 * stale-ref storm cannot burn the same counter as a permission denial.
 */
import { VectorError } from "@vector/contracts";

export const REPAIR_CLASSES = ["stale", "timeout", "miss", "model", "auth", "generic"] as const;
export type RepairClass = (typeof REPAIR_CLASSES)[number];

/** Attempts allowed in that class before the run gives up. Auth never auto-repairs. */
export const REPAIR_BUDGETS: Readonly<Record<RepairClass, number>> = {
  stale: 4,
  timeout: 3,
  miss: 3,
  model: 2,
  auth: 0,
  generic: 3,
};

export interface RepairState {
  counts: Record<RepairClass, number>;
}

export function emptyRepairState(): RepairState {
  return { counts: { stale: 0, timeout: 0, miss: 0, model: 0, auth: 0, generic: 0 } };
}

export function classifyRepair(error: unknown): RepairClass {
  const code = error instanceof VectorError ? error.code : "";
  const message = typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : "";
  const text = `${code} ${message}`.toLowerCase();

  if (
    text.includes("ref_stale") ||
    text.includes("target_detached") ||
    text.includes("stale ref") ||
    text.includes("document epoch") ||
    text.includes("generation mismatch")
  ) {
    return "stale";
  }
  if (
    text.includes("condition_timeout") ||
    text.includes("deadline exceeded") ||
    /\btimeout\b/.test(text)
  ) {
    return "timeout";
  }
  if (
    text.includes("permission_denied") ||
    text.includes("needs_input") ||
    /\bdenied\b/.test(text)
  ) {
    return "auth";
  }
  if (text.includes("model_error") || text.includes("model_output_invalid")) {
    return "model";
  }
  if (
    text.includes("target_ambiguous") ||
    text.includes("locator not found") ||
    text.includes("not found") ||
    text.includes("occluded") ||
    text.includes("offscreen") ||
    text.includes("not visible") ||
    text.includes("no such element")
  ) {
    return "miss";
  }
  return "generic";
}

export interface RepairDecision {
  allowed: boolean;
  /** True on the last budgeted attempt for this class — fire the recovery model. */
  recover: boolean;
  klass: RepairClass;
  used: number;
  budget: number;
}

/** Increment the class counter and decide whether to keep repairing. */
export function noteRepair(state: RepairState, error: unknown): RepairDecision {
  const klass = classifyRepair(error);
  state.counts[klass] += 1;
  const used = state.counts[klass];
  const budget = REPAIR_BUDGETS[klass];
  return {
    allowed: used <= budget,
    recover: used === budget && budget > 0,
    klass,
    used,
    budget,
  };
}
