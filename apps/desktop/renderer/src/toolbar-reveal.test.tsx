// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { acquireFloatingSidebarLock } from "./floating-sidebar";
import { TOOLBAR_ENTRY_MS, TOOLBAR_EXIT_MS, useToolbarReveal } from "./toolbar-reveal";

const events = vi.hoisted(() => ({ edge: null as ((near: boolean) => void) | null }));
vi.mock("./bridge", () => ({
  bridge: {
    privateMode: false,
    quickAskMode: false,
    onOrganizationChanged: () => () => {},
    onToolbarEdge: (listener: (near: boolean) => void) => {
      events.edge = listener;
      return () => {
        events.edge = null;
      };
    },
  },
}));

function Probe() {
  const state = useToolbarReveal(true);
  return <output data-revealed={state.revealed} data-covering={state.covering} />;
}

afterEach(() => {
  events.edge = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("uses 200 ms entry, 150 ms exit, immediate hover and an active-window gate", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  vi.useFakeTimers();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const tick = async (ms: number) =>
    act(async () => {
      vi.advanceTimersByTime(ms);
      await Promise.resolve();
    });
  const shown = () => container.querySelector("output")?.getAttribute("data-revealed") === "true";
  try {
    await act(async () => {
      root.render(
        <div className="main-col">
          <div className="toolbar" />
          <Probe />
        </div>,
      );
    });
    act(() => events.edge?.(true));
    await tick(TOOLBAR_ENTRY_MS - 1);
    expect(shown()).toBe(false);
    await tick(1);
    expect(shown()).toBe(true);
    act(() => events.edge?.(false));
    await tick(TOOLBAR_EXIT_MS - 1);
    expect(shown()).toBe(true);
    await tick(1);
    expect(shown()).toBe(false);
    const bar = container.querySelector<HTMLElement>(".toolbar")!;
    await act(async () => {
      bar.dispatchEvent(new Event("pointerenter"));
      await Promise.resolve();
    });
    expect(shown()).toBe(true);
    act(() => window.dispatchEvent(new Event("blur")));
    expect(shown()).toBe(false);
    act(() => window.dispatchEvent(new Event("focus")));
    await tick(0);
    expect(shown()).toBe(true);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

it("keeps a revealed toolbar through a menu lock, then honors the exit grace", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  vi.useFakeTimers();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const tick = async (ms: number) =>
    act(async () => {
      vi.advanceTimersByTime(ms);
      await Promise.resolve();
    });
  const shown = () => container.querySelector("output")?.getAttribute("data-revealed") === "true";
  try {
    await act(async () => {
      root.render(
        <div className="main-col">
          <div className="toolbar" />
          <Probe />
        </div>,
      );
    });
    const bar = container.querySelector<HTMLElement>(".toolbar")!;
    await act(async () => {
      bar.dispatchEvent(new Event("pointerenter"));
      await Promise.resolve();
    });
    expect(shown()).toBe(true);
    let release = () => {};
    act(() => {
      release = acquireFloatingSidebarLock("keep-current");
    });
    act(() => bar.dispatchEvent(new Event("pointerleave")));
    await tick(TOOLBAR_EXIT_MS + 100);
    expect(shown()).toBe(true);
    act(release);
    await tick(TOOLBAR_EXIT_MS);
    expect(shown()).toBe(false);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
