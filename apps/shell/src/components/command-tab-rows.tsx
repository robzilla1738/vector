import { rankCandidates } from "../suggest";
import { hostOf } from "../workspace";
import { FavIcon } from "./SiteTile";
import type { ProviderSuggestion } from "./command-provider-types";

interface TabCandidate {
  id: string;
  pageId: string;
  title: string;
  url: string;
  favicon?: string;
  pinned?: boolean;
}

/** The fast tab path is available before the other search providers finish loading. */
export function commandTabRows(
  query: string,
  tabs: TabCandidate[],
  activate: (pageId: string) => unknown,
): ProviderSuggestion[] {
  return (query.trim() ? rankCandidates(query, tabs) : tabs).slice(0, 3).map((item) => ({
    id: `tab-${item.pageId}`,
    section: "tabs",
    pinned: item.pinned,
    url: item.url,
    icon: <FavIcon url={item.url} src={item.favicon} size="sm" />,
    title: item.title || hostOf(item.url),
    detail: hostOf(item.url),
    hint: "Switch to tab",
    run: () => activate(item.pageId),
  }));
}
