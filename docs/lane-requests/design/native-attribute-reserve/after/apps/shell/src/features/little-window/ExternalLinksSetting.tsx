import { useEffect, useState } from "react";
import { bridge } from "../../bridge";
import { runCommand } from "../../commands";
import { SettingsField, SettingsSection } from "../../settings/primitives";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";
export function ExternalLinksSetting() {
  const [target, setTarget] = useState<"little" | "main" | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () => { void bridge.externalLinkTarget().then(value => { if (active) { setTarget(value); setError(""); } }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Couldn't load external-link preferences."); }); };
    refresh();
    window.addEventListener("aux-external-link-target-changed", refresh);
    return () => { active = false; window.removeEventListener("aux-external-link-target-changed", refresh); };
  }, []);
  return <SettingsSection name="External links"><SettingsField label="Open links from other apps in" hint="Take a quick look in a Little window, then move the page into your chosen Space.">
    <select aria-label="Open links from other apps in" data-command-id="set-external-link-target" value={target ?? ""} disabled={target === null} onChange={event => {
      const value = event.currentTarget.value;
      if (value === "little" || value === "main") runCommand("set-external-link-target", { payload: { target: value } });
    }}>
      {target === null && <option value="">Loading preference…</option>}
      <option value="little">Little window</option><option value="main">Main window</option>
    </select>{error && <p {...nativeAlertRoleProps}>{error}</p>}
  </SettingsField></SettingsSection>;
}
