import type { RunWorkTrace } from "@aux/contracts/transcript";
import type { RunTranscriptItem } from "@aux/contracts";
import "./TranscriptActivity.css";
import { nativePoliteLiveProps, nativeAlertRoleProps } from "../ui/native-attribute-props";
import { shellIconCheck, shellIconClose, shellIconRight } from "../ui/icons";

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
  configuration: "Configuration",
  authentication: "Authentication",
  quota: "Usage limit",
  rate_limit: "Rate limit",
  network: "Network",
  timeout: "Timeout",
  provider: "Provider",
  model_output: "Model response",
  capability: "Capability",
  permission: "Permission",
  unknown: "Run",
};
const TOOL_LABELS: Record<string, string> = {
  click: "Clicked a control",
  fill: "Edited a field",
  navigate: "Opened a page",
  snapshot: "Read a page",
  scroll: "Scrolled a page",
  download: "Downloaded a file",
  "tab.open": "Opened a tab",
  "tab.close": "Closed a tab",
  "bookmark.add": "Saved a bookmark",
  "history.visit": "Visited a page",
  "calendar.events.list": "Read calendar events",
};

export function WaitingItem({ item }: { item: Waiting }) {
  return (
    <output className="transcript-waiting" {...nativePoliteLiveProps} data-run-state={item.state}>
      {item.label}
    </output>
  );
}

/** Safe action summaries, plus authorized bounded excerpts from the original work trace. */
export function ToolFold({
  tools,
  summary,
  work,
  onOpenChange,
  loading = false,
  failure,
}: {
  tools: readonly Tool[];
  summary?: Summary;
  work?: RunWorkTrace;
  onOpenChange?(open: boolean): void;
  loading?: boolean;
  failure?: React.ReactNode;
}) {
  if (!tools.length && !work?.calls.length && !onOpenChange) return null;
  const total = summary?.total ?? tools.length;
  return (
    <details className="transcript-tools" onToggle={(event) => onOpenChange?.(event.currentTarget.open)}>
      <summary>
        <span>{work || onOpenChange ? "Recorded work" : `Recorded actions · ${total}`}</span>
        {shellIconRight}
      </summary>
      {loading && <output>Loading recorded work…</output>}
      {failure}
      {work && !work.calls.length && <p>No tool calls recorded in this message window.</p>}
      {work && work.calls.length > 0 ? (
        <ol className="transcript-work-calls">
          {work.calls.map((call) => (
            <li key={`${call.sequence}:${call.toolCallId}`}>
              <details>
                <summary>
                  <span>{call.toolName}</span>
                  <span className="transcript-tool-status">
                    {call.status === "pending"
                      ? "No result recorded"
                      : call.status === "failed"
                        ? "Error recorded"
                        : "Result recorded"}
                  </span>
                  {shellIconRight}
                </summary>
                <div className="transcript-call-content">
                  <span className="sr-only">Recorded input</span>
                  <pre aria-label="Recorded input">{call.input}</pre>
                  {call.inputTruncated && <p>Input excerpt. The complete record is retained in this chat.</p>}
                  {call.output !== undefined && (
                    <>
                      <span className="sr-only">Recorded output</span>
                      <pre aria-label="Recorded output">{call.output}</pre>
                    </>
                  )}
                  {call.outputTruncated && (
                    <p>Output excerpt. The complete record is retained in this chat.</p>
                  )}
                  {call.status === "pending" && (
                    <p>No result was recorded for this call. Inspect its effects before repeating it.</p>
                  )}
                </div>
              </details>
            </li>
          ))}
          {work.omittedCalls > 0 && (
            <li>
              {work.omittedCalls} additional calls in this message window are omitted from this bounded view.
            </li>
          )}
        </ol>
      ) : (
        <ol>
          {tools.map((item, index) => (
            <li key={`${item.op}-${index}`} data-state={item.status}>
              <span className="transcript-tool-icon" aria-hidden="true">
                {item.status === "ok" ? shellIconCheck : item.status === "failed" ? shellIconClose : <span />}
              </span>
              <span>{TOOL_LABELS[item.op] ?? "Recorded action"}</span>{" "}
              <span className="transcript-tool-status">{item.status}</span>
            </li>
          ))}
        </ol>
      )}
      {!work && !!summary?.omitted && (
        <p>{summary.omitted} earlier actions are available in the full run record.</p>
      )}
    </details>
  );
}

export function ErrorItem({ item }: { item: ErrorItem }) {
  return (
    <section
      className="transcript-error"
      {...nativeAlertRoleProps}
      aria-label={`${CATEGORY_LABELS[item.category]} error`}
    >
      <strong>{CATEGORY_LABELS[item.category]} error</strong>
      <p>{item.message}</p>
      <p>{ACTION_GUIDANCE[item.action]}</p>
      {!item.retryable && <p>This run cannot be retried automatically.</p>}
    </section>
  );
}
