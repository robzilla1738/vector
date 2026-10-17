// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SavedPages } from "./SavedPages";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { normalizePages } from "../store/pages";
import { makePage } from "../mock/fixtures";
import { openBookmark } from "../bookmark-folders";
import { readReaderArticle } from "../reader-article";
vi.mock("./SavedPageActions", () => ({
  SavedPageActions: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../bookmark-folders", async (original) => ({
  ...(await original<typeof import("../bookmark-folders")>()),
  openBookmark: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../reader-article", () => ({ readReaderArticle: vi.fn() }));
const initial = useStore.getState();
const owner = { windowId: bridge.windowId, privateMode: bridge.privateMode, windowKind: bridge.windowKind };
const item = {
  nodeId: "14",
  title: "Saved story",
  url: "https://example.test/story",
  readingList: true,
  createdAt: 1,
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", () => 1);
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  useStore.setState({ ...initial, overlay: "saved-pages", connected: false, bookmarks: [item] });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "bookmarks.list") return useStore.getState().bookmarks as never;
    return { ok: true } as never;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  Object.assign(bridge, owner);
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
function button(text: string) {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
}
it("keeps reading status and offline-copy actions current after native bookmark updates", async () => {
  useStore.setState({
    pages: normalizePages([makePage(0, { url: item.url, backend: "aux", ownedByRuntime: false })]),
  });
  await act(async () => root.render(<SavedPages />));
  expect(button("Mark read")).toBeTruthy();
  expect(button("Save offline copy")).toBeTruthy();
  await act(async () => useStore.setState({ bookmarks: [{ ...item, readAt: 1, offline: true }] }));
  expect(button("Mark unread")).toBeTruthy();
  expect(button("Refresh offline copy")).toBeTruthy();
  await act(async () => button("Mark unread").click());
  expect(bridge.invoke).toHaveBeenCalledWith(
    "bookmarks.markRead",
    expect.objectContaining({ nodeId: "14", read: false }),
  );
});
it("background reading opens preserve unread state and the current saved-pages view", async () => {
  await act(async () => root.render(<SavedPages />));
  await act(async () => button("Open in new tab").click());
  expect(openBookmark).toHaveBeenCalledWith(item, "background", undefined, expect.any(String));
  expect(bridge.invoke).not.toHaveBeenCalledWith("bookmarks.markRead", expect.anything());
  expect(useStore.getState().overlay).toBe("saved-pages");
});
it("does not save an offline article after the window owner changes during extraction", async () => {
  useStore.setState({
    pages: normalizePages([makePage(0, { url: item.url, backend: "aux", ownedByRuntime: false })]),
  });
  let finish!: (value: Awaited<ReturnType<typeof readReaderArticle>>) => void;
  vi.mocked(readReaderArticle).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => root.render(<SavedPages />));
  await act(async () => button("Save offline copy").click());
  bridge.windowId = "another-window";
  await act(async () => finish({ title: "Story", content: "text" } as never));
  expect(bridge.invoke).not.toHaveBeenCalledWith("bookmarks.offline.set", expect.anything());
});
it("Private windows expose only recently closed tabs and never fetch persistent saved pages", async () => {
  bridge.privateMode = true;
  bridge.windowKind = "private";
  await act(async () => root.render(<SavedPages />));
  expect(host.querySelector("nav")?.textContent).toBe("Recently closed");
  expect(host.textContent).not.toContain("Saved story");
  expect(bridge.invoke).not.toHaveBeenCalledWith("bookmarks.list", expect.anything());
});
