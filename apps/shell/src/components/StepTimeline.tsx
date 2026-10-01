import { memo, useEffect, useState, type ReactNode } from "react";
import type { ActionReceipt, StepRecord } from "@aux/contracts";
import { backgroundLink, browserLinkUrl, openBrowserLink } from "../browser-links";
import { bridge } from "../bridge";
import { errToast } from "../store";
import { shellIconCheck, shellIconClose, shellIconObs, shellIconRight } from "./icons";

export type StepState = "ok" | "failed" | "skipped" | "running";

const SECRET_KEY = /^(value|password|secret|token|passphrase|cookie)$/i;
const playedEntrance = new Map<string, number>();
const MAX_ENTRANCE = 800;

function recordEntrance(id: string) {
  playedEntrance.set(id, Date.now());
  if (playedEntrance.size <= MAX_ENTRANCE) return;
  const oldest = [...playedEntrance.entries()].sort((a, b) => a[1] - b[1]).slice(0, playedEntrance.size - MAX_ENTRANCE);
  for (const [key] of oldest) playedEntrance.delete(key);
}

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
    fillCredential: "Fill credential",
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

/** AUX-016 / Gate F — inspectable effect state. Takeover wins over confirmed. */
export function receiptKind(receipt: ActionReceipt | undefined): "takeover" | "confirmed" | "uncertain" | "" {
  if (!receipt) return "";
  if (receipt.dispatchedBeforeTakeover) return "takeover";
  if (receipt.remoteConfirmed) return "confirmed";
  if (receipt.uncertain) return "uncertain";
  return "";
}

export function receiptLabel(kind: ReturnType<typeof receiptKind>): string {
  if (kind === "takeover") return "Takeover-interrupted";
  if (kind === "confirmed") return "Confirmed";
  if (kind === "uncertain") return "Uncertain";
  return "";
}

export function statusLabel(state: StepState): string {
  if (state === "ok") return "Done";
  if (state === "failed") return "Failed";
  if (state === "skipped") return "Skipped";
  return "Running";
}

function inputsOf(s: StepRecord): Record<string, unknown> {
  return (s.inputs ?? {}) as Record<string, unknown>;
}

export function stepSummary(s: StepRecord): string {
  const inputs = inputsOf(s);
  if (s.outcome?.status === "failed") return s.outcome.error?.message ?? "failed";
  if (s.op === "fillCredential") {
    const ref = typeof inputs.credentialRef === "string" ? inputs.credentialRef : "";
    return ref || "opaque credential";
  }
  if (s.outcome?.detail) return s.outcome.detail;
  if (s.expected) return s.expected;
  if (typeof inputs.url === "string") return inputs.url.replace(/^https?:\/\//, "");
  if (typeof inputs.path === "string") return inputs.path;
  if (typeof inputs.target === "string") return inputs.target;
  if (typeof inputs.value === "string") return `“${inputs.value}”`;
  return "";
}

export type StepChip = { kind: "url" | "path" | "id" | "ref"; value: string };

/** Absolute filesystem paths Aux can already open. Locators and relative names stay inert. */
export function isOpenablePath(value: string): boolean {
  return /^(?:~|\/|[A-Za-z]:[\\/])/.test(value);
}

export function stepChips(s: StepRecord): StepChip[] {
  const inputs = inputsOf(s);
  const chips: StepChip[] = [];
  if (typeof inputs.url === "string" && inputs.url) chips.push({ kind: "url", value: inputs.url });
  if (typeof inputs.path === "string" && inputs.path) chips.push({ kind: "path", value: inputs.path });
  if (typeof inputs.target === "string" && inputs.target) chips.push({ kind: "ref", value: inputs.target });
  if (s.op === "fillCredential" && typeof inputs.credentialRef === "string" && inputs.credentialRef) {
    chips.push({ kind: "id", value: inputs.credentialRef });
  }
  return chips;
}

export function redactedInputs(s: StepRecord): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(inputsOf(s))) {
    if (SECRET_KEY.test(key) || (s.op === "fillCredential" && key === "value")) out[key] = "[redacted]";
    else out[key] = value;
  }
  return out;
}

export function nestSteps(steps: StepRecord[]): { step: StepRecord; children: StepRecord[] }[] {
  const out: { step: StepRecord; children: StepRecord[] }[] = [];
  for (const s of steps) {
    if (s.op === "fillCredential" && out.length) out[out.length - 1]!.children.push(s);
    else out.push({ step: s, children: [] });
  }
  return out;
}

function Chip({ chip }: { chip: StepChip }) {
  if (chip.kind === "url") {
    const href = browserLinkUrl(chip.value);
    if (href) {
      return (
        <a
          className="tl-chip"
          href={href}
          title={chip.value}
          onClick={event => {
            event.preventDefault();
            void openBrowserLink(href, backgroundLink(event)).catch(errToast);
          }}
          onAuxClick={event => {
            if (event.button === 1) {
              event.preventDefault();
              void openBrowserLink(href, true).catch(errToast);
            }
          }}
        >
          {chip.value.replace(/^https?:\/\//, "")}
        </a>
      );
    }
  }
  if (chip.kind === "path" && isOpenablePath(chip.value)) {
    return (
      <button
        type="button"
        className="tl-chip"
        title={chip.value}
        onClick={() => {
          void bridge.openPath(chip.value).then(error => {
            if (error) errToast(new Error(error));
          });
        }}
      >
        {chip.value}
      </button>
    );
  }
  return <code className="tl-chip" title={chip.value}>{chip.value}</code>;
}

const StepCard = memo(function StepCard({
  s,
  live,
  current,
  nested,
  onInspect,
  children,
}: {
  s: StepRecord;
  live: boolean;
  current: boolean;
  nested?: boolean;
  onInspect?: (artifactId: string, step: StepRecord) => void;
  children?: ReactNode;
}) {
  const state = stepState(s);
  const kind = receiptKind(s.outcome?.receipt);
  const receipt = receiptLabel(kind);
  const chips = stepChips(s);
  const obsId = typeof inputsOf(s).obsArtifactId === "string" ? String(inputsOf(s).obsArtifactId) : "";
  const redacted = redactedInputs(s);
  const detailKeys = Object.keys(redacted).filter(key => key !== "obsArtifactId");
  const hasBody = chips.length > 0 || !!s.outcome || detailKeys.length > 0;
  const [open, setOpen] = useState(false);
  const [enter, setEnter] = useState(() => live && !playedEntrance.has(s.stepId));
  useEffect(() => {
    if (!enter) return;
    recordEntrance(s.stepId);
    const timer = window.setTimeout(() => setEnter(false), 400);
    return () => window.clearTimeout(timer);
  }, [enter, s.stepId]);
  return (
    <li className={`tl-step tl-card ${state}${enter ? " enter" : ""}${nested ? " nested" : ""}`} aria-current={current ? "step" : undefined} data-testid="tl-step">
      <span className="tl-dot">
        {state === "ok" ? shellIconCheck : state === "failed" ? shellIconClose : state === "skipped" ? <span className="tl-skip" /> : <span className="live-dot" />}
      </span>
      <div className="tl-body">
        <button className="tl-summary" type="button" aria-expanded={open} disabled={!hasBody} onClick={() => hasBody && setOpen(v => !v)}>
          <span className="tl-op">{opLabel(s.op)}</span>
          <span className="tl-detail" title={stepSummary(s)}>{stepSummary(s)}</span>
          <span className={`tl-status ${state}`}>{statusLabel(state)}</span>
          {hasBody && <span className={`tl-disclosure ${open ? "open" : ""}`} aria-hidden="true">{shellIconRight}</span>}

        </button>
        {receipt && <span className="tl-receipt" data-testid="tl-receipt" data-receipt={kind}>{receipt}</span>}
        {open && (
          <div className="tl-expand">
            {s.outcome && <div className="tl-evidence-summary"><span className="tl-ms nums">{fmtMs(s.outcome.durationMs)}</span>{s.outcome.receipt?.observed && <span>{s.outcome.receipt.observed}</span>}</div>}
            {s.outcome?.error?.code && <code className="tl-code">{s.outcome.error.code}</code>}
            {s.outcome?.receipt?.identity && <div className="tl-identity"><span className="meta-k">Page</span><span className="meta-v">{s.outcome.receipt.identity.pageId}</span><span className="meta-k">Document</span><span className="meta-v">{s.outcome.receipt.identity.documentEpoch}</span>{s.outcome.receipt.identity.generation !== undefined && <><span className="meta-k">Generation</span><span className="meta-v">{s.outcome.receipt.identity.generation}</span></>}{s.outcome.receipt.identity.target && <><span className="meta-k">Target</span><span className="meta-v">{s.outcome.receipt.identity.target}</span></>}</div>}
            {chips.length > 0 && <div className="tl-chips">{chips.map(chip => <Chip key={`${chip.kind}:${chip.value}`} chip={chip} />)}</div>}
            {detailKeys.length > 0 && <pre className="tl-json">{JSON.stringify(redacted, null, 2)}</pre>}
          </div>
        )}
        {children}
      </div>
      {obsId && onInspect && (
        <button className="icon-btn xs tl-obs" title="Show what the agent saw before this step" aria-label="Inspect observation" onClick={() => onInspect(obsId, s)}>
          {shellIconObs}
        </button>
      )}
    </li>
  );
});

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
  const groups = nestSteps(steps);
  const lastId = steps[steps.length - 1]?.stepId;
  return (
    <ol className={`timeline ${compact ? "compact" : ""}`} aria-label="Steps">
      {groups.map(({ step, children }) => (
        <StepCard
          key={step.stepId}
          s={step}
          live={live}
          current={live && step.stepId === lastId && stepState(step) === "running"}
          onInspect={onInspect}
        >
          {children.length > 0 && (
            <ol className="tl-nest" aria-label="Nested steps">
              {children.map(child => (
                <StepCard
                  key={child.stepId}
                  s={child}
                  live={live}
                  nested
                  current={live && child.stepId === lastId && stepState(child) === "running"}
                  onInspect={onInspect}
                />
              ))}
            </ol>
          )}
        </StepCard>
      ))}
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
