import { staticFieldProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { WorkRow } from "../ui";
import { useEffect, useState } from "react";
import type {
  CalendarTaskGrant,
  Routine,
  RoutineAlert,
  RoutineCompare,
  RoutineInboxItem,
  RoutineParameter,
  RoutineRun,
  RoutineRunOutcome,
  RoutineSuggestion,
  Task,
  VaultItem,
} from "@aux/contracts";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { shellIconBack, shellIconClock, shellIconSearch } from "./icons";
import { RoutineSchedule, routineScheduleSummary, type CalendarTriggerAccounts } from "./RoutineSchedule";
import { SkillMetadata } from "./SkillMetadata";
import { SkillReplayPanel } from "./SkillReplayPanel";
import { staticGhostButtonProps as auxClassGhostButtonProps } from "../ui/class-props";
import { nativeAlertRoleProps, nativeGroupRoleProps, nativeStatusRoleProps, nativeCheckboxTypeProps } from "../ui/native-attribute-props";

export function Routines({ workspaceId, task }: { workspaceId: string; task?: Task }) {
  const currentPageUrl = useStore(
    (state) => state.pages.find((page) => page.pageId === state.activePageId)?.url,
  );
  const currentPageId = useStore(state => state.activePageId);
  const savedScan = useStore((state) => state.settings.routineSuggestionScan);
  const scanMode = savedScan === "off" || savedScan === "five-minutes" ? savedScan : "context";
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [alerts, setAlerts] = useState<RoutineAlert[]>([]);
  const [suggestions, setSuggestions] = useState<RoutineSuggestion[]>([]);
  const [inbox, setInbox] = useState<RoutineInboxItem[]>([]);
  const [comparison, setComparison] = useState<RoutineCompare | null>(null);
  const [selected, setSelected] = useState<{ routine: Routine; runs: RoutineRun[] } | null>(null);
  const [calendarAccounts, setCalendarAccounts] = useState<CalendarTriggerAccounts>({
    status: "loading",
    choices: [],
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"all" | "ready" | "paused" | "archived">("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [activationReview, setActivationReview] = useState("");
  const [activationSource, setActivationSource] = useState<{ routineId: string; task: Task } | null>(null);
  const [activationSourceError, setActivationSourceError] = useState("");
  const [loading, setLoading] = useState(true);
  async function refresh(routineId?: string) {
    const [items, nextAlerts, nextInbox] = await Promise.all([
      call("routines.list", { workspaceId, includeArchived: true }),
      call("routines.alerts", { limit: 20 }),
      call("routines.inbox", { workspaceId, limit: 30 }),
    ]);
    setRoutines(items);
    setAlerts(nextAlerts);
    setInbox(nextInbox);
    if (routineId) setSelected(await call("routines.get", { routineId }));
  }
  useEffect(() => {
    let active = true;
    const target = useStore.getState().skillSelection;
    setLoading(true);
    setSelected(null);
    setComparison(null);
    setError("");
    void Promise.all([
      call("routines.list", { workspaceId, includeArchived: true }),
      call("routines.alerts", { limit: 20 }),
      call("routines.inbox", { workspaceId, limit: 30 }),
      target?.workspaceId === workspaceId
        ? call("routines.get", { routineId: target.routineId }).catch((reason) => {
            if (active) setError(errorMessage(reason));
            return null;
          })
        : Promise.resolve(null),
    ])
      .then(([items, nextAlerts, nextInbox, detail]) => {
        if (active) {
          setRoutines(items);
          setAlerts(nextAlerts);
          setInbox(nextInbox);
          if (detail?.routine.workspaceId === workspaceId) setSelected(detail);
          if (
            target?.workspaceId === workspaceId &&
            useStore.getState().skillSelection?.routineId === target.routineId
          )
            useStore.setState({ skillSelection: null });
        }
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);
  useEffect(() => {
    const off = bridge.onEvent((event) => {
      if (event.type !== "routine.updated") return;
      const routine = event.payload.routine as Routine | undefined;
      if (routine?.workspaceId !== workspaceId) return;
      setRoutines((items) => items.some((item) => item.routineId === routine.routineId)
        ? items.map((item) => item.routineId === routine.routineId &&
          routine.revision >= item.revision ? routine : item)
        : [routine, ...items]);
      setSelected((current) => current?.routine.routineId === routine.routineId &&
        routine.revision >= current.routine.revision ? { ...current, routine } : current);
    });
    return off;
  }, [workspaceId]);
  useEffect(() => {
    const routine = selected?.routine;
    if (!routine) return;
    setActivationSource(null);
    setActivationSourceError("");
    if (!routine.activationReview || !routine.sourceTaskId) return;
    let active = true;
    void call("tasks.get", { taskId: routine.sourceTaskId })
      .then(({ task }) => {
        if (active) setActivationSource({ routineId: routine.routineId, task });
      })
      .catch((reason) => {
        if (active) setActivationSourceError(errorMessage(reason));
      });
    return () => { active = false; };
  }, [selected?.routine.routineId, selected?.routine.revision, selected?.routine.sourceTaskId,
    selected?.routine.activationReview]);
  useEffect(() => {
    const routine = selected?.routine;
    if (!routine) return;
    const scopeKey = `${routine.routineId}:${routine.revision}`;
    if (!routine.sourceTaskId || !routine.sourceTaskRevision) return;
    let active = true;
    void Promise.all([
      call("calendar.connections.list", {}),
      call("calendar.taskGrants.list", { taskId: routine.sourceTaskId }),
    ])
      .then(([connections, grants]) => {
        if (!active) return;
        const allowed = grants.filter(
          (grant) =>
            grant.taskRevision === routine.sourceTaskRevision &&
            !grant.revokedAt &&
            routine.calendarGrantIds.includes(grant.grantId),
        );
        const choices = allowed.flatMap((grant) => {
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
        let message: string | undefined;
        if (!connections.available)
          message = connections.reason ?? "Calendar is unavailable in this profile.";
        else if (!connections.connections.length)
          message =
            "No Calendar account is connected. Connect one in Settings → Connections, then grant it to this task and Skill.";
        else if (!allowed.length)
          message = "Grant a Calendar account to this task revision and allow it for this Skill below.";
        else if (!choices.length)
          message = "Reconnect the Calendar account allowed for this Skill in Settings → Connections.";
        setCalendarAccounts({ status: "ready", choices, message, scopeKey });
      })
      .catch((reason) => {
        if (active)
          setCalendarAccounts({
            status: "error",
            choices: [],
            scopeKey,
            message: `Calendar accounts could not be loaded. ${errorMessage(reason)}`,
          });
      });
    return () => {
      active = false;
    };
  }, [selected]);
  useEffect(() => {
    let active = true;
    setSuggestions([]);
    if (scanMode === "off" || !workspaceId || (!task?.objective && !currentPageUrl)) return;
    let pending = false;
    const scan = () => {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      void call("routines.suggest", {
        workspaceId,
        ...(task?.objective ? { text: task.objective.slice(0, 4000) } : {}),
        ...(currentPageUrl && currentPageUrl.length <= 2048 ? { pageUrl: currentPageUrl } : {}),
      }).then((items) => { if (active) setSuggestions(items); })
        .catch(() => { if (active) setSuggestions([]); })
        .finally(() => { pending = false; });
    };
    scan();
    const timer = scanMode === "five-minutes" ? window.setInterval(scan, 5 * 60_000) : undefined;
    document.addEventListener("visibilitychange", scan);
    return () => {
      active = false;
      if (timer !== undefined) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", scan);
    };
  }, [workspaceId, task?.objective, currentPageUrl, selected?.routine.revision, scanMode]);
  async function action(work: () => Promise<void>) {
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        if (document.activeElement === document.body && focused?.isConnected) focused.focus();
      });
    }
  }
  let currentOrigin = "";
  try {
    const page = new URL(currentPageUrl ?? "");
    if (page.protocol === "https:" || page.protocol === "http:") currentOrigin = page.origin;
  } catch {
    /* An internal page has no site origin. */
  }
  const matchesCurrentSite = (item: Routine) =>
    !!currentOrigin && !!item.sourceTaskId && !item.archivedAt && item.siteOrigins.includes(currentOrigin);
  const visibleRoutines = routines
    .filter(
      (item) =>
        (status === "all" ||
          (status === "archived"
            ? !!item.archivedAt
            : !item.archivedAt && (status === "paused" ? item.paused : !item.paused))) &&
        `${item.title} ${item.objective} ${item.outputHint ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (left, right) =>
        Number(matchesCurrentSite(right)) - Number(matchesCurrentSite(left)) ||
        right.updatedAt - left.updatedAt,
    );
  const selectedCalendar: CalendarTriggerAccounts =
    !selected?.routine.sourceTaskId || !selected.routine.sourceTaskRevision
      ? {
          status: "ready",
          choices: [],
          message: "Bind this Skill to a saved task before choosing a Calendar account.",
        }
      : calendarAccounts.scopeKey === `${selected.routine.routineId}:${selected.routine.revision}`
        ? calendarAccounts
        : { status: "loading", choices: [] };
  const reviewRoutine = selected?.routine;
  const reviewTask = activationSource && reviewRoutine &&
    activationSource.routineId === reviewRoutine.routineId &&
    activationSource.task.taskId === reviewRoutine.sourceTaskId ? activationSource.task : null;
  const criteriaMatch = !!reviewRoutine && !!reviewTask &&
    reviewRoutine.successCriteria.length === reviewTask.criteria.length &&
    reviewRoutine.successCriteria.every((criterion, index) => {
      const taskCriterion = reviewTask.criteria[index];
      return taskCriterion?.criterionId === criterion.criterionId &&
        taskCriterion.description === criterion.description &&
        taskCriterion.verification === criterion.verification;
    });
  const activationBlock = !reviewRoutine?.sourceTaskId ? "Bind a saved task below." :
    activationSourceError ? `Source task could not be loaded. ${activationSourceError}` :
    !reviewTask ? "Checking the source task…" :
    reviewTask.state !== "open" ? "Restore the source task before activation." :
    reviewTask.revision !== reviewRoutine.sourceTaskRevision ?
      "The source task changed. Sync this Skill in Skill definition and outcome below." :
    !criteriaMatch ? "Use the source task criteria in Skill definition and outcome below, then save." :
    (reviewRoutine.activationReview === "imported" || reviewRoutine.activationReview === "run_result") &&
      (reviewRoutine.replay?.state !== "tested" || reviewRoutine.replay.testedRevision !== reviewRoutine.revision)
      ? "Prepare and pass the current replay test below before activation." : "";
  return (
    <section className="routines-section" aria-label="Skills" aria-busy={loading || busy}>
      <div className="routines-heading">
        <div>
          <h4>Skills</h4>
          <p {...staticHintProps}>Saved work you can revise, rerun, or schedule.</p>
        </div>
        <div {...staticRowProps}>
          {task && (
            <button
              {...smallButtonProps}
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  const routine = await call("routines.fromResult", {
                    taskId: task.taskId,
                    title: title || task.title,
                    parameters: [],
                  });
                  setTitle("");
                  await refresh(routine.routineId);
                })
              }
            >
              Save task as Skill
            </button>
          )}
          <button
            {...smallGhostButtonProps}
            disabled={busy}
            onClick={() =>
              void action(async () => {
                const ids = routines.filter((item) => !item.archivedAt).map((item) => item.routineId);
                if (!ids.length) {
                  setNotice("No active Skills to export.");
                  return;
                }
                const envelope = await call("routines.export", { routineIds: ids });
                const path = await bridge.saveFile("aux-routines.json", JSON.stringify(envelope, null, 2));
                if (path) setNotice(`Exported ${ids.length} Skill${ids.length === 1 ? "" : "s"}.`);
              })
            }
          >
            Export…
          </button>
          <button
            {...smallGhostButtonProps}
            disabled={busy}
            onClick={() =>
              void action(async () => {
                const path = await bridge.openFile();
                if (!path) return;
                const result = await call("routines.import", { path, workspaceId });
                setNotice(
                  `Imported ${result.imported} inactive Skill${result.imported === 1 ? "" : "s"}${result.skipped ? ` · ${result.skipped} duplicates skipped` : ""}. Bind each one to a saved task before use.`,
                );
                await refresh();
              })
            }
          >
            Import…
          </button>
          <button
            {...smallGhostButtonProps}
            disabled={busy}
            onClick={() =>
              void action(async () => {
                const path = await bridge.openFile();
                if (!path) return;
                const result = await call("routines.importSkill", { path, workspaceId });
                setNotice(
                  `Imported ${result.imported} inactive Skill${result.imported === 1 ? "" : "s"}${result.skipped ? ` · ${result.skipped} duplicate skipped` : ""}. Review and bind it to a saved task before use.`,
                );
                await refresh();
              })
            }
          >
            Import SKILL.md…
          </button>
        </div>
      </div>
      <details className="routine-safety">
        <summary>How Skills run safely</summary>
        <p {...staticHintProps}>
          Scheduled writes wait for review. Monitors coalesce missed reads. Overlapping runs are blocked until
          you reconcile an uncertain write.
        </p>
      </details>
      <section {...staticFieldProps} aria-label="Automation results inbox">
        <strong>Automation results</strong>
        <span {...staticHintProps}>
          {inbox.filter((item) => !item.readAt).length} unread · Runs are recorded only while Aux is open.
        </span>
        {inbox.length === 0 && <span {...staticHintProps}>No automatic runs yet.</span>}
        {inbox.map((item) => (
          <div className="routine-run hint" key={item.run.routineRunId}>
            <strong>{item.title}</strong> · {item.run.status.replaceAll("_", " ")} ·{" "}
            {item.triggerKind.replaceAll("_", " ")} · {new Date(item.run.createdAt).toLocaleString()}
            {item.run.reason ? ` · ${item.run.reason}` : ""}
            <div {...staticRowProps}>
              <button
                {...smallGhostButtonProps}
                disabled={busy}
                onClick={() => void action(() => refresh(item.run.routineId))}
              >
                Open Skill
              </button>
              {!item.readAt && (
                <button
                  {...smallGhostButtonProps}
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      await call("routines.inboxRead", { routineRunId: item.run.routineRunId });
                      await refresh();
                    })
                  }
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
      {alerts.length > 0 && (
        <section {...staticFieldProps} aria-label="Routine alerts">
          <strong>Alerts</strong>
          <span {...staticHintProps}>Local run records only. They do not prove a business outcome.</span>
          {alerts.map((alert) => (
            <div className="hint" key={alert.routineRunId}>
              {alert.title} · {alert.status.replaceAll("_", " ")} · {alert.triggerKind}
              {alert.reason ? ` · ${alert.reason}` : ""} · {new Date(alert.createdAt).toLocaleString()}
            </div>
          ))}
        </section>
      )}
      {task && (
        <div {...staticRowProps}>
          <input
            aria-label="Skill name"
            placeholder="Skill name"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
      )}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
      {notice && (
        <output {...staticHintProps} data-block>
          {notice}
        </output>
      )}
      {!selected && (
        <>
          {suggestions.length > 0 && (
            <section {...staticFieldProps} aria-label="Suggested Skills">
              <strong>Suggested for this context</strong>
              <p {...staticHintProps}>
                Suggestions never start a Skill. Open one to review its scope and run it yourself.
              </p>
              <div {...staticRowProps}>
                {suggestions.map((item) => (
                  <button
                    className="btn sm ghost"
                    key={item.routineId}
                    disabled={busy}
                    onClick={() => void action(() => refresh(item.routineId))}
                  >
                    {item.title} · {item.reasons.join(" and ")}
                  </button>
                ))}
              </div>
            </section>
          )}
          <label className="routine-search">
            {shellIconSearch}
            <input
              aria-label="Search Skills"
              placeholder="Search Skills…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="work-list-heading">
            <div className="history-segment" {...nativeGroupRoleProps} aria-label="Skill status">
              {(["all", "ready", "paused", "archived"] as const).map((filter) => (
                <button
                  key={filter}
                  className={status === filter ? "active" : ""}
                  aria-pressed={status === filter}
                  onClick={() => setStatus(filter)}
                >
                  {filter[0]!.toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <output {...staticHintProps}>
              {visibleRoutines.length} {visibleRoutines.length === 1 ? "Skill" : "Skills"}
            </output>
          </div>
          {loading ? (
            <output {...staticHintProps} data-block>
              Loading Skills…
            </output>
          ) : (
            <div className="ui-work-list">
              {visibleRoutines.map((item) => (
                <WorkRow
                  key={item.routineId}
                  title={item.title}
                  summary={item.objective}
                  icon={shellIconClock}
                  status={
                    item.archivedAt
                      ? "Archived"
                      : item.paused
                        ? "Paused"
                        : !item.sourceTaskId
                          ? "Unbound"
                          : "Ready"
                  }
                  metadata={`${routineScheduleSummary(item.trigger)}${matchesCurrentSite(item) ? " · Saved for this site" : ""} · Updated ${new Date(item.updatedAt).toLocaleDateString()}`}
                  disabled={busy}
                  onOpen={() => void action(() => refresh(item.routineId))}
                  actions={[
                    { label: "Edit Skill", onSelect: () => void action(() => refresh(item.routineId)) },
                    {
                      label: item.activationReview ? "Review Skill" : item.paused ? "Resume" : "Pause",
                      disabled: !!item.archivedAt || (item.paused && !item.sourceTaskId),
                      onSelect: () =>
                        void action(async () => {
                          if (item.activationReview) return refresh(item.routineId);
                          await call("routines.pause", {
                            routineId: item.routineId,
                            expectedRevision: item.revision,
                            paused: !item.paused,
                          });
                          await refresh();
                        }),
                    },
                  ]}
                />
              ))}
              {!error && !visibleRoutines.length && (
                <div className="routine-empty">
                  {shellIconClock}
                  <strong>
                    {query || status !== "all" ? "No matching Skills" : "Make room for repeatable work"}
                  </strong>
                  <p>
                    {query || status !== "all"
                      ? "Try another title or status."
                      : "Open a saved task to turn it into a Skill."}
                  </p>
                  {(query || status !== "all") && (
                    <button
                      {...auxClassGhostButtonProps}
                      onClick={() => {
                        setQuery("");
                        setStatus("all");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
      {selected && (
        <div className="routine-detail">
          <button
            {...auxClassGhostButtonProps}
            disabled={busy}
            onClick={() => {
              setSelected(null);
              setComparison(null);
            }}
          >
            {shellIconBack}All Skills
          </button>
          <h3>{selected.routine.title}</h3>
          <span {...staticHintProps}>Revision {selected.routine.revision}</span>
          <p {...staticHintProps}>{selected.routine.objective}</p>
          <div className="routine-overview">
            <div>
              <span className="routine-overview-label">Status</span>
              <span className="routine-overview-value">
                {selected.routine.archivedAt ? "Archived" : selected.routine.paused ? "Paused" : "Ready"}
              </span>
            </div>
            <div>
              <span className="routine-overview-label">Trigger</span>
              <span className="routine-overview-value">{selected.routine.trigger.kind}</span>
            </div>
            <div>
              <span className="routine-overview-label">Runs</span>
              <span className="routine-overview-value">{selected.runs.length}</span>
            </div>
          </div>
          {selected.routine.activationReview && (
            <div {...staticFieldProps} {...nativeStatusRoleProps}>
              <strong>Review before activation</strong>
              <span {...staticHintProps}>
                {selected.routine.activationReview === "imported" ? "Imported Skill" :
                  selected.routine.activationReview === "untrusted_task" ? "Skill based on an external or saved-conversation task" :
                    "Skill saved from a run result"}
                {" "}may contain page or tool instructions. Check the objective, source task, trigger, resources,
                and model spend cap. It stays paused until you activate this exact revision.
              </span>
              {activationBlock && <span {...staticHintProps}>{activationBlock}</span>}
              {activationReview === `${selected.routine.routineId}:${selected.routine.revision}` ? (
                <div {...staticRowProps}>
                  <button {...smallButtonProps} disabled={busy || !!activationBlock}
                    onClick={() => void action(async () => {
                      const reviewed = selected.routine;
                      await call("routines.update", { routineId: reviewed.routineId,
                        expectedRevision: reviewed.revision, paused: false, activationReviewed: true });
                      setActivationReview("");
                      await refresh(reviewed.routineId);
                    })}>Activate reviewed Skill</button>
                  <button {...smallGhostButtonProps} onClick={() => setActivationReview("")}>Cancel</button>
                </div>
              ) : (
                <button {...smallButtonProps} disabled={busy || !!activationBlock}
                  onClick={() => setActivationReview(`${selected.routine.routineId}:${selected.routine.revision}`)}>
                  Review activation
                </button>
              )}
            </div>
          )}
          <span {...staticHintProps}>
            {selected.routine.reviewRequired
              ? "Review required before writes."
              : "May run without extra review."}{" "}
            {(selected.routine.trigger.kind === "schedule" || selected.routine.trigger.kind === "monitor") &&
              `Timezone ${selected.routine.trigger.timezone}. `}
          </span>{" "}
          {!selected.routine.sourceTaskId && (
            <p {...staticHintProps}>
              This imported definition is inactive. Binding it to a saved task gives it that task's current
              page and grants. Review the task and Accounts below before resuming.
            </p>
          )}
          <RoutineSourceTask
            key={`${selected.routine.routineId}-source:${selected.routine.revision}`}
            routine={selected.routine}
            disabled={busy || !!selected.routine.archivedAt}
            onSave={(sourceTaskId) =>
              void action(async () => {
                await call("routines.update", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  sourceTaskId,
                });
                await refresh(selected.routine.routineId);
              })
            }
          />
          <RoutineDefinitionEditor
            key={`${selected.routine.routineId}-definition:${selected.routine.revision}`}
            routine={selected.routine}
            disabled={busy || !!selected.routine.archivedAt}
            onSave={(definition) =>
              void action(async () => {
                await call("routines.update", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  ...definition,
                });
                await refresh(selected.routine.routineId);
              })
            }
          />
          <SkillReplayPanel key={`${selected.routine.routineId}-replay:${selected.routine.revision}`}
            routine={selected.routine} pageId={currentPageId} disabled={busy || !!selected.routine.archivedAt}
            onChanged={() => refresh(selected.routine.routineId)}/>
          <RoutineRunControls
            key={`${selected.routine.routineId}-run:${selected.routine.revision}`}
            routine={selected.routine}
            disabled={
              busy ||
              selected.routine.paused ||
              !!selected.routine.archivedAt ||
              !selected.routine.sourceTaskId
            }
            onRun={(parameters) =>
              void action(async () => {
                const run = await call("routines.run", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  parameters,
                });
                await refresh(selected.routine.routineId);
                if (run.reason) setError(run.reason);
              })
            }
          />
          <div {...staticRowProps}>
            <button
              {...smallButtonProps}
              disabled={busy || !!selected.routine.activationReview || (selected.routine.paused && !selected.routine.sourceTaskId)}
              onClick={() =>
                void action(async () => {
                  await call("routines.pause", {
                    routineId: selected.routine.routineId,
                    expectedRevision: selected.routine.revision,
                    paused: !selected.routine.paused,
                  });
                  await refresh(selected.routine.routineId);
                })
              }
            >
              {selected.routine.activationReview ? "Review above to activate" : selected.routine.paused ? "Resume" : "Pause"}
            </button>
            <button
              {...smallGhostButtonProps}
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  const document = await call("routines.exportSkill", {
                    routineId: selected.routine.routineId,
                  });
                  const path = await bridge.saveFile(document.filename, document.content);
                  if (path) setNotice(`Saved ${document.filename}.`);
                })
              }
            >
              Save as SKILL.md…
            </button>
            {selected.runs.length >= 2 && (
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    setComparison(
                      await call("routines.compare", {
                        leftRunId: selected.runs[1]!.routineRunId,
                        rightRunId: selected.runs[0]!.routineRunId,
                      }),
                    );
                  })
                }
              >
                Compare latest two runs
              </button>
            )}
          </div>
          <SkillMetadata
            key={`${selected.routine.routineId}-metadata:${selected.routine.revision}`}
            routine={selected.routine}
            disabled={busy || !!selected.routine.archivedAt}
            onSave={(metadata) =>
              void action(async () => {
                await call("routines.update", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  ...metadata,
                });
                await refresh(selected.routine.routineId);
              })
            }
          />
          <RoutineSchedule
            key={`${selected.routine.routineId}:${selected.routine.revision}`}
            trigger={selected.routine.trigger}
            disabled={busy || !!selected.routine.archivedAt}
            calendar={selectedCalendar}
            onSave={(trigger) =>
              void action(async () => {
                await call("routines.update", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  trigger,
                });
                await refresh(selected.routine.routineId);
              })
            }
          />
          <RoutineAccounts
            key={`${selected.routine.routineId}-accounts:${selected.routine.revision}`}
            routine={selected.routine}
            disabled={busy || !!selected.routine.archivedAt}
            onSave={(accountLabels) =>
              void action(async () => {
                await call("routines.update", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  accountLabels,
                });
                await refresh(selected.routine.routineId);
              })
            }
          />
          <RoutineCalendarGrants
            key={`${selected.routine.routineId}-calendar:${selected.routine.revision}`}
            routine={selected.routine}
            disabled={busy || !!selected.routine.archivedAt}
            onSave={(calendarGrantIds) =>
              void action(async () => {
                await call("routines.update", {
                  routineId: selected.routine.routineId,
                  expectedRevision: selected.routine.revision,
                  calendarGrantIds,
                });
                await refresh(selected.routine.routineId);
              })
            }
          />
          {comparison && comparison.routineId === selected.routine.routineId && (
            <output {...staticHintProps} data-block>
              {comparison.summary}
            </output>
          )}
          <h4>Run history</h4>
          {!selected.runs.length && <p {...staticHintProps}>This Skill has not run yet.</p>}
          {selected.runs.map((run) => (
            <div className="routine-run hint" key={run.routineRunId}>
              {run.status.replaceAll("_", " ")}
              {run.reason ? ` · ${run.reason}` : ""} · {new Date(run.createdAt).toLocaleString()}
              <RoutineOutcome run={run} />
              {(run.status === "needs_review" || run.status === "uncertain") && (
                <RoutineRunReview
                  run={run}
                  busy={busy}
                  onResolve={(outcome, note) =>
                    void action(async () => {
                      await call("routines.reconcile", { routineRunId: run.routineRunId, outcome, note });
                      await refresh(selected.routine.routineId);
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RoutineOutcome({ run }: { run: RoutineRun }) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<RoutineRunOutcome | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    setOutcome(null);
    try {
      setOutcome(await call("routines.outcome", { routineRunId: run.routineRunId }));
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div {...staticFieldProps}>
      <button
        {...smallGhostButtonProps}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) void load();
        }}
      >
        {open ? "Hide outcome evidence" : "Inspect outcome evidence"}
      </button>
      {open && (
        <div aria-busy={loading}>
          {loading && (
            <output {...staticHintProps} data-block>
              Loading outcome evidence…
            </output>
          )}
          {error && (
            <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
              {error}{" "}
              <button {...smallGhostButtonProps} onClick={() => void load()}>
                Retry
              </button>
            </p>
          )}
          {outcome && (
            <>
              <p {...staticHintProps}>
                Skill revision {outcome.run.revision}
                {outcome.sourceTaskRevision
                  ? ` · source task revision ${outcome.sourceTaskRevision}`
                  : ""}.{" "}
                {outcome.linkedRunFound
                  ? "Only evidence from this task run is shown."
                  : "No linked agent run is available; criteria remain unverified."}
              </p>
              {outcome.criteria.length ? (
                outcome.criteria.map((item) => (
                  <div className="field" key={item.criterion.criterionId}>
                    <strong>
                      {item.criterion.description} · {item.status.replaceAll("_", " ")}
                    </strong>
                    {item.evidence.map((entry) => (
                      <span className="hint" key={entry.record.evidenceId}>
                        {entry.record.summary}
                        {entry.stale ? ` · Stale: ${entry.reason}` : ""}
                      </span>
                    ))}
                    {item.review && (
                      <span {...staticHintProps}>
                        Human review: {item.review.outcome} · {item.review.note || "No note"}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p {...staticHintProps}>This Skill revision defined no success criteria.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RoutineRunReview({
  run,
  busy,
  onResolve,
}: {
  run: RoutineRun;
  busy: boolean;
  onResolve: (outcome: "applied" | "not_applied", note: string) => void;
}) {
  const [note, setNote] = useState("");
  const uncertain = run.status === "uncertain";
  return (
    <div {...staticFieldProps}>
      <label>
        {uncertain ? "What did you verify happened?" : "Review note"}
        <textarea
          value={note}
          maxLength={1000}
          disabled={busy}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      {uncertain && (
        <span {...staticHintProps}>
          Check the destination before choosing an outcome. Aux will not retry this run automatically.
        </span>
      )}
      <div {...staticRowProps}>
        <button
          {...smallButtonProps}
          disabled={busy || !note.trim()}
          onClick={() => onResolve("applied", note.trim())}
        >
          {uncertain ? "Confirmed applied" : "Approve and run"}
        </button>
        <button
          {...smallGhostButtonProps}
          disabled={busy || !note.trim()}
          onClick={() => onResolve("not_applied", note.trim())}
        >
          {uncertain ? "Confirmed not applied" : "Skip occurrence"}
        </button>
      </div>
    </div>
  );
}

function RoutineDefinitionEditor({
  routine,
  disabled,
  onSave,
}: {
  routine: Routine;
  disabled: boolean;
  onSave: (
    definition: Pick<Routine, "title" | "objective" | "outputHint" | "parameters" | "successCriteria"> & {
      sourceTaskRevision?: number;
    },
  ) => void;
}) {
  const [title, setTitle] = useState(routine.title);
  const [objective, setObjective] = useState(routine.objective);
  const [outputHint, setOutputHint] = useState(routine.outputHint ?? "");
  const [parameters, setParameters] = useState<RoutineParameter[]>(routine.parameters);
  const [criteria, setCriteria] = useState(routine.successCriteria);
  const [source, setSource] = useState<Task | null>(null);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    if (!routine.sourceTaskId) return;
    let live = true;
    void call("tasks.get", { taskId: routine.sourceTaskId })
      .then((result) => {
        if (live) setSource(result.task);
      })
      .catch((reason) => {
        if (live) setLoadError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [routine.sourceTaskId]);
  const sourceMatches =
    !source ||
    (criteria.length === source.criteria.length &&
      criteria.every((item, index) => {
        const current = source.criteria[index];
        return (
          current?.criterionId === item.criterionId &&
          current.description === item.description &&
          current.verification === item.verification
        );
      }));
  const validNames =
    parameters.every((item) => /^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(item.name) && item.label.trim()) &&
    new Set(parameters.map((item) => item.name)).size === parameters.length;
  const dirty =
    title !== routine.title ||
    objective !== routine.objective ||
    outputHint !== (routine.outputHint ?? "") ||
    (sourceMatches && source?.revision !== undefined && source.revision !== routine.sourceTaskRevision) ||
    JSON.stringify(parameters) !== JSON.stringify(routine.parameters) ||
    JSON.stringify(criteria) !== JSON.stringify(routine.successCriteria);
  const changeParameter = (index: number, patch: Partial<RoutineParameter>) =>
    setParameters((items) => items.map((item, at) => (at === index ? { ...item, ...patch } : item)));
  return (
    <details className="routine-accounts">
      <summary>Skill definition and outcome</summary>
      <div {...staticFieldProps}>
        <label>
          Skill name
          <input
            value={title}
            maxLength={200}
            disabled={disabled}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
      </div>
      <div {...staticFieldProps}>
        <label>
          Objective
          <textarea
            value={objective}
            maxLength={10000}
            disabled={disabled}
            onChange={(event) => setObjective(event.target.value)}
          />
        </label>
      </div>
      <div {...staticFieldProps}>
        <label>
          Expected output
          <input
            value={outputHint}
            maxLength={400}
            disabled={disabled}
            onChange={(event) => setOutputHint(event.target.value)}
          />
        </label>
      </div>
      <div {...staticFieldProps}>
        <strong>Parameters</strong>
        <span {...staticHintProps}>
          Use a parameter in the objective as {"{{name}}"}; enter its value when running the Skill.
        </span>
        {parameters.map((item, index) => (
          <div className="row" key={index}>
            <input
              aria-label={`Parameter ${index + 1} name`}
              placeholder="name"
              value={item.name}
              disabled={disabled}
              onChange={(event) => changeParameter(index, { name: event.target.value })}
            />
            <input
              aria-label={`Parameter ${index + 1} label`}
              placeholder="Label"
              value={item.label}
              disabled={disabled}
              onChange={(event) => changeParameter(index, { label: event.target.value })}
            />
            <input
              aria-label={`Parameter ${index + 1} default`}
              placeholder="Optional default"
              value={item.value ?? ""}
              disabled={disabled}
              onChange={(event) => changeParameter(index, { value: event.target.value })}
            />
            <button
              {...smallGhostButtonProps}
              disabled={disabled}
              onClick={() => setParameters((items) => items.filter((_, at) => at !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          {...smallGhostButtonProps}
          disabled={disabled || parameters.length >= 20}
          onClick={() => setParameters((items) => [...items, { name: "", label: "" }])}
        >
          Add parameter
        </button>
      </div>
      <div {...staticFieldProps}>
        <strong>Success criteria</strong>
        {criteria.length ? (
          criteria.map((item) => (
            <span className="hint" key={item.criterionId}>
              {item.description} · {item.verification}
            </span>
          ))
        ) : (
          <span {...staticHintProps}>
            The bound task's criteria will be used. Sync them to keep this Skill revision explicit.
          </span>
        )}
        {source && (
          <>
            <span {...staticHintProps}>
              Source task: {source.title} · revision {source.revision}
              {source.revision !== routine.sourceTaskRevision
                ? " · changed since this Skill was reviewed"
                : ""}
              . Edit criteria in the task, then sync this Skill.
            </span>
            {!sourceMatches && (
              <span {...staticFieldErrorProps}>
                The source task criteria differ. Sync before running this Skill.
              </span>
            )}
            <button
              {...smallGhostButtonProps}
              disabled={disabled || (sourceMatches && criteria.length > 0)}
              onClick={() => setCriteria(source.criteria)}
            >
              Use source task criteria
            </button>
          </>
        )}
        {loadError && <span {...staticFieldErrorProps}>Source task could not be loaded. {loadError}</span>}
      </div>
      {source && (
        <div {...staticFieldProps}>
          <strong>Source task resources</strong>
          {source.resources.length ? (
            source.resources.map((item) => (
              <span className="hint" key={item.resourceId}>
                {item.label} · {item.kind} · {item.access ?? "task default"}
              </span>
            ))
          ) : (
            <span {...staticHintProps}>No resources attached to this task.</span>
          )}
          <span {...staticHintProps}>
            References do not grant access. Live pages and current grants are checked again when the Skill
            runs.
          </span>
        </div>
      )}
      <button
        {...smallButtonProps}
        disabled={disabled || !dirty || !title.trim() || !objective.trim() || !validNames}
        onClick={() =>
          onSave({
            title: title.trim(),
            objective: objective.trim(),
            outputHint: outputHint.trim(),
            parameters,
            successCriteria: criteria,
            ...(sourceMatches && source ? { sourceTaskRevision: source.revision } : {}),
          })
        }
      >
        Save Skill revision
      </button>
    </details>
  );
}

function RoutineSourceTask({
  routine,
  disabled,
  onSave,
}: {
  routine: Routine;
  disabled: boolean;
  onSave: (taskId: string) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [picked, setPicked] = useState(routine.sourceTaskId ?? "");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let live = true;
    void call("tasks.list", { workspaceId: routine.workspaceId, limit: 500 })
      .then((items) => {
        if (live) setTasks(items);
      })
      .catch((reason) => {
        if (live) setLoadError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [routine.workspaceId]);
  return (
    <div {...staticFieldProps}>
      <label htmlFor={`routine-source-${routine.routineId}`}>Source task</label>
      <div {...staticRowProps}>
        <select
          id={`routine-source-${routine.routineId}`}
          value={picked}
          disabled={disabled}
          onChange={(event) => setPicked(event.target.value)}
        >
          <option value="">Choose a saved task…</option>
          {tasks.map((task) => (
            <option key={task.taskId} value={task.taskId}>
              {task.title}
            </option>
          ))}
        </select>
        <button
          {...smallButtonProps}
          disabled={disabled || !picked || picked === routine.sourceTaskId}
          onClick={() => onSave(picked)}
        >
          Bind task
        </button>
      </div>
      {loadError && <span {...staticFieldErrorProps}>Tasks could not be loaded. {loadError}</span>}
    </div>
  );
}

function RoutineRunControls({
  routine,
  disabled,
  onRun,
}: {
  routine: Routine;
  disabled: boolean;
  onRun: (parameters: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(routine.parameters.map((item) => [item.name, item.value ?? ""])),
  );
  return (
    <div {...staticFieldProps}>
      {routine.parameters.map((item) => (
        <label key={item.name}>
          {item.label}
          <input
            value={values[item.name] ?? ""}
            disabled={disabled}
            onChange={(event) => setValues((current) => ({ ...current, [item.name]: event.target.value }))}
          />
        </label>
      ))}
      <button
        {...smallButtonProps}
        disabled={disabled || routine.parameters.some((item) => !values[item.name]?.trim())}
        onClick={() => onRun(values)}
      >
        Run now
      </button>
    </div>
  );
}

/** Choose which labeled vault accounts this routine may use — an empty selection stays unrestricted. */
function RoutineAccounts({
  routine,
  disabled,
  onSave,
}: {
  routine: Routine;
  disabled: boolean;
  onSave: (accountLabels: string[]) => void;
}) {
  const [items, setItems] = useState<VaultItem[] | null>(null);
  const [picked, setPicked] = useState<string[]>(routine.accountLabels);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let live = true;
    void call("vault.list", { includeRevoked: false })
      .then((list) => {
        if (live) setItems(list);
      })
      .catch((reason) => {
        if (live) setLoadError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, []);
  const known = [
    ...new Set((items ?? []).map((item) => item.accountLabel).filter((label): label is string => !!label)),
  ].sort();
  const choices = [...new Set([...known, ...picked])];
  const dirty =
    picked.length !== routine.accountLabels.length ||
    picked.some((label) => !routine.accountLabels.includes(label));
  const toggle = (label: string, on: boolean) =>
    setPicked((current) =>
      on ? [...new Set([...current, label])] : current.filter((item) => item !== label),
    );
  return (
    <details className="routine-accounts">
      <summary>Accounts{picked.length ? ` — ${picked.length} labeled` : " — any"}</summary>
      <p {...staticHintProps}>
        Pick the labeled accounts this routine may fill. Runs only see grants for the labels you choose; an
        empty list means any account. Label vault items in Vault settings.
      </p>
      {loadError && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Vault labels could not be loaded. {loadError}
        </p>
      )}
      {items !== null && !choices.length && (
        <p {...staticHintProps}>
          No labeled vault items yet — every vault item without an account label stays unrestricted.
        </p>
      )}
      {choices.map((label) => (
        <label className="routine-account" key={label}>
          <input
            {...nativeCheckboxTypeProps}
            checked={picked.includes(label)}
            disabled={disabled}
            onChange={(event) => toggle(label, event.target.checked)}
          />
          <span>
            {label}
            {!known.includes(label) && <small> · not in vault</small>}
          </span>
        </label>
      ))}
      {(items !== null || picked.length > 0) && (
        <button {...smallButtonProps} disabled={disabled || !dirty} onClick={() => onSave(picked)}>
          Save accounts
        </button>
      )}
    </details>
  );
}

function RoutineCalendarGrants({
  routine,
  disabled,
  onSave,
}: {
  routine: Routine;
  disabled: boolean;
  onSave: (grantIds: string[]) => void;
}) {
  const [grants, setGrants] = useState<CalendarTaskGrant[] | null>(null);
  const [picked, setPicked] = useState<string[]>(routine.calendarGrantIds);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!routine.sourceTaskId) return;
    let live = true;
    void call("calendar.taskGrants.list", { taskId: routine.sourceTaskId })
      .then((items) => {
        if (live) setGrants(items.filter((item) => item.taskRevision === routine.sourceTaskRevision));
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [routine.sourceTaskId, routine.sourceTaskRevision]);
  const available = new Set((grants ?? []).map((grant) => grant.grantId));
  const stale = picked.filter((id) => !available.has(id));
  const dirty =
    picked.length !== routine.calendarGrantIds.length ||
    picked.some((id) => !routine.calendarGrantIds.includes(id));
  const toggle = (id: string, on: boolean) =>
    setPicked((current) => (on ? [...new Set([...current, id])] : current.filter((item) => item !== id)));
  return (
    <details className="routine-accounts">
      <summary>Calendar accounts — {picked.length} allowed</summary>
      <p {...staticHintProps}>
        This Skill can read only the Calendar grants selected here and still active on its saved task. New
        task grants are not added automatically.
      </p>
      {!routine.sourceTaskId && <p {...staticHintProps}>Bind a saved task before selecting Calendar accounts.</p>}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Calendar grants could not be loaded. {error}
        </p>
      )}
      {grants?.length === 0 && (
        <p {...staticHintProps}>No Calendar accounts are granted to this task revision.</p>
      )}
      {grants?.map((grant) => (
        <label className="routine-account" key={grant.grantId}>
          <input
            {...nativeCheckboxTypeProps}
            checked={picked.includes(grant.grantId)}
            disabled={disabled}
            onChange={(event) => toggle(grant.grantId, event.target.checked)}
          />
          <span>
            {grant.label} · {grant.accountKey}
          </span>
        </label>
      ))}
      {grants && stale.length > 0 && (
        <p {...staticHintProps}>
          {stale.length} saved Calendar grant{stale.length === 1 ? " is" : "s are"} no longer available.
          Remove them before this Skill can run.
        </p>
      )}
      {grants && dirty && (
        <button
          {...smallButtonProps}
          disabled={disabled}
          onClick={() => onSave(picked.filter((id) => available.has(id)))}
        >
          Save Calendar accounts
        </button>
      )}
      {grants && stale.length > 0 && !dirty && (
        <button
          {...smallButtonProps}
          disabled={disabled}
          onClick={() => onSave(picked.filter((id) => available.has(id)))}
        >
          Remove unavailable grants
        </button>
      )}
    </details>
  );
}
