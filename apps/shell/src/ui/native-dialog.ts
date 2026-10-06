import { useLayoutEffect, type RefObject } from "react";
import { acquireFloatingSidebarLock } from "../floating-sidebar";
import { requestStageReport } from "../stage-obstruction";
import { availableControls, availableForFocus, ownsFocus } from "./focus";

const ownedDialogs = new Set<HTMLDialogElement>();
const topModal = () => {
  // Fallback DOMs can expose dialog.open without implementing the native top layer.
  // Only ask the selector engine for native modal state when it advertises support.
  const nativeModalState = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("selector(:modal)");
  if (nativeModalState && [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")]
    .some(item => !ownedDialogs.has(item))) return null;
  return [...ownedDialogs].findLast(item => item.open && item.isConnected);
};

/** One lifecycle for native top-layer dialogs, menus and popovers. */
export function useNativeDialog(
  open: boolean,
  ref: RefObject<HTMLDialogElement | null>,
  returnFocus?: RefObject<HTMLElement | null>,
  initialFocus?: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const target = returnFocus?.current ?? (previous instanceof HTMLElement ? previous : null);
    const unlock = acquireFloatingSidebarLock("keep-current");
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    ownedDialogs.add(dialog);
    const focusInside = (node = availableControls(dialog)[0] ?? dialog) => node.focus({ preventScroll: true });
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
    const rememberFocus = () => { focused = document.activeElement; };
    dialog.addEventListener("focusin", rememberFocus);
    const observer = new MutationObserver(() => {
      if (dialog.open && focused && !focused.isConnected && document.activeElement === document.body && topModal() === dialog)
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
      if (ownedFocus && target && availableForFocus(target)) {
        const remaining = topModal();
        if (remaining !== null && (!remaining || remaining.contains(target))) target.focus({ preventScroll: true });
      }
      requestAnimationFrame(requestStageReport);
    };
  }, [open, ref, returnFocus, initialFocus]);
}
