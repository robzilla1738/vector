import { BrowserProfiles } from "../../components/BrowserProfiles";
import { SettingsField, SettingsSection } from "../primitives";

export function ProfilesSettings() {
  return <SettingsSection name="Profiles">
    <SettingsField label="Browser profiles" description="Manage separate browsing identities and their local data." searchTerms={["accounts", "sign-ins", "archive"]}>
      <BrowserProfiles />
    </SettingsField>
  </SettingsSection>;
}
