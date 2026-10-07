import { RoutineSchema, type Routine, type RoutineRun } from "@aux/contracts";
export function parseRoutine(row: {
  json: string;
  revision: number;
  paused: number;
  archived_at: number | null;
  updated_at: number;
  routine_id: string;
  workspace_id: string;
}): Routine {
  const body = JSON.parse(row.json) as Omit<
    Routine,
    "routineId" | "revision" | "updatedAt" | "paused" | "archivedAt"
  >;
  return RoutineSchema.parse({
    ...body,
    routineId: row.routine_id,
    workspaceId: row.workspace_id,
    revision: row.revision,
    paused: row.paused === 1,
    archivedAt: row.archived_at ?? undefined,
    updatedAt: row.updated_at,
  });
}

export function parseRun(row: Record<string, unknown>): RoutineRun {
  return {
    routineRunId: String(row.routine_run_id),
    routineId: String(row.routine_id),
    revision: Number(row.revision),
    occurrenceId: row.occurrence_id ? String(row.occurrence_id) : undefined,
    occurrenceIdentity: row.occurrence_identity ? String(row.occurrence_identity) : undefined,
    triggerPageId: row.trigger_page_id ? String(row.trigger_page_id) : undefined,
    triggerDocumentEpoch: row.trigger_document_epoch == null ? undefined : Number(row.trigger_document_epoch),
    status: row.status as RoutineRun["status"],
    reason: row.reason ? String(row.reason) : undefined,
    chatId: row.chat_id ? String(row.chat_id) : undefined,
    runId: row.run_id ? String(row.run_id) : undefined,
    parameters: row.parameters ? (JSON.parse(String(row.parameters)) as Record<string, string>) : {},
    startedAt: row.started_at == null ? undefined : Number(row.started_at),
    endedAt: row.ended_at == null ? undefined : Number(row.ended_at),
    createdAt: Number(row.created_at),
  };
}
