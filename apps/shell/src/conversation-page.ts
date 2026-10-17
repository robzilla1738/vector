import type { PageTarget } from "@aux/contracts";

/** Context copying uses the protected browser broker's website-only boundary. */
export function availableConversationPage(page: PageTarget) {
  if (
    page.ownedByRuntime ||
    page.navigationError ||
    page.showBlankDocument ||
    ["crashed", "detached"].includes(page.viewStatus ?? "")
  )
    return false;
  try {
    const url = new URL(page.url);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function conversationPage(
  pages: PageTarget[],
  selection: string,
  activePageId: string | null,
  linkedPageId?: string,
) {
  const id =
    selection === "active"
      ? activePageId
      : selection === "linked"
        ? linkedPageId
        : selection === "none"
          ? null
          : selection;
  return pages.find((page) => page.pageId === id && availableConversationPage(page));
}
