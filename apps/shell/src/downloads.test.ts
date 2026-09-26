import { expect, it } from "vitest";
import type { Download } from "@aux/contracts";
import { canDismissDownload, mergeDownloadSnapshot } from "./downloads";

const transfer: Download = { id: "transfer", filename: "report.csv", path: "/tmp/report.csv", state: "progressing", size: 10, startedAt: 1, canCancel: true };

it("does not regress completed or newly started transfers when a stale snapshot arrives", () => {
  const finished = { ...transfer, state: "completed" as const, size: 100, canCancel: false };
  const started = { ...transfer, id: "new" };
  expect(mergeDownloadSnapshot([finished, started], [transfer], new Set(["transfer", "new"]))).toEqual([finished, started]);
});

it("recovers stale persisted transfers while retaining current private and regular snapshots", () => {
  const live = { ...transfer, id: "live", paused: true, size: 50 };
  const result = mergeDownloadSnapshot([transfer], [live], new Set());
  expect(result).toEqual([live, { ...transfer, state: "interrupted", canCancel: false, canResume: false, paused: false }]);
});

it("allows inactive downloads to be dismissed without hiding a resumable transfer", () => {
  expect(canDismissDownload({...transfer,state:"interrupted",canCancel:true,canResume:true})).toBe(false);
  for (const state of ["completed", "cancelled", "interrupted"] as const) expect(canDismissDownload({...transfer,state,canCancel:false})).toBe(true);
  expect(canDismissDownload({...transfer,canCancel:false})).toBe(false);
});
