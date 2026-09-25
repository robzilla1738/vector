import { useState } from "react";
import type { CalendarConnection, RoutineTrigger } from "@aux/contracts";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarTriggerAccounts = {
  status: "loading" | "ready" | "error";
  choices: CalendarConnection[];
  message?: string;
  scopeKey?: string;
};

export function routineScheduleSummary(trigger: RoutineTrigger): string {
  if (trigger.kind === "manual") return "On demand";
  if (trigger.kind === "monitor") return `Every ${trigger.intervalMinutes} minutes · ${trigger.timezone}`;
  if (trigger.kind === "event") {
    if (trigger.source === "calendar_event") return "Calendar event";
    const source = trigger.source === "page_change" ? "Page change" : "Site notification";
    return `${source} · ${trigger.origin ?? "Choose an origin"}`;
  }
  const days = [...trigger.days].sort();
  const label =
    days.length === 7
      ? "Every day"
      : days.join() === "1,2,3,4,5"
        ? "Weekdays"
        : days.map((day) => weekdays[day]).join(", ");
  const time = `${String(trigger.hour).padStart(2, "0")}:${String(trigger.minute).padStart(2, "0")}`;
  return `${label} at ${time} · ${trigger.timezone}`;
}

export function RoutineSchedule({
  trigger,
  disabled,
  calendar,
  onSave,
}: {
  trigger: RoutineTrigger;
  disabled: boolean;
  calendar?: CalendarTriggerAccounts;
  onSave: (trigger: RoutineTrigger) => void;
}) {
  const [kind, setKind] = useState(trigger.kind);
  const [time, setTime] = useState(
    trigger.kind === "schedule"
      ? `${String(trigger.hour).padStart(2, "0")}:${String(trigger.minute).padStart(2, "0")}`
      : "09:00",
  );
  const [days, setDays] = useState(trigger.kind === "schedule" ? trigger.days : [1, 2, 3, 4, 5]);
  const [interval, setInterval] = useState(trigger.kind === "monitor" ? trigger.intervalMinutes : 60);
  const [eventSource, setEventSource] = useState<Extract<RoutineTrigger, { kind: "event" }>["source"]>(
    trigger.kind === "event" ? trigger.source : "page_change",
  );
  const [origin, setOrigin] = useState(trigger.kind === "event" ? (trigger.origin ?? "") : "");
  const [connectionId, setConnectionId] = useState(
    trigger.kind === "event" ? (trigger.connectionId ?? "") : "",
  );
  const timezone =
    trigger.kind === "schedule" || trigger.kind === "monitor"
      ? trigger.timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const selectedConnection = calendar?.choices.find((account) => account.connectionId === connectionId);
  const calendarEvent = kind === "event" && eventSource === "calendar_event";
  const saveDisabled = (kind === "schedule" && !days.length) || (calendarEvent && !selectedConnection);
  let summary: string;
  if (kind === "manual") summary = "Run this routine whenever you need it.";
  else if (calendarEvent)
    summary = selectedConnection
      ? `Calendar event · ${selectedConnection.label} · ${selectedConnection.accountKey}`
      : "Choose a Calendar account.";
  else if (kind === "event") summary = routineScheduleSummary({ kind, source: eventSource, origin });
  else if (kind === "monitor")
    summary = Number.isFinite(interval)
      ? routineScheduleSummary({ kind, timezone, intervalMinutes: interval })
      : "Choose an interval.";
  else
    summary =
      days.length && time
        ? routineScheduleSummary({
            kind: "schedule",
            timezone,
            hour: Number(time.split(":")[0]),
            minute: Number(time.split(":")[1]),
            days,
          })
        : "Choose a time and at least one day.";

  return (
    <form
      className="routine-schedule"
      onSubmit={(event) => {
        event.preventDefault();
        if (kind === "manual") {
          onSave({ kind });
          return;
        }
        if (kind === "monitor") {
          onSave({ kind, timezone, intervalMinutes: interval });
          return;
        }
        if (kind === "event") {
          if (eventSource === "calendar_event") {
            if (selectedConnection)
              onSave({ kind, source: eventSource, connectionId: selectedConnection.connectionId });
          } else {
            try {
              const parsed = new URL(origin);
              if (["http:", "https:"].includes(parsed.protocol))
                onSave({ kind, source: eventSource, origin: parsed.origin });
            } catch {
              /* The field's validation message remains visible. */
            }
          }
          return;
        }
        const [hour, minute] = time.split(":").map(Number);
        if (!time || !days.length) return;
        onSave({ kind, timezone, hour: hour!, minute: minute!, days });
      }}
    >
      <fieldset disabled={disabled}>
        <legend>When</legend>
        <label>
          Trigger
          <select value={kind} onChange={(event) => setKind(event.target.value as RoutineTrigger["kind"])}>
            <option value="manual">On demand</option>
            <option value="schedule">Scheduled time</option>
            <option value="monitor">Recurring monitor</option>
            <option value="event">Browser or Calendar event</option>
          </select>
        </label>
        {kind === "event" && (
          <>
            <label>
              Event
              <select
                value={eventSource}
                onChange={(event) => setEventSource(event.target.value as typeof eventSource)}
              >
                <option value="page_change">Page changed</option>
                <option value="site_notification">Site notification</option>
                <option value="calendar_event">Calendar event</option>
              </select>
            </label>
            {eventSource === "calendar_event" ? (
              <div className="field">
                <label>
                  Calendar account
                  <select
                    required
                    value={selectedConnection?.connectionId ?? ""}
                    disabled={calendar?.status !== "ready" || !calendar.choices.length}
                    onChange={(event) => setConnectionId(event.target.value)}
                  >
                    <option value="">Choose a Calendar account</option>
                    {calendar?.choices.map((account) => (
                      <option key={account.connectionId} value={account.connectionId}>
                        {account.label} · {account.accountKey}
                      </option>
                    ))}
                  </select>
                </label>
                {calendar?.status === "loading" && <p className="hint">Loading Calendar accounts…</p>}
                {calendar?.message && (
                  <p
                    className={calendar.status === "error" ? "field-error" : "hint"}
                    role={calendar.status === "error" ? "alert" : undefined}
                  >
                    {calendar.message}
                  </p>
                )}
                {calendar?.status === "ready" &&
                  calendar.choices.length > 0 &&
                  trigger.kind === "event" &&
                  trigger.source === "calendar_event" &&
                  trigger.connectionId &&
                  !selectedConnection && (
                    <p className="hint">
                      The previously selected Calendar account is unavailable. Choose another granted account.
                    </p>
                  )}
              </div>
            ) : (
              <label>
                Exact site origin
                <input
                  type="url"
                  required
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="https://example.com"
                />
              </label>
            )}
            <p className="hint">
              Events run only while Aux is open. Site notifications require a native site grant and Calendar
              events require a task grant.
            </p>
          </>
        )}
        {kind === "schedule" && (
          <>
            <label>
              Time
              <input type="time" required value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
            <div className="routine-day-presets">
              <button className="btn sm ghost" type="button" onClick={() => setDays([1, 2, 3, 4, 5])}>
                Weekdays
              </button>
              <button className="btn sm ghost" type="button" onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}>
                Every day
              </button>
            </div>
            <div className="routine-days" role="group" aria-label="Days of the week">
              {weekdays.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={days.includes(index)}
                  onClick={() =>
                    setDays((current) =>
                      current.includes(index)
                        ? current.filter((value) => value !== index)
                        : [...current, index].sort(),
                    )
                  }
                >
                  {day}
                </button>
              ))}
            </div>
            {!days.length && (
              <output className="field-error" data-block>
                Choose at least one day.
              </output>
            )}
          </>
        )}
        {kind === "monitor" && (
          <label>
            Every (minutes)
            <input
              type="number"
              required
              min={5}
              max={1440}
              step={1}
              value={interval}
              onChange={(event) => setInterval(event.target.valueAsNumber)}
            />
          </label>
        )}
        {(kind === "schedule" || kind === "monitor") && (
          <p className="hint">{timezone} · Existing review requirements remain unchanged.</p>
        )}
        <output className="routine-schedule-summary" data-block>
          {summary}
        </output>
        <button className="btn" type="submit" disabled={!!saveDisabled}>
          Save trigger
        </button>
      </fieldset>
    </form>
  );
}
