/**
 * Pure coordinator state machine (H2-C1). The RunCoordinator applies these
 * transitions; this module has no I/O.
 */

export const MACHINE_STATES = [
  "idle",
  "observing",
  "planning",
  "authorizing",
  "dispatching",
  "verifying",
  "needs_input",
  "repairing",
  "completed",
  "failed",
] as const;

export type MachineState = (typeof MACHINE_STATES)[number];

export type MachineEvent =
  | { type: "start" }
  | { type: "observed" }
  | { type: "plan"; status: "continue" | "done" | "needs_input" }
  | { type: "authorized"; ok: boolean }
  | { type: "dispatched"; failed: boolean }
  | { type: "verified"; ok: boolean }
  | { type: "answer" }
  | { type: "repair" }
  | { type: "give_up" };

export interface Machine {
  state: MachineState;
  repairs: number;
}

export function initialMachine(): Machine {
  return { state: "idle", repairs: 0 };
}

/** One transition. Unknown pairs leave the machine unchanged. */
export function reduce(m: Machine, ev: MachineEvent): Machine {
  switch (m.state) {
    case "idle":
      if (ev.type === "start") return { ...m, state: "observing" };
      break;
    case "observing":
      if (ev.type === "observed") return { ...m, state: "planning" };
      break;
    case "planning":
      if (ev.type === "plan" && ev.status === "continue") return { ...m, state: "authorizing" };
      if (ev.type === "plan" && ev.status === "done") return { ...m, state: "verifying" };
      if (ev.type === "plan" && ev.status === "needs_input") return { ...m, state: "needs_input" };
      break;
    case "authorizing":
      if (ev.type === "authorized" && ev.ok) return { ...m, state: "dispatching" };
      if (ev.type === "authorized" && !ev.ok) return { ...m, state: "failed" };
      break;
    case "dispatching":
      if (ev.type === "dispatched" && ev.failed) return { ...m, state: "repairing", repairs: m.repairs + 1 };
      if (ev.type === "dispatched" && !ev.failed) return { ...m, state: "observing" };
      break;
    case "verifying":
      if (ev.type === "verified" && ev.ok) return { ...m, state: "completed" };
      if (ev.type === "verified" && !ev.ok) return { ...m, state: "repairing", repairs: m.repairs + 1 };
      break;
    case "needs_input":
      if (ev.type === "answer") return { ...m, state: "observing" };
      break;
    case "repairing":
      if (ev.type === "repair") return { ...m, state: "planning" };
      if (ev.type === "give_up") return { ...m, state: "failed" };
      break;
    default:
      break;
  }
  return m;
}
