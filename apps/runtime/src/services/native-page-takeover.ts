import { AuxError, type NativePageTakeover, type PageTarget } from "@aux/contracts";
import type { BrowserEgress } from "../safety/browser-egress.js";
import type { NativePermissionController } from "../safety/native-permission.js";

/** Host-only input application. Every authority dependency is mandatory. */
export async function applyNativePageTakeover(
  input: NativePageTakeover,
  deps: {
    egress: BrowserEgress;
    permissions: NativePermissionController;
    page(pageId: string): PageTarget;
    takeover(pageId: string, runId: string): Promise<PageTarget>;
    interrupt(pageId: string, runId: string): Promise<void>;
  },
): Promise<{ accepted: true; pageId: string; controller: "human"; controllerEpoch: number }> {
  const pageId = input.scope.tabId,
    runId = input.scope.runId;
  const page = deps.page(pageId);
  if (page.backend !== "aux")
    throw new AuxError("permission_denied", "This input is not from the native Profile.");
  const validation = deps.egress.nativeTakeoverValidation(input);
  return deps.permissions.withValidatedAuthorityMutation(
    (id) => id === runId,
    validation.validate,
    () =>
      deps.egress.withAuthorityMutation(
        (id) => id === runId,
        async () => {
          await validation.validateRetired();
          const held = await deps.takeover(pageId, runId);
          if (held.controller !== "human") throw new AuxError("conflict", "Native takeover was not applied.");
          // The exact original run is interrupted before acknowledging; a later
          // run that reused this page is never selected by membership scanning.
          await deps.interrupt(pageId, runId);
          return { accepted: true, pageId, controller: "human", controllerEpoch: held.controllerEpoch };
        },
      ),
  );
}
