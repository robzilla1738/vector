// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RoutineSchedule, routineScheduleSummary } from "./RoutineSchedule";

function choose(select: HTMLSelectElement, value: string) {
  act(() => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

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
  expect(container.textContent).toContain("a missing local time is skipped");
  expect(container.textContent).toContain("A repeated local time runs once at its first occurrence");
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
  choose(container.querySelector<HTMLSelectElement>('[aria-label="Routine repeat"]')!, "selected-days");
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

it("applies Repeat choices without submitting and preserves time and timezone on save", () => {
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
  const repeat = container.querySelector<HTMLSelectElement>('[aria-label="Routine repeat"]')!;
  choose(repeat, "daily");
  expect(container.querySelector(".routine-schedule-summary")?.textContent).toContain("Every day");
  choose(repeat, "weekdays");
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
  const grantId = "22222222-2222-4222-8222-222222222222";
  const account = {
    grantId,
    connectionId,
    accountKey: "team@example.com",
    label: "Team Calendar",
  };
  const onSave = vi.fn();
  const trigger = { kind: "calendar_event" as const, grantId, beforeMinutes: 0 };
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
    grantId,
  );
  expect(container.textContent).toContain("Team Calendar · team@example.com");
  expect(container.textContent).not.toContain(connectionId);
  expect(routineScheduleSummary(trigger)).toBe("Calendar event · 0 minutes before");
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).toHaveBeenCalledWith(trigger);
});

it("offers Calendar events when creating a task-backed automation", () => {
  act(() =>
    root.render(
      <RoutineSchedule
        mode="create"
        trigger={{ kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1] }}
        calendar={{ status: "ready", choices: [] }}
        disabled={false}
        onSave={vi.fn()}
      />,
    ),
  );
  expect([...container.querySelectorAll("option")].map((item) => item.value)).toContain("calendar_event");
});

it("prevents saving an unavailable Calendar connection and explains how to connect one", () => {
  const grantId = "22222222-2222-4222-8222-222222222222";
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        trigger={{ kind: "calendar_event", grantId, beforeMinutes: 0 }}
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
  expect(container.textContent).not.toContain(grantId);
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).not.toHaveBeenCalled();
});

it("rejects a site notification path rather than broadening it to the entire origin", () => {
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        trigger={{ kind: "site_notification", origin: "https://example.com/path" }}
        disabled={false}
        onSave={onSave}
      />,
    ),
  );
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).not.toHaveBeenCalled();
  expect(container.textContent).toContain("exact site origin without a path");
});

it("saves a Weekly choice with the selected weekday and retains the existing time zone", () => {
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        mode="create"
        trigger={{
          kind: "schedule",
          timezone: "America/Chicago",
          hour: 14,
          minute: 5,
          days: [0, 1, 2, 3, 4, 5, 6],
        }}
        disabled={false}
        onSave={onSave}
      />,
    ),
  );
  choose(container.querySelector<HTMLSelectElement>('[aria-label="Routine repeat"]')!, "weekly");
  choose(container.querySelector<HTMLSelectElement>('[aria-label="Routine weekday"]')!, "4");
  expect(onSave).not.toHaveBeenCalled();
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).toHaveBeenCalledWith({
    kind: "schedule",
    timezone: "America/Chicago",
    hour: 14,
    minute: 5,
    days: [4],
  });
});
it("lets scheduling be prepared before the prompt is ready but refuses submission", () => {
  const onSave = vi.fn();
  act(() =>
    root.render(
      <RoutineSchedule
        mode="create"
        trigger={{ kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [0, 1, 2, 3, 4, 5, 6] }}
        disabled={false}
        submitDisabled
        onSave={onSave}
      />,
    ),
  );
  const repeat = container.querySelector<HTMLSelectElement>('[aria-label="Routine repeat"]')!;
  expect(repeat.disabled).toBe(false);
  choose(repeat, "monitor");
  act(() =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(onSave).not.toHaveBeenCalled();
});
