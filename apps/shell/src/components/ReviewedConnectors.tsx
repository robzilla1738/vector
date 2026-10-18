import { ConnectionSelect as Select } from "./ConnectionSelect";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import "./ReviewedConnectors.css";
import "./ConnectionSettings.css";
import { SettingsField } from "../settings/primitives";
import { useEffect, useState } from "react";
import type { ConnectorCatalog, ConnectorEntry, Task, Workspace } from "@aux/contracts";
import { call } from "../store";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticErrorHintProps as auxClassErrorHintProps } from "../ui/class-props";
import { nativePoliteLiveProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

type Kind = ConnectorEntry["kind"];
type Review = {
  kind: "grant" | "revoke";
  connectorId: string;
  taskId: string;
  revision: number;
  connectionId: string;
  grantId?: string;
};

function errorText(reason: unknown) {
  return errorMessage(reason);
}

function stateLabel(entry: ConnectorEntry) {
  switch (entry.state) {
    case "active":
      return "Connected";
    case "needs_reauth":
      return "Reconnect required";
    case "revoked":
      return "Revoked";
  }
}

export function ReviewedConnectors({ onManage }: { onManage: (kind: Kind) => void }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [catalog, setCatalog] = useState<ConnectorCatalog | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const availableTasks = tasks.filter((task) => task.workspaceId === workspaceId && task.state === "open");
  const task = availableTasks.find((item) => item.taskId === taskId);
  const entry = catalog?.entries.find((item) => item.connectorId === selectedId);
  const access = catalog?.access.filter((item) => item.connectorId === selectedId) ?? [];

  const refresh = async () => {
    setCatalog(null);
    const [spaces, savedTasks] = await Promise.all([
      call("workspaces.list", {}),
      call("tasks.list", { includeArchived: false, limit: 500 }),
    ]);
    setWorkspaces(spaces);
    setTasks(savedTasks);
    const nextSpace = spaces.some((item) => item.workspaceId === workspaceId)
      ? workspaceId
      : (spaces[0]?.workspaceId ?? "");
    setWorkspaceId(nextSpace);
    setTaskId((current) =>
      savedTasks.some(
        (item) => item.taskId === current && item.workspaceId === nextSpace && item.state === "open",
      )
        ? current
        : (savedTasks.find((item) => item.workspaceId === nextSpace && item.state === "open")?.taskId ?? ""),
    );
    setReload((current) => current + 1);
  };

  useEffect(() => {
    let active = true;
    void Promise.all([
      call("workspaces.list", {}),
      call("tasks.list", { includeArchived: false, limit: 500 }),
    ])
      .then(([spaces, savedTasks]) => {
        if (!active) return;
        setWorkspaces(spaces);
        setTasks(savedTasks);
        setWorkspaceId(spaces[0]?.workspaceId ?? "");
        setTaskId(
          savedTasks.find((item) => item.workspaceId === spaces[0]?.workspaceId && item.state === "open")
            ?.taskId ?? "",
        );
      })
      .catch((reason) => {
        if (active) setError(errorText(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!workspaceId) {
      setCatalog(null);
      return;
    }
    let active = true;
    setLoading(true);
    setCatalog(null);
    void call("connectors.catalog", {
      workspaceId,
      ...(task ? { taskId: task.taskId, expectedRevision: task.revision } : {}),
    })
      .then((next) => {
        if (!active) return;
        setCatalog(next);
        setSelectedId((current) =>
          next.entries.some((item) => item.connectorId === current)
            ? current
            : (next.entries[0]?.connectorId ?? ""),
        );
        setError("");
      })
      .catch((reason) => {
        if (active) setError(errorText(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [workspaceId, task?.taskId, task?.revision, reload]);

  const submit = async () => {
    if (
      !review ||
      !task ||
      review.taskId !== task.taskId ||
      review.revision !== task.revision ||
      review.connectorId !== selectedId
    )
      return;
    setBusy(true);
    setError("");
    try {
      if (review.kind === "grant")
        await call("calendar.taskGrants.create", {
          taskId: review.taskId,
          expectedRevision: review.revision,
          connectionId: review.connectionId,
        });
      else if (review.grantId)
        await call("calendar.taskGrants.revoke", { taskId: review.taskId, grantId: review.grantId });
      setReview(null);
      await refresh();
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="reviewed-connectors connection-section"
      aria-label="Connector access"
      data-setting="Connector access"
    >
      <header className="connection-section-header">
        <h3 className="connection-heading">Connector access</h3>{" "}
        <button
          className="btn ghost"
          disabled={busy || loading}
          onClick={() => void refresh().catch((reason) => setError(errorText(reason)))}
        >
          Refresh
        </button>
      </header>
      <p {...staticHintProps}>
        Review each connection and the access currently available to a saved task. Connected MCP servers make
        enabled tools available; Calendar access remains scoped to the selected task.
      </p>
      {!workspaces.length ? (
        <p {...staticHintProps}>{loading ? "Loading Spaces…" : "Create a Space to review connectors."}</p>
      ) : (
        <>
          <div className="reviewed-connectors-scope settings-card">
            <SettingsField label="Space">
              <Select
                aria-label="Connector Space"
                value={workspaceId}
                onChange={(event) => {
                  const next = event.target.value;
                  setWorkspaceId(next);
                  setCatalog(null);
                  setTaskId(
                    tasks.find((item) => item.workspaceId === next && item.state === "open")?.taskId ?? "",
                  );
                  setReview(null);
                }}
              >
                {workspaces.map((space) => (
                  <option key={space.workspaceId} value={space.workspaceId}>
                    {space.name}
                  </option>
                ))}
              </Select>
            </SettingsField>
            <SettingsField label="Saved task">
              <Select
                aria-label="Connector task"
                value={task?.taskId ?? ""}
                onChange={(event) => {
                  setTaskId(event.target.value);
                  setCatalog(null);
                  setReview(null);
                }}
              >
                <option value="">Connections only</option>
                {availableTasks.map((item) => (
                  <option key={item.taskId} value={item.taskId}>
                    {item.title} · revision {item.revision}
                  </option>
                ))}
              </Select>
            </SettingsField>
          </div>
          {!loading && !catalog?.entries.length ? (
            <p className="connection-empty settings-card">
              {error
                ? "Connection access could not be loaded. Refresh to try again."
                : "No connections yet. Connect an account below or add an MCP server in Skills & MCP."}
            </p>
          ) : loading ? (
            <output className="connection-empty hint">Loading connector access…</output>
          ) : (
            <div className="reviewed-connectors-layout settings-card">
              <aside className="reviewed-connectors-list" aria-label="Reviewed connections">
                {catalog?.entries.map((item) => (
                  <button
                    key={item.connectorId}
                    {...auxNativeButtonTypeProps}
                    aria-current={selectedId === item.connectorId ? "true" : undefined}
                    onClick={() => {
                      setSelectedId(item.connectorId);
                      setReview(null);
                    }}
                  >
                    <span className="reviewed-connectors-name">{item.label}</span>
                    <span className="reviewed-connectors-sub">
                      {item.kind === "mcp"
                        ? "MCP server"
                        : item.kind === "google"
                          ? "Google account"
                          : item.kind === "x"
                            ? "X account"
                            : "Calendar account"}{" "}
                      · {stateLabel(item)}
                    </span>
                  </button>
                ))}
              </aside>
              <div className="reviewed-connectors-detail" {...nativePoliteLiveProps}>
                {!entry && <p {...staticHintProps}>Choose a connection to review.</p>}
                {entry && (
                  <>
                    <div className="reviewed-connectors-heading">
                      <strong>{entry.label}</strong>
                      <span className="reviewed-connectors-state">{stateLabel(entry)}</span>
                    </div>
                    {entry.kind === "calendar" && (
                      <>
                        <p {...staticHintProps}>Google Calendar · {entry.accountKey} · read-only events</p>
                        <p {...staticHintProps}>
                          Task access requires an explicit account grant for this task revision. Events read
                          during a task may be sent to its selected AI model.
                        </p>
                        {task && access.length === 0 && entry.state === "active" && (
                          <button
                            className="btn"
                            disabled={busy}
                            onClick={() =>
                              setReview({
                                kind: "grant",
                                connectorId: entry.connectorId,
                                taskId: task.taskId,
                                revision: task.revision,
                                connectionId: entry.connectionId,
                              })
                            }
                          >
                            Review Calendar grant
                          </button>
                        )}
                        {access
                          .filter((item) => item.kind === "calendar")
                          .map((item) => (
                            <div className="reviewed-connectors-grant" key={item.grantId}>
                              <span>
                                Granted to {task?.title} · revision {item.taskRevision}
                              </span>
                              <button
                                className="btn ghost"
                                disabled={busy}
                                onClick={() =>
                                  setReview({
                                    kind: "revoke",
                                    connectorId: entry.connectorId,
                                    taskId: item.taskId,
                                    revision: item.taskRevision,
                                    connectionId: entry.connectionId,
                                    grantId: item.grantId,
                                  })
                                }
                              >
                                Review revocation
                              </button>
                            </div>
                          ))}
                        <button className="btn ghost" onClick={() => onManage("calendar")}>
                          Manage Calendar accounts
                        </button>
                      </>
                    )}
                    {entry.kind === "x" && (
                      <>
                        <p {...staticHintProps}>
                          {`@${entry.username}`} · {entry.operations.length} available operations
                        </p>
                        <p {...staticHintProps}>
                          X permissions and saved-task operation grants are separate. Account or task
                          revisions retire prior access.
                        </p>
                        <details>
                          <summary>X permissions</summary>
                          <ul>
                            {entry.scopes.map((scope) => (
                              <li key={scope}>{scope}</li>
                            ))}
                          </ul>
                        </details>
                        {access
                          .filter((item) => item.kind === "x")
                          .map((item) => (
                            <p key={item.grantId}>
                              {item.operations.join(", ")} · task revision {item.taskRevision}
                            </p>
                          ))}
                        <button className="btn ghost" onClick={() => onManage("x")}>
                          Manage X permissions and task access
                        </button>
                      </>
                    )}
                    {entry.kind === "google" && (
                      <>
                        <p {...staticHintProps}>
                          {entry.accountKey} · {entry.operations.length} available operations
                        </p>
                        <p {...staticHintProps}>
                          Google permissions and saved-task operation grants are separate. Account or task
                          revisions retire prior access.
                        </p>
                        <details>
                          <summary>Google permissions</summary>
                          <ul>
                            {entry.scopes.map((scope) => (
                              <li key={scope}>{scope.replace("https://www.googleapis.com/auth/", "")}</li>
                            ))}
                          </ul>
                        </details>
                        {access
                          .filter((item) => item.kind === "google")
                          .map((item) => (
                            <p key={item.grantId}>
                              {item.operations.join(", ")} · task revision {item.taskRevision}
                            </p>
                          ))}
                        <button className="btn ghost" onClick={() => onManage("google")}>
                          Manage Google permissions and task access
                        </button>
                      </>
                    )}
                    {entry.kind === "mcp" && (
                      <>
                        <p {...staticHintProps}>
                          Adding an MCP server enables its tools in this Space. Individual tools can be
                          disabled in Permissions.
                        </p>
                        {task &&
                          access
                            .filter((item) => item.kind === "mcp")
                            .map((item) => (
                              <div
                                className="reviewed-connectors-grant"
                                key={`${item.connectorId}:${item.toolName}`}
                              >
                                <span>
                                  {item.toolName} · enabled · tools revision {item.toolsRevision}
                                </span>
                              </div>
                            ))}
                        <button className="btn ghost" onClick={() => onManage("mcp")}>
                          Manage server and tools
                        </button>
                      </>
                    )}
                    {task && !access.length && (
                      <p className="hint reviewed-connectors-empty">No access for this task revision.</p>
                    )}
                    {!task && (
                      <p className="hint reviewed-connectors-empty">
                        Select a saved task to review its effective access.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {review &&
        entry?.kind === "calendar" &&
        task?.taskId === review.taskId &&
        task.revision === review.revision && (
          <div className="reviewed-connectors-confirm" role="group" aria-label="Calendar grant review">
            <strong>{review.kind === "grant" ? "Grant Calendar access?" : "Revoke Calendar access?"}</strong>
            <p>
              {entry.label} · {entry.accountKey} · {task.title} · revision {task.revision}
            </p>
            <p {...staticHintProps}>
              {review.kind === "grant" ? (
                <>
                  This task and its scoped agents may read events from this account. Provider credentials
                  remain in Aux.
                </>
              ) : (
                <>Further task reads through this grant will stop immediately.</>
              )}
            </p>
            <div {...staticRowProps}>
              <button className="btn" disabled={busy} onClick={() => void submit()}>
                {review.kind === "grant" ? "Grant account" : "Revoke grant"}
              </button>
              <button className="btn ghost" disabled={busy} onClick={() => setReview(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      {error && (
        <p {...auxClassErrorHintProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
    </section>
  );
}
