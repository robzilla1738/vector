import { normalizePages } from "../../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
const fixture = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  visible: vi.fn(async () => {}),
  command: vi.fn(),
  resolve: vi.fn(async (id: string) => `native-${id}`),
  invoke: vi.fn(() => new Promise<never>(() => {})),
}));
vi.mock("../../bridge", () => ({
  inNativeHost: true,
  inMock: false,
  bridge: {
    windowId: "own",
    windowKind: "normal",
    privateMode: false,
    setStageVisible: fixture.visible,
    surfaceContentId: fixture.resolve,
    invoke: fixture.invoke,
  },
}));
vi.mock("../../commands", () => ({ runCommand: fixture.command }));
vi.mock("../../store", async () => {
  const { create } = await import("zustand");
  return { useStore: create(() => fixture.state), call: vi.fn(), tabCommand: vi.fn(), errToast: vi.fn() };
});
// A deferred agent surface must never become a prerequisite for ordinary browsing.
vi.mock("../permissions/SuspensionPrompt", () => new Promise(() => {}));
vi.mock("../../components/TranslationBar", () => ({ TranslationBar: () => null }));
vi.mock("../../components/StartPage", () => ({ StartPage: () => null }));
vi.mock("../../agent/AgentOverlay", () => ({ AgentOverlay: () => null }));
vi.mock("../../components/surfaces", () => ({ MockPage: null, Conversation: () => null }));
import { Stage } from "../../components/Stage";
import { useStore } from "../../store";
import { emptyLayout } from "../../workspace";
import { setSurfaceState } from "./drag-state";
const page = (pageId: string): PageTarget => ({
  pageId,
  windowId: "own",
  backend: "aux",
  targetId: pageId,
  url: `https://example.test/${pageId}`,
  title: pageId,
  documentEpoch: 1,
  lastRevision: 0,
  viewStatus: "visible",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
});
it("retains native split connectors through covers and full chat while reporting only presented pages", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Object.assign(window, { auxChromiumHost: { featureStages: { splitView: "on" } } });
  const layout = emptyLayout();
  layout.tabSpace = { one: layout.spaces[0]!.id, two: layout.spaces[0]!.id };
  layout.splitGroups = [{ id: "pair", panes: ["one", "two"], layout: "row", ratios: [0.5], focused: "one" }];
  fixture.state = {
    pages: normalizePages([page("one"), page("two")] as never),
    activePageId: "one",
    mode: "focus",
    layout,
    settings: {},
    overlay: null,
    confirmation: null,
  };
  useStore.setState(fixture.state as never, true);
  fixture.visible.mockClear();
  fixture.resolve.mockClear();
  await import("../../components/SplitStage");
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  const render = () => root.render(<Stage />);
  const awaitEmbeds = async () => {
    for (let attempt = 0; node.querySelectorAll("embed").length !== 2 && attempt < 100; attempt++)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    expect([...node.querySelectorAll("embed")].map((embed) => embed.getAttribute("data-content-id"))).toEqual(
      ["native-one", "native-two"],
    );
  };
  try {
    await act(async () => {
      render();
    });
    await awaitEmbeds();
    expect(fixture.visible.mock.calls).toEqual([[["one", "two"]]]);
    const embeds = [...node.querySelectorAll("embed")];
    const divider = node.querySelector<HTMLElement>('[role="separator"]')!;
    let captured: number | null = null;
    const release = vi.fn((pointer: number) => {
      expect(pointer).toBe(captured);
      captured = null;
    });
    Object.assign(divider, {
      setPointerCapture: (pointer: number) => (captured = pointer),
      hasPointerCapture: (pointer: number) => captured === pointer,
      releasePointerCapture: release,
    });
    const pointer = (type: string) => {
      const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: 600 });
      Object.defineProperty(event, "pointerId", { value: 7 });
      return event;
    };
    const startDrag = async () => {
      fixture.command.mockClear();
      release.mockClear();
      await act(async () => divider.dispatchEvent(pointer("pointerdown")));
      await act(async () => divider.dispatchEvent(pointer("pointermove")));
      expect(captured).toBe(7);
      expect(fixture.command).toHaveBeenCalledWith("split-resize", {
        payload: { pageId: "one", divider: 0, ratio: expect.any(Number), persist: false },
      });
      fixture.command.mockClear();
    };
    const expectRetiredDrag = async () => {
      expect(release).toHaveBeenCalledExactlyOnceWith(7);
      expect(captured).toBeNull();
      expect(fixture.command.mock.calls).toEqual([
        ["split-resize", { payload: { pageId: "one", divider: 0, ratio: 0.5, persist: true } }],
      ]);
      fixture.command.mockClear();
      await act(async () => {
        divider.dispatchEvent(pointer("pointermove"));
        divider.dispatchEvent(pointer("pointerup"));
      });
      expect(fixture.command).not.toHaveBeenCalled();
    };
    for (const cover of [
      { dragging: "third", picker: false },
      { dragging: null, picker: true },
    ]) {
      await startDrag();
      await act(async () => {
        setSurfaceState(cover);
      });
      expect([...node.querySelectorAll("embed")]).toEqual(embeds);
      expect(node.querySelector(".stage-native-surface")?.hasAttribute("inert")).toBe(true);
      expect(node.querySelector(".stage-native-surface")?.getAttribute("aria-hidden")).toBe("true");
      expect(node.querySelector(".split-stage")?.hasAttribute("data-split-geometry-generation")).toBe(false);
      expect(fixture.visible.mock.calls.at(-1)).toEqual([[]]);
      await expectRetiredDrag();
      await act(async () => {
        setSurfaceState({ dragging: null, picker: false });
      });
      expect([...node.querySelectorAll("embed")]).toEqual(embeds);
      expect(fixture.visible.mock.calls.at(-1)).toEqual([["one", "two"]]);
    }
    for (const state of [
      { mode: "conversation" },
      { mode: "focus", overlay: "saved-pages" },
      { overlay: "settings" },
    ]) {
      await act(async () => useStore.setState({ mode: "focus", overlay: null }));
      await startDrag();
      await act(async () => useStore.setState(state as never));
      expect([...node.querySelectorAll("embed")]).toEqual(embeds);
      expect(node.querySelector(".stage-native-surface")?.hasAttribute("inert")).toBe(true);
      expect(fixture.visible.mock.calls.at(-1)).toEqual([[]]);
      await expectRetiredDrag();
    }
    await act(async () => useStore.setState({ mode: "focus", overlay: null }));
    await startDrag();
    await act(async () => useStore.setState({ overlay: "command-surface" }));
    expect([...node.querySelectorAll("embed")]).toEqual(embeds);
    expect(node.querySelector(".stage-card")?.hasAttribute("inert")).toBe(true);
    expect(node.querySelector(".stage-native-surface")?.getAttribute("aria-hidden")).toBe("false");
    expect(node.querySelector(".split-stage")?.hasAttribute("data-split-geometry-generation")).toBe(false);
    expect(fixture.visible.mock.calls.at(-1)).toEqual([["one", "two"]]);
    await expectRetiredDrag();
    await act(async () =>
      useStore.setState({
        mode: "focus",
        overlay: null,
        pages: normalizePages([
          { ...page("one"), controller: "agent", viewStatus: "hidden", documentEpoch: 2 },
          page("two"),
        ]),
      }),
    );
    expect([...node.querySelectorAll("embed")]).toEqual(embeds);
    expect(node.querySelector(".stage-native-surface")?.hasAttribute("inert")).toBe(false);
    await act(async () => divider.dispatchEvent(pointer("pointermove")));
    expect(fixture.command).not.toHaveBeenCalled();
    expect(fixture.resolve).toHaveBeenCalledTimes(2);
    expect(fixture.visible.mock.calls.at(-1)).toEqual([["one", "two"]]);
  } finally {
    await act(async () => root.unmount());
    node.remove();
    setSurfaceState({ dragging: null, picker: false, edge: null });
    delete (window as Window & { auxChromiumHost?: unknown }).auxChromiumHost;
    vi.unstubAllGlobals();
  }
});

it("attaches a native page while the runtime and agent surface remain unresponsive, mounting review only for a real confirmation", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const layout = emptyLayout();
  useStore.setState(
    {
      pages: normalizePages([page("browser")]),
      activePageId: "browser",
      mode: "focus",
      layout,
      settings: {},
      overlay: null,
      confirmation: null,
    } as never,
    true,
  );
  fixture.resolve.mockClear();
  fixture.invoke.mockClear();
  // Leave a genuine runtime request unresolved for the whole render.
  void fixture.invoke();
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  try {
    await act(async () => root.render(<Stage />));
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("native-browser");
    expect(fixture.resolve).toHaveBeenCalledWith("browser");
    expect(node.querySelector('[role="dialog"]')).toBeNull();
    expect(node.textContent).not.toContain("Opening pending action");
    await act(async () => useStore.setState({ confirmation: { turnId: "held-run" } } as never));
    expect(node.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Pending action");
    await act(async () => useStore.setState({ confirmation: null }));
    expect(node.querySelector('[role="dialog"]')).toBeNull();
    const embed = node.querySelector("embed");
    for (const state of [
      { mode: "conversation" },
      { mode: "focus", overlay: "saved-pages" },
      { overlay: "settings" },
      { overlay: null },
    ]) {
      await act(async () => useStore.setState(state as never));
      expect(node.querySelector("embed")).toBe(embed);
    }
    expect(fixture.resolve).toHaveBeenCalledTimes(1);
    await act(async () => useStore.setState({ pages: normalizePages([]), activePageId: null }));
    expect(node.querySelector("embed")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    node.remove();
    vi.unstubAllGlobals();
  }
});
