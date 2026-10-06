import { AuxError, type MethodName } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
import { resolveNightGoalTask } from "../../features/overnight-review/runtime.js";
import { nightShift } from "../../features/overnight-review/service.js";
async function h_night_shift(ctx: MethodCtx) {
  const { s, method, params, client } = ctx;
  if (method !== "nightShift.propose" && (client.external || client.codeMode))
    throw new AuxError("permission_denied", "Only the person in Aux can queue or review overnight work.");
  const service = nightShift(s);
  const bindQueue = () => {
    if (params.payload?.kind !== "goal") return params;
    const task = resolveNightGoalTask(s, params.payload.goalId);
    if (
      (params.payload.taskId && params.payload.taskId !== task.taskId) ||
      (params.payload.taskRevision && params.payload.taskRevision !== task.revision)
    )
      throw new AuxError("conflict", "Review this goal’s current saved task before queueing.");
    return { ...params, payload: { ...params.payload, taskId: task.taskId, taskRevision: task.revision } };
  };
  if (method === "nightShift.propose") {
    if (client.external && !client.scope)
      throw new AuxError("permission_denied", "Proposals need a reviewed task or workspace connection.");
    const payload = params.payload;
    const routine = payload.kind === "routine" ? ctx.routines.get(payload.routineId).routine : undefined;
    const workspaceId =
      payload.kind === "goal"
        ? ctx.goals.get(payload.goalId).workspaceId
        : (routine?.workspaceId ?? payload.workspaceId);
    if (routine && routine.revision !== payload.revision)
      throw new AuxError("conflict", "This Skill changed before the proposal.");
    if (client.scope?.kind === "task") {
      if (!routine?.sourceTaskId)
        throw new AuxError("permission_denied", "Task connections may propose only their bound Skills.");
      ctx.requireScopedTask(client.scope, routine.sourceTaskId);
    }
    if (
      client.scope &&
      workspaceId &&
      client.scope.kind !== "task" &&
      workspaceId !== client.scope.workspaceId
    )
      throw new AuxError("permission_denied", "This proposal is outside the connection's workspace.");
    return service.propose(bindQueue());
  }
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Only the person in Aux can queue or review overnight work.");
  if (method === "nightShift.queue") return service.queue(bindQueue());
  if (method === "nightShift.review") return service.review(params.id, params.decision);
  if (method === "nightShift.summary") return service.summary();
  return service.list();
}
export const nightShiftMethods: Partial<Record<MethodName, MethodHandler>> = {
  "nightShift.propose": h_night_shift,
  "nightShift.queue": h_night_shift,
  "nightShift.summary": h_night_shift,
  "nightShift.list": h_night_shift,
  "nightShift.review": h_night_shift,
};
