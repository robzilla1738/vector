import { RuntimeMethodFeatures } from "./runtime-method-features.generated.js";
import { requireAuxFeature, type AuxFeature, type AuxFeatureHost, type AuxFeatureOverrides } from "./aux-features.js";

export function auxFeatureForMethod(method: string): AuxFeature | undefined {
  return RuntimeMethodFeatures[method as keyof typeof RuntimeMethodFeatures];
}

export function requireAuxMethod(
  method: string,
  host: AuxFeatureHost,
  profileOverrides?: AuxFeatureOverrides,
  hostOverrides?: AuxFeatureOverrides,
): void {
  const feature = auxFeatureForMethod(method);
  if (feature) requireAuxFeature(feature, host, profileOverrides, hostOverrides);
}
