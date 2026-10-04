import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Task, TaskReceipt } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { guardCommandCompletion } from "../command-completion";
import { PreferenceAction, usePreferenceCommand } from "../settings/sections/preference-command";
import { TaskReceiptView } from "./TaskReceiptView";

class HistoryOwner {
  #live = true;
  #sequence = 0;
  activate() {
    this.#live = true;
  }
  retire() {
    this.#live = false;
    ++this.#sequence;
  }
  next() {
    return ++this.#sequence;
  }
  matches(sequence: number) {
    return this.#sequence === sequence;
  }
  constructor(
    readonly taskId: string,
    readonly windowId: string,
    readonly privateMode: boolean,
    readonly kind: typeof bridge.windowKind,
  ) {}
  current() {
    return (
      this.#live &&
      bridge.windowId === this.windowId &&
      bridge.privateMode === this.privateMode &&
      bridge.windowKind === this.kind
    );
  }
}
/** Saved definitions and receipts are inspectable without replacing the current draft. */
export function TaskHistory({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  // A committed window/Private change permanently destroys the original read owner.
  return (
    <HistorySession
      key={JSON.stringify([taskId, bridge.windowId, bridge.privateMode, bridge.windowKind])}
      taskId={taskId}
      onClose={onClose}
    />
  );
}
function HistorySession({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null),
    scopeId = useId();
  const owner = useMemo(
    () => new HistoryOwner(taskId, bridge.windowId, bridge.privateMode, bridge.windowKind),
    [taskId],
  );
  useLayoutEffect(() => {
    owner.activate();
    return () => {
      owner.retire();
    };
  }, [owner]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start" });
  }, []);
  const [revisions, setRevisions] = useState<Task[]>([]),
    [revision, setRevision] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<TaskReceipt | null>(null),
    [error, setError] = useState("");
  const latest = useRef({ revisions, revision, receipt });
  useLayoutEffect(() => {
    latest.current = { revisions, revision, receipt };
  }, [revisions, revision, receipt]);
  const readReceipt = useCallback(
    (selected: number, sequence: number) => {
      const current = () => owner.current() && owner.matches(sequence);
      return guardCommandCompletion(
        (async () => {
          if (!current()) throw new Error("Choose this task’s current history.");
          const result = await call("tasks.receipt", { taskId, revision: selected });
          if (!current()) return result;
          if (result.taskId !== taskId || result.taskRevision !== selected)
            throw new Error("Saved task receipt changed.");
          setReceipt(result);
          return result;
        })().catch((reason) => {
          if (current()) setError(String(reason));
          throw reason;
        }),
        current,
      );
    },
    [owner, taskId],
  );
  const load = useCallback(() => {
    const sequence = owner.next(),
      current = () => owner.current() && owner.matches(sequence);
    if (current()) {
      setError("");
      setReceipt(null);
    }
    return guardCommandCompletion(
      (async () => {
        if (!current()) throw new Error("Choose this task’s current history.");
        const result = await call("tasks.get", { taskId });
        if (!current()) return result;
        if (
          result.task.taskId !== taskId ||
          !result.revisions.length ||
          result.revisions.some((item) => item.taskId !== taskId)
        )
          throw new Error("Saved task history changed.");
        const rows = [...result.revisions].reverse(),
          previous = latest.current.revision;
        const selected = rows.some((item) => item.revision === previous)
          ? previous!
          : (result.revisions.at(-2) ?? result.revisions.at(-1)!).revision;
        setRevisions(rows);
        setRevision(selected);
        await readReceipt(selected, sequence);
        return result;
      })().catch((reason) => {
        if (current()) setError(String(reason));
        throw reason;
      }),
      current,
    );
  }, [owner, taskId, readReceipt]);
  useEffect(() => {
    let live = true;
    void Promise.resolve()
      .then(() => {
        if (live && owner.current()) return load();
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [load, owner]);
  const selectRevision = useCallback(
    (original: HTMLSelectElement) => {
      const selected = Number(original.value);
      if (!owner.current() || !latest.current.revisions.some((item) => item.revision === selected))
        throw new Error("Choose this task’s saved revision.");
      setRevision(selected);
      setReceipt(null);
      setError("");
      return readReceipt(selected, owner.next());
    },
    [owner, readReceipt],
  );
  const close = () => {
    if (!owner.current()) throw new Error("Choose this task’s current history.");
    onClose();
  };
  const task = revisions.find((item) => item.revision === revision);
  return (
    <section className="task-history field" aria-label="Saved task history">
      <div {...staticRowProps}>
        <h3 ref={heading} tabIndex={-1}>
          Saved task history
        </h3>
        <span className="sp" />
        <PreferenceAction command="close-task-history" scopeId={scopeId} {...smallButtonProps} invoke={close}>
          Back to current task
        </PreferenceAction>
      </div>
      <p {...staticHintProps}>
        Inspect earlier objectives, resources, evidence and reviews. Your current draft stays unchanged. Saved
        history stays on this Mac and is available in every Aux window without signing in.
      </p>
      {!!revisions.length && (
        <label className="field" htmlFor={scopeId}>
          Saved revision
          <RevisionSelect
            scopeId={scopeId}
            revision={revision}
            revisions={revisions}
            invoke={selectRevision}
          />
        </label>
      )}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <PreferenceAction command="retry-task-history" scopeId={scopeId} {...smallButtonProps} invoke={load}>
            Retry history
          </PreferenceAction>
        </div>
      )}
      {!receipt && !error && <output data-block>Loading saved revision…</output>}
      {task && receipt && (
        <>
          <div className="task-history-definition field">
            <h3>{task.title}</h3>
            <span {...staticHintProps}>
              Revision {task.revision} · {task.state === "archived" ? "Archived" : "Open"} when saved
            </span>
            <p className="selectable">{task.objective}</p>
            <h4>Saved resources</h4>
            {!task.resources.length && <p {...staticHintProps}>No resources in this revision.</p>}
            {task.resources.map((resource) => (
              <div key={resource.resourceId} className="field">
                <strong>{resource.label}</strong>
                <span className="hint selectable">
                  {resource.kind} · {resource.locator}
                </span>
              </div>
            ))}
          </div>
          <TaskReceiptView key={`${taskId}:${revision}`} receipt={receipt} pageId={null} readOnly />
          <HistoryDisclosure
            owner={owner}
            scopeId={scopeId}
            title={`Runs through revision ${task.revision} (${receipt.runs.length})`}
          >
            <div className="field">
              {receipt.runs.map((run) => (
                <PreferenceAction
                  className="btn sm"
                  key={run.runId}
                  command="open-task-history-run"
                  scopeId={scopeId}
                  invoke={() => {
                    if (
                      !owner.current() ||
                      latest.current.receipt !== receipt ||
                      latest.current.revision !== revision
                    )
                      throw new Error("Choose this saved revision’s current run.");
                    useStore.getState().openRail({ kind: "run", runId: run.runId });
                    useStore.getState().setOverlay(null);
                  }}
                >
                  Revision {run.taskRevision} · {run.status.replaceAll("_", " ")} · {run.runId}
                </PreferenceAction>
              ))}
            </div>
          </HistoryDisclosure>
        </>
      )}
    </section>
  );
}

function RevisionSelect({
  scopeId,
  revision,
  revisions,
  invoke,
}: {
  scopeId: string;
  revision: number | null;
  revisions: Task[];
  invoke(original: HTMLSelectElement): unknown;
}) {
  const [controlRef, select] = usePreferenceCommand<HTMLSelectElement>(
    "select-task-history-revision",
    scopeId,
    invoke,
  );
  return (
    <select
      ref={controlRef}
      id={scopeId}
      data-command-id="select-task-history-revision"
      aria-label="Saved revision"
      value={revision ?? ""}
      onChange={select}
    >
      {revisions.map((item) => (
        <option key={item.revision} value={item.revision}>
          Revision {item.revision}
          {item.revision === revisions[0]?.revision ? " · Latest saved" : ""} ·{" "}
          {new Date(item.updatedAt).toLocaleString()}
        </option>
      ))}
    </select>
  );
}
function HistoryDisclosure({
  owner,
  scopeId,
  title,
  children,
}: {
  owner: HistoryOwner;
  scopeId: string;
  title: string;
  children: ReactNode;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const [summaryRef, toggle] = usePreferenceCommand<HTMLElement>(
    "toggle-task-history-runs",
    scopeId,
    useCallback(() => {
      if (!owner.current() || !details.current) throw new Error("Choose this task’s current history.");
      details.current.open = !details.current.open;
    }, [owner]),
  );
  return (
    <details ref={details}>
      <summary
        ref={summaryRef}
        data-command-id="toggle-task-history-runs"
        onClick={(event) => {
          event.preventDefault();
          toggle(event);
        }}
      >
        {title}
      </summary>
      {children}
    </details>
  );
}
