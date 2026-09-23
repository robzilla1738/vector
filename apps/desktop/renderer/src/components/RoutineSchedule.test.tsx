// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RoutineSchedule, routineScheduleSummary } from "./RoutineSchedule";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("saves the existing schedule without changing its timezone or review policy", () => {
  const onSave = vi.fn();
  const trigger = { kind: "schedule" as const, timezone: "America/Chicago", hour: 15, minute: 30, days: [1, 3, 5] };
  act(() => root.render(<RoutineSchedule trigger={trigger} disabled={false} onSave={onSave} />));
  expect(container.querySelector<HTMLInputElement>('input[type="time"]')?.value).toBe("15:30");
  act(() => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  expect(onSave).toHaveBeenCalledWith(trigger);
});

it("requires a selected day and prevents saving an empty schedule", () => {
  const onSave = vi.fn();
  act(() => root.render(<RoutineSchedule trigger={{ kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1] }} disabled={false} onSave={onSave} />));
  act(() => container.querySelector<HTMLButtonElement>('[aria-pressed="true"]')!.click());
  expect(container.textContent).toContain("Choose at least one day.");
  expect(container.querySelector<HTMLButtonElement>('button:not([type="button"])')?.disabled).toBe(true);
  act(() => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  expect(onSave).not.toHaveBeenCalled();
});

it("keeps archived or busy schedules disabled", () => {
  act(() => root.render(<RoutineSchedule trigger={{ kind: "manual" }} disabled onSave={vi.fn()} />));
  expect(container.querySelector("fieldset")?.disabled).toBe(true);
});


it("applies day presets without submitting and preserves time and timezone on save", () => {
  const onSave = vi.fn();
  act(() => root.render(<RoutineSchedule trigger={{ kind: "schedule", timezone: "America/Chicago", hour: 15, minute: 30, days: [0] }} disabled={false} onSave={onSave} />));
  const preset = (name: string) => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === name)!;
  act(() => preset("Every day").click());
  expect(container.querySelectorAll('.routine-days [aria-pressed="true"]')).toHaveLength(7);
  act(() => preset("Weekdays").click());
  expect(container.querySelectorAll('.routine-days [aria-pressed="true"]')).toHaveLength(5);
  expect(onSave).not.toHaveBeenCalled();
  expect(container.querySelector(".routine-schedule-summary")?.textContent).toBe("Weekdays at 15:30 · America/Chicago");
  act(() => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  expect(onSave).toHaveBeenCalledWith({ kind: "schedule", timezone: "America/Chicago", hour: 15, minute: 30, days: [1, 2, 3, 4, 5] });
});

it("summarizes each trigger and orders days without mutating the saved schedule", () => {
  expect(routineScheduleSummary({ kind: "manual" })).toBe("On demand");
  expect(routineScheduleSummary({ kind: "monitor", intervalMinutes: 30, timezone: "UTC" })).toBe("Every 30 minutes · UTC");
  const trigger = { kind: "schedule" as const, days: [5, 1, 3], hour: 9, minute: 5, timezone: "UTC" };
  expect(routineScheduleSummary(trigger)).toBe("Mon, Wed, Fri at 09:05 · UTC");
  expect(trigger.days).toEqual([5, 1, 3]);
});
