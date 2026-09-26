import { STATUS_LABEL } from "../run-status";
import { recentConversations } from "../conversations";
import { memo, useMemo, useState, useSyncExternalStore } from "react";
import type { Run } from "@aux/contracts";
import { isLive, useStore } from "../store";
import { hostOf } from "../workspace";
import { VirtualList } from "./VirtualList";
import { I } from "./icons";

const ago = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const minuteListeners = new Set<() => void>();
let minuteTimer: number | undefined;
/** One shared minute clock, running only while some row shows a relative time. */
const subscribeMinute = (listener: () => void) => {
  minuteListeners.add(listener);
  minuteTimer ??= window.setInterval(() => { for (const notify of minuteListeners) notify(); }, 60_000);
  return () => { minuteListeners.delete(listener); if (!minuteListeners.size) { window.clearInterval(minuteTimer); minuteTimer = undefined; } };
};
const currentMinute = () => Math.floor(Date.now() / 60_000);
function Ago({ ts }: { ts: number }) {
  useSyncExternalStore(subscribeMinute, currentMinute);
  return <span className="nums">{ago(ts)}</span>;
}

/** Memoized so a ticking run only re-renders its own row. */
const RunRow = memo(function RunRow({ r, selected }: { r: Run; selected: boolean }) {
  const page = useStore((s) => s.pages.find((p) => p.pageId === r.pageIds[0]));
  const live = isLive(r);
  return (
    <button className={`run-row ${selected ? "on" : ""} ${live ? "live" : ""}`} onClick={() => useStore.getState().setRailView({ kind: "run", runId: r.runId })} title={r.goal}>
      <span className={`run-row-ico ${r.status}`}>{r.status === "completed" ? I.check : r.status === "failed" ? I.alert : r.status === "needs_input" ? I.chat : live ? I.agentSm : I.circle}</span>
      <span className="run-row-main">
        <span className="run-row-title">{r.goal}</span>
        <span className="run-row-sub">
          <span className={`st mini ${r.status}`}>{STATUS_LABEL[r.status]}</span>
          {page && <span className="h">{hostOf(page.url)}</span>}
          <Ago ts={r.createdAt} />
        </span>
      </span>
    </button>
  );
});

/** One entry per recent conversation; full history remains searchable from Chats. */
export function RailHistory() {
  const runs = useStore((s) => s.runs);
  const sets = useStore((s) => s.sets);
  const members = useStore((s) => s.members);
  const setRailView = useStore((s) => s.setRailView);
  const [q, setQ] = useState("");
  const conversations = useMemo(() => recentConversations(runs), [runs]);
  const live = conversations.filter(isLive);
  const past = useMemo(() => {
    const f = q.trim().toLowerCase();
    const matches = new Set(runs.filter(run => run.goal.toLowerCase().includes(f) || (run.statusMessage ?? "").toLowerCase().includes(f)).map(run => run.config?.chatId ?? run.runId));
    return conversations.filter(run => !isLive(run) && (!f || matches.has(run.config?.chatId ?? run.runId)));
  }, [runs, conversations, q]);

  return (
    <div className="rail-home">
      {live.length > 0 && (
        <section className="rail-block">
          <div className="rail-label"><span>Live</span><span className="count nums">{live.length}</span></div>
          {live.map((r) => <RunRow key={r.runId} r={r} selected={false} />)}
        </section>
      )}
      {sets.length > 0 && (
        <section className="rail-block">
          <div className="rail-label"><span>Sets</span><span className="count nums">{sets.length}</span></div>
          {sets.map((s) => {
            const ms = members.filter((m) => m.setId === s.setId);
            const done = ms.filter((m) => m.status === "completed").length;
            return (
              <button key={s.setId} className="run-row" onClick={() => setRailView({ kind: "set", setId: s.setId })}>
                <span className="run-row-ico set">{I.layersSm}</span>
                <span className="run-row-main">
                  <span className="run-row-title">{s.name}</span>
                  <span className="run-row-sub nums">{done}/{ms.length || s.memberIds.length} members</span>
                </span>
                <span className="mini-grid" aria-hidden>
                  {(ms.length ? ms : s.memberIds.map((id) => ({ memberId: id, status: "queued" }))).slice(0, 24).map((m) => <i key={m.memberId} className={m.status} />)}
                </span>
              </button>
            );
          })}
        </section>
      )}
      <section className="rail-block grow">
        <div className="rail-label">
          <span>Recent conversations</span>
          <span className="count nums">{past.length}</span>
        </div>
        <div className="rail-search">
          {I.search}
          <input value={q} placeholder="Find a recent conversation" aria-label="Find a recent conversation" onChange={(e) => setQ(e.target.value)} />
          {q && <button className="icon-btn xs" aria-label="Clear" onClick={() => setQ("")}>{I.close}</button>}
        </div>
        {past.length === 0 ? (
          <div className="rail-empty small">{q ? "No recent conversations match." : "Nothing yet. Ask for something below — the agent works in this window, on your tabs."}</div>
        ) : past.length > 30 ? (
          <VirtualList items={past} rowHeight={56} className="run-list virtual" keyOf={(r) => r.runId} renderRow={(r) => <RunRow r={r} selected={false} />} />
        ) : (
          <div className="run-list">{past.map((r) => <RunRow key={r.runId} r={r} selected={false} />)}</div>
        )}
        <button className="btn sm ghost" onClick={() => { useStore.getState().openConversation(null); useStore.setState({ conversationId: "history" }); }}>Browse all conversations</button>
      </section>
    </div>
  );
}

