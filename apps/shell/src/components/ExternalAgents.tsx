import { staticFieldProps } from "../ui/class-props";
import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { useEffect, useMemo, useState } from "react";
import type { AgentConnection, AgentConnectionScope, Task, Workspace } from "@aux/contracts";
import { mcpCatalogGrouped, type McpCatalogTool } from "@aux/contracts/mcp-catalog";
import { bridge } from "../bridge";
import { ExternalAgentOversight } from "./ExternalAgentOversight";
import { staticButtonProps as auxClassButtonProps } from "../ui/class-props";
import { staticDrawerSectionProps as auxClassDrawerSectionProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type Config = Awaited<ReturnType<typeof bridge.agentConfig>>;
type Installation=Awaited<ReturnType<typeof bridge.agentClients>>[number];

export function ExternalAgents() {
  const [config, setConfig] = useState<Config | null>(null);
  const [client, setClient] = useState<"codex" | "claude">("codex");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connections, setConnections] = useState<AgentConnection[]>([]);
  const [installations,setInstallations]=useState<Installation[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [scopeKind, setScopeKind] = useState<"workspace" | "task">("task");
  const [name, setName] = useState("Codex task connection");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const availableTasks = useMemo(() => tasks.filter(task => task.workspaceId === workspaceId && task.state === "open"), [tasks, workspaceId]);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogGroup, setCatalogGroup] = useState<"all" | McpCatalogTool["group"]>("all");
  const catalogGroups = useMemo(
    () => mcpCatalogGrouped(scopeKind, { query: catalogQuery, group: catalogGroup === "all" ? undefined : catalogGroup }),
    [scopeKind, catalogQuery, catalogGroup],
  );
  const connectionTarget = (connection: AgentConnection) => {
    const scope = connection.scope;
    return scope.kind === "task"
      ? tasks.find(task => task.taskId === scope.taskId)?.title ?? "Task"
      : workspaces.find(workspace => workspace.workspaceId === scope.workspaceId)?.name ?? "Workspace";
  };

  const refresh = async () => {
    const [nextWorkspaces, nextTasks, nextConnections,nextInstallations] = await Promise.all([
      bridge.invoke("workspaces.list", {}) as Promise<Workspace[]>,
      bridge.invoke("tasks.list", { includeArchived: true, limit: 500 }) as Promise<Task[]>,
      bridge.agentConnections(),
      bridge.agentClients(),
    ]);
    setWorkspaces(nextWorkspaces); setTasks(nextTasks); setConnections(nextConnections);setInstallations(nextInstallations);
    setWorkspaceId(current => current && nextWorkspaces.some(item => item.workspaceId === current) ? current : nextWorkspaces[0]?.workspaceId ?? "");
  };
  useEffect(() => { void refresh().catch(reason => setError(String(reason))); }, []);
  useEffect(() => {
    if (!availableTasks.some(task => task.taskId === taskId)) setTaskId(availableTasks[0]?.taskId ?? "");
  }, [availableTasks, taskId]);
  useEffect(() => { setName(client === "codex" ? "Codex task connection" : "Claude Code task connection"); setConfig(null); }, [client]);

  const snippet = !config ? "" : client === "claude"
    ? JSON.stringify({ mcpServers: { "aux-browser": { type: "stdio", command: config.command, args: config.args, env: config.env } } }, null, 2)
    : `[mcp_servers.aux-browser]\ncommand = ${JSON.stringify(config.command)}\nargs = ${JSON.stringify(config.args)}\n\n[mcp_servers.aux-browser.env]\n${Object.entries(config.env).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join("\n")}\n`;
  const create = async () => {
    setError(""); setMessage(""); setBusy(true);
    try {
      const scope: AgentConnectionScope = scopeKind === "task" ? { kind: "task", workspaceId, taskId } : { kind: "workspace", workspaceId };
      const next = await bridge.agentConfig({ name: name.trim(), client, scope });
      setConfig(next); await refresh();
      setMessage("Connection created. Copy this configuration now; Aux does not retain the token in readable form.");
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const revoke = async (connectionId: string) => {
    setError(""); setBusy(true);
    try { await bridge.revokeAgentConnection(connectionId); await refresh(); setMessage("Connection revoked. Its existing configuration can no longer call Aux."); }
    catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };

  return <section className="field external-agents" aria-label="External agents">
    <div {...auxClassDrawerSectionProps}>External agents</div>
    <p>Connect Codex or Claude Code to one saved task or workspace through MCP. The client uses its own account and model.</p>
    <div role="group" {...staticRowProps} aria-label="Detected agent clients">{installations.map(item=><span className="hint" key={item.client}><strong>{item.client==='codex'?'Codex':'Claude Code'}</strong> · {item.installed?(item.version??(item.error?'version unavailable':'installed')):'not installed'}</span>)}</div>
    <span {...staticHintProps}>The generated token can access only the selected task scope, its attached browser tabs and attached Aux-managed checkouts. File changes, local commands, preview tabs and commits require native approval. It cannot accept evidence, reconcile actions, create workspaces, or expand its own scope. Use the client’s approval controls for its non-Aux tools.</span>
    <details {...staticFieldProps}><summary>Tools this token can call</summary>
      <p {...staticHintProps}>{scopeKind === "task" ? "Task-scoped connections see this filtered catalog. Workspace connections add child-task creation." : "Workspace-scoped connections can create tasks inside the selected workspace."} Vault, routines, backups and human review stay in Aux.</p>
      <label>Filter tools<input aria-label="Filter scoped MCP tools" value={catalogQuery} onChange={event => setCatalogQuery(event.target.value)} placeholder="Name or description" /></label>
      <div className="seg" role="group" aria-label="Tool group">{(["all", "browser", "task", "workspace"] as const).map(value => <button key={value} className={catalogGroup === value ? "on" : ""} aria-pressed={catalogGroup === value} onClick={() => setCatalogGroup(value)}>{value === "all" ? "All" : value[0]!.toUpperCase() + value.slice(1)}</button>)}</div>
      {catalogGroups.map(group => <div className="field" key={group.group}><div {...auxClassDrawerSectionProps}>{group.label}</div>{group.tools.map(tool => <div className="hint" key={tool.name}><strong>{tool.name}</strong> · {tool.description}</div>)}</div>)}
      {!catalogGroups.length && <p {...staticHintProps}>No scoped tools match this filter.</p>}
    </details>
    <div className="seg" role="group" aria-label="Agent client">{(["codex", "claude"] as const).map(value => <button key={value} className={client === value ? "on" : ""} aria-pressed={client === value} onClick={() => setClient(value)}>{value === "codex" ? "Codex" : "Claude Code"}</button>)}</div>
    {!workspaces.length ? <output data-block>Create a saved task and workspace before connecting an external agent.</output> : <>
      <label>Connection name<input aria-label="Connection name" value={name} maxLength={100} onChange={event => { setName(event.target.value); setConfig(null); }} /></label>
      <label>Workspace<select aria-label="Connection workspace" value={workspaceId} onChange={event => { setWorkspaceId(event.target.value); setConfig(null); }}>{workspaces.map(workspace => <option key={workspace.workspaceId} value={workspace.workspaceId}>{workspace.name}</option>)}</select></label>
      <label>Scope<select aria-label="Connection scope" value={scopeKind} onChange={event => { setScopeKind(event.target.value as "workspace" | "task"); setConfig(null); }}><option value="task">One task</option><option value="workspace">All tasks in workspace</option></select></label>
      {scopeKind === "task" && <label>Task<select aria-label="Connection task" value={taskId} onChange={event => { setTaskId(event.target.value); setConfig(null); }}>{availableTasks.map(task => <option key={task.taskId} value={task.taskId}>{task.title}</option>)}</select></label>}
      <button {...auxClassButtonProps} disabled={busy || !name.trim() || !workspaceId || (scopeKind === "task" && !taskId)} onClick={() => void create()}>Create scoped connection</button>
    </>}
    {error && <p {...nativeAlertRoleProps}>{error}</p>}
    {config && <>
      <span {...staticHintProps}>{client === "codex" ? "Merge this server entry into Codex config.toml." : "Merge this server entry into your project .mcp.json or another supported Claude Code scope."} Keep existing entries. This token is shown once; create a replacement if it is lost.</span>
      <textarea aria-label="Agent configuration" readOnly rows={12} value={snippet} spellCheck={false} className="mono" />
      <div {...staticRowProps}><button {...smallButtonProps} onClick={() => void navigator.clipboard.writeText(snippet).then(() => setMessage("Configuration copied.")).catch(() => setError("Copy failed. Select and copy the configuration text."))}>Copy configuration</button>
        <button {...smallButtonProps} onClick={() => void bridge.openExternal(client === "codex" ? "https://developers.openai.com/codex/mcp" : "https://code.claude.com/docs/en/mcp")}>Client setup guide</button></div>
    </>}
    {!!connections.length && <div className="external-agent-connections"><div {...auxClassDrawerSectionProps}>Connections</div>{connections.map(connection => <div className="external-agent-row" key={connection.connectionId}>
      <div className="external-agent-copy"><strong>{connection.name}</strong><span {...staticHintProps}>{connection.client === "codex" ? "Codex" : "Claude Code"} · {connectionTarget(connection)}{connection.lastUsedAt ? ` · used ${new Date(connection.lastUsedAt).toLocaleString()}` : " · not used yet"}{connection.revokedAt ? " · revoked" : ""}</span></div>
      {!connection.revokedAt && <button {...smallButtonProps} disabled={busy} onClick={() => void revoke(connection.connectionId)}>Revoke</button>}
    </div>)}</div>}
    <ExternalAgentOversight connections={connections} />
    {message && <output data-block>{message}</output>}
    <span {...staticHintProps}>Removing the client entry stops normal use. Revoking it here invalidates the token immediately. Quitting Aux stops the runtime.</span>
  </section>;
}
