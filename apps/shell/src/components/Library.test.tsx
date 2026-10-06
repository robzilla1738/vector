// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { bridge } from "../bridge";
import { makePage } from "../mock/fixtures";
import { Library } from "./Library";

vi.mock("../use-feature", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../use-feature")>()),
  useFeature: () => true,
}));

const initial = useStore.getState();
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("updates the changed bookmark row without losing its sibling or edit action", async () => {
  const first = { nodeId: "one", url: "https://example.com/one", title: "First bookmark", folderPath: [] };
  const second = { nodeId: "two", url: "https://example.com/two", title: "Second bookmark", folderPath: [] };
  useStore.setState({ bookmarks: [first, second] });
  await act(async () => root.render(<Library />));
  expect(host.textContent).toContain("First bookmark");
  expect(host.textContent).toContain("Second bookmark");

  await act(async () => useStore.setState({ bookmarks: [first, { ...second, title: "Renamed bookmark" }] }));
  expect(host.textContent).toContain("Renamed bookmark");
  expect(host.textContent).not.toContain("Second bookmark");
  expect(host.textContent).toContain("First bookmark");

  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Edit Renamed bookmark"]')!.click(),
  );
  expect(host.querySelector<HTMLInputElement>('[aria-label="Bookmark title"]')?.value).toBe(
    "Renamed bookmark",
  );
});

it("keeps reading-list controls current when one saved page changes", async () => {
  const first = {
    nodeId: "reading-one",
    url: "https://example.com/one",
    title: "First reading page",
    folderPath: [],
    readingList: true,
  };
  const second = {
    nodeId: "reading-two",
    url: "https://example.com/two",
    title: "Second reading page",
    folderPath: [],
    readingList: true,
  };
  useStore.setState({
    bookmarks: [first, second],
    pages: [makePage(0, { pageId: "reading-page", url: first.url })],
  });
  await act(async () => root.render(<Library initialView="reading" />));
  expect(host.querySelector('[aria-label="Mark First reading page read"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Save offline copy of First reading page"]')).not.toBeNull();

  await act(async () =>
    useStore.setState({ bookmarks: [{ ...first, readAt: Date.now(), offline: true }, second] }),
  );
  expect(host.querySelector('[aria-label="Mark First reading page unread"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Refresh offline copy of First reading page"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Mark Second reading page read"]')).not.toBeNull();
});

it("closes Library when a bookmark opens in Peek", async () => {
  const item = { nodeId: "peek", url: "https://example.com/story", title: "Story", folderPath: [] };
  useStore.setState({
    bookmarks: [item],
    overlay: "bookmarks",
    openBackgroundTab: async (url, _space, _reuse, id) => {
      const page = makePage(0, { pageId: id!, url });
      useStore.setState({ pages: [page] });
      return page;
    },
  });
  await act(async () => root.render(<Library />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Preview Story"]')!.click());
  expect(useStore.getState().overlay).toBeNull();
  expect(useStore.getState().peekPageId).toMatch(/^p_peek_/);
});

it("returns focus to search and scrolls its own result panel when opening a folder", async () => {
  const saved = {
    nodeId: "folder-bookmark",
    url: "https://example.com/story",
    title: "Story",
    folderPath: ["Notes"],
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "bookmarks.list") return [saved] as never;
    if (method === "bookmarks.folders.list") return [["Notes"]] as never;
    return [] as never;
  });
  try {
    await act(async () => root.render(<Library />));
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    const panel = host.querySelector<HTMLElement>("#library-results")!;
    const scrollTo = vi.fn();
    panel.scrollTo = scrollTo;
    const folder = host.querySelector<HTMLButtonElement>(".library-folder")!;
    expect(folder).toBeTruthy();
    await act(async () => folder.click());
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0 });
    expect(document.activeElement).toBe(
      host.querySelector<HTMLInputElement>('input[aria-label="Search bookmarks"]'),
    );
  } finally {
    invoke.mockRestore();
  }
});
