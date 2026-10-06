// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
const fixture = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  visible: vi.fn(async () => {}),
  resolve: vi.fn(async (id: string) => `native-${id}`),
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
  },
}));
vi.mock("../../store", async () => {
  const { create } = await import("zustand");
  return { useStore: create(() => fixture.state), call: vi.fn(), tabCommand: vi.fn(), errToast: vi.fn() };
});
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
it("keeps selected native split membership through drag and picker covers, restores embeds, and clears real hidden stage", async () => {
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
    pages: [page("one"), page("two")],
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
    for (const cover of [
      { dragging: "third", picker: false },
      { dragging: null, picker: true },
    ]) {
      await act(async () => {
        setSurfaceState(cover);
      });
      expect(node.querySelector("embed")).toBeNull();
      expect(fixture.visible.mock.calls).toEqual([[["one", "two"]]]);
      await act(async () => {
        setSurfaceState({ dragging: null, picker: false });
      });
      await awaitEmbeds();
    }
    await act(async () => {
      useStore.setState({ mode: "conversation" });
    });
    expect(node.querySelector("embed")).toBeNull();
    expect(fixture.visible.mock.calls.at(-1)).toEqual([[]]);
  } finally {
    await act(async () => root.unmount());
    node.remove();
    setSurfaceState({ dragging: null, picker: false, edge: null });
    delete (window as Window & { auxChromiumHost?: unknown }).auxChromiumHost;
    vi.unstubAllGlobals();
  }
});
