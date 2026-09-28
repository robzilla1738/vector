import { EventTypes, type Run } from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { HookExecutor, HookService } from "./hooks.js";

const terminal = new Set<Run["status"]>([
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
  "interrupted",
]);

/** Run updates may repeat; stable lifecycle identities dispatch once per run and event. */
export function installRunEndHooks(events: EventBus, hooks: HookService, execute: HookExecutor): () => void {
  return events.subscribe((event) => {
    if (event.type !== EventTypes.RunUpdated) return;
    const run = event.payload.run as Run | undefined;
    if (!run || !run.config?.contextWorkspaceId) return;
    const phase = run.status === "queued" ? "start" : terminal.has(run.status) ? "end" : undefined;
    if (!phase) return;
    const context = {
      eventId: `run:${run.runId}:${phase}`,
      workspaceId: run.config.contextWorkspaceId,
      event: `run.${phase}` as "run.start" | "run.end",
      runId: run.runId,
      at: phase === "end" ? run.endedAt ?? event.ts : run.createdAt ?? event.ts,
    };
    void hooks.dispatch(context, execute).catch(() => undefined);
  });
}
