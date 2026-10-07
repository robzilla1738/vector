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
import { positionAnchoredPopover } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import { Dialog } from "./dialog";
import "./popover.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "./native-attribute-props";

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
        {...auxNativeButtonTypeProps}
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
      {open && !disabled && (
        <Dialog
          id={id}
          dialogRef={panel}
          returnFocus={button}
          initialFocusRef={initialFocusRef}
          className="anchored-panel ctx-menu"
          label={label}
          onClose={close}
        >
          {children(close)}
        </Dialog>
      )}
    </>
  );
}
