import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_zap_list(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, zap } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Zap site changes require the Aux desktop user.");
  if (method === "zap.list") return zap.list();
  if (method === "zap.grant") return zap.grant(params.origin);
  if (method === "zap.update") return zap.update(params);
  return zap.revoke(params.origin, params.expectedRevision);
}

export const zapMethods: Partial<Record<MethodName, MethodHandler>> = {
  "zap.list": h_zap_list,
  "zap.grant": h_zap_list,
  "zap.update": h_zap_list,
  "zap.revoke": h_zap_list,
};
