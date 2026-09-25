import {
  ConnectorCatalogSchema,
  OutboundMcpGrantParams,
  OutboundMcpRegisterParams,
  type CalendarTaskGrant,
  type ConnectorAccess,
  type ConnectorEntry,
  type OutboundMcpGrant,
  type OutboundMcpServer,
  type Task,
} from "@aux/contracts";

const calendarId = "71717171-7171-4717-8717-717171717171";
const serverId = "81818181-8181-4818-8818-818181818181";
const calendarScope = "https://www.googleapis.com/auth/calendar.readonly" as const;

/** Interactive, synthetic review state for the browser-only design preview. */
export function connectorFixtures(
  workspaceId: string,
  tasks: () => Promise<Task[]>,
  enabled: boolean,
  githubConnected: () => boolean = () => enabled,
) {
  const now = Date.now();
  let calendarConnected = enabled;
  let grants: CalendarTaskGrant[] = [];
  let servers: OutboundMcpServer[] = enabled
    ? [
        {
          serverId,
          workspaceId,
          name: "Research tools",
          source: { kind: "remote", url: "https://tools.example.test/mcp", auth: "none" },
          state: "approved",
          sourceDigest: "a".repeat(64),
          createdAt: now,
          updatedAt: now,
        },
      ]
    : [];
  let tools: OutboundMcpGrant[] = enabled
    ? [
        {
          grantId: "91919191-9191-4919-8919-919191919191",
          serverId,
          toolName: "search",
          scope: { kind: "workspace", workspaceId },
          mode: "standing",
          outputTokenLimit: 2000,
          createdAt: now,
        },
      ]
    : [];
  const account = {
    connectionId: calendarId,
    provider: "google" as const,
    accountKey: "team@example.test",
    label: "Team Calendar",
    scopes: [calendarScope],
    state: "active" as const,
    createdAt: now,
    updatedAt: now,
  };
  const server = (id: unknown) => {
    const found = servers.find((item) => item.serverId === id);
    if (!found) throw new Error("Preview server is unavailable.");
    return found;
  };
  const catalog = async (params: Record<string, unknown>) => {
    if (params.workspaceId !== workspaceId) throw new Error("Preview Space is unavailable.");
    const task = (await tasks()).find(
      (item) => item.taskId === params.taskId && item.revision === params.expectedRevision,
    );
    if (params.taskId && !task) throw new Error("Preview task revision changed.");
    const entries: ConnectorEntry[] = [
      ...(calendarConnected
        ? [
            {
              kind: "calendar" as const,
              connectorId: `calendar:${calendarId}`,
              connectionId: calendarId,
              label: account.label,
              accountKey: account.accountKey,
              state: "active" as const,
              authority: "calendar_account" as const,
            },
          ]
        : []),
      {
        kind: "github",
        connectorId: "github",
        label: "GitHub",
        ...(githubConnected() ? { account: "reviewer" } : {}),
        state: githubConnected() ? "checked" : "disconnected",
        authority: "saved_credential_and_task_project",
      },
      ...servers.map((item) => ({
        kind: "mcp" as const,
        connectorId: `mcp:${item.serverId}`,
        serverId: item.serverId,
        label: item.name,
        state: item.state,
        authority: "reviewed_server_and_tool_grant" as const,
      })),
    ] as ConnectorEntry[];
    const access: ConnectorAccess[] = task
      ? [
          ...grants
            .filter(
              (item) =>
                item.taskId === task.taskId && item.taskRevision === task.revision && calendarConnected,
            )
            .map((item) => ({
              kind: "calendar" as const,
              connectorId: `calendar:${calendarId}`,
              taskId: task.taskId,
              taskRevision: task.revision,
              grantId: item.grantId,
              authority: "calendar_task_grant" as const,
            })),
          ...(githubConnected()
            ? task.resources
                .filter((item) => item.kind === "repository" && item.projectId && item.access !== "reference")
                .map((item) => ({
                  kind: "github" as const,
                  connectorId: "github" as const,
                  taskId: task.taskId,
                  taskRevision: task.revision,
                  projectId: item.projectId!,
                  authority: "task_project_resource" as const,
                }))
            : []),
          ...tools
            .filter(
              (item) =>
                !item.revokedAt &&
                !item.consumedAt &&
                server(item.serverId).state === "approved" &&
                (item.scope.kind === "workspace"
                  ? item.scope.workspaceId === workspaceId
                  : item.scope.taskId === task.taskId && item.scope.revision === task.revision),
            )
            .map((item) => ({
              kind: "mcp" as const,
              connectorId: `mcp:${item.serverId}`,
              taskId: task.taskId,
              taskRevision: task.revision,
              grantId: item.grantId,
              toolName: item.toolName,
              scope: item.scope.kind,
              authority: "mcp_tool_grant" as const,
            })),
        ]
      : [];
    return ConnectorCatalogSchema.parse({ entries, access });
  };
  return {
    "connectors.catalog": catalog,
    "calendar.connections.list": async () => ({
      available: true,
      connections: calendarConnected ? [account] : [],
    }),
    "calendar.auth.start": async () => {
      throw new Error("Google sign-in requires the Aux desktop app.");
    },
    "calendar.connections.revoke": async (params: Record<string, unknown>) => {
      if (!calendarConnected || params.connectionId !== calendarId)
        throw new Error("Preview Calendar account is unavailable.");
      calendarConnected = false;
      grants = [];
      return { ok: true, providerRevocation: "confirmed" };
    },
    "calendar.events.list": async (params: Record<string, unknown>) => {
      if (!calendarConnected || params.connectionId !== calendarId)
        throw new Error("Preview Calendar account is unavailable.");
      return { events: [], fetchedAt: Date.now() };
    },
    "calendar.taskEvents.list": async (params: Record<string, unknown>) => {
      const task = (await tasks()).find((item) => item.taskId === params.taskId);
      if (
        !calendarConnected ||
        !task ||
        !grants.some(
          (item) =>
            item.taskId === task.taskId &&
            item.taskRevision === task.revision &&
            item.grantId === params.grantId,
        )
      )
        throw new Error("Preview Calendar grant is unavailable.");
      return { events: [], fetchedAt: Date.now() };
    },
    "calendar.taskGrants.list": async (params: Record<string, unknown>) =>
      grants.filter((item) => item.taskId === params.taskId),
    "calendar.taskGrants.create": async (params: Record<string, unknown>) => {
      const task = (await tasks()).find(
        (item) => item.taskId === params.taskId && item.revision === params.expectedRevision,
      );
      if (!task || !calendarConnected || params.connectionId !== calendarId)
        throw new Error("Preview task or Calendar account changed.");
      const existing = grants.find(
        (item) => item.taskId === task.taskId && item.taskRevision === task.revision,
      );
      if (existing) return existing;
      const grant = {
        grantId: crypto.randomUUID(),
        taskId: task.taskId,
        taskRevision: task.revision,
        connectionId: calendarId,
        accountKey: account.accountKey,
        label: account.label,
        createdAt: Date.now(),
      };
      grants = [...grants, grant];
      return grant;
    },
    "calendar.taskGrants.revoke": async (params: Record<string, unknown>) => {
      if (!grants.some((item) => item.grantId === params.grantId && item.taskId === params.taskId))
        throw new Error("Preview Calendar grant is unavailable.");
      grants = grants.filter((item) => item.grantId !== params.grantId || item.taskId !== params.taskId);
      return { ok: true };
    },
    "mcp.bundles.inspect": async (params: Record<string, unknown>) => {
      const path = String(params.path);
      const format = path.toLowerCase().endsWith(".dxt")
        ? "dxt"
        : path.toLowerCase().endsWith(".mcpb")
          ? "mcpb"
          : null;
      if (!format) throw new Error("Choose a .mcpb or .dxt bundle.");
      return {
        path,
        sha256: "b".repeat(64),
        format,
        name: "Research bundle",
        server: { type: "node", entry_point: "server.js" },
      };
    },
    "mcp.servers.list": async (params: Record<string, unknown>) =>
      servers.filter((item) => item.workspaceId === params.workspaceId),
    "mcp.servers.register": async (params: Record<string, unknown>) => {
      const input = OutboundMcpRegisterParams.parse(params);
      if (input.workspaceId !== workspaceId) throw new Error("Preview Space is unavailable.");
      if (input.source.kind === "bundle")
        throw new Error("Bundle installation requires the Aux desktop app.");
      const bytes = new TextEncoder().encode(JSON.stringify(input.source));
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const item = {
        serverId: crypto.randomUUID(),
        workspaceId,
        name: input.name,
        source: input.source,
        state: "pending" as const,
        sourceDigest: [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      servers = [...servers, item];
      return item;
    },
    "mcp.servers.approve": async (params: Record<string, unknown>) => {
      const item = server(params.serverId);
      if (item.sourceDigest !== params.expectedDigest) throw new Error("Server source changed.");
      servers = servers.map((current) =>
        current.serverId === item.serverId ? { ...current, state: "approved" } : current,
      );
      return server(item.serverId);
    },
    "mcp.servers.revoke": async (params: Record<string, unknown>) => {
      const item = server(params.serverId);
      servers = servers.map((current) =>
        current.serverId === item.serverId ? { ...current, state: "revoked" } : current,
      );
      tools = tools.map((current) =>
        current.serverId === item.serverId ? { ...current, revokedAt: Date.now() } : current,
      );
      return server(item.serverId);
    },
    "mcp.tools.list": async (params: Record<string, unknown>) => {
      if (server(params.serverId).state !== "approved")
        throw new Error("Approve the server before loading tools.");
      return [
        { name: "search", description: "Search synthetic preview notes", inputSchema: {} },
        { name: "summarize", description: "Summarize a synthetic preview note", inputSchema: {} },
      ];
    },
    "mcp.grants.list": async (params: Record<string, unknown>) =>
      tools.filter((item) => item.serverId === params.serverId),
    "mcp.grants.create": async (params: Record<string, unknown>) => {
      const input = OutboundMcpGrantParams.parse(params);
      const item = server(input.serverId);
      if (item.state !== "approved") throw new Error("Approve the server before granting tools.");
      if (input.toolName !== "search" && input.toolName !== "summarize")
        throw new Error("Tool is unavailable on this mock server.");
      if (input.scope.kind === "workspace" && input.scope.workspaceId !== workspaceId)
        throw new Error("Preview Space is unavailable.");
      if (input.scope.kind === "task") {
        const scope = input.scope;
        if (
          !(await tasks()).some(
            (task) =>
              task.taskId === scope.taskId &&
              task.revision === scope.revision &&
              task.workspaceId === workspaceId,
          )
        )
          throw new Error("Preview task revision changed.");
      }
      const grant = {
        grantId: crypto.randomUUID(),
        serverId: item.serverId,
        toolName: input.toolName,
        scope: input.scope,
        mode: input.mode,
        outputTokenLimit: input.outputTokenLimit,
        createdAt: Date.now(),
      };
      tools = [...tools, grant];
      return grant;
    },
    "mcp.grants.revoke": async (params: Record<string, unknown>) => {
      tools = tools.map((item) =>
        item.grantId === params.grantId ? { ...item, revokedAt: Date.now() } : item,
      );
      const grant = tools.find((item) => item.grantId === params.grantId);
      if (!grant) throw new Error("Preview grant is unavailable.");
      return grant;
    },
  };
}
