import { AuxError, ConnectorCatalogSchema, type ConnectorCatalog } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { CalendarConnectionService } from "./calendar-connections.js";
import type { OutboundMcpService } from "./outbound-mcp.js";
import type { SettingsService } from "./settings.js";
import type { TaskService } from "./tasks.js";

/** A review surface over existing provider authorities. It creates no independent grants. */
export class ConnectorCatalogService {
  constructor(private deps: { repo: Repo; tasks: TaskService; settings: SettingsService;
    calendar?: CalendarConnectionService; mcp: OutboundMcpService }) {}

  list(input: { workspaceId: string; taskId?: string; expectedRevision?: number }): ConnectorCatalog {
    const { workspaceId, taskId, expectedRevision } = input;
    if (!this.deps.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Space does not exist.");
    if ((taskId === undefined) !== (expectedRevision === undefined))
      throw new AuxError("invalid_params", "Task and revision must be supplied together.");
    const task = taskId ? this.deps.tasks.get(taskId) : undefined;
    if (task && (task.workspaceId !== workspaceId || task.revision !== expectedRevision || task.state !== "open"))
      throw new AuxError("conflict", "This task is outside the current Space or revision.");

    const calendar = this.deps.calendar?.list().connections ?? [];
    const github = this.deps.settings.githubConnector();
    const servers = this.deps.mcp.list(workspaceId);
    const entries = [
      ...calendar.map(connection => ({ kind: "calendar" as const, connectorId: `calendar:${connection.connectionId}`,
        connectionId: connection.connectionId, label: connection.label, accountKey: connection.accountKey,
        state: connection.state, authority: "calendar_account" as const })),
      { kind: "github" as const, connectorId: "github" as const, label: "GitHub",
        ...(github.account ? { account: github.account } : {}), state: github.connected ? "connected" as const : "disconnected" as const,
        authority: "saved_credential_and_task_project" as const },
      ...servers.map(server => ({ kind: "mcp" as const, connectorId: `mcp:${server.serverId}`,
        serverId: server.serverId, label: server.name, state: server.state,
        authority: "reviewed_server_and_tool_grant" as const })),
    ];
    const access: ConnectorCatalog["access"] = [];
    if (task) {
      const activeCalendars = new Set(calendar.filter(connection => connection.state === "active").map(connection => connection.connectionId));
      for (const grant of this.deps.calendar?.taskGrants(task.taskId) ?? []) {
        if (grant.taskRevision === task.revision && activeCalendars.has(grant.connectionId))
          access.push({ kind: "calendar", connectorId: `calendar:${grant.connectionId}`, taskId: task.taskId,
            taskRevision: task.revision, grantId: grant.grantId, authority: "calendar_task_grant" });
      }
      if (github.connected) for (const resource of task.resources) {
        if (resource.kind === "repository" && resource.projectId && resource.access !== "reference")
          access.push({ kind: "github", connectorId: "github", taskId: task.taskId,
            taskRevision: task.revision, projectId: resource.projectId, authority: "task_project_resource" });
      }
      for (const server of servers) {
        if (server.state !== "approved") continue;
        for (const grant of this.deps.mcp.grants(server.serverId)) {
          if (grant.revokedAt !== undefined || grant.consumedAt !== undefined) continue;
          if (grant.scope.kind === "task" && (grant.scope.taskId !== task.taskId || grant.scope.revision !== task.revision)) continue;
          if (grant.scope.kind === "workspace" && grant.scope.workspaceId !== workspaceId) continue;
          access.push({ kind: "mcp", connectorId: `mcp:${server.serverId}`, taskId: task.taskId,
            taskRevision: task.revision, grantId: grant.grantId, toolName: grant.toolName, authority: "mcp_tool_grant" });
        }
      }
    }
    return ConnectorCatalogSchema.parse({ entries, access });
  }
}
