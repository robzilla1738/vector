import { SettingsField } from "../primitives";
import { staticFieldErrorProps } from "../../ui/class-props";
import { staticRowProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { Switch } from "../../ui";
import { nativeGroupRoleProps, nativeAlertRoleProps } from "../../ui/native-attribute-props";

type CrashReporting = { available: boolean; decided: boolean; consent: boolean };

export function CrashReportingSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<CrashReporting | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(0);

  useEffect(() => {
    if (!active || !inNativeHost || bridge.privateMode) return;
    const token = ++request.current;
    void bridge
      .crashReporting()
      .then((result) => {
        if (token === request.current) {
          setValue(result);
          setError("");
        }
      })
      .catch((reason) => {
        if (token === request.current) setError(errorMessage(reason));
      });
    return () => {
      ++request.current;
    };
  }, [active, retry]);

  async function save(consent: boolean) {
    if (!active || !inNativeHost || bridge.privateMode || !value?.available || busy) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    setConfirming(false);
    try {
      if ((await bridge.setCrashReporting(consent)) !== consent)
        throw new Error("Chromium did not save the crash-report choice.");
      const result = await bridge.crashReporting();
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  const hint = bridge.privateMode
    ? "Change crash-report consent outside Private mode."
    : !inNativeHost
      ? "Available in the Aux desktop app."
      : !value
        ? "Reading crash-report consent…"
        : !value.available
          ? "Off — this build has no crash-report destination. Reports stay on this device."
          : "Choose whether Aux may upload future crash reports.";
  return (
    <SettingsField
      compact
      label="Crash reports"
      description="Choose whether Aux may upload future crash reports when this build has a configured destination."
      hint={hint}
      details={
        (confirming || !!error) && (
          <>
            {confirming && (
              <div {...staticRowProps} {...nativeGroupRoleProps} aria-label="Confirm crash reports">
                <span>
                  Crash reports can contain diagnostic details. Allow future uploads to this build’s
                  configured destination?
                </span>
                <button {...smallButtonProps} disabled={busy || !active} onClick={() => void save(true)}>
                  Allow uploads
                </button>
                <button {...smallGhostButtonProps} disabled={busy} onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </div>
            )}
            {error && (
              <span {...nativeAlertRoleProps} {...staticFieldErrorProps}>
                {error}{" "}
                <button
                  {...smallGhostButtonProps}
                  disabled={!active || busy}
                  onClick={() => setRetry((current) => current + 1)}
                >
                  Retry
                </button>
              </span>
            )}
          </>
        )
      }
    >
      <Switch
        aria-label="Send crash reports"
        checked={value?.consent ?? false}
        disabled={!active || !inNativeHost || bridge.privateMode || busy || !value?.available}
        onChange={(event) => (event.target.checked ? setConfirming(true) : void save(false))}
      />
    </SettingsField>
  );
}
