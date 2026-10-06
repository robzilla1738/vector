// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { emptyLayout } from "../workspace";
import { Overview } from "./Overview";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it("previews AI Tidy folders, applies them once, and restores the exact layout on undo", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  const layout = emptyLayout();
  const pages = [1, 2, 3].map(
    (index) =>
      ({
        pageId: `p${index}`,
        title: `Research ${index}`,
        url: `https://example.com/${index}`,
        controller: "none",
        viewStatus: "visible",
        ownedByRuntime: false,
      }) as PageTarget,
  );
  useStore.setState({ layout, tidyUndo: null, pages, activePageId: "p1", mode: "overview" });
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "agent.tidy.propose")
      return {
        pages: pages.map(({ pageId, title, url }) => ({ pageId, title, url })),
        groups: [{ name: "Research", pageIds: ["p1", "p2"] }],
        modelId: "meta/muse-spark-1.3-contributor",
        createdAt: 1,
      };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const button = (name: string) =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (node) => node.textContent?.trim() === name,
    )!;
  try {
    await act(async () => root.render(<Overview />));
    await act(async () => button("Tidy with AI").click());
    expect(invoke).toHaveBeenCalledWith("agent.tidy.propose", { pageIds: ["p1", "p2", "p3"] });
    expect(host.querySelector('[aria-label="AI Tidy preview"]')?.textContent).toContain("Research 1");
    expect(useStore.getState().layout.folders).toHaveLength(0);
    await act(async () => button("Apply folders").click());
    expect(useStore.getState().layout.folders.map((folder) => folder.name)).toEqual(["Research"]);
    await act(async () => root.render(<></>));
    await act(async () => root.render(<Overview />));
    await act(async () => button("Undo Tidy").click());
    expect(useStore.getState().layout).toEqual(layout);
  } finally {
    await act(async () => root.unmount());
  }
});

it("moves focus by visible tab refs after tab removal and reorder", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const initial = useStore.getState(),
    layout = emptyLayout();
  const pages = [1, 2, 3].map(
    (index) =>
      ({
        pageId: `p${index}`,
        title: `Tab ${index}`,
        url: `https://example.test/${index}`,
        controller: "none",
        viewStatus: "visible",
        ownedByRuntime: false,
      }) as PageTarget,
  );
  useStore.setState({
    pages,
    layout: { ...layout, order: ["p3", "p1", "p2"] },
    activePageId: "p3",
    mode: "overview",
  });
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const scroll = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = vi.fn();
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  const key = (button: Element, value: string) =>
    button.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }));
  try {
    await act(async () => root.render(<Overview />));
    const first = host.querySelector<HTMLButtonElement>('.ov-open[data-page-id="p3"]')!;
    await act(async () => {
      first.focus();
      key(first, "ArrowRight");
    });
    expect((document.activeElement as HTMLElement).dataset.pageId).toBe("p1");
    await act(async () =>
      useStore.setState({
        pages: pages.filter((page) => page.pageId !== "p2"),
        layout: { ...layout, order: ["p1", "p3"] },
      }),
    );
    await act(async () => key(document.activeElement!, "End"));
    expect((document.activeElement as HTMLElement).dataset.pageId).toBe("p3");
    expect(host.querySelectorAll('.ov-open[tabindex="0"]')).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(initial, true);
    if (scroll) HTMLElement.prototype.scrollIntoView = scroll;
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});
