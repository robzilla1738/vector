import { AuxError } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
function library(ctx: MethodCtx) {
  if (!ctx.s.auxPackages) throw new AuxError("capability_unsupported", "Aux Packages are unavailable.");
  return ctx.s.auxPackages;
}
async function owner(ctx: MethodCtx) {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token || !ctx.s.native?.turnSourceContext)
    throw new AuxError("permission_denied", "Manage Aux Packages from the original Aux window.");
  const original = await ctx.s.native.turnSourceContext(token);
  return async () => {
    const current = await ctx.s.native!.turnSourceContext!(token);
    if (current.windowId !== original.windowId)
      throw new AuxError("permission_denied", "The original Aux Packages window changed.");
  };
}
async function h_packages_list(ctx: MethodCtx) {
  return library(ctx).list();
}
async function h_packages_install(ctx: MethodCtx) {
  const checkOwner = await owner(ctx);
  return library(ctx).install(ctx.params.path, checkOwner);
}
async function h_packages_remove(ctx: MethodCtx) {
  await owner(ctx);
  return library(ctx).remove(ctx.params.name);
}
async function h_packages_defaults(ctx: MethodCtx) {
  const checkOwner = await owner(ctx);
  return library(ctx).setDefaults(ctx.params.names, checkOwner);
}
export const packagesMethods: Record<string, MethodHandler> = {
  "packages.list": h_packages_list,
  "packages.install": h_packages_install,
  "packages.remove": h_packages_remove,
  "packages.defaults": h_packages_defaults,
};
