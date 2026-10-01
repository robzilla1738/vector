import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveFolderItem } from "@aux/contracts";
import { call } from "../store";
import { executeCommand } from "../commands";
import { FavIcon } from "./SiteTile";
import { I } from "./icons";

export function LiveFolderRows({ folderId }: { folderId: string }) {
  return <Rows key={folderId} folderId={folderId} />;
}
function Rows({ folderId }: { folderId: string }) {
  const [items, setItems] = useState<LiveFolderItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lifetime = useRef({ live: false, request: 0 });
  const load = useCallback(async () => {
    const scope = lifetime.current;
    const request = ++scope.request;
    try {
      const value = await call("liveFolders.items", { folderId });
      if (scope.live && request === scope.request) { setItems(value.items); setError(value.error ?? ""); }
    } catch (error) { if (scope.live && request === scope.request) setError(error instanceof Error ? error.message : String(error)); }
  }, [folderId]);
  useEffect(() => {
    const scope = lifetime.current;
    scope.live = true;
    void load(); const timer = setInterval(() => void load(), 30_000);
    return () => { scope.live = false; ++scope.request; clearInterval(timer); };
  }, [load]);
  const refresh = async () => {
    if (busy) return;
    const scope = lifetime.current;
    setBusy(true);
    try { await executeCommand("refresh-live-folder", { payload: { folderId } }); if (scope.live) await load(); }
    catch (error) { if (scope.live) setError(error instanceof Error ? error.message : String(error)); }
    finally { if (scope.live) setBusy(false); }
  };
  return <div className="live-folder-rows" aria-busy={busy}>
    <div className="live-folder-tools"><button className="btn ghost sm" data-command-id="refresh-live-folder" disabled={busy} aria-label="Refresh live folder" onClick={() => void refresh()}>{I.reload} Refresh</button></div>
    {error && <output className="live-folder-error">{error}</output>}
    {!error && !items.length && <p className="hint live-folder-empty">No items yet. Refresh this folder to check its source.</p>}
    {items.map(item => <button key={item.id} className="tab-row live-folder-item" data-command-id="open-live-folder-item" aria-label={`${item.title}${item.unread ? ", unread" : ""}`} onClick={() => {
      const scope = lifetime.current;
      void executeCommand("open-live-folder-item", { payload: { folderId, itemId: item.id } }).then(() => { if (scope.live) { ++scope.request; setItems(rows => rows.map(row => row.id === item.id ? { ...row, unread: false } : row)); } }).catch((error: unknown) => { if (scope.live) setError(error instanceof Error ? error.message : String(error)); });
    }}><span className="tab-favicon"><FavIcon url={item.url} size="sm" /></span><span className="live-folder-copy"><span>{item.title}</span>{item.subtitle && <span className="hint">{item.subtitle}</span>}</span>{item.unread && <span className="live-folder-dot" aria-hidden />}</button>)}
  </div>;
}
