import type { Repo } from "../store/repo.js";
import { withRunDispatchMutation } from "./overnight-authority.js";

/** Recover durable run state without constructing the agent execution graph. */
export async function markInterruptedRuns(repo: Repo): Promise<void> {
  for (const run of repo.listRuns(200)) {
    if (!["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) continue;
    await withRunDispatchMutation(
      repo,
      async () => {
        const current = repo.getRun(run.runId);
        if (!current || !["queued", "planning", "running", "paused", "needs_input"].includes(current.status))
          return;
        current.status = "interrupted";
        current.endedAt = Date.now();
        repo.saveRun(current);
      },
      run.runId,
    );
  }
}
