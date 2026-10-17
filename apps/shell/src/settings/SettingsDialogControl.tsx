import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "../ui/dialog";
import { smallButtonProps } from "../ui/button-props";
import { shellIconClose, shellIconRight } from "../ui/icons";
import { availableForFocus } from "../ui/focus";
import { topModal } from "../ui/modal-stack";
import "./SettingsDialogControl.css";

const editorSelector =
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not(:disabled), textarea:not(:disabled), select:not(:disabled)';

/** Compact settings entry; the existing editor mounts only while its dialog is open. */
export function SettingsDialogControl({
  active,
  label,
  action,
  navigation = false,
  defaultOpen = false,
  size = "regular",
  children,
  showClose = typeof children !== "function",
}: {
  active: boolean;
  label: string;
  action: string;
  navigation?: boolean;
  defaultOpen?: boolean;
  size?: "regular" | "wide";
  children: ReactNode | ((close: () => void) => ReactNode);
  showClose?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const trigger = useRef<HTMLButtonElement>(null);
  const editorFocus = useRef<HTMLElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);
  useLayoutEffect(() => {
    const content = editor.current;
    const dialog = content?.closest("dialog");
    if (!open || !active || !content || !dialog) return;
    // Async editors may initially have no enabled fields. Hand off their first
    // focus once ready, unless the person has already interacted with the dialog.
    const focusReadyField = () => {
      const field = [...content.querySelectorAll<HTMLElement>(editorSelector)].find(availableForFocus);
      if (field && dialog.open && topModal() === dialog) {
        stop();
        field.focus({ preventScroll: true });
      }
    };
    const observer = new MutationObserver(focusReadyField);
    const stop = () => {
      observer.disconnect();
      dialog.removeEventListener("keydown", stop, true);
      dialog.removeEventListener("pointerdown", stop, true);
    };
    observer.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "hidden", "open"],
    });
    dialog.addEventListener("keydown", stop, true);
    dialog.addEventListener("pointerdown", stop, true);
    focusReadyField();
    return stop;
  }, [open, active]);
  return (
    <>
      <button
        {...smallButtonProps}
        className={navigation ? "icon-btn" : smallButtonProps.className}
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open && active}
        disabled={!active}
        onClick={() => setOpen(true)}
      >
        {navigation ? shellIconRight : action}
      </button>
      {open && active && (
        <Dialog
          label={label}
          className={`aux-dialog-surface settings-preference-dialog settings-preference-dialog-${size}`}
          returnFocus={trigger}
          initialFocusRef={editorFocus}
          onClose={() => setOpen(false)}
        >
          <header>
            <h3>{label}</h3>
            {showClose && (
              <button
                type="button"
                aria-label={`Close ${label.toLocaleLowerCase()}`}
                onClick={() => setOpen(false)}
              >
                {shellIconClose}
              </button>
            )}
          </header>
          <div
            className="settings-preference-editor"
            ref={(node) => {
              editor.current = node;
              editorFocus.current = node?.querySelector<HTMLElement>(editorSelector) ?? null;
            }}
          >
            {typeof children === "function" ? children(() => setOpen(false)) : children}
          </div>
          {typeof children !== "function" && (
            <footer>
              <button {...smallButtonProps} type="button" onClick={() => setOpen(false)}>
                Done
              </button>
            </footer>
          )}
        </Dialog>
      )}
    </>
  );
}
