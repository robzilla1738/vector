import {
  ConnectorCatalogSchema,
  OutboundMcpToolToggleParams,
  MethodSchemas,
  OutboundMcpRegisterParams,
  type CalendarTaskGrant,
  type ConnectorAccess,
  type ConnectorEntry,
  type OutboundMcpServer,
  type Task,
} from "@aux/contracts";

const calendarId = "71717171-7171-4717-8717-717171717171";
const serverId = "81818181-8181-4818-8818-818181818181";
const calendarScope = "https://www.googleapis.com/auth/calendar.readonly" as const;

/** Interactive, synthetic review state for the browser-only design preview. */
export function connectorFixtures(workspaceId: string, tasks: () => Promise<Task[]>, enabled: boolean) {
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
          state: "active",
          toolsRevision: 1,
          disabledTools: [],
          toolNames: ["search", "summarize"],
          sourceDigest: "a".repeat(64),
          createdAt: now,
          updatedAt: now,
        },
      ]
    : [];
  const toolNames = ["search", "summarize"];
  const discovered = new Map<string, string[]>(enabled ? [[serverId, [...toolNames]]] : []);
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
      ...servers.map((item) => ({
        kind: "mcp" as const,
        connectorId: `mcp:${item.serverId}`,
        serverId: item.serverId,
        label: item.name,
        state: item.state,
        authority: "connected_server" as const,
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
          ...servers
            .filter((item) => item.state === "active")
            .flatMap((item) =>
              (discovered.get(item.serverId) ?? [])
                .filter((name) => !item.disabledTools.includes(name))
                .map((toolName) => ({
                  kind: "mcp" as const,
                  connectorId: `mcp:${item.serverId}`,
                  taskId: task.taskId,
                  taskRevision: task.revision,
                  toolsRevision: item.toolsRevision,
                  toolName,
                  authority: "enabled_mcp_tool" as const,
                })),
            ),
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
        state: "active" as const,
        toolsRevision: 0,
        disabledTools: [],
        toolNames: [],
        sourceDigest: [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      servers = [...servers, item];
      return item;
    },
    "mcp.servers.revoke": async (params: Record<string, unknown>) => {
      const item = server(params.serverId);
      servers = servers.map((current) =>
        current.serverId === item.serverId ? { ...current, state: "revoked" } : current,
      );
      return server(item.serverId);
    },
    "mcp.tools.list": async (params: Record<string, unknown>) => {
      let item = server(params.serverId);
      if (item.state !== "active") throw new Error("Server is disconnected.");
      if (!discovered.has(item.serverId)) {
        discovered.set(item.serverId, [...toolNames]);
        servers = servers.map((current) =>
          current.serverId === item.serverId
            ? { ...current, toolNames: [...toolNames], toolsRevision: current.toolsRevision + 1 }
            : current,
        );
        item = server(item.serverId);
      }
      return toolNames.map((name) => ({
        name,
        description: `${name} synthetic preview notes`,
        inputSchema: {},
        enabled: !item.disabledTools.includes(name),
      }));
    },
    "mcp.tools.setEnabled": async (params: Record<string, unknown>) => {
      const input = OutboundMcpToolToggleParams.parse(params),
        item = server(input.serverId);
      if (item.state !== "active" || !(discovered.get(item.serverId) ?? []).includes(input.toolName))
        throw new Error("Tool is unavailable.");
      if (input.expectedRevision !== item.toolsRevision)
        throw new Error("Tool permissions changed. Refresh the current tools.");
      const disabledTools = input.enabled
        ? item.disabledTools.filter((name) => name !== input.toolName)
        : [...new Set([...item.disabledTools, input.toolName])];
      servers = servers.map((current) =>
        current.serverId === item.serverId
          ? { ...current, disabledTools, toolsRevision: current.toolsRevision + 1, updatedAt: Date.now() }
          : current,
      );
      return server(item.serverId);
    },
    "mcp.tools.call": async (params: Record<string, unknown>) => {
      const input = MethodSchemas["mcp.tools.call"].parse(params),
        item = server(input.serverId);
      if (
        input.context.workspaceId !== item.workspaceId ||
        item.state !== "active" ||
        !(discovered.get(item.serverId) ?? []).includes(input.toolName) ||
        item.disabledTools.includes(input.toolName)
      )
        throw new Error("Tool is unavailable in this Space.");
      if (
        input.context.taskId &&
        !(await tasks()).some(
          (task) =>
            task.taskId === input.context.taskId &&
            task.workspaceId === workspaceId &&
            task.revision === input.context.revision,
        )
      )
        throw new Error("Preview task revision changed.");
      return {
        callId: crypto.randomUUID(),
        status: "completed" as const,
        output: `Synthetic ${input.toolName} result`,
        isError: false,
      };
    },
  };
}
