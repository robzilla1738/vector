import type { UsageReportResult } from "@aux/contracts";

function cell(value: string | number | null): string {
  const raw = value === null ? "" : String(value);
  // Spreadsheet apps interpret these prefixes as formulas, even in quoted CSV fields.
  const safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function usageReportCsv(report: UsageReportResult): string {
  const rows: (string | number | null)[][] = [
    ["Group", "ID", "Description", "Calls", "Recorded USD", "Unpriced calls", "Estimated calls", "Last call"],
  ];
  for (const run of report.byRun)
    rows.push([
      "Run",
      run.runId,
      run.title,
      run.calls,
      run.recordedUsd,
      run.unpricedCalls,
      run.estimatedCalls,
      new Date(run.lastAt).toISOString(),
    ]);
  for (const model of report.byModel)
    rows.push([
      "Model",
      model.modelId,
      "",
      model.calls,
      model.recordedUsd,
      model.unpricedCalls,
      model.estimatedCalls,
      "",
    ]);
  for (const day of report.byDay)
    rows.push([
      "Day",
      day.day,
      "Local calendar day",
      day.calls,
      day.recordedUsd,
      day.unpricedCalls,
      day.estimatedCalls,
      "",
    ]);
  rows.push([
    "Total",
    "",
    "Recorded USD includes estimates; unpriced calls are excluded",
    report.total.calls,
    report.total.recordedUsd,
    report.total.unpricedCalls,
    report.total.estimatedCalls,
    "",
  ]);
  return `\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;
}
