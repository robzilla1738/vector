import { z } from "zod";
import { PlanStepSchema } from "./program.js";

export const LinkedInReadSchema = z
  .object({
    surface: z.enum(["profile", "company", "job", "jobs", "inbox", "thread", "invitations"]),
    title: z.string().max(1000),
    headings: z.array(z.string().max(1000)).max(60),
    text: z.string().max(80_000),
    links: z
      .array(
        z.object({
          text: z.string().max(500),
          url: z.string().url().max(4096),
          kind: z.enum(["profile", "company", "job", "jobs", "inbox", "thread", "invitations"]),
        }),
      )
      .max(100),
    serviceAccountProfileUrl: z.string().url().max(4096).optional(),
    truncated: z.boolean(),
  })
  .strict();
export type LinkedInRead = z.infer<typeof LinkedInReadSchema>;

export const LinkedInWorkflowInputSchema = z
  .object({
    operation: z.enum(["research", "inbox", "draft-message", "draft-invitation", "inspect"]),
    recipientUrl: z.string().url().max(1000).optional(),
    text: z.string().max(2000).optional(),
    /** A currently observed conversation/dialog subtree; never an authority proof. */
    scopeRef: z
      .string()
      .regex(/^r[1-9][0-9]*$/)
      .max(200)
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (["draft-message", "draft-invitation"].includes(value.operation) && !value.recipientUrl)
      ctx.addIssue({ code: "custom", message: "Choose the exact recipient profile URL." });
    if (value.operation === "draft-message" && !value.text?.trim())
      ctx.addIssue({ code: "custom", message: "A message draft requires its exact content." });
    if (value.operation === "draft-invitation" && (value.text?.length ?? 0) > 200)
      ctx.addIssue({
        code: "custom",
        message: "Invitation notes are bounded to 200 characters; account/UI limits still apply.",
      });
  });
export type LinkedInWorkflowInput = z.infer<typeof LinkedInWorkflowInputSchema>;
export const LinkedInToolInputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("prepare"), request: LinkedInWorkflowInputSchema }).strict(),
  z.object({ action: z.literal("execute"), recipeId: z.string().uuid() }).strict(),
]);
export type LinkedInToolInput = z.infer<typeof LinkedInToolInputSchema>;
export const LinkedInWorkflowSourceSchema = z
  .object({
    /** Server-only digest of original control/signal, steering, Space and task source. */
    authorityDigest: z.string().regex(/^[a-f0-9]{64}$/),
    profileId: z.string().min(1),
    runId: z.string().min(1),
    workspaceId: z.string().min(1),
    sessionId: z.string().min(1),
    pageId: z.string().min(1),
    url: z.string().url(),
    documentEpoch: z.number().int().nonnegative(),
    observationId: z.string().min(1),
    observationRevision: z.number().int().nonnegative(),
    task: z.object({ taskId: z.string().min(1), revision: z.number().int().positive() }).optional(),
  })
  .strict();
export type LinkedInWorkflowSource = z.infer<typeof LinkedInWorkflowSourceSchema>;
export const LinkedInWorkflowResultSchema = z
  .object({
    recipeId: z.string().uuid().optional(),
    source: LinkedInWorkflowSourceSchema,
    read: LinkedInReadSchema,
    state: z.enum(["read", "navigate", "compose", "review", "inspect", "blocked"]),
    explanation: z.string().max(3000),
    execution: z.literal("no-actions-dispatched"),
    next: z
      .object({
        tool: z.literal("act"),
        steps: z.array(PlanStepSchema).min(1).max(1),
        effect: z.enum(["navigate", "draft", "external-message", "external-invitation"]),
        requiresAuthorization: z.literal(true),
        requiresFreshObservation: z.literal(true),
        receipt: z.literal("normal-governed-action-ledger"),
        undo: z.enum(["existing-draft-undo", "not-guaranteed", "browser-navigation"]),
        recipientUrl: z.string().url().optional(),
        exactContent: z.string().max(8000).optional(),
        replacesExistingDraft: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();
export type LinkedInWorkflowResult = z.infer<typeof LinkedInWorkflowResultSchema>;

/** Private in-process producer data. No API/tool input schema admits this object. */
export type LinkedInActionPrecondition = {
  kind: "linkedin";
  source: LinkedInWorkflowSource;
  recipientUrl: string;
  exactContent: string;
  targetRef: string;
  effect: "draft" | "external-message" | "external-invitation";
  /** Exact observed nodes, still evidence rather than native authority. */
  actionId?: string;
  invitation?: boolean;
  context?: {
    rootRef: string;
    recipientRef: string;
    editorRef: string;
    actionRef: string;
    beforeContent: string;
  };
};
