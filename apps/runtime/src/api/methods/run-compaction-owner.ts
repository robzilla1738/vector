import { AuxError } from "@aux/contracts";
import type { MethodCtx } from "./context.js";

/** Existing private/normal turns retain their actual native window and coordinator. */
export async function runningCompactionOwner(ctx: MethodCtx, compactionId?: string) {
  const runId = ctx.params.runId as string;
  const native = ctx.s.native,
    caller = ctx.client.nativeTurnContext;
  const read = native?.turnSourceContext;
  const source = ctx.s.repo.getRun(runId);
  const token = source?.config?.nativeTurnContext;
  const control = ctx.s.runs.coordinator.controls.get(runId);
  const request = control?.contextCompaction?.active ?? control?.contextCompaction?.pending;
  const check = () => {
    const current = ctx.s.repo.getRun(runId);
    const pending = control?.contextCompaction?.active ?? control?.contextCompaction?.pending;
    if (
      ctx.client.external ||
      ctx.client.codeMode ||
      !caller ||
      !token ||
      !read ||
      !control ||
      control.abort.signal.aborted ||
      ctx.s.runs.coordinator.controls.get(runId) !== control ||
      !current ||
      current.config?.nativeTurnContext !== token ||
      current.config.implementation !== "agent-loop" ||
      (compactionId
        ? !request || pending !== request || request.id !== compactionId
        : current.status !== "running" || control.paused)
    )
      throw new AuxError("permission_denied", "Use this conversation's original Aux window and active turn.");
  };
  check();
  const current = async () => {
    check();
    const [requestingWindow, originalWindow] = await Promise.all([
      read!.call(native, caller!),
      read!.call(native, token!),
    ]);
    check();
    if (requestingWindow.windowId !== originalWindow.windowId)
      throw new AuxError("permission_denied", "This conversation belongs to another Aux window.");
  };
  await current();
  return { current };
}
