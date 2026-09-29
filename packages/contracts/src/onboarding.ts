import { z } from "zod";
import { PageContextRefSchema } from "./entities.js";

export const ONBOARDING_STEPS = [
  "welcome",
  "import",
  "model",
  "appearance",
  "default",
  "permissions",
  "postcard",
] as const;
export const OnboardingStepSchema = z.enum(ONBOARDING_STEPS);
export const ONBOARDING_DISCLOSURE_VERSION = 1;
export const DEFAULT_BROWSER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
export const ONBOARDING_POSTCARDS = [
  {
    id: "understand",
    question: "What matters on this page?",
    prompt:
      "Explain the selected page in plain language. Identify its main claims, what supports them, and three useful follow-up questions. Cite the page. Do not change the page or send anything.",
    tools: ["Read page", "Chat"],
  },
  {
    id: "compare",
    question: "What should I check before deciding?",
    prompt:
      "Read the selected page and make a compact decision checklist: useful facts, missing information, and questions I should ask before deciding. Separate facts from assumptions and cite the page. Do not purchase, submit, or contact anyone.",
    tools: ["Read page", "Checklist"],
  },
  {
    id: "plan",
    question: "How can I turn this into a plan?",
    prompt:
      "Use the selected page to draft a practical five-step plan with a clear first action. Cite the source and ask me before using a connected service. Keep this as a draft: do not change a calendar, send messages, or change the page.",
    tools: ["Read page", "Draft plan"],
  },
] as const;
export const OnboardingPostcardIdSchema = z.enum(["understand", "compare", "plan"]);
export const OnboardingFirstTaskSchema = z
  .object({
    postcardId: OnboardingPostcardIdSchema,
    runId: z.string().uuid(),
    chatId: z.string().uuid(),
    status: z.enum(["pending", "started", "interrupted", "failed", "unavailable"]),
  })
  .strict();
export const OnboardingStateSchema = z
  .object({
    version: z.literal(1),
    revision: z.number().int().nonnegative(),
    status: z.enum(["new", "active", "later", "complete"]),
    step: OnboardingStepSchema,
    visited: z.array(OnboardingStepSchema).max(7),
    skipped: z.array(OnboardingStepSchema).max(7),
    disclosureVersion: z.number().int().nonnegative(),
    defaultBrowserPromptedAt: z.number().int().nonnegative().optional(),
    firstTask: OnboardingFirstTaskSchema.optional(),
  })
  .strict();
export const OnboardingUpdateParamsSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    action: z.enum(["visit", "skip", "later", "replay", "disclosure", "default-prompt", "finish"]),
    step: OnboardingStepSchema.optional(),
  })
  .strict();
export const OnboardingStartParamsSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    postcardId: OnboardingPostcardIdSchema,
    page: PageContextRefSchema,
  })
  .strict();
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type OnboardingUpdate = z.infer<typeof OnboardingUpdateParamsSchema>;
export type OnboardingStart = z.infer<typeof OnboardingStartParamsSchema>;
