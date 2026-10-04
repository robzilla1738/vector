import { staticHintProps } from "../../ui/class-props";
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
    <SettingsSection name="Site permissions" title="Privacy & Security" hidden={!active}>
      {httpsFirstAvailable && <SettingsField label="HTTPS-first" description="Try HTTPS before HTTP for eligible sites. Other Chromium security modes may still require HTTPS.">
        <HttpsFirstSetting active={active} />
      </SettingsField>}
      <SettingsField label="Cookies" description="Block third-party cookies in the regular Profile. This can affect embedded sign-ins and widgets; existing cookies are kept.">
        <CookieControlsSetting active={active} />
      </SettingsField>
      <SettingsField label="Crash reports" description="Choose whether Aux may upload future crash reports when this build has a configured destination.">
        <CrashReportingSetting active={active} />
      </SettingsField>
      <SettingsField label="Help improve Aux" description="Optional product usage analytics are not available in this build.">
        <span {...staticHintProps}>Off</span>
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
