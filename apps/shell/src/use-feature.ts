import { auxFeatureStage, type AuxFeature, type AuxFeatureStage } from "@aux/contracts";
import { inNativeHost, inMock } from "./bridge";
import { chromiumFeatureStages } from "./feature-stage-reconciliation";

/** Native stages, with the trusted runtime's scoped acceptance, are fixed before App mounts. */
export function featureStage(feature: AuxFeature): AuxFeatureStage {
  if (inNativeHost) {
    const stages = chromiumFeatureStages();
    return auxFeatureStage(feature, "chromium-fork", stages);
  }
  return inMock ? "on" : "off";
}

export function useFeature(feature: AuxFeature): boolean {
  return featureStage(feature) === "on";
}
