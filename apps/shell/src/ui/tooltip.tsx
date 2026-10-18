import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./tooltip.css";

/** Descriptions stay hoverable and inside their trigger's native top layer. */
export function Tooltip({ content, children }: { content: ReactNode; children(id: string): ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const dismissed = useRef(false);
  const leaving = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const cancelLeave = () => {
    clearTimeout(leaving.current);
    leaving.current = undefined;
  };
  const reveal = () => {
    setPortalHost(trigger.current?.closest<HTMLDialogElement>("dialog[open]") ?? document.body);
    setVisible(true);
  };
  const enter = () => {
    cancelLeave();
    hovered.current = true;
    if (!dismissed.current) reveal();
  };
  const leave = () => {
    hovered.current = false;
    cancelLeave();
    leaving.current = setTimeout(() => {
      if (!focused.current && !hovered.current) {
        dismissed.current = false;
        setVisible(false);
      }
    }, 120);
  };
  useEffect(() => () => clearTimeout(leaving.current), []);
  useEffect(() => {
    if (!visible) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(leaving.current);
      dismissed.current = true;
      setVisible(false);
    };
    // A pointer-opened tooltip also dismisses without moving keyboard focus.
    document.addEventListener("keydown", dismiss, true);
    return () => document.removeEventListener("keydown", dismiss, true);
  }, [visible]);
  useLayoutEffect(() => {
    if (!visible) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect(),
        tip = bubble.current;
      if (!anchor || !tip) return;
      const maxLeft = Math.max(8, window.innerWidth - tip.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - tip.offsetHeight - 8);
      const proposedTop =
        anchor.top - tip.offsetHeight - 4 >= 8 ? anchor.top - tip.offsetHeight - 4 : anchor.bottom + 4;
      tip.style.left = `${Math.max(8, Math.min(anchor.left + (anchor.width - tip.offsetWidth) / 2, maxLeft))}px`;
      tip.style.top = `${Math.max(8, Math.min(proposedTop, maxTop))}px`;
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(place);
    if (bubble.current) observer?.observe(bubble.current);
    if (trigger.current) observer?.observe(trigger.current);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, content]);
  return (
    <span
      ref={trigger}
      className="ui-tooltip-trigger"
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocusCapture={() => {
        cancelLeave();
        focused.current = true;
        if (!dismissed.current) reveal();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          focused.current = false;
          if (!hovered.current) {
            dismissed.current = false;
            setVisible(false);
          }
        }
      }}
    >
      {children(id)}
      {visible &&
        portalHost &&
        createPortal(
          <span
            ref={bubble}
            id={id}
            className="ui-tooltip solid-popover"
            role="tooltip"
            onPointerEnter={enter}
            onPointerLeave={leave}
          >
            {content}
          </span>,
          portalHost,
        )}
    </span>
  );
}
