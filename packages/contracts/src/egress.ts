import { z } from "zod";

const id = z.string().min(1).max(160);
const origin = z.string().url().max(2048);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const httpOrigin = origin.refine(value => {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && url.origin === value; }
  catch { return false; }
}, "Expected an exact HTTP(S) origin");

/** Native-owned namespace; no caller-selected partition identifiers or cookie bytes. */
export const AgentPageIsolationSchema = z.object({
  isolationId: id, runId: id, taskId: id.optional(),
  taskRevision: z.number().int().nonnegative(),
  inMemory: z.literal(true),
  /** Initial namespace policy: no owner cookies copied; later explicit sign-in can create cookies. */
  cookies: z.literal("empty"),
}).strict();
export type AgentPageIsolation = z.infer<typeof AgentPageIsolationSchema>;
export const AgentPageSourceSchema = z.object({
  tabId: id, expectedUrl: origin.refine(value => {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; }
    catch { return false; }
  }), documentToken: id,
}).strict();
export const AgentPageCreateSchema = z.object({
  profileId: id, runId: id, taskId: id.optional(), taskRevision: z.number().int().nonnegative(),
  windowId: id, background: z.boolean(), source: AgentPageSourceSchema.optional(),
}).strict();
export type AgentPageCreate = z.infer<typeof AgentPageCreateSchema>;
export const AgentPageCreatedSchema = z.object({
  pageId: id, targetId: id, isolation: AgentPageIsolationSchema,
  source: AgentPageSourceSchema.optional(),
}).strict();
export type AgentPageCreated = z.infer<typeof AgentPageCreatedSchema>;

/** Opaque request authority. Native request interception must bind this to the actual frame and epoch. */
export const EgressLeaseSchema = z.object({
  leaseId: id,
  isolationId: id,
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
  isolationId: id,
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
  status: z.enum(["allow", "deny", "inspected"]),
  reason: z.enum(["authorized_recipient", "same_origin", "missing_lease", "revoked_lease", "stale_lease", "identity_mismatch", "invalid_destination", "recipient_denied", "protected_overlap", "page_content_overlap", "incomplete_body", "approval_declined", "approval_expired", "ambiguous_provenance", "incomplete_projection", "preflight_only"]),
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
  isolation: AgentPageIsolationSchema.optional(),
}).strict();
export type EgressContext = z.infer<typeof EgressContextSchema>;
export const EgressInstallSchema = z.object({ lease: EgressLeaseSchema, expectedUrl: origin }).strict();
export const EgressRevokeSchema = z.object({ leaseId: id }).strict();
/** Native computes this complete bounded projection; no raw outgoing data crosses IPC. */
export const EgressProjectionSchema = z.object({
  version: z.literal(1),
  phase: z.enum(["preflight", "send"]),
  urlDigest: sha256,
  requestDigest: sha256,
  urlBytes: z.number().int().nonnegative().max(2048),
  headerBytes: z.number().int().nonnegative().max(16384),
  headersComplete: z.boolean(),
  projectionComplete: z.boolean(),
  textHashes: z.array(sha256).max(131072),
  phraseHashes: z.array(sha256).max(32768),
}).strict();
export type EgressProjection = z.infer<typeof EgressProjectionSchema>;
export const EgressRequestSchema = z.object({
  requestId: id,
  // Destination is an origin only. URL path/query, cookies and body remain native.
  evidence: EgressRequestEvidenceSchema.extend({ destination: httpOrigin }),
  projection: EgressProjectionSchema,
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
