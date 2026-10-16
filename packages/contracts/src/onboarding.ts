import { z } from "zod";

/** Setup ends after these four optional screens. Chats use the ordinary composer. */
export const ONBOARDING_STEPS = ["welcome", "import", "model", "appearance"] as const;
export const OnboardingStepSchema = z.enum(ONBOARDING_STEPS);
export const OnboardingStateSchema = z
  .object({
    version: z.literal(2),
    revision: z.number().int().nonnegative(),
    status: z.enum(["new", "active", "later", "complete"]),
    step: OnboardingStepSchema,
    visited: z.array(OnboardingStepSchema).max(ONBOARDING_STEPS.length),
    skipped: z.array(OnboardingStepSchema).max(ONBOARDING_STEPS.length),
  })
  .strict();
export const OnboardingUpdateParamsSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    action: z.enum(["visit", "skip", "later", "replay", "finish"]),
    step: OnboardingStepSchema.optional(),
  })
  .strict();
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type OnboardingUpdate = z.infer<typeof OnboardingUpdateParamsSchema>;
