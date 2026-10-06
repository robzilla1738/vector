import { expect, it } from "vitest";
import { workbookColumnLabel, workbookSheetCsv } from "./workbook-sheet";
it("exports saved cells beyond preview limits without shifting sparse coordinates", () => {
  const rows = Array.from({ length: 105 }, (_, index) => ({
    number: index * 2 + 3,
    cells: [
      { column: 2, value: `Row ${index}` },
      { column: 28, value: index === 104 ? "=SUM(A1:A2)" : 'a,"b"' },
    ],
  }));
  const csv = workbookSheetCsv({ name: "Sheet", hidden: false, rows });
  expect(csv.split("\r\n")).toHaveLength(106);
  expect(csv.split("\r\n")[0]).toBe('"Row","B","AB"');
  expect(csv).toContain('"211","Row 104","\'=SUM(A1:A2)"');
  expect(workbookColumnLabel(16384)).toBe("XFD");
});
