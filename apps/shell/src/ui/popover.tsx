import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { positionContextMenu } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import { useDismissable } from "../use-dismissable";
import "./popover.css";

/** Native dialog focus containment, anchored to its shell control and clamped to the viewport. */
export function Popover({
  label,
  trigger,
  disabled,
  className = "",
  children,
}: {
  label: string;
  trigger: ReactNode;
  disabled?: boolean;
  className?: string;
  children(close: () => void): ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => setOpen(false);
  useDismissable(open, close);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect(() => {
    if (!open || !panel.current) return;
    const node = panel.current;
    const place = () => {
      const rect = button.current?.getBoundingClientRect();
      if (rect) positionContextMenu(node, rect.left, rect.bottom + 6);
      requestStageReport();
    };
    node.showModal();
    place();
    const observer = new ResizeObserver(place);
    observer.observe(node);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      node.close();
      button.current?.focus({ preventScroll: true });
      requestAnimationFrame(requestStageReport);
    };
  }, [open]);
  return (
    <>
      <button
        ref={button}
        type="button"
        className={`anchored-trigger ${className}`}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <dialog
            id={id}
            ref={panel}
            className="anchored-panel ctx-menu"
            aria-label={label}
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              const rect = event.currentTarget.getBoundingClientRect();
              if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
              )
                close();
            }}
          >
            {children(close)}
          </dialog>,
          document.body,
        )}
    </>
  );
}
