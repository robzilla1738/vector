import { expect, it } from "vitest";
import type { Download } from "@aux/contracts";
import { NativeDownloadCollection, canDismissDownload, mergeDownloadSnapshot } from "./downloads";

const transfer: Download = {
  id: "transfer",
  filename: "report.csv",
  path: "/tmp/report.csv",
  state: "progressing",
  size: 10,
  startedAt: 1,
  canCancel: true,
};

it("does not regress completed or newly started transfers when a stale snapshot arrives", () => {
  const finished = { ...transfer, state: "completed" as const, size: 100, canCancel: false };
  const started = { ...transfer, id: "new" };
  expect(mergeDownloadSnapshot([finished, started], [transfer], new Set(["transfer", "new"]))).toEqual([
    finished,
    started,
  ]);
});

it("uses the native shelf without reviving absent runtime history", () => {
  const live = { ...transfer, id: "live", paused: true, size: 50 };
  const result = mergeDownloadSnapshot([transfer], [live], new Set());
  expect(result).toEqual([live]);
});

it("allows inactive downloads to be dismissed without hiding a resumable transfer", () => {
  expect(canDismissDownload({ ...transfer, state: "interrupted", canCancel: false, canResume: true })).toBe(
    false,
  );
  for (const state of ["completed", "cancelled", "interrupted"] as const)
    expect(canDismissDownload({ ...transfer, state, canCancel: false })).toBe(true);
  expect(canDismissDownload({ ...transfer, canCancel: false })).toBe(false);
});

it("a removal event wins over both a held snapshot and an earlier live update", () => {
  expect(
    mergeDownloadSnapshot([transfer], [transfer], new Set([transfer.id]), new Set([transfer.id])),
  ).toEqual([]);
});

it("a genuine resumed item wins over a held completed snapshot and its delayed dismissal acknowledgement", () => {
  const downloads = new NativeDownloadCollection();
  const completed = { ...transfer, state: "completed" as const, canCancel: false };
  downloads.receive(completed);
  const snapshot = downloads.begin();
  const dismissal = downloads.begin();
  downloads.remove([completed.id]);
  downloads.receive(completed);
  expect(downloads.values()).toEqual([]);
  const resumed = { ...transfer, size: 90, canResume: true };
  downloads.receive(resumed);
  downloads.remove([completed.id], dismissal);
  expect(downloads.snapshot([completed], snapshot)).toEqual([resumed]);

  const fresh = downloads.begin();
  downloads.remove([completed.id]);
  expect(downloads.snapshot([completed], fresh)).toEqual([]);
  const authoritative = downloads.begin();
  expect(downloads.snapshot([resumed], authoritative)).toEqual([resumed]);
});
