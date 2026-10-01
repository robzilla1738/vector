import { BackgroundRuntimeSetting } from "./BackgroundRuntime";
import { BrowserProfiles } from "../../components/BrowserProfiles";
import { SettingsField, SettingsSection } from "../primitives";

export function ProfilesSettings() {
  return <SettingsSection name="Profiles">
    <SettingsField label="Browser profiles" description="Manage separate browsing identities and their local data." searchTerms={["accounts", "sign-ins", "archive"]}>
      <BrowserProfiles />
    </SettingsField>
    <SettingsField label="Background agent" description="Keep this Profile’s runtime available after its last window closes. Quit Aux to stop it." searchTerms={["background","agent","runtime"]}><BackgroundRuntimeSetting active={true}/></SettingsField>
  </SettingsSection>;
}
