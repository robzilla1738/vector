import { useLayoutEffect, useMemo } from "react";
import { bridge } from "../bridge";
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
