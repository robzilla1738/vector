import type { Download } from "@vector/contracts";

/** Only the native owner can establish that a previous-process transfer is gone. */
export function interruptedDownloadHistory(records: Download[], liveIds: ReadonlySet<string>, processStartedAt: number, now = Date.now()): Download[] {
  return records.filter(record => record.startedAt < processStartedAt && !liveIds.has(record.id) && ["started", "progressing"].includes(record.state))
    .map(record => ({ ...record, state: "interrupted", endedAt: now, paused: false, canCancel: false, canResume: false }));
}
