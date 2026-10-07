import type { RRuleTemporal, TemporalZonedDateTimeInput } from "rrule-temporal";
import { createRequire } from "node:module";
import { AuxError, type RoutineTrigger } from "@aux/contracts";

type Weekly = Extract<RoutineTrigger, { kind: "schedule" }>;
type Recurrence = Extract<RoutineTrigger, { kind: "rrule" }>;
const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const rules = new Map<string, RRuleTemporal>();

const requireRecurrence = createRequire(import.meta.url);
let constructor: (typeof import("rrule-temporal"))["RRuleTemporal"] | undefined;
/** Public CJS entry is installed in source and explicitly vendored in the package. */
function recurrenceConstructor(): (typeof import("rrule-temporal"))["RRuleTemporal"] {
  if (constructor) return constructor;
  const module: typeof import("rrule-temporal") = requireRecurrence("#rrule-temporal");
  if (typeof module.RRuleTemporal !== "function")
    throw new AuxError("backend_unavailable", "The packaged recurrence evaluator is unavailable.");
  constructor = module.RRuleTemporal;
  return constructor;
}

function instant(at: number, timezone: string): TemporalZonedDateTimeInput {
  const iso = new Date(at).toISOString();
  return { timeZoneId: timezone, toString: () => `${iso}[${timezone}]` };
}
function recurrence(trigger: Recurrence): RRuleTemporal {
  const key = JSON.stringify(trigger);
  const existing = rules.get(key);
  if (existing) return existing;
  try {
    const rule = new (recurrenceConstructor())({
      rruleString: trigger.rrule,
      dtstart: instant(trigger.startAt, trigger.timezone),
      tzid: trigger.timezone,
      strict: true,
      includeDtstart: false,
      cache: false,
      maxIterations: 10_000,
      maxCandidateEvaluations: 100_000,
    });
    if (rules.size >= 100) rules.delete(rules.keys().next().value!);
    rules.set(key, rule);
    return rule;
  } catch {
    throw new AuxError("invalid_params", "Enter a valid RFC 5545 recurrence rule and start date.");
  }
}
export function validateRecurrence(trigger: RoutineTrigger): void {
  if (trigger.kind === "rrule") recurrence(trigger);
}
function weekly(trigger: Weekly, at: number): RRuleTemporal {
  return new (recurrenceConstructor())({
    freq: "WEEKLY",
    // Weekly occurrences have whole-second identities, independent of the query cursor.
    dtstart: instant(Math.floor((at - 14 * 86400000) / 1000) * 1000, trigger.timezone),
    tzid: trigger.timezone,
    byDay: [...new Set(trigger.days)].map((day) => days[day]!),
    byHour: [trigger.hour],
    byMinute: [trigger.minute],
    bySecond: [0],
    strict: true,
    includeDtstart: false,
    cache: false,
    maxIterations: 100,
    maxCandidateEvaluations: 1000,
  });
}
export function nextScheduledTime(trigger: Weekly, from = Date.now()): number {
  const value = weekly(trigger, from).next(new Date(from), true);
  if (!value) throw new AuxError("invalid_params", "Could not compute the next scheduled occurrence.");
  return value.epochMilliseconds;
}
export function previousScheduledTime(trigger: Weekly, before = Date.now()): number {
  const value = weekly(trigger, before).previous(new Date(before), true);
  if (!value) throw new AuxError("invalid_params", "Could not compute the previous scheduled occurrence.");
  return value.epochMilliseconds;
}
export function previousRecurrenceTime(trigger: Weekly | Recurrence, before: number): number | null {
  if (trigger.kind === "schedule") return previousScheduledTime(trigger, before);
  try {
    return recurrence(trigger).previous(new Date(before), true)?.epochMilliseconds ?? null;
  } catch (error) {
    if (error instanceof AuxError) throw error;
    throw new AuxError(
      "invalid_params",
      "This recurrence exceeds the supported evaluation work. Simplify its filters.",
    );
  }
}
