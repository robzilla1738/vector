import { useEffect, useMemo, useRef, useState } from "react";
import type { Run } from "@vector/contracts";
import { isLive, useStore } from "../store";
import { hostOf } from "../workspace";
import { ResizeHandle } from "./ResizeHandle";
import { RunPanel } from "./RunPanel";
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
      <span className={`run-row-ico ${r.status}`}>{live ? <span className="pulse-dot" /> : r.status === "completed" ? I.check : r.status === "failed" ? I.alert : r.status === "needs_input" ? I.sparklesSm : I.circle}</span>
      <span className="run-row-main">
        <span className="run-row-title">{r.goal}</span>
        <span className="run-row-sub">
          <span className={`st mini ${r.status}`}>{r.status.replace("_", " ")}</span>
          {page && <span className="h">{hostOf(page.url)}</span>}
          <span className="nums">{ago(r.createdAt)}</span>
        </span>
      </span>
    </button>
  );
}

/** Home: live runs, sets, and a searchable history of everything the agent did. */
function RailHome() {
  const runs = useStore((s) => s.runs);
  const sets = useStore((s) => s.sets);
  const members = useStore((s) => s.members);
  const setRailView = useStore((s) => s.setRailView);
  const [q, setQ] = useState("");
  const live = runs.filter(isLive);
  const past = useMemo(() => {
    const f = q.trim().toLowerCase();
    return runs.filter((r) => !isLive(r) && (!f || r.goal.toLowerCase().includes(f) || (r.statusMessage ?? "").toLowerCase().includes(f)));
  }, [runs, q]);

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
          <span>Past runs</span>
          <span className="count nums">{past.length}</span>
        </div>
        <div className="rail-search">
          {I.search}
          <input value={q} placeholder="Search runs" aria-label="Search runs" onChange={(e) => setQ(e.target.value)} />
          {q && <button className="icon-btn xs" aria-label="Clear" onClick={() => setQ("")}>{I.close}</button>}
        </div>
        {past.length === 0 ? (
          <div className="rail-empty small">{q ? "No runs match." : "Nothing yet. Ask for something below — the agent works in this window, on your tabs."}</div>
        ) : past.length > 30 ? (
          <VirtualList items={past} rowHeight={56} className="run-list virtual" keyOf={(r) => r.runId} renderRow={(r) => <RunRow r={r} selected={false} onOpen={() => setRailView({ kind: "run", runId: r.runId })} />} />
        ) : (
          <div className="run-list">{past.map((r) => <RunRow key={r.runId} r={r} selected={false} onOpen={() => setRailView({ kind: "run", runId: r.runId })} />)}</div>
        )}
      </section>
    </div>
  );
}

export function AgentRail() {
  const railOpen = useStore((s) => s.railOpen);
  const view = useStore((s) => s.railView);
  const setRailView = useStore((s) => s.setRailView);
  const toggleRail = useStore((s) => s.toggleRail);
  const railWidth = useStore((s) => s.railWidth);
  const setRailWidth = useStore((s) => s.setRailWidth);
  const startRun = useStore((s) => s.startRun);
  const connected = useStore((s) => s.connected);
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const runs = useStore((s) => s.runs);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const page = pages.find((p) => p.pageId === activePageId);
  const hasPage = !!page && page.url !== "about:blank" && !!page.url;
  const live = runs.filter(isLive);

  // when a run finishes streaming, keep the newest step in view unless the user scrolled up to read
  const steps = useStore((s) => (view.kind === "run" ? s.steps[view.runId]?.length ?? 0 : 0));
  const prevSteps = useRef<{ key: string; n: number }>({ key: "", n: 0 });
  useEffect(() => {
    const el = bodyRef.current;
    const key = JSON.stringify(view);
    const prev = prevSteps.current;
    prevSteps.current = { key, n: steps };
    // only follow *new* steps on the same run — never yank a freshly opened panel to the bottom
    if (!el || prev.key !== key || prev.n === 0 || steps <= prev.n) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [steps, view]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    await startRun(t, { scope: hasPage ? "page" : "new" });
    setSending(false);
    inputRef.current?.focus();
  };

  return (
    <aside className={`rail ${railOpen ? "open" : ""}`} style={{ "--rail-w": `${railWidth}px` } as React.CSSProperties} aria-label="Agent" aria-hidden={!railOpen}>
      <div className="rail-inner">
        <div className="rail-head">
          {view.kind !== "home" ? (
            <button className="icon-btn" title="All runs" aria-label="Back to all runs" onClick={() => setRailView({ kind: "home" })}>{I.left}</button>
          ) : (
            <span className="rail-title">{I.sparkles}<span>Agent</span></span>
          )}
          {view.kind !== "home" && <span className="rail-title">{view.kind === "run" ? "Run" : "Set"}</span>}
          {!connected && <span className="rail-sub offline">offline</span>}
          {connected && live.length > 0 && view.kind === "home" && <span className="rail-sub nums">{live.length} live</span>}
          <span className="sp" />
          <button className="icon-btn" title="New task" aria-label="New task" onClick={() => { setRailView({ kind: "home" }); inputRef.current?.focus(); }}>{I.plus}</button>
          <button className="icon-btn" title="Hide (⌘⇧A)" aria-label="Hide agent rail" onClick={toggleRail}>{I.close}</button>
        </div>

        <div className="rail-body" ref={bodyRef}>
          {view.kind === "home" && <RailHome />}
          {view.kind === "run" && <RunPanel key={view.runId} runId={view.runId} />}
          {view.kind === "set" && <SetPanel setId={view.setId} />}
        </div>

        <div className="composer">
          {hasPage && (
            <div className="composer-ctx" title={page!.url}>
              {page!.favicon ? <img src={page!.favicon} alt="" /> : I.globe}
              <span>{hostOf(page!.url)}</span>
            </div>
          )}
          <div className="composer-row">
            <textarea
              ref={inputRef}
              value={text}
              rows={1}
              aria-label="Ask the agent"
              placeholder={hasPage ? "Ask about this page, or give a task…" : "Tell the agent what to do…"}
              disabled={!connected}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button className="composer-send" title="Send (↵)" aria-label="Send" disabled={!text.trim() || sending || !connected} onClick={() => void send()}>{I.send}</button>
          </div>
        </div>
      </div>
      <ResizeHandle side="right" value={railWidth} min={300} max={620} reset={360} onResize={setRailWidth} />
    </aside>
  );
}
