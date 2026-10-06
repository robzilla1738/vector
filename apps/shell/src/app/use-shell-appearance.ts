import { useEffect } from "react";
import { bridge, inNativeHost } from "../bridge";
import { errToast } from "../store";
import { applyUiFontSize } from "../ui-font-size";

export function useShellAppearance(
  settings: {
    theme: unknown;
    sidebarAppearance: unknown;
    sidebarMaterial: unknown;
    sidebarTint: unknown;
    contentOpacity: unknown;
  },
  spaceColor: string,
) {
  useEffect(() => {
    applyUiFontSize();
  }, []);

  // Native vibrancy and transparent renderer layers must change together.
  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const reduced = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const apply = () => {
      const theme =
        settings.theme === "system"
          ? dark.matches
            ? "dark"
            : "light"
          : settings.theme === "light"
            ? "light"
            : "dark";
      const glass = settings.sidebarAppearance !== "solid" && !reduced.matches;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.sidebarAppearance = glass ? "translucent" : "solid";
      document.documentElement.style.setProperty("--sidebar-tint", `${Number(settings.sidebarTint ?? 0)}%`);
      document.documentElement.style.setProperty(
        "--content-opacity",
        `${Number(settings.contentOpacity ?? 95)}%`,
      );
      const material =
        settings.sidebarMaterial === "sidebar" ||
        settings.sidebarMaterial === "under-window" ||
        settings.sidebarMaterial === "titlebar"
          ? settings.sidebarMaterial
          : "liquid-glass";
      if (inNativeHost)
        void bridge
          .setAppearance(settings.theme === "system" ? "system" : theme, glass, true, material)
          .catch(errToast);
    };
    apply();
    dark.addEventListener("change", apply);
    reduced.addEventListener("change", apply);
    return () => {
      dark.removeEventListener("change", apply);
      reduced.removeEventListener("change", apply);
    };
  }, [
    settings.theme,
    settings.sidebarAppearance,
    settings.sidebarMaterial,
    settings.sidebarTint,
    settings.contentOpacity,
  ]);
  useEffect(() => {
    document.documentElement.dataset.space = spaceColor;
  }, [spaceColor]);
}
