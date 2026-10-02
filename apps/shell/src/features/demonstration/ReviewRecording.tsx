import { useEffect, useState } from "react";
import type { Task } from "@aux/contracts";
import { call } from "../../store";
import { executeCommand } from "../../commands";
import { Dialog } from "../../ui/dialog";
import { useRecording } from "./state";
export default function ReviewRecording() {
  const { demonstration: demo, busy, error, exported } = useRecording();
  const [tasks, setTasks] = useState<Task[]>([]), [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState(""), [oracle, setOracle] = useState("");
  const [names, setNames] = useState<Record<number, string>>({}), [selectors, setSelectors] = useState<Record<number, string>>({});
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({}), [urls, setUrls] = useState<Record<number, string>>({});
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    void call("tasks.list", { includeArchived: false, limit: 500 }).then(items => {
      if (active) setTasks(items.filter(task => task.resources.some(resource => resource.kind === "page" && resource.locator === demo?.pageId)));
    }).catch(reason => { if (active) setLoadError(String(reason)); });
    return () => { active = false; };
  }, [demo?.id, demo?.pageId]);
  if (!demo || demo.state !== "stopped") return null;
  const task = tasks.find(task => task.taskId === taskId);
  const ready = !!task && !!title.trim() && /^#[A-Za-z][\w-]*$/.test(oracle)
    && demo.steps.every((step, index) => step.kind === "navigate" || confirmed[index] && !!selectors[index] && (step.kind !== "input" || /^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(names[index] ?? "")));
  return <Dialog label="Review demonstration" onClose={() => useRecording.setState({ review: false })}>
    <h2>Review your demonstration</h2>
    <p>Confirm each field’s variable and an unambiguous target. Review dates, personal identifiers and reused values independently. Passwords use the separate secure approval flow; payment and one-time codes need you at the browser.</p>
    <label>Skill name<input autoComplete="off" value={title} onChange={event => setTitle(event.target.value)}/></label>
    <label>Saved task<select value={taskId} onChange={event => setTaskId(event.target.value)}><option value="">Choose the task that includes this tab</option>{tasks.map(task => <option key={task.taskId} value={task.taskId}>{task.title}</option>)}</select></label>
    {!tasks.length && <p>Save a task with this tab as a reviewed resource, then reopen this review.</p>}
    <ol>{demo.steps.map((step, index) => <li key={index}>
      <strong>{step.kind === "input" ? `Type in ${step.label || "field"}` : step.kind === "credentialFill" ? "Secure entry — no value recorded" : step.kind}</strong>
      {step.kind === "navigate" ? <label>Reviewed URL template<input value={urls[index] ?? step.url} onChange={event => setUrls({ ...urls, [index]: event.target.value })}/></label> : <>
        <label>Target<select value={selectors[index] ?? ""} onChange={event => { setSelectors({ ...selectors, [index]: event.target.value }); setConfirmed({ ...confirmed, [index]: false }); }}>
          <option value="">Choose one exact target</option>{step.target.candidates.map(candidate => <option key={candidate.selector} value={candidate.selector} disabled={candidate.matches !== 1}>{candidate.selector} · {candidate.matches} matches</option>)}
        </select></label>
        {step.target.candidates.every(candidate => candidate.matches !== 1) && <p role="alert">All targets are ambiguous. Give this control a unique label or record a clearer target before saving.</p>}
        {step.kind === "input" && <><p>Recorded value: {step.value}</p><label>Variable name<input autoComplete="off" value={names[index] ?? ""} onChange={event => { setNames({ ...names, [index]: event.target.value }); setConfirmed({ ...confirmed, [index]: false }); }}/></label></>}
        <label><input type="checkbox" checked={!!confirmed[index]} onChange={event => setConfirmed({ ...confirmed, [index]: event.target.checked })}/>I reviewed this target{step.kind === "input" ? " and variable" : ""}</label>
      </>}
    </li>)}</ol>
    <label>Final success element<input autoComplete="off" placeholder="#success" value={oracle} onChange={event => setOracle(event.target.value)}/></label>
    <p>The Skill stays paused until a replay test passes with fresh values and you review activation.</p>
    <button className="btn" disabled={busy || !ready} onClick={() => {
      const review = { inputs: demo.steps.flatMap((step, index) => step.kind === "input" ? [{ step: index, parameter: names[index]!, confirmed: true as const }] : []),
        targets: demo.steps.flatMap((step, index) => step.kind !== "navigate" ? [{ step: index, selector: selectors[index]!, confirmed: true as const }] : []),
        navigationTemplates: demo.steps.flatMap((step, index) => step.kind === "navigate" ? [{ step: index, url: urls[index] ?? step.url }] : []),
        finalWait: { id: "recording-success", op: "waitFor" as const, condition: { kind: "selector" as const, selector: oracle, state: "visible" as const } } };
      void executeCommand("save-demonstration", { payload: { demonstration: { recordingId: demo.id, taskId, expectedTaskRevision: task!.revision, title, review } } });
    }}>Save as Skill</button>
    <button className="btn ghost" disabled={busy} onClick={() => void executeCommand("export-demonstration").catch(() => {})}>Export demonstration</button>
    <button className="btn ghost" disabled={busy} onClick={() => void executeCommand("discard-demonstration")}>Discard</button>
    {exported && <><output>Skill saved. Open the saved task to run its replay test.</output><label>SKILL.md<textarea readOnly value={exported} rows={8}/></label></>}
    {(error || loadError) && <p role="alert">{error || loadError}</p>}
  </Dialog>;
}
