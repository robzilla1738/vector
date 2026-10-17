import type { MemoryView } from "../routes";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { memoryControlElement, useMemoryElementControl } from "../../components/memory-control-construction";
import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useId, type ReactNode } from "react";
import type { MemoryClaim, MemoryPipelineOverview, ShellCommandId } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call, useStore } from "../../store";
import { guardCommandCompletion } from "../../command-completion";
import { executeCommand } from "../../commands";
import { registerScopedControl } from "../../scoped-control-commands";
import { useConfirm } from "../../ui/dialog";
import { SettingsField } from "../primitives";
import { MemoryPasteImport } from "../../components/MemoryPasteImport";
import { MemoryRecoveryNotice } from "../../components/MemoryRecoveryNotice";
import { MemoryActivity } from "../../components/MemoryActivity";
import type { MemoryExtractionView } from "@aux/contracts";
import { MemoryHistory } from "../../components/MemoryHistory";
import { MemoryDocument } from "../../components/MemoryDocument";
import { staticGrowProps as auxClassGrowProps } from "../../ui/class-props";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

type Source = { runId: string; goal: string; endedAt: number };
type Revision = {
  revisionId: string;
  capturedAt: number;
  claimCount: number;
  summary: string;
  sourceRunIds: string[];
};

type PipelineSnapshot = {
  enabled: boolean;
  overview: MemoryPipelineOverview;
  sources: Source[];
  inbox: MemoryClaim[];
  claims: MemoryClaim[];
  history: Revision[];
  activity: MemoryExtractionView[];
};
class PipelineScope {
  constructor(readonly owner: unknown) {}
  #active = true;
  #request = 0;
  #snapshot: PipelineSnapshot | null = null;
  #pending: object | null = null;
  get active() {
    return this.#active;
  }
  retire() {
    this.#active = false;
    this.#pending = null;
  }
  request() {
    return ++this.#request;
  }
  isRequest(request: number) {
    return this.#active && this.#request === request;
  }
  publish(request: number, snapshot: PipelineSnapshot) {
    if (!this.#active || request !== this.#request || bridge.privateMode) return false;
    this.#snapshot = snapshot;
    this.#pending = null;
    return true;
  }
  current(snapshot: PipelineSnapshot | null) {
    return this.#active && !bridge.privateMode && this.#snapshot === snapshot;
  }
  begin(snapshot: PipelineSnapshot | null) {
    if (!this.current(snapshot) || this.#pending) return null;
    return (this.#pending = {});
  }
  finish(operation: object) {
    if (!this.#active || this.#pending !== operation) return false;
    this.#pending = null;
    return true;
  }
}
function PipelineControl({
  command,
  scopeId,
  action,
  onError,
  children,
  disabled = false,
  className = "btn sm",
  kind = "button",
  checked,
  value,
  inputId,
  expanded,
}: {
  command: ShellCommandId;
  scopeId: string;
  action(element: HTMLElement): unknown;
  onError(reason: unknown): void;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  kind?: "button" | "checkbox" | "select" | "summary";
  checked?: boolean;
  value?: string;
  inputId?: string;
  expanded?: boolean;
}) {
  const [attach, invoke] = useMemoryElementControl(command, scopeId, action, onError, kind === "summary");
  if (kind === "checkbox")
    return memoryControlElement("input", {
      id: inputId,
      ref: attach,
      "data-command-id": command,
      "aria-label": "Enable Space memory",
      type: "checkbox",
      className: "ui-switch",
      checked,
      disabled,
      onChange: invoke,
    });
  if (kind === "select")
    return memoryControlElement(
      "select",
      {
        ref: attach,
        "data-command-id": command,
        "aria-label": "Completed run for memory",
        value,
        disabled,
        onChange: invoke,
      },
      children,
    );
  if (kind === "summary")
    return memoryControlElement(
      "summary",
      { ref: attach, "data-command-id": command, onClick: invoke },
      children,
    );
  return memoryControlElement(
    "button",
    {
      type: "button",
      "aria-expanded": expanded,
      ref: attach,
      "data-command-id": command,
      className,
      disabled,
      onClick: invoke,
    },
    children,
  );
}
class DecisionControls {
  #retire = new Map<string, () => void>();
  constructor(readonly scopeId: string) {}
  attach(command: string, node: HTMLButtonElement | null, settle: () => void) {
    this.#retire.get(command)?.();
    this.#retire.delete(command);
    if (!node) return;
    node.dataset.commandId = command;
    this.#retire.set(command, registerScopedControl(node, command, this.scopeId, settle));
  }
  retire() {
    for (const cleanup of this.#retire.values()) cleanup();
    this.#retire.clear();
  }
}
export function SpaceMemory({
  workspaceId,
  includePasteImport = true,
  view,
}: {
  workspaceId: string;
  includePasteImport?: boolean;
  view?: MemoryView;
}) {
  const layout = useStore((state) => state.layout);
  const owners = [...layout.spaces, ...(layout.archivedSpaces ?? [])].filter(
    (space) => space.workspaceId === workspaceId,
  );
  if (bridge.privateMode || owners.length !== 1)
    return (
      <SettingsField label="Space memory">
        <p {...staticHintProps}>Choose the original non-private Space to review its memory.</p>
      </SettingsField>
    );
  return (
    <SpaceMemoryContent
      key={JSON.stringify([workspaceId, owners[0]!.id])}
      workspaceId={workspaceId}
      includePasteImport={includePasteImport}
      view={view}
    />
  );
}
function SpaceMemoryContent({
  workspaceId,
  includePasteImport,
  view,
}: {
  workspaceId: string;
  includePasteImport: boolean;
  view?: MemoryView;
}) {
  const layout = useStore((state) => state.layout);
  const ownerKey = JSON.stringify(
    [...layout.spaces, ...(layout.archivedSpaces ?? [])]
      .filter((space) => space.workspaceId === workspaceId)
      .map((space) => space.id),
  );
  const privateMode = bridge.privateMode;
  const ownsWorkspace = useCallback(() => {
    const current = useStore.getState().layout;
    const owners = [...current.spaces, ...(current.archivedSpaces ?? [])].filter(
      (space) => space.workspaceId === workspaceId,
    );
    return owners.length === 1 && JSON.stringify(owners.map((space) => space.id)) === ownerKey;
  }, [workspaceId, ownerKey]);
  const scope = useMemo(
    () => new PipelineScope([workspaceId, privateMode, ownerKey]),
    [workspaceId, privateMode, ownerKey],
  );
  useLayoutEffect(() => () => scope.retire(), [scope]);
  const [snapshotState, setSnapshot] = useState<{ scope: PipelineScope; value: PipelineSnapshot } | null>(
    null,
  );
  const snapshot = snapshotState?.scope === scope ? snapshotState.value : null;
  const {
    enabled = false,
    overview = null,
    sources = [],
    inbox = [],
    claims = [],
    history = [],
    activity = [],
  } = snapshot ?? {};
  const [showPasteImport, setShowPasteImport] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyView, setHistoryView] = useState<"activity" | "revisions">("activity");
  const [sourceId, setSourceId] = useState("");
  const [pending, setPending] = useState<{ scope: PipelineScope; operation: object } | null>(null);
  const [error, setError] = useState("");
  const [needsFreshBackup, setNeedsFreshBackup] = useState(false);
  const decisions = useMemo(() => new DecisionControls(workspaceId), [workspaceId]);
  useLayoutEffect(() => () => decisions.retire(), [decisions]);
  const invokeDecision = (command: ShellCommandId, event: React.MouseEvent<HTMLButtonElement>) => {
    void executeCommand(command, {
      payload: { scopeId: workspaceId },
      nativeInputEvent: event.nativeEvent,
    }).catch(report);
  };
  const { confirm, confirmation } = useConfirm({
    confirmControl: (node, settle) => decisions.attach("confirm-forget-space-memory", node, settle),
    cancelControl: (node, settle) => decisions.attach("cancel-forget-space-memory", node, settle),
    onConfirm: (event) => invokeDecision("confirm-forget-space-memory", event),
    onCancel: (event) => invokeDecision("cancel-forget-space-memory", event),
  });
  const enabledId = useId();
  const busy = pending?.scope === scope;
  const current = () => !!workspaceId && ownsWorkspace() && scope.current(snapshot);
  const assertCurrent = () => {
    if (!current()) throw new Error("This Space’s memory controls changed. Refresh before trying again.");
  };
  function report(reason: unknown) {
    if (current()) setError(errorMessage(reason));
  }
  const sourcesWithNotes = [
    ...new Set([
      ...inbox.map((note) => note.sourceRunId),
      ...claims.map((note) => note.sourceRunId),
      ...history.flatMap((revision) => revision.sourceRunIds),
      ...activity.map((entry) => entry.sourceRunId),
    ]),
  ];
  const refresh = useCallback(async () => {
    if (!scope.active || !workspaceId || bridge.privateMode || !ownsWorkspace()) return;
    const request = scope.request();
    const result = await Promise.all([
      call("memory.pipeline.policy", { workspaceId }),
      call("memory.pipeline.overview", { workspaceId }),
      call("memory.pipeline.sources", { workspaceId }),
      call("memory.pipeline.inbox", { workspaceId }),
      call("memory.pipeline.claims", { workspaceId }),
      call("memory.pipeline.history", { workspaceId }),
      call("memory.pipeline.activity", { workspaceId }),
    ]).catch((reason) => {
      if (scope.isRequest(request) && ownsWorkspace() && !bridge.privateMode) throw reason;
      return null;
    });
    if (!result || !scope.isRequest(request) || bridge.privateMode || !ownsWorkspace()) return;
    const [policy, overview, sources, inbox, claims, history, activity] = result;
    if (policy.workspaceId !== workspaceId || overview.workspaceId !== workspaceId)
      throw new Error("The Space memory response changed its original workspace.");
    const next = { enabled: policy.enabled, overview, sources, inbox, claims, history, activity };
    if (!ownsWorkspace() || !scope.publish(request, next)) return;
    setSnapshot({ scope, value: next });
    setPending(null);
    setError("");
    setSourceId((value) =>
      sources.some((source) => source.runId === value) ? value : (sources[0]?.runId ?? ""),
    );
  }, [scope, workspaceId, ownsWorkspace]);
  useEffect(() => {
    void Promise.resolve()
      .then(refresh)
      .catch((reason) => {
        if (!scope.active || bridge.privateMode || !ownsWorkspace()) return;
        setError(String(reason));
      });
  }, [scope, refresh, ownsWorkspace]);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (event.type === "workspace.memory.updated" && event.payload.workspaceId === workspaceId)
          void refresh().catch((reason) => {
            if (scope.active && !bridge.privateMode && ownsWorkspace()) setError(String(reason));
          });
      }),
    [workspaceId, scope, refresh, ownsWorkspace],
  );
  function act(work: () => Promise<unknown>) {
    assertCurrent();
    const operation = scope.begin(snapshot);
    if (!operation) return;
    setPending({ scope, operation });
    setError("");
    return guardCommandCompletion(
      (async () => {
        try {
          const result = await work();
          if (current()) await refresh();
          return result;
        } finally {
          if (scope.finish(operation)) setPending(null);
        }
      })(),
      current,
    );
  }
  function forget(request: { claimId?: string; sourceRunId?: string; all?: true }, description: string) {
    assertCurrent();
    return guardCommandCompletion(
      (async () => {
        if (
          !(await confirm({
            title: "Forget Space memory?",
            description: `${description} Notes derived from it are removed from current Memory and restorable revisions. Older Aux-managed backups will no longer restore. Copied offline recovery packages and their phrases remain usable; create a fresh package in General after Forget.`,
            confirmLabel: "Forget permanently",
            cancelLabel: "Keep memory",
            danger: true,
          }))
        )
          return;
        assertCurrent();
        return act(async () => {
          const result = await call("memory.pipeline.forget", { workspaceId, ...request });
          if (current() && (result.forgotten || result.activityRemoved)) setNeedsFreshBackup(true);
          return result;
        });
      })(),
      current,
    );
  }
  return (
    <SettingsField
      label="Space memory"
      hint="Eligible completed runs produce encrypted notes for your review. Only accepted notes appear in later runs. Memory stays local and is on by default. Sensitive pages and private chats are excluded. Pause or forget it here."
    >
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      <div hidden={!!view && view !== "configure"}>
        <label className="memory-use-toggle" htmlFor={enabledId}>
          <PipelineControl
            inputId={enabledId}
            command="toggle-space-memory-pipeline"
            scopeId={workspaceId}
            kind="checkbox"
            checked={enabled}
            disabled={!snapshot || busy || bridge.privateMode}
            onError={report}
            action={() => act(() => call("memory.pipeline.setPolicy", { workspaceId, enabled: !enabled }))}
          />
          <span>Enable memory for this Space</span>
        </label>
      </div>
      <div hidden={!!view && view !== "overview"}>
        {includePasteImport && (
          <>
            <PipelineControl
              command="toggle-space-memory-import"
              expanded={showPasteImport}
              scopeId={workspaceId}
              {...smallGhostButtonProps}
              disabled={!snapshot || bridge.privateMode}
              onError={report}
              action={() => {
                assertCurrent();
                setShowPasteImport((value) => !value);
              }}
            >
              Import pasted assistant notes
            </PipelineControl>
            {showPasteImport && <MemoryPasteImport workspaceId={workspaceId} />}
          </>
        )}
        {enabled && (
          <>
            <div {...staticRowProps}>
              <PipelineControl
                command="select-space-memory-source"
                scopeId={workspaceId}
                kind="select"
                value={sourceId}
                disabled={busy}
                onError={report}
                action={(element) => {
                  assertCurrent();
                  if (
                    !(element instanceof HTMLSelectElement) ||
                    sources.filter((source) => source.runId === element.value).length !== 1
                  )
                    throw new Error("Choose the current completed run.");
                  setSourceId(element.value);
                }}
              >
                {sources.map((source) => (
                  <option key={source.runId} value={source.runId}>
                    {source.goal} · {source.runId}
                  </option>
                ))}
              </PipelineControl>
              <PipelineControl
                command="extract-space-memory-source"
                scopeId={workspaceId}
                disabled={busy || !sourceId}
                onError={report}
                action={() => {
                  assertCurrent();
                  if (sources.filter((source) => source.runId === sourceId).length !== 1)
                    throw new Error("The completed run changed.");
                  return act(() => call("memory.pipeline.extractRun", { workspaceId, runId: sourceId }));
                }}
              >
                Create review notes
              </PipelineControl>
              <PipelineControl
                command="refresh-space-memory-pipeline"
                scopeId={workspaceId}
                disabled={busy}
                onError={report}
                action={() => act(async () => {})}
              >
                Refresh memory
              </PipelineControl>
            </div>
            {!sources.length && (
              <p {...staticHintProps}>
                No eligible completed runs are available for extraction. Sensitive, excluded, stale, or
                uncited page sources and runs using inherited Memory are omitted.
              </p>
            )}
            <p {...staticHintProps}>
              Page notes require a verified run citation and the same live document. Review the report quote
              before accepting; a changed or missing source is withheld from recall.
            </p>
            <p>
              {inbox.length} pending notes · {overview?.claimCount ?? 0} approved notes
            </p>
            {needsFreshBackup && <MemoryRecoveryNotice />}
            {inbox.map((note) => (
              <fieldset className="field" key={note.claimId}>
                <legend>Memory note review</legend>
                <p>{note.text}</p>
                <p {...staticHintProps}>
                  {note.source?.kind === "owner-paste" ? (
                    <>
                      Owner-pasted note · import {note.source.importId.slice(0, 8)} · unverified. Accepting
                      stores it as personal context; it does not verify another assistant's claim.
                    </>
                  ) : (
                    <>
                      Source run: <code>{note.sourceRunId}</code>
                      {note.source && (
                        <>
                          {" "}
                          · Exact report quote <code>{note.source.quoteSha256.slice(0, 12)}</code>
                        </>
                      )}{" "}
                      · Source must still verify when accepted
                    </>
                  )}
                </p>
                <div {...staticRowProps}>
                  <PipelineControl
                    command="accept-space-memory-note"
                    scopeId={`${workspaceId}:${note.claimId}`}
                    disabled={busy}
                    onError={report}
                    action={() =>
                      act(() =>
                        call("memory.pipeline.review", {
                          workspaceId,
                          claimId: note.claimId,
                          decision: "accept",
                        }),
                      )
                    }
                  >
                    {note.source?.kind === "owner-paste" ? "Accept as personal context" : "Accept note"}
                  </PipelineControl>
                  <PipelineControl
                    command="discard-space-memory-note"
                    scopeId={`${workspaceId}:${note.claimId}`}
                    disabled={busy}
                    onError={report}
                    action={() =>
                      act(() =>
                        call("memory.pipeline.review", {
                          workspaceId,
                          claimId: note.claimId,
                          decision: "discard",
                        }),
                      )
                    }
                  >
                    Discard note
                  </PipelineControl>
                </div>
              </fieldset>
            ))}
            <p {...staticHintProps}>Approved summary used in later runs</p>
            <MemoryDocument text={overview?.summary || "No approved notes yet."} />
            {!!sourcesWithNotes.length && (
              <div {...staticRowProps}>
                <span {...staticHintProps}>Remove notes from one source and restorable revisions.</span>
                {sourcesWithNotes.map((runId) => (
                  <PipelineControl
                    command="forget-space-memory-source"
                    scopeId={`${workspaceId}:${runId}`}
                    onError={report}
                    className="btn sm danger"
                    key={runId}
                    disabled={busy}
                    action={() =>
                      forget(
                        { sourceRunId: runId },
                        `All notes from ${runId.startsWith("paste:") ? `pasted import ${runId.slice(6, 14)}` : `run ${runId}`} will be removed from current memory and every restorable revision. This cannot be undone.`,
                      )
                    }
                  >
                    {runId.startsWith("paste:")
                      ? `Forget pasted import ${runId.slice(6, 14)}`
                      : `Forget run ${runId}`}
                  </PipelineControl>
                ))}
              </div>
            )}
            {claims.map((claim) => (
              <div className="row" key={claim.claimId}>
                <span {...auxClassGrowProps}>
                  {claim.text}{" "}
                  <span {...staticHintProps}>
                    [
                    {claim.source?.kind === "owner-paste"
                      ? `pasted import ${claim.source.importId.slice(0, 8)} · unverified`
                      : `run:${claim.sourceRunId}${claim.source ? `#${claim.source.quoteSha256.slice(0, 12)}` : ""}`}
                    ]
                  </span>
                </span>
                <PipelineControl
                  command="forget-space-memory-note"
                  scopeId={`${workspaceId}:${claim.claimId}`}
                  onError={report}
                  disabled={busy}
                  action={() =>
                    forget(
                      { claimId: claim.claimId },
                      "This note will be removed from current memory and every restorable revision. This cannot be undone.",
                    )
                  }
                >
                  Forget note
                </PipelineControl>
              </div>
            ))}
            {(activity.length > 0 ||
              claims.length > 0 ||
              inbox.length > 0 ||
              history.some((revision) => revision.claimCount > 0)) && (
              <PipelineControl
                command="forget-all-space-memory"
                scopeId={workspaceId}
                onError={report}
                className="btn sm danger"
                disabled={busy}
                action={() =>
                  forget(
                    { all: true },
                    "All pending and approved notes, extraction activity and copies in restorable revisions will be removed. This cannot be undone.",
                  )
                }
              >
                Forget all Space memory
              </PipelineControl>
            )}
          </>
        )}
      </div>
      <div hidden={!!view && view !== "history"}>
        <details open={view === "history" || historyOpen}>
          {view === "history" && <summary hidden>Memory history</summary>}
          {view !== "history" && (
            <PipelineControl
              command="toggle-space-memory-history"
              scopeId={workspaceId}
              kind="summary"
              onError={report}
              action={() => {
                assertCurrent();
                setHistoryOpen((value) => !value);
              }}
            >
              Memory history · {activity.length} extractions
            </PipelineControl>
          )}
          <div className="memory-history-views" role="group" aria-label="Memory history view">
            <button
              type="button"
              aria-pressed={historyView === "activity"}
              onClick={() => setHistoryView("activity")}
            >
              Activity
            </button>
            <button
              type="button"
              aria-pressed={historyView === "revisions"}
              onClick={() => setHistoryView("revisions")}
            >
              Recovery revisions
            </button>
          </div>
          {!snapshot && !error && <p role="status">Loading memory history…</p>}
          {snapshot && historyView === "activity" && <MemoryActivity entries={activity} />}
          {snapshot && historyView === "revisions" && (
            <MemoryHistory
              revisions={history}
              restore={(revision) => (
                <PipelineControl
                  key={revision.revisionId}
                  command="restore-space-memory-revision"
                  scopeId={`${workspaceId}:${revision.revisionId}`}
                  disabled={busy}
                  onError={report}
                  action={() =>
                    act(() =>
                      call("memory.pipeline.revert", { workspaceId, revisionId: revision.revisionId }),
                    )
                  }
                >
                  Restore this revision
                </PipelineControl>
              )}
            />
          )}
        </details>
      </div>
      {confirmation}
    </SettingsField>
  );
}
