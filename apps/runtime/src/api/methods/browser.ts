import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_browser_recovery_list(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Restore browsing sessions in Aux.");
  return method === "browser.recovery.list" ? s.pages.recoveryTabs() : s.pages.retryRestore(params.pageId);
  // history / bookmarks
}

export const browserMethods: Partial<Record<MethodName, MethodHandler>> = {
  "browser.recovery.list": h_browser_recovery_list,
  "browser.recovery.retry": h_browser_recovery_list,
};
