import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { call } from "../store";
import "./RunAttentionFeed.css";

type Attention = { run: Run; suspension: Suspension };

/** Keep Home and Tasks subscribed only to pending rows they can actually present. */
export function selectAttentionRuns(runs: readonly Run[]): Run[] {
  return runs.filter((run) => run.status === "needs_input").slice(0, 32);
}
const LABELS: Record<Suspension["kind"], { title: string; detail: string }> = {
  "ask-user-question": { title: "Aux needs your answer", detail: "Review the question in this task." },
  approval: { title: "Approval needed", detail: "Review the requested action in this task." },
  "action-confirmation": { title: "Action confirmation needed", detail: "Review the action before Aux continues." },
  handoff: { title: "Your turn in the browser", detail: "Complete the browser step, then return to Aux." },
};

function matches(run: Run, suspension: Suspension | null | undefined): suspension is Suspension {
  return run.status === "needs_input" && !!suspension && suspension.state === "pending"
    && suspension.runId === run.runId && suspension.turnId === run.runId;
}

/** Mountable in Home or Tasks. Every card comes from a fresh durable suspension, never event prose. */
export function RunAttentionFeed({ runs, onOpenRun, limit = 8 }: {
  runs: readonly Run[]; onOpenRun(runId: string): void; limit?: number;
}) {
  const [items, setItems] = useState<Attention[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const pendingKey = JSON.stringify(selectAttentionRuns(runs)
    .map((run) => [run.runId, run.statusMessage, run.config?.messageRevision]));
  useEffect(() => {
    let live = true;
    const pending = JSON.parse(pendingKey) as [string, string | undefined, number | undefined][];
    void Promise.all(pending.map(async ([runId]) => {
      try {
        const response = await call("runs.get", { runId });
        return response.run.runId === runId && matches(response.run, response.suspension)
          ? { run: response.run, suspension: response.suspension } : null;
      } catch { return null; }
    })).then((results) => {
      if (!live) return;
      setItems(results.filter((item): item is Attention => !!item)
        .sort((a, b) => b.run.createdAt - a.run.createdAt || a.run.runId.localeCompare(b.run.runId)));
    });
    return () => { live = false; };
  }, [pendingKey, revision]);

  const visible = items.filter((item) => !dismissed.has(item.suspension.suspensionId)).slice(0, Math.max(0, limit));
  if (!visible.length) return null;

  async function review(item: Attention) {
    setError("");
    try {
      const current = await call("runs.get", { runId: item.run.runId });
      if (!matches(current.run, current.suspension)
        || current.suspension.suspensionId !== item.suspension.suspensionId)
        throw new Error("This request changed. Review the latest task state.");
      onOpenRun(item.run.runId);
    } catch (reason) {
      setError(errorMessage(reason));
      setRevision((value) => value + 1);
    }
  }

  function dismiss(id: string) { setDismissed((previous) => new Set(previous).add(id)); }
  function dismissOnEscape(event: React.KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key === "Escape") { event.stopPropagation(); dismiss(id); }
  }

  return <section className="run-attention-feed" aria-label="Tasks needing your input">
    <h2>Needs your input</h2>
    {visible.map((item) => <article className="run-failure run-attention-card" key={item.suspension.suspensionId}>
      <div><strong>{LABELS[item.suspension.kind].title}</strong><p className="hint">{LABELS[item.suspension.kind].detail}</p></div>
      <div className="row">
        <button className="btn sm primary" onKeyDown={(event) => dismissOnEscape(event, item.suspension.suspensionId)}
          onClick={() => void review(item)}>Review task</button>
        <button className="btn sm ghost" aria-label={`Dismiss ${LABELS[item.suspension.kind].title}`}
          onKeyDown={(event) => dismissOnEscape(event, item.suspension.suspensionId)}
          onClick={() => dismiss(item.suspension.suspensionId)}>Dismiss</button>
      </div>
    </article>)}
    {items.length > visible.length && <p className="hint">More tasks need your input in Tasks.</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
