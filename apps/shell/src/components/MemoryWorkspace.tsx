import type { MemoryDocumentExtension } from "./MemoryDocumentBrowser";
import { MemoryExtractionDetail } from "./MemoryActivity";
import { MemoryDocument } from "./MemoryDocument";
import { MemoryRestoreControl } from "./MemoryRestoreControl";
import {
  shellIconFolder,
  shellIconFolderClosed,
  shellIconResult,
  shellIconSearch,
  shellIconPlus,
} from "../ui/icons";
import { moveListFocus } from "../keyboard-list";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { MethodResult, Routine, WorkspaceMemory, MemoryClaimDocuments } from "@aux/contracts";
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
import "./MemoryWorkspace.css";

function MemoryAction({
  command,
  scope,
  action,
  error,
  disabled,
  tree,
  children,
}: {
  command: string;
  scope: string;
  action(): unknown;
  error(reason: unknown): void;
  disabled?: boolean;
  tree?: { level: number; selected: boolean; tabIndex: number; onFocus(): void };
  children: ReactNode;
}) {
  const [ref, run] = useMemoryElementControl(command, scope, action, error);
  return (
    <button
      type="button"
      className={tree ? "memory-source-tree-item" : "btn sm"}
      role={tree ? "treeitem" : undefined}
      aria-level={tree?.level}
      aria-selected={tree?.selected}
      aria-current={tree?.selected ? "page" : undefined}
      tabIndex={tree?.tabIndex}
      onFocus={tree?.onFocus}
      ref={ref}
      data-command-id={command}
      onClick={run}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
class MemoryWorkspaceOwner {
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
export function MemoryWorkspace({
  memory,
  active,
  historyOnly = false,
  children,
  scopeControl,
  onOpenOwnerDocument,
}: {
  memory: WorkspaceMemory;
  active: boolean;
  historyOnly?: boolean;
  children?: (extension: MemoryDocumentExtension) => ReactNode;
  scopeControl?: ReactNode;
  onOpenOwnerDocument?(path: "MEMORY.md" | "USER.md" | "TAXONOMY.md"): void;
}) {
  return bridge.privateMode ? null : (
    <MemoryWorkspaceBody
      key={JSON.stringify([memory.workspaceId, bridge.windowId])}
      memory={memory}
      active={active}
      historyOnly={historyOnly}
      scopeControl={scopeControl}
      onOpenOwnerDocument={onOpenOwnerDocument}
    >
      {children}
    </MemoryWorkspaceBody>
  );
}
function MemoryWorkspaceBody({
  memory,
  active,
  historyOnly,
  children,
  scopeControl,
  onOpenOwnerDocument,
}: {
  memory: WorkspaceMemory;
  active: boolean;
  historyOnly: boolean;
  children?: (extension: MemoryDocumentExtension) => ReactNode;
  scopeControl?: ReactNode;
  onOpenOwnerDocument?(path: "MEMORY.md" | "USER.md" | "TAXONOMY.md"): void;
}) {
  const workspaceId = memory.workspaceId,
    windowId = bridge.windowId;
  const owner = useMemo(() => new MemoryWorkspaceOwner(workspaceId, windowId), [workspaceId, windowId]);
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
  const [claimDocuments, setClaimDocuments] = useState<MemoryClaimDocuments | null>(null);
  const [status, setStatus] = useState<MethodResult<"memory.pipeline.dreamStatus"> | null>(null);
  const [operations, setOperations] = useState<MemoryDreamOperation[]>([]);
  const [nextActivity, setNextActivity] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState(false);
  const [view, setView] = useState<"document" | "new" | "search" | null>(null);
  const [folders, setFolders] = useState({ site: true, routine: true });
  const [activity, setActivity] = useState<MethodResult<"memory.pipeline.activity">>([]);
  const [revisions, setRevisions] = useState<MethodResult<"memory.pipeline.history">>([]);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [activityMode, setActivityMode] = useState<"activity" | "recovery">("activity");
  const [visibleActivity, setVisibleActivity] = useState(50);
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
    const [files, dream, dreams, routines, extraction, recovery, claims] = await Promise.all([
      call("memory.pipeline.documentList", { workspaceId }),
      call("memory.pipeline.dreamStatus", { workspaceId }),
      call("memory.pipeline.dreamActivity", { workspaceId, limit: 50 }),
      call("routines.list", { workspaceId, status: "ready", limit: 200, includeArchived: false }),
      historyOnly ? call("memory.pipeline.activity", { workspaceId }) : Promise.resolve([]),
      historyOnly ? call("memory.pipeline.history", { workspaceId }) : Promise.resolve([]),
      call("memory.pipeline.documents", { workspaceId }),
    ]);
    if (!current() || !owner.isRequest(request)) return;
    setGeneration(files.generation);
    setClaimDocuments(claims);
    setDocuments(files.documents);
    setStatus(dream);
    setOperations(dreams.entries);
    setNextActivity(dreams.nextCursor);
    setActivity(extraction);
    setRevisions(recovery);
    setRoutines(
      routines.filter((routine) => !routine.activationReview && !routine.archivedAt && !routine.paused),
    );
    setDraft((draft) =>
      draft && files.documents.some((document) => document.documentId === draft.documentId) ? draft : null,
    );
    // Never retain source-derived search output after Forget or a source update.
    setMatches(null);
    setSource(null);
  }, [workspaceId, current, owner, historyOnly]);
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
    setEditingDocument(false);
    setView("document");
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
        const request = owner.request();
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
        if (current() && owner.isRequest(request)) {
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
        const request = owner.request();
        const result = await call("memory.pipeline.readSource", {
          workspaceId,
          sourceId: match.sourceId,
          revision: match.revision,
          sha256: match.sha256,
          startLine,
          limitLines: 100,
        });
        if (current() && owner.isRequest(request)) setSource(result);
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
  const controls = (
    <>
      {confirmation}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </>
  );
  const documentActions = document && (
    <div className="memory-workspace-actions">
      {!editingDocument && (
        <button
          type="button"
          className="btn sm memory-document-edit"
          onClick={() => {
            assertCurrent();
            setEditingDocument(true);
          }}
        >
          Edit
        </button>
      )}
      {editingDocument && (
        <button
          type="button"
          className="btn sm"
          disabled={!!busy}
          onClick={() => {
            assertCurrent();
            setEditingDocument(false);
            setDraft({
              documentId: document.documentId,
              revision: document.revision,
              generation: generation!,
              text: document.content,
            });
          }}
        >
          Cancel
        </button>
      )}
      {editingDocument &&
        action(
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
              if (current() && result.document) {
                setEditingDocument(false);
                setDraft({
                  documentId: result.document.documentId,
                  revision: result.document.revision,
                  generation: result.generation,
                  text: result.document.content,
                });
              }
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
  );
  const documentPane = (
    <>
      {document && !historyOnly && (
        <header>
          <span className="memory-document-breadcrumb">{document.path.replaceAll("/", " › ")}</span>
          <time dateTime={new Date(document.updatedAt).toISOString()}>
            {new Date(document.updatedAt).toLocaleString()}
          </time>
          {documentActions}
        </header>
      )}
      <div className="memory-document-body memory-workspace-content">
        {document && (
          <section aria-label={`Edit ${document.path}`}>
            <p className="hint">
              {document.authoredBy} · revision {document.revision}
            </p>
            <p className="hint">
              Saving makes this owner-written. Generated synthesis and original source quotes remain separate.
            </p>
            {!!document.sourceRefs.length && (
              <details className="memory-source-quote">
                <summary>Original source quotes · {document.sourceRefs.length}</summary>
                {document.sourceRefs.map((reference) => {
                  const original =
                    claimDocuments?.generation === generation
                      ? claimDocuments.documents.find((entry) => entry.claim.claimId === reference.claimId)
                      : undefined;
                  return (
                    <section key={reference.claimId}>
                      <small>{reference.sourceRunId}</small>
                      {original?.claim.source?.quote ? (
                        <blockquote>{original.claim.source.quote}</blockquote>
                      ) : (
                        <p>Original source is unavailable or no longer eligible.</p>
                      )}
                    </section>
                  );
                })}
              </details>
            )}
            {!editingDocument && (
              <MemoryDocument text={document.content || "No saved content. Choose Edit to add guidance."} />
            )}
            {editingDocument && (
              <label>
                Document content
                <textarea
                  disabled={!!busy}
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
            )}
            {stale && (
              <p role="alert">
                Memory changed. Select this document again to load its current revision before saving.
              </p>
            )}
          </section>
        )}
      </div>
    </>
  );
  const createPane = (
    <div className="memory-document-body memory-workspace-content">
      <h3>Site and routine documents</h3>
      <p className="hint">
        Saved website guidance and activated routine knowledge belong to this Space. Saving generated content
        makes it owner-written.
      </p>
      <div className="memory-workspace-create">
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
                setView("document");
                setEditingDocument(true);
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
    </div>
  );
  const searchPane = (
    <div className="memory-document-body memory-workspace-content">
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
      <div className="memory-workspace-create">
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
    </div>
  );
  const extension: MemoryDocumentExtension = {
    controls,
    keys: [
      "site",
      "routine",
      "new-source-document",
      "memory-source-search",
      ...documents.map((document) => document.documentId),
    ],
    selected: view !== null,
    label:
      view === "document"
        ? (document?.path ?? "Memory document unavailable")
        : view === "new"
          ? "Create Memory document"
          : "Search Memory sources",
    onSelectInternal: () => setView(null),
    setFolderOpen: (key, open) => {
      if (key === "site" || key === "routine") setFolders((previous) => ({ ...previous, [key]: open }));
    },
    pane: view === "document" ? documentPane : view === "new" ? createPane : searchPane,
    navigation: ({ focused, onFocus }) => (
      <>
        {(["site", "routine"] as const).map((kind) => (
          <details
            key={kind}
            role="none"
            className="memory-document-folder"
            open={folders[kind]}
            onToggle={(event) => {
              const open = event.currentTarget.open;
              setFolders((previous) => (previous[kind] === open ? previous : { ...previous, [kind]: open }));
            }}
          >
            <summary
              role="treeitem"
              aria-level={1}
              aria-expanded={folders[kind]}
              data-memory-folder={kind}
              tabIndex={focused === kind ? 0 : -1}
              onFocus={() => onFocus(kind)}
            >
              {folders[kind] ? shellIconFolder : shellIconFolderClosed}
              <span>{kind === "site" ? "sites" : "routines"}</span>
            </summary>
            <div role="group">
              {documents
                .filter((document) => document.target.kind === kind)
                .map((document) => (
                  <MemoryAction
                    key={document.documentId}
                    command="select-memory-source-document"
                    scope={`${workspaceId}:${document.documentId}`}
                    action={() => selectDocument(document)}
                    error={report}
                    tree={{
                      level: 2,
                      selected: view === "document" && selected === document.documentId,
                      tabIndex: focused === document.documentId ? 0 : -1,
                      onFocus: () => onFocus(document.documentId),
                    }}
                  >
                    {shellIconResult}
                    <span title={document.path}>
                      {document.path.split("/").at(-1)}
                      {draft?.documentId === document.documentId && draft.text !== document.content
                        ? " •"
                        : ""}
                    </span>
                  </MemoryAction>
                ))}
              {!documents.some((document) => document.target.kind === kind) && (
                <span className="hint">No {kind === "site" ? "website" : "routine"} documents yet.</span>
              )}
            </div>
          </details>
        ))}
        <button
          type="button"
          role="treeitem"
          aria-level={1}
          aria-selected={view === "new"}
          tabIndex={focused === "new-source-document" ? 0 : -1}
          onFocus={() => onFocus("new-source-document")}
          onClick={() => {
            assertCurrent();
            setView("new");
          }}
        >
          {shellIconPlus}
          <span>New site or routine document</span>
        </button>
        <button
          type="button"
          role="treeitem"
          aria-level={1}
          aria-selected={view === "search"}
          tabIndex={focused === "memory-source-search" ? 0 : -1}
          onFocus={() => onFocus("memory-source-search")}
          onClick={() => {
            assertCurrent();
            setView("search");
          }}
        >
          {shellIconSearch}
          <span>Search sources</span>
        </button>
      </>
    ),
  };
  if (!historyOnly) return children?.(extension) ?? null;
  const entries = [
    ...operations.map((operation) => ({
      key: `dream:${operation.operationId}`,
      at: operation.startedAt,
      label: operation.trigger === "idle" ? "Automatic Dream" : "Dreamed semantic Memory",
      detail: `${operation.changes.length} files · ${operation.durationMs} ms`,
      operation,
      extraction: undefined,
      revision: undefined,
    })),
    ...activity.map((extraction) => ({
      key: `extraction:${extraction.activityId}`,
      at: extraction.capturedAt,
      label: extraction.title,
      detail: `${extraction.candidateIds.length} notes · ${extraction.durationMs} ms`,
      extraction,
      operation: undefined,
      revision: undefined,
    })),
  ].sort((a, b) => b.at - a.at || a.key.localeCompare(b.key));
  const recoveryEntries = revisions.map((revision) => ({
    key: `revision:${revision.revisionId}`,
    at: revision.capturedAt,
    label: "Memory recovery revision",
    detail: `${revision.claimCount} notes`,
    revision,
    operation: undefined,
    extraction: undefined,
  }));
  const list = activityMode === "recovery" ? recoveryEntries : entries;
  const selectedActivity = list.find((entry) => entry.key === activityId) ?? list[0];
  const operation = selectedActivity?.operation;
  const detail =
    view === "document" ? (
      documentPane
    ) : operation ? (
      <section aria-label="Selected Dream operation" className="memory-workspace-content">
        <dl className="memory-dream-metadata">
          <dt>Trigger</dt>
          <dd>{operation.trigger === "idle" ? "Automatic consolidation" : "Dream now"}</dd>
          <dt>Status</dt>
          <dd>
            {operation.status === "running" && status?.active?.operationId !== operation.operationId
              ? "Interrupted"
              : operation.status}
          </dd>
          <dt>Duration</dt>
          <dd>
            {operation.durationMs < 1000
              ? `${Math.round(operation.durationMs)} ms`
              : `${(operation.durationMs / 1000).toFixed(1)} s`}
          </dd>
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
            {operation.errorCode === "account_requires_window"
              ? "Background Memory supports API keys, local models, Vercel and ChatGPT connections. Copilot and private connections are unavailable for background Memory. Choose another connection to continue."
              : `Dream stopped: ${operation.errorCode.replaceAll("_", " ")}. No generated change was published.`}
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
            <div className="memory-workspace-actions">
              {change.ownerPath &&
                action(
                  "open-memory-dream-document",
                  change.changeId,
                  () => {
                    if (
                      !onOpenOwnerDocument ||
                      (change.ownerPath !== "MEMORY.md" &&
                        !memory.documents?.some((document) => document.path === change.ownerPath))
                    )
                      throw new Error("This owner document is no longer available.");
                    onOpenOwnerDocument(change.ownerPath!);
                  },
                  "Open",
                  !onOpenOwnerDocument ||
                    (change.ownerPath !== "MEMORY.md" &&
                      !memory.documents?.some((document) => document.path === change.ownerPath)),
                )}
              {change.documentId &&
                action(
                  "open-memory-dream-document",
                  change.changeId,
                  () => {
                    const document = documents.find((document) => document.documentId === change.documentId);
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

        {!operation.changes.length && (
          <p className="memory-activity-outcome">
            {operation.status === "failed"
              ? "Dream stopped without publishing a change."
              : operation.status === "running"
                ? "Dream is still running."
                : "No file changes recorded."}
          </p>
        )}
      </section>
    ) : selectedActivity?.extraction ? (
      <MemoryExtractionDetail
        selected={selectedActivity.extraction}
        retry={(entry) =>
          action(
            "extract-space-memory-source",
            entry.activityId,
            () =>
              perform("extract", () =>
                call("memory.pipeline.extractRun", { workspaceId, runId: entry.sourceRunId }),
              ),
            "Try again",
            !!busy || memory.enabled === false,
          )
        }
      />
    ) : selectedActivity?.revision ? (
      <section className="memory-workspace-content">
        <h3>Recovery revision</h3>
        <MemoryRestoreControl
          workspaceId={workspaceId}
          revisionId={selectedActivity.revision.revisionId}
          disabled={!!busy}
          current={current}
          restore={(preview) =>
            perform("restore", () =>
              call("memory.pipeline.revert", {
                workspaceId,
                revisionId: selectedActivity.revision!.revisionId,
                expectedGeneration: preview.expectedGeneration,
              }),
            )
          }
        />
        <MemoryDocument text={selectedActivity.revision.summary || "No approved notes."} />
      </section>
    ) : (
      <p className="hint memory-workspace-content">No Memory activity yet.</p>
    );
  return (
    <section className="memory-activity-workspace" aria-label="Memory activity">
      <nav
        className="memory-history-list"
        aria-label="Memory activity records"
        onKeyDown={(event) => moveListFocus(event, "button[data-activity]")}
      >
        {controls}
        {scopeControl}
        <div className="memory-history-views" role="group" aria-label="Memory activity view">
          <button
            type="button"
            aria-pressed={activityMode === "activity"}
            onClick={() => {
              setActivityMode("activity");
              setView(null);
              setVisibleActivity(50);
            }}
          >
            Activity
          </button>
          <button
            type="button"
            aria-pressed={activityMode === "recovery"}
            onClick={() => {
              setActivityMode("recovery");
              setView(null);
              setVisibleActivity(50);
            }}
          >
            Recovery
          </button>
        </div>
        {list.slice(0, visibleActivity).map((entry, index) => (
          <div key={entry.key}>
            {(index === 0 ||
              new Date(list[index - 1]!.at).toLocaleDateString() !==
                new Date(entry.at).toLocaleDateString()) && (
              <h4 className="memory-activity-date">
                {new Date(entry.at).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </h4>
            )}
            <button
              type="button"
              data-activity
              aria-current={entry.key === selectedActivity?.key ? "true" : undefined}
              onClick={() => {
                assertCurrent();
                setActivityId(entry.key);
                setView(null);
              }}
            >
              <strong className="memory-activity-title">{entry.label}</strong>
              <span>{entry.detail}</span>
            </button>
          </div>
        ))}
        {(visibleActivity < list.length || (activityMode === "activity" && nextActivity)) &&
          action(
            "more-memory-dream-activity",
            nextActivity ?? `visible:${visibleActivity}`,
            () =>
              perform(
                "more",
                async () => {
                  const request = owner.request();
                  if (visibleActivity >= list.length && nextActivity) {
                    const result = await call("memory.pipeline.dreamActivity", {
                      workspaceId,
                      cursor: nextActivity,
                      limit: 50,
                    });
                    if (current() && owner.isRequest(request) && result.generation === generation) {
                      setOperations((previous) => [
                        ...new Map(
                          [...previous, ...result.entries].map((operation) => [
                            operation.operationId,
                            operation,
                          ]),
                        ).values(),
                      ]);
                      setNextActivity(result.nextCursor);
                    }
                  }
                  if (current() && owner.isRequest(request)) setVisibleActivity((previous) => previous + 50);
                },
                false,
              ),
            "Load 50 more",
            !!busy,
          )}
      </nav>
      <section className="memory-activity-pane" aria-label="Selected Memory activity">
        <header>
          <span className="memory-document-breadcrumb">
            {view === "document" ? document?.path : (selectedActivity?.label ?? "Memory history")}
          </span>
          {(view === "document" ? document : selectedActivity) && (
            <time
              dateTime={new Date(
                view === "document" ? document!.updatedAt : selectedActivity!.at,
              ).toISOString()}
            >
              {new Date(view === "document" ? document!.updatedAt : selectedActivity!.at).toLocaleString()}
            </time>
          )}
          {view === "document" ? (
            <div className="memory-workspace-actions">
              <button type="button" className="btn sm" onClick={() => setView(null)}>
                Back to activity
              </button>
              {documentActions}
            </div>
          ) : (
            <div className="memory-workspace-actions">
              {action(
                "refresh-memory-workspace",
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
          )}
        </header>
        {detail}
        <output aria-live="polite" className="hint">
          {status?.active || busy === "dream"
            ? "Dream is running…"
            : status
              ? `${status.eligibleSessions} eligible completed sessions since ${status.lastRunAt ? new Date(status.lastRunAt).toLocaleString() : "Memory began"}. Automatic Dream runs while idle after 24 hours or five sessions.`
              : "Loading Dream status…"}
        </output>
      </section>
    </section>
  );
}
