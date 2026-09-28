import { QuickAskSetting } from "../../components/QuickAskSetting";
import { SettingsField, SettingsSection } from "../primitives";

export function QuickAskSettings({ active }: { active: boolean }) {
  return (
    <SettingsSection name="Quick Ask" hidden={!active}>
      <SettingsField
        label="Quick Ask window"
        hint="Open a compact chat, then expand it into a full browser window without losing the draft."
      >
        <QuickAskSetting />
      </SettingsField>
    </SettingsSection>
  );
}
