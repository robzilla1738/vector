import { z } from "zod";

const profileId = z.string().min(1).max(200);
const origin = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !parsed.username &&
      !parsed.password &&
      parsed.origin === value
    );
  }, "Choose an exact http(s) origin");
// oxlint-disable-next-line no-control-regex -- CSS selectors cannot contain control bytes.
const selector = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => !/[{};@\\\u0000-\u001f]/.test(value), "Selector contains unsafe CSS syntax");
const css = z
  .string()
  .max(16_384)
  .refine((value) => {
    const withoutComments = value.replace(/\/\*[\s\S]*?\*\//g, "");
    // oxlint-disable-next-line no-control-regex -- Tabs and line breaks are allowed; other control bytes are not.
    return (
      !/[\\@\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(withoutComments) &&
      !/\b(?:url|image-set|image|paint|var|expression|behavior|src)\s*[:(]/i.test(withoutComments) &&
      !/\/\*/.test(withoutComments) &&
      !/\*\//.test(withoutComments)
    );
  }, "User CSS cannot load external resources or contain escaped directives");

/** The runtime database belongs to one Profile; every native request repeats that identity. */
export const ZapSitePolicySchema = z
  .object({
    profileId,
    origin,
    revision: z.number().int().positive(),
    grantedAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
    selectors: z
      .array(selector)
      .max(100)
      .refine((items) => new Set(items).size === items.length, "Duplicate Zap selector"),
    userCss: css,
    enabled: z.boolean(),
  })
  .strict();
export const ZapGrantParamsSchema = z.object({ origin }).strict();
export const ZapUpdateParamsSchema = z
  .object({
    origin,
    expectedRevision: z.number().int().positive(),
    selectors: ZapSitePolicySchema.shape.selectors,
    userCss: css,
    enabled: z.boolean(),
  })
  .strict();
export const ZapRevokeParamsSchema = z
  .object({ origin, expectedRevision: z.number().int().positive() })
  .strict();
export const ZapSnapshotParamsSchema = z.object({ profileId }).strict();
export const ZapStylesheetInstallSchema = z
  .object({
    profileId,
    origin,
    revision: z.number().int().nonnegative(),
    stylesheet: z.string().max(80_000),
    stylesheetSha256: z.string().regex(/^[a-f0-9]{64}$/),
    phase: z.literal("document_start"),
    frameScope: z.literal("matching_origin"),
  })
  .strict();
export const ZapInstallReceiptSchema = z
  .object({
    profileId,
    origin,
    revision: z.number().int().nonnegative(),
    stylesheetSha256: z.string().regex(/^[a-f0-9]{64}$/),
    phase: z.literal("document_start"),
    futureDocuments: z.literal(true),
    appliedAt: z.number().int().nonnegative(),
    activeDocuments: z
      .array(
        z
          .object({
            pageId: z.string().min(1).max(200),
            documentEpoch: z.number().int().nonnegative(),
            frameOrigin: origin,
            applied: z.boolean(),
          })
          .strict(),
      )
      .max(500),
  })
  .strict();
export const ZapApplyResultSchema = z
  .object({ policy: ZapSitePolicySchema.nullable(), receipt: ZapInstallReceiptSchema })
  .strict();

export type ZapSitePolicy = z.infer<typeof ZapSitePolicySchema>;
export type ZapStylesheetInstall = z.infer<typeof ZapStylesheetInstallSchema>;
export type ZapInstallReceipt = z.infer<typeof ZapInstallReceiptSchema>;
