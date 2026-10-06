import { WorkspaceMemoryItemSchema, AuxError, type WorkspaceMemory } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

export function readWorkspaceMemory(repo: Repo, workspaceId: string): WorkspaceMemory {
  if (!repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
    throw new AuxError("not_found", "Workspace does not exist");
  const saved = repo.getSetting<Partial<WorkspaceMemory>>(`workspaceMemory:${workspaceId}`);
  return {
    workspaceId,
    excludedOrigins: Array.isArray(saved?.excludedOrigins) ? saved.excludedOrigins.slice(0, 100) : [],
    enabled: saved?.enabled !== false,
    items: (Array.isArray(saved?.items) ? saved.items : [])
      .flatMap((item) => {
        const parsed = WorkspaceMemoryItemSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
      .slice(0, 40),
    content: typeof saved?.content === "string" ? saved.content.slice(0, 16_000) : "",
    revision: Number.isInteger(saved?.revision) && saved!.revision! >= 0 ? saved!.revision! : 0,
    ...(typeof saved?.updatedAt === "number" ? { updatedAt: saved.updatedAt } : {}),
  };
}
