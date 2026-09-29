import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MEMORY_PASTE_MAX_BYTES, type MemoryPastePreview, type MemoryPasteStatus } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";

/** Pasted drafts live only in this mounted form. Preview and commit are separate owner actions. */
export function MemoryPasteImport({
  workspaceId,
  onReview,
}: {
  workspaceId?: string;
  onReview?(workspaceId: string | null): void;
}) {
  const spaces = useStore((state) => state.layout.spaces);
  const destinations = spaces.filter(
    (space) => space.workspaceId && (!workspaceId || workspaceId === space.workspaceId),
  );
  const [selectedSpace, setSelectedSpace] = useState("");
  const destination = destinations.find((space) => space.workspaceId === selectedSpace);
  const destinationId = destination?.workspaceId ?? "";
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<MemoryPastePreview | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [receipts, setReceipts] = useState<MemoryPasteStatus[]>([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const busyRef = useRef(false),
    alive = useRef(true),
    scope = useRef(destinationId);
  useLayoutEffect(() => {
    scope.current = destinationId;
  }, [destinationId]);
  const bytes = new TextEncoder().encode(text).byteLength;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!destinationId || bridge.privateMode) return;
    let live = true;
    const load = () =>
      void Promise.all([
        call("memory.pipeline.policy", { workspaceId: destinationId }),
        call("memory.paste.status", { workspaceId: destinationId }),
      ])
        .then(([policy, status]) => {
          if (!live) return;
          setEnabled(policy.enabled);
          setReceipts(status);
        })
        .catch((cause) => {
          if (live) setError(cause instanceof Error ? cause.message : "Memory is unavailable in this build.");
        });
    load();
    const unsubscribe = bridge.onEvent((event) => {
      if (event.type === "workspace.memory.updated" && event.payload.workspaceId === destinationId) load();
    });
    return () => {
      live = false;
      unsubscribe();
    };
  }, [destinationId]);
  function invalidate() {
    setPreview(null);
    setSelectedIds([]);
  }
  async function work(action: (id: string) => Promise<void>) {
    if (busyRef.current || !destinationId) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action(destinationId);
    } catch (cause) {
      if (alive.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Memory import could not finish. Check its receipts before retrying.",
        );
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  }
  if (bridge.privateMode) return <p>Memory import is unavailable in private browsing.</p>;
  return (
    <section aria-label="Import pasted assistant notes">
      <p>
        Bring a few useful notes from another assistant. Paste plain text with one note per line, up to 40
        notes and 32 KiB. Nothing is read from your clipboard automatically.
      </p>
      <p className="hint">
        Preview uses local checks only and makes no model call. Remove passwords, tokens, financial and health
        details. These checks cannot identify every sensitive fact; review each note yourself. Imported notes
        remain unverified and are not used by the agent until you accept them in Memory review.
      </p>
      <label>
        Destination Space
        <select
          value={destinationId}
          disabled={busy}
          onChange={(event) => {
            setSelectedSpace(event.target.value);
            onReview?.(null);
            invalidate();
            setEnabled(false);
            setReceipts([]);
            setError("");
          }}
        >
          <option value="">Choose a Space</option>
          {destinations.map((space) => (
            <option key={space.id} value={space.workspaceId}>
              {space.name}
            </option>
          ))}
        </select>
      </label>
      {!destinations.length && <p>Create or restore an active Space before importing notes.</p>}
      <label>
        Assistant notes
        <textarea
          rows={6}
          maxLength={MEMORY_PASTE_MAX_BYTES}
          value={text}
          disabled={busy}
          onChange={(event) => {
            setText(event.target.value);
            invalidate();
            setError("");
          }}
          placeholder="One useful preference or piece of project context per line"
        />
      </label>
      <p className="hint">
        {bytes.toLocaleString()} of {MEMORY_PASTE_MAX_BYTES.toLocaleString()} bytes. Drafts and previews are
        not restored after closing this form or restarting Aux.
      </p>
      <div className="row">
        <button
          className="btn sm"
          disabled={busy || !destinationId || !text.trim() || bytes > MEMORY_PASTE_MAX_BYTES}
          onClick={() =>
            void work(async (id) => {
              const result = await call("memory.paste.preview", { workspaceId: id, text });
              if (!alive.current || scope.current !== id) return;
              setPreview(result);
              setSelectedIds([]);
            })
          }
        >
          Preview pasted notes
        </button>
        <button
          className="btn sm ghost"
          disabled={busy || (!text && !preview)}
          onClick={() => {
            setText("");
            invalidate();
          }}
        >
          Clear pasted draft
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {preview?.workspaceId === destinationId &&
        (preview.status === "blocked" ? (
          <p role="alert">{preview.reason} No notes were saved.</p>
        ) : (
          <fieldset disabled={busy}>
            <legend>Review notes for {destination?.name}</legend>
            <p>
              Nothing is selected automatically. This preview expires in ten minutes or on restart. Changing
              the destination or text requires a fresh preview.
            </p>
            {preview.candidates.map((candidate) => (
              <label key={candidate.candidateId} className="field">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(candidate.candidateId)}
                  disabled={candidate.duplicate}
                  onChange={(event) =>
                    setSelectedIds((ids) =>
                      event.target.checked
                        ? [...ids, candidate.candidateId]
                        : ids.filter((id) => id !== candidate.candidateId),
                    )
                  }
                />
                <span>
                  {candidate.text}
                  {candidate.duplicate && (
                    <small className="hint"> · Already in Memory or repeated in this paste</small>
                  )}
                </span>
              </label>
            ))}
            {!enabled && (
              <label>
                <input
                  type="checkbox"
                  checked={false}
                  disabled={busy}
                  onChange={(event) => {
                    if (!event.target.checked) return;
                    void work(async (id) => {
                      await call("memory.pipeline.setPolicy", { workspaceId: id, enabled: true });
                      if (alive.current && scope.current === id) setEnabled(true);
                    });
                  }}
                />
                Enable Memory for {destination?.name}. Only notes I later accept can be used as context.
              </label>
            )}
            <button
              className="btn sm"
              disabled={busy || !enabled || !selectedIds.length}
              onClick={() =>
                void work(async (id) => {
                  const result = await call("memory.paste.commit", {
                    workspaceId: id,
                    previewId: preview.previewId,
                    selectedIds,
                  });
                  if (!alive.current || scope.current !== id) return;
                  setReceipts((items) =>
                    [result, ...items.filter((item) => item.importId !== result.importId)].slice(0, 20),
                  );
                  setText("");
                  invalidate();
                  onReview?.(id);
                })
              }
            >
              Add {selectedIds.length} {selectedIds.length === 1 ? "note" : "notes"} to Memory review
            </button>
          </fieldset>
        ))}
      {destinationId && (
        <>
          <button
            className="btn sm ghost"
            disabled={busy}
            onClick={() =>
              void work(async (id) => {
                const status = await call("memory.paste.status", { workspaceId: id });
                if (alive.current && scope.current === id) {
                  setReceipts(status);
                  if (
                    preview?.status === "ready" &&
                    status.some((item) => item.importId === preview.previewId)
                  ) {
                    setText("");
                    invalidate();
                  }
                }
              })
            }
          >
            Refresh import receipts
          </button>
        </>
      )}
      {!!receipts.length && (
        <div aria-label="Pasted Memory import receipts">
          <h4>Recent pasted imports</h4>
          {receipts.map((receipt) => (
            <p key={receipt.importId} data-import-id={receipt.importId}>
              Import {receipt.importId.slice(0, 8)} · {new Date(receipt.createdAt).toLocaleString()}:{" "}
              {receipt.added} added, {receipt.duplicates} duplicates skipped · {receipt.pending} pending,{" "}
              {receipt.accepted} approved, {receipt.restorable} in history, {receipt.removed} removed.
            </p>
          ))}
          <p className="hint">
            Counts survive restart. Forget removes matching notes from the inbox, approved Memory and
            restorable history; receipts retain counts only. Copied offline recovery packages must be replaced
            separately after Forget.
          </p>
          {onReview && (
            <button className="btn sm" disabled={busy} onClick={() => onReview(destinationId)}>
              Review this Space’s memory
            </button>
          )}
        </div>
      )}
    </section>
  );
}
