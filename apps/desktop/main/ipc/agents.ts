import { app } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { detectAgentClients } from "../agent-clients.js";
import { DATA_DIR } from "../app/bootstrap.js";
import { requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { handleShell } from "../windows/registry.js";

export function wireAgentsIpc() {
  handleShell("app.agentConnections", async () => {
    requireRuntime("runtime not connected");
    return runtimeInvoke("agentConnections.list");
  });
  handleShell('app.agentClients', () => detectAgentClients());
  handleShell("app.revokeAgentConnection", async (_, connectionId: unknown) => {
    requireRuntime("runtime not connected");
    return runtimeInvoke("agentConnections.revoke", { connectionId });
  });

  handleShell("app.agentConfig", async (_, input: unknown) => {
    requireRuntime("runtime not connected");
    const entry = app.isPackaged ? join(process.resourcesPath, "mcp", "aux-mcp.mjs") : join(import.meta.dirname, "..", "mcp", "aux-mcp.mjs");
    if (!existsSync(entry)) throw new Error("The MCP bridge is missing. Rebuild the desktop application.");
    const created = await runtimeInvoke("agentConnections.create", input) as {connection:{scope:{kind:string;workspaceId:string;taskId?:string}};token:string};
    // Development/cloud tools cost ~26KB of tool schema per client turn; list them only
    // where they can do something: a workspace, or a task with a repository/environment.
    const taskId = created.connection.scope.taskId;
    const projectTools = !taskId || await runtimeInvoke("tasks.get", { taskId })
      .then(value => (value as { task: { resources: { kind: string }[] } }).task.resources.some(resource => resource.kind === "repository" || resource.kind === "environment"))
      .catch(() => true);
    return { command: process.execPath, args: [entry], connection: created.connection,
      env: { ELECTRON_RUN_AS_NODE: "1", AUX_DATA_DIR: DATA_DIR, AUX_MCP_TOKEN: created.token, ...(projectTools ? { AUX_MCP_PROJECT_TOOLS: "1" } : {}),
        AUX_MCP_SCOPE_KIND: created.connection.scope.kind, AUX_MCP_WORKSPACE_ID: created.connection.scope.workspaceId,
        ...(created.connection.scope.taskId ? { AUX_MCP_TASK_ID: created.connection.scope.taskId } : {}) } };
  });
}
