import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";

type Preference = Awaited<ReturnType<typeof bridge.defaultPageZoom>>;
const CHOICES = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];

export function DefaultPageZoomSetting({ active }: { active: boolean }) {
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
    void bridge.defaultPageZoom()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(String(reason)); });
    return () => { ++request.current; };
  }, [active, available, retry]);

  async function save(percentage: number) {
    if (busy || value?.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      const saved = await bridge.defaultPageZoom(percentage);
      if (token === request.current) setValue(saved);
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally { setBusy(false); }
  }

  if (bridge.privateMode) return <span className="hint">Default page zoom follows the regular Profile and cannot be changed in Private mode.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!value) return <span className="hint">{error || "Reading default page zoom…"} {error && <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button>}</span>;
  return <div className="row">
    <select aria-label="Default page zoom" value={value.percentage} disabled={busy || value.managed} onChange={event => void save(Number(event.target.value))}>
      {CHOICES.map(percentage => <option key={percentage} value={percentage}>{percentage}%</option>)}
      {!CHOICES.includes(value.percentage) && <option value={value.percentage}>{value.percentage}%</option>}
    </select>
    {value.managed && <span className="hint">Managed by your organization</span>}
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
