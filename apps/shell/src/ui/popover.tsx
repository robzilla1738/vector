import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
  title,
  disabled,
  className = "",
  align = "start",
  children,
  initialFocusRef,
  triggerControl,
  onTrigger,
}: {
  label: string;
  trigger: ReactNode;
  title?: string;
  disabled?: boolean;
  className?: string;
  align?: "start" | "end";
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
  useLayoutEffect(() => {
    if (!open || !panel.current) return;
    const node = panel.current;
    const place = () => {
      const rect = button.current?.getBoundingClientRect();
      if (rect) positionAnchoredPopover(node, rect, align);
      requestStageReport();
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(node);
    if (button.current) observer?.observe(button.current);
    const onScroll = (event: Event) => {
      // Measuring clears maxHeight; doing it during the popup's own scroll resets its scrollTop.
      if (event.target instanceof Node && node.contains(event.target)) return;
      place();
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
      requestAnimationFrame(requestStageReport);
    };
  }, [open, align]);
  return (
    <>
      <button
        ref={setButton}
        {...auxNativeButtonTypeProps}
        className={`anchored-trigger ${className}`}
        disabled={disabled}
        aria-label={label}
        title={title ?? label}
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
          placement="anchored"
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
