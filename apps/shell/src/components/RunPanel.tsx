import { RunControls } from "./RunControls";
import type { ConversationSource } from "@aux/contracts";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import type { CompactObservation, Run } from "@aux/contracts";
import { decodeBase64Json, isLive, useStore, call, errToast } from "../store";
import { hostOf } from "../workspace";
import { ObservationPanel } from "./ObservationPanel";
import { StepTimeline, fmtMs } from "./StepTimeline";
import { shellIconAlert, shellIconCheck, shellIconCopy, shellIconGearSm, shellIconLayersSm, shellIconLock, shellIconReload, shellIconRight } from "./icons";
import { openSavedTask } from "../task-navigation";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { RunTranscriptDetails } from "../transcript/RunTranscriptDetails";

import { STATUS_LABEL } from "../run-status";

/** Ticks on its own so a live run's clock never re-renders the whole panel. */
function Elapsed({ run }: { run: Run }) {
  const live = isLive(run);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [live]);
  const elapsed = Math.max(0, (run.endedAt ?? Date.now()) - (run.startedAt ?? run.createdAt));
  return <span className="run-time" title="Elapsed">{fmtElapsed(elapsed)}</span>;
}

/** Whether `runId` is its conversation's newest turn. */
export function isLatestTurn(runs: readonly Run[], runId: string): boolean {
  const target = runs.find((item) => item.runId === runId);
  if (!target) return false;
  const chatId = target.config?.chatId ?? target.runId;
  let latest: Run | undefined;
  for (const item of runs) {
    if ((item.config?.chatId ?? item.runId) !== chatId) continue;
    if (!latest || item.createdAt > latest.createdAt || (item.createdAt === latest.createdAt && item.runId > latest.runId)) latest = item;
  }
  return latest?.runId === runId;
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
  return <div className="answer-result">{Object.entries(result).map(([key, value]) => (
    <div key={key} className="answer-row">
      {labeled && <div className="answer-key">{key.replace(/_/g, " ")}</div>}
      <div className="answer-value"><ResultValue value={value} /></div>
    </div>
  ))}</div>;
}

function chatReply(run: Run): string | null {
  const goal = run.goal.trim().toLowerCase();
  const prose = (value: unknown) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text && text.toLowerCase() !== goal ? text : "";
  };
  const answer = prose(run.result?.answer);
  const report = prose(run.result?.report);
  const message = run.failure || (run.error && run.statusMessage === run.error) ? "" : prose(run.statusMessage);
  if (report && run.status === "completed") return report;
  if (answer && run.status !== "completed" && message) return `${message}\n\n${answer}`;
  if (answer) return answer;
  if (message) return message;
  if (!run.result) return null;
  const rest = Object.entries(run.result).flatMap(([key, value]) => key === "answer" ? [] : [prose(value)]).filter(Boolean);
  return rest.length ? rest.join("\n\n") : null;
}

/** Final answer as prose — no status chrome, copy is an icon. */
function Answer({ run, conversation = false, retry = null, stream, onCitationOpen, sources }: { sources?: ConversationSource[]; run: Run; conversation?: boolean; retry?: ReactNode; stream?: string; onCitationOpen?: (url:string,background:boolean,runId:string)=>boolean }) {
  const plainAnswer = run.result && Object.keys(run.result).length === 1 && typeof run.result.answer === "string" ? run.result.answer : null;
  const result = useMemo(() => run.status === "completed" && run.config?.implementation === "agent-loop" && typeof run.result?.textProposal === "string"
    ? Object.fromEntries(Object.entries(run.result).filter(([key]) => key !== "textProposal")) : run.result,
  [run.result, run.status, run.config?.implementation]);
  const showSummary = !!run.statusMessage && run.statusMessage !== run.error && (!run.failure || !!run.result) && !(run.status === "completed" && plainAnswer?.trim());
  const reply = conversation ? chatReply(run) : null;
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => {
    const parts: string[] = [];
    if (showSummary) parts.push(run.statusMessage!);
    if (result) for (const [k, v] of Object.entries(result)) parts.push(plainAnswer !== null ? plainAnswer : `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
    if (run.error && !run.failure) parts.push(`Error: ${run.error}`);
    return parts.join("\n");
  }, [run, result, plainAnswer, showSummary]);
  useEffect(()=>{if(!copied)return;const timer=window.setTimeout(()=>setCopied(false),1200);return()=>window.clearTimeout(timer);},[copied]);
  const copy = () => {
    void navigator.clipboard.writeText(conversation && reply ? reply : text).then(() => {
      setCopied(true);
    }).catch(errToast);
  };
  // Streamed text is plain until the run settles; markdown parses once, at the end.
  if (isLive(run) && !run.error) return stream ? <section className="answer" aria-live="polite" aria-busy="true"><p className="answer-text answer-stream">{stream}</p></section> : null;
  if (conversation) {
    if (!reply && !retry && !(run.error && !run.failure)) return null;
    return (
      <section className="answer">
        {reply && <AnswerMarkdown text={reply} sources={sources} onOpenLink={onCitationOpen ? (url,background)=>onCitationOpen(url,background,run.runId) : undefined}/>}
        {(reply || retry) && <span className="answer-tools">{reply && <button className="icon-btn xs answer-copy" title={copied ? "Copied" : "Copy"} aria-label={copied ? "Copied" : "Copy answer"} onClick={copy}>{copied ? shellIconCheck : shellIconCopy}</button>}{retry}</span>}
        {run.error && !run.failure && <p className="answer-text err">{run.error}</p>}
      </section>
    );
  }
  if (!run.statusMessage && !run.result && !run.error) return null;
  return (
    <section className="answer">
      {text && (
        <button className="icon-btn xs answer-copy" title={copied ? "Copied" : "Copy"} aria-label={copied ? "Copied" : "Copy answer"} onClick={copy}>
          {copied ? shellIconCheck : shellIconCopy}
        </button>
      )}
      {showSummary && <AnswerMarkdown text={run.statusMessage!}/>}
      {plainAnswer !== null && <AnswerMarkdown text={plainAnswer} />}
      {plainAnswer === null && result && Object.keys(result).length > 0 && (
        <details className="answer-details" open={!run.statusMessage}><summary>Result details</summary><ResultFields result={result} labeled /></details>
      )}
      {run.error && !run.failure && <p className="answer-text err">{run.error}</p>}
    </section>
  );
}

/** `latest` lets a conversation that already ordered its turns skip the per-panel scan. */
export const RunPanel = memo(function RunPanel({ runId, conversation = false, readOnly = false, retryPageId, latest, onCitationOpen, sources, questionInComposer = false, controlsInComposer = false, composerRef }: { controlsInComposer?: boolean; questionInComposer?: boolean; sources?: ConversationSource[]; runId: string; conversation?: boolean; readOnly?: boolean; retryPageId?: string; latest?: boolean; onCitationOpen?: (url:string,background:boolean,runId:string)=>boolean; composerRef?: RefObject<HTMLTextAreaElement | null> }) {
  const run = useStore((s) => s.runs.find((r) => r.runId === runId));
  const latestConversationTurn = useStore((s) => latest ?? isLatestTurn(s.runs, runId));
  const stream = useStore((s) => s.answerStreams[runId]);
  const steps = useStore((s) => s.steps[runId]);
  const stats = useStore((s) => s.modelStats[runId]);
  const obs = useStore((s) => s.observations[runId]);
  const prompt = useStore((s) => s.prompt);
  // Only the pages this run can act on — unrelated tab churn does not re-render the panel.
  const runPages = useStore(useShallow((s) => s.pages.filter((p) => (run?.pageIds ?? []).includes(p.pageId) || p.pageId === retryPageId)));
  const activePageId = useStore((s) => s.activePageId);
  const loadRun = useStore((s) => s.loadRun);
  const startRun = useStore((s) => s.startRun);
  const retryRun = useStore((s) => s.retryRun);
  const retrying = useStore(s=>!!s.retryingRuns[runId]);
  const activate = useStore((s) => s.activate);
  const [showObs, setShowObs] = useState(false);
  const [obsLoading,setObsLoading]=useState(false);
  const [obsError,setObsError]=useState("");
  const [inspectedArtifact,setInspectedArtifact]=useState<string|null>(null);
  const observationRequest=useRef(0);
  const [showSteps, setShowSteps] = useState(() => {
    const current = useStore.getState().runs.find((item) => item.runId === runId);
    return !conversation && !!current && isLive(current);
  });

  useEffect(() => {
    setShowObs(false); setObsLoading(false); setObsError(""); setInspectedArtifact(null);
    const r = useStore.getState().runs.find((x) => x.runId === runId);
    setShowSteps(!conversation && !!r && isLive(r));
    if (!steps) void loadRun(runId);
    return () => { ++observationRequest.current; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  const inspectRef = useRef<(artifactId: string) => Promise<void>>(async () => {});
  const onInspect = useCallback((artifactId: string) => void inspectRef.current(artifactId), []);

  if (!run) return <div className="rail-empty">This run is no longer available.</div>;

  const live = isLive(run);
  const originalPages = run.pageIds.map(id => runPages.find(p => p.pageId === id));
  const usable = (item?: typeof runPages[number]) => !!item && !["crashed", "detached"].includes(item.viewStatus ?? "");
  const page = usable(originalPages[0]) ? originalPages[0] : undefined;
  const missingOriginals = run.pageIds.filter((id, index) => !usable(originalPages[index]) || originalPages[index]?.pageId !== id);
  const multiTabBlocked = run.pageIds.length > 1 && missingOriginals.length > 0;
  const retryPage = !page && !multiTabBlocked && run.pageIds.length <= 1 ? runPages.find(item => item.pageId === retryPageId && usable(item)) : undefined;
  const humanHolds = runPages.some(page => run.pageIds.includes(page.pageId) && page.controller === "human");
  const asksMe = prompt?.runId === run.runId || run.status === "needs_input";
  const question = prompt?.runId === run.runId ? prompt.question : run.statusMessage;
  const calls = stats?.calls ?? run.config?.modelCalls;
  const openModelSettings = () => useStore.setState({ overlay: "settings", settingsCategory: "Models", railOpen: true });

  const observationArtifact = [...(steps ?? [])].reverse().map(step=>(step.inputs as {obsArtifactId?:string}|undefined)?.obsArtifactId).find(Boolean);
  const inspect = async (artifactId: string) => {
    const version=++observationRequest.current;setInspectedArtifact(artifactId);setShowObs(true);setObsLoading(true);setObsError("");
    try {
      const res = await call("artifacts.read", { artifactId });
      if(version!==observationRequest.current)return;
      const o = decodeBase64Json<CompactObservation>(res.dataBase64);
      if(!o || typeof o.text!=="string" || !Array.isArray(o.refs))throw new Error("The saved page snapshot could not be read.");
      useStore.setState((s) => ({ observations: { ...s.observations, [runId]: o } }));
      setShowObs(true);
    } catch (e) {
      if(version===observationRequest.current)setObsError(e instanceof Error ? e.message : String(e));
    } finally { if(version===observationRequest.current)setObsLoading(false); }
  };
  inspectRef.current = inspect;

  return (
    <div className="run-panel" data-testid="run-panel">
      <div className="run-goal">
        <h2>{run.goal}</h2>
      </div>

      {!(conversation && !live && run.status === "completed") && <div className="run-status nums">
        {(!conversation || !["queued", "planning", "running", "paused", "needs_input"].includes(run.status))
          && <span className={`run-state ${run.status}`}>{STATUS_LABEL[run.status]}</span>}
        {page && page.url !== "about:blank" && page.pageId !== activePageId && (
          <button className="run-host" onClick={() => void activate(page.pageId).catch(errToast)} title={page.url}>
            {hostOf(page.url)}
            {run.pageIds.length > 1 ? ` +${run.pageIds.length - 1}` : ""}
          </button>
        )}
        <span className="sp" />
        <span className="run-acts">
          {!live && (run.config?.taskId
            ? <button className="icon-btn sm" title="Open saved task" aria-label="Open saved task" onClick={() => void openSavedTask(run.config!.taskId!).catch(errToast)}>{shellIconLayersSm}</button>
            : !conversation && !run.failure
                ? <button className="icon-btn sm" title="Run again" aria-label="Run again" onClick={() => void startRun(run.goal, { pageId: run.pageIds[0] ?? null })}>{shellIconReload}</button>
                : null)}
        </span>
      </div>}
      {!live && latestConversationTurn && !run.config?.taskId && !page && retryPage && (!run.failure || run.failure.retryable) && <section className="run-failure" role="status">
        <div className="run-failure-copy"><strong>The original tab is unavailable</strong><p>Retry using {retryPage.title || retryPage.url}. The saved request and context stay the same; the browser page changes.</p></div>
        <button className="btn sm" disabled={readOnly || retrying} onClick={() => void retryRun(run.runId, retryPage.pageId)}>{retrying ? "Retrying…" : "Retry in selected tab"}</button>
      </section>}
      {!live && latestConversationTurn && !run.config?.taskId && multiTabBlocked && <section className="run-failure" role="status">
        <div className="run-failure-copy"><strong>Original tabs are missing</strong><p>This turn used {run.pageIds.length} tabs. Restore those tabs before retrying. Aux will not retry a subset.</p></div>
      </section>}
      {!controlsInComposer && <RunControls runId={runId} compact/>}

      {live && run.statusMessage && !asksMe && !conversation && <p className="run-msg">{run.statusMessage}</p>}

      <Answer run={run} sources={sources} conversation={conversation} stream={stream} onCitationOpen={onCitationOpen} retry={conversation && !live && latestConversationTurn && !run.failure && !run.config?.taskId ? <button className="icon-btn sm" title={retrying ? "Retrying…" : "Retry this turn"} aria-label={retrying ? "Retrying turn" : "Retry this turn"} disabled={readOnly || (!page && run.pageIds.length > 0) || retrying || multiTabBlocked} onClick={() => void retryRun(run.runId)}>{shellIconReload}</button> : null} />
      <RunTranscriptDetails run={run} question={question} readOnly={readOnly} answerInComposer={questionInComposer} />

      {(calls != null || stats || !conversation) && <details className="run-provenance">
        <summary>Run details</summary>
        <div><Elapsed run={run}/>{calls != null && <span>{calls} {calls === 1 ? "model call" : "model calls"}</span>}</div>
        {stats && <><p>{[stats.providers.join(", "), stats.modelIds.join(", ")].filter(Boolean).join(" · ")}</p>
        <div><span>{stats.destinations.length ? `Destination ${stats.destinations.join(", ")}` : "Provider destination was not recorded"}</span><span>{stats.inputTokens.toLocaleString()} input · {stats.outputTokens.toLocaleString()} output tokens</span><span>{stats.costComplete ? `${fmtCost(stats.costUsd, false) || "$0.00"} recorded cost` : `${fmtCost(stats.costUsd, true) || "$0 known"} · provider cost incomplete`}</span></div></>}
      </details>}

      {run.failure && (
        <section className="run-failure" role="status">
          <span className="run-failure-icon">{shellIconAlert}</span>
          <div className="run-failure-copy">
            <strong>{run.failure.action === "model_settings" ? "Connection needs attention" : run.failure.action === "permission_settings" ? "Permission needed" : "This turn stopped"}</strong>
            <p>{run.failure.message}</p>
          </div>
          {latestConversationTurn && !run.config?.taskId && ["retry", "permission_settings"].includes(run.failure.action) && (page || !run.pageIds.length) && (
            <button className="btn sm" disabled={readOnly || retrying} onClick={() => void retryRun(run.runId)}>{shellIconReload}{retrying ? "Retrying…" : "Retry turn"}</button>
          )}
          {run.failure.action === "edit_request" && latestConversationTurn && <button className="btn sm" disabled={readOnly} onClick={() => {
            if (run.config?.taskId) { void openSavedTask(run.config.taskId).catch(errToast); return; }
            const chatId = run.config?.chatId ?? run.runId;
            const state = useStore.getState();
            if (!state.conversationDrafts[`chat:${chatId}`]?.trim()) state.setConversationDraft(chatId, run.goal);
            state.openConversation(run.runId);
            requestAnimationFrame(() => composerRef?.current?.focus());
          }}>{run.config?.taskId ? "Edit task" : "Revise request"}</button>}
          {run.failure.action === "permission_settings" && <button className="btn sm" onClick={() => { useStore.setState({ settingsCategory: "Agent permissions" }); useStore.getState().setOverlay("settings"); }}>{shellIconLock}Review permissions</button>}
          {run.failure.action === "permission_settings" && run.config?.taskId && <button className="btn sm" onClick={() => void openSavedTask(run.config!.taskId!).catch(errToast)}>Open task</button>}
          {/vault|credential grant|opaque reference|Unlock the agent vault/i.test(run.failure.message) && <button className="btn sm" onClick={() => { useStore.setState({ settingsCategory: "Vault" }); useStore.getState().setOverlay("settings"); }}>{shellIconLock}Open vault</button>}
          {run.failure.action === "model_settings" && (
            <button className="btn sm" onClick={openModelSettings}>{shellIconGearSm}Model settings</button>
          )}
        </section>
      )}

      {( !conversation || live || (steps?.length ?? 0) > 0) && <section className="run-section">
        <button className="run-section-head toggle" aria-expanded={showSteps} onClick={() => setShowSteps((v) => !v)}>
          <span className={`chev ${showSteps ? "open" : ""}`}>{shellIconRight}</span>
          <span>{conversation ? "Work history" : "Steps"}</span>
          <span className="count nums">{steps?.length ?? 0}</span>
          {steps && steps.length > 0 && <span className="sum nums">{fmtMs(steps.reduce((a, s) => a + (s.outcome?.durationMs ?? 0), 0))}</span>}
        </button>
        {showSteps && (!!steps?.length || live) && <StepTimeline compact steps={steps ?? []} live={live && !humanHolds && run.status !== "paused"} onInspect={onInspect} />}
      </section>}

      {(obs || observationArtifact) && (!conversation || showSteps) && (
        <section className="run-section">
          <button className="run-section-head toggle" aria-expanded={showObs} onClick={() => { if(!showObs && !obs && observationArtifact)void inspect(observationArtifact);else setShowObs(value=>!value); }}>
            <span className={`chev ${showObs ? "open" : ""}`}>{shellIconRight}</span>
            <span>Page</span>
            {obs && <span className="count nums">{obs.refs.length}</span>}
          </button>
          {showObs && (obsLoading ? <output className="hint" data-block>Loading saved page…</output> : obsError ? <p className="field-error" role="alert">{obsError} {(inspectedArtifact || observationArtifact) && <button className="btn sm" onClick={()=>void inspect((inspectedArtifact || observationArtifact)!)}>Retry</button>}</p> : obs ? <ObservationPanel compact obs={obs} /> : null)}
        </section>
      )}
    </div>
  );
});
