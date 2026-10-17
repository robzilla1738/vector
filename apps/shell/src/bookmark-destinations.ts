import { bridge } from "./bridge";
import { openBookmark } from "./bookmark-folders";
import { useStore } from "./store";
import { addPane } from "./workspace";
import { commitSplit, localSplitPage } from "./features/surfaces/split-actions";
import { isLocal } from "./tab-window-transfer";
import { isHomeAddress } from "./chrome";

function waitForSplitPage(pageId: string, spaceId: string, valid: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    let unsubscribe = () => {};
    const finish = (error?: Error) => {
      clearTimeout(timer);
      unsubscribe();
      if (error) reject(error);
      else resolve();
    };
    const check = () => {
      const state = useStore.getState();
      const page = state.pages.byId[pageId];
      if (
        !valid() ||
        !page ||
        !isLocal(page) ||
        page.ownedByRuntime ||
        page.controller !== "none" ||
        state.layout.tabSpace[pageId] !== spaceId
      )
        return finish(new Error("The tabs changed while the bookmark was opening."));
      if (page.navigationError || page.viewStatus === "crashed")
        return finish(new Error("The bookmark page could not be loaded."));
      if (localSplitPage(pageId)) finish();
    };
    const timer = setTimeout(
      () => finish(new Error("The bookmark page is not ready to split. Try again from its tab.")),
      10000,
    );
    unsubscribe = useStore.subscribe(check);
    check();
  });
}

/** Keep the native saved-node check before arranging the newly opened tab. */
export async function openBookmarkDestination(
  item: { nodeId?: string; url: string; title: string },
  destination: "group" | "split",
) {
  const initial = useStore.getState();
  const spaceId = initial.layout.activeSpaceId;
  const primary = initial.activePageId;
  const owner = JSON.stringify([bridge.windowId, bridge.privateMode, bridge.windowKind]);
  const current = () =>
    owner === JSON.stringify([bridge.windowId, bridge.privateMode, bridge.windowKind]) &&
    useStore.getState().layout.activeSpaceId === spaceId;
  if (destination === "split" && (!primary || !localSplitPage(primary)))
    throw new Error("Choose an available browser tab to split with this bookmark.");
  if (destination === "split" && isHomeAddress(item.url))
    throw new Error("Choose a bookmark with a browser page to open in split view.");
  const result = await openBookmark(item, "background", undefined, spaceId);
  // Never close an acknowledged tab on a later arrangement failure: it may
  // already contain navigation or user work. Report the partial result instead.
  try {
    if (!current()) throw new Error("The window or Space changed.");
    if (!result.pageId) throw new Error("The new tab is unavailable.");
    const snapshot = await bridge.tabsSnapshot();
    if (!current()) throw new Error("The window or Space changed.");
    useStore.getState().syncTabsSnapshot(snapshot);
    const state = useStore.getState();
    const page = state.pages.byId[result.pageId];
    if (
      !page ||
      !isLocal(page) ||
      page.ownedByRuntime ||
      page.controller !== "none" ||
      state.layout.tabSpace[result.pageId] !== spaceId
    )
      throw new Error("The new tab is no longer available in this window.");
    if (destination === "group") {
      state.moveTabs([result.pageId], spaceId, { name: item.title.trim() || "New group" });
    } else {
      const valid = () => current() && useStore.getState().activePageId === primary;
      await waitForSplitPage(result.pageId, spaceId, valid);
      const ready = useStore.getState();
      if (!valid() || !primary || !localSplitPage(primary))
        throw new Error("The tabs changed or cannot be split.");
      const next = addPane(ready.layout, primary, result.pageId, "right");
      if (next === ready.layout) throw new Error("A split holds up to four tabs in the same Space.");
      await commitSplit(next, ready.layout, ready.layout, valid);
    }
    if (!current()) throw new Error("The window or Space changed.");
    await useStore.getState().activate(result.pageId);
    if (current() && useStore.getState().overlay === "bookmarks") useStore.getState().setOverlay(null);
  } catch (error) {
    throw new Error(
      `The bookmark opened, but its ${destination === "group" ? "group" : "split"} could not be completed. ${error instanceof Error ? error.message : "Try again from the tab."}`,
      { cause: error },
    );
  }
}
