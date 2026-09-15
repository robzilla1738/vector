import { useEffect, useMemo, useState } from "react";
import type { CompactObservation, Run } from "@vector/contracts";
import { decodeBase64Json, isLive, useStore, call, errToast } from "../store";
import { hostOf } from "../workspace";
import { ObservationPanel } from "./ObservationPanel";
import { StepTimeline, fmtMs } from "./StepTimeline";
import { I } from "./icons";

const STATUS_LABEL: Record<Run["status"], string> = {
  queued: "Queued",
  planning: "Planning",
  running: "Working",
  paused: "Paused",
  needs_input: "Needs your answer",
  completed: "Done",
  partially_completed: "Partly done",
  failed: "Failed",
  cancelled: "Cancelled",
  interrupted: "Interrupted",
};

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

/** Final answer as prose — no status chrome, copy is an icon. */
function Answer({ run }: { run: Run }) {
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => {
    const parts: string[] = [];
    if (run.statusMessage) parts.push(run.statusMessage);
    if (run.result) for (const [k, v] of Object.entries(run.result)) parts.push(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
    if (run.error) parts.push(`Error: ${run.error}`);
    return parts.join("\n");
  }, [run]);
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
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
      {run.statusMessage && <p className="answer-text">{run.statusMessage}</p>}
      {run.result && Object.keys(run.result).length > 0 && (
        <dl className="answer-result">
          {Object.entries(run.result).map(([k, v]) => (
            <div key={k} className="answer-row">
              <dt>{k.replace(/_/g, " ")}</dt>
              <dd>
                {Array.isArray(v) ? (
                  <ul>{v.map((item, i) => <li key={i}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>)}</ul>
                ) : typeof v === "object" && v !== null ? (
                  <pre>{JSON.stringify(v, null, 2)}</pre>
                ) : (
                  String(v)
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {run.error && <p className="answer-text err">{run.error}</p>}
    </section>
  );
}

export function RunPanel({ runId }: { runId: string }) {
  const run = useStore((s) => s.runs.find((r) => r.runId === runId));
  const steps = useStore((s) => s.steps[runId]);
  const stats = useStore((s) => s.modelStats[runId]);
  const obs = useStore((s) => s.observations[runId]);
  const prompt = useStore((s) => s.prompt);
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const loadRun = useStore((s) => s.loadRun);
  const answerRun = useStore((s) => s.answerRun);
  const returnControl = useStore((s) => s.returnControl);
  const startRun = useStore((s) => s.startRun);
  const activate = useStore((s) => s.activate);
  const [answer, setAnswer] = useState("");
  const [showObs, setShowObs] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    setShowObs(false);
    const r = useStore.getState().runs.find((x) => x.runId === runId);
    setShowSteps(!!r && isLive(r));
    if (!steps || (!obs && steps.length)) void loadRun(runId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  const elapsed = useElapsed(run);

  if (!run) return <div className="rail-empty">This run is no longer available.</div>;

  const live = isLive(run);
  const page = pages.find((p) => p.pageId === run.pageIds[0]);
  const humanHolds = page?.controller === "human";
  const asksMe = prompt?.runId === run.runId || run.status === "needs_input";
  const question = prompt?.runId === run.runId ? prompt.question : run.statusMessage;
  const calls = stats?.calls ?? run.config?.modelCalls;
  const act = (m: string) => void call(m, { runId: run.runId }).catch(errToast);

  const inspect = async (artifactId: string) => {
    try {
      const res = await call<{ dataBase64: string }>("artifacts.read", { artifactId });
      const o = decodeBase64Json<CompactObservation>(res.dataBase64);
      useStore.setState((s) => ({ observations: { ...s.observations, [runId]: o } }));
      setShowObs(true);
    } catch (e) {
      errToast(e);
    }
  };

  return (
    <div className="run-panel" data-testid="run-panel">
      <div className="run-goal">
        <h2>{run.goal}</h2>
      </div>

      <div className="run-status nums">
        <span className={`run-state ${run.status}`}>{STATUS_LABEL[run.status]}</span>
        <span className="run-time" title="Elapsed">{fmtElapsed(elapsed)}</span>
        {calls != null && <span title="Model calls">{calls} {calls === 1 ? "call" : "calls"}</span>}
        {stats && stats.costUsd > 0 && <span title={`${stats.inputTokens.toLocaleString()} in · ${stats.outputTokens.toLocaleString()} out tokens`}>{fmtCost(stats.costUsd, stats.costEstimated)}</span>}
        {page && page.pageId !== activePageId && (
          <button className="run-host" onClick={() => void activate(page.pageId).catch(errToast)} title={page.url}>
            {hostOf(page.url)}
            {run.pageIds.length > 1 ? ` +${run.pageIds.length - 1}` : ""}
          </button>
        )}
        <span className="sp" />
        <span className="run-acts">
          {run.status === "running" && <button className="icon-btn sm" title="Pause" aria-label="Pause run" onClick={() => act("runs.pause")}>{I.pause}</button>}
          {run.status === "paused" && !humanHolds && <button className="icon-btn sm" title="Resume" aria-label="Resume run" onClick={() => act("runs.resume")}>{I.play}</button>}
          {live && <button className="icon-btn sm danger" title="Stop" aria-label="Stop run" onClick={() => act("runs.cancel")}>{I.square}</button>}
          {!live && <button className="icon-btn sm" title="Run again" aria-label="Run again" onClick={() => void startRun(run.goal, { pageId: run.pageIds[0] ?? null })}>{I.reload}</button>}
        </span>
      </div>

      {humanHolds && page && (
        <div className="takeover" role="status">
          <span className="takeover-ico">{I.hand}</span>
          <div className="takeover-main">
            <b>You're in control</b>
            <span>The agent paused when you touched the page. Finish what you're doing, then hand it back.</span>
          </div>
          <button className="btn primary sm" onClick={() => void returnControl(page.pageId)}>Return control</button>
        </div>
      )}

      {live && run.statusMessage && !asksMe && <p className="run-msg">{run.statusMessage}</p>}

      {asksMe && question && (
        <div className="needs-input" role="group" aria-label="The agent needs your answer">
          <div className="ni-head">{I.chat}<span>Needs your answer</span></div>
          <p className="ni-q">{question}</p>
          <div className="ni-row">
            <input
              autoFocus
              value={answer}
              placeholder="Type an answer…"
              aria-label="Your answer"
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && answer.trim()) {
                  void answerRun(run.runId, answer.trim());
                  setAnswer("");
                }
              }}
            />
            <button className="btn primary sm" disabled={!answer.trim()} onClick={() => { void answerRun(run.runId, answer.trim()); setAnswer(""); }}>Send</button>
          </div>
        </div>
      )}

      <Answer run={run} />

      <section className="run-section">
        <button className="run-section-head toggle" aria-expanded={showSteps} onClick={() => setShowSteps((v) => !v)}>
          <span className={`chev ${showSteps ? "open" : ""}`}>{I.right}</span>
          <span>Steps</span>
          <span className="count nums">{steps?.length ?? 0}</span>
          {steps && steps.length > 0 && <span className="sum nums">{fmtMs(steps.reduce((a, s) => a + (s.outcome?.durationMs ?? 0), 0))}</span>}
        </button>
        {showSteps && <StepTimeline compact steps={steps ?? []} live={live && !humanHolds && run.status !== "paused"} onInspect={(id) => void inspect(id)} />}
      </section>

      {obs && (
        <section className="run-section">
          <button className="run-section-head toggle" aria-expanded={showObs} onClick={() => setShowObs((v) => !v)}>
            <span className={`chev ${showObs ? "open" : ""}`}>{I.right}</span>
            <span>Page</span>
            <span className="count nums">{obs.refs.length}</span>
          </button>
          {showObs && <ObservationPanel compact obs={obs} />}
        </section>
      )}
    </div>
  );
}
