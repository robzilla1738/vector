import type { Repo } from "../store/repo.js";
import type { RunService } from "./runs.js";

/** Stop or gate automated work when a person takes control of its tab. */
export async function handlePageTakeover(
  pageId: string,
  controller: string,
  repo: Repo,
  runs: Pick<
    RunService,
    "cancel" | "pauseForTakeover" | "resumeAfterTakeover" | "interruptProgramForTakeover"
  >,
  originalRunId?: string,
): Promise<void> {
  if (controller !== "human" && controller !== "none") return;
  const active = repo.db
    .prepare(
      "SELECT run_id AS runId FROM runs WHERE status IN ('queued','planning','running','paused','needs_input')",
    )
    .all() as { runId: string }[];
  for (const { runId } of active) {
    if (originalRunId && runId !== originalRunId) continue;
    const run = repo.getRun(runId);
    if (!run) continue;
    const runPage = originalRunId === runId || run.pageIds.includes(pageId);
    const setPage =
      !!run.setId &&
      repo
        .listMembers(run.setId)
        .some(
          (member) => member.pageId === pageId && (member.status === "queued" || member.status === "running"),
        );
    if (controller === "human") {
      if (setPage && (run.status === "running" || run.status === "paused"))
        await runs.cancel(
          runId,
          "A person took control of a set member tab. Review the set before retrying.",
        );
      else if (runPage && run.config?.implementation === "program")
        await runs.interruptProgramForTakeover(runId, pageId);
      else if (runPage) await runs.pauseForTakeover(runId);
    } else if (runPage) {
      await runs.resumeAfterTakeover(runId, pageId);
    }
  }
}
