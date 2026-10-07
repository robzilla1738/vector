import type { Repo } from "@aux/runtime";
import { lineageRuns, runRoot } from "../../apps/runtime/src/services/run-lineage.js";

export function budgetLineage(repo: Repo) {
  return {
    root: (runId: string) => runRoot(repo, runId),
    runLimitUsd: (rootRunId: string) => repo.getRun(rootRunId)?.config?.maxCostUsd,
    descendants: (runId: string) => lineageRuns(repo, runId),
  };
}
