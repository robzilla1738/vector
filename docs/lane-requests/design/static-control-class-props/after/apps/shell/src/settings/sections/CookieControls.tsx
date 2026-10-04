import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { Switch } from "../../ui";

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
    void bridge.cookieControls()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(errorMessage(reason)); });
    return () => { ++request.current; };
  }, [active, retry]);

  async function change(block: boolean) {
    if (busy || !value || value.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      if (await bridge.setCookieControls(block) !== block)
        throw new Error("Chromium did not save the cookie setting.");
      const result = await bridge.cookieControls();
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  if (bridge.privateMode) return <span {...staticHintProps}>Private windows use their own cookie protections. Change the regular Profile setting outside Private mode.</span>;
  if (!inNativeHost) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  return <div {...staticRowProps}>
    {value ? <Switch aria-label="Block third-party cookies" checked={value.blockThirdParty}
      disabled={busy || value.managed} onChange={event => void change(event.target.checked)} />
      : <span {...staticHintProps}>Reading cookie setting…</span>}
    {value?.managed && <span {...staticHintProps}>Managed by your organization</span>}
    {error && <span role="alert" {...staticFieldErrorProps}>{error} <button {...smallGhostButtonProps} onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
