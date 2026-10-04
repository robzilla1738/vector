import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Routine, RoutineInboxItem, RoutineRunOutcome, RoutineTrigger, Task, Workspace } from "@aux/contracts";
import { call, errToast, useStore } from "../../store";
import { bridge } from "../../bridge";
import { openSavedSkill } from "../../task-navigation";
import { RoutineSchedule, type CalendarTriggerAccounts } from "../../components/RoutineSchedule";
import { SettingsField, SettingsSection } from "../primitives";

const effectiveCap = (routine: Routine) => routine.spendCapUsd ?? 50;

function CreateAutomationDialog({ workspaceId, onClose, onCreated }: {
  workspaceId: string;
  onClose: () => void;
  onCreated: (routine: Routine) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [cap, setCap] = useState("50");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [calendar, setCalendar] = useState<CalendarTriggerAccounts>({ status: "loading", choices: [] });

  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  useEffect(() => {
    let live = true;
    void call("tasks.list", { workspaceId, limit: 500 }).then((items) => {
      if (!live) return;
      const open = items.filter((item) => item.state === "open");
      setTasks(open);
      setTaskId(open[0]?.taskId ?? "");
    }).catch((reason) => {
      if (live) setError(errorMessage(reason));
    });
    return () => { live = false; };
  }, [workspaceId]);

  useEffect(() => {
    const task = tasks.find((item) => item.taskId === taskId);
    if (!task) return;
    let live = true;
    setCalendar({ status: "loading", choices: [] });
    void Promise.all([
      call("calendar.connections.list", {}),
      call("calendar.taskGrants.list", { taskId: task.taskId }),
    ]).then(([connections, grants]) => {
      if (!live) return;
      const choices = grants.filter((grant) => grant.taskRevision === task.revision && !grant.revokedAt)
        .flatMap((grant) => {
          const account = connections.connections.find((item) =>
            item.connectionId === grant.connectionId && item.state === "active");
          return account ? [{ grantId: grant.grantId, connectionId: account.connectionId,
            label: account.label, accountKey: account.accountKey }] : [];
        });
      setCalendar({ status: "ready", choices,
        message: !connections.available ? connections.reason : !choices.length
          ? "Connect an account in Settings → Connections and grant it to this task revision first."
          : undefined });
    }).catch((reason) => {
      if (live) setCalendar({ status: "error", choices: [], message:
        /preview|feature_unavailable/.test(String(reason))
          ? "Calendar accounts are unavailable in this build. Connect and grant an account when Calendar support is enabled."
          : `Calendar accounts could not be loaded. ${String(reason)}` });
    });
    return () => { live = false; };
  }, [tasks, taskId]);

  async function create(trigger: RoutineTrigger) {
    const task = tasks.find((item) => item.taskId === taskId);
    const amount = Number(cap);
    if (!task) return setError("Choose a saved task in this Space.");
    if (!Number.isFinite(amount) || amount <= 0 || amount > 50)
      return setError("Enter a model spend cap above $0 and no more than $50.");
    if (trigger.kind === "manual") return setError("Choose a schedule or event trigger.");
    if (trigger.kind === "calendar_event" && !calendar.choices.some((item) => item.grantId === trigger.grantId))
      return setError("Choose a Calendar account granted to this task revision.");
    const origins = new Set(task.resources.flatMap((resource) => {
      if (resource.kind !== "url" && resource.kind !== "page") return [];
      try { return [new URL(resource.locator).origin]; } catch { return []; }
    }));
    if (trigger.kind === "site_notification") origins.add(trigger.origin);
    if (trigger.kind === "page_change") origins.add(new URL(trigger.url).origin);
    setBusy(true);
    setError("");
    try {
      const routine = await call("routines.create", {
        title: title.trim() || task.title,
        objective: task.objective,
        workspaceId,
        sourceTaskId: task.taskId,
        sourceTaskRevision: task.revision,
        siteOrigins: [...origins].slice(0, 20),
        ...(trigger.kind === "calendar_event" ? { calendarGrantIds: [trigger.grantId] } : {}),
        successCriteria: task.criteria,
        reviewRequired: true,
        spendCapUsd: amount,
        trigger,
        paused: true,
      });
      onCreated(routine);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <dialog ref={dialog} className="automation-create-dialog" aria-label="Create automation"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <h3>Create automation</h3>
      <p {...staticHintProps}>Start from a saved task. New automations stay paused until you review and resume them.</p>
      <label>Saved task
        <select aria-label="Automation source task" value={taskId} onChange={(event) => setTaskId(event.target.value)} disabled={busy}>
          {!taskId && <option value="">Choose a task</option>}
          {tasks.map((task) => <option key={task.taskId} value={task.taskId}>{task.title}</option>)}
        </select>
      </label>
      <label>Skill name
        <input aria-label="New automation name" value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} disabled={busy} placeholder="Use task title" />
      </label>
      <label>Model spend cap (USD)
        <input aria-label="New automation model spend cap" type="number" min="0.01" max="50" step="0.01" value={cap} onChange={(event) => setCap(event.target.value)} disabled={busy} />
      </label>
      <RoutineSchedule mode="create" trigger={{ kind: "schedule", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", hour: 9, minute: 0, days: [1, 2, 3, 4, 5] }} calendar={calendar} disabled={busy || !taskId} onSave={(trigger) => void create(trigger)} />
      {error && <p className="field-error" role="alert">{error}</p>}
      <button {...smallGhostButtonProps} type="button" onClick={onClose} disabled={busy}>Cancel</button>
    </dialog>, document.body,
  );
}

export function AutomationsSettings({ active }: { active: boolean }) {
  const savedScan = useStore((state) => state.settings.routineSuggestionScan);
  const scanMode = savedScan === "off" || savedScan === "five-minutes" ? savedScan : "context";
  const preferredWorkspaceId = useStore(
    (state) => state.layout.spaces.find((space) => space.id === state.layout.activeSpaceId)?.workspaceId,
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [inbox, setInbox] = useState<RoutineInboxItem[]>([]);
  const [outcome, setOutcome] = useState<RoutineRunOutcome | null>(null);
  const [outcomeBusy, setOutcomeBusy] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [scanBusy, setScanBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!active) return;
    let live = true;
    void call("workspaces.list", {})
      .then((items) => {
        if (!live) return;
        setWorkspaces(items);
        setWorkspaceId((current) =>
          items.some((item) => item.workspaceId === current)
            ? current
            : items.find((item) => item.workspaceId === preferredWorkspaceId)?.workspaceId ??
              items[0]?.workspaceId ?? "",
        );
        setError("");
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => { live = false; };
  }, [active, preferredWorkspaceId]);

  useEffect(() => {
    if (!active || !workspaceId) return;
    let live = true;
    setLoading(true);
    void Promise.all([
      call("routines.list", { workspaceId, includeArchived: true, limit: 200 }),
      call("routines.inbox", { workspaceId, limit: 30 }),
    ])
      .then(([items, results]) => {
        if (!live) return;
        setRoutines(items.filter((item) => item.trigger.kind !== "manual"));
        setInbox(results);
        setError("");
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [active, workspaceId]);

  useEffect(() => {
    if (!active || !workspaceId) return;
    let live = true;
    const off = bridge.onEvent((event) => {
      if (event.type !== "routine.updated") return;
      const routine = event.payload.routine as Routine | undefined;
      if (routine?.workspaceId === workspaceId && routine.trigger.kind !== "manual")
        setRoutines((items) => items.some((item) => item.routineId === routine.routineId)
          ? items.map((item) => item.routineId === routine.routineId ? routine : item)
          : [routine, ...items]);
      void call("routines.inbox", { workspaceId, limit: 30 })
        .then((items) => { if (live) setInbox(items); })
        .catch((reason) => { if (live) setError(errorMessage(reason)); });
    });
    return () => { live = false; off(); };
  }, [active, workspaceId]);

  async function changeRoutine(routine: Routine, patch: { spendCapUsd?: number; paused?: boolean; missedRunPolicy?: Routine["missedRunPolicy"]; presenceGuardExempt?: boolean }) {
    setBusyId(routine.routineId);
    setError("");
    try {
      const updated = await call("routines.update", {
        routineId: routine.routineId,
        expectedRevision: routine.revision,
        ...patch,
      });
      setRoutines((items) => items.map((item) => item.routineId === updated.routineId ? updated : item));
    } catch (reason) {
      setError(errorMessage(reason));
      // A revision conflict should show the latest state before another edit.
      try {
        const items = await call("routines.list", { workspaceId, includeArchived: true, limit: 200 });
        setRoutines(items.filter((item) => item.trigger.kind !== "manual"));
      } catch { /* Keep the original error visible. */ }
    } finally {
      setBusyId("");
    }
  }

  return (
    <SettingsSection name="Automations" hidden={!active}>
      <SettingsField
        label="Skill suggestions"
        hint="Suggest saved Skills from the current task or page. Scans stay on this device and never start a run."
        searchTerms={["suggestions", "scan frequency", "skills"]}
      >
        <select aria-label="Skill suggestion scan frequency" value={scanMode} disabled={scanBusy}
          onChange={(event) => {
            setScanBusy(true);
            setError("");
            void call("settings.set", { routineSuggestionScan: event.target.value as typeof scanMode })
              .catch((reason) => setError(errorMessage(reason)))
              .finally(() => setScanBusy(false));
          }}>
          <option value="off">Off</option>
          <option value="context">When context changes</option>
          <option value="five-minutes">Every 5 minutes</option>
        </select>
      </SettingsField>
      <SettingsField
        label="Scheduled Skills"
        hint="Scheduled Skills and Calendar checks run while Aux is open. Calendar checks poll granted accounts once a minute; no event titles are stored in automation runs."
        searchTerms={["monitor", "schedule", "calendar", "automation"]}
      >
        <button {...smallButtonProps} type="button" disabled={!workspaceId || !!busyId} onClick={() => setCreating(true)}>Create automation</button>
        <label>
          Space
          <select
            aria-label="Automation Space"
            value={workspaceId}
            onChange={(event) => { setWorkspaceId(event.target.value); setOutcome(null); }}
            disabled={!active || loading || !!busyId}
          >
            {!workspaceId && <option value="">No Spaces</option>}
            {workspaces.map((workspace) => (
              <option key={workspace.workspaceId} value={workspace.workspaceId}>{workspace.name}</option>
            ))}
          </select>
        </label>
        {loading && <output {...staticHintProps}>Loading automations…</output>}
        {!loading && !routines.length && <p {...staticHintProps}>No scheduled Skills in this Space.</p>}
        {routines.map((routine) => (
          <div className="field" key={routine.routineId}>
            <strong>{routine.title}</strong>
            <span {...staticHintProps}>
              {routine.trigger.kind.replaceAll("_", " ")} · {routine.archivedAt ? "Archived" : routine.paused ? "Paused" : "Ready"}
            </span>
            <span {...staticHintProps}>{routine.replay
              ? routine.replay.state === "tested" ? "Tested browser replay on its reviewed site" : "Replay requires a fresh test and review"
              : "Model-led Skill; model spend cap applies"}</span>
            <div {...staticRowProps}>
              <button
                {...smallGhostButtonProps}
                onClick={() => void openSavedSkill(routine).catch(errToast)}
              >
                Open Skill
              </button>
              {!routine.archivedAt && routine.activationReview && (
                <button {...smallButtonProps} onClick={() => void openSavedSkill(routine).catch(errToast)}>
                  Review Skill
                </button>
              )}
              {!routine.archivedAt && !routine.activationReview && routine.pauseCause !== "unread_results" && (
                <button
                  {...smallButtonProps}
                  disabled={!!busyId}
                  onClick={() => void changeRoutine(routine, { paused: !routine.paused })}
                >
                  {routine.paused ? "Resume" : "Pause"}
                </button>
              )}
            </div>
            {routine.pauseCause === "unread_results" && (
              <div className="field" role="status">
                <span>Paused after three unread results over at least a day while model work was recorded. Review the results before continuing; the model spend cap still applies.</span>
                <div {...staticRowProps}>
                  <button {...smallButtonProps} disabled={!!busyId} onClick={() => void changeRoutine(routine, { paused: false })}>Keep running</button>
                  <button {...smallGhostButtonProps} disabled={!!busyId} onClick={() => void changeRoutine(routine, { paused: true })}>Pause Skill</button>
                  <button {...smallGhostButtonProps} disabled={!!busyId} onClick={() => void changeRoutine(routine, { paused: false, presenceGuardExempt: true })}>Don’t ask again · keep running</button>
                </div>
              </div>
            )}
            {!routine.archivedAt && routine.presenceGuardExempt && (
              <button {...smallGhostButtonProps} disabled={!!busyId} onClick={() => void changeRoutine(routine, { presenceGuardExempt: false })}>Re-enable unread-results pause</button>
            )}
            {!routine.archivedAt && (
              <form
                key={`${routine.routineId}:${routine.revision}`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const input = event.currentTarget.elements.namedItem("spendCapUsd");
                  if (!(input instanceof HTMLInputElement)) return;
                  const amount = Number(input.value);
                  if (!Number.isFinite(amount) || amount <= 0 || amount > 50) {
                    setError("Enter a model spend cap above $0 and no more than $50.");
                    return;
                  }
                  void changeRoutine(routine, { spendCapUsd: amount });
                }}
              >
                <label>
                  Model spend cap (USD)
                  <input
                    name="spendCapUsd"
                    aria-label={`${routine.title} model spend cap`}
                    type="number"
                    min="0.01"
                    max="50"
                    step="0.01"
                    defaultValue={effectiveCap(routine)}
                    disabled={!!busyId}
                    required
                  />
                </label>
                <button {...smallButtonProps} type="submit" disabled={!!busyId}>Save cap</button>
              </form>
            )}
            {!routine.archivedAt && <span {...staticHintProps}>Checks recorded model spending before each new run and pauses at this cap. A running model call may go over it; tested browser replays do not call a model.</span>}
            {!routine.archivedAt && routine.trigger.kind === "schedule" && (
              <label>
                When Aux missed a scheduled time
                <select
                  aria-label={`${routine.title} missed run policy`}
                  value={routine.missedRunPolicy}
                  disabled={!!busyId}
                  onChange={(event) => void changeRoutine(routine, { missedRunPolicy: event.target.value as Routine["missedRunPolicy"] })}
                >
                  <option value="record_only">Record missed runs</option>
                  <option value="run_once_on_wake">Run once when Aux opens</option>
                </select>
                <span {...staticHintProps}>Earlier missed times stay in the results inbox. If a current scheduled time is due, it takes priority. Writes still wait for review.</span>
              </label>
            )}
          </div>
        ))}
      </SettingsField>
      <SettingsField
        label="Missed runs and results"
        hint="Missed read-only checks are combined into one run when Aux resumes. Writes wait for review; overlapping runs are blocked."
        searchTerms={["catch up", "coalesce", "inbox"]}
      >
        {!inbox.length && <p {...staticHintProps}>No automatic results in this Space yet.</p>}
        {inbox.map((item) => (
          <div className="field" key={item.run.routineRunId}>
            <strong>{item.title}</strong>
            <span {...staticHintProps}>
              {item.run.status.replaceAll("_", " ")} · {new Date(item.run.createdAt).toLocaleString()}
              {item.run.reason ? ` · ${item.run.reason}` : ""}
            </span>
            <button {...smallGhostButtonProps} type="button" onClick={() => void call("routines.get", { routineId: item.run.routineId })
              .then(({ routine }) => openSavedSkill(routine)).catch(errToast)}>Open Skill</button>
            {item.run.runId && <button {...smallGhostButtonProps} type="button"
              disabled={!!outcomeBusy}
              onClick={() => {
                setOutcomeBusy(item.run.routineRunId);
                setError("");
                void call("routines.outcome", { routineRunId: item.run.routineRunId })
                  .then(setOutcome)
                  .catch((reason) => setError(errorMessage(reason)))
                  .finally(() => setOutcomeBusy(""));
              }}>View result</button>}
            {outcome?.run.routineRunId === item.run.routineRunId && <div aria-live="polite" {...staticHintProps}>
              <div>Linked run: <code>{outcome.run.runId ?? "unavailable"}</code> · {outcome.linkedRunFound ? "Saved run available" : "Linked run unavailable"}</div>
              {outcome.criteria.map(entry => <div key={entry.criterion.criterionId}>
                {entry.criterion.description}: {entry.status.replaceAll("_", " ")} · {entry.evidence.length} evidence record{entry.evidence.length === 1 ? "" : "s"}
              </div>)}
            </div>}
          </div>
        ))}
      </SettingsField>
      {error && <p {...staticHintProps} role="alert">{error}</p>}
      {creating && workspaceId && <CreateAutomationDialog workspaceId={workspaceId} onClose={() => setCreating(false)} onCreated={(routine) => {
        setRoutines((items) => items.some((item) => item.routineId === routine.routineId)
          ? items.map((item) => item.routineId === routine.routineId ? routine : item)
          : [routine, ...items]);
        setCreating(false);
      }} />}
    </SettingsSection>
  );
}
