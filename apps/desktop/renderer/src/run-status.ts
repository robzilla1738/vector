import type { Run } from "@vector/contracts";

export const STATUS_LABEL: Record<Run["status"], string> = {
  queued: "Queued",
  planning: "Planning",
  running: "Working",
  paused: "Paused",
  needs_input: "Needs your answer",
  completed: "Done",
  partially_completed: "Partly done",
  failed: "Failed",
  cancelled: "Cancelled",
  interrupted: "Interrupted",
};
