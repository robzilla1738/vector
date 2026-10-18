import { createHash } from "node:crypto";
import {
  AuxError,
  connectorAuthorityInput,
  ConnectorCatalogSchema,
  type ConnectorCatalog,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { CalendarConnectionService } from "./calendar-connections.js";
import type { OutboundMcpService } from "./outbound-mcp.js";
import type { SettingsService } from "./settings.js";
import type { TaskService } from "./tasks.js";

/** A review surface over existing provider authorities. It creates no independent grants. */
export class ConnectorCatalogService {
  constructor(
    private deps: {
      repo: Repo;
      tasks: TaskService;
      settings: SettingsService;
      calendar?: CalendarConnectionService;
      xAccounts?: import("./x-accounts.js").XAccountService;
      xGrants?: import("./x-grants.js").XGrantService;
      googleAccounts?: import("./google-accounts.js").GoogleAccountService;
      googleGrants?: import("./google-grants.js").GoogleGrantService;
      mcp: OutboundMcpService;
    },
  ) {}

  list(input: { workspaceId: string; taskId?: string; expectedRevision?: number }): ConnectorCatalog {
    const { workspaceId, taskId, expectedRevision } = input;
    if (!this.deps.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Space does not exist.");
    if ((taskId === undefined) !== (expectedRevision === undefined))
      throw new AuxError("invalid_params", "Task and revision must be supplied together.");
    const task = taskId ? this.deps.tasks.get(taskId) : undefined;
    if (
      task &&
      (task.workspaceId !== workspaceId || task.revision !== expectedRevision || task.state !== "open")
    )
      throw new AuxError("conflict", "This task is outside the current Space or revision.");

    const calendar = this.deps.calendar?.list().connections ?? [];
    const servers = this.deps.mcp.list(workspaceId);
    const google =
      this.deps.googleAccounts
        ?.list()
        .connections.filter((account) =>
          account.scopes.some((scope) => !scope.endsWith("calendar.readonly")),
        ) ?? [];
    const x = this.deps.xAccounts?.list().connections ?? [];
    const entries = [
      ...x.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...account }) => ({
        ...account,
        kind: "x" as const,
        connectorId: `x:${account.connectionId}`,
        authority: "x_account" as const,
      })),
      ...google.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...account }) => ({
        ...account,
        kind: "google" as const,
        connectorId: `google:${account.connectionId}`,
        authority: "google_account" as const,
      })),
      ...calendar.map((connection) => ({
        kind: "calendar" as const,
        connectorId: `calendar:${connection.connectionId}`,
        connectionId: connection.connectionId,
        label: connection.label,
        accountKey: connection.accountKey,
        revision: this.deps.calendar!.connectionRevision(connection.connectionId),
        state: connection.state,
        authority: "calendar_account" as const,
      })),
      ...servers.map((server) => ({
        kind: "mcp" as const,
        connectorId: `mcp:${server.serverId}`,
        serverId: server.serverId,
        sourceDigest: server.sourceDigest,
        toolsRevision: server.toolsRevision,
        label: server.name,
        state: server.state,
        authority: "connected_server" as const,
      })),
    ];
    const access: ConnectorCatalog["access"] = [];
    if (task) {
      const activeCalendars = new Set(
        calendar
          .filter((connection) => connection.state === "active")
          .map((connection) => connection.connectionId),
      );
      for (const grant of this.deps.calendar?.taskGrants(task.taskId) ?? []) {
        if (grant.taskRevision === task.revision && activeCalendars.has(grant.connectionId))
          access.push({
            kind: "calendar",
            connectorId: `calendar:${grant.connectionId}`,
            taskId: task.taskId,
            taskRevision: task.revision,
            grantId: grant.grantId,
            authority: "calendar_task_grant",
          });
      }
      for (const grant of this.deps.xGrants?.list(task.taskId) ?? []) {
        const account = x.find(
          (account) =>
            account.connectionId === grant.connectionId && account.revision === grant.accountRevision,
        );
        const operations = grant.operations.filter((operation) => account?.operations.includes(operation));
        if (grant.taskRevision === task.revision && operations.length)
          access.push({
            kind: "x",
            connectorId: `x:${grant.connectionId}`,
            taskId: task.taskId,
            taskRevision: task.revision,
            grantId: grant.grantId,
            operations,
            authority: "x_task_grant",
          });
      }
      for (const grant of this.deps.googleGrants?.list(task.taskId) ?? []) {
        const account = google.find(
          (account) =>
            account.connectionId === grant.connectionId && account.revision === grant.accountRevision,
        );
        const operations = grant.operations.filter((operation) => account?.operations.includes(operation));
        if (grant.taskRevision === task.revision && operations.length)
          access.push({
            kind: "google",
            connectorId: `google:${grant.connectionId}`,
            taskId: task.taskId,
            taskRevision: task.revision,
            grantId: grant.grantId,
            operations,
            authority: "google_task_grant",
          });
      }
      for (const server of servers) {
        if (server.state !== "active") continue;
        for (const toolName of server.toolNames) {
          if (server.disabledTools.includes(toolName)) continue;
          access.push({
            kind: "mcp",
            connectorId: `mcp:${server.serverId}`,
            taskId: task.taskId,
            taskRevision: task.revision,
            toolsRevision: server.toolsRevision,
            toolName,
            authority: "enabled_mcp_tool",
          });
        }
      }
    }
    const bindings = Object.fromEntries(
      entries.map((entry) => [
        entry.connectorId,
        createHash("sha256")
          .update(connectorAuthorityInput(entry, access, input))
          .digest("hex"),
      ]),
    );
    return ConnectorCatalogSchema.parse({ entries, access, bindings });
  }
}
