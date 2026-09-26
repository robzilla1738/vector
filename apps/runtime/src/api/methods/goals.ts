import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_goals_create(ctx: MethodCtx): Promise<unknown> {
  const { client, goals, method, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Goals are managed in Aux.");
  if (method === "goals.create") return goals.create(params);
  if (method === "goals.get") return goals.get(params.goalId);
  if (method === "goals.list") return goals.list(params.workspaceId, params.limit);
  if (method === "goals.start") return goals.start(params.goalId, params.pageIds);
  if (method === "goals.pause") return goals.pause(params.goalId);
  if (method === "goals.resume") return goals.resume(params.goalId);
  return goals.cancel(params.goalId);
}

export const goalsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "goals.create": h_goals_create,
  "goals.get": h_goals_create,
  "goals.list": h_goals_create,
  "goals.start": h_goals_create,
  "goals.pause": h_goals_create,
  "goals.resume": h_goals_create,
  "goals.cancel": h_goals_create,
};
