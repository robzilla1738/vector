import { EventTypes, type Run } from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { HookExecutor, HookService } from "./hooks.js";

const started = new Set<Run["status"]>(["queued", "planning", "running", "paused", "needs_input"]);
const terminal = new Set<Run["status"]>([
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
  "interrupted",
]);

/** Active updates share run.start, and terminal updates share run.end. Repeats dispatch once. */
export function installRunEndHooks(events: EventBus, hooks: HookService, execute: HookExecutor): () => void {
  return events.subscribe((event) => {
    if (event.type !== EventTypes.RunUpdated) return;
    const run = event.payload.run as Run | undefined;
    if (!run || !run.config?.contextWorkspaceId) return;
    const phase = started.has(run.status) ? "start" : terminal.has(run.status) ? "end" : undefined;
    if (!phase) return;
    const context = {
      eventId: `run:${run.runId}:${phase}`,
      workspaceId: run.config.contextWorkspaceId,
      event: `run.${phase}` as "run.start" | "run.end",
      runId: run.runId,
      at: phase === "end" ? (run.endedAt ?? event.ts) : (run.createdAt ?? event.ts),
    };
    void hooks.dispatch(context, execute).catch(() => undefined);
  });
}
