import { ContentBlockingSettings } from "./ContentBlocking";
import { ClearBrowsingData } from "../../components/ClearBrowsingData";
import { NativePrivacyLink, SavedWebsiteSettings } from "./NativePrivacySettings";
import { SettingsGroup } from "../../ui";
import { shellIconOpen } from "../../ui/icons";
import { runCommand } from "../../commands";
import { useFeature } from "../../use-feature";
import { SettingsField, SettingsSection } from "../primitives";
import { HttpsFirstSetting } from "./HttpsFirst";
import { CookieControlsSetting } from "./CookieControls";
import { CrashReportingSetting } from "./CrashReporting";

export function PrivacySecuritySettings({ active }: { active: boolean }) {
  const contentBlockingAvailable = useFeature("contentBlocking");
  const httpsFirstAvailable = useFeature("httpsFirst");
  return (
    <SettingsSection name="Site permissions" hidden={!active}>
      <SettingsGroup title="Browsing history">
        <SettingsField
          compact
          label="Delete browsing history"
          description="Delete history, cookies, and cached files."
        >
          <ClearBrowsingData active={active} />
        </SettingsField>
        <SettingsField compact label="View browsing history">
          <button
            className="icon-btn"
            aria-label="View browsing history"
            data-command-id="history"
            disabled={!active}
            onClick={() => runCommand("history")}
          >
            {shellIconOpen}
          </button>
        </SettingsField>
      </SettingsGroup>
      {contentBlockingAvailable && <ContentBlockingSettings active={active} />}
      <SettingsGroup title="Privacy">
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
      </SettingsGroup>
      <SettingsGroup>
        <SettingsField
          compact
          label="Site settings"
          description="Manage site permissions for location, camera, pop-ups, and more."
        >
          <NativePrivacyLink active={active} destination="content" label="Open site settings" />
        </SettingsField>
        <SettingsField
          compact
          label="Advanced"
          description="Manage DNS, SSL certificates, and Safe Browsing settings."
        >
          <NativePrivacyLink active={active} destination="security" label="Open advanced security settings" />
        </SettingsField>
      </SettingsGroup>
      <SettingsGroup title="Website data">
        <SettingsField
          compact
          label="Saved website access and data"
          description="Review saved permission decisions and cookies before resetting or clearing them."
        >
          <SavedWebsiteSettings active={active} />
        </SettingsField>
      </SettingsGroup>
      {httpsFirstAvailable && (
        <SettingsGroup title="Advanced">
          <SettingsField
            compact
            label="HTTPS-first"
            description="Try HTTPS before HTTP for eligible sites. Other Chromium security modes may still require HTTPS."
          >
            <HttpsFirstSetting active={active} />
          </SettingsField>
        </SettingsGroup>
      )}
    </SettingsSection>
  );
}
