import type { Run } from "@aux/contracts";

export const TERMINAL_STATUSES: ReadonlySet<Run["status"]> = new Set([
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
  "interrupted",
]);
export const DEFAULT_MAX_STEPS = 0;
