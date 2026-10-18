import { AuxError, GoogleMethodSchemas } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
import { normalWindowOwner } from "./normal-window-owner.js";
async function h_google_method(ctx: MethodCtx): Promise<unknown> {
  const owner = await normalWindowOwner(ctx);
  await owner.current();
  const accounts = ctx.s.googleAccounts,
    grants = ctx.s.googleGrants;
  if (!accounts || !grants || !ctx.s.google)
    throw new AuxError("backend_unavailable", "Google connections are unavailable in this runtime.");
  const method = ctx.method as keyof typeof GoogleMethodSchemas;
  if (method === "google.accounts.list") return accounts.list();
  if (method === "google.auth.start")
    return accounts.start({ ...GoogleMethodSchemas[method].parse(ctx.params), checkOwner: owner.current });
  if (method === "google.accounts.revoke") {
    const input = GoogleMethodSchemas[method].parse(ctx.params);
    if (accounts.account(input.connectionId).revision !== input.expectedRevision)
      throw new AuxError("conflict", "The selected Google account changed. Review it again.");
    const result = await accounts.revoke(input.connectionId);
    await owner.current();
    return result;
  }
  if (method === "google.grants.list")
    return grants.list(GoogleMethodSchemas[method].parse(ctx.params).taskId);
  if (method === "google.grants.create") return grants.create(GoogleMethodSchemas[method].parse(ctx.params));
  if (method === "google.grants.revoke") {
    const input = GoogleMethodSchemas[method].parse(ctx.params);
    grants.revoke(input.taskId, input.grantId);
    return { ok: true };
  }
  throw new AuxError("invalid_params", "Unknown Google account operation.");
}

export const googleMethods = {
  "google.accounts.list": h_google_method,
  "google.auth.start": h_google_method,
  "google.accounts.revoke": h_google_method,
  "google.grants.list": h_google_method,
  "google.grants.create": h_google_method,
  "google.grants.revoke": h_google_method,
} satisfies Partial<Record<import("@aux/contracts").MethodName, MethodHandler>>;
