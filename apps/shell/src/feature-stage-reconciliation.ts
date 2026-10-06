import type { AuxFeatureOverrides } from "@aux/contracts";

type FeatureWindow = Window & { auxChromiumHost?: { readonly featureStages?: AuxFeatureOverrides } };

/** The native bootstrap publishes availability derived from implemented methods. */
export function chromiumFeatureStages(
  target: FeatureWindow = window as FeatureWindow,
): AuxFeatureOverrides | undefined {
  return target.auxChromiumHost?.featureStages;
}
