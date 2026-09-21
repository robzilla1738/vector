import { z } from "zod";

/** Plain values only. Formulas and external links are never evaluated. */
export const WorkbookSnapshotSchema = z.object({
  format: z.literal("aux.workbook.v1"),
  sheets: z.array(z.object({
    name: z.string(),
    hidden: z.boolean(),
    rows: z.array(z.object({
      number: z.number().int().positive(),
      cells: z.array(z.object({ column: z.number().int().positive().max(16384), value: z.string() })),
    })),
  })),
});
export type WorkbookSnapshot = z.infer<typeof WorkbookSnapshotSchema>;

export function documentSnapshotExcerpt(filename: string, content: string): string {
  if (filename.toLowerCase().endsWith(".xlsx")) {
    try {
      const workbook = WorkbookSnapshotSchema.parse(JSON.parse(content));
      return `${workbook.sheets.length} sheets · ${workbook.sheets.map(sheet => sheet.name + (sheet.hidden ? " (hidden)" : "")).join(", ")}`.slice(0, 1000);
    } catch { return "Workbook text snapshot"; }
  }
  return content.replace(/\s+/g, " ").trim().slice(0, 1000);
}
