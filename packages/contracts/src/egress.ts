import { z } from "zod";

const id = z.string().min(1).max(160);
const origin = z.string().url().max(2048);

/** Opaque request authority. Native request interception must bind this to the actual frame and epoch. */
export const EgressLeaseSchema = z.object({
  leaseId: id,
  profileId: id,
  runId: id,
  taskRevision: z.number().int().nonnegative(),
  tabId: id,
  frameId: id,
  documentEpoch: z.number().int().nonnegative(),
  sourceOrigin: origin,
  recipientOrigins: z.array(origin).max(16),
  issuedAt: z.number().int().nonnegative(),
  expiresAt: z.number().int().nonnegative(),
}).strict();
export type EgressLease = z.infer<typeof EgressLeaseSchema>;

/** Evidence from the request path, not a page or model assertion. Raw URL/body are ephemeral inputs only. */
export const EgressRequestEvidenceSchema = z.object({
  leaseId: id,
  profileId: id,
  runId: id,
  taskRevision: z.number().int().nonnegative(),
  tabId: id,
  frameId: id,
  documentEpoch: z.number().int().nonnegative(),
  destination: origin,
  kind: z.enum(["navigation", "form", "fetch", "subresource", "worker", "redirect"]),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OTHER"]),
  byteCount: z.number().int().nonnegative(),
  bodyComplete: z.boolean(),
  observedAt: z.number().int().nonnegative(),
}).strict();
export type EgressRequestEvidence = z.infer<typeof EgressRequestEvidenceSchema>;

export const EgressDecisionSchema = z.object({
  status: z.enum(["allow", "deny"]),
  reason: z.enum(["authorized_recipient", "same_origin", "missing_lease", "revoked_lease", "stale_lease", "identity_mismatch", "invalid_destination", "recipient_denied", "protected_overlap", "incomplete_body"]),
  leaseId: id.optional(),
  sourceOrigin: origin.optional(),
  destinationOrigin: origin.optional(),
  protectedClass: z.enum(["credential", "memory", "file", "form"]).optional(),
}).strict();
export type EgressDecision = z.infer<typeof EgressDecisionSchema>;
