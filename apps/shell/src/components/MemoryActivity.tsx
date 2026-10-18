import { useId, useState, type ReactNode } from "react";
import type { MemoryExtractionView } from "@aux/contracts";
import "./MemoryHistory.css";

const failureMessages = {
  model_unavailable: "Choose an available model connection, then try extraction again.",
  budget_exceeded: "The model budget needs your review before extraction can run.",
  invalid_output: "The model returned quotes that could not be verified. No notes were added.",
  inference_failed: "The model request failed. No notes were added.",
};
export function MemoryActivity({
  entries,
  retry,
}: {
  entries: MemoryExtractionView[];
  retry?(entry: MemoryExtractionView): ReactNode;
}) {
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
                {entry.status === "failed"
                  ? "Failed"
                  : `${entry.candidateIds.length} ${entry.candidateIds.length === 1 ? "note" : "notes"}`}{" "}
                · {duration(entry.durationMs)}
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
            <dd>
              {selected.modelId ??
                (selected.status === "failed" ? "Not started" : "Local extraction · no model request")}
            </dd>
          </div>
          <div>
            <dt>Notes extracted</dt>
            <dd>{selected.candidateIds.length}</dd>
          </div>
          {selected.inputTokens !== undefined && (
            <div>
              <dt>Input tokens</dt>
              <dd>{selected.inputTokens.toLocaleString()}</dd>
            </div>
          )}
          {selected.outputTokens !== undefined && (
            <div>
              <dt>Output tokens</dt>
              <dd>{selected.outputTokens.toLocaleString()}</dd>
            </div>
          )}
          {selected.cachedInputTokens !== undefined && (
            <div>
              <dt>Cached input</dt>
              <dd>{selected.cachedInputTokens.toLocaleString()}</dd>
            </div>
          )}
          {selected.costUsd !== undefined && (
            <div>
              <dt>Cost{selected.costEstimated ? " (estimated)" : ""}</dt>
              <dd>
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 6,
                }).format(selected.costUsd)}
              </dd>
            </div>
          )}
        </dl>
        {selected.status === "failed" && (
          <div role="alert">
            <p>{failureMessages[selected.errorCode ?? "inference_failed"]}</p>
            {retry?.(selected)}
          </div>
        )}
        {!!selected.proposals?.length && (
          <section aria-label="Proposed memory notes">
            <h4>Proposed notes</h4>
            {selected.proposals.map((proposal) => (
              <details key={proposal.claimId}>
                <summary>{proposal.state === "accepted" ? "Accepted note" : "Pending review"}</summary>
                <blockquote className="memory-activity-quote">{proposal.quote}</blockquote>
              </details>
            ))}
          </section>
        )}
        <p className="memory-activity-outcome">
          {selected.status === "failed"
            ? "Extraction did not add any notes."
            : selected.candidateIds.length
              ? "These notes were added to the review inbox. Accepted notes can inform replies."
              : "No new notes were extracted from this chat."}
        </p>
      </section>
    </div>
  );
}
