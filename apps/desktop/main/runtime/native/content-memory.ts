import type { RpcChannel } from "@aux/contracts";
import { registry } from "../../app/services.js";
import { captureReadablePage } from "../../content-capture.js";
import { stateForEntry } from "../../windows/registry.js";
import { onNative } from "./validate.js";

export function registerContentMemoryMethods(ch: RpcChannel) {
  onNative(ch, "native.captureReadablePage", async ({ pageId, expectedUrl }) => {
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    const available = () => !!entry && !!state && registry.get(pageId) === entry && !entry.popup && !entry.runtimeOwned
      && state.win.isFocused() && !state.overlayOpen && state.stagePageId === pageId
      && state.focusedPageId === pageId && entry.view.getVisible();
    if (!entry || !available()) throw new Error("Select the visible tab before remembering its content.");
    const url = new URL(expectedUrl);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Only HTTPS pages can be remembered.");
    return captureReadablePage(entry.view.webContents, expectedUrl, available);
  });
}
