import { useEffect, useRef, useState } from "react";
import { inNativeHost } from "../../bridge";
import { errToast, useStore } from "../../store";
import { SitePermissions } from "../../components/SitePermissions";
import { Dialog } from "../../ui/dialog";
import { shellIconOpen } from "../../ui/icons";

export function NativePrivacyLink({
  active,
  destination,
  label,
}: {
  active: boolean;
  destination: "content" | "security";
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function open() {
    if (!active || !inNativeHost || pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await useStore.getState().newTab(`chrome://settings/${destination}`);
    } catch (reason) {
      errToast(reason);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <button
      className="icon-btn"
      aria-label={label}
      title={inNativeHost ? label : "Available in the Aux desktop app"}
      disabled={!active || !inNativeHost || busy}
      onClick={() => void open()}
    >
      {shellIconOpen}
    </button>
  );
}

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
