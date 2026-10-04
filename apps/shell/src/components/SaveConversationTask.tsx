import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Task, PageTarget } from "@aux/contracts";
import { call, useStore } from "../store";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";

export function SaveConversationTask({ chatId, runId, goal, workspaceId, page, onSaved }: {
  chatId: string; runId: string; goal: string; workspaceId?: string; page?: PageTarget; onSaved(task: Task): void;
}) {
  const spaces = useStore(useShallow(state => state.layout.spaces.filter(space => space.workspaceId).map(space => `${space.id}\u0001${space.workspaceId}\u0001${space.name}`)));
  const activeSpaceId = useStore(state => state.layout.activeSpaceId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(goal.slice(0, 200));
  const [objective, setObjective] = useState(goal);
  const [success, setSuccess] = useState("Complete the objective and explain the results and any remaining limitations.");
  const [space, setSpace] = useState(workspaceId ?? spaces.find(entry => entry.startsWith(`${activeSpaceId}\u0001`))?.split("\u0001")[1] ?? "");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  if (!open) return <button {...smallGhostButtonProps} onClick={() => setOpen(true)}>Save as task</button>;
  return <form className="save-conversation-task" onSubmit={event => {
    event.preventDefault(); if (pending.current) return; pending.current = true; setBusy(true); setError("");
    void call("tasks.promote", { chatId, expectedRunId: runId, workspaceId: space, title, objective,
      criteria: [{ criterionId: "outcome", description: success, verification: "manual" }],
      resources: page && /^https?:/.test(page.url) && page.url.length <= 4000 ? [{ resourceId: "source-page", kind: "url", locator: page.url, label: (page.title || page.url).slice(0,200) }] : [],
    }).then(onSaved).catch(reason => setError(errorMessage(reason))).finally(() => { pending.current = false; setBusy(false); });
  }}>
    <strong>Save as task</strong><p {...staticHintProps}>Keeps this conversation and its context together. Nothing runs until you start it.</p>
    <label>What should Aux accomplish?<textarea value={objective} maxLength={10000} required disabled={busy} onChange={event => setObjective(event.target.value)} /></label>
    <details className="task-save-details"><summary>Task details</summary>
    <label>Task name<input value={title} maxLength={200} required disabled={busy} onChange={event => setTitle(event.target.value)} /></label>
    <label>What does done look like?<textarea value={success} maxLength={1000} required disabled={busy} onChange={event => setSuccess(event.target.value)} /></label>
    <label>Space<select value={space} disabled={busy} required onChange={event => setSpace(event.target.value)}><option value="" disabled>Choose a Space</option>{spaces.map(entry => { const [id, workspaceId, name] = entry.split("\u0001"); return <option key={id} value={workspaceId}>{name}</option>; })}</select></label></details>
    {!space && <p {...staticHintProps}>Choose a Space in Task details to keep this work organized.</p>}
    {error && <p {...staticFieldErrorProps} role="alert">{error}</p>}
    <div {...staticRowProps}><button {...auxNativeButtonTypeProps} {...smallButtonProps} disabled={busy} onClick={() => setOpen(false)}>Cancel</button><button {...smallButtonProps} disabled={busy || !space || !title.trim() || !objective.trim() || !success.trim()}>{busy ? "Saving…" : "Save task"}</button></div>
  </form>;
}
