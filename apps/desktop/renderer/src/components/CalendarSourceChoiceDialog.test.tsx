// @vitest-environment jsdom
import { act, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BrowserProfile } from "../bridge";
import { CalendarSourceChoiceDialog } from "./CalendarSourceChoiceDialog";

let host: HTMLDivElement;
let opener: HTMLButtonElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  host = document.createElement("div");
  opener = document.createElement("button");
  opener.textContent = "Earlier source";
  document.body.append(opener, host);
  opener.focus();
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  opener.remove();
  vi.unstubAllGlobals();
});

it("keeps Profile choice in a modal and returns focus to the source on dismissal", async () => {
  const profiles: BrowserProfile[] = [
    { id: "default", name: "Personal", current: true },
    { id: "work", name: "Work", current: false },
  ];
  const choose = vi.fn();
  function Harness() {
    const [open, setOpen] = useState(true);
    const returnFocus = useRef<HTMLElement | null>(opener);
    const initialFocus = useRef<HTMLButtonElement>(null);
    return open ? (
      <CalendarSourceChoiceDialog
        choice={{
          source: {
            kind: "calendar",
            sourceId: "source-1",
            runId: "run-1",
            connectionId: "connection-1",
            accountKey: "alice@example.test",
            url: "https://calendar.google.com/calendar/event?eid=fixture",
            title: "Earlier meeting",
            start: "2026-09-24T10:00:00Z",
            end: "2026-09-24T11:00:00Z",
            observedAt: 1,
          },
          profiles,
        }}
        returnFocus={returnFocus}
        initialFocus={initialFocus}
        onClose={() => setOpen(false)}
        onChoose={choose}
      />
    ) : null;
  }

  await act(async () => root.render(<Harness />));
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Open Calendar source"]');
  expect(dialog?.open).toBe(true);
  expect(dialog?.textContent).toContain("alice@example.test");
  await act(async () => {
    [...dialog!.querySelectorAll("button")].find((button) => button.textContent === "Work")?.click();
  });
  expect(choose).toHaveBeenCalledWith(profiles[1]);
  await act(async () => {
    dialog!.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
  });
  expect(document.querySelector('dialog[aria-label="Open Calendar source"]')).toBeNull();
  expect(document.activeElement).toBe(opener);
});
