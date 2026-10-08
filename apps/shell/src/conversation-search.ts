import type { MethodResult } from "@aux/contracts";
import { call } from "./store";
import { conversationFinder } from "./text-surface-find";

type Hit = NonNullable<MethodResult<"conversations.search">["match"]>;
type Surface = {
  chatId: string;
  element(): HTMLElement | null;
  reveal(hit: Hit, current: () => boolean): Promise<HTMLElement>;
};
const surfaces = new Set<Surface>();
let activeSurface: Surface | undefined;
let search: { chatId: string; query: string; hit: Hit | null } | undefined;
let request = 0;

export function registerConversationSearchSurface(value: Surface) {
  surfaces.add(value);
  return () => {
    surfaces.delete(value);
    if (activeSurface === value) clearConversationSearch();
  };
}
export function clearConversationSearch() {
  ++request;
  search = undefined;
  activeSurface = undefined;
  conversationFinder.clear();
}
export function cancelConversationSearch() {
  ++request;
}

export async function findConversation(
  chatId: string | null,
  query: string,
  next: boolean,
  forward: boolean,
) {
  const owner = [...surfaces].find((surface) => {
    const element = surface.element();
    return (
      surface.chatId === chatId &&
      element?.isConnected &&
      !element.closest('[inert], [aria-hidden="true"]') &&
      element.getClientRects().length > 0
    );
  });
  activeSurface = owner;
  const version = ++request;
  const current = () => version === request && !!owner && surfaces.has(owner) && activeSurface === owner;
  if (!query || !chatId) {
    clearConversationSearch();
    return { matches: 0 };
  }
  if (!owner || owner.chatId !== chatId) throw new Error("Open this conversation to search its messages.");
  const cursor = search?.chatId === chatId && search.query === query ? search.hit : null;
  const response = await call("conversations.search", {
    chatId,
    query,
    ...(cursor ? { cursor: { runId: cursor.runId, part: cursor.part, offset: cursor.offset } } : {}),
    direction: next ? (forward ? "next" : "previous") : "current",
  });
  if (!current()) return null;
  search = { chatId, query, hit: response.match };
  conversationFinder.clear();
  if (response.match) {
    const element = await owner.reveal(response.match, current);
    if (!current()) return null;
    conversationFinder.find(query, false, true, true, element, response.match.occurrence);
  }
  return { matches: response.matches, activeMatch: response.activeMatch };
}
