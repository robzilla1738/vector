import { AuxError, MethodSchemas, type MethodName } from "@aux/contracts";
import { OnboardingService } from "../../services/onboarding.js";
import type { MethodCtx, MethodHandler } from "./context.js";

function onboarding(ctx: MethodCtx) {
  if (ctx.client.external) throw new AuxError("permission_denied", "Set up Aux in its own window.");
  return new OnboardingService(ctx.s.repo);
}
async function h_onboarding_get(ctx: MethodCtx): Promise<unknown> {
  return onboarding(ctx).get();
}
async function h_onboarding_update(ctx: MethodCtx): Promise<unknown> {
  return onboarding(ctx).update(MethodSchemas["onboarding.update"].parse(ctx.params));
}
export const onboardingMethods: Partial<Record<MethodName, MethodHandler>> = {
  "onboarding.get": h_onboarding_get,
  "onboarding.update": h_onboarding_update,
};
