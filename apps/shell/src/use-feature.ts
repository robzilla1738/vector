import { type AuxFeature, type FeatureOverride } from "@aux/contracts";
import { featureVisible } from "./feature-availability";
import { useStore } from "./store";

export { featureAvailable, featureStage, featureVisible } from "./feature-availability";

export function useFeature(feature: AuxFeature): boolean {
  const overrides = useStore((state) => state.settings.featureOverrides as FeatureOverride | undefined);
  return featureVisible(feature, overrides);
}
