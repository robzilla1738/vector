import { smallButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useState } from "react";
import {
  DEFAULT_DOWNLOAD_NAMING,
  DownloadNamingSettingsSchema,
  type DownloadNamingSettings,
} from "@aux/contracts";
import { useStore } from "../../store";
import { executeCommand } from "../../commands";
import { SettingsField, SettingsSection } from "../../settings/primitives";
import { nativeCheckboxTypeProps, nativeAlertRoleProps } from "../../ui/native-attribute-props";
export function DownloadNamingSettings() {
  const saved = useStore((state) => state.settings.downloadNaming);
  const [draft, setDraft] = useState<DownloadNamingSettings | null>(null);
  const settings = draft ?? DownloadNamingSettingsSchema.parse(saved ?? DEFAULT_DOWNLOAD_NAMING);
  const setSettings = setDraft;
  const [textDraft, setTextDraft] = useState<
    Partial<Record<"excludedHosts" | "excludedExtensions" | "excludedMimeTypes", string>>
  >({});
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await executeCommand("set-download-naming", {
        payload: { downloadNaming: DownloadNamingSettingsSchema.parse(settings) },
      });
      setDraft(null);
      setTextDraft({});
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <SettingsSection name="Download naming" title="Download naming">
      <SettingsField
        label="Rename downloads"
        description="Give downloaded files a useful name. Save dialogs, private downloads, and unsafe or opened files keep their names."
      >
        <select
          aria-label="Rename downloads"
          value={settings.mode}
          disabled={busy}
          onChange={(event) =>
            setSettings({ ...settings, mode: event.target.value as DownloadNamingSettings["mode"] })
          }
        >
          <option value="off">Off</option>
          <option value="unclear">Only unclear names</option>
          <option value="all">All</option>
        </select>
      </SettingsField>
      <SettingsField
        label="Use AI"
        description="Uses your Profile’s fast model route. Sends only the filename, source host, page title, MIME type, and up to 2 KB of first-page text. URL paths and queries stay on your Mac."
      >
        <input
          {...nativeCheckboxTypeProps}
          aria-label="Use AI for download names"
          checked={settings.useAi}
          disabled={busy}
          onChange={(event) => setSettings({ ...settings, useAi: event.target.checked })}
        />
      </SettingsField>
      <SettingsField
        label="Filename template"
        hint="Available fields: {date}, {site}, {title}. Used when AI is off or unavailable."
      >
        <input
          aria-label="Filename template"
          value={settings.template}
          maxLength={500}
          disabled={busy}
          onChange={(event) => setSettings({ ...settings, template: event.target.value })}
        />
      </SettingsField>
      {(
        [
          ["excludedHosts", "Excluded sites", "example.com, *.example.org"],
          ["excludedExtensions", "Excluded extensions", "zip, dmg"],
          ["excludedMimeTypes", "Excluded MIME types", "application/zip, image/*"],
        ] as const
      ).map(([key, label, placeholder]) => (
        <SettingsField key={key} label={label} hint="Separate entries with commas.">
          <input
            aria-label={label}
            placeholder={placeholder}
            value={textDraft[key] ?? settings[key].join(", ")}
            disabled={busy}
            onChange={(event) => {
              setTextDraft((current) => ({ ...current, [key]: event.target.value }));
              setSettings({
                ...settings,
                [key]: event.target.value
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
              });
            }}
          />
        </SettingsField>
      ))}
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      <button
        {...smallButtonProps}
        data-command-id="set-download-naming"
        disabled={busy}
        onClick={() => void save()}
      >
        {busy ? "Saving…" : "Save naming preferences"}
      </button>
    </SettingsSection>
  );
}
