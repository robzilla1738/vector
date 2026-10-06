import type { CalendarConnectionService } from "./calendar-connections.js";
import type { RoutineService } from "./routines.js";
import type { RoutineSourceEvent } from "@aux/contracts";

type Watch = ReturnType<RoutineService["calendarWatches"]>[number];
const GRACE_MS = 5 * 60_000;
const PAGE_LIMIT = 10;

/** Read only accounts granted to live Skills; keep event text out of routine storage. */
export async function pollCalendarRoutines(
  watches: Watch[],
  calendar: Pick<CalendarConnectionService, "taskEvents">,
  ingest: (event: RoutineSourceEvent) => Promise<unknown>,
  now = Date.now(),
  signal?: AbortSignal,
): Promise<void> {
  const groups = new Map<string, Watch[]>();
  for (const watch of watches) {
    const key = `${watch.taskId}:${watch.grantId}`;
    groups.set(key, [...(groups.get(key) ?? []), watch]);
  }
  for (const group of groups.values()) {
    if (signal?.aborted) return;
    const { taskId, grantId } = group[0]!;
    const offsets = group.map((watch) => watch.beforeMinutes);
    const timeMin = new Date(now + Math.min(...offsets) * 60_000 - GRACE_MS).toISOString();
    const timeMax = new Date(now + Math.max(...offsets) * 60_000 + 60_000).toISOString();
    let pageToken: string | undefined;
    const events: Awaited<ReturnType<CalendarConnectionService["taskEvents"]>>["events"] = [];
    for (let page = 0; page < PAGE_LIMIT; page++) {
      const result = await calendar.taskEvents(
        { taskId, grantId, timeMin, timeMax, limit: 100, ...(pageToken ? { pageToken } : {}) },
        signal,
      );
      events.push(...result.events);
      pageToken = result.nextPageToken;
      if (!pageToken) break;
    }
    if (pageToken)
      throw new Error("Calendar automation scan exceeded its page limit; no results were enqueued.");
    const seen = new Set<string>();
    for (const event of events) {
      if (signal?.aborted) return;
      const startAt = Date.parse(event.start);
      if (!Number.isFinite(startAt) || startAt < 0 || event.source.connectionId.length === 0) continue;
      if (
        !offsets.some((minutes) => {
          const dueAt = startAt - minutes * 60_000;
          return dueAt >= now - GRACE_MS && dueAt <= now + 30_000;
        })
      )
        continue;
      const identity = `${event.source.calendarId}:${event.eventId}:${startAt}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      await ingest({
        kind: "calendar_event",
        grantId,
        connectionId: event.source.connectionId,
        calendarId: event.source.calendarId,
        eventId: event.eventId,
        startAt,
        observedAt: now,
      });
    }
  }
}
