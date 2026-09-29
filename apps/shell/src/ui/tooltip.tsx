import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./tooltip.css";

/** The trigger receives the description ID explicitly, so its accessible name stays its own. */
export function Tooltip({ content, children }: { content: ReactNode; children(id: string): ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const dismissed = useRef(false);
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => {
    if (!visible) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const tip = bubble.current;
      if (!anchor || !tip) return;
      const left = Math.max(8, Math.min(anchor.left + (anchor.width - tip.offsetWidth) / 2, window.innerWidth - tip.offsetWidth - 8));
      const top = anchor.top - tip.offsetHeight - 8 >= 8 ? anchor.top - tip.offsetHeight - 8 : anchor.bottom + 8;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, content]);
  return <span ref={trigger} className="ui-tooltip-trigger" onPointerEnter={() => { hovered.current = true; if (!dismissed.current) setVisible(true); }} onPointerLeave={() => { hovered.current = false; if (!focused.current) { dismissed.current = false; setVisible(false); } }}
    onFocusCapture={() => { focused.current = true; if (!dismissed.current) setVisible(true); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { focused.current = false; if (!hovered.current) { dismissed.current = false; setVisible(false); } } }}
    onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); dismissed.current = true; setVisible(false); } }}>
    {children(id)}
    {visible && createPortal(<span ref={bubble} id={id} className="ui-tooltip" role="tooltip">{content}</span>, document.body)}
  </span>;
}
