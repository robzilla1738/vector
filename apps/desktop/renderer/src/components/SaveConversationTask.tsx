import { useRef, useState } from "react";
import type { Task, PageTarget } from "@vector/contracts";
import { call, useStore } from "../store";

export function SaveConversationTask({ chatId, runId, goal, workspaceId, page, onSaved }: {
  chatId: string; runId: string; goal: string; workspaceId?: string; page?: PageTarget; onSaved(task: Task): void;
}) {
  const spaces = useStore(state => state.layout.spaces);
  const activeSpaceId = useStore(state => state.layout.activeSpaceId);
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(goal.slice(0, 200));
  const [objective, setObjective] = useState(goal);
  const [success, setSuccess] = useState("Complete the objective and explain the results and any remaining limitations.");
  const [space, setSpace] = useState(workspaceId ?? spaces.find(space => space.id === activeSpaceId)?.workspaceId ?? "");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  if (!open) return <button className="btn sm ghost" onClick={() => setOpen(true)}>Save as task</button>;
  return <form className="save-conversation-task" onSubmit={event => {
    event.preventDefault(); if (pending.current) return; pending.current = true; setBusy(true); setError("");
    void call<Task>("tasks.promote", { chatId, expectedRunId: runId, workspaceId: space, title, objective,
      criteria: [{ criterionId: "outcome", description: success, verification: "manual" }],
      resources: page && /^https?:/.test(page.url) && page.url.length <= 4000 ? [{ resourceId: "source-page", kind: "url", locator: page.url, label: (page.title || page.url).slice(0,200) }] : [],
    }).then(onSaved).catch(reason => setError(reason instanceof Error ? reason.message : String(reason))).finally(() => { pending.current = false; setBusy(false); });
  }}>
    <strong>Keep working on this as a task</strong><p className="hint">This conversation, its sources and selected context stay together. Saving does not start a run or grant new access.</p>
    <label>What should Aux accomplish?<textarea value={objective} maxLength={10000} required disabled={busy} onChange={event => setObjective(event.target.value)} /></label>
    <details className="task-save-details"><summary>Task details</summary>
    <label>Task name<input value={title} maxLength={200} required disabled={busy} onChange={event => setTitle(event.target.value)} /></label>
    <label>What does done look like?<textarea value={success} maxLength={1000} required disabled={busy} onChange={event => setSuccess(event.target.value)} /></label>
    <label>Space<select value={space} disabled={busy} required onChange={event => setSpace(event.target.value)}><option value="" disabled>Choose a Space</option>{spaces.filter(space => space.workspaceId).map(space => <option key={space.id} value={space.workspaceId}>{space.name}</option>)}</select></label></details>
    {!space && <p className="hint">Choose a Space in Task details to keep this work organized.</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="row"><button type="button" className="btn sm" disabled={busy} onClick={() => setOpen(false)}>Cancel</button><button className="btn sm" disabled={busy || !space || !title.trim() || !objective.trim() || !success.trim()}>{busy ? "Saving…" : "Save task"}</button></div>
  </form>;
}
