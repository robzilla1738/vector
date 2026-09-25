import { z } from "zod";

const id = z.string().trim().min(1).max(200);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const absolutePath = z.string().min(1).max(4096).refine(path => path.startsWith("/") && !path.includes("\0"));

/** Native launchers must apply every field before spawning a project command. */
export const CommandSeatbeltProfileSchema = z.object({
  version: z.literal(1),
  sessionId: id,
  projectId: id,
  readableRoots: z.array(absolutePath).min(1).max(32),
  writableRoots: z.array(absolutePath).max(16),
  network: z.boolean(),
  allowProcessSpawn: z.boolean(),
  expiresAt: z.number().int().positive(),
}).strict();
export type CommandSeatbeltProfile = z.infer<typeof CommandSeatbeltProfileSchema>;

export const CommandSeatbeltPrepareSchema = z.object({
  projectId: id,
  taskId: id,
  taskRevision: z.number().int().positive(),
  sessionId: id,
  commandSha256: digest,
  requestedProfile: CommandSeatbeltProfileSchema,
}).strict();
export type CommandSeatbeltPrepare = z.infer<typeof CommandSeatbeltPrepareSchema>;

/** The host issues this only after deriving effective roots from its project catalog. */
export const CommandSeatbeltPermitSchema = z.object({
  capabilityId: id,
  commandSha256: digest,
  /** Native-derived policy actually applied by the launcher, for review and audit. */
  effectiveProfile: CommandSeatbeltProfileSchema,
  expiresAt: z.number().int().positive(),
}).strict();
export type CommandSeatbeltPermit = z.infer<typeof CommandSeatbeltPermitSchema>;

export const CommandEscalationRequestSchema = z.object({
  requestId: id,
  taskId: id,
  projectId: id,
  sessionId: id,
  commandSha256: digest,
  commandPreview: z.string().trim().min(1).max(8000),
  justification: z.string().trim().min(1).max(2000),
  requestedProfile: CommandSeatbeltProfileSchema,
  prefixRule: z.string().trim().min(1).max(200).optional(),
  createdAt: z.number().int().nonnegative(),
  expiresAt: z.number().int().positive(),
}).strict();
export type CommandEscalationRequest = z.infer<typeof CommandEscalationRequestSchema>;

export const CommandEscalationDecisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approveOnce"), requestId: id, expectedCommandSha256: digest }).strict(),
  z.object({ decision: z.literal("approvePrefix"), requestId: id, expectedCommandSha256: digest }).strict(),
  z.object({ decision: z.literal("decline"), requestId: id, expectedCommandSha256: digest }).strict(),
]);
export type CommandEscalationDecision = z.infer<typeof CommandEscalationDecisionSchema>;
