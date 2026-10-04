import { staticHintProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LiveFolderItem } from "@aux/contracts";
import { call } from "../store";
import { executeCommand } from "../commands";
import { FavIcon } from "./SiteTile";
import { shellIconReload } from "./icons";
import { beginOrganizationWork } from "../organization-performance";

export function LiveFolderRows({ folderId }: { folderId: string }) {
  return <Rows key={folderId} folderId={folderId} />;
}
function Rows({ folderId }: { folderId: string }) {
  const [items, setItems] = useState<LiveFolderItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refreshInFlight = useRef(false);
  const measurement = useRef<{ work: ReturnType<typeof beginOrganizationWork>; items?: LiveFolderItem[]; request?: number } | null>(null);
  const lifetime = useRef({ live: false, request: 0 });
  const load = useCallback(async () => {
    const scope = lifetime.current;
    const request = ++scope.request;
    try {
      const value = await call("liveFolders.items", { folderId });
      if (scope.live && request === scope.request) {
        if (measurement.current) {
          if (value.error) { measurement.current.work.cancel(); measurement.current = null; }
          else { measurement.current.items = value.items; measurement.current.request = request; }
        }
        setItems(value.items); setError(value.error ?? "");
      }
    } catch (error) { if (scope.live && request === scope.request) setError(errorMessage(error)); }
  }, [folderId]);
  useEffect(() => {
    const scope = lifetime.current;
    scope.live = true;
    void load(); const timer = setInterval(() => void load(), 30_000);
    return () => { scope.live = false; ++scope.request; measurement.current?.work.cancel(); measurement.current = null; clearInterval(timer); };
  }, [load]);
  useLayoutEffect(() => {
    const pending = measurement.current, scope = lifetime.current;
    if (!pending || busy) return;
    if (scope.live && pending.request === scope.request && pending.items === items && !error)
      pending.work.complete(items.length, folderId);
    else pending.work.cancel();
    measurement.current = null;
  }, [busy, items, error, folderId]);
  const refresh = async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    const scope = lifetime.current;
    measurement.current = { work: beginOrganizationWork("aux:liveFolders:refresh") };
    setBusy(true);
    try { await executeCommand("refresh-live-folder", { payload: { folderId } }); if (scope.live) await load(); }
    catch (error) {
      measurement.current?.work.cancel(); measurement.current = null;
      if (scope.live) setError(errorMessage(error));
    }
    finally { refreshInFlight.current = false; if (scope.live) setBusy(false); }
  };
  return <div className="live-folder-rows" data-aux-live-folder-id={folderId} aria-busy={busy}>
    <div className="live-folder-tools"><button className="btn ghost sm" data-command-id="refresh-live-folder" disabled={busy} aria-label="Refresh live folder" onClick={() => void refresh()}>{shellIconReload} Refresh</button></div>
    {error && <output className="live-folder-error">{error}</output>}
    {!error && !items.length && <p className="hint live-folder-empty">No items yet. Refresh this folder to check its source.</p>}
    {items.map(item => <button key={item.id} className="tab-row live-folder-item" data-command-id="open-live-folder-item" aria-label={`${item.title}${item.unread ? ", unread" : ""}`} onClick={() => {
      const scope = lifetime.current;
      void executeCommand("open-live-folder-item", { payload: { folderId, itemId: item.id } }).then(() => { if (scope.live) { ++scope.request; setItems(rows => rows.map(row => row.id === item.id ? { ...row, unread: false } : row)); } }).catch((error: unknown) => { if (scope.live) setError(errorMessage(error)); });
    }}><span className="tab-favicon"><FavIcon url={item.url} size="sm" /></span><span className="live-folder-copy"><span>{item.title}</span>{item.subtitle && <span {...staticHintProps}>{item.subtitle}</span>}</span>{item.unread && <span className="live-folder-dot" aria-hidden />}</button>)}
  </div>;
}
