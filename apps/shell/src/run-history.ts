import type { Run } from "@aux/contracts";
import { useStore } from "./store";

/** Adds fetched history runs the store doesn't hold yet. */
export function mergeHistory(history: Run[]) {
  useStore.setState((state) => {
    const known = new Set(state.runs.map((run) => run.runId));
    const added = history.filter((run) => !known.has(run.runId));
    return added.length ? { runs: [...state.runs, ...added] } : state;
  });
}
