import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { SetMember } from "@vector/contracts";
import { useStore, call, errToast } from "../store";
import { hostOf } from "../workspace";
import { I } from "./icons";

const ORDER: SetMember["status"][] = ["completed", "running", "failed", "queued", "skipped"];

/** A set mapping over its members — progress as a grid of cells, never a percentage. */
export function SetPanel({ setId }: { setId: string }) {
  const set = useStore((s) => s.sets.find((x) => x.setId === setId));
  const members = useStore(useShallow((s) => s.members.filter((m) => m.setId === setId)));
  const setMode = useStore((s) => s.setMode);
  const refreshResults = useStore((s) => s.refreshResults);
  const activate = useStore((s) => s.activate);
  const counts = useMemo(() => {
    const c: Record<SetMember["status"], number> = { completed: 0, running: 0, failed: 0, queued: 0, skipped: 0 };
    for (const m of members) c[m.status]++;
    return c;
  }, [members]);
  if (!set) return <div className="rail-empty">This set is no longer available.</div>;
  const total = members.length || set.memberIds.length;
  const list: SetMember[] = members.length ? members : set.memberIds.map((id, i) => ({ memberId: id, setId: set.setId, ordinal: i, status: "queued" as const }));
  const running = counts.running > 0;
  const failed = list.filter((m) => m.status === "failed");
  const label = (m: SetMember) => m.label ?? (m.url ? hostOf(m.url) : m.memberId);

  return (
    <div className="set-panel">
      <div className="run-goal">
        <span className="run-ico set">{I.layers}</span>
        <h2>{set.name}</h2>
      </div>

      <div className="run-status nums">
        <span className={`st ${running ? "running" : counts.failed && counts.completed + counts.failed === total ? "partial" : counts.completed === total ? "completed" : "queued"}`}>
          {running ? "Working" : counts.completed === total ? "Done" : counts.queued === total ? "Queued" : "Partly done"}
        </span>
        <span className="run-time" title="Members done">{counts.completed}/{total} done</span>
        <span className="sp" />
        <button className="btn sm" onClick={() => { void refreshResults(set.setId).then(() => setMode("table")).catch(errToast); }}>
          {I.table} Results
        </button>
      </div>

      {/* one segment per member, in ordinal order — the shape of progress, not a percentage */}
      <div className="set-bar" role="img" aria-label={`${counts.completed} of ${total} members completed`}>
        {list.map((m) => <i key={m.memberId} className={m.status} />)}
      </div>
      <div className="set-counts nums">
        {ORDER.filter((k) => counts[k] > 0).map((k) => (
          <span key={k} className={`set-count ${k}`}>
            <b>{counts[k]}</b> {k}
          </span>
        ))}
      </div>

      <section className="run-section">
        <div className="run-section-head">
          <span>Members</span>
          <span className="count nums">{total}</span>
        </div>
        <div className="member-grid" role="list" aria-label="Members">
          {list.map((m) => (
            <button
              key={m.memberId}
              role="listitem"
              className={`member ${m.status}`}
              title={`${label(m)} — ${m.status}${m.error ? `: ${m.error}` : ""}${m.url ? `\n${m.url}` : ""}`}
              aria-label={`${label(m)}: ${m.status}`}
              onClick={() => {
                if (m.pageId) void activate(m.pageId).catch(errToast);
                else if (m.url) void call("pages.open", { url: m.url, activate: true }).catch(errToast);
              }}
            >
              <span className="member-label">{label(m)}</span>
              <span className="member-foot">
                {m.url && m.label && <span className="member-host">{hostOf(m.url)}</span>}
                <span className="member-state">{m.status === "running" ? I.play : m.status === "completed" ? I.check : m.status === "failed" ? I.close : m.status === "queued" ? I.circle : I.close}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {failed.length > 0 && (
        <section className="run-section">
          <div className="run-section-head">
            <span>Failed</span>
            <span className="count nums">{failed.length}</span>
          </div>
          <div className="set-errors">
            {failed.slice(0, 5).map((m) => (
              <div key={m.memberId} className="set-error">
                <span className="set-error-ico">{I.alert}</span>
                <span className="member-label">{label(m)}</span>
                <span className="err selectable">{m.error ?? "failed"}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
