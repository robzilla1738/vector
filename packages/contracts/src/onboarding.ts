import { z } from "zod";

/** Setup ends after these four optional screens. Chats use the ordinary composer. */
export const ONBOARDING_STEPS = ["welcome", "import", "model", "appearance"] as const;
export const OnboardingStepSchema = z.enum(ONBOARDING_STEPS);
export const ONBOARDING_STARTERS = [
  {
    id: "understand",
    question: "What matters on this page?",
    prompt:
      "Explain the selected page in plain language. Identify its main claims, what supports them, and three useful follow-up questions. Cite the page. Do not change the page or send anything.",
  },
  {
    id: "compare",
    question: "What should I check before deciding?",
    prompt:
      "Read the selected page and make a compact decision checklist: useful facts, missing information, and questions I should ask before deciding. Separate facts from assumptions and cite the page. Do not purchase, submit, or contact anyone.",
  },
  {
    id: "plan",
    question: "How can I turn this into a plan?",
    prompt:
      "Use the selected page to draft a practical five-step plan with a clear first action. Cite the source and ask me before using a connected service. Keep this as a draft: do not change a calendar, send messages, or change the page.",
  },
] as const;
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
