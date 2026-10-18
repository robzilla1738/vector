import type { PageTarget } from "@aux/contracts";
import type { PageCollection } from "./store/pages";

/** Only the current native window's active HTML-fullscreen owner affects layout. */
export function tabFullscreenPageId(
  state: { tabFullscreenPageId: string | null; activePageId: string | null; pages: PageCollection },
  windowId: string,
): string | null {
  const id = state.tabFullscreenPageId;
  const page: PageTarget | undefined = id ? state.pages.byId[id] : undefined;
  return page &&
    id === state.activePageId &&
    page.windowId === windowId &&
    page.backend === "aux" &&
    !page.ownedByRuntime &&
    page.viewStatus !== "crashed" &&
    !page.navigationError &&
    !page.showBlankDocument
    ? id
    : null;
}
