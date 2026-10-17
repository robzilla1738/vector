import { useEffect, useRef, useState } from "react";
import { SitePermissions } from "../../components/SitePermissions";
import { Dialog } from "../../ui/dialog";

export function SavedWebsiteSettings({ active }: { active: boolean }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!active && !busy) setOpen(false);
  }, [active, busy]);
  function close() {
    if (!busy) setOpen(false);
  }
  return (
    <>
      <button
        className="btn"
        ref={trigger}
        disabled={!active}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Manage
      </button>
      {open && (
        <Dialog
          label="Saved website access and data"
          returnFocus={trigger}
          className="saved-website-settings"
          onClose={close}
        >
          <h3>Saved website access and data</h3>
          <SitePermissions onBusyChange={setBusy} />
          <button className="btn" disabled={busy} onClick={close}>
            Done
          </button>
        </Dialog>
      )}
    </>
  );
}
