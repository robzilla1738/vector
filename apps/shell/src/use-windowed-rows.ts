import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export interface RowWindow {
  start: number;
  end: number;
}

/** Rows of a fixed-stride list that intersect the viewport, widened by `overscan` on both sides. */
export function windowRange(
  scrollTop: number,
  viewport: number,
  listTop: number,
  stride: number,
  count: number,
  overscan: number,
): RowWindow {
  if (stride <= 0 || count <= 0) return { start: 0, end: count };
  const first = Math.floor(Math.max(0, scrollTop - listTop) / stride);
  const start = Math.max(0, Math.min(count, first - overscan));
  const end = Math.min(count, first + Math.ceil(viewport / stride) + overscan);
  return { start, end: Math.max(start, end) };
}

/**
 * Windowing for a list that lives inside a larger scroller (folders and pins
 * above it scroll with it). `anchor` wraps the rows; padding stands in for the
 * rows outside the window so the scrollbar keeps its true length. Row
 * `activeIndex` is scrolled into view when it falls outside the window.
 */
export function useWindowedRows(
  scroller: RefObject<HTMLElement | null>,
  anchor: RefObject<HTMLElement | null>,
  count: number,
  enabled: boolean,
  activeIndex = -1,
  gap = 2,
  overscan = 10,
) {
  const [view, setView] = useState({ start: 0, end: 60, stride: 32 });
  const revealed = useRef(-1);
  useLayoutEffect(() => {
    const el = scroller.current,
      list = anchor.current;
    if (!enabled || !el || !list) return;
    let frame = 0;
    const listTop = () => list.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    const measure = () => {
      const row = list.firstElementChild as HTMLElement | null;
      const stride = row && row.offsetHeight > 0 ? row.offsetHeight + gap : 32;
      const next = {
        ...windowRange(el.scrollTop, el.clientHeight, listTop(), stride, count, overscan),
        stride,
      };
      setView((current) =>
        current.start === next.start && current.end === next.end && current.stride === next.stride
          ? current
          : next,
      );
      return stride;
    };
    const stride = measure();
    if (activeIndex >= 0 && activeIndex !== revealed.current) {
      revealed.current = activeIndex;
      const top = listTop() + activeIndex * stride;
      if (top < el.scrollTop) el.scrollTo({ top });
      else if (top + stride > el.scrollTop + el.clientHeight)
        el.scrollTo({ top: top + stride - el.clientHeight });
    }
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [enabled, scroller, anchor, count, activeIndex, gap, overscan]);
  if (!enabled) return { start: 0, end: count, padTop: 0, padBottom: 0 };
  const start = Math.min(view.start, count),
    end = Math.min(view.end, count);
  return { start, end, padTop: start * view.stride, padBottom: Math.max(0, count - end) * view.stride };
}
