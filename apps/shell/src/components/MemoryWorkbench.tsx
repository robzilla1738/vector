import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { MethodResult, Routine, WorkspaceMemory } from "@aux/contracts";
import type {
  MemoryDocumentRecord,
  MemoryDreamOperation,
  MemoryRecallMatch,
} from "@aux/contracts/memory-documents";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { errorMessage } from "../error-message";
import { useMemoryElementControl } from "./memory-control-construction";
import { useConfirm } from "../ui/dialog";
import "./MemoryWorkbench.css";

function MemoryAction({
  command,
  scope,
  action,
  error,
  disabled,
  children,
}: {
  command: string;
  scope: string;
  action(): unknown;
  error(reason: unknown): void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [ref, run] = useMemoryElementControl(command, scope, action, error);
  return (
    <button
      type="button"
      className="btn sm"
      ref={ref}
      data-command-id={command}
      onClick={run}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
class MemoryWorkbenchOwner {
  mounted = false;
  visible = false;
  private sequence = 0;
  readonly identities: string;
  constructor(
    readonly workspaceId: string,
    readonly windowId: typeof bridge.windowId,
  ) {
    this.identities = JSON.stringify(
      useStore
        .getState()
        .layout.spaces.filter((space) => space.workspaceId === workspaceId)
        .map((space) => space.id),
    );
  }
  activate() {
    this.mounted = true;
  }
  retire() {
    this.mounted = false;
    this.sequence++;
  }
  show(visible: boolean) {
    this.visible = visible;
  }
  request() {
    return ++this.sequence;
  }
  isRequest(sequence: number) {
    return sequence === this.sequence;
  }
}
type Draft = { documentId: string; revision: number; generation: string; text: string };
/** Every action belongs to the original Space, window and mounted Settings control. */
export function MemoryWorkbench({
  memory,
  active,
  historyOnly = false,
}: {
  memory: WorkspaceMemory;
  active: boolean;
  historyOnly?: boolean;
}) {
  return bridge.privateMode ? null : (
    <MemoryWorkbenchBody
      key={JSON.stringify([memory.workspaceId, bridge.windowId])}
      memory={memory}
      active={active}
      historyOnly={historyOnly}
    />
  );
}
function MemoryWorkbenchBody({
  memory,
  active,
  historyOnly,
}: {
  memory: WorkspaceMemory;
  active: boolean;
  historyOnly: boolean;
}) {
  const workspaceId = memory.workspaceId,
    windowId = bridge.windowId;
  const owner = useMemo(() => new MemoryWorkbenchOwner(workspaceId, windowId), [workspaceId, windowId]);
  useLayoutEffect(() => {
    owner.activate();
    return () => owner.retire();
  }, [owner]);
  useLayoutEffect(() => {
    owner.show(active);
  }, [active, owner]);
  const current = useCallback(() => {
    const layout = useStore.getState().layout;
    const identities = JSON.stringify(
      layout.spaces.filter((space) => space.workspaceId === workspaceId).map((space) => space.id),
    );
    return (
      owner.mounted &&
      owner.visible &&
      !bridge.privateMode &&
      bridge.windowId === windowId &&
      owner.identities !== "[]" &&
      identities === owner.identities
    );
  }, [workspaceId, windowId, owner]);
  const assertCurrent = () => {
    if (!current()) throw new Error("Choose the current Memory control in its original Space.");
  };
  const [generation, setGeneration] = useState<string | null>(null);
  const [documents, setDocuments] = useState<MemoryDocumentRecord[]>([]);
  const [status, setStatus] = useState<MethodResult<"memory.pipeline.dreamStatus"> | null>(null);
  const [operations, setOperations] = useState<MemoryDreamOperation[]>([]);
  const [nextActivity, setNextActivity] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [kind, setKind] = useState<"site" | "routine">("site"),
    [origin, setOrigin] = useState(""),
    [routineId, setRoutineId] = useState("");
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [domain, setDomain] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const [matches, setMatches] = useState<MethodResult<"memory.pipeline.recall"> | null>(null);
  const [source, setSource] = useState<MethodResult<"memory.pipeline.readSource"> | null>(null);
  const { confirm, confirmation } = useConfirm();
  const report = useCallback(
    (reason: unknown) => {
      if (current()) setError(errorMessage(reason));
    },
    [current],
  );
  const refresh = useCallback(async () => {
    if (!current()) return;
    const request = owner.request();
    const [files, dream, activity, routines] = await Promise.all([
      call("memory.pipeline.documentList", { workspaceId }),
      call("memory.pipeline.dreamStatus", { workspaceId }),
      call("memory.pipeline.dreamActivity", { workspaceId, limit: 50 }),
      call("routines.list", { workspaceId, status: "ready", limit: 200, includeArchived: false }),
    ]);
    if (!current() || !owner.isRequest(request)) return;
    setGeneration(files.generation);
    setDocuments(files.documents);
    setStatus(dream);
    setOperations(activity.entries);
    setNextActivity(activity.nextCursor);
    setRoutines(
      routines.filter((routine) => !routine.activationReview && !routine.archivedAt && !routine.paused),
    );
    setDraft((draft) =>
      draft && files.documents.some((document) => document.documentId === draft.documentId) ? draft : null,
    );
    // Never retain source-derived search output after Forget or a source update.
    setMatches(null);
    setSource(null);
  }, [workspaceId, current, owner]);
  useEffect(() => {
    if (!active) return;
    void Promise.resolve().then(refresh).catch(report);
    const retire = bridge.onEvent((event) => {
      if (event.type === "workspace.memory.updated" && event.payload.workspaceId === workspaceId)
        void refresh().catch(report);
    });
    return retire;
  }, [active, refresh, workspaceId, report]);
  const activeDream = status?.active?.operationId;
  useEffect(() => {
    if (!active || (!activeDream && busy !== "dream")) return;
    const timer = window.setInterval(() => {
      void refresh().catch(report);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [active, activeDream, busy, refresh, report]);
  const perform = async (name: string, action: () => Promise<unknown>, reload = true) => {
    assertCurrent();
    setBusy(name);
    setError("");
    try {
      await action();
      if (current() && reload) await refresh();
    } catch (reason) {
      report(reason);
    } finally {
      if (current()) setBusy("");
    }
  };
  const document = documents.find((document) => document.documentId === selected);
  const stale = !!draft && (draft.generation !== generation || draft.revision !== document?.revision);
  const selectDocument = (document: MemoryDocumentRecord) => {
    assertCurrent();
    setSelected(document.documentId);
    setDraft({
      documentId: document.documentId,
      revision: document.revision,
      generation: generation!,
      text: document.content,
    });
  };
  const search = (more = false) =>
    perform(
      "search",
      async () => {
        const result = await call("memory.pipeline.recall", {
          workspaceId,
          queries: query
            .split("\n")
            .map((query) => query.trim())
            .filter(Boolean)
            .slice(0, 8),
          domains: domain.trim()
            ? domain
                .split(",")
                .map((domain) => domain.trim())
                .filter(Boolean)
            : undefined,
          from: from ? Date.parse(`${from}T00:00:00Z`) : undefined,
          to: to ? Date.parse(`${to}T23:59:59.999Z`) : undefined,
          cursor: more ? (matches?.nextCursor ?? undefined) : undefined,
          limit: 20,
          mode: "auto",
        });
        if (current()) {
          setMatches((previous) =>
            more && previous ? { ...result, matches: [...previous.matches, ...result.matches] } : result,
          );
          setSource(null);
        }
      },
      false,
    );
  const readSource = (match: Pick<MemoryRecallMatch, "sourceId" | "revision" | "sha256">, startLine = 1) =>
    perform(
      "read",
      async () => {
        const result = await call("memory.pipeline.readSource", {
          workspaceId,
          sourceId: match.sourceId,
          revision: match.revision,
          sha256: match.sha256,
          startLine,
          limitLines: 100,
        });
        if (current()) setSource(result);
      },
      false,
    );
  const action = (
    command: string,
    scope: string,
    invoke: () => unknown,
    label: ReactNode,
    disabled = false,
  ) => (
    <MemoryAction
      command={command}
      scope={`${workspaceId}:${scope}`}
      action={() => {
        assertCurrent();
        return invoke();
      }}
      error={report}
      disabled={disabled}
    >
      {label}
    </MemoryAction>
  );
  if (!active) return null;
  return (
    <section className="memory-workbench" aria-label="Memory documents, Dream and source search">
      {confirmation}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <header>
        <div>
          <h3>Dream</h3>
          <p className="hint">
            Consolidates the last 14 days of eligible completed work. Owner-written documents remain
            reviewable proposals.
          </p>
        </div>
        <div className="memory-workbench-actions">
          {action(
            "refresh-memory-workbench",
            "refresh",
            () => refresh(),
            "Refresh",
            !!busy && busy !== "dream",
          )}
          {action(
            "run-memory-dream",
            "dream",
            () => perform("dream", () => call("memory.pipeline.dream", { workspaceId })),
            "Dream now",
            memory.enabled === false || !!busy || !!status?.active,
          )}
          {status?.active &&
            action(
              "cancel-memory-dream",
              status.active.operationId,
              () =>
                perform("cancel", () =>
                  call("memory.pipeline.dreamCancel", {
                    workspaceId,
                    operationId: status.active!.operationId,
                  }),
                ),
              "Cancel Dream",
              busy === "cancel",
            )}
        </div>
      </header>
      <output aria-live="polite" className="hint">
        {status?.active || busy === "dream"
          ? "Dream is running…"
          : status
            ? `${status.eligibleSessions} eligible completed sessions since ${status.lastRunAt ? new Date(status.lastRunAt).toLocaleString() : "Memory began"}. Automatic Dream runs while idle after 24 hours or five sessions.`
            : "Loading Dream status…"}
      </output>
      <div className="memory-dream-activity" role="region" aria-label="Dream activity">
        {!operations.length && <p className="hint">No Dream activity yet.</p>}
        {operations.map((operation) => (
          <details key={operation.operationId} className="memory-dream-card">
            <summary>
              <strong>
                {operation.status === "running" && status?.active?.operationId !== operation.operationId
                  ? "Interrupted"
                  : operation.status}
              </strong>
              <span>
                {new Date(operation.startedAt).toLocaleString()} ·{" "}
                {operation.trigger === "idle" ? "Automatic" : "Manual"} · {Math.round(operation.durationMs)}{" "}
                ms
              </span>
            </summary>
            <dl className="memory-dream-metadata">
              <dt>Model</dt>
              <dd>{operation.modelId ?? "No model request"}</dd>
              <dt>Input / output tokens</dt>
              <dd>
                {operation.inputTokens ?? "Unknown"} / {operation.outputTokens ?? "Unknown"}
              </dd>
              <dt>Cached input</dt>
              <dd>{operation.cachedInputTokens ?? "Unknown"}</dd>
              <dt>Cost</dt>
              <dd>
                {operation.costUsd === undefined
                  ? "Unknown"
                  : `${operation.costEstimated ? "Estimated " : ""}$${operation.costUsd.toFixed(6)}`}
              </dd>
            </dl>
            {operation.errorCode && (
              <output>
                Dream stopped: {operation.errorCode.replaceAll("_", " ")}. No generated change was published.
              </output>
            )}
            {operation.changes.map((change) => (
              <section
                key={change.changeId}
                aria-label={`Change to ${change.path}`}
                className="memory-dream-change"
              >
                <header>
                  <strong>{change.path}</strong>
                  <span>{change.state}</span>
                </header>
                <div className="memory-dream-diff">
                  <div>
                    <h5>Before</h5>
                    <pre>{change.before ?? "New document"}</pre>
                  </div>
                  <div>
                    <h5>After</h5>
                    <pre>{change.after}</pre>
                  </div>
                </div>
                <p className="hint">{change.sourceRefs.length} source notes support this change.</p>
                <div className="memory-workbench-actions">
                  {change.documentId &&
                    action(
                      "open-memory-dream-document",
                      change.changeId,
                      () => {
                        const document = documents.find(
                          (document) => document.documentId === change.documentId,
                        );
                        if (!document) throw new Error("This document is no longer available.");
                        selectDocument(document);
                      },
                      "Open",
                      !documents.some((document) => document.documentId === change.documentId),
                    )}
                  {change.state === "pending" && (
                    <>
                      {action(
                        "accept-memory-dream-change",
                        change.changeId,
                        () =>
                          perform("review", () =>
                            call("memory.pipeline.dreamReview", {
                              workspaceId,
                              operationId: operation.operationId,
                              changeId: change.changeId,
                              decision: "accept",
                              expectedGeneration: generation!,
                              expectedOwnerRevision: memory.revision,
                            }),
                          ),
                        "Accept proposal",
                        !!busy || !generation,
                      )}
                      {action(
                        "reject-memory-dream-change",
                        change.changeId,
                        () =>
                          perform("review", () =>
                            call("memory.pipeline.dreamReview", {
                              workspaceId,
                              operationId: operation.operationId,
                              changeId: change.changeId,
                              decision: "reject",
                              expectedGeneration: generation!,
                            }),
                          ),
                        "Reject",
                        !!busy || !generation,
                      )}
                    </>
                  )}
                </div>
              </section>
            ))}
            {operation.changes.some((change) => ["applied", "accepted"].includes(change.state)) &&
              action(
                "revert-memory-dream",
                operation.operationId,
                () =>
                  perform("revert", async () => {
                    if (
                      !(await confirm({
                        title: "Revert Dream changes?",
                        description:
                          "Revert only the exact resulting document revisions. Later edits are preserved and will prevent restoration.",
                        confirmLabel: "Revert changes",
                      }))
                    )
                      return;
                    assertCurrent();
                    await call("memory.pipeline.dreamRevert", {
                      workspaceId,
                      operationId: operation.operationId,
                      expectedGeneration: generation!,
                    });
                  }),
                "Revert changes",
                !!busy || !generation,
              )}
          </details>
        ))}
        {nextActivity &&
          action(
            "more-memory-dream-activity",
            nextActivity,
            () =>
              perform(
                "more",
                async () => {
                  const result = await call("memory.pipeline.dreamActivity", {
                    workspaceId,
                    cursor: nextActivity,
                    limit: 50,
                  });
                  if (current()) {
                    setOperations((previous) => [...previous, ...result.entries]);
                    setNextActivity(result.nextCursor);
                  }
                },
                false,
              ),
            "Load 50 more",
            !!busy,
          )}
      </div>
      {!historyOnly && (
        <>
          <h3>Site and routine documents</h3>
          <p className="hint">
            Saved website guidance and activated routine knowledge belong to this Space. Saving generated
            content makes it owner-written.
          </p>
          <div className="memory-workbench-create">
            <label>
              Document kind
              <select value={kind} onChange={(event) => setKind(event.target.value as "site" | "routine")}>
                <option value="site">Website</option>
                <option value="routine">Routine</option>
              </select>
            </label>
            {kind === "site" ? (
              <label>
                Website origin
                <input
                  value={origin}
                  placeholder="https://example.com"
                  onChange={(event) => setOrigin(event.target.value)}
                />
              </label>
            ) : (
              <label>
                Activated routine
                <select value={routineId} onChange={(event) => setRoutineId(event.target.value)}>
                  <option value="">Choose a routine</option>
                  {routines.map((routine) => (
                    <option key={routine.routineId} value={routine.routineId}>
                      {routine.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {action(
              "create-memory-source-document",
              "create",
              () =>
                perform("create", async () => {
                  const result = await call("memory.pipeline.documentSet", {
                    workspaceId,
                    expectedGeneration: generation,
                    target: kind === "site" ? { kind: "site", origin } : { kind: "routine", routineId },
                    content: "",
                  });
                  if (current() && result.document) {
                    setSelected(result.document.documentId);
                    setDraft({
                      documentId: result.document.documentId,
                      revision: result.document.revision,
                      generation: result.generation,
                      text: result.document.content,
                    });
                  }
                }),
              "Create document",
              !!busy || (kind === "site" ? !origin : !routineId),
            )}
          </div>
          <div className="memory-workbench-documents">
            <nav aria-label="Site and routine Memory documents">
              {!documents.length && <p className="hint">No site or routine documents yet.</p>}
              {documents.map((document) => (
                <MemoryAction
                  key={document.documentId}
                  command="select-memory-source-document"
                  scope={`${workspaceId}:${document.documentId}`}
                  action={() => selectDocument(document)}
                  error={report}
                >
                  <span title={document.path}>{document.path}</span>
                </MemoryAction>
              ))}
            </nav>
            {document && (
              <section aria-label={`Edit ${document.path}`}>
                <header>
                  <h4>{document.path}</h4>
                  <span className="hint">
                    {document.authoredBy} · revision {document.revision}
                  </span>
                </header>
                <label>
                  Document content
                  <textarea
                    value={draft?.documentId === document.documentId ? draft.text : document.content}
                    rows={12}
                    onChange={(event) => {
                      const text = event.currentTarget.value;
                      setDraft((previous) => ({
                        documentId: document.documentId,
                        revision: previous?.revision ?? document.revision,
                        generation: previous?.generation ?? generation!,
                        text,
                      }));
                    }}
                  />
                </label>
                {stale && (
                  <p role="alert">
                    Memory changed. Select this document again to load its current revision before saving.
                  </p>
                )}
                <div className="memory-workbench-actions">
                  {action(
                    "save-memory-source-document",
                    document.documentId,
                    () =>
                      perform("save", async () => {
                        const result = await call("memory.pipeline.documentSet", {
                          workspaceId,
                          documentId: document.documentId,
                          target: document.target,
                          expectedGeneration: draft!.generation,
                          expectedRevision: draft!.revision,
                          content: draft!.text,
                        });
                        if (current() && result.document)
                          setDraft({
                            documentId: result.document.documentId,
                            revision: result.document.revision,
                            generation: result.generation,
                            text: result.document.content,
                          });
                      }),
                    "Save document",
                    !!busy || !draft || stale || draft.text === document.content,
                  )}
                  {action(
                    "delete-memory-source-document",
                    document.documentId,
                    () =>
                      perform("delete", async () => {
                        if (
                          !(await confirm({
                            title: "Delete Memory document?",
                            description: `Delete ${document.path} and its retained generated drafts.`,
                            confirmLabel: "Delete document",
                            danger: true,
                          }))
                        )
                          return;
                        assertCurrent();
                        await call("memory.pipeline.documentSet", {
                          workspaceId,
                          documentId: document.documentId,
                          target: document.target,
                          expectedGeneration: generation,
                          expectedRevision: document.revision,
                          content: null,
                        });
                      }),
                    "Delete",
                    !!busy,
                  )}
                </div>
              </section>
            )}
          </div>
          <h3>Search Memory sources</h3>
          <p className="hint">
            Search owner documents, saved notes, site and routine documents, eligible saved pages and history
            metadata. Local embeddings are used when available; keyword fallback is labeled. Page intake is
            bounded to the newest 8 MB of eligible saved text.
          </p>
          <label>
            Queries (one per line, up to eight)
            <textarea value={query} rows={2} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="memory-workbench-create">
            <label>
              Domains
              <input
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="example.com, example.org"
              />
            </label>
            <label>
              From
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </label>
            {action(
              "search-memory-sources",
              "search",
              () => search(),
              "Search",
              !!busy || query.trim().length < 2 || memory.enabled === false,
            )}
          </div>
          {matches && (
            <section aria-label="Memory search results">
              <output>
                {matches.total} matches · {matches.mode}
                {matches.modelId ? ` · ${matches.modelId}` : ""}. {matches.fallbackReason}
              </output>
              {matches.matches.map((match) => (
                <article key={match.chunkId}>
                  <header>
                    <strong>{match.title}</strong>
                    <span className="hint">
                      {match.heading} · lines {match.startLine}–{match.endLine}
                    </span>
                  </header>
                  <p>{match.text}</p>
                  {action(
                    "read-memory-source-result",
                    match.chunkId,
                    () => readSource(match, match.startLine),
                    "Read source",
                    !!busy,
                  )}
                </article>
              ))}
              {matches.nextCursor &&
                action(
                  "more-memory-source-results",
                  matches.nextCursor,
                  () => search(true),
                  "Load more matches",
                  !!busy,
                )}
            </section>
          )}
          {source && (
            <section aria-label="Memory source text">
              <h4>{source.title}</h4>
              <p className="hint">
                {source.path} · revision {source.revision} · lines {source.startLine}–{source.endLine}
              </p>
              <pre className="memory-source-lines">{source.text}</pre>
              {source.nextLine &&
                action(
                  "read-memory-source-result",
                  `${source.sourceId}:${source.nextLine}`,
                  () => readSource(source, source.nextLine!),
                  "Next source lines",
                  !!busy,
                )}
            </section>
          )}
        </>
      )}
    </section>
  );
}
