import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { Toast } from "../ui/toast";

const ToastRow = memo(function ToastRow({ id }: { id: number }) {
  const toast = useStore(state => state.toasts.find(item => item.id === id));
  if (!toast) return null;
  return <Toast id={toast.id} text={toast.text} kind={toast.kind} action={toast.action} onDismiss={useStore.getState().dismissToast} />;
});

export const Toasts = memo(function Toasts() {
  const toastIds = useStore(useShallow(state => state.toasts.map(item => item.id)));
  return (
    <div className="toasts" aria-live="polite">
      {toastIds.map(id => <ToastRow key={id} id={id} />)}
    </div>
  );
});
