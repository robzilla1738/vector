import { FEATURE_BOOTS } from "./boots.generated.js";
import { auxFeatureStage, type AuxFeature } from "@aux/contracts";
import type { Services } from "../api/methods/context.js";
import type { makeInvoker } from "../api/invoke.js";

export interface FeatureBoot {
  feature: AuxFeature;
  boot: (
    services: Services,
    invoke: ReturnType<typeof makeInvoker>,
  ) => Promise<void | (() => void | Promise<void>)> | void | (() => void | Promise<void>);
}
/** Each lane owns features/<lane>/boot.ts; startup and shutdown are wired once here. */
export async function bootRuntimeFeatures(services: Services, invoke: ReturnType<typeof makeInvoker>) {
  const stages = await services.featureStages;
  const cleanup: (() => void | Promise<void>)[] = [];
  try {
    for (const module of FEATURE_BOOTS as readonly FeatureBoot[]) {
      if (auxFeatureStage(module.feature, services.featureHost ?? "chromium-fork", stages) !== "on") continue;
      const stop = await module.boot(services, invoke);
      if (stop) cleanup.push(stop);
    }
  } catch (error) {
    for (const stop of cleanup.reverse()) await stop();
    throw error;
  }
  return async () => {
    for (const stop of cleanup.reverse()) await stop();
  };
}
