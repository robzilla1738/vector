import { useEffect, useRef, useState } from "react";
import type { Task, TaskReceipt } from "@aux/contracts";
import { call, useStore } from "../store";
import { TaskReceiptView } from "./TaskReceiptView";

/** Saved definitions and receipts are inspectable without replacing the current draft. */
export function TaskHistory({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start" }); }, []);
  const [revisions, setRevisions] = useState<Task[]>([]);
  const [revision, setRevision] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<TaskReceipt | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const openRail = useStore(s => s.openRail);
  const closeOverlay = useStore(s => s.setOverlay);
  useEffect(() => {
    let live = true;
    setError("");
    void call<{ revisions: Task[] }>("tasks.get", { taskId }).then(details => {
      if (!live) return;
      setRevisions([...details.revisions].reverse());
      setRevision(prior => prior ?? details.revisions.at(-2)?.revision ?? details.revisions.at(-1)!.revision);
    }).catch(error => { if (live) setError(String(error)); });
    return () => { live = false; };
  }, [taskId, retry]);
  useEffect(() => {
    if (revision === null) return;
    let live = true;
    setReceipt(null); setError("");
    void call<TaskReceipt>("tasks.receipt", { taskId, revision }).then(value => { if (live) setReceipt(value); })
      .catch(error => { if (live) setError(String(error)); });
    return () => { live = false; };
  }, [taskId, revision, retry]);
  const task = revisions.find(task => task.revision === revision);
  return <section className="task-history field" aria-label="Saved task history">
    <div className="row"><h3 ref={heading} tabIndex={-1}>Saved task history</h3><span className="sp" />
      <button className="btn sm" onClick={onClose}>Back to current task</button></div>
    <p className="hint">Inspect earlier objectives, resources, evidence and reviews. Your current draft stays unchanged. Saved history stays on this Mac and is available in every Aux window without signing in.</p>
    {!!revisions.length && <label className="field">Saved revision
      <select aria-label="Saved revision" value={revision ?? ""} onChange={event => { setReceipt(null); setRevision(Number(event.target.value)); }}>
        {revisions.map(item => <option key={item.revision} value={item.revision}>Revision {item.revision}{item.revision === revisions[0]?.revision ? " · Latest saved" : ""} · {new Date(item.updatedAt).toLocaleString()}</option>)}
      </select></label>}
    {error && <div role="alert"><p>{error}</p><button className="btn sm" onClick={() => setRetry(value => value + 1)}>Retry history</button></div>}
    {!receipt && !error && <p role="status">Loading saved revision…</p>}
    {task && receipt && <>
      <div className="task-history-definition field">
        <h3>{task.title}</h3><span className="hint">Revision {task.revision} · {task.state === "archived" ? "Archived" : "Open"} when saved</span>
        <p className="selectable">{task.objective}</p>
        <h4>Saved resources</h4>
        {!task.resources.length && <p className="hint">No resources in this revision.</p>}
        {task.resources.map(resource => <div key={resource.resourceId} className="field"><strong>{resource.label}</strong><span className="hint selectable">{resource.kind} · {resource.locator}</span></div>)}
      </div>
      <TaskReceiptView key={`${taskId}:${revision}`} receipt={receipt} pageId={null} readOnly />
      <details><summary>Runs through revision {task.revision} ({receipt.runs.length})</summary>
        <div className="field">{receipt.runs.map(run => <button className="btn sm" key={run.runId} onClick={() => { openRail({ kind: "run", runId: run.runId }); closeOverlay(null); }}>
          Revision {run.taskRevision} · {run.status.replaceAll("_", " ")} · {run.runId}
        </button>)}</div>
      </details>
    </>}
  </section>;
}
