import { useEffect, useState } from "react";
import type { Routine, Run } from "@aux/contracts";
import { call } from "../store";

/** Owner-reviewed source substitutions and a separate, durable replay test. */
export function SkillReplayPanel({ routine, pageId, disabled, onChanged }: {
  routine: Routine; pageId: string | null; disabled: boolean; onChanged(): Promise<void>;
}) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [sourceRunId, setSourceRunId] = useState(routine.sourceRunId ?? "");
  const [samples, setSamples] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void call("runs.list", { limit: 500 }).then(items => {
      if (active) setRuns(items.filter(run => run.status === "completed"
        && run.config?.taskId === routine.sourceTaskId
        && run.config?.taskRevision === routine.sourceTaskRevision));
    }).catch(() => { if (active) setRuns([]); });
    return () => { active = false; };
  }, [routine.sourceTaskId, routine.sourceTaskRevision]);
  const source = runs.find(run => run.runId === sourceRunId);
  const replay = routine.replay;
  const readySamples = routine.parameters.length > 0 && routine.parameters.every(item => !!samples[item.name]?.trim());
  const readyValues = routine.parameters.length > 0 && routine.parameters.every(item => !!values[item.name]?.trim());
  async function act(work: () => Promise<unknown>) {
    if (busy || disabled) return;
    setBusy(true); setError("");
    try { await work(); await onChanged(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }
  return <section className="field" aria-label="Skill replay" aria-busy={busy}>
    <strong>Tested replay</strong>
    <p className="hint">Save a verified browser trace from this task. Source values are replaced with named parameters before the replay is saved. The Skill stays paused until a separate test passes and you review activation.</p>
    {replay && <p role="status">{replay.state === "tested" ? "Tested replay ready for review" : replay.state === "needs_repair" ? "Needs repair before reuse" : replay.state === "testing" ? "Replay test in progress" : "Replay needs a test"} · {replay.siteOrigin} · {replay.steps.length} steps</p>}
    {replay?.testRunId && <p className="hint">Test run {replay.testRunId}{replay.testedAt ? ` · passed ${new Date(replay.testedAt).toLocaleString()}` : ""}</p>}
    <label>Completed source run
      <select aria-label="Completed source run" value={sourceRunId} disabled={disabled || busy} onChange={event => setSourceRunId(event.target.value)}>
        <option value="">Choose a completed run</option>
        {runs.map(run => <option key={run.runId} value={run.runId}>{run.goal.slice(0, 100)} · {new Date(run.createdAt).toLocaleString()}</option>)}
      </select>
    </label>
    {routine.parameters.map(item => <label key={`source:${item.name}`}>Recorded source value for {item.label}
      <input aria-label={`Recorded source value for ${item.label}`} type="text" autoComplete="off" value={samples[item.name] ?? ""}
        disabled={disabled || busy} onChange={event => setSamples(current => ({ ...current, [item.name]: event.target.value }))}/>
    </label>)}
    <button className="btn sm" disabled={disabled || busy || !readySamples || !pageId || !source?.pageIds.includes(pageId)}
      onClick={() => void act(() => call("routines.replay.compile", { routineId: routine.routineId,
        expectedRevision: routine.revision, sourceRunId, pageId: pageId!, samples }))}>
      {replay ? "Repair from this run" : "Prepare replay from run"}
    </button>
    {source && pageId && !source.pageIds.includes(pageId) && <p className="hint">Open the source run’s exact tab before preparing its trace.</p>}
    {replay && <>
      <p className="hint">Test on the current tab at the same site using fresh values. Browser writes still need their normal approval.</p>
      {routine.parameters.map(item => <label key={`test:${item.name}`}>Test value for {item.label}
        <input aria-label={`Test value for ${item.label}`} type="text" autoComplete="off" value={values[item.name] ?? ""}
          disabled={disabled || busy} onChange={event => setValues(current => ({ ...current, [item.name]: event.target.value }))}/>
      </label>)}
      <button className="btn sm" disabled={disabled || busy || !pageId || !readyValues || replay.state === "testing"}
        onClick={() => void act(() => call("routines.replay.test", { routineId: routine.routineId,
          expectedRevision: routine.revision, pageId: pageId!, parameters: values }))}>Run replay test</button>
      {replay.state === "testing" && replay.testRunId && <button className="btn sm ghost" disabled={disabled || busy}
        onClick={() => void act(() => call("routines.replay.result", { routineId: routine.routineId,
          expectedRevision: routine.revision, runId: replay.testRunId! }))}>Check test result</button>}
    </>}
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}
