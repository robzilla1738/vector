// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { openNativeLibrary } from "./native-library";
import { makePage } from "./mock/fixtures";
vi.mock("./bridge", async (original) => ({
  ...(await original<typeof import("./bridge")>()),
  inNativeHost: true,
}));
const initial = useStore.getState();
const owner = { windowId: bridge.windowId, privateMode: bridge.privateMode, windowKind: bridge.windowKind };
afterEach(() => {
  useStore.setState(initial, true);
  Object.assign(bridge, owner);
  vi.restoreAllMocks();
});
it("opens real browser pages without an agent runtime request", async () => {
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  const newTab = vi.fn().mockResolvedValue(makePage(0));
  const invoke = vi.spyOn(bridge, "invoke");
  useStore.setState({ newTab, connected: false, overlay: "saved-pages" });
  await openNativeLibrary("bookmarks");
  await openNativeLibrary("history");
  await openNativeLibrary("clear");
  expect(newTab.mock.calls.map(([url]) => url)).toEqual([
    "chrome://bookmarks/",
    "chrome://history/",
    "chrome://settings/clearBrowserData?auxReturn=history",
  ]);
  expect(invoke).not.toHaveBeenCalled();
  expect(useStore.getState().overlay).toBeNull();
});
it("rejects persistent data in Private and Little windows before opening a page", async () => {
  const newTab = vi.fn();
  useStore.setState({ newTab });
  bridge.privateMode = true;
  await expect(openNativeLibrary("bookmarks")).rejects.toThrow("Private");
  await expect(openNativeLibrary("history")).rejects.toThrow("Private");
  bridge.privateMode = false;
  bridge.windowKind = "little";
  await expect(openNativeLibrary("clear")).rejects.toThrow("full Aux");
  expect(newTab).not.toHaveBeenCalled();
});
it.each(["window", "kind", "overlay"] as const)(
  "preserves newer %s ownership after a delayed open",
  async (changed) => {
    bridge.privateMode = false;
    bridge.windowKind = "normal";
    let finish!: (value: ReturnType<typeof makePage>) => void;
    useStore.setState({
      newTab: vi.fn(
        () =>
          new Promise<ReturnType<typeof makePage>>((resolve) => {
            finish = resolve;
          }),
      ),
      overlay: "saved-pages",
    });
    const opening = openNativeLibrary("history");
    if (changed === "window") bridge.windowId = "another-window";
    if (changed === "kind") bridge.windowKind = "little";
    if (changed === "overlay") useStore.setState({ overlay: "settings" });
    finish(makePage(0));
    await opening;
    expect(useStore.getState().overlay).toBe(changed === "overlay" ? "settings" : "saved-pages");
  },
);
