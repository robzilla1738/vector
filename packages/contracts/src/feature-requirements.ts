import { AUX_FEATURES, type AuxFeature } from "./aux-features.js";
import { HostMethods, type HostMethodId } from "./host-methods.js";
import { RuntimeMethodPolicy } from "./runtime-method-policy.js";
import type { MethodName } from "./api.js";

export type AuxFeatureMethodId = HostMethodId | MethodName;

// Shared platform dependencies that a feature's own methods cannot establish.
const sharedRequirements: Partial<Record<AuxFeature, readonly AuxFeatureMethodId[]>> = {
  layouts: ["setAppearance"],
  demonstrationSkills: ["native.profileStorageRoot"],
  overnightReview: ["native.profileStorageRoot"],
};

/** Required method capabilities for each product feature. */
export const AUX_FEATURE_REQUIREMENTS = Object.fromEntries(
  (Object.keys(AUX_FEATURES) as AuxFeature[]).map((feature) => [
    feature,
    {
      requires: [
        ...(sharedRequirements[feature] ?? []),
        ...(Object.entries(HostMethods) as [HostMethodId, (typeof HostMethods)[HostMethodId]][])
          // Image Copy is checked per control; its absence must not disable existing Save methods.
          .filter(([id, method]) => method.feature === feature && id !== "copyStoredImage")
          .map(([id]) => id),
        ...(Object.entries(RuntimeMethodPolicy) as [MethodName, (typeof RuntimeMethodPolicy)[MethodName]][])
          .filter(([, method]) => method.feature === feature)
          .map(([id]) => id),
      ] as AuxFeatureMethodId[],
    },
  ]),
) as unknown as Readonly<Record<AuxFeature, { requires: readonly AuxFeatureMethodId[] }>>;
