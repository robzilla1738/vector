import { z } from "zod";
import { PlanStepSchema, ResultCitationSchema } from "@aux/contracts";
export const CLOUD_REPL_BYTES = 1024 * 1024;
export const CloudReplId = z.string().uuid();
const text = z.string().max(8192),
  page = z.string().min(1).max(200);
export const CloudReplCalls = {
  tabs: z.tuple([]),
  openTab: z.tuple([text]),
  closeTab: z.tuple([page]),
  bookmark: z.tuple([page]),
  useTab: z.tuple([page]),
  observe: z.tuple([page, text.optional()]),
  findRef: z.tuple([page, text, text.optional()]),
  findRoute: z.tuple([page, text]),
  capture: z.tuple([page]),
  step: z.tuple([page, PlanStepSchema, z.number().int().nonnegative().optional()]),
  fetch: z.tuple([text]),
  codingTool: z.tuple([text, z.unknown(), z.number().int().nonnegative()]),
  submitResult: z.tuple([
    z
      .object({
        report: z.string().max(CLOUD_REPL_BYTES),
        citations: z.array(ResultCitationSchema).max(100).optional(),
        textProposal: z.string().max(CLOUD_REPL_BYTES).optional(),
      })
      .strict(),
  ]),
  webmcp: z.tuple([
    page,
    z.union([
      z.object({ op: z.literal("tools") }).strict(),
      z.object({ op: z.literal("call"), name: text, input: z.unknown().optional() }).strict(),
    ]),
  ]),
  spawnCell: z.tuple([
    z.object({ goal: text, profile: text.optional(), pageIds: z.array(page).max(100).optional() }).strict(),
  ]),
  waitCell: z.tuple([page, z.number().int().min(0).max(120_000)]),
  sendCell: z.tuple([page, text]),
  cancelCell: z.tuple([page]),
};
export const CloudReplRequest = z
  .object({
    id: CloudReplId,
    runId: page,
    code: z.string().max(64 * 1024),
    pageId: page.optional(),
    deadlineMs: z.number().int().min(1).max(120_000).optional(),
  })
  .strict();
export const CloudReplRpc = z
  .object({
    id: CloudReplId,
    sequence: z.number().int().nonnegative(),
    method: z.enum(
      Object.keys(CloudReplCalls) as [keyof typeof CloudReplCalls, ...(keyof typeof CloudReplCalls)[]],
    ),
    args: z.array(z.unknown()).max(3),
  })
  .strict();
