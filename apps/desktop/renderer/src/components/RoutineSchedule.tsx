import { useState } from "react";
import type { RoutineTrigger } from "@vector/contracts";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RoutineSchedule({ trigger, disabled, onSave }: {
  trigger: RoutineTrigger;
  disabled: boolean;
  onSave: (trigger: RoutineTrigger) => void;
}) {
  const [kind, setKind] = useState(trigger.kind);
  const [time, setTime] = useState(trigger.kind === "schedule" ? `${String(trigger.hour).padStart(2, "0")}:${String(trigger.minute).padStart(2, "0")}` : "09:00");
  const [days, setDays] = useState(trigger.kind === "schedule" ? trigger.days : [1, 2, 3, 4, 5]);
  const [interval, setInterval] = useState(trigger.kind === "monitor" ? trigger.intervalMinutes : 60);
  const timezone = trigger.kind === "manual" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : trigger.timezone;

  return <form className="routine-schedule" onSubmit={event => {
    event.preventDefault();
    if (kind === "manual") { onSave({ kind }); return; }
    if (kind === "monitor") { onSave({ kind, timezone, intervalMinutes: interval }); return; }
    const [hour, minute] = time.split(":").map(Number);
    if (!time || !days.length) return;
    onSave({ kind, timezone, hour: hour!, minute: minute!, days });
  }}>
    <fieldset disabled={disabled}>
      <legend>When</legend>
      <label>Trigger<select value={kind} onChange={event => setKind(event.target.value as RoutineTrigger["kind"])}><option value="manual">On demand</option><option value="schedule">Scheduled time</option><option value="monitor">Recurring monitor</option></select></label>
      {kind === "schedule" && <>
        <label>Time<input type="time" required value={time} onChange={event => setTime(event.target.value)} /></label>
        <div className="routine-days" role="group" aria-label="Days of the week">{weekdays.map((day, index) => <button key={day} type="button" aria-pressed={days.includes(index)} onClick={() => setDays(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index].sort())}>{day}</button>)}</div>
        {!days.length && <p className="field-error" role="status">Choose at least one day.</p>}
      </>}
      {kind === "monitor" && <label>Every (minutes)<input type="number" required min={5} max={1440} step={1} value={interval} onChange={event => setInterval(event.target.valueAsNumber)} /></label>}
      {kind !== "manual" && <p className="hint">{timezone} · Existing review requirements remain unchanged.</p>}
      <button className="btn" disabled={kind === "schedule" && !days.length}>Save schedule</button>
    </fieldset>
  </form>;
}
