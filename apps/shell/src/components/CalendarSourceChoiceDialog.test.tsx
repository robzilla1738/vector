// @vitest-environment jsdom
import { act, useRef, useState } from "react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

it("retains long account and Profile identity with bounded wrapping and unchanged choice/focus", async () => {
  const name = "Research".repeat(14);
  const accountKey = `${"calendaraccount".repeat(10)}@example.test`;
  const title = "Planning".repeat(18);
  const profile: BrowserProfile = { id: "long-profile", name, current: false };
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
            sourceId: "long-source",
            runId: "run-1",
            connectionId: "connection-1",
            accountKey,
            url: "https://calendar.google.com/calendar/event?eid=fixture",
            title,
            start: "2026-09-24T10:00:00Z",
            end: "2026-09-24T11:00:00Z",
            observedAt: 1,
          },
          profiles: [profile],
        }}
        returnFocus={returnFocus}
        initialFocus={initialFocus}
        onClose={() => setOpen(false)}
        onChoose={choose}
      />
    ) : null;
  }
  await act(async () => root.render(<Harness />));
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Open Calendar source"]')!;
  expect(dialog.open).toBe(true);
  expect(dialog.querySelector("b")?.textContent).toBe(title);
  expect(dialog.textContent).toContain(accountKey);
  const button = dialog.querySelector<HTMLButtonElement>(".conversation-calendar-profiles > button")!;
  expect(button.textContent).toBe(name);

  // jsdom does not implement cascade layers or native layout. Parse shipped
  // CSS after removing only its outer layer, then match its actual selectors.
  const sheet = document.createElement("style");
  const css = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "CalendarSourceChoiceDialog.css"),
    "utf8",
  );
  sheet.textContent = css.replace(/^@layer components \{\s*/, "").replace(/\}\s*$/, "");
  document.head.append(sheet);
  try {
    const rules = [...sheet.sheet!.cssRules].filter((rule): rule is CSSStyleRule => "selectorText" in rule);
    const profileRule = rules.find(
      (rule) => rule.selectorText === ".conversation-calendar-profiles > button",
    )!;
    expect(button.matches(profileRule.selectorText)).toBe(true);
    expect(profileRule.style.getPropertyValue("white-space")).toBe("normal");
    expect(profileRule.style.getPropertyValue("overflow-wrap")).toBe("anywhere");
    expect(profileRule.style.getPropertyValue("max-width")).toBe("100%");
    expect(profileRule.style.getPropertyValue("min-width")).toBe("0");
    expect(profileRule.style.getPropertyValue("min-height")).toBe("var(--chip-h)");
    expect(profileRule.style.getPropertyValue("height")).toBe("auto");
    for (const property of ["font", "font-size", "padding", "color", "background", "outline", "opacity"])
      expect(profileRule.style.getPropertyValue(property)).toBe("");
    const copyRule = rules.find((rule) => rule.selectorText === ".conversation-calendar-choice p")!;
    expect(dialog.querySelector("p")!.matches(copyRule.selectorText)).toBe(true);
    expect(copyRule.style.getPropertyValue("overflow-wrap")).toBe("anywhere");
    button.focus();
    expect(document.activeElement).toBe(button);
    await act(async () => button.click());
    expect(choose).toHaveBeenCalledExactlyOnceWith(profile);
    await act(async () => dialog.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(opener);
  } finally {
    sheet.remove();
  }
});
