import { AuxError } from "@aux/contracts";
import { DesktopContextMethodSchemas } from "@aux/contracts/desktop-context";
import type { MethodCtx, MethodHandler } from "./context.js";
import { normalWindowOwner } from "./normal-window-owner.js";

async function h_desktop_context(ctx: MethodCtx): Promise<unknown> {
  const owner = await normalWindowOwner(ctx);
  const service = ctx.s.desktopContext;
  if (!service)
    throw new AuxError("backend_unavailable", "Desktop context requires a supported Aux desktop host.");
  await owner.current();
  const token = ctx.client.nativeTurnContext!;
  const method = ctx.method as keyof typeof DesktopContextMethodSchemas;
  const raw = ctx.params;
  if (method === "desktopContext.settings") return service.snapshot();
  if (method === "desktopContext.apps") return service.apps(token);
  if (method === "desktopContext.configure") {
    const input = DesktopContextMethodSchemas[method].parse(raw);
    return service.configure(input.expectedRevision, input.settings, token, owner.current);
  }
  if (method === "desktopContext.permission") {
    const input = DesktopContextMethodSchemas[method].parse(raw);
    return service.permission(input.expectedRevision, input.kind, token, owner.current);
  }
  if (method === "desktopContext.pause") {
    const input = DesktopContextMethodSchemas[method].parse(raw);
    return service.pause(input.expectedRevision, input.paused, token, owner.current);
  }
  if (method === "desktopContext.forget") {
    const input = DesktopContextMethodSchemas[method].parse(raw);
    return service.forget(
      input.workspaceId,
      input.expectedRevision,
      input.appBundleId,
      input.captureId,
      owner.current,
      token,
    );
  }
  // Reads belong to the original normal window; validate it again after the
  // source operation before returning text to a document that may have closed.
  let result: unknown;
  if (method === "desktopContext.sources") {
    const input = DesktopContextMethodSchemas[method].parse(raw);
    result = await service.sources(input.workspaceId, input.appBundleId, input.cursor, input.limit, undefined, undefined, true);
  } else if (method === "desktopContext.search")
    result = await service.search(DesktopContextMethodSchemas[method].parse(raw), undefined, undefined, true);
  else if (method === "desktopContext.read")
    result = await service.read(DesktopContextMethodSchemas[method].parse(raw), undefined, undefined, true);
  else throw new AuxError("invalid_params", "Unknown desktop context operation.");
  await owner.current();
  return result;
}
export const desktopContextMethods = {
  "desktopContext.settings": h_desktop_context,
  "desktopContext.apps": h_desktop_context,
  "desktopContext.configure": h_desktop_context,
  "desktopContext.permission": h_desktop_context,
  "desktopContext.pause": h_desktop_context,
  "desktopContext.sources": h_desktop_context,
  "desktopContext.search": h_desktop_context,
  "desktopContext.read": h_desktop_context,
  "desktopContext.forget": h_desktop_context,
} satisfies Partial<Record<import("@aux/contracts").MethodName, MethodHandler>>;
