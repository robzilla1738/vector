import { createClock } from "@aux/contracts";
import type { ChromiumHostPort } from "./chromium-bridge";

/** The trusted native port omits the scale in production. */
export const clock = createClock((window as Window & { auxChromiumHost?: ChromiumHostPort }).auxChromiumHost?.testClockScale);
