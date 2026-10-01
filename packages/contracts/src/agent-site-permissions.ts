import { z } from "zod";
import { OriginRuleSchema } from "./safety.js";

const Snapshot = z.object({ revision: z.number().int().nonnegative(), rules: z.array(OriginRuleSchema).max(1000) }).strict();
const uniqueOrigins = (value: { rules: z.infer<typeof OriginRuleSchema>[] }) => new Set(value.rules.map(rule => rule.origin)).size === value.rules.length;
export const OriginPoliciesSnapshotSchema = Snapshot.refine(uniqueOrigins, "Site rule origins must be unique.");
export const SetOriginPoliciesSchema = Snapshot.omit({ revision: true }).extend({ expectedRevision: z.number().int().nonnegative() })
  .refine(uniqueOrigins, "Site rule origins must be unique.");
export const PreapprovableCategorySchema = z.enum(["login", "upload", "permission"]);
