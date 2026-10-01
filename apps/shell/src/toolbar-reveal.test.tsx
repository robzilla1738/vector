// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { acquireFloatingSidebarLock } from "./floating-sidebar";
import { useToolbarReveal } from "./toolbar-reveal";

const events = vi.hoisted(() => ({ edge: null as ((near: boolean) => void) | null }));
vi.mock("./bridge", () => ({
  inNativeHost: false,
  inMock: true,
  bridge: {
    privateMode: false,
    windowKind: "normal",
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

it("starts edge motion immediately, retains hover and gates on the active window", async () => {
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
    await tick(0);
    expect(shown()).toBe(true);
    await tick(1);
    expect(shown()).toBe(true);
    act(() => events.edge?.(false));
    await tick(0);
    expect(shown()).toBe(false);
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

it("keeps a revealed toolbar through a menu lock, then starts exit motion on release", async () => {
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
    await tick(150 + 100);
    expect(shown()).toBe(true);
    act(release);
    await tick(150);
    expect(shown()).toBe(false);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

it("freezes a closed toolbar ahead of an expansion lock and listens to the horizontal slot", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  vi.useFakeTimers();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const releaseCurrent = acquireFloatingSidebarLock("keep-current");
  const releaseExpanded = acquireFloatingSidebarLock("keep-expanded");
  function HorizontalProbe() {
    const state = useToolbarReveal(true, false, ".horizontal-chrome > .toolbar");
    return <output data-revealed={state.revealed} />;
  }
  const shown = () => container.querySelector("output")?.getAttribute("data-revealed") === "true";
  try {
    await act(async () =>
      root.render(
        <div className="horizontal-chrome">
          <div className="toolbar" />
          <HorizontalProbe />
        </div>,
      ),
    );
    act(() => events.edge?.(true));
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(shown()).toBe(false);
    await act(async () => {
      releaseCurrent();
      await Promise.resolve();
    });
    expect(shown()).toBe(true);
    await act(async () => {
      releaseExpanded();
      events.edge?.(false);
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
      await Promise.resolve();
    });
    expect(shown()).toBe(false);
    await act(async () => {
      container.querySelector(".toolbar")!.dispatchEvent(new Event("pointerenter"));
      await Promise.resolve();
    });
    expect(shown()).toBe(true);
    let releaseCollapse = () => {};
    await act(async () => {
      releaseCollapse = acquireFloatingSidebarLock("force-collapse");
      await Promise.resolve();
    });
    expect(shown()).toBe(true);
    act(releaseCollapse);
  } finally {
    releaseCurrent();
    releaseExpanded();
    act(() => root.unmount());
    container.remove();
  }
});
