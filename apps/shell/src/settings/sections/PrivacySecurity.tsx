import { ClearBrowsingData } from "../../components/ClearBrowsingData";
import { SitePermissions } from "../../components/SitePermissions";
import { useFeature } from "../../use-feature";
import { SettingsField, SettingsSection } from "../primitives";
import { HttpsFirstSetting } from "./HttpsFirst";
import { CookieControlsSetting } from "./CookieControls";
import { CrashReportingSetting } from "./CrashReporting";

export function PrivacySecuritySettings({ active }: { active: boolean }) {
  const httpsFirstAvailable = useFeature("httpsFirst");
  return (
    <SettingsSection name="Site permissions" hidden={!active}>
      {httpsFirstAvailable && (
        <SettingsField
          compact
          label="HTTPS-first"
          description="Try HTTPS before HTTP for eligible sites. Other Chromium security modes may still require HTTPS."
        >
          <HttpsFirstSetting active={active} />
        </SettingsField>
      )}
      <SettingsField
        compact
        label="Allow third-party cookies"
        description="Used for embedded content, ads, and tracking by websites. Existing cookies are kept."
      >
        <CookieControlsSetting active={active} />
      </SettingsField>
      <SettingsField
        compact
        label="Crash reports"
        description="Choose whether Aux may upload future crash reports when this build has a configured destination."
      >
        <CrashReportingSetting active={active} />
      </SettingsField>
      <SitePermissions query="" />
      <SettingsField
        label="Clear browsing data"
        description="Preview and remove visits, cookies and cached files for a selected period."
      >
        <ClearBrowsingData active={active} />
      </SettingsField>
    </SettingsSection>
  );
}
