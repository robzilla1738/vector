import { auxFeatureStage, type AuxFeature, type AuxFeatureStage, type AuxFeatureOverrides } from "@aux/contracts";
import { inNativeHost, inMock } from "./bridge";

type FeatureWindow = Window & { auxChromiumHost?: { featureStages?: AuxFeatureOverrides } };

/** Native stages are fixed at bootstrap for the lifetime of the shell. */
export function featureStage(feature: AuxFeature): AuxFeatureStage {
  if (inNativeHost) {
    const stages = (window as FeatureWindow).auxChromiumHost?.featureStages;
    return auxFeatureStage(feature, "chromium-fork", stages);
  }
  return inMock ? "on" : "off";
}

export function useFeature(feature: AuxFeature): boolean {
  return featureStage(feature) === "on";
}
