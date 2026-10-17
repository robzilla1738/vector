import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { memoryClaimText, type MemoryClaimDocuments, type WorkspaceMemory } from "@aux/contracts";
import { useMemoryDrafts } from "../memory-drafts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { errorMessage } from "../error-message";
import { MemoryDocument } from "./MemoryDocument";
import {
  shellIconFolder,
  shellIconFolderClosed,
  shellIconClose,
  shellIconUp,
  shellIconDown,
} from "../ui/icons";
import "./MemoryDocumentBrowser.css";

type Draft = { revision: number; generation: string | null; texts: Record<string, string> };
const ROOT = "MEMORY.md";
function noteHeading(text: string) {
  const line = text.split("\n")[0] ?? "";
  return line.length > 72 ? `${line.slice(0, 72).replace(/\s+\S*$/, "")}…` : line;
}

/** The document view edits authoritative Space content and provenance-preserving approved notes. */
export function MemoryDocumentBrowser({
  memory,
  onSaved,
  active,
  onManage,
  onClose,
}: {
  memory: WorkspaceMemory;
  onSaved(memory: WorkspaceMemory): void;
  active: boolean;
  onManage(): void;
  onClose(): void;
}) {
  const workspaceId = memory.workspaceId;
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
  const [selected, setSelected] = useState(ROOT);
  const rootDraft = useMemoryDrafts((state) => state.drafts[workspaceId]);
  const storageError = useMemoryDrafts((state) => state.storageError);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [documentError, setDocumentError] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const request = useRef(0);
  const navigation = useRef<HTMLElement>(null);
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
          if (path === ROOT) return [[path, draft]];
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
        void refresh().catch((reason) => {
          if (current()) setError(errorMessage(reason));
        });
    });
  }, [active, current, refresh, workspaceId]);
  const paths = [...new Set(documents?.documents.map((document) => document.path) ?? [])].sort().reverse();
  const path = selected === ROOT || paths.includes(selected) ? selected : ROOT;
  const notes = documents?.documents.filter((document) => document.path === path) ?? [];
  const draft: Draft | undefined =
    path === ROOT
      ? rootDraft && { revision: rootDraft.revision, generation: null, texts: { [ROOT]: rootDraft.content } }
      : drafts[path];
  const stale =
    !!draft &&
    (path === ROOT ? draft.revision !== memory.revision : draft.generation !== documents?.generation);
  const changedAt =
    path === ROOT
      ? memory.updatedAt
      : notes.length
        ? Math.max(...notes.map((note) => note.updatedAt))
        : undefined;
  const startEdit = () => {
    if (!current() || pending.current || (path !== ROOT && !documents?.generation)) return;
    setError("");
    if (path === ROOT) {
      useMemoryDrafts.getState().write(workspaceId, { content: memory.content, revision: memory.revision });
      return;
    }
    setDrafts((previous) => ({
      ...previous,
      [path]: {
        revision: memory.revision,
        generation: documents?.generation ?? null,
        texts:
          path === ROOT
            ? { [ROOT]: memory.content }
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
              {note.claim.ownerEdit
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
        onKeyDown={(event) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          const controls = [...navigation.current!.querySelectorAll<HTMLElement>("button, summary")].filter(
            (element) => element.getClientRects().length,
          );
          const index = controls.indexOf(event.target as HTMLElement);
          if (index < 0) return;
          event.preventDefault();
          controls[
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? controls.length - 1
                : Math.max(0, Math.min(controls.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))
          ]?.focus();
        }}
      >
        <div className="memory-tree-heading">
          {shellIconFolder} <span>Documents</span>
        </div>
        <details
          open={expanded}
          onToggle={(event) => setExpanded(event.currentTarget.open)}
          className="memory-document-folder"
        >
          <summary>
            {expanded ? shellIconFolder : shellIconFolderClosed} episodic{" "}
            <span className="memory-folder-chevron">{expanded ? shellIconUp : shellIconDown}</span>
          </summary>
          {!documents ? (
            <span className="hint">{documentError ? "Unavailable" : "Loading…"}</span>
          ) : !paths.length ? (
            <span className="hint">No approved chat notes yet.</span>
          ) : (
            paths.map((item) => (
              <button
                type="button"
                key={item}
                aria-current={path === item ? "page" : undefined}
                onClick={() => {
                  setSelected(item);
                  setError("");
                }}
              >
                {item.split("/").at(-1)}
                {drafts[item] ? " •" : ""}
              </button>
            ))
          )}
        </details>
        <button
          type="button"
          aria-current={path === ROOT ? "page" : undefined}
          onClick={() => {
            setSelected(ROOT);
            setError("");
          }}
        >
          {ROOT}
          {rootDraft ? " •" : ""}
        </button>
        <button type="button" className="memory-review-link" onClick={onManage}>
          Review and manage notes
        </button>
      </nav>
      <section className="memory-document-pane" aria-label={path}>
        <header>
          <span className="memory-document-breadcrumb">{path.replaceAll("/", " › ")}</span>
          {changedAt !== undefined && (
            <time dateTime={new Date(changedAt).toISOString()} title={new Date(changedAt).toLocaleString()}>
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
                  busy || stale || (path !== ROOT && Object.values(draft.texts).some((text) => !text.trim()))
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
              disabled={busy || (path !== ROOT && !documents?.generation)}
              onClick={startEdit}
            >
              Edit
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
                  {path === ROOT ? (
                    <MemoryDocument text={memory.content || "No saved content."} />
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
                              generation: documents?.generation ?? null,
                              texts:
                                path === ROOT
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
              {path === ROOT ? (
                <textarea
                  aria-label="Edit MEMORY.md"
                  maxLength={16000}
                  value={draft.texts[ROOT]}
                  disabled={busy}
                  onChange={(event) =>
                    useMemoryDrafts
                      .getState()
                      .write(workspaceId, { content: event.target.value, revision: draft.revision })
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
          ) : path === ROOT ? (
            <MemoryDocument
              text={
                memory.content || "No Space notes yet. Choose Edit to add context you want Aux to remember."
              }
            />
          ) : (
            <>
              <h2>{path.split("/").at(-1)?.replace(/\.md$/, "")}</h2>
              {notePreview()}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
