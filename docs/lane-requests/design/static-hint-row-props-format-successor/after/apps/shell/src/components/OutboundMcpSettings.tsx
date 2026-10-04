import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
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
  return errorMessage(reason);
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
    <div className="mcp-source-details">
      <div>
        <span className="mcp-source-label">Server</span>
        <div className="mcp-source-value">{server.name}</div>
      </div>
      <div>
        <span className="mcp-source-label">Kind</span>
        <div className="mcp-source-value">
          {source.kind === "local"
            ? "Local command"
            : source.kind === "remote"
              ? "Remote HTTPS"
              : "Local bundle"}
        </div>
      </div>
      {source.kind === "local" && (
        <>
          <div>
            <span className="mcp-source-label">Executable</span>
            <div className="mcp-source-value">
              <code>{source.command}</code>
            </div>
          </div>
          <div>
            <span className="mcp-source-label">Arguments</span>
            <div className="mcp-source-value">
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
            </div>
          </div>
          <div>
            <span className="mcp-source-label">Working directory</span>
            <div className="mcp-source-value">
              <code>{source.cwd}</code>
            </div>
          </div>
        </>
      )}
      {source.kind === "remote" && (
        <>
          <div>
            <span className="mcp-source-label">Endpoint</span>
            <div className="mcp-source-value">
              <code>{source.url}</code>
            </div>
          </div>
          <div>
            <span className="mcp-source-label">Authentication</span>
            <div className="mcp-source-value">{source.auth === "oauth" ? "OAuth" : "None"}</div>
          </div>
        </>
      )}
      {source.kind === "bundle" && (
        <>
          <div>
            <span className="mcp-source-label">Original bundle</span>
            <div className="mcp-source-value">
              <code>{source.path}</code>
            </div>
          </div>
          <div>
            <span className="mcp-source-label">Format</span>
            <div className="mcp-source-value">{source.format.toUpperCase()}</div>
          </div>
          <div>
            <span className="mcp-source-label">Installed copy SHA-256</span>
            <div className="mcp-source-value">
              <code>{source.sha256}</code>
            </div>
          </div>
        </>
      )}
      <div>
        <span className="mcp-source-label">Source fingerprint</span>
        <div className="mcp-source-value">
          <code>{server.sourceDigest}</code>
        </div>
      </div>
    </div>
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
  const [testGrantId, setTestGrantId] = useState("");
  const [testArguments, setTestArguments] = useState("{}");
  const [testResult, setTestResult] = useState("");
  const [oauthStatusRecord, setOauthStatusRecord] = useState<{
    serverId: string;
    connected: boolean;
    expiresAt?: number;
  } | null>(null);
  const [pendingOAuth, setPendingOAuth] = useState<{ serverId: string; expiresAt: number } | null>(null);
  const [authorizationReview, setAuthorizationReview] = useState<{
    serverId: string;
    url: string;
    expiresAt: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedServer = servers.find((server) => server.serverId === selectedServerId);
  const selectedAuth = selectedServer?.source.kind === "remote" ? selectedServer.source.auth : undefined;
  const oauthStatus = oauthStatusRecord?.serverId === selectedServerId ? oauthStatusRecord : null;
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
  const oauthExpiry = oauthStatus?.expiresAt
    ? ` · access expires ${new Date(oauthStatus.expiresAt).toLocaleString()}`
    : "";

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
  useEffect(() => {
    if (selectedServer?.state !== "approved" || selectedAuth !== "oauth") return;
    let active = true;
    void call("mcp.oauth.status", { serverId: selectedServer.serverId })
      .then((status) => {
        if (active) setOauthStatusRecord({ serverId: selectedServer.serverId, ...status });
      })
      .catch((reason) => {
        if (active) setError(errorText(reason));
      });
    return () => {
      active = false;
    };
  }, [selectedServer?.serverId, selectedServer?.state, selectedAuth]);
  useEffect(() => {
    if (!pendingOAuth) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= pendingOAuth.expiresAt) {
        setPendingOAuth(null);
        return;
      }
      void call("mcp.oauth.status", { serverId: pendingOAuth.serverId })
        .then((status) => {
          if (selectedServerId === pendingOAuth.serverId)
            setOauthStatusRecord({ serverId: pendingOAuth.serverId, ...status });
          if (status.connected) {
            setPendingOAuth(null);
            setMessage("MCP authorization connected.");
          }
        })
        .catch((reason) => setError(errorText(reason)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [pendingOAuth, selectedServerId]);

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
      setMessage(
        source.kind === "bundle"
          ? "Bundle installed as an immutable reviewed copy. Approve its digest, then grant individual tools."
          : "Server saved for review. Approve its source, then grant individual tools.",
      );
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
      <p {...staticHintProps}>
        Add a server to a Space, review its exact source, then grant individual tools. Server approval alone
        never grants tool access. Local commands run with network and file writes blocked. OAuth connections
        require a native credential.
      </p>
      {!workspaces.length ? (
        <p {...staticHintProps}>
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
                setAuthorizationReview(null);
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
                <p {...staticHintProps}>
                  Enter an executable and one argument per line. Aux does not run the command while it is
                  pending review. The approved working directory is readable by the server. Network and file
                  writes are blocked. Do not put secrets in arguments.
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
                <p {...staticHintProps}>
                  Aux supports self-contained Node bundles with static arguments and bundled files. Python,
                  UV, binary servers, host settings and environment values are not supported yet.
                </p>
                <button
                  {...smallButtonProps}
                  type="button"
                  disabled={busy}
                  onClick={() => void inspectBundle()}
                >
                  Choose and inspect bundle…
                </button>
                {bundle && (
                  <div className="mcp-source-details">
                    <div>
                      <span className="mcp-source-label">Original bundle</span>
                      <div className="mcp-source-value">
                        <code>{bundle.path}</code>
                      </div>
                    </div>
                    <div>
                      <span className="mcp-source-label">Format</span>
                      <div className="mcp-source-value">{bundle.format.toUpperCase()}</div>
                    </div>
                    <div>
                      <span className="mcp-source-label">SHA-256</span>
                      <div className="mcp-source-value">
                        <code>{bundle.sha256}</code>
                      </div>
                    </div>
                    <div>
                      <span className="mcp-source-label">Manifest server</span>
                      <div className="mcp-source-value">
                        <code>{JSON.stringify(bundle.server)}</code>
                      </div>
                    </div>
                  </div>
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
          {!servers.length && <p {...staticHintProps}>No MCP servers saved in this Space.</p>}
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
                  setAuthorizationReview(null);
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
              <p {...staticHintProps}>
                Registered {new Date(selectedServer.createdAt).toLocaleString()} in{" "}
                {workspaces.find((item) => item.workspaceId === selectedServer.workspaceId)?.name ??
                  "this Space"}
                .
              </p>
              <ServerSource server={selectedServer} />
              {selectedServer.state === "approved" &&
                selectedServer.source.kind === "remote" &&
                selectedServer.source.auth === "oauth" && (
                  <div className="field">
                    <strong>OAuth authorization</strong>
                    <p {...staticHintProps}>
                      {oauthStatus?.connected
                        ? `Connected in this Profile${oauthExpiry}.`
                        : pendingOAuth?.serverId === selectedServer.serverId
                          ? "Finish authorization in the window that opened."
                          : "Connect this reviewed server before loading tools. " +
                            "Aux stores credentials in the Profile Keychain."}
                    </p>
                    <div {...staticRowProps}>
                      {!oauthStatus?.connected && (
                        <button
                          {...smallButtonProps}
                          disabled={busy || pendingOAuth?.serverId === selectedServer.serverId}
                          onClick={() =>
                            void action(async () => {
                              const result = await call("mcp.oauth.start", {
                                serverId: selectedServer.serverId,
                              });
                              if (result.state === "authorization") {
                                const authorizationUrl = new URL(result.url);
                                if (
                                  authorizationUrl.protocol !== "https:" ||
                                  authorizationUrl.username ||
                                  authorizationUrl.password ||
                                  result.expiresAt <= Date.now()
                                )
                                  throw new Error("MCP authorization URL is invalid or expired.");
                                setAuthorizationReview({
                                  serverId: selectedServer.serverId,
                                  url: authorizationUrl.href,
                                  expiresAt: result.expiresAt,
                                });
                                setMessage("Review the authorization destination before opening it.");
                              } else {
                                setOauthStatusRecord({
                                  serverId: selectedServer.serverId,
                                  ...(await call("mcp.oauth.status", { serverId: selectedServer.serverId })),
                                });
                                setMessage("MCP authorization connected.");
                              }
                            })
                          }
                        >
                          Connect OAuth
                        </button>
                      )}
                      {(oauthStatus?.connected || oauthStatus?.expiresAt !== undefined) && (
                        <button
                          {...smallGhostButtonProps}
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              setOauthStatusRecord({
                                serverId: selectedServer.serverId,
                                ...(await call("mcp.oauth.clear", { serverId: selectedServer.serverId })),
                              });
                              setPendingOAuth(null);
                              setAuthorizationReview(null);
                              setTools(null);
                              setTestGrantId("");
                              setTestResult("");
                              setMessage("MCP authorization removed from this Profile.");
                            })
                          }
                        >
                          Disconnect OAuth
                        </button>
                      )}
                    </div>
                    {authorizationReview?.serverId === selectedServer.serverId && (
                      <fieldset className="mcp-source-details" aria-label="Review MCP authorization">
                        <p {...staticHintProps}>
                          Aux will open this HTTPS authorization page. Confirm its host belongs to the
                          provider you chose.
                        </p>
                        <div>
                          <span className="mcp-source-label">Authorization destination</span>
                          <div className="mcp-source-value">
                            <code>{authorizationReview.url}</code>
                          </div>
                        </div>
                        <button
                          {...smallButtonProps}
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              if (authorizationReview.expiresAt <= Date.now()) {
                                setAuthorizationReview(null);
                                throw new Error("MCP authorization request expired. Start a new connection.");
                              }
                              await bridge.openExternal(authorizationReview.url);
                              setPendingOAuth({
                                serverId: authorizationReview.serverId,
                                expiresAt: authorizationReview.expiresAt,
                              });
                              setAuthorizationReview(null);
                              setMessage("Finish MCP authorization in the window that opened.");
                            })
                          }
                        >
                          Open reviewed authorization page
                        </button>
                        <button {...smallGhostButtonProps} onClick={() => setAuthorizationReview(null)}>
                          Cancel authorization review
                        </button>
                      </fieldset>
                    )}
                  </div>
                )}
              {selectedServer.state === "pending" && (
                <div className="field">
                  <p {...staticHintProps}>
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
                  {...smallGhostButtonProps}
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
                  {...smallGhostButtonProps}
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      await call("mcp.servers.revoke", { serverId: selectedServer.serverId });
                      await refreshServers(selectedServer.serverId);
                      await refreshGrants(selectedServer.serverId);
                      setTools(null);
                      setGrantReview(null);
                      setAuthorizationReview(null);
                      setPendingOAuth(null);
                      setOauthStatusRecord(null);
                      setTestGrantId("");
                      setTestResult("");
                      setMessage("Server and all its tool grants revoked. Active calls were stopped.");
                    })
                  }
                >
                  Revoke server and grants
                </button>
              )}
              {selectedServer.state === "revoked" && (
                <p {...staticHintProps}>
                  This server is revoked. Register a new reviewed source to reconnect it.
                </p>
              )}
              {selectedServer.state === "approved" && tools && (
                <fieldset className="field mcp-grant-form">
                  <legend>Grant one tool</legend>
                  {!tools.length ? (
                    <p {...staticHintProps}>The server reported no tools.</p>
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
                        <p {...staticHintProps}>
                          {tools.find((tool) => tool.name === toolName)?.description}
                        </p>
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
                        {...smallButtonProps}
                        disabled={busy || !toolName || !scope || !validTokenLimit}
                        onClick={reviewGrant}
                      >
                        Review tool grant
                      </button>
                      {grantReview && (
                        <div className="mcp-grant-review">
                          <strong>Confirm this tool grant</strong>
                          <div className="mcp-source-details">
                            <div>
                              <span className="mcp-source-label">Server</span>
                              <div className="mcp-source-value">{selectedServer.name}</div>
                            </div>
                            <div>
                              <span className="mcp-source-label">Server fingerprint</span>
                              <div className="mcp-source-value">
                                <code>{grantReview.sourceDigest}</code>
                              </div>
                            </div>
                            <div>
                              <span className="mcp-source-label">Tool</span>
                              <div className="mcp-source-value">
                                <code>{grantReview.toolName}</code>
                              </div>
                            </div>
                            <div>
                              <span className="mcp-source-label">Scope</span>
                              <div className="mcp-source-value">
                                {grantScopeLabel(grantReview.scope, tasks, workspaces)}
                              </div>
                            </div>
                            <div>
                              <span className="mcp-source-label">Scope ID</span>
                              <div className="mcp-source-value">
                                <code>
                                  {grantReview.scope.kind === "workspace"
                                    ? grantReview.scope.workspaceId
                                    : grantReview.scope.taskId}
                                </code>
                              </div>
                            </div>
                            <div>
                              <span className="mcp-source-label">Duration</span>
                              <div className="mcp-source-value">
                                {grantReview.mode === "once" ? "One call" : "Until revoked"}
                              </div>
                            </div>
                            <div>
                              <span className="mcp-source-label">Output limit</span>
                              <div className="mcp-source-value">
                                {grantReview.outputTokenLimit.toLocaleString()} tokens
                              </div>
                            </div>
                          </div>
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
                          <button {...smallGhostButtonProps} onClick={() => setGrantReview(null)}>
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
                  <p {...staticHintProps}>No tools granted. This server cannot act on any task.</p>
                )}
                {grants.map((grant) => (
                  <div className="mcp-grant-row" key={grant.grantId}>
                    <div>
                      <strong>{grant.toolName}</strong>
                      <span {...staticHintProps}>
                        {grantScopeLabel(grant.scope, tasks, workspaces)} ·{" "}
                        {grant.mode === "once" ? "one call" : "until revoked"} ·{" "}
                        {grant.outputTokenLimit.toLocaleString()} output tokens
                        {grant.revokedAt ? " · revoked" : grant.consumedAt ? " · used" : " · active"}
                      </span>
                    </div>
                    {!grant.revokedAt && !grant.consumedAt && selectedServer.state === "approved" && (
                      <div className="mcp-grant-actions">
                        <button
                          {...smallGhostButtonProps}
                          disabled={busy}
                          onClick={() => {
                            setTestGrantId(testGrantId === grant.grantId ? "" : grant.grantId);
                            setTestArguments("{}");
                            setTestResult("");
                          }}
                        >
                          Call tool…
                        </button>
                        <button
                          {...smallGhostButtonProps}
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              await call("mcp.grants.revoke", { grantId: grant.grantId });
                              await refreshGrants(selectedServer.serverId);
                              setTestGrantId("");
                              setMessage("Tool grant revoked.");
                            })
                          }
                        >
                          Revoke tool
                        </button>
                      </div>
                    )}
                    {testGrantId === grant.grantId && selectedServer.state === "approved" && (
                      <div className="mcp-tool-test">
                        <label>
                          Tool arguments as JSON
                          <textarea
                            aria-label="MCP tool arguments"
                            rows={3}
                            value={testArguments}
                            onChange={(event) => setTestArguments(event.target.value)}
                          />
                        </label>
                        <p {...staticHintProps}>
                          This call uses the grant shown above. A one-call grant is consumed.
                        </p>
                        <button
                          {...smallButtonProps}
                          disabled={busy || Boolean(grant.revokedAt || grant.consumedAt)}
                          onClick={() =>
                            void action(async () => {
                              const args: unknown = JSON.parse(testArguments);
                              if (!args || typeof args !== "object" || Array.isArray(args))
                                throw new Error("Tool arguments must be a JSON object.");
                              const context =
                                grant.scope.kind === "workspace"
                                  ? { workspaceId: grant.scope.workspaceId }
                                  : {
                                      workspaceId: selectedServer.workspaceId,
                                      taskId: grant.scope.taskId,
                                      revision: grant.scope.revision,
                                    };
                              const result = await call("mcp.tools.call", {
                                grantId: grant.grantId,
                                arguments: args as Record<string, unknown>,
                                context,
                              });
                              setTestResult(
                                `${result.status}${result.isError ? " · error" : ""}\n${result.output}`,
                              );
                              await refreshGrants(selectedServer.serverId);
                            })
                          }
                        >
                          Run approved tool
                        </button>
                        {testResult && <pre className="mcp-tool-result">{testResult}</pre>}
                      </div>
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
        <output {...staticHintProps} data-block>
          {message}
        </output>
      )}
    </section>
  );
}
