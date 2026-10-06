import {
  InlineAssistTextSchema,
  type Artifact,
  type Run,
  type RunTranscriptItem,
  type RunTranscriptProjection,
  type StepRecord,
} from "@aux/contracts";

const TERMINAL = new Set(["completed", "partially_completed", "failed", "cancelled", "interrupted"]);
const DISPLAYABLE_TOOL_OPS = new Set([
  "click",
  "fill",
  "navigate",
  "snapshot",
  "scroll",
  "download",
  "tab.open",
  "tab.close",
  "bookmark.add",
  "history.visit",
  "calendar.events.list",
]);
const WAITING_LABELS = {
  queued: "Waiting to start",
  planning: "Planning next steps",
  running: "Working on this request",
  paused: "Paused by the owner",
  needs_input: "Waiting for your input",
} as const;
const MAX_TOOLS = 16;

function safeMessage(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 1_000) : fallback;
}

/** A read-only view over durable run and artifact rows. No raw artifact path or bytes cross this feed. */
export function projectRunTranscript(
  run: Run,
  artifacts: readonly Artifact[],
  steps: readonly StepRecord[] = [],
): RunTranscriptProjection {
  const items: RunTranscriptItem[] = [];
  const result = run.result;
  const terminal = TERMINAL.has(run.status);
  if (run.status in WAITING_LABELS)
    items.push({
      kind: "waiting",
      state: run.status as keyof typeof WAITING_LABELS,
      label: WAITING_LABELS[run.status as keyof typeof WAITING_LABELS],
    });
  const answer =
    typeof result?.report === "string"
      ? result.report
      : typeof result?.answer === "string"
        ? result.answer
        : null;
  if (terminal && answer?.trim()) items.push({ kind: "answer", text: answer, terminal: true });
  if (run.status === "completed" && run.config?.implementation === "agent-loop") {
    const proposal = InlineAssistTextSchema.safeParse(result?.textProposal);
    if (proposal.success) items.push({ kind: "text-proposal", text: proposal.data, terminal: true });
  }
  const safeSteps = steps
    .filter((item) => item.runId === run.runId && /^[a-zA-Z][a-zA-Z0-9._-]{0,59}$/.test(item.op))
    .sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId));
  if (safeSteps.length)
    items.push({
      kind: "tool-summary",
      total: safeSteps.length,
      omitted: Math.max(0, safeSteps.length - MAX_TOOLS),
    });
  for (const step of safeSteps.slice(-MAX_TOOLS)) {
    items.push({
      kind: "tool",
      op: DISPLAYABLE_TOOL_OPS.has(step.op) ? step.op : "other",
      status: step.outcome?.status ?? "running",
    });
  }

  const scoped = artifacts
    .filter((artifact) => artifact.runId === run.runId && artifact.status === "complete")
    .sort((a, b) => a.createdAt - b.createdAt || a.artifactId.localeCompare(b.artifactId));
  const byId = new Set(scoped.map((artifact) => artifact.artifactId));
  // S5 records citations only after exact quote verification. Other engines'
  // arbitrary result objects do not acquire that trust by using the same key.
  if (terminal && run.config?.implementation === "agent-loop" && Array.isArray(result?.citations)) {
    for (const value of result.citations.slice(0, 32)) {
      if (!value || typeof value !== "object") continue;
      const citation = value as Record<string, unknown>;
      if (
        typeof citation.observationId !== "string" ||
        !citation.observationId.trim() ||
        citation.observationId.length > 200 ||
        typeof citation.quote !== "string" ||
        !citation.quote.trim() ||
        citation.quote.length > 4_000
      )
        continue;
      items.push({
        kind: "citation",
        observationId: citation.observationId,
        quote: citation.quote,
        ...(byId.has(citation.observationId) ? { artifactId: citation.observationId } : {}),
      });
    }
  }

  for (const artifact of scoped.slice(-20))
    items.push({
      kind: "artifact",
      artifactId: artifact.artifactId,
      mediaType: artifact.mediaType,
      size: artifact.size,
      status: "complete",
    });

  const failureAction = run.failure?.action;
  if (run.status === "needs_input")
    items.push({
      kind: "recovery",
      state: "needs_input",
      description: run.statusMessage ?? "Aux is waiting for your answer.",
      action: "answer",
    });
  else if (run.status === "paused")
    items.push({
      kind: "recovery",
      state: "paused",
      description: run.statusMessage ?? "This run is paused.",
      action: "wait",
    });
  else if (run.status === "partially_completed")
    items.push({
      kind: "recovery",
      state: "partially_completed",
      description: run.statusMessage ?? "Some work could not be confirmed. Review the recorded result.",
      action: "inspect",
    });
  else if (run.status === "interrupted")
    items.push({
      kind: "recovery",
      state: "interrupted",
      description:
        run.statusMessage ?? "This run stopped with an uncertain outcome. Inspect it before retrying.",
      action: "inspect",
    });
  else if (run.status === "failed")
    items.push({
      kind: "recovery",
      state: "failed",
      description: safeMessage(run.failure?.message ?? run.statusMessage, "This run stopped."),
      action:
        failureAction === "retry"
          ? "retry"
          : failureAction === "model_settings"
            ? "settings"
            : failureAction === "edit_request"
              ? "revise"
              : "none",
    });
  if (run.status === "failed" && run.failure)
    items.push({
      kind: "error",
      category: run.failure.category,
      message: safeMessage(run.failure.message, "This run stopped."),
      retryable: run.failure.retryable,
      action: run.failure.action,
    });
  return { runId: run.runId, items };
}
