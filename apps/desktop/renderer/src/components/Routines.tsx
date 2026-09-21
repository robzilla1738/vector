import { useEffect, useState } from "react";
import type { Routine, RoutineAlert, RoutineCompare, RoutineRun, Task } from "@vector/contracts";
import { call } from "../store";

export function Routines({ workspaceId, task }: { workspaceId: string; task?: Task }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [alerts, setAlerts] = useState<RoutineAlert[]>([]);
  const [comparison, setComparison] = useState<RoutineCompare | null>(null);
  const [selected, setSelected] = useState<{ routine: Routine; runs: RoutineRun[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [parameter, setParameter] = useState("");
  async function refresh(routineId?: string) {
    const [items, nextAlerts] = await Promise.all([
      call<Routine[]>("routines.list", { workspaceId, includeArchived: true }),
      call<RoutineAlert[]>("routines.alerts", { limit: 20 }),
    ]);
    setRoutines(items);
    setAlerts(nextAlerts);
    if (routineId) setSelected(await call("routines.get", { routineId }));
  }
  useEffect(() => { void refresh().catch(reason => setError(reason instanceof Error ? reason.message : String(reason))); }, [workspaceId]);
  async function action(work: () => Promise<void>) {
    setBusy(true); setError("");
    try { await work(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  return <section className="field" aria-label="Routines">
    <div className="row"><h4 className="grow">Routines</h4>{task && <button className="btn sm" disabled={busy} onClick={() => void action(async () => {
      const routine = await call<Routine>("routines.fromResult", { taskId: task.taskId, title: title || task.title, parameters: parameter ? [{ name: "topic", label: "Topic", value: parameter }] : [] });
      setTitle(""); setParameter(""); await refresh(routine.routineId);
    })}>Make routine from this task</button>}</div>
    <p className="hint">Parameterized repeats of a saved task. Scheduled writes wait for review. Monitors coalesce missed reads. Overlapping runs are blocked until you reconcile an uncertain write.</p>
    {alerts.length > 0 && <section className="field" aria-label="Routine alerts"><strong>Alerts</strong><span className="hint">Local run records only. They do not prove a business outcome.</span>{alerts.map(alert => <div className="hint" key={alert.routineRunId}>{alert.title} · {alert.status.replaceAll("_", " ")} · {alert.triggerKind}{alert.reason ? ` · ${alert.reason}` : ""} · {new Date(alert.createdAt).toLocaleString()}</div>)}</section>}
    {task && <div className="row"><input aria-label="Routine title" placeholder="Routine title" value={title} onChange={event => setTitle(event.target.value)} /><input aria-label="Topic parameter" placeholder="Optional topic parameter" value={parameter} onChange={event => setParameter(event.target.value)} /></div>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {routines.map(item => <button className="btn" key={item.routineId} aria-pressed={selected?.routine.routineId === item.routineId} onClick={() => void action(() => refresh(item.routineId))}>{item.title}{item.paused ? " · paused" : ""}{item.archivedAt ? " · archived" : ""} · {item.trigger.kind}</button>)}
    {selected && <div className="task-resource">
      <strong>{selected.routine.title}</strong>
      <p className="hint">{selected.routine.objective}</p>
      <span className="hint">{selected.routine.reviewRequired ? "Review required before writes." : "May run without extra review."} Timezone {selected.routine.trigger.kind === "manual" ? timezone : selected.routine.trigger.timezone}. Cloud {selected.routine.cloudCapable ? "can continue if configured" : "needs this Mac"}.</span>
      <div className="row">
        <button className="btn sm" disabled={busy || selected.routine.paused || !!selected.routine.archivedAt} onClick={() => void action(async () => { const run = await call<RoutineRun>("routines.run", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, parameters: {} }); await refresh(selected.routine.routineId); if (run.reason) setError(run.reason); })}>Run now</button>
        <button className="btn sm" disabled={busy} onClick={() => void action(async () => { await call("routines.pause", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, paused: !selected.routine.paused }); await refresh(selected.routine.routineId); })}>{selected.routine.paused ? "Resume" : "Pause"}</button>
        <button className="btn sm" disabled={busy} onClick={() => void action(async () => { await call("routines.update", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, trigger: { kind: "schedule", timezone, hour: 9, minute: 0, days: [1, 2, 3, 4, 5] } }); await refresh(selected.routine.routineId); })}>Weekday 09:00</button>
        <button className="btn sm" disabled={busy} onClick={() => void action(async () => { await call("routines.update", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, trigger: { kind: "monitor", timezone, intervalMinutes: 60 }, reviewRequired: false }); await refresh(selected.routine.routineId); })}>Hourly monitor</button>
        {selected.runs.length >= 2 && <button className="btn sm" disabled={busy} onClick={() => void action(async () => { setComparison(await call<RoutineCompare>("routines.compare", { leftRunId: selected.runs[1]!.routineRunId, rightRunId: selected.runs[0]!.routineRunId })); })}>Compare latest two runs</button>}
      </div>
      {comparison && comparison.routineId === selected.routine.routineId && <p className="hint" role="status">{comparison.summary}</p>}
      {selected.runs.map(run => <div className="hint" key={run.routineRunId}>
        {run.status.replaceAll("_", " ")}{run.reason ? ` · ${run.reason}` : ""} · {new Date(run.createdAt).toLocaleString()}
        {(run.status === "needs_review" || run.status === "uncertain") && <>
          <button className="btn sm" disabled={busy} onClick={() => void action(async () => { await call("routines.reconcile", { routineRunId: run.routineRunId, outcome: "applied", note: "Reviewed in Aux." }); await refresh(selected.routine.routineId); })}>Mark reviewed</button>
          <button className="btn sm ghost" disabled={busy} onClick={() => void action(async () => { await call("routines.reconcile", { routineRunId: run.routineRunId, outcome: "not_applied", note: "Skipped this occurrence in Aux." }); await refresh(selected.routine.routineId); })}>Skip occurrence</button>
        </>}
      </div>)}
    </div>}
  </section>;
}
