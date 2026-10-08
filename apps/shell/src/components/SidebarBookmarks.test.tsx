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
const menuButton = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find((button) =>
    button.textContent?.includes(text),
  )!;

it("offers keyboard bookmark actions while disconnected and preserves duplicate identity on removal and Undo", async () => {
  const root = setup();
  const toast = vi.fn();
  useStore.setState({ connected: false, bookmarks: [saved], toast });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "bookmarks.folders.list") return [];
    if (method === "bookmarks.list") return [];
    return { ok: true };
  });
  try {
    await act(async () => root.render(<SidebarBookmarks onOpen={() => {}} />));
    expect(document.querySelector<HTMLButtonElement>('[aria-label="New bookmark folder"]')!.disabled).toBe(
      false,
    );
    const bookmark = document.querySelector<HTMLButtonElement>(".sb-link")!;
    await act(async () =>
      bookmark.dispatchEvent(new KeyboardEvent("keydown", { key: "F10", shiftKey: true, bubbles: true })),
    );
    expect(menuButton("Edit or move bookmark")).toBeDefined();
    await act(async () => menuButton("Remove bookmark").click());
    expect(invoke).toHaveBeenCalledWith("bookmarks.remove", { nodeId: "12", url: saved.url });
    const undo = toast.mock.calls.find(([text]) => text === "Bookmark removed")![2];
    await act(async () => undo.run());
    expect(invoke).toHaveBeenCalledWith(
      "bookmarks.add",
      expect.objectContaining({
        url: saved.url,
        title: "Saved",
        folderPath: [],
        forceNew: true,
      }),
    );
  } finally {
    await act(async () => root.unmount());
  }
});

it("moves a dragged bookmark into a native folder with stale-folder protection and offers its inverse", async () => {
  const root = setup();
  const toast = vi.fn();
  useStore.setState({ connected: false, bookmarks: [saved], toast });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "bookmarks.folders.list") return [["Work"]];
    if (method === "bookmarks.list") return [{ ...saved, folderPath: ["Work"] }];
    return { moved: 1 };
  });
  const drag = (name: string) => {
    const event = new Event(name, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { setData: vi.fn(), effectAllowed: "none", dropEffect: "none" },
    });
    return event;
  };
  try {
    await act(async () => root.render(<SidebarBookmarks onOpen={() => {}} />));
    await act(async () => document.querySelector(".sb-link")!.dispatchEvent(drag("dragstart")));
    await act(async () => document.querySelector("summary")!.dispatchEvent(drag("drop")));
    expect(invoke).toHaveBeenCalledWith("bookmarks.move", {
      bookmarks: [{ url: saved.url, nodeId: "12", folderPath: [] }],
      folderPath: ["Work"],
    });
    const undo = toast.mock.calls.find(([text]) => text === "Bookmark moved")![2];
    await act(async () => undo.run());
    expect(invoke).toHaveBeenLastCalledWith("bookmarks.folders.list", {});
    expect(invoke).toHaveBeenCalledWith("bookmarks.move", {
      bookmarks: [{ url: saved.url, nodeId: "12", folderPath: ["Work"] }],
      folderPath: [],
    });
  } finally {
    await act(async () => root.unmount());
  }
});
