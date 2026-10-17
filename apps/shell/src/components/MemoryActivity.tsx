import { useId, useState } from "react";
import type { MemoryExtractionView } from "@aux/contracts";
import "./MemoryHistory.css";

export function MemoryActivity({ entries }: { entries: MemoryExtractionView[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailId = useId();
  const selected = entries.find((entry) => entry.activityId === selectedId) ?? entries[0];
  if (!selected)
    return (
      <p className="hint">
        No extraction activity yet. Completed chats can contribute notes when memory is enabled.
      </p>
    );
  const date = (at: number) => new Date(at).toLocaleDateString(undefined, { dateStyle: "medium" });
  const duration = (ms: number) => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`);
  return (
    <div className="memory-history-browser">
      <nav className="memory-history-list" aria-label="Memory extraction activity">
        {entries.map((entry, index) => (
          <div key={entry.activityId}>
            {(index === 0 || date(entries[index - 1]!.capturedAt) !== date(entry.capturedAt)) && (
              <h4 className="memory-activity-date">{date(entry.capturedAt)}</h4>
            )}
            <button
              type="button"
              aria-current={entry.activityId === selected.activityId ? "true" : undefined}
              aria-controls={detailId}
              onClick={() => setSelectedId(entry.activityId)}
            >
              <strong className="memory-activity-title">{entry.title}</strong>
              <span>
                {duration(entry.durationMs)} · {entry.candidateIds.length}{" "}
                {entry.candidateIds.length === 1 ? "note" : "notes"}
              </span>
            </button>
          </div>
        ))}
      </nav>
      <section className="memory-history-detail" id={detailId} aria-label="Selected memory extraction">
        <header>
          <div>
            <h3>{selected.title}</h3>
            <time dateTime={new Date(selected.capturedAt).toISOString()}>
              {new Date(selected.capturedAt).toLocaleString()}
            </time>
          </div>
        </header>
        <dl className="memory-activity-metadata">
          <div>
            <dt>Trigger</dt>
            <dd>{selected.trigger === "run-completed" ? "Chat completed" : "Extracted manually"}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{duration(selected.durationMs)}</dd>
          </div>
          <div>
            <dt>Processing</dt>
            <dd>Local extraction · no model request</dd>
          </div>
          <div>
            <dt>Notes extracted</dt>
            <dd>{selected.candidateIds.length}</dd>
          </div>
        </dl>
        <p className="memory-activity-outcome">
          {selected.candidateIds.length
            ? "These notes were added to the review inbox. Accepted notes can inform replies."
            : "No new notes were extracted from this chat."}
        </p>
      </section>
    </div>
  );
}
