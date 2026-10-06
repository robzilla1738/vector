import { featureEnabled, type AuxFeature, type AuxFeatureStage, type FeatureOverride } from "@aux/contracts";
import { inNativeHost, inMock } from "./bridge";
import { chromiumFeatureStages } from "./feature-stage-reconciliation";

export function featureAvailable(feature: AuxFeature): boolean {
  if (inNativeHost) return chromiumFeatureStages()?.[feature] === "on";
  return inMock;
}

/** Capability checks are safe during module initialization and ignore Labs preferences. */
export function featureStage(feature: AuxFeature): AuxFeatureStage {
  return featureAvailable(feature) ? "on" : "off";
}

/** UI entry points apply Labs preferences to the advertised capabilities. */
export function featureVisible(feature: AuxFeature, overrides?: FeatureOverride): boolean {
  return featureAvailable(feature) && featureEnabled(feature, overrides);
}
