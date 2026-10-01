import { z } from "zod";

const Id = z.string().min(1).max(200);
export const WindowKindSchema = z.enum(["normal", "private", "little", "quick-ask"]);
export type WindowKind = z.infer<typeof WindowKindSchema>;
export const SplitGroupSchema = z.object({ id: Id, panes: z.array(Id).min(2).max(4),
  layout: z.enum(["row", "column", "columns", "one-plus-two", "grid"]),
  ratios: z.array(z.number().min(0.1).max(0.9)).min(1).max(3), focused: Id }).strict()
  .superRefine((group, context) => {
    if (new Set(group.panes).size !== group.panes.length) context.addIssue({ code: "custom", message: "Split panes must be distinct." });
    if (!group.panes.includes(group.focused)) context.addIssue({ code: "custom", message: "Focused pane must belong to the split." });
    const count = group.layout === "grid" ? 4 : ["columns", "one-plus-two"].includes(group.layout) ? 3 : 2;
    if (group.panes.length !== count) context.addIssue({ code: "custom", message: "Split layout does not match its pane count." });
  });
export type SplitGroup = z.infer<typeof SplitGroupSchema>;
export const ClaimTabSchema = z.object({ pageId: Id, activate: z.boolean() }).strict();
export const MovedTabSchema = z.object({ pageId: Id, fromWindowId: Id, toWindowId: Id }).strict();
