import { useEffect, useMemo, useRef, useState } from "react";
import type { SafetyActivityEntry, SafetyActivityPage } from "@aux/contracts/safety-activity";
import { bridge } from "../../bridge";
import { call, errToast, useStore } from "../../store";
import { openSavedTask } from "../../task-navigation";
import { errorMessage } from "../../error-message";
import { smallButtonProps } from "../../ui/button-props";

export function ActivityLog({ active }: { active: boolean }) {
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const owner = useMemo(
    () => ({ windowId, kind, privateMode, active }),
    [windowId, kind, privateMode, active],
  );
  const live = useRef<typeof owner | null>(null),
    sequence = useRef(0),
    pending = useRef(false);
  const [result, setResult] = useState<{
    owner: typeof owner;
    entries: SafetyActivityEntry[];
    cursor: SafetyActivityPage["nextCursor"];
  } | null>(null);
  const [status, setStatus] = useState<{ owner: typeof owner; loading: boolean; error: string } | null>(null);
  const current = () =>
    live.current === owner &&
    bridge.windowId === owner.windowId &&
    bridge.windowKind === owner.kind &&
    bridge.privateMode === owner.privateMode;
  async function load(append = false) {
    if (!current() || pending.current) return;
    const cursor = append && result?.owner === owner ? result.cursor : undefined;
    if (append && !cursor) return;
    const version = ++sequence.current;
    pending.current = true;
    setStatus({ owner, loading: true, error: "" });
    try {
      const page = await call("safety.decisions.list", { limit: 50, ...(cursor ? { cursor } : {}) });
      if (!current() || version !== sequence.current) return;
      setResult((previous) => {
        const entries = append && previous?.owner === owner ? previous.entries : [];
        const known = new Set(entries.map((entry) => entry.decisionId));
        return {
          owner,
          entries: [...entries, ...page.entries.filter((entry) => !known.has(entry.decisionId))],
          cursor: page.nextCursor,
        };
      });
      setStatus({ owner, loading: false, error: "" });
    } catch (reason) {
      if (current() && version === sequence.current)
        setStatus({ owner, loading: false, error: errorMessage(reason) });
    } finally {
      if (version === sequence.current) pending.current = false;
    }
  }
  useEffect(() => {
    if (!active) return;
    live.current = owner;
    pending.current = false;
    void load();
    return () => {
      if (live.current === owner) live.current = null;
      ++sequence.current;
      pending.current = false;
    };
    // This fetch belongs to the committed owner; pagination is explicit user input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, active]);
  const entries = result?.owner === owner ? result.entries : [];
  const loading = status?.owner === owner ? status.loading : active;
  const error = status?.owner === owner ? status.error : "";
  return (
    <div className="permission-activity" aria-busy={loading}>
      <p>
        Review what Aux allowed, asked about or blocked. Task receipts offer undo for supported browser-local
        changes.
      </p>
      {error && (
        <p role="alert">
          {error}
          <button {...smallButtonProps} onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}
      {entries.map((entry) => (
        <article className="permission-activity-entry" key={entry.decisionId}>
          <div>
            <strong>{entry.action}</strong>
            <time dateTime={new Date(entry.at).toISOString()}>{new Date(entry.at).toLocaleString()}</time>
          </div>
          <p>
            {entry.status === "allow" ? "Allowed" : entry.status === "ask" ? "Asked" : "Blocked"} ·{" "}
            {entry.category} · {entry.actor}
          </p>
          {entry.origin && <span>{entry.origin}</span>}
          {entry.guidance && <p>{entry.guidance}</p>}
          {entry.taskId ? (
            <button {...smallButtonProps} onClick={() => void openSavedTask(entry.taskId!).catch(errToast)}>
              Review task receipt
            </button>
          ) : entry.runId ? (
            <button {...smallButtonProps} onClick={() => useStore.getState().openConversation(entry.runId!)}>
              Open chat
            </button>
          ) : null}
        </article>
      ))}
      {loading && <output>Loading activity…</output>}
      {!loading && !error && !entries.length && <p>No recorded decisions yet.</p>}
      {result?.owner === owner && result.cursor && (
        <button {...smallButtonProps} disabled={loading} onClick={() => void load(true)}>
          Load more activity
        </button>
      )}
    </div>
  );
}
