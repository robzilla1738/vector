import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";

type Preference = Awaited<ReturnType<typeof bridge.automaticPictureInPicture>>;

export function PictureInPictureSetting({ active }: { active: boolean }) {
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
    void bridge.automaticPictureInPicture()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(String(reason)); });
    return () => { ++request.current; };
  }, [active, available, retry]);

  async function save(mode: Preference["mode"]) {
    if (busy || value?.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      const result = await bridge.automaticPictureInPicture(mode);
      if (token === request.current) setValue(result);
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally { setBusy(false); }
  }

  if (bridge.privateMode) return <span className="hint">Automatic picture in picture follows the regular Profile and cannot be changed in Private mode.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!value) return <span className="hint">{error || "Reading picture-in-picture setting…"} {error && <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button>}</span>;
  return <div className="row">
    <select aria-label="Automatic picture in picture" value={value.mode} disabled={busy || value.managed} onChange={event => void save(event.target.value as Preference["mode"])}>
      <option value="ask">Ask each site</option>
      <option value="block">Block automatic picture in picture</option>
      <option value="allow">Allow on all sites</option>
    </select>
    {value.managed && <span className="hint">Managed by your organization</span>}
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
