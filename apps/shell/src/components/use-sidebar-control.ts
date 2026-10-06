import { useLayoutEffect, useRef, type RefObject, type SyntheticEvent } from "react";
import { bridge } from "../bridge";
import { runCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";
type SidebarControl = "toggle-sidebar-more" | "toggle-sidebar-spaces" | "toggle-sidebar-section";
/** Mounted Sidebar ownership only; each caller retains its original local admission. */
export function useSidebarControl(
  element: RefObject<HTMLButtonElement | null>,
  command: SidebarControl,
  scopeId: string,
  allowed: boolean,
  scopeKey: string,
  current: () => boolean,
  invoke: () => unknown,
  message: string,
) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  const actions = useRef({ current, invoke });
  useLayoutEffect(() => {
    actions.current = { current, invoke };
  }, [current, invoke]);
  useLayoutEffect(() => {
    const original = element.current;
    if (!original || !allowed) return;
    let active = true;
    const live = () =>
      active &&
      element.current === original &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode &&
      bridge.windowKind === kind;
    const retire = registerScopedControl(original, command, scopeId, () => {
      const callbacks = actions.current;
      if (!live() || !callbacks.current() || !live()) {
        active = false;
        throw new Error(message);
      }
      return callbacks.invoke();
    });
    return () => {
      active = false;
      retire();
    };
  }, [element, command, scopeId, allowed, scopeKey, windowId, privateMode, kind, message]);
  return (event: SyntheticEvent<HTMLButtonElement>) =>
    runCommand(command, { nativeInputEvent: event.nativeEvent });
}
