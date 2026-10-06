import { useEffect, type RefObject } from "react";
import type { ConversationCollection } from "./collection";

/** Refresh retained rows without moving the user's visible conversation. */
export function useChatScrollAnchor(collection: ConversationCollection, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let ids = collection.getSnapshot().ids;
    let frame: number | undefined;
    const off = collection.subscribe(() => {
      const next = collection.getSnapshot().ids;
      if (ids === next) return;
      ids = next;
      const scroll = ref.current;
      if (!scroll) return;
      const top = scroll.getBoundingClientRect().top;
      const anchor = [...scroll.querySelectorAll<HTMLElement>("[data-chat-id]")].find(
        (row) => row.getBoundingClientRect().bottom > top,
      );
      if (!anchor) return;
      const id = anchor.dataset.chatId,
        anchorTop = anchor.getBoundingClientRect().top,
        scrollTop = scroll.scrollTop;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!collection.current() || collection.getSnapshot().ids !== next || scroll.scrollTop !== scrollTop)
          return;
        const replacement = [...scroll.querySelectorAll<HTMLElement>("[data-chat-id]")].find(
          (row) => row.dataset.chatId === id,
        );
        if (replacement) scroll.scrollTop += replacement.getBoundingClientRect().top - anchorTop;
      });
    });
    return () => {
      off();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [collection, ref]);
}
