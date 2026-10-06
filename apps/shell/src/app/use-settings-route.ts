import { useEffect } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { settingsRouteFromPath } from "../settings/routes";

export function useSettingsRoute() {
  useEffect(() => {
    const syncSettingsRoute = () => {
      const route = settingsRouteFromPath(window.location.pathname);
      if (route && !bridge.privateMode) {
        useStore.setState({ settingsCategory: route.category });
        if (useStore.getState().overlay !== "settings") useStore.getState().setOverlay("settings");
      } else if (useStore.getState().overlay === "settings") {
        useStore.getState().setOverlay(null);
      }
    };
    syncSettingsRoute();
    window.addEventListener("popstate", syncSettingsRoute);
    return () => window.removeEventListener("popstate", syncSettingsRoute);
  }, []);
}
