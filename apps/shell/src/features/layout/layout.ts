import { useEffect } from "react";
import { bridge } from "../../bridge";
import { featureStage } from "../../use-feature";
import { useStore } from "../../store";
import { call } from "../../store/shared";

export const MINIMAL_UI_HINT = "Minimal UI — move to the top or left edge to reveal controls. ⌘⇧B to exit.";
export const isNormalLayoutWindow = () => bridge.windowKind === "normal" || bridge.windowKind === "private";

export async function toggleMinimalUi() {
  if (!isNormalLayoutWindow()) throw new Error("Minimal UI is available in browser windows.");
  const settings = useStore.getState().settings;
  const enabled = settings.minimalUi !== true;
  await call("settings.set", { minimalUi: enabled, ...(enabled ? { minimalUiAcknowledged: true } : {}) });
  if (enabled && settings.minimalUiAcknowledged !== true) useStore.getState().toast(MINIMAL_UI_HINT);
}

/** The saved sidebar preference survives Minimal UI; only its effective mode changes. */
export function useLayoutChrome() {
  const layoutMotion = isNormalLayoutWindow() && featureStage("minimalUi") === "on";
  const minimal = useStore(state => state.settings.minimalUi === true) && layoutMotion;
  const sidebarWidth = useStore(state => state.sidebarWidth);
  const autoHide = useStore(state => state.settings.toolbarAutoHide !== false);
  return { minimal, autoHide, hideToolbar: minimal || autoHide, layoutMotion, sidebarWidth };
}

export function useWindowControls(minimal: boolean, toolbarRevealed: boolean) {
  useEffect(() => {
    if (!isNormalLayoutWindow() || featureStage("minimalUi") !== "on") return;
    void bridge.windowControlsVisible(!minimal || toolbarRevealed).catch(error => useStore.getState().toast(String(error), "error"));
  }, [minimal, toolbarRevealed]);
  useEffect(() => () => { if (isNormalLayoutWindow() && featureStage("minimalUi") === "on") void bridge.windowControlsVisible(true); }, []);
}
