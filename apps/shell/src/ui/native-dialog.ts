import { useLayoutEffect, type RefObject } from "react";
import { acquireFloatingSidebarLock } from "../floating-sidebar";
import { requestStageReport } from "../stage-obstruction";
import { availableControls, availableForFocus } from "./focus";

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
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlock = acquireFloatingSidebarLock("keep-current");
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    const preferred = initialFocus?.current;
    if (preferred && dialog.contains(preferred) && availableForFocus(preferred)) {
      preferred.focus({ preventScroll: true });
    } else if (
      !(document.activeElement instanceof HTMLElement) ||
      !dialog.contains(document.activeElement) ||
      !availableForFocus(document.activeElement)
    ) {
      // Native showModal normally chooses this itself. The fallback also covers
      // a dialog with no controls and hosts without native modal focus support.
      (availableControls(dialog)[0] ?? dialog).focus({ preventScroll: true });
    }
    requestStageReport();
    return () => {
      const active = document.activeElement;
      const ownedFocus = active === document.body || active === null || dialog.contains(active);
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      unlock();
      const target = returnFocus?.current ?? previous;
      // A newly opened overlay may already own focus. Closing this one must not
      // pull focus back behind it; otherwise return to the explicit/live opener.
      if (ownedFocus && target && availableForFocus(target)) {
        const remaining = [...document.querySelectorAll<HTMLDialogElement>("dialog[open]")]
          .filter((item) => item !== dialog)
          .at(-1);
        if (!remaining || remaining.contains(target)) target.focus({ preventScroll: true });
      }
      requestAnimationFrame(requestStageReport);
    };
  }, [open, ref, returnFocus, initialFocus]);
}
