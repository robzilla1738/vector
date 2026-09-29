import type { Repo } from "../store/repo.js";
import type { RunService } from "./runs.js";

/** Stop or gate automated work when a person takes control of its tab. */
export function handlePageTakeover(
  pageId: string,
  controller: string,
  repo: Repo,
  runs: Pick<RunService, "cancel" | "pauseForTakeover" | "resumeAfterTakeover" | "interruptProgramForTakeover">,
): void {
  if (controller !== "human" && controller !== "none") return;
  const active = repo.db.prepare("SELECT run_id AS runId FROM runs WHERE status IN ('queued','planning','running','paused','needs_input')").all() as { runId: string }[];
  for (const { runId } of active) {
    const run = repo.getRun(runId);
    if (!run) continue;
    const runPage = run.pageIds.includes(pageId);
    const setPage = !!run.setId && repo.listMembers(run.setId).some(member =>
      member.pageId === pageId && (member.status === "queued" || member.status === "running"));
    if (controller === "human") {
      if (setPage && (run.status === "running" || run.status === "paused"))
        runs.cancel(runId, "A person took control of a set member tab. Review the set before retrying.");
      else if (runPage && run.config?.implementation === "program") runs.interruptProgramForTakeover(runId, pageId);
      else if (runPage) runs.pauseForTakeover(runId);
    } else if (runPage) {
      runs.resumeAfterTakeover(runId, pageId);
    }
  }
}
