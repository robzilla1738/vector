import { staticSmallIconButtonProps, staticFieldErrorProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { call, isLive, useStore } from "../store";
import { STATUS_LABEL } from "../run-status";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { registerRunControlCommands, type RunControlCommand } from "../run-control-commands";
import { performStopWork } from "../features/native-cdp-measurement/stop";
import { shellIconHand, shellIconHandSm, shellIconPause, shellIconPlay, shellIconSquare } from "./icons";
import { RunPanelDisclosure } from "./RunPanelAction";
import "./RunControls.css";
import { nativeStatusRoleProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

type Control = "take" | "return" | "stop" | "pause" | "resume" | "open";

/** One control owner per visible run. Stop can supersede an in-flight pause/takeover. */
export function RunControls({ runId, compact = false }: { runId: string; compact?: boolean }) {
  const run = useStore(state => state.runs.find(item => item.runId === runId));
  const pages = useStore(useShallow(state => state.pages.filter(page => run?.pageIds.includes(page.pageId) || page.agentIsolation?.runId === runId)));
  const commandRegistration = useRef<(() => void) | undefined>(undefined);
  const [busy, setBusy] = useState<Control | null>(null);
  const pending = useRef<{ kind: Control; token: symbol } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { setBusy(null); setError(""); return () => { pending.current = null; }; }, [runId]);
  if (!run) return null;
  const live = isLive(run);
  const primary = pages.find(page => page.pageId === run.pageIds[0] && !["crashed", "detached"].includes(page.viewStatus ?? ""))
    ?? pages.find(page => page.agentIsolation?.runId === runId && !["crashed", "detached"].includes(page.viewStatus ?? ""));
  const isolated = pages.filter(page => page.agentIsolation?.runId === runId && !["crashed", "detached"].includes(page.viewStatus ?? ""));
  const temporaryHere = isolated.find(page => page.windowId === bridge.windowId);
  const held = pages.filter(page => page.controller === "human");
  const uncertain = run.config?.checkpoint?.unresolvedEffects?.length ?? 0;
  const takeoverCheckpoint = run.config?.checkpoint?.planBoundary === "takeover";
  if (!live && !held.length && !takeoverCheckpoint) return null;
  const control = async (kind: Control, work: (current: () => boolean) => Promise<unknown>) => {
    if (pending.current && (kind !== "stop" || pending.current.kind === "stop")) return;
    const token = Symbol(kind);
    pending.current = { kind, token }; setBusy(kind); setError("");
    const current = () => pending.current?.token === token;
    try { await work(current); }
    catch (reason) { if (current()) setError(`${{pause:"Pause",resume:"Resume",take:"Take control",return:"Return control",stop:"Stop",open:"Open temporary tab"}[kind]} wasn’t confirmed. ${errorMessage(reason)}`); }
    finally { if (current()) { pending.current = null; setBusy(null); } }
  };
  const take = () => primary && control("take", async current => {
    const before = useStore.getState();
    await call("pages.takeover", {pageId:primary.pageId});
    const state = useStore.getState();
    if (current() && state.activePageId === before.activePageId && state.mode === before.mode && state.overlay === before.overlay && state.conversationId === before.conversationId && state.railOpen === before.railOpen && state.railView === before.railView) await state.activate(primary.pageId);
  });
  const dispatch = (command: RunControlCommand, event: React.MouseEvent<HTMLButtonElement>) => {
    void executeCommand(command, { payload: { runId }, nativeInputEvent: event.nativeEvent })
      .catch(reason => setError(errorMessage(reason)));
  };
  const registerControls = (element: HTMLElement | null) => {
    commandRegistration.current?.();
    commandRegistration.current = element ? registerRunControlCommands(element, runId, (command, originalEvent) => {
      const state = useStore.getState();
      const currentPages = state.pages.filter(page => run.pageIds.includes(page.pageId) || page.agentIsolation?.runId === runId);
      if (state.runs.find(item => item.runId === runId) !== run || currentPages.length !== pages.length || !pages.every(page => currentPages.includes(page)))
        throw new Error("The run’s controls changed. Try again from its controls.");
      switch (command) {
        case "pause-run": if (!busy && run.status === "running") return control("pause", () => call("runs.pause", { runId })); break;
        case "resume-run": if (!busy && run.status === "paused" && !held.length) return control("resume", () => call("runs.resume", { runId })); break;
        case "stop-run": if (busy !== "stop" && live) return control("stop", () => performStopWork(runId, originalEvent, () => call("runs.cancel", { runId }))); break;
        case "take-run-control": if (!busy && live && primary && !held.length) return take(); break;
        case "return-run-control": if (!busy && held.length) return control("return", () => call("pages.resume", { pageId: held[0]!.pageId })); break;
        case "open-run-tab": if (!busy && temporaryHere) return control("open", () => state.activate(temporaryHere.pageId)); break;
      }
      throw new Error("This run control is unavailable right now.");
    }) : undefined;
  };
  return <section ref={registerControls} className={`run-controls${compact ? " compact" : ""}`} aria-label="Run controls">
    <div className="run-controls-line"><span className={`run-state ${run.status}`}>{held.length ? "You’re in control" : STATUS_LABEL[run.status]}</span><span className="run-acts">
      {run.status === "running" && <button {...staticSmallIconButtonProps} disabled={!!busy} title="Pause" aria-label={busy === "pause" ? "Pausing run" : "Pause run"} data-command-id="pause-run" onClick={event => dispatch("pause-run", event)}>{shellIconPause}</button>}
      {run.status === "paused" && !held.length && <button {...staticSmallIconButtonProps} disabled={!!busy} title="Resume" aria-label={busy === "resume" ? "Resuming run" : "Resume run"} data-command-id="resume-run" onClick={event => dispatch("resume-run", event)}>{shellIconPlay}</button>}
      {live && primary && !held.length && <button {...staticSmallIconButtonProps} disabled={!!busy} title="Take control of browser tab" aria-label="Take control of browser tab" data-command-id="take-run-control" onClick={event => dispatch("take-run-control", event)}>{shellIconHandSm}</button>}
      {live && <button className="icon-btn sm danger" disabled={busy === "stop"} title="Stop" aria-label={busy === "stop" ? "Stopping run" : "Stop run"} data-command-id="stop-run" data-native-stop-run={runId} onClick={event => dispatch("stop-run", event)}>{shellIconSquare}</button>}
    </span></div>
    {!!isolated.length && <div className="run-held" role="note"><span>Aux uses separate temporary tabs for this run. Sign in there if needed. Existing cookies and saved sign-ins are not copied; cookie transfer is unavailable.</span><button {...smallButtonProps} disabled={!!busy || !temporaryHere} title={!temporaryHere ? "Open this run’s temporary tab in its original browser window." : undefined} data-command-id="open-run-tab" onClick={event => dispatch("open-run-tab", event)}>Open temporary tab</button></div>}
    {!!held.length && <div className="run-held" {...nativeStatusRoleProps}>{shellIconHand}<span>{run.status === "interrupted" ? "This program stopped when you took control. Review its checkpoint before another run." : held.length > 1 ? `${held.length} pages are held. Return each page when you’re ready.` : "Aux is paused while you use this page."}{uncertain > 0 ? ` ${uncertain} action${uncertain === 1 ? "" : "s"} may have taken effect and need review.` : ""}</span><button {...smallButtonProps} disabled={!!busy} data-command-id="return-run-control" onClick={event => dispatch("return-run-control", event)}>{busy === "return" ? "Returning…" : held.length > 1 ? "Return this page" : run.status === "interrupted" ? "Return page" : "Return and resume"}</button></div>}
    {(!!held.length || takeoverCheckpoint) && run.config?.checkpoint && <RunPanelDisclosure run={run} command="toggle-run-takeover-checkpoint" className="run-held-checkpoint" summary="Takeover checkpoint"><p>{run.statusMessage ?? "The page is under your control."}</p><p>{uncertain ? `${uncertain} uncertain action${uncertain === 1 ? "" : "s"} ${uncertain === 1 ? "requires" : "require"} review before completion.` : run.status === "interrupted" ? "This stopped program will not replay when the page is returned." : "The next agent turn will inspect the page again before acting."}</p></RunPanelDisclosure>}
    {error && <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>{error}</p>}
  </section>;
}
