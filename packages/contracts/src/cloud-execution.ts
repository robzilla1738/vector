import { z } from "zod";

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
