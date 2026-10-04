import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import { staticFieldProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { useState } from "react";
import type { RoutineTrigger } from "@aux/contracts";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarTriggerAccounts = {
  status: "loading" | "ready" | "error";
  choices: { grantId: string; connectionId: string; label: string; accountKey: string }[];
  message?: string;
  scopeKey?: string;
};

export function routineScheduleSummary(trigger: RoutineTrigger): string {
  if (trigger.kind === "manual") return "On demand";
  if (trigger.kind === "monitor") return `Every ${trigger.intervalMinutes} minutes · ${trigger.timezone}`;
  if (trigger.kind === "site_notification") return `Site notification · ${trigger.origin}`;
  if (trigger.kind === "page_change") return `Page change · ${trigger.url}`;
  if (trigger.kind === "calendar_event") return `Calendar event · ${trigger.beforeMinutes} minutes before`;
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
  mode = "edit",
}: {
  trigger: RoutineTrigger;
  disabled: boolean;
  calendar?: CalendarTriggerAccounts;
  onSave: (trigger: RoutineTrigger) => void;
  mode?: "edit" | "create";
}) {
  const [kind, setKind] = useState<RoutineTrigger["kind"]>(trigger.kind);
  const [time, setTime] = useState(
    trigger.kind === "schedule"
      ? `${String(trigger.hour).padStart(2, "0")}:${String(trigger.minute).padStart(2, "0")}`
      : "09:00",
  );
  const [days, setDays] = useState(trigger.kind === "schedule" ? trigger.days : [1, 2, 3, 4, 5]);
  const [interval, setInterval] = useState(trigger.kind === "monitor" ? trigger.intervalMinutes : 60);
  const [site, setSite] = useState(
    trigger.kind === "site_notification" ? trigger.origin : trigger.kind === "page_change" ? trigger.url : "",
  );
  const [siteError, setSiteError] = useState("");
  const [minimumInterval, setMinimumInterval] = useState(
    trigger.kind === "page_change" ? trigger.minimumIntervalMinutes : 5,
  );
  const [grantId, setGrantId] = useState(trigger.kind === "calendar_event" ? trigger.grantId : "");
  const [beforeMinutes, setBeforeMinutes] = useState(
    trigger.kind === "calendar_event" ? trigger.beforeMinutes : 0,
  );
  const timezone =
    trigger.kind === "schedule" || trigger.kind === "monitor"
      ? trigger.timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const selectedGrant = calendar?.choices.find((choice) => choice.grantId === grantId);
  const saveDisabled = (kind === "schedule" && !days.length) || (kind === "calendar_event" && !selectedGrant);

  let summary = "Run this Skill whenever you need it.";
  if (kind === "schedule")
    summary =
      days.length && time
        ? routineScheduleSummary({
            kind,
            timezone,
            hour: Number(time.split(":")[0]),
            minute: Number(time.split(":")[1]),
            days,
          })
        : "Choose a time and at least one day.";
  if (kind === "monitor")
    summary = Number.isFinite(interval)
      ? routineScheduleSummary({ kind, timezone, intervalMinutes: interval })
      : "Choose an interval.";
  if (kind === "site_notification") summary = `Notification from ${site || "an exact site origin"}`;
  if (kind === "page_change") summary = `Change to ${site || "an exact page URL"}`;
  if (kind === "calendar_event")
    summary = selectedGrant
      ? `Calendar event · ${selectedGrant.label} · ${selectedGrant.accountKey}`
      : "Choose a Calendar grant.";

  return (
    <form
      className="routine-schedule"
      onSubmit={(event) => {
        event.preventDefault();
        if (kind === "manual") return onSave({ kind });
        if (kind === "monitor") return onSave({ kind, timezone, intervalMinutes: interval });
        if (kind === "schedule") {
          const [hour, minute] = time.split(":").map(Number);
          if (time && days.length) onSave({ kind, timezone, hour: hour!, minute: minute!, days });
          return;
        }
        if (kind === "calendar_event") {
          if (selectedGrant) onSave({ kind, grantId: selectedGrant.grantId, beforeMinutes });
          return;
        }
        try {
          const parsed = new URL(site);
          if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return;
          if (kind === "site_notification") {
            if (site !== parsed.origin) {
              setSiteError("Enter the exact site origin without a path, query, or fragment.");
              return;
            }
            onSave({ kind, origin: parsed.origin });
          } else onSave({ kind, url: parsed.href, minimumIntervalMinutes: minimumInterval });
        } catch {
          /* The URL input remains invalid. */
        }
      }}
    >
      <fieldset disabled={disabled}>
        <legend>When</legend>
        <label>
          Trigger
          <select value={kind} onChange={(event) => setKind(event.target.value as RoutineTrigger["kind"])}>
            {mode === "edit" && <option value="manual">On demand</option>}
            <option value="schedule">Scheduled time</option>
            <option value="monitor">Recurring monitor</option>
            <option value="site_notification">Site notification</option>
            <option value="page_change">Page change</option>
            <option value="calendar_event">Calendar event</option>
          </select>
        </label>
        {kind === "calendar_event" && (
          <div {...staticFieldProps}>
            <label>
              Calendar task grant
              <select
                required
                value={selectedGrant?.grantId ?? ""}
                disabled={calendar?.status !== "ready" || !calendar.choices.length}
                onChange={(event) => setGrantId(event.target.value)}
              >
                <option value="">Choose a granted Calendar account</option>
                {calendar?.choices.map((choice) => (
                  <option key={choice.grantId} value={choice.grantId}>
                    {choice.label} · {choice.accountKey}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minutes before event
              <input
                type="number"
                min={0}
                max={1440}
                step={1}
                value={beforeMinutes}
                onChange={(event) => setBeforeMinutes(event.target.valueAsNumber)}
              />
            </label>
            {calendar?.status === "loading" && <p {...staticHintProps}>Loading Calendar grants…</p>}
            {calendar?.message && (
              <p
                className={calendar.status === "error" ? "field-error" : "hint"}
                role={calendar.status === "error" ? "alert" : undefined}
              >
                {calendar.message}
              </p>
            )}
            {trigger.kind === "calendar_event" &&
              trigger.grantId &&
              calendar?.status === "ready" &&
              !selectedGrant && (
                <p {...staticHintProps}>
                  The previous task grant is unavailable. Choose another reviewed grant.
                </p>
              )}
          </div>
        )}
        {(kind === "site_notification" || kind === "page_change") && (
          <>
            <label>
              {kind === "site_notification" ? "Exact site origin" : "Exact page URL"}
              <input
                type="url"
                required
                value={site}
                onChange={(event) => {
                  setSite(event.target.value);
                  setSiteError("");
                }}
                placeholder="https://example.com"
              />
            </label>
            {siteError && (
              <output {...staticFieldErrorProps} data-block>
                {siteError}
              </output>
            )}
            {kind === "page_change" && (
              <label>
                Minimum minutes between runs
                <input
                  type="number"
                  min={5}
                  max={1440}
                  step={1}
                  value={minimumInterval}
                  onChange={(event) => setMinimumInterval(event.target.valueAsNumber)}
                />
              </label>
            )}
            <p {...staticHintProps}>
              Add this site to the Skill’s reviewed site scope. Events are observed only while Aux is open.
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
              <button {...smallGhostButtonProps} {...auxNativeButtonTypeProps} onClick={() => setDays([1, 2, 3, 4, 5])}>
                Weekdays
              </button>
              <button {...smallGhostButtonProps} {...auxNativeButtonTypeProps} onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}>
                Every day
              </button>
            </div>
            <div className="routine-days" role="group" aria-label="Days of the week">
              {weekdays.map((day, index) => (
                <button
                  key={day}
                  {...auxNativeButtonTypeProps}
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
              <output {...staticFieldErrorProps} data-block>
                Choose at least one day.
              </output>
            )}
            <p {...staticHintProps}>
              On clock-change days, a missing local time is skipped. A repeated local time runs once at its
              first occurrence.
            </p>
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
          <p {...staticHintProps}>
            {timezone} ·{" "}
            {mode === "create"
              ? "Saved task review criteria carry into this Skill."
              : "Existing review requirements remain unchanged."}
          </p>
        )}
        <output className="routine-schedule-summary" data-block>
          {summary}
        </output>
        <button className="btn" type="submit" disabled={!!saveDisabled}>
          {mode === "create" ? "Create paused Skill" : "Save trigger"}
        </button>
      </fieldset>
    </form>
  );
}
