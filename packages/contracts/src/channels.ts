import { z } from "zod";

export const ChannelProviderSchema = z.enum(["slack", "telegram", "discord"]);
const id = z.string().min(1).max(160);
const revision = z.string().uuid();
const token = z
  .string()
  .trim()
  .min(1)
  .max(8192)
  .regex(/^[^\s\r\n]+$/);
export const ChannelCredentialsSchema = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("slack"), botToken: token, appToken: token }).strict(),
  z.object({ provider: z.literal("telegram"), botToken: token }).strict(),
  z.object({ provider: z.literal("discord"), botToken: token }).strict(),
]);
export const ChannelIdentitySchema = z
  .object({
    provider: ChannelProviderSchema,
    botId: id,
    name: z.string().min(1).max(200),
    accountId: id.optional(),
    applicationId: id.optional(),
    username: z.string().max(200).optional(),
  })
  .strict();
export const ChannelOptionsSchema = z
  .object({
    audience: z.enum(["paired", "everyone"]).default("paired"),
    requireMentionsInThreads: z.boolean().default(true),
    followUp: z.enum(["queue", "steer"]).default("queue"),
  })
  .strict();
export const ChannelConnectionSchema = z
  .object({
    connectionId: z.string().uuid(),
    revision,
    provider: ChannelProviderSchema,
    name: z.string().trim().min(1).max(200),
    workspaceId: id,
    enabled: z.boolean(),
    options: ChannelOptionsSchema,
    identity: ChannelIdentitySchema,
    createdAt: z.number().nonnegative(),
    updatedAt: z.number().nonnegative(),
  })
  .strict();
export const ChannelFailureCodeSchema = z.enum([
  "authentication",
  "scope",
  "identity",
  "webhook",
  "rate_limited",
  "network",
  "invalid_response",
  "delivery_unknown",
  "runtime",
]);
export const ChannelStatusSchema = ChannelConnectionSchema.extend({
  status: z.enum(["connecting", "connected", "offline", "needs_attention"]),
  credentialAvailable: z.boolean(),
  errorCode: ChannelFailureCodeSchema.optional(),
  pendingMessages: z.number().int().nonnegative(),
  uncertainDeliveries: z.number().int().nonnegative(),
});
export const ChannelSaveParamsSchema = z
  .object({
    connectionId: z.string().uuid().optional(),
    expectedRevision: revision.nullable(),
    provider: ChannelProviderSchema,
    name: z.string().trim().min(1).max(200),
    workspaceId: id,
    enabled: z.boolean(),
    options: ChannelOptionsSchema,
    credentials: ChannelCredentialsSchema.optional(),
  })
  .strict()
  .refine(
    (input) => !input.credentials || input.credentials.provider === input.provider,
    "Credentials must belong to the selected messenger.",
  );
export const ChannelControlParamsSchema = z
  .object({ connectionId: z.string().uuid(), expectedRevision: revision })
  .strict();
export const ChannelPeerSchema = z
  .object({
    peerKey: id,
    providerUserId: id,
    name: z.string().max(200),
    state: z.enum(["pending", "paired", "blocked"]),
    requestId: z.string().uuid().optional(),
    expiresAt: z.number().nonnegative().optional(),
    createdAt: z.number().nonnegative(),
    updatedAt: z.number().nonnegative(),
  })
  .strict();
export const ChannelPeerControlParamsSchema = ChannelControlParamsSchema.extend({
  peerKey: id,
  action: z.enum(["pair", "block"]),
  requestId: z.string().uuid().optional(),
}).strict();
export const ChannelDeliveryViewSchema = z
  .object({
    deliveryId: z.string().uuid(),
    connectionId: z.string().uuid(),
    state: z.enum(["pending", "sending", "delivered", "failed", "unknown"]),
    errorCode: ChannelFailureCodeSchema.optional(),
    createdAt: z.number().nonnegative(),
    updatedAt: z.number().nonnegative(),
    text: z.string().max(3500),
    peerName: z.string().max(200),
    canRetry: z.boolean(),
    conversationId: id,
  })
  .strict();
export const ChannelDeliveryRetryParamsSchema = ChannelControlParamsSchema.extend({
  deliveryId: z.string().uuid(),
}).strict();
export type ChannelProvider = z.infer<typeof ChannelProviderSchema>;
export type ChannelCredentials = z.infer<typeof ChannelCredentialsSchema>;
export type ChannelIdentity = z.infer<typeof ChannelIdentitySchema>;
export type ChannelOptions = z.infer<typeof ChannelOptionsSchema>;
export type ChannelConnection = z.infer<typeof ChannelConnectionSchema>;
export type ChannelPeer = z.infer<typeof ChannelPeerSchema>;
export type ChannelFailureCode = z.infer<typeof ChannelFailureCodeSchema>;
export type ChannelSaveParams = z.infer<typeof ChannelSaveParamsSchema>;

export const CHANNEL_MAX_ATTACHMENT_BYTES = 20_000_000;
export const ChannelAttachmentSchema = z
  .object({
    attachmentId: id,
    filename: z.string().min(1).max(255),
    kind: z.enum(["document", "image", "audio"]),
    mediaType: z.string().max(100).optional(),
    byteLength: z.number().int().nonnegative().safe().optional(),
    durationSeconds: z.number().finite().nonnegative().optional(),
  })
  .strict();
export type ChannelAttachment = z.infer<typeof ChannelAttachmentSchema>;
export const ChannelReplySchema = z
  .object({
    title: z.string().min(1).max(150).optional(),
    fields: z
      .array(z.object({ label: z.string().min(1).max(80), value: z.string().max(500) }).strict())
      .max(8)
      .optional(),
    buttons: z
      .array(
        z
          .object({
            actionId: z.string().uuid(),
            label: z.string().min(1).max(40),
            command: z.string().min(1).max(600),
            expiresAt: z.number().nonnegative(),
            preferencesRevision: z.number().int().nonnegative(),
            usedBy: id.optional(),
          })
          .strict(),
      )
      .max(5)
      .optional(),
  })
  .strict();
export type ChannelReply = z.infer<typeof ChannelReplySchema>;

/** Provider-authenticated identity; display names never authorize a peer. */
export const ChannelInboundSchema = z
  .object({
    messageId: id,
    peerId: id,
    peerName: z.string().max(200),
    conversationId: id,
    threadId: id.optional(),
    text: z.string().max(20000),
    attachments: z.array(ChannelAttachmentSchema).max(10).optional(),
    interaction: z.object({ actionId: z.string().uuid(), providerMessageId: id }).strict().optional(),
    direct: z.boolean(),
    mentioned: z.boolean(),
    inThread: z.boolean(),
  })
  .strict()
  .refine(
    (input) => Boolean(input.text.trim() || input.attachments?.length || input.interaction),
    "A message needs text, an attachment, or an interaction.",
  )
  .refine(
    (input) =>
      new Set(input.attachments?.map((item) => item.attachmentId) ?? []).size ===
      (input.attachments?.length ?? 0),
    "Attachment identities must be distinct.",
  );
export type ChannelInbound = z.infer<typeof ChannelInboundSchema>;
export const ChannelCursorSchema = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("slack") }).strict(),
  z.object({ provider: z.literal("telegram"), offset: z.number().int().nonnegative() }).strict(),
  z
    .object({
      provider: z.literal("discord"),
      sequence: z.number().int().nonnegative(),
      sessionId: id,
      resumeUrl: z.string().url().max(2048),
    })
    .strict(),
]);
export type ChannelCursor = z.infer<typeof ChannelCursorSchema>;
