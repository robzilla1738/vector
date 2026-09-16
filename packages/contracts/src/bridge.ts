import { z } from "zod";

/**
 * Internal transport between the Electron main process (native surface owner)
 * and the runtime process (execution authority). Carried over fork IPC or a
 * loopback socket — the schema is identical either way.
 *
 * native.* methods are implemented BY the main process and called by runtime.
 * runtime.* notifications travel main -> runtime.
 */

export const NativeCreatePageParams = z.object({
  pageId: z.string(),
  marker: z.string().describe("target marker injected into every document"),
  url: z.string(),
  background: z.boolean().default(false),
  kind: z.enum(["chromium", "engine"]).default("chromium"),
});
export const NativeSetBoundsParams = z.object({
  pageId: z.string(),
  bounds: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).nullable(),
});
export const NativePageIdParams = z.object({ pageId: z.string() });
export const NativeCaptureParams = z.object({
  pageId: z.string(),
  /** scale factor for thumbnails, e.g. 0.25 */
  scale: z.number().positive().max(1).default(0.25),
});
export const NativeFindParams = z.object({
  pageId: z.string(),
  text: z.string(),
  forward: z.boolean().default(true),
  findNext: z.boolean().default(false),
});
export const NativeZoomParams = z.object({
  pageId: z.string(),
  level: z.number().optional(),
  delta: z.number().optional(),
  reset: z.boolean().optional(),
});

/** runtime -> main requests (main implements these) */
export const NativeMethods = {
  "native.createPage": NativeCreatePageParams,
  "native.closePage": NativePageIdParams,
  "native.showPage": NativeSetBoundsParams,
  "native.hidePage": NativePageIdParams,
  "native.focusPage": NativePageIdParams,
  "native.capturePage": NativeCaptureParams,
  "native.setEngineFrame": z.object({ pageId: z.string(), dataUrl: z.string() }),
  "native.openExternal": z.object({ url: z.string() }),
  "native.findInPage": NativeFindParams,
  "native.stopFind": z.object({ pageId: z.string(), action: z.enum(["clear", "keep"]).default("clear") }),
  "native.setZoom": NativeZoomParams,
  "native.print": NativePageIdParams,
} as const;
export type NativeMethodName = keyof typeof NativeMethods;

/** main -> runtime notifications */
export const RuntimeNotifications = [
  "view.navigated",
  "view.titleChanged",
  "view.faviconChanged",
  "view.loading",
  "view.crashed",
  "view.removed",
  "view.popup",
  "view.takeover",
  "view.engineInput",
  "view.downloadStarted",
  "view.downloadFinished",
  "view.targetReplaced",
] as const;
