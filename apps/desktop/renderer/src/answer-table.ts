/** Quote every cell and neutralize formula-like values before opening in a spreadsheet. */
export function answerTableCsv(rows: string[][]): string {
  return rows.map(row => row.map(cell => {
    const text = /^\s*[=+@-]/.test(cell) ? `'${cell}` : cell;
    return `"${text.replace(/"/g, '""')}"`;
  }).join(",")).join("\r\n");
}

export function answerTableMarkdown(rows: string[][]): string {
  return rows.map(row => row.map(cell => cell.replace(/\|/g, "\\|").replace(/\r?\n/g, " ")))
    .map((row, index) => `| ${row.join(" | ")} |${index === 0 ? `\n| ${row.map(() => "---").join(" | ")} |` : ""}`).join("\n");
}
