import { AuxError } from "@aux/contracts";
import type { MethodCtx } from "./context.js";

/** Native proof belongs to the original normal Aux document through asynchronous work. */
export async function normalWindowOwner(ctx: MethodCtx) {
  const native = ctx.s.native,
    token = ctx.client.nativeTurnContext,
    read = native?.turnSourceContext;
  if (
    ctx.client.external ||
    ctx.client.codeMode ||
    !token ||
    !native ||
    !read ||
    !ctx.s.nativeIdentity ||
    (await ctx.s.nativeIdentity).privateSession
  )
    throw new AuxError("permission_denied", "Use the original normal Aux Settings window.");
  const source = await read.call(native, token);
  return {
    current: async () => {
      const current = await read.call(native, token);
      if (current.windowId !== source.windowId)
        throw new AuxError("permission_denied", "The original Settings window changed.");
    },
  };
}
