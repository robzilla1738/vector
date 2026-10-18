import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { moveMenuFocus } from "../keyboard-list";
import { positionContextMenu } from "../position-context-menu";
import { requestStageReport } from "../stage-obstruction";
import { availableControls, availableForFocus, nativePickerOpen } from "./focus";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "./native-attribute-props";
import { staticButtonProps as auxClassButtonProps } from "./class-props";
import { Dialog, useNativeDialog, type DialogBaseProps } from "./native-dialog";
export { Dialog, useNativeDialog } from "./native-dialog";

/** One menu surface shared by pointer actions and anchored controls. */
export function Menu({
  label,
  onClose,
  className = "",
  children,
  returnFocus,
  anchor,
  point,
  atEnd = false,
  placement = "below-end",
  initialFocusRef,
  id,
  onMenuKeyDown,
  menuRef,
}: DialogBaseProps & {
  anchor?: RefObject<HTMLElement | null>;
  point?: { x: number; y: number };
  atEnd?: boolean;
  placement?: "below-end" | "above-start" | "above-end" | "auto-end";
  id?: string;
  onMenuKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
  menuRef?: RefObject<HTMLDialogElement | null>;
}) {
  const internalRef = useRef<HTMLDialogElement>(null);
  const ref = menuRef ?? internalRef;
  const generatedId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useNativeDialog(true, ref, returnFocus);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const place = () => {
      const rect = anchor?.current?.getBoundingClientRect();
      dialog.style.right = "auto";
      dialog.style.bottom = "auto";
      if (rect) {
        const x = placement === "above-start" ? rect.left : rect.right - dialog.offsetWidth;
        const above =
          placement.startsWith("above") ||
          (placement === "auto-end" && rect.bottom + dialog.offsetHeight + 12 > window.innerHeight);
        const y = above ? rect.top - dialog.offsetHeight - 4 : rect.bottom + 4;
        positionContextMenu(dialog, x, y);
      } else if (point) positionContextMenu(dialog, point.x, point.y);
      requestStageReport();
    };
    place();
    const items = [...dialog.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(availableForFocus);
    const preferred = initialFocusRef?.current;
    (preferred && dialog.contains(preferred) && availableForFocus(preferred)
      ? preferred
      : atEnd
        ? items.at(-1)
        : items[0]
    )?.focus({ preventScroll: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(dialog);
    const onResize = () => closeRef.current();
    window.addEventListener("resize", onResize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [anchor, point?.x, point?.y, atEnd, placement, initialFocusRef]);
  return createPortal(
    <dialog
      id={id ?? generatedId}
      ref={ref}
      tabIndex={-1}
      role="menu"
      className={`aux-native-dialog aux-native-menu popup-material ${className}`}
      aria-label={label}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        if (nativePickerOpen(event.target)) return;
        onMenuKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          const trigger = anchor?.current ?? returnFocus?.current;
          const direction = event.shiftKey ? -1 : 1;
          onClose();
          queueMicrotask(() => focusOutsideMenu(trigger, direction));
          return;
        }
        moveMenuFocus(event);
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      {children}
    </dialog>,
    document.body,
  );
}

function focusOutsideMenu(trigger: HTMLElement | null | undefined, direction: 1 | -1) {
  if (!trigger?.isConnected) return;
  const containingDialog = trigger.closest<HTMLDialogElement>("dialog[open]");
  const scope = containingDialog ?? document;
  const candidates = availableControls(scope).filter((node) => node.closest("dialog") === containingDialog);
  const index = candidates.indexOf(trigger);
  const next = index >= 0 ? candidates[index + direction] : null;
  (next ?? trigger).focus({ preventScroll: true });
}

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
          {...auxNativeButtonTypeProps}
          {...auxClassButtonProps}
          onClick={(event) => (controls?.onCancel ? controls.onCancel(event) : onCancel())}
        >
          {options.cancelLabel ?? "Cancel"}
        </button>
        <button
          ref={(node) => controls?.confirmControl?.(node, onConfirm)}
          {...auxNativeButtonTypeProps}
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
