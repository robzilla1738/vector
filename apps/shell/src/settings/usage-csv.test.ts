import { expect, it } from "vitest";
import type { UsageReportResult } from "@aux/contracts";
import { usageReportCsv } from "./usage-csv";

it("exports every usage grouping and neutralizes spreadsheet formulas in model IDs and titles", () => {
  const bucket = { calls: 1, recordedUsd: 0.125, unpricedCalls: 0, estimatedCalls: 0 };
  const report: UsageReportResult = {
    asOf: Date.UTC(2026, 8, 27),
    total: bucket,
    byRun: [{ runId: "run-1", title: '=HYPERLINK("bad")', lastAt: Date.UTC(2026, 8, 27), ...bucket }],
    byModel: [{ modelId: "+cmd", ...bucket }],
    byDay: [{ day: "2026-09-27", ...bucket }],
    nextOffset: null,
  };
  const csv = usageReportCsv(report);
  expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  expect(csv).toContain('"\'+cmd"');
  expect(csv).toContain('"Day","2026-09-27"');
  expect(csv).toContain('"Total"');
});
