import { bridge, inMock, inNativeHost } from "./bridge";
import { useStore } from "./store";

/** The native owner warms the same active tab that will accept the link. */
export function hintNavigation(url: string) {
  if (!(inNativeHost || inMock) || bridge.privateMode || !/^https?:\/\//i.test(url)) return;
  const state = useStore.getState();
  const page = state.activePageId ? state.pages.byId[state.activePageId] : undefined;
  if (!page || page.ownedByRuntime || (page.windowId && page.windowId !== bridge.windowId)) return;
  void bridge.preloadNavigation({ pageId: page.pageId, expectedUrl: page.url, url }).catch(() => {});
}
