import { AUX_FEATURES, type AuxFeature, type AuxFeatureOverrides } from "./aux-features.js";
import { AUX_FEATURE_REQUIREMENTS } from "./feature-requirements.js";
import { RuntimeMethodFeatures } from "./runtime-method-features.generated.js";

export type FeatureOverride = Partial<Record<AuxFeature, boolean>>;
export const FEATURES: readonly { id: AuxFeature; default: "on" | "labs" }[] = (
  Object.keys(AUX_FEATURES) as AuxFeature[]
).map((id) => ({ id, default: "on" }));

/** Runtime methods ship with the runtime; native methods must be advertised by the browser. */
export function featureAvailabilityFor(methods: readonly string[]): AuxFeatureOverrides {
  const implemented = new Set([...methods, ...Object.keys(RuntimeMethodFeatures)]);
  return Object.fromEntries(
    FEATURES.map(({ id }) => [
      id,
      AUX_FEATURE_REQUIREMENTS[id].requires.every((method) => implemented.has(method)) ? "on" : "off",
    ]),
  );
}

export function featureEnabled(id: AuxFeature, overrides: FeatureOverride = {}): boolean {
  return overrides[id] ?? FEATURES.find((feature) => feature.id === id)?.default === "on";
}
