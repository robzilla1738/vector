import { z } from "zod";

const uuid = z.string().uuid();
const helperId = z.string().min(1).max(160);
const identity = {
  token: uuid,
  requestId: uuid,
  accountId: z.string().regex(/^[a-f0-9]{64}$/),
  authorizationGeneration: uuid,
  credentialRevision: uuid,
};
const fileIdentity = z.string().regex(/^[1-9][0-9]*$/).max(20);

/** Private runtime IPC. Paths, arbitrary arguments and process IDs are absent. */
export const NativeCopilotPrepareParams = z.object({
  ...identity,
  prepare: z.literal(true),
}).strict();
export const NativeCopilotExecuteParams = z.object({
  ...identity,
  helperId,
  runtimeDevice: fileIdentity,
  runtimeInode: fileIdentity,
  executableDevice: fileIdentity,
  executableInode: fileIdentity,
  homeDevice: fileIdentity,
  homeInode: fileIdentity,
  accessToken: z.string().regex(/^gho_[A-Za-z0-9_]{16,500}$/),
  connectionToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
}).strict();
export const NativeCopilotStartParams = z.union([
  NativeCopilotPrepareParams,
  NativeCopilotExecuteParams,
]);
const receiptIdentity = { requestId: uuid, helperId };
export const NativeCopilotPreparedSchema = z.object({
  ...receiptIdentity,
  state: z.literal("prepared"),
  launched: z.literal(false),
}).strict();
export const NativeCopilotStartedSchema = z.object({
  ...receiptIdentity,
  state: z.enum(["started", "failed"]),
  joined: z.boolean(),
  error: z.string().optional(),
}).strict();
export const NativeCopilotStartSchema = z.union([
  NativeCopilotPreparedSchema,
  NativeCopilotStartedSchema,
]);
export const NativeCopilotEndpointParams = z.object({
  token: uuid, ...receiptIdentity,
}).strict();
export const NativeCopilotEndpointSchema = z.discriminatedUnion("ready", [
  z.object({
    ...receiptIdentity,
    ready: z.literal(true),
    uri: z.string().regex(/^127\.0\.0\.1:[1-9][0-9]{0,4}$/),
  }).strict(),
  z.object({ ...receiptIdentity, ready: z.literal(false) }).strict(),
]);
export const NativeCopilotStopParams = z.object({
  token: uuid,
  requestId: uuid,
  helperId: helperId.optional(),
  reconcile: z.literal(true).optional(),
}).strict();
export const NativeCopilotStoppedSchema = z.discriminatedUnion("launched", [
  z.object({
    ...receiptIdentity,
    joined: z.literal(true),
    launched: z.literal(false),
  }).strict(),
  z.object({
    ...receiptIdentity,
    joined: z.literal(true),
    launched: z.literal(true),
    exitCode: z.number().int(),
    exitSignal: z.number().int(),
  }).strict(),
]);
export type CopilotNativeStart = z.infer<typeof NativeCopilotStartParams>;
export type CopilotNativeStartResult = z.infer<typeof NativeCopilotStartSchema>;
export type CopilotNativeEndpointResult = z.infer<typeof NativeCopilotEndpointSchema>;
export type CopilotNativeStopResult = z.infer<typeof NativeCopilotStoppedSchema>;
