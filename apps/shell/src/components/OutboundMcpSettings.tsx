import "./OutboundMcpSettings.css";
import { useEffect, useState } from "react";
import type { OutboundMcpGrant, OutboundMcpServer, OutboundMcpTool, Task, Workspace } from "@aux/contracts";
import { bridge } from "../bridge";
import { call } from "../store";

type BundleInspection = {
  path: string;
  sha256: string;
  format: "mcpb" | "dxt";
  name: string;
  server: Record<string, unknown>;
};
type GrantReview = {
  serverId: string;
  sourceDigest: string;
  toolName: string;
  scope: { kind: "workspace"; workspaceId: string } | { kind: "task"; taskId: string; revision: number };
  mode: "once" | "standing";
  outputTokenLimit: number;
};

function errorText(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

function grantScopeLabel(scope: OutboundMcpGrant["scope"], tasks: Task[], workspaces: Workspace[]) {
  if (scope.kind === "workspace") {
    const name = workspaces.find((item) => item.workspaceId === scope.workspaceId)?.name ?? "this Space";
    return `Every task in ${name}`;
  }
  const title = tasks.find((task) => task.taskId === scope.taskId)?.title ?? "Task";
  return `${title} · revision ${scope.revision}`;
}

function ServerSource({ server }: { server: OutboundMcpServer }) {
  const source = server.source;
  return (
    <dl className="mcp-source-details">
      <div>
        <dt>Server</dt>
        <dd>{server.name}</dd>
      </div>
      <div>
        <dt>Kind</dt>
        <dd>
          {source.kind === "local"
            ? "Local command"
            : source.kind === "remote"
              ? "Remote HTTPS"
              : "Local bundle"}
        </dd>
      </div>
      {source.kind === "local" && (
        <>
          <div>
            <dt>Executable</dt>
            <dd>
              <code>{source.command}</code>
            </dd>
          </div>
          <div>
            <dt>Arguments</dt>
            <dd>
              {source.args.length ? (
                <ol>
                  {source.args.map((arg, index) => (
                    <li key={index}>
                      <code>{arg}</code>
                    </li>
                  ))}
                </ol>
              ) : (
                "None"
              )}
            </dd>
          </div>
          <div>
            <dt>Working directory</dt>
            <dd>
              <code>{source.cwd}</code>
            </dd>
          </div>
        </>
      )}
      {source.kind === "remote" && (
        <>
          <div>
            <dt>Endpoint</dt>
            <dd>
              <code>{source.url}</code>
            </dd>
          </div>
          <div>
            <dt>Authentication</dt>
            <dd>{source.auth === "oauth" ? "OAuth" : "None"}</dd>
          </div>
        </>
      )}
      {source.kind === "bundle" && (
        <>
          <div>
            <dt>Bundle</dt>
            <dd>
              <code>{source.path}</code>
            </dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{source.format.toUpperCase()}</dd>
          </div>
          <div>
            <dt>File SHA-256</dt>
            <dd>
              <code>{source.sha256}</code>
            </dd>
          </div>
        </>
      )}
      <div>
        <dt>Source fingerprint</dt>
        <dd>
          <code>{server.sourceDigest}</code>
        </dd>
      </div>
    </dl>
  );
}

export function OutboundMcpSettings() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [servers, setServers] = useState<OutboundMcpServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [tools, setTools] = useState<OutboundMcpTool[] | null>(null);
  const [grants, setGrants] = useState<OutboundMcpGrant[]>([]);
  const [sourceKind, setSourceKind] = useState<"local" | "remote" | "bundle">("remote");
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [argumentsText, setArgumentsText] = useState("");
  const [cwd, setCwd] = useState("");
  const [url, setUrl] = useState("");
  const [auth, setAuth] = useState<"oauth" | "none">("oauth");
  const [bundle, setBundle] = useState<BundleInspection | null>(null);
  const [toolName, setToolName] = useState("");
  const [scopeKind, setScopeKind] = useState<"workspace" | "task">("task");
  const [taskId, setTaskId] = useState("");
  const [mode, setMode] = useState<"once" | "standing">("once");
  const [outputTokenLimit, setOutputTokenLimit] = useState("2000");
  const [grantReview, setGrantReview] = useState<GrantReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedServer = servers.find((server) => server.serverId === selectedServerId);
  const availableTasks = tasks.filter((task) => task.workspaceId === workspaceId && task.state === "open");
  const selectedTask = availableTasks.find((task) => task.taskId === taskId);
  const scope =
    scopeKind === "task" && selectedTask
      ? { kind: "task" as const, taskId: selectedTask.taskId, revision: selectedTask.revision }
      : scopeKind === "workspace" && workspaceId
        ? { kind: "workspace" as const, workspaceId }
        : null;
  const tokenLimit = Number(outputTokenLimit);
  const validTokenLimit =
    outputTokenLimit.trim() !== "" && Number.isInteger(tokenLimit) && tokenLimit >= 1 && tokenLimit <= 32000;

  useEffect(() => {
    let active = true;
    void Promise.all([call("workspaces.list", {}), call("tasks.list", { includeArchived: true, limit: 500 })])
      .then(([nextWorkspaces, nextTasks]) => {
        if (!active) return;
        setWorkspaces(nextWorkspaces);
        setTasks(nextTasks);
        setWorkspaceId(nextWorkspaces[0]?.workspaceId ?? "");
        setLoadingWorkspaces(false);
      })
      .catch((reason) => {
        if (active) {
          setError(errorText(reason));
          setLoadingWorkspaces(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    void call("mcp.servers.list", { workspaceId })
      .then((items) => {
        if (!active) return;
        setServers(items);
        setSelectedServerId((current) =>
          items.some((item) => item.serverId === current) ? current : (items[0]?.serverId ?? ""),
        );
      })
      .catch((reason) => {
        if (active) setError(errorText(reason));
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);
  useEffect(() => {
    if (!selectedServerId) return;
    let active = true;
    void call("mcp.grants.list", { serverId: selectedServerId })
      .then((items) => {
        if (active) setGrants(items);
      })
      .catch((reason) => {
        if (active) setError(errorText(reason));
      });
    return () => {
      active = false;
    };
  }, [selectedServerId]);

  const action = async (work: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };
  const refreshServers = async (preferredId?: string) => {
    const items = await call("mcp.servers.list", { workspaceId });
    setServers(items);
    setSelectedServerId(
      preferredId && items.some((item) => item.serverId === preferredId)
        ? preferredId
        : (items.find((item) => item.serverId === selectedServerId)?.serverId ?? items[0]?.serverId ?? ""),
    );
    if (preferredId && preferredId !== selectedServerId) {
      setTools(null);
      setGrants([]);
      setToolName("");
      setGrantReview(null);
    }
  };
  const refreshGrants = async (serverId: string) => {
    setGrants(await call("mcp.grants.list", { serverId }));
  };
  const register = async () => {
    if (!workspaceId || !name.trim()) return;
    let source: OutboundMcpServer["source"];
    if (sourceKind === "local")
      source = {
        kind: "local",
        command: command.trim(),
        args: argumentsText.split("\n").filter(Boolean),
        cwd: cwd.trim(),
      };
    else if (sourceKind === "remote") source = { kind: "remote", url: url.trim(), auth };
    else if (bundle)
      source = { kind: "bundle", path: bundle.path, sha256: bundle.sha256, format: bundle.format };
    else return;
    await action(async () => {
      const server = await call("mcp.servers.register", { workspaceId, name: name.trim(), source });
      await refreshServers(server.serverId);
      setName("");
      setBundle(null);
      setMessage("Server saved for review. Approve its source, then grant individual tools.");
    });
  };
  const inspectBundle = async () => {
    await action(async () => {
      const path = await bridge.openFile();
      if (!path) return;
      const result = await call("mcp.bundles.inspect", { path });
      setBundle(result);
      if (!name.trim()) setName(result.name);
      setMessage("Bundle inspected. Review its path, format, manifest and SHA-256 before registering.");
    });
  };
  const reviewGrant = () => {
    if (!selectedServer || selectedServer.state !== "approved" || !toolName || !scope || !validTokenLimit)
      return;
    setGrantReview({
      serverId: selectedServer.serverId,
      sourceDigest: selectedServer.sourceDigest,
      toolName,
      scope,
      mode,
      outputTokenLimit: tokenLimit,
    });
  };

  return (
    <section className="field outbound-mcp" aria-label="MCP servers" data-setting="MCP servers">
      <div className="drawer-section">MCP servers</div>
      <p className="hint">
        Add a server to a Space, review its exact source, then grant individual tools. Server approval alone
        never grants tool access. Local commands and OAuth connections start only through the supervised
        native host.
      </p>
      {!workspaces.length ? (
        <p className="hint">
          {loadingWorkspaces
            ? "Loading Spaces…"
            : error
              ? "MCP server settings are unavailable until Spaces load."
              : "Create a Space before adding an MCP server."}
        </p>
      ) : (
        <>
          <label>
            Space
            <select
              aria-label="MCP Space"
              value={workspaceId}
              disabled={busy}
              onChange={(event) => {
                setWorkspaceId(event.target.value);
                setSelectedServerId("");
                setServers([]);
                setTools(null);
                setGrants([]);
                setGrantReview(null);
              }}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.workspaceId} value={workspace.workspaceId}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="field mcp-register">
            <legend>Add an MCP server</legend>
            <label>
              Server name
              <input
                value={name}
                maxLength={200}
                onChange={(event) => setName(event.target.value)}
                placeholder="A name you recognize"
              />
            </label>
            <label>
              Source
              <select
                aria-label="MCP source type"
                value={sourceKind}
                onChange={(event) => {
                  setSourceKind(event.target.value as typeof sourceKind);
                  setBundle(null);
                }}
              >
                <option value="remote">Remote HTTPS</option>
                <option value="local">Local command</option>
                <option value="bundle">.mcpb or .dxt bundle</option>
              </select>
            </label>
            {sourceKind === "remote" && (
              <>
                <label>
                  HTTPS endpoint
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/mcp"
                  />
                </label>
                <label>
                  Authentication
                  <select value={auth} onChange={(event) => setAuth(event.target.value as typeof auth)}>
                    <option value="oauth">OAuth</option>
                    <option value="none">None</option>
                  </select>
                </label>
              </>
            )}
            {sourceKind === "local" && (
              <>
                <p className="hint">
                  Enter an executable and one argument per line. Aux does not run the command while it is
                  pending review. Do not put secrets in arguments.
                </p>
                <label>
                  Executable path
                  <input
                    value={command}
                    onChange={(event) => setCommand(event.target.value)}
                    placeholder="/absolute/path/to/server"
                  />
                </label>
                <label>
                  Working directory
                  <input
                    value={cwd}
                    onChange={(event) => setCwd(event.target.value)}
                    placeholder="/absolute/project/path"
                  />
                </label>
                <label>
                  Arguments, one per line
                  <textarea
                    rows={3}
                    value={argumentsText}
                    onChange={(event) => setArgumentsText(event.target.value)}
                  />
                </label>
              </>
            )}
            {sourceKind === "bundle" && (
              <>
                <button className="btn sm" type="button" disabled={busy} onClick={() => void inspectBundle()}>
                  Choose and inspect bundle…
                </button>
                {bundle && (
                  <dl className="mcp-source-details">
                    <div>
                      <dt>Bundle</dt>
                      <dd>
                        <code>{bundle.path}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>Format</dt>
                      <dd>{bundle.format.toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt>SHA-256</dt>
                      <dd>
                        <code>{bundle.sha256}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>Manifest server</dt>
                      <dd>
                        <code>{JSON.stringify(bundle.server)}</code>
                      </dd>
                    </div>
                  </dl>
                )}
              </>
            )}
            <button
              className="btn"
              type="button"
              disabled={
                busy ||
                !name.trim() ||
                (sourceKind === "bundle" && !bundle) ||
                (sourceKind === "local" && (!command.trim() || !cwd.trim())) ||
                (sourceKind === "remote" && !url.startsWith("https://"))
              }
              onClick={() => void register()}
            >
              Save server for review
            </button>
          </fieldset>
          <div className="drawer-section">Servers in this Space</div>
          {!servers.length && <p className="hint">No MCP servers saved in this Space.</p>}
          {!!servers.length && (
            <label>
              Review server
              <select
                aria-label="Review MCP server"
                value={selectedServerId}
                onChange={(event) => {
                  setSelectedServerId(event.target.value);
                  setTools(null);
                  setGrants([]);
                  setToolName("");
                  setGrantReview(null);
                }}
              >
                {servers.map((server) => (
                  <option key={server.serverId} value={server.serverId}>
                    {server.name} · {server.state}
                  </option>
                ))}
              </select>
            </label>
          )}
          {selectedServer && (
            <div className="mcp-server-card">
              <strong>
                {selectedServer.name} · {selectedServer.state}
              </strong>
              <p className="hint">
                Registered {new Date(selectedServer.createdAt).toLocaleString()} in{" "}
                {workspaces.find((item) => item.workspaceId === selectedServer.workspaceId)?.name ??
                  "this Space"}
                .
              </p>
              <ServerSource server={selectedServer} />
              {selectedServer.state === "pending" && (
                <div className="field">
                  <p className="hint">
                    Approval trusts only the source shown above. Review its executable or endpoint, arguments,
                    bundle hash and fingerprint. No tools are granted by this action.
                  </p>
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await call("mcp.servers.approve", {
                          serverId: selectedServer.serverId,
                          expectedDigest: selectedServer.sourceDigest,
                        });
                        await refreshServers(selectedServer.serverId);
                        setMessage(
                          "Server source approved. Load its tools, then review each grant separately.",
                        );
                      })
                    }
                  >
                    Approve this server source
                  </button>
                </div>
              )}
              {selectedServer.state === "approved" && (
                <button
                  className="btn sm ghost"
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      setTools(null);
                      setGrantReview(null);
                      const result = await call("mcp.tools.list", { serverId: selectedServer.serverId });
                      setTools(result);
                      setToolName("");
                      setGrantReview(null);
                      setMessage(`${result.length} tool${result.length === 1 ? "" : "s"} loaded.`);
                    })
                  }
                >
                  Load available tools
                </button>
              )}
              {selectedServer.state !== "revoked" && (
                <button
                  className="btn sm ghost"
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      await call("mcp.servers.revoke", { serverId: selectedServer.serverId });
                      await refreshServers(selectedServer.serverId);
                      await refreshGrants(selectedServer.serverId);
                      setTools(null);
                      setGrantReview(null);
                      setMessage("Server and all its tool grants revoked. Active calls were stopped.");
                    })
                  }
                >
                  Revoke server and grants
                </button>
              )}
              {selectedServer.state === "revoked" && (
                <p className="hint">
                  This server is revoked. Register a new reviewed source to reconnect it.
                </p>
              )}
              {selectedServer.state === "approved" && tools && (
                <fieldset className="field mcp-grant-form">
                  <legend>Grant one tool</legend>
                  {!tools.length ? (
                    <p className="hint">The server reported no tools.</p>
                  ) : (
                    <>
                      <label>
                        Tool
                        <select
                          aria-label="MCP tool"
                          value={toolName}
                          onChange={(event) => {
                            setToolName(event.target.value);
                            setGrantReview(null);
                          }}
                        >
                          <option value="">Choose a tool</option>
                          {tools.map((tool) => (
                            <option key={tool.name} value={tool.name}>
                              {tool.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {tools.find((tool) => tool.name === toolName)?.description && (
                        <p className="hint">{tools.find((tool) => tool.name === toolName)?.description}</p>
                      )}
                      <label>
                        Scope
                        <select
                          aria-label="MCP tool scope"
                          value={scopeKind}
                          onChange={(event) => {
                            setScopeKind(event.target.value as typeof scopeKind);
                            setGrantReview(null);
                          }}
                        >
                          <option value="task">One saved task revision</option>
                          <option value="workspace">This entire Space</option>
                        </select>
                      </label>
                      {scopeKind === "task" && (
                        <label>
                          Task
                          <select
                            aria-label="MCP grant task"
                            value={taskId}
                            onChange={(event) => {
                              setTaskId(event.target.value);
                              setGrantReview(null);
                            }}
                          >
                            <option value="">Choose a task</option>
                            {availableTasks.map((task) => (
                              <option key={task.taskId} value={task.taskId}>
                                {task.title} · revision {task.revision}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label>
                        Grant duration
                        <select
                          aria-label="MCP grant duration"
                          value={mode}
                          onChange={(event) => {
                            setMode(event.target.value as typeof mode);
                            setGrantReview(null);
                          }}
                        >
                          <option value="once">One call</option>
                          <option value="standing">Until revoked</option>
                        </select>
                      </label>
                      <label>
                        Maximum output tokens
                        <input
                          type="number"
                          min={1}
                          max={32000}
                          value={outputTokenLimit}
                          onChange={(event) => {
                            setOutputTokenLimit(event.target.value);
                            setGrantReview(null);
                          }}
                        />
                      </label>
                      <button
                        className="btn sm"
                        disabled={busy || !toolName || !scope || !validTokenLimit}
                        onClick={reviewGrant}
                      >
                        Review tool grant
                      </button>
                      {grantReview && (
                        <div className="mcp-grant-review">
                          <strong>Confirm this tool grant</strong>
                          <dl className="mcp-source-details">
                            <div>
                              <dt>Server</dt>
                              <dd>{selectedServer.name}</dd>
                            </div>
                            <div>
                              <dt>Server fingerprint</dt>
                              <dd>
                                <code>{grantReview.sourceDigest}</code>
                              </dd>
                            </div>
                            <div>
                              <dt>Tool</dt>
                              <dd>
                                <code>{grantReview.toolName}</code>
                              </dd>
                            </div>
                            <div>
                              <dt>Scope</dt>
                              <dd>{grantScopeLabel(grantReview.scope, tasks, workspaces)}</dd>
                            </div>
                            <div>
                              <dt>Scope ID</dt>
                              <dd>
                                <code>
                                  {grantReview.scope.kind === "workspace"
                                    ? grantReview.scope.workspaceId
                                    : grantReview.scope.taskId}
                                </code>
                              </dd>
                            </div>
                            <div>
                              <dt>Duration</dt>
                              <dd>{grantReview.mode === "once" ? "One call" : "Until revoked"}</dd>
                            </div>
                            <div>
                              <dt>Output limit</dt>
                              <dd>{grantReview.outputTokenLimit.toLocaleString()} tokens</dd>
                            </div>
                          </dl>
                          <button
                            className="btn"
                            disabled={
                              busy ||
                              grantReview.serverId !== selectedServer.serverId ||
                              grantReview.sourceDigest !== selectedServer.sourceDigest
                            }
                            onClick={() =>
                              void action(async () => {
                                await call("mcp.grants.create", {
                                  serverId: grantReview.serverId,
                                  toolName: grantReview.toolName,
                                  scope: grantReview.scope,
                                  mode: grantReview.mode,
                                  outputTokenLimit: grantReview.outputTokenLimit,
                                });
                                await refreshGrants(selectedServer.serverId);
                                setGrantReview(null);
                                setMessage("Tool grant saved. You can revoke it below at any time.");
                              })
                            }
                          >
                            Approve tool grant
                          </button>
                          <button className="btn sm ghost" onClick={() => setGrantReview(null)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </fieldset>
              )}
              <div className="field">
                <strong>Tool grants</strong>
                {!grants.length && (
                  <p className="hint">No tools granted. This server cannot act on any task.</p>
                )}
                {grants.map((grant) => (
                  <div className="mcp-grant-row" key={grant.grantId}>
                    <div>
                      <strong>{grant.toolName}</strong>
                      <span className="hint">
                        {grantScopeLabel(grant.scope, tasks, workspaces)} ·{" "}
                        {grant.mode === "once" ? "one call" : "until revoked"} ·{" "}
                        {grant.outputTokenLimit.toLocaleString()} output tokens
                        {grant.revokedAt ? " · revoked" : grant.consumedAt ? " · used" : " · active"}
                      </span>
                    </div>
                    {!grant.revokedAt && !grant.consumedAt && selectedServer.state === "approved" && (
                      <button
                        className="btn sm ghost"
                        disabled={busy}
                        onClick={() =>
                          void action(async () => {
                            await call("mcp.grants.revoke", { grantId: grant.grantId });
                            await refreshGrants(selectedServer.serverId);
                            setMessage("Tool grant revoked.");
                          })
                        }
                      >
                        Revoke tool
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <output className="hint" data-block>
          {message}
        </output>
      )}
    </section>
  );
}
