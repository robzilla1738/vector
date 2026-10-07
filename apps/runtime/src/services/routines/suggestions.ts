import { TaskSchema, type RoutineCandidate } from "@aux/contracts";
import type { Repo } from "../../store/repo.js";

/** Bounded local evidence scan. Task context is decrypted only through Repo. */
export function scanRoutineCandidates(repo: Repo, workspaceId: string, limit = 5): RoutineCandidate[] {
  const tasks = repo.db
    .prepare(
      "SELECT json FROM tasks WHERE workspace_id=? AND state='open' ORDER BY updated_at DESC LIMIT 200",
    )
    .all(workspaceId) as { json: string }[];
  const existing = new Set(
    (
      repo.db
        .prepare(
          "SELECT json_extract(json,'$.sourceTaskId') AS task_id FROM routines WHERE workspace_id=? AND archived_at IS NULL",
        )
        .all(workspaceId) as { task_id: string | null }[]
    ).map((row) => row.task_id),
  );
  const eligible = new Map(
    tasks
      .map((row) => TaskSchema.parse(JSON.parse(row.json)))
      .filter((task) => !existing.has(task.taskId))
      .map((task) => [task.taskId, task]),
  );
  const rows = repo.db
    .prepare(
      "SELECT r.run_id FROM runs r JOIN run_lookup l ON l.run_id=r.run_id WHERE r.status='completed' AND json_extract(l.config,'$.contextWorkspaceId')=? ORDER BY coalesce(r.ended_at,r.created_at) DESC,r.run_id LIMIT 500",
    )
    .all(workspaceId) as { run_id: string }[];
  const groups = new Map<string, RoutineCandidate>();
  for (const row of rows) {
    const run = repo.getRun(row.run_id);
    const taskId = run?.config?.taskId;
    const task = taskId ? eligible.get(taskId) : undefined;
    if (
      !run ||
      !task ||
      run.config?.taskRevision !== task.revision ||
      run.config?.contextWorkspaceId !== workspaceId
    )
      continue;
    const existing = groups.get(task.taskId);
    if (existing) existing.completedRuns++;
    else
      groups.set(task.taskId, {
        taskId: task.taskId,
        taskRevision: task.revision,
        runId: run.runId,
        title: task.title,
        objective: task.objective,
        completedRuns: 1,
        lastCompletedAt: run.endedAt ?? run.createdAt,
      });
  }
  return [...groups.values()]
    .filter((candidate) => candidate.completedRuns >= 3)
    .sort(
      (a, b) =>
        b.completedRuns - a.completedRuns ||
        b.lastCompletedAt - a.lastCompletedAt ||
        a.taskId.localeCompare(b.taskId),
    )
    .slice(0, Math.min(20, Math.max(1, limit)));
}
