import { z } from "zod";
import { PlanStepSchema } from "./program.js";

const Id = z.string().min(1).max(200);
const Selector = z.string().min(1).max(2000);
const Target = z
  .object({
    candidates: z
      .array(z.object({ selector: Selector, matches: z.number().int().nonnegative() }).strict())
      .min(1)
      .max(12),
  })
  .strict();
const SecretFreeValue = z.string().max(4000);
export const DemonstrationStepSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("click"), target: Target }).strict(),
  z
    .object({
      kind: z.literal("input"),
      control: z.enum(["text", "select"]),
      target: Target,
      value: SecretFreeValue,
      label: z.string().max(200),
    })
    .strict(),
  z
    .object({
      kind: z.literal("credentialFill"),
      secretType: z.enum(["password", "payment", "otp", "sensitive"]),
      target: Target,
    })
    .strict(),
  z.object({ kind: z.literal("submit"), target: Target }).strict(),
  z.object({ kind: z.literal("key"), target: Target, key: z.enum(["Enter", "Tab", "Escape"]) }).strict(),
  z
    .object({
      kind: z.literal("navigate"),
      url: z
        .string()
        .url()
        .max(8192)
        .refine((url) => /^https?:\/\//.test(url)),
    })
    .strict(),
]);
export const DemonstrationSchema = z
  .object({
    id: Id,
    pageId: Id,
    state: z.enum(["recording", "paused", "stopped", "discarded"]),
    steps: z.array(DemonstrationStepSchema).max(50),
    startedAt: z.number().int().nonnegative(),
  })
  .strict();
export const RecorderStartSchema = z.object({ pageId: Id }).strict();
export const RecorderControlSchema = z.object({ recordingId: Id }).strict();
export type Demonstration = z.infer<typeof DemonstrationSchema>;

export const SkillRepairProposalSchema = z
  .object({
    proposalId: z.string().uuid(),
    routineId: Id,
    revision: z.number().int().positive(),
    digest: z.string().regex(/^[a-f0-9]{64}$/),
    pageId: Id,
    attachmentId: Id,
    documentEpoch: z.number().int().nonnegative(),
    changes: z
      .array(z.object({ stepId: Id, before: Selector, after: Selector }).strict())
      .min(1)
      .max(49),
  })
  .strict();
export const SkillRepairProposeSchema = z
  .object({
    routineId: Id,
    expectedRevision: z.number().int().positive(),
    pageId: Id,
    changes: z
      .array(z.object({ stepId: Id, selector: Selector }).strict())
      .min(1)
      .max(49),
  })
  .strict();
export const SkillRepairApplySchema = z
  .object({ proposalId: z.string().uuid(), expectedRevision: z.number().int().positive() })
  .strict();
export const DemonstrationReviewSchema = z
  .object({
    inputs: z
      .array(
        z
          .object({
            step: z.number().int().min(0).max(49),
            parameter: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,40}$/),
            confirmed: z.literal(true),
          })
          .strict(),
      )
      .max(50),
    targets: z
      .array(
        z
          .object({
            step: z.number().int().min(0).max(49),
            selector: z.string().min(1).max(2000),
            confirmed: z.literal(true),
          })
          .strict(),
      )
      .max(50),
    navigationTemplates: z
      .array(z.object({ step: z.number().int().min(0).max(49), url: z.string().url().max(8192) }).strict())
      .max(50),
    finalWait: PlanStepSchema.refine((step) => step.op === "waitFor", "Choose a final wait condition."),
  })
  .strict();
export const DemonstrationReplayCompileSchema = z
  .object({
    routineId: Id,
    expectedRevision: z.number().int().positive(),
    recordingId: Id,
    review: DemonstrationReviewSchema,
  })
  .strict();
