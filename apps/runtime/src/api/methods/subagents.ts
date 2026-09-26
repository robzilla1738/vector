import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_subagents_createGroup(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, scope, subagents } = ctx;
  if (client.external && !scope)
    throw new AuxError("permission_denied", "Subagents require a scoped connection.");
  if (method === "subagents.createGroup") return subagents.createGroup(params);
  if (method === "subagents.spawn") return subagents.spawn(params);
  if (method === "subagents.forkSelf") return subagents.forkSelf(params);
  if (method === "subagents.sendMessage")
    return subagents.sendMessage(params.agentId, params.expectedRunId, params.text);
  if (method === "subagents.getGroup") return subagents.view(params.groupId);
  return subagents.cancel(params.agentId);
}

export const subagentsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "subagents.createGroup": h_subagents_createGroup,
  "subagents.spawn": h_subagents_createGroup,
  "subagents.forkSelf": h_subagents_createGroup,
  "subagents.sendMessage": h_subagents_createGroup,
  "subagents.getGroup": h_subagents_createGroup,
  "subagents.cancel": h_subagents_createGroup,
};
