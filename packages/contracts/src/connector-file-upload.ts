import { z } from "zod";
import { PdfSourceSchema } from "./document-jobs.js";
export const ConnectorFileSourceSchema = z.discriminatedUnion("kind", [
  PdfSourceSchema.options[1],
  PdfSourceSchema.options[2],
]);
export type ConnectorFileSource = z.infer<typeof ConnectorFileSourceSchema>;

const source = z
  .object({
    reference: ConnectorFileSourceSchema,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    size: z
      .number()
      .int()
      .min(1)
      .max(20 * 1024 * 1024),
    mediaType: z.string().min(1).max(128),
    filename: z.string().min(1).max(180),
    sourceIdentity: z.string().min(1).max(16_384),
  })
  .strict();
export const ConnectorFileUploadSourceSchema = source;
const slackDestination = z
  .object({
    channelId: z
      .string()
      .regex(/^[CGD][A-Z0-9_]{1,100}$/)
      .optional(),
    initialComment: z.string().min(1).max(20_000).optional(),
  })
  .strict()
  .refine(
    (value) => !value.initialComment || !!value.channelId,
    "Choose a channel before adding a shared-file message.",
  );
export const ConnectorFileUploadInputSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("start"),
      serverId: z.string().uuid(),
      reference: ConnectorFileSourceSchema,
      slack: slackDestination.optional(),
    })
    .strict(),
  z.object({ action: z.literal("continue"), transferId: z.string().uuid() }).strict(),
  z.object({ action: z.literal("inspect"), transferId: z.string().uuid() }).strict(),
]);
export type ConnectorFileUploadInput = z.infer<typeof ConnectorFileUploadInputSchema>;
const phase = z.enum(["allocation", "upload", "completion"]);
const state = z.enum([
  "prepared",
  "waiting",
  "running",
  "uploaded",
  "completed",
  "failed",
  "uncertain",
  "retired",
]);
const instruction = z
  .object({
    url: z.string().url().max(8192),
    headers: z.record(z.string().max(100), z.string().max(8192)),
    encoding: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("raw") }).strict(),
      z
        .object({
          kind: z.literal("multipart"),
          field: z.string().min(1).max(80),
          boundary: z.string().min(24).max(80),
        })
        .strict(),
    ]),
  })
  .strict();
/** Private encrypted runtime record. This schema is never part of public run options or model input. */
export const ConnectorFileTransferRecordSchema = z
  .object({
    transferId: z.string().uuid(),
    runId: z.string().min(1),
    ownerIdentity: z.string().regex(/^[a-f0-9]{64}$/),
    taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(),
    workspaceId: z.string().min(1),
    serverId: z.string().uuid(),
    provider: z.enum(["notion", "slack"]),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    toolsRevision: z.number().int().nonnegative(),
    oauthEpoch: z.number().int().nonnegative(),
    source,
    slack: slackDestination.optional(),
    phase,
    state,
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
    intentIds: z
      .object({
        allocation: z.string().optional(),
        upload: z.string().optional(),
        completion: z.string().optional(),
      })
      .strict()
      .optional(),
    approval: z
      .object({
        approvalId: z.string().min(1),
        identity: z.string().regex(/^[a-f0-9]{64}$/),
        digest: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict()
      .optional(),
    allocation: z
      .object({
        callId: z.string().uuid(),
        fileId: z.string().min(1).max(300).optional(),
        instruction: instruction.optional(),
        expiresAt: z.number().int().nonnegative().optional(),
        response: z.string().max(128_000),
      })
      .strict()
      .optional(),
    upload: z
      .object({
        status: z.number().int(),
        response: z.string().max(65_536),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict()
      .optional(),
    completion: z
      .object({ callId: z.string().uuid(), response: z.string().max(128_000) })
      .strict()
      .optional(),
    notices: z.array(z.unknown()).max(50).optional(),
    error: z.string().max(2000).optional(),
  })
  .strict();
export type ConnectorFileTransferRecord = z.infer<typeof ConnectorFileTransferRecordSchema>;
export const ConnectorFileUploadResultSchema = z
  .object({
    transferId: z.string().uuid(),
    provider: z.enum(["notion", "slack"]),
    phase,
    state,
    source: source.omit({ sourceIdentity: true }),
    receipts: z
      .array(
        z
          .object({
            phase,
            intentId: z.string(),
            status: z.enum(["pending", "confirmed", "uncertain", "not_applied"]),
          })
          .strict(),
      )
      .max(3),
    allocationCallId: z.string().uuid().optional(),
    completionCallId: z.string().uuid().optional(),
    fileId: z.string().max(300).optional(),
    suggestedMarkdown: z.string().max(20_000).optional(),
    notices: z.array(z.unknown()).max(50).optional(),
    error: z.string().max(2000).optional(),
  })
  .strict();
export type ConnectorFileUploadResult = z.infer<typeof ConnectorFileUploadResultSchema>;
