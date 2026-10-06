/** Read CSV rows without coercing values or truncating source data. */
export function readCsvRows(
  source: string,
  onRow: (row: string[], rowNumber: number) => void,
): { rowCount: number; columnCount: number } {
  const text = source.replace(/^\uFEFF/, "");
  let row: string[] = [],
    field = "",
    quoted = false,
    closed = false,
    rowCount = 0,
    columnCount = 0;
  const cell = () => {
    row.push(field);
    field = "";
    closed = false;
  };
  const line = () => {
    cell();
    columnCount = Math.max(columnCount, row.length);
    rowCount++;
    onRow(row, rowCount);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += char;
      continue;
    }
    if (char === ",") {
      cell();
      continue;
    }
    if (char === "\r" || char === "\n") {
      line();
      if (char === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    if (closed) throw new Error("Unexpected text after a quoted field.");
    if (char === '"') {
      if (field) throw new Error("Unexpected quote inside a field.");
      quoted = true;
    } else field += char;
  }
  if (quoted) throw new Error("A quoted field is not closed.");
  if (field || row.length || closed) line();
  return { rowCount, columnCount };
}
