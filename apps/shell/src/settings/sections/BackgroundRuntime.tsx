import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { Switch } from "../../ui";

type Preference = Awaited<ReturnType<typeof bridge.keepRuntimeInBackground>>;

export function BackgroundRuntimeSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<Preference | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(0);
  const available = inNativeHost || inMock;

  useEffect(() => {
    if (!active || !available || bridge.privateMode) return;
    const token = ++request.current;
    setError("");
    void bridge.keepRuntimeInBackground()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(String(reason)); });
    return () => { ++request.current; };
  }, [active, available, retry]);

  async function change(enabled: boolean) {
    if (busy || value?.managed || !value?.available) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      const result = await bridge.keepRuntimeInBackground(enabled);
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally { setBusy(false); }
  }

  if (bridge.privateMode) return <span className="hint">Background runtime follows the regular Profile and cannot be changed in Private mode.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!value) return <span className="hint">{error || "Reading background runtime setting…"} {error && <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button>}</span>;
  return <div className="row">
    <Switch aria-label="Keep Aux running after closing all windows" checked={value.enabled} disabled={busy || value.managed || !value.available} onChange={event => void change(event.target.checked)} />
    {value.managed && <span className="hint">Managed by your organization</span>}
    {!value.available && <span className="hint">Browser background mode is disabled.</span>}
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
