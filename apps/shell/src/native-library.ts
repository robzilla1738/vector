import { bridge, inNativeHost } from "./bridge";
import { useStore } from "./store";

const routes = {
  bookmarks: "chrome://bookmarks/",
  history: "chrome://history/",
  clear: "chrome://settings/clearBrowserData",
} as const;

/** Browser-owned pages stay usable independently of the agent runtime. */
export async function openNativeLibrary(view: keyof typeof routes) {
  if (bridge.privateMode) throw new Error("Persistent browsing data is unavailable in Private windows.");
  if (!inNativeHost) throw new Error("Browser Library pages are available in the Aux desktop app.");
  if (bridge.windowKind === "little") throw new Error("Open a full Aux window to use the browser Library.");
  const windowId = bridge.windowId;
  const state = useStore.getState();
  const page = await state.newTab(routes[view]);
  if (!page) throw new Error("The browser page could not be opened. Try again.");
  if (bridge.windowId === windowId && !bridge.privateMode) useStore.getState().setOverlay(null);
  return page;
}
