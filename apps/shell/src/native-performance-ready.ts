import type { ChromiumHostPort } from "./chromium-bridge";

type Control = "address" | "shortcuts";
const mounted: Record<Control, number> = { address: 0, shortcuts: 0 };
let requested = false;

/** The deferred address editor can mount after App's shortcut effects. */
export function nativePerformanceControl(control: Control) {
  const port = (window as Window & { auxChromiumHost?: ChromiumHostPort }).auxChromiumHost;
  if (!port?.performanceWindowReady) return;
  mounted[control]++;
  if (!requested && mounted.address && mounted.shortcuts) {
    requested = true;
    void port.performanceWindowReady().catch(reportError);
  }
  return () => {
    mounted[control]--;
  };
}
