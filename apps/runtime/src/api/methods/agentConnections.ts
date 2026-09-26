import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_agentConnections_list(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Connections can only be managed in Aux Settings");
  if (!s.agentConnections)
    throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
  return s.agentConnections.list();
}
async function h_agentConnections_create(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Connections can only be created in Aux Settings");
  if (!s.agentConnections)
    throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
  return s.agentConnections.create(params);
}
async function h_agentConnections_revoke(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Connections can only be revoked in Aux Settings");
  if (!s.agentConnections)
    throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
  const revoked = s.agentConnections.revoke(params.connectionId);
  // S6.7 — revoking the token ends its session run, same as a cancelled agent.
  s.externalSessions?.end(params.connectionId, "cancelled", "Connection revoked");
  return revoked;
}

export const agentConnectionsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "agentConnections.list": h_agentConnections_list,
  "agentConnections.create": h_agentConnections_create,
  "agentConnections.revoke": h_agentConnections_revoke,
};
