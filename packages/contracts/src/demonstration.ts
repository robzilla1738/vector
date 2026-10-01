import { z } from "zod";

const Id = z.string().min(1).max(200);
const Selector = z.string().min(1).max(2000);
const Target = z.object({ candidates: z.array(z.object({ selector: Selector, matches: z.number().int().nonnegative() }).strict()).min(1).max(12) }).strict();
const SecretFreeValue = z.string().max(4000);
export const DemonstrationStepSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("click"), target: Target }).strict(),
  z.object({ kind: z.literal("input"), target: Target, value: SecretFreeValue, label: z.string().max(200) }).strict(),
  z.object({ kind: z.literal("credentialFill"), target: Target }).strict(),
  z.object({ kind: z.literal("submit"), target: Target }).strict(),
  z.object({ kind: z.literal("key"), target: Target, key: z.enum(["Enter", "Tab", "Escape"]) }).strict(),
  z.object({ kind: z.literal("navigate"), url: z.string().url().max(8192).refine(url => /^https?:\/\//.test(url)) }).strict(),
]);
export const DemonstrationSchema = z.object({ id: Id, pageId: Id, state: z.enum(["recording", "paused", "stopped", "discarded"]),
  steps: z.array(DemonstrationStepSchema).max(50), startedAt: z.number().int().nonnegative() }).strict();
export const RecorderStartSchema = z.object({ pageId: Id }).strict();
export const RecorderControlSchema = z.object({ recordingId: Id }).strict();
export type Demonstration = z.infer<typeof DemonstrationSchema>;
