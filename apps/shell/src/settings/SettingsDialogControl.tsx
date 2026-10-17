import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "../ui/dialog";
import { smallButtonProps } from "../ui/button-props";
import { shellIconClose, shellIconRight } from "../ui/icons";
import "./SettingsDialogControl.css";

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
  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);
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
              editorFocus.current =
                node?.querySelector<HTMLElement>(
                  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not(:disabled), textarea:not(:disabled), select:not(:disabled)',
                ) ?? null;
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
