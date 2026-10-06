// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { AuxEvent } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
const initial = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(initial, true);
});
it("shares one pending toggle and preserves the runtime's bookmark list", async () => {
  useStore.setState({ bookmarks: [], bookmarkPending: {}, toast: vi.fn() });
  let finish!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const first = useStore.getState().toggleBookmark("https://example.com/", "Example");
  await useStore.getState().toggleBookmark("https://example.com/", "Example");
  expect(invoke).toHaveBeenCalledTimes(1);
  const bookmarks = [
    { url: "https://example.com/", title: "Example", folderPath: ["Research"] },
    { url: "https://other.example/", title: "Other window" },
  ];
  useStore
    .getState()
    .applyEvent({
      type: "bookmarks.changed",
      payload: { bookmarks },
      seq: 1,
      streamId: "test",
      ts: Date.now(),
    } as AuxEvent);
  finish({ ok: true });
  await first;
  expect(useStore.getState().bookmarks).toEqual(bookmarks);
  expect(useStore.getState().bookmarkPending).toEqual({});
});
it("keeps the saved bookmark after a failure and permits retry", async () => {
  const bookmark = { url: "https://example.com/", title: "Example", folderPath: ["Research"] };
  useStore.setState({ bookmarks: [bookmark], bookmarkPending: {}, toast: vi.fn() });
  const invoke = vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Disconnected"));
  await expect(useStore.getState().toggleBookmark(bookmark.url, bookmark.title)).rejects.toThrow(
    "Disconnected",
  );
  expect(useStore.getState().bookmarks).toEqual([bookmark]);
  expect(useStore.getState().bookmarkPending).toEqual({});
  invoke.mockResolvedValue({ ok: true });
  await useStore.getState().toggleBookmark(bookmark.url, bookmark.title);
  expect(invoke).toHaveBeenCalledTimes(2);
  expect(invoke).toHaveBeenLastCalledWith("bookmarks.remove", { url: bookmark.url, title: bookmark.title });
});
