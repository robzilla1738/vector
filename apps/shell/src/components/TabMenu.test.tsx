import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { emptyLayout, tabLabel } from "../workspace";
import { TabMenu } from "./TabMenu";

vi.mock("../use-feature", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../use-feature")>()),
  useFeature: () => true,
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it("reviews and applies an AI tab label, then restores the page title", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  const page = {
    pageId: "p1",
    url: "https://example.com/report",
    title: "Quarterly report — Example",
    documentEpoch: 3,
    viewStatus: "visible",
    controller: "none",
    ownedByRuntime: false,
  } as PageTarget;
  useStore.setState({ layout: emptyLayout(), pages: normalizePages([page]), activePageId: page.pageId });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "agent.tabName.suggest")
      return {
        name: "Quarterly report",
        pageId: page.pageId,
        sourceUrl: page.url,
        sourceTitle: page.title,
        documentEpoch: page.documentEpoch,
        modelId: "meta/muse-spark-1.3-contributor",
      };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const menu = () => document.querySelector<HTMLDialogElement>('dialog[aria-label="Tab actions"]')!;
  const button = (name: string) =>
    [...menu().querySelectorAll<HTMLButtonElement>("button")].find((node) =>
      node.textContent?.includes(name),
    )!;
  try {
    await act(async () => root.render(<TabMenu page={page} x={0} y={0} onClose={() => {}} />));
    await act(async () => button("Name tab").click());
    expect(menu().textContent).toContain("AI sees this page title and site domain");
    await act(async () => button("Suggest with AI").click());
    expect(invoke).toHaveBeenCalledWith("agent.tabName.suggest", {
      pageId: page.pageId,
      expectedUrl: page.url,
      expectedDocumentEpoch: page.documentEpoch,
    });
    expect(menu().querySelector<HTMLInputElement>('[aria-label="Tab label"]')?.value).toBe(
      "Quarterly report",
    );
    expect(tabLabel(useStore.getState().layout, page)).toBe(page.title);
    await act(async () => button("Save tab label").click());
    expect(tabLabel(useStore.getState().layout, page)).toBe("Quarterly report");
    await act(async () => root.render(<></>));
    await act(async () => root.render(<TabMenu page={page} x={0} y={0} onClose={() => {}} />));
    await act(async () => button("Name tab").click());
    await act(async () => button("Use page title again").click());
    expect(tabLabel(useStore.getState().layout, page)).toBe(page.title);
  } finally {
    await act(async () => root.unmount());
  }
});

it("moves focus from destination search to the first matching Space", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  const page = {
    pageId: "move-tab",
    url: "https://example.com/",
    title: "Example",
    viewStatus: "visible",
    controller: "none",
    ownedByRuntime: false,
  } as PageTarget;
  const layout = emptyLayout();
  layout.spaces.push({ ...layout.spaces[0]!, id: "other", name: "Other" });
  useStore.setState({ layout, pages: normalizePages([page]), activePageId: page.pageId });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<TabMenu page={page} x={0} y={0} onClose={() => {}} />));
    const menu = document.querySelector<HTMLDialogElement>('dialog[aria-label="Tab actions"]')!;
    const move = [...menu.querySelectorAll<HTMLButtonElement>("button")].find((node) =>
      node.textContent?.includes("Move tab"),
    )!;
    await act(async () => move.click());
    const search = menu.querySelector<HTMLInputElement>('[aria-label="Find a folder, Space or window"]')!;
    expect(document.activeElement).toBe(search);
    await act(async () =>
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
    );
    expect(document.activeElement?.textContent).toContain("Other");
  } finally {
    await act(async () => root.unmount());
  }
});

it("bookmarks the right-clicked tab rather than the active tab without pinning it", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const original = useStore.getState();
  const page = {
    pageId: "bookmark-target",
    url: "https://example.com/saved",
    title: "Saved tab",
    viewStatus: "visible",
    ownedByRuntime: false,
  } as PageTarget;
  const toggleBookmark = vi.fn().mockResolvedValue(undefined);
  const togglePin = vi.fn();
  useStore.setState({
    layout: emptyLayout(),
    pages: normalizePages([page]),
    activePageId: "another-tab",
    bookmarks: [],
    toggleBookmark,
    togglePin,
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<TabMenu page={page} x={0} y={0} onClose={() => {}} />));
    const button = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (item) => item.textContent === "Bookmark tab",
    )!;
    expect(button).toBeTruthy();
    await act(async () => button.click());
    expect(toggleBookmark).toHaveBeenCalledWith(page.url, page.title);
    expect(togglePin).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    useStore.setState(original, true);
  }
});
