import type { RuntimeShutdownReasonReader } from "../services/runtime-shutdown.js";
import { FEATURE_BOOTS } from "./boots.generated.js";
import { auxFeatureStage, type AuxFeature } from "@aux/contracts";
import type { Services } from "../api/methods/context.js";
import type { makeInvoker } from "../api/invoke.js";

type FeatureStop = (reason?: RuntimeShutdownReasonReader) => void | Promise<void>;

export interface FeatureBoot {
  feature: AuxFeature;
  boot: (
    services: Services,
    invoke: ReturnType<typeof makeInvoker>,
  ) => Promise<void | FeatureStop> | void | FeatureStop;
}
/** Each lane owns features/<lane>/boot.ts; startup and shutdown are wired once here. */
export async function bootRuntimeFeatures(services: Services, invoke: ReturnType<typeof makeInvoker>) {
  const stages = await services.featureStages;
  const cleanup: FeatureStop[] = [];
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
  return async (reason?: RuntimeShutdownReasonReader) => {
    for (const stop of cleanup.reverse()) await stop(reason);
  };
}
