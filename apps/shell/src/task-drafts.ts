export type TaskDraft = { title: string; objective: string; criteria: string; baseRevision: number | null };
const prefix = "aux.task-draft.v1:";
const selectionKey = "aux.task-selection.v1";
export const taskDraftKey = (workspaceId: string, taskId?: string) =>
  `${prefix}${workspaceId}:${taskId ?? "new"}`;
export function readTaskDraft(key: string): TaskDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      !value ||
      typeof value.title !== "string" ||
      typeof value.objective !== "string" ||
      typeof value.criteria !== "string" ||
      !(value.baseRevision === null || Number.isInteger(value.baseRevision))
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function writeTaskDraft(key: string, draft: TaskDraft | null) {
  if (draft) localStorage.setItem(key, JSON.stringify(draft));
  else localStorage.removeItem(key);
}
export function readTaskSelection(): { workspaceId?: string; tasks: Record<string, string | null> } {
  try {
    const value = JSON.parse(localStorage.getItem(selectionKey) ?? "{}");
    return {
      workspaceId: typeof value.workspaceId === "string" ? value.workspaceId : undefined,
      tasks: Object.fromEntries(
        Object.entries(value.tasks ?? {}).filter(([, id]) => id === null || typeof id === "string"),
      ) as Record<string, string | null>,
    };
  } catch {
    return { tasks: {} };
  }
}
export function rememberTask(workspaceId: string, taskId: string | null) {
  const previous = readTaskSelection();
  localStorage.setItem(
    selectionKey,
    JSON.stringify({ workspaceId, tasks: { ...previous.tasks, [workspaceId]: taskId } }),
  );
}
