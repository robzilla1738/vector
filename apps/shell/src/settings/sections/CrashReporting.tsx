import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
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
        if (token === request.current) setValue(result);
      })
      .catch((reason) => {
        if (token === request.current) setError(errorMessage(reason));
      });
    return () => {
      ++request.current;
    };
  }, [active, retry]);

  async function save(consent: boolean) {
    if (!value?.available || busy) return;
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

  if (bridge.privateMode)
    return <span {...staticHintProps}>Change crash-report consent outside Private mode.</span>;
  if (!inNativeHost) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  return (
    <div>
      <div {...staticRowProps}>
        {value ? (
          <Switch
            aria-label="Send crash reports"
            checked={value.consent}
            disabled={busy || !value.available}
            onChange={(event) => (event.target.checked ? setConfirming(true) : void save(false))}
          />
        ) : (
          <span {...staticHintProps}>Reading crash-report consent…</span>
        )}
        {value && !value.available && (
          <span {...staticHintProps}>
            Off — this build has no crash-report destination. Reports stay on this device.
          </span>
        )}
        {value?.available && !value.decided && (
          <span {...staticHintProps}>Choose whether Aux may upload future crash reports.</span>
        )}
      </div>
      {confirming && (
        <div {...staticRowProps} {...nativeGroupRoleProps} aria-label="Confirm crash reports">
          <span>
            Crash reports can contain diagnostic details. Allow future uploads to this build’s configured
            destination?
          </span>
          <button {...smallButtonProps} disabled={busy} onClick={() => void save(true)}>
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
          <button {...smallGhostButtonProps} onClick={() => setRetry((current) => current + 1)}>
            Retry
          </button>
        </span>
      )}
    </div>
  );
}
