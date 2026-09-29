import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { positionContextMenu } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import { useNativeDialog } from "./native-dialog";
import "./popover.css";

/** Native dialog focus containment, anchored to its shell control and clamped to the viewport. */
export function Popover({
  label,
  trigger,
  disabled,
  className = "",
  children,
  initialFocusRef,
}: {
  label: string;
  trigger: ReactNode;
  disabled?: boolean;
  className?: string;
  children(close: () => void): ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => setOpen(false);
  useNativeDialog(open && !disabled, panel, button, initialFocusRef);
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
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(node);
    window.addEventListener("resize", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
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
        !disabled &&
        createPortal(
          <dialog
            id={id}
            ref={panel}
            tabIndex={-1}
            aria-modal="true"
            className="anchored-panel ctx-menu"
            aria-label={label}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || event.defaultPrevented || event.nativeEvent.isComposing) return;
              event.preventDefault();
              event.stopPropagation();
              close();
            }}
            onCancel={(event) => {
              event.preventDefault();
              event.stopPropagation();
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
