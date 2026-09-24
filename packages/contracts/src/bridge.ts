import { z } from "zod";
import { ProjectCommandSchema, ProjectCommandTaskSchema, ProjectCommitRequestSchema, ProjectGithubStatusSchema, ProjectReviewContextSchema } from "./local-projects.js";
import { TabCommandEnvelopeSchema } from "./tabs.js";

/**
 * Internal transport between the Electron main process (native surface owner)
 * and the runtime process (execution authority). Carried over fork IPC or a
 * loopback socket — the schema is identical either way.
 *
 * native.* methods are implemented BY the main process and called by runtime.
 * runtime.* notifications travel main -> runtime.
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
  name: z.string(), value: z.string(), domain: z.string(), path: z.string().optional(),
  secure: z.boolean().default(false), httpOnly: z.boolean().default(false),
  sameSite: z.string().optional(), expires: z.number().optional(),
});
const ProjectParams = z.object({ projectId: z.string().min(1) });
const ProjectFileParams = ProjectParams.extend({ name: z.string().min(1) });

/**
 * runtime -> main requests (main implements these). Main parses every call at
 * the process boundary; fields a handler reads must be declared here or zod
 * strips them.
 */
export const NativeMethods = {
  "native.listPages": z.object({}),
  "native.movePage": z.object({ pageId: z.string(), windowId: z.string().min(1).optional(), activate: z.boolean().optional() }),
  "native.focusPage": NativePageIdParams,
  "native.findInPage": NativeFindParams,
  "native.stopFind": z.object({ pageId: z.string(), action: z.enum(["clear", "keep"]).default("clear") }),
  "native.setZoom": NativeZoomParams,
  "native.tabCommand": TabCommandEnvelopeSchema,
  "native.recoverPage": z.object({ pageId: z.string(), url: z.string() }),
  "native.stopPage": NativePageIdParams,
  "native.acquireStage": NativePageIdParams,
  "native.releaseStage": NativePageIdParams,
  /** Cookies are checked one by one — an invalid cookie is skipped, not fatal to the batch. */
  "native.setCookies": z.object({ cookies: z.array(z.unknown()) }),
  "native.storeSecret": z.object({ name: z.string(), value: z.string() }),
  "native.readSecret": z.object({ name: z.string() }),
  "native.captureReadablePage": z.object({ pageId: z.string().min(1), expectedUrl: z.string().url().max(8192) }),
  "native.developmentProjects": z.object({ projectIds: z.array(z.string()).default([]) }),
  "native.inspectProject": ProjectParams,
  "native.githubProject": ProjectParams,
  "native.recordGithubStatus": ProjectParams.extend({ status: ProjectGithubStatusSchema }),
  "native.writeIncidentReport": ProjectParams.extend({
    task: ProjectCommandTaskSchema,
    page: z.object({ pageId: z.string(), url: z.string(), title: z.string() }),
    console: z.array(z.object({ level: z.string(), message: z.string(), atMs: z.number().optional() })),
    network: z.array(z.object({ method: z.string(), status: z.number().optional(), url: z.string(), durationMs: z.number().optional(), startedAt: z.number().optional() })),
    operations: z.string().optional(),
  }),
  "native.listProjectFiles": ProjectParams,
  "native.readProjectFile": ProjectFileParams,
  "native.projectSnapshotTree": ProjectParams,
  "native.writeProjectFile": ProjectFileParams.extend({ expectedHash: z.string(), content: z.string(), task: ProjectCommandTaskSchema }),
  "native.createProjectFile": ProjectFileParams.extend({ content: z.string(), task: ProjectCommandTaskSchema }),
  "native.renameProjectFile": ProjectFileParams.extend({ nextName: z.string().min(1), expectedHash: z.string(), task: ProjectCommandTaskSchema }),
  "native.deleteProjectFile": ProjectFileParams.extend({ expectedHash: z.string(), task: ProjectCommandTaskSchema }),
  "native.projectCommands": ProjectParams,
  "native.runProjectCommand": ProjectParams.extend({ command: ProjectCommandSchema.shape.command, mode: ProjectCommandSchema.shape.mode, task: ProjectCommandTaskSchema }),
  "native.approveProjectPreview": ProjectParams.extend({ url: z.string(), task: ProjectCommandTaskSchema }),
  "native.stopProjectCommand": ProjectParams.extend({ commandId: z.string(), task: ProjectCommandTaskSchema }),
  "native.prepareProjectReview": ProjectParams.extend({ task: ProjectReviewContextSchema }),
  "native.commitProject": ProjectParams.extend({ request: ProjectCommitRequestSchema, task: ProjectReviewContextSchema }),
  "native.approveCloudCommand": z.object({
    task: ProjectCommandTaskSchema,
    environment: z.object({ remoteName: z.string(), runtime: z.string(), region: z.string() }),
    executable: z.string(),
    args: z.array(z.string()).default([]),
    mode: z.enum(["command", "service"]).default("command"),
    timeoutMinutes: z.number().optional(),
  }),
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
