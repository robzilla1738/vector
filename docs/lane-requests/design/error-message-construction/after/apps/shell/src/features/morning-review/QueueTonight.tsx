import { errorMessage } from "../../error-message";
import { DEFAULT_NIGHT_SHIFT } from "@aux/contracts";
import { useEffect, useState } from "react";
import type { Goal, Routine, Workspace } from "@aux/contracts";
import { call } from "../../store";
import { executeCommand } from "../../commands";
import { Dialog } from "../../ui/dialog";
import { useNightReview } from "./state";
export default function QueueTonight({ active = true }: { active?: boolean }) {
  const [spaces, setSpaces] = useState<Workspace[]>([]), [workspaceId, setWorkspaceId] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]), [skills, setSkills] = useState<Routine[]>([]);
  const [kind, setKind] = useState<"goal" | "routine" | "memory.consolidate" | "memory.reindex">("goal"), [id, setId] = useState("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const skill = skills.find(item => item.routineId === id);
  const missingVariables = kind === "routine" && skill?.parameters.some(item => !(parameters[item.name] ?? item.value ?? "").trim());
  const [budgetUsd, setBudget] = useState(DEFAULT_NIGHT_SHIFT.perTaskUsd), [error, setError] = useState(""), [pending, setPending] = useState(false);
  useEffect(() => { if (!active) return; let live = true; void call("workspaces.list", {}).then(items => { if (live) { setSpaces(items); setWorkspaceId(current => current || items[0]?.workspaceId || ""); } }).catch(reason => { if (live) setError(String(reason)); }); return () => { live = false; }; }, [active]);
  useEffect(() => {
    let live = true; if (!active || !workspaceId) return;
    void Promise.all([call("goals.list", { workspaceId }), call("routines.list", { workspaceId, includeArchived: false })])
      .then(([goals, skills]) => { if (live) { setGoals(goals.filter(goal => goal.status === "draft")); setSkills(skills.filter(skill => !skill.paused)); } })
      .catch(reason => { if (live) setError(String(reason)); }); return () => { live = false; };
  }, [workspaceId, active]);
  // Keep a visited form mounted when navigating elsewhere; unsubmitted edits
  // stay local to this window and are never queued by hiding the dialog.
  if (!active) return null;
  return <Dialog label="Queue for tonight" onClose={() => useNightReview.setState({ queueOpen: false })}>
    <h2>Queue for tonight</h2><p>Choose saved work and a spending limit. Aux will check the current task, tabs, permissions and power before starting.</p>
    <label>Space<select value={workspaceId} onChange={event => { setWorkspaceId(event.target.value); setId(""); setParameters({}); setGoals([]); setSkills([]); }}>{spaces.map(space => <option key={space.workspaceId} value={space.workspaceId}>{space.name}</option>)}</select></label>
    <label>Work<select value={kind} onChange={event => { setKind(event.target.value as typeof kind); setId(""); setParameters({}); }}><option value="goal">Goal</option><option value="routine">Skill</option><option value="memory.consolidate">Consolidate Space memory</option><option value="memory.reindex">Reindex Space memory</option></select></label>
    {kind === "goal" && <label>Goal<select value={id} onChange={event => setId(event.target.value)}><option value="">Choose a saved goal</option>{goals.map(goal => <option key={goal.goalId} value={goal.goalId}>{goal.objective.slice(0, 100)}</option>)}</select></label>}
    {kind === "routine" && <label>Skill<select value={id} onChange={event => { setId(event.target.value); setParameters({}); }}><option value="">Choose a ready Skill</option>{skills.map(skill => <option key={skill.routineId} value={skill.routineId}>{skill.title}</option>)}</select></label>}
    {kind === "routine" && skill?.parameters.map(parameter => <label key={parameter.name}>{parameter.name}<input aria-label={`Overnight value for ${parameter.name}`} value={parameters[parameter.name] ?? parameter.value ?? ""} onChange={event => setParameters(prior => ({ ...prior, [parameter.name]: event.target.value }))}/></label>)}
    <label>Task limit ($)<input type="number" min="0.01" step="0.01" value={budgetUsd} onChange={event => setBudget(event.target.valueAsNumber)}/></label>
    <button className="btn" disabled={pending || !!missingVariables || !workspaceId || (kind === "goal" || kind === "routine") && !id || !Number.isFinite(budgetUsd) || budgetUsd <= 0} onClick={async () => {
      if (pending) return;
      setPending(true); setError("");
      const skill = skills.find(skill => skill.routineId === id);
      const payload = kind === "goal" ? { kind, goalId: id } : kind === "routine" ? { kind, routineId: id, revision: skill!.revision, parameters } : { kind, workspaceId };
      try { await executeCommand("queue-for-tonight", { payload: { queue: { payload, budgetUsd } } }); }
      catch (reason) { setError(errorMessage(reason)); }
      finally { setPending(false); }
    }}>Queue for tonight</button>{error && <p role="alert">{error}</p>}
  </Dialog>;
}
