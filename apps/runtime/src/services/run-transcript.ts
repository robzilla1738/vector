import type { Artifact, Run, RunTranscriptItem, RunTranscriptProjection } from "@aux/contracts";

const TERMINAL = new Set(["completed", "partially_completed", "failed", "cancelled", "interrupted"]);

/** A read-only view over durable run and artifact rows. No raw artifact path or bytes cross this feed. */
export function projectRunTranscript(run: Run, artifacts: readonly Artifact[]): RunTranscriptProjection {
  const items: RunTranscriptItem[] = [];
  const result = run.result;
  const terminal = TERMINAL.has(run.status);
  const answer = typeof result?.report === "string" ? result.report : typeof result?.answer === "string" ? result.answer : null;
  if (terminal && answer?.trim()) items.push({ kind: "answer", text: answer, terminal: true });

  const scoped = artifacts.filter((artifact) => artifact.runId === run.runId && artifact.status === "complete")
    .sort((a, b) => a.createdAt - b.createdAt || a.artifactId.localeCompare(b.artifactId));
  const byId = new Set(scoped.map((artifact) => artifact.artifactId));
  // S5 records citations only after exact quote verification. Other engines'
  // arbitrary result objects do not acquire that trust by using the same key.
  if (terminal && run.config?.implementation === "agent-loop" && Array.isArray(result?.citations)) {
    for (const value of result.citations) {
      if (!value || typeof value !== "object") continue;
      const citation = value as Record<string, unknown>;
      if (typeof citation.observationId !== "string" || !citation.observationId.trim()
        || typeof citation.quote !== "string" || !citation.quote.trim()) continue;
      items.push({ kind: "citation", observationId: citation.observationId, quote: citation.quote,
        ...(byId.has(citation.observationId) ? { artifactId: citation.observationId } : {}) });
    }
  }

  for (const artifact of scoped.slice(-20)) items.push({ kind: "artifact", artifactId: artifact.artifactId,
    mediaType: artifact.mediaType, size: artifact.size, status: "complete" });

  const failureAction = run.failure?.action;
  if (run.status === "needs_input") items.push({ kind: "recovery", state: "needs_input",
    description: run.statusMessage ?? "Aux is waiting for your answer.", action: "answer" });
  else if (run.status === "paused") items.push({ kind: "recovery", state: "paused",
    description: run.statusMessage ?? "This run is paused.", action: "wait" });
  else if (run.status === "partially_completed") items.push({ kind: "recovery", state: "partially_completed",
    description: run.statusMessage ?? "Some work could not be confirmed. Review the recorded result.", action: "inspect" });
  else if (run.status === "interrupted") items.push({ kind: "recovery", state: "interrupted",
    description: run.statusMessage ?? "This run stopped with an uncertain outcome. Inspect it before retrying.", action: "inspect" });
  else if (run.status === "failed") items.push({ kind: "recovery", state: "failed",
    description: run.failure?.message ?? run.statusMessage ?? "This run stopped.",
    action: failureAction === "retry" ? "retry" : failureAction === "model_settings" ? "settings"
      : failureAction === "edit_request" ? "revise" : "none" });
  return { runId: run.runId, items };
}
