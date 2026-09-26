import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { acquireFloatingSidebarLock } from "../floating-sidebar";
import { moveMenuFocus } from "../keyboard-list";
import { positionContextMenu } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import "./NativeDialog.css";

interface BaseProps {
  label: string;
  onClose(): void;
  className?: string;
  children: ReactNode;
  returnFocus?: RefObject<HTMLElement | null>;
}

function useDialogLifecycle(
  open: boolean,
  ref: RefObject<HTMLDialogElement | null>,
  returnFocus?: RefObject<HTMLElement | null>,
) {
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    requestStageReport();
    return () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      const target = returnFocus?.current ?? previous.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
      requestAnimationFrame(requestStageReport);
    };
  }, [open, ref, returnFocus]);
}

/** The single modal shell for forms and confirmations. Native dialog owns
 * focus containment, Escape, and the top layer. */
export function NativeDialog({ label, onClose, className = "", children, returnFocus }: BaseProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useDialogLifecycle(true, ref, returnFocus);
  useEffect(() => acquireFloatingSidebarLock("keep-current"), []);
  return createPortal(
    <dialog
      ref={ref}
      className={`aux-native-dialog ${className}`}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
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
          onClose();
      }}
    >
      {children}
    </dialog>,
    document.body,
  );
}

/** One menu surface shared by row actions and anchored controls. */
export function NativeMenu({
  label,
  onClose,
  className = "",
  children,
  returnFocus,
  anchor,
  atEnd = false,
  id,
}: BaseProps & {
  anchor: RefObject<HTMLElement | null>;
  atEnd?: boolean;
  id: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useDialogLifecycle(true, ref, returnFocus);
  useEffect(() => acquireFloatingSidebarLock("keep-current"), []);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = anchor.current;
    if (!dialog || !trigger) return;
    const place = () => {
      const rect = trigger.getBoundingClientRect();
      positionContextMenu(dialog, rect.right - dialog.offsetWidth, rect.bottom + 4);
      requestStageReport();
    };
    place();
    const items = dialog.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
    (atEnd ? items[items.length - 1] : items[0])?.focus();
    window.addEventListener("resize", onClose);
    return () => window.removeEventListener("resize", onClose);
  }, [anchor, atEnd, onClose]);
  return createPortal(
    <dialog
      id={id}
      ref={ref}
      role="menu"
      className={`aux-native-dialog aux-native-menu ${className}`}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          onClose();
          return;
        }
        moveMenuFocus(event);
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
          onClose();
      }}
    >
      {children}
    </dialog>,
    document.body,
  );
}
