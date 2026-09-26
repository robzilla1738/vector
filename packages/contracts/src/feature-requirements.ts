import { AUX_FEATURES, type AuxFeature, type AuxFeatureStage } from "./aux-features.js";
import { HostMethods, type HostMethodId } from "./host-methods.js";
import { RuntimeMethodPolicy } from "./runtime-method-policy.js";
import type { MethodName } from "./api.js";

export type AuxFeatureJourneyId = `feature:${AuxFeature}`;
export type AuxFeatureMethodId = HostMethodId | MethodName;

// Window appearance is needed by the base shell before the full layouts
// journey qualifies. Keep it in that journey's native capability check.
const sharedRequirements: Partial<Record<AuxFeature, readonly AuxFeatureMethodId[]>> = {
  layouts: ["setAppearance"],
};

/** Server-side qualification inputs; the renderer receives only baked stages. */
export const AUX_FEATURE_REQUIREMENTS = Object.fromEntries(
  (Object.keys(AUX_FEATURES) as AuxFeature[]).map(feature => [feature, {
    requires: [
      ...(sharedRequirements[feature] ?? []),
      ...(Object.entries(HostMethods) as [HostMethodId, (typeof HostMethods)[HostMethodId]][])
        .filter(([, method]) => method.feature === feature).map(([id]) => id),
      ...(Object.entries(RuntimeMethodPolicy) as [MethodName, (typeof RuntimeMethodPolicy)[MethodName]][])
        .filter(([, method]) => method.feature === feature).map(([id]) => id),
    ] as AuxFeatureMethodId[],
    journey: `feature:${feature}` as AuxFeatureJourneyId,
  }]),
) as unknown as Readonly<Record<AuxFeature, { requires: readonly AuxFeatureMethodId[]; journey: AuxFeatureJourneyId }>>;

export function deriveAuxFeatureStages(
  implementedMethods: readonly string[],
  passingJourneys: Readonly<Record<string, string>>,
  sourceCommit: string,
): Record<AuxFeature, AuxFeatureStage> {
  const implemented = new Set(implementedMethods);
  return Object.fromEntries((Object.keys(AUX_FEATURE_REQUIREMENTS) as AuxFeature[])
    .map(feature => {
      const { requires, journey } = AUX_FEATURE_REQUIREMENTS[feature];
      const stage: AuxFeatureStage = requires.every(id => implemented.has(id))
        ? passingJourneys[journey] === sourceCommit ? "on" : "preview"
        : "off";
      return [feature, stage];
    })) as Record<AuxFeature, AuxFeatureStage>;
}
