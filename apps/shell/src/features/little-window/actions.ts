import { bridge } from "../../bridge";
import { promotePeekLink } from "../../peek-link";
import type { CommandContext, CommandInvocation } from "../registry";
import { toggleLittlePanel } from "./ui";
export async function openLittleWindow() {
  if (!await bridge.littleWindow("open", {})) throw new Error("Aux could not open a Little window.");
}
export async function promoteTab(state: CommandContext, invocation: CommandInvocation) {
  if (bridge.windowKind !== "little") {
    if (!state.peekPageId) throw new Error("Open a Peek or Little window to use Open in Aux.");
    await promotePeekLink();
    return;
  }
  const spaceId = invocation.payload && "spaceId" in invocation.payload ? invocation.payload.spaceId : undefined;
  if (spaceId !== undefined && (typeof spaceId !== "string" || !state.layout.spaces.some(space => space.id === spaceId))) throw new Error("This Space is no longer available.");
  if (!await bridge.littleWindow("promote", spaceId ? { spaceId } : {})) throw new Error("Aux could not move this page to a main window. Check that its destination Space is available.");
}
export async function setExternalLinkTarget(_state: CommandContext, invocation: CommandInvocation) {
  const target = invocation.payload && "target" in invocation.payload ? invocation.payload.target : undefined;
  if (target !== "little" && target !== "main") throw new Error("Choose Little window or Main window for external links.");
  const stored = await bridge.externalLinkTarget(target);
  if (stored !== target) throw new Error("Aux could not save this external-link preference.");
  window.dispatchEvent(new Event("aux-external-link-target-changed"));
}
export const littleCommands = {
  "little-window": openLittleWindow,
  "promote-tab": promoteTab,
  "little-space-picker": () => toggleLittlePanel("spaces"),
  "little-downloads": () => toggleLittlePanel("downloads"),
  "set-external-link-target": setExternalLinkTarget,
};
