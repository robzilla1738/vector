import ExcelJS, { type CellValue } from "exceljs";
import { DOCUMENT_EVIDENCE_MAX_BYTES, workbookSourceHyperlink, type WorkbookCell, type WorkbookSnapshot } from "@vector/contracts";

function cellText(value: CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return String(value);
  if ("richText" in value) return value.richText.map(part => part.text).join("");
  if ("hyperlink" in value) return value.text;
  if ("error" in value) return value.error;
  if ("formula" in value || "sharedFormula" in value) {
    return value.result === undefined ? "[Formula has no saved result]" : `${cellText(value.result)} [saved formula result]`;
  }
  return "";
}

export async function extractWorkbook(bytes: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Uint8Array.from(bytes).buffer, { ignoreNodes: ["drawing", "picture", "dataValidations", "conditionalFormatting", "extLst"] });
  const snapshot: WorkbookSnapshot = { format: "aux.workbook.v1", sheets: [] };
  let totalBytes = 0;
  let populatedCells = 0;
  for (const sheet of workbook.worksheets) {
    const rows: WorkbookSnapshot["sheets"][number]["rows"] = [];
    sheet.eachRow(row => {
      const cells: WorkbookSnapshot["sheets"][number]["rows"][number]["cells"] = [];
      row.eachCell(cell => {
        if (cell.isMerged && cell.address !== cell.master.address) return;
        const value = cellText(cell.value);
        if (!value) return;
        const raw = cell.value;
        const href = raw && typeof raw === "object" && "hyperlink" in raw
          ? workbookSourceHyperlink(String((raw as { hyperlink?: string }).hyperlink ?? ""))
          : undefined;
        const record: WorkbookCell = { column: Number(cell.col), value, ...(href ? { hyperlink: href } : {}) };
        cells.push(record);
        populatedCells++;
      });
      if (!cells.length) return;
      const record = { number: row.number, cells };
      totalBytes += Buffer.byteLength(JSON.stringify(record), "utf8");
      if (totalBytes > DOCUMENT_EVIDENCE_MAX_BYTES) throw new Error("This workbook contains more than 512 KB of text. Export the sheets you need as CSV or use a smaller workbook.");
      rows.push(record);
    });
    snapshot.sheets.push({ name: sheet.name, hidden: sheet.state !== "visible", rows });
  }
  if (!populatedCells) throw new Error("This workbook has no readable cell values. Charts and images are not included.");
  return JSON.stringify(snapshot);
}
