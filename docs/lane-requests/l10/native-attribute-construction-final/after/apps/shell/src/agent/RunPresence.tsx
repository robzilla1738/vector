import type { PageTarget, Run } from "@aux/contracts";
import "./RunPresence.css";
import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
} from "../ui/native-attribute-props";

export type RunPresenceState = "working" | "waiting" | "paused" | "human" | "review" | "done";

/** Human control comes from page controller epochs, not a run's descriptive text. */
export function runPresence(run: Run, pages: readonly PageTarget[]): { state: RunPresenceState; label: string; detail: string } {
  const scoped = pages.filter((page) => run.pageIds.includes(page.pageId));
  const held = scoped.filter((page) => page.controller === "human").length;
  if (held && ["queued", "planning", "running", "paused", "needs_input"].includes(run.status))
    return { state: "human", label: "You’re in control", detail: held === 1 ? "Aux waits while you use this page." : `Aux waits while you use ${held} pages.` };
  if (run.status === "needs_input") return { state: "waiting", label: "Needs your input", detail: "Aux is waiting for your decision or answer." };
  if (run.status === "paused") return { state: "paused", label: "Paused", detail: "This run can be resumed." };
  if (run.status === "queued" || run.status === "planning" || run.status === "running")
    return { state: "working", label: "Aux is working", detail: run.config?.taskId ? "Saved task is active." : "Conversation turn is active." };
  if (run.status === "completed") return { state: "done", label: "Done", detail: "The result is ready to review." };
  return { state: "review", label: "Review needed", detail: "Check the run result before retrying." };
}

export function RunPresence({ run, pages, compact = false }: { run: Run; pages: readonly PageTarget[]; compact?: boolean }) {
  const presence = runPresence(run, pages);
  const compactLabel: Record<RunPresenceState, string> = {
    working: "Working", waiting: "Waiting", paused: "Paused", human: "You control", review: "Review", done: "Done",
  };
  return <output className={`agent-presence ${presence.state}${compact ? " compact" : ""}`} aria-label="Task presence" title={presence.detail}>
    <span className="agent-presence-dot" {...auxNativeAriaHiddenProps} />{compact ? compactLabel[presence.state] : presence.label}{run.config?.taskId && !compact ? " · Saved task" : ""}
  </output>;
}
