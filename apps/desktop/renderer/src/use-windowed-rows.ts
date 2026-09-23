import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";

export interface RowWindow { start: number; end: number }

/** Rows of a fixed-stride list that intersect the viewport, widened by `overscan` on both sides. */
export function windowRange(scrollTop: number, viewport: number, listTop: number, stride: number, count: number, overscan: number): RowWindow {
  if (stride <= 0 || count <= 0) return { start: 0, end: count };
  const first = Math.floor(Math.max(0, scrollTop - listTop) / stride);
  const start = Math.max(0, Math.min(count, first - overscan));
  const end = Math.min(count, first + Math.ceil(viewport / stride) + overscan);
  return { start, end: Math.max(start, end) };
}

/**
 * Windowing for a list that lives inside a larger scroller (folders and pins
 * above it scroll with it). `anchor` wraps the rows; padding stands in for the
 * rows outside the window so the scrollbar keeps its true length.
 */
export function useWindowedRows(scroller: RefObject<HTMLElement | null>, anchor: RefObject<HTMLElement | null>, count: number, enabled: boolean, gap = 2, overscan = 10) {
  const [range, setRange] = useState<RowWindow>(() => ({ start: 0, end: enabled ? Math.min(count, 60) : count }));
  const stride = useRef(32);
  const measure = useCallback(() => {
    const el = scroller.current, list = anchor.current;
    if (!el || !list) return;
    const row = list.firstElementChild as HTMLElement | null;
    if (row && row.offsetHeight > 0) stride.current = row.offsetHeight + gap;
    const listTop = list.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    const next = windowRange(el.scrollTop, el.clientHeight, listTop, stride.current, count, overscan);
    setRange(current => current.start === next.start && current.end === next.end ? current : next);
  }, [scroller, anchor, count, gap, overscan]);
  useLayoutEffect(() => {
    if (!enabled) { setRange(current => current.start === 0 && current.end === count ? current : { start: 0, end: count }); return; }
    measure();
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => { cancelAnimationFrame(frame); el.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, [enabled, measure, scroller, count]);
  /** Scroll row `index` into view when it sits outside the rendered window. */
  const reveal = useCallback((index: number) => {
    const el = scroller.current, list = anchor.current;
    if (!el || !list || index < 0) return;
    const listTop = list.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    const top = listTop + index * stride.current;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (top + stride.current > el.scrollTop + el.clientHeight) el.scrollTop = top + stride.current - el.clientHeight;
  }, [scroller, anchor]);
  const start = enabled ? Math.min(range.start, count) : 0;
  const end = enabled ? Math.min(range.end, count) : count;
  return { start, end, padTop: start * stride.current, padBottom: Math.max(0, count - end) * stride.current, reveal };
}
