import { useId, useLayoutEffect, useRef, useState, type AnchorHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import type { ConversationSource } from "@aux/contracts";
import { positionContextMenu } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import { useDismissable } from "../use-dismissable";
import { hostOf } from "../workspace";
import { sourceDescription } from "./SourceRow";
import { shellIconGlobe } from "../ui/icons";
import "./reading.css";

export function CitationChip({
  source,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { source: ConversationSource }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLAnchorElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const id = useId();
  useDismissable(open, () => setOpen(false));
  useLayoutEffect(() => {
    if (!open || !card.current || !anchor.current) return;
    const rect = anchor.current.getBoundingClientRect();
    positionContextMenu(card.current, rect.left, rect.bottom + 6);
    requestStageReport();
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      requestAnimationFrame(requestStageReport);
    };
  }, [open]);
  return (
    <>
      <a
        {...props}
        ref={anchor}
        className="citation-chip"
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {shellIconGlobe}
        <span>{children || hostOf(source.url)}</span>
      </a>
      {open &&
        createPortal(
          <span id={id} ref={card} role="tooltip" className="citation-preview ctx-menu popup-material">
            <strong>{source.title || hostOf(source.url)}</strong>
            <span>{sourceDescription(source)}</span>
            <small>{source.url}</small>
          </span>,
          document.body,
        )}
    </>
  );
}
