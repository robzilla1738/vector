import type { AuxFeatureOverrides } from "@aux/contracts";

type FeaturePort = { readonly featureStages?: AuxFeatureOverrides };
type FeatureWindow = Window & { auxChromiumHost?: FeaturePort };
const reconciledStages = new WeakMap<FeatureWindow, { port: FeaturePort; stages: AuxFeatureOverrides }>();

/** Native stages are the default; the runtime may enable only the reviewed Tidy journey stages. */
export function chromiumFeatureStages(target: FeatureWindow = window as FeatureWindow): AuxFeatureOverrides | undefined {
  const port = target.auxChromiumHost;
  const entry = reconciledStages.get(target);
  return entry && entry.port === port ? entry.stages : port?.featureStages;
}

export function acceptRuntimeTidyStages(target: FeatureWindow, port: FeaturePort): void {
  reconciledStages.set(target, { port, stages: { ...port.featureStages, spaces: "on", aiTidy: "on" } });
}
