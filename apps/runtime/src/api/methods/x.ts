import { AuxError, XMethodSchemas } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
import { normalWindowOwner } from "./normal-window-owner.js";
async function h_x_method(ctx: MethodCtx): Promise<unknown> {
  const owner = await normalWindowOwner(ctx);
  await owner.current();
  const accounts = ctx.s.xAccounts,
    grants = ctx.s.xGrants;
  if (!accounts || !grants || !ctx.s.x)
    throw new AuxError("backend_unavailable", "X connections are unavailable in this runtime.");
  const method = ctx.method as keyof typeof XMethodSchemas;
  if (method === "x.accounts.list") {
    await accounts.ready();
    await owner.current();
    return accounts.list();
  }
  if (method === "x.auth.start")
    return accounts.start({ ...XMethodSchemas[method].parse(ctx.params), checkOwner: owner.current });
  if (method === "x.accounts.revoke") {
    const input = XMethodSchemas[method].parse(ctx.params);
    if (accounts.account(input.connectionId).revision !== input.expectedRevision)
      throw new AuxError("conflict", "The selected X account changed. Review it again.");
    const result = await accounts.revoke(input.connectionId);
    await owner.current();
    return result;
  }
  if (method === "x.grants.list") return grants.list(XMethodSchemas[method].parse(ctx.params).taskId);
  if (method === "x.grants.create") return grants.create(XMethodSchemas[method].parse(ctx.params));
  if (method === "x.grants.revoke") {
    const input = XMethodSchemas[method].parse(ctx.params);
    grants.revoke(input.taskId, input.grantId);
    return { ok: true };
  }
  throw new AuxError("invalid_params", "Unknown X account operation.");
}

export const xMethods = {
  "x.accounts.list": h_x_method,
  "x.auth.start": h_x_method,
  "x.accounts.revoke": h_x_method,
  "x.grants.list": h_x_method,
  "x.grants.create": h_x_method,
  "x.grants.revoke": h_x_method,
} satisfies Partial<Record<import("@aux/contracts").MethodName, MethodHandler>>;
