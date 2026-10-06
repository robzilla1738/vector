import { z } from "zod";
import { TabCommandEnvelopeSchema } from "./tabs.js";
import { CredentialHandoffRequestSchema } from "./safety.js";

/**
 * Authenticated local transport between the Chromium host (native surface owner)
 * and the runtime process (execution authority).
 *
 * native.* methods are implemented by Chromium and called by the runtime.
 * runtime.* notifications travel from Chromium to the runtime.
 */

export const NativePageIdParams = z.object({ pageId: z.string() });
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
  direction: z.enum(["in", "out"]).optional(),
});
export const NativePageSnapshot = z.object({
  pageId: z.string(),
  windowId: z.string().min(1).optional(),
  marker: z.string(),
  url: z.string(),
  title: z.string(),
  active: z.boolean(),
});

/** One cookie from an import; unknown sameSite values fall back to "unspecified". */
export const NativeCookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  domain: z.string(),
  path: z.string().optional(),
  secure: z.boolean().default(false),
  httpOnly: z.boolean().default(false),
  sameSite: z.string().optional(),
  expires: z.number().optional(),
});

/**
 * runtime -> main requests (main implements these). Main parses every call at
 * the process boundary; fields a handler reads must be declared here or zod
 * strips them.
 */
export const NativeMethods = {
  "native.listPages": z.object({}),
  "native.movePage": z.object({
    pageId: z.string(),
    windowId: z.string().min(1).optional(),
    activate: z.boolean().optional(),
  }),
  "native.focusPage": NativePageIdParams,
  "native.findInPage": NativeFindParams,
  "native.stopFind": z.object({ pageId: z.string(), action: z.enum(["clear", "keep"]).default("clear") }),
  "native.setZoom": NativeZoomParams,
  "native.tabCommand": TabCommandEnvelopeSchema,
  "native.recoverPage": z.object({ pageId: z.string(), url: z.string() }),
  "native.stopPage": NativePageIdParams,
  "native.acquireStage": NativePageIdParams.extend({ requiresVisible: z.boolean().optional() }),
  "native.releaseStage": NativePageIdParams,
  /** Cookies are checked one by one — an invalid cookie is skipped, not fatal to the batch. */
  "native.setCookies": z.object({ cookies: z.array(z.unknown()) }),
  "native.storeSecret": z.object({ name: z.string(), value: z.string() }),
  "native.readSecret": z.object({ name: z.string() }),
  "native.captureReadablePage": z.object({
    pageId: z.string().min(1),
    workspaceId: z.string().min(1),
    expectedUrl: z.string().url().max(8192),
  }),
  "native.fillSavedPassword": CredentialHandoffRequestSchema,
} as const;
export type NativeMethodName = keyof typeof NativeMethods;
export type NativeParams<M extends NativeMethodName> = z.output<(typeof NativeMethods)[M]>;

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
  "view.downloadStarted",
  "view.downloadFinished",
  "view.targetReplaced",
] as const;
