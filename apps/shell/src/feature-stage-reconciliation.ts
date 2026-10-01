import type { AuxFeatureOverrides } from "@aux/contracts";

type FeatureWindow = Window & { auxChromiumHost?: { readonly featureStages?: AuxFeatureOverrides } };

/** The native bootstrap is the single source of baked and disposable stages. */
export function chromiumFeatureStages(target: FeatureWindow = window as FeatureWindow): AuxFeatureOverrides | undefined {
  return target.auxChromiumHost?.featureStages;
}
