import { useEffect, useState } from "react";
import type { AutofillProfile } from "@aux/contracts";
import { AutofillSetting } from "../../components/AutofillSetting";
import { PasswordTransferSetting } from "../../components/PasswordTransferSetting";
import { bridge, inNativeHost } from "../../bridge";
import { errToast } from "../../store";
import { SettingsField, SettingsSection } from "../primitives";

export function PasswordsAutofillSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const [nativeAutofill, setNativeAutofill] = useState<AutofillProfile | null>(null);
  const [loading, setLoading] = useState(inNativeHost);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active || !inNativeHost) return;
    let live = true;
    setLoading(true);
    void bridge.autofillProfile()
      .then(profile => { if (live) setNativeAutofill(profile); })
      .catch(reason => { if (live) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [active, attempt]);

  return (
    <SettingsSection name="Passwords & Autofill" hidden={!active}>
      <SettingsField
        label="Personal info"
        hint="Fill contact and address fields on a form with the context menu or command palette. Passwords and payment details are never stored here."
      >
        {loading ? <output className="hint">Loading Chromium personal info…</output> :
          error ? <div><p className="field-error" role="alert">{error}</p><button className="btn sm ghost" onClick={() => {
            setLoading(true);
            setError("");
            setAttempt(value => value + 1);
          }}>Retry</button></div> :
          <AutofillSetting
            value={inNativeHost ? nativeAutofill ?? undefined : settings.autofill as AutofillProfile | undefined}
            onSave={async autofill => {
              if (!inNativeHost) return onSave({ autofill });
              if (!await bridge.setAutofillProfile(autofill)) throw new Error("Chromium could not save personal info. Try again.");
              setNativeAutofill(Object.keys(autofill).length ? autofill : null);
            }}
          />}
        {inNativeHost && !loading && !error && !nativeAutofill &&
          Object.values(settings.autofill ?? {}).some(value => typeof value === "string" && value.trim()) &&
          <button className="btn sm ghost" onClick={() => void (async () => {
            const legacy = settings.autofill as AutofillProfile;
            if (!await bridge.setAutofillProfile(legacy)) throw new Error("Chromium could not import personal info.");
            setNativeAutofill(legacy);
            await onSave({ autofill: {} });
          })().catch(errToast)}>Import prior Aux personal info into Chromium</button>}
      </SettingsField>
      <SettingsField label="Saved passwords" hint="Manage passwords in Chromium’s Profile store. Passkeys stay managed by Chromium.">
        <PasswordTransferSetting />
      </SettingsField>
    </SettingsSection>
  );
}
