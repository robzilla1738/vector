import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { bridge, inNativeHost } from "../bridge";
import { featureStage } from "../use-feature";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
type ExtensionLocalCommand =
  "toggle-extension-permissions" | "review-extension-removal" | "cancel-extension-removal";
class ExtensionOwner {
  active = true;
  constructor(
    readonly windowId: string,
    readonly privateMode: boolean,
    readonly kind: string,
    readonly available: boolean,
  ) {}
  retire() {
    this.active = false;
  }
  current() {
    if (!this.active) return false;
    if (
      !inNativeHost ||
      bridge.windowId !== this.windowId ||
      bridge.privateMode !== this.privateMode ||
      bridge.windowKind !== this.kind ||
      featureStage("extensions") !== "on" ||
      !this.available ||
      this.privateMode ||
      this.kind !== "normal"
    ) {
      this.retire();
      return false;
    }
    return true;
  }
}
export function useExtensionsOwner(available: boolean) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new ExtensionOwner(windowId, privateMode, kind, available),
    [windowId, privateMode, kind, available],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  return useCallback(() => owner.current(), [owner]);
}
function useExtensionLocal<E extends HTMLElement>(
  command: ExtensionLocalCommand,
  current: () => boolean,
  invoke: (node: E, event?: Event) => unknown,
) {
  const scope = useId();
  return usePreferenceCommand<E>(command, scope, (node, event) =>
    current()
      ? invoke(node, event)
      : guardCommandCompletion(Promise.reject(new Error("Choose the original extension control.")), current),
  );
}
export function ExtensionLocalButton({
  command,
  current,
  invoke,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: Exclude<ExtensionLocalCommand, "toggle-extension-permissions">;
  current(): boolean;
  invoke(): unknown;
}) {
  const [ref, run] = useExtensionLocal<HTMLButtonElement>(command, current, invoke);
  return <button {...props} ref={ref} data-command-id={command} onClick={run} />;
}
export function ExtensionPermissions({
  current,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, "onClick"> & { current(): boolean }) {
  const [ref, run] = useExtensionLocal<HTMLElement>("toggle-extension-permissions", current, (node) => {
    const details = node.parentElement;
    if (details instanceof HTMLDetailsElement) details.open = !details.open;
  });
  return (
    <summary
      {...props}
      ref={ref}
      data-command-id="toggle-extension-permissions"
      onClick={(event) => {
        event.preventDefault();
        run(event);
      }}
    />
  );
}
