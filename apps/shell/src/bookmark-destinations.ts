import { bridge } from "./bridge";
import { openBookmark } from "./bookmark-folders";
import { useStore } from "./store";
import { addPane } from "./workspace";
import { commitSplit, localSplitPage } from "./features/surfaces/split-actions";
import { isLocal } from "./tab-window-transfer";

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
      if (!valid() || !primary || !localSplitPage(result.pageId))
        throw new Error("The tabs changed or cannot be split.");
      const next = addPane(state.layout, primary, result.pageId, "right");
      if (next === state.layout) throw new Error("A split holds up to four tabs in the same Space.");
      await commitSplit(next, state.layout, state.layout, valid);
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
