import { expect, it } from "vitest";
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { artifactExportDescriptor, renderWorkbookForNativeExport } from "../../apps/runtime/src/services/native-file-export.js";

it("exports workbook values and safe links without evaluating formula-looking text", async () => {
  const snapshot = JSON.stringify({
    format: "aux.workbook.v1",
    sheets: [{ name: "Report", hidden: false, rows: [{ number: 3, cells: [
      { column: 2, value: "=1+1" },
      { column: 5, value: "Source", hyperlink: "https://example.com/source" },
      { column: 6, value: "Unsafe", hyperlink: "javascript:alert(1)" },
    ] }] }],
  });
  const rendered = await renderWorkbookForNativeExport(snapshot);
  expect(rendered.filename).toBe("workbook.xlsx");
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(Buffer.from(rendered.dataBase64, "base64") as unknown as Parameters<typeof book.xlsx.load>[0]);
  const sheet = book.getWorksheet("Report")!;
  expect(sheet.getCell("B3").value).toBe("=1+1");
  expect(sheet.getCell("E3").value).toEqual({ text: "Source", hyperlink: "https://example.com/source" });
  expect(sheet.getCell("F3").value).toBe("Unsafe");

  const csv = await renderWorkbookForNativeExport('Name,Value\r\n"A,B","=SUM(1,2)"\r\n', "csv");
  const csvBook = new ExcelJS.Workbook();
  await csvBook.xlsx.load(Buffer.from(csv.dataBase64, "base64") as unknown as Parameters<typeof csvBook.xlsx.load>[0]);
  expect(csvBook.getWorksheet("Results")!.getCell("A2").value).toBe("A,B");
  expect(csvBook.getWorksheet("Results")!.getCell("B2").value).toBe("=SUM(1,2)");

  await expect(renderWorkbookForNativeExport(JSON.stringify({
    format: "aux.workbook.v1",
    sheets: [{ name: "Sparse", hidden: false, rows: [{ number: 100_000, cells: [{ column: 100, value: "x" }] }] }],
  }))).rejects.toThrow(/layout exceeds/);
});

it("allows only complete, unchanged artifacts within the runtime store", () => {
  const root = mkdtempSync(join(tmpdir(), "aux-export-"));
  try {
    const artifacts = join(root, "artifacts");
    mkdirSync(artifacts);
    const stored = join(artifacts, "report.txt");
    const outside = join(root, "outside.txt");
    writeFileSync(stored, "report");
    writeFileSync(outside, "outside");
    const artifact = (path: string, size: number, status = "complete") =>
      ({ path, size, status });
    const id = "artifact-1234";
    expect(artifactExportDescriptor({ getArtifact: () => artifact(stored, 6) as never }, id, artifacts))
      .toEqual({ path: realpathSync(stored), size: 6 });
    expect(() => artifactExportDescriptor({ getArtifact: () => artifact(outside, 7) as never }, id, artifacts))
      .toThrow(/outside Aux storage/);
    expect(() => artifactExportDescriptor({ getArtifact: () => artifact(stored, 5) as never }, id, artifacts))
      .toThrow(/changed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
