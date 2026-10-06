import { normalizePages, orderedPages } from "../../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
const fixture = vi.hoisted(() => ({ command: vi.fn() }));
vi.mock("../../bridge", () => ({ bridge: { windowId: "own" } }));
vi.mock("../../store", async () => {
  const { create } = await import("zustand");
  return { useStore: create(() => ({})), tabCommand: vi.fn() };
});
vi.mock("../../commands", () => ({ runCommand: fixture.command }));
import { SplitDropZones } from "../../components/SplitDropZones";
import { TAB_DRAG_TYPE } from "../../bookmark-drop";
import { useStore } from "../../store";
import { emptyLayout } from "../../workspace";
import { getSurfaceState, setSurfaceState } from "./drag-state";
const page = (pageId: string): PageTarget => ({
  pageId,
  windowId: "own",
  backend: "aux",
  targetId: pageId,
  sessionId: `${pageId}-session`,
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
let node: HTMLDivElement, stage: HTMLDivElement, root: ReturnType<typeof createRoot>;
const event = (type: string) => {
  const value = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(value, {
    dataTransfer: {
      value: { getData: (kind: string) => (kind === TAB_DRAG_TYPE ? "two" : ""), dropEffect: "" },
    },
    clientX: { value: 950 },
    clientY: { value: 200 },
  });
  return value;
};
const begin = async () => {
  await act(async () => {
    document.dispatchEvent(event("dragstart"));
  });
  expect(getSurfaceState().dragging).toBe("two");
};
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  fixture.command.mockClear();
  const layout = emptyLayout();
  layout.tabSpace = { one: layout.activeSpaceId, two: layout.activeSpaceId, other: layout.activeSpaceId };
  useStore.setState(
    {
      pages: normalizePages([page("one"), page("two"), page("other")] as never),
      activePageId: "one",
      mode: "focus",
      overlay: null,
      layout,
    } as never,
    true,
  );
  setSurfaceState({ dragging: null, picker: false, edge: null });
  stage = document.createElement("div");
  stage.id = "stage";
  stage.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 1000,
    bottom: 600,
    width: 1000,
    height: 600,
    toJSON() {},
  });
  node = document.createElement("div");
  document.body.append(stage, node);
  root = createRoot(node);
  await act(async () => root.render(<SplitDropZones />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  node.remove();
  stage.remove();
  setSurfaceState({ dragging: null, picker: false, edge: null });
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("keeps a mounted original drag across ordinary page updates and dispatches its genuine ready drop", async () => {
  await begin();
  await act(async () =>
    useStore.setState({
      pages: normalizePages(
        orderedPages(useStore.getState().pages).map((item) => ({
          ...item,
          title: `${item.title} refreshed`,
          lastRevision: 2,
          loading: false,
          viewStatus: "hidden",
        })),
      ),
    }),
  );
  expect(getSurfaceState().dragging).toBe("two");
  const cover = node.querySelector("section")!;
  await act(async () => cover.dispatchEvent(event("dragover")));
  await act(async () => vi.advanceTimersByTime(1000));
  expect(node.textContent).toContain("Split right");
  await act(async () => cover.dispatchEvent(event("drop")));
  expect(fixture.command.mock.calls).toEqual([["split-add", { payload: { pageId: "two", edge: "right" } }]]);
  expect(getSurfaceState().dragging).toBeNull();
});
it.each([
  ["document", { documentEpoch: 2 }],
  ["controller epoch", { controllerEpoch: 1 }],
  ["target", { targetId: "replacement" }],
  ["session", { sessionId: "replacement" }],
  ["URL", { url: "https://other.test/" }],
  ["window", { windowId: "foreign" }],
  ["runtime owner", { ownedByRuntime: true }],
  ["person control", { controller: "human" }],
  ["availability", { viewStatus: "crashed" }],
] as [string, Partial<PageTarget>][])(
  "permanently retires the original drag after %s changes, including observed ABA",
  async (_name, patch) => {
    await begin();
    const original = orderedPages(useStore.getState().pages);
    await act(async () =>
      useStore.setState({
        pages: normalizePages(original.map((item) => (item.pageId === "two" ? { ...item, ...patch } : item))),
      }),
    );
    expect(getSurfaceState().dragging).toBeNull();
    await act(async () => useStore.setState({ pages: normalizePages(original) }));
    expect(node.querySelector("section")).toBeNull();
    expect(fixture.command).not.toHaveBeenCalled();
  },
);
it.each(["primary", "mode", "overlay", "Space"])(
  "retires a mounted drag after original %s changes",
  async (kind) => {
    await begin();
    const state = useStore.getState();
    const patch =
      kind === "primary"
        ? { activePageId: "other" }
        : kind === "mode"
          ? { mode: "conversation" }
          : kind === "overlay"
            ? { overlay: "settings" }
            : { layout: { ...state.layout, tabSpace: { ...state.layout.tabSpace, two: "foreign-space" } } };
    await act(async () => useStore.setState(patch as never));
    expect(getSurfaceState().dragging).toBeNull();
    expect(fixture.command).not.toHaveBeenCalled();
  },
);
