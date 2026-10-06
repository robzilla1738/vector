import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export interface RowWindow {
  start: number;
  end: number;
}
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
  return { start, end: Math.max(start, Math.min(count, first + Math.ceil(viewport / stride) + overscan)) };
}

/** One row window for standalone lists and lists below folders in a shared scroller. */
export function VirtualList<T>({
  items,
  rowHeight,
  overscan = 6,
  className,
  rowClassName,
  renderRow,
  keyOf,
  header,
  footer,
  role,
  ariaLabel,
  scroller,
  enabled = true,
  activeIndex = -1,
  rowGap = 0,
  measureRows = false,
}: {
  items: readonly T[];
  rowHeight: number;
  overscan?: number;
  className?: string;
  rowClassName?: string;
  renderRow: (item: T, index: number) => ReactNode;
  keyOf: (item: T, index: number) => string;
  header?: ReactNode;
  footer?: ReactNode;
  role?: string;
  ariaLabel?: string;
  scroller?: RefObject<HTMLElement | null>;
  enabled?: boolean;
  activeIndex?: number;
  rowGap?: number;
  measureRows?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null),
    anchor = useRef<HTMLDivElement>(null);
  const revealed = useRef(-1);
  const [view, setView] = useState({ start: 0, end: 40, stride: rowHeight });
  useLayoutEffect(() => {
    const el = scroller ? scroller.current : root.current,
      list = anchor.current;
    if (!enabled || !el || !list) {
      revealed.current = -1;
      return;
    }
    let frame = 0;
    const listTop = () => list.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    const measure = () => {
      const row = list.firstElementChild as HTMLElement | null;
      const stride = measureRows && row && row.offsetHeight > 0 ? row.offsetHeight + rowGap : rowHeight;
      const next = {
        ...windowRange(el.scrollTop, el.clientHeight, listTop(), stride, items.length, overscan),
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
    if (activeIndex >= 0 && activeIndex < items.length && activeIndex !== revealed.current) {
      revealed.current = activeIndex;
      const top = listTop() + activeIndex * stride;
      if (top < el.scrollTop) el.scrollTo({ top });
      else if (top + stride > el.scrollTop + el.clientHeight)
        el.scrollTo({ top: top + stride - el.clientHeight });
      measure();
    }
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [scroller, enabled, activeIndex, items.length, rowHeight, rowGap, overscan, measureRows]);
  const start = enabled ? Math.min(view.start, items.length) : 0;
  const end = enabled ? Math.min(view.end, items.length) : items.length;
  return (
    <div ref={root} className={scroller ? undefined : className} role={role} aria-label={ariaLabel}>
      {header}
      <div
        ref={anchor}
        className={scroller ? className : undefined}
        style={{
          paddingTop: start * view.stride,
          paddingBottom: Math.max(0, items.length - end) * view.stride,
        }}
      >
        {items.slice(start, end).map((item, i) => (
          <div
            key={keyOf(item, start + i)}
            className={rowClassName}
            style={measureRows ? undefined : { height: rowHeight }}
          >
            {renderRow(item, start + i)}
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}
