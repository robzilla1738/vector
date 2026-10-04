import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { positionAnchoredPopover } from "../position-context-menu";
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
  triggerControl,
  onTrigger,
}: {
  label: string;
  trigger: ReactNode;
  disabled?: boolean;
  className?: string;
  children(close: () => void): ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  triggerControl?: (node: HTMLButtonElement | null, activate: () => void) => void;
  onTrigger?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => setOpen(false);
  const activate = useCallback(() => setOpen((value) => !value), []);
  const setButton = useCallback(
    (node: HTMLButtonElement | null) => {
      button.current = node;
      triggerControl?.(node, activate);
    },
    [triggerControl, activate],
  );
  useNativeDialog(open && !disabled, panel, button, initialFocusRef);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect(() => {
    if (!open || !panel.current) return;
    const node = panel.current;
    const place = () => {
      const rect = button.current?.getBoundingClientRect();
      if (rect) positionAnchoredPopover(node, rect);
      requestStageReport();
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(node);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      requestAnimationFrame(requestStageReport);
    };
  }, [open]);
  return (
    <>
      <button
        ref={setButton}
        type="button"
        className={`anchored-trigger ${className}`}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(event) => (onTrigger ? onTrigger(event) : activate())}
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
