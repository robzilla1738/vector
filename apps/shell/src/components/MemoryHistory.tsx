import { useId, useState, type ReactNode } from "react";
import { MemoryDocument } from "./MemoryDocument";
import "./MemoryHistory.css";

type Revision = {
  revisionId: string;
  capturedAt: number;
  claimCount: number;
  summary: string;
  sourceRunIds: string[];
};

export function MemoryHistory({
  revisions,
  restore,
}: {
  revisions: Revision[];
  restore(revision: Revision): ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailId = useId();
  const selected = revisions.find((revision) => revision.revisionId === selectedId) ?? revisions[0];
  if (!selected) return <p className="hint">No memory revisions yet.</p>;
  return (
    <div className="memory-history-browser">
      <nav className="memory-history-list" aria-label="Memory revisions">
        {revisions.map((revision) => (
          <button
            type="button"
            key={revision.revisionId}
            aria-current={revision.revisionId === selected.revisionId ? "true" : undefined}
            aria-controls={detailId}
            onClick={() => setSelectedId(revision.revisionId)}
          >
            <time dateTime={new Date(revision.capturedAt).toISOString()}>
              {new Date(revision.capturedAt).toLocaleString()}
            </time>
            <span>
              {revision.claimCount} {revision.claimCount === 1 ? "note" : "notes"} ·{" "}
              {revision.sourceRunIds.length} {revision.sourceRunIds.length === 1 ? "source" : "sources"}
            </span>
          </button>
        ))}
      </nav>
      <section className="memory-history-detail" id={detailId} aria-label="Selected memory revision">
        <header>
          <div>
            <h3>Memory revision</h3>
            <time dateTime={new Date(selected.capturedAt).toISOString()}>
              {new Date(selected.capturedAt).toLocaleString()}
            </time>
          </div>
          {restore(selected)}
        </header>
        <MemoryDocument text={selected.summary || "No approved notes."} />
      </section>
    </div>
  );
}
