import { readFileSync } from "node:fs";
const littleCss = readFileSync("apps/shell/src/components/LittleWindow.css", "utf8");
const splitCss = readFileSync("apps/shell/src/components/SplitStage.css", "utf8");
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
    organizationSnapshot: fixture.invoke,
    onOrganizationChanged: () => () => {},
  },
}));
vi.mock("../../components/CommandBar", () => ({ CommandBar: () => <input aria-label="Address" /> }));
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
vi.mock("../../components/surfaces", () => ({
  MockPage: null,
  Conversation: () => <textarea aria-label="Original draft" defaultValue="Unsaved conversation draft" />,
}));
import { LittleWindow } from "../../components/LittleWindow";
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
it("presents only the actual fullscreen split owner and preserves both embeds, editor draft, and normal layout on exit", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const width = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
  const height = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600);
  Object.assign(window, { auxChromiumHost: { featureStages: { splitView: "on" } } });
  const layout = emptyLayout();
  layout.tabSpace = { one: layout.spaces[0]!.id, two: layout.spaces[0]!.id };
  layout.splitGroups = [{ id: "pair", panes: ["one", "two"], layout: "row", ratios: [0.6], focused: "one" }];
  const savedLayout = JSON.stringify(layout);
  fixture.state = {
    pages: normalizePages([page("one"), page("two")]),
    activePageId: "two",
    mode: "conversation",
    layout,
    settings: { minimalUi: false },
    overlay: "settings",
    confirmation: null,
    tabFullscreenPageId: null,
  };
  useStore.setState(fixture.state as never, true);
  fixture.visible.mockClear();
  fixture.resolve.mockClear();
  await import("../../components/SplitStage");
  const style = document.createElement("style");
  style.textContent = splitCss;
  document.head.append(style);
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  try {
    await act(async () => {
      root.render(<Stage />);
    });
    for (let attempt = 0; node.querySelectorAll("embed").length !== 2 && attempt < 100; attempt++)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    const embeds = [...node.querySelectorAll("embed")];
    expect(embeds).toHaveLength(2);
    expect(fixture.visible).toHaveBeenLastCalledWith([]);
    const instance = node.querySelector("#stage")!.getAttribute("data-stage-instance");
    const draft = node.querySelector<HTMLTextAreaElement>('[aria-label="Original draft"]')!;
    draft.value = "Retain my original unsaved draft";
    await act(async () => {
      useStore.setState({ tabFullscreenPageId: "two" });
    });
    expect(fixture.visible).toHaveBeenLastCalledWith(["two"]);
    const panes = [...node.querySelectorAll<HTMLElement>(".split-pane")];
    expect(panes.map((pane) => pane.getAttribute("aria-hidden"))).toEqual(["true", "false"]);
    expect(panes[0]!.hasAttribute("inert")).toBe(true);
    expect(getComputedStyle(panes[0]!).visibility).toBe("hidden");
    expect(getComputedStyle(panes[0]!).display).not.toBe("none");
    expect(getComputedStyle(embeds[0]!).display).not.toBe("none");
    expect(getComputedStyle(panes[1]!).visibility).toBe("visible");
    expect(panes[1]!.style.cssText).toContain("width: 800px");
    expect(panes[1]!.style.cssText).toContain("height: 600px");
    expect([...node.querySelectorAll("embed")]).toEqual(embeds);
    expect(fixture.resolve).toHaveBeenCalledTimes(2);
    expect(node.querySelector('[aria-label="Original draft"]')).toBe(draft);
    expect(draft.value).toBe("Retain my original unsaved draft");
    expect(node.querySelector(".stage-card")!.hasAttribute("inert")).toBe(false);
    expect(useStore.getState().mode).toBe("conversation");
    expect(useStore.getState().overlay).toBe("settings");
    expect(JSON.stringify(useStore.getState().layout)).toBe(savedLayout);
    await act(async () => {
      useStore.setState({ tabFullscreenPageId: null });
    });
    expect(fixture.visible).toHaveBeenLastCalledWith([]);
    expect(panes.map((pane) => pane.getAttribute("aria-hidden"))).toEqual(["false", "false"]);
    expect(node.querySelector(".stage-card")!.hasAttribute("inert")).toBe(true);
    expect(getComputedStyle(panes[0]!).visibility).toBe("visible");
    expect([...node.querySelectorAll("embed")]).toEqual(embeds);
    expect(node.querySelector("#stage")!.getAttribute("data-stage-instance")).toBe(instance);
    expect(node.querySelector('[aria-label="Original draft"]')).toBe(draft);
    expect(draft.value).toBe("Retain my original unsaved draft");
    expect(JSON.stringify(useStore.getState().layout)).toBe(savedLayout);
    expect(fixture.command).not.toHaveBeenCalled();
  } finally {
    await act(async () => {
      root.unmount();
    });
    node.remove();
    style.remove();
    width.mockRestore();
    height.mockRestore();
    setSurfaceState({ dragging: null, picker: false, edge: null });
    vi.unstubAllGlobals();
  }
});

it("hides only the Little strip for its exact fullscreen owner and retains the original native embed through exit", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState(
    {
      pages: normalizePages([page("little-page")]),
      activePageId: "little-page",
      tabFullscreenPageId: null,
      layout: emptyLayout(),
      settings: {},
    } as never,
    true,
  );
  fixture.resolve.mockClear();
  const node = document.createElement("div");
  document.body.append(node);
  const style = document.createElement("style");
  style.textContent = littleCss;
  document.head.append(style);
  const root = createRoot(node);
  try {
    await act(async () => root.render(<LittleWindow />));
    await vi.waitFor(() => expect(node.querySelector("embed")).not.toBeNull());
    const embed = node.querySelector("embed")!;
    const stage = node.querySelector(".little-page")!;
    const strip = node.querySelector<HTMLElement>(".little-strip")!;
    const instance = stage.getAttribute("data-stage-instance");
    expect(getComputedStyle(strip).display).toBe("flex");
    await act(async () => useStore.setState({ tabFullscreenPageId: "little-page" }));
    expect(getComputedStyle(strip).display).toBe("none");
    expect(getComputedStyle(stage).display).not.toBe("none");
    expect(getComputedStyle(embed).display).not.toBe("none");
    expect(node.querySelector("embed")).toBe(embed);
    expect(stage.getAttribute("data-stage-instance")).toBe(instance);
    await act(async () => useStore.setState({ tabFullscreenPageId: null }));
    expect(getComputedStyle(strip).display).toBe("flex");
    expect(node.querySelector("embed")).toBe(embed);
    expect(fixture.resolve).toHaveBeenCalledOnce();
  } finally {
    await act(async () => root.unmount());
    node.remove();
    style.remove();
    vi.unstubAllGlobals();
  }
});
