import { executeCommand } from "../../commands";
import type { FeatureMount } from "../registry";
import { bridge } from "../../bridge";
import { errToast, toast, useStore } from "../../store";
import { RoutingSettings, RoutingOverlay } from "./slots";
export const mount: FeatureMount = {
  feature: "linkRouting",
  commands: {
    "show-link-routing": () =>
      useStore.setState({ overlay: "settings", settingsCategory: "Link Routing", railOpen: true }),
    "refresh-link-routing": () => bridge.linkRoutes(),
    "save-link-routing": (_state, { payload }) => {
      if (!payload || !("revision" in payload) || !("linkRoutes" in payload))
        throw new Error("Choose a routing revision and configuration.");
      return bridge.setLinkRoutes(payload.revision, payload.linkRoutes);
    },
    "test-link-routing": (_state, { payload }) => {
      if (!payload || !("url" in payload) || !("source" in payload))
        throw new Error("Enter a routing URL and source.");
      return bridge.testLinkRoute(payload.url, payload.source);
    },
    "resolve-link-routing": (_state, { payload }) => {
      if (!payload || !("promptId" in payload) || !("destination" in payload) || !("remember" in payload))
        throw new Error("Choose a held link destination.");
      return bridge.resolveRoutePrompt(payload.promptId, payload.destination, payload.remember);
    },
  },
  settingsSections: [{ category: "Link Routing", component: RoutingSettings }],
  overlays: [RoutingOverlay],
  boot: () => {
    // Routing receipts belong to regular browser windows, never compact surfaces.
    if (bridge.windowKind !== "normal" || bridge.privateMode) return;
    let live = true,
      running = false,
      again = false;
    const drain = async () => {
      if (running) {
        again = true;
        return;
      }
      running = true;
      try {
        do {
          again = false;
          const receipts = await bridge.routedOpens();
          if (!live) return;
          await useStore.getState().resyncTabs(() => live);
          if (!live) return;
          await useStore.getState().refreshSpaces(() => live);
          if (!live) return;
          const profiles = await bridge.browserProfiles();
          if (!live) return;
          for (const receipt of receipts) {
            // Native already bound the actual target. Restore the local UI after cold boot.
            if (receipt.spaceId) useStore.getState().switchSpace(receipt.spaceId);
            toast(
              `${receipt.fallbackReason ? (receipt.fallbackReason === "profile-unavailable" ? "Destination Profile unavailable. " : "Destination Space unavailable. ") : ""}Opened in ${profiles.find((profile) => profile.id === receipt.profileId)?.name ?? "Profile"} — Change rule`,
              "info",
              {
                label: "Change rule",
                run: () => {
                  if (live) void executeCommand("show-link-routing").catch(errToast);
                },
              },
            );
          }
        } while (again && live);
      } catch (error) {
        if (live) errToast(error);
      } finally {
        running = false;
      }
    };
    const off = bridge.onRoutedOpen(() => void drain());
    void drain();
    return () => {
      live = false;
      off();
    };
  },
};
