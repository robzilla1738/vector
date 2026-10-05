import {
  staticHintProps as auxReserveStaticHintProps,
  staticFieldErrorProps as auxReserveStaticFieldErrorProps,
  staticRowProps as auxReserveStaticRowProps,
} from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import type { PageTarget, Run, Task, VaultItem } from "@aux/contracts";
import { originOfAddress } from "@aux/contracts/vault";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { openSavedTask } from "../task-navigation";
import { readTaskDraft, taskDraftKey } from "../task-drafts";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { staticButtonProps as auxReuseStaticButtonProps } from "../ui/class-props";

export function ConversationTask({ taskId, live, disabled, page, context, linkedPageId, onContext, onStarted }: {
  taskId: string; live: boolean; disabled: boolean; page?: PageTarget; context: string;
  linkedPageId?: string; onContext(value: string): void; onStarted(run: Run): void;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const currentTask = useRef(taskId); currentTask.current = taskId;
  const missingContext = !page && context !== "none";
  const needsSetup = useStore(state => state.settings.modelConfigured === false);
  useEffect(() => {
    let cancelled = false;
    setTask(current => current?.taskId === taskId ? current : null); setError("");
    void call("tasks.get", { taskId }).then(value => {
      if (!cancelled) setTask(value.task);
    }).catch(error => { if (!cancelled) setError(String(error)); });
    return () => { cancelled = true; };
  }, [taskId, refresh]);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "task.updated" && (event.payload.task as Task | undefined)?.taskId === taskId) setRefresh(value => value + 1);
  }), [taskId]);
  const draft = task && readTaskDraft(taskDraftKey(task.workspaceId, task.taskId));
  const unsaved = !!task && !!draft && (draft.title !== task.title || draft.objective !== task.objective || draft.criteria !== task.criteria.map(item => item.description).join("\n"));
  const details = () => void openSavedTask(taskId).catch(errToast);
  const start = async () => {
    if (!task || pending.current || live || disabled || unsaved || missingContext || task.state === "archived") return;
    if (needsSetup) {
      useStore.setState({ settingsCategory: "Models", overlay: "settings" });
      return;
    }
    pending.current = true; setBusy(true); setError("");
    const before = useStore.getState();
    const origin = before.pages.find(item => item.pageId === before.activePageId);
    try {
      const spaceId = before.layout.spaces.find(space => space.workspaceId === task.workspaceId)?.id ?? before.layout.activeSpaceId;
      const target = page ?? await before.openBackgroundTab("about:blank", spaceId, false);
      const run = await call("tasks.start", { taskId, expectedRevision: task.revision, pageIds: [target.pageId] });
      useStore.setState(state => ({ runs: state.runs.some(item => item.runId === run.runId) ? state.runs : [run, ...state.runs] }));
      const current = useStore.getState();
      const currentPage = current.pages.find(item => item.pageId === before.activePageId);
      if (currentTask.current === taskId && current.mode === before.mode && current.overlay === before.overlay
        && current.conversationId === before.conversationId && current.activePageId === before.activePageId
        && current.railView === before.railView && current.railOpen === before.railOpen
        && current.layout.activeSpaceId === before.layout.activeSpaceId
        && currentPage?.documentEpoch === origin?.documentEpoch && currentPage?.url === origin?.url) onStarted(run);
      else current.toast("Task started in the background. Find it in Tasks.");
    } catch (error) { setError(String(error)); }
    finally { pending.current = false; setBusy(false); }
  };
  return <section className="conversation-task-card" aria-label="Saved task">
    <div className="conversation-task-heading"><strong>{task?.title ?? "Saved task"}</strong><button {...smallButtonProps} onClick={details}>Details</button></div>
    {task ? task.objective !== task.title && <p className="conversation-task-objective">{task.objective}</p> : !error && <output {...auxReserveStaticHintProps} data-block>Loading task…</output>}
    {error && <p {...auxReserveStaticFieldErrorProps} role="alert">{error} <button {...smallButtonProps} disabled={busy} onClick={() => setRefresh(value => value + 1)}>Refresh task</button></p>}
    {live ? <p {...auxReserveStaticHintProps}>Working in this conversation. Browser context stays fixed until this run stops.</p> : task?.state === "archived" ? <p {...auxReserveStaticHintProps}>Restore this task in Details before running it.</p> : <>
      {unsaved && <p {...auxReserveStaticHintProps}>You have unsaved task edits. Open Details to save or discard them before running.</p>}
      <div className="conversation-task-actions">
        <BrowserContextPicker value={context} linkedPageId={linkedPageId} onChange={onContext} disabled={busy || disabled} />
        <button {...auxReuseStaticButtonProps} disabled={busy || disabled || !task || unsaved || missingContext} onClick={() => void start()}>{busy ? "Starting…" : needsSetup ? "Set up model" : "Run task"}</button>
        {task && <button {...smallGhostButtonProps} disabled={busy || disabled} onClick={() => { useStore.getState().setOverlay("tasks"); }}>Make a routine</button>}
      </div>
      {missingContext && <p {...auxReserveStaticHintProps}>Choose an available tab or New browser tab to continue.</p>}
      {task && <TaskSiteGrant taskId={taskId} workspaceId={task.workspaceId} page={page} />}
    </>}
  </section>;
}

function TaskSiteGrant({ taskId, workspaceId, page }: { taskId: string; workspaceId?: string; page?: PageTarget }) {
  const origin = page ? originOfAddress(page.url) : undefined;
  const [items, setItems] = useState<VaultItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!origin) return;
    void call("vault.list", {}).then(setItems).catch(() => undefined);
  }, [origin, taskId]);
  if (!origin) return null;
  const matches = items.filter(item => item.origin === origin && !item.revokedAt);
  const openVault = () => { useStore.setState({ settingsCategory: "Vault" }); useStore.getState().setOverlay("settings"); };
  return <div className="conversation-task-grant">
    <p {...auxReserveStaticHintProps}>Trusted fill uses the agent vault. Models receive an opaque reference, not the secret. Grant this origin for this task after unlocking the vault.</p>
    {error && <p {...auxReserveStaticFieldErrorProps} role="alert">{error}</p>}
    <div {...auxReserveStaticRowProps}>
      {matches.map(item => <button key={item.itemId} {...smallButtonProps} disabled={busy} onClick={() => {
        setBusy(true); setError("");
        void call("vault.grant", { itemId: item.itemId, origin, taskId, workspaceId, ttlMs: 30 * 60_000 })
          .then(() => useStore.getState().toast(`Granted ${item.label} for ${origin}.`))
          .catch(reason => setError(errorMessage(reason)))
          .finally(() => setBusy(false));
      }}>Grant {item.label} for this task</button>)}
      <button {...smallGhostButtonProps} onClick={openVault}>{matches.length ? "Manage vault" : "Open vault"}</button>
    </div>
  </div>;
}
