import { memo } from "react";
import type { StepRecord } from "@vector/contracts";
import { I } from "./icons";

export type StepState = "ok" | "failed" | "skipped" | "running";

export function stepState(s: StepRecord): StepState {
  if (!s.outcome) return "running";
  return s.outcome.status;
}

/** "812 ms" / "2.0 s" — tabular, never more than three significant digits. */
export function fmtMs(ms: number | undefined): string {
  if (ms == null) return "";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms / 1000)} s`;
}

/** Human label for a program op — the verb the agent performed. */
export function opLabel(op: string): string {
  const map: Record<string, string> = {
    navigate: "Open",
    back: "Back",
    forward: "Forward",
    reload: "Reload",
    click: "Click",
    dblclick: "Double-click",
    hover: "Hover",
    fill: "Fill",
    type: "Type",
    press: "Press",
    check: "Check",
    uncheck: "Uncheck",
    select: "Select",
    scroll: "Scroll",
    dragTo: "Drag",
    clickPoint: "Click point",
    waitFor: "Wait",
    screenshot: "Screenshot",
    extract: "Extract",
    upload: "Upload",
    expectDownload: "Download",
    collectScroll: "Collect",
    dialog: "Dialog",
    evaluate: "Evaluate",
    observe: "Observe",
  };
  return map[op] ?? op;
}

export function stepSummary(s: StepRecord): string {
  const inputs = (s.inputs ?? {}) as Record<string, unknown>;
  if (s.outcome?.status === "failed") return s.outcome.error?.message ?? "failed";
  if (s.outcome?.detail) return s.outcome.detail;
  if (s.expected) return s.expected;
  if (typeof inputs.url === "string") return inputs.url.replace(/^https?:\/\//, "");
  if (typeof inputs.target === "string") return inputs.target;
  if (typeof inputs.value === "string") return `“${inputs.value}”`;
  return "";
}

export const StepTimeline = memo(function StepTimeline({
  steps,
  live,
  onInspect,
  compact,
}: {
  steps: StepRecord[];
  /** the run is still going — the last unfinished step is marked current */
  live: boolean;
  onInspect?: (artifactId: string, step: StepRecord) => void;
  compact?: boolean;
}) {
  if (steps.length === 0) {
    return (
      <ol className={`timeline ${compact ? "compact" : ""}`} aria-label="Steps">
        {live && (
          <li className="tl-step running" aria-current="step">
            <span className="tl-dot"><span className="live-dot" /></span>
            <span className="tl-body">
              <span className="tl-op">Observing</span>
              <span className="tl-detail">Reading the page before the first step</span>
            </span>
          </li>
        )}
      </ol>
    );
  }
  return (
    <ol className={`timeline ${compact ? "compact" : ""}`} aria-label="Steps">
      {steps.map((s, i) => {
        const state = stepState(s);
        const obsId = (s.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId;
        const last = i === steps.length - 1;
        return (
          <li key={s.stepId} className={`tl-step ${state}`} aria-current={live && last && state === "running" ? "step" : undefined} data-testid="tl-step">
            <span className="tl-dot">
              {state === "ok" ? I.check : state === "failed" ? I.close : state === "skipped" ? <span className="tl-skip" /> : <span className="live-dot" />}
            </span>
            <span className="tl-body">
              <span className="tl-head">
                <span className="tl-op">{opLabel(s.op)}</span>
                {s.outcome && <span className="tl-ms nums">{fmtMs(s.outcome.durationMs)}</span>}
              </span>
              <span className="tl-detail" title={stepSummary(s)}>{stepSummary(s)}</span>
              {state === "failed" && s.outcome?.error?.code && <span className="tl-code">{s.outcome.error.code}</span>}
            </span>
            {obsId && onInspect && (
              <button className="icon-btn xs tl-obs" title="Show what the agent saw before this step" aria-label="Inspect observation" onClick={() => onInspect(obsId, s)}>
                {I.obs}
              </button>
            )}
          </li>
        );
      })}
      {live && steps[steps.length - 1]?.outcome && (
        <li className="tl-step running" aria-current="step">
          <span className="tl-dot"><span className="live-dot" /></span>
          <span className="tl-body">
            <span className="tl-op">Thinking</span>
            <span className="tl-detail">Planning the next step</span>
          </span>
        </li>
      )}
    </ol>
  );
});
