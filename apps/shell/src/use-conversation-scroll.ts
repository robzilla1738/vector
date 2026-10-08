import { useCallback, useLayoutEffect, useRef, useState } from "react";

type Position = { follow: boolean; turn?: string; fraction: number; top: number };
// In-window continuity only; private conversation content is never persisted here.
const positions = new Map<string, Position>();

export function useConversationScroll(id: string | null) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [awayFromLatest, setAwayFromLatest] = useState(false);
  const position = useRef<Position>({ follow: true, fraction: 0, top: 0 });
  const capture = useCallback(() => {
    const scroll = scrollRef.current,
      thread = threadRef.current;
    if (!scroll || !thread) return;
    const top = scroll.getBoundingClientRect().top;
    const turn = [...thread.querySelectorAll<HTMLElement>("[data-turn-id]")].find(
      (turn) => turn.getBoundingClientRect().bottom > top,
    );
    const bounds = turn?.getBoundingClientRect();
    position.current = {
      follow: scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 96,
      top: scroll.scrollTop,
      turn: turn?.dataset.turnId,
      fraction: bounds?.height ? (top - bounds.top) / bounds.height : 0,
    };
    setAwayFromLatest(!position.current.follow);
  }, []);

  useLayoutEffect(() => {
    const scroll = scrollRef.current,
      thread = threadRef.current;
    if (!scroll || !thread) return;
    position.current = (id && positions.get(id)) || { follow: true, fraction: 0, top: 0 };
    setAwayFromLatest(!position.current.follow);
    const restore = () => {
      const saved = position.current;
      if (saved.follow) scroll.scrollTop = scroll.scrollHeight;
      else {
        const turn = [...thread.querySelectorAll<HTMLElement>("[data-turn-id]")].find(
          (turn) => turn.dataset.turnId === saved.turn,
        );
        if (turn) {
          const bounds = turn.getBoundingClientRect();
          scroll.scrollTop +=
            bounds.top - scroll.getBoundingClientRect().top + saved.fraction * bounds.height;
        } else if (!saved.turn) scroll.scrollTop = saved.top;
      }
    };
    restore();
    const observer = new ResizeObserver(restore);
    observer.observe(thread);
    observer.observe(scroll);
    scroll.addEventListener("scroll", capture, { passive: true });
    return () => {
      observer.disconnect();
      scroll.removeEventListener("scroll", capture);
      if (id) {
        positions.delete(id);
        positions.set(id, position.current);
        if (positions.size > 100) positions.delete(positions.keys().next().value!);
      }
    };
  }, [id, capture]);

  const jumpToLatest = useCallback(() => {
    position.current = { follow: true, fraction: 0, top: 0 };
    setAwayFromLatest(false);
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }, []);

  const preservePosition = useCallback(() => {
    capture();
    position.current.follow = false;
    setAwayFromLatest(true);
  }, [capture]);
  const revealTurn = useCallback((turnId: string) => {
    position.current = { follow: false, turn: turnId, fraction: 0, top: scrollRef.current?.scrollTop ?? 0 };
    setAwayFromLatest(true);
    const scroll = scrollRef.current;
    const turn = [...(threadRef.current?.querySelectorAll<HTMLElement>("[data-turn-id]") ?? [])].find(
      (element) => element.dataset.turnId === turnId,
    );
    if (scroll && turn)
      scroll.scrollTop += turn.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
  }, []);
  return { scrollRef, threadRef, awayFromLatest, jumpToLatest, preservePosition, revealTurn };
}
