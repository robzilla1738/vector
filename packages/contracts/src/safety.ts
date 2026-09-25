import { z } from "zod";

const id = z.string().trim().min(1).max(200);
const origin = z.string().url().refine(value => {
  try { const parsed = new URL(value); return (parsed.protocol === "http:" || parsed.protocol === "https:") && !parsed.username && !parsed.password && parsed.href === `${parsed.origin}/`; }
  catch { return false; }
}, "Use an exact http(s) origin without credentials or a path.");

export const EffectSchema = z.enum(["read", "write", "destructive", "egress", "credential", "external_tool"]);
export type Effect = z.infer<typeof EffectSchema>;
export const OriginAccessSchema = z.enum(["deny", "ask", "allow"]);
export type OriginAccess = z.infer<typeof OriginAccessSchema>;
export const ConfirmationLevelSchema = z.enum(["handoff", "action", "preapprovable", "none"]);
export type ConfirmationLevel = z.infer<typeof ConfirmationLevelSchema>;

export const OriginRuleSchema = z.object({
  origin,
  access: OriginAccessSchema,
  effects: z.partialRecord(EffectSchema, OriginAccessSchema).optional(),
  confirmation: ConfirmationLevelSchema.optional(),
  approvalLifetime: z.enum(["turn", "thread"]).optional(),
  grantLifetime: z.enum(["session", "always"]).optional(),
}).strict();
export type OriginRule = z.infer<typeof OriginRuleSchema>;

export const SafetyActionSchema = z.object({
  profileId: id,
  scope: z.object({ kind: z.enum(["workspace", "task"]), id }).strict(),
  effect: EffectSchema,
  action: id,
  invocationDigest: z.string().regex(/^[a-f0-9]{64}$/),
  origin: origin.optional(),
  recipient: id.optional(),
  turnId: id,
  threadId: id,
  requestedAt: z.number().int().nonnegative(),
}).strict().refine(value => !!value.origin || !!value.recipient, "Name an origin or recipient.");
export type SafetyAction = z.infer<typeof SafetyActionSchema>;

export const StandingGrantSchema = z.object({
  grantId: id,
  profileId: id,
  scope: SafetyActionSchema.shape.scope,
  effect: EffectSchema,
  action: id,
  origin: origin.optional(),
  recipient: id.optional(),
  lifetime: z.enum(["session", "always"]),
  sessionId: id.optional(),
  createdAt: z.number().int().nonnegative(),
  revokedAt: z.number().int().nonnegative().optional(),
}).strict().refine(value => !!value.origin || !!value.recipient, "Name an origin or recipient.");
export type StandingGrant = z.infer<typeof StandingGrantSchema>;

export const ApprovalDecisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("accept"), approvalId: id }).strict(),
  z.object({ decision: z.literal("acceptForSession"), approvalId: id, sessionId: id }).strict(),
  z.object({ decision: z.literal("acceptWithAmendment"), approvalId: id, amendment: z.string().trim().min(1).max(4000) }).strict(),
  z.object({ decision: z.literal("decline"), approvalId: id }).strict(),
  z.object({ decision: z.literal("cancel"), approvalId: id }).strict(),
]);
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

export const AuthorizationProvenanceSchema = z.discriminatedUnion("authorizedBy", [
  z.object({ authorizedBy: z.literal("standing"), grantId: id }).strict(),
  z.object({ authorizedBy: z.literal("approval"), approvalId: id }).strict(),
  z.object({ authorizedBy: z.literal("policy"), policySource: z.enum(["managed", "user", "default"]) }).strict(),
]);
export type AuthorizationProvenance = z.infer<typeof AuthorizationProvenanceSchema>;

export const FinalReviewArtifactSchema = z.object({
  artifactId: id,
  turnId: id,
  action: id,
  invocationDigest: z.string().regex(/^[a-f0-9]{64}$/),
  effect: EffectSchema,
  dataDescription: z.string().trim().min(1).max(2000),
  destination: z.string().trim().min(1).max(2000),
  consequence: z.string().trim().min(1).max(2000),
  createdAt: z.number().int().nonnegative(),
}).strict();
export type FinalReviewArtifact = z.infer<typeof FinalReviewArtifactSchema>;

export const ConfirmationRequestSchema = z.object({
  level: ConfirmationLevelSchema,
  action: SafetyActionSchema,
  review: FinalReviewArtifactSchema.optional(),
  /** The final confirmation must be the sole tool call in its turn. */
  turnToolCallCount: z.number().int().nonnegative(),
}).strict();
export type ConfirmationRequest = z.infer<typeof ConfirmationRequestSchema>;

export const CredentialSelectorSchema = z.string().min(1).max(1000).refine(
  value => [...value].every(character => {
    const code = character.charCodeAt(0);
    return code >= 0x20 && code !== 0x7f;
  }), "Selectors cannot contain control characters.",
);

export const CredentialHandoffRequestSchema = z.object({
  pageId: id,
  expectedUrl: z.string().url().max(8192).refine(value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password && url.href === value;
    } catch { return false; }
  }),
  usernameSelector: CredentialSelectorSchema.optional(),
  passwordSelector: CredentialSelectorSchema,
}).strict();
export type CredentialHandoffRequest = z.infer<typeof CredentialHandoffRequestSchema>;
export const CredentialHandoffResultSchema = z.object({
  status: z.enum(["filled", "unavailable", "target_changed", "permission_denied", "cancelled"]),
}).strict();
export type CredentialHandoffResult = z.infer<typeof CredentialHandoffResultSchema>;

export const TurnSteerSchema = z.object({ expectedTurnId: id, message: z.string().trim().min(1).max(20_000) }).strict();
export const McpElicitationSchema = z.object({ method: z.literal("elicitation/create"), params: z.object({ message: z.string().min(1).max(4000), requestedSchema: z.record(z.string(), z.unknown()) }).strict() }).strict();
export const ServerRequestResolvedSchema = z.object({ method: z.literal("serverRequest/resolved"), params: z.object({ requestId: id, outcome: z.enum(["accepted", "declined", "cancelled", "expired"]) }).strict() }).strict();

export const SendRecordSchema = z.object({
  nonce: id,
  threadId: id,
  turnId: id,
  text: z.string().min(1).max(20_000),
  state: z.enum(["queued", "offline", "sending", "accepted", "acknowledged", "parked", "failed", "cancelled"]),
  acceptanceId: id.optional(),
  errorCode: id.optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
}).strict();
export type SendRecord = z.infer<typeof SendRecordSchema>;

export const PendingApprovalSchema = z.object({
  approvalId: id,
  action: SafetyActionSchema,
  expiresAt: z.number().int().nonnegative(),
}).strict();
