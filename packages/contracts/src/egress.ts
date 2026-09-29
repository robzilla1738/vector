import { z } from "zod";

const id = z.string().min(1).max(160);
const origin = z.string().url().max(2048);

/** Opaque request authority. Native request interception must bind this to the actual frame and epoch. */
export const EgressLeaseSchema = z.object({
  leaseId: id,
  profileId: id,
  runId: id,
  taskRevision: z.number().int().nonnegative(),
  taskId: id.optional(),
  tabId: id,
  frameId: id,
  /** Browser-owned main document token; an identical-URL reload changes it. */
  documentToken: id,
  documentEpoch: z.number().int().nonnegative(),
  sourceOrigin: origin,
  /** Optional exact target for the one-use initial about:blank navigation. */
  initialDestination: origin.optional(),
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
  taskId: id.optional(),
  tabId: id,
  frameId: id,
  documentToken: id,
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
  reason: z.enum(["authorized_recipient", "same_origin", "missing_lease", "revoked_lease", "stale_lease", "identity_mismatch", "invalid_destination", "recipient_denied", "protected_overlap", "page_content_overlap", "incomplete_body", "approval_declined", "approval_expired", "ambiguous_provenance"]),
  leaseId: id.optional(),
  sourceOrigin: origin.optional(),
  destinationOrigin: origin.optional(),
  protectedClass: z.enum(["credential", "memory", "file", "form"]).optional(),
}).strict();
export type EgressDecision = z.infer<typeof EgressDecisionSchema>;

/** These methods are private runtime↔browser messages, never renderer APIs. */
export const EgressContextRequestSchema = z.object({ tabId: id, expectedUrl: origin }).strict();
export const EgressContextSchema = z.object({
  profileId: id, tabId: id, frameId: id, documentToken: id, sourceOrigin: origin,
}).strict();
export type EgressContext = z.infer<typeof EgressContextSchema>;
export const EgressInstallSchema = z.object({ lease: EgressLeaseSchema, expectedUrl: origin }).strict();
export const EgressRevokeSchema = z.object({ leaseId: id }).strict();
export const EgressRequestSchema = z.object({
  requestId: id,
  evidence: EgressRequestEvidenceSchema,
  /** Complete bounded body; opaque/file/streaming bodies are denied by native. */
  bodyBase64: z.string().max(87_384),
}).strict();
export type EgressRequest = z.infer<typeof EgressRequestSchema>;

/** An origin-only explanation: never put the URL, query or request body in UI. */
export function egressApprovalText(sourceOrigin: string, destinationOrigin: string, pageContent: boolean): {
  instruction: string; guidance: string;
} {
  const source = sourceOrigin === "aux://blank" ? "the new Aux tab" : sourceOrigin;
  return {
    instruction: pageContent
      ? `Allow content from ${source} to be sent to ${destinationOrigin}?`
      : `Allow this request from ${source} to ${destinationOrigin}?`,
    guidance: "This approves only the waiting request. A changed recipient, request, or page needs a new review. Saved credentials and private memory remain protected.",
  };
}
