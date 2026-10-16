import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "../ui/dialog";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { shellIconClose } from "../ui/icons";
import "./SettingsDialogControl.css";

/** Compact settings entry; the existing editor mounts only while its dialog is open. */
export function SettingsDialogControl({
  active,
  label,
  action,
  children,
}: {
  active: boolean;
  label: string;
  action: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);
  return (
    <>
      <button
        {...smallGhostButtonProps}
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open && active}
        disabled={!active}
        onClick={() => setOpen(true)}
      >
        {action}
      </button>
      {open && active && (
        <Dialog
          label={label}
          className="aux-dialog-surface settings-preference-dialog"
          returnFocus={trigger}
          onClose={() => setOpen(false)}
        >
          <header>
            <h3>{label}</h3>
            <button
              type="button"
              aria-label={`Close ${label.toLocaleLowerCase()}`}
              onClick={() => setOpen(false)}
            >
              {shellIconClose}
            </button>
          </header>
          <div className="settings-preference-editor">{children}</div>
          <footer>
            <button {...smallButtonProps} type="button" onClick={() => setOpen(false)}>
              Done
            </button>
          </footer>
        </Dialog>
      )}
    </>
  );
}
