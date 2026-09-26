import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fixed-row-height windowing for long lists (40+ tabs, hundreds of runs).
 * Renders only the visible rows plus an overscan; the scroll container is
 * the component itself so callers can size it with flex.
 */
export function VirtualList<T>({
  items,
  rowHeight,
  overscan = 6,
  className,
  renderRow,
  keyOf,
  header,
  footer,
  role,
  ariaLabel,
}: {
  items: T[];
  rowHeight: number;
  overscan?: number;
  className?: string;
  renderRow: (item: T, index: number) => ReactNode;
  keyOf: (item: T, index: number) => string;
  header?: ReactNode;
  footer?: ReactNode;
  role?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState({ start: 0, end: 40 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const headerH = (el.firstElementChild as HTMLElement | null)?.dataset.header ? (el.firstElementChild as HTMLElement).offsetHeight : 0;
    const top = Math.max(0, el.scrollTop - headerH);
    const start = Math.max(0, Math.floor(top / rowHeight) - overscan);
    const visible = Math.ceil(el.clientHeight / rowHeight) + overscan * 2;
    const end = Math.min(items.length, start + visible);
    setRange((r) => (r.start === start && r.end === end ? r : { start, end }));
  }, [items.length, rowHeight, overscan]);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const total = items.length * rowHeight;
  const slice = items.slice(range.start, range.end);

  return (
    <div ref={ref} className={className} onScroll={measure} role={role} aria-label={ariaLabel}>
      {header && <div data-header="1">{header}</div>}
      <div style={{ height: total, position: "relative" }}>
        {slice.map((item, i) => {
          const index = range.start + i;
          return (
            <div key={keyOf(item, index)} style={{ position: "absolute", top: index * rowHeight, left: 0, right: 0, height: rowHeight }}>
              {renderRow(item, index)}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
