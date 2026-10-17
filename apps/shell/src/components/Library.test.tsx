import { normalizePages } from "../store/pages";
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
  vi.spyOn(bridge, "bookmarksInvoke").mockImplementation(async () => ({
    method: "bookmarks.folders.snapshot",
    result: {
      rootId: "1",
      editable: true,
      folders: [
        {
          nodeId: "1",
          parentId: null,
          index: 0,
          title: "Bookmarks",
          path: [],
          permanent: true,
          childIds: useStore.getState().bookmarks.map((item) => item.nodeId!),
        },
      ],
    },
  }));
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("updates the changed bookmark row without losing its sibling or edit action", async () => {
  const first = { nodeId: "12", url: "https://example.com/one", title: "First bookmark", folderPath: [] };
  const second = { nodeId: "13", url: "https://example.com/two", title: "Second bookmark", folderPath: [] };
  useStore.setState({ bookmarks: [first, second] });
  await act(async () => root.render(<Library />));
  expect(host.textContent).toContain("First bookmark");
  expect(host.textContent).toContain("Second bookmark");

  await act(async () => useStore.setState({ bookmarks: [first, { ...second, title: "Renamed bookmark" }] }));
  expect(host.textContent).toContain("Renamed bookmark");
  expect(host.textContent).not.toContain("Second bookmark");
  expect(host.textContent).toContain("First bookmark");

  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Actions for Renamed bookmark"]')!.click());
  await act(async () =>
    document.querySelector<HTMLButtonElement>('[aria-label="Edit Renamed bookmark"]')!.click(),
  );
  expect(host.querySelector<HTMLInputElement>('[aria-label="Bookmark title"]')?.value).toBe(
    "Renamed bookmark",
  );
});

it("keeps reading-list controls current when one saved page changes", async () => {
  const first = {
    nodeId: "14",
    url: "https://example.com/one",
    title: "First reading page",
    folderPath: [],
    readingList: true,
  };
  const second = {
    nodeId: "15",
    url: "https://example.com/two",
    title: "Second reading page",
    folderPath: [],
    readingList: true,
  };
  useStore.setState({
    bookmarks: [first, second],
    pages: normalizePages([makePage(0, { pageId: "reading-page", url: first.url })]),
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
  const item = { nodeId: "16", url: "https://example.com/story", title: "Story", folderPath: [] };
  useStore.setState({
    bookmarks: [item],
    overlay: "bookmarks",
    openBackgroundTab: async (url, _space, _reuse, id) => {
      const page = makePage(0, { pageId: id!, url });
      useStore.setState({ pages: normalizePages([page]) });
      return page;
    },
  });
  await act(async () => root.render(<Library />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Actions for Story"]')!.click());
  await act(async () => document.querySelector<HTMLButtonElement>('[aria-label="Preview Story"]')!.click());
  expect(useStore.getState().overlay).toBeNull();
  expect(useStore.getState().peekPageId).toMatch(/^p_peek_/);
});

it("returns focus to search and scrolls its own result panel when opening a folder", async () => {
  const saved = {
    nodeId: "17",
    url: "https://example.com/story",
    title: "Story",
    folderPath: ["Notes"],
  };
  vi.mocked(bridge.bookmarksInvoke).mockResolvedValue({
    method: "bookmarks.folders.snapshot",
    result: {
      rootId: "1",
      editable: true,
      folders: [
        {
          nodeId: "1",
          parentId: null,
          index: 0,
          title: "Bookmarks",
          path: [],
          permanent: true,
          childIds: ["20"],
        },
        {
          nodeId: "20",
          parentId: "1",
          index: 0,
          title: "Notes",
          path: ["Notes"],
          permanent: false,
          childIds: ["17"],
        },
      ],
    },
  });
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

it("opens the selected duplicate folder and keeps browser-only bookmarks out of web preview", async () => {
  const entries = [
    {
      nodeId: "12",
      url: "https://example.com/first",
      title: "First folder story",
      createdAt: 1,
      folderPath: ["Work"],
    },
    {
      nodeId: "13",
      url: "chrome://settings/",
      title: "Browser settings",
      createdAt: 1,
      folderPath: ["Work"],
    },
  ];
  useStore.setState({ bookmarks: entries });
  vi.mocked(bridge.bookmarksInvoke).mockResolvedValue({
    method: "bookmarks.folders.snapshot",
    result: {
      rootId: "1",
      editable: true,
      folders: [
        {
          nodeId: "1",
          parentId: null,
          index: 0,
          title: "Bookmarks",
          path: [],
          permanent: true,
          childIds: ["20", "21"],
        },
        {
          nodeId: "20",
          parentId: "1",
          index: 0,
          title: "Work",
          path: ["Work"],
          permanent: false,
          childIds: ["12"],
        },
        {
          nodeId: "21",
          parentId: "1",
          index: 1,
          title: "Work",
          path: ["Work"],
          permanent: false,
          childIds: ["13"],
        },
      ],
    },
  });
  await act(async () => root.render(<Library />));
  host.querySelector<HTMLElement>("#library-results")!.scrollTo = vi.fn();
  const folders = host.querySelectorAll<HTMLButtonElement>(".library-folder");
  expect(folders).toHaveLength(2);
  await act(async () => folders[1]!.click());
  expect(host.textContent).toContain("Browser settings");
  expect(host.textContent).not.toContain("First folder story");
  expect(host.querySelector('[aria-label="Preview Browser settings"]')).toBeNull();
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Remove empty folder"]')!.disabled).toBe(true);
});

it("uses the shared reviewed bookmark file import and refreshes the real Library", async () => {
  const imported = {
    nodeId: "17",
    url: "https://example.test/imported",
    title: "Imported synthetic page",
    folderPath: ["Synthetic folder"],
  };
  useStore.setState({ bookmarks: [], overlay: "bookmarks" });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "bookmarks.import") return { added: 1, skipped: 0 };
    if (method === "bookmarks.list") return [imported];
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<Library />));
  const file = host.querySelector<HTMLInputElement>('[aria-label="Import bookmark file"]')!;
  Object.defineProperty(file, "files", {
    configurable: true,
    value: [
      {
        name: "synthetic.html",
        size: 200,
        text: async () =>
          '<DL><DT><H3>Synthetic folder</H3><DL><DT><A HREF="https://example.test/imported">Imported synthetic page</A></DL></DL>',
      },
    ],
  });
  await act(async () => file.dispatchEvent(new Event("change", { bubbles: true })));
  expect(invoke).not.toHaveBeenCalledWith("bookmarks.import", expect.anything());
  await vi.waitFor(async () => {
    await act(async () => {});
    expect(host.querySelector('[aria-label="Bookmark import preview"]')).not.toBeNull();
  });
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>("button")]
      .find((item) => item.textContent === "Import bookmarks")!
      .click(),
  );
  expect(invoke).toHaveBeenCalledWith("bookmarks.import", {
    bookmarks: [{ url: imported.url, title: imported.title, folderPath: imported.folderPath }],
    folders: [["Synthetic folder"]],
  });
  expect(useStore.getState().bookmarks).toEqual([imported]);
  expect(host.querySelector('[aria-label="Bookmark import preview"]')).toBeNull();
  expect(host.textContent).toContain("Imported 1 bookmarks");
});
