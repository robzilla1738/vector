import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "./dialog";
import "./confirm.css";

export type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
};

export function AlertDialog({
  options,
  onConfirm,
  onCancel,
}: {
  options: ConfirmOptions;
  onConfirm(): void;
  onCancel(): void;
}) {
  return (
    <Dialog label={options.title} onClose={onCancel} className="ui-alert-dialog">
      <h3>{options.title}</h3>
      <p>{options.description}</p>
      <div className="ui-alert-actions">
        <button type="button" className="btn" autoFocus onClick={onCancel}>
          {options.cancelLabel ?? "Cancel"}
        </button>
        <button type="button" className={`btn ${options.danger ? "danger" : "primary"}`} onClick={onConfirm}>
          {options.confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/** A single pending decision, settled on either action or component unmount. */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const pending = useRef<((accepted: boolean) => void) | null>(null);
  useEffect(
    () => () => {
      pending.current?.(false);
      pending.current = null;
    },
    [],
  );
  const confirm = useCallback((request: ConfirmOptions) => {
    if (pending.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
      setOptions(request);
    });
  }, []);
  const settle = (accepted: boolean) => {
    const resolve = pending.current;
    pending.current = null;
    setOptions(null);
    resolve?.(accepted);
  };
  return {
    confirm,
    confirmation: options && (
      <AlertDialog options={options} onConfirm={() => settle(true)} onCancel={() => settle(false)} />
    ),
  };
}
