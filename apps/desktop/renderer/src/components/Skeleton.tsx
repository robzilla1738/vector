/** Placeholder rows shaped like the list that is loading. The label is what assistive tech hears. */
export function SkeletonRows({ label, rows = 6, tall = false }: { label: string; rows?: number; tall?: boolean }) {
  return <output className={`skeleton-rows${tall ? " tall" : ""}`} data-block aria-label={label}>
    {Array.from({ length: rows }, (_, index) => <span key={index} className="skeleton-row" />)}
  </output>;
}

/** A lazily loaded surface's outline: a heading bar over a few rows. */
export function SurfaceSkeleton({ label }: { label: string }) {
  return <div className="surface-skeleton">
    <span className="skeleton-row skeleton-title" />
    <SkeletonRows label={label} rows={5} tall />
  </div>;
}
