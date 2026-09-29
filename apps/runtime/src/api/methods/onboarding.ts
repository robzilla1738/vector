import { AuxError, MethodSchemas, type MethodName } from "@aux/contracts";
import { OnboardingService } from "../../services/onboarding.js";
import { runtimeRestoreStatus } from "../../services/runtime-backup.js";
import type { MethodCtx, MethodHandler, Services } from "./context.js";

const services = new WeakMap<Services, OnboardingService>();
function onboarding(ctx: MethodCtx) {
  if (ctx.client.external) throw new AuxError("permission_denied", "Set up Aux in its own window.");
  let service = services.get(ctx.s);
  if (!service) {
    const { s } = ctx;
    service = new OnboardingService({
      repo: s.repo,
      configured: () => s.settings.all().modelConfigured,
      maxModelCalls: () => s.settings.maxModelCalls(),
      page: (id) => s.pages.get(id),
      start: (input) => s.runs.start(input),
    });
    services.set(s, service);
  }
  return service;
}
async function h_onboarding_get(ctx: MethodCtx): Promise<unknown> {
  return onboarding(ctx).get();
}
async function h_onboarding_update(ctx: MethodCtx): Promise<unknown> {
  return onboarding(ctx).update(MethodSchemas["onboarding.update"].parse(ctx.params));
}
async function h_onboarding_start(ctx: MethodCtx): Promise<unknown> {
  const service = onboarding(ctx);
  if ((await runtimeRestoreStatus(ctx.s.settings.all().dataDir)).pending)
    throw new AuxError(
      "conflict",
      "Recovery is staged. Quit Aux normally and reopen before starting the first chat.",
    );
  return service.start(MethodSchemas["onboarding.start"].parse(ctx.params));
}
export const onboardingMethods: Partial<Record<MethodName, MethodHandler>> = {
  "onboarding.get": h_onboarding_get,
  "onboarding.update": h_onboarding_update,
  "onboarding.start": h_onboarding_start,
};
