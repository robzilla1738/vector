import { z } from "zod";

export const SiteOriginSchema = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return (url.protocol === "http:" || url.protocol === "https:") && url.origin === value;
    } catch {
      return false;
    }
  }, "Choose the exact HTTP or HTTPS site origin.");

export const ZapSelectorSchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => !/[{};\n\r\0]/.test(value), "Choose a CSS selector without rule syntax.");

export const ZapCandidateSchema = z.object({
  selector: ZapSelectorSchema,
  matchCount: z.number().int().min(1).max(100),
  targetLevel: z.number().int().min(0).max(2),
  score: z.number().finite(),
  related: z.boolean(),
});
export type ZapCandidate = z.infer<typeof ZapCandidateSchema>;

export const ZapPickResultSchema = z.discriminatedUnion("picked", [
  z.object({ picked: z.literal(false), reason: z.string().max(200).optional() }),
  z.object({
    picked: z.literal(true),
    pageId: z.string().min(1),
    documentEpoch: z.number().int().nonnegative(),
    origin: SiteOriginSchema,
    tag: z.string().max(100),
    text: z.string().max(160),
    candidates: z.array(ZapCandidateSchema).min(1).max(15),
  }),
]);
export type ZapPickResult = z.infer<typeof ZapPickResultSchema>;

export const ZapRuleSchema = z.object({
  ruleId: z.string().uuid(),
  origin: SiteOriginSchema,
  selector: ZapSelectorSchema,
  matchCount: z.number().int().min(1).max(100),
  createdAt: z.number().int().nonnegative(),
});
export type ZapRule = z.infer<typeof ZapRuleSchema>;

export const SiteCssSchema = z.object({
  origin: SiteOriginSchema,
  css: z
    .string()
    .max(20_000)
    .refine((value) => !value.includes("\0"), "CSS cannot contain a null character."),
  updatedAt: z.number().int().nonnegative().nullable(),
});
export type SiteCss = z.infer<typeof SiteCssSchema>;

export const EffectiveSiteCssSchema = z.object({ origin: SiteOriginSchema, css: z.string().max(250_000) });
export type EffectiveSiteCss = z.infer<typeof EffectiveSiteCssSchema>;
