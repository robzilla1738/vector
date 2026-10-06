import { z } from "zod";

export const CommandEscalationRequestSchema = z
  .object({
    requestId: z.string().uuid(),
    runId: z.string().min(1),
    workspaceId: z.string().min(1),
    segment: z.string().min(1).max(8_192),
    workdir: z.string().min(1).max(4_096),
    /** Opaque fingerprint of the owner-reviewed folder and live working directory. */
    scopeDigest: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    justification: z.string().min(8).max(2_000),
    prefixRule: z.string().min(1).max(200).optional(),
    state: z.enum(["pending", "approved", "declined"]),
    mode: z.enum(["once", "prefix"]).optional(),
    grantActive: z.boolean().optional(),
    createdAt: z.number().int().nonnegative(),
    decidedAt: z.number().int().nonnegative().optional(),
  })
  .strict();
export type CommandEscalationRequest = z.infer<typeof CommandEscalationRequestSchema>;
