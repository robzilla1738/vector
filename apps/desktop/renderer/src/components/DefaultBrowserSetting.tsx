import { useEffect, useState } from "react";
import { bridge, inElectron } from "../bridge";

/** Registers Aux as the http/https handler; reports the measured OS state. */
export function DefaultBrowserSetting() {
  const [isDefault, setIsDefault] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!inElectron || bridge.privateMode) return;
    let live = true;
    const read = () => void bridge.defaultBrowser()
      .then(state => { if (live) { setIsDefault(state.isDefault); setError(""); } })
      .catch(reason => { if (live) setError(reason instanceof Error ? reason.message : String(reason)); });
    read();
    // The OS dialog completes outside this window — re-check on return.
    window.addEventListener("focus", read);
    return () => { live = false; window.removeEventListener("focus", read); };
  }, []);
  if (!inElectron || bridge.privateMode) return null;
  return <div className="row">
    {isDefault
      ? <span className="hint ok">Aux is your default browser — links open here, in your most recently used profile.</span>
      : <><button className="btn sm" disabled={busy || isDefault === null} onClick={() => {
          setBusy(true); setError("");
          void bridge.setDefaultBrowser()
            .then(state => { setIsDefault(state.isDefault); if (!state.isDefault) setError("The system did not confirm the change. Check your default browser setting in System Settings."); })
            .catch(reason => setError(reason instanceof Error ? reason.message : String(reason)))
            .finally(() => setBusy(false));
        }}>{busy ? "Setting…" : "Make Aux the default browser"}</button>
        {isDefault === false && !error && <span className="hint">Links from other apps currently open in a different browser.</span>}</>}
    {error && <span className="hint err">{error}</span>}
  </div>;
}
