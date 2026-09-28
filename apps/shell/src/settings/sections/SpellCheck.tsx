import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { Switch } from "../../ui";

type SpellCheck = { enabled: boolean; managed: boolean };

export function SpellCheckSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<SpellCheck | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(0);
  const available = inNativeHost || inMock;

  useEffect(() => {
    if (!active || !available || bridge.privateMode) return;
    const token = ++request.current;
    setError("");
    void bridge.spellCheck()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { ++request.current; };
  }, [active, available, retry]);

  async function change(enabled: boolean) {
    if (busy || value?.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      const result = await bridge.spellCheck(enabled);
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (bridge.privateMode) return <span className="hint">Spell check follows the regular Profile and cannot be changed in Private mode.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  return <div className="row">
    {value ? <Switch aria-label="Check spelling as you type" checked={value.enabled} disabled={busy || value.managed} onChange={event => void change(event.target.checked)} /> : <span className="hint">Reading spell check setting…</span>}
    {value?.managed && <span className="hint">Managed by your organization</span>}
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
