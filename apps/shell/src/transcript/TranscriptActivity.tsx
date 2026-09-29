import type { RunTranscriptItem } from "@aux/contracts";
import "./TranscriptActivity.css";

type Waiting = Extract<RunTranscriptItem, { kind: "waiting" }>;
type Tool = Extract<RunTranscriptItem, { kind: "tool" }>;
type Summary = Extract<RunTranscriptItem, { kind: "tool-summary" }>;
type ErrorItem = Extract<RunTranscriptItem, { kind: "error" }>;

const ACTION_GUIDANCE: Record<ErrorItem["action"], string> = {
  retry: "Review what happened, then retry if the action is safe to repeat.",
  model_settings: "Check the model connection in Settings.",
  permission_settings: "Review the required permission in Settings.",
  edit_request: "Revise the request and try again.",
  none: "Review the recorded work before continuing.",
};

const CATEGORY_LABELS: Record<ErrorItem["category"], string> = {
  configuration: "Configuration", authentication: "Authentication", quota: "Usage limit",
  rate_limit: "Rate limit", network: "Network", timeout: "Timeout", provider: "Provider",
  model_output: "Model response", capability: "Capability", permission: "Permission", unknown: "Run",
};
const TOOL_LABELS: Record<string, string> = {
  click: "Clicked a control", fill: "Edited a field", navigate: "Opened a page",
  snapshot: "Read a page", scroll: "Scrolled a page", download: "Downloaded a file",
  "tab.open": "Opened a tab", "tab.close": "Closed a tab", "bookmark.add": "Saved a bookmark",
  "history.visit": "Visited a page", "calendar.events.list": "Read calendar events",
};

export function WaitingItem({ item }: { item: Waiting }) {
  return <output className="transcript-waiting" aria-live="polite" data-run-state={item.state}>
    {item.label}
  </output>;
}

/** Step names and statuses only. Inputs, outputs, URLs and page text are never rendered here. */
export function ToolFold({ tools, summary }: { tools: readonly Tool[]; summary?: Summary }) {
  if (!tools.length) return null;
  const total = summary?.total ?? tools.length;
  return <details className="transcript-tools">
    <summary>Recorded actions · {total}</summary>
    <ol>{tools.map((item, index) => <li key={`${item.op}-${index}`}>
      <span>{TOOL_LABELS[item.op] ?? "Recorded action"}</span> <span className="transcript-tool-status">{item.status}</span>
    </li>)}</ol>
    {!!summary?.omitted && <p>{summary.omitted} earlier actions are available in the full run record.</p>}
  </details>;
}

export function ErrorItem({ item }: { item: ErrorItem }) {
  return <section className="transcript-error" role="alert" aria-label={`${CATEGORY_LABELS[item.category]} error`}>
    <strong>{CATEGORY_LABELS[item.category]} error</strong>
    <p>{item.message}</p>
    <p>{ACTION_GUIDANCE[item.action]}</p>
    {!item.retryable && <p>This run cannot be retried automatically.</p>}
  </section>;
}
