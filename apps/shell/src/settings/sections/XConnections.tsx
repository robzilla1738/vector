import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { XScopeSchema, type XScope, type XOperation, type MethodResult, type Task } from "@aux/contracts";
import { call } from "../../store";
import { bridge } from "../../bridge";
import { errorMessage } from "../../error-message";
import "../../components/ConnectionSettings.css";
import { Checkbox, SettingsGroup } from "../../ui";
import { ConnectionSelect as Select } from "../../components/ConnectionSelect";
import { shellIconDown } from "../../ui/icons";
import { SettingsSection, SettingsField } from "../primitives";
const requiredScopes: XScope[] = ["tweet.read", "users.read", "offline.access"];
const scopeLabels: Record<XScope, string> = {
  "tweet.read": "Read posts (required for account identity)",
  "users.read": "Read account identity and profiles (required)",
  "offline.access": "Keep this account connected (required)",
  "tweet.write": "Publish posts and replies",
  "follows.read": "Read followers and following",
  "follows.write": "Follow and unfollow accounts",
  "bookmark.read": "Read private bookmarks",
  "bookmark.write": "Add and remove bookmarks",
  "dm.read": "Read direct-message events",
  "dm.write": "Send direct messages",
};
const operationLabel = (operation: XOperation) => operation.replaceAll(".", " · ");
/** Connection metadata and grants come from real account authority; no account is fabricated for setup. */
export function XConnections({ active }: { active: boolean }) {
  const [snapshot, setSnapshot] = useState<MethodResult<"x.accounts.list">>();
  const [tasks, setTasks] = useState<Task[]>([]),
    [accountId, setAccountId] = useState(""),
    [taskId, setTaskId] = useState("");
  const [scopes, setScopes] = useState<XScope[]>([...requiredScopes]),
    [operations, setOperations] = useState<XOperation[]>([]);
  const [grants, setGrants] = useState<MethodResult<"x.grants.list">>([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [pendingUntil, setPendingUntil] = useState(0);
  const pendingBaseline = useRef(new Map<string, string>());
  const loadSequence = useRef(0);
  const owner = useRef({ active: false, mounted: false, generation: 0, windowId: bridge.windowId });
  useLayoutEffect(() => {
    const state = owner.current;
    state.mounted = true;
    return () => {
      state.mounted = false;
      state.generation++;
    };
  }, []);
  useLayoutEffect(() => {
    owner.current.active = active;
    if (!active) owner.current.generation++;
    else setBusy(false);
  }, [active]);
  const current = useCallback(() => {
    if (
      !owner.current.active ||
      !owner.current.mounted ||
      bridge.privateMode ||
      owner.current.windowId !== bridge.windowId
    )
      throw new Error("Use the original normal X Settings window.");
  }, []);
  const reload = useCallback(async () => {
    current();
    const generation = owner.current.generation,
      sequence = ++loadSequence.current;
    const [next, savedTasks] = await Promise.all([
      call("x.accounts.list", {}),
      call("tasks.list", { includeArchived: false, limit: 500 }),
    ]);
    current();
    if (generation !== owner.current.generation || sequence !== loadSequence.current) return;
    setSnapshot(next);
    setTasks(savedTasks);
    setAccountId((id) =>
      next.connections.some((a) => a.connectionId === id) ? id : (next.connections[0]?.connectionId ?? ""),
    );
    setTaskId((id) =>
      savedTasks.some((t) => t.taskId === id && t.state === "open")
        ? id
        : (savedTasks.find((t) => t.state === "open")?.taskId ?? ""),
    );
  }, [current]);
  useEffect(() => {
    if (active && !bridge.privateMode)
      void reload().catch((reason) => {
        if (owner.current.active) setError(errorMessage(reason));
      });
  }, [active, reload]);
  useEffect(() => {
    if (!active || !pendingUntil) return;
    const timer = setInterval(() => {
      if (Date.now() > pendingUntil) {
        setPendingUntil(0);
        setNotice("Sign-in expired. You can start it again.");
        return;
      }
      void reload().catch((reason) => {
        if (owner.current.active) setError(errorMessage(reason));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [active, pendingUntil, reload]);
  useEffect(() => {
    if (
      pendingUntil &&
      snapshot?.connections.some(
        (account) => pendingBaseline.current.get(account.connectionId) !== account.revision,
      )
    ) {
      setPendingUntil(0);
      setNotice("X account connected. Review its available operations before granting task access.");
    }
  }, [pendingUntil, snapshot]);
  const account = snapshot?.connections.find((a) => a.connectionId === accountId),
    task = tasks.find((t) => t.taskId === taskId && t.state === "open");
  useEffect(() => {
    setOperations([]);
  }, [accountId, account?.revision, taskId, task?.revision]);
  useEffect(() => {
    let valid = true;
    setGrants([]);
    if (!active || !taskId) return;
    void call("x.grants.list", { taskId })
      .then((next) => {
        if (valid && owner.current.active) setGrants(next);
      })
      .catch((reason) => {
        if (valid && owner.current.active) setError(errorMessage(reason));
      });
    return () => {
      valid = false;
    };
  }, [active, taskId, task?.revision, account?.revision]);
  const perform = async (action: (check: () => void) => Promise<void>) => {
    current();
    const generation = owner.current.generation;
    setBusy(true);
    setError("");
    try {
      const check = () => {
        current();
        if (generation !== owner.current.generation)
          throw new Error("The original X Settings action retired.");
      };
      await action(check);
      check();
      if (generation === owner.current.generation) await reload();
    } catch (reason) {
      if (owner.current.mounted && owner.current.active && generation === owner.current.generation)
        setError(errorMessage(reason));
    } finally {
      if (owner.current.mounted && owner.current.active && generation === owner.current.generation)
        setBusy(false);
    }
  };
  if (bridge.privateMode) return null;
  return (
    <SettingsSection className="connection-section" name="X accounts" title="X accounts">
      <p className="connection-description hint">
        Choose account permissions, then grant precise operations to a saved task. New grants apply to future
        runs; uncertain writes are never sent again automatically.
      </p>
      {error && (
        <p role="alert" className="connection-message field-error">
          {error}
        </p>
      )}
      {notice && <output className="connection-message hint">{notice}</output>}
      {!snapshot ? (
        <>
          <p>{error ? "X account availability could not be loaded." : "Loading X account availability…"}</p>
          <button className="btn" disabled={busy} onClick={() => void perform(async () => {})}>
            Refresh accounts
          </button>
        </>
      ) : (
        <>
          {!snapshot.available && (
            <p className="connection-message hint">
              {snapshot.reason ?? "X account registration is not configured for this build."}
            </p>
          )}
          <details className="connection-permissions settings-card">
            <summary>
              <span>X permissions</span>
              <span className="hint">{scopes.length} selected</span>
              <span className="connection-disclosure-icon" aria-hidden="true">
                {shellIconDown}
              </span>
            </summary>
            <p className="connection-description hint">
              Each sign-in requests the shown identity/offline scopes and your selected permissions, replacing
              this account’s previous Aux scopes. Task grants cannot broaden X permissions. X product access
              and endpoint limits still apply.
            </p>
            <div className="connection-options">
              {XScopeSchema.options
                .filter((scope) => scopeLabels[scope])
                .map((scope) => (
                  <label key={scope}>
                    <Checkbox
                      disabled={busy || !snapshot.available || requiredScopes.includes(scope)}
                      checked={scopes.includes(scope)}
                      onChange={(event) =>
                        setScopes((previous) =>
                          event.target.checked
                            ? [...previous, scope]
                            : previous.filter((value) => value !== scope),
                        )
                      }
                    />
                    {scopeLabels[scope]}
                  </label>
                ))}
            </div>
          </details>
          <div className="connection-actions">
            <button
              className="btn"
              disabled={busy || !snapshot.available || !scopes.length}
              onClick={() =>
                void perform(async (check) => {
                  pendingBaseline.current = new Map(
                    snapshot.connections.map((item) => [item.connectionId, item.revision]),
                  );
                  const selected = [...scopes],
                    auth = await call("x.auth.start", { scopes: selected });
                  check();
                  await bridge.openExternal(auth.url);
                  check();
                  setPendingUntil(auth.expiresAt);
                  setNotice("Complete X sign-in in the opened browser, then refresh the accounts.");
                })
              }
            >
              Connect X account
            </button>
            <button className="btn" disabled={busy} onClick={() => void perform(async () => {})}>
              Refresh accounts
            </button>
          </div>
          {!!snapshot.connections.length && (
            <>
              <SettingsGroup>
                <SettingsField label="Account">
                  <Select
                    aria-label="X account"
                    value={accountId}
                    disabled={busy}
                    onChange={(event) => setAccountId(event.target.value)}
                  >
                    {snapshot.connections.map((item) => (
                      <option key={item.connectionId} value={item.connectionId}>
                        {item.label} · {item.username}
                      </option>
                    ))}
                  </Select>
                </SettingsField>
              </SettingsGroup>
              {account && (
                <>
                  <p>
                    {account.state === "active" ? "Connected" : "Reconnect required"} ·{" "}
                    {account.operations.length} available operations
                  </p>
                  <details className="connection-permissions settings-card">
                    <summary>
                      Granted X permissions
                      <span className="connection-disclosure-icon" aria-hidden="true">
                        {shellIconDown}
                      </span>
                    </summary>
                    <ul>
                      {account.scopes.map((scope) => (
                        <li key={scope}>{scopeLabels[scope]}</li>
                      ))}
                    </ul>
                  </details>
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      void perform(async (check) => {
                        const captured = {
                          connectionId: account.connectionId,
                          expectedRevision: account.revision,
                        };
                        await call("x.accounts.revoke", captured);
                        check();
                        setNotice(
                          "Account disconnected. X may require a separate permission review in your X account.",
                        );
                      })
                    }
                  >
                    Disconnect account
                  </button>
                  <SettingsGroup>
                    <SettingsField
                      label="Saved task"
                      hint="Task grants bind this account revision and the current task revision."
                    >
                      <Select
                        aria-label="X task"
                        value={taskId}
                        disabled={busy}
                        onChange={(event) => setTaskId(event.target.value)}
                      >
                        <option value="">Choose an open saved task</option>
                        {tasks
                          .filter((item) => item.state === "open")
                          .map((item) => (
                            <option key={item.taskId} value={item.taskId}>
                              {item.title}
                            </option>
                          ))}
                      </Select>
                    </SettingsField>
                  </SettingsGroup>
                  {task && (
                    <>
                      <details className="connection-permissions settings-card">
                        <summary>
                          <span>Task operations</span>
                          <span className="hint">{operations.length} selected</span>
                          <span className="connection-disclosure-icon" aria-hidden="true">
                            {shellIconDown}
                          </span>
                        </summary>
                        <div className="connection-options">
                          {account.operations.length ? (
                            account.operations.map((operation) => (
                              <label key={operation}>
                                <Checkbox
                                  checked={operations.includes(operation)}
                                  disabled={busy}
                                  onChange={(event) =>
                                    setOperations((previous) =>
                                      event.target.checked
                                        ? [...previous, operation]
                                        : previous.filter((value) => value !== operation),
                                    )
                                  }
                                />
                                {operationLabel(operation)}
                              </label>
                            ))
                          ) : (
                            <p>
                              No operations are available with this account’s current registration and
                              permissions.
                            </p>
                          )}
                        </div>
                      </details>
                      <button
                        className="btn"
                        disabled={busy || !operations.length}
                        onClick={() =>
                          void perform(async (check) => {
                            const captured = {
                              taskId: task.taskId,
                              taskRevision: task.revision,
                              workspaceId: task.workspaceId,
                              connectionId: account.connectionId,
                              accountRevision: account.revision,
                              operations: [...operations],
                            };
                            await call("x.grants.create", captured);
                            check();
                            setOperations([]);
                            const next = await call("x.grants.list", { taskId: captured.taskId });
                            check();
                            setGrants(next);
                            setNotice(
                              "Selected operations granted to this task revision. Start a new run to use them.",
                            );
                          })
                        }
                      >
                        Grant selected operations
                      </button>
                      {grants
                        .filter((grant) => grant.connectionId === account.connectionId)
                        .map((grant) => (
                          <div className="connection-grant settings-card" key={grant.grantId}>
                            <p>
                              Task revision {grant.taskRevision} ·{" "}
                              {grant.operations.map(operationLabel).join(", ")}
                              {grant.accountRevision !== account.revision
                                ? " · Account changed; grant unavailable"
                                : ""}
                            </p>
                            <button
                              className="btn"
                              disabled={busy}
                              onClick={() =>
                                void perform(async (check) => {
                                  await call("x.grants.revoke", {
                                    taskId: grant.taskId,
                                    grantId: grant.grantId,
                                  });
                                  check();
                                  const next = await call("x.grants.list", { taskId: grant.taskId });
                                  check();
                                  setGrants(next);
                                })
                              }
                            >
                              Revoke task access
                            </button>
                          </div>
                        ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </SettingsSection>
  );
}
