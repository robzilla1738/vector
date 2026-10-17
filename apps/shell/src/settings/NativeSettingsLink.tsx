import { useRef, useState } from "react";
import { inNativeHost } from "../bridge";
import { errToast, useStore } from "../store";
import { shellIconOpen } from "../ui/icons";

export function NativeSettingsLink({
  active,
  destination,
  label,
}: {
  active: boolean;
  destination: "content" | "security" | "extension-shortcuts";
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function open() {
    if (!active || !inNativeHost || pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await useStore
        .getState()
        .newTab(
          destination === "extension-shortcuts"
            ? "chrome://extensions/shortcuts"
            : `chrome://settings/${destination}`,
        );
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
