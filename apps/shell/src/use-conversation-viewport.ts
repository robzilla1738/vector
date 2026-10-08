import { useLayoutEffect, useMemo, useState, type RefObject } from "react";
import type { Run } from "@aux/contracts";

/** A long restored chat keeps lightweight turn anchors; heavy bodies mount near the viewport. */
export function useConversationViewport(
  chatId: string | null,
  turns: readonly Run[],
  scroll: RefObject<HTMLDivElement | null>,
  thread: RefObject<HTMLDivElement | null>,
  totalTurns: number,
) {
  const enabled = totalTurns > 80;
  const identity = useMemo(() => ({ chatId }), [chatId]);
  const [view, setView] = useState<{
    identity: typeof identity;
    visible: Set<string>;
    heights: Map<string, number>;
  }>();
  const ids = turns.map((run) => run.runId).join("\n");
  useLayoutEffect(() => {
    if (!enabled || !scroll.current || !thread.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setView((prior) => {
          const visible = new Set(prior?.identity === identity ? prior.visible : []);
          const heights = new Map(prior?.identity === identity ? prior.heights : []);
          let changed = false;
          for (const entry of entries) {
            const element = entry.target as HTMLElement,
              id = element.dataset.turnId!;
            const selection = window.getSelection();
            const pinned =
              element.contains(document.activeElement) ||
              (!!selection?.rangeCount && !selection.isCollapsed && selection.containsNode(element, true));
            const show = entry.isIntersecting || !!pinned;
            if (show !== visible.has(id)) changed = true;
            if (show) visible.add(id);
            else {
              if (element.dataset.turnMounted === "true") heights.set(id, entry.boundingClientRect.height);
              visible.delete(id);
            }
          }
          return changed || prior?.identity !== identity ? { identity, visible, heights } : prior;
        });
      },
      { root: scroll.current, rootMargin: "1200px 0px" },
    );
    for (const element of thread.current.querySelectorAll("[data-turn-id]")) observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, ids, identity, scroll, thread]);
  return {
    enabled,
    visible: view?.identity === identity ? view.visible : new Set<string>(),
    heights: view?.identity === identity ? view.heights : new Map<string, number>(),
  };
}
