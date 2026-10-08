import type { MethodCtx, MethodHandler } from "./context.js";
import { AuxError, type MethodName } from "@aux/contracts";

async function h_spaces_list(ctx: MethodCtx): Promise<unknown> {
  const { spaces, host, s } = ctx;
  if (host !== "chromium-fork") return spaces.list();
  if (!s.native?.organizationSnapshot)
    throw new AuxError("backend_unavailable", "Native Space organization is unavailable.");
  return spaces.reconcileNative(await s.native.organizationSnapshot());
}

export const spacesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "spaces.list": h_spaces_list,
};
