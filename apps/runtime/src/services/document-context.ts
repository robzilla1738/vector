import { WorkbookSnapshotSchema, textContextShares } from "@aux/contracts";

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

/** Give every sheet a share so a long first sheet cannot silently hide later sheets. */
export function boundedDocumentReference(sections: string[], budget: number): string {
  if (budget <= 0) return "";
  // Extremely broad workbooks still need readable sheet headers, not thousands of initials.
  const selected = sections.slice(0, Math.max(1, Math.floor(budget / 160)));
  const separatorBudget = Math.max(0, selected.length - 1) * 2;
  const shares = textContextShares(
    selected.map((section) => section.length),
    Math.max(0, budget - separatorBudget),
  );
  return selected
    .map((section, index) => section.slice(0, shares[index]))
    .filter(Boolean)
    .join("\n\n")
    .slice(0, budget);
}
