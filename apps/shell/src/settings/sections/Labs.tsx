import { FEATURES, featureEnabled, type FeatureOverride } from "@aux/contracts";
import { Switch } from "../../ui";
import { SettingsField, SettingsSection } from "../primitives";
import { featureAvailable } from "../../use-feature";

export function LabsSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const overrides = settings.featureOverrides as FeatureOverride | undefined;
  return (
    <SettingsSection name="Labs" hidden={!active}>
      {FEATURES.filter((feature) => featureAvailable(feature.id)).map((feature) => {
        const label = feature.id.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
        return (
          <SettingsField compact key={feature.id} label={label} description="Show this feature in Aux.">
            <Switch
              aria-label={label}
              checked={featureEnabled(feature.id, overrides)}
              onChange={(event) => {
                void onSave({ featureOverrides: { ...overrides, [feature.id]: event.target.checked } });
              }}
            />
          </SettingsField>
        );
      })}
    </SettingsSection>
  );
}
