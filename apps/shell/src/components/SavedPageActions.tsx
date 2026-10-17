import type { ReactNode } from "react";
import { Popover } from "../ui/popover";
import { shellIconMore } from "../ui/icons";
import { moveListFocus } from "../keyboard-list";

export function SavedPageActions({ title, menu, hidden, disabled, children }: {
  title: string;
  menu: boolean;
  hidden: boolean;
  disabled: boolean;
  children: ReactNode;
}) {
  if (hidden) return null;
  if (!menu) return <div className="library-actions">{children}</div>;
  return (
    <Popover label={`Actions for ${title}`} trigger={shellIconMore} disabled={disabled} align="end" className="library-bookmark-more">
      {(close) => (
        <div className="library-bookmark-actions"
          onKeyDown={(event) => moveListFocus(event, "button:not(:disabled)")}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("button:not(:disabled)")) close();
          }}
        >
          {children}
        </div>
      )}
    </Popover>
  );
}
