import { SettingsField } from "../primitives";
import { staticFieldErrorProps } from "../../ui/class-props";
import { smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

type CookieControls = { blockThirdParty: boolean; managed: boolean };

export function CookieControlsSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<CookieControls | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(0);

  useEffect(() => {
    if (!active || !inNativeHost || bridge.privateMode) return;
    const token = ++request.current;
    void bridge
      .cookieControls()
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

  async function change(block: boolean) {
    if (!active || !inNativeHost || bridge.privateMode || busy || !value || value.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      if ((await bridge.setCookieControls(block)) !== block)
        throw new Error("Chromium did not save the cookie setting.");
      const result = await bridge.cookieControls();
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  const hint = bridge.privateMode
    ? "Private windows use their own cookie protections. Change the regular Profile setting outside Private mode."
    : !inNativeHost
      ? "Available in the Aux desktop app."
      : !value
        ? "Reading cookie setting…"
        : value.managed
          ? "Managed by your organization."
          : "Used for embedded content, ads, and tracking by websites. Existing cookies are kept.";
  return (
    <SettingsField
      compact
      label="Allow third-party cookies"
      description="Used for embedded content, ads, and tracking by websites. Existing cookies are kept."
      hint={hint}
      details={
        error && (
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
        )
      }
    >
      <select
        aria-label="Allow third-party cookies"
        value={value ? (value.blockThirdParty ? "block" : "allow") : "unknown"}
        disabled={!active || !inNativeHost || bridge.privateMode || busy || !value || value.managed}
        onChange={(event) => void change(event.target.value === "block")}
      >
        {!value && <option value="unknown">Unavailable</option>}
        <option value="allow">Allow</option>
        <option value="block">Block all</option>
      </select>
    </SettingsField>
  );
}
