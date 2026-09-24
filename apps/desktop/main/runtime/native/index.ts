import type { RpcChannel } from "@aux/contracts";
import { registerCookieMethods } from "./cookies.js";
import { registerPageMethods } from "./pages.js";
import { registerProjectMethods } from "./projects.js";
import { registerSecretMethods } from "./secrets.js";

/** The native.* surface the runtime calls over fork IPC. */
export function registerNativeHandlers(ch: RpcChannel) {
  registerPageMethods(ch);
  registerCookieMethods(ch);
  registerSecretMethods(ch);
  registerProjectMethods(ch);
}
