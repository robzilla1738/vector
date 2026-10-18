import { GoogleArguments } from "@aux/contracts/google";
import type { z } from "zod";

type Write = z.output<(typeof GoogleArguments)["sheets.write"]>;
type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as ObjectValue) : undefined;

function bounds(range: unknown) {
  if (typeof range !== "string") return;
  const match =
    /^(?:'((?:[^'\r\n]|'')+)'|([A-Za-z_][A-Za-z0-9_ ]*))!\$?([A-Z]{1,3})\$?([1-9][0-9]{0,6})(?::\$?([A-Z]{1,3})\$?([1-9][0-9]{0,6}))?$/.exec(
      range,
    );
  if (!match) return;
  const column = (letters: string) => [...letters].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  const result = {
    title: match[1]?.replaceAll("''", "'") ?? match[2]!,
    row: Number(match[4]),
    column: column(match[3]!),
    endRow: Number(match[6] ?? match[4]),
    endColumn: column(match[5] ?? match[3]!),
  };
  if (result.endRow < result.row || result.endColumn < result.column) return;
  return result;
}

function matrix(value: unknown, rows: number, columns: number): unknown[][] | undefined {
  if (!Array.isArray(value) || value.length > rows || rows * columns > 10_000) return;
  if (value.some((row) => !Array.isArray(row) || row.length > columns)) return;
  const result = Array.from({ length: rows }, () => Array<unknown>(columns).fill(""));
  for (const [r, row] of value.entries())
    for (const [c, cell] of (row as unknown[]).entries()) {
      if (!(
        typeof cell === "string" ||
        typeof cell === "boolean" ||
        (typeof cell === "number" && Number.isFinite(cell))
      ))
        return;
      result[r]![c] = cell;
    }
  return result;
}

/** Compare an independent read with exact RAW input or the provider's parsed USER_ENTERED result.
 * Sheets omits trailing empty cells. USER_ENTERED deliberately delegates parsing to Sheets;
 * its original write response and later FORMULA read must agree, never a blind input echo.
 */
export function verifyGoogleValuesWrite(input: Write, response: ObjectValue, observed: ObjectValue): boolean {
  const expectedRange = bounds(input.range),
    actualRange = bounds(observed.range);
  if (
    !expectedRange ||
    !actualRange ||
    JSON.stringify(expectedRange) !== JSON.stringify(actualRange) ||
    response.spreadsheetId !== input.spreadsheetId ||
    (observed.majorDimension !== undefined && observed.majorDimension !== "ROWS")
  )
    return false;
  const rows = input.values.length,
    columns = input.values[0]!.length;
  if (
    expectedRange.endRow - expectedRange.row + 1 !== rows ||
    expectedRange.endColumn - expectedRange.column + 1 !== columns
  )
    return false;
  let expected: unknown = input.values;
  if (input.valueInputOption === "USER_ENTERED") {
    if (!Array.isArray(response.responses) || response.responses.length !== 1) return false;
    const result = object(response.responses[0]),
      data = object(result?.updatedData);
    if (
      !data ||
      (result?.spreadsheetId !== undefined && result.spreadsheetId !== input.spreadsheetId) ||
      (data.majorDimension !== undefined && data.majorDimension !== "ROWS") ||
      JSON.stringify(bounds(data.range)) !== JSON.stringify(expectedRange)
    )
      return false;
    expected = data.values ?? [];
  }
  const a = matrix(expected, rows, columns),
    b = matrix(observed.values ?? [], rows, columns);
  return !!a && !!b && JSON.stringify(a) === JSON.stringify(b);
}
