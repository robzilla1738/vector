import { z } from "zod";

/** Explicit backend selection; native original-turn ownership is checked separately. */
export const ExecutionTargetSchema = z.enum(["local", "cloud"]);
export type ExecutionTarget = z.infer<typeof ExecutionTargetSchema>;

const rate = z.number().finite().nonnegative();
/** Public account-reviewed rates; credentials are held separately in the OS credential store. */
export const CloudResourceQuoteSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    accountDigest: z.string().regex(/^[a-f0-9]{64}$/),
    region: z.string().regex(/^[a-z][a-z0-9]{2,15}$/),
    vcpus: z.number().int().min(1).max(64),
    timeoutMs: z
      .number()
      .int()
      .min(1000)
      .max(24 * 60 * 60 * 1000),
    rates: z
      .object({
        cpuUsdPerCoreHour: rate,
        memoryUsdPerGBHour: rate,
        outboundUsdPerGB: rate,
        creationUsd: rate,
      })
      .strict(),
    rateBasis: z.enum(["account-contract", "public-estimate"]),
    rateSource: z
      .url()
      .max(2048)
      .refine((value) => {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password;
      }),
  })
  .strict();
export type CloudResourceQuote = z.infer<typeof CloudResourceQuoteSchema>;
export const CloudConfigureParamsSchema = z
  .object({
    expectedRevision: z.number().int().nonnegative(),
    token: z.string().min(1).max(8192).optional(),
    teamId: z.string().min(1).max(200),
    projectId: z.string().min(1).max(200),
    quote: CloudResourceQuoteSchema.omit({ revision: true, accountDigest: true }),
  })
  .strict();
export const CloudSettingsStatusSchema = z
  .object({
    configured: z.boolean(),
    revision: z.number().int().nonnegative(),
    teamId: z.string().max(200).optional(),
    projectId: z.string().max(200).optional(),
    quote: CloudResourceQuoteSchema.optional(),
  })
  .strict();
export type CloudConfigureParams = z.infer<typeof CloudConfigureParamsSchema>;
export type CloudSettingsStatus = z.infer<typeof CloudSettingsStatusSchema>;
