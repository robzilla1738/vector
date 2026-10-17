import { useRef } from "react";
import type { HistoryEntry } from "@aux/contracts";
import { Dialog } from "../ui/dialog";
import { hostOf } from "../workspace";

export function HistoryDeleteDialog({
  visits,
  busy,
  error,
  onClose,
  onDelete,
}: {
  visits: HistoryEntry[];
  busy: boolean;
  error: string;
  onClose(): void;
  onDelete(): void;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      className="aux-dialog-surface library-form-dialog"
      label="Delete selected visits"
      initialFocusRef={cancel}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="library-history-delete">
        <h2>Delete selected visits?</h2>
        <p>
          {visits.length} {visits.length === 1 ? "visit" : "visits"} selected. This cannot be undone.
        </p>
        <ul aria-label="Visits to delete">
          {visits.map((visit) => (
            <li key={JSON.stringify([visit.url, visit.visitedAt])}>
              <strong>{visit.title || hostOf(visit.url)}</strong>
              <span>
                {hostOf(visit.url)} · {new Date(visit.visitedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <p className="hint">Bookmarks, cookies, downloads and saved work are kept.</p>
        {error && <p role="alert">{error}</p>}
        <div className="row">
          <button ref={cancel} className="btn ghost" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button className="btn danger" disabled={busy || !visits.length} onClick={onDelete}>
            {busy ? "Deleting…" : "Delete visits"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
