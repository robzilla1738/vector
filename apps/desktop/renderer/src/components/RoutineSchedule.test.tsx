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
  const trigger = {
    kind: "schedule" as const,
    timezone: "America/Chicago",
    hour: 15,
    minute: 30,
    days: [1, 3, 5],
  };
  act(() => root.render(<RoutineSchedule trigger={trigger} disabled={false} onSave={onSave} />));
  expect(container.querySelector<HTMLInputElement>('input[type="time"]')?.value).toBe("15:30");
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).toHaveBeenCalledWith(trigger);
});

it("requires a selected day and prevents saving an empty schedule", () => {
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        trigger={{ kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1] }}
        disabled={false}
        onSave={onSave}
      />,
    ),
  );
  act(() => container.querySelector<HTMLButtonElement>('[aria-pressed="true"]')!.click());
  expect(container.textContent).toContain("Choose at least one day.");
  expect(container.querySelector<HTMLButtonElement>('button:not([type="button"])')?.disabled).toBe(true);
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).not.toHaveBeenCalled();
});

it("keeps archived or busy schedules disabled", () => {
  act(() => root.render(<RoutineSchedule trigger={{ kind: "manual" }} disabled onSave={vi.fn()} />));
  expect(container.querySelector("fieldset")?.disabled).toBe(true);
});

it("applies day presets without submitting and preserves time and timezone on save", () => {
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        trigger={{ kind: "schedule", timezone: "America/Chicago", hour: 15, minute: 30, days: [0] }}
        disabled={false}
        onSave={onSave}
      />,
    ),
  );
  const preset = (name: string) =>
    [...container.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent === name,
    )!;
  act(() => preset("Every day").click());
  expect(container.querySelectorAll('.routine-days [aria-pressed="true"]')).toHaveLength(7);
  act(() => preset("Weekdays").click());
  expect(container.querySelectorAll('.routine-days [aria-pressed="true"]')).toHaveLength(5);
  expect(onSave).not.toHaveBeenCalled();
  expect(container.querySelector(".routine-schedule-summary")?.textContent).toBe(
    "Weekdays at 15:30 · America/Chicago",
  );
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).toHaveBeenCalledWith({
    kind: "schedule",
    timezone: "America/Chicago",
    hour: 15,
    minute: 30,
    days: [1, 2, 3, 4, 5],
  });
});

it("summarizes each trigger and orders days without mutating the saved schedule", () => {
  expect(routineScheduleSummary({ kind: "manual" })).toBe("On demand");
  expect(routineScheduleSummary({ kind: "monitor", intervalMinutes: 30, timezone: "UTC" })).toBe(
    "Every 30 minutes · UTC",
  );
  const trigger = { kind: "schedule" as const, days: [5, 1, 3], hour: 9, minute: 5, timezone: "UTC" };
  expect(routineScheduleSummary(trigger)).toBe("Mon, Wed, Fri at 09:05 · UTC");
  expect(trigger.days).toEqual([5, 1, 3]);
});

it("uses a labeled, granted Calendar account and never displays its connection ID", () => {
  const connectionId = "11111111-1111-4111-8111-111111111111";
  const account = {
    connectionId,
    provider: "google" as const,
    accountKey: "team@example.com",
    label: "Team Calendar",
    scopes: ["https://www.googleapis.com/auth/calendar.readonly" as const],
    state: "active" as const,
    createdAt: 1,
    updatedAt: 1,
  };
  const onSave = vi.fn();
  const trigger = { kind: "event" as const, source: "calendar_event" as const, connectionId };
  act(() =>
    root.render(
      <RoutineSchedule
        trigger={trigger}
        disabled={false}
        calendar={{ status: "ready", choices: [account] }}
        onSave={onSave}
      />,
    ),
  );
  expect(container.querySelector<HTMLSelectElement>(".routine-schedule select[required]")?.value).toBe(
    connectionId,
  );
  expect(container.textContent).toContain("Team Calendar · team@example.com");
  expect(container.textContent).not.toContain(connectionId);
  expect(routineScheduleSummary(trigger)).toBe("Calendar event");
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).toHaveBeenCalledWith(trigger);
});

it("prevents saving an unavailable Calendar connection and explains how to connect one", () => {
  const connectionId = "11111111-1111-4111-8111-111111111111";
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        trigger={{ kind: "event", source: "calendar_event", connectionId }}
        disabled={false}
        calendar={{
          status: "ready",
          choices: [],
          message: "Grant a Calendar account to this task revision.",
        }}
        onSave={onSave}
      />,
    ),
  );
  expect(container.querySelector("input[placeholder='Connection UUID']")).toBeNull();
  expect(container.querySelector<HTMLButtonElement>(".routine-schedule button.btn")?.disabled).toBe(true);
  expect(container.textContent).toContain("Grant a Calendar account to this task revision.");
  expect(container.textContent).not.toContain(connectionId);
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).not.toHaveBeenCalled();
});
