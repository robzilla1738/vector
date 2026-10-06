import { z } from "zod";
import { OrganizationSnapshotSchema } from "./organization.js";
/** Runtime/native-only original Aux window readback; never supplied by tool or renderer params. */
export const TurnSourceContextSchema = OrganizationSnapshotSchema.extend({
  windowId: z.string().min(1),
  activePageId: z.string().min(1).nullable(),
}).strict();
export type TurnSourceContext = z.infer<typeof TurnSourceContextSchema>;
