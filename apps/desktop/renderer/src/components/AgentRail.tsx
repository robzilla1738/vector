import { STATUS_LABEL } from "../run-status";
import { recentConversations } from "../conversations";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Run } from "@vector/contracts";
import { isLive, useStore } from "../store";
import { hostOf } from "../workspace";
import { ResizeHandle } from "./ResizeHandle";
import { Conversation } from "./Conversation";
import { SetPanel } from "./SetPanel";
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

function RunRow({ r, onOpen, selected }: { r: Run; onOpen: () => void; selected: boolean }) {
  const pages = useStore((s) => s.pages);
  const page = pages.find((p) => p.pageId === r.pageIds[0]);
  const live = isLive(r);
  return (
    <button className={`run-row ${selected ? "on" : ""} ${live ? "live" : ""}`} onClick={onOpen} title={r.goal}>
      <span className={`run-row-ico ${r.status}`}>{r.status === "completed" ? I.check : r.status === "failed" ? I.alert : r.status === "needs_input" ? I.chat : live ? I.agentSm : I.circle}</span>
      <span className="run-row-main">
        <span className="run-row-title">{r.goal}</span>
        <span className="run-row-sub">
          <span className={`st mini ${r.status}`}>{STATUS_LABEL[r.status]}</span>
          {page && <span className="h">{hostOf(page.url)}</span>}
          <span className="nums">{ago(r.createdAt)}</span>
        </span>
      </span>
    </button>
  );
}

/** One entry per recent conversation; full history remains searchable from Chats. */
function RailHome() {
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
          {live.map((r) => <RunRow key={r.runId} r={r} selected={false} onOpen={() => setRailView({ kind: "run", runId: r.runId })} />)}
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
          <VirtualList items={past} rowHeight={56} className="run-list virtual" keyOf={(r) => r.runId} renderRow={(r) => <RunRow r={r} selected={false} onOpen={() => setRailView({ kind: "run", runId: r.runId })} />} />
        ) : (
          <div className="run-list">{past.map((r) => <RunRow key={r.runId} r={r} selected={false} onOpen={() => setRailView({ kind: "run", runId: r.runId })} />)}</div>
        )}
        <button className="btn sm ghost" onClick={() => { useStore.getState().openConversation(null); useStore.setState({ conversationId: "history" }); }}>Browse all conversations</button>
      </section>
    </div>
  );
}

export function AgentRail() {
  const railOpen = useStore(s => s.railOpen);
  const view = useStore(s => s.railView);
  const setRailView = useStore(s => s.setRailView);
  const toggleRail = useStore(s => s.toggleRail);
  const railWidth = useStore(s => s.railWidth);
  const setRailWidth = useStore(s => s.setRailWidth);
  const connected = useStore(s => s.connected);
  const runs = useStore(s => s.runs);
  const [recentOpen, setRecentOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const selectedRun = view.kind === "run" ? runs.find(run => run.runId === view.runId) : undefined;
  const chatId = view.kind === "draft" ? view.chatId : selectedRun ? selectedRun.config?.chatId ?? selectedRun.runId : view.kind === "run" ? view.runId : null;
  useEffect(() => { setRecentOpen(false); }, [view]);
  useEffect(() => {
    if (!railOpen || recentOpen || view.kind === "set") return;
    const frame = requestAnimationFrame(() => root.current?.querySelector<HTMLTextAreaElement>('.conversation-input textarea')?.focus({preventScroll:true}));
    return () => cancelAnimationFrame(frame);
  }, [railOpen, recentOpen, view.kind]);
  const expand = () => {
    if (selectedRun) useStore.getState().openConversation(selectedRun.runId);
    else useStore.getState().openConversationDraft(chatId);
  };
  return (
    <aside ref={root} className={`rail ${railOpen ? "open" : ""}`} style={{ "--rail-w": `${railWidth}px` } as React.CSSProperties} aria-label="Aux assistant" aria-hidden={!railOpen}>
      <div className="rail-inner">
        <div className="rail-head">
          <span className="rail-title">{recentOpen ? "Recent work" : view.kind === "set" ? "Set" : "Ask Aux"}</span>
          {!connected && <span className="rail-sub offline" role="status">Connecting…</span>}
          <span className="sp" />
          <button className="icon-btn" title={recentOpen ? "Return to conversation" : "Recent conversations"} aria-label={recentOpen ? "Return to conversation" : "Recent conversations"} aria-pressed={recentOpen} onClick={() => setRecentOpen(value => !value)}>{recentOpen ? I.left : I.chats}</button>
          {!recentOpen && view.kind !== "set" && <button className="icon-btn" title="Open full conversation" aria-label="Open full conversation" onClick={expand}>{I.open}</button>}
          <button className="icon-btn" title="New conversation" aria-label="New conversation" onClick={() => { setRecentOpen(false); setRailView({kind:"home"}); }}>{I.plus}</button>
          <button className="icon-btn" title="Hide (⌘⇧A)" aria-label="Hide assistant" onClick={toggleRail}>{I.rail}</button>
        </div>
        <div className={`rail-body${recentOpen ? " rail-recents" : ""}`}>
          {railOpen && recentOpen && <RailHome />}
          {railOpen && !recentOpen && view.kind !== "set" && <Conversation chatId={chatId} embedded onChatCreated={chatId => setRailView({kind:"draft",chatId})} />}
          {railOpen && !recentOpen && view.kind === "set" && <SetPanel setId={view.setId} />}
        </div>
      </div>
      <ResizeHandle side="right" value={railWidth} min={300} max={620} reset={360} onResize={setRailWidth} />
    </aside>
  );
}
