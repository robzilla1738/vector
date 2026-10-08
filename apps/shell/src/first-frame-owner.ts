import { bridge } from "./bridge";
import { isHomeAddress } from "./chrome";
import { useStore } from "./store";
import type { FirstFrameActivation } from "./first-frame";

/** Initial catalog adoption may fill this Home; a later source cannot inherit its Enter. */
export function bindFirstFrameActivation(activation: FirstFrameActivation): void {
  const windowId = bridge.windowId,
    windowKind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const spaceId = useStore.getState().layout.activeSpaceId;
  let pageId = useStore.getState().activePageId;
  const current = activation.current;
  const retire = activation.retire;
  const check = () => {
    const state = useStore.getState();
    const page = state.pages.byId[state.activePageId ?? ""];
    const home =
      state.activePageId === null || (!!page && page.windowId === windowId && isHomeAddress(page.url));
    if (pageId === null && home) pageId = state.activePageId;
    if (
      !current() ||
      bridge.windowId !== windowId ||
      bridge.windowKind !== windowKind ||
      bridge.privateMode !== privateMode ||
      state.mode !== "focus" ||
      state.overlay !== null ||
      state.layout.activeSpaceId !== spaceId ||
      !home ||
      state.activePageId !== pageId
    ) {
      activation.retire();
    }
  };
  const stop = useStore.subscribe(check);
  activation.retire = () => {
    retire();
    stop();
  };
  activation.current = () => {
    check();
    return current();
  };
  check();
}
