import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
  type RefObject,
} from "react";
import { Menu } from "../ui/dialog";
import { shellIconMore } from "../ui/icons";

function menuItems(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ children?: ReactNode; role?: string }>;
    if (child.type === Fragment) return cloneElement(element, {}, menuItems(element.props.children));
    if (child.type === "button") return cloneElement(element, { role: "menuitem" });
    if (child.type === "hr") return cloneElement(element, { role: "separator" });
    return child;
  });
}

export function SavedPageActions({
  title,
  menu,
  hidden,
  disabled,
  children,
  rowRef,
}: {
  title: string;
  menu: boolean;
  hidden: boolean;
  disabled: boolean;
  children: ReactNode;
  rowRef: RefObject<HTMLDivElement | null>;
}) {
  const [open, setOpen] = useState<{ point?: { x: number; y: number }; atEnd?: boolean } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !menu || hidden || disabled) {
      setOpen(null);
      return;
    }
    const show = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent &&
        event.key !== "ContextMenu" &&
        !(event.shiftKey && event.key === "F10")
      )
        return;
      const target = event.target instanceof HTMLElement ? event.target : row;
      if (target.closest("input, textarea, [contenteditable], .library-edit")) return;
      event.preventDefault();
      event.stopPropagation();
      returnFocus.current = target.closest<HTMLElement>("button, input") ?? trigger.current;
      const rect = target.getBoundingClientRect();
      setOpen({
        point:
          event instanceof MouseEvent
            ? { x: event.clientX, y: event.clientY }
            : { x: rect.left, y: rect.bottom },
      });
    };
    row.addEventListener("contextmenu", show);
    row.addEventListener("keydown", show);
    return () => {
      row.removeEventListener("contextmenu", show);
      row.removeEventListener("keydown", show);
    };
  }, [rowRef, menu, hidden, disabled]);
  if (hidden) return null;
  if (!menu) return <div className="library-actions">{children}</div>;
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="anchored-trigger library-bookmark-more"
        aria-label={`Actions for ${title}`}
        aria-haspopup="menu"
        aria-expanded={!!open}
        aria-controls={open ? id : undefined}
        disabled={disabled}
        onClick={() => {
          returnFocus.current = trigger.current;
          setOpen(open ? null : {});
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          returnFocus.current = trigger.current;
          setOpen({ atEnd: event.key === "ArrowUp" });
        }}
      >
        {shellIconMore}
      </button>
      {open && !disabled && (
        <Menu
          id={id}
          label={`Actions for ${title}`}
          anchor={open.point ? undefined : trigger}
          point={open.point}
          returnFocus={returnFocus}
          atEnd={open.atEnd}
          placement="auto-end"
          onClose={() => setOpen(null)}
          className="menu ctx-menu"
        >
          <div
            className="library-bookmark-actions"
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("button:not(:disabled)"))
                setOpen(null);
            }}
          >
            {menuItems(children)}
          </div>
        </Menu>
      )}
    </>
  );
}
