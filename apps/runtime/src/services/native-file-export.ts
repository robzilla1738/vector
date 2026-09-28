import { realpathSync, statSync } from "node:fs";
import { isAbsolute, relative } from "node:path";
import { readCsvRows, WorkbookSnapshotSchema, workbookSourceHyperlink } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const MAX_INPUT_BYTES = 2 * 1024 * 1024;
const MAX_WORKBOOK_BYTES = 10 * 1024 * 1024;
const MAX_CELLS = 100_000;
const MAX_RECTANGLE = 2_000_000;

function inside(root: string, path: string): boolean {
  const part = relative(root, path);
  return !!part && part !== ".." && !part.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(part);
}

/** A host-only descriptor. The browser validates the path again before copying it. */
export function artifactExportDescriptor(
  repo: Pick<Repo, "getArtifact">,
  artifactId: string,
  artifactsDir: string,
): { path: string; size: number } {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(artifactId)) throw new Error("Invalid artifact identity");
  // The persisted artifact row is the authority for the ID; its path is never supplied by the renderer.
  const artifact = repo.getArtifact(artifactId);
  if (!artifact) throw new Error("Artifact not found");
  if (artifact.status !== "complete") throw new Error("The artifact is not complete");
  const root = realpathSync(artifactsDir);
  const path = realpathSync(artifact.path);
  if (!inside(root, path)) throw new Error("The artifact is outside Aux storage");
  const file = statSync(path);
  if (!file.isFile() || file.size !== artifact.size) throw new Error("The artifact changed");
  return { path, size: file.size };
}

export async function renderWorkbookForNativeExport(
  content: string,
  format: "snapshot" | "csv" = "snapshot",
): Promise<{ filename: string; dataBase64: string; size: number }> {
  if (Buffer.byteLength(content, "utf8") > MAX_INPUT_BYTES) throw new Error("Workbook source is too large");
  const ExcelJS = (await import("exceljs")).default;
  const book = new ExcelJS.Workbook();
  book.creator = "Aux";
  book.created = new Date(0);
  book.modified = new Date(0);
  let cells = 0;
  let maxRow = 0;
  let maxColumn = 0;
  const include = (row: number, column: number) => {
    maxRow = Math.max(maxRow, row);
    maxColumn = Math.max(maxColumn, column);
    if (maxRow * maxColumn > MAX_RECTANGLE) throw new Error("Workbook layout exceeds the export limit");
  };
  if (format === "csv") {
    const sheet = book.addWorksheet("Results");
    readCsvRows(content, (row, number) => {
      if (number > 50_000 || row.length > 16_384 || (cells += row.length) > MAX_CELLS)
        throw new Error("Workbook exceeds the export limit");
      include(number, row.length);
      const target = sheet.getRow(number);
      row.forEach((value, index) => {
        const url = workbookSourceHyperlink(value);
        target.getCell(index + 1).value = url ? { text: value, hyperlink: url } : value;
      });
    });
  } else {
    const snapshot = WorkbookSnapshotSchema.parse(JSON.parse(content));
    if (!snapshot.sheets.length || snapshot.sheets.length > 12 || snapshot.sheets.every(sheet => sheet.hidden))
      throw new Error("Workbook needs a visible sheet");
    const names = new Set<string>();
    for (const source of snapshot.sheets) {
      maxRow = 0;
      maxColumn = 0;
      const name = source.name.slice(0, 31).replace(/[\\/*?:[\]]/g, "_") || "Sheet";
      if (names.has(name.toLowerCase())) throw new Error("Workbook sheet names must be unique");
      names.add(name.toLowerCase());
      const sheet = book.addWorksheet(name);
      sheet.state = source.hidden ? "hidden" : "visible";
      if (source.rows.length > 50_000) throw new Error("Workbook exceeds the export limit");
      for (const row of source.rows) {
        if (row.number > 100_000 || (cells += row.cells.length) > MAX_CELLS)
          throw new Error("Workbook exceeds the export limit");
        for (const cell of row.cells) include(row.number, cell.column);
        const target = sheet.getRow(row.number);
        for (const cell of row.cells) {
          const url = cell.hyperlink && workbookSourceHyperlink(cell.hyperlink);
          target.getCell(cell.column).value = url ? { text: cell.value, hyperlink: url } : cell.value;
        }
      }
    }
  }
  if (!cells) throw new Error("Workbook has no cells");
  const bytes = Buffer.from(await book.xlsx.writeBuffer());
  if (bytes.length > MAX_WORKBOOK_BYTES) throw new Error("Workbook export is too large");
  return { filename: format === "csv" ? "results.xlsx" : "workbook.xlsx", dataBase64: bytes.toString("base64"), size: bytes.length };
}
