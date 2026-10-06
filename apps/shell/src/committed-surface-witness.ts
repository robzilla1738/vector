import { useLayoutEffect, useRef, type RefObject } from "react";

let nextInstance = 0;
/** Commit identity only. Neither the revision nor layout readback proves paint. */
export function useCommittedSurfaceWitness(
  element: RefObject<HTMLElement | null>,
  kind: "stage" | "split",
  readCommittedIdentity: (element: HTMLElement) => string | null,
) {
  const committed = useRef<{ instance: number; revision: number; identity: string | null } | null>(null);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const generation =
      kind === "stage" ? "data-stage-selection-generation" : "data-split-geometry-generation";
    const instance = `data-${kind}-instance`;
    const identity = readCommittedIdentity(node);
    if (!committed.current && nextInstance < Number.MAX_SAFE_INTEGER)
      committed.current = { instance: ++nextInstance, revision: 0, identity: null };
    const state = committed.current;
    if (
      !state ||
      identity === null ||
      (state.identity !== identity && state.revision === Number.MAX_SAFE_INTEGER)
    ) {
      node.removeAttribute(instance);
      node.removeAttribute(generation);
      return;
    }
    if (state.identity !== identity) {
      state.revision++;
      state.identity = identity;
    }
    node.setAttribute(instance, String(state.instance));
    node.setAttribute(generation, String(state.revision));
  });
}

/** Current rendered pane and divider bounds, in their actual DOM order. */
export function committedSplitGeometry(element: HTMLElement): string | null {
  const boxes = [
    ...element.querySelectorAll<HTMLElement>(":scope > .split-pane, :scope > .fluid-split-divider"),
  ].map((node) => {
    const rect = node.getBoundingClientRect();
    const bounds = [rect.x, rect.y, rect.width, rect.height];
    if (!bounds.every(Number.isFinite)) return null;
    return [node.classList.contains("split-pane") ? "pane" : "divider", ...bounds];
  });
  return boxes.length && boxes.every((box) => box !== null) ? JSON.stringify(boxes) : null;
}
