import { useEffect, useRef, useState } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { Switch } from "../../ui";

type HttpsUpgrade = { enabled: boolean; available: boolean; managed: boolean };

export function HttpsFirstSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<HttpsUpgrade | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(0);

  useEffect(() => {
    if (!active || !inNativeHost || bridge.privateMode) return;
    const token = ++request.current;
    setError("");
    void bridge.httpsUpgrade()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { ++request.current; };
  }, [active, retry]);

  async function change(enabled: boolean) {
    if (busy || !value?.available || value.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      if (await bridge.setHttpsUpgrade(enabled) !== enabled)
        throw new Error("Chromium did not save the HTTPS-first setting.");
      const result = await bridge.httpsUpgrade();
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (bridge.privateMode) return <span className="hint">HTTPS-first follows the regular Profile and cannot be changed in Private mode.</span>;
  if (!inNativeHost) return <span className="hint">Available in the Aux desktop app.</span>;
  return <div className="row">
    {value ? <Switch aria-label="Automatically upgrade eligible HTTP pages" checked={value.enabled}
      disabled={busy || !value.available || value.managed}
      onChange={event => void change(event.target.checked)} /> : <span className="hint">Reading HTTPS-first setting…</span>}
    {value && !value.available && <span className="hint">{value.managed ? "Disabled by your organization" : "Unavailable in this browser build"}</span>}
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
