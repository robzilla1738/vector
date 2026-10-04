import "./ReviewedConnectors.css";
import { useEffect, useState } from "react";
import type { ConnectorCatalog, ConnectorEntry, Task, Workspace } from "@aux/contracts";
import { call } from "../store";

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
  return reason instanceof Error ? reason.message : String(reason);
}

function stateLabel(entry: ConnectorEntry) {
  switch (entry.state) {
    case "active":
    case "approved":
      return "Connected";
    case "needs_reauth":
      return "Reconnect required";
    case "pending":
      return "Source review needed";
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
      className="reviewed-connectors field"
      aria-label="Connector access"
      data-setting="Connector access"
    >
      <div className="drawer-section">Connector access</div>
      <p className="hint">
        Review each connection and the access currently available to a saved task. A connected account or
        approved server alone does not grant a task access.
      </p>
      {!workspaces.length ? (
        <p className="hint">{loading ? "Loading Spaces…" : "Create a Space to review connectors."}</p>
      ) : (
        <>
          <div className="reviewed-connectors-scope">
            <label>
              Space
              <select
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
              </select>
            </label>
            <label>
              Saved task
              <select
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
              </select>
            </label>
            <button
              className="btn sm ghost"
              disabled={busy || loading}
              onClick={() => void refresh().catch((reason) => setError(errorText(reason)))}
            >
              Refresh
            </button>
          </div>
          <div className="reviewed-connectors-layout">
            <aside className="reviewed-connectors-list" aria-label="Reviewed connections">
              {catalog?.entries.map((item) => (
                <button
                  key={item.connectorId}
                  type="button"
                  aria-current={selectedId === item.connectorId ? "true" : undefined}
                  onClick={() => {
                    setSelectedId(item.connectorId);
                    setReview(null);
                  }}
                >
                  <span className="reviewed-connectors-name">{item.label}</span>
                  <span className="reviewed-connectors-sub">
                    {item.kind === "mcp" ? "MCP server" : "Calendar account"} · {stateLabel(item)}
                  </span>
                </button>
              ))}
            </aside>
            <div className="reviewed-connectors-detail" aria-live="polite">
              {loading && <p className="hint">Loading connector access…</p>}
              {!loading && !entry && <p className="hint">Choose a connection to review.</p>}
              {entry && (
                <>
                  <div className="reviewed-connectors-heading">
                    <strong>{entry.label}</strong>
                    <span className="reviewed-connectors-state">{stateLabel(entry)}</span>
                  </div>
                  {entry.kind === "calendar" && (
                    <>
                      <p className="hint">Google Calendar · {entry.accountKey} · read-only events</p>
                      <p className="hint">
                        Task access requires an explicit account grant for this task revision. Events read
                        during a task may be sent to its selected AI model.
                      </p>
                      {task && access.length === 0 && entry.state === "active" && (
                        <button
                          className="btn sm"
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
                              className="btn sm ghost"
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
                      <button className="btn sm ghost" onClick={() => onManage("calendar")}>
                        Manage Calendar accounts
                      </button>
                    </>
                  )}
                  {entry.kind === "mcp" && (
                    <>
                      <p className="hint">
                        Each MCP server source needs review. Each tool needs a separate Space or task grant.
                      </p>
                      {task &&
                        access
                          .filter((item) => item.kind === "mcp")
                          .map((item) => (
                            <div className="reviewed-connectors-grant" key={item.grantId}>
                              <span>
                                {item.toolName} ·{" "}
                                {item.scope === "workspace"
                                  ? "Space-wide grant"
                                  : `task revision ${item.taskRevision}`}
                              </span>
                            </div>
                          ))}
                      <button className="btn sm ghost" onClick={() => onManage("mcp")}>
                        Review server and tool grants
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
            <p className="hint">
              {review.kind === "grant" ? (
                <>
                  This task and its scoped agents may read events from this account. Provider credentials
                  remain in Aux.
                </>
              ) : (
                <>Further task reads through this grant will stop immediately.</>
              )}
            </p>
            <div className="row">
              <button className="btn sm" disabled={busy} onClick={() => void submit()}>
                {review.kind === "grant" ? "Grant account" : "Revoke grant"}
              </button>
              <button className="btn sm ghost" disabled={busy} onClick={() => setReview(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      {error && (
        <p className="hint err" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
