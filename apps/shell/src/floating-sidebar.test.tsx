// @vitest-environment jsdom
import { act, createElement, useRef } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
  acquireFloatingSidebarLock,
  floatingSidebarVisible,
  useFloatingSidebar,
  type FloatingSidebarState,
} from "./floating-sidebar";
import { useStore } from "./store";

const state = (patch: Partial<FloatingSidebarState> = {}): FloatingSidebarState => ({
  visible: false,
  frameActive: true,
  edge: false,
  inside: false,
  focused: false,
  locks: { "force-collapse": 0, "keep-current": 0, "keep-expanded": 0 },
  ...patch,
});

function FloatingPanel({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useFloatingSidebar("hidden", ref);
  return (
    <aside ref={ref} className={className}>
      <button type="button">Focus</button>
      <details>
        <summary>Menu</summary>
      </details>
    </aside>
  );
}

it("retains and dismisses a floating sidebar across 50 scripted interactions", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const hasFocus = vi.spyOn(document, "hasFocus").mockReturnValue(true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const tick = async (ms: number) =>
    act(async () => {
      vi.advanceTimersByTime(ms);
      await Promise.resolve();
    });
  const move = (x: number) =>
    act(() => window.dispatchEvent(new MouseEvent("pointermove", { clientX: x, clientY: 150 })));
  const visible = () => useStore.getState().sidebarPeek;
  const check = (trial: number, description: string, expected: boolean) =>
    expect(visible(), `trial ${trial}: ${description}`).toBe(expected);
  try {
    for (let trial = 0; trial < 50; trial += 1) {
      act(() => useStore.setState({ sidebarPeek: false }));
      act(() => root.render(createElement(FloatingPanel, { key: trial })));
      const panel = container.querySelector("aside")!;
      const focusTarget = panel.querySelector("button")!;
      if (trial % 5 === 0) {
        move(7);
        await tick(200);
        check(trial, "outside 6 px trigger", false);
        move(6);
        await tick(199);
        check(trial, "edge motion starts without an extra intent delay", true);
        await tick(1);
        check(trial, "edge reveal", true);
        move(14);
        await tick(150);
        check(trial, "8 px leeway", true);
        move(15);
        await tick(149);
        check(trial, "exit motion starts without an extra intent delay", false);
        await tick(1);
      } else if (trial % 5 === 1) {
        act(() => focusTarget.focus());
        check(trial, "focus is hover", true);
        act(() => focusTarget.blur());
        await tick(0);
        await tick(150);
      } else if (trial % 5 === 2) {
        act(() => focusTarget.focus());
        const release = acquireFloatingSidebarLock("keep-current");
        act(() => focusTarget.blur());
        move(600);
        await tick(300);
        check(trial, "menu lock", true);
        act(release);
        await tick(150);
      } else if (trial % 5 === 3) {
        act(() => focusTarget.focus());
        act(() => panel.dispatchEvent(new Event("dragstart", { bubbles: true })));
        act(() => focusTarget.blur());
        move(600);
        await tick(300);
        check(trial, "drag lock", true);
        act(() => window.dispatchEvent(new Event("dragend")));
        await tick(150);
      } else {
        act(() => focusTarget.focus());
        act(() => window.dispatchEvent(new Event("blur")));
        check(trial, "inactive frame", false);
        act(() => focusTarget.blur());
        move(4);
        await tick(300);
        check(trial, "inactive edge", false);
        act(() => window.dispatchEvent(new Event("focus")));
        await tick(200);
        check(trial, "reactivated edge", true);
        move(600);
        await tick(150);
      }
      check(trial, "dismissed", false);
      act(() => root.render(null));
    }
  } finally {
    act(() => root.unmount());
    container.remove();
    hasFocus.mockRestore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

it.each(["sidebar", "chat-sidebar"])(
  "keeps %s controls open when clicked and dismisses a page click",
  async (className) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const hasFocus = vi.spyOn(document, "hasFocus").mockReturnValue(true);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      act(() => useStore.setState({ sidebarPeek: false }));
      act(() => root.render(createElement(FloatingPanel, { className })));
      const panel = container.querySelector("aside")!;
      act(() => panel.dispatchEvent(new Event("pointerenter")));
      expect(useStore.getState().sidebarPeek).toBe(true);
      act(() =>
        panel.querySelector("button")!.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true })),
      );
      expect(useStore.getState().sidebarPeek).toBe(true);
      act(() => container.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true })));
      expect(useStore.getState().sidebarPeek).toBe(false);
    } finally {
      act(() => root.unmount());
      container.remove();
      hasFocus.mockRestore();
      vi.unstubAllGlobals();
    }
  },
);

describe("floating sidebar locks", () => {
  it("counts focus as hover and gates an inactive frame", () => {
    expect(floatingSidebarVisible(state({ focused: true }))).toBe(true);
    expect(floatingSidebarVisible(state({ edge: true, frameActive: false }))).toBe(false);
    expect(floatingSidebarVisible(state({ focused: true, frameActive: false }))).toBe(false);
  });

  it("retains only an already visible sidebar for a menu", () => {
    const locks = {
      "force-collapse": 0,
      "keep-current": 1,
      "keep-expanded": 0,
    };
    expect(floatingSidebarVisible(state({ locks }))).toBe(false);
    expect(floatingSidebarVisible(state({ visible: true, locks }))).toBe(true);
  });

  it("forces collapse ahead of a drag lock", () => {
    expect(
      floatingSidebarVisible(
        state({
          locks: { "force-collapse": 1, "keep-current": 0, "keep-expanded": 1 },
        }),
      ),
    ).toBe(false);
    expect(
      floatingSidebarVisible(
        state({
          locks: { "force-collapse": 0, "keep-current": 0, "keep-expanded": 1 },
        }),
      ),
    ).toBe(true);
  });
});

it("keeps a collapsed sidebar collapsed when a current-state lock overrides expansion", () => {
  expect(
    floatingSidebarVisible(
      state({
        edge: true,
        inside: true,
        locks: { "force-collapse": 0, "keep-current": 1, "keep-expanded": 1 },
      }),
    ),
  ).toBe(false);
  expect(
    floatingSidebarVisible(
      state({ visible: true, locks: { "force-collapse": 0, "keep-current": 1, "keep-expanded": 1 } }),
    ),
  ).toBe(true);
});

it("bridges the edge-to-panel gap, cancels pending exits, and closes with expanded bookmark folders", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const hasFocus = vi.spyOn(document, "hasFocus").mockReturnValue(true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    act(() => useStore.setState({ sidebarPeek: false }));
    act(() => root.render(createElement(FloatingPanel, { className: "sidebar" })));
    const panel = container.querySelector("aside")!;
    act(() => window.dispatchEvent(new MouseEvent("pointermove", {clientX: 4, clientY: 150})));
    expect(useStore.getState().sidebarPeek).toBe(true);
    act(() => window.dispatchEvent(new MouseEvent("pointermove", {clientX: 20, clientY: 150})));
    act(() => vi.advanceTimersByTime(100));
    expect(useStore.getState().sidebarPeek).toBe(true);
    act(() => panel.dispatchEvent(new Event("pointerenter")));
    act(() => vi.advanceTimersByTime(200));
    expect(useStore.getState().sidebarPeek).toBe(true);
    await act(async () => {
      const folder = panel.querySelector("details")!;
      folder.className = "sb-bookmark-folder";
      folder.open = true;
    });
    act(() => panel.dispatchEvent(new Event("pointerleave")));
    act(() => vi.advanceTimersByTime(119));
    expect(useStore.getState().sidebarPeek).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(useStore.getState().sidebarPeek).toBe(false);
  } finally {
    act(() => root.unmount());
    container.remove();
    hasFocus.mockRestore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
