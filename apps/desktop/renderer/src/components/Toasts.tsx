import { memo, useEffect, useState } from "react";
import { useStore } from "../store";
import { I } from "./icons";

const INFO_MS = 3600;

type ToastItem = ReturnType<typeof useStore.getState>["toasts"][number];

/** Info toasts time out (paused while pointed at or focused); errors stay until dismissed. */
function Toast({ toast }: { toast: ToastItem }) {
  const [held, setHeld] = useState(false);
  const error = toast.kind === "error";
  useEffect(() => {
    if (error || held) return;
    const timer = window.setTimeout(() => useStore.getState().dismissToast(toast.id), INFO_MS);
    return () => window.clearTimeout(timer);
  }, [error, held, toast.id]);
  return (
    <div className={`toast rise ${toast.kind}`} role={error ? "alert" : undefined}
      onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
      {error ? I.alert : I.check}
      <span className="toast-text">{toast.text}</span>
      <button className="icon-btn xs toast-dismiss" aria-label="Dismiss notification" onClick={() => useStore.getState().dismissToast(toast.id)}>{I.close}</button>
    </div>
  );
}

export const Toasts = memo(function Toasts({ top }: { top: boolean }) {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className={`toasts ${top ? "top" : ""}`} aria-live="polite">
      {toasts.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  );
});
