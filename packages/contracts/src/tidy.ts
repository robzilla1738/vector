import { z } from "zod";

/** A read-only proposal. The person previews and applies folder changes in Aux. */
export const TidyProposalParamsSchema = z.object({
  pageIds: z.array(z.string().min(1).max(200)).min(3).max(30),
}).strict();

export const TidyGroupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  pageIds: z.array(z.string().min(1).max(200)).min(2).max(30),
}).strict();

export const TidyGroupsSchema = z.object({ groups: z.array(TidyGroupSchema).min(1).max(6) }).strict();

export const TidyProposalSchema = TidyGroupsSchema.extend({
  /** Exact tab identity at proposal time; the UI rechecks this before applying. */
  pages: z.array(z.object({ pageId: z.string(), url: z.string(), title: z.string() }).strict()).min(3).max(30),
  modelId: z.string(),
  createdAt: z.number().int().nonnegative(),
}).strict();

export type TidyProposal = z.infer<typeof TidyProposalSchema>;
