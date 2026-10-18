// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TaskAttentionSettings } from "./TaskAttentionSettings";
import {
  readTaskNoticeKinds,
  readSystemTaskNotices,
  readTaskFocusMode,
  writeTaskNoticeKinds,
  writeSystemTaskNotices,
  writeTaskFocusMode,
} from "./run-notice-preference";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function key(node: Element, value: string) {
  node.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }));
}

const scrollIntoView = HTMLElement.prototype.scrollIntoView;
beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(() => {
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
  vi.restoreAllMocks();
});

it("keeps checkbox choices open, merges current preferences, and restores trigger focus", async () => {
  const original = readTaskNoticeKinds();
  const system = readSystemTaskNotices();
  const focus = readTaskFocusMode();
  writeTaskNoticeKinds({ attention: true, completion: true, routine: true });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<TaskAttentionSettings />));
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Task notification types"]')!;
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    await act(async () => key(trigger, "ArrowDown"));
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    const items = menu.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]');
    expect(items).toHaveLength(3);
    expect(document.activeElement).toBe(items[0]);
    expect([...items].map((item) => item.textContent)).toEqual([
      "Needs attentionApprovals, questions and handoffs",
      "Task completionsTasks you start when they finish",
      "Routine completionsTasks started by routines when they finish",
    ]);
    await act(async () => items[0]!.click());
    expect(document.querySelector('[role="menu"]')).toBe(menu);
    expect(items[0]!.getAttribute("aria-checked")).toBe("false");
    expect(trigger.textContent).toBe("2 types");
    // Another preference writer must not be overwritten by the next menu click.
    await act(async () => writeTaskNoticeKinds({ attention: false, completion: false, routine: true }));
    expect(items[1]!.getAttribute("aria-checked")).toBe("false");
    await act(async () => items[2]!.click());
    expect(readTaskNoticeKinds()).toEqual({ attention: false, completion: false, routine: false });
    expect(trigger.textContent).toBe("Off");
    expect(readSystemTaskNotices()).toBe(system);
    expect(readTaskFocusMode()).toBe(focus);
    await act(async () => key(menu, "Escape"));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    writeTaskNoticeKinds(original);
    writeSystemTaskNotices(system);
    writeTaskFocusMode(focus);
  }
});

it("opens at the last choice with ArrowUp and retires the menu when its owner becomes inactive", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<TaskAttentionSettings />));
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Task notification types"]')!;
    await act(async () => key(trigger, "ArrowUp"));
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    const items = menu.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]');
    expect(document.activeElement).toBe(items[2]);
    await act(async () => key(items[2]!, "Home"));
    expect(document.activeElement).toBe(items[0]);
    await act(async () => key(items[0]!, "End"));
    expect(document.activeElement).toBe(items[2]);
    await act(async () => root.render(<TaskAttentionSettings active={false} />));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await act(async () => root.render(<TaskAttentionSettings />));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await act(async () => trigger.click());
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
