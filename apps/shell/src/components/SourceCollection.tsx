import { useState, type ReactNode } from "react";
import { smallGhostButtonProps } from "../ui/button-props";

/** Page the presentation, never the selected source identities. */
export function SourceCollection<T>({
  items,
  scope = "",
  pageSize = 12,
  label,
  children,
}: {
  items: readonly T[];
  scope?: string;
  pageSize?: number;
  label: string;
  children(visible: readonly T[]): ReactNode;
}) {
  const [position, setPosition] = useState({ scope, page: 0 });
  const last = Math.max(0, Math.ceil(items.length / pageSize) - 1);
  const page = position.scope === scope ? Math.min(position.page, last) : 0;
  const start = page * pageSize;
  return (
    <>
      {children(items.slice(start, start + pageSize))}
      {items.length > pageSize && (
        <nav className="source-collection-pages" aria-label={label}>
          <button
            type="button"
            {...smallGhostButtonProps}
            disabled={page === 0}
            onClick={() => setPosition({ scope, page: page - 1 })}
          >
            Previous
          </button>
          <output>
            {start + 1}–{Math.min(start + pageSize, items.length)} of {items.length}
          </output>
          <button
            type="button"
            {...smallGhostButtonProps}
            disabled={page === last}
            onClick={() => setPosition({ scope, page: page + 1 })}
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}
