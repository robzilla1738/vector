import { app, ipcMain } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { detectAgentClients } from "../agent-clients.js";
import { DATA_DIR } from "../app/bootstrap.js";
import { channel } from "../runtime/supervisor.js";
import { requireShellUi } from "../windows/registry.js";

export function wireAgentsIpc() {
  ipcMain.handle("app.agentConnections", async event => {
    requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    return channel.call("api.invoke", { method: "agentConnections.list", params: {}, desktopUser: true });
  });
  ipcMain.handle('app.agentClients',event=>{requireShellUi(event);return detectAgentClients();});
  ipcMain.handle("app.revokeAgentConnection", async (event, connectionId: unknown) => {
    requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    return channel.call("api.invoke", { method: "agentConnections.revoke", params: { connectionId }, desktopUser: true });
  });

  ipcMain.handle("app.agentConfig", async (event, input: unknown) => {
    requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    const entry = app.isPackaged ? join(process.resourcesPath, "mcp", "aux-mcp.mjs") : join(import.meta.dirname, "..", "mcp", "aux-mcp.mjs");
    if (!existsSync(entry)) throw new Error("The MCP bridge is missing. Rebuild the desktop application.");
    const created = await channel.call("api.invoke", { method: "agentConnections.create", params: input, desktopUser: true }) as {connection:{scope:{kind:string;workspaceId:string;taskId?:string}};token:string};
    // Development/cloud tools cost ~26KB of tool schema per client turn; list them only
    // where they can do something: a workspace, or a task with a repository/environment.
    const taskId = created.connection.scope.taskId;
    const projectTools = !taskId || await channel.call("api.invoke", { method: "tasks.get", params: { taskId }, desktopUser: true })
      .then(value => (value as { task: { resources: { kind: string }[] } }).task.resources.some(resource => resource.kind === "repository" || resource.kind === "environment"))
      .catch(() => true);
    return { command: process.execPath, args: [entry], connection: created.connection,
      env: { ELECTRON_RUN_AS_NODE: "1", AUX_DATA_DIR: DATA_DIR, AUX_MCP_TOKEN: created.token, ...(projectTools ? { AUX_MCP_PROJECT_TOOLS: "1" } : {}),
        AUX_MCP_SCOPE_KIND: created.connection.scope.kind, AUX_MCP_WORKSPACE_ID: created.connection.scope.workspaceId,
        ...(created.connection.scope.taskId ? { AUX_MCP_TASK_ID: created.connection.scope.taskId } : {}) } };
  });
}
