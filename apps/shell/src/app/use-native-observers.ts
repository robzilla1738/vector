import { useEffect } from "react";
import { bridge, inNativeHost, inMock } from "../bridge";
import type { ChromiumHostPort } from "../chromium-bridge";
import { bootShellFeatures } from "../features/registry";
import { errToast } from "../store";
import { installMemorySaver } from "../memory-saver";
import { recoverPeekLink } from "../peek-link";

export function useNativeObservers() {
  useEffect(() => bootShellFeatures(), []);
  useEffect(() => {
    if (!inNativeHost || inMock) return;
    let live = true,
      stop: (() => void) | undefined;
    void bridge
      .capabilities()
      .then(async (capabilities) => {
        if (!live || !capabilities.methods.includes("performanceFixtureNextRequest")) return;
        const port = (window as Window & { auxChromiumHost?: ChromiumHostPort }).auxChromiumHost;
        if (!port || port.host !== "chromium-fork" || port.privateMode) return;
        const { startNativePerformanceFixtureObserver } =
          await import("../native-performance-fixture-observer");
        if (live) stop = startNativePerformanceFixtureObserver((method) => port.request(method, []));
      })
      .catch(() => {});
    return () => {
      live = false;
      stop?.();
    };
  }, []);
  useEffect(() => {
    if (!inNativeHost || inMock) return;
    let live = true,
      stop: (() => void) | undefined;
    void bridge
      .capabilities()
      .then(async (capabilities) => {
        if (!live || !capabilities.methods.includes("appearanceSnapshot")) return;
        const { startNativeAppearanceObserver, startNativePipAppearanceObserver } =
          await import("../native-appearance-observer");
        if (!live) return;
        const normal = startNativeAppearanceObserver(bridge);
        const port = (window as Window & { auxChromiumHost?: ChromiumHostPort }).auxChromiumHost;
        const child =
          port?.host === "chromium-fork" && capabilities.methods.includes("pipAppearanceSnapshot")
            ? startNativePipAppearanceObserver(() => port.request("pipAppearanceSnapshot", []))
            : undefined;
        stop = () => {
          normal();
          child?.();
        };
      })
      .catch(errToast);
    return () => {
      live = false;
      stop?.();
    };
  }, []);
  useEffect(() => installMemorySaver(), []);
  useEffect(() => recoverPeekLink(), []);
}
