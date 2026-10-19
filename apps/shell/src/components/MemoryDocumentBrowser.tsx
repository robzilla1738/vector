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
import {
  OWNER_MEMORY_DOCUMENT_PATHS,
  memoryClaimText,
  type OwnerMemoryDocument,
  type MemoryClaimDocuments,
  type WorkspaceMemory,
} from "@aux/contracts";
import { useMemoryDrafts } from "../memory-drafts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { errorMessage } from "../error-message";
import { availableForFocus } from "../ui/focus";
import { ActionMenu, Dialog } from "../ui";
import { MemoryDocument } from "./MemoryDocument";
import {
  shellIconFolder,
  shellIconFolderClosed,
  shellIconClose,
  shellIconUp,
  shellIconDown,
  shellIconResult,
} from "../ui/icons";
import "./MemoryDocumentBrowser.css";

type Draft = { revision: number; generation: string | null; texts: Record<string, string> };
const ROOT = "MEMORY.md";
function noteHeading(text: string) {
  const line = text.split("\n")[0] ?? "";
  return line.length > 72 ? `${line.slice(0, 72).replace(/\s+\S*$/, "")}…` : line;
}

export type MemoryDocumentExtension = {
  keys: string[];
  selected: boolean;
  label: string;
  onSelectInternal(): void;
  navigation(context: { focused: string; onFocus(key: string): void }): ReactNode;
  pane: ReactNode;
  controls?: ReactNode;
  setFolderOpen?(key: string, open: boolean): void;
};
type Props = {
  extension?: MemoryDocumentExtension;
  initialPath?: OwnerMemoryDocument["path"] | "MEMORY.md";
  memory: WorkspaceMemory;
  onSaved(memory: WorkspaceMemory): void;
  active: boolean;
  onManage(): void;
  onClose(): void;
};

/** A document draft never follows a Space, private mode or native window change. */
export function MemoryDocumentBrowser(props: Props) {
  if (bridge.privateMode) return null;
  return (
    <MemoryDocumentBrowserBody key={JSON.stringify([props.memory.workspaceId, bridge.windowId])} {...props} />
  );
}

function MemoryDocumentBrowserBody({
  memory,
  onSaved,
  active,
  onManage,
  onClose,
  extension,
  initialPath,
}: Props) {
  const workspaceId = memory.workspaceId;
  const savedMemory = useRef(memory);
  const savedCallback = useRef(onSaved);
  useLayoutEffect(() => {
    if (memory.revision >= savedMemory.current.revision) savedMemory.current = memory;
    savedCallback.current = onSaved;
  }, [memory, onSaved]);

  const layout = useStore((state) => state.layout);
  const identities = JSON.stringify(
    [...layout.spaces, ...(layout.archivedSpaces ?? [])]
      .filter((space) => space.workspaceId === workspaceId)
      .map((space) => space.id),
  );
  const windowId = bridge.windowId;
  const owner = useMemo(() => ({ active: true }), [workspaceId, identities, windowId]);
  useLayoutEffect(() => {
    owner.active = true;
    return () => {
      owner.active = false;
    };
  }, [owner]);
  const current = useCallback(() => {
    const state = useStore.getState().layout;
    const spaces = [...state.spaces, ...(state.archivedSpaces ?? [])].filter(
      (space) => space.workspaceId === workspaceId,
    );
    return (
      owner.active &&
      !bridge.privateMode &&
      bridge.windowId === windowId &&
      spaces.length === 1 &&
      JSON.stringify(spaces.map((space) => space.id)) === identities
    );
  }, [owner, identities, workspaceId, windowId]);
  const [documents, setDocuments] = useState<MemoryClaimDocuments | null>(null);
  const [selected, setSelected] = useState<string>(initialPath ?? ROOT);
  const [focused, setFocused] = useState(ROOT);
  const [newDocuments, setNewDocuments] = useState<OwnerMemoryDocument["path"][]>([]);
  const [removing, setRemoving] = useState<{
    path: OwnerMemoryDocument["path"];
    revision: number;
    content: string;
  } | null>(null);
  const savedOwnerPaths = useRef(new Set(memory.documents?.map((document) => document.path) ?? []));

  const rootDraft = useMemoryDrafts((state) => state.drafts[workspaceId]);
  const storageError = useMemoryDrafts((state) => state.storageError);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [documentError, setDocumentError] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);
  const episodicGroupId = useId();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    const paths = new Set(memory.documents?.map((document) => document.path) ?? []);
    const removed = [...savedOwnerPaths.current].filter((path) => !paths.has(path));
    savedOwnerPaths.current = paths;
    if (removed.length)
      setDrafts((previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(([path]) => !removed.some((removedPath) => removedPath === path)),
        ),
      );
  }, [memory.documents]);

  const request = useRef(0);
  const navigation = useRef<HTMLElement>(null);
  const treeFocusOwner = useRef<{ row: HTMLElement; folder: HTMLElement | null } | null>(null);
  useLayoutEffect(() => {
    const previous = treeFocusOwner.current;
    if (!active) {
      treeFocusOwner.current = null;
      return;
    }
    if (!previous || availableForFocus(previous.row)) return;
    treeFocusOwner.current = null;
    // A refresh can remove the focused row without dispatching blur. Return to
    // its surviving folder, but never replace a newer editor or dialog owner.
    if (document.activeElement !== document.body && document.activeElement !== previous.row) return;
    const folder = previous.folder;
    const fallback =
      folder && navigation.current?.contains(folder) && availableForFocus(folder)
        ? folder
        : [...(navigation.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])].find(
            (row) => row.tabIndex === 0 && availableForFocus(row),
          );
    fallback?.focus();
  });
  const refresh = useCallback(async () => {
    if (!current()) return;
    const sequence = ++request.current;
    const result = await call("memory.pipeline.documents", { workspaceId }).catch((reason) => {
      if (current() && sequence === request.current) setDocumentError(errorMessage(reason));
      throw reason;
    });
    if (!current() || sequence !== request.current) return;
    setDocumentError("");
    setDocuments(result);
    // Forget must also remove the corresponding unsaved source-derived prose.
    const ids = new Set(result.documents.map((document) => document.claim.claimId));
    const paths = new Set(result.documents.map((document) => document.path));
    setDrafts((previous) =>
      Object.fromEntries(
        Object.entries(previous).flatMap(([path, draft]) => {
          if (path === ROOT || OWNER_MEMORY_DOCUMENT_PATHS.some((ownerPath) => path === ownerPath))
            return [[path, draft]];
          if (!paths.has(path)) return [];
          return [
            [
              path,
              {
                ...draft,
                texts: Object.fromEntries(Object.entries(draft.texts).filter(([id]) => ids.has(id))),
              },
            ],
          ];
        }),
      ),
    );
  }, [current, workspaceId]);
  useEffect(() => {
    if (!active) return;
    void refresh().catch((reason) => {
      if (current()) setError(errorMessage(reason));
    });
    return bridge.onEvent((event) => {
      if (event.type === "workspace.memory.updated" && event.payload.workspaceId === workspaceId)
        void Promise.all([
          refresh(),
          call("workspaces.memory.get", { workspaceId }).then((value) => {
            if (!current()) return;
            if (value.workspaceId !== workspaceId) throw new Error("The original Memory Space changed.");
            if (value.revision < savedMemory.current.revision) return;
            savedMemory.current = value;
            savedCallback.current(value);
          }),
        ]).catch((reason) => {
          if (current()) setError(errorMessage(reason));
        });
    });
  }, [active, current, refresh, workspaceId]);
  const paths = [...new Set(documents?.documents.map((document) => document.path) ?? [])].sort().reverse();
  const ownerPaths = OWNER_MEMORY_DOCUMENT_PATHS.filter(
    (path) => newDocuments.includes(path) || memory.documents?.some((document) => document.path === path),
  );
  const treeFocus = [ROOT, "episodic", ...paths, ...ownerPaths, ...(extension?.keys ?? [])].includes(focused)
    ? focused
    : ROOT;
  const path =
    selected === ROOT || paths.includes(selected) || ownerPaths.some((path) => path === selected)
      ? selected
      : ROOT;
  const ownerPath = OWNER_MEMORY_DOCUMENT_PATHS.find((ownerPath) => ownerPath === path);
  const ownerDocument = memory.documents?.find((document) => document.path === ownerPath);
  const textDocument = path === ROOT || ownerPath !== undefined;
  const documentText = path === ROOT ? memory.content : (ownerDocument?.content ?? "");

  const notes = documents?.documents.filter((document) => document.path === path) ?? [];
  const draft: Draft | undefined =
    path === ROOT
      ? rootDraft && { revision: rootDraft.revision, generation: null, texts: { [ROOT]: rootDraft.content } }
      : drafts[path];
  const stale =
    !!draft &&
    (textDocument ? draft.revision !== memory.revision : draft.generation !== documents?.generation);
  let changedAt = ownerDocument?.updatedAt;
  if (path === ROOT) changedAt = memory.contentUpdatedAt ?? (memory.documents ? undefined : memory.updatedAt);
  if (!textDocument && notes.length) changedAt = Math.max(...notes.map((note) => note.updatedAt));
  const startEdit = () => {
    if (!current() || pending.current || (!textDocument && !documents?.generation)) return;
    setError("");
    if (path === ROOT) {
      useMemoryDrafts.getState().write(workspaceId, { content: memory.content, revision: memory.revision });
      return;
    }
    setDrafts((previous) => ({
      ...previous,
      [path]: {
        revision: memory.revision,
        generation: textDocument ? null : (documents?.generation ?? null),
        texts: textDocument
          ? { [path]: documentText }
          : Object.fromEntries(notes.map((note) => [note.claim.claimId, memoryClaimText(note.claim)])),
      },
    }));
  };
  const discard = () => {
    if (!current() || pending.current) return;
    if (path === ROOT) {
      useMemoryDrafts.getState().write(workspaceId, null);
      return;
    }
    setDrafts((previous) => {
      const next = { ...previous };
      delete next[path];
      return next;
    });
    if (ownerPath && !ownerDocument)
      setNewDocuments((previous) => previous.filter((item) => item !== ownerPath));
  };
  const save = async () => {
    if (!current() || !draft || stale || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (path === ROOT) {
        const result = await call("workspaces.memory.set", {
          workspaceId,
          expectedRevision: draft.revision,
          content: draft.texts[ROOT] ?? "",
        });
        if (!current()) return;
        onSaved(result);
        useMemoryDrafts.getState().write(workspaceId, null);
      } else if (ownerPath) {
        const result = await call("workspaces.memory.setDocument", {
          workspaceId,
          expectedRevision: draft.revision,
          path: ownerPath,
          content: draft.texts[path] ?? "",
        });
        if (!current()) return;
        onSaved(result);
        setNewDocuments((previous) => previous.filter((item) => item !== ownerPath));
      } else {
        const edits = notes
          .filter(
            (note) =>
              draft.texts[note.claim.claimId] !== undefined &&
              draft.texts[note.claim.claimId] !== memoryClaimText(note.claim),
          )
          .map((note) => ({ claimId: note.claim.claimId, text: draft.texts[note.claim.claimId] ?? "" }));
        if (edits.length)
          await call("memory.pipeline.edit", { workspaceId, expectedGeneration: draft.generation!, edits });
        if (!current()) return;
        await refresh();
      }
      if (current())
        setDrafts((previous) => {
          const next = { ...previous };
          delete next[path];
          return next;
        });
    } catch (reason) {
      if (current()) {
        setError(errorMessage(reason));
        void Promise.all([
          refresh(),
          call("workspaces.memory.get", { workspaceId }).then((value) => {
            if (current()) onSaved(value);
          }),
        ]).catch(() => {});
      }
    } finally {
      pending.current = false;
      if (current()) setBusy(false);
    }
  };
  const addDocument = (path: OwnerMemoryDocument["path"]) => {
    if (!current() || pending.current) return;
    setNewDocuments((previous) => [...previous, path]);
    setDrafts((previous) => ({
      ...previous,
      [path]: { revision: memory.revision, generation: null, texts: { [path]: "" } },
    }));
    extension?.onSelectInternal();
    setSelected(path);
    setError("");
  };
  const removeDocument = async () => {
    const selection = removing;
    if (!selection || !current() || pending.current) return;
    const path = selection.path;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await call("workspaces.memory.setDocument", {
        workspaceId,
        expectedRevision: selection.revision,
        path,
        content: null,
      });
      if (!current()) return;
      onSaved(result);
      setRemoving(null);
      setNewDocuments((previous) => previous.filter((item) => item !== path));
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[path];
        return next;
      });
      setSelected((previous) => (previous === path ? ROOT : previous));
    } catch (reason) {
      if (current()) setError(errorMessage(reason));
    } finally {
      pending.current = false;
      if (current()) setBusy(false);
    }
  };
  const notePreview = (showSource = true) =>
    notes.map((note) => (
      <section className="memory-document-entry" key={note.claim.claimId}>
        <h3>
          {new Date(note.claim.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
          {noteHeading(memoryClaimText(note.claim))}
        </h3>
        <MemoryDocument text={memoryClaimText(note.claim)} />
        {showSource && (
          <details className="memory-source-quote">
            <summary>
              {note.claim.sourceRetired
                ? "Owner-edited · original source retired · excluded from recall"
                : note.claim.ownerEdit
                  ? "Owner-edited · original source"
                  : note.claim.source?.kind === "owner-paste"
                    ? "Owner-pasted · unverified source"
                    : "Original source quote"}
            </summary>
            <p>{note.claim.source?.quote ?? note.claim.text}</p>
            <small>{note.claim.sourceRunId}</small>
          </details>
        )}
      </section>
    ));
  if (!active) return null;
  const visibleError = error || documentError;
  return (
    <div className="memory-document-browser">
      <nav
        aria-label="Memory documents"
        ref={navigation}
        onFocusCapture={(event) => {
          const row = event.target;
          treeFocusOwner.current =
            row instanceof HTMLElement && row.getAttribute("role") === "treeitem"
              ? { row, folder: row.closest("details")?.querySelector<HTMLElement>(":scope > summary") ?? null }
              : null;
        }}
        onBlurCapture={(event) => {
          const previous = treeFocusOwner.current;
          if (event.relatedTarget || (previous && availableForFocus(previous.row)))
            treeFocusOwner.current = null;
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
          if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(
            availableForFocus,
          );
          const index = controls.indexOf(event.target as HTMLElement);
          if (index < 0) return;
          event.preventDefault();
          const current = controls[index]!;
          const folder = current.closest("details");
          if (event.key === "ArrowRight") {
            if (current.tagName !== "SUMMARY") return;
            if (folder && !folder.open) {
              if (current.dataset.memoryFolder === "episodic") setExpanded(true);
              else extension?.setFolderOpen?.(current.dataset.memoryFolder ?? "", true);
            } else folder?.querySelector<HTMLElement>('[role="group"] [role="treeitem"]')?.focus();
            return;
          }
          if (event.key === "ArrowLeft") {
            if (current.tagName === "SUMMARY" && folder) {
              if (current.dataset.memoryFolder === "episodic") setExpanded(false);
              else extension?.setFolderOpen?.(current.dataset.memoryFolder ?? "", false);
            } else folder?.querySelector("summary")?.focus();
            return;
          }
          controls[
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? controls.length - 1
                : Math.max(0, Math.min(controls.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))
          ]?.focus();
        }}
      >
        {extension?.controls}
        <div className="memory-tree-heading">
          {shellIconFolder} <span>Documents</span>
        </div>
        <div role="tree" aria-label="Saved Memory documents">
          <details
            role="none"
            open={expanded}
            onToggle={(event) => setExpanded(event.currentTarget.open)}
            className="memory-document-folder"
          >
            <summary
              role="treeitem"
              aria-expanded={expanded}
              data-memory-folder="episodic"
              aria-level={1}
              aria-owns={episodicGroupId}
              tabIndex={treeFocus === "episodic" ? 0 : -1}
              onFocus={() => setFocused("episodic")}
            >
              {expanded ? shellIconFolder : shellIconFolderClosed} episodic{" "}
              <span className="memory-folder-chevron">{expanded ? shellIconUp : shellIconDown}</span>
            </summary>
            <div role="group" id={episodicGroupId}>
              {!documents ? (
                <span className="hint">{documentError ? "Unavailable" : "Loading…"}</span>
              ) : !paths.length ? (
                <span className="hint">No approved chat notes yet.</span>
              ) : (
                paths.map((item) => (
                  <button
                    type="button"
                    key={item}
                    role="treeitem"
                    aria-level={2}
                    aria-selected={!extension?.selected && path === item}
                    tabIndex={treeFocus === item ? 0 : -1}
                    onFocus={() => setFocused(item)}
                    aria-current={!extension?.selected && path === item ? "page" : undefined}
                    onClick={() => {
                      extension?.onSelectInternal();
                      setSelected(item);
                      setError("");
                    }}
                  >
                    {shellIconResult}
                    <span>
                      {item.split("/").at(-1)}
                      {drafts[item] ? " •" : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </details>
          {extension?.navigation({ focused: treeFocus, onFocus: setFocused })}
          <button
            type="button"
            role="treeitem"
            aria-level={1}
            aria-selected={!extension?.selected && path === ROOT}
            tabIndex={treeFocus === ROOT ? 0 : -1}
            onFocus={() => setFocused(ROOT)}
            aria-current={!extension?.selected && path === ROOT ? "page" : undefined}
            onClick={() => {
              extension?.onSelectInternal();
              setSelected(ROOT);
              setError("");
            }}
          >
            {shellIconResult}
            <span>
              {ROOT}
              {rootDraft ? " •" : ""}
            </span>
          </button>
          {ownerPaths.map((ownerPath) => (
            <button
              type="button"
              key={ownerPath}
              role="treeitem"
              aria-level={1}
              aria-selected={!extension?.selected && path === ownerPath}
              tabIndex={treeFocus === ownerPath ? 0 : -1}
              onFocus={() => setFocused(ownerPath)}
              aria-current={!extension?.selected && path === ownerPath ? "page" : undefined}
              onClick={() => {
                extension?.onSelectInternal();
                setSelected(ownerPath);
                setError("");
              }}
            >
              {shellIconResult}
              <span>
                {ownerPath}
                {drafts[ownerPath] ? " •" : ""}
              </span>
            </button>
          ))}
        </div>
        {ownerPaths.length < OWNER_MEMORY_DOCUMENT_PATHS.length && (
          <div className="memory-document-add">
            <ActionMenu
              label="Add Memory document"
              actions={OWNER_MEMORY_DOCUMENT_PATHS.filter((path) => !ownerPaths.includes(path)).map(
                (path) => ({ label: path, disabled: busy, onSelect: () => addDocument(path) }),
              )}
            >
              Add document
            </ActionMenu>
          </div>
        )}
        <button type="button" className="memory-review-link" onClick={onManage}>
          Review and manage notes
        </button>
      </nav>
      <section className="memory-document-pane" aria-label={extension?.selected ? extension.label : path}>
        {extension?.selected ? (
          extension.pane
        ) : (
          <>
            <header>
              <span className="memory-document-breadcrumb">{path.replaceAll("/", " › ")}</span>
              {changedAt !== undefined && (
                <time
                  dateTime={new Date(changedAt).toISOString()}
                  title={new Date(changedAt).toLocaleString()}
                >
                  {new Date(changedAt).toLocaleString()}
                </time>
              )}
              {draft ? (
                <div className="memory-document-actions">
                  <button type="button" className="btn sm" disabled={busy} onClick={discard}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    disabled={
                      busy ||
                      stale ||
                      (!textDocument && Object.values(draft.texts).some((text) => !text.trim()))
                    }
                    onClick={() => void save()}
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn sm memory-document-edit"
                  disabled={busy || (!textDocument && !documents?.generation)}
                  onClick={startEdit}
                >
                  Edit
                </button>
              )}
              {ownerDocument && !draft && (
                <button
                  type="button"
                  className="btn sm"
                  disabled={busy}
                  onClick={() =>
                    setRemoving({
                      path: ownerDocument.path,
                      revision: memory.revision,
                      content: ownerDocument.content,
                    })
                  }
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className="icon-btn"
                aria-label="Close settings"
                title="Close (Esc)"
                onClick={onClose}
              >
                {shellIconClose}
              </button>
            </header>
            <div className="memory-document-body">
              {storageError && rootDraft && (
                <p role="status">
                  Your Space notes draft is available in this window but could not be saved for restart.
                </p>
              )}
              {visibleError && (
                <p role="alert">
                  {visibleError}{" "}
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => {
                      void refresh()
                        .then(() => {
                          if (current()) setError("");
                        })
                        .catch((reason) => {
                          if (current()) setError(errorMessage(reason));
                        });
                    }}
                  >
                    Refresh documents
                  </button>
                </p>
              )}
              {draft ? (
                <>
                  {stale && (
                    <section className="memory-document-conflict" aria-label="Document changed">
                      <p>
                        The saved document changed. Your draft is preserved. Compare the latest version before
                        saving.
                      </p>
                      {textDocument ? (
                        <MemoryDocument text={documentText || "No saved content."} />
                      ) : (
                        notePreview(false)
                      )}
                      <button
                        type="button"
                        className="btn sm"
                        disabled={busy}
                        onClick={() =>
                          path === ROOT
                            ? useMemoryDrafts.getState().write(workspaceId, {
                                content: draft.texts[ROOT] ?? "",
                                revision: memory.revision,
                              })
                            : setDrafts((previous) => ({
                                ...previous,
                                [path]: {
                                  ...draft,
                                  revision: memory.revision,
                                  generation: textDocument ? null : (documents?.generation ?? null),
                                  texts: textDocument
                                    ? draft.texts
                                    : Object.fromEntries(
                                        notes.map((note) => [
                                          note.claim.claimId,
                                          draft.texts[note.claim.claimId] ?? memoryClaimText(note.claim),
                                        ]),
                                      ),
                                },
                              }))
                        }
                      >
                        Keep my draft against this version
                      </button>
                    </section>
                  )}
                  {textDocument ? (
                    <textarea
                      aria-label={`Edit ${path}`}
                      maxLength={16000}
                      value={draft.texts[path] ?? ""}
                      disabled={busy}
                      onChange={(event) =>
                        path === ROOT
                          ? useMemoryDrafts
                              .getState()
                              .write(workspaceId, { content: event.target.value, revision: draft.revision })
                          : setDrafts((previous) => ({
                              ...previous,
                              [path]: { ...draft, texts: { [path]: event.target.value } },
                            }))
                      }
                    />
                  ) : (
                    notes.map((note, index) => (
                      <label className="memory-document-editor-section" key={note.claim.claimId}>
                        Note {index + 1}
                        <textarea
                          aria-label={`Edit note ${index + 1}`}
                          maxLength={2000}
                          value={draft.texts[note.claim.claimId] ?? memoryClaimText(note.claim)}
                          disabled={busy}
                          onChange={(event) =>
                            setDrafts((previous) => ({
                              ...previous,
                              [path]: {
                                ...draft,
                                texts: { ...draft.texts, [note.claim.claimId]: event.target.value },
                              },
                            }))
                          }
                        />
                        <small>Saved as your edit; the original source quote stays unchanged.</small>
                      </label>
                    ))
                  )}
                </>
              ) : textDocument ? (
                <>
                  {ownerPath && <p className="hint">Owner-written context for this Space.</p>}
                  <MemoryDocument
                    text={documentText || "No saved content. Choose Edit to add context for this Space."}
                  />
                </>
              ) : (
                <>
                  <h2>{path.split("/").at(-1)?.replace(/\.md$/, "")}</h2>
                  {notePreview()}
                </>
              )}
            </div>
          </>
        )}
      </section>
      {removing && current() && (
        <Dialog
          label={`Remove ${removing.path}`}
          className="aux-dialog-surface popup-material"
          kind="alertdialog"
          onClose={() => {
            if (!busy) setRemoving(null);
          }}
        >
          <h3>Remove {removing.path}?</h3>
          <p>This document will be removed from Memory for this Space.</p>
          <div className="memory-owner-removal-preview">
            <MemoryDocument text={removing.content || "Empty document."} />
          </div>
          {error && <p role="alert">{error}</p>}
          <footer>
            <button type="button" className="btn ghost" disabled={busy} onClick={() => setRemoving(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              disabled={busy}
              onClick={() => void removeDocument()}
            >
              Remove document
            </button>
          </footer>
        </Dialog>
      )}
    </div>
  );
}
