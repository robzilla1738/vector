import "./Tasks.css";
import { Tabs, WorkRow } from "../ui";
import { useEffect, useRef, useState } from "react";
import type { Run, Task, TaskReceipt } from "@aux/contracts";
import { call, useStore } from "../store";
import { I } from "./icons";
import {
  readTaskDraft,
  writeTaskDraft,
  taskDraftKey,
  readTaskSelection,
  rememberTask,
  type TaskDraft,
} from "../task-drafts";
import { TaskResources } from "./TaskResources";
import { TaskHistory } from "./TaskHistory";
import { TaskReceiptView } from "./TaskReceiptView";
import { Routines } from "./Routines";
import { Goals } from "./Goals";
import { Hooks } from "./Hooks";
import { CalendarTaskGrants } from "./CalendarTaskGrants";
import { bridge } from "../bridge";

type Details = {
  task: Task;
  revisions: Task[];
  runs: { run: Run; currentRevision: boolean }[];
  children: {
    task: Task;
    depth: number;
    latestRun?: { runId: string; status: string; taskRevision?: number };
    cloudAuthority?: { environmentId: string; remoteName: string };
    receiptStatus?: TaskReceipt["status"];
  }[];
};

export function Tasks() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = useStore((s) => s.setOverlay);
  const openRail = useStore((s) => s.openRail);
  const needsSetup = useStore((s) => s.settings.modelConfigured === false);
  const activePageId = useStore((s) => s.activePageId);
  const conversationId = useStore((s) => s.conversationId);
  const [showHistory, setShowHistory] = useState(false);
  const [creating, setCreating] = useState(false);
  const layout = useStore((s) => s.layout);
  const workspaceId = layout.spaces.find((space) => space.id === layout.activeSpaceId)?.workspaceId ?? "";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Details | null>(null);
  const [receipt, setReceipt] = useState<TaskReceipt | null>(null);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [criteria, setCriteria] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftRevision, setDraftRevision] = useState<number | null>(null);
  const [draftNotice, setDraftNotice] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "archived">("all");
  const [taskQuery, setTaskQuery] = useState("");
  const [newParentTaskId, setNewParentTaskId] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    return () => {
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    let live = true;
    const openingSkill = useStore.getState().skillSelection?.workspaceId === workspaceId;
    setTasks([]);
    setSelected(null);
    setReceipt(null);
    setShowHistory(false);
    setTaskQuery("");
    if (!workspaceId) return;
    setBusy(true);
    void (async () => {
      const items = await call("tasks.list", { workspaceId, includeArchived: true });
      const remembered = readTaskSelection().tasks[workspaceId];
      if (!live) return;
      setTasks(items);
      if (remembered && items.some((item) => item.taskId === remembered)) {
        const [details, receipt] = await Promise.all([
          call("tasks.get", { taskId: remembered }),
          call("tasks.receipt", { taskId: remembered }),
        ]);
        if (!live) return;
        edit(details);
        setReceipt(receipt);
      } else if (openingSkill) {
        setCreating(false);
        setSelected(null);
      } else {
        reset();
        setCreating(false);
      }
    })()
      .catch((error) => {
        if (live) setError(String(error));
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [workspaceId]);

  function remember(taskId: string | null) {
    try {
      rememberTask(workspaceId, taskId);
    } catch {
      setDraftNotice("Local storage is unavailable. Keep this window open until you save your task.");
    }
  }
  function restore(draft: TaskDraft | null, saved?: Task) {
    setTitle(draft?.title ?? saved?.title ?? "");
    setObjective(draft?.objective ?? saved?.objective ?? "");
    setCriteria(draft?.criteria ?? saved?.criteria.map((item) => item.description).join("\n") ?? "");
    setDraftRevision(draft ? draft.baseRevision : (saved?.revision ?? null));
    setDraftNotice(draft ? "Local draft restored. Save task to update the shared task record." : "");
  }
  function newDraftKey(parentTaskId = newParentTaskId) {
    return taskDraftKey(workspaceId, parentTaskId ? `new-child-${parentTaskId}` : undefined);
  }
  function reset(parentTaskId: string | null = null) {
    setCreating(true);
    setShowHistory(false);
    setSelected(null);
    setReceipt(null);
    setNewParentTaskId(parentTaskId);
    restore(readTaskDraft(newDraftKey(parentTaskId)));
    remember(null);
  }
  function edit(details: Details, restoreDraft = true) {
    setCreating(false);
    setShowHistory(false);
    setSelected(details);
    setNewParentTaskId(null);
    restore(
      restoreDraft ? readTaskDraft(taskDraftKey(workspaceId, details.task.taskId)) : null,
      details.task,
    );
    remember(details.task.taskId);
  }
  function change(field: "title" | "objective" | "criteria", value: string) {
    const draft = { title, objective, criteria, baseRevision: draftRevision, [field]: value };
    if (field === "title") setTitle(value);
    else if (field === "objective") setObjective(value);
    else setCriteria(value);
    try {
      const unchanged = selected
        ? draft.title === selected.task.title &&
          draft.objective === selected.task.objective &&
          draft.criteria === selected.task.criteria.map((item) => item.description).join("\n")
        : !draft.title && !draft.objective && !draft.criteria;
      writeTaskDraft(
        selected ? taskDraftKey(workspaceId, selected.task.taskId) : newDraftKey(),
        unchanged ? null : draft,
      );
      setDraftNotice(unchanged ? "" : "Draft saved locally. Save task to update the shared task record.");
    } catch {
      setDraftNotice(
        "Couldn’t save this draft locally. Keep this window open and save your task before leaving.",
      );
    }
  }
  async function action(work: () => Promise<void>) {
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBusy(true);
    setError("");
    try {
      await work();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        if (document.activeElement === document.body && focused?.isConnected) focused.focus();
      });
    }
  }
  async function refresh(taskId: string, restoreDraft = true) {
    const [details, receipt, tasks] = await Promise.all([
      call("tasks.get", { taskId }),
      call("tasks.receipt", { taskId }),
      call("tasks.list", { workspaceId, includeArchived: true }),
    ]);
    edit(details, restoreDraft);
    setReceipt(receipt);
    setTasks(tasks);
  }
  async function save() {
    const descriptions = criteria
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const definition = {
      title,
      objective,
      criteria: descriptions.map((description, index) => ({
        criterionId: selected?.task.criteria[index]?.criterionId ?? crypto.randomUUID(),
        description,
        verification: selected?.task.criteria[index]?.verification ?? "manual",
      })),
    };
    const task = selected
      ? await call("tasks.update", {
          ...definition,
          taskId: selected.task.taskId,
          expectedRevision: selected.task.revision,
        })
      : await call("tasks.create", {
          ...definition,
          workspaceId,
          ...(newParentTaskId ? { parentTaskId: newParentTaskId } : {}),
        });
    try {
      writeTaskDraft(selected ? taskDraftKey(workspaceId, selected.task.taskId) : newDraftKey(), null);
    } catch {
      /* saved task remains authoritative */
    }
    await refresh(task.taskId, false);
  }
  async function exportCoordinationPlan(details: Details) {
    const rows = details.children.map(
      (child) =>
        `${"  ".repeat(Math.max(0, child.depth - 1))}- ${child.task.title} · revision ${child.task.revision} · ${child.cloudAuthority ? `cloud: ${child.cloudAuthority.remoteName}` : (child.latestRun?.status.replaceAll("_", " ") ?? "not started")} · receipt ${child.receiptStatus?.replaceAll("_", " ") ?? "unverified"}${child.latestRun && child.latestRun.taskRevision !== child.task.revision ? " · latest run is from an earlier revision" : ""}${child.task.state === "archived" ? " · archived" : ""}`,
    );
    const content = [
      `# ${details.task.title}`,
      "",
      `Task ${details.task.taskId} · revision ${details.task.revision}`,
      "",
      details.task.objective,
      "",
      "## Coordinated work",
      "",
      ...rows,
      "",
      "Each child has independent resources, execution authority, evidence and review. This snapshot does not accept criteria or prove external outcomes.",
      "",
    ].join("\n");
    const name = `aux-task-plan-${
      details.task.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || details.task.taskId.slice(0, 8)
    }.md`;
    await bridge.saveFile(name, content);
  }
  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
  }, [selected?.task.taskId, creating]);

  const conflict = !!selected && draftRevision !== selected.task.revision;
  const attached =
    !!selected &&
    !!activePageId &&
    (selected.task.resources.some(
      (resource) => resource.kind === "page" && resource.locator === activePageId,
    ) ||
      selected.runs.some(
        ({ run, currentRevision }) => currentRevision && run.pageIds.includes(activePageId),
      ));
  const dirty =
    !!selected &&
    (title !== selected.task.title ||
      objective !== selected.task.objective ||
      criteria !== selected.task.criteria.map((item) => item.description).join("\n"));
  const visibleTasks = tasks.filter(
    (task) =>
      (taskFilter === "all" ||
        (taskFilter === "archived" ? task.state === "archived" : task.state !== "archived")) &&
      `${task.title} ${task.objective} ${task.criteria.map((item) => item.description).join(" ")} ${task.resources.map((item) => item.label).join(" ")}`
        .toLowerCase()
        .includes(taskQuery.toLowerCase()),
  );

  return (
    <section className="tasks-page" aria-label="Tasks" ref={dialogRef}>
      <div className={`task-content ${!selected && !creating ? "task-index" : ""}`}>
        <div className="drawer-head">
          <h3>{creating ? "New task" : selected ? selected.task.title : "Tasks"}</h3>
          <span className="sp" />
          <button ref={closeButton} className="icon-btn" aria-label="Close tasks" onClick={() => close(null)}>
            {I.close}
          </button>
        </div>
        {error && (
          <p role="alert" className="field">
            {error}
          </p>
        )}
        {(selected || creating) && (
          <button
            className="btn ghost task-back"
            disabled={busy}
            onClick={() => {
              setSelected(null);
              setCreating(false);
              setShowHistory(false);
              remember(null);
            }}
          >
            {I.back}All tasks
          </button>
        )}
        <fieldset
          disabled={busy}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            minWidth: 0,
          }}
        >
          <div className="field">
            <label htmlFor="task-workspace">Space</label>
            <select
              id="task-workspace"
              value={layout.activeSpaceId}
              onChange={(event) => {
                useStore.getState().switchSpace(event.target.value);
                useStore.getState().setOverlay("tasks");
              }}
            >
              {layout.spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>
          {!selected && !creating && (
            <>
              <div className="task-index-tools">
                <input
                  aria-label="Search tasks"
                  placeholder="Search tasks…"
                  value={taskQuery}
                  onChange={(event) => setTaskQuery(event.target.value)}
                />
                <button className="btn primary" disabled={!workspaceId} onClick={() => reset()}>
                  {I.plusSm}New task
                </button>
              </div>
              <div className="work-list-heading">
                <Tabs<"all" | "active" | "archived">
                  label="Task status"
                  value={taskFilter}
                  onChange={setTaskFilter}
                  panelId="task-list-panel"
                  className="history-segment"
                  items={[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "archived", label: "Archived" },
                  ]}
                />
                <output className="hint">
                  {visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}
                </output>
              </div>
              <div
                id="task-list-panel"
                role="tabpanel"
                aria-labelledby={`task-list-panel-${taskFilter}`}
                className="ui-work-list"
              >
                {visibleTasks.map((task) => (
                  <WorkRow
                    key={task.taskId}
                    title={task.title}
                    summary={task.objective}
                    icon={I.folder}
                    status={
                      task.state === "archived" ? "Archived" : task.parentTaskId ? "Child task" : "Saved task"
                    }
                    metadata={`${task.criteria.length} success ${task.criteria.length === 1 ? "criterion" : "criteria"} · Updated ${new Date(task.updatedAt).toLocaleDateString()}`}
                    disabled={busy}
                    onOpen={() => void action(() => refresh(task.taskId))}
                    actions={[
                      { label: "Open task", onSelect: () => void action(() => refresh(task.taskId)) },
                      {
                        label: task.state === "archived" ? "Restore" : "Archive",
                        onSelect: () =>
                          void action(async () => {
                            await call("tasks.archive", {
                              taskId: task.taskId,
                              expectedRevision: task.revision,
                              archived: task.state !== "archived",
                            });
                            setTasks(await call("tasks.list", { workspaceId, includeArchived: true }));
                          }),
                      },
                    ]}
                  />
                ))}
              </div>
              {!busy && !tasks.length && (
                <div className="home-empty">
                  <p>No saved tasks yet.</p>
                  <button className="btn ghost" disabled={!workspaceId} onClick={() => reset()}>
                    Create your first task
                  </button>
                </div>
              )}
              {!busy && tasks.length > 0 && !visibleTasks.length && (
                <div className="home-empty" role="status">
                  <p>No tasks match these filters.</p>
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setTaskQuery("");
                      setTaskFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
              {workspaceId && (
                <Goals
                  workspaceId={workspaceId}
                  chatId={conversationId}
                  activePageId={activePageId ?? null}
                  modelConfigured={!needsSetup}
                  openRun={(runId) => {
                    openRail({ kind: "run", runId });
                    close(null);
                  }}
                />
              )}
              {workspaceId && <Hooks workspaceId={workspaceId} />}
              {workspaceId && <Routines workspaceId={workspaceId} />}
            </>
          )}
          {selected && !showHistory && (
            <div className="row">
              <button className="btn sm" onClick={() => reset(selected.task.taskId)}>
                New child task
              </button>
              <button
                className="btn sm"
                onClick={() => {
                  setError("");
                  setShowHistory(true);
                }}
              >
                Task history
              </button>
              {(selected.task.conversationId || selected.runs[0]) && (
                <button
                  className="btn sm"
                  onClick={() => {
                    if (selected.task.conversationId)
                      useStore.getState().openConversationDraft(selected.task.conversationId);
                    else useStore.getState().openConversation(selected.runs[0]!.run.runId);
                    close(null);
                  }}
                >
                  Open full conversation
                </button>
              )}
            </div>
          )}
          {selected && showHistory && (
            <TaskHistory
              key={selected.task.taskId}
              taskId={selected.task.taskId}
              onClose={() => setShowHistory(false)}
            />
          )}
          {workspaceId && (selected || creating) && !showHistory && (
            <>
              {draftNotice && (
                <output className="field hint" data-block>
                  {draftNotice}
                </output>
              )}
              {conflict && selected && (
                <div className="field" role="alert">
                  <p>
                    This task changed since your draft began. Review the current saved version before applying
                    your draft.
                  </p>
                  <details>
                    <summary>Current saved task · revision {selected.task.revision}</summary>
                    <h4>{selected.task.title}</h4>
                    <p className="selectable">{selected.task.objective}</p>
                    <ul>
                      {selected.task.criteria.map((item) => (
                        <li key={item.criterionId}>{item.description}</li>
                      ))}
                    </ul>
                  </details>
                  <button
                    className="btn"
                    onClick={() => {
                      setDraftRevision(selected.task.revision);
                      try {
                        writeTaskDraft(taskDraftKey(workspaceId, selected.task.taskId), {
                          title,
                          objective,
                          criteria,
                          baseRevision: selected.task.revision,
                        });
                        setDraftNotice(
                          "Draft applied to the current revision. Review your edits, then Save task.",
                        );
                      } catch {
                        setDraftNotice("Draft could not be saved locally. Keep this window open.");
                      }
                    }}
                  >
                    Use my draft with this revision
                  </button>
                </div>
              )}
              {selected?.task.parentTaskId && (
                <p className="field hint">
                  Child task of{" "}
                  {tasks.find((task) => task.taskId === selected.task.parentTaskId)?.title ??
                    selected.task.parentTaskId}
                  . It has its own revision, resources, runs and evidence.
                </p>
              )}
              {!selected && newParentTaskId && (
                <p className="field hint">
                  New child of{" "}
                  {tasks.find((task) => task.taskId === newParentTaskId)?.title ?? newParentTaskId}. The child
                  starts without inherited tabs, repositories or other resource authority.
                </p>
              )}
              {selected && !!selected.children.length && (
                <section className="field" aria-label="Coordinated child tasks">
                  <div className="row">
                    <h4 className="grow">Coordinated work</h4>
                    <button
                      className="btn sm"
                      onClick={() => void action(() => exportCoordinationPlan(selected))}
                    >
                      Export plan…
                    </button>
                  </div>
                  <span className="hint">
                    Each child keeps its own revision, resources, runs, evidence and cloud authority.
                  </span>
                  {selected.children.map((child) => (
                    <button
                      className="btn"
                      key={child.task.taskId}
                      style={{ marginLeft: `${Math.min(child.depth - 1, 3) * 12}px` }}
                      onClick={() => void action(() => refresh(child.task.taskId))}
                    >
                      {child.depth > 1 ? "↳ " : ""}
                      {child.task.title} ·{" "}
                      {child.cloudAuthority
                        ? "cloud working"
                        : (child.latestRun?.status.replaceAll("_", " ") ?? "not started")}{" "}
                      · {child.receiptStatus?.replaceAll("_", " ") ?? "unverified"}
                      {child.latestRun && child.latestRun.taskRevision !== child.task.revision
                        ? " · earlier revision"
                        : ""}
                      {child.task.state === "archived" ? " · archived" : ""}
                    </button>
                  ))}
                </section>
              )}
              <div className="field">
                <label htmlFor="task-title">Title</label>
                <input
                  id="task-title"
                  value={title}
                  onChange={(e) => change("title", e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="field">
                <label htmlFor="task-objective">Objective</label>
                <textarea
                  id="task-objective"
                  rows={4}
                  value={objective}
                  onChange={(e) => change("objective", e.target.value)}
                  maxLength={10000}
                />
              </div>
              <div className="field">
                <label htmlFor="task-criteria">What must be true when this is done?</label>
                <textarea
                  id="task-criteria"
                  rows={4}
                  value={criteria}
                  onChange={(e) => change("criteria", e.target.value)}
                />
                <span className="hint">
                  One criterion per line. New criteria require your review; a finished run does not mark the
                  task verified.
                </span>
              </div>
              <div className="field row">
                <button
                  className="btn"
                  disabled={conflict || !title.trim() || !objective.trim() || !criteria.trim()}
                  onClick={() => void action(save)}
                >
                  Save task
                </button>
                {selected && (
                  <button
                    className="btn"
                    onClick={() =>
                      void action(async () => {
                        await refresh(selected.task.taskId, false);
                        writeTaskDraft(taskDraftKey(workspaceId, selected.task.taskId), null);
                      })
                    }
                  >
                    Discard draft and reload saved task
                  </button>
                )}
              </div>
              {!selected && (title || objective || criteria) && (
                <div className="field">
                  <button
                    className="btn"
                    onClick={() =>
                      void action(async () => {
                        writeTaskDraft(newDraftKey(), null);
                        reset();
                      })
                    }
                  >
                    Discard new task draft
                  </button>
                </div>
              )}
              {selected && (
                <>
                  {needsSetup && (
                    <div className="field">
                      <span className="hint">
                        Set up a model connection before running this task. You can still attach a tab and
                        review evidence.
                      </span>
                      <button className="btn sm" onClick={() => close("settings")}>
                        Set up agent
                      </button>
                    </div>
                  )}
                  <div className="field row">
                    <button
                      className="btn"
                      disabled={
                        needsSetup || conflict || dirty || !activePageId || selected.task.state === "archived"
                      }
                      onClick={() =>
                        void action(async () => {
                          const run = await call("tasks.start", {
                            taskId: selected.task.taskId,
                            expectedRevision: selected.task.revision,
                            pageIds: [activePageId as string],
                          });
                          openRail({ kind: "run", runId: run.runId });
                          close(null);
                        })
                      }
                    >
                      Run on current tab
                    </button>
                    {selected.runs.some(({ run }) =>
                      ["queued", "planning", "running", "paused", "needs_input"].includes(run.status),
                    ) && (
                      <button
                        className="btn"
                        disabled={needsSetup || conflict || dirty || selected.task.state === "archived"}
                        onClick={() =>
                          void action(async () => {
                            const run = await call("tasks.replaceAgent", {
                              taskId: selected.task.taskId,
                              expectedRevision: selected.task.revision,
                              pageIds: activePageId ? [activePageId] : [],
                            });
                            openRail({ kind: "run", runId: run.runId });
                            close(null);
                          })
                        }
                      >
                        Replace agent
                      </button>
                    )}
                    <button
                      className="btn"
                      disabled={dirty || conflict}
                      onClick={() =>
                        void action(async () => {
                          await call("tasks.archive", {
                            taskId: selected.task.taskId,
                            expectedRevision: selected.task.revision,
                            archived: selected.task.state !== "archived",
                          });
                          await refresh(selected.task.taskId);
                        })
                      }
                    >
                      {selected.task.state === "archived" ? "Restore" : "Archive"}
                    </button>
                  </div>
                  <div className="field">
                    <span className="hint">
                      {dirty
                        ? "Save your changes before starting a run."
                        : `Revision ${selected.task.revision}`}
                    </span>
                    <h4>Run history</h4>
                    {!selected.runs.length && <p>No runs yet.</p>}
                    {selected.runs.map(({ run, currentRevision }) => (
                      <button
                        className="btn"
                        key={run.runId}
                        onClick={() => {
                          openRail({ kind: "run", runId: run.runId });
                          close(null);
                        }}
                      >
                        {run.status.replaceAll("_", " ")}
                        {currentRevision ? "" : " · Earlier task revision"}
                      </button>
                    ))}
                  </div>
                  {!dirty && !conflict && (
                    <TaskResources
                      key={`resources:${selected.task.taskId}:${selected.task.revision}`}
                      task={selected.task}
                      activePageId={activePageId}
                      attached={attached}
                      update={(resources) =>
                        action(async () => {
                          await call("tasks.update", {
                            taskId: selected.task.taskId,
                            expectedRevision: selected.task.revision,
                            resources,
                          });
                          await refresh(selected.task.taskId);
                        })
                      }
                    />
                  )}
                  {!dirty && !conflict && (
                    <CalendarTaskGrants
                      key={`calendar:${selected.task.taskId}:${selected.task.revision}`}
                      task={selected.task}
                      onOpenSettings={() => close("settings")}
                    />
                  )}
                  {receipt && !dirty && !conflict && (
                    <TaskReceiptView
                      key={`${receipt.taskId}:${receipt.taskRevision}`}
                      receipt={receipt}
                      pageId={attached ? activePageId : null}
                      onChanged={() => refresh(receipt.taskId)}
                      submit={(method, ...params) =>
                        action(async () => {
                          await call(method, ...params);
                          await refresh(receipt.taskId);
                        })
                      }
                    />
                  )}
                  {!dirty && !conflict && <Routines workspaceId={workspaceId} task={selected.task} />}
                </>
              )}
            </>
          )}
        </fieldset>
      </div>
    </section>
  );
}
