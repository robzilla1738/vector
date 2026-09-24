import { useEffect, useState } from "react";
import type { Routine, RoutineAlert, RoutineCompare, RoutineRun, Task, VaultItem } from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";
import { RoutineSchedule, routineScheduleSummary } from "./RoutineSchedule";

export function Routines({ workspaceId, task }: { workspaceId: string; task?: Task }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [alerts, setAlerts] = useState<RoutineAlert[]>([]);
  const [comparison, setComparison] = useState<RoutineCompare | null>(null);
  const [selected, setSelected] = useState<{ routine: Routine; runs: RoutineRun[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [parameter, setParameter] = useState("");
  const [status, setStatus] = useState<"all" | "ready" | "paused" | "archived">("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  async function refresh(routineId?: string) {
    const [items, nextAlerts] = await Promise.all([
      call("routines.list", { workspaceId, includeArchived: true }),
      call("routines.alerts", { limit: 20 }),
    ]);
    setRoutines(items);
    setAlerts(nextAlerts);
    if (routineId) setSelected(await call("routines.get", { routineId }));
  }
  useEffect(() => {
    let active = true;
    setLoading(true); setSelected(null); setComparison(null); setError("");
    void Promise.all([
      call("routines.list", { workspaceId, includeArchived: true }),
      call("routines.alerts", { limit: 20 }),
    ]).then(([items, nextAlerts]) => {
      if (active) { setRoutines(items); setAlerts(nextAlerts); }
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [workspaceId]);
  async function action(work: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await work(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const visibleRoutines = routines.filter(item => (status === "all" || (status === "archived" ? !!item.archivedAt : !item.archivedAt && (status === "paused" ? item.paused : !item.paused))) && `${item.title} ${item.objective}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="routines-section" aria-label="Routines" aria-busy={loading || busy}>
    <div className="routines-heading"><div><h4>Routines</h4><p className="hint">Your repeatable work, on a schedule.</p></div><div className="row">{task && <button className="btn sm" disabled={busy} onClick={() => void action(async () => {
      const routine = await call("routines.fromResult", { taskId: task.taskId, title: title || task.title, parameters: parameter ? [{ name: "topic", label: "Topic", value: parameter }] : [] });
      setTitle(""); setParameter(""); await refresh(routine.routineId);
    })}>Make routine from this task</button>}
      <button className="btn sm ghost" disabled={busy} onClick={() => void action(async () => {
        const ids = routines.filter(item => !item.archivedAt).map(item => item.routineId);
        if (!ids.length) { setNotice("No active routines to export."); return; }
        const envelope = await call("routines.export", { routineIds: ids });
        const path = await bridge.saveFile("aux-routines.json", JSON.stringify(envelope, null, 2));
        if (path) setNotice(`Exported ${ids.length} routine${ids.length === 1 ? "" : "s"}.`);
      })}>Export…</button>
      <button className="btn sm ghost" disabled={busy} onClick={() => void action(async () => {
        const path = await bridge.openFile();
        if (!path) return;
        const result = await call("routines.import", { path, workspaceId });
        setNotice(`Imported ${result.imported} inactive routine${result.imported === 1 ? "" : "s"}${result.skipped ? ` · ${result.skipped} duplicates skipped` : ""}. Bind each one to a saved task before use.`);
        await refresh();
      })}>Import…</button>
    </div></div>
    <details className="routine-safety"><summary>How routines run safely</summary><p className="hint">Scheduled writes wait for review. Monitors coalesce missed reads. Overlapping runs are blocked until you reconcile an uncertain write.</p></details>
    {alerts.length > 0 && <section className="field" aria-label="Routine alerts"><strong>Alerts</strong><span className="hint">Local run records only. They do not prove a business outcome.</span>{alerts.map(alert => <div className="hint" key={alert.routineRunId}>{alert.title} · {alert.status.replaceAll("_", " ")} · {alert.triggerKind}{alert.reason ? ` · ${alert.reason}` : ""} · {new Date(alert.createdAt).toLocaleString()}</div>)}</section>}
    {task && <div className="row"><input aria-label="Routine title" placeholder="Routine title" value={title} onChange={event => setTitle(event.target.value)} /><input aria-label="Topic parameter" placeholder="Optional topic parameter" value={parameter} onChange={event => setParameter(event.target.value)} /></div>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {notice && <p className="hint" role="status">{notice}</p>}
    {!selected && <>
      <label className="routine-search">{I.search}<input aria-label="Search routines" placeholder="Search routines…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className="work-list-heading"><div className="history-segment" role="group" aria-label="Routine status">{(["all", "ready", "paused", "archived"] as const).map(filter => <button key={filter} className={status === filter ? "active" : ""} aria-pressed={status === filter} onClick={() => setStatus(filter)}>{filter[0]!.toUpperCase() + filter.slice(1)}</button>)}</div><span className="hint" role="status">{visibleRoutines.length} {visibleRoutines.length === 1 ? "routine" : "routines"}</span></div>
      {loading ? <p className="hint" role="status">Loading routines…</p> : <div className="routine-grid">
        {visibleRoutines.map(item => <button className="routine-card" disabled={busy} key={item.routineId} onClick={() => void action(() => refresh(item.routineId))}>
          <span className="routine-card-top">{I.clock}<span className="routine-status">{item.archivedAt ? "Archived" : item.paused ? "Paused" : "Ready"}</span></span>
          <strong>{item.title}</strong><p>{item.objective}</p>
          <span className="routine-card-trigger">{routineScheduleSummary(item.trigger)}{I.right}</span>
        </button>)}
        {!error && !visibleRoutines.length && <div className="routine-empty">{I.clock}<strong>{query || status !== "all" ? "No matching routines" : "Make room for repeatable work"}</strong><p>{query || status !== "all" ? "Try another title or status." : "Open a saved task to turn it into a routine."}</p>{(query || status !== "all") && <button className="btn ghost" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button>}</div>}
      </div>}
    </>}
    {selected && <div className="routine-detail">
      <button className="btn ghost" disabled={busy} onClick={() => { setSelected(null); setComparison(null); }}>{I.back}All routines</button>
      <h3>{selected.routine.title}</h3>
      <p className="hint">{selected.routine.objective}</p>
      <dl className="routine-overview"><div><dt>Status</dt><dd>{selected.routine.archivedAt ? "Archived" : selected.routine.paused ? "Paused" : "Ready"}</dd></div><div><dt>Trigger</dt><dd>{selected.routine.trigger.kind}</dd></div><div><dt>Runs</dt><dd>{selected.runs.length}</dd></div></dl>
      <span className="hint">{selected.routine.reviewRequired ? "Review required before writes." : "May run without extra review."} Timezone {selected.routine.trigger.kind === "manual" ? timezone : selected.routine.trigger.timezone}. Cloud {selected.routine.cloudCapable ? "can continue if configured" : "needs this Mac"}.</span>
      {!selected.routine.sourceTaskId && <p className="hint">This imported definition is inactive. Binding it to a saved task gives it that task's current page and grants. Review the task and Accounts below before resuming.</p>}
      <RoutineSourceTask key={`${selected.routine.routineId}-source:${selected.routine.revision}`} routine={selected.routine} disabled={busy || !!selected.routine.archivedAt} onSave={sourceTaskId => void action(async () => {
        await call("routines.update", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, sourceTaskId });
        await refresh(selected.routine.routineId);
      })} />
      <RoutineRunControls key={`${selected.routine.routineId}-run:${selected.routine.revision}`} routine={selected.routine} disabled={busy || selected.routine.paused || !!selected.routine.archivedAt || !selected.routine.sourceTaskId} onRun={parameters => void action(async () => {
        const run = await call("routines.run", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, parameters });
        await refresh(selected.routine.routineId);
        if (run.reason) setError(run.reason);
      })} />
      <div className="row">
        <button className="btn sm" disabled={busy || (selected.routine.paused && !selected.routine.sourceTaskId)} onClick={() => void action(async () => { await call("routines.pause", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, paused: !selected.routine.paused }); await refresh(selected.routine.routineId); })}>{selected.routine.paused ? "Resume" : "Pause"}</button>
        {selected.runs.length >= 2 && <button className="btn sm" disabled={busy} onClick={() => void action(async () => { setComparison(await call("routines.compare", { leftRunId: selected.runs[1]!.routineRunId, rightRunId: selected.runs[0]!.routineRunId })); })}>Compare latest two runs</button>}
      </div>
      <RoutineSchedule key={`${selected.routine.routineId}:${selected.routine.revision}`} trigger={selected.routine.trigger} disabled={busy || !!selected.routine.archivedAt} onSave={trigger => void action(async () => {
        await call("routines.update", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, trigger });
        await refresh(selected.routine.routineId);
      })} />
      <RoutineAccounts key={`${selected.routine.routineId}-accounts:${selected.routine.revision}`} routine={selected.routine} disabled={busy || !!selected.routine.archivedAt} onSave={accountLabels => void action(async () => {
        await call("routines.update", { routineId: selected.routine.routineId, expectedRevision: selected.routine.revision, accountLabels });
        await refresh(selected.routine.routineId);
      })} />
      {comparison && comparison.routineId === selected.routine.routineId && <p className="hint" role="status">{comparison.summary}</p>}
      <h4>Run history</h4>
      {!selected.runs.length && <p className="hint">This routine has not run yet.</p>}
      {selected.runs.map(run => <div className="routine-run hint" key={run.routineRunId}>
        {run.status.replaceAll("_", " ")}{run.reason ? ` · ${run.reason}` : ""} · {new Date(run.createdAt).toLocaleString()}
        {(run.status === "needs_review" || run.status === "uncertain") && <>
          <button className="btn sm" disabled={busy} onClick={() => void action(async () => { await call("routines.reconcile", { routineRunId: run.routineRunId, outcome: "applied", note: "Reviewed in Aux." }); await refresh(selected.routine.routineId); })}>Mark reviewed</button>
          <button className="btn sm ghost" disabled={busy} onClick={() => void action(async () => { await call("routines.reconcile", { routineRunId: run.routineRunId, outcome: "not_applied", note: "Skipped this occurrence in Aux." }); await refresh(selected.routine.routineId); })}>Skip occurrence</button>
        </>}
      </div>)}
    </div>}
  </section>;
}

function RoutineSourceTask({ routine, disabled, onSave }: { routine: Routine; disabled: boolean; onSave: (taskId: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [picked, setPicked] = useState(routine.sourceTaskId ?? "");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let live = true;
    void call("tasks.list", { workspaceId: routine.workspaceId, limit: 500 })
      .then(items => { if (live) setTasks(items); })
      .catch(reason => { if (live) setLoadError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { live = false; };
  }, [routine.workspaceId]);
  return <div className="field"><label htmlFor={`routine-source-${routine.routineId}`}>Source task</label>
    <div className="row"><select id={`routine-source-${routine.routineId}`} value={picked} disabled={disabled} onChange={event => setPicked(event.target.value)}>
      <option value="">Choose a saved task…</option>
      {tasks.map(task => <option key={task.taskId} value={task.taskId}>{task.title}</option>)}
    </select><button className="btn sm" disabled={disabled || !picked || picked === routine.sourceTaskId} onClick={() => onSave(picked)}>Bind task</button></div>
    {loadError && <span className="field-error">Tasks could not be loaded. {loadError}</span>}
  </div>;
}

function RoutineRunControls({ routine, disabled, onRun }: { routine: Routine; disabled: boolean; onRun: (parameters: Record<string, string>) => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(routine.parameters.map(item => [item.name, item.value ?? ""])));
  return <div className="field">
    {routine.parameters.map(item => <label key={item.name}>{item.label}<input value={values[item.name] ?? ""} disabled={disabled} onChange={event => setValues(current => ({ ...current, [item.name]: event.target.value }))} /></label>)}
    <button className="btn sm" disabled={disabled || routine.parameters.some(item => !values[item.name]?.trim())} onClick={() => onRun(values)}>Run now</button>
  </div>;
}

/** Choose which labeled vault accounts this routine may use — an empty selection stays unrestricted. */
function RoutineAccounts({ routine, disabled, onSave }: { routine: Routine; disabled: boolean; onSave: (accountLabels: string[]) => void }) {
  const [items, setItems] = useState<VaultItem[] | null>(null);
  const [picked, setPicked] = useState<string[]>(routine.accountLabels);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let live = true;
    void call("vault.list", { includeRevoked: false })
      .then(list => { if (live) setItems(list); })
      .catch(reason => { if (live) setLoadError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { live = false; };
  }, []);
  const known = [...new Set((items ?? []).map(item => item.accountLabel).filter((label): label is string => !!label))].sort();
  const choices = [...new Set([...known, ...picked])];
  const dirty = picked.length !== routine.accountLabels.length || picked.some(label => !routine.accountLabels.includes(label));
  const toggle = (label: string, on: boolean) => setPicked(current => on ? [...new Set([...current, label])] : current.filter(item => item !== label));
  return <details className="routine-accounts"><summary>Accounts{picked.length ? ` — ${picked.length} labeled` : " — any"}</summary>
    <p className="hint">Pick the labeled accounts this routine may fill. Runs only see grants for the labels you choose; an empty list means any account. Label vault items in Vault settings.</p>
    {loadError && <p className="field-error" role="alert">Vault labels could not be loaded. {loadError}</p>}
    {items !== null && !choices.length && <p className="hint">No labeled vault items yet — every vault item without an account label stays unrestricted.</p>}
    {choices.map(label => <label className="routine-account" key={label}><input type="checkbox" checked={picked.includes(label)} disabled={disabled} onChange={event => toggle(label, event.target.checked)} /><span>{label}{!known.includes(label) && <small> · not in vault</small>}</span></label>)}
    {(items !== null || picked.length > 0) && <button className="btn sm" disabled={disabled || !dirty} onClick={() => onSave(picked)}>Save accounts</button>}
  </details>;
}
