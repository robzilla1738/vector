import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Dialog } from "./dialog";
import "./confirm.css";

export type ConfirmControls = {
  confirmControl?(node: HTMLButtonElement | null, settle: () => void): void;
  cancelControl?(node: HTMLButtonElement | null, settle: () => void): void;
  onConfirm?(event: React.MouseEvent<HTMLButtonElement>): void;
  onCancel?(event: React.MouseEvent<HTMLButtonElement>): void;
};

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
  controls,
}: {
  options: ConfirmOptions;
  onConfirm(): void;
  onCancel(): void;
  controls?: ConfirmControls;
}) {
  const descriptionId = useId();
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      label={options.title}
      kind="alertdialog"
      descriptionId={descriptionId}
      initialFocusRef={cancel}
      onClose={onCancel}
      className="ui-alert-dialog"
    >
      <h3>{options.title}</h3>
      <p id={descriptionId}>{options.description}</p>
      <div className="ui-alert-actions">
        <button
          ref={(node) => {
            cancel.current = node;
            controls?.cancelControl?.(node, onCancel);
          }}
          type="button"
          className="btn"
          onClick={(event) => (controls?.onCancel ? controls.onCancel(event) : onCancel())}
        >
          {options.cancelLabel ?? "Cancel"}
        </button>
        <button
          ref={(node) => controls?.confirmControl?.(node, onConfirm)}
          type="button"
          className={`btn ${options.danger ? "danger" : "primary"}`}
          onClick={(event) => (controls?.onConfirm ? controls.onConfirm(event) : onConfirm())}
        >
          {options.confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/** A single pending decision, settled on either action or component unmount. */
export function useConfirm(controls?: ConfirmControls) {
  const [request, setRequest] = useState<{
    options: ConfirmOptions;
    resolve(accepted: boolean): void;
  } | null>(null);
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
      setRequest({ options: request, resolve });
    });
  }, []);
  const settle = (original: (accepted: boolean) => void, accepted: boolean) => {
    if (pending.current !== original) return;
    const resolve = original;
    pending.current = null;
    setRequest(null);
    resolve?.(accepted);
  };
  return {
    confirm,
    confirmation: request && (
      <AlertDialog
        options={request.options}
        controls={controls}
        onConfirm={() => settle(request.resolve, true)}
        onCancel={() => settle(request.resolve, false)}
      />
    ),
  };
}
