import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { moveMenuFocus } from "../keyboard-list";
import { positionContextMenu } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import { availableControls, availableForFocus } from "./focus";
import { useNativeDialog } from "./native-dialog";
import "./dialog.css";

interface BaseProps {
  label: string;
  onClose(): void;
  className?: string;
  children: ReactNode;
  returnFocus?: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/** The single modal shell for forms and confirmations. Native dialog owns
 * focus containment, Escape, and the top layer. */
export function Dialog({
  label,
  onClose,
  className = "",
  children,
  returnFocus,
  initialFocusRef,
  kind = "dialog",
  descriptionId,
}: BaseProps & { kind?: "dialog" | "alertdialog"; descriptionId?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useNativeDialog(true, ref, returnFocus, initialFocusRef);
  return createPortal(
    <dialog
      ref={ref}
      tabIndex={-1}
      role={kind}
      className={`aux-native-dialog ${className}`}
      aria-label={label}
      aria-describedby={descriptionId}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || event.defaultPrevented || event.nativeEvent.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
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

/** One menu surface shared by pointer actions and anchored controls. */
export function Menu({
  label,
  onClose,
  className = "",
  children,
  returnFocus,
  anchor,
  point,
  atEnd = false,
  placement = "below-end",
  initialFocusRef,
  id,
  onMenuKeyDown,
  menuRef,
}: BaseProps & {
  anchor?: RefObject<HTMLElement | null>;
  point?: { x: number; y: number };
  atEnd?: boolean;
  placement?: "below-end" | "above-start" | "above-end";
  id?: string;
  onMenuKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
  menuRef?: RefObject<HTMLDialogElement | null>;
}) {
  const internalRef = useRef<HTMLDialogElement>(null);
  const ref = menuRef ?? internalRef;
  const generatedId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useNativeDialog(true, ref, returnFocus);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const place = () => {
      const rect = anchor?.current?.getBoundingClientRect();
      dialog.style.right = "auto";
      dialog.style.bottom = "auto";
      if (rect) {
        const x = placement === "above-start" ? rect.left : rect.right - dialog.offsetWidth;
        const y = placement.startsWith("above") ? rect.top - dialog.offsetHeight - 8 : rect.bottom + 4;
        positionContextMenu(dialog, x, y);
      } else if (point) positionContextMenu(dialog, point.x, point.y);
      requestStageReport();
    };
    place();
    const items = [...dialog.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(availableForFocus);
    const preferred = initialFocusRef?.current;
    (preferred && dialog.contains(preferred) && availableForFocus(preferred)
      ? preferred
      : atEnd
        ? items.at(-1)
        : items[0]
    )?.focus({ preventScroll: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(dialog);
    const onResize = () => closeRef.current();
    window.addEventListener("resize", onResize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [anchor, point?.x, point?.y, atEnd, placement, initialFocusRef]);
  return createPortal(
    <dialog
      id={id ?? generatedId}
      ref={ref}
      tabIndex={-1}
      role="menu"
      className={`aux-native-dialog aux-native-menu ${className}`}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        onMenuKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          const trigger = anchor?.current ?? returnFocus?.current;
          const direction = event.shiftKey ? -1 : 1;
          onClose();
          queueMicrotask(() => focusOutsideMenu(trigger, direction));
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

function focusOutsideMenu(trigger: HTMLElement | null | undefined, direction: 1 | -1) {
  if (!trigger?.isConnected) return;
  const containingDialog = trigger.closest<HTMLDialogElement>("dialog[open]");
  const scope = containingDialog ?? document;
  const candidates = availableControls(scope).filter((node) => node.closest("dialog") === containingDialog);
  const index = candidates.indexOf(trigger);
  const next = index >= 0 ? candidates[index + direction] : null;
  (next ?? trigger).focus({ preventScroll: true });
}
