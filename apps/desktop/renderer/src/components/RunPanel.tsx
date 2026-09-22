import { useEffect, useMemo, useRef, useState } from "react";
import type { CompactObservation, Run } from "@vector/contracts";
import { decodeBase64Json, isLive, useStore, call, errToast } from "../store";
import { hostOf } from "../workspace";
import { ObservationPanel } from "./ObservationPanel";
import { StepTimeline, fmtMs } from "./StepTimeline";
import { I } from "./icons";
import { openSavedTask } from "../task-navigation";
import { AnswerMarkdown } from "./AnswerMarkdown";

import { STATUS_LABEL } from "../run-status";

function useElapsed(run: Run | undefined) {
  const live = !!run && isLive(run);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [live]);
  if (!run) return 0;
  const start = run.startedAt ?? run.createdAt;
  const end = run.endedAt ?? Date.now();
  return Math.max(0, end - start);
}

function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

function fmtCost(usd: number, estimated: boolean): string {
  if (!usd) return "";
  return `${estimated ? "≈" : ""}$${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)}`;
}

function ResultValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <ul>{value.map((item, i) => <li key={i}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>)}</ul>;
  if (typeof value === "object" && value !== null) return <pre>{JSON.stringify(value, null, 2)}</pre>;
  if (typeof value === "string") return <AnswerMarkdown text={value} />;
  return String(value);
}

function ResultFields({ result, labeled }: { result: Record<string, unknown>; labeled: boolean }) {
  return <dl className="answer-result">{Object.entries(result).map(([key, value]) => (
    <div key={key} className="answer-row">
      {labeled && <dt>{key.replace(/_/g, " ")}</dt>}
      <dd><ResultValue value={value} /></dd>
    </div>
  ))}</dl>;
}

/** Final answer as prose — no status chrome, copy is an icon. */
function Answer({ run, conversation = false }: { run: Run; conversation?: boolean }) {
  const plainAnswer = run.result && Object.keys(run.result).length === 1 && typeof run.result.answer === "string" ? run.result.answer : null;
  const showSummary = !!run.statusMessage && (!run.failure || !!run.result) && !(run.status === "completed" && plainAnswer?.trim());
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => {
    const parts: string[] = [];
    if (showSummary) parts.push(run.statusMessage!);
    if (run.result) for (const [k, v] of Object.entries(run.result)) parts.push(plainAnswer !== null ? plainAnswer : `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
    if (run.error && !run.failure) parts.push(`Error: ${run.error}`);
    return parts.join("\n");
  }, [run, plainAnswer, showSummary]);
  useEffect(()=>{if(!copied)return;const timer=window.setTimeout(()=>setCopied(false),1200);return()=>window.clearTimeout(timer);},[copied]);
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
    }).catch(errToast);
  };
  if (isLive(run) && !run.error) return null;
  if (!run.statusMessage && !run.result && !run.error) return null;
  return (
    <section className="answer">
      {text && (
        <button className="icon-btn xs answer-copy" title={copied ? "Copied" : "Copy"} aria-label={copied ? "Copied" : "Copy answer"} onClick={copy}>
          {copied ? I.check : I.copy}
        </button>
      )}
      {showSummary && <AnswerMarkdown text={run.statusMessage!}/>}
      {plainAnswer !== null && <AnswerMarkdown text={plainAnswer} />}
      {plainAnswer === null && run.result && Object.keys(run.result).length > 0 && !(conversation && showSummary) && (
        conversation
          ? <ResultFields result={run.result} labeled={false} />
          : <details className="answer-details" open={!run.statusMessage}><summary>Result details</summary><ResultFields result={run.result} labeled /></details>
      )}
      {run.error && !run.failure && <p className="answer-text err">{run.error}</p>}
    </section>
  );
}

export function RunPanel({ runId, conversation = false, readOnly = false, retryPageId }: { runId: string; conversation?: boolean; readOnly?: boolean; retryPageId?: string }) {
  const run = useStore((s) => s.runs.find((r) => r.runId === runId));
  const latestConversationTurn = useStore((s) => {
    const target = s.runs.find((item) => item.runId === runId);
    if (!target) return false;
    const chatId = target.config?.chatId ?? target.runId;
    return s.runs.filter(item => (item.config?.chatId ?? item.runId) === chatId)
      .sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId))[0]?.runId === runId;
  });
  const steps = useStore((s) => s.steps[runId]);
  const stats = useStore((s) => s.modelStats[runId]);
  const obs = useStore((s) => s.observations[runId]);
  const prompt = useStore((s) => s.prompt);
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const loadRun = useStore((s) => s.loadRun);
  const answerRun = useStore((s) => s.answerRun);
  const startRun = useStore((s) => s.startRun);
  const retryRun = useStore((s) => s.retryRun);
  const retrying = useStore(s=>!!s.retryingRuns[runId]);
  const activate = useStore((s) => s.activate);
  const answerDraft = useStore(s=>s.runAnswerDrafts[runId]);
  const answerPending = useStore(s=>!!s.runAnswerPending[runId]);
  const [answerError,setAnswerError]=useState("");
  const [showObs, setShowObs] = useState(false);
  const [obsLoading,setObsLoading]=useState(false);
  const [obsError,setObsError]=useState("");
  const [inspectedArtifact,setInspectedArtifact]=useState<string|null>(null);
  const observationRequest=useRef(0);
  const [showSteps, setShowSteps] = useState(() => {
    const current = useStore.getState().runs.find((item) => item.runId === runId);
    return !conversation && !!current && isLive(current);
  });
  type Control = "take" | "return" | "stop" | "pause" | "resume";
  const [controlBusy, setControlBusy] = useState<Control | null>(null);
  const pendingControl = useRef<{kind:Control;token:symbol}|null>(null);
  const [controlError,setControlError]=useState("");

  useEffect(() => {
    setShowObs(false); setObsLoading(false); setObsError(""); setInspectedArtifact(null); setControlBusy(null); setControlError("");
    const r = useStore.getState().runs.find((x) => x.runId === runId);
    setShowSteps(!conversation && !!r && isLive(r));
    if (!steps) void loadRun(runId);
    return () => { pendingControl.current=null; ++observationRequest.current; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  const elapsed = useElapsed(run);

  if (!run) return <div className="rail-empty">This run is no longer available.</div>;

  const live = isLive(run);
  const originalPages = run.pageIds.map(id => pages.find(p => p.pageId === id));
  const usable = (item?: typeof pages[number]) => !!item && !["crashed", "detached"].includes(item.viewStatus ?? "");
  const page = usable(originalPages[0]) ? originalPages[0] : undefined;
  const missingOriginals = run.pageIds.filter((id, index) => !usable(originalPages[index]) || originalPages[index]?.pageId !== id);
  const multiTabBlocked = run.pageIds.length > 1 && missingOriginals.length > 0;
  const retryPage = !page && !multiTabBlocked && run.pageIds.length <= 1 ? pages.find(item => item.pageId === retryPageId && usable(item)) : undefined;
  const humanPages = pages.filter(p => run.pageIds.includes(p.pageId) && p.controller === "human");
  const humanPage = humanPages[0];
  const humanHolds = humanPages.length > 0;
  const asksMe = prompt?.runId === run.runId || run.status === "needs_input";
  const question = prompt?.runId === run.runId ? prompt.question : run.statusMessage;
  const answer = answerDraft && answerDraft.question === question ? answerDraft.text : "";
  const setAnswer = (text:string) => {
    setAnswerError("");
    useStore.getState().setRunAnswerDraft(runId,question ?? "",text);
  };
  const submitAnswer = async () => {
    if(!answer.trim() || answerPending || readOnly)return;
    setAnswerError("");
    try { await answerRun(runId,answer.trim()); }
    catch(reason) { setAnswerError(reason instanceof Error ? reason.message : String(reason)); }
  };
  const calls = stats?.calls ?? run.config?.modelCalls;
  const control = async (kind:Control,work:(current:()=>boolean)=>Promise<unknown>) => {
    if(pendingControl.current && (kind !== "stop" || pendingControl.current.kind === "stop"))return;
    const token=Symbol(kind);
    pendingControl.current={kind,token};setControlBusy(kind);setControlError("");
    const current=()=>pendingControl.current?.token===token;
    try { await work(current); }
    catch(reason) {
      if(current())setControlError(`${{pause:"Pause",resume:"Resume",take:"Take control",return:"Return control",stop:"Stop"}[kind]} wasn’t confirmed. ${reason instanceof Error ? reason.message : String(reason)}`);
    } finally { if(current()){pendingControl.current=null;setControlBusy(null);} }
  };
  const takeControl = async () => {
    if(!page)return;
    await control("take",async current=>{
      const before=useStore.getState();
      await call("pages.takeover",{pageId:page.pageId});
      const state=useStore.getState();
      if(current() && state.activePageId===before.activePageId && state.mode===before.mode && state.overlay===before.overlay && state.conversationId===before.conversationId && state.railOpen===before.railOpen && state.railView===before.railView)await activate(page.pageId);
    });
  };
  const handBack = () => humanPage ? control("return",()=>call("pages.resume",{pageId:humanPage.pageId})) : Promise.resolve();
  const stopRun = () => control("stop",()=>call("runs.cancel",{runId:run.runId}));
  const openModelSettings = () => useStore.setState({ overlay: "settings", settingsCategory: "Models", railOpen: true });

  const observationArtifact = [...(steps ?? [])].reverse().map(step=>(step.inputs as {obsArtifactId?:string}|undefined)?.obsArtifactId).find(Boolean);
  const inspect = async (artifactId: string) => {
    const version=++observationRequest.current;setInspectedArtifact(artifactId);setShowObs(true);setObsLoading(true);setObsError("");
    try {
      const res = await call<{ dataBase64: string }>("artifacts.read", { artifactId });
      if(version!==observationRequest.current)return;
      const o = decodeBase64Json<CompactObservation>(res.dataBase64);
      if(!o || typeof o.text!=="string" || !Array.isArray(o.refs))throw new Error("The saved page snapshot could not be read.");
      useStore.setState((s) => ({ observations: { ...s.observations, [runId]: o } }));
      setShowObs(true);
    } catch (e) {
      if(version===observationRequest.current)setObsError(e instanceof Error ? e.message : String(e));
    } finally { if(version===observationRequest.current)setObsLoading(false); }
  };

  return (
    <div className="run-panel" data-testid="run-panel">
      <div className="run-goal">
        <h2>{run.goal}</h2>
      </div>

      <div className="run-status nums">
        {(!conversation || run.status !== "completed" || (!run.statusMessage && !run.result)) && <span className={`run-state ${run.status}`}>{STATUS_LABEL[run.status]}</span>}
        {!conversation && <span className="run-time" title="Elapsed">{fmtElapsed(elapsed)}</span>}
        {!conversation && calls != null && <span title="Model calls">{calls} {calls === 1 ? "call" : "calls"}</span>}
        {!conversation && stats && stats.costUsd > 0 && <span title={`${stats.inputTokens.toLocaleString()} in · ${stats.outputTokens.toLocaleString()} out tokens`}>{fmtCost(stats.costUsd, stats.costEstimated)}</span>}
        {page && page.url !== "about:blank" && page.pageId !== activePageId && (
          <button className="run-host" onClick={() => void activate(page.pageId).catch(errToast)} title={page.url}>
            {hostOf(page.url)}
            {run.pageIds.length > 1 ? ` +${run.pageIds.length - 1}` : ""}
          </button>
        )}
        <span className="sp" />
        <span className="run-acts">
          {run.status === "running" && <button className="icon-btn sm" disabled={!!controlBusy} title={controlBusy === "pause" ? "Pausing…" : "Pause"} aria-label={controlBusy === "pause" ? "Pausing run" : "Pause run"} onClick={() => void control("pause",()=>call("runs.pause",{runId}))}>{I.pause}</button>}
          {run.status === "paused" && !humanHolds && <button className="icon-btn sm" disabled={!!controlBusy} title={controlBusy === "resume" ? "Resuming…" : "Resume"} aria-label={controlBusy === "resume" ? "Resuming run" : "Resume run"} onClick={() => void control("resume",()=>call("runs.resume",{runId}))}>{I.play}</button>}
          {live && page && !humanHolds && <button className="icon-btn sm" disabled={!!controlBusy} title="Take control of browser tab" aria-label="Take control of browser tab" onClick={() => void takeControl()}>{I.handSm}</button>}
          {live && <button className="icon-btn sm danger" disabled={controlBusy === "stop"} title={controlBusy === "stop" ? "Stopping" : "Stop"} aria-label={controlBusy === "stop" ? "Stopping run" : "Stop run"} onClick={() => void stopRun()}>{I.square}</button>}
          {!live && (run.config?.taskId
            ? <button className="icon-btn sm" title="Open saved task" aria-label="Open saved task" onClick={() => void openSavedTask(run.config!.taskId!).catch(errToast)}>{I.layersSm}</button>
            : conversation && latestConversationTurn && !run.failure
              ? <button className="icon-btn sm" title={retrying ? "Retrying…" : "Retry this turn"} aria-label={retrying ? "Retrying turn" : "Retry this turn"} disabled={readOnly || !page || retrying || multiTabBlocked} onClick={() => void retryRun(run.runId)}>{I.reload}</button>
              : !conversation && !run.failure
                ? <button className="icon-btn sm" title="Run again" aria-label="Run again" onClick={() => void startRun(run.goal, { pageId: run.pageIds[0] ?? null })}>{I.reload}</button>
                : null)}
        </span>
      </div>
      {!live && latestConversationTurn && !run.config?.taskId && !page && retryPage && (!run.failure || run.failure.retryable) && <section className="run-failure" role="status">
        <div className="run-failure-copy"><strong>The original tab is unavailable</strong><p>Retry using {retryPage.title || retryPage.url}. The saved request and context stay the same; the browser page changes.</p></div>
        <button className="btn sm" disabled={readOnly || retrying} onClick={() => void retryRun(run.runId, retryPage.pageId)}>{retrying ? "Retrying…" : "Retry in selected tab"}</button>
      </section>}
      {!live && latestConversationTurn && !run.config?.taskId && multiTabBlocked && <section className="run-failure" role="status">
        <div className="run-failure-copy"><strong>Original tabs are missing</strong><p>This turn used {run.pageIds.length} tabs. Restore those tabs before retrying. Aux will not retry a subset.</p></div>
      </section>}
      {controlError && <p className="field-error" role="alert">{controlError}</p>}

      {humanHolds && humanPage && (
        <div className="takeover" role="status">
          <span className="takeover-ico">{I.hand}</span>
          <div className="takeover-main">
            <b>You're in control{humanPages.length > 1 ? ` of ${humanPages.length} pages` : ""}</b>
            <span>The agent remains paused until every held page is returned. Finish what you're doing, then hand {humanPages.length > 1 ? "this page" : "it"} back.</span>
          </div>
          <button className="btn primary sm" disabled={!!controlBusy} onClick={() => void handBack()}>{controlBusy === "return" ? "Returning…" : humanPages.length > 1 ? "Return this page" : "Return control"}</button>
        </div>
      )}

      {live && run.statusMessage && !asksMe && !conversation && <p className="run-msg">{run.statusMessage}</p>}

      {asksMe && question && (
        <div className="needs-input" role="group" aria-label="The agent needs your answer">
          <div className="ni-head">{I.chat}<span>Needs your answer</span></div>
          <p className="ni-q">{question}</p>
          {!conversation && <><div className="ni-row">
            <textarea
              rows={2}
              maxLength={20000}
              value={answer}
              disabled={answerPending || readOnly}
              placeholder="Type an answer…"
              aria-label="Your answer"
              aria-describedby={`answer-help-${runId}`}
              onChange={event => setAnswer(event.target.value)}
              onKeyDown={event => {
                if(event.nativeEvent.isComposing || event.keyCode === 229)return;
                if(event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitAnswer(); }
              }}
            />
            <button className="btn primary sm" disabled={!answer.trim() || answerPending || readOnly} onClick={()=>void submitAnswer()}>{answerPending ? "Sending…" : "Send"}</button>
          </div>
          <p className="hint" id={`answer-help-${runId}`}>Enter to send · Shift+Enter for a new line</p>
          {answerError && <p className="field-error" role="alert">{answerError} Your answer is kept.</p>}</>}
        </div>
      )}

      <Answer run={run} conversation={conversation} />

      {!conversation && stats && stats.calls > 0 && (stats.modelIds.length > 0 || stats.providers.length > 0) && <details className="run-provenance">
        <summary>{[stats.providers.join(", "), stats.modelIds.join(", ")].filter(Boolean).join(" · ")}</summary>
        <div><span>{stats.destinations.length ? `Destination ${stats.destinations.join(", ")}` : "Provider destination was not recorded"}</span><span>{stats.inputTokens.toLocaleString()} input · {stats.outputTokens.toLocaleString()} output tokens</span><span>{stats.costComplete ? `${fmtCost(stats.costUsd, false) || "$0.00"} recorded cost` : `${fmtCost(stats.costUsd, true) || "$0 known"} · provider cost incomplete`}</span></div>
      </details>}

      {run.failure && (
        <section className="run-failure" role="status">
          <span className="run-failure-icon">{I.alert}</span>
          <div className="run-failure-copy">
            <strong>{run.failure.action === "model_settings" ? "Connection needs attention" : run.failure.action === "permission_settings" ? "Permission needed" : "This turn stopped"}</strong>
            <p>{run.failure.message}</p>
          </div>
          {latestConversationTurn && !run.config?.taskId && ["retry", "permission_settings"].includes(run.failure.action) && page && (
            <button className="btn sm" disabled={readOnly || retrying} onClick={() => void retryRun(run.runId)}>{I.reload}{retrying ? "Retrying…" : "Retry turn"}</button>
          )}
          {run.failure.action === "edit_request" && latestConversationTurn && <button className="btn sm" disabled={readOnly} onClick={() => {
            if (run.config?.taskId) { void openSavedTask(run.config.taskId).catch(errToast); return; }
            const chatId = run.config?.chatId ?? run.runId;
            const state = useStore.getState();
            if (!state.conversationDrafts[`chat:${chatId}`]?.trim()) state.setConversationDraft(chatId, run.goal);
            state.openConversation(run.runId);
            requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>('.conversation-input textarea')?.focus());
          }}>{run.config?.taskId ? "Edit task" : "Revise request"}</button>}
          {run.failure.action === "permission_settings" && <button className="btn sm" onClick={() => { useStore.setState({ settingsCategory: "Agent permissions" }); useStore.getState().setOverlay("settings"); }}>{I.lock}Review permissions</button>}
          {run.failure.action === "permission_settings" && run.config?.taskId && <button className="btn sm" onClick={() => void openSavedTask(run.config!.taskId!).catch(errToast)}>Open task</button>}
          {/vault|credential grant|opaque reference|Unlock the agent vault/i.test(run.failure.message) && <button className="btn sm" onClick={() => { useStore.setState({ settingsCategory: "Vault" }); useStore.getState().setOverlay("settings"); }}>{I.lock}Open vault</button>}
          {run.failure.action === "model_settings" && (
            <button className="btn sm" onClick={openModelSettings}>{I.gearSm}Model settings</button>
          )}
        </section>
      )}

      <section className="run-section">
        <button className="run-section-head toggle" aria-expanded={showSteps} onClick={() => setShowSteps((v) => !v)}>
          <span className={`chev ${showSteps ? "open" : ""}`}>{I.right}</span>
          <span>{conversation ? "Work history" : "Steps"}</span>
          <span className="count nums">{steps?.length ?? 0}</span>
          {steps && steps.length > 0 && <span className="sum nums">{fmtMs(steps.reduce((a, s) => a + (s.outcome?.durationMs ?? 0), 0))}</span>}
        </button>
        {showSteps && (!!steps?.length || live) && <StepTimeline compact steps={steps ?? []} live={live && !humanHolds && run.status !== "paused"} onInspect={(id) => void inspect(id)} />}
      </section>

      {(obs || observationArtifact) && (!conversation || showSteps) && (
        <section className="run-section">
          <button className="run-section-head toggle" aria-expanded={showObs} onClick={() => { if(!showObs && !obs && observationArtifact)void inspect(observationArtifact);else setShowObs(value=>!value); }}>
            <span className={`chev ${showObs ? "open" : ""}`}>{I.right}</span>
            <span>Page</span>
            {obs && <span className="count nums">{obs.refs.length}</span>}
          </button>
          {showObs && (obsLoading ? <p className="hint" role="status">Loading saved page…</p> : obsError ? <p className="field-error" role="alert">{obsError} {(inspectedArtifact || observationArtifact) && <button className="btn sm" onClick={()=>void inspect((inspectedArtifact || observationArtifact)!)}>Retry</button>}</p> : obs ? <ObservationPanel compact obs={obs} /> : null)}
        </section>
      )}
    </div>
  );
}
