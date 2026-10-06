import { z } from "zod";

/** http(s) source addresses only. Credentials and other schemes are rejected. */
export function workbookSourceHyperlink(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return;
    if (url.href.length > 2048) return;
    return url.href;
  } catch {
    return;
  }
}

const WorkbookCellSchema = z.object({
  column: z.number().int().positive().max(16384),
  value: z.string(),
  hyperlink: z.string().max(2048).optional(),
});

/** Plain values only. Formulas are never evaluated. Optional source hyperlinks are stored separately from values. */
export const WorkbookSnapshotSchema = z.object({
  format: z.literal("aux.workbook.v1"),
  sheets: z.array(
    z.object({
      name: z.string(),
      hidden: z.boolean(),
      rows: z.array(
        z.object({
          number: z.number().int().positive(),
          cells: z.array(WorkbookCellSchema),
        }),
      ),
    }),
  ),
});
export type WorkbookSnapshot = z.infer<typeof WorkbookSnapshotSchema>;
export type WorkbookCell = z.infer<typeof WorkbookCellSchema>;

/** Comparison table plus source URLs as an explicit hyperlink column. Values stay strings. */
export function sourcedWorkbookSnapshot(
  title: string,
  rows: string[][],
  sources: string[] = [],
): WorkbookSnapshot {
  const header = rows[0] ?? ["Value"];
  const body = rows.slice(1);
  const cellsFor = (number: number, values: string[], extra?: string) => {
    const cells: WorkbookCell[] = values.map((value, index) => ({ column: index + 1, value }));
    if (extra) {
      const hyperlink = workbookSourceHyperlink(extra);
      cells.push({ column: values.length + 1, value: extra, ...(hyperlink ? { hyperlink } : {}) });
    }
    return { number, cells };
  };
  const sheetRows = [
    cellsFor(1, sources.length ? [...header, "Source"] : header),
    ...body.map((row, index) => cellsFor(index + 2, row, sources[index])),
  ].filter((row) => row.cells.length);
  return {
    format: "aux.workbook.v1",
    sheets: [{ name: title.slice(0, 31) || "Results", hidden: false, rows: sheetRows }],
  };
}

export function documentSnapshotExcerpt(filename: string, content: string): string {
  if (filename.toLowerCase().endsWith(".xlsx")) {
    try {
      const workbook = WorkbookSnapshotSchema.parse(JSON.parse(content));
      return `${workbook.sheets.length} sheets · ${workbook.sheets.map((sheet) => sheet.name + (sheet.hidden ? " (hidden)" : "")).join(", ")}`.slice(
        0,
        1000,
      );
    } catch {
      return "Workbook text snapshot";
    }
  }
  return content.replace(/\s+/g, " ").trim().slice(0, 1000);
}
