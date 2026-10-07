import { z } from "zod";
const id = z.string().uuid();
const dimensions = { cols: z.number().int().min(2).max(500), rows: z.number().int().min(1).max(300) };
export const TerminalClientSchema = z.enum(["claude", "codex"]);
export const TerminalStartParams = z
  .object({ workspaceId: z.string().min(1), folderId: id, client: TerminalClientSchema, ...dimensions })
  .strict();
export const TerminalSessionSchema = z
  .object({
    terminalId: id,
    workspaceId: z.string().min(1),
    folderId: id,
    client: TerminalClientSchema,
    state: z.enum(["running", "closing", "closed"]),
    ...dimensions,
  })
  .strict();
export const TerminalReadParams = z
  .object({ terminalId: id, offset: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) })
  .strict();
export const TerminalReadResultSchema = z
  .object({
    terminalId: id,
    offset: z.number().int().nonnegative(),
    nextOffset: z.number().int().nonnegative(),
    data: z.string().max(87384),
    encoding: z.literal("base64"),
    state: z.enum(["running", "closing", "closed"]),
    exitCode: z.number().int().optional(),
  })
  .strict();
export const TerminalInputParams = z
  .object({
    terminalId: id,
    sequence: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    data: z.string().min(1).max(16384),
  })
  .strict();
export const TerminalInputResultSchema = z
  .object({ terminalId: id, nextSequence: z.number().int().nonnegative() })
  .strict();
export const TerminalResizeParams = z.object({ terminalId: id, ...dimensions }).strict();
export const TerminalCloseParams = z.object({ terminalId: id }).strict();
export const NativeTerminalStartParams = TerminalStartParams.extend({
  token: id,
  terminalId: id,
  executable: z.string().min(1).max(4096),
  cwd: z.string().min(1).max(4096),
  rootDevice: z
    .string()
    .regex(/^[0-9]+$/)
    .max(32),
  rootInode: z
    .string()
    .regex(/^[0-9]+$/)
    .max(32),
}).strict();
export const NativeTerminalReadParams = TerminalReadParams.extend({ token: id }).strict();
export const NativeTerminalInputParams = TerminalInputParams.extend({ token: id }).strict();
export const NativeTerminalResizeParams = TerminalResizeParams.extend({ token: id }).strict();
export const NativeTerminalCloseParams = TerminalCloseParams.extend({ token: id }).strict();
export type TerminalStart = z.infer<typeof TerminalStartParams>;
export type TerminalSession = z.infer<typeof TerminalSessionSchema>;
export type TerminalRead = z.infer<typeof TerminalReadResultSchema>;

export const TerminalListenersParams = TerminalCloseParams;
export const TerminalListenersSchema = z
  .object({
    terminalId: id,
    listeners: z.array(z.object({ listenerId: id, url: z.string().url().max(2048) }).strict()).max(32),
  })
  .strict();
export const TerminalPreviewParams = z
  .object({ terminalId: id, listenerId: id, protocol: z.enum(["http", "https"]) })
  .strict();
export const TerminalPreviewCloseParams = z.object({ terminalId: id, previewId: id }).strict();
export const TerminalPreviewSchema = z
  .object({
    terminalId: id,
    previewId: id,
    contentId: z.string().min(1).max(160),
    url: z.string().url().max(2048),
  })
  .strict();
export const TerminalPreviewClosedSchema = z.object({ closed: z.literal(true) }).strict();
export const NativeTerminalListenersParams = TerminalListenersParams.extend({ token: id }).strict();
export const NativeTerminalPreviewParams = TerminalPreviewParams.extend({
  token: id,
  previewId: id,
}).strict();
export const NativeTerminalPreviewCloseParams = TerminalPreviewCloseParams.extend({ token: id }).strict();
export type TerminalPreview = z.infer<typeof TerminalPreviewSchema>;
