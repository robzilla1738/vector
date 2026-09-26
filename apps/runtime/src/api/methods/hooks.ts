import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_hooks_register(ctx: MethodCtx): Promise<unknown> {
  const { client, hooks, method, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Hooks are managed in Aux.");
  if (method === "hooks.register") return hooks.register(params);
  if (method === "hooks.get") return hooks.get(params.hookId);
  if (method === "hooks.list") return hooks.list(params.workspaceId);
  if (method === "hooks.approve") return hooks.approve(params.hookId, params.expectedDigest);
  if (method === "hooks.revoke") return hooks.revoke(params.hookId);
  return hooks.invocations(params.hookId, params.limit);
}

export const hooksMethods: Partial<Record<MethodName, MethodHandler>> = {
  "hooks.register": h_hooks_register,
  "hooks.get": h_hooks_register,
  "hooks.list": h_hooks_register,
  "hooks.approve": h_hooks_register,
  "hooks.revoke": h_hooks_register,
  "hooks.invocations": h_hooks_register,
};
