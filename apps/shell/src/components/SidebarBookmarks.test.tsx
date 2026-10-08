// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { SidebarBookmarks } from "./SidebarBookmarks";

const initial = useStore.getState();
afterEach(() => {
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
function setup() {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const host = document.createElement("div");
  document.body.append(host);
  return createRoot(host);
}
const saved = { nodeId: "12", url: "https://saved.test/", title: "Saved", createdAt: 1, folderPath: [] };
const folders = {
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
      childIds: ["12", "20", "21"],
    },
    { nodeId: "20", parentId: "1", index: 1, title: "Work", path: ["Work"], permanent: false, childIds: [] },
    { nodeId: "21", parentId: "1", index: 2, title: "Work", path: ["Work"], permanent: false, childIds: [] },
  ],
};
const menuButton = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find((button) =>
    button.textContent?.includes(text),
  )!;

it("offers keyboard bookmark actions while disconnected and preserves duplicate identity on removal and Undo", async () => {
  const root = setup();
  const toast = vi.fn();
  useStore.setState({ connected: false, bookmarks: [saved], toast });
  const undoToken = "12345678-1234-4234-8234-123456789abc";
  const native = vi.spyOn(bridge, "bookmarksInvoke").mockImplementation(async (request) => {
    if (request.method === "bookmarks.entries.remove")
      return { method: request.method, result: { snapshot: folders, undoToken } };
    if (request.method === "bookmarks.entries.restore") return { method: request.method, result: folders };
    return { method: "bookmarks.folders.snapshot", result: folders };
  });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "bookmarks.list") return [];
    return { ok: true };
  });
  try {
    await act(async () => root.render(<SidebarBookmarks />));
    expect(document.querySelector<HTMLButtonElement>('[aria-label="New bookmark folder"]')!.disabled).toBe(
      false,
    );
    const bookmark = document.querySelector<HTMLButtonElement>(".sb-link")!;
    await act(async () =>
      bookmark.dispatchEvent(new KeyboardEvent("keydown", { key: "F10", shiftKey: true, bubbles: true })),
    );
    expect(menuButton("Edit bookmark")).toBeDefined();
    await act(async () => menuButton("Remove bookmark").click());
    expect(native).toHaveBeenCalledWith({
      method: "bookmarks.entries.remove",
      params: { source: { nodeId: "12", parentId: "1", index: 0, title: "Saved", url: saved.url } },
    });
    const undo = toast.mock.calls.find(([text]) => text === "Bookmark removed")![2];
    await act(async () => undo.run());
    expect(native).toHaveBeenCalledWith({ method: "bookmarks.entries.restore", params: { undoToken } });
    expect(invoke.mock.calls.every(([method]) => method === "bookmarks.list")).toBe(true);
  } finally {
    await act(async () => root.unmount());
  }
});

it("moves a dragged bookmark into the selected duplicate folder and uses native identity-bound Undo", async () => {
  const root = setup();
  const toast = vi.fn();
  useStore.setState({ connected: false, bookmarks: [saved], toast });
  const inverse = {
    source: { nodeId: "12", parentId: "21", index: 0, title: "Saved", url: saved.url },
    destination: { parentId: "1", index: 0, expectedChildren: ["20", "21"] },
  };
  const native = vi.spyOn(bridge, "bookmarksInvoke").mockImplementation(async (request) => {
    if (request.method === "bookmarks.folders.snapshot") return { method: request.method, result: folders };
    return { method: "bookmarks.folders.placeBookmark", result: { snapshot: folders, undo: inverse } };
  });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([saved]);
  const drag = (name: string) => {
    const event = new Event(name, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { setData: vi.fn(), effectAllowed: "none", dropEffect: "none" },
    });
    return event;
  };
  try {
    await act(async () => root.render(<SidebarBookmarks />));
    await act(async () => document.querySelector(".sb-link")!.dispatchEvent(drag("dragstart")));
    await act(async () => document.querySelectorAll("summary")[1]!.dispatchEvent(drag("drop")));
    expect(native).toHaveBeenCalledWith({
      method: "bookmarks.folders.placeBookmark",
      params: {
        source: { nodeId: "12", parentId: "1", index: 0, title: "Saved", url: saved.url },
        destination: { parentId: "21", index: 0, expectedChildren: [] },
      },
    });
    const undo = toast.mock.calls.find(([text]) => text === "Bookmark moved")![2];
    await act(async () => undo.run());
    expect(native).toHaveBeenCalledWith({ method: "bookmarks.folders.placeBookmark", params: inverse });
    expect(invoke.mock.calls.every(([method]) => method === "bookmarks.list")).toBe(true);
  } finally {
    await act(async () => root.unmount());
  }
});

it("reorders duplicate folders from the keyboard menu with source identity and the native inverse", async () => {
  const root = setup();
  const toast = vi.fn();
  useStore.setState({ connected: false, bookmarks: [saved], toast });
  const inverse = {
    kind: "move" as const,
    source: { nodeId: "21", parentId: "1", index: 1, title: "Work" },
    destination: { parentId: "1", index: 3, expectedChildren: ["12", "21", "20"] },
  };
  const native = vi.spyOn(bridge, "bookmarksInvoke").mockImplementation(async (request) => {
    if (request.method === "bookmarks.folders.snapshot") return { method: request.method, result: folders };
    return { method: "bookmarks.folders.change", result: { snapshot: folders, undo: inverse } };
  });
  vi.spyOn(bridge, "invoke").mockResolvedValue([saved]);
  try {
    await act(async () => root.render(<SidebarBookmarks />));
    await act(async () =>
      document
        .querySelectorAll("summary")[1]!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "F10", shiftKey: true, bubbles: true })),
    );
    await act(async () => menuButton("Move folder up").click());
    expect(native).toHaveBeenCalledWith({
      method: "bookmarks.folders.change",
      params: {
        kind: "move",
        source: { nodeId: "21", parentId: "1", index: 2, title: "Work" },
        destination: { parentId: "1", index: 1, expectedChildren: ["12", "20", "21"] },
      },
    });
    const undo = toast.mock.calls.find(([text]) => text === "Folder moved")![2];
    await act(async () => undo.run());
    expect(native).toHaveBeenCalledWith({ method: "bookmarks.folders.change", params: inverse });
  } finally {
    await act(async () => root.unmount());
  }
});
