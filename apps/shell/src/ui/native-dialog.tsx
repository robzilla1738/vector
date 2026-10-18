import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { requestStageReport } from "../stage-obstruction";
import { availableControls, availableForFocus, ownsFocus, nativePickerOpen } from "./focus";
import { acquireFloatingSidebarLock } from "../floating-sidebar";
import { ownedDialogs, topModal } from "./modal-stack";
import "./dialog.css";

export interface DialogBaseProps {
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
  dialogRef,
  id,
  dismissOnSurfaceClick = false,
  placement = "stage",
}: DialogBaseProps & {
  kind?: "dialog" | "alertdialog";
  descriptionId?: string;
  dialogRef?: RefObject<HTMLDialogElement | null>;
  id?: string;
  dismissOnSurfaceClick?: boolean;
  placement?: "stage" | "anchored";
}) {
  const internalRef = useRef<HTMLDialogElement>(null);
  const ref = dialogRef ?? internalRef;
  useNativeDialog(true, ref, returnFocus, initialFocusRef);
  useDialogStage(ref, placement === "stage");
  return createPortal(
    <dialog
      id={id}
      ref={ref}
      tabIndex={-1}
      role={kind}
      className={`aux-native-dialog ${placement === "stage" ? "solid-popover aux-stage-dialog" : "popup-material"} ${className}`}
      aria-label={label}
      aria-modal="true"
      aria-describedby={descriptionId}
      onKeyDown={(event) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          event.nativeEvent.isComposing ||
          nativePickerOpen(event.target)
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        if (dismissOnSurfaceClick) {
          onClose();
          return;
        }
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

/** Portaled modals remain centered in the browsing area as the sidebar resizes. */
function useDialogStage(ref: RefObject<HTMLDialogElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const dialog = ref.current;
    const stage = document.querySelector<HTMLElement>(".main-col > .main");
    if (!enabled || !dialog || !stage) return;
    const place = () => {
      const bounds = stage.getBoundingClientRect();
      for (const [edge, value] of Object.entries({
        top: bounds.top,
        left: bounds.left,
        right: window.innerWidth - bounds.right,
        bottom: window.innerHeight - bounds.bottom,
      }))
        dialog.style.setProperty(`--dialog-stage-${edge}`, `${Math.max(0, value)}px`);
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(stage);
    // Position can also change when the toolbar/layout changes without changing stage size.
    window.addEventListener("resize", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [ref, enabled]);
}

/** One lifecycle for native top-layer dialogs, menus and popovers. */
export function useNativeDialog(
  open: boolean,
  ref: RefObject<HTMLDialogElement | null>,
  returnFocus?: RefObject<HTMLElement | null>,
  initialFocus?: RefObject<HTMLElement | null>,
) {
  const focusConfig = useRef({ returnFocus, initialFocus });
  useLayoutEffect(() => {
    focusConfig.current = { returnFocus, initialFocus };
  });
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const { returnFocus, initialFocus } = focusConfig.current;
    const dialog = ref.current;
    const previous = document.activeElement;
    const target = returnFocus?.current ?? (previous instanceof HTMLElement ? previous : null);
    const unlock = acquireFloatingSidebarLock("keep-current");
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    ownedDialogs.add(dialog);
    const focusInside = (node = availableControls(dialog)[0] ?? dialog) =>
      node.focus({ preventScroll: true });
    let focused = document.activeElement;
    const preferred = initialFocus?.current;
    if (preferred && dialog.contains(preferred) && availableForFocus(preferred)) {
      focusInside(preferred);
    } else if (
      !(focused instanceof HTMLElement) ||
      !dialog.contains(focused) ||
      !availableForFocus(focused)
    ) {
      // Native showModal normally chooses this itself. The fallback also covers
      // a dialog with no controls and hosts without native modal focus support.
      focusInside();
    }
    focused = document.activeElement;
    const rememberFocus = () => {
      focused = document.activeElement;
    };
    dialog.addEventListener("focusin", rememberFocus);
    const observer = new MutationObserver(() => {
      if (
        dialog.open &&
        focused &&
        !focused.isConnected &&
        document.activeElement === document.body &&
        topModal() === dialog
      )
        focusInside();
    });
    observer.observe(dialog, { childList: true, subtree: true });
    requestStageReport();
    return () => {
      observer.disconnect();
      dialog.removeEventListener("focusin", rememberFocus);
      const ownedFocus = ownsFocus(dialog);
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      ownedDialogs.delete(dialog);
      unlock();
      // A newly opened overlay may already own focus. Closing this one must not
      // pull focus back behind it; otherwise return to the explicit/live opener.
      // Deletions clean up before sibling DOM updates (including disabled state).
      // Restore after the commit, then re-check availability and newer focus ownership.
      if (ownedFocus && target)
        queueMicrotask(() => {
          if (!availableForFocus(target)) return;
          const active = document.activeElement;
          if (active !== document.body && active !== target && !dialog.contains(active)) return;
          const remaining = topModal();
          if (remaining !== null && (!remaining || remaining.contains(target)))
            target.focus({ preventScroll: true });
        });
      requestAnimationFrame(requestStageReport);
    };
  }, [open, ref]);
}
