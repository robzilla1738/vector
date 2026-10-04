import { useCallback, useId, useLayoutEffect, useMemo, type ButtonHTMLAttributes } from "react";
import { bridge } from "../bridge";
import { usePreferenceCommand, dispatchScopedControlInput } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
export class LibraryReadOwner {
  active = true;
  constructor(
    readonly identity: string,
    readonly windowId: string,
    readonly privateMode: boolean,
    readonly kind: string,
  ) {}
  retire() {
    this.active = false;
  }
  current() {
    if (!this.active) return false;
    if (
      bridge.windowId !== this.windowId ||
      bridge.privateMode !== this.privateMode ||
      bridge.windowKind !== this.kind
    ) {
      this.retire();
      return false;
    }
    return true;
  }
}
export function useLibraryReadOwner(identity: string) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new LibraryReadOwner(identity, windowId, privateMode, kind),
    [identity, windowId, privateMode, kind],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  return owner;
}
type LibraryCommand =
  | "select-library-view"
  | "select-library-history-range"
  | "retry-library-load"
  | "load-more-library-history"
  | "close-library";
export function useLibraryControl<E extends HTMLElement>(
  command: LibraryCommand,
  current: () => boolean,
  invoke: (event?: Event) => unknown,
) {
  const scope = useId();
  const [ref] = usePreferenceCommand<E>(command, scope, (_node, event) =>
    current()
      ? invoke(event)
      : guardCommandCompletion(Promise.reject(new Error("Choose the original Library view.")), current),
  );
  const run = (event: { nativeEvent: Event }) =>
    dispatchScopedControlInput(command, scope, event.nativeEvent);
  return [ref, run] as const;
}
export function LibraryButton({
  command,
  current,
  invoke,
  originalRef,
  keyboard,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "onKeyDown"> & {
  command: Exclude<LibraryCommand, "close-library">;
  current(): boolean;
  invoke(event?: Event): unknown;
  originalRef?(node: HTMLButtonElement | null): void;
  keyboard?: boolean;
}) {
  const [ref, run] = useLibraryControl<HTMLButtonElement>(command, current, invoke);
  return (
    <button
      {...props}
      ref={(node) => {
        ref(node);
        originalRef?.(node);
      }}
      data-command-id={command}
      onClick={run}
      onKeyDown={
        keyboard
          ? (event) => {
              if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
                event.preventDefault();
                run(event);
              }
            }
          : undefined
      }
    />
  );
}
export function useLibraryCurrent(owner: LibraryReadOwner) {
  return useCallback(() => owner.current(), [owner]);
}
