import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { call, isLive, useStore } from "../store";
import { STATUS_LABEL } from "../run-status";
import { I } from "./icons";
import "./RunControls.css";

type Control = "take" | "return" | "stop" | "pause" | "resume";

/** One control owner per visible run. Stop can supersede an in-flight pause/takeover. */
export function RunControls({ runId, compact = false }: { runId: string; compact?: boolean }) {
  const run = useStore(state => state.runs.find(item => item.runId === runId));
  const pages = useStore(useShallow(state => state.pages.filter(page => run?.pageIds.includes(page.pageId))));
  const [busy, setBusy] = useState<Control | null>(null);
  const pending = useRef<{ kind: Control; token: symbol } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { setBusy(null); setError(""); return () => { pending.current = null; }; }, [runId]);
  if (!run) return null;
  const live = isLive(run);
  const primary = pages.find(page => page.pageId === run.pageIds[0] && !["crashed", "detached"].includes(page.viewStatus ?? ""));
  const held = pages.filter(page => page.controller === "human");
  if (!live && !held.length) return null;
  const control = async (kind: Control, work: (current: () => boolean) => Promise<unknown>) => {
    if (pending.current && (kind !== "stop" || pending.current.kind === "stop")) return;
    const token = Symbol(kind);
    pending.current = { kind, token }; setBusy(kind); setError("");
    const current = () => pending.current?.token === token;
    try { await work(current); }
    catch (reason) { if (current()) setError(`${{pause:"Pause",resume:"Resume",take:"Take control",return:"Return control",stop:"Stop"}[kind]} wasn’t confirmed. ${reason instanceof Error ? reason.message : String(reason)}`); }
    finally { if (current()) { pending.current = null; setBusy(null); } }
  };
  const take = () => primary && control("take", async current => {
    const before = useStore.getState();
    await call("pages.takeover", {pageId:primary.pageId});
    const state = useStore.getState();
    if (current() && state.activePageId === before.activePageId && state.mode === before.mode && state.overlay === before.overlay && state.conversationId === before.conversationId && state.railOpen === before.railOpen && state.railView === before.railView) await state.activate(primary.pageId);
  });
  return <section className={`run-controls${compact ? " compact" : ""}`} aria-label="Run controls">
    <div className="run-controls-line"><span className={`run-state ${run.status}`}>{held.length ? "You’re in control" : STATUS_LABEL[run.status]}</span><span className="run-acts">
      {run.status === "running" && <button className="icon-btn sm" disabled={!!busy} title="Pause" aria-label={busy === "pause" ? "Pausing run" : "Pause run"} onClick={() => void control("pause", () => call("runs.pause",{runId}))}>{I.pause}</button>}
      {run.status === "paused" && !held.length && <button className="icon-btn sm" disabled={!!busy} title="Resume" aria-label={busy === "resume" ? "Resuming run" : "Resume run"} onClick={() => void control("resume", () => call("runs.resume",{runId}))}>{I.play}</button>}
      {live && primary && !held.length && <button className="icon-btn sm" disabled={!!busy} title="Take control of browser tab" aria-label="Take control of browser tab" onClick={() => void take()}>{I.handSm}</button>}
      {live && <button className="icon-btn sm danger" disabled={busy === "stop"} title="Stop" aria-label={busy === "stop" ? "Stopping run" : "Stop run"} onClick={() => void control("stop", () => call("runs.cancel",{runId}))}>{I.square}</button>}
    </span></div>
    {!!held.length && <div className="run-held" role="status">{I.hand}<span>{held.length > 1 ? `${held.length} pages are held. Return each page when you’re ready.` : "Aux waits while you use this page."}</span><button className="btn sm" disabled={!!busy} onClick={() => void control("return", () => call("pages.resume",{pageId:held[0]!.pageId}))}>{busy === "return" ? "Returning…" : held.length > 1 ? "Return this page" : "Return control"}</button></div>}
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}
