import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";

type Folder = { path: string; custom: boolean; error?: string };

export function DownloadFolderSetting({ active }: { active: boolean }) {
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const request = useRef(0);
  const available = inNativeHost || inMock;

  useEffect(() => {
    if (!active || !available || bridge.privateMode) return;
    const token = ++request.current;
    setLoading(true);
    setError("");
    void bridge.downloadFolder()
      .then(value => { if (token === request.current) setFolder(value); })
      .catch(reason => { if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (token === request.current) setLoading(false); });
    const pending = request;
    return () => { ++pending.current; };
  }, [active, available, refresh]);

  async function choose(reset: boolean) {
    if (busy) return;
    const token = ++request.current;
    setBusy(true);
    setLoading(false);
    setError("");
    try {
      const value = await bridge.chooseDownloadFolder(reset);
      if (token === request.current) setFolder(value);
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (bridge.privateMode) return <span className="hint">Choose a save location for each Private download.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  return <div aria-busy={loading || busy}>
    {loading && <output className="hint" data-block>Loading download folder…</output>}
    {folder && <div className="row">
      <span className="hint mono selectable grow">{folder.path}</span>
      <button className="btn sm" disabled={loading || busy} onClick={() => void choose(false)}>Change folder…</button>
      {(folder.custom || folder.error) && <button className="btn sm ghost" disabled={loading || busy} onClick={() => void choose(true)}>Use default</button>}
    </div>}
    {(error || folder?.error) && <p role="alert" className="field-error">{error || folder?.error} <button className="btn sm ghost" disabled={loading || busy} onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
  </div>;
}
