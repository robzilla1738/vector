import { WorkbookSnapshotSchema } from "@aux/contracts";

function columnLabel(column: number): string {
  let result = "";
  for (let value = column; value > 0; value = Math.floor((value - 1) / 26))
    result = String.fromCharCode(65 + ((value - 1) % 26)) + result;
  return result;
}

/** Preserve the saved snapshot; prepare a readable reference separately. */
export function documentReference(filename: string, content: string): string[] {
  if (filename.toLowerCase().endsWith(".xlsx")) {
    try {
      const workbook = WorkbookSnapshotSchema.parse(JSON.parse(content));
      return workbook.sheets.map((sheet) =>
        [
          `Sheet ${JSON.stringify(sheet.name)}${sheet.hidden ? " (hidden)" : ""}. Saved values; formulas were not recalculated.`,
          ...sheet.rows.map((row) =>
            row.cells
              .map((cell) => `${columnLabel(cell.column)}${row.number}=${JSON.stringify(cell.value)}`)
              .join("; "),
          ),
          ...(sheet.rows.length ? [] : ["No populated cells."]),
        ].join("\n"),
      );
    } catch {
      /* Earlier or externally supplied snapshots remain readable as text. */
    }
  }
  return [content];
}
