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

  return (
    <div className="set-panel">
      <div className="run-goal">
        <span className="run-ico set">{I.layers}</span>
        <h2>{set.name}</h2>
      </div>
      <div className="set-counts nums">
        {ORDER.filter((k) => counts[k] > 0).map((k) => (
          <span key={k} className={`set-count ${k}`}>
            <b>{counts[k]}</b> {k}
          </span>
        ))}
        <span className="set-count total"><b>{total}</b> members</span>
        <span className="sp" />
        <button className="btn sm" onClick={() => { void refreshResults(set.setId).then(() => setMode("table")).catch(errToast); }}>
          {I.table} Results
        </button>
      </div>
      <div className="member-grid" role="list" aria-label="Members">
        {(members.length ? members : set.memberIds.map((id, i) => ({ memberId: id, setId: set.setId, ordinal: i, status: "queued" as const }))).map((m: SetMember) => (
          <button
            key={m.memberId}
            role="listitem"
            className={`member ${m.status}`}
            title={`${m.label ?? m.url ?? m.memberId} — ${m.status}${m.error ? `: ${m.error}` : ""}`}
            aria-label={`${m.label ?? m.url ?? m.memberId}: ${m.status}`}
            onClick={() => {
              if (m.pageId) void activate(m.pageId).catch(errToast);
              else if (m.url) void call("pages.open", { url: m.url, backend: "vector", activate: true }).catch(errToast);
            }}
          >
            <span className="member-label">{m.label ?? (m.url ? hostOf(m.url) : m.memberId)}</span>
            <span className="member-state">{m.status === "running" ? <span className="pulse-dot" /> : m.status === "completed" ? I.check : m.status === "failed" ? I.close : null}</span>
          </button>
        ))}
      </div>
      {counts.failed > 0 && (
        <div className="set-errors">
          {members.filter((m) => m.status === "failed").slice(0, 5).map((m) => (
            <div key={m.memberId} className="set-error">
              <span className="member-label">{m.label ?? hostOf(m.url ?? "")}</span>
              <span className="err">{m.error ?? "failed"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
