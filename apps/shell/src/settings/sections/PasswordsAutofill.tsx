import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps } from "../../ui/class-props";
import { smallGhostButtonProps } from "../../ui/button-props";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { AutofillProfile } from "@aux/contracts";
import { AutofillSetting } from "../../components/AutofillSetting";
import { PasswordTransferSetting } from "../../components/PasswordTransferSetting";
import { bridge, inNativeHost } from "../../bridge";
import { SettingsGroup } from "../../ui";
import { useFeature } from "../../use-feature";
import { useStore } from "../../store";
import { pushSettingsPath } from "../routes";
import { shellIconRight } from "../../ui/icons";
import { SettingsField, SettingsSection } from "../primitives";
import { SettingsDialogControl } from "../SettingsDialogControl";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
import { useScopedCommandControls } from "../../scoped-command-controls";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";
const availableNow = () => inNativeHost;
const read = async () => ({ profile: await bridge.autofillProfile() });
type Write = { profile: AutofillProfile; legacy?: string };
export function PasswordsAutofillSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const vaultAvailable = useFeature("vault");
  const legacy = settings.autofill as AutofillProfile | undefined;
  const legacySnapshot = JSON.stringify(legacy ?? {});
  const originalLegacy = useRef(legacySnapshot);
  useLayoutEffect(() => {
    originalLegacy.current = legacySnapshot;
  }, [legacySnapshot]);
  const [importing, setImporting] = useState<string | null>(null);
  const write = useCallback(
    async (input: Write, current: () => boolean) => {
      const ack = await bridge.setAutofillProfile(input.profile);
      if (!ack)
        throw new Error(
          input.legacy === undefined
            ? "Chromium could not save personal info. Try again."
            : "Chromium could not import personal info.",
        );
      if (input.legacy !== undefined && current() && originalLegacy.current === input.legacy)
        await onSave({ autofill: {} });
      return { ack: undefined, value: { profile: Object.keys(input.profile).length ? input.profile : null } };
    },
    [onSave],
  );
  const native = useNativePreference({
    active,
    available: inNativeHost,
    availableNow,
    read,
    write,
    refusal: "Choose the current personal info preference.",
  });
  const blocked = inNativeHost && !native.owner.current();
  const loading = inNativeHost && !blocked && !native.value && !native.error;
  const error = inNativeHost && !native.value ? native.error : "";
  const [publish, run] = useScopedCommandControls(native.scopeId, () => {
    const value = native.value;
    return value && native.owner.owns(value)
      ? () => native.owner.owns(value) && originalLegacy.current === legacySnapshot
      : undefined;
  });
  function importLegacy() {
    const value = native.value;
    if (
      !value ||
      !native.owner.owns(value) ||
      native.busy ||
      !legacy ||
      originalLegacy.current !== legacySnapshot
    )
      throw new Error("Choose the original personal info import.");
    setImporting(legacySnapshot);
    return native.perform({ profile: legacy, legacy: legacySnapshot }, value);
  }
  return (
    <SettingsSection name="Passwords & Autofill" hidden={!active}>
      <SettingsGroup title="Password managers">
        {vaultAvailable && (
          <SettingsField
            compact
            label="Aux Vault"
            hint="Save sign-ins and let Aux fill them without exposing passwords to agents."
          >
            <button
              className="icon-btn"
              aria-label="Open Aux Vault"
              disabled={!active}
              onClick={() => {
                useStore.setState({ settingsCategory: "Connections" });
                pushSettingsPath("Connections", "Vault");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
            >
              {shellIconRight}
            </button>
          </SettingsField>
        )}
        <SettingsField
          compact
          label="Saved passwords"
          hint="Manage passwords in Chromium’s Profile store. Passkeys stay managed by Chromium."
        >
          <SettingsDialogControl active={active} label="Saved passwords" action="Manage…">
            <PasswordTransferSetting />
          </SettingsDialogControl>
        </SettingsField>
      </SettingsGroup>
      <SettingsGroup title="Autofill">
        <SettingsField
          label="Personal info"
          hint="Fill contact and address fields on a form with the context menu or command palette. Passwords and payment details are never stored here."
        >
          {blocked ? (
            <output {...staticHintProps}>Personal info is available in your regular Aux window.</output>
          ) : loading ? (
            <output {...staticHintProps}>Loading Chromium personal info…</output>
          ) : error ? (
            <div>
              <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
                {error}
              </p>
              <NativePreferenceRetry
                command="retry-personal-info"
                scopeId={native.scopeId}
                disabled={native.busy || !native.owner.current()}
                read={native.refresh}
              />
            </div>
          ) : (
            <AutofillSetting
              active={active && (!inNativeHost || (!!native.value && native.owner.current()))}
              value={inNativeHost ? (native.value?.profile ?? undefined) : legacy}
              onSave={async (profile) => {
                if (!inNativeHost) return onSave({ autofill: profile });
                const value = native.value;
                if (!value) throw new Error("Choose the current personal info preference.");
                setImporting(null);
                return native.perform({ profile }, value);
              }}
            />
          )}
          {inNativeHost &&
            native.value &&
            !native.value.profile &&
            Object.values(legacy ?? {}).some((value) => typeof value === "string" && value.trim()) && (
              <button
                ref={(element) => publish("import", "import-prior-personal-info", element, importLegacy)}
                {...smallGhostButtonProps}
                data-command-id="import-prior-personal-info"
                disabled={native.busy || !native.owner.current()}
                onClick={(event) => run("import-prior-personal-info", event)}
              >
                Import prior Aux personal info into Chromium
              </button>
            )}
          {importing === legacySnapshot && native.value && native.error && (
            <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
              {native.error}
            </p>
          )}
        </SettingsField>
      </SettingsGroup>
    </SettingsSection>
  );
}
