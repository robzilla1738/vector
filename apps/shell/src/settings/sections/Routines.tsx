import { staticFieldErrorProps, staticFieldProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "../../ui/dialog";
import type {
  Routine,
  RoutineInboxItem,
  RoutineRunOutcome,
  RoutineTrigger,
  Task,
  Workspace,
} from "@aux/contracts";
import { call, errToast, useStore } from "../../store";
import { bridge } from "../../bridge";
import { openSavedSkill } from "../../task-navigation";
import { RoutineSchedule, type CalendarTriggerAccounts } from "../../components/RoutineSchedule";
import { shellIconPlusSm, shellIconClose } from "../../ui/icons";
import "./Routines.css";
import {
  RoutinePreferencesFields,
  RoutinePreferencesEditor,
  type RoutinePreferences,
  type RoutinePreferencePatch,
} from "./RoutinePreferences";
import { SettingsField, SettingsSection } from "../primitives";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../../ui/native-attribute-props";
import {
  nativeNumberTypeProps,
  nativeAlertRoleProps,
  nativeStatusRoleProps,
  nativePoliteLiveProps,
} from "../../ui/native-attribute-props";

const effectiveCap = (routine: Routine) => routine.spendCapUsd ?? "";

function CreateRoutineDialog({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: (routine: Routine) => void;
}) {
  const titleInput = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [cap, setCap] = useState("");
  const [preferences, setPreferences] = useState<RoutinePreferences>({});
  const [prompt, setPrompt] = useState("");
  const [criterion, setCriterion] = useState("The result satisfies the routine’s prompt.");
  const preparedTask = useRef<{ fingerprint: string; task: Task } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [calendar, setCalendar] = useState<CalendarTriggerAccounts>({ status: "loading", choices: [] });

  useEffect(() => {
    let live = true;
    void call("tasks.list", { workspaceId, limit: 500 })
      .then((items) => {
        if (!live) return;
        const open = items.filter((item) => item.state === "open");
        setTasks(open);
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [workspaceId]);

  useEffect(() => {
    const task = tasks.find((item) => item.taskId === taskId);
    if (!task) {
      setCalendar({
        status: "ready",
        choices: [],
        message: "Choose a saved task with a Calendar grant in Advanced to use this trigger.",
      });
      return;
    }
    let live = true;
    setCalendar({ status: "loading", choices: [] });
    void Promise.all([
      call("calendar.connections.list", {}),
      call("calendar.taskGrants.list", { taskId: task.taskId }),
    ])
      .then(([connections, grants]) => {
        if (!live) return;
        const choices = grants
          .filter((grant) => grant.taskRevision === task.revision && !grant.revokedAt)
          .flatMap((grant) => {
            const account = connections.connections.find(
              (item) => item.connectionId === grant.connectionId && item.state === "active",
            );
            return account
              ? [
                  {
                    grantId: grant.grantId,
                    connectionId: account.connectionId,
                    label: account.label,
                    accountKey: account.accountKey,
                  },
                ]
              : [];
          });
        setCalendar({
          status: "ready",
          choices,
          message: !connections.available
            ? connections.reason
            : !choices.length
              ? "Connect an account in Settings → Connections and grant it to this task revision first."
              : undefined,
        });
      })
      .catch((reason) => {
        if (live)
          setCalendar({
            status: "error",
            choices: [],
            message: /preview|feature_unavailable/.test(String(reason))
              ? "Calendar accounts are unavailable in this build. Connect and grant an account when Calendar support is enabled."
              : `Calendar accounts could not be loaded. ${String(reason)}`,
          });
      });
    return () => {
      live = false;
    };
  }, [tasks, taskId]);

  async function create(trigger: RoutineTrigger) {
    const task = tasks.find((item) => item.taskId === taskId);
    const amount = cap.trim() ? Number(cap) : undefined;
    if (!task && (!title.trim() || !prompt.trim() || !criterion.trim()))
      return setError("Enter a title, prompt, and review criterion.");
    if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0))
      return setError("Enter a positive model spend cap, or leave it blank for no additional cap.");
    if (trigger.kind === "manual") return setError("Choose a schedule or event trigger.");
    if (
      trigger.kind === "calendar_event" &&
      !calendar.choices.some((item) => item.grantId === trigger.grantId)
    )
      return setError("Choose a Calendar account granted to this task revision.");
    setBusy(true);
    setError("");
    try {
      const fingerprint = JSON.stringify([workspaceId, title.trim(), prompt.trim(), criterion.trim()]);
      const source =
        task ??
        (preparedTask.current?.fingerprint === fingerprint
          ? preparedTask.current.task
          : await call("tasks.create", {
              workspaceId,
              title: title.trim(),
              objective: prompt.trim(),
              criteria: [
                { criterionId: "routine-output", description: criterion.trim(), verification: "manual" },
              ],
              resources: [],
            }));
      if (!task) preparedTask.current = { fingerprint, task: source };
      const origins = new Set(
        source.resources.flatMap((resource) => {
          if (resource.kind !== "url" && resource.kind !== "page") return [];
          try {
            return [new URL(resource.locator).origin];
          } catch {
            return [];
          }
        }),
      );
      if (trigger.kind === "site_notification") origins.add(trigger.origin);
      if (trigger.kind === "page_change") origins.add(new URL(trigger.url).origin);
      const routine = await call("routines.create", {
        title: title.trim() || source.title,
        objective: source.objective,
        workspaceId,
        sourceTaskId: source.taskId,
        sourceTaskRevision: source.revision,
        siteOrigins: [...origins].slice(0, 20),
        ...(trigger.kind === "calendar_event" ? { calendarGrantIds: [trigger.grantId] } : {}),
        successCriteria: source.criteria,
        spendCapUsd: amount,
        ...preferences,
        trigger,
        paused: true,
      });
      onCreated(routine);
    } catch (reason) {
      setError(
        `${preparedTask.current ? "The task was saved, but the routine was not created. Retry to use the same task. " : ""}${errorMessage(reason)}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      className="routine-create-dialog"
      label="Create routine"
      initialFocusRef={titleInput}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="routine-create-heading">
        <h3>Create routine</h3>
        <button type="button" aria-label="Close create routine" disabled={busy} onClick={onClose}>
          {shellIconClose}
        </button>
      </div>
      <p {...staticHintProps}>New routines start paused. Review and resume them when you’re ready.</p>
      <label>
        Title
        <input
          ref={titleInput}
          aria-label="New routine name"
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          disabled={busy}
          placeholder="Routine name"
        />
      </label>
      {!taskId && (
        <label>
          Prompt
          <textarea
            aria-label="Routine prompt"
            value={prompt}
            maxLength={10000}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={busy}
            placeholder="Tell Aux what to do when this routine runs."
          />
        </label>
      )}
      <RoutineSchedule
        mode="create"
        trigger={{
          kind: "schedule",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          hour: 9,
          minute: 0,
          days: [0, 1, 2, 3, 4, 5, 6],
        }}
        calendar={calendar}
        disabled={busy}
        submitDisabled={!taskId && (!title.trim() || !prompt.trim() || !criterion.trim())}
        onSave={(trigger) => void create(trigger)}
        preferences={
          <RoutinePreferencesFields
            value={preferences}
            disabled={busy}
            onChange={(patch) =>
              setPreferences((current) => ({
                ...current,
                ...patch,
                modelId: patch.modelId === null ? undefined : (patch.modelId ?? current.modelId),
                reasoning: patch.reasoning === null ? undefined : (patch.reasoning ?? current.reasoning),
              }))
            }
          />
        }
        actions={
          <button {...smallGhostButtonProps} {...auxNativeButtonTypeProps} onClick={onClose} disabled={busy}>
            Cancel
          </button>
        }
      >
        <>
          <label>
            Saved task (optional)
            <select
              aria-label="Routine source task"
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
              disabled={busy}
            >
              <option value="">Create from this prompt</option>
              {tasks.map((task) => (
                <option key={task.taskId} value={task.taskId}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          {!taskId && (
            <label>
              Review criterion
              <textarea
                aria-label="Routine review criterion"
                maxLength={1000}
                value={criterion}
                onChange={(event) => setCriterion(event.target.value)}
                disabled={busy}
              />
            </label>
          )}
          <label>
            Model spend cap (USD, optional)
            <input
              aria-label="New routine model spend cap"
              {...nativeNumberTypeProps}
              placeholder="No additional cap"
              min="0.01"

              step="0.01"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
              disabled={busy}
            />
          </label>
        </>
      </RoutineSchedule>
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
    </Dialog>
  );
}

export function RoutinesSettings({ active }: { active: boolean }) {
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
  const [loadedWorkspace, setLoadedWorkspace] = useState("");
  const currentScope = useRef({ active, workspaceId });
  currentScope.current = { active, workspaceId };
  const visibleRoutines = loadedWorkspace === workspaceId ? routines : [];
  const visibleInbox = loadedWorkspace === workspaceId ? inbox : [];

  useEffect(() => {
    if (!active) return;
    let live = true;
    void call("workspaces.list", {})
      .then((items) => {
        if (!live) return;
        setWorkspaces(items);
        setWorkspaceId(
          (current) =>
            items.find((item) => item.workspaceId === preferredWorkspaceId)?.workspaceId ??
            (items.some((item) => item.workspaceId === current) ? current : (items[0]?.workspaceId ?? "")),
        );
        setError("");
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
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
        setLoadedWorkspace(workspaceId);
        setRoutines(items);
        setInbox(results);
        setError("");
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [active, workspaceId]);

  useEffect(() => {
    if (!active || !workspaceId) return;
    let live = true;
    const off = bridge.onEvent((event) => {
      if (event.type !== "routine.updated") return;
      const routine = event.payload.routine as Routine | undefined;
      if (routine?.workspaceId === workspaceId)
        setRoutines((items) =>
          items.some((item) => item.routineId === routine.routineId)
            ? items.map((item) => (item.routineId === routine.routineId ? routine : item))
            : [routine, ...items],
        );
      void call("routines.inbox", { workspaceId, limit: 30 })
        .then((items) => {
          if (live) setInbox(items);
        })
        .catch((reason) => {
          if (live) setError(errorMessage(reason));
        });
    });
    return () => {
      live = false;
      off();
    };
  }, [active, workspaceId]);

  async function changeRoutine(
    routine: Routine,
    patch: RoutinePreferencePatch & {
      spendCapUsd?: number | null;
      paused?: boolean;
      missedRunPolicy?: Routine["missedRunPolicy"];
      presenceGuardExempt?: boolean;
    },
  ) {
    setBusyId(routine.routineId);
    setError("");
    try {
      const updated = await call("routines.update", {
        routineId: routine.routineId,
        expectedRevision: routine.revision,
        ...patch,
      });
      if (!currentScope.current.active || currentScope.current.workspaceId !== workspaceId) return;
      setRoutines((items) => items.map((item) => (item.routineId === updated.routineId ? updated : item)));
    } catch (reason) {
      if (!currentScope.current.active || currentScope.current.workspaceId !== workspaceId) return;
      setError(errorMessage(reason));
      // A revision conflict should show the latest state before another edit.
      try {
        const items = await call("routines.list", { workspaceId, includeArchived: true, limit: 200 });
        if (currentScope.current.active && currentScope.current.workspaceId === workspaceId)
          setRoutines(items);
      } catch {
        /* Keep the original error visible. */
      }
    } finally {
      setBusyId("");
    }
  }

  return (
    <SettingsSection name="Routines" hidden={!active} className="routines-settings">
      <SettingsField
        label="My routines"
        hint="Schedules and Calendar checks run while Aux is open. Review a routine before enabling it."
        searchTerms={["monitor", "schedule", "calendar", "automation"]}
      >
        <button
          className="routine-create-trigger"
          aria-label="Create routine"
          {...auxNativeButtonTypeProps}
          disabled={!workspaceId || !!busyId}
          onClick={() => setCreating(true)}
        >
          {shellIconPlusSm} Create
        </button>
        <label>
          Space
          <select
            aria-label="Routine Space"
            value={workspaceId}
            onChange={(event) => {
              setWorkspaceId(event.target.value);
              setOutcome(null);
              setError("");
              setCreating(false);
            }}
            disabled={!active || loading || !!busyId}
          >
            {!workspaceId && <option value="">No Spaces</option>}
            {workspaces.map((workspace) => (
              <option key={workspace.workspaceId} value={workspace.workspaceId}>
                {workspace.name}
              </option>
            ))}
          </select>
        </label>
        {loading && <output {...staticHintProps}>Loading routines…</output>}
        {!loading && loadedWorkspace === workspaceId && !visibleRoutines.length && (
          <p {...staticHintProps}>No routines in this Space.</p>
        )}
        {visibleRoutines.map((routine) => (
          <div className="field" key={routine.routineId}>
            <strong>{routine.title}</strong>
            <span {...staticHintProps}>
              {routine.trigger.kind.replaceAll("_", " ")} ·{" "}
              {routine.archivedAt ? "Archived" : routine.paused ? "Paused" : "Ready"}
            </span>
            <span {...staticHintProps}>
              {routine.replay
                ? routine.replay.state === "tested"
                  ? "Tested browser replay on its reviewed site"
                  : "Replay requires a fresh test and review"
                : "Model-led routine; model spend cap applies"}
            </span>
            <div {...staticRowProps}>
              <button {...smallGhostButtonProps} onClick={() => void openSavedSkill(routine).catch(errToast)}>
                Open routine
              </button>
              {!routine.archivedAt && routine.activationReview && (
                <button {...smallButtonProps} onClick={() => void openSavedSkill(routine).catch(errToast)}>
                  Review routine
                </button>
              )}
              {!routine.archivedAt &&
                !routine.activationReview &&
                routine.pauseCause !== "unread_results" && (
                  <button
                    {...smallButtonProps}
                    disabled={!!busyId}
                    onClick={() => void changeRoutine(routine, { paused: !routine.paused })}
                  >
                    {routine.paused ? "Resume" : "Pause"}
                  </button>
                )}
            </div>
            {!routine.archivedAt && !routine.replay && (
              <RoutinePreferencesEditor
                value={routine}
                disabled={!!busyId}
                onChange={(patch) => void changeRoutine(routine, patch)}
              />
            )}
            {routine.pauseCause === "unread_results" && (
              <div {...staticFieldProps} {...nativeStatusRoleProps}>
                <span>
                  Paused after three unread results over at least a day while model work was recorded. Review
                  the results before continuing; the model spend cap still applies.
                </span>
                <div {...staticRowProps}>
                  <button
                    {...smallButtonProps}
                    disabled={!!busyId}
                    onClick={() => void changeRoutine(routine, { paused: false })}
                  >
                    Keep running
                  </button>
                  <button
                    {...smallGhostButtonProps}
                    disabled={!!busyId}
                    onClick={() => void changeRoutine(routine, { paused: true })}
                  >
                    Pause routine
                  </button>
                  <button
                    {...smallGhostButtonProps}
                    disabled={!!busyId}
                    onClick={() => void changeRoutine(routine, { paused: false, presenceGuardExempt: true })}
                  >
                    Don’t ask again · keep running
                  </button>
                </div>
              </div>
            )}
            {!routine.archivedAt && routine.presenceGuardExempt && (
              <button
                {...smallGhostButtonProps}
                disabled={!!busyId}
                onClick={() => void changeRoutine(routine, { presenceGuardExempt: false })}
              >
                Re-enable unread-results pause
              </button>
            )}
            {!routine.archivedAt && (
              <form
                key={`${routine.routineId}:${routine.revision}`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const input = event.currentTarget.elements.namedItem("spendCapUsd");
                  if (!(input instanceof HTMLInputElement)) return;
                  const amount = input.value.trim() ? Number(input.value) : undefined;
                  if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) {
                    setError("Enter a positive model spend cap, or leave it blank for no additional cap.");
                    return;
                  }
                  void changeRoutine(routine, { spendCapUsd: amount ?? null });
                }}
              >
                <label>
                  Model spend cap (USD, optional)
                  <input
                    name="spendCapUsd"
                    aria-label={`${routine.title} model spend cap`}
                    {...nativeNumberTypeProps}
                    placeholder="No additional cap"
                    min="0.01"

                    step="0.01"
                    defaultValue={effectiveCap(routine)}
                    disabled={!!busyId}
                  />
                </label>
                <button {...smallButtonProps} type="submit" disabled={!!busyId}>
                  Save cap
                </button>
              </form>
            )}
            {!routine.archivedAt && (
              <span {...staticHintProps}>
                Checks recorded model spending before each new run and pauses at this cap. A running model
                call may go over it; tested browser replays do not call a model.
              </span>
            )}
            {!routine.archivedAt && routine.trigger.kind === "schedule" && (
              <label>
                When Aux missed a scheduled time
                <select
                  aria-label={`${routine.title} missed run policy`}
                  value={routine.missedRunPolicy}
                  disabled={!!busyId}
                  onChange={(event) =>
                    void changeRoutine(routine, {
                      missedRunPolicy: event.target.value as Routine["missedRunPolicy"],
                    })
                  }
                >
                  <option value="record_only">Record missed runs</option>
                  <option value="run_once_on_wake">Run once when Aux opens</option>
                </select>
                <span {...staticHintProps}>
                  Earlier missed times stay in the results inbox. If a current scheduled time is due, it takes
                  priority. Writes still wait for review.
                </span>
              </label>
            )}
          </div>
        ))}
      </SettingsField>
      <SettingsField
        compact
        label="Routine suggestions"
        hint="Suggest saved routines from the current task or page. Scans stay on this device and never start a run."
        searchTerms={["suggestions", "scan frequency", "skills"]}
      >
        <select
          aria-label="Routine suggestion scan frequency"
          value={scanMode}
          disabled={scanBusy}
          onChange={(event) => {
            setScanBusy(true);
            setError("");
            void call("settings.set", { routineSuggestionScan: event.target.value as typeof scanMode })
              .catch((reason) => setError(errorMessage(reason)))
              .finally(() => setScanBusy(false));
          }}
        >
          <option value="off">Off</option>
          <option value="context">When context changes</option>
          <option value="five-minutes">Every 5 minutes</option>
        </select>
      </SettingsField>
      <SettingsField
        label="Missed runs and results"
        hint="Missed read-only checks are combined into one run when Aux resumes. Writes wait for review; overlapping runs are blocked."
        searchTerms={["catch up", "coalesce", "inbox"]}
      >
        {!inbox.length && <p {...staticHintProps}>No automatic results in this Space yet.</p>}
        {visibleInbox.map((item) => (
          <div className="field" key={item.run.routineRunId}>
            <strong>{item.title}</strong>
            <span {...staticHintProps}>
              {item.run.status.replaceAll("_", " ")} · {new Date(item.run.createdAt).toLocaleString()}
              {item.run.reason ? ` · ${item.run.reason}` : ""}
            </span>
            <button
              {...smallGhostButtonProps}
              {...auxNativeButtonTypeProps}
              onClick={() =>
                void call("routines.get", { routineId: item.run.routineId })
                  .then(({ routine }) => openSavedSkill(routine))
                  .catch(errToast)
              }
            >
              Open routine
            </button>
            {item.run.runId && (
              <button
                {...smallGhostButtonProps}
                {...auxNativeButtonTypeProps}
                disabled={!!outcomeBusy}
                onClick={() => {
                  setOutcomeBusy(item.run.routineRunId);
                  setError("");
                  void call("routines.outcome", { routineRunId: item.run.routineRunId })
                    .then(setOutcome)
                    .catch((reason) => setError(errorMessage(reason)))
                    .finally(() => setOutcomeBusy(""));
                }}
              >
                View result
              </button>
            )}
            {outcome?.run.routineRunId === item.run.routineRunId && (
              <div {...nativePoliteLiveProps} {...staticHintProps}>
                <div>
                  Linked run: <code>{outcome.run.runId ?? "unavailable"}</code> ·{" "}
                  {outcome.linkedRunFound ? "Saved run available" : "Linked run unavailable"}
                </div>
                {outcome.criteria.map((entry) => (
                  <div key={entry.criterion.criterionId}>
                    {entry.criterion.description}: {entry.status.replaceAll("_", " ")} ·{" "}
                    {entry.evidence.length} evidence record{entry.evidence.length === 1 ? "" : "s"}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </SettingsField>
      {error && (
        <p {...staticHintProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
      {creating && workspaceId && (
        <CreateRoutineDialog
          key={workspaceId}
          workspaceId={workspaceId}
          onClose={() => setCreating(false)}
          onCreated={(routine) => {
            if (!currentScope.current.active || currentScope.current.workspaceId !== routine.workspaceId)
              return;
            setRoutines((items) =>
              items.some((item) => item.routineId === routine.routineId)
                ? items.map((item) => (item.routineId === routine.routineId ? routine : item))
                : [routine, ...items],
            );
            setCreating(false);
          }}
        />
      )}
    </SettingsSection>
  );
}
