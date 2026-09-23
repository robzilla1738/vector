import type { RpcChannel } from "@aux/contracts";
import { registerCaptureMethods } from "./capture.js";
import { registerCookieMethods } from "./cookies.js";
import { registerPageMethods } from "./pages.js";
import { registerProjectMethods } from "./projects.js";
import { registerSecretMethods } from "./secrets.js";

/** The native.* surface the runtime calls over fork IPC. */
export function registerNativeHandlers(ch: RpcChannel) {
  registerPageMethods(ch);
  registerCaptureMethods(ch);
  registerCookieMethods(ch);
  registerSecretMethods(ch);
  registerProjectMethods(ch);
}
