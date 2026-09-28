import { useEffect, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";

type Build = { buildId: string; sourceCommit: string };

export function AboutAuxSetting({ active }: { active: boolean }) {
  const [build, setBuild] = useState<Build | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const available = inNativeHost || inMock;

  useEffect(() => {
    if (!active || !available) return;
    let live = true;
    setError("");
    void bridge.capabilities()
      .then(value => { if (live) setBuild(value); })
      .catch(reason => { if (live) setError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { live = false; };
  }, [active, available, retry]);

  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (error) return <span role="alert" className="field-error">Could not read the installed build. <button className="btn sm ghost" onClick={() => setRetry(value => value + 1)}>Retry</button></span>;
  if (!build) return <span className="hint">Reading installed build…</span>;

  const [chromiumVersion, manifestHash] = build.buildId.split("+");
  return <div className="row">
    <span className="hint">Chromium {chromiumVersion}</span>
    {manifestHash && <span className="hint mono" title={build.buildId}>Build {manifestHash.slice(0, 8)}</span>}
    <span className="hint mono" title={build.sourceCommit}>Source {build.sourceCommit.slice(0, 8)}</span>
  </div>;
}
