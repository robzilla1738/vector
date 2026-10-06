import { AUX_FEATURES, type AuxFeature } from "./aux-features.js";
import { HostMethods, type HostMethodId } from "./host-methods.js";
import { RuntimeMethodPolicy } from "./runtime-method-policy.js";
import type { MethodName } from "./api.js";

export type AuxFeatureMethodId = HostMethodId | MethodName;

// Layouts require native window appearance support.
const sharedRequirements: Partial<Record<AuxFeature, readonly AuxFeatureMethodId[]>> = {
  layouts: ["setAppearance"],
};

/** Required method capabilities for each product feature. */
export const AUX_FEATURE_REQUIREMENTS = Object.fromEntries(
  (Object.keys(AUX_FEATURES) as AuxFeature[]).map((feature) => [
    feature,
    {
      requires: [
        ...(sharedRequirements[feature] ?? []),
        ...(Object.entries(HostMethods) as [HostMethodId, (typeof HostMethods)[HostMethodId]][])
          .filter(([, method]) => method.feature === feature)
          .map(([id]) => id),
        ...(Object.entries(RuntimeMethodPolicy) as [MethodName, (typeof RuntimeMethodPolicy)[MethodName]][])
          .filter(([, method]) => method.feature === feature)
          .map(([id]) => id),
      ] as AuxFeatureMethodId[],
    },
  ]),
) as unknown as Readonly<Record<AuxFeature, { requires: readonly AuxFeatureMethodId[] }>>;
