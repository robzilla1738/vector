import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_chrome_importCookies(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.importCookies(params);
}
async function h_chrome_openLive(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const page = s.pages.get(params.pageId);
  const chrome = s.drivers().chrome;
  if (page.backend !== "chrome") throw new AuxError("invalid_params", "not a chrome page");
  await chrome?.activateTarget?.(page.targetId);
  return { ok: true };

  // models / settings
}

export const chromeMethods: Partial<Record<MethodName, MethodHandler>> = {
  "chrome.importCookies": h_chrome_importCookies,
  "chrome.openLive": h_chrome_openLive,
};
