import { WorkspaceMemorySchema, AuxError, type WorkspaceMemory } from "@aux/contracts";
import { memoryOrigin } from "@aux/contracts/memory-context";
import type { Repo } from "../store/repo.js";

export function readWorkspaceMemory(repo: Repo, workspaceId: string): WorkspaceMemory {
  if (!repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
    throw new AuxError("not_found", "Workspace does not exist");
  const key = `workspaceMemory:${workspaceId}`;
  const saved = repo.getSetting<unknown>(key);
  const empty: WorkspaceMemory = {
    workspaceId,
    enabled: true,
    excludedOrigins: [],
    items: [],
    content: "",
    revision: 0,
  };
  if (saved === undefined && !repo.hasSetting(key)) return empty;
  const parsed = WorkspaceMemorySchema.safeParse(saved);
  if (!parsed.success || parsed.data.workspaceId !== workspaceId) return { ...empty, enabled: false };
  try {
    if ((parsed.data.excludedOrigins ?? []).some((origin) => memoryOrigin(origin) !== origin))
      return { ...empty, enabled: false };
  } catch {
    return { ...empty, enabled: false };
  }
  return {
    ...parsed.data,
    enabled: parsed.data.enabled !== false,
    excludedOrigins: parsed.data.excludedOrigins ?? [],
    items: parsed.data.items ?? [],
  };
}
