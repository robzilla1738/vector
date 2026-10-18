import {
  staticMcpSourceLabelProps,
  staticMcpSourceValueProps,
  staticFieldProps,
  staticFieldErrorProps,
} from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import "./OutboundMcpSettings.css";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { OFFICIAL_MCP_CONNECTORS } from "@aux/contracts";
import { Button, Select } from "../ui";
import { SettingsField } from "../settings/primitives";
import { SettingsDialogControl } from "../settings/SettingsDialogControl";
import { McpOAuthSetup } from "./McpOAuthSetup";
import type { OutboundMcpServer, OutboundMcpTool, Task, Workspace } from "@aux/contracts";
import { McpToolAccess } from "../features/mcp/ToolAccess";
import { bridge } from "../bridge";
import { call } from "../store";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticDrawerSectionProps as auxClassDrawerSectionProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type BundleInspection = {
  path: string;
  sha256: string;
  format: "mcpb" | "dxt";
  name: string;
  server: Record<string, unknown>;
};
function errorText(reason: unknown) {
  return errorMessage(reason);
}

function AddServerForm({
  busy,
  canSubmit,
  submit,
  close,
  children,
}: {
  busy: boolean;
  canSubmit: boolean;
  submit(): Promise<boolean>;
  close(): void;
  children: ReactNode;
}) {
  const mounted = useRef(false);
  const submitting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (
    <form
      className="outbound-mcp mcp-add-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy || !canSubmit || submitting.current) return;
        submitting.current = true;
        try {
          if ((await submit()) && mounted.current) close();
        } finally {
          submitting.current = false;
        }
      }}
    >
      {children}
      <footer>
        <Button tone="ghost" disabled={busy} onClick={close}>
          Cancel
        </Button>
        <Button tone="primary" type="submit" disabled={busy || !canSubmit}>
          {busy ? "Adding…" : "Add server"}
        </Button>
      </footer>
    </form>
  );
}

function ServerSource({ server }: { server: OutboundMcpServer }) {
  const source = server.source;
  return (
    <div className="mcp-source-details">
      <div>
        <span {...staticMcpSourceLabelProps}>Server</span>
        <div {...staticMcpSourceValueProps}>{server.name}</div>
      </div>
      <div>
        <span {...staticMcpSourceLabelProps}>Kind</span>
        <div {...staticMcpSourceValueProps}>
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
            <span {...staticMcpSourceLabelProps}>Executable</span>
            <div {...staticMcpSourceValueProps}>
              <code>{source.command}</code>
            </div>
          </div>
          <div>
            <span {...staticMcpSourceLabelProps}>Arguments</span>
            <div {...staticMcpSourceValueProps}>
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
            <span {...staticMcpSourceLabelProps}>Working directory</span>
            <div {...staticMcpSourceValueProps}>
              <code>{source.cwd}</code>
            </div>
          </div>
        </>
      )}
      {source.kind === "remote" && (
        <>
          <div>
            <span {...staticMcpSourceLabelProps}>Endpoint</span>
            <div {...staticMcpSourceValueProps}>
              <code>{source.url}</code>
            </div>
          </div>
          <div>
            <span {...staticMcpSourceLabelProps}>Authentication</span>
            <div {...staticMcpSourceValueProps}>{source.auth === "oauth" ? "OAuth" : "None"}</div>
          </div>
        </>
      )}
      {source.kind === "bundle" && (
        <>
          <div>
            <span {...staticMcpSourceLabelProps}>Original bundle</span>
            <div {...staticMcpSourceValueProps}>
              <code>{source.path}</code>
            </div>
          </div>
          <div>
            <span {...staticMcpSourceLabelProps}>Format</span>
            <div {...staticMcpSourceValueProps}>{source.format.toUpperCase()}</div>
          </div>
          <div>
            <span {...staticMcpSourceLabelProps}>Installed copy SHA-256</span>
            <div {...staticMcpSourceValueProps}>
              <code>{source.sha256}</code>
            </div>
          </div>
        </>
      )}
      <div>
        <span {...staticMcpSourceLabelProps}>Source fingerprint</span>
        <div {...staticMcpSourceValueProps}>
          <code>{server.sourceDigest}</code>
        </div>
      </div>
    </div>
  );
}

export function OutboundMcpSettings({ active = true }: { active?: boolean } = {}) {
  const controlId = useId();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [servers, setServers] = useState<OutboundMcpServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [tools, setTools] = useState<OutboundMcpTool[] | null>(null);
  const [sourceKind, setSourceKind] = useState<"local" | "remote" | "bundle">("remote");
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [argumentsText, setArgumentsText] = useState("");
  const [cwd, setCwd] = useState("");
  const [url, setUrl] = useState("");
  const [auth, setAuth] = useState<"oauth" | "none">("oauth");
  const [bundle, setBundle] = useState<BundleInspection | null>(null);
  const [toolName, setToolName] = useState("");
  const [scopeKind, setScopeKind] = useState<"workspace" | "task">("workspace");
  const [taskId, setTaskId] = useState("");
  const [testArguments, setTestArguments] = useState("{}");
  const [testResult, setTestResult] = useState("");
  const [oauthStatusRecord, setOauthStatusRecord] = useState<
    (import("@aux/contracts").MethodResult<"mcp.oauth.status"> & { serverId: string }) | null
  >(null);
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
      ? { workspaceId, taskId: selectedTask.taskId, revision: selectedTask.revision }
      : scopeKind === "workspace" && workspaceId
        ? { workspaceId }
        : null;
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
    if (selectedServer?.state !== "active" || selectedAuth !== "oauth") return;
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
      return true;
    } catch (reason) {
      setError(errorText(reason));
      return false;
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
      setToolName("");
    }
  };
  const register = async () => {
    if (!workspaceId || !name.trim()) return false;
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
    else return false;
    return action(async () => {
      const server = await call("mcp.servers.register", { workspaceId, name: name.trim(), source });
      await refreshServers(server.serverId);
      setName("");
      setBundle(null);
      setMessage(
        source.kind === "bundle"
          ? "Bundle added as an immutable inspected copy. Its tools are enabled; change them in Permissions."
          : "Server added. Its tools are enabled; change them in Permissions.",
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

  return (
    <section className="field outbound-mcp" aria-label="MCP servers" data-setting="MCP servers">
      <div {...auxClassDrawerSectionProps}>MCP servers</div>
      <p {...staticHintProps}>
        Adding a server to a Space enables its tools. Review the source before adding it, then use the
        switches to disable individual tools. Local commands stay sandboxed. OAuth connections require a
        native credential.
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
          <SettingsField compact label="Space">
            <Select
              aria-label="MCP Space"
              value={workspaceId}
              disabled={busy}
              onChange={(event) => {
                setWorkspaceId(event.target.value);
                setSelectedServerId("");
                setServers([]);
                setTools(null);
                setAuthorizationReview(null);
              }}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.workspaceId} value={workspace.workspaceId}>
                  {workspace.name}
                </option>
              ))}
            </Select>
          </SettingsField>
          <SettingsDialogControl
            active={active}
            size="wide"
            label="Add an MCP server"
            action="＋ Add server…"
          >
            {(close) => (
              <AddServerForm
                busy={busy}
                canSubmit={
                  !!workspaceId &&
                  !!name.trim() &&
                  (sourceKind === "bundle"
                    ? !!bundle
                    : sourceKind === "local"
                      ? !!command.trim() && !!cwd.trim()
                      : url.startsWith("https://"))
                }
                submit={register}
                close={close}
              >
                <details className="mcp-official-connections">
                  <summary>Official remote connections</summary>
                  {OFFICIAL_MCP_CONNECTORS.map((connector) => (
                    <div key={connector.id}>
                      <strong>{connector.name}</strong>
                      <p>{connector.help}</p>
                      <p>
                        <code>{connector.url}</code>
                      </p>
                      <button
                        type="button"
                        className="btn sm ghost"
                        disabled={busy}
                        onClick={() => {
                          setSourceKind("remote");
                          setName(connector.name);
                          setUrl(connector.url);
                          setAuth("oauth");
                          setMessage(`Review ${connector.name} below, then add it to this Space.`);
                        }}
                      >
                        Set up {connector.name}
                      </button>
                      <button
                        type="button"
                        className="btn sm ghost"
                        disabled={busy}
                        onClick={() =>
                          void action(async () => {
                            await bridge.openExternal(connector.registrationUrl);
                          })
                        }
                      >
                        Open {connector.name} registration guide
                      </button>
                    </div>
                  ))}
                </details>
                <div
                  className="settings-editor-fields inline-labels"
                  role="group"
                  aria-label="Server connection"
                >
                  <label htmlFor={`${controlId}-source`}>
                    Source
                    <Select
                      disabled={busy}
                      id={`${controlId}-source`}
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
                    </Select>
                  </label>
                  <label>
                    Server name
                    <input
                      disabled={busy}
                      value={name}
                      maxLength={200}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="A name you recognize"
                    />
                  </label>
                  {sourceKind === "remote" && (
                    <>
                      <label>
                        HTTPS endpoint
                        <input
                          disabled={busy}
                          type="url"
                          value={url}
                          onChange={(event) => setUrl(event.target.value)}
                          placeholder="https://example.com/mcp"
                        />
                      </label>
                      <label htmlFor={`${controlId}-authentication`}>
                        Authentication
                        <Select
                          disabled={busy}
                          id={`${controlId}-authentication`}
                          value={auth}
                          onChange={(event) => setAuth(event.target.value as typeof auth)}
                        >
                          <option value="oauth">OAuth</option>
                          <option value="none">None</option>
                        </Select>
                      </label>
                    </>
                  )}
                  {sourceKind === "local" && (
                    <>
                      <p {...staticHintProps}>
                        Enter an executable and one argument per line. Aux does not run it while you edit this
                        form. The working directory is readable by the server. Network and file writes are
                        blocked. Do not put secrets in arguments.
                      </p>
                      <label>
                        Executable path
                        <input
                          disabled={busy}
                          value={command}
                          onChange={(event) => setCommand(event.target.value)}
                          placeholder="/absolute/path/to/server"
                        />
                      </label>
                      <label>
                        Working directory
                        <input
                          disabled={busy}
                          value={cwd}
                          onChange={(event) => setCwd(event.target.value)}
                          placeholder="/absolute/project/path"
                        />
                      </label>
                      <label>
                        Arguments, one per line
                        <textarea
                          disabled={busy}
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
                        Aux supports self-contained Node bundles with static arguments and bundled files.
                        Python, UV, binary servers, host settings and environment values are not supported
                        yet.
                      </p>
                      <button
                        {...smallButtonProps}
                        {...auxNativeButtonTypeProps}
                        disabled={busy}
                        onClick={() => void inspectBundle()}
                      >
                        Choose and inspect bundle…
                      </button>
                      {bundle && (
                        <div className="mcp-source-details">
                          <div>
                            <span {...staticMcpSourceLabelProps}>Original bundle</span>
                            <div {...staticMcpSourceValueProps}>
                              <code>{bundle.path}</code>
                            </div>
                          </div>
                          <div>
                            <span {...staticMcpSourceLabelProps}>Format</span>
                            <div {...staticMcpSourceValueProps}>{bundle.format.toUpperCase()}</div>
                          </div>
                          <div>
                            <span {...staticMcpSourceLabelProps}>SHA-256</span>
                            <div {...staticMcpSourceValueProps}>
                              <code>{bundle.sha256}</code>
                            </div>
                          </div>
                          <div>
                            <span {...staticMcpSourceLabelProps}>Manifest server</span>
                            <div {...staticMcpSourceValueProps}>
                              <code>{JSON.stringify(bundle.server)}</code>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {error && <p role="alert">{error}</p>}
                {message && <output>{message}</output>}
              </AddServerForm>
            )}
          </SettingsDialogControl>
          <div {...auxClassDrawerSectionProps}>Servers in this Space</div>
          {!servers.length && <p {...staticHintProps}>No MCP servers saved in this Space.</p>}
          {!!servers.length && (
            <SettingsField compact label="Review server">
              <Select
                aria-label="Review MCP server"
                value={selectedServerId}
                onChange={(event) => {
                  setSelectedServerId(event.target.value);
                  setTools(null);
                  setToolName("");
                  setAuthorizationReview(null);
                }}
              >
                {servers.map((server) => (
                  <option key={server.serverId} value={server.serverId}>
                    {server.name} · {server.state}
                  </option>
                ))}
              </Select>
            </SettingsField>
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
              {selectedServer.state === "active" &&
                selectedServer.source.kind === "remote" &&
                selectedServer.source.auth === "oauth" && (
                  <div {...staticFieldProps}>
                    <strong>OAuth authorization</strong>
                    <McpOAuthSetup
                      key={selectedServer.serverId}
                      serverId={selectedServer.serverId}
                      onConfigured={() => {
                        setOauthStatusRecord({ serverId: selectedServer.serverId, connected: false });
                        setTools(null);
                        setToolName("");
                        setTestResult("");
                      }}
                    />
                    <p {...staticHintProps}>
                      {oauthStatus?.connected
                        ? `Connected in this Profile${oauthExpiry}.`
                        : pendingOAuth?.serverId === selectedServer.serverId
                          ? "Finish authorization in the window that opened."
                          : "Connect this reviewed server before loading tools. " +
                            "Aux stores credentials in the Profile Keychain."}
                    </p>
                    {oauthStatus?.connected && (
                      <>
                        <p {...staticHintProps}>
                          {oauthStatus.account
                            ? `Account: ${oauthStatus.account.workspaceName ?? oauthStatus.account.workspaceId ?? "workspace not reported"} · ${oauthStatus.account.userId ?? "user not reported"}`
                            : "The provider did not report account identity."}
                        </p>
                        <p {...staticHintProps}>
                          Granted scopes:{" "}
                          {oauthStatus.grantedScopes?.join(", ") ?? "not reported by provider"}.
                        </p>
                      </>
                    )}
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
                              setToolName("");
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
                          <span {...staticMcpSourceLabelProps}>Authorization destination</span>
                          <div {...staticMcpSourceValueProps}>
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
              {selectedServer.state === "active" && (
                <button
                  {...smallGhostButtonProps}
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      setTools(null);
                      const result = await call("mcp.tools.list", { serverId: selectedServer.serverId });
                      await refreshServers(selectedServer.serverId);
                      setTools(result);
                      setToolName("");
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
                      setTools(null);
                      setAuthorizationReview(null);
                      setPendingOAuth(null);
                      setOauthStatusRecord(null);
                      setToolName("");
                      setTestResult("");
                      setMessage("Server disconnected. Active calls were stopped.");
                    })
                  }
                >
                  Disconnect server
                </button>
              )}
              {selectedServer.state === "revoked" && (
                <p {...staticHintProps}>
                  This server is revoked. Register a new reviewed source to reconnect it.
                </p>
              )}
              {selectedServer.state === "active" && tools && (
                <McpToolAccess
                  server={selectedServer}
                  tools={tools}
                  disabled={busy}
                  onChange={(updated) =>
                    setServers((items) =>
                      items.map((item) => (item.serverId === updated.serverId ? updated : item)),
                    )
                  }
                  onCall={(tool) => {
                    setToolName(tool.name);
                    setTestArguments("{}");
                    setTestResult("");
                  }}
                />
              )}
              {selectedServer.state === "active" &&
                toolName &&
                tools?.some((tool) => tool.name === toolName) &&
                !selectedServer.disabledTools.includes(toolName) && (
                  <div className="mcp-tool-test">
                    <h4>Call {toolName}</h4>
                    <label htmlFor={`${controlId}-scope`}>
                      Task context
                      <Select
                        id={`${controlId}-scope`}
                        aria-label="MCP call scope"
                        value={scopeKind}
                        disabled={busy}
                        onChange={(event) =>
                          setScopeKind(event.target.value === "task" ? "task" : "workspace")
                        }
                      >
                        <option value="workspace">This Space</option>
                        <option value="task">One task</option>
                      </Select>
                    </label>
                    {scopeKind === "task" && (
                      <label htmlFor={`${controlId}-task`}>
                        Task
                        <Select
                          id={`${controlId}-task`}
                          aria-label="MCP call task"
                          value={taskId}
                          disabled={busy}
                          onChange={(event) => setTaskId(event.target.value)}
                        >
                          <option value="">Choose a task</option>
                          {availableTasks.map((task) => (
                            <option key={task.taskId} value={task.taskId}>
                              {task.title} · revision {task.revision}
                            </option>
                          ))}
                        </Select>
                      </label>
                    )}
                    <label>
                      Tool arguments as JSON
                      <textarea
                        aria-label="MCP tool arguments"
                        rows={3}
                        value={testArguments}
                        onChange={(event) => setTestArguments(event.target.value)}
                      />
                    </label>
                    <button
                      {...smallButtonProps}
                      disabled={busy || !scope}
                      onClick={() =>
                        void action(async () => {
                          if (!scope) return;
                          const args: unknown = JSON.parse(testArguments);
                          if (!args || typeof args !== "object" || Array.isArray(args))
                            throw new Error("Tool arguments must be a JSON object.");
                          const result = await call("mcp.tools.call", {
                            serverId: selectedServer.serverId,
                            toolName,
                            arguments: args as Record<string, unknown>,
                            context: scope,
                          });
                          setTestResult(
                            `${result.status}${result.isError ? " · error" : ""}\n${result.output}`,
                          );
                        })
                      }
                    >
                      Run tool
                    </button>
                    {testResult && <pre className="mcp-tool-result">{testResult}</pre>}
                  </div>
                )}
            </div>
          )}
        </>
      )}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
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
