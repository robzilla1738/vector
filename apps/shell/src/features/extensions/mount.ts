import { deferSurface } from "../../components/DeferredSurface";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import type { CommandInvocation, FeatureMount } from "../registry";
import { extensionOperation } from "./extension-inventory";
import { closeExtensionPanel, extensionPanel, installExtensionPanel } from "./extension-panel";

const ExtensionActions = deferSurface(
  async () => ({ default: (await import("../../components/ExtensionActions")).ExtensionActions }),
  "Extension actions",
  true,
  true,
);
const SidePanelSurface = deferSurface(
  async () => ({ default: (await import("./SidePanelSurface")).SidePanelSurface }),
  "Extension side panel",
  true,
);
function payload(invocation: CommandInvocation) {
  const value = invocation.payload;
  if (!value || !("extensionId" in value) || !value.extensionId)
    throw new Error("Choose an installed extension first.");
  return value;
}
export const mount: FeatureMount = {
  feature: "extensions",
  boot: installExtensionPanel,
  toolbarItems: [ExtensionActions],
  railView: {
    component: SidePanelSurface,
    active: () => extensionPanel.getState().panel !== null,
    subscribe: (listener: () => void) => extensionPanel.subscribe(listener),
  },
  commands: {
    "show-extensions": (state) => {
      useStore.setState({ settingsCategory: "Extensions" });
      state.setOverlay("settings");
    },
    "close-extension-panel": closeExtensionPanel,
    "extension-action": (_, invocation) => {
      const value = payload(invocation);
      return bridge.showExtensionAction(value.extensionId, "anchor" in value ? value.anchor : undefined);
    },
    "pin-extension-action": (_, invocation) => {
      const value = payload(invocation);
      if (!("pinned" in value)) throw new Error("Choose whether to pin this action.");
      return bridge.pinExtensionAction(value.extensionId, value.pinned).then((saved) => {
        if (!saved) throw new Error("Chromium could not save this pin.");
      });
    },
    "set-extension-command-shortcut": (_, invocation) => {
      const value = payload(invocation);
      if (!("name" in value) || !("shortcut" in value))
        throw new Error("Choose an extension command and shortcut.");
      return bridge
        .setExtensionCommandShortcut(value.extensionId, value.name, value.shortcut)
        .then((saved) => {
          if (!saved) throw new Error("Chromium could not save this shortcut.");
        });
    },
    "install-store-extension": (_, invocation) =>
      extensionOperation(
        () => bridge.installStoreExtension(payload(invocation).extensionId),
        "Extension installed.",
      ),
    "install-unpacked-extension": () =>
      extensionOperation(() => bridge.installUnpackedExtension(), "Unpacked extension installed."),
    "set-extension-enabled": (_, invocation) => {
      const value = payload(invocation);
      if (!("enabled" in value)) throw new Error("Choose whether to enable this extension.");
      return extensionOperation(
        () => bridge.setExtensionEnabled(value.extensionId, value.enabled),
        value.enabled ? "Extension enabled." : "Extension disabled.",
      );
    },
    "reload-extension": (_, invocation) =>
      extensionOperation(
        () => bridge.reloadExtension(payload(invocation).extensionId),
        "Extension restarted.",
      ),
    "update-extension": (_, invocation) => {
      const value = payload(invocation);
      if (!("source" in value)) throw new Error("Choose an installed extension to update.");
      return extensionOperation(
        () =>
          value.source === "store"
            ? bridge.checkStoreExtensionUpdate(value.extensionId)
            : bridge.updateUnpackedExtension(value.extensionId),
        "Extension update finished.",
      );
    },
    "remove-extension": (_, invocation) =>
      extensionOperation(() => bridge.removeExtension(payload(invocation).extensionId), "Extension removed."),
  },
};
