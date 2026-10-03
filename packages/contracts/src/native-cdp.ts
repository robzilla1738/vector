import { z } from "zod";
import { EgressLeaseSchema, EgressContextSchema } from "./egress.js";

/** Actual native UnguessableToken::ToString; a UUID is not this receipt. */
export const NativeCdpAttachmentIdSchema = z.string().regex(/^[A-F0-9]{32}$/)
  .refine(value => value !== "0".repeat(32), "Empty native CDP attachment");
export const NativeCdpCatalogSchema = z.object({ pages: z.array(z.object({
  pageId: z.string().uuid(), cdpTargetId: z.string().min(1).max(160),
  url: z.string().max(2048).refine(value => value === "about:blank" || /^https?:\/\//.test(value)),
  title: z.string().max(16384), lease: EgressLeaseSchema,
}).strict()).max(128) }).strict();
export const NativeCdpAttachSchema = z.object({
  pageId: z.string().uuid(), leaseId: z.string().uuid(),
  acknowledgedExpiresAt: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
}).strict();
export const NativeCdpAttachedSchema = z.object({ attachmentId: NativeCdpAttachmentIdSchema }).strict();
export const NativeCdpDispatchSchema = z.object({
  pageId: z.string().uuid(), attachmentId: NativeCdpAttachmentIdSchema,
  acknowledgedExpiresAt: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  message: z.string().max(1024 * 1024),
}).strict();
export type NativeCdpCatalog = z.infer<typeof NativeCdpCatalogSchema>;

const navigationUrl = z.string().url().max(2048).refine(value => {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}, "Expected a credential-free website navigation");
export const NativeCdpStartNavigationSchema = z.object({
  pageId: z.string().uuid(), attachmentId: NativeCdpAttachmentIdSchema,
  commandId: z.number().int().min(1).max(2147483647), url: navigationUrl,
  acknowledgedExpiresAt: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
}).strict();
export const NativeCdpNavigationStartedSchema = z.object({ accepted: z.literal(true) }).strict();
export const NativeCdpNavigationStateSchema = z.object({
  pageId: z.string().uuid(), attachmentId: NativeCdpAttachmentIdSchema,
  commandId: z.number().int().min(1).max(2147483647), leaseId: z.string().uuid(),
  state: z.enum(["ready", "refused"]),
}).strict();

export const NativeCdpNavigationRequestSchema = z.object({
  pageId: z.string().uuid(), attachmentId: NativeCdpAttachmentIdSchema,
  commandId: z.number().int().min(1).max(2147483647),
}).strict();
export const NativeCdpNavigationReceiptSchema = z.object({
  originalAttachmentId: NativeCdpAttachmentIdSchema, originalLeaseId: z.string().uuid(),
  commandId: z.number().int().min(1).max(2147483647),
  navigationId: z.string().regex(/^[1-9][0-9]{0,18}$/)
    .refine(value => /^[1-9][0-9]{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n, "Invalid browser navigation identity"),
  navigationTransitionId: NativeCdpAttachmentIdSchema,
  url: z.string().max(2048).refine(value => value === "about:blank" || /^https?:\/\//.test(value)),
  context: EgressContextSchema,
}).strict();
export type NativeCdpNavigationReceipt = z.infer<typeof NativeCdpNavigationReceiptSchema>;
