import { AuxError } from "@aux/contracts";
import { GoogleArguments } from "@aux/contracts/google";
import type { z } from "zod";

/** A bounded sparse CellData projection; values-only grants cannot select this operation. */
export function projectGoogleGrid(
  value: Record<string, unknown>,
  input: z.output<(typeof GoogleArguments)["sheets.grid.read"]>,
) {
  if (value.spreadsheetId !== input.spreadsheetId || !Array.isArray(value.sheets))
    throw new AuxError("ref_stale", "The original Google spreadsheet identity changed.");
  const bang = input.range.lastIndexOf("!"),
    name = input.range.slice(0, bang);
  const title = name.startsWith("'") ? name.slice(1, -1).replaceAll("''", "'") : name;
  const endpoints = input.range
    .slice(bang + 1)
    .replaceAll("$", "")
    .split(":");
  const point = (text: string) => {
    const match = /^([A-Z]+)([0-9]+)$/.exec(text)!;
    return {
      row: Number(match[2]) - 1,
      column: [...match[1]!].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1,
    };
  };
  const start = point(endpoints[0]!),
    end = point(endpoints[1] ?? endpoints[0]!);
  const rows = end.row - start.row + 1,
    columns = end.column - start.column + 1;
  if (rows < 1 || columns < 1 || rows * columns > 10_000)
    throw new AuxError("invalid_params", "Choose a grid of at most 10,000 cells.");
  const sheets = value.sheets.filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item),
  );
  const matches = sheets.filter(
    (sheet) => (sheet.properties as { title?: unknown } | undefined)?.title === title,
  );
  if (matches.length !== 1) throw new AuxError("ref_stale", "The original spreadsheet tab changed.");
  const sheet = matches[0]!,
    properties = sheet.properties as { sheetId?: unknown };
  if (
    !Number.isSafeInteger(properties.sheetId) ||
    (properties.sheetId as number) < 0 ||
    !Array.isArray(sheet.data ?? [])
  )
    throw new AuxError("backend_unavailable", "Google returned invalid grid identity.");
  const cells: Record<string, unknown>[] = [],
    seen = new Set<string>();
  let visited = 0;
  for (const block of (sheet.data ?? []) as {
    startRow?: number;
    startColumn?: number;
    rowData?: { values?: Record<string, unknown>[] }[];
  }[]) {
    if (++visited > 20_000)
      throw new AuxError("backend_unavailable", "Google returned more grid blocks than admitted.");
    if (
      !block ||
      !Number.isSafeInteger(block.startRow ?? 0) ||
      !Number.isSafeInteger(block.startColumn ?? 0) ||
      (block.startRow ?? 0) < 0 ||
      (block.startColumn ?? 0) < 0 ||
      !Array.isArray(block.rowData ?? [])
    )
      throw new AuxError("backend_unavailable", "Google returned invalid grid offsets.");
    for (const [r, row] of (block.rowData ?? []).entries()) {
      if (++visited > 20_000)
        throw new AuxError("backend_unavailable", "Google returned more grid cells than admitted.");
      if (!row || !Array.isArray(row.values ?? []))
        throw new AuxError("backend_unavailable", "Google returned invalid grid cells.");
      for (const [c, cell] of (row.values ?? []).entries()) {
        if (++visited > 20_000)
          throw new AuxError("backend_unavailable", "Google returned more grid cells than admitted.");
        const rowIndex = (block.startRow ?? 0) + r,
          columnIndex = (block.startColumn ?? 0) + c;
        if (
          rowIndex < start.row ||
          rowIndex > end.row ||
          columnIndex < start.column ||
          columnIndex > end.column
        )
          continue;
        const key = `${rowIndex}:${columnIndex}`;
        if (seen.has(key) || !cell || typeof cell !== "object" || Array.isArray(cell))
          throw new AuxError("backend_unavailable", "Google returned overlapping or invalid grid cells.");
        seen.add(key);
        const result: Record<string, unknown> = { rowIndex, columnIndex };
        for (const field of ["userEnteredValue", "effectiveValue", "userEnteredFormat", "effectiveFormat"])
          if (cell[field] !== undefined) {
            if (!cell[field] || typeof cell[field] !== "object" || Array.isArray(cell[field]))
              throw new AuxError("backend_unavailable", "Google returned invalid grid field data.");
            result[field] = cell[field];
          }
        for (const field of ["formattedValue", "note"])
          if (cell[field] !== undefined) {
            if (typeof cell[field] !== "string")
              throw new AuxError("backend_unavailable", "Google returned invalid cell text.");
            result[field] = cell[field].slice(0, 20_000);
            if (cell[field].length > 20_000) result[`${field}Truncated`] = true;
          }
        cells.push(result);
      }
    }
  }
  return {
    spreadsheetId: input.spreadsheetId,
    sheetId: properties.sheetId,
    title,
    range: input.range,
    startRowIndex: start.row,
    startColumnIndex: start.column,
    rowCount: rows,
    columnCount: columns,
    cells,
    omittedCells: "blank",
    concurrency: "observed-range-not-an-atomic-revision",
  };
}
