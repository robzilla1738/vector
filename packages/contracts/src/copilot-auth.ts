import { z } from "zod";
const phase = z.enum(["pending", "authenticating", "connected", "cancelled", "expired", "failed"]);
const attemptId = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
const accountId = z.string().regex(/^[a-f0-9]{64}$/);
export const CopilotAttemptParams = z.object({ attemptId }).strict();
export const CopilotAccountParams = z.object({ accountId }).strict();
export const CopilotSetupSchema = z
  .object({
    registrationConfigured: z.boolean(),
    runtimeInstalled: z.boolean(),
    runtimeSupported: z.boolean(),
    catalogOnly: z.literal(true),
  })
  .strict();
export const CopilotInstallSchema = z
  .object({
    installed: z.literal(true),
    sdkVersion: z.literal("1.0.16"),
    runtimeVersion: z.literal("1.0.90"),
  })
  .strict();
export const CopilotAuthStatusSchema = z
  .object({
    attemptId,
    provider: z.literal("copilot"),
    phase,
    expiresAt: z.number().int().nonnegative(),
  })
  .strict();
export const CopilotDeviceChallengeSchema = CopilotAuthStatusSchema.extend({
  authorizationUrl: z.literal("https://github.com/login/device"),
  userCode: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9-]+$/),
}).strict();
export const CopilotAccountSchema = z
  .object({
    accountId,
    login: z.string().min(1).max(100),
    selected: z.boolean(),
    connected: z.boolean(),
    needsReauthentication: z.boolean(),
  })
  .strict();
export const CopilotAccountsSchema = z.array(CopilotAccountSchema).max(16);
export const CopilotDisconnectedSchema = z
  .object({
    disconnected: z.literal(true),
    revocationConfirmed: z.literal(false),
  })
  .strict();
export const CopilotCatalogSchema = z
  .object({
    catalogOnly: z.literal(true),
    models: z
      .array(
        z
          .object({
            id: z.string().min(1).max(300),
            name: z.string().min(1).max(500),
            policy: z.enum(["enabled", "disabled", "unconfigured"]).optional(),
          })
          .strict(),
      )
      .max(500),
  })
  .strict();
