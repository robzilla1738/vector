/**
 * Horizontal navigation gestures — the pure half.
 *
 * The injected half lives in `navGestureScript`: an isolated-world wheel
 * listener that reports "back"/"forward" over a `Runtime.addBinding` channel.
 * Both helpers below are serialized into that script with `.toString()`, so
 * they must stay self-contained — no imports, no module-scope references.
 */

export type NavGestureDirection = "back" | "forward";

export const NAV_GESTURE_BINDING = "__auxNavGesture";
export const NAV_GESTURE_WORLD = "auxNavGesture";

/**
 * One-shot overscroll accumulator. Horizontal wheel deltas that the page
 * cannot consume pile up; crossing the threshold emits a direction once per
 * gesture. A gesture ends on an idle gap, an axis flip, or the page claiming
 * the scroll — momentum tails cannot re-fire without a fresh run.
 */
export function createOverscrollTracker(options?: { threshold?: number; gapMs?: number }) {
  const threshold = options?.threshold ?? 240;
  const gapMs = options?.gapMs ?? 350;
  let acc = 0, dir = 0, last = 0, fired = false;
  return {
    feed(dx: number, dy: number, consumed: boolean, now: number): "back" | "forward" | null {
      if (consumed) { acc = 0; dir = 0; fired = false; last = now; return null; }
      if (Math.abs(dy) >= Math.abs(dx)) return null;
      if (now - last > gapMs) { acc = 0; dir = 0; fired = false; }
      last = now;
      const sign = dx > 0 ? 1 : -1;
      if (dir !== 0 && sign !== dir) { acc = 0; fired = false; }
      dir = sign;
      acc += dx;
      if (!fired && Math.abs(acc) >= threshold) { fired = true; acc = 0; return sign > 0 ? "forward" : "back"; }
      return null;
    },
  };
}

/**
 * Would the page consume this horizontal wheel delta? Walks the event's
 * composed path (covers shadow DOM and nested scrollers); any ancestor that
 * can still scroll in the delta's direction owns the gesture. Positive dx
 * moves the viewport right — forward — so in RTL it counts against the
 * negative scrollLeft range.
 */
export function consumesHorizontalWheel(path: readonly unknown[], dx: number): boolean {
  for (const node of path) {
    const el = node as Element;
    if (!el || el.nodeType !== 1 || typeof el.scrollLeft !== "number") continue;
    const style = getComputedStyle(el);
    const overflow = style.overflowX;
    if (overflow !== "auto" && overflow !== "scroll" && overflow !== "overlay") continue;
    const range = el.scrollWidth - el.clientWidth;
    if (range < 2) continue;
    // scrollLeft runs [0, range] in LTR and [-range, 0] in RTL.
    const rtl = (el as HTMLElement).dir === "rtl" || style.direction === "rtl";
    if (dx > 0 ? (rtl ? el.scrollLeft < -1 : el.scrollLeft < range - 1)
               : (rtl ? el.scrollLeft > -range + 1 : el.scrollLeft > 1)) return true;
  }
  return false;
}

/** Isolated-world source. `binding` is the `Runtime.addBinding` name. */
export function navGestureScript(binding: string): string {
  return `(${navGestureBody.toString()})(${JSON.stringify(binding)}, ${createOverscrollTracker.toString()}, ${consumesHorizontalWheel.toString()});`;
}

function navGestureBody(binding: string, createTracker: typeof createOverscrollTracker, consumes: typeof consumesHorizontalWheel) {
  const tracker = createTracker();
  const canConsume = consumes;
  addEventListener("wheel", (event) => {
    // ctrlKey marks a pinch-zoom gesture — zoom must never navigate.
    if (event.ctrlKey || !event.deltaX) return;
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 800 : 1;
    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;
    const consumed = canConsume(event.composedPath(), dx);
    const dir = tracker.feed(dx, dy, consumed, performance.now());
    const send = (globalThis as Record<string, unknown>)[binding];
    if (dir && typeof send === "function") (send as (d: string) => void)(dir);
  }, { capture: true, passive: true });
}
